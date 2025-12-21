import { defineBlockList } from '@synestra/blocks-renderer'

import { Banner } from '@/blocks/Banner/config'
import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'

export const RICH_TEXT_BLOCKS = defineBlockList({
  name: 'rich text blocks',
  strict: true,
  blocks: [Banner, Code, MediaBlock],
})
