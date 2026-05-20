# Commit Message Guidelines

Commit messages should be clear, concise, and follow a consistent structure.  The project follows the **Conventional Commits** specification, which makes it easy to generate changelogs, automate versioning, and understand the intent of a change at a glance.

## Conventional Commit Format

```text
<type>[optional scope]: <subject>

<body>

<footer>
```

* **type** – The type of change. Common types are:
  * `feat` – A new feature
  * `fix` – A bug fix
  * `docs` – Documentation changes
  * `style` – Code style changes (formatting, linting)
  * `refactor` – Code refactoring that does not add a feature or fix a bug
  * `perf` – Performance improvements
  * `test` – Adding or updating tests
  * `chore` – Build process, tooling, or other maintenance
  * `revert` – Reverting a previous commit
* **scope** – Optional. The part of the codebase affected (e.g., `auth`, `api`).
* **subject** – A short, imperative description (≤ 50 characters).

### Examples

| Commit | Description |
|--------|-------------|
| `feat(auth): add Google OAuth` | Adds Google OAuth support to the authentication flow |
| `fix(api): correct pagination bug` | Fixes an off‑by‑one error in the API pagination logic |
| `docs: update README with setup steps` | Adds detailed setup instructions to the README |
| `style: format code with Prettier` | Runs Prettier on the entire codebase |
| `refactor: split user service into separate modules` | Refactors user service into smaller modules |
| `perf: cache database queries` | Adds caching to reduce database round‑trips |
| `test: add unit tests for auth service` | Adds unit tests for the authentication service |
| `chore: update dependencies` | Updates npm packages to latest compatible versions |
| `revert: "feat(api): add new endpoint"` | Reverts a previously merged feature commit |
