import { requireBoard } from "@/lib/auth/dal";
import { SectionHeading } from "../SectionHeading";
import { BoardTabs } from "./BoardTabs";

/**
 * Board-only. `requireBoard()` sends an ordinary member back to `/uye` rather
 * than showing them a page they cannot use — and the actions behind each form
 * check again for themselves, since hiding a form is not a control.
 */
export default async function YonetimPage() {
  const board = await requireBoard();

  return (
    <>
      <SectionHeading
        label="Yönetim"
        title="Kulüp yönetimi"
        meta={board.title ?? "Yönetim kurulu"}
        intro="Davetler, duyurular ve etkinlikler. Bu sayfayı yalnızca yönetim kurulu görür."
      />

      <BoardTabs />
    </>
  );
}
