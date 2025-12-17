import { createValidatedEnv, getSynestraEnv, z } from '@synestra/env'

const appName = '@synestra/template-payload-website'

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
    })
    .superRefine((value, ctx) => {
      const envName = value.SYNESTRA_ENV ?? 'dev'

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
            message: 'is required in stage/prod (share-preview links)',
          })
        }
      }
    }),
})

export const appEnv = getSynestraEnv(process.env)
