import React from 'react'

import type { Page } from '@/payload-types'
import { renderBlocks } from '@synestra/blocks-renderer'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { toKebabCase } from '@/utilities/toKebabCase'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}

function computeAnchorIDs(blocks: Page['layout'][0][]) {
  const counts = new Map<string, number>()

  return blocks.map((block, index) => {
    const rawName = typeof block.blockName === 'string' ? block.blockName.trim() : ''
    const base =
      rawName.length > 0 ? toKebabCase(rawName) : `${block.blockType || 'block'}-${index + 1}`

    const used = counts.get(base) ?? 0
    counts.set(base, used + 1)

    return used === 0 ? base : `${base}-${used + 1}`
  })
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const anchorIDs = computeAnchorIDs(blocks)

  return renderBlocks(blocks, blockComponents, {
    componentProps: { disableInnerContainer: true },
    wrap: ({ children, index }) => (
      <div className="my-16" id={anchorIDs[index]}>
        {children}
      </div>
    ),
  })
}
