import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."pages" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "payload"."pages" ADD COLUMN "noindex" boolean DEFAULT false;
  ALTER TABLE "payload"."pages_locales" ADD COLUMN "og_title" varchar;
  ALTER TABLE "payload"."pages_locales" ADD COLUMN "og_description" varchar;
  ALTER TABLE "payload"."pages" ADD CONSTRAINT "pages_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_og_image_idx" ON "payload"."pages" USING btree ("og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."pages" DROP CONSTRAINT "pages_og_image_id_media_id_fk";
  
  DROP INDEX "payload"."pages_og_image_idx";
  ALTER TABLE "payload"."pages" DROP COLUMN "og_image_id";
  ALTER TABLE "payload"."pages" DROP COLUMN "noindex";
  ALTER TABLE "payload"."pages_locales" DROP COLUMN "og_title";
  ALTER TABLE "payload"."pages_locales" DROP COLUMN "og_description";`)
}
