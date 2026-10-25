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

/**
 * The Byte Craft mark, 2026-10-24: the gold circuit-B with the cross. Supplied
 * at 512 and already opaque on black, so nothing here flattens it.
 *
 * `bytecraft-logo-1024.png` beside it is the PREVIOUS mark — flat orange on
 * transparent — kept for history. Do not point this at that file; it will
 * silently reinstate the old logo everywhere on the next run.
 */
const BC_MASTER = 'C:/Repos/ByteCraftSoftware/design/bytecraft-logo-512.png';

/**
 * The flat line-art companions, used for every favicon frame.
 *
 * The rendered mark does not survive a favicon. Downscaled to 16px its
 * gradient, bevel and glow average out to a brown smudge on a dark tab strip
 * and a washed peach one on a light strip — legible as "something orange",
 * not as a cross and a B. The flat drawings hold both shapes at both sizes.
 *
 * FLAT_COMPACT drops the ring and is used at 16 only; see the note in the file
 * itself for why the ring is the first thing to go.
 */
const BC_FLAT = 'C:/Repos/ByteCraftSoftware/design/bytecraft-mark-flat.svg';
const BC_FLAT_COMPACT =
  'C:/Repos/ByteCraftSoftware/design/bytecraft-mark-flat-compact.svg';

/**
 * Turn the mark's black backdrop into transparency by making alpha follow
 * brightness: pure black becomes fully transparent, the glow fades out as it
 * dims, and the gold stays solid.
 *
 * NOT `tools/key-bg.cjs`, which is the right tool for the sibling apps and the
 * wrong one here. That flood-fills inward from the border with a tolerance,
 * which assumes a FLAT tile. This mark has a glow that fades gradually into
 * black, so a tolerance key cuts it at whatever brightness the threshold lands
 * on and leaves a hard dark halo — and because the fill only removes
 * background connected to the edge, the black enclosed INSIDE the ring
 * survives and shows as a black disc on any light background.
 *
 * The cost of this approach is that the artwork's own dark bevel shading goes
 * semi-transparent too, so the mark reads slightly lighter. On the dark header
 * it is the right trade; it is why `apple-touch-icon` opts out below and keeps
 * the opaque original, which is also what iOS wants.
 */
async function keyGlowToAlpha(src) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += info.channels) {
    data[i + 3] = Math.max(data[i], data[i + 1], data[i + 2]);
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

const TARGETS = [
  // ── Byte Craft Software ────────────────────────────────────────────────
  {
    from: BC_MASTER,
    out: 'C:/Repos/ByteCraftSoftware/public/bytecraft-logo.png',
    size: 96, // header renders it at 28px, privacy page at 30px
    keyGlow: true, // sits in a tinted, rounded chip — a black square shows
  },
  {
    from: BC_FLAT,
    out: 'C:/Repos/ByteCraftSoftware/public/favicon-32.png',
    size: 32,
  },
  {
    from: BC_FLAT_COMPACT,
    out: 'C:/Repos/ByteCraftSoftware/public/favicon-16.png',
    size: 16,
  },
  {
    from: BC_MASTER,
    out: 'C:/Repos/ByteCraftSoftware/public/apple-touch-icon.png',
    size: 180,
    // No `flattenTo`: the 2026-10-24 mark is already opaque on black, so there
    // is no alpha for iOS to composite onto white in the first place.
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
    // Per-size sources: the ring survives at 32 and 48, not at 16.
    bySize: { 16: BC_FLAT_COMPACT, 32: BC_FLAT, 48: BC_FLAT },
    out: 'C:/Repos/ByteCraftSoftware/public/favicon.ico',
  },
  {
    from: 'C:/Repos/Punchd/web/public/icons/icon-512.png',
    out: 'C:/Repos/Punchd/web/public/favicon.ico',
  },
];

const ICO_SIZES = [16, 32, 48];

async function buildIco({ from, bySize, out, keyGlow = false }) {
  const keyed = keyGlow && from ? await keyGlowToAlpha(from) : null;
  const frames = [];
  for (const size of ICO_SIZES) {
    const source = bySize ? bySize[size] : (keyed ?? from);
    frames.push({
      size,
      data: await sharp(source, { density: 384 })
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
    const source = t.keyGlow ? await keyGlowToAlpha(t.from) : t.from;
    let img = sharp(source, { density: 384 }).resize(t.size, t.size, {
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
    const size = await buildIco(ico);
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
