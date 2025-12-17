import { createLocalReq, getPayload } from 'payload'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import config from '@payload-config'

import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { getServerSideURL } from '@/utilities/getURL'

type Body = {
  collection?: 'pages' | 'posts'
  id?: string
}

export async function POST(req: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Only logged in admin users may generate share links
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = (await req.json()) as Body
    const collection = body.collection
    const id = body.id

    if (!collection || !id) {
      return NextResponse.json({ ok: false, message: 'Missing collection or id' }, { status: 400 })
    }

    if (collection !== 'pages' && collection !== 'posts') {
      return NextResponse.json({ ok: false, message: 'Unsupported collection' }, { status: 400 })
    }

    const payloadReq = await createLocalReq({ user }, payload)

    const doc = await payload.findByID({
      collection,
      id,
      depth: 0,
      disableErrors: true,
      select: { slug: true },
      req: payloadReq,
    })

    if (!doc) {
      return NextResponse.json({ ok: false, message: 'Not found' }, { status: 404 })
    }

    const slug = typeof (doc as { slug?: unknown }).slug === 'string' ? (doc as { slug: string }).slug : ''
    const relative = generatePreviewPath({ collection, slug, kind: 'share' })

    if (!relative) {
      return NextResponse.json({ ok: false, message: 'Unable to generate preview path' }, { status: 500 })
    }

    const url = `${getServerSideURL()}${relative}`

    return NextResponse.json({ ok: true, url, relative })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error'
    payload.logger.error({ err: error }, 'Error generating share preview link')
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}

