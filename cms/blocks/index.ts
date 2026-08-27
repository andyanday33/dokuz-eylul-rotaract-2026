import type { Block, Field } from "payload";
import type { PanelText } from "../labels";

/**
 * The sections a page can be built out of, in the order the site tells its
 * story — which is the order the home page already numbers them in, 01 to 08.
 *
 * This list is the contract. Two things are checked against it:
 *
 *   * `components/blocks/registry.tsx` maps every slug here to what renders
 *     it, as a `Record` keyed by the union below. Adding a block without
 *     giving it a component is a type error, not a blank section.
 *   * The `layout` field on `pages` offers exactly these, in this order, in
 *     the "Add block" menu.
 *
 * Every block starts with no fields of its own. That is deliberate rather than
 * unfinished: at this stage the builder decides which sections a page has and
 * in what order, while the words still come from the dictionaries and the
 * people from their collections. Each section's content moves in here one at a
 * time — and when a block's fields outgrow a line or two, it earns its own
 * file in this directory and this list keeps only the reference.
 *
 * Blocks are named explicitly for the same reason collections are: Payload
 * would otherwise singularise `areas-of-focus` into "Areas Of Foci".
 */
const section = <const Slug extends string>(args: {
  slug: Slug;
  /** The name of the generated TypeScript type for this block's data. */
  interfaceName: string;
  /** Shown in the "Add block" menu and on the collapsed row. */
  label: PanelText;
  fields?: Field[];
}) => ({
  slug: args.slug,
  interfaceName: args.interfaceName,
  // A block is only ever named one at a time — in the menu, and on its own
  // row — so the plural would never be read.
  labels: { singular: args.label, plural: args.label },
  fields: args.fields ?? [],
});

export const LAYOUT_BLOCKS = [
  section({
    slug: "hero",
    interfaceName: "HeroBlock",
    label: { en: "Hero", tr: "Açılış" },
  }),
  section({
    slug: "sliding-text",
    interfaceName: "SlidingTextBlock",
    label: { en: "Sliding Wordmark", tr: "Kayan Logo" },
  }),
  section({
    slug: "marquee",
    interfaceName: "MarqueeBlock",
    label: { en: "Marquee", tr: "Kayan Şerit" },
  }),
  section({
    slug: "about",
    interfaceName: "AboutBlock",
    label: { en: "About", tr: "Biz Kimiz" },
  }),
  section({
    slug: "numbers",
    interfaceName: "NumbersBlock",
    label: { en: "By the Numbers", tr: "Rakamlarla" },
  }),
  section({
    slug: "four-way-test",
    interfaceName: "FourWayTestBlock",
    label: { en: "Four-Way Test", tr: "Dörtlü Öz Denetim" },
  }),
  section({
    slug: "presidents-message",
    interfaceName: "PresidentsMessageBlock",
    label: { en: "President's Message", tr: "Başkanın Mesajı" },
  }),
  section({
    slug: "past-presidents",
    interfaceName: "PastPresidentsBlock",
    label: { en: "Past Presidents", tr: "Geçmiş Dönem Başkanları" },
  }),
  section({
    slug: "board",
    interfaceName: "BoardBlock",
    label: { en: "Board", tr: "Yönetim Kurulu" },
  }),
  section({
    slug: "committees",
    interfaceName: "CommitteesBlock",
    label: { en: "Committees", tr: "Komite Başkanları" },
  }),
  section({
    slug: "areas-of-focus",
    interfaceName: "AreasOfFocusBlock",
    label: { en: "Areas of Focus", tr: "Öncelikli Alanlar" },
  }),
  section({
    slug: "join",
    interfaceName: "JoinBlock",
    label: { en: "Join", tr: "Bize Katıl" },
  }),
];

/**
 * That the list is made of valid Payload blocks, checked separately.
 *
 * Deliberately not `satisfies Block[]` on the array itself: `Block["slug"]` is
 * `string`, and as a contextual type it widens every slug above from its own
 * literal to `string`. The union below would then collapse to `string`, the
 * renderer map keyed on it would become an index signature, and the one thing
 * this file exists to guarantee — that every block has a component — would
 * quietly stop being checked while still looking as though it were.
 */
const _blocksAreValid: Block[] = LAYOUT_BLOCKS;
void _blocksAreValid;

/** Every slug in the list above, as a union. */
export type LayoutBlockSlug = (typeof LAYOUT_BLOCKS)[number]["slug"];

export const LAYOUT_BLOCK_SLUGS = LAYOUT_BLOCKS.map(
  (b) => b.slug,
) as LayoutBlockSlug[];
