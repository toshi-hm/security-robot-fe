# Security Robot RL Frontend

This directory hosts the standalone Nuxt 4 application for the security robot reinforcement learning project. The structure follows the guidelines in `report/frontend_design_specification.md` and is prepared for Vue 3, TypeScript, Element Plus, and Pinia.

## Getting Started

The frontend is intended to live in its own repository. Package metadata and build tooling are therefore included so it can be used immediately after moving the directory with `mv`.

1. Install dependencies (the project is configured for pnpm, but npm/yarn also work):

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm dev
   ```

3. Run additional project scripts:

   - `pnpm build` – production build
   - `pnpm preview` – preview locally built assets
   - `pnpm lint` – lint TypeScript and Vue files with ESLint
   - `pnpm typecheck` – perform an isolated TypeScript type check
   - `pnpm test` – run unit tests with Vitest
   - `pnpm e2e` – execute Playwright scenarios using `tests/e2e/playwright.config.ts`

## Repository Layout

- `configs/` contains API endpoints, constants, and runtime environment helpers.
- `libs/` groups the DDD-oriented domain, entity, and repository layers.
- `components/`, `pages/`, and `layouts/` implement the presentation layer of the interface.
- `composables/` exposes reusable application logic and WebSocket helpers.
- `stores/` houses Pinia stores for global state management.
- `types/` and `utils/` centralize shared typings, constants, and helpers.
- `plugins/` registers Nuxt plugins such as Element Plus, Chart.js, and Socket.IO clients.

Each subdirectory currently includes placeholder files so that teams can begin implementation using the prompts located in `report/prompt/`.
