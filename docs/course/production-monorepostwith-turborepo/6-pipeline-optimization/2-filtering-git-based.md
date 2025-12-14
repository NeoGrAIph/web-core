source: https://vercel.com/academy/production-monorepos/filtering-git-based
# [Filtering and git-based filtering](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#filtering-and-git-based-filtering)

Your CI builds everything every time. If you change one line in apps/web, CI rebuilds packages/ui, packages/utils, and apps/snippet-manager too - wasting time. You need to run tasks only for changed packages and their dependents.

Turborepo's `--filter` flag lets you scope tasks to specific packages. Combined with git-based filtering (`--filter=[main]`), CI automatically detects changed packages since the last commit and only runs necessary tasks.

## [Outcome](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#outcome)

Use `--filter` to run selective tasks and enable git-based filtering in CI for incremental builds.

## [Fast track](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#fast-track)

1. Learn `--filter` syntax for targeting packages
2. Use `--filter=[main]` for changed packages
3. Update CI to use git-based filtering
4. See massive time savings on incremental changes

## [Hands-on exercise 7.2](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#hands-on-exercise-72)

Implement selective task execution with filtering.

**Requirements:**

1. Run tasks for single package: `--filter @geniusgarage/web`
2. Run tasks with dependencies: `--filter=@geniusgarage/web...`
3. Use git-based filtering: `--filter=[main]`
4. Update GitHub Actions to use git-based filtering
5. Test with small change to verify selective builds

**Implementation hints:**

- `--filter` selects specific packages
- `...` includes dependents (packages that depend on this one)
- `^...` includes dependencies (packages this one depends on)
- `[main]` compares against main branch for changed packages

## [Filter syntax](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#filter-syntax)

### [Filter single package](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#filter-single-package)

```
# Build only apps/web
turbo build --filter @geniusgarage/web
```

Output:

```
• Packages in scope: @geniusgarage/web
• Running build in 1 package

@geniusgarage/web:build: cache miss, executing

Tasks:    1 successful, 1 total
```

Only apps/web builds!

### [Filter with dependencies](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#filter-with-dependencies)

```
# Build apps/web and everything it depends on
turbo build --filter @geniusgarage/web...
```

Output:

```
• Packages in scope: @geniusgarage/ui, @geniusgarage/web
• Running build in 2 packages

@geniusgarage/ui:build        ✓
@geniusgarage/web:build       ✓

Tasks:    3 successful, 3 total
```

Builds web + its dependencies (ui, config).

### [Filter dependents](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#filter-dependents)

```
# Build packages/ui and everything that depends on it
turbo build --filter @geniusgarage/ui...
```

Output:

```
• Packages in scope: @geniusgarage/ui, @geniusgarage/web, @geniusgarage/snippet-manager
• Running build in 3 packages
```

Builds ui + apps that use it (web, app).

## [Git-based filtering](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#git-based-filtering)

### [Filter changed packages](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#filter-changed-packages)

```
# Build only packages changed since main branch
turbo build --filter=[main]
```

If you changed packages/ui:

```
• Packages in scope: @geniusgarage/ui, @geniusgarage/web, @geniusgarage/snippet-manager
• Running build in 3 packages (changed: ui, dependents: web, app)
```

Turborepo automatically includes dependents!

### [How it works](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#how-it-works)

```
# What changed?
git diff main...HEAD --name-only
packages/ui/src/button.tsx
 
# Turbo includes:
# - packages/ui (changed)
# - apps/web (depends on ui)
# - apps/snippet-manager (depends on ui)
```

## [Try it](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#try-it)

### [1. Test filtering locally](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#1-test-filtering-locally)

Make a change to packages/ui:

packages/ui/src/button.tsx

```
// Add comment
export function Button() {
  // Changed!
```

Run with git filter:

```
git add .
git commit -m "test: change button"
turbo build --filter=[HEAD^]
```

Output:

```
• Packages in scope: @geniusgarage/ui, @geniusgarage/web, @geniusgarage/snippet-manager
```

Only ui + dependents build!

### [2. Update CI with git filtering](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#2-update-ci-with-git-filtering)

Update `.github/workflows/ci.yml`:

.github/workflows/ci.yml

```
name: CI
 
on:
  push:
    branches:
      - main
  pull_request:
 
jobs:
  build:
    runs-on: ubuntu-latest
 
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Fetch all history for git filtering
 
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
 
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
 
      - name: Cache Turborepo
        uses: actions/cache@v3
        with:
          path: node_modules/.cache/turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-
 
      - name: Install dependencies
        run: pnpm install
 
      - name: Run build, lint, and test (changed packages only)
        run: turbo build lint test --filter=[origin/main]
```

**Key changes:**

- `fetch-depth: 0` - Fetch full git history (needed for comparison)
- `--filter=[origin/main]` - Compare against remote main branch

### [3. Test incremental CI](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#3-test-incremental-ci)

Make a small change:

```
echo "# Update" >> apps/web/README.md
git add .
git commit -m "docs: update web readme"
git push
```

CI output:

```
• Packages in scope: @geniusgarage/web
• Running build in 1 package
• Skipped: @geniusgarage/snippet-manager, @geniusgarage/ui, etc.

Tasks:    1 successful, 1 total
Time:     23s (was 2m 45s!)
```

**2m 45s → 23s** on incremental change!

## [Filter patterns](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#filter-patterns)

**Exact package:**

```
--filter @geniusgarage/web
```

**Package + dependencies:**

```
--filter @geniusgarage/web...
```

**Package + dependents:**

```
--filter ...@geniusgarage/ui
```

**Multiple packages:**

```
--filter @geniusgarage/web --filter @geniusgarage/snippet-manager
```

**All apps:**

```
--filter "./apps/*"
```

**All packages:**

```
--filter "./packages/*"
```

**Changed since main:**

```
--filter=[main]
```

## [CI optimization strategy](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#ci-optimization-strategy)

**Branch builds (PRs):**

```
# Only changed packages
run: turbo build lint test --filter=[origin/main]
```

**Main branch builds:**

```
# Full build (no filter)
run: turbo build lint test
```

Conditional example:

```
- name: Run tasks
  run: |
    if [ "${{ github.ref }}" == "refs/heads/main" ]; then
      turbo build lint test
    else
      turbo build lint test --filter=[origin/main]
    fi
```

## [Commit](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#commit)

```
git add .github/workflows/ci.yml
git commit -m "ci: add git-based filtering for incremental builds"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#done-when)

Verify filtering works:

- [ ] Ran `--filter @geniusgarage/web` and saw only web build
- [ ] Ran `--filter @geniusgarage/web...` and saw web + dependencies
- [ ] Ran `--filter ...@geniusgarage/ui` and saw ui + dependents
- [ ] Ran `--filter=[HEAD^]` and saw only changed packages
- [ ] Updated CI with fetch-depth: 0
- [ ] Updated CI with --filter=[origin/main]
- [ ] Tested incremental change and saw selective builds
- [ ] Understood ... suffix for dependencies and dependents
- [ ] Understood [branch] syntax for git-based filtering

## [What's Next](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/2-filtering-git-based.md#whats-next)

Filtering speeds up CI, but cache is still local to each machine. Next lesson: **Remote Caching** - you'll configure Vercel remote cache so your team shares build artifacts across machines, enabling instant cache hits even on fresh clones.
