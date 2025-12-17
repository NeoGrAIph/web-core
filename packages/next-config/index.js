import fs from 'node:fs'
import path from 'node:path'

import { withPayload } from '@payloadcms/next/withPayload'

const DEFAULT_EXTENSION_ALIAS = {
  '.cjs': ['.cts', '.cjs'],
  '.js': ['.ts', '.tsx', '.js', '.jsx'],
  '.mjs': ['.mts', '.mjs'],
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function uniq(list) {
  return [...new Set(list.filter(Boolean))]
}

export function getWorkspaceTranspilePackages({
  appDir = process.cwd(),
  workspacePrefix = '@synestra/',
} = {}) {
  const packageJSONPath = path.join(appDir, 'package.json')
  const packageJSON = readJSON(packageJSONPath)
  const deps = Object.keys(packageJSON.dependencies || {})
  return deps.filter((name) => name.startsWith(workspacePrefix))
}

export function createSynestraNextConfig({
  appDir = process.cwd(),
  nextConfig = {},
  extraTranspilePackages = [],
  includeWorkspaceTranspilePackages = true,
  payloadOptions,
} = {}) {
  const userWebpack = nextConfig.webpack

  const resolvedTranspile = uniq([
    ...(includeWorkspaceTranspilePackages ? getWorkspaceTranspilePackages({ appDir }) : []),
    ...(nextConfig.transpilePackages || []),
    ...extraTranspilePackages,
  ])

  const mergedConfig = {
    reactStrictMode: true,
    ...nextConfig,
    transpilePackages: resolvedTranspile,
    webpack: (webpackConfig, options) => {
      const config = userWebpack ? userWebpack(webpackConfig, options) : webpackConfig
      config.resolve.extensionAlias = {
        ...(config.resolve.extensionAlias || {}),
        ...DEFAULT_EXTENSION_ALIAS,
      }
      return config
    },
  }

  return withPayload(mergedConfig, payloadOptions)
}

