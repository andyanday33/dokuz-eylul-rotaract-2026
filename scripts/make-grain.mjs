/**
 * Bake the paper grain into a tile: `node scripts/make-grain.mjs`
 *
 * The grain used to be an inline SVG filter — `feTurbulence` fractal noise,
 * stretched across each section as a background-image. It looks right and it
 * costs almost nothing in Chromium, which rasterises it once and keeps it.
 * WebKit re-evaluates the filter whenever the area repaints, and on a phone
 * that is the difference between the board wheel turning at 60fps and turning
 * at 11: measured on an iPhone-sized WebKit, removing the grain alone took the
 * frame rate from 11 to 60.
 *
 * A raster tile is decoded once and repeated by the compositor for free. Noise
 * has no structure, so nothing gives away where one tile ends and the next
 * begins — it needs no seam-matching to look continuous.
 *
 * Re-run this only to change the grain itself; the output is committed.
 */
import sharp from "sharp";
import path from "node:path";

/** Big enough that repetition is invisible, small enough to stay a few KB. */
const SIZE = 128;

const noise = Buffer.alloc(SIZE * SIZE);
for (let i = 0; i < noise.length; i++) {
  // Three samples averaged: pulls the distribution toward mid-grey so the tile
  // reads as tooth in the paper rather than as scattered black and white dots,
  // which is what a single uniform sample gives.
  noise[i] = Math.round((Math.random() + Math.random() + Math.random()) * 85);
}

const out = path.resolve(process.cwd(), "public/grain.png");

await sharp(noise, { raw: { width: SIZE, height: SIZE, channels: 1 } })
  .png({ compressionLevel: 9, palette: true })
  .toFile(out);

const { size } = await (await import("node:fs/promises")).stat(out);
console.log(`wrote ${out} — ${SIZE}x${SIZE}, ${(size / 1024).toFixed(1)} KB`);
