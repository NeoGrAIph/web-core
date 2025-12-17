import * as React from 'react'

export type BlockLike = {
  blockType?: string | null
  id?: string | number | null
}

export type BlockAnchorLike = {
  blockType?: string | null
  blockName?: string | null
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

type BlockAnchorOptions = {
  indexOffset?: number
  fallbackPrefix?: string
}

function normalizeAnchorPart(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
}

/**
 * Produces stable HTML id attributes for blocks.
 *
 * Canon:
 * - use `blockName` if present (slugified)
 * - otherwise fallback to `${blockType}-${index + 1}`
 * - dedupe duplicates by appending `-2`, `-3`, ...
 */
export function computeBlockAnchorIDs<TBlock extends BlockAnchorLike>(
  blocks: readonly TBlock[] | null | undefined,
  options: BlockAnchorOptions = {},
): string[] {
  if (!blocks || blocks.length === 0) return []

  const indexOffset = options.indexOffset ?? 1
  const fallbackPrefix = options.fallbackPrefix ?? 'block'

  const counts = new Map<string, number>()

  return blocks.map((block, index) => {
    const rawName = typeof block.blockName === 'string' ? block.blockName.trim() : ''
    const named = rawName.length > 0 ? normalizeAnchorPart(rawName) : ''

    const safeType =
      typeof block.blockType === 'string' && block.blockType.trim().length > 0
        ? normalizeAnchorPart(block.blockType)
        : ''

    const base = named || `${safeType || fallbackPrefix}-${index + indexOffset}`

    const used = counts.get(base) ?? 0
    counts.set(base, used + 1)

    return used === 0 ? base : `${base}-${used + 1}`
  })
}
