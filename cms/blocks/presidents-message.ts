import type { Field } from "payload";

/**
 * The president's letter, set as a broadsheet.
 *
 * The longest block on the site, so it is divided into collapsibles — those
 * nest the panel without nesting the data, which keeps the generated type flat
 * and the field names unprefixed.
 *
 * Two things are deliberately absent. The president's **name** is not a field:
 * it is the head of the roll in the `presidents` collection, and typing it
 * again here is how the signature and the roll come to disagree the first time
 * a term changes hands. Nor is the **term** on the portrait caption, for the
 * same reason — the board's wheel already reads it off the roll, and this now
 * does too.
 *
 * The letter is an array of paragraphs rather than one rich-text field because
 * the first paragraph carries the drop cap. That is a fact about position, and
 * position is something an array has and a blob of prose does not.
 */
export const presidentsMessageFields: Field[] = [
  {
    type: "collapsible",
    label: { en: "Heading", tr: "Başlık" },
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "eyebrow",
            type: "text",
            required: true,
            localized: true,
            admin: { width: "50%", description: "Bölüm başlığı." },
          },
          {
            name: "watermark",
            type: "text",
            required: true,
            localized: true,
            admin: {
              width: "50%",
              description: "Arkadaki dev filigran. Tek kelime.",
            },
          },
        ],
      },
      {
        name: "heading",
        type: "textarea",
        required: true,
        localized: true,
        admin: { description: "Büyük puntolu başlık." },
      },
      {
        name: "marginDateline",
        type: "text",
        localized: true,
        admin: {
          description:
            "Sol kenarda dik duran satır. Geniş ekranlarda görünür.",
        },
      },
    ],
  },
  {
    type: "collapsible",
    label: { en: "Portrait", tr: "Portre" },
    fields: [
      {
        name: "portrait",
        type: "upload",
        relationTo: "media",
        required: true,
        admin: {
          description:
            "Başkanın portresi. Tek bir görsel — iki dilde de aynı kişi. Alternatif metin görselin kendi kaydından gelir.",
        },
      },
      {
        name: "sealText",
        type: "text",
        required: true,
        localized: true,
        admin: {
          description:
            "Dönen mühürdeki yazı. Daire boyunca tekrarlanır; baştaki ve sondaki boşlukları koruyun.",
        },
      },
    ],
  },
  {
    type: "collapsible",
    label: { en: "Letter", tr: "Mektup" },
    fields: [
      {
        name: "salutation",
        type: "textarea",
        required: true,
        localized: true,
        admin: {
          description: "Selamlama. Her satır ayrı bir satır olarak dizilir.",
        },
      },
      {
        name: "openingParagraphs",
        type: "array",
        required: true,
        minRows: 1,
        labels: {
          singular: { en: "Paragraph", tr: "Paragraf" },
          plural: { en: "Paragraphs", tr: "Paragraflar" },
        },
        admin: {
          description:
            "Alıntıdan önceki paragraflar. İlkinin ilk harfi büyük dizilir.",
        },
        fields: [
          { name: "text", type: "textarea", required: true, localized: true },
        ],
      },
      {
        name: "pullQuote",
        type: "text",
        required: true,
        localized: true,
        admin: {
          description: "Mektubun ortasına taşan alıntı. Tırnakları siz koyun.",
        },
      },
      {
        name: "closingParagraphs",
        type: "array",
        required: true,
        minRows: 1,
        labels: {
          singular: { en: "Paragraph", tr: "Paragraf" },
          plural: { en: "Paragraphs", tr: "Paragraflar" },
        },
        admin: { description: "Alıntıdan sonraki paragraflar." },
        fields: [
          { name: "text", type: "textarea", required: true, localized: true },
        ],
      },
      {
        name: "valediction",
        type: "textarea",
        required: true,
        localized: true,
        admin: { description: "Mektubu kapatan, büyük dizilen cümle." },
      },
    ],
  },
  {
    type: "collapsible",
    label: { en: "Signature", tr: "İmza" },
    fields: [
      {
        name: "signOff",
        type: "text",
        required: true,
        localized: true,
        admin: { description: '"Sevgi ve saygılarımla," gibi.' },
      },
      {
        name: "signatureCredit",
        type: "text",
        required: true,
        localized: true,
        admin: {
          description:
            "İmzanın altında, adın yanında duran satır. Ad buraya yazılmaz — başkanlar listesinden gelir.",
        },
      },
    ],
  },
  {
    type: "collapsible",
    label: { en: "Closing band", tr: "Kapanış şeridi" },
    fields: [
      {
        name: "manifesto",
        type: "array",
        required: true,
        minRows: 1,
        labels: {
          singular: { en: "Phrase", tr: "İfade" },
          plural: { en: "Phrases", tr: "İfadeler" },
        },
        admin: {
          description: "Bölümü kapatan kayan şeritteki ifadeler.",
        },
        fields: [
          { name: "text", type: "text", required: true, localized: true },
        ],
      },
    ],
  },
];
