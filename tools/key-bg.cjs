const sharp = require('sharp');

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

module.exports = { keyOutBackground };
