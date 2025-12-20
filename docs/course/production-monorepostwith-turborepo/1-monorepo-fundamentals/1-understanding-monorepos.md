source: https://vercel.com/academy/production-monorepos/understanding-monorepos

# [Understanding monorepos](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#understanding-monorepos)

You're building a platform with a marketing site, a web app, and documentation. Each shares UI components, utilities, and TypeScript configs. Managing these as separate repositories means coordinating changes across repos, keeping dependencies in sync manually, and copying configs everywhere. One shared button update requires three PRs, three CI runs, and constant version juggling.

Monorepos solve this by bringing related projects into one repository while maintaining clear boundaries and enabling powerful tooling. Let's deploy one to production right now.

## [Fast track](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#fast-track)

1. Deploy GeniusGarage starter to Vercel (forks repo and deploys automatically)
2. See your production URL and explore Turborepo's build output
3. Explore the repository structure on GitHub
4. Optionally clone your fork for local development

## [Hands-on exercise 1.1](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#hands-on-exercise-11)

Get hands-on with a real monorepo by deploying GeniusGarage to production and exploring its structure.

Prerequisites

You need:

- [Vercel account](https://vercel.com/) (free tier works)
- [GitHub account](https://github.com/) (for forking the repo)
- Optionally: Node.js 20.9+ and pnpm 9.1.0+ for local development

We'll deploy first, then you can optionally set up local dev later.

**Requirements:**

1. Deploy the production-monorepos-starter to Vercel (one-click deployment)
2. Verify your production app loads in browser
3. Explore the repository structure on GitHub
4. Understand Vercel's build output and Turborepo caching
5. Optionally: Clone your fork and run locally

**Files to explore (on GitHub or locally):**

- `pnpm-workspace.yaml` (defines workspace packages)
- `package.json` (root coordinator)
- `turbo.json` (task orchestration config)
- `apps/web/package.json` (app-specific config)

## [Deploy to Vercel](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#deploy-to-vercel)

Click the Deploy button below to fork the GeniusGarage starter and deploy it to production:

[![Deploy with Vercel](https://vercel.com/vc-ap-7ae771/_next/image?url=https%3A%2F%2Fvercel.com%2Fbutton&w=3840&q=75)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/production-monorepos-starter&project-name=geniusgarage&repository-name=geniusgarage&root-directory=apps/web)

This will:

1. **Fork the repository** to your GitHub account
2. **Create a Vercel project** linked to your fork
3. **Deploy to production** automatically
4. **Enable Turborepo Remote Caching** for faster builds

What Just Happened?

Vercel detected this is a monorepo, built the web app using Turborepo, and deployed it to a production URL. This entire process took under 2 minutes.

In later lessons, when you push changes to GitHub, Vercel will automatically rebuild and deploy only what changed - thanks to Turborepo's intelligent caching.

## [View your production app](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#view-your-production-app)

After deployment completes:

1. Click the **"Visit"** button in Vercel
2. You should see the GeniusGarage landing page at your production URL (`https://geniusgarage-abc123.vercel.app`)

Your production app shows:

- "🧠 GeniusGarage" heading
- "Organize Your Code, Amplify Your Genius" tagline
- "Get Started" button

**Save your production URL** - you'll be deploying updates throughout this course.

## [Explore the repository on GitHub](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#explore-the-repository-on-github)

Navigate to your forked repository on GitHub (it's linked from your Vercel project dashboard): `YOUR-USERNAME/geniusgarage`.

You'll see the monorepo structure:

```
  geniusgarage/
  ├── apps/                   # Deployable applications
  │   └── web/                # The marketing site (Next.js app)
  ├── .gitignore
  ├── package.json            # Root workspace config
  ├── pnpm-lock.yaml          # Dependency lockfile
  ├── pnpm-workspace.yaml     # Workspace definition
  ├── README.md               # Project README
  └── turbo.json              # Task orchestration (Turborepo config)
```

**Key observations:**

- `apps/` contains deployable applications (just `web` for now)
- `packages/` doesn't exist yet - you'll create it in Section 1
- `turbo.json` tells Vercel this is a Turborepo project
- `pnpm-workspace.yaml` defines the workspace structure

## [Understand the workspace configuration](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#understand-the-workspace-configuration)

Click through to view these files on GitHub:

### [Pnpm-workspace.yaml](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#pnpm-workspaceyaml)

pnpm-workspace.yaml

```
packages:
  - "apps/*"
  - "packages/*"
```

This tells pnpm that every directory in `apps/` and `packages/` is a workspace package. Even though `packages/` doesn't exist yet, we've defined it for when you create shared packages in Section 1.

### [Root package.json](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#root-packagejson)

package.json

```
{
  "name": "geniusgarage",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "devDependencies": {
    "prettier": "^3.2.5",
    "turbo": "^2.3.3"
  },
  "packageManager": "pnpm@9.1.0",
  "engines": {
    "node": ">=20.9.0"
  }
}
```

Notice:

- **scripts**: All point to `turbo run <task>` - Turborepo coordinates everything
- **devDependencies**: Only Turborepo and Prettier at the root
- **packageManager**: Locks pnpm version for consistency
- **engines**: Requires Node.js 20.9+

### [Apps/web/package.json](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#appswebpackagejson)

apps/web/package.json

```
{
  "name": "@geniusgarage/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^16.0.0",
    "typescript": "^5"
  }
}
```

Notice:

- **name**: `@geniusgarage/web` - namespaced package name
- **scripts**: Standard Next.js scripts (no Turborepo here)
- **dependencies**: Next.js, React specific to this app

This is the pattern: **root coordinates, apps implement**.

## [Inspect the Vercel build](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#inspect-the-vercel-build)

Go back to your Vercel project dashboard and click on your deployment. Navigate to the **Build Logs** tab.

You'll see output like:

```
  • Packages in scope: @geniusgarage/web
  • Running build in 1 packages
  • Remote caching enabled
  @geniusgarage/web:build: cache hit, replaying logs
  @geniusgarage/web:build: > next build
  @geniusgarage/web:build: ✓ Creating an optimized production build
  @geniusgarage/web:build: ✓ Compiled successfully

  Tasks:    1 successful, 1 total
  Cached:   1 cached, 1 total
  Time:     2.1s >>> FULL TURBO
```

**What this tells you:**

- Turborepo detected 1 package in scope (`@geniusgarage/web`)
- Remote caching is enabled (Vercel provides this automatically)
- Build completed in 2.1 seconds thanks to caching
- **"FULL TURBO"** means the build was cached - future builds will be even faster

Turborepo Remote Caching

Vercel automatically enables remote caching for Turborepo projects. This means:

- First build: Full compilation (~30-60s)
- Subsequent builds with no changes: Cached** (~**2-5s)
- Partial changes: Only rebuilds affected packages

This is one of Turborepo's killer features - you'll see it in action throughout the course.

## [Optional: Clone your fork for local development](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#optional-clone-your-fork-for-local-development)

If you want to run the monorepo locally (recommended for following along with lessons), clone your fork:

```
git clone https://github.com/YOUR-USERNAME/geniusgarage.git
cd geniusgarage
```

Install dependencies:

```
pnpm install
```

If you don't have pnpm installed:

```
npm install -g pnpm@9.1.0
```

Install Turborepo globally (recommended):

```
pnpm add turbo --global
```

This allows you to run `turbo` directly instead of `turbo`, and ensures you're using the latest version across all projects.

Run the dev server:

```
pnpm dev
```

You should see:

```
  >>> @geniusgarage/web:dev: ready started server on 0.0.0.0:3000
  >>> @geniusgarage/web:dev:   ▲ Next.js 16.0.3
  >>> @geniusgarage/web:dev:   - Local:        http://localhost:3000
```

Open **[http://localhost:3000](http://localhost:3000/)** in your browser - you'll see the same GeniusGarage landing page running locally.

Local vs Production

Throughout this course, you'll make changes locally and push to GitHub. Vercel will automatically deploy your changes to production.

This workflow (local dev → git push → auto-deploy) is the standard modern development cycle.

## [What you just deployed](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#what-you-just-deployed)

You've now deployed a monorepo to production. Here's what makes it special:

**Single Repository Structure:**

```
  geniusgarage/
  ├── apps/                    # Multiple deployable apps (just web for now)
  ├── packages/                # Shared code (coming in Section 1)
  ├── package.json             # Root scripts that coordinate everything
  ├── pnpm-workspace.yaml      # Defines workspaces
  └── turbo.json               # Task orchestration
```

**Key Characteristics:**

1. **One deploy, automatic detection** - Vercel detected the monorepo and built it correctly
2. **Remote caching enabled** - Future builds will be significantly faster
3. **Independent deployments** - Each app can deploy separately despite living together
4. **Real production URL** - Your monorepo is live and accessible

Monorepo ≠ Monolith

The repository structure has nothing to do with deployment architecture:

- **Monorepo**: Multiple projects in one Git repository
- **Monolith**: Single tightly-coupled application

You can have microservices in a monorepo (Google does this), or a monolith split across multiple repositories. These are independent concerns.

## [Real-world scale](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#real-world-scale)

Major tech companies use monorepos:

- **Google**: 2+ billion lines of code, 35 million commits, 25,000+ engineers
- **Meta**: Hundreds of thousands of files across web and mobile
- **Microsoft**: Reduced 1JS repo size by 94% by migrating to monorepo
- **Vercel**: Uses Turborepo for Next.js and related projects

Turborepo has the power to scale huge companies but can work for smaller teams as well.

## [Try it](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#try-it)

### [1. Verify your production deployment](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#1-verify-your-production-deployment)

Navigate to your production URL (from Vercel dashboard). You should see:

- GeniusGarage landing page
- "Organize Your Code, Amplify Your Genius" heading
- "Get Started" button

### [2. Check the build logs](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#2-check-the-build-logs)

In Vercel dashboard:

- Go to your project
- Click the latest deployment
- View **Build Logs**
- Confirm you see "FULL TURBO" and caching indicators

### [3. Explore the repository on GitHub](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#3-explore-the-repository-on-github)

Visit your forked repo:

- Verify `apps/web/` exists
- Check `turbo.json` configuration
- Understand `pnpm-workspace.yaml` structure

### [4. (Optional) run locally](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#4-optional-run-locally)

If you cloned the repo:

```
pnpm install
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000/) and verify it matches production.

## [Commit](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#commit)

This is an exploratory lesson - you've deployed existing code, not written new code yet. Your next commit will be in Section 1 when you start building features.

Git Workflow from Here

For the rest of the course:

1. Make changes locally (or directly on GitHub)
2. Commit and push to your fork
3. Vercel automatically deploys changes
4. Verify in production

This is the standard modern workflow for web development.

## [Done-when](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#done-when)

Verify you've completed the setup:

- [ ] Deployed GeniusGarage to Vercel successfully
- [ ] Have a working production URL (`https://geniusgarage-abc123.vercel.app`)
- [ ] Verified the app loads in browser
- [ ] Checked Vercel build logs showing Turborepo and caching
- [ ] Forked repository exists on your GitHub account
- [ ] Explored repository structure on GitHub
- [ ] Understand `apps/` contains deployable applications
- [ ] Understand `packages/` will contain shared code (empty for now)
- [ ] Examined `pnpm-workspace.yaml` (defines workspaces)
- [ ] Examined root `package.json` (coordinates via `turbo run`)
- [ ] Examined `apps/web/package.json` (implements Next.js tasks)
- [ ] (Optional) Cloned fork and ran `pnpm dev` locally

## [What's Next](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/1-understanding-monorepos.md#whats-next)

You've deployed GeniusGarage to production and understand the monorepo structure. Next lesson: **Monorepos vs Polyrepos** – a hands-on comparison showing when monorepos shine and when they don't fit.
