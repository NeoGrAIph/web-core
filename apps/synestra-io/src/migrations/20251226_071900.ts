import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_plugin_ai_instructions_anth_c_text_settings_model" AS ENUM(
      'claude-opus-4-1',
      'claude-opus-4-0',
      'claude-sonnet-4-0',
      'claude-3-opus-latest',
      'claude-3-5-haiku-latest',
      'claude-3-5-sonnet-latest',
      'claude-3-7-sonnet-latest'
    );
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_plugin_ai_instructions_anth_c_object_settings_model" AS ENUM(
      'claude-opus-4-1',
      'claude-opus-4-0',
      'claude-sonnet-4-0',
      'claude-3-opus-latest',
      'claude-3-5-haiku-latest',
      'claude-3-5-sonnet-latest',
      'claude-3-7-sonnet-latest'
    );
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END $$;

  ALTER TABLE "plugin_ai_instructions"
    ADD COLUMN IF NOT EXISTS "anth_c_text_settings_model" "enum_plugin_ai_instructions_anth_c_text_settings_model" DEFAULT 'claude-3-5-sonnet-latest',
    ADD COLUMN IF NOT EXISTS "anth_c_text_settings_max_tokens" numeric DEFAULT 5000,
    ADD COLUMN IF NOT EXISTS "anth_c_text_settings_temperature" numeric DEFAULT 0.7,
    ADD COLUMN IF NOT EXISTS "anth_c_text_settings_extract_attachments" boolean,
    ADD COLUMN IF NOT EXISTS "anth_c_object_settings_model" "enum_plugin_ai_instructions_anth_c_object_settings_model" DEFAULT 'claude-3-5-sonnet-latest',
    ADD COLUMN IF NOT EXISTS "anth_c_object_settings_max_tokens" numeric DEFAULT 5000,
    ADD COLUMN IF NOT EXISTS "anth_c_object_settings_temperature" numeric DEFAULT 0.7,
    ADD COLUMN IF NOT EXISTS "anth_c_object_settings_extract_attachments" boolean;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "plugin_ai_instructions"
    DROP COLUMN IF EXISTS "anth_c_text_settings_model",
    DROP COLUMN IF EXISTS "anth_c_text_settings_max_tokens",
    DROP COLUMN IF EXISTS "anth_c_text_settings_temperature",
    DROP COLUMN IF EXISTS "anth_c_text_settings_extract_attachments",
    DROP COLUMN IF EXISTS "anth_c_object_settings_model",
    DROP COLUMN IF EXISTS "anth_c_object_settings_max_tokens",
    DROP COLUMN IF EXISTS "anth_c_object_settings_temperature",
    DROP COLUMN IF EXISTS "anth_c_object_settings_extract_attachments";

  DROP TYPE IF EXISTS "public"."enum_plugin_ai_instructions_anth_c_text_settings_model";
  DROP TYPE IF EXISTS "public"."enum_plugin_ai_instructions_anth_c_object_settings_model";
  `)
}
