/**
 * Generate favicon-32.png and favicon-16.png from each app's existing icon.
 *
 * WHY PNG RATHER THAN REPLACING favicon.ico: every browser in use has supported
 * PNG favicons for over a decade, and `sharp` cannot write ICO. The .ico stays
 * as a last-resort fallback and is listed LAST, so a modern browser takes the
 * PNG and an ancient one still finds something.
 *
 * A 16px icon is nine hundred pixels. Detailed artwork turns to mush at that
 * size no matter how it is resampled - the point of the 16 is that something
 * recognisably coloured appears in the tab, not that the drawing survives.
 */
const sharp = require('sharp');

const APPS = [
  { name: 'Long Rest',   src: 'C:/Repos/LongRest/web/public/icons/icon-192.png',   out: 'C:/Repos/LongRest/web/public' },
  { name: 'Punchd',      src: 'C:/Repos/Punchd/web/public/icons/icon-192.png',     out: 'C:/Repos/Punchd/web/public' },
  { name: 'DojoCompanion', src: 'C:/Repos/DojoCompanion/web/public/icons/icon-192.png', out: 'C:/Repos/DojoCompanion/web/public' },
  { name: 'Byte Craft',  src: 'C:/Repos/ByteCraftSoftware/public/bytecraft-logo.png', out: 'C:/Repos/ByteCraftSoftware/public' },
];

(async () => {
  for (const a of APPS) {
    for (const size of [32, 16]) {
      const info = await sharp(a.src)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(`${a.out}/favicon-${size}.png`);
      console.log(`${a.name.padEnd(16)} favicon-${size}.png  ${info.width}x${info.height}  ${info.size} B`);
    }
  }
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
