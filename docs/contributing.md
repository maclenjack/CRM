# Contribution Guide

Thank you for considering contributing to the **CRM** project! This guide will help you get started.

## Getting Started

1. **Fork** the repository.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/CRM.git
   cd CRM
   ```
3. **Create a feature branch** (see [Branching Strategy](branching.md)):
   ```bash
   git checkout -b feature/<short-description>
   ```
4. **Install dependencies**:
   ```bash
   pnpm install
   ```
5. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your DATABASE_URL and NEXTAUTH_SECRET
   ```
6. **Set up database**:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed  # optional
   ```
7. **Run the dev server** to test locally:
   ```bash
   pnpm dev
   ```

## Coding Standards

- Use **TypeScript** for all new code.
- Follow the **Conventional Commits** format (see [Commit Guidelines](commit-guidelines.md)).
- Run `pnpm lint` before committing.
- Write tests for new features or bug fixes (Jest for unit, Playwright for e2e).
- Use Server Components by default; mark client components with `'use client'`.
- Place feature code under `src/features/{domain}/`.
- Use the shared `actionPipeline` for Server Actions.

## Pull Request Process

1. Push your branch to your fork.
2. Open a Pull Request against the `staging` branch.
3. Ensure all CI checks pass (lint, type-check, build).
4. Get at least one approval.
5. Squash‑merge the PR.

## Project Structure

See [README.md](../README.md#project-structure) for the feature-based architecture overview.
