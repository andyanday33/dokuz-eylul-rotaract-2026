import type { Field } from "payload";

/**
 * The closing invitation.
 *
 * The address is a field here and also a key in the dictionaries, under
 * `contact.email`, because the navbar carries it on every page including ones
 * with no join section. Two copies of one address is not ideal — see the note
 * in the README about a settings global — but the alternative is a navbar that
 * can only render on pages that happen to end with this block.
 */
export const joinFields: Field[] = [
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
    admin: { description: "Büyük puntolu çağrı." },
  },
  {
    name: "body",
    type: "textarea",
    required: true,
    localized: true,
    admin: { description: "Çağrının altındaki açıklama." },
  },
  {
    name: "email",
    type: "email",
    required: true,
    admin: {
      description:
        "Yazışma adresi. Değiştirirseniz i18n/dictionaries içindeki contact.email de değişmeli — üst menü oradan okur.",
    },
  },
];
