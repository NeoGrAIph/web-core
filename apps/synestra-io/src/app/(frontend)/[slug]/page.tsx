import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { getSharePreviewContext } from '@/utilities/sharePreviewContext'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
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

export default async function Page({ params: paramsPromise, searchParams: searchParamsPromise }: Args) {
  const { isEnabled: internalDraft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const searchParams = await searchParamsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  const shareCtx = await getSharePreviewContext({
    path: `/${encodeURIComponent(decodedSlug)}`,
    searchParams,
  })
  const sharePayload = shareCtx?.payload
  const shareDraft = Boolean(
    shareCtx && (sharePayload ? !('collection' in sharePayload) || sharePayload.collection === 'pages' : false),
  )
  const draft = internalDraft || shareDraft
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  if (shareDraft && !internalDraft && sharePayload && 'versionID' in sharePayload) {
    page = await queryPageByVersionID({
      versionID: sharePayload.versionID,
      docID: sharePayload.docID,
    })
  } else {
    page = await queryPageBySlug({ slug: decodedSlug, draft })
  }

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {internalDraft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({ slug: decodedSlug, draft: false })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug, draft }: { slug: string; draft: boolean }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

const queryPageByVersionID = cache(async ({ versionID, docID }: { versionID: string; docID: string }) => {
  const payload = await getPayload({ config: configPromise })

  const version = await payload.findVersionByID({
    collection: 'pages',
    id: versionID,
    depth: 1,
    overrideAccess: true,
    disableErrors: true,
  })

  if (!version) return null
  if (String(version.parent) !== String(docID)) return null

  return version.version || null
})
