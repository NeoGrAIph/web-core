import { buildConfig } from 'payload'
import multisitePlugin from '@company/payload-plugin-multisite'

// Import shared schemas from core packages (currently empty placeholders)
// import coreCollections from '@company/cms-core'
// import coreGlobals from '@company/cms-core'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users'
  },
  collections: [
    // ...coreCollections,
  ],
  globals: [
    // ...coreGlobals,
  ],
  plugins: [
    multisitePlugin()
  ]
})