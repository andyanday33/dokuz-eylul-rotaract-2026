import { revalidatePath } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import { LOCALES } from "../../i18n/config";

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
const revalidateSite = () => {
  try {
    for (const locale of LOCALES) {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/presidents`);
    }
  } catch {
    // No request context — a CLI script rather than the admin panel.
  }
};

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
