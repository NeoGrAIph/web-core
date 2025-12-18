import type { Block } from 'payload'

import { Archive } from './ArchiveBlock/config'
import { Banner } from './Banner/config'
import { CallToAction } from './CallToAction/config'
import { Code } from './Code/config'
import { Content } from './Content/config'
import { FormBlock } from './Form/config'
import { MediaBlock } from './MediaBlock/config'

/**
 * Canonical catalog for `pages.layout` (Payload `Blocks` field).
 *
 * Source of truth: `docs/architecture/payload-page-builder-catalog.md`.
 */
export const PAGE_LAYOUT_BLOCKS: Block[] = [
  Banner,
  CallToAction,
  Content,
  MediaBlock,
  Code,
  Archive,
  FormBlock,
]

