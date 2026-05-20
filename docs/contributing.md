# Contribution Guide

Thank you for considering contributing to the **CRM** project! This guide will help you get started.

## Getting Started

1. **Fork** the repository.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/CRM.git
   cd CRM
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/<short-description>
   ```
4. **Install dependencies**:
   ```bash
   pnpm install
   ```
5. **Run the dev server** to test locally:
   ```bash
   pnpm dev
   ```

## Coding Standards

- Use **TypeScript** for all new code.
- Follow the **Conventional Commits** format.
- Run `pnpm lint` before committing.
- Write tests for new features or bug fixes.

## Pull Request Process

1. Push your branch to your fork.
2. Open a Pull Request against the `staging` branch.
3. Ensure all CI checks pass.
4. Get at least one approval.
5. Squash‑merge the PR.
