import React from 'react'

import type { Page } from '@/payload-types'
import { computeBlockAnchorIDs, defineBlockCatalog, renderBlocks } from '@synestra/blocks-renderer'

import { PAGE_LAYOUT_BLOCKS } from '@/blocks/pageBuilder'
import { PAGE_BLOCK_COMPONENTS } from '@/blocks/registry'

const { components: blockComponents } = defineBlockCatalog({
  name: '@synestra/synestra-io pages.layout',
  blocks: PAGE_LAYOUT_BLOCKS,
  components: PAGE_BLOCK_COMPONENTS,
  strict: process.env.NODE_ENV !== 'production',
})

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const anchorIDs = computeBlockAnchorIDs(blocks)

  return renderBlocks(blocks, blockComponents, {
    componentProps: { disableInnerContainer: true },
    wrap: ({ children, index }) => (
      <div className="my-16" id={anchorIDs[index]}>
        {children}
      </div>
    ),
  })
}
