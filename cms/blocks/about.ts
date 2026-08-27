import type { Field } from "payload";

/**
 * The fields behind the "Biz Kimiz" section — the first of the numbered
 * sections, and the first whose copy moved out of the dictionaries.
 *
 * What is localized and what is not is the whole design here. Words are
 * localized; structure is not. So a pillar's `n` ("01") is one field shared by
 * both languages while its title and body are a pair, and the array itself is
 * not localized either — that keeps a pillar one row with two translations
 * rather than two independent lists that can silently fall out of step.
 */
export const aboutFields: Field[] = [
  {
    type: "row",
    fields: [
      {
        name: "index",
        type: "text",
        required: true,
        admin: {
          width: "25%",
          description: 'Bölüm numarası — "01".',
        },
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
          width: "50%",
          description: "Sağdaki künye satırı — yer, tarih.",
        },
      },
      {
        name: "watermark",
        type: "text",
        required: true,
        localized: true,
        admin: {
          width: "50%",
          description: "Arkadaki dev filigran. Tek kelime olmalı.",
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
  {
    name: "pillars",
    type: "array",
    required: true,
    minRows: 1,
    labels: {
      singular: { en: "Pillar", tr: "Sütun" },
      plural: { en: "Pillars", tr: "Sütunlar" },
    },
    admin: { description: "Alt sıradaki sütunlar. Üçü bir satıra sığar." },
    fields: [
      {
        name: "n",
        type: "text",
        required: true,
        admin: { description: 'Sıra numarası — "01". Diller arasında ortaktır.' },
      },
      { name: "title", type: "text", required: true, localized: true },
      { name: "body", type: "textarea", required: true, localized: true },
    ],
  },
];
