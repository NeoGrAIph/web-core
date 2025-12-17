import { cookies } from 'next/headers'

import { verifySharePreviewToken, type SharePreviewPayload } from './sharePreviewToken'

type SharePreviewSearchParams = {
  sp?: string
}

export type SharePreviewContext = {
  token: string
  payload: SharePreviewPayload
}

const PATH_COOKIE_NAME = 'syn_share_preview'
const ACTIVE_COOKIE_NAME = 'syn_share_preview_active'

export async function getSharePreviewContext({
  path,
  searchParams,
}: {
  path: string
  searchParams?: SharePreviewSearchParams
}): Promise<SharePreviewContext | null> {
  // Require explicit opt-in flag in the URL so published pages stay accessible at the canonical path.
  const sp = searchParams?.sp
  if (!sp) return null

  const secret = process.env.PREVIEW_SECRET || ''
  if (!secret) return null

  const cookieStore = await cookies()
  const candidates = cookieStore.getAll().filter((c) => c.name === PATH_COOKIE_NAME || c.name === ACTIVE_COOKIE_NAME)

  for (const c of candidates) {
    try {
      const payload = verifySharePreviewToken({ token: c.value, secret })

      if (payload.path !== path) continue

      // v2 token is pinned to a specific version; require sp to match that versionID
      if ('versionID' in payload) {
        if (sp !== String(payload.versionID)) continue
      } else {
        // v1 token uses a boolean flag
        if (sp !== '1') continue
      }

      return { token: c.value, payload }
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

