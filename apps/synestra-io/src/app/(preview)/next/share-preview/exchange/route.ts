import { draftMode } from 'next/headers'
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

    const draft = await draftMode()
    draft.enable()

    return NextResponse.json({ ok: true, path })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token'
    return NextResponse.json({ ok: false, message }, { status: 403 })
  }
}

