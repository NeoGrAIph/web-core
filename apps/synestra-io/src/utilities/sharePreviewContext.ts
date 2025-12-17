import { cookies } from 'next/headers'

import { verifySharePreviewToken, type SharePreviewPayload } from './sharePreviewToken'

type SharePreviewSearchParams = {
  sp?: string
}

export type SharePreviewContext = {
  token: string
  payload: SharePreviewPayload
}

export async function getSharePreviewContext({
  path,
  searchParams,
}: {
  path: string
  searchParams?: SharePreviewSearchParams
}): Promise<SharePreviewContext | null> {
  // Require explicit opt-in flag in the URL so published pages stay accessible at the canonical path.
  if (!searchParams || searchParams.sp !== '1') return null

  const secret = process.env.PREVIEW_SECRET || ''
  if (!secret) return null

  const cookieStore = await cookies()
  const candidates = cookieStore.getAll().filter((c) => c.name === 'syn_share_preview')

  for (const c of candidates) {
    try {
      const payload = verifySharePreviewToken({ token: c.value, secret })
      if (payload.path === path) return { token: c.value, payload }
    } catch {
      // ignore invalid/expired tokens
    }
  }

  return null
}

export async function isSharePreviewRequest(args: {
  path: string
  searchParams?: SharePreviewSearchParams
}): Promise<boolean> {
  return Boolean(await getSharePreviewContext(args))
}

