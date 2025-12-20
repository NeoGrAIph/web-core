import type { PlopTypes } from '@turbo/gen'
import fs from 'node:fs'

function ensureStartsWithSynestra(scopeName: string): void {
  if (!scopeName.startsWith('@synestra/')) {
    throw new Error('Package name must start with @synestra/')
  }
}

function ensureExportLine(fileContents: string, exportLine: string): string {
  if (fileContents.includes(exportLine)) return fileContents
  const next = fileContents.replace(/\s*$/, '')
  return `${next}\n\n${exportLine}\n`
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setHelper('eq', (a: unknown, b: unknown) => a === b)

  plop.setHelper('synestraPackageName', (name: string) => {
    const normalized = name.startsWith('@synestra/') ? name : `@synestra/${name}`
    ensureStartsWithSynestra(normalized)
    return normalized
  })

  plop.setActionType('ensureFile', (answers, config) => {
    const filePath = String(config.path || '')
    if (!filePath) throw new Error('ensureFile requires "path"')
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required file not found: ${filePath}`)
    }
    return filePath
  })

  plop.setGenerator('package', {
    description: 'Create a new shared package under packages/*',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Package name (e.g., cms-search or @synestra/cms-search):',
      },
      {
        type: 'list',
        name: 'kind',
        message: 'Package kind:',
        choices: [
          { name: 'ts-lib (source package)', value: 'ts-lib' },
          { name: 'config (js/json config package)', value: 'config' },
        ],
        default: 'ts-lib',
      },
    ],
    actions: (answers) => {
      const pkgName = plop.getHelper('synestraPackageName')(answers?.name)
      const shortName = String(pkgName).replace('@synestra/', '')

      const basePath = `packages/${shortName}`

      const actions: PlopTypes.ActionType[] = [
        {
          type: 'add',
          path: `${basePath}/package.json`,
          templateFile: 'templates/package/package.json.hbs',
        },
        {
          type: 'add',
          path: `${basePath}/README.md`,
          templateFile: 'templates/package/README.md.hbs',
        },
      ]

      if (answers?.kind === 'ts-lib') {
        actions.push(
          {
            type: 'add',
            path: `${basePath}/tsconfig.json`,
            templateFile: 'templates/package/tsconfig.json.hbs',
          },
          {
            type: 'add',
            path: `${basePath}/src/index.ts`,
            templateFile: 'templates/package/src-index.ts.hbs',
          },
        )
      }

      if (answers?.kind === 'config') {
        actions.push({
          type: 'add',
          path: `${basePath}/index.js`,
          templateFile: 'templates/package/index.js.hbs',
        })
      }

      return actions
    },
  })

  plop.setGenerator('ui:component', {
    description: 'Create a new UI component in packages/ui',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g., Input):',
      },
    ],
    actions: [
      {
        type: 'ensureFile',
        path: 'packages/ui/src/index.ts',
      },
      {
        type: 'add',
        path: 'packages/ui/src/{{kebabCase name}}.tsx',
        templateFile: 'templates/ui/component.tsx.hbs',
      },
      {
        type: 'add',
        path: 'packages/ui/src/{{kebabCase name}}.test.tsx',
        templateFile: 'templates/ui/component.test.tsx.hbs',
      },
      {
        type: 'modify',
        path: 'packages/ui/src/index.ts',
        transform: (fileContents: string, answers: PlopTypes.Answers) => {
          const name = String(answers?.name || '')
          const exportLine = `export * from './${plop.getHelper('kebabCase')(name)}'`
          return ensureExportLine(fileContents, exportLine)
        },
      },
    ],
  })

  plop.setGenerator('ui:client-component', {
    description: 'Create a new client UI component in packages/ui/src/client',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Client component name (e.g., Modal):',
      },
    ],
    actions: [
      {
        type: 'ensureFile',
        path: 'packages/ui/src/client/index.ts',
      },
      {
        type: 'add',
        path: 'packages/ui/src/client/{{kebabCase name}}.tsx',
        templateFile: 'templates/ui/client-component.tsx.hbs',
      },
      {
        type: 'add',
        path: 'packages/ui/src/client/{{kebabCase name}}.test.tsx',
        templateFile: 'templates/ui/client-component.test.tsx.hbs',
      },
      {
        type: 'modify',
        path: 'packages/ui/src/client/index.ts',
        transform: (fileContents: string, answers: PlopTypes.Answers) => {
          const name = String(answers?.name || '')
          const exportLine = `export * from './${plop.getHelper('kebabCase')(name)}'`
          return ensureExportLine(fileContents || '', exportLine)
        },
      },
    ],
  })

  plop.setGenerator('cms:access', {
    description: 'Create a new access helper in packages/cms-core',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Access helper name (e.g., authenticatedOrPublished):',
      },
    ],
    actions: [
      {
        type: 'ensureFile',
        path: 'packages/cms-core/src/access/index.ts',
      },
      {
        type: 'add',
        path: 'packages/cms-core/src/access/{{kebabCase name}}.ts',
        templateFile: 'templates/cms/access.ts.hbs',
      },
      {
        type: 'modify',
        path: 'packages/cms-core/src/access/index.ts',
        transform: (fileContents: string, answers: PlopTypes.Answers) => {
          const name = String(answers?.name || '')
          const exportLine = `export { ${plop.getHelper('camelCase')(name)} } from './${plop.getHelper('kebabCase')(name)}'`
          return ensureExportLine(fileContents, exportLine)
        },
      },
    ],
  })

  plop.setGenerator('cms:collection', {
    description: 'Create a new collection config in packages/cms-core',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Collection name (PascalCase, e.g., Pages):',
      },
    ],
    actions: [
      {
        type: 'ensureFile',
        path: 'packages/cms-core/src/collections/index.ts',
      },
      {
        type: 'add',
        path: 'packages/cms-core/src/collections/{{kebabCase name}}.ts',
        templateFile: 'templates/cms/collection.ts.hbs',
      },
      {
        type: 'modify',
        path: 'packages/cms-core/src/collections/index.ts',
        transform: (fileContents: string, answers: PlopTypes.Answers) => {
          const name = String(answers?.name || '')
          const exportLine = `export { ${plop.getHelper('pascalCase')(name)} } from './${plop.getHelper('kebabCase')(name)}'`
          return ensureExportLine(fileContents, exportLine)
        },
      },
    ],
  })

  plop.setGenerator('cms:block', {
    description: 'Create a new Payload Block config in packages/cms-blocks',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Block name (PascalCase, e.g., Hero):',
      },
    ],
    actions: [
      {
        type: 'ensureFile',
        path: 'packages/cms-blocks/src/blocks/index.ts',
      },
      {
        type: 'add',
        path: 'packages/cms-blocks/src/blocks/{{pascalCase name}}/config.ts',
        templateFile: 'templates/cms/block-config.ts.hbs',
      },
      {
        type: 'modify',
        path: 'packages/cms-blocks/src/blocks/index.ts',
        transform: (fileContents: string, answers: PlopTypes.Answers) => {
          const name = String(answers?.name || '')
          const exportLine = `export { ${plop.getHelper('pascalCase')(name)} } from './${plop.getHelper('pascalCase')(name)}/config'`
          return ensureExportLine(fileContents || '', exportLine)
        },
      },
    ],
  })
}
