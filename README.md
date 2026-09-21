# Byte Craft Software — bytecraftsoftware.com

The company brochure site. React + Vite + Tailwind, deployed to Cloudflare Pages by
`.github/workflows/deploy.yml` on push to `main`. Single page; the nav is anchor links.

## Analytics

Microsoft Clarity, via `src/lib/analytics.ts`, called from `main.tsx`. **Production builds only** —
developing never shows up as traffic. The project id comes from `VITE_CLARITY_PROJECT_ID` (a repo
secret, passed through in `deploy.yml`); unset means no analytics at all, which is a supported state.
The id is not a secret — it travels in the tag URL on every page that loads it.

Same shape as Long Rest and Punchd. DojoCompanion used to load the tag inline in `index.html`, which
also recorded localhost into the live project; it was moved to this pattern 2026-09-21.

## Privacy policy

`public/privacy.html`, linked from the footer. Static, self-contained styling — the sibling apps
share a `policy.css`, but theirs is a dark sheet and this site is light, so reusing it would look
broken.

⚠️ **The contact form does not send anything.** `src/components/Contact.tsx` calls
`preventDefault()` and sets a "sent" flag, and the page tells the visitor so in as many words. See
the note in that file.

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
