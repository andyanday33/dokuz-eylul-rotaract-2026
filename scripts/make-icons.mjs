/**
 * Cuts the favicon out of the club's wordmark.
 *
 *   node scripts/make-icons.mjs
 *
 * The wheel is already in `public/dokuz_eylul.png`, to the right of the type,
 * so the icon is a crop of the real mark rather than a drawing of it — there
 * is one wheel and this is it. The crop is found by scanning the alpha channel
 * for the gutter between the type and the wheel, so it survives the artwork
 * being re-exported at a different size.
 *
 * Sizes are not one image scaled. A favicon is read at 16px in a tab, and the
 * mark's twenty-four teeth average into a pale smudge at that size. So 16px is
 * written with a hard alpha threshold, which trades the soft edges for pixels
 * that are either on or off and keeps the teeth and the six spokes legible;
 * 32 and 48 are the plain downscale, where the mark holds up on its own.
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "public/dokuz_eylul.png");

/** Brand cranberry — `--cranberry` in globals.css, resolved out of oklch. */
const INK = [0xca, 0x00, 0x69];
/** `--paper`. iOS composites the home-screen icon on black if it is given alpha. */
const PAPER = "#f2ece1";

/** The tight square around the wheel, found rather than hard-coded. */
const findWheel = async () => {
  const img = sharp(SOURCE);
  const { width, height } = await img.metadata();
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alpha = (x, y) => data[(y * info.width + x) * info.channels + info.channels - 1];

  const inked = Array.from({ length: width }, (_, x) => {
    for (let y = 0; y < height; y++) if (alpha(x, y) > 8) return true;
    return false;
  });

  // The wheel is whatever sits right of the last empty column.
  let gutter = width - 1;
  while (gutter > 0 && inked[gutter]) gutter--;

  let x0 = width, x1 = -1, y0 = height, y1 = -1;
  for (let x = gutter + 1; x < width; x++)
    for (let y = 0; y < height; y++)
      if (alpha(x, y) > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) throw new Error("No wheel found right of the wordmark — has the artwork changed?");
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
};

/** Every pixel either full brand ink or fully clear. */
const harden = async (png, cut) => {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const on = data[i + 3] >= cut * 255;
    [data[i], data[i + 1], data[i + 2]] = INK;
    data[i + 3] = on ? 255 : 0;
  }
  return sharp(data, { raw: info }).png().toBuffer();
};

/** A .ico is a header, a directory, and in our case PNGs pasted after it. */
const ico = (images) => {
  const dir = Buffer.alloc(6 + images.length * 16);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(images.length, 4);
  let offset = dir.length;
  images.forEach(({ size, png }, i) => {
    const at = 6 + i * 16;
    dir.writeUInt8(size === 256 ? 0 : size, at);
    dir.writeUInt8(size === 256 ? 0 : size, at + 1);
    dir.writeUInt8(0, at + 2);
    dir.writeUInt8(0, at + 3);
    dir.writeUInt16LE(1, at + 4);
    dir.writeUInt16LE(32, at + 6);
    dir.writeUInt32LE(png.length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += png.length;
  });
  return Buffer.concat([dir, ...images.map((i) => i.png)]);
};

const crop = await findWheel();
console.log(`wheel found at ${crop.width}×${crop.height}, x${crop.left} y${crop.top}`);
if (Math.abs(crop.width / crop.height - 1) > 0.02)
  throw new Error(`Crop is not square (${crop.width}×${crop.height}) — the scan caught something else`);

const wheel = await sharp(SOURCE).extract(crop).png().toBuffer();
const scaled = (size) => sharp(wheel).resize(size, size, { kernel: "lanczos3" }).png().toBuffer();

writeFileSync(
  path.join(root, "app/favicon.ico"),
  ico([
    { size: 16, png: await harden(await scaled(16), 0.35) },
    { size: 32, png: await scaled(32) },
    { size: 48, png: await scaled(48) },
  ]),
);
console.log("wrote app/favicon.ico (16 hardened, 32, 48)");

// Home-screen icon: opaque, and inset so the mark is not flush to the corners
// once iOS rounds them.
const APPLE = 180, inset = Math.round(APPLE * 0.16);
writeFileSync(
  path.join(root, "app/apple-icon.png"),
  await sharp({ create: { width: APPLE, height: APPLE, channels: 4, background: PAPER } })
    .composite([
      {
        input: await sharp(wheel).resize(APPLE - inset * 2, APPLE - inset * 2).toBuffer(),
        top: inset,
        left: inset,
      },
    ])
    .png()
    .toBuffer(),
);
console.log(`wrote app/apple-icon.png (${APPLE}×${APPLE}, on paper)`);
