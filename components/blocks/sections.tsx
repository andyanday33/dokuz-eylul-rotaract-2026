import { PresidentsMessage } from "@/components/PresidentsMessage";
import { Board } from "@/components/Board";
import type { PresidentsMessageBlock } from "@/cms/payload-types";
import { getDictionary } from "@/i18n/dictionaries";
import { getBoard, getPresidents } from "@/lib/cms/queries";

/**
 * Server wrappers for the sections that cannot fetch for themselves.
 *
 * Most sections are async Server Components that read what they need — the
 * dictionary, a collection — and can be dropped into a page as they are. These
 * two cannot: they are Client Components, because they animate, so somebody
 * upstream has to hand them their content. That used to be the home page,
 * which is why it knew about the board's seats and the president's name.
 *
 * A page assembled from a list of blocks has no such upstream — the renderer
 * knows a slug and nothing else. So each of these pairs its client component
 * with the fetch it depends on, and the result is a section that can be placed
 * anywhere, like all the others.
 */

export const PresidentsMessageSection = async ({
  block,
}: {
  block: PresidentsMessageBlock;
}) => {
  const roll = await getPresidents();
  return (
    <PresidentsMessage
      block={block}
      name={roll[0]?.name ?? ""}
      term={roll[0]?.term ?? ""}
    />
  );
};

export const BoardSection = async () => {
  const [{ board }, seats, roll] = await Promise.all([
    getDictionary(),
    getBoard(),
    getPresidents(),
  ]);
  // The board serves the same Rotary year as the sitting president, so the
  // term on the wheel's centre mark is read off the head of the roll.
  return <Board board={board} seats={seats} term={roll[0]?.term ?? ""} />;
};
