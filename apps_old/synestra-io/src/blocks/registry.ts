import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CodeBlock } from '@/blocks/Code/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'

/**
 * Frontend registry `blockType -> component` for `pages.layout`.
 *
 * Source of truth: `docs/architecture/payload-page-builder-catalog.md`.
 */
export const PAGE_BLOCK_COMPONENTS = {
  archive: ArchiveBlock,
  banner: BannerBlock,
  code: CodeBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
} as const

