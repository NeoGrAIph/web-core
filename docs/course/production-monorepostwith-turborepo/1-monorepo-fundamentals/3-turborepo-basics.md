source: https://vercel.com/academy/production-monorepos/turborepo-basics
# [Turborepo basics](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#turborepo-basics)

You have a monorepo with pnpm workspaces. Code sharing works. But two problems remain: everything rebuilds even when unchanged (10-minute CI runs for one-line changes), and coordinating build order across packages is complex - you need to ensure dependencies build before dependents.

Turborepo solves both with intelligent caching and automatic task orchestration. Let's see it work.

## [Outcome](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#outcome)

Experience Turborepo's intelligent caching with a 17x speedup on unchanged builds and selective rebuilding when code changes.

## [Fast track](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#fast-track)

1. Run `turbo build` and see ~5 second build
2. Run it again unchanged - see 17x speedup from cache (296ms vs 5s)
3. Change a file - see selective rebuild with automatic cache invalidation
4. Explore turbo.json to understand caching configuration

## [Hands-on exercise 1.3](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#hands-on-exercise-13)

Experience Turborepo's core feature - intelligent caching - by running builds and seeing automatic optimization in action.

**Requirements:**

1. Run initial build with `turbo build` and record baseline time (~5s)
2. Run build again without changes and see cache hit (17x faster)
3. Modify source code and see cache invalidation + selective rebuild
4. Run build again to see new cache created
5. Explore `turbo.json` to understand caching configuration

**Implementation hints:**

- Pay attention to cache hit messages: "cache hit, replaying outputs"
- Notice the time difference: ~5s vs ~300ms
- Understand what triggers cache invalidation (source code, dependencies, environment variables)
- Learn turbo.json patterns: `^build` means "dependencies' build tasks"
- Notice `outputs` defines what build artifacts get cached (`.next/**`); logs are cached automatically

**Key concepts to experience:**

- **Hashing inputs:** Turborepo hashes source + deps to create cache key
- **Cache hit:** Same hash = restore from cache instantly
- **Cache miss:** Different hash = rebuild and create new cache
- **Selective rebuilding:** Only changed packages rebuild, others use cache

## [Experience the cache firsthand](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#experience-the-cache-firsthand)

Make sure you're in the starter directory:

```
cd production-monorepos-starter
```

Run your first Turborepo build:

```
turbo build
```

Watch the output:

```
 Tasks:    1 successful, 1 total
 Cached:   0 cached, 1 total
   Time:   5.123s
```

Notice:

- **0 cached** - First build, nothing in cache
- **Time: ~5s** - Full Next.js build

Now run the **exact same command** again without changing anything:

```
turbo build
```

```
 >>> @geniusgarage/web:build: cache hit, replaying outputs [22B]

 Tasks:    1 successful, 1 total
 Cached:   1 cached, 1 total
 Time:   296ms >>> FULL TURBO
```

**296ms vs 5.1s** - that's a **17x speedup**! (Your numbers will vary slightly.)

Minimal Configuration

Turborepo works with minimal setup. It automatically:

- Hashed your source code and dependencies
- Cached the `.next` build output
- Detected no changes on the second run
- Restored from cache instantly

This is what makes monorepos faster than managing separate repos.

## [See cache invalidation](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#see-cache-invalidation)

Caching only helps when nothing changes. Let's see what happens when you modify code. Open `apps/web/app/page.tsx` and change the tagline:

apps/web/app/page.tsx

```
<p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '2rem' }}>
  Store your genius code snippets
</p>
```

Change to:

apps/web/app/page.tsx

```
<p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '2rem' }}>
  Manage and share your code snippets
</p>
```

Save and build again:

```
turbo build
```

```
 >>> @geniusgarage/web:build: cache miss, executing [hash: e7f4a9c2]

 Tasks:    1 successful, 1 total
 Cached:   0 cached, 1 total
   Time:   4.891s
```

Turborepo detected the change and rebuilt. The cache was invalidated because source code changed.

Run it once more (no changes):

```
turbo build
```

```
 >>> @geniusgarage/web:build: cache hit, replaying outputs

 Tasks:    1 successful, 1 total
 Cached:   1 cached, 1 total
   Time:   134ms >>> FULL TURBO
```

Fast again! Turborepo cached the new build with the updated code.

Selective rebuilding comes later

Right now there's only one package, so cache invalidation affects everything. Once you add shared packages and multiple apps, you'll see true selective rebuilding: change `packages/ui` → only apps using it rebuild, other packages stay cached.

## [Try it](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#try-it)

Let's verify your understanding with a few more experiments.

### [1. Check Turborepo version](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#1-check-turborepo-version)

```
turbo --version
```

You should see:

```
2.6.0
```

### [2. Dry run to see what would execute](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#2-dry-run-to-see-what-would-execute)

See what Turborepo plans to do without actually running it:

```
turbo build --dry-run
```

Output shows:

```
Tasks to Run
build
  Task            = build
  Package         = @geniusgarage/web
  Hash            = e7f4a9c2abc123
  Cached (Local)  = true
  Cached (Remote) = false
  Directory       = apps/web
  Command         = next build
  Outputs         = .next/**, !.next/cache/**
  Log File        = .turbo/turbo-build.log
  Dependencies    =
  Dependents      =
```

Notice:

- **Hash:** Unique identifier for this build configuration
- **Cached (Local):** Whether this exact build is already cached
- **Outputs:** What files get stored in cache

### [3. Revert your change](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#3-revert-your-change)

Change the tagline back to original:

apps/web/app/page.tsx

```
<p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '2rem' }}>
  Store your genius code snippets
</p>
```

Build again:

```
turbo build
```

Since you're back to the original code, Turborepo will find the **original cache** (from your very first build) and restore it instantly. The cache remembers every unique state!

```
  >>> @geniusgarage/web:build: cache hit, replaying outputs
 
  Tasks:    1 successful, 1 total
  Cached:   1 cached, 1 total
    Time:   142ms >>> FULL TURBO
```

**Cache hit!** Even though you made changes in between, Turborepo remembers the original hash and restores that exact build.

## [How caching works](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#how-caching-works)

What you just experienced:

1. **First build** - Turborepo hashes inputs (source code, dependencies) and stores outputs (`.next/**`) with that hash
2. **Second build (unchanged)** - Hash matches, restore from cache
3. **Modified file** - Hash changes, cache miss, rebuild
4. **Third build (unchanged)** - New hash matches new cache, instant restore

This works for **any task**: build, test, lint, custom scripts.

What Gets Cached?

Turborepo caches based on:

- Source code files
- Dependencies in package.json
- Environment variables (specified in `env`)
- Configuration files

Change any of these → cache invalidates → task reruns.

## [Explore turbo.json](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#explore-turbojson)

Now that you've seen caching work, let's understand the configuration. Open `turbo.json`:

```
cat turbo.json
```

You'll see:

turbo.json

```
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
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

Let's break it down piece by piece.

### [Globaldependencies](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#globaldependencies)

turbo.json

```
"globalDependencies": ["**/.env.*local"]
```

**What it does:** Any file matching this pattern invalidates ALL caches.

**Why:** Environment variables affect all apps. If `.env.local` changes, everything should rebuild.

### [Tasks.build configuration](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#tasksbuild-configuration)

turbo.json

```
"build": {
  "dependsOn": ["^build"],
  "outputs": [".next/**", "!.next/cache/**"]
}
```

**dependsOn**: `["^build"]`

- The `^` means "dependencies' build tasks"
- Before building this package, build all packages it depends on first
- Right now you only have one app, but once you add `packages/ui`, Turborepo will build it before building `apps/web`

**outputs**: What to cache

- `.next/**` - Cache everything in the `.next` directory
- `!.next/cache/**` - EXCEPT the Next.js internal cache (negation pattern)

### [Tasks.dev configuration](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#tasksdev-configuration)

turbo.json

```
"dev": {
  "cache": false,
  "persistent": true
}
```

**cache: false** - Don't cache dev servers (they're always fresh)

**persistent: true** - Keep the dev server running (don't kill it after task completes)

This is the Turborepo 2.x pattern for long-running tasks like `next dev`.

You just experienced Turborepo's core benefits:

- **17x faster builds** through intelligent caching
- **Automatic cache invalidation** when code changes
- **Minimal configuration** - it worked immediately
- **Hash-based caching** - Turborepo remembers every unique build state

Next, you'll add shared packages and see how Turborepo orchestrates builds across multiple packages, running tasks in parallel and caching selectively.

## [Commit](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#commit)

This is an exploratory lesson with no code changes (you reverted the tagline change), so there's nothing to commit. Section 1 begins the real building.

## [Done-when](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/3-turborepo-basics.md#done-when)

Verify you've experienced Turborepo's caching:

- [ ] Ran initial `turbo build` and saw ~5s build time
- [ ] Ran build again unchanged and saw cache hit (~300ms, 17x faster)
- [ ] Modified `apps/web/app/page.tsx` and saw cache miss + rebuild
- [ ] Ran build again and saw new cache hit with updated code
- [ ] Checked Turborepo version with `--version` flag
- [ ] Used `--dry-run` to preview build plan without executing
- [ ] Understood caching workflow: hash inputs → check cache → build or restore
- [ ] Explored `turbo.json` and understood key concepts
- [ ] Ready for Section 1 where you'll see caching with multiple packages

Time to build.
