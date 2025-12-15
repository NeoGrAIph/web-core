import { createValidatedEnv, getSynestraEnv, z } from '@synestra/env'

const appName = '@synestra/ecommerce-store'

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

      STRIPE_SECRET_KEY: z.string().min(1).optional(),
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
      STRIPE_WEBHOOKS_SIGNING_SECRET: z.string().min(1).optional(),
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
      }

      const anyStripe =
        !!value.STRIPE_SECRET_KEY ||
        !!value.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
        !!value.STRIPE_WEBHOOKS_SIGNING_SECRET

      if (anyStripe) {
        if (!value.STRIPE_SECRET_KEY) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['STRIPE_SECRET_KEY'],
            message: 'is required when Stripe is enabled',
          })
        }
        if (!value.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
            message: 'is required when Stripe is enabled',
          })
        }
        if (!value.STRIPE_WEBHOOKS_SIGNING_SECRET) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['STRIPE_WEBHOOKS_SIGNING_SECRET'],
            message: 'is required when Stripe is enabled',
          })
        }
      }
    }),
})

export const appEnv = getSynestraEnv(process.env)

