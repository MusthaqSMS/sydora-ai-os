# Sydora AI OS

Phase 1 establishes the production foundation for the application. It intentionally contains no CRM, analytics, automation, or AI product features.

## Platform architecture

- Next.js App Router and TypeScript with route-level loading, error, and not-found states
- Supabase Auth browser/server clients, OAuth callback, password recovery, and a Next 16 `proxy.ts` session guard for `/dashboard`
- Route layouts for public, authentication, and authenticated dashboard surfaces
- Tailwind CSS, shadcn-compatible UI primitives, light/dark themes, and Sonner toasts
- Shared `components/ui`, `components/common`, `components/forms`, `lib`, `services`, `schemas`, and `types` boundaries

## Setup

1. Copy `.env.example` to `.env.local` and provide your Supabase project URL and anonymous key.
2. In Supabase Auth, add `http://localhost:3000/auth/callback` and your deployed callback URL to the redirect allow list.
3. Run `npm install`, then `npm run dev`.

Validate the codebase with `npm run lint` and `npm run build`.
