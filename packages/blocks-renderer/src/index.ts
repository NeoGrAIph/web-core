import * as React from 'react'

export type BlockLike = {
  blockType?: string | null
  id?: string | number | null
}

export type BlockComponentMap = Record<string, React.ComponentType<any>>

export type RenderBlocksOptions<TBlock extends BlockLike> = {
  componentProps?: Record<string, unknown>
  getKey?: (block: TBlock, index: number) => React.Key
  wrap?: (args: {
    block: TBlock
    index: number
    key: React.Key
    children: React.ReactElement
  }) => React.ReactNode
  renderUnknown?: (args: { block: TBlock; index: number }) => React.ReactNode
}

export function renderBlocks<TBlock extends BlockLike>(
  blocks: readonly TBlock[] | null | undefined,
  components: BlockComponentMap,
  options: RenderBlocksOptions<TBlock> = {},
): React.ReactNode {
  if (!blocks || blocks.length === 0) return null

  const getKey =
    options.getKey ??
    ((block: TBlock, index: number) => {
      if (block.id === 0) return 0
      return block.id || index
    })

  const nodes = blocks.map((block, index) => {
    const blockType = block.blockType
    const key = getKey(block, index)

    if (!blockType) {
      return options.renderUnknown ? options.renderUnknown({ block, index }) : null
    }

    const Block = components[blockType]
    if (!Block) {
      return options.renderUnknown ? options.renderUnknown({ block, index }) : null
    }

    const element = React.createElement(Block as React.ComponentType<any>, {
      ...(block as any),
      ...(options.componentProps || {}),
    })

    if (options.wrap) {
      const wrapped = options.wrap({ block, index, key, children: element })
      if (wrapped === null || wrapped === undefined) return null
      return React.createElement(React.Fragment, { key }, wrapped)
    }

    return React.cloneElement(element, { key })
  })

  return React.createElement(React.Fragment, null, ...nodes)
}

