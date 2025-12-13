import { buildConfig } from 'payload'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002',
  admin: {
    user: 'users'
  },
  collections: [],
  globals: []
})