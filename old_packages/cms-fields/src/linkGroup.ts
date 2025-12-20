import type { ArrayField, Field } from 'payload'

import type { LinkAppearances } from './link'
import { deepMerge } from './deepMerge'
import { link } from './link'

export type LinkGroupFieldOptions = {
  appearances?: LinkAppearances[] | false
  overrides?: Partial<ArrayField>
}

export type LinkGroupFieldBuilder = (options?: LinkGroupFieldOptions) => Field

export const linkGroup: LinkGroupFieldBuilder = ({ appearances, overrides = {} } = {}) => {
  const generatedLinkGroup: Field = {
    name: 'links',
    type: 'array',
    fields: [
      link({
        appearances,
      }),
    ],
    admin: {
      initCollapsed: true,
      components: {
        RowLabel: '@/payload/admin/rowLabels#LinkGroupRowLabel',
      },
    },
  }

  return deepMerge(generatedLinkGroup, overrides)
}
