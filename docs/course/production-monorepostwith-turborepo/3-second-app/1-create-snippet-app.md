source: https://vercel.com/academy/production-monorepos/create-snippet-app
# [Create snippet manager app](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#create-snippet-manager-app)

You have a marketing site (apps/web) that uses shared UI components from `packages/ui`. Pretty cool but could be even better with another app. You'll build a snippet manager app that imports `Button` and `Card` from the same `packages/ui` - proving that your shared package works across multiple applications.

## [Outcome](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#outcome)

Create a second Next.js app (apps/snippet-manager) running on port 3001 that's configured to use the shared packages/ui library.

## [Fast track](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#fast-track)

1. Use `create-next-app` to scaffold the app
2. Rename package and change port to 3001
3. Add workspace dependency on packages/ui

## [Hands-on exercise 3.1](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#hands-on-exercise-31)

Create the snippet manager application using Next.js CLI.

**Requirements:**

1. Use `create-next-app` to scaffold apps/snippet-manager
2. Rename package to `@geniusgarage/snippet-manager` and set dev port to 3001
3. Add `@geniusgarage/ui` workspace dependency
4. Create simple home page placeholder

**Implementation hints:**

- Use `--typescript --app --no-tailwind` flags (we'll style with inline CSS like the web app)
- Port 3001 avoids conflict with web app on 3000
- `workspace:*` links to local packages/ui
- Verify both apps can run simultaneously

## [Create app with Next.js CLI](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#create-app-with-nextjs-cli)

Run create-next-app inside the apps directory:

```
cd appsnpx create-next-app@latest snippet-manager --typescript --app --no-tailwind --no-src-dir --import-alias "@/*" --eslint --no-react-compiler
```

This creates:

```
  apps/snippet-manager/
  ├── app/
  │   ├── layout.tsx
  │   ├── page.tsx
  │   └── globals.css
  ├── package.json
  ├── next.config.ts
  ├── tsconfig.json
  └── ...
```

**Flags explained:**

- `--typescript` - Use TypeScript
- `--app` - Use App Router
- `--no-tailwind` - Skip Tailwind
- `--no-src-dir` - No src/ directory
- `--import-alias "@/*"` - Set up path alias
- `--eslint` - Add ESLint configuration
- `--no-react-compiler` - Skip React compiler for now

## [Rename package and change port](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#rename-package-and-change-port)

Update the generated `apps/snippet-manager/package.json`:

apps/snippet-manager/package.json

```
{
  "name": "@geniusgarage/snippet-manager",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
  ...
}
```

**Changes:**

- `"name"` → `"@geniusgarage/snippet-manager"` - Match workspace naming
- `"dev"` → Add `--port 3001` - Run alongside web app

## [Add UI package dependency](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#add-ui-package-dependency)

Add the shared UI package:

```
pnpm add @geniusgarage/ui --filter @geniusgarage/snippet-manager --workspace
```

This adds to your dependencies:

apps/snippet-manager/package.json

```
{
  "dependencies": {
    "@geniusgarage/ui": "workspace:*",
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

The `workspace:*` protocol tells pnpm this is a local workspace package.

## [Create home page](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#create-home-page)

Replace the generated `apps/snippet-manager/app/page.tsx` with a simple placeholder:

apps/snippet-manager/app/page.tsx

```
export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>GeniusGarage Snippet Manager</h1>
      <p style={{ fontSize: '1.25rem', color: '#666' }}>
        Your code snippets, organized and ready to use.
      </p>
    </div>
  )
}
```

We'll build out the full snippet interface in the next lesson. For now, this confirms the app works.

## [Try it](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#try-it)

### [1. Verify workspace configuration](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#1-verify-workspace-configuration)

Check that pnpm recognizes both apps:

```
pnpm ls --depth 0
```

All three packages are linked in the workspace.

You can run a similar command with turbo. Try:

```
npx turbo ls
```

### [2. Start the snippet manager app](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#2-start-the-snippet-manager-app)

```
pnpm --filter @geniusgarage/snippet-manager dev
```

Output:

```
> @geniusgarage/snippet-manager@1.0.0 dev
> next dev --port 3001

  ▲ Next.js 16.0.0
  - Local:        http://localhost:3001

✓ Starting...
✓ Ready in 1.8s
```

Open [http://localhost:3001](http://localhost:3001/) - you should see "GeniusGarage Snippet Manager".

### [3. Run both apps simultaneously](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#3-run-both-apps-simultaneously)

Stop the previous command and run both apps with Turborepo:

```
pnpm dev
```

Because turbo.json configures dev tasks, both apps start:

```
@geniusgarage/web:dev: ready started server on 0.0.0.0:3000
@geniusgarage/snippet-manager:dev: ready started server on 0.0.0.0:3001
```

Visit both:

- [http://localhost:3000](http://localhost:3000/) - Marketing site with features page
- [http://localhost:3001](http://localhost:3001/) - Snippet manager (placeholder)

Both apps running from one command - that's monorepo orchestration. And you are the conductor!

### [4. Build both apps with Turborepo](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#4-build-both-apps-with-turborepo)

Stop dev servers and build:

```
turbo build
```

Output:

```
@geniusgarage/web:build: cache miss, executing 5.123s
@geniusgarage/snippet-manager:build: cache miss, executing 4.891s

Tasks:    2 successful, 2 total
Cached:   0 cached, 2 total
Time:     5.234s
```

Notice:

- **Both apps build in parallel** (no dependency between them)
- **No UI build** - the UI package is just source files (you'll add a build task in Section 3)
- **Both cache miss** because this is the first build of snippet-manager

This is Turborepo's task orchestration in action.

## [How it works](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#how-it-works)

Your monorepo now has:

```
  production-monorepos-starter/
  ├── apps/
  │   ├── web/              (port 3000)
  │   └── app/              (port 3001) ← New!
  ├── packages/
  │   └── ui/               (shared components)
  ├── package.json
  └── pnpm-workspace.yaml
```

**Workspace dependencies:**

- apps/web depends on packages/ui
- apps/snippet-manager depends on packages/ui (new!)

**Turborepo orchestration:**

1. Run `turbo build`
2. Build packages/ui first (both apps depend on it)
3. Build apps/web and apps/snippet-manager in parallel
4. Cache all three builds

**Development workflow:**

- `pnpm dev` runs both apps simultaneously
- Edit packages/ui - hot reload updates both apps instantly
- Build once, use everywhere

## [Commit](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#commit)

```
git add .
git commit -m "feat(app): add snippet manager app on port 3001"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#done-when)

Verify your second app is configured:

- [ ] Used `create-next-app` to scaffold `apps/snippet-manager`
- [ ] Renamed package to `@geniusgarage/snippet-manager` in package.json
- [ ] Set dev script to run on port 3001
- [ ] Added `@geniusgarage/ui` as workspace dependency
- [ ] Created simple home page with inline styles
- [ ] Ran `pnpm install` to link workspace packages
- [ ] Verified app runs on [http://localhost:3001](http://localhost:3001/)
- [ ] Ran both apps simultaneously with `pnpm dev`
- [ ] Built both apps with `turbo build` and saw parallel execution

## [What's next](docs/course/production-monorepostwith-turborepo/3-second-app/1-create-snippet-app.md#whats-next)

Your snippet manager app is running, but it doesn't use any shared components yet. Next lesson: **Build Snippet List Page** - you'll import `Button` and `Card` from `packages/ui` and display mock snippet data, proving code sharing works across apps.
