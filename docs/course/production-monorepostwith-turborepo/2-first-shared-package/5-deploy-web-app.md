source: https://vercel.com/academy/production-monorepos/deploy-web-app
# [Deploy web app](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#deploy-web-app)

Your monorepo works locally. Now let's deploy it to Vercel and see Turborepo in action during CI/CD. Vercel uses Turborepo under the hood, so your builds will be cached across deployments. Change one file → only affected packages rebuild.

You'll also see how to configure Vercel to build just the web app (not the entire monorepo).

## [Outcome](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#outcome)

Deploy the web app to Vercel production and experience Turborepo's remote caching in CI (2s cached vs 16s full build).

## [Fast track](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#fast-track)

1. Build the web app with Turborepo and see local caching (50x speedup)
2. Commit and push to GitHub
3. Deploy to Vercel with proper monorepo build configuration
4. Experience remote caching in CI (change README → cache hit)

## [Hands-on exercise 2.5](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#hands-on-exercise-25)

Deploy the web app to Vercel and experience Turborepo's remote caching in production CI/CD.

**Requirements:**

1. Build web app locally with `turbo build --filter=web` and observe caching
2. Inspect build output in `apps/web/.next/`
3. Clean builds with `turbo build --force` to bypass cache
4. Commit all changes and push to GitHub
5. Deploy to Vercel with proper build settings:
    - Root Directory: leave blank (monorepo root)
    - Build Command: `turbo build --filter=web`
    - Output Directory: `apps/web/.next`
6. Watch Turborepo cache in Vercel build logs
7. Make a change and deploy again to see cache invalidation
8. Change README only and see remote cache hit (2s vs 16s)

**Implementation hints:**

- `--filter=web` ensures only web app builds, not entire monorepo
- Local cache: `~/.turbo/` or `.turbo/cache/`
- Remote cache: Vercel automatically uses Turborepo remote caching
- Build logs show cache hits: "cache hit (remote), restoring outputs"
- Vercel detects monorepo automatically if turbo.json exists at root

**Key concepts to experience:**

- **Local caching:** 50x speedup on unchanged builds
- **Filtered builds:** Only build what's needed for deployment
- **Remote caching:** CI reuses cache from previous builds
- **Selective rebuilds:** Change web → rebuild web, change README → cache hit

## [Build for production](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#build-for-production)

First, let's see what a production build looks like. Run:

```
turbo build --filter=@geniusgarage/web
```

Watch the output:

```
 Tasks:    1 successful, 1 total
 Cached:   0 cached, 1 total
   Time:   14.287s

 >>> @geniusgarage/web:build
   ▲ Next.js 16.0.0
   - Environments: .env

   Creating an optimized production build ...
   ✓ Compiled successfully
   ✓ Linting and checking validity of types
   ✓ Collecting page data
   ✓ Generating static pages (3/3)
   ✓ Collecting build traces
   ✓ Finalizing page optimization

  Route (app)                              Size     First Load JS
  ┌ ○ /                                    5.12 kB        95.1 kB
  ├ ○ /features                            1.85 kB        91.8 kB
  └ ○ /_not-found                          871 B          90.9 kB
```

This builds the web app. Notice:

- Next.js compiled 3 pages (home, features, not-found)
- Total bundle size ~95 kB for the home page
- All pages are static (○ symbol)

Run it again:

```
turbo build --filter=@geniusgarage/web
```

```
 Tasks:    1 successful, 1 total
 Cached:   1 cached, 1 total
   Time:   0.287s ⚡

 >>> @geniusgarage/web:build: cache hit, replaying outputs
```

**0.287s vs 14.287s** - cached! This is what will happen in CI after the first deploy.

Why Only One Build Task?

Notice Turborepo only ran 1 task (`@geniusgarage/web:build`). The UI package doesn't have its own build step - it's consumed as TypeScript source and compiled directly into the web app's Next.js build.

This is a common pattern for simple React component libraries. The UI package provides `.tsx` source files, and the Next.js app handles all the compilation (TypeScript, JSX, bundling). Turborepo still tracks the UI package - if you change a `Button` component, the web build cache invalidates and rebuilds.

## [Inspect build output](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#inspect-build-output)

Check what Turborepo cached:

```
ls apps/web/.next/
```

You'll see the Next.js build output. Pay special attention to:

- `static/` - Static assets
- `server/` - Server-side code
- `BUILD_ID` - Unique build identifier

Turborepo cached all of this. If you change the UI package, the web app will rebuild. But if you change something unrelated (like a README), the cache stays valid.

## [Clean and rebuild](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#clean-and-rebuild)

Delete the build output:

```
apps/web/.next
```

Now run build again:

```
turbo build --filter=@geniusgarage/web
```

```
 Tasks:    1 successful, 1 total
 Cached:   1 cached, 1 total
   Time:   0.195s

 >>> @geniusgarage/web:build: cache hit, replaying logs
```

**Turborepo restored the entire `.next/` directory from cache in 0.195 seconds!**

Check `apps/web/.next/` again - it's back. This is what makes Turborepo so fast in CI.

## [Commit your work](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#commit-your-work)

Before deploying, commit your changes:

```
git add .git commit -m "feat: add shared UI package with Button and Card components"
```

Push to GitHub:

```
git push origin main
```

Make sure you've initialized a Git repo and connected it to GitHub. If not, follow [GitHub's instructions](https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories) to create a new repo and push.

## [Deploy to Vercel](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#deploy-to-vercel)

Go to [vercel.com](https://vercel.com/) and sign in with GitHub.

Click **"Add New"**, select **"Project"**, and import your repository.

**Configure Build Settings:**

Vercel will auto-detect Next.js. You need to tell it to build only the web app:

1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** `apps/web`
3. **Build Command:** `cd ../.. && turbo build --filter=web`
4. **Output Directory:** `.next` (default)
5. **Install Command:** `pnpm install` (default)

Why Override Build Command?

The default Next.js build command is `next build`, which doesn't use Turborepo. By using `turbo build --filter=web`, you get:

- Turborepo caching (faster rebuilds)
- Dependency awareness (rebuilds if UI package changes)
- Consistent with local development

The `cd ../..` navigates to the monorepo root before running turbo.

Click **Deploy**.

## [Watch Turborepo in CI](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#watch-turborepo-in-ci)

While deploying, click **"Build Logs"**. You'll see:

```
Running "pnpm install"
...
Running "cd ../.. && turbo build --filter=web"

 Tasks:    1 successful, 1 total
 Cached:   0 cached, 1 total  (first deploy - nothing cached)
   Time:   16.234s

 >>> @geniusgarage/web:build
   ▲ Next.js 16.0.0
   Creating an optimized production build ...
   ✓ Compiled successfully
```

**First deploy:** ~16 seconds, 0 cached.

Now make a small change. Update the home page:

apps/web/app/page.tsx

```
<h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠 GeniusGarage</h1><p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '2rem' }}>  Your code snippet library</p>
```

Commit and push:

```
git add .git commit -m "update tagline"git push
```

Watch the new build logs:

```
Running "cd ../.. && turbo build --filter=web"

 Tasks:    1 successful, 1 total
 Cached:   0 cached, 1 total
   Time:   15.891s
```

Still not cached (we changed a file in web). But now change just the README:

```
echo "# GeniusGarage" > README.mdgit add .git commit -m "docs: add readme"git push
```

Watch this build:

```
 Tasks:    1 successful, 1 total
 Cached:   1 cached, 1 total  ← Cached!
   Time:   348ms

 >>> @geniusgarage/web:build: cache hit (remote), replaying logs
```

**348ms vs 16 seconds** - Turborepo used the remote cache from the previous build!

Remote Caching in Action

Vercel stores Turborepo cache remotely. When files outside `apps/web` change (like README.md), the web build stays cached. This dramatically speeds up CI when you have multiple apps and packages.

Later in Section 6, you'll enable remote caching for your local machine too.

## [Verify deployment](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#verify-deployment)

Once deployed, Vercel gives you a URL like `https://your-app.vercel.app`.

Visit it and test:

- Home page shows `Button` from `@geniusgarage/ui`
- Features page shows `Card` components from `@geniusgarage/ui`
- Navigation works
- Everything looks identical to local

Your shared package is working in production!

## [What you deployed](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#what-you-deployed)

Your production build includes:

- `apps/web` - The Next.js app
- `packages/ui` - Bundled into the web app

The UI package isn't deployed separately - it's compiled into the web app's bundle. This is important: shared packages are build-time dependencies, not runtime deployments.

## [Build performance over time](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#build-performance-over-time)

As your monorepo grows, you'll see the caching benefits compound:

**Scenario 1: Change UI package**

- UI package rebuilds
- Web app rebuilds (depends on UI)
- Other apps cache hit (didn't change)

**Scenario 2: Change web app only**

- Web app rebuilds
- UI package cache hit (didn't change)
- Other apps cache hit (didn't change)

**Scenario 3: Change docs or configs**

- Everything cache hit if it doesn't affect build inputs

This is how teams with 50+ packages keep CI fast.

## [Troubleshooting](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#troubleshooting)

**Build fails with "Cannot find module '@geniusgarage/ui'"**

- Verify `@geniusgarage/ui: workspace:*` is in `apps/web/package.json`
- Run `pnpm install` to ensure workspace packages are linked

**Build is slow even with caching**

- Vercel free tier has CPU limits
- Check that build command uses `--filter=web` (not building entire monorepo)

**Changes to UI package don't rebuild web app**

- Turborepo is working correctly - cache stays valid when dependencies don't change
- Force rebuild: `git commit --allow-empty -m "force rebuild" && git push`

## [Done-when](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#done-when)

Verify your deployment:

- [ ] Ran `turbo build --filter=web` locally and saw 14s build
- [ ] Ran build again and saw cache hit (0.3s, 50x faster)
- [ ] Inspected build output in `apps/web/.next/`
- [ ] Tested clean build with `--force` flag
- [ ] Committed all changes to git
- [ ] Pushed to GitHub repository
- [ ] Created Vercel project connected to GitHub repo
- [ ] Configured Vercel build settings:
    - [ ] Build Command: `turbo build --filter=web`
    - [ ] Output Directory: `apps/web/.next`
- [ ] First Vercel deployment succeeded (~16s)
- [ ] Visited deployed URL and verified:
    - [ ] Home page loads with shared `Button`
    - [ ] Features page shows 6 shared `Card` components
    - [ ] Navigation works between pages
    - [ ] No console errors
## [What's next](docs/course/production-monorepostwith-turborepo/2-first-shared-package/5-deploy-web-app.md#whats-next)

**Section 2: Second App** - You'll add a second app (the snippet manager) that reuses the same UI package. This is where monorepos really shine - both apps stay in sync automatically, and Turborepo caches builds across both.
