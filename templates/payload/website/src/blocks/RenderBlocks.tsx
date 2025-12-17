import React from 'react'

import type { Page } from '@/payload-types'
import { renderBlocks } from '@synestra/blocks-renderer'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  return renderBlocks(blocks, blockComponents, {
    componentProps: { disableInnerContainer: true },
    wrap: ({ children }) => <div className="my-16">{children}</div>,
  })
}
