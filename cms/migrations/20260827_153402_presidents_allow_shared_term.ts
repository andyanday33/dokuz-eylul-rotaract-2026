import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "payload"."presidents_term_idx";
  CREATE INDEX "presidents_term_idx" ON "payload"."presidents" USING btree ("term");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "payload"."presidents_term_idx";
  CREATE UNIQUE INDEX "presidents_term_idx" ON "payload"."presidents" USING btree ("term");`)
}
