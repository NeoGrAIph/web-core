source: https://vercel.com/academy/production-monorepos/extract-button-component
# [Extract button component](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#extract-button-component)

You extracted the `Card` component manually to learn the pattern. Now you'll apply that same pattern to extract the `Button` from the home page. This time, you'll add a `variant` prop to support multiple button styles (primary and secondary), making the component more flexible and reusable across different contexts.

## [Outcome](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#outcome)

Extract the `Button` component to the shared package with support for multiple style variants.

## [Fast track](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#fast-track)

1. Create `Button` component in `packages/ui` with variant support
2. Export `Button` from the package
3. Update home page to use the shared `Button`
4. Test both primary and secondary variants

## [Hands-on exercise 2.4](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#hands-on-exercise-24)

Extract `Button` component with variant support using the same pattern you learned with `Card`.

**Requirements:**

1. Create `Button` component in `packages/ui/src/button.tsx` with variant prop
2. Export `Button` from package (package.json + index.ts)
3. Update home page to use `<Button>` from shared package
4. Test both primary and secondary variants

**Implementation hints:**

- `Button` supports primary (blue) and secondary (gray) variants
- The variant prop defaults to 'primary'
- Use the same export pattern as `Card` (package.json exports field + index.ts)

**Files to create/modify:**

- `packages/ui/src/button.tsx` (new component)
- `packages/ui/package.json` (add Button export)
- `packages/ui/src/index.ts` (export Button)
- `apps/web/app/page.tsx` (use Button from shared package)

## [Extract button component](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#extract-button-component-1)

The home page has an inline button. Let's extract it to the UI package.

Create `packages/ui/src/button.tsx` with the Button code:

packages/ui/src/button.tsx

```
export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}
 
export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  const baseStyles = {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
  }
 
  const variantStyles = {
    primary: {
      backgroundColor: '#0070f3',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#f5f5f5',
      color: '#333',
      border: '1px solid #e5e7eb',
    },
  }
 
  return (
    <button
      onClick={onClick}
      style={{ ...baseStyles, ...variantStyles[variant] }}
    >
      {children}
    </button>
  )
}
```

The `variant` prop lets you choose between button styles: `primary` (blue, for main actions) or `secondary` (gray, for less prominent actions). This makes the Button reusable across different contexts without hardcoding the styles.

## [Add button to package exports](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#add-button-to-package-exports)

Update `packages/ui/package.json`:

packages/ui/package.json

```
{
  "exports": {
    "./button": "./src/button.tsx",
    "./card": "./src/card.tsx"
  }
}
```

Export from the index file:

packages/ui/src/index.ts

```
export { Button } from './button'
export { Card } from './card'
```

## [Use button in home page](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#use-button-in-home-page)

Update the home page to use the shared `Button`:

apps/web/app/page.tsx

```
import Link from 'next/link'
import { Button } from '@geniusgarage/ui/button'
 
export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <nav style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <Link href="/features" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold' }}>
          Features
        </Link>
      </nav>
 
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠 GeniusGarage</h1>
        <p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '2rem' }}>
          Manage and share your code snippets
        </p>
 
        <Button>Get Started</Button>
 
        <p style={{ color: '#666', marginTop: '3rem', fontSize: '0.875rem' }}>
          This is the starter project. You'll build out the full platform as you progress through the course.
        </p>
      </div>
    </main>
  )
}
```

Much cleaner! The inline button styles are gone.

## [Run and see it work](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#run-and-see-it-work)

Start the dev server:

```
pnpm dev
```

Open **[http://localhost:3000](http://localhost:3000/)** - the button looks identical but now uses the shared component.

## [Test the variant prop](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#test-the-variant-prop)

Let's verify the variant prop works. Change the `Button` to use the secondary variant:

apps/web/app/page.tsx

```
<Button variant="secondary">Get Started</Button>
```

Refresh the browser. The button should now be gray with a border instead of blue.

Change it back to primary (or remove the variant prop since it defaults to primary):

apps/web/app/page.tsx

```
<Button>Get Started</Button>
```

The button returns to blue. The variant system works!

## [What you built](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#what-you-built)

You now have two shared components in your UI package:

**packages/ui:**

- `Card` component (manually extracted in previous lesson)
- `Button` component with variant support (primary and secondary)
- Proper TypeScript types exported for both

**The pattern you've learned:**

1. Create component in `packages/ui/src/`
2. Add to `package.json` exports field
3. Export from `index.ts`
4. Import in any app with `@geniusgarage/ui/component-name`

This pattern scales - you could have 50 components following this exact structure.

## [Commit](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#commit)

Save your work:

```
git add .git commit -m "feat(ui): extract Button component with variants"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#done-when)

Verify your implementation:

- [ ] Button component exists at `packages/ui/src/button.tsx` with variant prop
- [ ] Button exported from `packages/ui/package.json` exports field
- [ ] Button exported from `packages/ui/src/index.ts`
- [ ] Home page uses `<Button>` from `@geniusgarage/ui/button`
- [ ] Button displays correctly on home page

## [What's Next](docs/course/production-monorepostwith-turborepo/2-first-shared-package/4-extract-button-component.md#whats-next)

Next lesson: **Deploy Web App** - you'll push to GitHub, deploy to Vercel, and see Turborepo's remote caching in production. Change a README → cache hit in CI. Change the UI package → selective rebuild. This is where monorepos with Turborepo really shine at scale.
