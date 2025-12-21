import { Header as BaseHeader } from '@synestra/cms-core/globals/Header'

import { revalidateHeader } from './hooks/revalidateHeader'

export const Header = {
  ...BaseHeader,
  hooks: {
    afterChange: [revalidateHeader],
  },
}
