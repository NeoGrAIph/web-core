# Repository Guidelines

`web-core` (`~/repo/web-core`) is a **work-in-progress** monorepo for Synestra sites/apps on **Payload CMS 3.68.3** and **Next.js 15.4.9**, plus **GitOps artifacts** for Argo CD.

Principle: **monorepo for speed, independent deployments for safety**. Structure and conventions are **research-driven** (best practices + official Payload templates/docs).

## Scope & Boundaries

- Platform repo: `~/synestra-platform` (cluster infrastructure, centralized secrets, CI that builds images).
- App repo: `~/repo/web-core` (application code, shared code, GitOps templates, docs).

Security: **never commit plaintext secrets** to `web-core`. Use `.env.example` and Kubernetes Secret **references** (names/keys) only.

## Project Structure (Current Layout)

- `deploy/` — GitOps (`deploy/charts/`, `deploy/env/`, `deploy/argocd/apps/`).
- `docs/` — architecture/research/runbooks.
- `upstream/` — reference snapshots (do **not** deploy as-is).

## Commands

- `pnpm install` — install workspace dependencies.
- `pnpm dev` — run dev servers via Turborepo.
- `pnpm build` — build/typecheck packages + build apps.
- `pnpm lint` — lint apps.
- `pnpm test` — run tests (packages/apps must define `test` scripts).

Example (single app): `pnpm --filter @synestra/corporate-website dev`

## Style & Naming

- TypeScript; format with `pnpm format` (Prettier).
- ESLint: **flat config** (`eslint.config.mjs`), shared in `packages/eslint-config`.
- Naming: `@synestra/<name>` for workspace packages.

## GitOps / Kubernetes

- Prefer declarative Helm values/overlays; avoid cluster-level resources unless agreed.
- Isolation by design: **one namespace + one database per deployment**.
- Environments: design `dev → stage → prod` (initially deploy `dev` for speed).
- “Hot dev” in Kubernetes: standardize on **Okteto**; dev-only hacks (e.g. `hostPath`) must not reach stage/prod.

## Payload Templates Research Rules

- `upstream/` is **reference only**; record provenance (URL + snapshot commit).
- Extract env vars: secret vs non-secret; required-in-prod vs dev-only.
- Capture production necessities: migrations, media persistence, preview/jobs endpoints/auth.
- Note gaps vs pinned versions and required adjustments.

## Working Docs (Keep Updated)

- `docs/notes.md` (Useful facts / Open questions)
- `docs/research/research.md`
- `docs/research/templates-research.md` + `docs/research/templates/*`
- `docs/architecture/repo-structure.md`

## CI/CD Notes

- Prefer immutable image tags (Git SHA); promotion is a controlled change.
- Keep builds reproducible (avoid “install/build on container startup”).
- Document how `synestra-platform` consumes `web-core` (pipelines, tagging, promotion).

## Communication

- Default language: **Russian** for discussions and repository documentation (`README.md`, `docs/**`), unless requested otherwise.

## Commits & PRs

- Commits: `feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`, `docs: ...`
- PRs: describe intent, list affected apps/deployments; add screenshots for UI changes when relevant.
