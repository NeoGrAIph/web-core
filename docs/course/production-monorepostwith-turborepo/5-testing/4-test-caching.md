source: https://vercel.com/academy/production-monorepos/test-caching
# [Test caching in action](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#test-caching-in-action)

You've seen "cache hit" and "cache miss" in test output, but how does Turborepo decide what to cache? Understanding cache behavior helps you optimize CI/CD pipelines, debug cache issues, and confidently ship faster builds.

Test caching saves massive amounts of time in CI. If only 2 of 20 packages changed, why re-run tests for the other 18? You'll learn what Turborepo hashes, what triggers invalidation, and how to leverage caching for maximum speed.

## [Outcome](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#outcome)

Understand Turborepo's caching mechanism for tests and learn strategies for maximizing cache hits.

## [Fast track](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#fast-track)

1. Examine what Turborepo hashes for test caching
2. Trigger cache misses with different types of changes
3. See selective cache invalidation in action
4. Understand remote caching implications

## [Hands-on exercise 5.4](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#hands-on-exercise-54)

Experiment with test caching to understand how it works.

**Requirements:**

1. Run tests and observe cache behavior
2. Change source files and see cache invalidation
3. Change test files and see cache invalidation
4. Change unrelated files and see cache persist
5. Add new test file and see selective invalidation
6. Understand what Turborepo includes in cache hash

**Implementation hints:**

- Turborepo hashes source files, test files, package.json, and dependencies
- Changes outside the package don't invalidate its cache
- Adding a test file triggers cache miss for that package only
- Use `--dry=json` to see task hash details

## [What Turborepo hashes](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#what-turborepo-hashes)

When you run `turbo test`, Turborepo creates a hash of:

**1. Source files in the package**

- packages/ui/src/button.tsx
- packages/ui/src/card.tsx
- packages/ui/src/code-block.tsx

**2. Test files**

- packages/ui/src/button.test.tsx
- packages/ui/src/card.test.tsx
- packages/ui/src/code-block.test.tsx

**3. Package configuration**

- packages/ui/package.json (dependencies, scripts)
- packages/ui/tsconfig.json
- packages/ui/vitest.config.ts

**4. Global configuration**

- turbo.json
- Root package.json
- .gitignore (affects file detection)

**5. Workspace dependencies**

- `packages/typescript-config` (extended by `packages/ui`)
- `packages/eslint-config` (imported by `packages/ui`)

**Hash formula:**

```
hash = SHA256(
  source_files +
  test_files +
  package_config +
  global_config +
  workspace_dependencies +
  task_command
)
```

If the hash matches a previous run, Turborepo replays cached output.

## [Try it](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#try-it)

### [1. Baseline - full cache hit](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#1-baseline---full-cache-hit)

Run tests twice:

```
turbo testturbo test
```

Output (second run):

```
@geniusgarage/ui:test: cache hit, replaying outputs

Tasks:    1 successful, 5 total
Cached:   1 cached, 5 total
Time:     98ms ⚡
```

Perfect cache hit. Hash unchanged.

### [2. Change source file](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#2-change-source-file)

Edit `packages/ui/src/button.tsx`:

packages/ui/src/button.tsx

```
export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-md font-semibold transition-colors'
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    // Added comment - hash changes
  }
```

Run tests:

```
turbo test
```

Output:

```
@geniusgarage/ui:test: cache miss, executing
@geniusgarage/ui:test: ✓ src/button.test.tsx (5)
...

Tasks:    1 successful, 5 total
Cached:   0 cached, 5 total
Time:     1.187s
```

**Cache miss!** Even a comment changed the hash.

### [3. Change test file](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#3-change-test-file)

Revert button.tsx, then edit `packages/ui/src/button.test.tsx`:

packages/ui/src/button.test.tsx

```
describe('Button component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
    // Added comment
  })
```

Run tests:

```
turbo test
```

Output:

```
@geniusgarage/ui:test: cache miss, executing
```

Cache miss again. Test file changes invalidate cache.

### [4. Change unrelated file](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#4-change-unrelated-file)

Revert test changes, then edit `apps/web/app/page.tsx`:

apps/web/app/page.tsx

```
export default function Home() {
  // Changed app code, not packages/ui
  return <div>...</div>
}
```

Run tests:

```
turbo test
```

Output:

```
@geniusgarage/ui:test: cache hit, replaying outputs

Tasks:    1 successful, 5 total
Cached:   1 cached, 5 total
Time:     102ms ⚡
```

**Cache hit!** Changes in apps/web don't affect packages/ui tests.

### [5. Add new test file](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#5-add-new-test-file)

Create a new test for a component that doesn't exist yet:

packages/ui/src/input.test.tsx

```
import { render, screen } from '@testing-library/react'
 
describe('Input component', () => {
  it('placeholder test', () => {
    // Just a placeholder to demonstrate cache behavior
    expect(true).toBe(true)
  })
})
```

Run tests:

```
turbo test
```

Output:

```
@geniusgarage/ui:test: cache miss, executing
@geniusgarage/ui:test: ✓ src/button.test.tsx (5)
@geniusgarage/ui:test: ✓ src/card.test.tsx (4)
@geniusgarage/ui:test: ✓ src/code-block.test.tsx (5)
@geniusgarage/ui:test: ✓ src/input.test.tsx (1)
```

Cache miss. New test file = new hash.

Delete the placeholder test file:

```
rm packages/ui/src/input.test.tsx
```

### [6. Change dependency (packages/typescript-config)](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#6-change-dependency-packagestypescript-config)

Edit `packages/typescript-config/base.json`:

packages/typescript-config/base.json

```
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,  // No actual change, just testing
    ...
  }
}
```

Run tests:

```
turbo test
```

Output:

```
@geniusgarage/ui:test: cache miss, executing
```

Cache miss! `packages/ui` depends on `packages/typescript-config`, so config changes invalidate ui's cache.

## [Inspect cache hash](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#inspect-cache-hash)

Use `--dry=json` to see what Turborepo hashes:

```
turbo test --dry=json | jq '.tasks[] | {task: .taskId, hash: .hash}'
```

Output:

```
{
  "task": "@geniusgarage/ui#test",
  "hash": "8f7a3b2c1d9e4f5a"
}
```

Each task has a unique hash. Running the same command again produces the same hash (if inputs unchanged).

## [Cache invalidation scenarios](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#cache-invalidation-scenarios)

### [Scenario 1: Source file change](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#scenario-1-source-file-change)

**What changed:** packages/ui/src/button.tsx **Result:** packages/ui tests cache miss **Why:** Source files are part of hash

### [Scenario 2: Test file change](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#scenario-2-test-file-change)

**What changed:** packages/ui/src/button.test.tsx **Result:** packages/ui tests cache miss **Why:** Test files are part of hash

### [Scenario 3: Dependency change](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#scenario-3-dependency-change)

**What changed:** `packages/typescript-config/base.json` **Result:** `packages/ui` tests cache miss (`packages/ui` extends typescript-config) **Why:** Workspace dependencies are part of hash

### [Scenario 4: Unrelated app change](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#scenario-4-unrelated-app-change)

**What changed:** apps/web/app/page.tsx **Result:** packages/ui tests cache HIT **Why:** Apps don't affect package hashes (no dependency)

### [Scenario 5: Global config change](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#scenario-5-global-config-change)

**What changed:** turbo.json test task **Result:** ALL package tests cache miss **Why:** Global config affects all tasks

### [Scenario 6: Script change](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#scenario-6-script-change)

**What changed:** packages/ui/package.json test script **Result:** packages/ui tests cache miss **Why:** Task command is part of hash

## [Cache storage](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#cache-storage)

**Local cache location:**

```
  node_modules/.cache/turbo/
  ├── 8f7a3b2c1d9e4f5a.tar.zst  ← Cached test output
  ├── 1a2b3c4d5e6f7g8h.tar.zst
  └── ...
```

Each hash gets a compressed archive of:

- Terminal output (stdout/stderr)
- outputs (coverage/** if configured)

**Cache size management:** Turborepo automatically prunes old cache entries. Default: keep recent hashes.

## [Remote caching (vercel)](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#remote-caching-vercel)

**Local caching:**

- Cache stored on your machine
- Lost when you clone fresh or switch machines
- Great for dev workflow

**Remote caching (Vercel):**

- Cache stored in the cloud
- Shared across team and CI
- CI builds can reuse local dev cache!

**Enable Vercel remote caching:**

```
pnpm dlx turbo login
pnpm dlx turbo link
```

Now your cache is shared:

```
Developer 1: Runs tests → Uploads cache
Developer 2: Runs tests → Downloads cache (instant!)
CI: Runs tests → Downloads cache from dev
```

Massive CI speedup. If your team already tested locally, CI gets instant cache hits.

## [Cache hit rate optimization](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#cache-hit-rate-optimization)

**Strategies for maximizing cache hits:**

1. **Minimize global config changes**
    
    - Changing turbo.json invalidates ALL caches
    - Make task config changes in batches
2. **Structure packages by change frequency**
    
    - Stable packages (ui, utils) get more cache hits
    - Frequently-changed packages (apps) get fewer hits
3. **Use remote caching in CI**
    
    - Don't rebuild what devs already tested
    - Share cache across PR builds
4. **Keep test scripts stable**
    
    - Changing `"test": "vitest run"` invalidates cache
    - Avoid script churn
5. **Scope dependencies correctly**
    
    - Over-depending causes unnecessary cache misses
    - packages/ui shouldn't depend on apps

## [Real-world impact](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#real-world-impact)

**Without caching:**

```
turbo test  # 12 packages
Time: 4min 23s   # Every test runs every time
```

**With local caching:**

```
turbo test  # 2 packages changed, 10 cached
Time: 45s        # Only changed packages test
```

**With remote caching in CI:**

```
# CI build after dev already ran tests
turbo test  # All 12 packages cached remotely
Time: 8s         # Just downloads and replays cache
```

**4min 23s → 8s** is a 33x speedup!

## [Commit](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#commit)

No code changes in this lesson - it's all about understanding cache behavior.

## [Done-when](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#done-when)

Verify you understand test caching:

- [ ] Ran tests twice and saw cache hit
- [ ] Changed source file and saw cache miss
- [ ] Changed test file and saw cache miss
- [ ] Changed unrelated file and saw cache hi
- [ ] Added new test file and saw cache miss
- [ ] Changed dependency (config) and saw cache miss
- [ ] Understood what Turborepo hashes (source, tests, config, deps)
- [ ] Understood cache invalidation scenarios
- [ ] Learned about local vs remote caching
- [ ] Understood cache hit rate optimization strategies
- [ ] Saw real-world impact numbers (4min → 8s)

## [What's Next](docs/course/production-monorepostwith-turborepo/5-testing/4-test-caching.md#whats-next)

Section 4 complete! You have:

- Vitest configured in packages/ui
- 14 passing component tests
- Test task in Turborepo pipeline
- Understanding of intelligent test caching

**Section 5: Environment Variables** - You'll learn how to manage environment variables in a monorepo, share secrets across apps securely, and configure different environments (dev, staging, production). You'll see how Turborepo handles env vars in caching and how to avoid cache poisoning with sensitive data.
