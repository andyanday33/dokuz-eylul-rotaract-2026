/**
 * The address of the page the site's root renders.
 *
 * The home page is a built page like any other — it is what carries the
 * sections whose copy has moved into the CMS, and it would be strange for the
 * one page everybody sees to be the one page nobody can edit. It is reached at
 * `/tr` and `/en` rather than at this path: `app/(site)/[lang]/page.tsx` asks
 * for it by name, and the catch-all refuses it so that one page does not end
 * up with two addresses.
 *
 * It lives in its own file because both halves need it and neither should
 * import the other — the Payload config must not pull in `server-only` code,
 * and the site must not pull in the admin config.
 */
export const HOME_PATH = "home";
