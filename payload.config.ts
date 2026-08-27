import path from "path";
import { fileURLToPath } from "url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { tr } from "@payloadcms/translations/languages/tr";
import { buildConfig } from "payload";
import sharp from "sharp";

import { DEFAULT_LOCALE, LOCALES } from "./i18n/config";
import { AreasOfFocus } from "./cms/collections/AreasOfFocus";
import { BoardMembers } from "./cms/collections/BoardMembers";
import { CommitteeChairs } from "./cms/collections/CommitteeChairs";
import { Editors } from "./cms/collections/Editors";
import { Media } from "./cms/collections/Media";
import { Pages } from "./cms/collections/Pages";
import { Presidents } from "./cms/collections/Presidents";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Editors.slug,
    importMap: { baseDir: dirname },
    meta: { titleSuffix: "· Dokuz Eylül Rotaract" },
  },

  collections: [
    Pages,
    Presidents,
    BoardMembers,
    CommitteeChairs,
    AreasOfFocus,
    Media,
    Editors,
  ],

  editor: lexicalEditor(),

  /**
   * The panel's own language — buttons, dates, confirmation dialogs — as
   * opposed to `localization` below, which is the two languages the *content*
   * is written in. They are independent: an editor working in Turkish still
   * fills in both the Turkish and the English copy of an area of focus.
   *
   * Turkish first, because the people signing in are the board. English is
   * kept available rather than dropped so the panel is legible to anyone
   * working on the site who does not read Turkish. Collection names follow the
   * choice — see `cms/labels.ts`.
   */
  i18n: {
    supportedLanguages: { tr, en },
    fallbackLanguage: "tr",
  },

  /**
   * The same two locales the public site negotiates, read from the one place
   * that already knows them — adding a language is a change in `i18n/config`
   * and nowhere else. Turkish is the source of truth, so an untranslated
   * field falls back to it rather than rendering empty.
   */
  localization: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    fallback: true,
  },

  /**
   * Payload shares the members area's database but not its schema.
   *
   * `public` is hand-written SQL with a privilege model that took some care
   * (see `supabase/migrations/0001_members.sql`); Payload manages its own
   * tables and would be pushing changes into the same namespace. A separate
   * schema keeps the two migration histories from ever meeting, and keeps
   * Payload's tables out of Supabase's auto-generated REST API, which only
   * exposes `public`.
   */
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
    schemaName: "payload",
    migrationDir: path.resolve(dirname, "cms/migrations"),

    /**
     * Migrations are the only way the schema changes here.
     *
     * Payload's default is to `push` in development — to diff the config
     * against the database on startup and apply whatever is missing. That is
     * a good default when development has its own database. This project has
     * one database, shared by dev and production, so a push is a live schema
     * change nobody recorded: the next `migrate:create` then finds no
     * difference to describe, writes an empty migration, and the change
     * silently never reaches a deploy.
     *
     * It also fires on *every* Payload init, not just `next dev` — including
     * `migrate:create` itself, which is how a migration came to fail with
     * "relation already exists" against the very tables it was written to
     * create.
     *
     * With this off, `npm run dev` no longer picks up a new field on its own:
     * add the field, `npm run cms:migrate:create`, `npm run cms:migrate`.
     */
    push: false,
  }),

  secret: process.env.PAYLOAD_SECRET || "",

  typescript: { outputFile: path.resolve(dirname, "cms/payload-types.ts") },

  sharp,
});
