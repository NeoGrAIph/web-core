source: https://vercel.com/academy/production-monorepos/snippet-list-page#build-snippet-list-page
# [Build snippet list page](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#build-snippet-list-page)

You have two apps (web and app) that both depend on packages/ui. But apps/snippet-manager doesn't actually import anything from the UI package yet. It's just configured to use it. Now let's prove that code sharing works.

When both apps use the same components, you'll see the monorepo advantage: change `Button` once in `packages/ui`, both apps update instantly.

## [Outcome](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#outcome)

Build a snippet list page that imports and uses `Button` and `Card` from `packages/ui`, displaying mock snippet data.

## [Fast track](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#fast-track)

1. Define Snippet interface and create mock data
2. Import `Button` and `Card` from `packages/ui`
3. Build header and snippet grid using shared components
4. Test hot reloading across packages

## [Hands-on exercise 3.2](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#hands-on-exercise-32)

Build the snippet list page using shared components from packages/ui.

**Requirements:**

1. Mark page as `'use client'` for interactivity
2. Import `Button` and `Card` from `@geniusgarage/ui`
3. Define Snippet interface (id, title, language, code, tags)
4. Create array of 3 mock code snippets
5. Build header with title and "+ New Snippet" button
6. Display snippets in a responsive grid using `Card` components
7. Verify hot reload works when editing packages/ui

**Implementation hints:**

- Use `'use client'` directive at top of file for future useState
- Import from `@geniusgarage/ui/button` and `@geniusgarage/ui/card` (named exports)
- Button onClick can be console.log for now
- Each Card shows snippet title, language, code preview, and tags
- Use Tailwind grid for responsive layout

**Expected behavior:**

- Snippet manager displays 3 code snippets in cards
- Shared `Button` component in header
- Edit `Button` in `packages/ui` - both apps hot reload simultaneously

## [Update page with todos](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#update-page-with-todos)

Open `apps/snippet-manager/app/page.tsx` and replace it with this scaffold:

apps/snippet-manager/app/page.tsx

```
'use client'
 
// TODO: Import Button from '@geniusgarage/ui/button'
// TODO: Import Card from '@geniusgarage/ui/card'
 
// TODO: Define Snippet interface with these fields:
//   - id: number
//   - title: string
//   - language: string
//   - code: string
//   - tags: string[]
 
// TODO: Create mockSnippets array with 3 snippets:
// 1. Array Reduce Pattern (javascript, reduce code, tags: javascript, array, functional)
// 2. React useEffect Cleanup (typescript, useEffect cleanup code, tags: react, hooks, typescript)
// 3. Promise.all Pattern (javascript, Promise.all code, tags: javascript, async, promises)
 
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* TODO: Add header div with flex layout */}
        {/*   - h1 with "My Snippets" (text-4xl font-bold) */}
        {/*   - Button with "+ New Snippet" text and onClick console.log */}
 
        {/* TODO: Add grid div that maps over mockSnippets */}
        {/*   - Use Tailwind classes: grid gap-6 md:grid-cols-2 lg:grid-cols-3 */}
        {/*   - Map each snippet to a Card component */}
        {/*   - Inside Card, show: title, language, code preview, tags */}
      </div>
    </div>
  )
}
```

## [Complete the todos](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#complete-the-todos)

### [Step 1: Add imports](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#step-1-add-imports)

Add the imports at the top:

apps/snippet-manager/app/page.tsx

```
import { Button } from '@geniusgarage/ui/button'
import { Card } from '@geniusgarage/ui/card'
```

These imports work because:

- packages/ui/package.json exports them via named exports
- next.config.mjs transpiles the package
- pnpm workspace links them locally

### [Step 2: Define snippet interface](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#step-2-define-snippet-interface)

Add the interface below imports:

apps/snippet-manager/app/page.tsx

```
interface Snippet {
  id: number
  title: string
  language: string
  code: string
  tags: string[]
}
```

This provides type safety for your snippet data.

### [Step 3: Create mock data](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#step-3-create-mock-data)

Add the mock snippets array:

apps/snippet-manager/app/page.tsx

```
const mockSnippets: Snippet[] = [
  {
    id: 1,
    title: 'Array Reduce Pattern',
    language: 'javascript',
    code: 'const sum = arr.reduce((acc, n) => acc + n, 0)',
    tags: ['javascript', 'array', 'functional'],
  },
  {
    id: 2,
    title: 'React useEffect Cleanup',
    language: 'typescript',
    code: `useEffect(() => {
  const timer = setTimeout(() => {}, 1000)
  return () => clearTimeout(timer)
}, [])`,
    tags: ['react', 'hooks', 'typescript'],
  },
  {
    id: 3,
    title: 'Promise.all Pattern',
    language: 'javascript',
    code: 'const results = await Promise.all(promises.map(p => p()))',
    tags: ['javascript', 'async', 'promises'],
  },
]
```

### [Step 4: Build header](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#step-4-build-header)

Replace the first TODO comment with:

apps/snippet-manager/app/page.tsx

```
<div className="flex justify-between items-center mb-8">
  <h1 className="text-4xl font-bold">My Snippets</h1>
  <Button onClick={() => console.log('Create snippet')}>
    + New Snippet
  </Button>
</div>
```

This uses the shared `Button` component from `packages/ui`.

### [Step 5: Build snippet grid](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#step-5-build-snippet-grid)

Replace the second TODO comment with:

apps/snippet-manager/app/page.tsx

```
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {mockSnippets.map((snippet) => (
    <Card key={snippet.id}>
      <div className="space-y-3">
        {/* Title and Language */}
        <div>
          <h3 className="text-lg font-semibold mb-1">{snippet.title}</h3>
          <span className="text-sm text-gray-500 font-mono">
            {snippet.language}
          </span>
        </div>
 
        {/* Code Preview */}
        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
          <code>{snippet.code}</code>
        </pre>
 
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {snippet.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  ))}
</div>
```

This maps over the mock data and renders each snippet in a Card component.

## [Complete solution](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#complete-solution)

Click to see complete solution

apps/snippet-manager/app/page.tsx
```json
'use client'
 
import { Button } from '@geniusgarage/ui/button'
import { Card } from '@geniusgarage/ui/card'
 
interface Snippet {
  id: number
  title: string
  language: string
  code: string
  tags: string[]
}
 
const mockSnippets: Snippet[] = [
  {
    id: 1,
    title: 'Array Reduce Pattern',
    language: 'javascript',
    code: 'const sum = arr.reduce((acc, n) => acc + n, 0)',
    tags: ['javascript', 'array', 'functional'],
  },
  {
    id: 2,
    title: 'React useEffect Cleanup',
    language: 'typescript',
    code: `useEffect(() => {
  const timer = setTimeout(() => {}, 1000)
  return () => clearTimeout(timer)
}, [])`,
    tags: ['react', 'hooks', 'typescript'],
  },
  {
    id: 3,
    title: 'Promise.all Pattern',
    language: 'javascript',
    code: 'const results = await Promise.all(promises.map(p => p()))',
    tags: ['javascript', 'async', 'promises'],
  },
]
 
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Snippets</h1>
          <Button onClick={() => console.log('Create snippet')}>
            + New Snippet
          </Button>
        </div>
 
        {/* Snippet Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockSnippets.map((snippet) => (
            <Card key={snippet.id}>
              <div className="space-y-3">
                {/* Title and Language */}
                <div>
                  <h3 className="text-lg font-semibold mb-1">{snippet.title}</h3>
                  <span className="text-sm text-gray-500 font-mono">
                    {snippet.language}
                  </span>
                </div>
 
                {/* Code Preview */}
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                  <code>{snippet.code}</code>
                </pre>
 
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {snippet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## [Try it](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#try-it)

### [1. Start the snippet manager app](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#1-start-the-snippet-manager-app)

```
pnpm --filter @geniusgarage/snippet-manager dev
```

Open [http://localhost:3001](http://localhost:3001/) - you should see:

- "My Snippets" header
- "+ New Snippet" button (same Button from packages/ui that web app uses)
- 3 snippet cards in a grid
- Each card shows title, language, code, and tags

### [2. Verify shared components work](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#2-verify-shared-components-work)

Start both apps:

```
pnpm dev
```

Visit both:

- [http://localhost:3000](http://localhost:3000/) - Marketing site with features page (uses Button and Card)
- [http://localhost:3001](http://localhost:3001/) - Snippet manager (uses same Button and Card)

Both apps use the exact same components from packages/ui.

### [3. Test hot reload across packages](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#3-test-hot-reload-across-packages)

With both apps running, edit the Button component:

packages/ui/src/button.tsx

```
'use client'
 
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
}
 
export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  const baseStyles = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }
 
  const variantStyles = {
    primary: { background: '#d946ef', color: 'white' },
    secondary: { background: '#f3f4f6', color: '#1f2937', border: '1px solid #e5e7eb' },
  }
 
  const hoverStyles = {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  }
 
  return (
    <button
      style={{ ...baseStyles, ...variantStyles[variant] }}
      onClick={onClick}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, hoverStyles)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {children}
    </button>
  )
}
```

Save the file. Watch what happens:

- **Both apps hot reload simultaneously**
- All buttons in both apps now have magenta background with hover lift effect
- No rebuild needed
- No version bumping
- Instant update across the monorepo

This is the monorepo superpower in action.

### [4. Revert the change](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#4-revert-the-change)

Restore the original blue button:

packages/ui/src/button.tsx

```
export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  const baseStyles = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }
 
  const variantStyles = {
    primary: { background: '#2563eb', color: 'white' },
    secondary: { background: '#e5e7eb', color: '#1f2937' },
  }
 
  return (
    <button
      style={{ ...baseStyles, ...variantStyles[variant] }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

Both apps reload again. Back to the original blue button.

## [Build both apps](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#build-both-apps)

Stop the dev servers and build:

```
turbo build
```

Output:

```
@geniusgarage/ui:build: cache hit, replaying outputs 287ms
@geniusgarage/web:build: cache miss, executing 5.123s
@geniusgarage/snippet-manager:build: cache miss, executing 4.891s

Tasks:    3 successful, 3 total
Cached:   1 cached, 3 total
Time:     5.234s
```

Notice:

- **UI package cached** (hasn't changed since last build)
- **Both apps rebuild** (page.tsx changed in apps/snippet-manager)
- **Apps build in parallel** (independent tasks)
- Total time ~5s (not 10s) because UI was cached

## [How shared components work](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#how-shared-components-work)

Your monorepo now proves code sharing:

```
  packages/ui/src/
  ├── button.tsx       ← Shared component
  └── card.tsx         ← Shared component
          ↑                    ↑
          └────────┬───────────┘
                   │
          ┌────────┴────────┐
          │                 │
     apps/web          apps/snippet-manager
     (features)        (snippets)
```

**One source of truth:**

- Button defined once in packages/ui
- Card defined once in packages/ui
- Both apps import from the same package
- Change once, update everywhere

**No duplication:**

- No copy/paste between apps
- No version sync needed
- No publishing to npm
- Instant updates via workspace links

## [Commit](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#commit)

```
git add .git commit -m "feat(app): add snippet list page with shared components"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#done-when)

Verify shared components work:

- [ ] Added `'use client'` directive to page.tsx
- [ ] Imported Button and Card from `@geniusgarage/ui`
- [ ] Defined Snippet interface with all required fields
- [ ] Created mockSnippets array with 3 code snippets
- [ ] Built header with h1 and Button component
- [ ] Mapped over snippets and displayed each in a Card
- [ ] Added title, language, code preview, and tags to each card
- [ ] Ran snippet manager app and saw snippet list at [http://localhost:3001](http://localhost:3001/)
- [ ] Ran both apps simultaneously with `pnpm dev`
- [ ] Edited Button component and saw both apps hot reload
- [ ] Reverted Button change and saw both apps reload again
- [ ] Built with `turbo build` and saw UI package cached
## [What's Next](docs/course/production-monorepostwith-turborepo/3-second-app/2-build-snippet-list-page.md#whats-next)

Both apps now use Button and Card, but the snippet display is generic. Next lesson: **Add CodeBlock and SnippetCard Components** - you'll create specialized components in packages/ui for displaying code with syntax highlighting and properly formatted snippet cards.
