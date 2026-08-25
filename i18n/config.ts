// Client-safe locale facts. Everything here must stay importable from Client
// Components and from `proxy.ts`, so it must not touch `next/root-params`.

import type trDictionary from "./dictionaries/tr.json";

/**
 * Turkish is the source of truth for the shape: typing the English loader
 * against it makes a missing or renamed key a compile error rather than an
 * `undefined` rendered into the page.
 */
export type Dictionary = typeof trDictionary;

export const LOCALES = ["tr", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** The site was written in Turkish; English is the translation. */
export const DEFAULT_LOCALE: Locale = "tr";

/** Remembers a visitor's explicit choice so `/` lands on it next time. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const isLocale = (value: string | undefined | null): value is Locale =>
  !!value && (LOCALES as readonly string[]).includes(value);

/**
 * Swaps the locale segment of a pathname, e.g. `/tr` + `en` -> `/en`.
 * Every route lives under `/[lang]`, so the first segment is always the locale.
 */
export const withLocale = (pathname: string, locale: Locale) => {
  const [, first, ...rest] = pathname.split("/");
  return isLocale(first)
    ? ["", locale, ...rest].join("/")
    : ["", locale, first, ...rest].filter(Boolean).join("/") || `/${locale}`;
};

/** Endonyms — a language names itself the same way whatever page you're on. */
export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  tr: { short: "TR", name: "Türkçe" },
  en: { short: "EN", name: "English" },
};

/** Fills `{name}`-style slots in a dictionary string. */
export const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
