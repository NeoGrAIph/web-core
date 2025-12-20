source: https://vercel.com/academy/production-monorepos/remote-caching
# [Remote caching setup](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#remote-caching-setup)

Local caching only helps you. When a teammate clones the repo or CI runs, they rebuild everything from scratch - wasting time duplicating work you already did locally. Remote caching shares build artifacts across machines.

With Vercel remote cache, if you build locally and push, CI downloads your cached builds instead of rebuilding. Team members get instant cache hits even on first clone. This dramatically speeds up onboarding and CI.

## [Outcome](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#outcome)

Configure Vercel remote caching to share artifacts across team and CI.

## [Fast track](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#fast-track)

1. Sign up for Vercel account
2. Run `turbo login` to authenticate
3. Run `turbo link` to connect repo
4. Verify remote cache works
5. Add token to CI

## [Hands-on exercise 7.3](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#hands-on-exercise-73)

### [Remote caching setup](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#remote-caching-setup-1)

### [1. Login to Vercel](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#1-login-to-vercel)

```
pnpm dlx turbo login
```

Opens browser to authenticate with Vercel (or GitHub/GitLab).

Output:

```
 >>> Opening browser to https://vercel.com/...
 >>> Success! Logged in as youremail@example.com
```

### [2. Link repository](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#2-link-repository)

```
pnpm dlx turbo link
```

Output:

```
 >>> Detected monorepo: production-monorepos
 >>> Link to which scope? (Use arrow keys)
   > your-team (recommended)
     personal

 >>> Success! Linked to your-team/production-monorepos
```

Creates `.turbo/config.json`:

.turbo/config.json

```
{
  "teamId": "team_abc123",
  "apiUrl": "https://vercel.com/api"
}
```

**Add to .gitignore:**

.gitignore

```
# Turbo
.turbo
```

Now remote caching is enabled!

### [3. Test remote cache](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#3-test-remote-cache)

Build something:

```
turbo build
```

Output:

```
 @geniusgarage/web:build: cache miss, executing
   ✓ Built successfully
   >>> Remote caching enabled
   >>> Artifact uploaded
```

**Key:** "Remote caching enabled" and "Artifact uploaded"

Build again on another machine (or after clearing local cache):

```
rm -rf node_modules/.cache/turbo
turbo build
```

Output:

```
 @geniusgarage/web:build: cache hit (remote), downloading
   >>> Downloaded from remote cache in 1.2s
```

Cache hit from remote!

## [Configure CI with remote cache](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#configure-ci-with-remote-cache)

Add Vercel token to GitHub Secrets:

### [1. Generate token](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#1-generate-token)

Go to Vercel dashboard → Settings → Tokens → Create Token

Copy the token (starts with `vercel_...`)

### [2. Add to GitHub secrets](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#2-add-to-github-secrets)

GitHub repo → Settings → Secrets and variables → Actions → New repository secret

- Name: `TURBO_TOKEN`
- Value: `vercel_...` (your token)

### [3. Add team ID](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#3-add-team-id)

While in Vercel dashboard, note your Team ID (or use personal account ID).

Add another secret:

- Name: `TURBO_TEAM`
- Value: `team_abc123` (your team ID)

### [4. Update CI workflow](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#4-update-ci-workflow)

.github/workflows/ci.yml

```
name: CI
 
on:
  push:
    branches:
      - main
  pull_request:
 
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
      TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
 
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
 
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
 
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
 
      - name: Install dependencies
        run: pnpm install
 
      - name: Run build, lint, and test
        run: turbo build lint test --filter=[origin/main]
```

Now CI uses remote cache!

## [Try it](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#try-it)

### [1. Build locally and push](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#1-build-locally-and-push)

```
turbo build
git push
```

Your build uploads to remote cache.

### [2. CI downloads your cache](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#2-ci-downloads-your-cache)

GitHub Actions runs and output shows:

```
@geniusgarage/ui:build: cache hit (remote), downloading
@geniusgarage/web:build: cache hit (remote), downloading

Tasks:    5 successful, 5 total
Cached:   5 cached (remote), 5 total
Time:     18s (was 2m 45s!)
```

**CI didn't rebuild anything - it downloaded your local builds!**

### [3. Team member clones repo](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#3-team-member-clones-repo)

Teammate runs:

```
git clone <repo>
cd production-monorepos
pnpm install
turbo build
```

Output:

```
@geniusgarage/ui:build: cache hit (remote), downloading
@geniusgarage/web:build: cache hit (remote), downloading
...

Tasks:    5 successful, 5 total
Cached:   5 cached (remote), 5 total
Time:     22s
```

First build in 22s instead of 3+ minutes!

## [How remote caching works](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#how-remote-caching-works)

```
Developer 1 (local):
  turbo build
  → Builds packages/ui
  → Uploads artifact to Vercel
  → Hash: abc123

CI (GitHub Actions):
  turbo build
  → Checks remote cache for hash abc123
  → Downloads artifact from Vercel
  → Replays output (instant!)

Developer 2 (local):
  turbo build
  → Checks remote cache for hash abc123
  → Downloads artifact
  → Skip building entirely
```

**Cache is shared across:**

- Team members' local machines
- CI runners
- Different git branches (same hash = cache hit)

## [Security considerations](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#security-considerations)

**Token scoping:**

```
# Read-only token for CI (recommended)# Write token for developers (can upload)
```

Vercel tokens can be read-only or read-write. Use read-only in CI for security.

**What's cached:**

- Build outputs (.next/, dist/, etc.)
- Test results
- Lint results
- Terminal output (stdout/stderr)

**What's NOT cached:**

- Source code
- node_modules
- Environment variables
- Secrets

Remote cache only stores task outputs, not your source.

## [Disable remote caching (if needed)](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#disable-remote-caching-if-needed)

```
# Disable for single command
turbo build --no-cache
 
# Disable permanently (remove config)
rm .turbo/config.json
```

## [Commit](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#commit)

```
# Don't commit .turbo/config.json - it's in .gitignore
git add .github/workflows/ci.yml .gitignore
git commit -m "feat: enable remote caching with Vercel"
```

## [Done-when](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#done-when)

Verify remote caching works:

- [ ] Ran `turbo login` and authenticated with Vercel
- [ ] Ran `turbo link` and connected repository
- [ ] Saw .turbo/config.json created
- [ ] Added .turbo/ to .gitignore
- [ ] Built locally and saw "Artifact uploaded"
- [ ] Cleared local cache and saw "cache hit (remote)"
- [ ] Generated Vercel token
- [ ] Added TURBO_TOKEN and TURBO_TEAM to GitHub Secrets
- [ ] Updated CI workflow with env vars
- [ ] Pushed and saw CI download remote cache
- [ ] Understood remote cache is shared across team
- [ ] Understood only outputs are cached, not source

## [What's Next](docs/course/production-monorepostwith-turborepo/6-pipeline-optimization/3-remote-caching.md#whats-next)

Section 5 complete! Your CI/CD pipeline is optimized with GitHub Actions, filtering, and remote caching.

**Section 6: Add Third App** - you'll add a docs app to the monorepo, proving that all your infrastructure (shared packages, configs, CI/CD) scales effortlessly to new applications.
