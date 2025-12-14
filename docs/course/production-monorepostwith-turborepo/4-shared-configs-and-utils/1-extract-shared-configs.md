source: https://vercel.com/academy/production-monorepos/extract-shared-configs
# [Extract shared configs](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#extract-shared-configs)

Both apps have duplicate `tsconfig.json` files with identical settings. When you add a third, fourth, fifth, etc. app, you'll copy it again. This creates drift - one app might have strict mode on, another off. Configuration should be centralized.

You'll create two configuration packages: `packages/typescript-config` for TypeScript settings and `packages/eslint-config` for linting rules. This follows the Turborepo convention of one package per tool, keeping configurations modular and composable.

## [Outcome](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#outcome)

Create separate `packages/typescript-config` and `packages/eslint-config` packages that all apps extend from.

## [Fast track](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#fast-track)

1. Create `packages/typescript-config` package with base configuration
2. Create `packages/eslint-config` package with shared rules
3. Update apps to extend from both config packages
4. Add lint task to Turborepo and test

## [Hands-on exercise 4.1](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#hands-on-exercise-41)

Create separate configuration packages for TypeScript and ESLint.

**Requirements:**

1. Create `packages/typescript-config` with base.json and nextjs.json configs
2. Create `packages/eslint-config` with shared ESLint rules
3. Update apps/web and apps/snippet-manager to extend from both packages
4. Add lint task to turbo.json
5. Run lint across workspace and test error detection

**Implementation hints:**

- TypeScript config package exports multiple configs (base, nextjs)
- ESLint config package name: `@geniusgarage/eslint-config`
- Apps extend TypeScript config: `"extends": "@geniusgarage/typescript-config/nextjs.json"`
- Apps import ESLint config: `import config from '@geniusgarage/eslint-config'`
- Each tool gets its own package (standard Turborepo pattern)

## [Create TypeScript config package](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#create-typescript-config-package)

Create the directory structure:

```
mkdir -p packages/typescript-config
```

Create `packages/typescript-config/package.json`:

packages/typescript-config/package.json

```
{
  "name": "@geniusgarage/typescript-config",
  "version": "1.0.0",
  "private": true
}
```

This package exports TypeScript configuration files.

Create `packages/typescript-config/base.json` with common settings:

packages/typescript-config/base.json

```
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "exclude": ["node_modules"]
}
```

Create `packages/typescript-config/nextjs.json` for Next.js apps:

packages/typescript-config/nextjs.json

```
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "jsx": "preserve"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

This provides Next.js-specific TypeScript settings that extend the base config.

## [Create ESLint config package](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#create-eslint-config-package)

Create the directory structure:

```
mkdir -p packages/eslint-config
```

Create `packages/eslint-config/package.json`:

packages/eslint-config/package.json

```
{
  "name": "@geniusgarage/eslint-config",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./index.js"
  },
  "devDependencies": {
    "eslint-config-next": "^15.0.0",
    "eslint-config-prettier": "^10.1.1"
  }
}
```

Create `packages/eslint-config/index.js`:

packages/eslint-config/index.js

```
// TODO: Export default config object with:
//   - extends: ['next/core-web-vitals', 'prettier']
//   - rules:
//     - '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
//     - '@typescript-eslint/no-explicit-any': 'warn'
```

**Your task:** Implement the ESLint config.

### Solution

packages/eslint-config/index.js
```
export default {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}
```

## [Update apps to use shared configs](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#update-apps-to-use-shared-configs)

### [Update TypeScript configs](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#update-typescript-configs)

Update `apps/web/tsconfig.json` to extend the shared Next.js config:

apps/web/tsconfig.json

```
{
  "extends": "@geniusgarage/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Update `apps/snippet-manager/tsconfig.json`:

apps/snippet-manager/tsconfig.json

```
{
  "extends": "@geniusgarage/typescript-config/nextjs.json"
}
```

Both apps now extend the shared TypeScript configuration. All common settings come from the package, and apps only add app-specific overrides.

### [Add ESLint configs](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#add-eslint-configs)

Create `apps/web/eslint.config.mjs`:

apps/web/eslint.config.mjs

```
import sharedConfig from '@geniusgarage/eslint-config'
 
export default sharedConfig
```

Create `apps/snippet-manager/eslint.config.mjs`:

apps/snippet-manager/eslint.config.mjs

```
import sharedConfig from '@geniusgarage/eslint-config'
export default sharedConfig
```

Both apps now use the same ESLint rules from `packages/eslint-config`.

## [Install dependencies](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#install-dependencies)

Link the config packages to both apps:

```
pnpm add @geniusgarage/typescript-config @geniusgarage/eslint-config --filter @geniusgarage/web --workspace
pnpm add @geniusgarage/typescript-config @geniusgarage/eslint-config --filter @geniusgarage/snippet-manager --workspace
pnpm install
```

This adds both config packages as dependencies to each app.

## [Add lint task to turbo.json](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#add-lint-task-to-turbojson)

Update `turbo.json` to include lint task:

turbo.json

```
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

The `^lint` means "run lint on dependencies first".

## [Add package scripts](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#add-package-scripts)

Update root `package.json`:

package.json

```
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  }
}
```

Make sure each app's package.json has the following scripts:

apps/web/package.json

```
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint"
  }
}
```

apps/snippet-manager/package.json

```
{
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "lint": "next lint"
  }
}
```

## [Try it](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#try-it)

### [1. Run lint across workspace](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#1-run-lint-across-workspace)

```
pnpm lint
```

Output:

```
@geniusgarage/web:lint: ✓ No ESLint warnings or errors
@geniusgarage/snippet-manager:lint: ✓ No ESLint warnings or errors

Tasks:    2 successful, 2 total
Cached:   0 cached, 2 total
Time:     2.341s
```

Turborepo runs lint in both apps in parallel!

### [2. Introduce an error](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#2-introduce-an-error)

Add an unused variable to test:

apps/snippet-manager/app/page.tsx

```
export default function Home() {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets)
  const unusedVar = 'test'  // Add this line
 
  // ...
}
```

Run lint:

```
pnpm lint
```

Output:

```
@geniusgarage/snippet-manager:lint:
  Error: 'unusedVar' is assigned a value but never used  @typescript-eslint/no-unused-vars

Tasks:    1 failed, 2 total
```

The shared ESLint rule caught it! Remove the line to fix.

## [How shared configs work](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#how-shared-configs-work)

Your monorepo now has centralized configuration across two packages:

```
  packages/
  ├── typescript-config/
  │   ├── base.json       ← Base TypeScript settings
  │   └── nextjs.json     ← Next.js-specific settings
  │           ↑
  │           └──────────┬──────────┐
  │                      │          │
  │                apps/web    apps/snippet-manager
  │                (extends)   (extends)
  │
  └── eslint-config/
      └── index.js        ← Shared ESLint rules
              ↑
              └──────────┬──────────┐
                         │          │
                   apps/web    apps/snippet-manager
                   (imports)   (imports)
```

**Benefits:**

- **One source of truth** - Change strict mode once, affects all apps
- **No drift** - Impossible for apps to have different configs
- **Modular** - Each tool has its own package (Turborepo convention)
- **Composable** - Apps can mix and match configs (base vs nextjs)
- **Easy to add apps** - New apps extend the same base configs
- **Upgrade once** - Update TypeScript target in one place

## [Commit](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#commit)

```
git add .
git commit -m "feat: add shared typescript-config and eslint-config packages"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#done-when)

Verify shared configs work:

- [ ] Created `packages/typescript-config` with base.json and nextjs.json
- [ ] Created `packages/eslint-config` with index.js
- [ ] Both apps extend TypeScript config via `@geniusgarage/typescript-config/nextjs.json`
- [ ] Both apps import ESLint config from `@geniusgarage/eslint-config`
- [ ] Added lint task to turbo.json with ^lint dependency
- [ ] Ran `pnpm lint` and saw both apps lint in parallel
- [ ] Tested error detection by adding unused variable
- [ ] Understood how separate config packages follow Turborepo conventions

## [Alternative: Biome for linting](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#alternative-biome-for-linting)

[Biome](https://biomejs.dev/) is a fast, Rust-based toolchain that combines linting and formatting in one tool. If you prefer a modern alternative to ESLint + Prettier, Biome offers:

- **Dramatically faster** than Node.js-based tools (written in Rust)
- **Unified toolchain** - one tool for linting, formatting, and import sorting
- **Drop-in replacement** for ESLint + Prettier with similar rules

While this course uses ESLint for familiarity, many production monorepos are migrating to Biome for performance. For large teams with thousands of files, Biome's speed advantage compounds significantly.

When to Consider Biome

If your monorepo has 10+ packages and lint times exceed 30 seconds, Biome can reduce that to under 5 seconds. The trade-off is a smaller ecosystem of plugins compared to ESLint's mature plugin system.

## [What's Next](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/1-extract-shared-configs.md#whats-next)

You've centralized configuration across modular packages, but apps still have duplicate utility code. Next lesson: **Add Shared Utils** - create `packages/utils` for common functions like `formatDate`, `slugify`, and `truncate` that work across all apps.
