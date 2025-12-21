import React from 'react'

import { renderBlocks } from '@synestra/blocks-renderer'
import type { Page } from '@/payload-types'

import { PAGE_BLOCK_CATALOG } from '@/blocks/registry'

type Props = {
  blocks: Page['layout']
}

export const RenderBlocks: React.FC<Props> = ({ blocks }) => {
  return renderBlocks(blocks, PAGE_BLOCK_CATALOG.components, {
    componentProps: { disableInnerContainer: true },
    wrap: ({ children }) => <div className="my-16">{children}</div>,
  })
}
