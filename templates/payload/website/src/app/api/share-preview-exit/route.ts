import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request): Promise<Response> {
  try {
    const { path } = (await req.json()) as { path?: string }

    if (!path || typeof path !== 'string' || !path.startsWith('/')) {
      return NextResponse.json({ ok: false, message: 'Invalid path' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const existing = cookieStore.getAll().filter((c) => c.name === 'syn_share_preview')

    const res = NextResponse.json({ ok: true })

    // Remove cookie scoped to this path (and also attempt to clear broader scopes if they ever existed).
    res.cookies.set('syn_share_preview', '', { path, maxAge: 0 })
    res.cookies.set('syn_share_preview', '', { path: '/', maxAge: 0 })
    res.cookies.set('syn_share_preview_active', '', { path: '/', maxAge: 0 })

    void existing

    return res
  } catch {
    return NextResponse.json({ ok: false, message: 'Bad request' }, { status: 400 })
  }
}

