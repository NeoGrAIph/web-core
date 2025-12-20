source: https://vercel.com/academy/production-monorepos/multi-app-development
# [Multi-app development](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#multi-app-development)

3 apps running means 3 servers, 3 ports, 3 terminal tabs. You need efficient workflows to run all apps, test specific apps, and avoid port conflicts. Turborepo's filtering and parallelization make multi-app development seamless.

## [Outcome](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#outcome)

Learn efficient patterns for developing multiple apps simultaneously.

## [Hands-on exercise 8.3](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#hands-on-exercise-83)

### [Run all apps](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#run-all-apps)

```
pnpm dev
```

Output:

```
• Running dev in 3 packages
@geniusgarage/web:dev: ready on http://localhost:3000
@geniusgarage/snippet-manager:dev: ready on http://localhost:3001
@geniusgarage/docs:dev: ready on http://localhost:3002
```

All apps run in parallel with hot reload!

### [Run specific app](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#run-specific-app)

```
# Only marketing site
pnpm --filter @geniusgarage/web dev
 
# Only snippet manager
pnpm --filter @geniusgarage/snippet-manager dev
 
# Only docs
pnpm --filter @geniusgarage/docs dev
```

Saves resources when working on one app.

### [Run multiple specific apps](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#run-multiple-specific-apps)

```
# Marketing + docs
pnpm --filter @geniusgarage/web --filter @geniusgarage/docs dev
```

### [Run by pattern](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#run-by-pattern)

```
# All apps
pnpm --filter "./apps/*" dev
 
# All packages
pnpm --filter "./packages/*" dev
```

## [Cross-app features](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#cross-app-features)

### [Link between apps](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#link-between-apps)

Update apps/web to link to docs:

apps/web/app/page.tsx

```
<a href="http://localhost:3002" className="text-blue-500 underline">
  View Component Docs
</a>
```

Update apps/docs to link back:

apps/docs/app/page.tsx

```
<a href="http://localhost:3000" className="text-blue-500 underline">
  Back to Marketing
</a>
```

Run all apps and test navigation between them!

### [Shared state (future)](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#shared-state-future)

For apps that need to share data, use:

- **API routes** - one app exposes API, others consume
- **Database** - shared database layer in packages/db
- **Event bus** - packages/events for pub/sub

## [Port management](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#port-management)

**Current ports:**

- 3000: apps/web (marketing)
- 3001: apps/snippet-manager (snippet manager)
- 3002: apps/docs (documentation)

**Add fourth app:**

- 3003: apps/admin (future admin dashboard)

**Configure in package.json:**

```
{
  "scripts": {
    "dev": "next dev --port 3003"
  }
}
```

## [VS code multi-root workspace](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#vs-code-multi-root-workspace)

Create `.vscode/monorepo.code-workspace`:

```
{
  "folders": [
    { "path": "apps/web", "name": "web" },
    { "path": "apps/snippet-manager", "name": "snippet-manager" },
    { "path": "apps/docs", "name": "docs" },
    { "path": "packages/ui", "name": "ui" },
    { "path": "packages/utils", "name": "utils" }
  ],
  "settings": {
    "typescript.tsdk": "node_modules/typescript/lib"
  }
}
```

Open with: File → Open Workspace → Select monorepo.code-workspace

Each folder appears in sidebar!

## [Debugging multiple apps](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#debugging-multiple-apps)

### [Use different browser profiles](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#use-different-browser-profiles)

- **Profile 1:** localhost:3000 (web)
- **Profile 2:** localhost:3001 (app)
- **Profile 3:** localhost:3002 (docs)

Keeps cookies, storage, and devtools separate!

### [Terminal multiplexer](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#terminal-multiplexer)

Use tmux or screen:

```
# Create session with 3 panes
tmux new-session \; \
  split-window -h \; \
  split-window -v \; \
  select-pane -t 0 \; \
  send-keys "pnpm --filter @geniusgarage/web dev" C-m \; \
  select-pane -t 1 \; \
  send-keys "pnpm --filter @geniusgarage/snippet-manager dev" C-m \; \
  select-pane -t 2 \; \
  send-keys "pnpm --filter @geniusgarage/docs dev" C-m
```

All apps in one terminal window!

## [Performance tips](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#performance-tips)

### [Selective dev mode](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#selective-dev-mode)

Only run apps you're working on:

```
# Working on docs? only run docs
pnpm --filter @geniusgarage/docs dev
 
# Testing UI changes? run all apps
pnpm dev
```

### [Build watch mode](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#build-watch-mode)

For packages, use build watch:

```
# Watch UI changes
pnpm --filter @geniusgarage/ui dev:build
 
# In separate terminal, run apps
pnpm --filter "./apps/*" dev
```

### [Restart strategy](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#restart-strategy)

**Change to app code:** Hot reload (automatic)

**Change to shared package:** Restart dev server

```
# Quick restart
Ctrl+C
pnpm dev
```

Or use nodemon/watch for auto-restart.

## [Common workflows](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#common-workflows)

**Frontend-focused work:**

```
# Run all apps, watch for UI changes
pnpm dev
```

**Single-app feature:**

```
# Run only that app
pnpm --filter @geniusgarage/snippet-manager dev
```

**Package development:**

```
# Run package tests in watch mode
pnpm --filter @geniusgarage/ui dev:test
 
# Run one app to test integration
pnpm --filter @geniusgarage/web dev
```

**Full-stack feature:**

```
# Run all apps + packages in watch mode
pnpm dev
```

## [Done-when](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#done-when)

Verify multi-app workflows:

- [ ] Ran `pnpm dev` and saw all 3 apps start
- [ ] Ran specific app with `--filter`
- [ ] Ran multiple apps with multiple `--filter` flags
- [ ] Added cross-app links and tested navigation
- [ ] Understood port management (3000, 3001, 3002)
- [ ] Created VS Code multi-root workspace (optional)
- [ ] Tested selective dev mode for performance
- [ ] Understood when to run all vs specific apps
- [ ] Know how to restart on package changes

## [What's Next](docs/course/production-monorepostwith-turborepo/7-add-third-app/3-multi-app-development.md#whats-next)

Section 7 complete! You have:

- 3 apps running in the monorepo
- All apps deployed independently
- Efficient local development workflows

**Section 8: Enterprise Patterns** - Learn advanced patterns for scaling to large teams: Turborepo generators (auto-create components), Changesets (versioning), and code governance (CODEOWNERS, boundaries). These patterns help 10+ person teams work efficiently in monorepos.
