import type { Field } from "payload";

/**
 * The three figures the club is willing to be measured by.
 *
 * Both halves of a figure are localized, including the number itself. That is
 * a departure from the rule the other blocks follow — a pillar's "01" and a
 * president's term are one value shared by both languages — and the reason is
 * that these are not ordinals but quantities, and quantities are written
 * differently in the two languages: a thousand is "1.000" in Turkish and
 * "1,000" in English. Today both read "1000+" and the distinction costs
 * nothing; the first time a figure needs a separator it would otherwise be
 * wrong in one language with no field to fix it in.
 *
 * Three fit the row the section lays out. A fourth is not prevented — it wraps
 * onto a second row, which the section handles but was not designed around.
 */
export const numbersFields: Field[] = [
  {
    name: "eyebrow",
    type: "text",
    required: true,
    localized: true,
    admin: { description: "Bölümün üstündeki küçük başlık." },
  },
  {
    name: "stats",
    type: "array",
    required: true,
    minRows: 1,
    labels: {
      singular: { en: "Figure", tr: "Rakam" },
      plural: { en: "Figures", tr: "Rakamlar" },
    },
    admin: {
      description: "Rakamlar, soldan sağa. Üçü bir satıra sığar.",
    },
    fields: [
      {
        name: "big",
        type: "text",
        required: true,
        localized: true,
        admin: { description: 'Büyük punto rakam — "1000+".' },
      },
      {
        name: "label",
        type: "text",
        required: true,
        localized: true,
        admin: { description: "Rakamın altındaki açıklama." },
      },
    ],
  },
];
