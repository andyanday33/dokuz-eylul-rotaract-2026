import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."_locales" AS ENUM('tr', 'en');
  CREATE TYPE "payload"."enum_board_members_role" AS ENUM('president', 'vicePresident', 'secretary', 'treasurer', 'pastPresident');
  CREATE TYPE "payload"."enum_committee_chairs_role" AS ENUM('club', 'community', 'vocational', 'international', 'publicImage', 'foundation', 'technology');
  CREATE TYPE "payload"."enum_areas_of_focus_key" AS ENUM('peace', 'disease', 'water', 'maternal', 'education', 'economy', 'environment');
  CREATE TABLE "payload"."presidents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"term" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."board_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "payload"."enum_board_members_role" NOT NULL,
  	"photo_id" integer,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."committee_chairs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "payload"."enum_committee_chairs_role" NOT NULL,
  	"photo_id" integer,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."areas_of_focus" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" "payload"."enum_areas_of_focus_key" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."areas_of_focus_locales" (
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_portrait_url" varchar,
  	"sizes_portrait_width" numeric,
  	"sizes_portrait_height" numeric,
  	"sizes_portrait_mime_type" varchar,
  	"sizes_portrait_filesize" numeric,
  	"sizes_portrait_filename" varchar
  );
  
  CREATE TABLE "payload"."media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "payload"."_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."editors_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload"."editors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"presidents_id" integer,
  	"board_members_id" integer,
  	"committee_chairs_id" integer,
  	"areas_of_focus_id" integer,
  	"media_id" integer,
  	"editors_id" integer
  );
  
  CREATE TABLE "payload"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"editors_id" integer
  );
  
  CREATE TABLE "payload"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."board_members" ADD CONSTRAINT "board_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."committee_chairs" ADD CONSTRAINT "committee_chairs_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."areas_of_focus_locales" ADD CONSTRAINT "areas_of_focus_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."areas_of_focus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."editors_sessions" ADD CONSTRAINT "editors_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."editors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_presidents_fk" FOREIGN KEY ("presidents_id") REFERENCES "payload"."presidents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_board_members_fk" FOREIGN KEY ("board_members_id") REFERENCES "payload"."board_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_committee_chairs_fk" FOREIGN KEY ("committee_chairs_id") REFERENCES "payload"."committee_chairs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_areas_of_focus_fk" FOREIGN KEY ("areas_of_focus_id") REFERENCES "payload"."areas_of_focus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_editors_fk" FOREIGN KEY ("editors_id") REFERENCES "payload"."editors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_editors_fk" FOREIGN KEY ("editors_id") REFERENCES "payload"."editors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "presidents_term_idx" ON "payload"."presidents" USING btree ("term");
  CREATE INDEX "presidents_updated_at_idx" ON "payload"."presidents" USING btree ("updated_at");
  CREATE INDEX "presidents_created_at_idx" ON "payload"."presidents" USING btree ("created_at");
  CREATE UNIQUE INDEX "board_members_role_idx" ON "payload"."board_members" USING btree ("role");
  CREATE INDEX "board_members_photo_idx" ON "payload"."board_members" USING btree ("photo_id");
  CREATE INDEX "board_members_updated_at_idx" ON "payload"."board_members" USING btree ("updated_at");
  CREATE INDEX "board_members_created_at_idx" ON "payload"."board_members" USING btree ("created_at");
  CREATE UNIQUE INDEX "committee_chairs_role_idx" ON "payload"."committee_chairs" USING btree ("role");
  CREATE INDEX "committee_chairs_photo_idx" ON "payload"."committee_chairs" USING btree ("photo_id");
  CREATE INDEX "committee_chairs_updated_at_idx" ON "payload"."committee_chairs" USING btree ("updated_at");
  CREATE INDEX "committee_chairs_created_at_idx" ON "payload"."committee_chairs" USING btree ("created_at");
  CREATE UNIQUE INDEX "areas_of_focus_key_idx" ON "payload"."areas_of_focus" USING btree ("key");
  CREATE INDEX "areas_of_focus_updated_at_idx" ON "payload"."areas_of_focus" USING btree ("updated_at");
  CREATE INDEX "areas_of_focus_created_at_idx" ON "payload"."areas_of_focus" USING btree ("created_at");
  CREATE UNIQUE INDEX "areas_of_focus_locales_locale_parent_id_unique" ON "payload"."areas_of_focus_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_portrait_sizes_portrait_filename_idx" ON "payload"."media" USING btree ("sizes_portrait_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "payload"."media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "editors_sessions_order_idx" ON "payload"."editors_sessions" USING btree ("_order");
  CREATE INDEX "editors_sessions_parent_id_idx" ON "payload"."editors_sessions" USING btree ("_parent_id");
  CREATE INDEX "editors_updated_at_idx" ON "payload"."editors" USING btree ("updated_at");
  CREATE INDEX "editors_created_at_idx" ON "payload"."editors" USING btree ("created_at");
  CREATE UNIQUE INDEX "editors_email_idx" ON "payload"."editors" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_presidents_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("presidents_id");
  CREATE INDEX "payload_locked_documents_rels_board_members_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("board_members_id");
  CREATE INDEX "payload_locked_documents_rels_committee_chairs_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("committee_chairs_id");
  CREATE INDEX "payload_locked_documents_rels_areas_of_focus_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("areas_of_focus_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_editors_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("editors_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_editors_id_idx" ON "payload"."payload_preferences_rels" USING btree ("editors_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."presidents" CASCADE;
  DROP TABLE "payload"."board_members" CASCADE;
  DROP TABLE "payload"."committee_chairs" CASCADE;
  DROP TABLE "payload"."areas_of_focus" CASCADE;
  DROP TABLE "payload"."areas_of_focus_locales" CASCADE;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."media_locales" CASCADE;
  DROP TABLE "payload"."editors_sessions" CASCADE;
  DROP TABLE "payload"."editors" CASCADE;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."payload_locked_documents" CASCADE;
  DROP TABLE "payload"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload"."payload_preferences" CASCADE;
  DROP TABLE "payload"."payload_preferences_rels" CASCADE;
  DROP TABLE "payload"."payload_migrations" CASCADE;
  DROP TYPE "payload"."_locales";
  DROP TYPE "payload"."enum_board_members_role";
  DROP TYPE "payload"."enum_committee_chairs_role";
  DROP TYPE "payload"."enum_areas_of_focus_key";`)
}
