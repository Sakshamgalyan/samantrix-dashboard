# samantrix-dashboard

Internal Operations & Ecosystem Management Console for the **Samantrix Smart Office Suite**. Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, and TypeScript.

---

## 🌟 Capabilities & Features

### 1. Executive Operations & Telemetry Center
- **Executive KPIs**: Live visitors, pending demo inquiries, Early 2027 priority waitlist queue, and ecosystem health status.
- **Visitor Telemetry (`/analytics`)**: Real-time traffic breakdown by country/city, referrer/redirect origins (LinkedIn, Google, HackerNews, X), UTM campaign ROI, and device/browser metrics.

### 2. Inbound Leads & Demo CRM (`/leads`)
- Centralized inbound management for inquiries, pilot requests, and enterprise quotes.
- Status filters (`PENDING`, `CONTACTED`, `CONFIRMED`, `ARCHIVED`), search, lead drawer with internal ops notes thread, and CSV export.

### 3. Early 2027 Waitlist Management (`/waitlist`)
- Prioritized queue of early access registrations with batch onboarding approval.
- Team size filters (500+ Enterprise, 200-500, 50-200, 10-50, 1-10) and priority scoring.

### 4. Multi-App Ecosystem Management
- **Backend Console (`/apps/backend`)**: NestJS REST & WebSocket API, LiveKit WebRTC SFU, Redis BullMQ, PostgreSQL Prisma status, and Gmail SMTP transactional relay diagnostic tester.
- **Virtual Office Web Console (`/apps/frontend`)**: 3D smart office floor plan occupancy, spatial proximity audio streams, live video meeting rooms, and tenant organization spaces.
- **Marketing Site CMS (`/apps/home`)**: Product catalog management (10 products), pricing tiers, and announcement banner controllers.
- **Desktop Releases (`/apps/desktop`)**: Electron desktop client builds (Windows, macOS, Linux), installer binaries, and release notes.

### 5. Role-Based Access Control (RBAC) & Security
- Built-in personas:
  - `SUPERADMIN` (Full system access, API keys, team management, system settings)
  - `MANAGER` (Leads CRM, waitlist batch approvals, workspace moderation)
  - `ANALYST` (Visitor telemetry, conversion funnels, read-only analytics)
  - `SUPPORT` (Customer inquiries, support notes, floor diagnostics)
  - `USER` (Observer & Auditor view)
- **Role Switcher**: On-the-fly persona switcher in the header to preview and test permissions instantly.
- **Audit Logs (`/audit`)**: Complete audit trail of administrative actions.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Typecheck
npx tsc --noEmit

# Lint check
npm run lint

# Production build
npm run build
```

---

## 📦 Monorepo Architecture

| Project | Port / Protocol | Purpose |
| :--- | :--- | :--- |
| `samantrix-home` | `http://localhost:3000` | Marketing website & BFF Reverse Proxy |
| `samantrix-frontend` | `http://localhost:3001` | 3D Smart Office Web Client |
| `samantrix-backend` | `http://localhost:4000` | NestJS Core API, WebSockets & LiveKit |
| `samantrix-app` | `samantrix://` | Native Electron Desktop Client |
| `samantrix-dashboard` | `http://localhost:3002` | Internal Team Operations & Ecosystem Console |
