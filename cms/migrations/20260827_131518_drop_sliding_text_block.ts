import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."pages_blocks_sliding_text" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."pages_blocks_sliding_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  ALTER TABLE "payload"."pages_blocks_sliding_text" ADD CONSTRAINT "pages_blocks_sliding_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_sliding_text_order_idx" ON "payload"."pages_blocks_sliding_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_sliding_text_parent_id_idx" ON "payload"."pages_blocks_sliding_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sliding_text_path_idx" ON "payload"."pages_blocks_sliding_text" USING btree ("_path");`)
}
