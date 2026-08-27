import type { Field } from "payload";

/**
 * Rotary's seven areas of focus.
 *
 * The seven themselves are not here — they are the `areas-of-focus`
 * collection, translated there, and this block is only the nameplate above
 * them. The set is Rotary's and fixed at seven, which is why the collection
 * has a closed key list in `cms/roles.ts` rather than being a free list.
 *
 * `meta` and `altLang` go together. The nameplate carries the programme's name
 * in the *other* language — "Seven Areas of Focus" above the Turkish page —
 * and `altLang` says which language that is, so `uppercase` cases it by the
 * right rules. Turkish left undeclared on an English page loses its İ.
 */
export const areasOfFocusFields: Field[] = [
  {
    type: "row",
    fields: [
      {
        name: "index",
        type: "text",
        required: true,
        admin: { width: "25%", description: 'Bölüm numarası — "07".' },
      },
      {
        name: "label",
        type: "text",
        required: true,
        localized: true,
        admin: { width: "75%", description: "Numaranın yanındaki başlık." },
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "meta",
        type: "text",
        localized: true,
        admin: {
          width: "70%",
          description: "Sağdaki künye — programın diğer dildeki adı.",
        },
      },
      {
        name: "altLang",
        type: "select",
        required: true,
        localized: true,
        defaultValue: "en",
        options: [
          { label: "Türkçe", value: "tr" },
          { label: "English", value: "en" },
        ],
        admin: {
          width: "30%",
          description: "Künyenin hangi dilde yazıldığı. Büyük harfe çevirmeyi etkiler.",
        },
      },
    ],
  },
  {
    name: "heading",
    type: "textarea",
    required: true,
    localized: true,
    admin: { description: "Bölümün büyük puntolu cümlesi." },
  },
];
