import type React from 'react'

import { defineBlockCatalog } from '@synestra/blocks-renderer'
import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlockDynamic } from '@/blocks/Form/FormBlock.dynamic'
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
  formBlock: FormBlockDynamic,
  mediaBlock: MediaBlock,
} satisfies PageBlockComponentMap

export const PAGE_BLOCK_CATALOG = defineBlockCatalog({
  name: 'page layout blocks',
  strict: true,
  blocks: PAGE_LAYOUT_BLOCKS,
  components: PAGE_BLOCK_COMPONENTS,
})
