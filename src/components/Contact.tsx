import React, { useEffect, useRef, useState } from "react";
import Section from "./Section";

/**
 * The contact form posts to `/api/contact`, a Cloudflare Pages Function that
 * sends the message through Resend. See `functions/api/contact.ts` — the API
 * key and the destination address live in the Pages project's environment, not
 * in this bundle.
 *
 * A failed send says so and keeps what the visitor typed. The one thing this
 * must never do is claim a message went out when it did not, which is what the
 * previous fake-submit version effectively did.
 */

type Status = "idle" | "sending" | "sent" | "error";

const Contact: React.FC = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const sentPanelRef = useRef<HTMLDivElement>(null);
  /**
   * Set only when the visitor asks for a second message. Without it the effect
   * below could not tell that state from a first page load, and focusing a
   * field on load would yank the page down to the form past everything above
   * it — the opposite of helpful.
   */
  const refocusName = useRef(false);

  // Both branches swap the whole panel out, which leaves focus on a element
  // that no longer exists — the browser drops it on <body>, so the next Tab
  // starts again from the top of the page.
  useEffect(() => {
    if (status === "sent") {
      sentPanelRef.current?.focus();
    } else if (status === "idle" && refocusName.current) {
      refocusName.current = false;
      nameRef.current?.focus();
    }
  }, [status]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          company: data.get("company"),
        }),
      });

      if (!res.ok) {
        // The endpoint sends a visitor-facing sentence; fall back to a generic
        // one if this is something else entirely (a proxy error page, say).
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(
          payload?.error ??
            "Something went wrong sending that. Please try again.",
        );
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("sent");
    } catch {
      // Offline, DNS, blocked request — never the visitor's fault to fix.
      setError(
        "We could not reach the server. Check your connection and try again.",
      );
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <Section id="contact" eyebrow="Let’s talk" title="Message sent.">
        {/* tabIndex -1 makes the panel focusable programmatically without
            adding it to the tab order, which is how focus lands somewhere
            meaningful — and gets read out — after the form disappears. */}
        <div
          ref={sentPanelRef}
          tabIndex={-1}
          className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-3 outline-none"
        >
          <p className="text-xs md:text-sm text-slate-700">
            Thanks — that landed in our inbox. We usually reply within a
            business day.
          </p>
          <button
            type="button"
            onClick={() => {
              refocusName.current = true;
              setStatus("idle");
            }}
            className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-full bg-brand-orange text-white shadow-brand-soft hover:translate-y-[1px] transition-transform"
          >
            Send another message
          </button>
        </div>
      </Section>
    );
  }

  const sending = status === "sending";

  return (
    <Section id="contact" eyebrow="Let’s talk" title="Send us a message.">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-3"
      >
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 text-xs">
            <label htmlFor="name" className="font-medium text-slate-800">
              Name
            </label>
            <input
              ref={nameRef}
              id="name"
              name="name"
              required
              maxLength={120}
              autoComplete="name"
              disabled={sending}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-orange/60 focus:border-brand-orange disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <label htmlFor="email" className="font-medium text-slate-800">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              disabled={sending}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-orange/60 focus:border-brand-orange disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs">
          <label htmlFor="message" className="font-medium text-slate-800">
            How can we help?
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            maxLength={5000}
            disabled={sending}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-orange/60 focus:border-brand-orange resize-y disabled:opacity-60"
          />
        </div>

        {/* Honeypot. Hidden from people and from assistive tech, irresistible
            to the form-filling bots that never run our JavaScript. The server
            treats a filled `company` as spam and answers as if it had sent. */}
        <div aria-hidden="true" className="absolute left-[-9999px] w-px h-px overflow-hidden">
          <label htmlFor="company">Company (leave this blank)</label>
          <input
            id="company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-full bg-brand-orange text-white shadow-brand-soft hover:translate-y-[1px] transition-transform disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </div>

        {/* Announced rather than just shown: a submit failure that only exists
            as orange text below the button is invisible to a screen reader. */}
        <p aria-live="polite" className="text-[11px] text-rose-600 empty:hidden">
          {status === "error" && error}
        </p>
      </form>
    </Section>
  );
};

export default Contact;
