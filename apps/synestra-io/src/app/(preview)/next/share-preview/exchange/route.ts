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
    const { path } = verifySharePreviewToken({ token, secret })

    // Share preview must not enable Next.js Draft Mode globally (it would shadow published pages).
    // Instead we set a scoped cookie and require an explicit `?sp=1` flag to show drafts.
    const cookieStore = await cookies()
    const existing = cookieStore.getAll().filter((c) => c.name === 'syn_share_preview')
    const res = NextResponse.json({ ok: true, path: appendSharePreviewFlag(path) })

    // Set cookie scoped to the target path (session cookie, TTL is enforced by token `exp`).
    res.cookies.set('syn_share_preview', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path,
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

function appendSharePreviewFlag(path: string): string {
  const url = new URL(path, 'http://internal')
  url.searchParams.set('sp', '1')
  return `${url.pathname}${url.search}`
}
