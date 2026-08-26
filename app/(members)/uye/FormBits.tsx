/**
 * The bits every members-area form is built from.
 *
 * Pulled out of the board's own forms once the event form needed to exist in
 * two places at once — new under `/uye/yonetim`, and again under an event's
 * own `/duzenle`. Two copies of a ruled input is how the two pages start
 * drifting apart.
 */

import type { FormState } from "../_actions/board";

export const field =
  "w-full border-b border-foreground/25 bg-transparent pb-2 outline-none transition-colors placeholder:text-foreground/25 focus:border-primary";

export const label = "eyebrow block text-foreground/50";

export const submit =
  "eyebrow self-start bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50";

export function Result({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  return (
    <p
      role="status"
      className={`border-l-2 pl-4 text-sm ${
        state.status === "error"
          ? "border-destructive text-destructive"
          : "border-primary text-foreground/70"
      }`}
    >
      {state.message}
    </p>
  );
}
