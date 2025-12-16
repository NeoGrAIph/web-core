import fs from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

function contentTypeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.webp':
      return 'image/webp'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.gif':
      return 'image/gif'
    case '.svg':
      return 'image/svg+xml'
    case '.avif':
      return 'image/avif'
    default:
      return 'application/octet-stream'
  }
}

async function readMediaFile(filename: string): Promise<{
  data: Buffer
  contentType: string
}> {
  // `pnpm --filter ... start` запускает Next из директории пакета,
  // поэтому `process.cwd()` ожидаемо указывает на `apps/synestra-io`.
  // Внутри этого пакета uploads пишутся в `public/media`.
  const mediaDir = path.resolve(process.cwd(), 'public', 'media')
  const filePath = path.resolve(mediaDir, filename)

  // Prevent path traversal
  if (!filePath.startsWith(mediaDir + path.sep)) {
    throw new Error('Invalid file path')
  }

  const data = await fs.readFile(filePath)
  return { data, contentType: contentTypeFromFilename(filename) }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
): Promise<Response> {
  const { filename } = await params

  try {
    const { data, contentType } = await readMediaFile(filename)
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Next <Image> оптимизация может использовать HEAD; также даём кэширование на уровне CDN/браузера.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ message: 'File not found' }, { status: 404 })
  }
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
): Promise<Response> {
  const { filename } = await params

  try {
    const { contentType } = await readMediaFile(filename)
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}

