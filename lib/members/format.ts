/** The members area is Turkish-only, so the locale is a constant, not a prop. */
const dateTime = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

const date = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatDate = (iso: string) => date.format(new Date(iso));

/**
 * `2026-09-14T19:00` — what a `datetime-local` input expects, in Istanbul time.
 *
 * `createEvent` pins what the board types to +03:00, so reading it back has to
 * undo exactly that. Formatting through `sv-SE` is the short way to get
 * `YYYY-MM-DD HH:mm` out of Intl; without the explicit timeZone the server
 * would render the edit form in UTC and every saved event would walk three
 * hours earlier each time somebody opened it.
 */
const dateTimeInput = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export const toDateTimeInput = (iso: string) =>
  dateTimeInput.format(new Date(iso)).replace(" ", "T");
