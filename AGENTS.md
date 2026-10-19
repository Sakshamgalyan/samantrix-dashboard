<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Simantrix Dashboard — Frontend Standards

## Universal Rules
1. **Arrow Functions ONLY**: All components, functions, hooks, and pages must use `const Name = () => { ... }`. Never use `function` declarations.
2. **One Function Per File**: Every file in `components/` and `features/**/component/` must export ONLY ONE function/component.
3. **Thin Pages (`app/**/page.tsx`)**: An arrow function that only imports and renders the feature component from `src/features/<feature>/`.
4. **Feature Folder Structure (`src/features/<feature>/`)**:
   - `index.tsx`: Arrow function returning the Context Provider wrapping the main content component.
   - `component/`: Presentation components (ONE function per file; lazy load modals/dialogs).
   - `common/`: Feature-specific constants, helpers, labels, options.
   - `types/`: Feature TypeScript definitions (`api.ts`, `state.ts`, `index.ts`).
   - `context/`: Feature-level state management with `index.tsx`, `action.ts`, `reducer.ts`, `hooks.ts`, `api.ts`.
5. **Global Components (`src/components/`)**:
   - `common/`: Reusable across features (e.g., `delete-modal.tsx`, `kpi-card.tsx`).
   - `brand/`: Brand-specific visual identity (logo, mark, taglines).
   - `layout/`: Shell layout (dashboard-shell, header, sidebar, auth-gate).
6. **Other Source Folders**:
   - `hooks/`: Global custom hooks (`useMediaQuery`, `useDebounce`, `useLocalStorage`, `useMounted`).
   - `lib/`: API client, `server-proxy.ts` for backend calls, auth plumbing.
   - `store/`: Global Redux store and RTK Query base API (`dashboardApi`).
   - `types/`: Global TypeScript definitions.
   - `utils/`: Global utility functions, formatting, permissions.
   - `proxy.ts`: Next.js 16 route proxy.
7. **Modularity & Imports**:
   - Always use absolute imports (`@/*` pointing to `src/*`). Never use relative imports.
   - Keep files small; import only what is required for each section; lazy load modals.
