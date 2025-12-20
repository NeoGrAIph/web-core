source: https://vercel.com/academy/production-monorepos/next-forge-patterns
# [Production patterns with next-forge](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#production-patterns-with-next-forge)

You've built GeniusGarage from scratch - created shared packages, configured pipelines, added testing, set up CI/CD, and implemented enterprise patterns. But how do these patterns scale to a full production application with authentication, databases, monitoring, and edge functions?

[next-forge](https://www.next-forge.com/) is Vercel's production-ready Turborepo starter that demonstrates all the patterns you've learned, plus advanced features needed for real applications. It's maintained by the team at Vercel and serves as both a learning resource and a foundation for serious projects.

## [Outcome](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#outcome)

Understand how next-forge applies monorepo patterns at production scale and explore it as a reference for your own projects.

## [What is next-forge?](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#what-is-next-forge)

next-forge is a comprehensive Turborepo starter that showcases advanced monorepo patterns and modern development practices. It's not just a template - it's a showcase of best practices learned from building and scaling monorepos at Vercel.

**next-forge provides:**

- **Production-ready architecture** with TypeScript, Next.js, and Turborepo
- **Enterprise-grade tooling** including authentication, database, and monitoring
- **Best practices** for monorepo development and deployment
- **Real-world patterns** used by companies scaling with Turborepo

## [Key features](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#key-features)

### [Modern tech stack](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#modern-tech-stack)

next-forge uses cutting-edge technologies:

- **Framework**: Turborepo with multiple Next.js apps and Storybook
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS with shadcn/ui design system
- **Database**: Neon (PostgreSQL) with Drizzle ORM
- **Authentication**: Clerk components and middleware
- **Linting**: Biome for fast linting and formatting
- **Deployment**: Vercel with edge functions

### [Monorepo architecture](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#monorepo-architecture)

next-forge has a handful of apps and many packages, each with clear responsibilities:

```
  next-forge/
  ├── apps/                 # Multiple Next.js applications
  │   ├── web/              # Main web app
  │   ├── app/              # Core application
  │   └── docs/             # Documentation site
  ├── packages/             # Shared packages
  │   ├── ui/               # Design system components
  │   ├── auth/             # Authentication utilities
  │   ├── database/         # Database schema and queries
  │   ├── email/            # Email templates and sending
  │   └── ...               # Many more specialized packages
  ├── biome.json            # Biome configuration
  ├── package.json          # Root package configuration
  ├── pnpm-workspace.yaml   # Workspace configuration
  ├── tsconfig.json         # Root TypeScript config
  └── turbo.json            # Turborepo pipeline configuration
```

## [What makes next-forge special?](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#what-makes-next-forge-special)

Unlike basic templates, next-forge includes patterns you've learned in this course, taken further:

### [1. Advanced package organization](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#1-advanced-package-organization)

Where GeniusGarage has `ui`, `config`, and `utils`, next-forge breaks packages down by responsibility:

- `@repo/design-system` - Complete design system with tokens
- `@repo/database` - Database schema, migrations, and client
- `@repo/auth` - Authentication logic and utilities
- `@repo/email` - Transactional email templates
- `@repo/monitoring` - Logging and analytics

**Why it matters**: Clear package boundaries prevent coupling and enable teams to own specific domains.

### [2. Production-grade tooling](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#2-production-grade-tooling)

next-forge uses Biome instead of ESLint + Prettier for:

- **10x faster** linting and formatting (Rust vs Node.js)
- **Unified configuration** - one tool for all code quality
- **Import sorting** built-in

### [3. Advanced Turborepo configuration](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#3-advanced-turborepo-configuration)

turbo.json (simplified)

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

Notice the patterns you learned:

- `^build` dependency notation (build dependencies first)
- Cache disabling for dev servers
- Output definitions for precise caching
- Persistent tasks for watch modes

### [4. Security and performance](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#4-security-and-performance)

next-forge includes:

- **Content Security Policy** headers
- **Rate limiting** for API routes
- **Edge middleware** for auth
- **Image optimization** pipeline
- **Bundle analysis** in CI

## [Comparing GeniusGarage to next-forge](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#comparing-geniusgarage-to-next-forge)

**What you built (GeniusGarage):**

- 3 apps (web, snippet-manager, docs)
- 3 packages (ui, config, utils)
- Basic CI/CD with caching
- Fundamental patterns

**What next-forge adds:**

- Multiple apps with different deployment targets
- 15+ specialized packages
- Advanced authentication and database patterns
- Monitoring, analytics, and observability
- Edge computing patterns
- Advanced TypeScript patterns

**The progression**: GeniusGarage teaches fundamentals. next-forge shows how to scale them.

## [Use cases for next-forge](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#use-cases-for-next-forge)

next-forge is ideal for:

- **Startups** building scalable products from day one
- **Enterprises** needing robust monorepo patterns
- **Teams** wanting to learn production best practices
- **Developers** building serious side projects
- **Agencies** creating client applications

However, it's probably not the best fit for:

- **Simple landing pages** (too much infrastructure)
- **Learning basic React** (assumes advanced knowledge)
- **Rapid prototypes** (setup overhead)
- **Non-TypeScript projects**

## [Exploring next-forge](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#exploring-next-forge)

Visit [next-forge.com](https://www.next-forge.com/) to:

1. **Browse the live demo** - See the template in action
2. **Read the documentation** - Learn about specific patterns
3. **Clone the repository** - Explore the code locally
4. **Use as a starter** - Build your next project on it

```
# Clone and explore next-forgegit clone https://github.com/haydenbleasel/next-forge.gitcd next-forgepnpm installpnpm dev
```

## [Patterns to study](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#patterns-to-study)

When exploring next-forge, pay attention to:

1. **Package boundaries** - How packages are split by domain
2. **Turborepo configuration** - Advanced pipeline patterns
3. **Shared configurations** - TypeScript, Biome, Tailwind
4. **Build optimization** - Caching strategies and outputs
5. **Testing strategy** - Unit, integration, and E2E tests
6. **CI/CD pipelines** - GitHub Actions with remote caching
7. **Deployment patterns** - Multiple apps to Vercel
8. **Type safety** - Strict TypeScript across packages

## [Key takeaways](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#key-takeaways)

- **next-forge demonstrates production patterns** you've learned, scaled to enterprise needs
- **All your GeniusGarage patterns apply** - shared packages, configs, caching, CI/CD
- **Additional patterns emerge at scale** - package boundaries, security, monitoring
- **It's a learning resource** - study it to see how patterns combine
- **It's a starter template** - use it for your next serious project

## [Summary](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#summary)

You've completed the Production Monorepos course by building GeniusGarage from scratch. You now understand:

- ✅ Monorepo fundamentals and when to use them
- ✅ Creating and managing shared packages
- ✅ Turborepo caching and task orchestration
- ✅ Testing strategies with cache optimization
- ✅ Environment variable management
- ✅ CI/CD with GitHub Actions and remote caching
- ✅ Scaling to multiple apps
- ✅ Enterprise patterns (generators, changesets, governance)

next-forge shows how these patterns combine in a production application. Use it as:

- **A reference** when implementing similar features
- **A starter** for your next project
- **A learning tool** to see advanced patterns
- **Inspiration** for organizing your own monorepo

## [What's Next](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/4-next-forge-patterns.md#whats-next)

Continue your monorepo journey by:

1. **Finishing GeniusGarage** - Deploy your apps and share with others
2. **Exploring next-forge** - Study how patterns scale
3. **Building your own** - Apply patterns to real projects
4. **Contributing** - Improve next-forge or create your own patterns
5. **Sharing knowledge** - Teach others what you've learned

You're now equipped to build, scale, and maintain production monorepos. Ship it! 🚀
