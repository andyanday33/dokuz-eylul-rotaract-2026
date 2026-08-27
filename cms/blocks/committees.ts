import type { Field } from "payload";

/**
 * The committee chairs, as an accordion.
 *
 * The same three-way split as the board, for the same reasons: this block
 * holds the copy, the `committee-chairs` collection holds who chairs what and
 * their portraits, and the role *titles* — "Kulüp Hizmetleri", "Club Service"
 * — stay in the dictionaries under `committees.roles`, keyed to
 * `cms/roles.ts`. A committee's name belongs to the committee, not to the page
 * listing it, and `cms/roles.ts` type-checks its keys against that map.
 */
export const committeesFields: Field[] = [
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
    name: "portraitAlt",
    type: "text",
    required: true,
    localized: true,
    admin: {
      description:
        "Portrelerin alternatif metni — ekran okuyucular okur. {name} yazdığınız yere kişinin adı gelir; bu işareti silmeyin.",
    },
    validate: (value: string | null | undefined) =>
      (value ?? "").includes("{name}") ||
      "Metin {name} içermelidir — yoksa bütün portreler aynı şeyi söyler.",
  },
];
