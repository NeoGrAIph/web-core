source: https://vercel.com/academy/production-monorepos/deploy-all-apps
# [Deploy all apps](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#deploy-all-apps)

You've added a third app locally - but does deployment scale? You'll deploy all 3 apps as independent Vercel projects, proving that monorepo deployment remains simple as you add apps. Each app gets its own URL, own env vars, and deploys independently.

## [Outcome](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#outcome)

Deploy web, app, and docs to Vercel as 3 independent projects.

## [Fast track](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#fast-track)

1. Deploy apps/docs to Vercel
2. Configure environment variables
3. Verify all 3 apps are live
4. Test independent deployments

## [Hands-on exercise 8.2](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#hands-on-exercise-82)

### [1. Create Vercel project](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#1-create-vercel-project)

Go to [https://vercel.com](https://vercel.com/) → Add New Project → Import your GitHub repository

**Project Settings:**

- **Project Name:** `geniusgarage-docs`
- **Root Directory:** `apps/docs`
- **Framework:** Next.js (auto-detected)
- **Build Command:** Leave default
- **Output Directory:** Leave default

### [2. Add environment variables](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#2-add-environment-variables)

In Vercel project settings → Environment Variables:

- **Key:** `NEXT_PUBLIC_APP_NAME`
- **Value:** `GeniusGarage Docs`
- **Environments:** Production, Preview, Development

### [3. Deploy](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#3-deploy)

Click **Deploy**. Output shows:

```
Building...
  @geniusgarage/ui:build        ✓
  @geniusgarage/docs:build      ✓

Deployment ready: https://geniusgarage-docs.vercel.app
```

Visit URL - docs app is live!

## [Verify all apps](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#verify-all-apps)

You now have 3 independent deployments:

1. **Marketing Site:** [https://your-project.vercel.app](https://your-project.vercel.app/) (apps/web)
2. **Snippet Manager:** [https://geniusgarage-app.vercel.app](https://geniusgarage-app.vercel.app/) (apps/snippet-manager)
3. **Documentation:** [https://geniusgarage-docs.vercel.app](https://geniusgarage-docs.vercel.app/) (apps/docs)

All from one monorepo, all sharing packages/ui!

## [Test independent deployments](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#test-independent-deployments)

### [1. Change only docs](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#1-change-only-docs)

```
echo "# Update docs" >> apps/docs/README.md
git add .
git commit -m "docs: update readme"
git push
```

**Result:**

- ✅ docs rebuilds and deploys
- ⏭️ web and app skip rebuild (not changed)

Independent deploys work!

### [2. Change shared package](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#2-change-shared-package)

```
# Edit packages/ui/src/button.tsx
git add .
git commit -m "feat(ui): update button style"
git push
```

**Result:**

- ✅ web rebuilds (uses ui)
- ✅ app rebuilds (uses ui)
- ✅ docs rebuilds (uses ui)

Shared package changes trigger all dependents!

## [Configure CI for 3 apps](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#configure-ci-for-3-apps)

Your GitHub Actions workflow already handles all 3 apps with git-based filtering:

```
run: turbo build lint test --filter=[origin/main]
```

Turborepo automatically:

- Detects which packages changed
- Builds only affected apps
- Caches everything else

No configuration needed for the third app!

## [Monorepo deployment at scale](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#monorepo-deployment-at-scale)

**3 apps, 1 repository, 3 deployments:**

```
  GitHub: production-monorepos/
  ├── apps/web    → Vercel Project 1
  ├── apps/snippet-manager    → Vercel Project 2
  ├── apps/docs   → Vercel Project 3
  └── packages/ui → Shared by all

  Changes to ui → All 3 redeploy
  Changes to web → Only web redeploys
  Changes to app → Only app redeploys
  Changes to docs → Only docs redeploys
```

**Scaling to 10+ apps:**

- Same pattern
- Same CI pipeline
- Same caching strategy
- No additional configuration

## [Done-when](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#done-when)

Verify all apps deployed:

- [ ] Deployed apps/docs to Vercel
- [ ] Set Root Directory to apps/docs
- [ ] Added NEXT_PUBLIC_APP_NAME env var
- [ ] Verified docs app loads in production
- [ ] Tested all 3 app URLs work
- [ ] Changed docs and saw selective rebuild
- [ ] Changed ui and saw all apps rebuild
- [ ] Understood deployment scales effortlessly

## [What's Next](docs/course/production-monorepostwith-turborepo/7-add-third-app/2-deploy-all-apps.md#whats-next)

3 apps deployed, but how do you develop them locally without conflicts? Final lesson in Section 7: **Multi-App Development** - you'll learn workflows for running specific apps, testing cross-app features, and managing multiple ports efficiently.
