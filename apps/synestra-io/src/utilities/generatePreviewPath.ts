import { createSharePreviewToken } from './sharePreviewToken'

const collectionPrefixMap = {
  posts: '/posts',
  pages: '',
} as const

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  kind?: 'internal' | 'share'
  docID?: string
  versionID?: string
}

const SHARE_PREVIEW_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export const generatePreviewPath = ({ collection, slug, kind = 'internal', docID, versionID }: Props) => {
  // Allow empty strings, e.g. for the homepage
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const path = `${collectionPrefixMap[collection]}/${encodedSlug}`

  if (kind === 'share') {
    if (!docID || !versionID) return null

    const token = createSharePreviewToken({
      payload: {
        collection,
        docID,
        versionID,
        path,
      },
      ttlSeconds: SHARE_PREVIEW_TTL_SECONDS,
      secret: process.env.PREVIEW_SECRET || '',
    })
    return `/next/share-preview#token=${token}`
  }

  const encodedParams = new URLSearchParams({ slug: encodedSlug, collection, path })
  return `/next/preview?${encodedParams.toString()}`
}
