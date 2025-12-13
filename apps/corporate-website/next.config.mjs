import { withPayload } from '@payloadcms/next/config'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@company/ui',
    '@company/cms-core',
    '@company/cms-blocks',
    '@company/payload-plugin-multisite'
  ]
}

export default withPayload(nextConfig)