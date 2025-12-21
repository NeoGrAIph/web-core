import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getSharePreviewContext } from '@/utilities/sharePreviewContext'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
  searchParams: Promise<{
    sp?: string
  }>
}

export default async function Post({ params: paramsPromise, searchParams: searchParamsPromise }: Args) {
  const { isEnabled: internalDraft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const searchParams = await searchParamsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const shareCtx = await getSharePreviewContext({
    path: `/posts/${encodeURIComponent(decodedSlug)}`,
    searchParams,
  })
  const sharePayload = shareCtx?.payload
  const shareDraft = Boolean(
    shareCtx && (sharePayload ? !('collection' in sharePayload) || sharePayload.collection === 'posts' : false),
  )
  const draft = internalDraft || shareDraft

  const post =
    shareDraft && !internalDraft && sharePayload && 'versionID' in sharePayload
      ? await queryPostByVersionID({ versionID: sharePayload.versionID, docID: sharePayload.docID })
      : await queryPostBySlug({ slug: decodedSlug, draft })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="pt-16 pb-16">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {internalDraft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className="max-w-[48rem] mx-auto" data={post.content} enableGutter={false} />
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug, draft: false })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug, draft }: { slug: string; draft: boolean }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

const queryPostByVersionID = cache(async ({ versionID, docID }: { versionID: string; docID: string }) => {
  const payload = await getPayload({ config: configPromise })

  const version = await payload.findVersionByID({
    collection: 'posts',
    id: versionID,
    depth: 1,
    overrideAccess: true,
    disableErrors: true,
  })

  if (!version) return null
  if (String(version.parent) !== String(docID)) return null

  return version.version || null
})
