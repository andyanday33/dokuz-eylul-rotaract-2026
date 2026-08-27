import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { isLocale, type Dictionary, type Locale } from "./config";

export type { Dictionary };
export { fill } from "./config";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  tr: () => import("./dictionaries/tr.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

/**
 * The locale of the current request, read from the `[lang]` root param, so any
 * server component in the tree can ask for it without prop drilling.
 * An unsupported segment 404s instead of failing at render time.
 */
export const getLocale = async (): Promise<Locale> => {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  return locale;
};

export const getDictionary = async (): Promise<Dictionary> =>
  dictionaries[await getLocale()]();

/**
 * The dictionary for a named locale.
 *
 * For the handful of routes that live outside the `[lang]` tree and so have no
 * root param to read — `/llms.txt`, the sitemap — and which speak about both
 * languages rather than being served in one.
 */
export const dictionaryFor = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
