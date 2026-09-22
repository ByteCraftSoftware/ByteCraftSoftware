/**
 * Generate 1200x630 Open Graph cards for the four sites.
 *
 * Run from THIS repo because it is the only one of the four with `sharp`
 * installed, and it writes into the sibling repos by absolute path — ugly, but
 * the alternative is four copies of the same script and a sharp dependency in
 * three projects that have no other use for it.
 *
 *   node tools/make-og.cjs
 *
 * Not part of any build. The PNGs it produces are committed; re-run it only
 * when a logo, name or tagline changes.
 *
 * 1200x630 is the size Facebook, LinkedIn and X all crop from. A feed renders it
 * around 500px wide, so everything here is sized to survive being shown at 40%:
 * the product name is 76px (≈30px as seen), the tagline 32px (≈13px). Anything
 * smaller than the tagline would be decoration, not information.
 */
const sharp = require('sharp');
const path = require('path');

const W = 1200;
const H = 630;

const CARDS = [
  {
    out: 'C:/Repos/LongRest/web/public/og.png',
    logo: 'C:/Repos/LongRest/web/public/icons/icon-512.png',
    name: 'Long Rest',
    lines: ['Find the night your whole', 'table can play.'],
    domain: 'longrest.co',
    bg: '#0f0f12',
    accent: '#14b8a6',
    glow: '#14b8a6',
    keyBg: true,
  },
  {
    out: 'C:/Repos/Punchd/web/public/og.png',
    logo: 'C:/Repos/Punchd/web/public/icons/icon-512.png',
    name: 'Punchd',
    lines: ['Time tracking', 'that just works.'],
    domain: 'punchd.co',
    bg: '#0f0f12',
    accent: '#a78bfa',
    glow: '#7c3aed',
    keyBg: true,
  },
  {
    out: 'C:/Repos/DojoCompanion/web/public/og.png',
    logo: 'C:/Repos/DojoCompanion/web/public/icons/icon-512.png',
    name: 'Dojo Companion',
    lines: ['Run your whole dojo', 'in one place.'],
    domain: 'dojocompanion.com',
    bg: '#11151c',
    accent: '#fb923c',
    glow: '#ef7603',
  },
  {
    out: 'C:/Repos/ByteCraftSoftware/public/og.png',
    logo: 'C:/Repos/ByteCraftSoftware/public/bytecraft-logo.png',
    name: 'Byte Craft Software',
    lines: ['We build and run', 'software that lasts.'],
    domain: 'bytecraftsoftware.com',
    bg: '#0f172a',
    accent: '#fb923c',
    glow: '#ef7603',
  },
];

// Escape for XML text nodes. None of the copy above needs it today, but a
// stray ampersand in a tagline would produce an invalid SVG and a blank card,
// which is exactly the sort of thing nobody notices until it is on Facebook.

/**
 * Make the flat background of an app icon transparent.
 *
 * Long Rest's and Punchd's icons are artwork on an opaque near-black tile. Laid
 * on the card that reads as a faint square outline, because the tile black and
 * the card black are not quite the same black.
 *
 * This FLOOD FILLS inward from the border rather than keying every dark pixel in
 * the image. That distinction is the whole point: both logos contain dark
 * artwork, and a blanket "make dark pixels transparent" would punch holes
 * through the middle of the dragon. Only background actually connected to the
 * edge is removed, so an enclosed dark region inside the art is untouched.
 */
async function keyOutBackground(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels: ch } = info;
  const at = (x, y) => (y * w + x) * ch;

  // The corner is the background by definition - nothing else can be there.
  const bg = [data[0], data[1], data[2]];
  const TOL = 42; // generous: the tile is flat, the artwork is not close to it

  const near = (i) =>
    Math.abs(data[i] - bg[0]) <= TOL &&
    Math.abs(data[i + 1] - bg[1]) <= TOL &&
    Math.abs(data[i + 2] - bg[2]) <= TOL;

  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) { stack.push([x, 0], [x, h - 1]); }
  for (let y = 0; y < h; y++) { stack.push([0, y], [w - 1, y]); }

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const k = y * w + x;
    if (seen[k]) continue;
    const i = at(x, y);
    if (!near(i)) continue;
    seen[k] = 1;
    data[i + 3] = 0;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return sharp(data, { raw: { width: w, height: h, channels: ch } }).png().toBuffer();
}

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function card(c) {
  const LOGO = 190;
  const LX = 92;
  const LY = Math.round((H - LOGO) / 2) - 14;
  const TX = LX + LOGO + 56;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g" cx="18%" cy="12%" r="78%">
      <stop offset="0%" stop-color="${c.glow}" stop-opacity="0.30"/>
      <stop offset="60%" stop-color="${c.glow}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${c.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>

  <text x="${TX}" y="${LY + 72}" font-family="Segoe UI, Arial, sans-serif"
        font-size="76" font-weight="700" fill="#ffffff"
        letter-spacing="-1.5">${esc(c.name)}</text>

  <text x="${TX}" y="${LY + 136}" font-family="Segoe UI, Arial, sans-serif"
        font-size="34" font-weight="400" fill="#c7c7cf">${esc(c.lines[0])}</text>
  <text x="${TX}" y="${LY + 182}" font-family="Segoe UI, Arial, sans-serif"
        font-size="34" font-weight="400" fill="#c7c7cf">${esc(c.lines[1])}</text>

  <text x="${TX}" y="${LY + 250}" font-family="Segoe UI, Arial, sans-serif"
        font-size="27" font-weight="600" fill="${c.accent}"
        letter-spacing="0.5">${esc(c.domain)}</text>

  <rect x="0" y="${H - 9}" width="${W}" height="9" fill="${c.accent}"/>
</svg>`;

  return sharp(Buffer.from(svg))
    .composite([
      {
        input: null, // replaced below
      },
    ].slice(0, 0)) // no-op; the logo is composited in the caller
    .png();
}

(async () => {
  for (const c of CARDS) {
    const LOGO = 190;
    const LX = 92;
    const LY = Math.round((H - LOGO) / 2) - 14;

    let src = await sharp(c.logo).png().toBuffer();
    if (c.keyBg) src = await keyOutBackground(src);

    const logo = await sharp(src)
      .resize(LOGO, LOGO, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    const base = await card(c).toBuffer();

    const info = await sharp(base)
      .composite([{ input: logo, left: LX, top: LY }])
      .png({ compressionLevel: 9 })
      .toFile(c.out);

    console.log(
      path.basename(path.dirname(path.dirname(c.out))).padEnd(18),
      `${info.width}x${info.height}`,
      `${(info.size / 1024).toFixed(0)} KB`,
      '->', c.out,
    );
  }
})().catch((e) => {
  console.error('FAILED', e);
  process.exit(1);
});
