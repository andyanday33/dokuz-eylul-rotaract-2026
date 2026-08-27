import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."pages_blocks_hero_locales" (
  	"wordmark_id" integer NOT NULL,
  	"dateline_left" varchar NOT NULL,
  	"dateline_right" varchar,
  	"sr_title" varchar NOT NULL,
  	"tagline_lead" varchar NOT NULL,
  	"tagline_accent" varchar NOT NULL,
  	"meeting_note" varchar,
  	"cta" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "payload"."pages_blocks_hero" ADD COLUMN "cta_href" varchar DEFAULT '#join' NOT NULL;
  ALTER TABLE "payload"."pages_blocks_hero_locales" ADD CONSTRAINT "pages_blocks_hero_locales_wordmark_id_media_id_fk" FOREIGN KEY ("wordmark_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_hero_locales" ADD CONSTRAINT "pages_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_wordmark_idx" ON "payload"."pages_blocks_hero_locales" USING btree ("wordmark_id","_locale");
  CREATE UNIQUE INDEX "pages_blocks_hero_locales_locale_parent_id_unique" ON "payload"."pages_blocks_hero_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."pages_blocks_hero_locales" CASCADE;
  ALTER TABLE "payload"."pages_blocks_hero" DROP COLUMN "cta_href";`)
}
