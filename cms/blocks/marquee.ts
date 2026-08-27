import type { Field } from "payload";

/**
 * The band of words that travels under the masthead.
 *
 * Three things here, and one deliberate omission. The words and the mark
 * between them are content. The pace is a field too — for a thing whose whole
 * behaviour is movement, speed is the one setting worth having, and it is
 * cheap to offer because the stylesheet reads it as a variable.
 *
 * What is *not* offered is how many times the strip repeats. The track is
 * rendered three times and the keyframe slides it exactly one third of its
 * width, which is what makes the loop seamless; the two numbers are one
 * decision written in two places, and an editor changing one of them would
 * only produce a visible jump. It stays in the component. See `REPEATS` in
 * `components/Marquee.tsx`.
 */
export const marqueeFields: Field[] = [
  {
    name: "items",
    type: "array",
    required: true,
    minRows: 1,
    labels: {
      singular: { en: "Phrase", tr: "İfade" },
      plural: { en: "Phrases", tr: "İfadeler" },
    },
    admin: {
      description:
        "Şeritte dönen kelimeler, sırayla. Kısa tutun — hepsi tek satırda akar.",
    },
    fields: [{ name: "text", type: "text", required: true, localized: true }],
  },
  {
    type: "row",
    fields: [
      {
        name: "separator",
        type: "text",
        defaultValue: "✦",
        admin: {
          width: "50%",
          description:
            "İfadeleri ayıran işaret. Boş bırakılırsa yalnızca boşluk kalır.",
        },
      },
      {
        name: "speedSeconds",
        type: "number",
        required: true,
        defaultValue: 20,
        min: 5,
        max: 180,
        admin: {
          width: "50%",
          description:
            "Şeridin bir turu kaç saniye sürsün. Büyük sayı daha yavaş demektir.",
        },
      },
    ],
  },
];
