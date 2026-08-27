import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."pages_blocks_four_way_test_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_four_way_test_items_locales" (
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL,
  	"stamp" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_four_way_test_locales" (
  	"eyebrow" varchar NOT NULL,
  	"meta" varchar,
  	"heading" varchar NOT NULL,
  	"colophon" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "payload"."pages_blocks_four_way_test_items" ADD CONSTRAINT "pages_blocks_four_way_test_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_four_way_test"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_four_way_test_items_locales" ADD CONSTRAINT "pages_blocks_four_way_test_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_four_way_test_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_four_way_test_locales" ADD CONSTRAINT "pages_blocks_four_way_test_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_four_way_test"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_four_way_test_items_order_idx" ON "payload"."pages_blocks_four_way_test_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_four_way_test_items_parent_id_idx" ON "payload"."pages_blocks_four_way_test_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_four_way_test_items_locales_locale_parent_id_un" ON "payload"."pages_blocks_four_way_test_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_four_way_test_locales_locale_parent_id_unique" ON "payload"."pages_blocks_four_way_test_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."pages_blocks_four_way_test_items" CASCADE;
  DROP TABLE "payload"."pages_blocks_four_way_test_items_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_four_way_test_locales" CASCADE;`)
}
