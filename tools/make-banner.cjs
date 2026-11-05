/**
 * Cover banners for profile pages — LinkedIn company page and personal profile.
 *
 *   node tools/make-banner.cjs
 *
 * Writes into `design/`, not `public/`: nothing here is served by the site,
 * these are files you upload to a platform. Not part of any build.
 *
 * Styled to match `make-og.cjs` deliberately — same navy, same corner glow,
 * same accent rule along the bottom — so the LinkedIn page and a shared link
 * look like the same company.
 *
 * TWO SIZES, AND THE LAYOUTS DIFFER FOR A REASON:
 *
 *   company 1128x191 — WORDS ONLY, CENTRED. LinkedIn overlays the page logo
 *     over the lower left of this image, so a mark in the banner puts a second
 *     copy of it right beside the first; the logo IS the mark here. Centred
 *     rather than left-aligned because LinkedIn re-crops this cover differently
 *     in the page header, the admin sidebar card and on mobile — centred
 *     content is the only layout indifferent to where it cuts. (The sidebar
 *     card still hides the first word behind the logo. That crop is admin-only;
 *     the public header shows it in full.)
 *
 *   personal 1584x396 — keeps the mark, because what sits over the lower left
 *     there is your profile PHOTO, not the logo, so there is nothing to
 *     duplicate.
 *
 * Where a mark is used it is sized to survive LinkedIn's re-encode, which
 * serves these at roughly half the uploaded width on a standard display.
 */
const sharp = require('sharp');

const MARK = 'C:/Repos/ByteCraftSoftware/design/bytecraft-mark-512.png';
const OUT_DIR = 'C:/Repos/ByteCraftSoftware/design';

const BG = '#0f172a';
const GLOW = '#ef7603';
const ACCENT = '#fb923c';
const NAME = 'Byte Craft Software';
const TAGLINE = 'We build and run software that lasts.';
const DOMAIN = 'bytecraftsoftware.com';

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const BANNERS = [
  {
    out: `${OUT_DIR}/linkedin-company-cover-1128x191.png`,
    w: 1128,
    h: 191,
    mark: 0, // the page logo supplies it
    nameSize: 44,
    taglineSize: 21,
    domainSize: 17,
    rule: 5,
  },
  {
    out: `${OUT_DIR}/linkedin-profile-banner-1584x396.png`,
    w: 1584,
    h: 396,
    mark: 230,
    markX: 150,
    nameSize: 76,
    taglineSize: 34,
    domainSize: 26,
    rule: 8,
  },
];

function plate(b) {
  const centred = !b.mark;
  const textX = centred
    ? Math.round(b.w / 2)
    : b.markX + b.mark + Math.round(b.mark * 0.32);
  const anchor = centred ? 'middle' : 'start';
  const mid = b.h / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${b.w}" height="${b.h}">
  <defs>
    <radialGradient id="g" cx="18%" cy="12%" r="78%">
      <stop offset="0%" stop-color="${GLOW}" stop-opacity="0.30"/>
      <stop offset="60%" stop-color="${GLOW}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${GLOW}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${b.w}" height="${b.h}" fill="${BG}"/>
  <rect width="${b.w}" height="${b.h}" fill="url(#g)"/>

  <text x="${textX}" y="${mid - b.taglineSize * 0.9}" text-anchor="${anchor}"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="${b.nameSize}" font-weight="700" fill="#ffffff"
        letter-spacing="-1">${esc(NAME)}</text>

  <text x="${textX}" y="${mid + b.taglineSize * 0.6}" text-anchor="${anchor}"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="${b.taglineSize}" font-weight="400" fill="#c7c7cf">${esc(TAGLINE)}</text>

  <text x="${textX}" y="${mid + b.taglineSize * 2.2}" text-anchor="${anchor}"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="${b.domainSize}" font-weight="600" fill="${ACCENT}"
        letter-spacing="0.5">${esc(DOMAIN)}</text>

  <rect x="0" y="${b.h - b.rule}" width="${b.w}" height="${b.rule}" fill="${ACCENT}"/>
</svg>`;

  return Buffer.from(svg);
}

(async () => {
  for (const b of BANNERS) {
    const layers = [];
    if (b.mark) {
      layers.push({
        input: await sharp(MARK)
          .resize(b.mark, b.mark, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toBuffer(),
        left: b.markX,
        top: Math.round((b.h - b.mark) / 2),
      });
    }

    const info = await sharp(plate(b))
      .composite(layers)
      .png({ compressionLevel: 9 })
      .toFile(b.out);

    console.log(
      `${b.w}x${b.h}`.padEnd(10),
      `${(info.size / 1024).toFixed(0)} KB`.padEnd(8),
      b.out,
    );
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
