<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project Overview

This repository is a **full‑stack starter** built with the following stack:

- **Next.js (App Router)** – TypeScript, server‑side rendering, and API routes.
- **Prisma + Neon** – A lightweight ORM with a free PostgreSQL database.
- **NextAuth** – Authentication via Google, GitHub, and custom credentials.
- **TailwindCSS** – Utility‑first styling.
- **Jest** – Unit and component testing.
- **Playwright** – End‑to‑end testing.
- **ESLint + Prettier** – Code quality and formatting.
- **Copilot + Ollama** – Local LLM assistance for rapid development.

The goal is to provide a production‑ready, CI‑driven workflow that can be
deployed to Vercel with preview environments for every pull request. Branch
rules enforce a linear history, require reviews, and protect the `main` and
`staging` branches. All changes should be made on feature branches following
the naming convention described in `branching.md`.

### Import Conventions

* Prefer importing from the `index.ts` of a directory when possible. For
	example, instead of

	```ts
	import { Button } from "@/components/Button";
	```

	use

	```ts
	import { Button } from "@/components";
	```

	This keeps import paths short and makes it easier to refactor
	component locations without touching many files.

## Branching and Commit Strategy

All work should be performed on feature branches that follow the naming convention described in
[branching.md](docs/branching.md).  Commits on these branches must follow the
**Conventional Commits** format defined in the new
[commit‑guidelines.md](docs/commit-guidelines.md).  This ensures that automated tools can
generate changelogs, calculate semantic version bumps, and provide a clear history of
changes.

### Branch Naming

Feature branches should be prefixed with `feature/`, bug‑fix branches with `bugfix/`, and
hot‑fixes with `hotfix/`.  The rest of the branch name should describe the change in
lowercase words separated by hyphens, e.g. `feature/add-google-oauth`.

### Commit Message Structure

Refer to the [commit‑guidelines.md](commit-guidelines.md) for the full specification.
Typical commit messages look like:

```text
feat(auth): add Google OAuth
```

or

```text
fix(api): correct pagination bug
```

## CI/CD

- **Vercel** – Deploys preview on `staging` and production on `main`.

## ESLint & Prettier

The project uses the following linting and formatting configuration:

- **ESLint** – `next/core-web-vitals`, `@typescript-eslint/recommended`, `prettier` and more.
- **Prettier** – Single quotes, trailing commas, 2‑space tabs.
- **Linting scripts** – `pnpm lint` and `pnpm lint:fix`.

## Security

- **Dependabot** – Automatic dependency updates.
- **Secret scanning** – Detects accidental secrets in commits.
