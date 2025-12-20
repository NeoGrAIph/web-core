source: https://vercel.com/academy/production-monorepos/github-actions
# [Add GitHub Actions CI pipeline](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#add-github-actions-ci-pipeline)

You've been running `pnpm build`, `pnpm test`, `pnpm lint` locally, but production depends on these passing in CI before deployment. You need automated checks that run on every pull request and push to ensure code quality and catch bugs before they ship.

GitHub Actions integrates seamlessly with Turborepo's caching. You'll configure a CI pipeline that runs all checks in parallel and caches results across builds for faster feedback.

## [Outcome](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#outcome)

Create GitHub Actions workflow that builds, tests, and lints the monorepo with Turborepo caching.

## [Fast track](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#fast-track)

1. Create .github/workflows/ci.yml
2. Configure pnpm and Node.js setup
3. Run build, lint, and test tasks
4. Push and verify CI runs on GitHub

## [Hands-on exercise 7.1](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#hands-on-exercise-71)

Set up GitHub Actions CI pipeline for the monorepo.

**Requirements:**

1. Create .github/workflows/ci.yml
2. Set up pnpm with caching
3. Install dependencies with `pnpm install`
4. Run `turbo build lint test` in parallel
5. Test by pushing to GitHub and verify CI runs

**Implementation hints:**

- Use pnpm/action-setup for pnpm installation
- Use actions/cache for node_modules
- Use actions/setup-node for Node.js
- Turborepo automatically caches in CI

## [Create GitHub Actions workflow](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#create-github-actions-workflow)

Create `.github/workflows/ci.yml`:

.github/workflows/ci.yml

```
# TODO: Name the workflow "CI"
 
# TODO: Set up trigger on:
# - push to main branch
# - pull_request (all branches)
 
# TODO: Create 'build' job that runs on ubuntu-latest with steps:
# 1. checkout code (actions/checkout@v4)
# 2. setup pnpm (pnpm/action-setup@v2 with version 8)
# 3. setup Node.js (actions/setup-node@v4 with node-version 20, cache 'pnpm')
# 4. install dependencies (run: pnpm install)
# 5. run Turborepo tasks (run: Turbo build lint test)
```

**Your task:** Write the complete workflow file.

**Hints:**

- Workflow syntax: `name`, `on`, `jobs`
- Each job has `runs-on` and `steps`
- Steps can use `uses` (actions) or `run` (commands)
- actions/setup-node cache: 'pnpm' caches node_modules

Solution

**What this does:**

- **Triggers** on push to main and all PRs
- **Sets up** pnpm + Node.js with caching
- **Installs** dependencies once
- **Runs** all Turborepo tasks in parallel

## [Try it](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#try-it)

### [1. Commit and push workflow](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#1-commit-and-push-workflow)

```
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow"
git push origin main
```

### [2. View workflow run](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#2-view-workflow-run)

Go to your GitHub repository → Actions tab.

You'll see the CI workflow running with output like:

```
Setup pnpm             ✓ 3s
Setup Node.js          ✓ 12s (cache hit)
Install dependencies   ✓ 18s
Run build, lint, test  ✓ 2m 34s
  @geniusgarage/utils:build     ✓
  @geniusgarage/ui:build        ✓
  @geniusgarage/ui:test         ✓
  @geniusgarage/web:build       ✓
  @geniusgarage/snippet-manager:build       ✓
  @geniusgarage/web:lint        ✓
  @geniusgarage/snippet-manager:lint        ✓
```

All tasks run in parallel!

### [3. Make a PR and see checks](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#3-make-a-pr-and-see-checks)

Create a new branch:

```
git checkout -b test-ci
echo "# Test CI" >> README.md
git add .
git commit -m "test: verify CI pipeline"
git push origin test-ci
```

Create PR on GitHub. You'll see:

```
✓ CI / build (pull_request)   Successful in 2m 45s
```

CI runs automatically on every PR!

### [4. Verify caching works](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#4-verify-caching-works)

Push another commit to the same PR (without code changes):

```
echo "# Another commit" >> README.md
git add .
git commit -m "test: verify cache"
git push
```

Second run is faster:

```
Run build, lint, test  ✓ 15s (was 2m 34s)
  @geniusgarage/ui:test: cache hit, replaying
  @geniusgarage/web:build: cache hit, replaying
  ...
```

Turborepo cached everything!

Remote Caching in CI

For even better caching across machines and team members, use Vercel's remote caching. This is covered in detail in the **Remote Caching** lesson where you'll add `TURBO_TOKEN` and `TURBO_TEAM` to your CI environment variables.

Remote caching allows cache sharing across:

- Different developers on your team
- CI and local development
- Different branches and PRs

Without remote caching, each machine only uses its local cache.

## [CI best practices](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#ci-best-practices)

**1. Run tasks in parallel**

```
# ✅ good - one command, Turborepo parallelizes
run: turbo build lint test
 
# ❌ bad - sequential steps
run: turbo build
run: turbo lint
run: turbo test
```

**2. Cache dependencies**

```
# ✅ good - cache node_modules
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'
 
# ❌ bad - no cache, slow installs
- uses: actions/setup-node@v4
```

**3. Use specific action versions**

```
# ✅ good - pinned version
uses: actions/checkout@v4
 
# ❌ bad - unpinned, may break
uses: actions/checkout@latest
```

**4. Fail fast**

```
# Turborepo exits on first failure automatically# No need to configure this manually
```

## [Understanding CI output](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#understanding-ci-output)

**Turborepo in CI shows:**

```
• Packages in scope: 5 packages
• Running build in 5 packages
• Running lint in 2 packages
• Running test in 1 package

@geniusgarage/ui:test: cache miss, executing
@geniusgarage/web:build: cache miss, executing
@geniusgarage/snippet-manager:build: cache hit, replaying

Tasks:    8 successful, 8 total
Cached:   1 cached, 8 total
Time:     2m 15s
```

**Cache behavior in CI:**

- First run: All cache misses
- Subsequent runs: Cache hits for unchanged packages
- Different branches: Shared cache if using Turborepo cache action

## [Commit](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#commit)

```
git add .github/workflows/ci.yml
git commit -m "ci: optimize GitHub Actions with Turborepo caching"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#done-when)

Verify CI pipeline works:

- [ ] Created .github/workflows/ci.yml
- [ ] Configured triggers (push to main, pull_request)
- [ ] Set up pnpm with pnpm/action-setup
- [ ] Set up Node.js with actions/setup-node
- [ ] Configured pnpm cache
- [ ] Added install step with pnpm install
- [ ] Added turbo step running build, lint, test
- [ ] Pushed workflow and saw it run on GitHub
- [ ] Created PR and saw CI checks pass
- [ ] Verified caching works on subsequent runs
- [ ] Understood parallel task execution in CI

## [What's Next](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/1-github-actions.md#whats-next)

CI is running all tasks, but it rebuilds everything even if only one app changed. Next lesson: **Filtering and Git-Based Filtering** - you'll learn to run tasks only for changed packages using `--filter` and `--filter=[main]`, dramatically speeding up CI for large PRs.
