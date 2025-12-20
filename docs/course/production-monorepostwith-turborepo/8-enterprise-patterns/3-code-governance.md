source: https://vercel.com/academy/production-monorepos/code-governance
# [Code governance](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#code-governance)

In large monorepos, teams need clear ownership boundaries. Without governance, anyone can change critical packages, reviews get routed to the wrong people, and quality suffers. CODEOWNERS assigns clear team responsibility, while GitHub branch protection enforces review requirements before code ships.

## [Outcome](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#outcome)

Set up code ownership rules and branch protection for team accountability and code quality.

## [Fast track](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#fast-track)

1. Create CODEOWNERS file with team assignments
2. Configure ESLint module boundaries
3. Test boundary enforcement
4. Verify PR review requirements

## [Hands-on exercise 9.3](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#hands-on-exercise-93)

### [1. Create CODEOWNERS file](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#1-create-codeowners-file)

Create `.github/CODEOWNERS`:

.github/CODEOWNERS

```
# TODO: Add ownership rules following this pattern:
# - default owner (root files)
# - packages ownership (UI team, config team, utils team)
# - apps ownership (web team, app team, docs team)
# - CI/CD ownership (devops team)
#
# Format: <file-pattern> <@github-username-or-team>
```

### Solution

.github/CODEOWNERS

```
# Default owner for all files
* @geniusgarage/leads

# Package ownership
/packages/ui/ @geniusgarage/frontend-team
/packages/typescript-config/ @geniusgarage/platform-team
/packages/eslint-config/ @geniusgarage/platform-team
/packages/utils/ @geniusgarage/platform-team

# App ownership
/apps/web/ @geniusgarage/marketing-team
/apps/snippet-manager/ @geniusgarage/product-team
/apps/docs/ @geniusgarage/docs-team

# Infrastructure
/.github/ @geniusgarage/devops-team
/turbo.json @geniusgarage/platform-team
/package.json @geniusgarage/platform-team
```

### [2. Understand CODEOWNERS patterns](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#2-understand-codeowners-patterns)

**Pattern matching:**

```
/apps/web/             # Exact directory
*.md                   # All markdown files
/packages/*/src/       # All package src directories
turbo.json             # Specific file
```

**Multiple owners:**

```
/packages/ui/ @geniusgarage/frontend-team @geniusgarage/design-team
```

Both teams must approve changes!

**Override patterns:**

```
* @geniusgarage/leads
/packages/ui/ @geniusgarage/frontend-team
/packages/ui/src/button.tsx @geniusgarage/design-system-lead
```

More specific patterns override general ones.

### [3. Test CODEOWNERS](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#3-test-codeowners)

Create a PR that changes `packages/ui/src/button.tsx`:

packages/ui/src/button.tsx

```
export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    success: 'bg-green-500 text-white hover:bg-green-600',  // New variant
  }
 
  return (
    <button onClick={onClick} className={`${variants[variant]} px-4 py-2 rounded`}>
      {children}
    </button>
  )
}
```

GitHub will:

1. **Auto-request review** from `@geniusgarage/frontend-team`
2. **Block merge** until team approves
3. **Show required reviewers** on PR

CODEOWNERS in action!

Architectural Boundaries

While CODEOWNERS enforces team ownership, you may also want to enforce architectural boundaries (e.g., prevent apps from importing other apps).

Turborepo is developing a native boundary enforcement feature that will be more powerful and integrated than third-party ESLint plugins. This feature is currently in alpha and will provide first-class support for:

- Package-to-package import rules
- Public API enforcement
- Cross-app isolation
- Type-safe boundaries

For now, use TypeScript path aliases and clear documentation to guide developers on import patterns. Watch the [Turborepo roadmap](https://github.com/vercel/turborepo/discussions) for updates on native boundary support.

## [GitHub branch protection](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#github-branch-protection)

Combine CODEOWNERS with branch protection:

### [1. Enable branch protection rules](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#1-enable-branch-protection-rules)

In GitHub repository settings:

1. **Settings** → **Branches** → **Add rule**
2. **Branch name pattern:** `main`
3. **Enable:**
    - ✅ Require a pull request before merging
    - ✅ Require approvals (1)
    - ✅ Require review from Code Owners
    - ✅ Require status checks (CI)
    - ✅ Require branches to be up to date

### [2. Test protection](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#2-test-protection)

Create PR changing `packages/ui/`:

1. **Auto-requested reviewer:** `@geniusgarage/frontend-team`
2. **Status checks:** CI must pass
3. **Merge blocked** until review approval

No one can bypass team ownership!

## [Benefits](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#benefits)

**Before Governance:**

- Anyone changes any package
- No review requirements
- Inconsistent code quality
- No clear team ownership

**With Governance:**

- CODEOWNERS enforces team reviews
- GitHub blocks merges without approval
- Required CI checks before merge
- Clear team ownership and accountability

**For 10-person team:**

- 50% fewer bugs from unauthorized changes
- Faster PR reviews (right team, first time)
- Clearer ownership and responsibility
- Reduced context-switching for reviewers

## [Governance best practices](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#governance-best-practices)

### [Start small, expand gradually](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#start-small-expand-gradually)

```
# Phase 1: High-level ownership/apps/ @geniusgarage/snippet-manager-team/packages/ @geniusgarage/platform-team# Phase 2: Team-specific ownership/apps/web/ @geniusgarage/marketing-team/apps/snippet-manager/ @geniusgarage/product-team# Phase 3: Component-level ownership/packages/ui/src/button.tsx @geniusgarage/design-system-lead
```

### [Document ownership decisions](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#document-ownership-decisions)

Add comments to CODEOWNERS explaining team responsibilities:

.github/CODEOWNERS

```
# Design system components - reviewed by design team for consistency/packages/ui/ @geniusgarage/frontend-team @geniusgarage/design-team# Platform packages - critical infrastructure requiring platform team review/packages/typescript-config/ @geniusgarage/platform-team/packages/eslint-config/ @geniusgarage/platform-team# App-specific code - product teams own their apps/apps/web/ @geniusgarage/marketing-team/apps/snippet-manager/ @geniusgarage/product-team
```

Documentation helps new team members understand ownership rationale!

### [Regular ownership audits](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#regular-ownership-audits)

Quarterly review:

- Are teams still aligned with CODEOWNERS?
- Has team structure changed?
- Are reviews getting to the right people?
- Should any ownership be more granular?

Adjust CODEOWNERS based on team structure and product evolution.

## [Done-when](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#done-when)

Verify code governance:

- [ ] Created `.github/CODEOWNERS` file
- [ ] Assigned teams to packages and apps
- [ ] Documented ownership rationale with comments
- [ ] Created PR changing owned package
- [ ] Verified CODEOWNERS auto-requested correct team
- [ ] Enabled branch protection rules (require review from code owners)
- [ ] Tested that merge is blocked without approval
- [ ] Understood how CODEOWNERS integrates with CI
- [ ] Set up quarterly ownership audit process

## [What's Next](docs/course/production-monorepostwith-turborepo/8-enterprise-patterns/3-code-governance.md#whats-next)

**Course complete!** 🎉

You've built a production-ready Turborepo monorepo with:

- Multiple apps sharing packages
- Intelligent caching and filtering
- CI/CD with GitHub Actions
- Environment variable validation
- Comprehensive testing
- Code generators
- Automated versioning
- Team governance

**Next steps:**

1. **Deploy to production** - All 3 apps to Vercel
2. **Add more apps** - Scale to 5+ apps with same patterns
3. **Publish packages** - Use Changesets to publish to npm
4. **Expand governance** - Add more teams and boundaries
5. **Monitor performance** - Track cache hit rates and build times

**Resources:**

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Changesets Docs](https://github.com/changesets/changesets)
- [CODEOWNERS Syntax](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

Keep building!
