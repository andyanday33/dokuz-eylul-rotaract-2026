import type { Field } from "payload";

/**
 * The wheel of board members.
 *
 * Three owners meet in this section, and the split is the design:
 *
 *   * **This block** holds the words around the wheel — the heading, the
 *     introduction, the mark at its centre.
 *   * **The `board-members` collection** holds who sits in each seat, and
 *     their portraits. The geometry is computed from however many it returns,
 *     so a sixth seat re-spaces the orbit rather than overflowing it.
 *   * **The dictionaries** still hold the role *titles* — "Başkan",
 *     "President" — under `board.roles`, keyed to `cms/roles.ts`. Those did
 *     not move with the rest of the copy, deliberately: a role's title belongs
 *     to the role, not to the page it happens to be shown on, and it is the
 *     same word on every page that ever lists the board. `cms/roles.ts`
 *     type-checks its keys against that map, so a renamed role breaks the
 *     build instead of rendering `undefined` beside somebody's face.
 *
 * The term on the centre mark is not here either — it is read off the head of
 * the roll, because the board serves the sitting president's Rotary year.
 */
export const boardFields: Field[] = [
  {
    name: "eyebrow",
    type: "text",
    required: true,
    localized: true,
    admin: { description: "Bölüm başlığı." },
  },
  {
    name: "heading",
    type: "textarea",
    required: true,
    localized: true,
    admin: { description: "Büyük puntolu başlık." },
  },
  {
    name: "intro",
    type: "textarea",
    required: true,
    localized: true,
    admin: { description: "Başlığın altındaki giriş cümlesi." },
  },
  {
    type: "row",
    fields: [
      {
        name: "centreLabel",
        type: "text",
        required: true,
        localized: true,
        admin: {
          width: "50%",
          description:
            "Çarkın ortasındaki yazı. Altındaki dönem başkanlar listesinden gelir.",
        },
      },
      {
        name: "arrowLabel",
        type: "text",
        required: true,
        localized: true,
        admin: {
          width: "50%",
          description: "Dönen okun üstündeki yazı.",
        },
      },
    ],
  },
  {
    type: "collapsible",
    label: { en: "Accessibility", tr: "Erişilebilirlik" },
    admin: {
      description:
        "Ekranda görünmeyen, ekran okuyucuların okuduğu yazılar. Boş bırakmayın.",
    },
    fields: [
      {
        name: "portraitAlt",
        type: "text",
        required: true,
        localized: true,
        admin: {
          description:
            "Portrelerin alternatif metni. {name} yazdığınız yere kişinin adı gelir — bu işareti silmeyin.",
        },
        validate: (value: string | null | undefined) =>
          (value ?? "").includes("{name}") ||
          "Metin {name} içermelidir — yoksa bütün portreler aynı şeyi söyler.",
      },
      {
        type: "row",
        fields: [
          {
            name: "prevLabel",
            type: "text",
            required: true,
            localized: true,
            admin: { width: "50%", description: "Geri düğmesi." },
          },
          {
            name: "nextLabel",
            type: "text",
            required: true,
            localized: true,
            admin: { width: "50%", description: "İleri düğmesi." },
          },
        ],
      },
    ],
  },
];
