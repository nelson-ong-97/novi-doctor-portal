# Novi — Doctor Portal

Provider-facing web portal for Novi healthcare. Internally-employed doctors log in via OTP, review intake submissions, approve or decline pending orders, manage patient notes, and access patients across the brands they're networked into (Novi, Jolly).

## Tech Stack

| Layer            | Tool                        |
| ---------------- | --------------------------- |
| Framework        | Next.js 16 (App Router)     |
| UI               | Tailwind CSS 4 + Shadcn     |
| State Management | Zustand                     |
| Data Fetching    | SWR                         |
| Forms            | React Hook Form             |
| Validation       | Zod                         |
| Icons            | Lucide React                |
| Notifications    | Sonner                      |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.sample .env.local
```

Edit `.env.local` as needed. See `.env.sample` for all available options.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Provider Authentication

The doctor portal uses OTP-based login (mirrors patient flow — no password, HIPAA-friendly):

1. Doctor enters email at `/login` → backend sends 6-digit code
2. Doctor enters code at `/verify` → backend returns access + refresh tokens
3. Tokens stored in `localStorage` under `provider_access_token` / `provider_refresh_token`
4. `api-client.ts` auto-refreshes on 401 with dedup lock

Doctors are admin-provisioned. There is no public signup form. Superadmin creates the `provider` row + sends invite, then doctor logs in via OTP.

## Multi-Brand Source Routing

Doctors can be networked into multiple brands via `doctor_network` rows. The JWT carries the brands the provider is allowed to serve.

| Provider sources | UI behavior                                              |
| ---------------- | -------------------------------------------------------- |
| `['novi']`       | BrandPicker hidden; all queries scoped to Novi           |
| `['novi','jolly']`| BrandPicker visible in header; doctor switches active brand |
| `[]`             | Login should reject (backend enforces)                   |

Every SWR key includes the active source so cache invalidates on brand switch:

```ts
const { source } = useSource();
const { data } = useSWR(['intakes', source], () => fetchIntakes(source));
```

The backend additionally enforces the doctor↔network↔brand relationship server-side — frontend source is defense-in-depth, not the primary fence.

## Environment Variables

| Variable                       | Description                                    | Example                       |
| ------------------------------ | ---------------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL`          | admin-back base URL                            | `http://localhost:3001/api`   |
| `NEXT_PUBLIC_FORCED_SOURCE`    | Reserved (typically empty for doctor portal)   | _(empty)_                     |

## Project Structure

```
novi-doctor-portal-fe/
├── app/
│   ├── (auth)/
│   │   ├── login/                  # Email entry → request OTP
│   │   └── verify/                 # OTP entry → store tokens
│   ├── (portal)/                   # Auth-guarded clinical workspace
│   │   ├── intakes/                # Pending review queue + detail
│   │   ├── patients/               # Roster + profile + notes
│   │   ├── orders/pending/         # Orders awaiting doctor approval
│   │   ├── orders/[id]/            # Order detail + approve/decline
│   │   └── chat/                   # Patient ↔ doctor chat (stub — Phase 7)
│   ├── layout.tsx                  # Root layout (fonts, Providers)
│   └── page.tsx                    # Redirect: /intakes or /login
├── components/
│   ├── portal/                     # Sidebar, header
│   ├── ui/                         # Shadcn primitives
│   ├── auth-guard.tsx              # Route protection
│   ├── brand-picker.tsx            # Switch active brand (multi-source doctors)
│   └── providers.tsx               # SWR config + Toaster + Theme
├── lib/
│   ├── api-client.ts               # Fetch wrapper + 401 refresh
│   ├── api/                        # Per-resource HTTP wrappers
│   ├── hooks/                      # SWR data hooks (source-aware keys)
│   ├── stores/auth-store.ts        # Provider + availableSources + selectedSource
│   ├── types/                      # API contract types
│   └── config/forced-source.ts     # NEXT_PUBLIC_FORCED_SOURCE resolver
└── .env.sample
```

## Routes

| Path                          | Auth     | Description                              |
| ----------------------------- | -------- | ---------------------------------------- |
| `/`                           | -        | Redirect to `/intakes` or `/login`       |
| `/login`                      | Public   | Enter email to receive OTP               |
| `/verify`                     | Public   | Enter 6-digit OTP code                   |
| `/intakes`                    | Required | Pending intake review queue              |
| `/intakes/[id]`               | Required | Intake detail + approve/decline actions  |
| `/patients`                   | Required | Patient roster (filtered by source)      |
| `/patients/[id]`              | Required | Profile + intake history + clinical notes|
| `/orders/pending`             | Required | Orders awaiting doctor approval          |
| `/orders/[id]`                | Required | Order detail + approve/decline           |
| `/chat`                       | Required | Patient ↔ provider chat (Phase 7 stub)   |

## Backend

This portal connects to the **admin-back** NestJS API (`NEXT_PUBLIC_API_URL`).

Endpoints consumed:

**Authentication (live):**

- `POST /api/provider/auth/request-otp` — Send OTP to email
- `POST /api/provider/auth/verify-otp` — Verify OTP, receive JWT (carries `source` claim)
- `POST /api/provider/auth/refresh` — Refresh access token (auto, with dedup lock)
- `GET  /api/provider/auth/me` — Get current provider profile

**Clinical (Phase 6 backend — pending):**

- `GET  /api/provider/intakes?source=` — Pending intake submissions for doctor
- `GET  /api/provider/intakes/:id` — Intake detail (form_submission with answers JSON)
- `POST /api/provider/intakes/:id/approve` — Approve intake → triggers downstream
- `POST /api/provider/intakes/:id/decline` — Decline with reason
- `GET  /api/provider/patients?source=` — Patient roster (joined via doctor_network)
- `GET  /api/provider/patients/:id` — Patient profile + history
- `GET  /api/provider/patients/:id/notes` — Clinical notes (immutable, append-only)
- `POST /api/provider/patients/:id/notes` — Add clinical note
- `GET  /api/provider/orders/pending?source=` — Orders awaiting doctor approval
- `GET  /api/provider/orders/:id` — Order detail
- `POST /api/provider/orders/:id/approve` — Approve order → routes to pharmacy
- `POST /api/provider/orders/:id/decline` — Decline with reason

Pages render graceful empty/error states until clinical endpoints ship. The auth flow is fully functional today.

## Branching

All PRs must pass CI (lint + build) before merging. Name branches with a prefix that reflects the type of change:

| Prefix      | Purpose         | Example               |
| ----------- | --------------- | --------------------- |
| `feat/`     | New feature     | `feat/intake-review`  |
| `fix/`      | Bug fix         | `fix/brand-picker`    |
| `enhance/`  | Enhancement     | `enhance/notes-ui`    |
| `chore/`    | Maintenance     | `chore/upgrade-deps`  |

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start dev server (port 3000) |
| `npm run build` | Production build             |
| `npm run start` | Start production server      |
| `npm run lint`  | Run ESLint                   |

## Deploy

This portal is deployed as a single Vercel project (e.g., `doctor.<corp>`). Unlike the superadmin portal, doctor portal does NOT use `NEXT_PUBLIC_FORCED_SOURCE` — brand scoping is driven by the provider's JWT `source` claim.

| Project              | Domain                | Notes                                          |
| -------------------- | --------------------- | ---------------------------------------------- |
| Doctor Portal        | `doctor.<corp>`       | Single deploy, multi-brand via JWT             |

ENV per deploy:

```
NEXT_PUBLIC_API_URL=https://api.<corp>/api
NEXT_PUBLIC_FORCED_SOURCE=
```

## Security & HIPAA

- OTP-based auth — no passwords stored
- Token TTL kept short (mirrors patient flow)
- Clinical notes are immutable once created (no update/delete endpoints in MVP)
- Every backend query joins `doctor_network` to enforce doctor↔patient access boundaries
- BrandPicker is UX-only; backend enforces source-scoping authoritatively
- No PHI logged client-side
