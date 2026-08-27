import type { CollectionConfig } from "payload";
import { FOCUS_AREAS, optionsFrom } from "../roles";
import { anyone, editorsOnly } from "../access";
import { revalidation } from "../hooks/revalidate";

/**
 * Rotary's seven areas of focus, as the site sets them.
 *
 * The section names each cause twice — the name it goes by here at full
 * scale, and the name in the other language in small caps above. That second
 * name is not a field: it is the same document read in the other locale, which
 * is what `localized: true` already stores. Querying with `locale: "all"`
 * hands back both at once, so the pairing can never drift the way two
 * hand-kept columns would.
 *
 * There is no ordering field. The seven are a global programme with a settled
 * order, so it lives in `FOCUS_AREAS` and the query sorts on it — editors
 * write the copy, not the running order.
 */
export const AreasOfFocus: CollectionConfig = {
  slug: "areas-of-focus",
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  hooks: revalidation,
  admin: {
    useAsTitle: "title",
    defaultColumns: ["key", "title"],
    group: "İçerik",
    description: "Rotary'nin yedi öncelikli alanı.",
  },
  fields: [
    {
      name: "key",
      type: "select",
      required: true,
      unique: true,
      index: true,
      options: optionsFrom(FOCUS_AREAS),
      admin: { description: "Sıralamayı bu anahtar belirler; değiştirilmez." },
    },
    { name: "title", type: "text", required: true, localized: true },
    { name: "body", type: "textarea", required: true, localized: true },
  ],
};
