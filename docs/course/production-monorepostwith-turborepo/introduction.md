source: https://vercel.com/academy/production-monorepos

# Production Monorepos with Turborepo
Monorepos solve these problems.

Let's build **GeniusGarage** - a code snippet management platform for developers. GeniusGarage brings your apps together while maintaining clear boundaries and leveraging Turborepo's intelligent caching for blazing-fast builds.

## [What you'll learn](docs/course/production-monorepostwith-turborepo/introduction.md#what-youll-learn)

This course covers 8 sections that progressively build GeniusGarage, an app where we can show off our code snippets like the trophies they are:

- **Section 1: Monorepo Fundamentals** - Understand what monorepos are, when to use them, and why Turborepo
- **Section 2: First Shared Package** - Create shared UI package with Button and Card components
- **Section 3: Second App** - Add snippet manager app that reuses the UI package
- **Section 4: Shared Configs & Utils** - DRY up TypeScript/ESLint configs and create utility functions
- **Section 5: Testing** - Add Vitest tests to UI package with test caching
- **Section 6: Pipeline Optimization** - Add GitHub Actions, filtering, and remote caching
- **Section 7: Scaling to Multiple Apps** - Add docs app with independent deploys
- **Section 8: Enterprise Patterns** - Add generators, changesets, code governance, and explore next-forge production patterns

## [Prerequisites](docs/course/production-monorepostwith-turborepo/introduction.md#prerequisites)

- [Node.js 20.9+](https://nodejs.org/en/download/) and [pnpm 9+](https://pnpm.io/installation) installed
- Comfortable with [React](https://react.dev/) and [Next.js](https://nextjs.org/) basics
- [Git](https://git-scm.com/downloads) and [GitHub](https://github.com/) account
- [Vercel](https://vercel.com/) account (free tier works fine for this course)
- Basic terminal experience

Coming from Next.js?

You already know component organization, build processes, and deployment. Turborepo extends these skills to managing multiple apps efficiently. You're 80% there.

## [How this course works](docs/course/production-monorepostwith-turborepo/introduction.md#how-this-course-works)

- **Build everything yourself:** Type every line of code so you can understand how everything works
- **Deploy constantly:** Every section ends with working production apps
- **Real metrics matter:** Measure cache hits, build times, actual URLs
- **Progressive complexity:** Each section adds one new capability
- **Production patterns only:** Everything you build ships to users
