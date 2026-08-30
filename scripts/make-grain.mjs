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

/**
 * Mean opacity of the tile.
 *
 * This is the number that decides the tone, and it is measured rather than
 * chosen. `feTurbulence` emits RGBA — its alpha is noise too, so only part of
 * each pixel tints what is beneath it. A flat opaque tile covers everything
 * and, under `mix-blend-multiply`, darkened the paper about 3.6 times as much
 * as the filter did: the ground came out a tone heavier across the whole site.
 *
 * Measured against the original on a flat stretch of paper: the SVG darkened
 * it by 1.6/255, an opaque tile by 5.8. Multiply is linear in mean coverage,
 * so 1.6/5.8 is the alpha that lands on the same tone.
 */
const COVERAGE = 0.276;

// Grey plus alpha. The filter emitted RGBA, but its three colour channels are
// doing the same job here — the tooth is tonal, not coloured — so storing one
// grey channel and an alpha halves the file over an RGBA tile that would carry
// the same value three times.
const noise = Buffer.alloc(SIZE * SIZE * 2);
for (let i = 0; i < SIZE * SIZE; i++) {
  // Three samples averaged: pulls the distribution toward mid-grey so the tile
  // reads as tooth in the paper rather than as scattered black and white dots,
  // which is what a single uniform sample gives.
  const v = Math.round((Math.random() + Math.random() + Math.random()) * 85);
  noise[i * 2] = v;
  // Uniform across the full range so the grain still varies from invisible to
  // solid, scaled to the mean above.
  noise[i * 2 + 1] = Math.round(Math.random() * 255 * 2 * COVERAGE);
}

const out = path.resolve(process.cwd(), "public/grain.png");

await sharp(noise, { raw: { width: SIZE, height: SIZE, channels: 2 } })
  .png({ compressionLevel: 9 })
  .toFile(out);

const { size } = await (await import("node:fs/promises")).stat(out);
console.log(`wrote ${out} — ${SIZE}x${SIZE}, ${(size / 1024).toFixed(1)} KB`);
