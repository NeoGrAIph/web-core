import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { Users } from '@synestra/cms-core'
import { env } from './env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isProd = process.env.NODE_ENV === 'production'

export default buildConfig({
  serverURL: env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002',
  secret: env.PAYLOAD_SECRET || 'dev-secret',
  db: postgresAdapter({
    pool: {
      connectionString:
        env.DATABASE_URI || 'postgresql://user:pass@localhost:5432/web_experiments',
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    push: !isProd,
  }),
  admin: {
    user: Users.slug,
  },
  collections: [Users],
  globals: [],
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
