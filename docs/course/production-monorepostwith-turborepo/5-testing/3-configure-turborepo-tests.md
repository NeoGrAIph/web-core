source: https://vercel.com/academy/production-monorepos/configure-turborepo-tests
# [Configure Turborepo for tests](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#configure-turborepo-for-tests)

You can run tests in packages/ui, but to run tests across the entire monorepo you need to execute `pnpm --filter` multiple times. As you add more packages with tests, this becomes tedious. You need a single command to test everything in parallel with intelligent caching.

Turborepo already orchestrates build and lint tasks. You'll add test as a pipeline task so Turborepo runs tests in dependency order, caches results, and only re-runs tests when code changes.

## [Outcome](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#outcome)

Add test task to turbo.json and run tests across the monorepo with caching and parallelization.

## [Fast track](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#fast-track)

1. Add test task to turbo.json
2. Add test scripts to package.json files
3. Run `turbo test` across workspace
4. Verify caching works for tests

## [Hands-on exercise 5.3](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#hands-on-exercise-53)

Configure Turborepo to run tests across all packages.

**Requirements:**

1. Add test task to turbo.json with:
    - No dependsOn (tests don't depend on other tasks)
    - outputs: ['coverage/**'] to cache coverage reports
2. Add test script to root package.json: `turbo test`
3. Verify packages/ui has test script
4. Run `turbo test` to execute all tests
5. Run again to see cache hits
6. Understand when tests run and when they're cached

**Implementation hints:**

- Test task doesn't need `^test` dependency (no workspace dependencies)
- Coverage output should be cached if you generate coverage reports
- Tests are cached based on source file changes
- Use --force to bypass cache

## [Add test task to turbo.json](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#add-test-task-to-turbojson)

Open `turbo.json` and add the test task:

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
    "test": {
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**What this means:**

- **No dependsOn** - Tests run independently, don't wait for build/lint
- **outputs: ["coverage/**"]** - Cache coverage reports (if generated)
- **cache: true** (default) - Cache test results

**Why no `^test`?** Unlike build and lint, tests don't have cross-package dependencies. You don't need to test packages/ui before testing apps/snippet-manager - they can run in parallel.

## [Add test script to root](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#add-test-script-to-root)

Update root `package.json`:

package.json

```
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test"
  }
}
```

Now you can run `pnpm test` from root to test all packages.

## [Verify package scripts](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#verify-package-scripts)

Check that packages/ui has a test script (you added it in lesson 4.1):

packages/ui/package.json

```
{
  "scripts": {
    "lint": "eslint .",
    "test": "vitest run",
    "dev:test": "vitest"
  }
}
```

Good! packages/ui is ready for Turborepo orchestration.

**Future packages:** When you add more packages (`packages/utils`, `packages/typescript-config`, `packages/eslint-config`), add test scripts there too if they have tests. Note: config packages typically don't have tests since they're just static configuration files.

## [Try it](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#try-it)

### [1. Run tests across monorepo](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#1-run-tests-across-monorepo)

```
turbo test
```

Output:

```
• Packages in scope: @geniusgarage/ui, @geniusgarage/web, @geniusgarage/snippet-manager, @geniusgarage/utils
• Running test in 4 packages

@geniusgarage/ui:test: cache miss, executing
@geniusgarage/ui:test:
@geniusgarage/ui:test: ✓ src/button.test.tsx (5)
@geniusgarage/ui:test: ✓ src/card.test.tsx (4)
@geniusgarage/ui:test: ✓ src/code-block.test.tsx (5)
@geniusgarage/ui:test:
@geniusgarage/ui:test: Test Files  3 passed (3)
@geniusgarage/ui:test:      Tests  14 passed (14)
@geniusgarage/ui:test:   Duration  412ms

Tasks:    1 successful, 5 total
Cached:   0 cached, 5 total
Time:     1.234s
```

**What happened:**

- Turborepo found all packages with test scripts
- Only packages/ui has tests, so only it ran
- Other packages (config, utils, web, app) have no test script, so they're skipped
- Total time: 1.234s (includes Turborepo overhead)

### [2. Run tests again (see caching)](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#2-run-tests-again-see-caching)

```
turbo test
```

Output:

```
• Packages in scope: @geniusgarage/ui
• Running test in 1 package

@geniusgarage/ui:test: cache hit, replaying outputs

Tasks:    1 successful, 5 total
Cached:   1 cached, 5 total
Time:     127ms ⚡
```

**1.234s → 127ms!** Turborepo cached the test results and replayed them instantly.

### [3. Change a component and re-test](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#3-change-a-component-and-re-test)

Edit `packages/ui/src/button.tsx`:

packages/ui/src/button.tsx

```
export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  // Add comment to invalidate cache
  const baseStyles = 'px-4 py-2 rounded-md font-semibold transition-colors'
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

Tasks:    1 successful, 5 total
Cached:   0 cached, 5 total
Time:     1.189s
```

Cache miss! Turborepo detected the source file changed and re-ran tests.

### [4. Run with --dry to see execution plan](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#4-run-with---dry-to-see-execution-plan)

```
turbo test --dry
```

Output:

```
Tasks to Run
@geniusgarage/ui:test

1 task
```

Only packages/ui has tests, so only it would run.

### [5. Force re-run with --force](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#5-force-re-run-with---force)

Bypass cache entirely:

```
turbo test --force
```

Output:

```
@geniusgarage/ui:test: cache bypass, force executing
@geniusgarage/ui:test: ✓ src/button.test.tsx (5)
...

Tasks:    1 successful, 5 total
Cached:   0 cached, 5 total
Time:     1.201s
```

Tests run even though nothing changed. Useful for debugging cache issues.

## [Add tests to other packages (optional)](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#add-tests-to-other-packages-optional)

Currently only packages/ui has tests. You can add tests to packages/utils:

Create `packages/utils/src/index.test.ts`:

packages/utils/src/index.test.ts

```
// TODO: Import formatDate, slugify, truncate, validateEmail from './index'
 
// TODO: Create describe block for 'formatDate'
//   - Test: 'formats date correctly'
//     - Create date: new Date('2024-01-15')
//     - Assert: formatDate(date) equals 'Jan 15, 2024'
 
// TODO: Create describe block for 'slugify'
//   - Test: 'converts text to slug'
//     - Assert: slugify('Hello World!') equals 'hello-world'
//   - Test: 'removes special characters'
//     - Assert: slugify('Test@#$%') equals 'test'
 
// TODO: Create describe block for 'truncate'
//   - Test: 'truncates long text'
//     - Assert: truncate('Hello World', 5) equals 'Hello...'
//   - Test: 'does not truncate short text'
//     - Assert: truncate('Hi', 5) equals 'Hi'
 
// TODO: Create describe block for 'validateEmail'
//   - Test: 'validates correct email'
//     - Assert: validateEmail('test@example.com') is true
//   - Test: 'rejects invalid email'
//     - Assert: validateEmail('invalid') is false
```

### Solution

packages/utils/src/index.test.ts
```
import { describe, it, expect } from 'vitest'
import { formatDate, slugify, truncate, validateEmail } from './index'
 
describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('Jan 15, 2024')
  })
})
 
describe('slugify', () => {
  it('converts text to slug', () => {
    expect(slugify('Hello World!')).toBe('hello-world')
  })
 
  it('removes special characters', () => {
    expect(slugify('Test@#$%')).toBe('test')
  })
})
 
describe('truncate', () => {
  it('truncates long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...')
  })
 
  it('does not truncate short text', () => {
    expect(truncate('Hi', 5)).toBe('Hi')
  })
})
 
describe('validateEmail', () => {
  it('validates correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true)
  })
 
  it('rejects invalid email', () => {
    expect(validateEmail('invalid')).toBe(false)
  })
})
```

Add vitest and test script to `packages/utils/package.json`:

```
pnpm add -D vitest --filter @geniusgarage/utils
```

packages/utils/package.json

```
{
  "scripts": {
    "lint": "eslint .",
    "test": "vitest run"
  }
}
```

Create minimal vitest config for utils (no jsdom needed for pure functions):

packages/utils/vitest.config.ts

```
import { defineConfig } from 'vitest/config'
 
export default defineConfig({
  test: {
    globals: true,
  },
})
```

Now run tests:

```
turbo test
```

Output:

```
@geniusgarage/ui:test: cache hit, replaying outputs
@geniusgarage/utils:test: cache miss, executing
@geniusgarage/utils:test: ✓ src/index.test.ts (4)

Tasks:    2 successful, 5 total
Cached:   1 cached, 5 total
Time:     891ms
```

Both packages test in parallel! packages/ui cache hit, packages/utils runs fresh.

## [How test caching works](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#how-test-caching-works)

Turborepo caches test results based on:

1. **Input files** - Source files, test files, dependencies
2. **Test command** - The actual test script
3. **Environment** - Node version, env vars

**Cache invalidation happens when:**

- Source files change (button.tsx)
- Test files change (button.test.tsx)
- package.json changes (dependencies, scripts)
- Workspace dependencies change (packages/ui changes → apps using it don't re-test)

**Cache hits happen when:**

- No input changes since last run
- Same environment (Node version, etc.)
- Hash matches previous run

## [Understanding test task configuration](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#understanding-test-task-configuration)

**Your test task:**

```
{
  "test": {
    "outputs": ["coverage/**"]
  }
}
```

**Why no dependsOn?**

```
{
  "lint": {
    "dependsOn": ["^lint"]  // Lint dependencies first
  },
  "test": {
    // No dependsOn - tests are independent
  }
}
```

Tests don't need to wait for dependency tests to complete. packages/ui tests and apps/snippet-manager tests can run simultaneously.

**Why cache tests?**

- Tests are deterministic (same input → same output)
- Re-running unchanged tests wastes CI time
- Cached tests give instant feedback

## [Commit](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#commit)

```
git add .
git commit -m "feat(turbo): add test task to pipeline"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#done-when)

Verify test orchestration works:

- [ ] Added test task to turbo.json
- [ ] Set outputs to ['coverage/**'] for test caching
- [ ] Added test script to root package.json: `turbo test`
- [ ] Verified packages/ui has test script
- [ ] Ran `turbo test` and saw tests execute
- [ ] Ran `turbo test` again and saw cache hit
- [ ] Changed component file and saw cache miss
- [ ] Ran `turbo test --dry` and saw execution plan
- [ ] Ran `turbo test --force` to bypass cache
- [ ] Understood test tasks run independently (no dependsOn)
- [ ] Understood cache invalidates on file changes
- [ ] (Optional) Added tests to packages/utils

## [What's Next](docs/course/production-monorepostwith-turborepo/5-testing/3-configure-turborepo-tests.md#whats-next)

Tests are cached, but how does caching actually work? Next lesson: **Test Caching** - you'll learn exactly what triggers cache invalidation, how Turborepo hashes inputs, and strategies for maximizing cache hits in CI/CD pipelines.
