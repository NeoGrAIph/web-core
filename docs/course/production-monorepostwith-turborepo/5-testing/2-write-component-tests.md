source: https://vercel.com/academy/production-monorepos/write-component-tests
# [Write component tests](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#write-component-tests)

You have 2 basic Button tests, but you're shipping 3 components (Button, Card, CodeBlock) with multiple variants and props. If someone breaks the secondary button style or Card's children rendering, you want tests to catch it before apps break.

You'll write tests that verify component behavior: correct rendering, variant styles, click handlers, and prop handling. These tests document how components should work and prevent regressions.

## [Outcome](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#outcome)

Write comprehensive test suites for Button, Card, and CodeBlock components covering all variants and props.

## [Fast track](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#fast-track)

1. Expand Button tests to cover variants and click handling
2. Write Card tests for children and className props
3. Write CodeBlock tests for code and language props
4. Run all tests and verify 100% pass rate

## [Hands-on exercise 5.2](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#hands-on-exercise-52)

Write test suites for all UI package components.

**Requirements:**

1. Expand button.test.tsx to test:
    - Both primary and secondary variants
    - Click handler functionality
    - Children rendering
2. Create card.test.tsx to test:
    - Children rendering
    - Custom className application
3. Create code-block.test.tsx to test:
    - Code rendering
    - Language prop handling
    - Monospace font family
4. Run all tests with `pnpm test` and verify they pass

**Implementation hints:**

- Use `render()` from @testing-library/react
- Use `screen.getByRole()` for semantic queries
- Use `fireEvent.click()` or `userEvent.click()` for interactions
- Test default props and custom props separately
- Check classes with `toHaveClass()` matcher

## [Expand button tests](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#expand-button-tests)

Open `packages/ui/src/button.test.tsx` and add more tests:

packages/ui/src/button.test.tsx

```
import { render, screen, fireEvent } from '@testing-library/react'
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
 
  // TODO: Add test 'applies secondary variant when specified'
  //   - Render: <Button variant="secondary">Test</Button>
  //   - Get button with getByRole('button')
  //   - Assert: button has 'bg-gray-200' class
  //   - Assert: button has 'text-gray-900' class
 
  // TODO: Add test 'calls onClick handler when clicked'
  //   - Create mock function: const handleClick = vi.fn()
  //   - Render: <Button onClick={handleClick}>Click</Button>
  //   - Get button with getByRole('button')
  //   - Fire click event: fireEvent.click(button)
  //   - Assert: handleClick was called once: expect(handleClick).toHaveBeenCalledTimes(1)
 
  // TODO: Add test 'renders as button element'
  //   - Render: <Button>Test</Button>
  //   - Get button with getByRole('button')
  //   - Assert: button.tagName is 'BUTTON'
})
```

**Your task:** Add the 3 new tests.

**Hints:**

- Import `fireEvent` from '@testing-library/react'
- Create mock with `vi.fn()` (Vitest's mock function)
- `fireEvent.click(element)` simulates click
- `expect(mockFn).toHaveBeenCalledTimes(1)` checks call count
- `element.tagName` returns uppercase tag name

### Solution

packages/ui/src/button.test.tsx

```
import { render, screen, fireEvent } from '@testing-library/react'
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
 
  it('applies secondary variant when specified', () => {
    render(<Button variant="secondary">Test</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-200')
    expect(button).toHaveClass('text-gray-900')
  })
 
  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
 
  it('renders as button element', () => {
    render(<Button>Test</Button>)
    const button = screen.getByRole('button')
    expect(button.tagName).toBe('BUTTON')
  })
})
```
Now Button has 5 comprehensive tests covering variants, clicks, and rendering.

## [Write card tests](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#write-card-tests)

Create `packages/ui/src/card.test.tsx`:

packages/ui/src/card.test.tsx

```
// TODO: Import render, screen from '@testing-library/react'
// TODO: Import Card from './card'
 
// TODO: Create describe block for 'Card component'
//   - Test 1: 'renders children content'
//     - Render: <Card><p>Card content</p></Card>
//     - Assert: screen.getByText('Card content') is in the document
//   - Test 2: 'applies base styles'
//     - Render: <Card>Test</Card>
//     - Get container with getByText('Test').parentElement
//     - Assert: container has 'bg-white' class
//     - Assert: container has 'rounded-lg' class
//   - Test 3: 'applies custom className'
//     - Render: <Card className="custom-class">Test</Card>
//     - Get container with getByText('Test').parentElement
//     - Assert: container has 'custom-class' class
//   - Test 4: 'renders multiple children'
//     - Render: <Card><h2>Title</h2><p>Content</p></Card>
//     - Assert: screen.getByText('Title') is in the document
//     - Assert: screen.getByText('Content') is in the document
```

**Your task:** Implement the Card test suite.

**Hints:**

- Use `.parentElement` to get the Card wrapper div
- Multiple `expect()` calls test multiple classes
- Rendering with JSX children tests real usage patterns

### Solution

packages/ui/src/card.test.tsx
```
import { render, screen } from '@testing-library/react'
import { Card } from './card'
 
describe('Card component', () => {
  it('renders children content', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    )
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })
 
  it('applies base styles', () => {
    render(<Card>Test</Card>)
    const container = screen.getByText('Test').parentElement
    expect(container).toHaveClass('bg-white')
    expect(container).toHaveClass('rounded-lg')
  })
 
  it('applies custom className', () => {
    render(<Card className="custom-class">Test</Card>)
    const container = screen.getByText('Test').parentElement
    expect(container).toHaveClass('custom-class')
  })
 
  it('renders multiple children', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Content</p>
      </Card>
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
```

## [Write codeblock tests](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#write-codeblock-tests)

Create `packages/ui/src/code-block.test.tsx`:

packages/ui/src/code-block.test.tsx

```
// TODO: Import render, screen from '@testing-library/react'
// TODO: Import CodeBlock from './code-block'
 
// TODO: Create describe block for 'CodeBlock component'
//   - Test 1: 'renders code content'
//     - Render: <CodeBlock code="console.log('test')" />
//     - Assert: screen.getByText("console.log('test')") is in the document
//   - Test 2: 'applies monospace font'
//     - Render: <CodeBlock code="test" />
//     - Get pre element with getByText('test').closest('pre')
//     - Assert: pre has 'font-mono' class
//   - Test 3: 'uses default language javascript'
//     - Render: <CodeBlock code="const x = 1" />
//     - Component should render (default language works)
//     - Just verify code is rendered
//   - Test 4: 'accepts custom language prop'
//     - Render: <CodeBlock code="def foo():" language="python" />
//     - Assert: screen.getByText('def foo():') is in the document
//   - Test 5: 'applies dark background'
//     - Render: <CodeBlock code="test" />
//     - Get pre element with getByText('test').closest('pre')
//     - Assert: pre has 'bg-gray-900' or similar dark class
```

**Your task:** Implement the CodeBlock test suite.

**Hints:**

- Use `.closest('pre')` to find the `<pre>`wrapper
- Default props are tested by omitting them
- Language prop doesn't change rendering much (just metadata)

### Solution

packages/ui/src/code-block.test.tsx
```
import { render, screen } from '@testing-library/react'
import { CodeBlock } from './code-block'
 
describe('CodeBlock component', () => {
  it('renders code content', () => {
    render(<CodeBlock code="console.log('test')" />)
    expect(screen.getByText("console.log('test')")).toBeInTheDocument()
  })
 
  it('applies monospace font', () => {
    render(<CodeBlock code="test" />)
    const pre = screen.getByText('test').closest('pre')
    expect(pre).toHaveClass('font-mono')
  })
 
  it('uses default language javascript', () => {
    render(<CodeBlock code="const x = 1" />)
    expect(screen.getByText('const x = 1')).toBeInTheDocument()
  })
 
  it('accepts custom language prop', () => {
    render(<CodeBlock code="def foo():" language="python" />)
    expect(screen.getByText('def foo():')).toBeInTheDocument()
  })
 
  it('applies dark background', () => {
    render(<CodeBlock code="test" />)
    const pre = screen.getByText('test').closest('pre')
    expect(pre).toHaveClass('bg-gray-900')
  })
})
```

## [Try it](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#try-it)

### [1. Run all tests](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#1-run-all-tests)

```
pnpm --filter @geniusgarage/ui test
```

Output:

```
✓ src/button.test.tsx (5)
  ✓ Button component (5)
    ✓ renders with children
    ✓ applies primary variant by default
    ✓ applies secondary variant when specified
    ✓ calls onClick handler when clicked
    ✓ renders as button element

✓ src/card.test.tsx (4)
  ✓ Card component (4)
    ✓ renders children content
    ✓ applies base styles
    ✓ applies custom className
    ✓ renders multiple children

✓ src/code-block.test.tsx (5)
  ✓ CodeBlock component (5)
    ✓ renders code content
    ✓ applies monospace font
    ✓ uses default language javascript
    ✓ accepts custom language prop
    ✓ applies dark background

Test Files  3 passed (3)
     Tests  14 passed (14)
  Duration  412ms
```

14 passing tests! Your component library is well-tested.

### [2. Test coverage (optional)](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#2-test-coverage-optional)

Add coverage reporting to `packages/ui/vitest.config.ts`:

packages/ui/vitest.config.ts

```
import { defineConfig } from 'vitest/config'
 
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
```

Run with coverage:

```
pnpm --filter @geniusgarage/ui test -- --coverage
```

Output:

```
Coverage report:
File            | % Stmts | % Branch | % Funcs | % Lines
----------------|---------|----------|---------|--------
button.tsx      |   100   |   100    |   100   |   100
card.tsx        |   100   |   100    |   100   |   100
code-block.tsx  |   100   |   100    |   100   |   100
```

100% coverage! Every line, branch, and function is tested.

### [3. Test watch mode with all tests](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#3-test-watch-mode-with-all-tests)

```
pnpm --filter @geniusgarage/ui dev:test
```

Output:

```
✓ src/button.test.tsx (5) 156ms
✓ src/card.test.tsx (4) 98ms
✓ src/code-block.test.tsx (5) 112ms

Test Files  3 passed (3)
     Tests  14 passed (14)

Waiting for file changes...
```

Edit any component - only related tests re-run. Vitest is smart about test isolation.

### [4. Verify tests catch real bugs](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#4-verify-tests-catch-real-bugs)

Break the Card component:

packages/ui/src/card.tsx

```
export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-red-500 p-6 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  )
}
```

Tests fail:

```
FAIL src/card.test.tsx > Card component > applies base styles
AssertionError: expected element to have class "bg-white"

Received classes: "bg-red-500 p-6 rounded-lg shadow-md"
```

Revert the change - tests pass. This is test-driven confidence.

## [Testing best practices](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#testing-best-practices)

**What you've learned:**

1. **Test behavior, not implementation**
    
    - ✅ "Button calls onClick when clicked"
    - ❌ "Button has onClick prop in state"
2. **Use semantic queries**
    
    - ✅ `screen.getByRole('button')`
    - ❌ `container.querySelector('.button')`
3. **Test user-facing behavior**
    
    - ✅ Test that classes are applied
    - ✅ Test that click handlers fire
    - ✅ Test that children render
4. **Keep tests simple and readable**
    
    - Each test has one clear assertion
    - Test names describe expected behavior
    - Setup is minimal and clear

## [How tests fit in monorepo](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#how-tests-fit-in-monorepo)

Your testing strategy:

```
  packages/ui/
  ├── src/
  │   ├── button.tsx        → 5 tests in button.test.tsx
  │   ├── card.tsx          → 4 tests in card.test.tsx
  │   ├── code-block.tsx    → 5 tests in code-block.test.tsx
  │   └── snippet-card.tsx  → (uses Card + CodeBlock, tested via composition)

  apps/web, apps/snippet-manager
  └── Use tested components (confidence!)
```

**Benefits:**

- **Package-level testing** - Test components where they're defined
- **Component composition** - SnippetCard is tested by testing Card + CodeBlock
- **Fast feedback** - Watch mode reruns only affected tests
- **Confidence** - Apps use components that are proven to work

## [Commit](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#commit)

```
git add .
git commit -m "test(ui): add comprehensive component tests"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#done-when)

Verify all components are tested:

- [ ] Expanded button.test.tsx to 5 tests
- [ ] Tested primary and secondary Button variants
- [ ] Tested Button onClick handler with vi.fn()
- [ ] Tested Button renders as `<button>` element
- [ ] Created card.test.tsx with 4 tests
- [ ] Tested Card renders children content
- [ ] Tested Card applies base styles (bg-white, rounded-lg)
- [ ] Tested Card accepts custom className
- [ ] Tested Card renders multiple children
- [ ] Created code-block.test.tsx with 5 tests
- [ ] Tested CodeBlock renders code content
- [ ] Tested CodeBlock applies monospace font
- [ ] Tested CodeBlock default language is javascript
- [ ] Tested CodeBlock accepts custom language prop
- [ ] Tested CodeBlock applies dark background
- [ ] Ran all tests and saw 14 passing
- [ ] Verified watch mode only reruns affected tests

## [What's Next](docs/course/production-monorepostwith-turborepo/5-testing/2-write-component-tests.md#whats-next)

You have 14 passing tests, but they run independently in packages/ui. Next lesson: **Configure Turbo for Tests** - you'll add a test task to turbo.json so you can run `turbo test` to test the entire monorepo in parallel, with caching and smart orchestration.
