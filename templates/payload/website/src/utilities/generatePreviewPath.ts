import { CollectionSlug } from 'payload'

import { createSharePreviewToken } from './sharePreviewToken'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
}

const SHARE_PREVIEW_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export const generatePreviewPath = ({ collection, slug }: Props) => {
  // Allow empty strings, e.g. for the homepage
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const path = `${collectionPrefixMap[collection]}/${encodedSlug}`

  // Share-preview token is placed in the URL fragment so it won't hit access logs or Referer.
  // The token is exchanged server-side for a Next.js draft mode cookie.
  const token = createSharePreviewToken({
    path,
    ttlSeconds: SHARE_PREVIEW_TTL_SECONDS,
    secret: process.env.PREVIEW_SECRET || '',
  })

  return `/next/share-preview#token=${token}`
}
