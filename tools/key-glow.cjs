const sharp = require('sharp');

/**
 * Make a glow-on-black mark transparent by letting alpha follow brightness:
 * pure black becomes fully transparent, the glow fades out as it dims, and the
 * bright artwork stays solid.
 *
 * THE COMPANION TO `key-bg.cjs`, NOT A REPLACEMENT. That one flood-fills
 * inward from the border with a tolerance, which is correct for the sibling
 * apps: their icons are artwork on a FLAT near-black tile, and a flood fill
 * removes only background connected to the edge, so enclosed dark regions
 * inside the artwork survive.
 *
 * Both of those properties are wrong for the Byte Craft mark:
 *
 *   - its backdrop is not flat, it is a glow fading into black, so a tolerance
 *     cut lands at an arbitrary brightness and leaves a hard dark halo;
 *   - the black enclosed INSIDE the ring is not connected to the edge, so a
 *     flood fill keeps it, and it shows as a black disc on light backgrounds.
 *
 * The cost here is the mirror image: artwork's own dark shading goes
 * semi-transparent, so a bevelled mark reads slightly lighter. Fine on a dark
 * surface, which is everywhere this is used. Anything that needs the original
 * opaque pixels — an iOS touch icon, for instance — should skip this.
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

module.exports = { keyGlowToAlpha };
