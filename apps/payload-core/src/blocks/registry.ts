import dynamic from 'next/dynamic'
import type React from 'react'

import { defineBlockCatalog } from '@synestra/blocks-renderer'
import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { PAGE_LAYOUT_BLOCKS } from '@/blocks/pageBuilder'

type PageBlock = Page['layout'][number]
type PageBlockType = PageBlock['blockType']
type NormalizeId<T> = T extends { id?: infer TId }
  ? Omit<T, 'id'> & { id?: Exclude<TId, null> }
  : T
type PageBlockByType<TBlockType extends PageBlockType> = NormalizeId<
  Extract<PageBlock, { blockType: TBlockType }>
>
type PageBlockComponentMap = {
  [TBlockType in PageBlockType]: React.ComponentType<PageBlockByType<TBlockType>>
}

export const PAGE_BLOCK_COMPONENTS = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: dynamic(() => import('@/blocks/Form/Component').then((mod) => mod.FormBlock), {
    ssr: false,
    loading: () => (
      <div className="container lg:max-w-[48rem]">
        <div className="rounded-[0.8rem] border border-border p-4 lg:p-6">
          <p className="text-sm text-muted-foreground">Loading form…</p>
        </div>
      </div>
    ),
  }),
  mediaBlock: MediaBlock,
} satisfies PageBlockComponentMap

export const PAGE_BLOCK_CATALOG = defineBlockCatalog({
  name: 'page layout blocks',
  strict: true,
  blocks: PAGE_LAYOUT_BLOCKS,
  components: PAGE_BLOCK_COMPONENTS,
})
