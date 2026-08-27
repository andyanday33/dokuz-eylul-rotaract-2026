import type { Access } from "payload";

/**
 * Two rules cover every collection here, and the asymmetry is deliberate.
 *
 * `anyone` is safe on the content collections because they hold exactly what
 * the public site already renders — a board member's name and portrait are
 * published the moment they are saved, so hiding them behind the REST API
 * would protect nothing. It is *not* used on `editors`, whose default access
 * (below) keeps the account list to signed-in editors.
 *
 * Writes are all-or-nothing: an editor is trusted with the whole public site.
 * That is a smaller surface than it sounds — the members area is a separate
 * system, governed by row level security in Supabase, and no editor account
 * reaches it. See `supabase/migrations/0001_members.sql`.
 */
export const anyone: Access = () => true;

export const editorsOnly: Access = ({ req }) => Boolean(req.user);
