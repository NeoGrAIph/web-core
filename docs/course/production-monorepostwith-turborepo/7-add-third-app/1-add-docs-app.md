source: https://vercel.com/academy/production-monorepos/add-docs-app
# [Add docs app](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#add-docs-app)

You have 2 apps (web, app) proving monorepos work. But do they scale? Adding a third app proves all the patterns you've learned - shared packages, filtering, caching, CI - work effortlessly as the monorepo grows.

The docs app will use the same shared UI components, configs, and utils. You'll see how adding apps becomes trivial once the foundation is solid.

## [Outcome](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#outcome)

Create a third app (docs) that reuses all existing shared packages.

## [Fast track](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#fast-track)

1. Create apps/docs with Next.js
2. Configure with shared config
3. Build docs page using shared components
4. Add to dev workflow

## [Hands-on exercise 8.1](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#hands-on-exercise-81)

Create documentation app that showcases the monorepo's components.

**Requirements:**

1. Create apps/docs directory
2. Initialize Next.js app on port 3002
3. Configure shared packages (ui, config, utils)
4. Build API docs page listing components
5. Add environment variables
6. Add to turbo.json and package.json

**Implementation hints:**

- Use create-next-app or copy from existing app
- Reuse all shared packages (no new code needed!)
- Port 3002 to avoid conflicts
- Demonstrate component reuse

## [Create docs app](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#create-docs-app)

### [1. Create directory and initialize](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#1-create-directory-and-initialize)

```
mkdir -p apps/docs
cd apps/docs
```

Create `apps/docs/package.json`:

apps/docs/package.json

```
{
  "name": "@geniusgarage/docs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.x",
    "react": "^18",
    "react-dom": "^18",
    "@geniusgarage/ui": "workspace:*"
  },
  "devDependencies": {
    "@geniusgarage/typescript-config": "workspace:*",
    "@geniusgarage/eslint-config": "workspace:*",
    "typescript": "^5",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

Port 3002 avoids conflicts with web (3000) and app (3001).

### [2. Add TypeScript config](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#2-add-typescript-config)

Create `apps/docs/tsconfig.json`:

apps/docs/tsconfig.json

```
{
  "extends": "@geniusgarage/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### [3. Add Tailwind config](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#3-add-tailwind-config)

Create `apps/docs/tailwind.config.js`:

apps/docs/tailwind.config.js

```
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `apps/docs/app/globals.css`:

apps/docs/app/globals.css

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### [4. Add environment variables](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#4-add-environment-variables)

Create `apps/docs/.env.example`:

apps/docs/.env.example

```
# Public app name
NEXT_PUBLIC_APP_NAME="GeniusGarage Docs"
```

Create `apps/docs/.env.local`:

apps/docs/.env.local

```
NEXT_PUBLIC_APP_NAME="GeniusGarage Docs"
```

## [Build docs page](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#build-docs-page)

Create `apps/docs/app/layout.tsx`:

apps/docs/app/layout.tsx

```
import './globals.css'
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

Create `apps/docs/app/page.tsx`:

apps/docs/app/page.tsx

```
// TODO: Import Button, Card from '@geniusgarage/ui'
// TODO: Import env from '../env'
 
// TODO: Export default function Home() that renders:
//   - Container div with padding and max-width
//   - h1 with env.NEXT_PUBLIC_APP_NAME
//   - p describing "Component Library Documentation"
//   - Grid of Cards showcasing components:
//     - Button Card with examples
//     - Card Card showing the card itself
//     - CodeBlock Card (mentioned but not rendered here)
//   - Each Card should have a title and example usage
```

### Solution

apps/docs/app/page.tsx
```
import { Button } from '@geniusgarage/ui/button'
import { Card } from '@geniusgarage/ui/card'
import { env } from '../env'
 
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{env.NEXT_PUBLIC_APP_NAME}</h1>
      <p className="text-gray-600 mb-8">
        Component library documentation and examples
      </p>
 
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Button</h2>
          <p className="mb-4">Interactive button component with variants</p>
          <div className="space-y-2">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
          </div>
        </Card>
 
        <Card>
          <h2 className="text-2xl font-bold mb-4">Card</h2>
          <p className="mb-4">Container component with shadow and padding</p>
          <p className="text-sm text-gray-600">You're looking at one!</p>
        </Card>
 
        <Card>
          <h2 className="text-2xl font-bold mb-4">CodeBlock</h2>
          <p className="mb-4">Syntax-highlighted code display</p>
          <p className="text-sm text-gray-600">
            Used in snippet manager app for displaying code
          </p>
        </Card>
      </div>
    </div>
  )
}
```
## [Install dependencies](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#install-dependencies)

```
pnpm install
```

This links the workspace packages automatically!

## [Try it](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#try-it)

### [1. Run docs app](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#1-run-docs-app)

```
pnpm --filter @geniusgarage/docs dev
```

Output:

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3002

Ready in 1.8s
```

Open [http://localhost:3002](http://localhost:3002/) - see docs with `Button` and `Card` examples!

### [2. Run all apps together](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#2-run-all-apps-together)

```
pnpm dev
```

Output:

```
@geniusgarage/web:dev: ready on http://localhost:3000
@geniusgarage/snippet-manager:dev: ready on http://localhost:3001
@geniusgarage/docs:dev: ready on http://localhost:3002
```

All 3 apps running in parallel!

### [3. Verify shared components work](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#3-verify-shared-components-work)

Change `Button` in `packages/ui/src/button.tsx`:

```
// Change primary colorprimary: 'bg-green-500 text-white hover:bg-green-600',
```

Hot reload updates ALL 3 apps instantly! Shared components in action.

## [Update root config](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#update-root-config)

Add docs to root `package.json`:

package.json

```
{
  "name": "production-monorepos",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint"
  }
}
```

Workspace glob already includes apps/docs!

## [Verify in turbo](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#verify-in-turbo)

```
turbo build --dry
```

Output:

```
Tasks to Run
@geniusgarage/utils:build
@geniusgarage/ui:build
@geniusgarage/web:build
@geniusgarage/snippet-manager:build
@geniusgarage/docs:build  ← New app detected!

6 tasks
```

Turborepo automatically discovered the new app!

## [How adding apps scales](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#how-adding-apps-scales)

**Before (2 apps):**

```
packages/ui → web, app
```

**After (3 apps):**

```
packages/ui → web, app, docs
```

**Effort to add docs:**

- Created package.json (reused dependencies)
- Created configs (reused shared configs)
- Built page (reused shared components)
- **Total new code: ~50 lines**

**What you didn't need:**

- New component library
- New TypeScript config
- New ESLint config
- New utilities
- New CI pipeline
- New caching setup

Everything just works!

## [Commit](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#commit)

```
git add .
git commit -m "feat(docs): add documentation app"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#done-when)

Verify docs app works:

- [ ] Created apps/docs directory
- [ ] Added package.json with port 3002
- [ ] Created tsconfig.json extending shared config
- [ ] Added Tailwind config
- [ ] Created env.ts with validation
- [ ] Built page with Button and Card examples
- [ ] Installed dependencies with pnpm install
- [ ] Ran docs app on port 3002
- [ ] Ran all 3 apps with pnpm dev
- [ ] Changed shared component and saw hot reload in all apps
- [ ] Verified turbo build includes docs app
- [ ] Understood adding apps scales effortlessly

## [What's Next](docs/course/production-monorepostwith-turborepo/7-add-third-app/1-add-docs-app.md#whats-next)

3 apps running locally, but are they deployed? Next lesson: **Deploy All Apps** - you'll deploy all 3 apps to Vercel as independent projects, proving monorepo deployment scales just as easily as local development.
