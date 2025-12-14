source: https://vercel.com/academy/production-monorepos/add-shared-utils
# [Add shared utils](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#add-shared-utils)

We're formatting dates with `toLocaleDateString()` in apps/snippet-manager. Utility functions like date formatting, text slugification, and string truncation are perfect candidates for shared packages - they're pure functions with no UI dependencies.

You'll create packages/utils with common utilities that work across all apps. This demonstrates that monorepos aren't just for sharing components - you can share any code.

## [Outcome](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#outcome)

Create packages/utils with **utility** functions and use formatDate in the snippet manager.

## [Fast track](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#fast-track)

1. Create packages/utils package structure
2. Add utility functions (formatDate, slugify, truncate, validateEmail)
3. Export functions from package
4. Use formatDate in snippet manager app

## [Hands-on exercise 4.2](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#hands-on-exercise-42)

Create shared utilities package with common helper functions.

**Requirements:**

1. Create `packages/utils` **directory******
2. Add package.json with TypeScript config
3. Create `src/index.ts` with utility functions
4. Export formatDate, slugify, truncate, validateEmail
5. Add utils dependency to apps/snippet-manager
6. Replace date formatting with formatDate utility
7. Test in both dev and build

**Implementation hints:**

- Use Intl.DateTimeFormat for formatDate
- slugify converts text to URL-safe format
- truncate limits string length with ellipsis
- validateEmail uses regex pattern
- Export all functions from src/index.ts

## [Create utils package](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#create-utils-package)

Create the directory structure:

```
mkdir -p packages/utils/src
```

Create `packages/utils/package.json`. Not in the `src` directory but in `utils`:

packages/utils/package.json

```
{
  "name": "@geniusgarage/utils",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "eslint ."
  },
  "devDependencies": {
    "@geniusgarage/typescript-config": "workspace:*",
    "@geniusgarage/eslint-config": "workspace:*",
    "eslint": "^9",
    "typescript": "^5"
  }
}
```

Create `packages/utils/tsconfig.json`:

packages/utils/tsconfig.json

```
{
  "extends": "@geniusgarage/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

Notice it extends the shared TypeScript config from `packages/typescript-config`!

## [Create utility functions](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#create-utility-functions)

Create `packages/utils/src/index.ts`:

packages/utils/src/index.ts

```
// TODO: Export formatDate function that:
//   - Takes a Date parameter
//   - Returns formatted string "Jan 15, 2024"
//   - Uses Intl.DateTimeFormat with en-US, month: 'short', day: 'numeric', year: 'numeric'
 
// TODO: Export slugify function that:
//   - Takes a string parameter
//   - Returns URL-safe slug (lowercase, replace spaces with hyphens, remove special chars)
//   - Example: "Hello World!" → "hello-world"
 
// TODO: Export truncate function that:
//   - Takes text string and maxLength number
//   - Returns truncated string with "..." if longer than maxLength
//   - Example: truncate("Hello World", 5) → "Hello..."
 
// TODO: Export validateEmail function that:
//   - Takes email string
//   - Returns boolean (true if valid email format)
//   - Uses regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

**Your task:** Implement all four utility functions.

**Hints:**

- formatDate: `new Intl.DateTimeFormat('en-US', { ... }).format(date)`
- slugify: Chain `.toLowerCase()`, `.replace()` calls
- truncate: Check `text.length <= maxLength`, use `text.slice(0, maxLength) + '...'`
- validateEmail: `return regex.test(email)`

Solution: if you didn't come here to write functions

## [Add utils to snippet manager](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#add-utils-to-snippet-manager)

Install the utils package:

```
pnpm add @geniusgarage/utils --filter @geniusgarage/snippet-manager --workspace
pnpm install
```

### [Update snippet interface](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#update-snippet-interface)

Open `apps/snippet-manager/app/page.tsx` and change `createdAt` from string to Date:

apps/snippet-manager/app/page.tsx

```
interface Snippet {
  id: number
  title: string
  language: string
  code: string
  tags: string[]
  createdAt: Date  // Changed from string to Date
}
```

### [Import formatdate](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#import-formatdate)

Add the import at the top:

apps/snippet-manager/app/page.tsx

```
import { useState } from 'react'
import { Button } from '@geniusgarage/ui/button'
import { SnippetCard } from '@geniusgarage/ui/snippet-card'
import { formatDate } from '@geniusgarage/utils'
```

### [Update mock data](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#update-mock-data)

Change the mock data to use Date objects:

apps/snippet-manager/app/page.tsx

```
const initialSnippets: Snippet[] = [
  {
    id: 1,
    title: 'Array Reduce Pattern',
    language: 'javascript',
    code: 'const sum = arr.reduce((acc, n) => acc + n, 0)',
    tags: ['javascript', 'array', 'functional'],
    createdAt: new Date('2024-01-15'),  // Date object
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
    createdAt: new Date('2024-02-20'),  // Date object
  },
  {
    id: 3,
    title: 'Promise.all Pattern',
    language: 'javascript',
    code: 'const results = await Promise.all(promises.map(p => p()))',
    tags: ['javascript', 'async', 'promises'],
    createdAt: new Date('2024-03-10'),  // Date object
  },
]
```

### [Update handlecreatesnippet](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#update-handlecreatesnippet)

Replace the date formatting with formatDate utility:

apps/snippet-manager/app/page.tsx

```
const handleCreateSnippet = () => {
  if (!newSnippet.title || !newSnippet.code) return
 
  const snippet: Snippet = {
    id: Date.now(),
    title: newSnippet.title,
    language: newSnippet.language,
    code: newSnippet.code,
    tags: newSnippet.tags.split(',').map(t => t.trim()).filter(Boolean),
    createdAt: new Date()  // Now a Date object
  }
 
  setSnippets([snippet, ...snippets])
  setShowModal(false)
  setNewSnippet({ title: '', language: 'javascript', code: '', tags: '' })
}
```

### [Update snippetcard rendering](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#update-snippetcard-rendering)

Pass formatted date to SnippetCard:

apps/snippet-manager/app/page.tsx

```
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {snippets.map((snippet) => (
    <SnippetCard
      key={snippet.id}
      title={snippet.title}
      language={snippet.language}
      code={snippet.code}
      tags={snippet.tags}
      createdAt={formatDate(snippet.createdAt)}
    />
  ))}
</div>
```

Now dates are formatted consistently using the shared utility!

## [Try it](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#try-it)

### [1. Test in development](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#1-test-in-development)

```
pnpm --filter @geniusgarage/snippet-manager dev
```

Open [http://localhost:3001](http://localhost:3001/):

- Initial snippets show formatted dates: "Jan 15, 2024", "Feb 20, 2024", "Mar 10, 2024"
- Create a new snippet - it gets today's date formatted consistently

### [2. Test utility functions in console](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#2-test-utility-functions-in-console)

While dev server is running, open browser console and test:

```
// formatDate is used in the app
// slugify example:
"Hello World!".toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
// → "hello-world"
 
// truncate example:
"This is a very long text".slice(0, 10) + "..."
// → "This is a ..."
```

The utilities work!

### [3. Build and verify](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#3-build-and-verify)

```
turbo build
```

Output:

```
@geniusgarage/utils:build: cache miss, executing 1.234s
@geniusgarage/ui:build: cache hit, replaying outputs
@geniusgarage/web:build: cache hit, replaying outputs
@geniusgarage/snippet-manager:build: cache miss, executing 4.891s

Tasks:    5 successful, 5 total
Cached:   3 cached, 5 total
Time:     5.012s
```

Notice:

- **utils package built** (new dependency)
- **app rebuilt** (imports from utils)
- **web cached** (doesn't use utils yet)

## [How shared utils work](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#how-shared-utils-work)

Your monorepo now shares utilities:

```
  packages/utils/
  └── src/index.ts        ← Utility functions
          ↓
      formatDate()
          ↓
      apps/snippet-manager
      (imports and uses)
```

**When to create shared packages:**

- **UI components** → `packages/ui` (`Button`, `Card`, etc.)
- **TypeScript config** → `packages/typescript-config` (base.json, nextjs.json)
- **ESLint config** → `packages/eslint-config` (shared linting rules)
- **Utility functions** → `packages/utils` (`formatDate`, `slugify`)
- **Business logic** → `packages/core` (future: snippet validation, etc.)

**Benefits:**

- **Single source** - formatDate defined once, used everywhere
- **Easy testing** - Test pure functions in isolation
- **Reusable** - Any app can import from packages/utils
- **Type-safe** - Full TypeScript support across workspace

## [Commit](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#commit)

```
git add .git commit -m "feat(utils): add shared utilities package"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#done-when)

Verify shared utilities work:

- [ ] Created `packages/utils/src` directory
- [ ] Added package.json with TypeScript and ESLint config dependencies
- [ ] Created tsconfig.json extending `@geniusgarage/typescript-config/base.json`
- [ ] Implemented `formatDate` function with Intl.DateTimeFormat
- [ ] Implemented `slugify` function with string transformations
- [ ] Implemented truncate function with maxLength check
- [ ] Implemented validateEmail function with regex
- [ ] Exported all functions from src/index.ts
- [ ] Added @geniusgarage/utils dependency to apps/snippet-manager
- [ ] Imported formatDate in apps/snippet-manager/app/page.tsx
- [ ] Changed Snippet interface createdAt to Date type
- [ ] Updated mock data to use Date objects
- [ ] Updated handleCreateSnippet to use Date object
- [ ] Passed formatDate(snippet.createdAt) to SnippetCard
- [ ] Tested in dev and saw formatted dates
- [ ] Built with turbo and saw utils package build

## [What's next](docs/course/production-monorepostwith-turborepo/4-shared-configs-and-utils/2-add-shared-utils.md#whats-next)

You've created three shared packages (ui, config, utils), but Turborepo doesn't know about their dependency relationships. Next lesson: **Update Turbo Pipeline** - configure task dependencies so Turborepo builds packages in the correct order and caches effectively.
