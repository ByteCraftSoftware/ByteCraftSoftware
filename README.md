# Byte Craft Software — bytecraftsoftware.com

The company brochure site. React + Vite + Tailwind, deployed to Cloudflare Pages by
`.github/workflows/deploy.yml` on push to `main`. Single page; the nav is anchor links.

## Deploy

`cloudflare/wrangler-action@v3`, **not** `cloudflare/pages-action` — Cloudflare deleted that
repository on 2026-09-18, so any workflow still pinned to it fails at action resolution before a
step runs. GitHub reports it as *"Unable to resolve actions. Cannot access repositories
'cloudflare/pages-action'"*, which reads like a permissions problem and is not one. Punchd, Long
Rest and DojoCompanion were moved the same week; this repo was the straggler, fixed 2026-09-21.

Wrangler picks Pages Functions up from the **working directory**, not from the asset directory named
on the command line, so `functions/` has to be present next to `dist/` when `pages deploy` runs. The
build job ships both in one artifact and the deploy job unpacks it to the workspace root. Lose
`functions/` from that artifact and the site deploys fine while `/api/contact` 404s.

⚠️ **Do not add a checkout to the `deploy` job.** It looks like the obvious way to get `functions/`
there, and it fails: `wrangler-action` runs `npm i wrangler@3.90.0` in that workspace, wrangler 3
declares a peer dependency on `@cloudflare/workers-types@^4`, this repo is on `^5`, and with a
`package.json` present npm has to reconcile them. It can't, exits ERESOLVE, and the action dies
before it ever reaches Cloudflare — reported only as `The process '/usr/local/bin/npm' failed with
exit code 1`. An empty workspace has nothing to reconcile. (Tried and reverted 2026-09-22.)

## Analytics

Microsoft Clarity, via `src/lib/analytics.ts`, called from `main.tsx`. **Production builds only** —
developing never shows up as traffic. The project id comes from `VITE_CLARITY_PROJECT_ID` (a repo
secret, passed through in `deploy.yml`); unset means no analytics at all, which is a supported state.
The id is not a secret — it travels in the tag URL on every page that loads it.

Same shape as Long Rest and Punchd. DojoCompanion used to load the tag inline in `index.html`, which
also recorded localhost into the live project; it was moved to this pattern 2026-09-21.

## Open Graph
Long Rest, Punchd and DojoCompanion — this is the only one of the four with `sharp` installed. Re-run it (`node tools/make-og.cjs`) only when a logo, name
or tagline changes; the PNGs are committed.

Sized for a feed rendering it around 500px wide — everything is built to survive being shown at
40%, which is why the product name is 76px and nothing is smaller than the 27px domain line.
`twitter:card` is `summary_large_image`; under plain `summary` the same file is cropped to a small
square and the wording is lost.

⚠️ **Facebook caches OG data per URL, aggressively.** After deploying a change to any og: tag,
re-scrape at <https://developers.facebook.com/tools/debug/> or the old card keeps being served —
including to people who have never shared the link before.

## Privacy policy

`public/privacy.html`, linked from the footer. Static, self-contained styling — the sibling apps
share a `policy.css`, but theirs is a dark sheet and this site is light, so reusing it would look
broken.

## Contact form

`src/components/Contact.tsx` posts to **`/api/contact`**, a Cloudflare Pages Function
(`functions/api/contact.ts`) that sends the message through **Resend**. A Pages Function rather than
a separate API because it deploys with the site, shares its origin (no CORS), and keeps the Resend
key out of the bundle.

Mail goes **to and from `support@bytecraftsoftware.com`**, with the visitor's address as `Reply-To`
so hitting Reply in the inbox answers them. Not `noreply@` — Long Rest sent from `noreply@` and
deliveries failed silently.

Configuration lives on the Pages project (**Settings → Environment variables**), not in the repo:

| Variable | Required | Notes |
|---|---|---|
| `RESEND_API_KEY` | yes, secret | Unset makes the endpoint return 503 and log. Never a silent success. |
| `CONTACT_TO` | no | Defaults to `support@bytecraftsoftware.com`. |
| `CONTACT_FROM` | no | Defaults to `Byte Craft Software <support@bytecraftsoftware.com>`. Must be a Resend-verified domain. |

Set them for **Production and Preview** — a preview deploy with no key has a contact form that 503s.

**Locally:** copy `.dev.vars.example` to `.dev.vars` (gitignored) and fill in the key, then run both
servers — `npm run dev` (Vite, :5200) and `npm run dev:functions` (Wrangler, :8788). Vite proxies
`/api` to Wrangler; without the second server, form posts fail at :8788, which is deliberate — the
alternative is a form that works in dev and only breaks in production.

**Spam:** a honeypot field (`company`) plus field-length caps. A filled honeypot gets the same
`{ok:true}` a real send does, so a bot cannot tell rejection from acceptance. There is **no rate
limit** — the endpoint can be POSTed to directly. If that ever gets abused, the fix is Cloudflare
Turnstile on the form rather than anything cleverer server-side.


---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
