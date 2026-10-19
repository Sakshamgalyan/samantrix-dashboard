# simantrix-dashboard

Internal Operations & Ecosystem Management Console for the **Simantrix** digital workplace ecosystem. Built with Next.js 16 (App Router + React 19), Tailwind CSS v4, `@galyan/ui`, `@galyan/theme`, and TypeScript strict mode.

---

## 🏛️ 5-Layer Feature Architecture Standard

All dashboard feature modules under `src/features/` strictly follow the unified 5-layer feature architecture pattern:

```
src/features/<feature>/
├── common/
│   └── constants.ts          # Static constants, dropdown options, chips, tabs & default fallbacks
├── types/
│   ├── api.ts                # API request/response contracts and DTO types
│   ├── state.ts              # Local feature state interface
│   ├── actions.ts            # Reducer action union types
│   ├── context.ts            # React Context value interface
│   └── index.ts              # Clean barrel re-exporting all types
├── context/
│   ├── action.ts             # Action creators
│   ├── reducer.ts            # State reducer & initial state
│   └── index.tsx             # FeatureProvider component & use<Feature> custom hook
├── components/
│   ├── <sub-component>.tsx   # Modular presentation components
│   └── <feature>-content.tsx # Top-level view orchestrator assembling the view
├── api.ts                    # RTK Query injected endpoints into dashboardApi
└── page.tsx                  # Clean minimal entrypoint wrapping <FeatureProvider><FeatureContent /></FeatureProvider>
```

### State Management Separation
- **Server Cache & Synchronization**: Handled via Redux Toolkit (RTK) Query (`api.ts`), featuring automatic cache invalidation, polling, and tag-based refetching.
- **Client & Interaction State**: Handled via local React Context and Reducer (`context/`), decoupling UI state (filters, search, modals, active tabs, form drafts) from global stores.

---

## 📦 Segregated Feature Modules

| Feature Module | Route | Description |
| :--- | :--- | :--- |
| **`subscription`** | `/organization/subscription` | Current tier overview, plan comparison catalog, cycle toggle, and checkout modal |
| **`billing`** | `/organization/billing` | Invoices table, settled payment ledger, receipt downloads, and status chips |
| **`audit-logs`** | `/organization/audit-logs` | Comprehensive security and administrative trail with actor, action, and target filtering |
| **`features`** | `/organization/features` | Entitled platform modules, AI agents, spatial audio, and automation switches |
| **`notifications`** | `/organization/notifications` | Multi-category notification stream (Unread, All, System, Security) with instant read markers |
| **`integrations`** | `/organization/integrations` | Organization API key lifecycle (generate, copy secret, revoke) and ecosystem integrations |
| **`analytics`** | `/organization/analytics` | Tenant utilization KPIs, member storage breakdown, feature adoption ratio, and audit trail |
| **`revenue`** | `/admin/revenue` | Superadmin financial telemetry: MRR, ARR, ARPA, collections trend, plan mix, and top customers |
| **`overview`** | `/organization` & `/admin` | Workspace intelligence: live room presence via LiveKit/Socket.IO, headcount bar charts, and member roster |
| **`settings`** | `/organization/settings` | Legal entity profile, company metadata, timezone/locale defaults, and danger zone |
| **`security`** | `/organization/security` | Personal 2FA (TOTP authenticator setup & recovery codes) and tenant-wide security policies |

---

## 🌟 Ecosystem Capabilities

### 1. Dual-Scope Console
- **Workspace Scope (`/organization/*`)**: Tenant-specific management covering team members, live room presence, seat allocations, billing, security, and integrations.
- **Admin Scope (`/admin/*`)**: Platform-level superadmin management covering organization health, system revenue analytics, ecosystem application health, and audit logs.

### 2. Real-Time Telemetry & Presence
- Direct integration with the Simantrix real-time gateway via Socket.IO for live participant presence (`ONLINE`, `BUSY`, `IN_MEETING`, `AWAY`, `OFFLINE`).
- WebRTC SFU room telemetry via LiveKit.

### 3. Design System Integration
- Standardized UI components and tokens powered by `@galyan/ui` and `@galyan/theme`.
- Modern aesthetics featuring dark glassmorphism, responsive cards, semantic chips, and accessible forms.

### 4. Role Taxonomy & Dynamic Color Schemes
The dashboard dynamically synchronizes the active authenticated session role with `@galyan/theme` tokens, adapting the interface accent and ambient color scheme:

| Color Scheme | Accent | Target Roles & Permissions |
| :--- | :--- | :--- |
| **Simantrix** *(Default)* | Signature Violet `#7c5cff` | `simantrix` default fallback identity |
| **Coral** | Rose `#f43f5e` | `OWNER` / `org-owner` (Full tenant ownership, billing & account deletion) and `SUPERADMIN` (Platform root) |
| **Green** | Emerald Green `#10b981` | `MEMBER` / `org-member` (Workspace participant), `developer-member` |
| **Blue** | Cobalt Blue `#3b82f6` | `MANAGER` / `org-manager` (Workspace operations) and `developer-manager` |
| **Violet** | Platform Indigo `#6366f1` | `DEVELOPER`, `organization` / `org` corporate tier |
| **Amber** | Governance Amber `#f59e0b` | `ADMIN` / `org-admin` (Full administration **except** account deletion and subscription plans) |
| **Cyan** | Sky Blue `#0ea5e9` | `VIEWER` / `org-viewer` (Read-only observation), `AUDITOR`, and `USER` |

---

## 🚀 Development & Commands

Run all package commands with `pnpm`:

```bash
# Install dependencies
pnpm install

# Start development server on port 4100
pnpm dev

# TypeScript strict mode verification
pnpm exec tsc --noEmit

# Lint check
pnpm lint

# Production build
pnpm build
```

---

## 🌐 Simantrix Port Standards

| Application | Port | Framework / Tech |
| :--- | :--- | :--- |
| **simantrix-backend** | `5000` | NestJS 11 + Prisma 7.9 + PostgreSQL + Socket.IO |
| **simantrix-home** | `4000` | Next.js 16 + React 19 + Redux Toolkit |
| **simantrix-dashboard** | `4100` | Next.js 16 + React 19 + RTK Query + `@galyan/ui` |
| **simantrix-frontend** | `4200` | Next.js 16 + Three.js + Zustand + LiveKit |
| **simantrix-app** | Native | Electron 43 + Vite |
| **Storybook** | `6006` | Shared Design System (`galyan`) |
