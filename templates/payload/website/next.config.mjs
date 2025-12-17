import { createSynestraNextConfig } from '@synestra/next-config'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined

// Kubernetes / local dev: prefer explicit server URL.
// This is used by Next Image `remotePatterns` to allow optimized loading of absolute URLs
// (our `getMediaUrl` prepends origin on the client).
const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  NEXT_PUBLIC_SERVER_URL ||
  process.env.__NEXT_PRIVATE_ORIGIN ||
  'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  reactStrictMode: true,
  redirects,
}

export default createSynestraNextConfig({
  nextConfig,
  payloadOptions: { devBundleServerPackages: false },
})
