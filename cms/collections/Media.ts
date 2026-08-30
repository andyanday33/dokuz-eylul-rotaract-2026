import type { CollectionConfig } from "payload";
import { GROUPS } from "../labels";
import path from "path";
import { anyone, editorsOnly } from "../access";
import { revalidation } from "../hooks/revalidate";

/**
 * Uploads — portraits, for now.
 *
 * The bytes live in Supabase Storage — see the `s3Storage` plugin in
 * payload.config.ts — but the URLs do not change: Payload still serves each
 * file from `/api/media/file/<name>` and fetches it from the bucket behind
 * that. So this collection is unchanged by the move, which is what the note
 * that used to sit here predicted.
 *
 * `staticDir` is left in place but is no longer where anything ends up: the
 * plugin sets `disableLocalStorage`, so the bytes go to the bucket instead.
 * It costs nothing to keep and is the one line to revisit if the storage
 * adapter is ever removed.
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
          "Görme engelli ziyaretçiler için açıklama. Portreler için boş bırakın — kişinin adından üretilir. Logo gibi kendi başına anlam taşıyan görsellerde doldurun.",
      },
    },
  ],
};
