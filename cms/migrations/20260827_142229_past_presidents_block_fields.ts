import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."pages_blocks_past_presidents_locales" (
  	"label" varchar NOT NULL,
  	"heading" varchar NOT NULL,
  	"see_all" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "payload"."pages_blocks_past_presidents" ADD COLUMN "index" varchar NOT NULL;
  ALTER TABLE "payload"."pages_blocks_past_presidents" ADD COLUMN "shown" numeric DEFAULT 12 NOT NULL;
  ALTER TABLE "payload"."pages_blocks_past_presidents_locales" ADD CONSTRAINT "pages_blocks_past_presidents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_past_presidents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_blocks_past_presidents_locales_locale_parent_id_unique" ON "payload"."pages_blocks_past_presidents_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."pages_blocks_past_presidents_locales" CASCADE;
  ALTER TABLE "payload"."pages_blocks_past_presidents" DROP COLUMN "index";
  ALTER TABLE "payload"."pages_blocks_past_presidents" DROP COLUMN "shown";`)
}
