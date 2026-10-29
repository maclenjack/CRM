# Branching Strategy

This repository follows a **feature‑branch workflow** that keeps production stable while allowing rapid development and testing.

## Branch Types

| Branch      | Purpose                                                             | Naming Pattern       | Example                          |
| ----------- | ------------------------------------------------------------------- | -------------------- | -------------------------------- |
| `main`      | Production‑ready code. Auto‑deployed to Vercel production.          | `main`               | `main`                           |
| `staging`   | Pre‑production preview. Auto‑deployed to Vercel preview.            | `staging`            | `staging`                        |
| `feature/*` | New features, UI/UX work, experiments.                              | `feature/<short‑id>` | `feature/login-page`             |
| `bugfix/*`  | Bug‑fixes, regressions, small hot‑fixes.                            | `bugfix/<short‑id>`  | `bugfix/auth‑token‑expiry`       |
| `chore/*`   | Refactors, tooling, CI config changes, docs.                        | `chore/<short‑id>`   | `chore/prisma‑migration‑cleanup` |
| `release/*` | Prepare a new semantic‑release (adds changelog, bumps version).     | `release/<semver>`   | `release/1.4.0`                  |
| `hotfix/*`  | Critical production hot‑fixes that need to jump straight into main. | `hotfix/<short‑id>`  | `hotfix/critical‑db‑lock`        |
| `test/*`    | Dedicated e2e or unit‑test branches (rare).                         | `test/<short‑id>`    | `test/unstable‑playwright‑suite` |

## Workflow Overview

1. **Create a new branch** from `staging` (or `main` for hotfixes).
   ```bash
   git checkout -b feature/add-auth-page
   ```
2. Commit changes with a meaningful message (Conventional Commits recommended).
3. Push the branch and open a Pull Request targeting `staging`.
4. CI runs lint, tests, and Playwright. Vercel preview is automatically deployed.
5. After review, squash‑merge into `staging`.
6. When ready, merge `release/*` or `staging` into `main` to deploy to production.

## Branch Protection Rules (GitHub)

- Require pull‑request reviews before merging.
- Require status checks to pass.
- Enforce linear history (squash or rebase).
- Restrict who can push to `main` and `staging`.
