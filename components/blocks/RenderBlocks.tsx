import { Fragment } from "react";
import { BLOCK_RENDERERS, type LayoutBlock } from "./registry";

/**
 * Draws a page's sections, top to bottom, in the order they were arranged.
 *
 * An unrecognised `blockType` is skipped rather than thrown on. The rows in
 * the database outlive the code that reads them: removing a block from
 * `cms/blocks` leaves every page that used it holding a row nobody can render,
 * and a page that loses one section is a better failure than a page that
 * 500s — the gap is visible in a way that says which section went missing.
 */
export const RenderBlocks = ({ layout }: { layout: LayoutBlock[] }) => (
  <>
    {layout.map((block, i) => {
      const render = BLOCK_RENDERERS[block.blockType];
      if (!render) return null;
      // Each renderer is typed against its own block, which is what makes the
      // registry useful as blocks gain fields — but TypeScript cannot see that
      // `render` and `block` were selected by the same slug, so the pairing is
      // asserted once, here, rather than weakening every entry above.
      return (
        <Fragment key={block.id ?? i}>{render(block as never)}</Fragment>
      );
    })}
  </>
);
