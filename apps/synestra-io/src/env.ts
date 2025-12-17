import { createValidatedEnv, getSynestraEnv, z } from '@synestra/env'

const appName = '@synestra/synestra-io'

export const env = createValidatedEnv({
  appName,
  runtimeEnv: process.env,
  schema: z
    .object({
      SYNESTRA_ENV: z.enum(['dev', 'stage', 'prod']).optional(),

      NEXT_PUBLIC_SERVER_URL: z.string().url().optional(),

      PAYLOAD_SECRET: z.string().min(1).optional(),
      DATABASE_URI: z.string().min(1).optional(),

      CRON_SECRET: z.string().min(1).optional(),
      PREVIEW_SECRET: z.string().min(1).optional(),

      SEED_KEY: z.string().min(1).optional(),

      SYNESTRA_MEDIA_STORAGE: z.enum(['local', 's3']).optional(),
      S3_ENDPOINT: z.string().min(1).optional(),
      S3_BUCKET: z.string().min(1).optional(),
      S3_REGION: z.string().min(1).optional(),
      S3_ACCESS_KEY_ID: z.string().min(1).optional(),
      S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
      S3_FORCE_PATH_STYLE: z.enum(['true', 'false']).optional(),
    })
    .superRefine((value, ctx) => {
      const envName = value.SYNESTRA_ENV ?? 'dev'
      const mediaStorage = value.SYNESTRA_MEDIA_STORAGE ?? 'local'

      if (envName !== 'dev') {
        if (!value.NEXT_PUBLIC_SERVER_URL) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['NEXT_PUBLIC_SERVER_URL'],
            message: 'is required in stage/prod',
          })
        }
        if (!value.PAYLOAD_SECRET) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['PAYLOAD_SECRET'],
            message: 'is required in stage/prod',
          })
        }
        if (!value.DATABASE_URI) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['DATABASE_URI'],
            message: 'is required in stage/prod',
          })
        }
        if (!value.PREVIEW_SECRET) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['PREVIEW_SECRET'],
            message: 'is required in stage/prod (share preview links)',
          })
        }
      }

      if (mediaStorage === 's3') {
        if (!value.S3_ENDPOINT) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_ENDPOINT'],
            message: 'is required when SYNESTRA_MEDIA_STORAGE=s3',
          })
        }
        if (!value.S3_BUCKET) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_BUCKET'],
            message: 'is required when SYNESTRA_MEDIA_STORAGE=s3',
          })
        }
        if (!value.S3_ACCESS_KEY_ID) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_ACCESS_KEY_ID'],
            message: 'is required when SYNESTRA_MEDIA_STORAGE=s3',
          })
        }
        if (!value.S3_SECRET_ACCESS_KEY) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_SECRET_ACCESS_KEY'],
            message: 'is required when SYNESTRA_MEDIA_STORAGE=s3',
          })
        }
      }
    }),
})

export const appEnv = getSynestraEnv(process.env)
