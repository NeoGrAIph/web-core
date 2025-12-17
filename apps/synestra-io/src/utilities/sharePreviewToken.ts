import crypto from 'node:crypto'

type SharePreviewPayloadV1 = {
  path: string
  exp: number // unix seconds
}

type SharePreviewPayloadV2 = SharePreviewPayloadV1 & {
  collection: 'pages' | 'posts'
  docID: string
  versionID: string
}

export type SharePreviewPayload = SharePreviewPayloadV1 | SharePreviewPayloadV2
export type SharePreviewTokenInput =
  | { path: string }
  | { path: string; collection: 'pages' | 'posts'; docID: string | number; versionID: string | number }

function base64UrlEncode(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input
  return buf
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

function base64UrlDecodeToString(input: string): string {
  const padLength = (4 - (input.length % 4)) % 4
  const padded = input + '='.repeat(padLength)
  const base64 = padded.replaceAll('-', '+').replaceAll('_', '/')
  return Buffer.from(base64, 'base64').toString('utf8')
}

function signHmacSha256(data: string, secret: string): string {
  const sig = crypto.createHmac('sha256', secret).update(data).digest()
  return base64UrlEncode(sig)
}

export function createSharePreviewToken({
  payload,
  ttlSeconds,
  secret,
  now = new Date(),
}: {
  payload: SharePreviewTokenInput
  ttlSeconds: number
  secret: string
  now?: Date
}): string {
  if (!secret) throw new Error('PREVIEW_SECRET is required to sign share preview token')
  if (!payload.path.startsWith('/')) throw new Error('Share preview supports only relative paths')

  const exp = Math.floor(now.getTime() / 1000) + ttlSeconds
  const normalizedPayload =
    'collection' in payload
      ? {
          ...payload,
          docID: String(payload.docID),
          versionID: String(payload.versionID),
        }
      : payload

  const tokenPayload = { ...normalizedPayload, exp } as SharePreviewPayload
  const payloadB64 = base64UrlEncode(JSON.stringify(tokenPayload))
  const sigB64 = signHmacSha256(payloadB64, secret)
  return `${payloadB64}.${sigB64}`
}

export function verifySharePreviewToken({
  token,
  secret,
  now = new Date(),
}: {
  token: string
  secret: string
  now?: Date
}): SharePreviewPayload {
  if (!secret) throw new Error('PREVIEW_SECRET is required to verify share preview token')

  const [payloadB64, sigB64, extra] = token.split('.')
  if (!payloadB64 || !sigB64 || extra) throw new Error('Invalid token format')

  const expectedSig = signHmacSha256(payloadB64, secret)
  if (sigB64.length !== expectedSig.length) throw new Error('Invalid token signature')

  const ok = crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expectedSig))
  if (!ok) throw new Error('Invalid token signature')

  const payloadJSON = base64UrlDecodeToString(payloadB64)
  const payload = JSON.parse(payloadJSON) as SharePreviewPayload

  if (!payload?.path || typeof payload.path !== 'string') throw new Error('Invalid token payload')
  if (!payload.path.startsWith('/')) throw new Error('Invalid token path')
  if (!payload?.exp || typeof payload.exp !== 'number') throw new Error('Invalid token exp')

  // Optional v2 fields (bound to a specific version)
  if ('collection' in payload || 'docID' in payload || 'versionID' in payload) {
    const p = payload as Partial<{
      collection: unknown
      docID: unknown
      versionID: unknown
    }>
    if (p.collection !== 'pages' && p.collection !== 'posts') throw new Error('Invalid token collection')

    const docID = typeof p.docID === 'number' || typeof p.docID === 'string' ? String(p.docID) : ''
    const versionID = typeof p.versionID === 'number' || typeof p.versionID === 'string' ? String(p.versionID) : ''
    if (!docID) throw new Error('Invalid token docID')
    if (!versionID) throw new Error('Invalid token versionID')
  }

  const nowSec = Math.floor(now.getTime() / 1000)
  if (payload.exp < nowSec) throw new Error('Token expired')

  // Normalize v2 IDs to strings for downstream comparisons.
  if ('collection' in payload) {
    return {
      ...(payload as SharePreviewPayloadV2),
      docID: String((payload as SharePreviewPayloadV2).docID),
      versionID: String((payload as SharePreviewPayloadV2).versionID),
    }
  }

  return payload
}
