import type { GlobalConfig } from 'payload'

import { link } from '@synestra/cms-fields'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/admin-ui/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
}
