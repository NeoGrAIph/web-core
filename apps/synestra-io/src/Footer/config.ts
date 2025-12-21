import { Footer as BaseFooter } from '@synestra/cms-core/globals/Footer'

import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer = {
  ...BaseFooter,
  hooks: {
    afterChange: [revalidateFooter],
  },
}
