import type { CollectionConfig } from "payload";
import { COMMITTEE_ROLES, optionsFrom } from "../roles";
import { anyone, editorsOnly } from "../access";
import { revalidation } from "../hooks/revalidate";

/**
 * The seven committee chairs. Same shape as the board and for the same
 * reasons — a keyed role, a translated title in the dictionaries, an explicit
 * order — but a separate collection because the two lists are separate
 * offices, and merging them would mean a discriminator field on every row.
 */
export const CommitteeChairs: CollectionConfig = {
  slug: "committee-chairs",
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  hooks: revalidation,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "order"],
    group: "İçerik",
    description: "Komite başkanları — ana sayfadaki akordeon.",
  },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      unique: true,
      options: optionsFrom(COMMITTEE_ROLES),
      admin: { description: "Komite adı çeviri dosyalarından gelir." },
    },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "order", type: "number", required: true, defaultValue: 0 },
  ],
};
