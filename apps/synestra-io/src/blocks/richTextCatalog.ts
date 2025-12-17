import type { Block } from 'payload'

import { defineBlockList } from '@synestra/blocks-renderer'

import { Banner } from './Banner/config'
import { CallToAction } from './CallToAction/config'
import { Code } from './Code/config'
import { MediaBlock } from './MediaBlock/config'

/**
 * Canonical catalog for Lexical `BlocksFeature` (embedded blocks inside rich text).
 *
 * Source of truth: `docs/architecture/payload-lexical-layout-convergence.md`.
 */
export const RICH_TEXT_BLOCKS: Block[] = defineBlockList({
  name: 'rich text blocks',
  strict: true,
  blocks: [Banner, MediaBlock, Code, CallToAction],
})

