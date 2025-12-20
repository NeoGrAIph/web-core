source: https://vercel.com/academy/production-monorepos/monorepos-vs-polyrepos
# [Monorepos vs polyrepos](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/2-monorepos-vs-polyrepos.md#monorepos-vs-polyrepos)

You're planning a platform with multiple apps and shared packages. Should you put everything in one repository (monorepo) or keep separate repositories for each project (polyrepo)? This decision affects how your team coordinates changes, manages dependencies, and ships features. Make the wrong choice and you'll fight with tooling daily. Make the right choice and development flows smoothly.

Let's experience the tradeoffs hands-on.

## [Outcome](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/2-monorepos-vs-polyrepos.md#outcome)

Understand the polyrepo coordination tax through a real workflow simulation, and recognize when monorepos eliminate that overhead.

## [Fast track](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/2-monorepos-vs-polyrepos.md#fast-track)

1. Walk through polyrepo button update (4 repos, 4 PRs, version coordination)
2. Compare with monorepo workflow (1 commit, atomic changes)
3. Understand when each approach fits your project

## [Hands-on exercise 1.2](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/2-monorepos-vs-polyrepos.md#hands-on-exercise-12)

Experience the difference between polyrepo and monorepo workflows by simulating a shared component update.

**Learning objectives:**

1. Understand the coordination overhead of polyrepos (version bumps, multiple PRs, CI runs)
2. Recognize monorepo's atomic changes benefit (single commit, TypeScript verification)
3. Identify when each approach fits based on project characteristics
4. Prepare for Section 1 where you'll experience monorepo workflow for real

**Key concepts:**

- **Coordination tax:** Time and effort spent synchronizing changes across repositories
- **Atomic changes:** Updating interface and all consumers in one commit
- **Version dependency chaos:** Managing npm versions across multiple repos
- **TypeScript verification:** Compiler catches all breaking changes instantly in monorepo

**Decision framework to understand:**

- Monorepos: Multiple related apps sharing code
- Polyrepos: Truly independent projects with different stacks/teams

## [All aboard the polyrepo pain train](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/2-monorepos-vs-polyrepos.md#all-aboard-the-polyrepo-pain-train)

Imagine you need to update a shared Button component's API. Let's walk through what that looks like in a polyrepo setup.

### [The polyrepo update workflow](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/2-monorepos-vs-polyrepos.md#the-polyrepo-update-workflow)

You have 4 separate repositories:

```
company-ui-components/     (Repo 1)
company-web/               (Repo 2)
company-app/               (Repo 3)
company-docs/              (Repo 4)
```

**The task:** Change the Button component's onClick handler to also accept an async function. To make this happen, you'd need to complete all of these steps. Note that you don't need to take these steps, but this will give you a sense of what's required:

**Step 1: Update the UI package**

```
cd company-ui-componentsgit checkout -b feat/async-button-onclick# Edit button.tsx to support async onclickgit commit -m "feat: support async onClick in Button"git push# Create PR, wait for review and CI...
```

Once approved, publish the new version:

```
npm version minor  # Bump to v2.1.0npm publishgit push --tags
```

**Step 2: Update the web app**

```
cd ../company-webgit checkout -b deps/update-ui-components# Edit package.json: "@company/ui": "^2.1.0"npm install# Fix breaking changes in components using button...git commit -m "deps: update @company/ui to 2.1.0"git push# Create PR, wait for review and CI...
```

**Step 3: Update the app**

```
cd ../company-appgit checkout -b deps/update-ui-components# Same process: Update package.json, fix breaking changes, PR...
```

**Step 4: Update the docs**

```
cd ../company-docsgit checkout -b deps/update-ui-components# Same process again...
```

**The reality:**

- **4 separate pull requests** (each needs review and CI)
- **4 repositories to coordinate**
- **Version management overhead** (publishing, waiting for npm, updating dependents)
- **Mental overhead:** Tracking which repos are updated, coordinating deploys, ensuring nothing breaks**
- ****Time:** Hours to days depending on review velocity

The Polyrepo Coordination Tax

This is the **coordination tax** of polyrepos. Every shared component change cascades through multiple repos. The more projects you have, the more painful this becomes.

## [When to use each approach](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/2-monorepos-vs-polyrepos.md#when-to-use-each-approach)

**Choose Monorepos When:**

- Multiple related apps share code (UI components, utilities, configs)
- You make frequent cross-project changes
- You want atomic commits across project boundaries
- Consistent tooling matters (TypeScript, ESLint, tests)

**Choose Polyrepos When:**

- Projects are completely independent (no shared code)
- Different tech stacks that can't share tooling
- Strict access control (teams can't see each other's code)
- Different teams, different release cycles, zero coordination

**Rule of thumb:** If your projects share more than just configs, monorepo likely fits. If they're truly independent, polyrepo might work better.

When Uncertain, Start with Monorepo

Splitting a monorepo into separate repos is painful but possible. Merging multiple repos while preserving git history can be challenging.

Start with a monorepo. If it doesn't fit, you'll know quickly and can adjust.

## [Commit](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/2-monorepos-vs-polyrepos.md#commit)

This is a conceptual lesson with no code changes, so there's nothing to commit. The next lesson introduces Turborepo's features before you start building.

## [Done-when](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/2-monorepos-vs-polyrepos.md#done-when)

Verify you understand the key concepts:

- [ ] Understand polyrepo coordination tax: multiple repos, PRs, version management overhead
- [ ] Recognize monorepo benefit: atomic changes across project boundaries
- [ ] Understand monorepo workflow: single commit, TypeScript verification, instant consistency
- [ ] Know when to choose monorepos (related apps, shared code, frequent cross-project changes)
- [ ] Know when to choose polyrepos (independent projects, different stacks, strict access control)
- [ ] Remember: If projects share more than configs, monorepo likely fits

## [What's Next](docs/course/production-monorepostwith-turborepo/1-monorepo-fundamentals/2-monorepos-vs-polyrepos.md#whats-next)

Now you understand the tradeoffs and why monorepos make sense for platforms with shared code. Next lesson: **Turborepo Basics** – experience intelligent caching and task orchestration hands-on.
