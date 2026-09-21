/**
 * Microsoft Clarity — page analytics and session replay.
 *
 * Ported from Long Rest, which is the reference for this. Two deliberate
 * differences from DojoCompanion, which loads the same tag inline:
 *
 *   1. **The project id comes from the environment, not the source.** DC
 *      hardcodes its id in `index.html`. The id is not a secret — it is visible
 *      in the script URL on any page that loads it — but hardcoding means a
 *      second environment silently reports into the same project.
 *   2. **It only runs on a production build.** DC's inline tag runs on
 *      localhost too, so every session spent developing is recorded and mixed
 *      in with real traffic. Heatmaps and funnels built on that are wrong in a
 *      way nobody notices, because the numbers still look plausible.
 *
 * Loading from the bundle rather than inline in the shell costs a few hundred
 * milliseconds of coverage at the very start of the first paint. That is the
 * right trade: the case it misses is a page whose bundle failed, and that is
 * Sentry's job, not analytics'.
 *
 * NO CONSENT GATE, matching DojoCompanion. Clarity sets cookies and records
 * sessions, which under GDPR/ePrivacy needs consent from visitors in the EU/UK.
 * This site does not show a banner today. If meaningful EU traffic appears,
 * the fix is Clarity's own consent API — load the tag with consent withheld and
 * call `clarity('consent')` once the visitor agrees — rather than removing it.
 */

const PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID as string | undefined

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] }
  }
}

/**
 * Inject the Clarity tag. Safe to call more than once; the second call is a
 * no-op, because a double-injected tag double-counts every page view.
 */
export function initAnalytics(): void {
  if (!import.meta.env.PROD) return
  if (!PROJECT_ID) return
  if (window.clarity) return

  try {
    // Clarity's own bootstrap, which queues calls made before the tag lands.
    window.clarity =
      window.clarity ||
      function (...args: unknown[]) {
        ;(window.clarity!.q = window.clarity!.q || []).push(args)
      }

    const tag = document.createElement('script')
    tag.async = true
    tag.src = `https://www.clarity.ms/tag/${PROJECT_ID}`
    document.head.appendChild(tag)
  } catch {
    // Analytics must never be the reason a page fails to start. A blocked or
    // failed tag is a gap in reporting, not a fault the visitor should see.
  }
}
