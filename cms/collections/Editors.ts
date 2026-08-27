import type { CollectionConfig } from "payload";
import { GROUPS } from "../labels";

/**
 * Who may sign in to `/admin`.
 *
 * Named `editors` rather than `users` because the site already has two other
 * populations of people — `members` in Supabase, and the board — and a
 * collection called "users" would read as though it were one of them. It is
 * not: an editor is an account that maintains public content, nothing more.
 *
 * Payload lets the first account be created without one existing, then falls
 * back to the default access rule (signed in only) for every account after.
 */
export const Editors: CollectionConfig = {
  slug: "editors",
  auth: true,
  labels: {
    singular: { en: "Editor", tr: "Editör" },
    plural: { en: "Editors", tr: "Editörler" },
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "updatedAt"],
    group: GROUPS.administration,
    description: {
      en: "Who can sign in here. No account here reaches the members area.",
      tr: "Buraya kimler girebilir. Bu hesapların hiçbiri üye alanına erişmez.",
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: { description: "Panelde ve içerik geçmişinde görünen ad." },
    },
  ],
};
