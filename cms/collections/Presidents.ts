import type { CollectionConfig } from "payload";
import { GROUPS } from "../labels";
import { anyone, editorsOnly } from "../access";
import { revalidation } from "../hooks/revalidate";

/**
 * The club's roll of presidents, one row per Rotary year.
 *
 * A Rotary year runs July to June, which is why a term is written as a span
 * ("2026–27") rather than a single year. The span is also the identity: there
 * is exactly one president per term, so `term` is unique and the roll sorts on
 * it — newest first, no explicit ordering field to keep in step.
 *
 * Nothing here is localized. A name reads the same in every language, and the
 * term is a numeral; translating either would only create two ways to be wrong.
 */
export const Presidents: CollectionConfig = {
  slug: "presidents",
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  hooks: revalidation,
  labels: {
    singular: { en: "President", tr: "Başkan" },
    plural: { en: "Presidents", tr: "Başkanlar" },
  },
  admin: {
    useAsTitle: "term",
    defaultColumns: ["term", "name"],
    group: GROUPS.content,
    description: {
      en: "Every term the club has had, from its founding to now.",
      tr: "Kulübün kuruluşundan bugüne başkanlar listesi.",
    },
  },
  defaultSort: "-term",
  fields: [
    {
      name: "term",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Rotary yılı, en-tire ile: "2026–27".' },
      validate: (value: string | null | undefined) =>
        // En dash, not a hyphen: the site sets these in a typeface where the
        // difference shows, and `shortTerm()` slices on a fixed offset.
        /^\d{4}–\d{2}$/.test(value ?? "") || 'Dönem "2026–27" biçiminde olmalı.',
    },
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: "Ad Soyad." },
    },
  ],
};
