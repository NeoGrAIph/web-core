import { defineBlockList } from '@synestra/blocks-renderer'

import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'

export const PAGE_LAYOUT_BLOCKS = defineBlockList({
  name: 'page layout blocks',
  strict: true,
  blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
})
