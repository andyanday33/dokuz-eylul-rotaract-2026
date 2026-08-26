import { Bodoni_Moda, Open_Sans } from "next/font/google";

/**
 * Shared by both root layouts. Kept in one place so the public site and the
 * members area cannot drift onto different cuts of the same two faces.
 *
 * `latin-ext` is not optional here: ş, ğ, İ and ı live in that subset, and
 * without it Turkish text falls back mid-word to whatever the system has.
 */
export const openSans = Open_Sans({
  subsets: ["latin", "latin-ext"],
});

export const bodoni = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});
