import type { CollectionConfig } from "payload";
import { GROUPS } from "../labels";
import { LAYOUT_BLOCKS } from "../blocks";
import { anyone, editorsOnly } from "../access";
import { revalidatePage } from "../hooks/revalidate";

/**
 * A page assembled from the site's own sections.
 *
 * The sections are not free-form content — they are the components the site is
 * already built out of, offered as an ordered menu (see `cms/blocks`). What an
 * editor composes is which of them a page carries and in what order; what each
 * one *says* stays where it already lives until it is moved deliberately.
 *
 * `path` is the page's address under the locale segment, so a page at
 * `projeler` answers on `/tr/projeler` and `/en/projeler` both. It is not
 * localized: one page is one document with two translations, and giving each
 * language its own address would make it two pages that happen to look alike —
 * and would break the language switcher, which swaps the locale segment and
 * expects the rest of the path to still mean something.
 */
export const Pages: CollectionConfig = {
  slug: "pages",
  labels: {
    singular: { en: "Page", tr: "Sayfa" },
    plural: { en: "Pages", tr: "Sayfalar" },
  },
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  hooks: { afterChange: [revalidatePage], afterDelete: [revalidatePage] },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "path", "updatedAt"],
    group: GROUPS.content,
    description: {
      en: "Pages built from the site's sections.",
      tr: "Sitenin bölümlerinden kurulan sayfalar.",
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      admin: { description: "Sekmede ve arama sonuçlarında görünen başlık." },
    },
    {
      name: "path",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Dil kodundan sonraki adres — "projeler" -> /tr/projeler.',
      },
      validate: (value: string | null | undefined) =>
        // Lower-case, no leading or trailing slash, no spaces. Anything else
        // either collides with a route the app already owns or produces a URL
        // that has to be escaped to be written down.
        /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(value ?? "") ||
        'Adres yalnızca küçük harf, rakam, "-" ve "/" içerebilir.',
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      admin: { description: "Arama sonuçlarındaki özet. Boş bırakılabilir." },
    },
    {
      name: "layout",
      type: "blocks",
      required: true,
      minRows: 1,
      blocks: LAYOUT_BLOCKS,
      labels: {
        singular: { en: "Section", tr: "Bölüm" },
        plural: { en: "Sections", tr: "Bölümler" },
      },
      admin: {
        description:
          "Sayfanın bölümleri, yukarıdan aşağıya. Sürükleyerek sırayı değiştirin.",
      },
    },
  ],
};
