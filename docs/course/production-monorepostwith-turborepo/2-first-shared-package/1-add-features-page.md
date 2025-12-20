source: https://vercel.com/academy/production-monorepos/add-features-page
# [Add features page](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#add-features-page)

Before you extract components into a shared package, you need components to extract. You'll build a features page with inline Card components that display GeniusGarage's features. Right now everything is inline in one app. In the next lesson, you'll see why that becomes a problem when you need the same components in a second app.

## [Outcome](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#outcome)

Create a features page with 6 inline card components and navigation, intentionally introducing duplication that shared packages will solve.

## [Fast track](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#fast-track)

1. Create `app/features/page.tsx` with TODO scaffolds
2. Implement navigation bar, title, and feature cards grid
3. Add navigation link from home page
4. Run dev server and verify both pages work

## [Hands-on exercise 2.1](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#hands-on-exercise-21)

Build a features page for GeniusGarage with inline components (purposeful duplication to demonstrate the problem).

**Requirements:**

1. Create `/features` route with `app/features/page.tsx`
2. Add navigation bar with logo and Features link
3. Create 6 feature cards in a responsive grid (⚡ Fast Search, 📁 Organized, 🔗 Shareable, etc.)
4. Use inline div elements with inline styles for cards (duplication on purpose)
5. Update home page to link to features page
6. Verify navigation works both ways

**Implementation hints:**

- Start with TODO scaffolds to organize work
- Use CSS grid with `repeat(auto-fit, minmax(300px, 1fr))` for responsive layout
- Keep all styling inline (no CSS files) for now
- **Purpose:** Experience the pain of duplication before solving it with shared packages
- Each card should have identical structure and styles (this becomes the extraction target)

**Files to create/modify:**

- `apps/web/app/features/page.tsx` (new route)
- `apps/web/app/page.tsx` (add Features link)

## [Create the features page](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#create-the-features-page)

Create the directory and file:

```
mkdir -p apps/web/app/features
```

Create `apps/web/app/features/page.tsx` with the TODO scaffold. If this is your first foray into Next.js, you're getting acquainted with the App Router. Think of the page as the root route handler for the `/features` path. When we visit `/features`, this page is rendered.

apps/web/app/features/page.tsx

```
import Link from 'next/link'
 
export default function Features() {
  return (
    <main style={{ padding: '4rem 2rem', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      {/* TODO: Add navigation bar with logo and links */}
 
      {/* TODO: Add page title and description */}
 
      {/* TODO: Add feature cards grid */}
    </main>
  )
}
```

Now let's implement it piece by piece.

## [Add navigation](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#add-navigation)

Replace the first TODO with a navigation bar:

apps/web/app/features/page.tsx

```
import Link from 'next/link'
 
export default function Features() {
  return (
    <main style={{ padding: '4rem 2rem', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#000' }}>
          🧠 GeniusGarage
        </Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/features" style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>Features</Link>
        </div>
      </nav>
 
      {/* TODO: Add page title and description */}
 
      {/* TODO: Add feature cards grid */}
    </main>
  )
}
```

## [Add page header](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#add-page-header)

Replace the second TODO:

apps/web/app/features/page.tsx

```
import Link from 'next/link'
 
export default function Features() {
  return (
    <main style={{ padding: '4rem 2rem', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#000' }}>
          🧠 GeniusGarage
        </Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/features" style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>Features</Link>
        </div>
      </nav>
 
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>Features</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem', textAlign: 'center' }}>
        Everything you need to manage your code snippets
      </p>
 
      {/* TODO: Add feature cards grid */}
    </main>
  )
}
```

## [Add feature cards (inline components)](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#add-feature-cards-inline-components)

Now add the feature grid with inline Card components:

apps/web/app/features/page.tsx

```
import Link from 'next/link'
 
export default function Features() {
  return (
    <main style={{ padding: '4rem 2rem', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#000' }}>
          🧠 GeniusGarage
        </Link>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/features" style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>Features</Link>
        </div>
      </nav>
 
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>Features</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem', textAlign: 'center' }}>
        Everything you need to manage your code snippets
      </p>
 
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>⚡ Fast Search</h3>
          <p style={{ color: '#666' }}>Find your snippets instantly with powerful full-text search and filtering by tags</p>
        </div>
        <div style={{ padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📁 Organized</h3>
          <p style={{ color: '#666' }}>Keep your code organized with tags, folders, and collections</p>
        </div>
        <div style={{ padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🔗 Shareable</h3>
          <p style={{ color: '#666' }}>Share snippets with your team or make them public for the community</p>
        </div>
        <div style={{ padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🎨 Syntax Highlighting</h3>
          <p style={{ color: '#666' }}>Beautiful syntax highlighting for 100+ programming languages</p>
        </div>
        <div style={{ padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📋 One-Click Copy</h3>
          <p style={{ color: '#666' }}>Copy snippets to your clipboard with a single click</p>
        </div>
        <div style={{ padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>🔐 Private & Secure</h3>
          <p style={{ color: '#666' }}>Your private snippets stay private with enterprise-grade security</p>
        </div>
      </div>
    </main>
  )
}
```

Notice the Duplication

Every card has the same structure and styles. You're copy-pasting the same div with border, padding, and border-radius six times. If this causes you physical pain to do this, that's intentional! This works for one page, but imagine needing these cards in a pricing page, a documentation page, and eventually in three other apps.

This is exactly why we need shared packages.

## [Run and see it](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#run-and-see-it)

Start the dev server:

```
pnpm dev
```

Open **[http://localhost:3000/features](http://localhost:3000/features)** in your browser.

You should see:

- Navigation bar with "GeniusGarage" logo and "Features" link
- Page title "Features" and description
- 6 feature cards in a responsive grid

## [Update the home page navigation](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#update-the-home-page-navigation)

Let's add a link to the features page from the home page. Open `apps/web/app/page.tsx`:

apps/web/app/page.tsx

```
import Link from 'next/link'
 
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
 
        <button style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: '600',
          backgroundColor: '#0070f3',
          color: 'white',
        }}>
          Get Started
        </button>
 
        <p style={{ color: '#666', marginTop: '3rem', fontSize: '0.875rem' }}>
          This is the starter project. You'll build out the full platform as you progress through the course.
        </p>
      </div>
    </main>
  )
}
```

Now you can navigate between the home page and features page. Try it - click "Features" from home, then click the logo to go back.

## [Try it](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#try-it)

### [1. Start the dev server](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#1-start-the-dev-server)

```
pnpm dev
```

You should see:

```
 >>> @geniusgarage/web:dev: ready started server on 0.0.0.0:3000
 >>> @geniusgarage/web:dev:   ▲ Next.js 16.0.0
```

### [2. Navigate to the features page](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#2-navigate-to-the-features-page)

Open **[http://localhost:3000/features](http://localhost:3000/features)**

You should see:

- Navigation bar with "GeniusGarage" logo and "Features" link
- Page title "Features" and subtitle
- 6 feature cards in a grid layout (⚡ Fast Search, 📁 Organized, 🔗 Shareable, etc.)
- Each card has emoji + title + description
- Gray borders around each card
- Responsive grid (try resizing browser - 3 columns → 2 → 1)

### [3. Test navigation](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#3-test-navigation)

- Click "GeniusGarage" logo → goes to home page
- From home, click "Features" link → goes back to features page
- Navigation works both ways

### [4. Observe the duplication](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#4-observe-the-duplication)

Look at the features page code. Notice:

- 6 nearly identical `<div>` blocks with same structure and styles
- Copy-pasted card structure (padding, border, borderRadius, etc.)
- This duplication is intentional - you'll fix it in the next lesson

## [The duplication problem](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#the-duplication-problem)

You now have:

- 6 duplicate card divs in the features page
- An inline button on the home page
- The same navigation styles in both pages

When you add a second app in Section 2, you'll need these same components. You could copy-paste them, but that's a maintenance nightmare. Change the card's border color? Update it in 10+ places across 2+ apps.

**This is exactly what shared packages solve.**

## [Commit](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#commit)

Save your work:

```
git add .
git commit -m "feat(web): add features page with inline components"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#done-when)

Verify your implementation:

- [ ] Features page exists at `apps/web/app/features/page.tsx`
- [ ] Page loads at [http://localhost:3000/features](http://localhost:3000/features)
- [ ] Navigation bar displays with logo and Features link
- [ ] 6 feature cards display in grid (⚡ Fast Search, 📁 Organized, 🔗 Shareable, 🎨 Syntax Highlighting, 📋 One-Click Copy, 🔐 Private & Secure)
- [ ] Each card has emoji, title (h3), and description (p)
- [ ] Cards have gray borders and padding
- [ ] Grid is responsive (3 columns → 2 → 1 on resize)
- [ ] Home page has "Features" link in navigation
- [ ] Clicking logo from features returns to home
- [ ] Clicking "Features" from home goes to features page
- [ ] No console errors

## [What's Next](docs/course/production-monorepostwith-turborepo/2-first-shared-package/1-add-features-page.md#whats-next)

Next lesson: **Create UI Package** - you'll create `packages/ui` and extract the Card component into a shared package. Then you'll import it with `@geniusgarage/ui/card` and see workspace dependencies in action.
