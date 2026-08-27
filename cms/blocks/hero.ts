import type { Field } from "payload";

/**
 * The masthead: the opening screen, and the wordmark that travels out of it.
 *
 * These were two blocks — "Açılış" and "Kayan Logo" — and should not have
 * been. The travelling wordmark measures the hero to know where to sit: it
 * reads `#hero` and the two rules marked up inside it, and centres itself
 * between them. On a page with the wordmark but no hero it would find nothing,
 * place itself nowhere and animate against a trigger that does not exist —
 * silently, because none of that throws. One block cannot be half-added.
 *
 * Every string and the wordmark itself are fields, so the section carries its
 * own content the way `about` does. The one thing that is not a field is where
 * the wordmark ends its travel: that is `--masthead-logo-parked` in
 * `globals.css`, shared with every other masthead on the site so the two
 * cannot drift apart.
 */
export const heroFields: Field[] = [
  {
    name: "wordmark",
    type: "upload",
    relationTo: "media",
    required: true,
    localized: true,
    admin: {
      description:
        "Kulüp logosu. Her dilin kendi dosyası vardır; İngilizce sayfa İngilizce kilidi kullanır. Alternatif metin görselin kendi kaydından gelir.",
    },
  },
  {
    type: "row",
    fields: [
      {
        name: "datelineLeft",
        type: "text",
        required: true,
        localized: true,
        admin: { width: "50%", description: "Üst çizginin solu — bölge, grup." },
      },
      {
        name: "datelineRight",
        type: "text",
        localized: true,
        admin: {
          width: "50%",
          description: "Üst çizginin sağı — yer ve yıl. Geniş ekranlarda görünür.",
        },
      },
    ],
  },
  {
    name: "srTitle",
    type: "text",
    required: true,
    localized: true,
    admin: {
      description:
        "Sayfanın gizli H1'i. Ekranda görünmez; ekran okuyucular ve arama motorları okur.",
    },
  },
  {
    type: "row",
    fields: [
      {
        name: "taglineLead",
        type: "textarea",
        required: true,
        localized: true,
        admin: { width: "70%", description: "Büyük cümlenin düz kısmı." },
      },
      {
        name: "taglineAccent",
        type: "text",
        required: true,
        localized: true,
        admin: {
          width: "30%",
          description: "Cümleyi bitiren, kırmızı dizilen kısım.",
        },
      },
    ],
  },
  {
    name: "meetingNote",
    type: "textarea",
    localized: true,
    admin: { description: "Butonun yanındaki toplantı notu." },
  },
  {
    type: "row",
    fields: [
      {
        name: "cta",
        type: "text",
        required: true,
        localized: true,
        admin: { width: "60%", description: "Buton yazısı." },
      },
      {
        name: "ctaHref",
        type: "text",
        required: true,
        defaultValue: "#join",
        admin: {
          width: "40%",
          description:
            'Butonun hedefi. "#join" aynı sayfadaki Bize Katıl bölümüne iner — o bölüm sayfada yoksa başka bir adres verin.',
        },
      },
    ],
  },
];
