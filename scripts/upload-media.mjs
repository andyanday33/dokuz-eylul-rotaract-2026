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
 */
import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
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
const client = new S3Client({
  endpoint: `${need("NEXT_PUBLIC_SUPABASE_URL")}/storage/v1/s3`,
  region: need("S3_REGION"),
  credentials: {
    accessKeyId: need("S3_ACCESS_KEY_ID"),
    secretAccessKey: need("S3_SECRET_ACCESS_KEY"),
  },
  forcePathStyle: true,
});

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

/** Everything already in the bucket, by key, with its size. */
const listRemote = async () => {
  const found = new Map();
  let token;
  do {
    const page = await client.send(
      new ListObjectsV2Command({ Bucket: BUCKET, ContinuationToken: token }),
    );
    for (const o of page.Contents ?? []) found.set(o.Key, o.Size);
    token = page.NextContinuationToken;
  } while (token);
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

    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: name,
        Body: await fs.readFile(file),
        ContentType: type,
      }),
    );
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
  if (error.name === "NoSuchBucket") {
    console.error(`Create the bucket "${BUCKET}" in Supabase → Storage first.`);
  }
  if (error.name === "InvalidAccessKeyId" || error.name === "SignatureDoesNotMatch") {
    console.error("Check the S3 access keys under Supabase → Storage → S3 Access Keys.");
  }
  process.exit(1);
});
