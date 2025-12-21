import type { AccessArgs } from 'payload'

export const authenticated = ({ req }: AccessArgs) => {
  return Boolean(req.user)
}
