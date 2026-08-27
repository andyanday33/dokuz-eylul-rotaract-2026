import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_pages_blocks_areas_of_focus_alt_lang" AS ENUM('tr', 'en');
  CREATE TABLE "payload"."pages_blocks_committees_locales" (
  	"eyebrow" varchar NOT NULL,
  	"heading" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"portrait_alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_areas_of_focus_locales" (
  	"label" varchar NOT NULL,
  	"meta" varchar,
  	"alt_lang" "payload"."enum_pages_blocks_areas_of_focus_alt_lang" DEFAULT 'en' NOT NULL,
  	"heading" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_join_locales" (
  	"eyebrow" varchar NOT NULL,
  	"watermark" varchar NOT NULL,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "payload"."pages_blocks_areas_of_focus" ADD COLUMN "index" varchar NOT NULL;
  ALTER TABLE "payload"."pages_blocks_join" ADD COLUMN "email" varchar NOT NULL;
  ALTER TABLE "payload"."pages_blocks_committees_locales" ADD CONSTRAINT "pages_blocks_committees_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_committees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_areas_of_focus_locales" ADD CONSTRAINT "pages_blocks_areas_of_focus_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_areas_of_focus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_join_locales" ADD CONSTRAINT "pages_blocks_join_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_join"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_blocks_committees_locales_locale_parent_id_unique" ON "payload"."pages_blocks_committees_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_areas_of_focus_locales_locale_parent_id_unique" ON "payload"."pages_blocks_areas_of_focus_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_join_locales_locale_parent_id_unique" ON "payload"."pages_blocks_join_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."pages_blocks_committees_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_areas_of_focus_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_join_locales" CASCADE;
  ALTER TABLE "payload"."pages_blocks_areas_of_focus" DROP COLUMN "index";
  ALTER TABLE "payload"."pages_blocks_join" DROP COLUMN "email";
  DROP TYPE "payload"."enum_pages_blocks_areas_of_focus_alt_lang";`)
}
