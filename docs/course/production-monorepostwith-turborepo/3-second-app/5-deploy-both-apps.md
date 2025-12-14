source: https://vercel.com/academy/production-monorepos/deploy-both-apps
# [Deploy both apps](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#deploy-both-apps)

You already deployed apps/web in Section 1. Now you have a second app (snippet manager) that also uses packages/ui. Can you deploy both apps independently from the same repository? This lesson proves the monorepo deployment story: multiple apps, each with its own URL, all sharing the same packages - no npm publishing required.

This is the monorepo payoff: deploy apps separately while sharing code.

## [Outcome](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#outcome)

Deploy apps/snippet-manager as a second Vercel project from the same repository, proving that two apps can deploy independently while sharing packages/ui.

## [Fast track](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#fast-track)

1. Commit and push snippet manager code to GitHub
2. Create second Vercel project from same repo
3. Configure apps/snippet-manager deployment
4. Verify both apps work independently in production

## [Hands-on exercise 3.5](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#hands-on-exercise-35)

Deploy apps/snippet-manager as a second independent app from your monorepo.

**Requirements:**

1. Commit and push all snippet manager changes to GitHub
2. Create new Vercel project (second project from same repo)
3. Configure apps/snippet-manager deployment:
    - Root Directory: `apps/snippet-manager`
    - Build Command: `turbo build --filter=@geniusgarage/snippet-manager`
4. Verify deployment succeeds
5. Test snippet creation in production
6. Confirm both apps use shared packages/ui

**Implementation hints:**

- You already have apps/web deployed from Section 1
- Vercel allows multiple projects from one repository
- Each app gets separate Vercel project with own URL
- Both build from same packages/ui source
- No coordination needed - deploy independently

**Expected behavior:**

- apps/web continues running at its URL (from Section 1)
- apps/snippet-manager deploys to new URL
- Both apps work independently
- Both share identical Button and SnippetCard components

## [Verify your existing deployment](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#verify-your-existing-deployment)

Before deploying the snippet manager, confirm apps/web is already deployed from Section 1.

Visit your Vercel dashboard. You should see one project for the marketing site:

- **Project name:** Something like `geniusgarage-web` or `production-monorepos`
- **Root Directory:** `apps/web` (or blank with filter)
- **URL:** `your-project.vercel.app`

Visit the URL and verify:

- Home page loads
- `/features` page shows feature cards
- Button and Card components from packages/ui work

Good! Now let's deploy the second app.

## [Deploy snippet manager (apps/snippet-manager)](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#deploy-snippet-manager-appssnippet-manager)

Time to deploy the second app from the same repository.

### [1. Commit and push your changes](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#1-commit-and-push-your-changes)

First, ensure all your snippet manager work is committed:

```
git add .
git commit -m "feat(app): complete snippet manager with modal"
git push
```

### [2. Create new Vercel project](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#2-create-new-vercel-project)

1. Go to Vercel dashboard
2. Click "Add New Project"
3. Import the **same GitHub repository** again
4. Yes, Vercel allows multiple projects from one repo!

### [3. Configure deployment](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#3-configure-deployment)

**Project Name:** Set to something like `geniusgarage-snippet-manager` (different from your first project)

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** Click "Edit" → set to `apps/snippet-manager`

**Build Command:** Change to `turbo build --filter=@geniusgarage/snippet-manager`

**Output Directory:** Leave default (`.next`)

**Install Command:** Leave default (`pnpm install`)

**Environment Variables:** Add `ENABLE_EXPERIMENTAL_COREPACK` with value: `1`.: This will ensure that the corepack is used to install dependencies at the exact version specified.

This configuration tells Vercel:

- Only build the snippet-manager app
- Use Turborepo's filtered build for efficiency
- Look for the output in apps/snippet-manager/.next

### [4. Deploy](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#4-deploy)

Click "Deploy" and wait for the build.

**Build output:**

```
Running "pnpm install"
✓ Installed dependencies

Running "turbo build --filter=@geniusgarage/snippet-manager"
• Packages in scope: @geniusgarage/snippet-manager, @geniusgarage/ui
• Tasks:    2 successful (packages/ui, apps/snippet-manager)
✓ Compiled successfully
```

Watch what happens:

1. Vercel installs all workspace dependencies
2. Turborepo builds packages/ui first (dependency)
3. Then builds apps/snippet-manager (depends on ui)
4. Both apps share the same packages/ui code!

### [5. Verify deployment](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#5-verify-deployment)

Visit the deployed URL (e.g., `geniusgarage-app.vercel.app`).

You should see:

- "My Snippets" header with "+ New Snippet" button
- 3 initial snippets in SnippetCard components
- CodeBlock with dark background syntax highlighting
- All shared components from packages/ui working

## [Try it](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#try-it)

### [1. Test snippet creation in production](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#1-test-snippet-creation-in-production)

Visit your deployed snippet manager URL and test interactivity:

1. Click "+ New Snippet"
2. Fill in the form:
    - Title: "Production Test"
    - Language: JavaScript
    - Code: `console.log('Deployed from monorepo!')`
    - Tags: `production, monorepo`
3. Click "Create Snippet"
4. Snippet appears at top of list

State management works in production! (It's in-memory, so refresh resets)

### [2. Verify shared components across both apps](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#2-verify-shared-components-across-both-apps)

This is the monorepo magic. Open both apps in separate tabs:

- **apps/web** (from Section 1): `your-project.vercel.app/features`
- **apps/snippet-manager** (just deployed): `geniusgarage-snippet-manager.vercel.app`

Compare the Button and Card/SnippetCard components. Notice:

- Identical styling and behavior
- Same hover effects
- Same font, spacing, shadows

They're identical because both apps import from the same packages/ui source code. Vercel built packages/ui once for each deployment and both apps used it.

**The payoff:** Change Button in packages/ui → push → both apps rebuild with new Button. No npm publishing, no version coordination.

### [3. Compare build logs](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#3-compare-build-logs)

In Vercel dashboard, look at the deployment logs for both projects:

**apps/web build:**

```
• Packages in scope: @geniusgarage/web, @geniusgarage/ui
• Tasks:    2 successful
✓ Built packages/ui
✓ Built apps/web
```

**apps/snippet-manager build:**

```
• Packages in scope: @geniusgarage/snippet-manager, @geniusgarage/ui
• Tasks:    2 successful
✓ Built packages/ui
✓ Built apps/snippet-manager
```

Both builds include packages/ui because both apps depend on it. Turborepo:

1. Detects dependencies (both apps need @geniusgarage/ui)
2. Builds packages/ui first
3. Builds the app (uses the built ui package)
4. Caches everything for next time

## [How monorepo deployment works](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#how-monorepo-deployment-works)

You now have two independent apps deployed from one repository:

```
  GitHub: your-monorepo/
  ├── apps/web               → Vercel Project 1 (Section 1)
  ├── apps/snippet-manager   → Vercel Project 2 (Section 2)
  └── packages/ui            ← Both projects build this

  Vercel Project 1 (Marketing Site):
  - Root Directory: apps/web
  - Build: turbo build --filter=@geniusgarage/web
  - URL: your-project.vercel.app
- Deploys: packages/ui → apps/web

Vercel Project 2 (Snippet Manager):
- Root Directory: apps/snippet-manager
- Build: turbo build --filter=@geniusgarage/snippet-manager
- URL: geniusgarage-snippet-manager.vercel.app
- Deploys: packages/ui → apps/snippet-manager
```

**Monorepo deployment model:**

- ✅ **One repository** - Single source of truth
- ✅ **Multiple projects** - Each app is separate Vercel project
- ✅ **Independent URLs** - Each app has its own domain
- ✅ **Shared code** - Both build from same packages/ui source
- ✅ **No publishing** - No npm, no version management

**The advantage:**

1. Change Button in packages/ui
2. Commit and push to GitHub
3. Both apps automatically redeploy with updated Button
4. No version coordination, no dependency hell

This is why monorepos exist.

## [Configure selective deployments (optional)](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#configure-selective-deployments-optional)

By default, Vercel redeploys both projects on every push to main.

**The problem:** Change README → both apps rebuild unnecessarily.

**The solution:** Configure "Ignored Build Step" to only rebuild when relevant files change.

### [For apps/web project:](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#for-appsweb-project)

In Vercel project settings:

1. Go to Project Settings → Git
2. Find "Ignored Build Step" section
3. Add this command:
    
    ```
    git diff HEAD^ HEAD --quiet . ../packages/ui
    ```
    

This only rebuilds apps/web if `apps/web/` or `packages/ui/` changed in the latest commit.

### [For apps/snippet-manager project:](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#for-appssnippet-manager-project)

Same process:

```
git diff HEAD^ HEAD --quiet . ../packages/ui
```

Now each app only rebuilds when it or its shared dependencies change. Update README → no rebuilds. Update packages/ui → both rebuild. Update apps/web → only web rebuilds.

This saves build time and deployment costs on large monorepos.

## [Commit](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#commit)

No code changes in this lesson, but document your deployment URLs:

```
# Update README with deployment urls
echo "
## Deployed apps
 
- Marketing Site: https://your-project.vercel.app
- Snippet Manager: https://geniusgarage-app.vercel.app
" >> README.md
 
git add .
git commit -m "docs: add deployment URLs to README"
git push
```

## [Done-when](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#done-when)

Verify both apps are deployed independently:

- [ ] apps/web deployed and accessible (from Section 1)
- [ ] apps/snippet-manager deployed as second Vercel project
- [ ] Both apps have separate URLs and deploy independently
- [ ] Snippet creation works in production
- [ ] Both apps use identical Button and Card components
- [ ] Build logs show packages/ui building before each app
- [ ] (Optional) Configured Ignored Build Step for selective rebuilds
- [ ] Deployment URLs documented in README

## [What's Next](docs/course/production-monorepostwith-turborepo/3-second-app/5-deploy-both-apps.md#whats-next)

Section 2 complete! You have:

- 2 apps deployed independently
- Both apps sharing packages/ui components
- Interactive snippet creation working
- Production-ready monorepo deployment

**Section 3: Shared Configs & Utils** - You'll create more shared packages for TypeScript configs, ESLint rules, and utility functions. Instead of just sharing UI components, you'll share tooling and utilities across apps, demonstrating the full power of monorepo code sharing.
