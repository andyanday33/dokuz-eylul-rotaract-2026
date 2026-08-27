/**
 * What the admin panel calls things.
 *
 * Payload derives a collection's labels from its slug, and its singulariser
 * treats those slugs as English: `areas-of-focus` came out as "Areas Of Foci",
 * and `media` as "Medium". Both are words the club would never use about its
 * own site, so every collection names itself here instead of being guessed at.
 *
 * Each label is a map keyed by admin-panel language rather than a bare string.
 * The panel opens in Turkish (see `i18n` in `payload.config.ts`) because the
 * people using it are the board, but it can be switched, and the wording
 * should follow rather than sit in one language while the buttons move.
 */
export type PanelText = Record<"en" | "tr", string>;

/** The two shelves the sidebar is divided into. */
export const GROUPS: Record<"content" | "administration", PanelText> = {
  content: { en: "Content", tr: "İçerik" },
  administration: { en: "Administration", tr: "Yönetim" },
};
