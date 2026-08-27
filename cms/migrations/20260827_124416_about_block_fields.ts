import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."pages_blocks_about_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"n" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_about_pillars_locales" (
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_about_locales" (
  	"label" varchar NOT NULL,
  	"meta" varchar,
  	"watermark" varchar NOT NULL,
  	"heading" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "payload"."pages_blocks_about" ADD COLUMN "index" varchar NOT NULL;
  ALTER TABLE "payload"."pages_blocks_about_pillars" ADD CONSTRAINT "pages_blocks_about_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_about_pillars_locales" ADD CONSTRAINT "pages_blocks_about_pillars_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_about_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_about_locales" ADD CONSTRAINT "pages_blocks_about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_about"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_about_pillars_order_idx" ON "payload"."pages_blocks_about_pillars" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_pillars_parent_id_idx" ON "payload"."pages_blocks_about_pillars" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_about_pillars_locales_locale_parent_id_unique" ON "payload"."pages_blocks_about_pillars_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_about_locales_locale_parent_id_unique" ON "payload"."pages_blocks_about_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."pages_blocks_about_pillars" CASCADE;
  DROP TABLE "payload"."pages_blocks_about_pillars_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_about_locales" CASCADE;
  ALTER TABLE "payload"."pages_blocks_about" DROP COLUMN "index";`)
}
