import type React from 'react'

import { defineBlockCatalog } from '@synestra/blocks-renderer'
import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { PAGE_LAYOUT_BLOCKS } from '@/blocks/pageBuilder'

type PageBlock = Page['layout'][number]
type PageBlockType = PageBlock['blockType']

export const PAGE_BLOCK_COMPONENTS = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
} satisfies Record<PageBlockType, React.ComponentType<any>>

export const PAGE_BLOCK_CATALOG = defineBlockCatalog({
  name: 'page layout blocks',
  strict: true,
  blocks: PAGE_LAYOUT_BLOCKS,
  components: PAGE_BLOCK_COMPONENTS,
})
