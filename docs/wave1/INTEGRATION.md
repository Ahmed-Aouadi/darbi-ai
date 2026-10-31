# Wave 1 — integration and rollout

## Current state
The feature UI is available in a clearly labelled local demo mode. Authenticated endpoints and database migrations are separate from that demo. Do not treat browser-local gems, streaks, or quest claims as official account state.

## Supabase setup
1. Create a Supabase project and configure email OTP/magic links.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY` in the deployment environment. Never expose the service-role key through a `NEXT_PUBLIC_` variable.
3. Apply migrations in order: `0001_initial_schema.sql`, then `0002_wave1_learning_features.sql` through `0007_fix_rollout_assignment.sql`.
4. Configure the Supabase Auth redirect URL to include the deployed site origin.
5. Verify the profile row is created for new auth users; the existing schema expects `profiles.id = auth.users.id`.
6. Keep all `ff_*` flags disabled until the integration and acceptance checks below pass.

## API authentication
Every endpoint under `app/api` that uses `requireApiUser` expects `Authorization: Bearer <Supabase access token>`. The token is verified through Supabase Auth. The service-role client is server-only and every user-specific query is filtered by the verified user ID. User-bound RPCs use the verified JWT so `auth.uid()` remains meaningful.

## Acceptance checks
- `npm run validate:content` verifies the challenge pack.
- `npm test` runs pure-logic and challenge-metadata tests.
- `npm run lint` and `npm run build` must pass in CI.
- Apply migrations on a disposable Supabase project and test RLS with anonymous, authenticated, and service-role sessions.
- Test OTP login, quest assignment/claim idempotency, verified-solve progress, streak freeze purchase/repair, editorial gating, review scheduling, feature-flag rollout, and analytics rate limits.
- Do not turn on flags if any step is failing.

## Security notes
- A browser Worker plus timeout is not a security boundary for arbitrary code. It is only a local practice runner. Do not use it to award official points or expose hidden tests.
- Official submissions need an isolated server-side judge and a trusted server call to `record_verified_solve` after all tests pass.
- Analytics payloads are allowlisted and capped; do not send source code, email addresses, or other personal data in event payloads.
- The content pack currently contains 20 authored challenges (120 tests), not the planned 60. Add the remaining 40 as authored, tested content; do not clone existing challenges to satisfy a count.
