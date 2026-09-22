/**
 * POST /api/contact — the contact form's one endpoint.
 *
 * A Cloudflare Pages Function, so it deploys with the site and shares its
 * domain: no CORS, no second origin to keep alive, and the Resend key never
 * reaches the browser. It is the only server-side code in this repo; if a
 * second endpoint ever appears, the shared bits (json(), env reading) move to
 * `functions/_shared.ts` rather than being copied.
 *
 * Configuration lives in the Pages project's environment variables, not here:
 *
 *   RESEND_API_KEY   required, secret. Unset means the endpoint returns 503 and
 *                    logs — never a silent success, because a contact form that
 *                    quietly drops messages is worse than one that is visibly down.
 *   CONTACT_TO       optional, defaults to support@bytecraftsoftware.com
 *   CONTACT_FROM     optional, defaults to Byte Craft Software <support@...>.
 *                    Must be on a domain verified in Resend or the send 403s.
 *
 * `support@` rather than `noreply@` on purpose — Long Rest sent from `noreply@`
 * and deliveries failed silently until someone went looking.
 */

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

const DEFAULT_TO = "support@bytecraftsoftware.com";
const DEFAULT_FROM = "Byte Craft Software <support@bytecraftsoftware.com>";

/** Field caps. Generous for a human, hostile to a bot pasting a payload. */
const LIMITS = { name: 120, email: 254, message: 5000 } as const;

/** Anything larger than this is not a contact message; don't even parse it. */
const MAX_BODY_BYTES = 16_000;

type ContactBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  /** Honeypot. A real browser never fills this; it is hidden from people. */
  company?: unknown;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Nothing here is cacheable, and a cached 200 would swallow a real send.
      "cache-control": "no-store",
    },
  });
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Deliberately loose. Address validation by regex is a losing game; the real
 * check is that Resend accepts it as a Reply-To, and the real cost of a typo is
 * a reply that bounces — not something worth rejecting a lead over.
 */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Strip CR/LF from anything that lands in a header-ish field (subject, display
 * name). Resend takes JSON rather than raw SMTP, so this is belt and braces,
 * but header injection is cheap to prevent and expensive to discover.
 */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** A label/value row in the metadata box. Omitted entirely when unknown. */
type Field = { label: string; value: string; href?: string };

/**
 * Ported from DojoCompanion's support email (`api/Endpoints/SupportEndpoints.cs`,
 * `BuildSupportHtml`): an h2, a bordered metadata box of `Label: value` lines,
 * then a `Message` heading over a second bordered box. Same inline styles, so
 * the two land in the inbox looking like the same company wrote them.
 *
 * ONE DELIBERATE DIFFERENCE. DC injects the message as HTML, because theirs
 * comes from a rich-text editor behind a login. This form is public,
 * unauthenticated and a plain textarea, so the body is escaped and rendered
 * with `white-space: pre-wrap` — DC's own diagnostics block does exactly this.
 * Injecting it here would let any visitor post HTML into our inbox.
 */
// Exported so the template can be rendered and eyeballed without sending
// mail; Pages only looks for the onRequest* exports and ignores this one.
export function renderHtml(fields: Field[], message: string): string {
  const rows = fields
    .map((field, i) => {
      const last = i === fields.length - 1;
      const value = field.href
        ? `<a href="${escapeHtml(field.href)}" style="color:#EF7603;">${escapeHtml(field.value)}</a>`
        : escapeHtml(field.value);
      return `<p style="margin:0 0 ${last ? "0" : "8px"} 0;"><b>${escapeHtml(field.label)}:</b> ${value}</p>`;
    })
    .join("\n    ");

  return `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.35;color:#0f172a;">
  <h2 style="margin:0 0 12px 0;">Byte Craft Software Contact</h2>
  <div style="padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#fafafa;">
    ${rows}
  </div>
  <h3 style="margin:16px 0 8px 0;">Message</h3>
  <div style="white-space:pre-wrap;padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#fafafa;">${escapeHtml(message)}</div>
</div>`;
}

async function handlePost(request: Request, env: Env): Promise<Response> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_BODY_BYTES) {
    return json({ error: "That message is too long to send." }, 413);
  }

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return json({ error: "Malformed request." }, 400);
  }

  // Honeypot: answer exactly as a successful send would. A bot that can tell
  // rejection from acceptance can iterate until it gets through.
  if (str(body.company)) {
    return json({ ok: true });
  }

  const name = singleLine(str(body.name));
  const email = singleLine(str(body.email));
  const message = str(body.message);

  if (!name || !email || !message) {
    return json({ error: "Name, email and a message are all required." }, 400);
  }
  if (
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    message.length > LIMITS.message
  ) {
    return json(
      { error: "One of those fields is longer than we can accept." },
      400,
    );
  }
  if (!looksLikeEmail(email)) {
    return json({ error: "That email address does not look right." }, 400);
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not configured; message dropped");
    return json(
      { error: "Email is not configured right now. Please try again later." },
      503,
    );
  }

  // Context for triage, the way DojoCompanion's support email carries the URL
  // and user agent: enough to tell a real enquiry from a bot without having to
  // ask the sender anything. `request.cf` is absent under `wrangler pages dev`,
  // so the country falls back to the header and then to nothing — a missing
  // field is dropped rather than printed as "unknown".
  const cfCountry =
    (request as { cf?: { country?: string } }).cf?.country ??
    request.headers.get("cf-ipcountry") ??
    "";
  const userAgent = request.headers.get("user-agent") ?? "";

  const fields: Field[] = [
    { label: "Name", value: name },
    { label: "Email", value: email, href: `mailto:${email}` },
    {
      label: "Received",
      value: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
    },
  ];
  if (cfCountry) fields.push({ label: "Country", value: cfCountry });
  if (userAgent) fields.push({ label: "User Agent", value: userAgent });

  const textBody = [
    "Byte Craft Software Contact",
    "",
    ...fields.map((f) => `${f.label}: ${f.value}`),
    "",
    "Message",
    "",
    message,
    "",
  ].join("\n");

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM || DEFAULT_FROM,
        to: [env.CONTACT_TO || DEFAULT_TO],
        // The visitor's address, so hitting Reply in the inbox answers them.
        // It is never used as the From: that would fail DMARC on their domain.
        reply_to: email,
        // Bracketed prefix matching the sibling apps, so inbox rules can sort
        // on it: DojoCompanion sends "[Dojo Companion] <reason>".
        subject: `[Byte Craft Software] Contact form - ${name}`,
        html: renderHtml(fields, message),
        text: textBody,
      }),
    });
  } catch (err) {
    console.error("[contact] Resend request failed", err);
    return json(
      { error: "We could not send that just now. Please try again." },
      502,
    );
  }

  if (!response.ok) {
    // Log the provider's reason (it names bad domains and quota problems);
    // return a generic one, since the visitor can act on none of it.
    const detail = await response.text().catch(() => "");
    console.error(`[contact] Resend returned ${response.status}: ${detail}`);
    if (response.status === 429) {
      return json(
        { error: "Too many messages right now. Please try again shortly." },
        429,
      );
    }
    return json(
      { error: "We could not send that just now. Please try again." },
      502,
    );
  }

  return json({ ok: true });
}

/**
 * One handler for every method rather than an `onRequestPost` export, so the
 * 405 below is ours. A method-specific export alone would let a stray
 * `GET /api/contact` fall through to the SPA shell and answer 200 with a page
 * of HTML, which makes "is the endpoint even deployed?" unanswerable from a
 * browser.
 */
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method === "POST") return handlePost(request, env);

  return new Response(
    JSON.stringify({ error: `${request.method} not allowed` }),
    {
      status: 405,
      headers: {
        "content-type": "application/json; charset=utf-8",
        allow: "POST",
      },
    },
  );
};
