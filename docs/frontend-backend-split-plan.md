# PrepVicta Frontend/Backend Split Plan

## Target Shape

PrepVicta should become two deployable applications:

- `PrepVicta-Frontend`: Next.js 16 + Tailwind CSS + shadcn/ui. It owns pages, layouts, components, browser state, and calls the backend through a typed API client.
- `PrepVicta-Backend`: FastAPI service. It owns authentication, authorization, PostgreSQL access, AI provider calls, file/material access, rate limits, request validation, and observability.
- `AI Layer`: LangGraph/LangChain services inside the backend. The frontend should only call stable backend endpoints and should not know about chains, graphs, prompts, vector stores, or model providers.

Keep them as separate repositories/folders for deployment, but treat the API contract as the shared boundary. The frontend should never import database code or secrets.

## Chosen Stack

Frontend:

- Next.js 16 App Router
- React 19
- Tailwind CSS
- shadcn/ui-style component primitives
- typed API client using `NEXT_PUBLIC_API_BASE_URL`

Backend:

- FastAPI
- Pydantic settings and schemas
- PostgreSQL async access
- cookie/JWT auth with password hashing
- CORS, rate limits, request IDs, health/readiness endpoints

AI layer:

- LangGraph for multi-step planner/tutor workflows
- LangChain for provider/vector-store integrations where useful
- provider adapters so Mistral/OpenAI can change without frontend changes
- fallback responses for high-traffic or provider-failure cases

Use FastAPI as the single backend. That avoids running two backends and gives one place for:

- auth and sessions
- planner generation
- onboarding/profile updates
- materials index/download metadata
- logs and telemetry
- AI teaching/RAG endpoints

Do not run a separate Node API long term unless there is a clear ownership split. The current Next route handlers should be migrated into FastAPI endpoints.

## Production Requirements

Before launch, the backend needs:

- hashed passwords with bcrypt or Argon2, not plaintext comparison
- httpOnly secure cookies or short-lived JWT plus refresh flow, not `localStorage` user auth
- role-based authorization on every protected endpoint
- schema validation for every request body and query param
- PostgreSQL pooling with sane limits, transaction helpers, and graceful shutdown
- rate limits on login, AI, planner, and download endpoints
- CORS locked to the frontend production domain
- structured logs with request IDs
- health/readiness endpoints
- environment-specific config with no secrets committed
- tests for auth, onboarding, planner fallback, and materials APIs

The frontend needs:

- a single API client using `NEXT_PUBLIC_API_BASE_URL`
- no direct DB or secret access
- no business logic in `app/api` except optional backend-for-frontend proxy routes if deployment needs same-origin calls
- auth state derived from `/auth/me`, not trusted browser storage
- route guards based on backend-verified user role
- graceful loading/error states for every backend call

## Migration Order

1. Scaffold the backend with config, database pool, health endpoint, CORS, logging, and shared error responses.
2. Move authentication first. Add password hashing, login, logout, and `/auth/me`.
3. Update the Next auth provider to call the backend API client.
4. Move onboarding and user profile endpoints.
5. Move planner generation, keeping the current fallback behavior so the UI works when the AI provider is down.
6. Move materials and download endpoints.
7. Move logs/telemetry.
8. Remove obsolete `app/api` routes from the frontend after all screens call the backend.
9. Add deployment docs and environment examples for both apps.
10. Run lint/build/tests for both apps.

## Suggested Folder Contracts

Frontend:

```txt
app/
components/
lib/
  api/
    client.ts
    auth.ts
    planner.ts
    materials.ts
public/
```

Backend:

```txt
app/
  main.py
  core/
    config.py
    logging.py
    security.py
  db/
    pool.py
    queries.py
  api/
    routes/
      health.py
      auth.py
      onboarding.py
      planner.py
      materials.py
      logs.py
  schemas/
  services/
    ai/
      graphs/
      chains/
      providers/
tests/
```

## First Implementation Step

The safe first code step is to scaffold both target folders, copy the frontend UI without `node_modules`, `.next`, `.git`, local secrets, and old backend-only material, then create backend endpoints one group at a time.

Because the target folders are outside this repo's writable root, editing them requires explicit approval.
