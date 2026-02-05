# Technical Details

## Technologies Used 🛠️

### Frontend stack 💻

- **[Next.js](https://nextjs.org)**: React framework used for routing, server rendering, and the App Router architecture.
- **[React](https://react.dev)**: UI library powering all interactive components and pages.
- **[TypeScript](https://www.typescriptlang.org)**: Adds static typing for safer, more maintainable code.
- **[Tailwind CSS](https://tailwindcss.com)**: Utility‑first CSS framework used for rapid, responsive UI styling.
- **[shadcn/ui](https://ui.shadcn.com)**: Headless, styled components for consistent, accessible design (cards, buttons, dialogs, etc.).
- **[Framer Motion](https://www.framer.com/motion/)**: Animation library used for smooth transitions, micro‑interactions, and game/landing page effects.
- **[Recharts](https://recharts.org)**: Charting library used to build the analytics visualizations on user and admin dashboards.

### Backend & API layer 🧩

- **[Node.js](https://nodejs.org)**: Runtime environment for the backend side of the Next.js app.
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)**: Serverless route handlers for chat, auth, and TRPC endpoints.
- **[tRPC](https://trpc.io)**: End‑to‑end type‑safe APIs connecting frontend and backend without manual REST typings.

### State & data fetching 🔄

- **[TanStack Query](https://tanstack.com/query/latest)**: Handles client‑side caching, background refetching, and mutation states for TRPC/HTTP calls.

### Database & persistence 💾

- **[PostgreSQL](https://www.postgresql.org)**: Primary relational database for complaints, users, and related entities.
- **[Drizzle ORM](https://orm.drizzle.team)**: Type‑safe ORM used for schema definition, migrations, and queries (backed by Neon / local Postgres).

### Authentication & authorization 🔐

- **[Better Auth](https://better-auth.com)**: Auth layer handling sessions, identity, and role information.
- **[Google OAuth](https://developers.google.com/identity/protocols/oauth2)**: Social login provider for seamless sign‑in using Google accounts.

### Caching & performance ⚡

- **[Upstash Redis](https://upstash.com/redis)**: Serverless Redis used for caching and fast access to frequently used data.

### AI & LLMs 🤖

- **[OpenRouter](https://openrouter.ai)**: Gateway to LLMs (Gemini models) powering the ShuchiAI chatbot.
- **[`@openrouter/ai-sdk-provider`](https://github.com/openrouter-ai/openrouter-ai-js)**: SDK integration used to stream AI responses in the chat API.

### Maps & geolocation 🗺️

- **[Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)**: Provides interactive maps, markers, and geo‑coordinates for complaint submission.

---

## Architecture Overview 🧱

- **Framework**: Next.js App Router (`src/app`)
- **Frontend UI**:
  - React + TypeScript
  - Tailwind CSS + **shadcn/ui** components (`src/components/ui/*`)
  - Framer Motion for rich animations
- **State & Data**:
  - **TRPC** for type‑safe server–client communication (`src/api/*`)
  - **TanStack Query** (`@tanstack/react-query`) for client caching
- **Database**:
  - PostgreSQL with **Drizzle ORM**
  - `complaints` table + relations to `user` (see `src/db/schema.ts`)
  - Neon / local Postgres via `db.ts` + `db_utils.ts`
- **AI Layer**:
  - OpenRouter provider with Gemini model via `@openrouter/ai-sdk-provider`
  - Chat streaming with `ai` SDK + `useChat` hook
- **Maps & Location**:
  - Google Maps JS API loader (`@googlemaps/js-api-loader`)
  - Geolocation API + interactive map/marker controls

---

## Getting Started (Dev Setup) 🚀

### 1️⃣ Prerequisites

- Node.js (LTS recommended)
- pnpm / yarn / npm
- PostgreSQL database (local or Neon)
- Google Maps API key
- OpenRouter API key (for ShuchiAI)

### 2️⃣ Clone & Install

```bash
git clone <this-repo-url>
cd waste
pnpm install   # or yarn / npm install
```

### 3️⃣ Environment Variables

Create a `.env.local` with (typical) variables:

```bash
# Database
PG_DATABASE_URL=<postgres-connection-string>
# Optional: different URLs for modes (used via DB_MODE)
PG_DATABASE_URL1=<prod-connection-string>
PG_DATABASE_URL2=<preview-connection-string>
DB_MODE=DEV|PREVIEW|PROD

# Auth (example – see auth setup for exact keys)
AUTH_SECRET=<strong-secret>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>

# AI / Chat
OPENROUTER_API_KEY=<openrouter-api-key>

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<google-maps-browser-key>
```

> 💡 Check `src/db/db.ts`, `src/db/db_utils.ts`, and `src/app/api/chat/route.ts` for the latest required env variable names.

### 4️⃣ Run Migrations (Drizzle)

Depending on how you manage migrations, a typical flow is:

```bash
pnpm db:migrate   # or your configured migration script
```

Ensure the `complaints` table and auth tables are created as per the Drizzle migration files in `src/db/migrations/`.

### 5️⃣ Start the Dev Server

```bash
pnpm dev
```

Visit:

- `http://localhost:5173/` → Landing page (`HomePage`)
- `http://localhost:5173/login` / `register` → Auth
- `http://localhost:5173/user_dashboard` → Citizen dashboard
- `http://localhost:5173/complaint` → Complaint map & form
- `http://localhost:5173/admin_dashboard` → Admin analytics & management

---

## Authentication & Roles (Implementation View) 🔐

- Auth core in `src/lib/auth.ts`, `src/lib/auth-client.ts`, and `src/db/auth_schema.ts`.
- Better Auth + Google OAuth integration via `app/api/auth/[...all]/route.ts`.
- Role‑based access:
  - User: citizen dashboard and complaint submission.
  - Admin: protected admin dashboard (`/admin_dashboard`), with checks on `session.user.role === 'admin'`.

---
