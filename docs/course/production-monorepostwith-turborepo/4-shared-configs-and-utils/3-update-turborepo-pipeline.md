source: https://vercel.com/academy/production-monorepos/update-turborepo-pipeline
# [Update Turborepo pipeline](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#update-turborepo-pipeline)

Turborepo has been building your packages in the correct order (packages first, then apps), but you haven't explicitly configured this - it's been guessing based on workspace dependencies. As your monorepo grows, you need explicit task configuration to control build order, caching, and parallel execution.

You'll configure `turbo.json` to define task dependencies: "build apps only after building their package dependencies" and "lint apps only after linting packages." This gives you full control over task orchestration.

## [Outcome](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#outcome)

Understand and configure Turborepo's task pipeline with explicit dependencies.

## [Fast track](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#fast-track)

1. Review current turbo.json configuration
2. Understand ^build and ^lint dependency syntax
3. Visualize the dependency graph
4. Test build and lint with dependency order

## [Hands-on exercise 4.3](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#hands-on-exercise-43)

Configure Turborepo task dependencies for optimal build orchestration.

**Requirements:**

1. Review turbo.json task configuration
2. Understand `dependsOn: ["^build"]` syntax
3. Add build script to packages (ui, utils, config)
4. Run `turbo build` and observe execution order
5. Run `turbo lint` and see parallel execution
6. Understand when tasks run in parallel vs sequential

**Implementation hints:**

- `^build` means "dependencies' build tasks first"
- Tasks without dependencies run in parallel
- Each package needs a build script in package.json
- Use --dry flag to see execution plan

## [Review current turbo.json](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#review-current-turbojson)

Open `turbo.json`:

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

Let's understand what each field means:

**build task:**

- `"dependsOn": ["^build"]` - Run build on all workspace dependencies first
- `"outputs": [".next/**", ...]` - Cache these directories after build

**lint task:**

- `"dependsOn": ["^lint"]` - Lint dependencies before linting this package

**dev task:**

- `"cache": false"` - Never cache dev (it's a watch mode)
- `"persistent": true"` - Keep running after completion

## [Understanding dependency syntax](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#understanding-dependency-syntax)

The `^` prefix means "workspace dependencies":

```
{
  "build": {
    "dependsOn": ["^build"]
  }
}
```

**Translation:** "Before building this package, first run build on all packages it depends on"

**Example flow for apps/snippet-manager:**

```
apps/snippet-manager depends on:
  - packages/ui
  - packages/utils

Run: turbo build --filter=@geniusgarage/snippet-manager

Execution order:
1. Build packages/ui
2. Build packages/utils
3. Build apps/snippet-manager (after dependencies complete)
```

**Without `^` prefix:**

```
{
  "build": {
    "dependsOn": ["lint"]  // No ^ prefix
  }
}
```

This means: "Before building, run lint **in the same package**"

## [Add build scripts to packages](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#add-build-scripts-to-packages)

Currently, only apps have build scripts. Add build to packages:

### [Packages/ui/package.json](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#packagesuipackagejson)

packages/ui/package.json

```
{
  "scripts": {
    "build": "tsc --noEmit",
    "lint": "eslint ."
  }
}
```

TypeScript type-checking is the "build" for UI components.

### [Packages/utils/package.json](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#packagesutilspackagejson)

packages/utils/package.json

```
{
  "scripts": {
    "build": "tsc --noEmit",
    "lint": "eslint ."
  }
}
```

Same - just type-check the utilities.

Config Packages Don't Need Build Scripts

Notice we're NOT adding build scripts to `packages/typescript-config` or `packages/eslint-config`. These packages export static JSON and JavaScript files - there's nothing to build or compile. They're pure configuration.

Only packages with source code that needs transformation (like TypeScript compilation) need build scripts.

## [Try it](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#try-it)

### [1. See the execution plan (dry run)](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#1-see-the-execution-plan-dry-run)

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
```

Notice the order:

1. **Packages first** (utils, ui) - they have no dependencies
2. **Apps last** (web, snippet-manager) - they depend on packages

Packages run in **parallel** (no dependencies on each other). Apps run **after** packages complete.

### [2. Run the actual build](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#2-run-the-actual-build)

```
turbo build
```

Output:

```
@geniusgarage/utils:build: tsc --noEmit
@geniusgarage/ui:build: tsc --noEmit
✓ All package builds complete

@geniusgarage/web:build: next build
@geniusgarage/snippet-manager:build: next build
✓ All app builds complete

Tasks:    4 successful, 4 total
Cached:   0 cached, 4 total
Time:     11.234s
```

**Execution flow:**

1. utils, ui build in **parallel** (type-checking only)
2. Wait for all packages to complete
3. web, snippet-manager build in **parallel** (full Next.js builds)

### [3. Run build again (see caching)](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#3-run-build-again-see-caching)

```
turbo build
```

Output:

```
@geniusgarage/utils:build: cache hit, replaying outputs
@geniusgarage/ui:build: cache hit, replaying outputs
@geniusgarage/web:build: cache hit, replaying outputs
@geniusgarage/snippet-manager:build: cache hit, replaying outputs

Tasks:    4 successful, 4 total
Cached:   4 cached, 4 total
Time:     195ms ⚡
```

**11s → 195ms** because everything was cached!

### [4. Change a util and rebuild](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#4-change-a-util-and-rebuild)

Edit `packages/utils/src/index.ts`:

packages/utils/src/index.ts

```
export function formatDate(date: Date): string {
  // Add a comment to invalidate cache
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
```

Run build:

```
turbo build
```

Output:

```
@geniusgarage/utils:build: cache miss, executing 1.123s
@geniusgarage/ui:build: cache hit
@geniusgarage/web:build: cache hit
@geniusgarage/snippet-manager:build: cache miss, executing 4.891s

Tasks:    4 successful, 4 total
Cached:   2 cached, 4 total
Time:     5.234s
```

**Smart caching:**

- ui, web **cached** (unchanged)
- utils **rebuilt** (source changed)
- snippet-manager **rebuilt** (depends on utils which changed)

Turborepo detected that `apps/snippet-manager` depends on `packages/utils`, so it rebuilt the app even though the app's code didn't change!

## [How Turborepo orchestrates tasks](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#how-turborepo-orchestrates-tasks)

Your monorepo has this dependency structure:

```
apps/web depends on:
  └─ packages/ui
  └─ packages/typescript-config (devDependency - no build)
  └─ packages/eslint-config (devDependency - no build)

apps/snippet-manager depends on:
  └─ packages/ui
  └─ packages/utils
  └─ packages/typescript-config (devDependency - no build)
  └─ packages/eslint-config (devDependency - no build)

packages/utils depends on:
  └─ packages/typescript-config (devDependency - no build)
  └─ packages/eslint-config (devDependency - no build)

packages/ui depends on:
  └─ packages/typescript-config (devDependency - no build)
  └─ packages/eslint-config (devDependency - no build)
```

Why Config Packages Aren't in the Build Graph

```
Config packages (`typescript-config`, `eslint-config`) are devDependencies that apps use at build time, but they don't have their own build tasks. They export static files, so Turborepo doesn't need to orchestrate them.

Only packages with `build` scripts appear in the execution graph.

**When you run `turbo build`:**

1. **Level 1 (parallel):**
    
    - packages/utils (no build dependencies)
    - packages/ui (no build dependencies)
2. **Level 2 (parallel, after Level 1):**
    
    - apps/web (depends on ui)
    - apps/snippet-manager (depends on ui, utils)
```

Turborepo automatically figures out this order based on workspace dependencies and `^build` configuration!

## [Common turbo.json patterns](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#common-turbojson-patterns)

### [Run tests before build](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#run-tests-before-build)

```
{
  "build": {
    "dependsOn": ["test", "^build"],
    "outputs": [".next/**"]
  }
}
```

This runs tests in the same package, then builds dependencies, then builds the package.

### [Cache-only tasks](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#cache-only-tasks)

```
{
  "test": {
    "cache": true,
    "outputs": ["coverage/**"]
  }
}
```

Tests are cached. Re-run only when source code changes.

### [Never cache](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#never-cache)

```
{
  "deploy": {
    "cache": false
  }
}
```

Deploy tasks should never be cached.

## [Commit](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#commit)

No code changes needed - turbo.json was already configured correctly. But let's add build scripts:

```
git add .
git commit -m "chore: add build scripts to all packages"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#done-when)

Verify Turborepo pipeline works:

- [ ] Reviewed turbo.json configuration
- [ ] Understood `^build` syntax means "dependencies first"
- [ ] Understood `^lint` syntax for lint dependencies
- [ ] Added build script to `packages/ui` (tsc --noEmit)
- [ ] Added build script to `packages/utils` (tsc --noEmit)
- [ ] Understood why config packages don't need build scripts (static files)
- [ ] Ran `turbo build --dry` and saw execution plan
- [ ] Ran `turbo build` and saw packages build first, then apps
- [ ] Ran `turbo build` again and saw full cache hit
- [ ] Changed packages/utils and saw selective rebuild
- [ ] Saw apps/snippet-manager rebuild (depends on changed utils)
- [ ] Understood how Turborepo determines task execution order
- [ ] Understood parallel execution (packages) vs sequential (dependencies)

## [What's Next](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/3-update-turborepo-pipeline.md#whats-next)

Section 3 complete! You have:

- 3 shared packages (ui, config, utils)
- Centralized configuration
- Explicit task dependencies
- Smart caching and orchestration

**Section 4: Testing** - Add Vitest to packages/ui, write component tests, configure Turbo for tests, and see test caching in action. You'll prove that testing works seamlessly in monorepos with proper task orchestration.
