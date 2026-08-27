import type { CollectionConfig } from "payload";
import { GROUPS } from "../labels";
import path from "path";
import { anyone, editorsOnly } from "../access";
import { revalidation } from "../hooks/revalidate";

/**
 * Uploads — portraits, for now.
 *
 * Files land in `media/` at the repo root rather than `public/`, because
 * Payload serves them itself from `/api/media/file/<name>`. Putting them under
 * `public/` would mean two URLs for the same byte and a directory that fills
 * up in git.
 *
 * NOTE FOR DEPLOYMENT: this writes to the local filesystem, which is fine in
 * development and on a long-lived server, but not on serverless hosting where
 * the disk is discarded between invocations. Moving to Supabase Storage means
 * adding `@payloadcms/storage-s3` and pointing it at the project's S3 endpoint;
 * nothing else in this collection changes.
 */
export const Media: CollectionConfig = {
  slug: "media",
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  hooks: revalidation,
  // Not "Medium", which is what Payload's singulariser makes of `media`, and
  // not "File" either — the collection only accepts images.
  labels: {
    singular: { en: "Image", tr: "Görsel" },
    plural: { en: "Images", tr: "Görseller" },
  },
  admin: {
    group: GROUPS.administration,
    description: {
      en: "Portraits. Uploaded once, then chosen on a board member or a chair.",
      tr: "Portreler. Bir kez yüklenir, sonra üye ya da komite başkanı üzerinde seçilir.",
    },
  },
  upload: {
    staticDir: path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/*"],
    // Portraits are rendered as squares on the board wheel and the committee
    // slats; one crop covers both, and the original is kept for anything later.
    imageSizes: [{ name: "portrait", width: 800, height: 800, position: "centre" }],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      admin: {
        description:
          "Görme engelli ziyaretçiler için açıklama. Portreler için boş bırakın — kişinin adından üretilir.",
      },
    },
  ],
};
