import path from "path";
import { fileURLToPath } from "url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { DEFAULT_LOCALE, LOCALES } from "./i18n/config";
import { AreasOfFocus } from "./cms/collections/AreasOfFocus";
import { BoardMembers } from "./cms/collections/BoardMembers";
import { CommitteeChairs } from "./cms/collections/CommitteeChairs";
import { Editors } from "./cms/collections/Editors";
import { Media } from "./cms/collections/Media";
import { Presidents } from "./cms/collections/Presidents";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Editors.slug,
    importMap: { baseDir: dirname },
    meta: { titleSuffix: "· Dokuz Eylül Rotaract" },
  },

  collections: [Presidents, BoardMembers, CommitteeChairs, AreasOfFocus, Media, Editors],

  editor: lexicalEditor(),

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
  }),

  secret: process.env.PAYLOAD_SECRET || "",

  typescript: { outputFile: path.resolve(dirname, "cms/payload-types.ts") },

  sharp,
});
