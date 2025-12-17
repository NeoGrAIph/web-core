import { cookies } from 'next/headers'

import { verifySharePreviewToken } from './sharePreviewToken'

type SharePreviewSearchParams = {
  sp?: string
}

export async function isSharePreviewRequest({
  path,
  searchParams,
}: {
  path: string
  searchParams?: SharePreviewSearchParams
}): Promise<boolean> {
  // Require explicit opt-in flag in the URL so published pages stay accessible at the canonical path.
  if (!searchParams || searchParams.sp !== '1') return false

  const secret = process.env.PREVIEW_SECRET || ''
  if (!secret) return false

  const cookieStore = await cookies()
  const candidates = cookieStore.getAll().filter((c) => c.name === 'syn_share_preview')

  for (const c of candidates) {
    try {
      const payload = verifySharePreviewToken({ token: c.value, secret })
      if (payload.path === path) return true
    } catch {
      // ignore invalid/expired tokens
    }
  }

  return false
}

