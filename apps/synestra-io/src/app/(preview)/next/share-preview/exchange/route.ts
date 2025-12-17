import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { verifySharePreviewToken } from '@/utilities/sharePreviewToken'

export async function POST(req: Request): Promise<Response> {
  try {
    const { token } = (await req.json()) as { token?: string }

    if (!token) {
      return NextResponse.json({ ok: false, message: 'Missing token' }, { status: 400 })
    }

    const secret = process.env.PREVIEW_SECRET || ''
    const payload = verifySharePreviewToken({ token, secret })
    const { path } = payload

    // Share preview must not enable Next.js Draft Mode globally (it would shadow published pages).
    // Instead we set cookies and require an explicit `?sp=<versionID>` (or `?sp=1` for legacy tokens) to show drafts.
    const cookieStore = await cookies()
    const existing = cookieStore.getAll().filter((c) => c.name === 'syn_share_preview')
    const res = NextResponse.json({ ok: true, path: appendSharePreviewFlag(payload) })

    // Set cookie scoped to the target path (session cookie, TTL is enforced by token `exp`).
    res.cookies.set('syn_share_preview', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path,
    })

    // Also store the active token at root path so it can be read by `/api/*` endpoints (cookie Path rules).
    res.cookies.set('syn_share_preview_active', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    })

    // If user already has cookies with the same name for other paths, keep them (browser will handle per-path).
    // We don't attempt cleanup here.
    void existing

    return res
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token'
    return NextResponse.json({ ok: false, message }, { status: 403 })
  }
}

function appendSharePreviewFlag(payload: { path: string } & Partial<{ versionID: string | number }>): string {
  const url = new URL(payload.path, 'http://internal')
  url.searchParams.set('sp', payload.versionID !== undefined ? String(payload.versionID) : '1')
  return `${url.pathname}${url.search}`
}
