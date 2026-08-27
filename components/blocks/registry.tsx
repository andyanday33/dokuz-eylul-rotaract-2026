import type { ReactNode } from "react";
import type { LayoutBlockSlug } from "@/cms/blocks";
import type { Page } from "@/cms/payload-types";
import { Hero } from "@/components/Hero/Hero";
import { Marquee } from "@/components/Marquee";
import { About } from "@/components/About";
import { Numbers } from "@/components/Numbers";
import { PastPresidents } from "@/components/PastPresidents";
import { Committees } from "@/components/Committees";
import { AreasOfFocus } from "@/components/AreasOfFocus";
import { Join } from "@/components/Join";
import { FourWayTest } from "@/components/FourWayTest";
import { BoardSection, PresidentsMessageSection } from "./sections";

/**
 * One row of a page's `layout`, taken from the generated types rather than
 * described again here — so a field added to a block in `cms/blocks` arrives
 * in the renderer below as soon as `npm run cms:types` has run, instead of
 * needing the same shape written out twice and kept in step by hand.
 */
export type LayoutBlock = Page["layout"][number];

/** The one member of that union that a given slug identifies. */
type BlockOf<Slug extends LayoutBlockSlug> = Extract<
  LayoutBlock,
  { blockType: Slug }
>;

/**
 * What each block in `cms/blocks` actually renders.
 *
 * Keyed by the slug union rather than by `string`, so the two halves of the
 * page builder cannot drift: adding a block to the list without adding it here
 * fails to compile, and a slug here that no block declares is equally an
 * error. That is the whole reason the slug is the seam between them — the
 * Payload config stays free of GSAP and the site's components, and the site
 * stays free of the admin panel, while the compiler holds the join.
 *
 * Each entry is a function returning the element rather than the component
 * itself, because the sections take different props — most take none — and a
 * shared prop type would either lie about them or force twelve rewrites.
 * When a block gains fields, its entry reads them off the `block` it is given.
 */
export type BlockRenderers = {
  [Slug in LayoutBlockSlug]: (block: BlockOf<Slug>) => ReactNode;
};

export const BLOCK_RENDERERS: BlockRenderers = {
  hero: (block) => <Hero block={block} />,
  marquee: (block) => <Marquee block={block} />,
  about: (block) => <About block={block} />,
  numbers: (block) => <Numbers block={block} />,
  "four-way-test": (block) => <FourWayTest block={block} />,
  "presidents-message": (block) => <PresidentsMessageSection block={block} />,
  "past-presidents": () => <PastPresidents />,
  board: () => <BoardSection />,
  committees: () => <Committees />,
  "areas-of-focus": () => <AreasOfFocus />,
  join: () => <Join />,
};
