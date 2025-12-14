source: https://vercel.com/academy/production-monorepos/snippet-creation-modal
# [Add snippet creation modal](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#add-snippet-creation-modal)

Your snippet manager displays static data - the same 3 snippets every time. Real apps need dynamic data. You'll add state management with React's useState hook and build a modal form for creating snippets. This teaches client-side interactivity in a monorepo context, using shared Button components for both the trigger and form actions.

The "+ New Snippet" button currently just logs to console. Let's make it actually work.

## [Outcome](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#outcome)

Add state management and a modal form that lets users create new snippets dynamically, storing them in memory.

## [Fast track](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#fast-track)

1. Add useState hooks for snippets, modal visibility, and form state
2. Wire up "+ New Snippet" button to show modal
3. Build modal UI with form inputs
4. Handle form submission and add snippets to list

## [Hands-on exercise 3.4](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#hands-on-exercise-34)

Add interactive snippet creation with state management and modal UI.

**Requirements:**

1. Import useState from React
2. Add state for snippets array, modal visibility, and form data
3. Update Button onClick to show modal
4. Create modal overlay with form (title, language, code, tags inputs)
5. Add Cancel and Create buttons using shared Button component
6. Handle form submission to create new snippets
7. Reset form and close modal after creation

**Implementation hints:**

- Use `useState<Snippet[]>` for snippets with initialSnippets as default
- Modal state is boolean: `useState(false)`
- Form state is object: `{ title: '', language: 'javascript', code: '', tags: '' }`
- Validate title and code before creating snippet
- Generate ID with `Date.now()`, split tags by comma
- Add new snippet to beginning of array (newest first)

**Expected behavior:**

- Click "+ New Snippet" → modal appears
- Fill form → click Create → snippet added to list
- Click Cancel → modal closes without creating
- Form resets after creation

## [Add state management](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#add-state-management)

Open `apps/snippet-manager/app/page.tsx` and add state hooks at the top of the component.

**Current code:**

apps/snippet-manager/app/page.tsx

```
export default function Home() {
  return (
    // ...
  )
}
```

**Add state hooks:**

apps/snippet-manager/app/page.tsx

```
import { useState } from 'react'  // Add this import
 
export default function Home() {
  // TODO: Add useState for snippets array
  //   - Type: useState<Snippet[]>
  //   - Initial value: mockSnippets
  //   - Rename mockSnippets to initialSnippets
 
  // TODO: Add useState for modal visibility
  //   - Type: boolean
  //   - Initial value: false
 
  // TODO: Add useState for form data
  //   - Type: object with { title: '', language: 'javascript', code: '', tags: '' }
  //   - Initial value: empty form
 
  return (
    // ...
  )
}
```

**Your task:** Add the three useState hooks.

### Solution

apps/snippet-manager/app/page.tsx
```
'use client'
 
import { useState } from 'react'
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
 
const initialSnippets: Snippet[] = [
  {
    id: 1,
    title: 'Array Reduce Pattern',
    language: 'javascript',
    code: 'const sum = arr.reduce((acc, n) => acc + n, 0)',
    tags: ['javascript', 'array', 'functional'],
    createdAt: 'Jan 15, 2024',
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
    createdAt: 'Feb 20, 2024',
  },
  {
    id: 3,
    title: 'Promise.all Pattern',
    language: 'javascript',
    code: 'const results = await Promise.all(promises.map(p => p()))',
    tags: ['javascript', 'async', 'promises'],
    createdAt: 'Mar 10, 2024',
  },
]
 
export default function Home() {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets)
  const [showModal, setShowModal] = useState(false)
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    language: 'javascript',
    code: '',
    tags: ''
  })
 
  return (
    // ...
  )
}
```
## [Update the grid to use state](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#update-the-grid-to-use-state)

Before wiring up the button, update the snippet grid to use the `snippets` state variable instead of `mockSnippets`:

**Find this code at the bottom of your component:**

apps/snippet-manager/app/page.tsx

```
{mockSnippets.map((snippet) => (
  <SnippetCard
    key={snippet.id}
    // ...
  />
))}
```

**Change it to:**

apps/snippet-manager/app/page.tsx

```
{snippets.map((snippet) => (
  <SnippetCard
    key={snippet.id}
    // ...
  />
))}
```

This is crucial! If you forget this step, new snippets won't appear because you'll be rendering the static `mockSnippets` array instead of the dynamic `snippets` state.

## [Wire up the button](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#wire-up-the-button)

Update the "+ New Snippet" button to show the modal:

apps/snippet-manager/app/page.tsx

```
<Button onClick={() => setShowModal(true)}>
  + New Snippet
</Button>
```

Simple! This toggles the modal visibility.

## [Create modal UI](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#create-modal-ui)

Add the modal after the header, before the snippet grid:

apps/snippet-manager/app/page.tsx

```
{/* Header */}
<div className="flex justify-between items-center mb-8">
  <h1 className="text-4xl font-bold">My Snippets</h1>
  <Button onClick={() => setShowModal(true)}>
    + New Snippet
  </Button>
</div>
 
{/* TODO: Add modal - render only when showModal is true */}
{/*   - Overlay: fixed position, dark semi-transparent background */}
{/*   - Modal: white box, centered, max-width 600px */}
{/*   - Title input: controlled input for newSnippet.title */}
{/*   - Language select: dropdown with javascript, typescript, python, go, rust */}
{/*   - Code textarea: controlled textarea for newSnippet.code */}
{/*   - Tags input: controlled input for comma-separated tags */}
{/*   - Cancel Button: onClick={() => setShowModal(false)} */}
{/*   - Create Button: onClick={handleCreateSnippet} (create this function) */}
 
{/* Snippet Grid */}
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {snippets.map((snippet) => (
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

**Your task:** Build the modal structure.

**Hints:**

- Conditional render: `{showModal && <div>...</div>}`
- Overlay: `position: 'fixed'`, `backgroundColor: 'rgba(0,0,0,0.5)'`
- Centered: `display: 'flex'`, `alignItems: 'center'`, `justifyContent: 'center'`
- Form inputs are controlled: `value={newSnippet.title}` + `onChange`
- Update form: `setNewSnippet({ ...newSnippet, title: e.target.value })`

### Solution

apps/snippet-manager/app/page.tsx
```
{showModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '0.5rem',
      width: '90%',
      maxWidth: '600px'
    }}>
      <h2 style={{ marginTop: 0 }}>Create New Snippet</h2>
 
      {/* Title Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Title
        </label>
        <input
          type="text"
          value={newSnippet.title}
          onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ddd' }}
          placeholder="My awesome snippet"
        />
      </div>
 
      {/* Language Select */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Language
        </label>
        <select
          value={newSnippet.language}
          onChange={(e) => setNewSnippet({ ...newSnippet, language: e.target.value })}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ddd' }}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
        </select>
      </div>
 
      {/* Code Textarea */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Code
        </label>
        <textarea
          value={newSnippet.code}
          onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #ddd',
            fontFamily: 'monospace',
            minHeight: '150px'
          }}
          placeholder="console.log('Hello world')"
        />
      </div>
 
      {/* Tags Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={newSnippet.tags}
          onChange={(e) => setNewSnippet({ ...newSnippet, tags: e.target.value })}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ddd' }}
          placeholder="javascript, array, functional"
        />
      </div>
 
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
        <Button onClick={handleCreateSnippet}>
          Create Snippet
        </Button>
      </div>
    </div>
  </div>
)}
```

## [Handle form submission](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#handle-form-submission)

Add the `handleCreateSnippet` function before the return statement:

apps/snippet-manager/app/page.tsx

```
export default function Home() {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets)
  const [showModal, setShowModal] = useState(false)
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    language: 'javascript',
    code: '',
    tags: ''
  })
 
  // TODO: Create handleCreateSnippet function that:
  //   1. Validates title and code are not empty (early return if invalid)
  //   2. Creates new snippet object with:
  //      - id: Date.now()
  //      - title, language, code from newSnippet state
  //      - tags: split newSnippet.tags by comma, trim whitespace, filter empty
  //      - createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  //   3. Adds new snippet to beginning of snippets array: [snippet, ...snippets]
  //   4. Closes modal: setShowModal(false)
  //   5. Resets form: setNewSnippet({ title: '', language: 'javascript', code: '', tags: '' })
 
  return (
    // ...
  )
}
```

**Your task:** Implement the handleCreateSnippet function.

**Hints:**

- Validation: `if (!newSnippet.title || !newSnippet.code) return`
- Split tags: `newSnippet.tags.split(',').map(t => t.trim()).filter(Boolean)`
- Format date: `new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })`
- Update array: `setSnippets([newSnippetObj, ...snippets])`

### Solution

apps/snippet-manager/app/page.tsx
```
const handleCreateSnippet = () => {
  // Validate required fields
  if (!newSnippet.title || !newSnippet.code) return
 
  // Create snippet object
  const snippet: Snippet = {
    id: Date.now(),
    title: newSnippet.title,
    language: newSnippet.language,
    code: newSnippet.code,
    tags: newSnippet.tags.split(',').map(t => t.trim()).filter(Boolean),
    createdAt: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
 
  // Add to snippets array (newest first)
  setSnippets([snippet, ...snippets])
 
  // Close modal and reset form
  setShowModal(false)
  setNewSnippet({ title: '', language: 'javascript', code: '', tags: '' })
}
```

## [Try it](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#try-it)

### [1. Test snippet creation](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#1-test-snippet-creation)

```
pnpm --filter @geniusgarage/snippet-manager dev
```

Open [http://localhost:3001](http://localhost:3001/):

1. Click "+ New Snippet" button
2. Modal appears with form
3. Fill in:
    - Title: "Async Await Pattern"
    - Language: TypeScript
    - Code: `const data = await fetch(url).then(r => r.json())`
    - Tags: `typescript, async, fetch`
4. Click "Create Snippet"
5. Modal closes
6. New snippet appears at the top of the list

### [2. Test validation](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#2-test-validation)

Try creating a snippet without title or code - nothing happens (validation works).

### [3. Test cancel](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#3-test-cancel)

1. Click "+ New Snippet"
2. Fill in some data
3. Click "Cancel"
4. Modal closes without creating snippet
5. Open modal again - form is still filled (form doesn't reset on cancel)

**Optional improvement:** Reset form on cancel too:

apps/snippet-manager/app/page.tsx

```
<Button variant="secondary" onClick={() => {
  setShowModal(false)
  setNewSnippet({ title: '', language: 'javascript', code: '', tags: '' })
}}>
  Cancel
</Button>
```

### [4. Verify state management](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#4-verify-state-management)

Create 2-3 more snippets. They all appear in the list in reverse chronological order (newest first). The state is working!

## [Commit](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#commit)

```
git add .
git commit -m "feat(app): add snippet creation modal"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#done-when)

Verify interactivity works:

- [ ] State management configured (snippets, showModal, newSnippet)
- [ ] Grid maps over `snippets` state, not `mockSnippets`
- [ ] "+ New Snippet" button opens modal
- [ ] Modal form has all inputs (title, language, code, tags)
- [ ] Create button adds snippet to top of list
- [ ] Cancel button closes modal without creating
- [ ] Validation prevents empty title or code
- [ ] New snippets appear immediately in the UI

## [What's Next](docs/course/production-monorepostwith-turborepo/3-second-app/4-snippet-creation-modal.md#whats-next)

Your snippet manager is now fully interactive! A thing of great beauty. The last step in Section 2: **Deploy Both Apps** - you'll deploy the marketing site and snippet manager to Vercel, proving that monorepo apps can deploy independently while sharing the same packages/ui code.
