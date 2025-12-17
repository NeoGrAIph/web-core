import { NextResponse } from 'next/server'

import { isSharePreviewRequest } from '@/utilities/sharePreviewContext'

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.searchParams.get('path') || ''
  const sp = url.searchParams.get('sp') || ''

  if (!path.startsWith('/')) {
    return NextResponse.json({ ok: false, message: 'Invalid path' }, { status: 400 })
  }

  const active = await isSharePreviewRequest({ path, searchParams: { sp } })

  return NextResponse.json({ ok: true, active })
}

