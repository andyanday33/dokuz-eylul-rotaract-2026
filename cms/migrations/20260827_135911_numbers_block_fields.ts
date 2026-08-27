import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."pages_blocks_numbers_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_numbers_stats_locales" (
  	"big" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_numbers_locales" (
  	"eyebrow" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "payload"."pages_blocks_numbers_stats" ADD CONSTRAINT "pages_blocks_numbers_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_numbers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_numbers_stats_locales" ADD CONSTRAINT "pages_blocks_numbers_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_numbers_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_numbers_locales" ADD CONSTRAINT "pages_blocks_numbers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_numbers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_numbers_stats_order_idx" ON "payload"."pages_blocks_numbers_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_numbers_stats_parent_id_idx" ON "payload"."pages_blocks_numbers_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_numbers_stats_locales_locale_parent_id_unique" ON "payload"."pages_blocks_numbers_stats_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_numbers_locales_locale_parent_id_unique" ON "payload"."pages_blocks_numbers_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."pages_blocks_numbers_stats" CASCADE;
  DROP TABLE "payload"."pages_blocks_numbers_stats_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_numbers_locales" CASCADE;`)
}
