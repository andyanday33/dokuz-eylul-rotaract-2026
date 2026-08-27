import type { CollectionConfig } from "payload";
import { GROUPS } from "../labels";
import { anyone, editorsOnly } from "../access";
import { revalidation } from "../hooks/revalidate";

/**
 * The club's roll of presidents — one row per president, not per year.
 *
 * A Rotary year runs July to June, which is why a term is written as a span
 * ("2026–27") rather than a single year. Usually one person holds it, and for
 * twenty-seven of the club's terms that is what happened.
 *
 * `term` is deliberately **not** unique. 2013–14 was served by two people, as
 * happens when a president stands down partway and someone finishes the year,
 * and a roll that cannot record that is a roll that quietly loses one of them.
 * The cost is that a term no longer identifies a row, so the sort carries a
 * tiebreaker and everything reading the roll keys on more than the term.
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
  // Newest first. `name` breaks the tie within a shared term so the order is
  // stable between requests rather than whatever the database returns.
  defaultSort: ["-term", "name"],
  fields: [
    {
      name: "term",
      type: "text",
      required: true,
      index: true,
      admin: {
        description:
          'Rotary yılı, en-tire ile: "2026–27". Bir dönemi iki kişi paylaştıysa aynı dönemi iki kayıtta kullanabilirsiniz.',
      },
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
