import { buildConfig } from 'payload'
import multisitePlugin from '@company/payload-plugin-multisite'
// import ecommerceConfig from '@company/cms-ecommerce'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001',
  admin: {
    user: 'users'
  },
  collections: [
    // ...ecommerceConfig.collections,
  ],
  globals: [
    // ...ecommerceConfig.globals,
  ],
  plugins: [
    multisitePlugin()
  ]
})