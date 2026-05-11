# PrepVicta Minimal Database

This schema is intentionally limited to the current priority:

- Login/auth users
- Student onboarding profile
- Planner agent plans and tasks

Use [`schema.sql`](./schema.sql) on a fresh Supabase/Postgres database.

## Tables

- `users`: login identity, role, profile name, account status.
- `user_sessions`: optional production session/refresh-token storage.
- `student_profiles`: onboarding answers used by the planner prompt.
- `planner_plans`: one active planner response per student per day, plus full JSON for replay/debugging.
- `planner_tasks`: the three planner task cards and completion state.

## Run

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
```

Then run:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

Or paste `database/schema.sql` into the Supabase SQL editor.

## App Notes

- `lib/db.ts` already targets `SUPABASE_SCHEMA`, defaulting to `prepvicta`.
- Existing routes already query `users` and `student_profiles`.
- The current login route compares `password_hash` directly with the submitted password. Before production, replace that with bcrypt/argon2 verification and issue a secure session.
- The old `seed.js` is destructive and creates many tables outside this scope. Do not run it against this minimal schema unless you rewrite it first.
