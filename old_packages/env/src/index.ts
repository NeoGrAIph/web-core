import { z } from 'zod'

export { z }

export type SynestraEnv = 'dev' | 'stage' | 'prod'

export const synestraEnvSchema = z.object({
  SYNESTRA_ENV: z.enum(['dev', 'stage', 'prod']).optional(),
})

export type RuntimeEnv = Record<string, string | undefined>

export function getSynestraEnv(runtimeEnv: RuntimeEnv): SynestraEnv {
  const parsed = synestraEnvSchema.safeParse(runtimeEnv)
  if (!parsed.success) return 'dev'
  return parsed.data.SYNESTRA_ENV ?? 'dev'
}

export type CreateValidatedEnvOptions<TSchema extends z.ZodTypeAny> = {
  schema: TSchema
  runtimeEnv: RuntimeEnv
  appName: string
}

function formatZodIssues(issues: z.ZodIssue[]): string {
  const lines = issues.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : '(root)'
    return `- ${path}: ${issue.message}`
  })
  return lines.join('\n')
}

export function createValidatedEnv<TSchema extends z.ZodTypeAny>(
  options: CreateValidatedEnvOptions<TSchema>,
): z.infer<TSchema> {
  const parsed = options.schema.safeParse(options.runtimeEnv)

  if (!parsed.success) {
    const message = [
      `[${options.appName}] Invalid environment variables.`,
      formatZodIssues(parsed.error.issues),
      'Note: values are not printed for security reasons.',
    ].join('\n')

    throw new Error(message)
  }

  return parsed.data
}
