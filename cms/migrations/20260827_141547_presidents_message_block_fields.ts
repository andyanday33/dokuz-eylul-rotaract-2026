import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."pages_blocks_presidents_message_opening_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_presidents_message_opening_paragraphs_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_presidents_message_closing_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_presidents_message_closing_paragraphs_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_presidents_message_manifesto" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_presidents_message_manifesto_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."pages_blocks_presidents_message_locales" (
  	"eyebrow" varchar NOT NULL,
  	"watermark" varchar NOT NULL,
  	"heading" varchar NOT NULL,
  	"margin_dateline" varchar,
  	"seal_text" varchar NOT NULL,
  	"salutation" varchar NOT NULL,
  	"pull_quote" varchar NOT NULL,
  	"valediction" varchar NOT NULL,
  	"sign_off" varchar NOT NULL,
  	"signature_credit" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "payload"."pages_blocks_presidents_message" ADD COLUMN "portrait_id" integer NOT NULL;
  ALTER TABLE "payload"."pages_blocks_presidents_message_opening_paragraphs" ADD CONSTRAINT "pages_blocks_presidents_message_opening_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_presidents_message"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_presidents_message_opening_paragraphs_locales" ADD CONSTRAINT "pages_blocks_presidents_message_opening_paragraphs_locale_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_presidents_message_opening_paragraphs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_presidents_message_closing_paragraphs" ADD CONSTRAINT "pages_blocks_presidents_message_closing_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_presidents_message"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_presidents_message_closing_paragraphs_locales" ADD CONSTRAINT "pages_blocks_presidents_message_closing_paragraphs_locale_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_presidents_message_closing_paragraphs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_presidents_message_manifesto" ADD CONSTRAINT "pages_blocks_presidents_message_manifesto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_presidents_message"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_presidents_message_manifesto_locales" ADD CONSTRAINT "pages_blocks_presidents_message_manifesto_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_presidents_message_manifesto"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."pages_blocks_presidents_message_locales" ADD CONSTRAINT "pages_blocks_presidents_message_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages_blocks_presidents_message"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_presidents_message_opening_paragraphs_order_idx" ON "payload"."pages_blocks_presidents_message_opening_paragraphs" USING btree ("_order");
  CREATE INDEX "pages_blocks_presidents_message_opening_paragraphs_parent_id_idx" ON "payload"."pages_blocks_presidents_message_opening_paragraphs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_presidents_message_opening_paragraphs_locales_l" ON "payload"."pages_blocks_presidents_message_opening_paragraphs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_presidents_message_closing_paragraphs_order_idx" ON "payload"."pages_blocks_presidents_message_closing_paragraphs" USING btree ("_order");
  CREATE INDEX "pages_blocks_presidents_message_closing_paragraphs_parent_id_idx" ON "payload"."pages_blocks_presidents_message_closing_paragraphs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_presidents_message_closing_paragraphs_locales_l" ON "payload"."pages_blocks_presidents_message_closing_paragraphs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_presidents_message_manifesto_order_idx" ON "payload"."pages_blocks_presidents_message_manifesto" USING btree ("_order");
  CREATE INDEX "pages_blocks_presidents_message_manifesto_parent_id_idx" ON "payload"."pages_blocks_presidents_message_manifesto" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_presidents_message_manifesto_locales_locale_par" ON "payload"."pages_blocks_presidents_message_manifesto_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_presidents_message_locales_locale_parent_id_uni" ON "payload"."pages_blocks_presidents_message_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload"."pages_blocks_presidents_message" ADD CONSTRAINT "pages_blocks_presidents_message_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_presidents_message_portrait_idx" ON "payload"."pages_blocks_presidents_message" USING btree ("portrait_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."pages_blocks_presidents_message_opening_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_presidents_message_opening_paragraphs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_presidents_message_closing_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_presidents_message_closing_paragraphs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_presidents_message_manifesto" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_presidents_message_manifesto_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."pages_blocks_presidents_message_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."pages_blocks_presidents_message_opening_paragraphs" CASCADE;
  DROP TABLE "payload"."pages_blocks_presidents_message_opening_paragraphs_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_presidents_message_closing_paragraphs" CASCADE;
  DROP TABLE "payload"."pages_blocks_presidents_message_closing_paragraphs_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_presidents_message_manifesto" CASCADE;
  DROP TABLE "payload"."pages_blocks_presidents_message_manifesto_locales" CASCADE;
  DROP TABLE "payload"."pages_blocks_presidents_message_locales" CASCADE;
  ALTER TABLE "payload"."pages_blocks_presidents_message" DROP CONSTRAINT "pages_blocks_presidents_message_portrait_id_media_id_fk";
  
  DROP INDEX "payload"."pages_blocks_presidents_message_portrait_idx";
  ALTER TABLE "payload"."pages_blocks_presidents_message" DROP COLUMN "portrait_id";`)
}
