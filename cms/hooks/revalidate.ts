import { revalidatePath } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import { LOCALES } from "../../i18n/config";
import { HOME_PATH } from "../home";

/**
 * Pushes an edit out to the public site.
 *
 * The site's pages are rendered ahead of time, so without this an editor would
 * save a new board member and see nothing change until the next deploy. Every
 * collection with a hook attached feeds the home page, and the roll of
 * presidents additionally has a page of its own; revalidating both for both
 * locales is four paths, which is cheaper to do unconditionally than to work
 * out which one a given document touched.
 *
 * Content also changes outside a browser — `scripts/seed-cms.ts` runs under
 * `payload run`, with no Next request in scope for `revalidatePath` to act on.
 * That throw is the expected case there, not a failure: a script that just
 * populated an empty database has no cached page to invalidate, and letting it
 * propagate would fail the seed after the write had already landed.
 */
const revalidate = (paths: string[]) => {
  try {
    for (const locale of LOCALES)
      for (const path of paths) revalidatePath(`/${locale}${path}`);
  } catch {
    // No request context — a CLI script rather than the admin panel.
  }
};

const revalidateSite = () => revalidate(["", "/presidents"]);

/**
 * A page document's `path` is not its address.
 *
 * The home page is stored as a page at `home` but answers at `/tr` and `/en` —
 * `app/(site)/[lang]/page.tsx` asks for it by name and the catch-all refuses
 * it, so `/tr/home` is a 404 with no cache entry behind it. Revalidating the
 * stored path would clear nothing and leave the one page everybody sees
 * serving its build-time render until the next deploy.
 */
const addressOf = (path: string) => (path === HOME_PATH ? "" : `/${path}`);

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidateSite();
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateSite();
  return doc;
};

/** The pair, ready to spread into a collection's `hooks`. */
export const revalidation = {
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
};

/**
 * A page revalidates its own address rather than the fixed set above.
 *
 * `previousDoc` matters here: renaming a page's path leaves the old URL
 * cached and still serving, so both are cleared. Payload passes it on an
 * update and leaves it undefined on a create, where there is no old path.
 */
export const revalidatePage: CollectionAfterChangeHook &
  CollectionAfterDeleteHook = ({ doc, ...rest }) => {
  const previous = (rest as { previousDoc?: { path?: string } }).previousDoc;
  const paths = new Set<string>();
  for (const path of [doc?.path, previous?.path])
    if (typeof path === "string" && path) paths.add(addressOf(path));
  revalidate([...paths]);
  return doc;
};
