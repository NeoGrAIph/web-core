import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  transpilePackages: [
    '@synestra/ui',
    '@synestra/cms-core',
    '@synestra/cms-blocks',
    '@synestra/payload-plugin-multisite'
  ]
}

export default withPayload(nextConfig)
