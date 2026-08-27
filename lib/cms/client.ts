import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";

/**
 * The Payload instance, for reads from Server Components.
 *
 * `getPayload` memoises on the config, so this is a lookup rather than a
 * connection after the first call — it is a function only because the first
 * call has to await initialisation.
 *
 * Everything here goes through the Local API rather than `fetch`ing Payload's
 * REST routes. That skips a network hop the server would be making to itself,
 * and it bypasses access control, which is what a trusted server render wants:
 * the collections are public to read, and the site is not acting for a user.
 */
export const cms = async () => getPayload({ config });
