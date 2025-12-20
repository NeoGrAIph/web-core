source: https://vercel.com/academy/production-monorepos/extract-card
# [Extract card component](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#extract-card-component)

You have 6 identical card divs in the features page. Each one has the same structure:

```
<div style={{ padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
  <h3>Title</h3>
  <p>Content</p>
</div>
```

This has been copy-pasted 6 times. Change the border color? Update 6 places. Add this card to another page? Copy-paste again.

Extract it once into `packages/ui`, and all instances stay in sync automatically.

## [Outcome](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#outcome)

Extract the `Card` component to a shared package and experience instant workspace synchronization across all apps.

## [Fast track](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#fast-track)

1. Create `packages/ui/src/card.tsx` component with title and children props
2. Add `Card` to package exports (package.json + index.ts)
3. Add `@geniusgarage/ui` dependency to web app + configure transpilation
4. Replace inline divs with `<Card>` components in features page
5. Test instant updates by changing `Card` styles in dev mode

## [Hands-on exercise 2.3](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#hands-on-exercise-23)

Extract the 6 duplicate card divs from the features page into a reusable Card component in the shared UI package.

**Requirements:**

1. Create `Card` component in `packages/ui/src/card.tsx` with optional title and children props
2. Export `Card` from `packages/ui` (both package.json exports field and index.ts)
3. Add `@geniusgarage/ui` as a workspace dependency in `apps/web/package.json`
4. Replace all 6 inline card divs with `<Card>` components
5. Verify instant hot-reload updates when modifying the `Card` component

**Implementation hints:**

- Use `title?: string` for optional title prop (renders h3 only if provided)
- Use `workspace:*` protocol in package.json to link local package (not npm)
- Next.js 15+ with Turbopack automatically handles local packages - no additional config needed
- Test the monorepo magic: change Card border color and watch all 6 cards update instantly
- Keep the dev server running during changes to see hot module replacement work

**Files to create/modify:**

- `packages/ui/src/card.tsx` (new file)
- `packages/ui/package.json` (add exports field)
- `packages/ui/src/index.ts` (export Card)
- `apps/web/package.json` (add dependency)
- `apps/web/app/features/page.tsx` (use Card component)

## [Create the card component](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#create-the-card-component)

Create `packages/ui/src/card.tsx` with the component code:

packages/ui/src/card.tsx

```
export interface CardProps {
  title?: string
  children: React.ReactNode
}
 
export function Card({ title, children }: CardProps) {
  return (
    <div style={{
      padding: '2rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
    }}>
      {title && (
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginTop: 0,
          marginBottom: '0.5rem'
        }}>
          {title}
        </h3>
      )}
      <div style={{ color: '#666' }}>
        {children}
      </div>
    </div>
  )
}
```

This extracts the structure you've been copying. The `title` prop is optional - if provided, it renders an h3.

## [Add card to package exports](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#add-card-to-package-exports)

Update `packages/ui/package.json` to export the Card:

packages/ui/package.json

```
{
  "name": "@geniusgarage/ui",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    "./card": "./src/card.tsx"
  },
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

The `"./card": "./src/card.tsx"` export means apps can import with:

```
import { Card } from '@geniusgarage/ui/card'
```

Also export from the index file:

packages/ui/src/index.ts

```
export { Card } from './card'
```

## [Add UI package to web app](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#add-ui-package-to-web-app)

The web app needs to declare its dependency on the UI package. Open `apps/web/package.json`:

apps/web/package.json

```
{
  "name": "@geniusgarage/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@geniusgarage/ui": "workspace:*",
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^16.0.0",
    "typescript": "^5"
  }
}
```

The `workspace:*` protocol tells pnpm to link to the local `packages/ui` instead of looking for it on npm.

**What `workspace:*` means:**

- `workspace:` = use local package from this monorepo
- `*` = use whatever version the package declares (don't version-lock)
- Result: instant updates without publishing to npm

npm workspaces

If using npm instead of pnpm, use `"*"` instead of `"workspace:*"`:

```
"dependencies": {
  "@geniusgarage/ui": "*"
}
```

npm workspaces don't support the `workspace:` protocol, but `*` achieves the same local linking behavior.

Install to create the symlink. A symlink (symbolic link) is a file that points to another file or directory, like a shortcut. In this case, it points to the `packages/ui` directory.

```
pnpm install
```

You'll see output confirming the workspace link:

```
Packages: +1
+
Progress: resolved 1, reused 0, downloaded 0, added 1, done
```

## [Next.js automatically handles local packages](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#nextjs-automatically-handles-local-packages)

With Next.js 15+ and Turbopack (now the default), local monorepo packages work automatically - no configuration needed! Next.js detects workspace packages and compiles them on the fly.

### No transpilePackages needed

Previous Next.js versions required `transpilePackages: ['@geniusgarage/ui']` in `next.config.js`. With modern Next.js and Turbopack, this is **no longer necessary** for local packages.

If you're using an older Next.js version (< 15) without Turbopack, you may need to add:

apps/web/next.config.js

```
module.exports = {
  transpilePackages: ['@geniusgarage/ui'],
}
```

## [Use card in features page](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#use-card-in-features-page)

Now replace the inline cards with the shared Card component. Open `apps/web/app/features/page.tsx`:

apps/web/app/features/page.tsx

```
import Link from 'next/link'
import { Card } from '@geniusgarage/ui/card'
 
export default function Features() {
  return (
    <main style={{ padding: '4rem 2rem', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#000' }}>
          🧠 GeniusGarage
        </Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/features" style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>Features</Link>
        </div>
      </nav>
 
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>Features</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem', textAlign: 'center' }}>
        Everything you need to manage your code snippets
      </p>
 
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <Card title="⚡ Fast Search">
          Find your snippets instantly with powerful full-text search and filtering by tags
        </Card>
        <Card title="📁 Organized">
          Keep your code organized with tags, folders, and collections
        </Card>
        <Card title="🔗 Shareable">
          Share snippets with your team or make them public for the community
        </Card>
        <Card title="🎨 Syntax Highlighting">
          Beautiful syntax highlighting for 100+ programming languages
        </Card>
        <Card title="📋 One-Click Copy">
          Copy snippets to your clipboard with a single click
        </Card>
        <Card title="🔐 Private & Secure">
          Your private snippets stay private with enterprise-grade security
        </Card>
      </div>
    </main>
  )
}
```

Look how clean this is! From 6 duplicate `<div>` blocks to 6 `<Card>` components.

## [Try it](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#try-it)

### [1. Start the dev server](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#1-start-the-dev-server)

```
pnpm dev
```

You should see:

```
 >>> @geniusgarage/web:dev: ready started server on 0.0.0.0:3000
 >>> @geniusgarage/web:dev:   ▲ Next.js 16.0.0
 >>> @geniusgarage/web:dev:   - Local:        http://localhost:3000
 >>> @geniusgarage/web:dev:   ✓ Compiled /features in 247ms
```

### [2. Open the features page](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#2-open-the-features-page)

Navigate to **[http://localhost:3000/features](http://localhost:3000/features)**

You should see:

- 6 cards in a responsive grid
- Each card has an emoji + title (⚡ Fast Search, 📁 Organized, etc.)
- Gray borders around each card

The page looks identical to before, but now uses the shared Card component from `packages/ui`.

## [Experience instant workspace updates](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#experience-instant-workspace-updates)

### [3. Test the monorepo magic](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#3-test-the-monorepo-magic)

With the dev server still running, change the Card component's border style:

packages/ui/src/card.tsx

```
export interface CardProps {
  title?: string
  children: React.ReactNode
}
 
export function Card({ title, children }: CardProps) {
  return (
    <div style={{
      padding: '2rem',
      border: '2px solid #3b82f6',  // Changed: Blue border instead of gray
      borderRadius: '0.5rem',
    }}>
      {title && (
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginTop: 0,
          marginBottom: '0.5rem'
        }}>
          {title}
        </h3>
      )}
      <div style={{ color: '#666' }}>
        {children}
      </div>
    </div>
  )
}
```

**Save the file.** Watch your browser - the dev server hot-reloads and **all 6 cards instantly update** with the new blue border. No manual refresh needed.

**This is workspace dependency magic:** Change the component once in `packages/ui`, and all apps using it update immediately. No npm publishing, no version bumping, no waiting. Just instant synchronization.

### [4. Change it back](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#4-change-it-back)

Before continuing, revert to the original gray border:

packages/ui/src/card.tsx

```
export function Card({ title, children }: CardProps) {
  return (
    <div style={{
      padding: '2rem',
      border: '1px solid #e5e7eb',  // Back to gray
      borderRadius: '0.5rem',
    }}>
      {/* Keep all other code (title rendering, children) the same */}
    </div>
  )
}
```

#### Workspace Dependencies Working

You just experienced the core monorepo benefit:

1. Extract component to shared package
2. Import with `workspace:*`
3. Change component → instant updates everywhere

No publishing, no registry, no waiting. Just instant synchronization.

## [What you built](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#what-you-built)

You created your first shared component:

**Before:**

```
// 6 duplicate divs with inline styles
<div style={{ padding: '2rem', border: '1px solid #e5e7eb', ... }}>
  <h3>⚡ Fast Search</h3>
  <p>Find your snippets...</p>
</div>
```

**After:**

```
// 6 clean component calls
<Card title="⚡ Fast Search">
  Find your snippets...
</Card>
```

Change the border color, add animations, update spacing - do it once in `packages/ui/src/card.tsx` and all 6 cards update automatically.

## [Troubleshooting](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#troubleshooting)

Build Error: Cannot find module 'react/jsx-runtime'

If you get a TypeScript error about `react/jsx-runtime`, make sure your `packages/ui/package.json` includes the `devDependencies` section with React types:

```
"devDependencies": {
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "typescript": "^5"
}
```

Then run `pnpm install` to install the types.

## [Commit](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#commit)

Save your work:

```
git add .
git commit -m "feat(ui): extract Card component to shared package"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#done-when)

Verify your implementation:

- [ ] Card component exists at `packages/ui/src/card.tsx` with title and children props
- [ ] Card is exported from `packages/ui/package.json` exports field
- [ ] Card is exported from `packages/ui/src/index.ts`
- [ ] Web app has `@geniusgarage/ui: "workspace:*"` dependency
- [ ] Features page displays 6 cards using `<Card>` components
- [ ] Changing Card border color updates all 6 cards instantly in dev mode
- [ ] Page loads at [http://localhost:3000/features](http://localhost:3000/features) with responsive grid

## [What's Next](docs/course/production-monorepostwith-turborepo/2-first-shared-package/3-extract-card.md#whats-next)

Next lesson: **Add More Components with v0** - You'll use Vercel's v0 to generate a pricing card component, extract Button from the home page, add a lint task to the UI package, and experience Turborepo orchestrating tasks across packages with caching.
