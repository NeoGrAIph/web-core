source: https://vercel.com/academy/production-monorepos/set-up-vitest
# [Set up Vitest in UI package](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#set-up-vitest-in-ui-package)

You're shipping UI components that both apps depend on. If you break Button's styling or Card's layout, both apps break. Manual testing doesn't scale - you need automated tests that run on every change and prove components work before apps consume them.

Vitest is the natural choice for monorepos: it's fast, works with TypeScript out of the box, and integrates seamlessly with Turborepo's caching. You'll configure it in packages/ui and see how testing fits into the monorepo workflow.

## [Outcome](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#outcome)

Install Vitest in packages/ui with React Testing Library and configure the test environment.

## [Fast track](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#fast-track)

1. Install vitest and testing dependencies in packages/ui
2. Create vitest.config.ts with jsdom environment
3. Add test script to packages/ui/package.json
4. Run a smoke test to verify setup

## [Hands-on exercise 5.1](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#hands-on-exercise-51)

Configure Vitest for React component testing in packages/ui.

**Requirements:**

1. Install vitest, @testing-library/react, @testing-library/jest-dom, jsdom
2. Create vitest.config.ts with:
    - jsdom test environment
    - globals: true for describe/it/expect without imports
    - setupFiles pointing to test setup file
3. Create src/test/setup.ts with testing-library matchers
4. Add test script: `vitest run` to package.json
5. Add dev:test script: `vitest` for watch mode
6. Verify setup with a simple smoke test

**Implementation hints:**

- Use `pnpm add -D` for dev dependencies in packages/ui
- Vitest config is similar to Vite config
- jsdom simulates browser environment for React rendering
- setupFiles runs before each test file

## [Install Vitest dependencies](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#install-vitest-dependencies)

Navigate to packages/ui and install testing tools:

```
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom --filter @geniusgarage/ui
```

**What each does:**

- **vitest** - Fast test runner, Vite-native
- **@testing-library/react** - Render React components in tests
- **@testing-library/jest-dom** - Custom matchers (toBeInTheDocument, toHaveClass, etc.)
- **jsdom** - Simulates browser DOM in Node.js

## [Create Vitest config](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#create-vitest-config)

Create `packages/ui/vitest.config.ts`:

packages/ui/vitest.config.ts

```
// TODO: Import defineConfig from 'vitest/config'
// TODO: Export default config with:
//   - test.environment: 'jsdom'
//   - test.globals: true
//   - test.setupFiles: ['./src/test/setup.ts']
```

**Your task:** Implement the Vitest config.

**Hints:**

- `import { defineConfig } from 'vitest/config'`
- Config structure: `export default defineConfig({ test: { ... } })`
- Environment options: 'node', 'jsdom', 'happy-dom'

Solution

**What this does:**

- **environment: 'jsdom'** - Provides window, document, etc. for React components
- **globals: true** - No need to import describe, it, expect in every test
- **setupFiles** - Runs before all tests (we'll add custom matchers here)

## [Create test setup file](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#create-test-setup-file)

Create `packages/ui/src/test/setup.ts`:

packages/ui/src/test/setup.ts

```
// TODO: Import '@testing-library/jest-dom' to enable custom matchers
//   - This adds matchers like toBeInTheDocument(), toHaveClass(), etc.
//   - Just import it, no need to call anything
```

**Your task:** Add the import.

### Solution

packages/ui/src/test/setup.ts
```
import '@testing-library/jest-dom'
```

This single import adds dozens of useful matchers for DOM testing. Now you can write:

```
expect(button).toBeInTheDocument()
expect(button).toHaveClass('bg-blue-500')
expect(button).toHaveTextContent('Click me')
```

## [Add test scripts](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#add-test-scripts)

Update `packages/ui/package.json`:

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

**Two scripts:**

- **test** - Run all tests once (for CI, Turborepo pipeline)
- **dev:test** - Run tests in watch mode (for development)

## [Create a smoke test](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#create-a-smoke-test)

Let's verify the setup works with a simple test.

Create `packages/ui/src/button.test.tsx`:

packages/ui/src/button.test.tsx

```
// TODO: Import render, screen from '@testing-library/react'
// TODO: Import Button from './button'
 
// TODO: Create describe block for 'Button component'
//   - Test 1: 'renders with children'
//     - Render: <Button>Click me</Button>
//     - Assert: screen.getByText('Click me') is in the document
//   - Test 2: 'applies primary variant by default'
//     - Render: <Button>Test</Button>
//     - Assert: button has 'bg-blue-500' class
```

**Your task:** Write the test file.

**Hints:**

- `describe('Button component', () => { ... })`
- `it('test description', () => { ... })`
- `render(<Button>Click me</Button>)`
- `expect(screen.getByText('Click me')).toBeInTheDocument()`
- `expect(screen.getByRole('button')).toHaveClass('bg-blue-500')`

### Solution

packages/ui/src/button.test.tsx
```
import { render, screen } from '@testing-library/react'
import { Button } from './button'
 
describe('Button component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
 
  it('applies primary variant by default', () => {
    render(<Button>Test</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-500')
  })
})
```

## [Try it](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#try-it)

### [1. Run the test](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#1-run-the-test)

```
pnpm --filter @geniusgarage/ui test
```

Output:

```
✓ src/button.test.tsx (2)
  ✓ Button component (2)
    ✓ renders with children
    ✓ applies primary variant by default

Test Files  1 passed (1)
     Tests  2 passed (2)
  Start at  10:23:45
  Duration  234ms
```

Your first passing tests! 🎉

### [2. Test watch mode](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#2-test-watch-mode)

```
pnpm --filter @geniusgarage/ui dev:test
```

Output:

```
WATCH MODE enabled

✓ src/button.test.tsx (2) 234ms

Waiting for file changes...
press h to show help, press q to quit
```

Leave this running and edit `packages/ui/src/button.tsx` - tests automatically re-run!

### [3. Intentionally break a test](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#3-intentionally-break-a-test)

Edit the Button component to remove the primary background:

packages/ui/src/button.tsx

```
export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-md font-semibold transition-colors'
  const variants = {
    primary: 'bg-red-500 text-white hover:bg-blue-600',  // Changed blue to red
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  }
```

Watch mode immediately shows failure:

```
FAIL src/button.test.tsx > Button component > applies primary variant by default
AssertionError: expected element to have class "bg-blue-500"

Received: "bg-red-500 text-white hover:bg-blue-600 px-4 py-2 ..."
```

Revert the change - tests pass again. This is the feedback loop in action.

### [4. Verify TypeScript integration](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#4-verify-typescript-integration)

Try importing a non-existent component:

```
import { FakeButton } from './button'
```

Vitest shows TypeScript errors before running tests. Type safety works!

## [How Vitest works in monorepos](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#how-vitest-works-in-monorepos)

Your test setup is now part of the workspace:

```
  packages/ui/
  ├── src/
  │   ├── button.tsx          ← Component
  │   ├── button.test.tsx     ← Test
  │   └── test/setup.ts       ← Global test config
  ├── vitest.config.ts        ← Vitest settings
  └── package.json            ← test scripts

  apps/web, apps/snippet-manager
  └── Use packages/ui components (tested!)
```

**Benefits:**

- **Test at source** - Tests live next to components
- **Shared testing setup** - One vitest config for all UI components
- **Fast feedback** - Watch mode for instant validation
- **Type-safe tests** - Full TypeScript support

## [Understanding test environment](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#understanding-test-environment)

**jsdom vs node:**

```
// jsdom environment (default for our config)
render(<Button>Test</Button>)
expect(screen.getByRole('button')).toBeInTheDocument()
// ✅ Works - jsdom provides window, document, etc.
 
// node environment
render(<Button>Test</Button>)
// ❌ Fails - no DOM, React can't render
```

jsdom is slower than node but necessary for React components. Vitest is still much faster than Jest.

## [Commit](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#commit)

```
git add .
git commit -m "test(ui): setup Vitest with React Testing Library"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#done-when)

Verify Vitest is configured:

- [ ] Installed vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- [ ] Created vitest.config.ts with jsdom environment
- [ ] Set test.globals to true for global test functions
- [ ] Created src/test/setup.ts with jest-dom import
- [ ] Added setupFiles pointing to test setup
- [ ] Added test script: `vitest run` to package.json
- [ ] Added dev:test script: `vitest` for watch mode
- [ ] Created button.test.tsx with 2 tests
- [ ] Ran tests and saw 2 passing
- [ ] Tried watch mode and saw auto-rerun on file changes
- [ ] Intentionally broke a test and saw failure
- [ ] Understood jsdom provides browser environment for React

## [What's Next](docs/course/production-monorepostwith-turborepo/5-testing/1-set-up-vitest.md#whats-next)

Vitest is configured, but you only have 2 basic tests. Next lesson: **Write Component Tests** - you'll test all variants of Button, test Card component, and test CodeBlock syntax highlighting. You'll learn testing patterns for props, variants, and component composition.
