/**
 * Make the square background of the INSTALL icons transparent, in place.
 *
 * `icon-192.png` / `icon-512.png` are the manifest's `purpose: any` icons, which
 * is what Windows and Chrome use for an installed PWA. Both were artwork on an
 * opaque dark square, so the installed app showed black corners around a rounded
 * tile.
 *
 * DELIBERATELY NOT TOUCHED:
 *   - maskable-*.png  - a maskable icon is SUPPOSED to be full-bleed and opaque.
 *     The platform crops it to its own shape, and transparent corners there mean
 *     the crop bites into the artwork.
 *   - apple-touch-icon.png - iOS composites it and applies its own mask.
 *     Transparency renders as black on the home screen.
 *
 * Rewrites the files in place. They are committed, so git holds the originals.
 */
const sharp = require('sharp');
const fs = require('fs');
const { keyOutBackground } = require('./key-bg.cjs');

const TARGETS = process.argv.slice(2);
if (!TARGETS.length) {
  console.error('usage: node tools/key-icons.cjs <png> [<png> ...]');
  process.exit(1);
}

(async () => {
  for (const f of TARGETS) {
    const before = (await sharp(f).metadata());
    const out = await keyOutBackground(fs.readFileSync(f));
    fs.writeFileSync(f, out);
    const after = await sharp(f).metadata();
    console.log(`${f}  ${before.width}x${before.height} -> alpha:${after.hasAlpha}  ${(out.length/1024).toFixed(0)} KB`);
  }
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
