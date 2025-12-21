import type * as React from 'react'

export type BlockConfigLike = {
  slug?: string | null
}

type BlockComponentMap = Record<string, React.ComponentType<any>>

type DefineBlockCatalogOptions = {
  /**
   * Human-readable name for error messages.
   */
  name?: string
  /**
   * When true, throws if:
   * - a block slug has no component
   * - duplicate slugs are detected
   */
  strict?: boolean
}

/**
 * Validates that a list of block configs has unique slugs.
 *
 * Useful for catalogs that don't have a corresponding `blockType -> component` registry yet
 * (e.g. rich text embedded blocks passed into Lexical `BlocksFeature`).
 */
export function defineBlockList<TBlock extends BlockConfigLike>(args: {
  blocks: readonly TBlock[]
} & DefineBlockCatalogOptions): TBlock[] {
  const { blocks } = args
  const strict = args.strict ?? false
  const name = args.name ?? 'block list'

  const slugs = blocks
    .map((b) => (typeof b?.slug === 'string' ? b.slug : ''))
    .filter((s) => s.length > 0)

  const counts = new Map<string, number>()
  const duplicates: string[] = []
  for (const slug of slugs) {
    const next = (counts.get(slug) ?? 0) + 1
    counts.set(slug, next)
    if (next === 2) duplicates.push(slug)
  }

  if (strict && duplicates.length > 0) {
    throw new Error(`[${name}] invalid: duplicate slugs: ${duplicates.join(', ')}`)
  }

  return [...blocks]
}

/**
 * Connects "schema" (block configs list) with "render" (blockType -> component registry)
 * and optionally validates that the catalog is internally consistent.
 *
 * This intentionally uses a minimal `BlockConfigLike` instead of importing Payload types,
 * so it stays usable across apps/templates without adding a Payload dependency.
 */
export function defineBlockCatalog<TBlock extends BlockConfigLike, TComponents extends BlockComponentMap>(
  args: {
    blocks: readonly TBlock[]
    components: TComponents
  } & DefineBlockCatalogOptions,
): { blocks: readonly TBlock[]; components: TComponents } {
  const { blocks, components } = args
  const strict = args.strict ?? false
  const name = args.name ?? 'block catalog'

  const slugs = blocks
    .map((b) => (typeof b?.slug === 'string' ? b.slug : ''))
    .filter((s) => s.length > 0)

  const counts = new Map<string, number>()
  const duplicates: string[] = []
  for (const slug of slugs) {
    const next = (counts.get(slug) ?? 0) + 1
    counts.set(slug, next)
    if (next === 2) duplicates.push(slug)
  }

  const missing = slugs.filter((slug) => !(slug in components))

  if (strict && (duplicates.length > 0 || missing.length > 0)) {
    const parts = [
      duplicates.length > 0 ? `duplicate slugs: ${duplicates.join(', ')}` : null,
      missing.length > 0 ? `missing components: ${missing.join(', ')}` : null,
    ].filter(Boolean)

    throw new Error(`[${name}] invalid: ${parts.join('; ')}`)
  }

  return { blocks, components }
}
