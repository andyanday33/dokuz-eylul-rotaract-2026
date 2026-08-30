/**
 * Move the contents of `media/` into the Supabase Storage bucket, once.
 *
 *   node --env-file=.env scripts/upload-media.mjs          # report only
 *   node --env-file=.env scripts/upload-media.mjs --write  # actually upload
 *
 * Uploads are keyed by filename at the root of the bucket, which is where the
 * s3Storage adapter looks: a media row stores only its `filename`, and the URL
 * is built from that. Match the names and every existing row keeps working —
 * get them wrong and the database points at files that are not there, which
 * renders as a broken portrait rather than an error.
 *
 * Size variants count. `sharp` cuts an 800x800 `portrait` crop on upload and
 * stores it as a sibling file, so `media/` holds both `name.jpg` and
 * `name-800x800.jpg` and both are referenced. Everything in the directory goes.
 *
 * Safe to run twice: it lists the bucket first and skips what is already there
 * at the same size.
 *
 * Goes through Storage's REST API on the service key rather than the S3
 * endpoint the site uses. Both write the same objects to the same bucket, and
 * this way a one-off migration needs no credentials beyond the ones already in
 * `.env` — the S3 access keys exist for Payload at runtime, not for this.
 */
import fs from "node:fs/promises";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const DIR = path.resolve(process.cwd(), "media");

const need = (name) => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. This reads the same .env the site does.`);
    process.exit(1);
  }
  return value;
};

const BUCKET = need("S3_BUCKET");
const BASE = `${need("NEXT_PUBLIC_SUPABASE_URL")}/storage/v1`;
const KEY = need("SUPABASE_SECRET_KEY");
const auth = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/** Content types Payload's media collection accepts. */
const TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

/** Everything already in the bucket, by name, with its size. */
const listRemote = async () => {
  const found = new Map();
  let offset = 0;
  for (;;) {
    const r = await fetch(`${BASE}/object/list/${BUCKET}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 100, offset }),
    });
    if (!r.ok) throw new Error(`listing the bucket failed (${r.status}): ${await r.text()}`);
    const page = await r.json();
    for (const o of page) found.set(o.name, o.metadata?.size);
    if (page.length < 100) break;
    offset += page.length;
  }
  return found;
};

const main = async () => {
  const local = (await fs.readdir(DIR, { withFileTypes: true }))
    .filter((e) => e.isFile() && !e.name.startsWith("."))
    .map((e) => e.name);

  if (!local.length) {
    console.log(`Nothing in ${DIR}.`);
    return;
  }

  const remote = await listRemote();
  console.log(`local: ${local.length} file(s)   bucket "${BUCKET}": ${remote.size}\n`);

  let uploaded = 0;
  let skipped = 0;
  for (const name of local.sort()) {
    const file = path.join(DIR, name);
    const { size } = await fs.stat(file);

    if (remote.get(name) === size) {
      skipped += 1;
      continue;
    }

    const type = TYPES[path.extname(name).toLowerCase()];
    if (!type) {
      // Guessing here would store a portrait as application/octet-stream, and
      // the browser would offer to download it instead of painting it.
      console.log(`  ?  ${name} — unrecognised extension, left alone`);
      continue;
    }

    if (!WRITE) {
      console.log(`  +  ${name} (${(size / 1024).toFixed(0)} KB)`);
      uploaded += 1;
      continue;
    }

    const r = await fetch(`${BASE}/object/${BUCKET}/${encodeURIComponent(name)}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": type },
      body: await fs.readFile(file),
    });
    if (!r.ok) throw new Error(`${name} failed (${r.status}): ${await r.text()}`);
    console.log(`  ↑  ${name} (${(size / 1024).toFixed(0)} KB)`);
    uploaded += 1;
  }

  console.log(
    `\n${WRITE ? "uploaded" : "would upload"} ${uploaded}, already present ${skipped}`,
  );
  if (!WRITE && uploaded) console.log("Re-run with --write to do it.");
};

main().catch((error) => {
  console.error(`\nFailed: ${error.message}`);
  console.error(`Check that the bucket "${BUCKET}" exists under Supabase → Storage.`);
  process.exit(1);
});
