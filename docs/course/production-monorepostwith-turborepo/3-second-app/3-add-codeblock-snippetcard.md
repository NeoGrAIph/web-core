source: https://vercel.com/academy/production-monorepos/add-codeblock-snippetcard
# [Add codeblock and snippetcard components](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#add-codeblock-and-snippetcard-components)

You're using generic `Card` components to display snippets, which works but isn't ideal. Each snippet manually renders the same structure: title, language badge, code preview, tags. This is duplication within the snippet list - not as bad as duplicating across apps, but still violating DRY.

You'll create two specialized components: `CodeBlock` for displaying code with syntax highlighting, and `SnippetCard` that composes `Card` and `CodeBlock` into a reusable snippet display. These components live in `packages/ui` and work across all apps.

This is how component libraries grow: start simple (`Button`, `Card`), add specialized components as needs emerge.

## [Outcome](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#outcome)

Create `CodeBlock` and `SnippetCard` components in `packages/ui` and use them to simplify the snippet list display.

## [Fast track](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#fast-track)

1. Create `CodeBlock` component in `packages/ui`
2. Create `SnippetCard` component that uses `Card` and `CodeBlock`
3. Export new components from package.json
4. Update snippet list to use `SnippetCard`

## [Hands-on exercise 3.3](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#hands-on-exercise-33)

Build `CodeBlock` and `SnippetCard` components in the shared UI package.

**Requirements:**

1. Create `packages/ui/src/code-block.tsx` with `CodeBlock` component
2. Create `packages/ui/src/snippet-card.tsx` with `SnippetCard` component
3. Update `packages/ui/package.json` exports
4. Update `apps/snippet-manager/app/page.tsx` to use `SnippetCard`
5. Verify both apps still work and share components

**Implementation hints:**

- `CodeBlock` shows code with dark background and language label
- `SnippetCard` composes `Card` and `CodeBlock` (uses both)
- Export new components from package.json exports field
- Replace `Card` usage in `apps/snippet-manager` with `SnippetCard`
- Hot reload should work for all components

**Expected behavior:**

- Snippet list uses `SnippetCard` instead of generic `Card`
- Code displays in `CodeBlock` with syntax highlighting
- Components are reusable across all apps

## [Create codeblock component](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#create-codeblock-component)

Create `packages/ui/src/code-block.tsx`:

packages/ui/src/code-block.tsx

```
// TODO: Define CodeBlockProps interface with:
//   - code: string
//   - language?: string (optional, default 'javascript')
 
// TODO: Export CodeBlock function component that:
//   - Takes code and language props (destructure with default)
//   - Returns a div with dark background (#1e1e1e)
//   - Shows language label at top with opacity 0.6
//   - Renders code in a <pre><code> block
//   - Uses monospace font and allows horizontal scroll
```

**Your task:** Implement the CodeBlock component following the TODOs.

**Hints:**

- Use inline styles for this lesson (Tailwind in later sections)
- Dark background: `backgroundColor: '#1e1e1e'`
- Light text: `color: '#d4d4d4'`
- Monospace font: `fontFamily: 'monospace'`
- Allow overflow: `overflow: 'auto'`

Possible Solution

## [Create snippetcard component](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#create-snippetcard-component)

Create `packages/ui/src/snippet-card.tsx`:

packages/ui/src/snippet-card.tsx

```
// TODO: Import Card from './card'
// TODO: Import CodeBlock from './code-block'
 
// TODO: Define SnippetCardProps interface with:
//   - title: string
//   - language: string
//   - code: string
//   - tags: string[]
//   - createdAt: string
 
// TODO: Export SnippetCard function component that:
//   - Wraps everything in a Card component
//   - Shows title as h3
//   - Shows createdAt below title
//   - Renders CodeBlock with code and language
//   - Maps over tags and renders each as a styled span
```

**Your task:** Implement the SnippetCard component.

**Hints:**

- This component composes Card and CodeBlock
- Card wraps the entire component
- CodeBlock displays the code
- Tags use flexbox with gap for spacing
- Tags have light gray background and rounded corners

Possible Solution

packages/ui/src/snippet-card.tsx
```
import { Card } from './card'
import { CodeBlock } from './code-block'
 
export interface SnippetCardProps {
  title: string
  language: string
  code: string
  tags: string[]
  createdAt: string
}
 
export function SnippetCard({ title, language, code, tags, createdAt }: SnippetCardProps) {
  return (
    <Card>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>{title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: '#666' }}>
          <span>{createdAt}</span>
        </div>
      </div>
      <CodeBlock code={code} language={language} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {tags.map(tag => (
          <span
            key={tag}
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#f0f0f0',
              borderRadius: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </Card>
  )
}
```

## [Update package exports](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#update-package-exports)

Open `packages/ui/package.json` and add exports for the new components:

packages/ui/package.json

```
{
  "exports": {
    "./button": "./src/button.tsx",
    "./card": "./src/card.tsx",
    "./code-block": "./src/code-block.tsx",
    "./snippet-card": "./src/snippet-card.tsx"
  }
}
```

This allows apps to import:

- `@geniusgarage/ui/code-block`
- `@geniusgarage/ui/snippet-card`

## [Update snippet manager to use snippetcard](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#update-snippet-manager-to-use-snippetcard)

Open `apps/snippet-manager/app/page.tsx` and replace the Card usage with SnippetCard.

**Current imports:**

```
import { Button } from '@geniusgarage/ui/button'
import { Card } from '@geniusgarage/ui/card'
```

**Update to:**

apps/snippet-manager/app/page.tsx

```
import { Button } from '@geniusgarage/ui/button'
import { SnippetCard } from '@geniusgarage/ui/snippet-card'
```

**Update Snippet interface to include createdAt:**

apps/snippet-manager/app/page.tsx

```
interface Snippet {
  id: number
  title: string
  language: string
  code: string
  tags: string[]
  createdAt: string  // Add this field
}
```

**Update mock data to include createdAt:**

apps/snippet-manager/app/page.tsx

```
const mockSnippets: Snippet[] = [
  {
    id: 1,
    title: 'Array Reduce Pattern',
    language: 'javascript',
    code: 'const sum = arr.reduce((acc, n) => acc + n, 0)',
    tags: ['javascript', 'array', 'functional'],
    createdAt: 'Jan 15, 2026',  // Add this
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
    createdAt: 'Feb 20, 2026',  // Add this
  },
  {
    id: 3,
    title: 'Promise.all Pattern',
    language: 'javascript',
    code: 'const results = await Promise.all(promises.map(p => p()))',
    tags: ['javascript', 'async', 'promises'],
    createdAt: 'Mar 10, 2026',  // Add this
  },
]
```

**Replace the grid mapping:**

Find this code:

apps/snippet-manager/app/page.tsx

```
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {mockSnippets.map((snippet) => (
    <Card key={snippet.id}>
      {/* ... lots of nested divs ... */}
    </Card>
  ))}
</div>
```

**Replace with:**

apps/snippet-manager/app/page.tsx

```
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {mockSnippets.map((snippet) => (
    <SnippetCard
      key={snippet.id}
      title={snippet.title}
      language={snippet.language}
      code={snippet.code}
      tags={snippet.tags}
      createdAt={snippet.createdAt}
    />
  ))}
</div>
```

Much cleaner! All the complexity is encapsulated in SnippetCard.

## [Complete solution](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#complete-solution)

apps/snippet-manager/app/page.tsx
```
'use client'
 
import { Button } from '@geniusgarage/ui/button'
import { SnippetCard } from '@geniusgarage/ui/snippet-card'
 
interface Snippet {
  id: number
  title: string
  language: string
  code: string
  tags: string[]
  createdAt: string
}
 
const mockSnippets: Snippet[] = [
  {
    id: 1,
    title: 'Array Reduce Pattern',
    language: 'javascript',
    code: 'const sum = arr.reduce((acc, n) => acc + n, 0)',
    tags: ['javascript', 'array', 'functional'],
    createdAt: 'Jan 15, 2026',
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
    createdAt: 'Feb 20, 2026',
  },
  {
    id: 3,
    title: 'Promise.all Pattern',
    language: 'javascript',
    code: 'const results = await Promise.all(promises.map(p => p()))',
    tags: ['javascript', 'async', 'promises'],
    createdAt: 'Mar 10, 2026',
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
            <SnippetCard
              key={snippet.id}
              title={snippet.title}
              language={snippet.language}
              code={snippet.code}
              tags={snippet.tags}
              createdAt={snippet.createdAt}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

## [Try it](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#try-it)

### [1. Start the dev server](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#1-start-the-dev-server)

```
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001/) - you should see:

- Snippets now displayed with SnippetCard component
- Code blocks have dark background with syntax highlighting
- Language label above each code block
- Created date displayed
- Tags styled with rounded backgrounds

### [2. Verify component composition](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#2-verify-component-composition)

The snippet manager now uses 3 shared components:

- **Button** (from packages/ui/button)
- **SnippetCard** (from packages/ui/snippet-card)
    - Which uses **Card** internally
    - Which uses **CodeBlock** internally

Component composition in action!

### [3. Test hot reload on nested components](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#3-test-hot-reload-on-nested-components)

With dev server running, edit CodeBlock:

packages/ui/src/code-block.tsx

```
export function CodeBlock({ code, language = 'javascript' }: CodeBlockProps) {
  return (
    <div style={{
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      padding: '1rem',
      borderRadius: '0.5rem',
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: '1.2rem',  // Changed from 0.9rem
    }}>
      <div style={{ opacity: 0.6, marginBottom: '0.5rem', fontSize: '0.8rem' }}>
        {language}
      </div>
      <pre style={{ margin: 0 }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
```

Save and watch:

- **App hot reloads**
- All code blocks now have larger font
- SnippetCard automatically picks up the change (it uses CodeBlock internally)

Revert to `fontSize: '0.9rem'` to restore original.

### [4. Build and see caching](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#4-build-and-see-caching)

```
turbo build
```

Output:

```
@geniusgarage/ui:build: cache miss, executing 4.234s
@geniusgarage/web:build: cache hit, replaying outputs 287ms
@geniusgarage/snippet-manager:build: cache miss, executing 4.891s

Tasks:    3 successful, 3 total
Cached:   1 cached, 2 total
Time:     5.012s
```

Notice:

- **UI package rebuilt** (new components added)
- **Web app cached** (hasn't changed)
- **Snippet manager rebuilt** (page.tsx changed)

Turborepo only rebuilds what changed.

## [How component composition works](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#how-component-composition-works)

Your UI package now has component hierarchy:

```
  packages/ui/
  ├── button.tsx           (standalone)
  ├── card.tsx             (standalone)
  ├── code-block.tsx       (standalone)
  └── snippet-card.tsx     (composes Card + CodeBlock)
          ↓
     Uses Card
     Uses CodeBlock
```

**Composition benefits:**

- SnippetCard encapsulates snippet display logic
- Change CodeBlock styling - all SnippetCards update
- Reusable across any app that displays snippets

**Before (apps/snippet-manager):**

apps/snippet-manager/app/page.tsx

```
{mockSnippets.map(snippet => (
  <Card>
    <div><h3>{snippet.title}</h3></div>
    <pre><code>{snippet.code}</code></pre>
    <div>{snippet.tags.map(...)}</div>
  </Card>
))}
```

**After:**

apps/snippet-manager/app/page.tsx

```
{mockSnippets.map(snippet => (
  <SnippetCard {...snippet} />
))}
```

30+ lines of JSX reduced to 1.

## [Commit](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#commit)

```
git add .
git commit -m "feat(ui): add CodeBlock and SnippetCard components"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#done-when)

Verify new components work:

- [ ] Created `packages/ui/src/code-block.tsx` with CodeBlock component
- [ ] Defined CodeBlockProps interface (code, language)
- [ ] Implemented CodeBlock with dark background and syntax display
- [ ] Created `packages/ui/src/snippet-card.tsx` with SnippetCard component
- [ ] Defined SnippetCardProps interface (title, language, code, tags, createdAt)
- [ ] SnippetCard composes Card and CodeBlock components
- [ ] Added exports to `packages/ui/package.json`
- [ ] Updated `apps/snippet-manager/app/page.tsx` to import SnippetCard
- [ ] Added createdAt field to Snippet interface and mock data
- [ ] Replaced Card mapping with SnippetCard mapping
- [ ] Verified snippet list displays with new components
- [ ] Tested hot reload on CodeBlock and saw SnippetCard update

## [What's Next](docs/course/production-monorepostwith-turborepo/3-second-app/3-add-codeblock-snippetcard.md#whats-next)

Your component library is growing, but the snippet manager is still static. Next lesson: **Add Snippet Creation Modal** - you'll add state management and a modal UI to create new snippets dynamically, making the app interactive.
