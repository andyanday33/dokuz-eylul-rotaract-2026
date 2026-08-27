import type { Field } from "payload";

/**
 * The roll of honour — the terms before the sitting president.
 *
 * The names are not here and will not be. This block holds the words around
 * the list; the list itself is read from the `presidents` collection every
 * time the page renders, newest first, with the head of the roll dropped
 * because that person is in office rather than past. The date span under the
 * nameplate is derived the same way, from the oldest and newest terms on
 * record.
 *
 * That is the whole point of the split: adding a president is one row in
 * Başkanlar, and this section, the board's centre mark, the president's
 * caption and `/[lang]/presidents` all follow from it without anyone editing
 * a page.
 */
export const pastPresidentsFields: Field[] = [
  {
    type: "row",
    fields: [
      {
        name: "index",
        type: "text",
        required: true,
        admin: { width: "25%", description: 'Bölüm numarası — "04".' },
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
    name: "heading",
    type: "textarea",
    required: true,
    localized: true,
    admin: { description: "Bölümün büyük puntolu cümlesi." },
  },
  {
    type: "row",
    fields: [
      {
        name: "seeAll",
        type: "text",
        required: true,
        localized: true,
        admin: {
          width: "60%",
          description: "Tüm başkanlar sayfasına giden bağlantının yazısı.",
        },
      },
      {
        name: "shown",
        type: "number",
        required: true,
        defaultValue: 12,
        min: 1,
        max: 40,
        admin: {
          width: "40%",
          description:
            "Kaç geçmiş dönem listelensin. Tamamı için Tüm başkanlar sayfası var — telefonda uzun bir liste bu bölümü boğar.",
        },
      },
    ],
  },
];
