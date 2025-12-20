source: https://vercel.com/academy/production-monorepos/changesets-versioning
# [Changesets for versioning](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#changesets-for-versioning)

When you change packages/ui, how do you know if it's a patch (0.0.1→0.0.2), minor (0.1.0→0.2.0), or major (1.0.0→2.0.0) change? Manual versioning leads to mistakes: forgetting to bump versions, inconsistent changelogs, breaking changes without warning. Changesets automates semantic versioning and generates changelogs from your commits.

## [Outcome](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#outcome)

Set up Changesets to manage package versions and changelogs automatically.

## [Fast track](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#fast-track)

1. Install @changesets/cli
2. Initialize changesets configuration
3. Create first changeset
4. Version and generate changelog

## [Hands-on exercise 9.2](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#hands-on-exercise-92)

### [1. Install dependencies](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#1-install-dependencies)

```
pnpm add -D @changesets/cli
```

### [2. Initialize Changesets](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#2-initialize-changesets)

```
pnpm changeset init
```

Output:

```
🦋  Thanks for choosing changesets to version your packages!
🦋  Generating .changeset folder and config
```

This creates:

- `.changeset/config.json` - configuration
- `.changeset/README.md` - usage docs

### [3. Configure Changesets](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#3-configure-changesets)

Edit `.changeset/config.json`:

.changeset/config.json

```
{
  // TODO: Configure the following fields:
  //   - "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json"
  //   - "changelog": "@changesets/cli/changelog"
  //   - "commit": false
  //   - "fixed": []
  //   - "linked": []
  //   - "access": "public"
  //   - "baseBranch": "main"
  //   - "updateInternalDependencies": "patch"
  //   - "ignore": []
}
```

### Solution

.changeset/config.json
```
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```
## [Create first changeset](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#create-first-changeset)

### [1. Make a change to UI package](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#1-make-a-change-to-ui-package)

Edit `packages/ui/src/button.tsx`:

packages/ui/src/button.tsx

```
export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',  // New variant!
  }
 
  return (
    <button onClick={onClick} className={`${variants[variant]} px-4 py-2 rounded`}>
      {children}
    </button>
  )
}
```

Update types:

packages/ui/src/button.tsx

```
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'  // Add 'danger'
  onClick?: () => void
  children: React.ReactNode
}
```

### [2. Create changeset](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#2-create-changeset)

```
pnpm changeset
```

Interactive prompts:

```
🦋  What kind of change is this for @geniusgarage/ui?
❯ major (breaking change)
  minor (new feature)
  patch (bug fix)
```

Select **minor** (new feature - added danger variant).

```
🦋  Please enter a summary for this change:
❯ Add danger variant to Button component
```

Output:

```
🦋  Changeset created!
🦋  Generated changeset file: .changeset/cool-tigers-march.md
```

### [3. View changeset file](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#3-view-changeset-file)

.changeset/cool-tigers-march.md

```
---
'@geniusgarage/ui': minor
---
 
Add danger variant to Button component
```

This file tracks:

- **Which package changed** (`@geniusgarage/ui`)
- **What type of change** (`minor`)
- **What changed** (summary)

Commit this file with your code!

## [Version and changelog](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#version-and-changelog)

### [1. Apply Changesets](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#1-apply-changesets)

```
pnpm changeset version
```

Output:

```
🦋  All files have been updated. You're ready to publish!
```

This command:

1. **Updates package.json versions** based on changesets
2. **Generates CHANGELOG.md** with changes
3. **Deletes changeset files** (they're applied)

### [2. Check updated versions](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#2-check-updated-versions)

View `packages/ui/package.json`:

packages/ui/package.json

```
{
  "name": "@geniusgarage/ui",
  "version": "0.2.0",  // Was 0.1.0, now 0.2.0 (minor bump)
  "main": "./src/index.ts"
}
```

View generated `packages/ui/CHANGELOG.md`:

packages/ui/CHANGELOG.md

```
# @geniusgarage/ui
 
## 0.2.0
 
### Minor changes
 
- abc123f: Add danger variant to Button component
```

Automatic changelog from your changeset!

### [3. Commit version changes](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#3-commit-version-changes)

```
git add -A
git commit -m "chore: version packages"
git push
```


## [Try it](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#try-it)

### [1. Create multiple Changesets](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#1-create-multiple-changesets)

Make a bug fix in utils:

packages/utils/src/format-date.ts

```
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',  // Was 'long', fix to 'medium'
  }).format(date)
}
```

Create changeset:

```
pnpm changeset
```

Select **patch** (bug fix), summary: "Fix date formatting style".

Make a breaking change in typescript-config:

packages/typescript-config/base.json

```
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true  // New strict rule (breaking)
  }
}
```

Create changeset:

```
pnpm changeset
```

Select **major** (breaking change), summary: "Add strict index access checking".

### [2. Version all packages](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#2-version-all-packages)

```
pnpm changeset version
```

Output:

```
🦋  @geniusgarage/ui: 0.2.0 → 0.2.0 (no change)
🦋  @geniusgarage/utils: 0.1.0 → 0.1.1 (patch)
🦋  @geniusgarage/typescript-config: 0.1.0 → 1.0.0 (major)
```

Check `packages/typescript-config/CHANGELOG.md`:

```
# @geniusgarage/typescript-config
 
## 1.0.0
 
### Major changes
 
- def456g: Add strict index access checking
 
BREAKING CHANGE: Enables noUncheckedIndexedAccess, may cause type errors in consuming packages.
```

Automatic versioning and changelog generation for all packages!

### [3. Verify dependent apps bump versions](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#3-verify-dependent-apps-bump-versions)

Check `apps/web/package.json`:

apps/web/package.json

```
{
  "name": "@geniusgarage/web",
  "dependencies": {
    "@geniusgarage/ui": "workspace:*",
    "@geniusgarage/typescript-config": "workspace:*"  // Still uses workspace protocol
  }
}
```

Workspace protocol means "always use local version" - no manual updates needed!

## [Semantic versioning rules](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#semantic-versioning-rules)

**Patch (0.0.x):**

- Bug fixes
- Performance improvements
- Internal refactoring
- Documentation updates

**Minor (0.x.0):**

- New features
- New components
- New optional parameters
- Deprecation warnings

**Major (x.0.0):**

- Breaking API changes
- Removed features
- Required parameter changes
- Major dependency upgrades

## [Publishing workflow (optional)](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#publishing-workflow-optional)

For teams publishing to npm, add publish script:

### [1. Add publish command](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#1-add-publish-command)

package.json

```
{
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version",
    "publish-packages": "changeset publish"
  }
}
```

### [2. Publish to npm](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#2-publish-to-npm)

```
# Build all packages
pnpm build
 
# Publish changed packages
pnpm publish-packages
```

Changesets publishes only packages with version bumps to npm!

### [3. GitHub Actions workflow](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#3-github-actions-workflow)

.github/workflows/release.yml

```
name: Release
 
on:
  push:
    branches:
      - main
 
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
 
      - uses: pnpm/action-setup@v2
        with:
          version: 8
 
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
 
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
 
      - name: Create Release Pull Request
        uses: changesets/action@v1
        with:
          version: pnpm changeset version
          publish: pnpm publish-packages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

This workflow:

1. Detects changesets in commits
2. Creates PR with version bumps and changelogs
3. Publishes packages when PR merges

## [Benefits](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#benefits)

**Before Changesets:**

- Manually edit package.json versions
- Forget which packages changed
- Write changelogs by hand
- Miss dependent version updates

**With Changesets:**

- `pnpm changeset` creates version intent
- `pnpm changeset version` updates everything
- Automatic CHANGELOG.md generation
- Semantic versioning enforced

**For 10-person team:**

- 20+ packages versioned correctly
- Automated changelog for every release
- No more "forgot to bump version" bugs

## [Changeset best practices](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#changeset-best-practices)

### [Write clear summaries](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#write-clear-summaries)

```
# ❌ bad
pnpm changeset
# Summary: "updates"
 
# ✅ good
pnpm changeset
# Summary: "add loading state to button component"
```

### [Group related changes](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#group-related-changes)

Make multiple changes, create one changeset:

```
# Change button, card, and modal
git add .
 
# Create single changeset for all changes
pnpm changeset
```

### [Use conventional commit style](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#use-conventional-commit-style)

```
---
'@geniusgarage/ui': minor
---
 
feat(button): add loading state with spinner
 
- Adds isLoading prop to Button
- Shows spinner icon when loading
- Disables click events during load
```

## [Done-when](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#done-when)

Verify Changesets work:

- [ ] Installed @changesets/cli
- [ ] Ran `pnpm changeset init`
- [ ] Configured .changeset/config.json
- [ ] Made change to ui package
- [ ] Created changeset with `pnpm changeset`
- [ ] Selected minor version bump
- [ ] Ran `pnpm changeset version`
- [ ] Verified package.json version bumped (0.1.0 → 0.2.0)
- [ ] Saw CHANGELOG.md generated automatically
- [ ] Created multiple changesets (patch, minor, major)
- [ ] Understood semantic versioning rules
- [ ] (Optional) Configured GitHub Actions workflow

## [What's Next](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/2-changesets-versioning.md#whats-next)

Changesets manage versions, but how do you enforce code boundaries? Final lesson: **Code Governance** - learn to use CODEOWNERS for team ownership and ESLint boundaries to prevent unauthorized cross-package imports.
