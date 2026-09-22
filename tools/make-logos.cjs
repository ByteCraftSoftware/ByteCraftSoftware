/**
 * Generate the small, ON-SCREEN logo derivatives for the sites.
 *
 * Run from THIS repo, like `make-og.cjs`, because it is the only one of the
 * four with `sharp` installed, and it writes into the sibling repos by absolute
 * path.
 *
 *   node tools/make-logos.cjs
 *
 * Not part of any build. The PNGs it produces are committed; re-run it only
 * when a master logo changes.
 *
 * WHY THIS EXISTS. Every site was serving a full-size master to paint a
 * thumbnail: bytecraftsoftware.com sent a 1024x1024, 1.4 MB PNG to fill a 28px
 * slot in the header, and Long Rest's landing page pulled its 512px, 530 KB
 * manifest icon to draw a 112px mark. Both are the first image a visitor waits
 * for, and on a slow connection the header logo took over a minute.
 *
 * THE MANIFEST ICONS ARE NOT TOUCHED. `icon-192` / `icon-512` / `maskable-*` /
 * `apple-touch-icon` are read by the platform at those exact sizes for an
 * installed PWA, and Windows caches them (see LONG_REST.md). These are separate
 * files for the <img> tags in the UI, which is the only place a smaller one can
 * safely be used.
 *
 * SIZING RULE: roughly 2.5-3x the largest CSS size the file is displayed at, so
 * it stays sharp on a retina screen without paying for pixels nobody sees.
 */
const sharp = require('sharp');
const fs = require('fs');

const TARGETS = [
  // ── Byte Craft Software ────────────────────────────────────────────────
  {
    from: 'C:/Repos/ByteCraftSoftware/design/bytecraft-logo-1024.png',
    out: 'C:/Repos/ByteCraftSoftware/public/bytecraft-logo.png',
    size: 96, // header renders it at 28px, privacy page at 30px
  },
  {
    from: 'C:/Repos/ByteCraftSoftware/design/bytecraft-logo-1024.png',
    out: 'C:/Repos/ByteCraftSoftware/public/favicon-32.png',
    size: 32,
  },
  {
    from: 'C:/Repos/ByteCraftSoftware/design/bytecraft-logo-1024.png',
    out: 'C:/Repos/ByteCraftSoftware/public/favicon-16.png',
    size: 16,
  },
  {
    from: 'C:/Repos/ByteCraftSoftware/design/bytecraft-logo-1024.png',
    out: 'C:/Repos/ByteCraftSoftware/public/apple-touch-icon.png',
    size: 180,
    // iOS composites the alpha onto white and applies its own mask, so this
    // one is flattened onto the brand dark rather than left transparent —
    // same rule as Long Rest's apple-touch-icon (see LONG_REST.md).
    flattenTo: '#151515',
  },

  // ── Long Rest ──────────────────────────────────────────────────────────
  {
    from: 'C:/Repos/LongRest/web/public/icons/icon-512.png',
    out: 'C:/Repos/LongRest/web/public/icons/icon-96.png',
    size: 96, // app header 36px, public nav 28px
  },
  {
    from: 'C:/Repos/LongRest/web/public/icons/icon-512.png',
    out: 'C:/Repos/LongRest/web/public/icons/icon-256.png',
    size: 256, // landing hero, 112px
  },

  // ── Apple touch icons ──────────────────────────────────────────────────
  //
  // iOS ignores the web manifest's icons entirely and reads only
  // `rel="apple-touch-icon"`. It does NOT support transparency there: it
  // composites the alpha onto WHITE and then applies its own mask, which is
  // slightly wider than the rounded corners baked into this artwork — so a
  // keyed `icon-512` lands on the home screen with white wedges in its
  // corners. Long Rest hit this first and fixed it with a dedicated opaque
  // file; the other two kept pointing at the manifest icon and kept the bug.
  //
  // Each `flattenTo` is the artwork's OWN background, sampled out of the icon
  // rather than picked by eye. Flattening onto anything else leaves a visible
  // ring where the rounded corners used to be.
  {
    from: 'C:/Repos/DojoCompanion/web/public/icons/icon-512.png',
    out: 'C:/Repos/DojoCompanion/web/public/icons/apple-touch-icon.png',
    size: 180,
    flattenTo: '#e67731',
  },
  {
    from: 'C:/Repos/Punchd/web/public/icons/icon-512.png',
    out: 'C:/Repos/Punchd/web/public/icons/apple-touch-icon.png',
    size: 180,
    flattenTo: '#7c3aed',
  },
  {
    from: 'C:/Repos/LongRest/web/public/icons/icon-512.png',
    out: 'C:/Repos/LongRest/web/public/icons/apple-touch-icon.png',
    size: 180,
    flattenTo: '#014f5c',
  },
];

/**
 * Favicons, rebuilt from the same masters.
 *
 * 16/32/48 only, and every frame PNG-compressed. Both repos had grown ICOs
 * that were mostly waste: this one was 192 KB, and Punchd's held NINE frames
 * (16 through 256) stored as uncompressed BMP, where the 128px frame alone was
 * 66 KB. A browser tab uses 16 or 32; 48 covers Windows' taskbar and a pinned
 * site. Nothing reads the rest, and the file is fetched on every page load.
 *
 * PNG-inside-ICO is supported by every browser still in use (and Windows since
 * Vista), which is the whole reason these come out at a few KB.
 */
const ICOS = [
  {
    from: 'C:/Repos/ByteCraftSoftware/design/bytecraft-logo-1024.png',
    out: 'C:/Repos/ByteCraftSoftware/public/favicon.ico',
  },
  {
    from: 'C:/Repos/Punchd/web/public/icons/icon-512.png',
    out: 'C:/Repos/Punchd/web/public/favicon.ico',
  },
];

const ICO_SIZES = [16, 32, 48];

async function buildIco(from, out) {
  const frames = [];
  for (const size of ICO_SIZES) {
    frames.push({
      size,
      data: await sharp(from)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ palette: true, compressionLevel: 9, effort: 10 })
        .toBuffer(),
    });
  }

  // ICONDIR: reserved, type 1 (icon), frame count.
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);

  // One 16-byte ICONDIRENTRY per frame, then the frames themselves.
  let offset = header.length + 16 * frames.length;
  const entries = frames.map((f) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(f.size, 0); // width  (0 would mean 256)
    e.writeUInt8(f.size, 1); // height
    e.writeUInt8(0, 2); // palette size, 0 = truecolour
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(f.data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += f.data.length;
    return e;
  });

  fs.writeFileSync(
    out,
    Buffer.concat([header, ...entries, ...frames.map((f) => f.data)]),
  );
  return fs.statSync(out).size;
}

async function main() {
  for (const t of TARGETS) {
    let img = sharp(t.from).resize(t.size, t.size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

    if (t.flattenTo) img = img.flatten({ background: t.flattenTo });

    // `palette: true` is the whole win on flat, few-colour artwork — it drops
    // a Byte Craft icon by an order of magnitude. On the detailed Long Rest
    // illustration it helps far less, but never hurts: sharp keeps whichever
    // encoding comes out smaller.
    const info = await img
      .png({ palette: true, compressionLevel: 9, effort: 10 })
      .toFile(t.out);

    const kb = (info.size / 1024).toFixed(1);
    console.log(`${t.out.split('/').pop().padEnd(24)} ${t.size}px  ${kb} KB`);
  }

  for (const ico of ICOS) {
    const size = await buildIco(ico.from, ico.out);
    const repo = ico.out.split('/')[3];
    console.log(
      `${'favicon.ico'.padEnd(24)} ${ICO_SIZES.join('/')}  ${(size / 1024).toFixed(1)} KB  (${repo})`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
