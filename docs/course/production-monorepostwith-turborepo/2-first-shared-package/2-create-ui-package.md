source: https://vercel.com/academy/production-monorepos/create-ui-package
# [Create UI package structure](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#create-ui-package-structure)

You have 6 duplicate card divs in the features page. Before extracting them into a shared component, you need a place to put that component. You'll create `packages/ui` - a workspace package that apps can import from.

## [Outcome](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#outcome)

Create the packages/ui workspace package with proper TypeScript configuration, ready to hold shared React components.

## [Fast track](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#fast-track)

1. Create `packages/ui/src` directory structure
2. Configure `package.json` with named exports pattern
3. Add TypeScript config extending base settings
4. Link the workspace with `pnpm install`

## [Hands-on exercise 2.2](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#hands-on-exercise-22)

Set up the packages/ui package structure and configuration for shared React components.

**Requirements:**

1. Create `packages/ui/src` directory
2. Create `package.json` with named exports pattern and peer dependencies
3. Add `tsconfig.json` extending from base TypeScript config
4. Create empty `src/index.ts` export file
5. Run `pnpm install` to link the workspace

**Implementation hints:**

- Use `@geniusgarage/ui` as package name (scoped for consistency)
- Configure named exports pattern: `"./card": "./src/card.tsx"`
- React should be a peerDependency (apps provide it, package uses it)
- TypeScript config should extend from `@tsconfig/nextjs` for consistency
- Empty index.ts now, components added in next lesson

**Files to create:**

- `packages/ui/package.json` (workspace package config)
- `packages/ui/tsconfig.json` (TypeScript settings)
- `packages/ui/src/index.ts` (empty export file)

## [Create package directory](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#create-package-directory)

Create the packages directory and ui package:

```
mkdir -p packages/ui/src
```

Your monorepo now has:

```
  production-monorepos-starter/
  ├── apps/
  │   └── web/
  ├── packages/           # ← New!
  │   └── ui/             # ← New!
  │       └── src/        # ← New!
  ├── package.json
  └── pnpm-workspace.yaml
```

The `pnpm-workspace.yaml` already includes `packages/*`, so pnpm will automatically detect this as a workspace package.

## [Configure package.json](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#configure-packagejson)

Create `packages/ui/package.json` with this configuration:

packages/ui/package.json

```
{
  "name": "@geniusgarage/ui",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {},
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

**Breaking it down:**

**name:** `@geniusgarage/ui`

- Namespaced package name
- Apps will import from `@geniusgarage/ui/component-name`

**exports:** Empty object for now

- You'll add named exports as you create components
- Modern pattern: each component gets its own export path
- Example: `"./card": "./src/card.tsx"` lets apps import `@geniusgarage/ui/card`

**peerDependencies:** React versions

- Apps provide React, not the package
- Prevents multiple React instances
- Supports both React 18 and 19

**devDependencies:** TypeScript and React types

- Needed for TypeScript to compile JSX components
- Only used during development/build
- Not shipped to consuming apps

Named Exports Pattern

### Modern packages use named exports:

**Named export (what we're doing):**

```
import { Card } from '@geniusgarage/ui/card'
```

**Barrel export (old pattern):**

```
import { Card } from '@geniusgarage/ui'
```

Named exports are better for:

- Tree-shaking (only bundle what you import)
- Avoiding circular dependencies
- Explicit imports (you know exactly where components come from)

## [Add TypeScript config](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#add-typescript-config)

Create `packages/ui/tsconfig.json`:

packages/ui/tsconfig.json

```
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "target": "ES2017",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

**Key settings:**

- `jsx: "react-jsx"` - Modern JSX transform (no need to import React in every file)
- `declaration: true` - Generate `.d.ts` type definition files
- `moduleResolution: "bundler"` - Modern resolution for build tools like Next.js

## [Create index file (empty)](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#create-index-file-empty)

Create `packages/ui/src/index.ts`:

packages/ui/src/index.ts

```
// Components will be exported from here
```

This file will export all components. Right now it's empty. You'll add exports as you create components.

## [Register the new package](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#register-the-new-package)

Tell pnpm to scan the workspace and recognize the new package:

```
pnpm install
```

You'll see:

```
Scope: all 3 workspace projects
Already up to date
```

Even though no external packages were installed, pnpm scanned your `packages/` directory and registered `@geniusgarage/ui` as a workspace package. It's now available to import from other apps in the monorepo.

Verify the package is recognized:

```
pnpm list --depth 0
```

You should see `@geniusgarage/ui` listed alongside `@geniusgarage/web`.

Package Structure Ready

You now have a properly configured UI package:

- Namespaced package name (`@geniusgarage/ui`)
- Named exports configuration (ready to add components)
- TypeScript setup
- Linked in the workspace

Next lesson: extract the Card component into this package.

## [Commit](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#commit)

Save your work:

```
git add .
git commit -m "feat(ui): create ui package structure"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#done-when)

Verify your package structure:

- [ ] Directory `packages/ui/src` exists
- [ ] `packages/ui/package.json` exists with name `@geniusgarage/ui`
- [ ] package.json has `exports` field configured
- [ ] package.json has React as peerDependency (not dependency)
- [ ] `packages/ui/tsconfig.json` exists and extends `@tsconfig/nextjs`
- [ ] `packages/ui/src/index.ts` exists (empty for now)
- [ ] Ran `pnpm install` successfully
- [ ] `pnpm -r exec pwd` shows both web and ui packages
- [ ] No TypeScript or build errors
- [ ] Ready to add components in next lesson

## [What you built](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#what-you-built)

You created the foundation for shared components:

```
  packages/ui/
  ├── src/
  │   └── index.ts          # Empty exports file
  ├── package.json          # Package config with named exports
  └── tsconfig.json         # TypeScript config
```

No components yet - just the structure. This separation is intentional: understand the package setup before adding components.

## [What's Next](docs/course/production-monorepostwith-turborepo/2-first-shared-package/2-create-ui-package.md#whats-next)

Next lesson: **Extract Card Component** - you'll create `packages/ui/src/card.tsx`, add it to exports, and update the features page to import from the shared package. You'll see workspace dependencies in action - change the Card once, all apps using it update instantly.
