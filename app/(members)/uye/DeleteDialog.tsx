"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  deleteAnnouncement,
  deleteEvent,
  type FormState,
} from "../_actions/board";

const INITIAL: FormState = { status: "idle" };

type DeleteAction = (
  previous: FormState,
  formData: FormData,
) => Promise<FormState>;

/**
 * What each kind of thing costs to remove, said before it is removed. The
 * event note names the attendance rows because deleting an event takes them
 * with it, and nobody would guess that from a button.
 */
const KINDS: Record<
  "announcement" | "event",
  { action: DeleteAction; heading: string; note: string }
> = {
  announcement: {
    action: deleteAnnouncement,
    heading: "Duyuruyu sil",
    note: "Duyuru kalıcı olarak silinir. Geri alınamaz.",
  },
  event: {
    action: deleteEvent,
    heading: "Etkinliği sil",
    note: "Etkinlik ve ona verilen bütün katılım yanıtları kalıcı olarak silinir. Geri alınamaz.",
  },
};

/**
 * A board-only delete, behind a confirmation.
 *
 * A native `<dialog>` opened with `showModal()`, the same as the public site's
 * menu: the focus trap, Escape to dismiss, the inert background and focus
 * returning to the button afterwards are all the platform's, not ours. On
 * opening, focus lands on `Vazgeç` because it is first in the source — the
 * safe answer should be the one already under the cursor.
 *
 * It needs JavaScript, which for this one control is a feature rather than a
 * compromise: a delete that fires from an unhydrated page is a delete nobody
 * confirmed.
 */
export function DeleteDialog({
  kind,
  id,
  title,
}: {
  kind: "announcement" | "event";
  id: string;
  title: string;
}) {
  const { action, heading, note } = KINDS[kind];
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const dialog = useRef<HTMLDialogElement>(null);

  // On success the row is revalidated away and takes this dialog with it, but
  // closing first keeps the modal from blinking out mid-teardown.
  useEffect(() => {
    if (state.status === "ok") dialog.current?.close();
  }, [state.status]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="eyebrow text-foreground/30 transition-colors hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        Sil
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={`sil-${id}`}
        className="m-auto w-[min(30rem,88vw)] border border-foreground/25 bg-paper p-0 text-foreground backdrop:bg-ink/50"
      >
        <form action={formAction} className="p-8 sm:p-10">
          <input type="hidden" name="id" value={id} />

          <p className="eyebrow text-destructive">{heading}</p>

          {/* The thing itself, at the scale the page gives it, so there is no
              doubt which row this is about. */}
          <p
            id={`sil-${id}`}
            className="font-editorial mt-5 text-2xl italic leading-tight"
          >
            {title}
          </p>

          <p className="mt-4 text-sm font-light leading-relaxed text-foreground/65">
            {note}
          </p>

          {state.status === "error" && (
            <p
              role="alert"
              className="mt-5 border-l-2 border-destructive pl-4 text-sm text-destructive"
            >
              {state.message}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="eyebrow text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={pending}
              className="eyebrow bg-destructive px-6 py-3 text-destructive-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destructive disabled:opacity-50"
            >
              {pending ? "Siliniyor…" : "Sil"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
