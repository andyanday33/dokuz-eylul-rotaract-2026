import type { Field } from "payload";

/**
 * Rotary's Four-Way Test, set as four stamped articles.
 *
 * The array is pinned to exactly four rows. That is not tidiness: the test has
 * had four questions since 1932 and they are not the club's to add to, and the
 * section is built around it — each article is paired with a plate in
 * `components/FourWayTest.tsx` carrying its Roman numeral and the tilt of its
 * rubber stamp. A fifth row would have no plate to pair with; a third would
 * leave the numbering ending at III.
 *
 * So the wording is content and the numbering is not. An editor rewrites the
 * questions and the verdicts; I, II, III, IV stay where they are.
 */
export const fourWayTestFields: Field[] = [
  {
    type: "row",
    fields: [
      {
        name: "eyebrow",
        type: "text",
        required: true,
        localized: true,
        admin: { width: "50%", description: "Sol üstteki bölüm başlığı." },
      },
      {
        name: "meta",
        type: "text",
        localized: true,
        admin: { width: "50%", description: "Sağ üstteki künye satırı." },
      },
    ],
  },
  {
    name: "heading",
    type: "textarea",
    required: true,
    localized: true,
    admin: { description: "Dört soruyu açan cümle." },
  },
  {
    name: "items",
    type: "array",
    required: true,
    minRows: 4,
    maxRows: 4,
    labels: {
      singular: { en: "Question", tr: "Soru" },
      plural: { en: "Questions", tr: "Sorular" },
    },
    admin: {
      description:
        "Dördü de zorunludur ve sırası sabittir — I, II, III, IV bu sıradan gelir.",
    },
    fields: [
      {
        name: "q",
        type: "text",
        required: true,
        localized: true,
        admin: { description: "Sorunun kendisi." },
      },
      {
        name: "a",
        type: "textarea",
        required: true,
        localized: true,
        admin: { description: "Kulübün bu soruya verdiği karşılık." },
      },
      {
        name: "stamp",
        type: "text",
        required: true,
        localized: true,
        admin: {
          description: "Yuvarlak mühürdeki tek kelime. Kısa tutun — dar bir daire.",
        },
      },
    ],
  },
  {
    name: "colophon",
    type: "text",
    localized: true,
    admin: { description: "Bölümü kapatan alt satır." },
  },
];
