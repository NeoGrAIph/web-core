import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

import { withPayload } from '@payloadcms/next/withPayload'

const require = createRequire(import.meta.url)

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
  includeTransitive = true,
} = {}) {
  const packageJSONPath = path.join(appDir, 'package.json')
  const packageJSON = readJSON(packageJSONPath)
  const deps = Object.keys(packageJSON.dependencies || {})
  const direct = deps.filter((name) => name.startsWith(workspacePrefix))

  if (!includeTransitive) return direct

  const resolved = new Set()
  const stack = [...direct]

  while (stack.length) {
    const name = stack.pop()
    if (!name || resolved.has(name)) continue
    resolved.add(name)

    let pkgJsonPath
    try {
      pkgJsonPath = require.resolve(`${name}/package.json`, { paths: [appDir] })
    } catch {
      continue
    }

    let depNames = []
    try {
      const pkgJson = readJSON(pkgJsonPath)
      depNames = Object.keys(pkgJson.dependencies || {})
    } catch {
      depNames = []
    }

    for (const depName of depNames) {
      if (depName.startsWith(workspacePrefix) && !resolved.has(depName)) {
        stack.push(depName)
      }
    }
  }

  return [...resolved]
}

export function createSynestraNextConfig({
  appDir = process.cwd(),
  nextConfig = {},
  extraTranspilePackages = [],
  includeWorkspaceTranspilePackages = true,
  includeTransitiveWorkspaceTranspilePackages = true,
  payloadOptions,
} = {}) {
  const userWebpack = nextConfig.webpack
  const standaloneOutput = process.env.NEXT_OUTPUT === 'standalone'

  const resolvedTranspile = uniq([
    ...(includeWorkspaceTranspilePackages
      ? getWorkspaceTranspilePackages({
          appDir,
          includeTransitive: includeTransitiveWorkspaceTranspilePackages,
        })
      : []),
    ...(nextConfig.transpilePackages || []),
    ...extraTranspilePackages,
  ])

  const mergedConfig = {
    reactStrictMode: true,
    ...nextConfig,
    ...(standaloneOutput
      ? {
          output: 'standalone',
          outputFileTracingRoot: path.join(appDir, '../..'),
        }
      : {}),
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
