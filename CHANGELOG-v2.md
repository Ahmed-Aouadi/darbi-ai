# CHANGELOG — Satr V2 Wave 1

## Status: foundational backend + pure logic only; not feature-complete

### Added
- Additive migration `0002_wave1_learning_features.sql`.
- Feature flag rows: `ff_quests`, `ff_streak_freeze`, `ff_hint_ladder`, `ff_editorial`, `ff_spaced_review`, `ff_skill_map`, `ff_custom_run`, `ff_concept_cards` (all disabled by default).
- Quest catalogue, per-user quest progress table, append-only gem ledger, review queue, profile gem/freeze/division fields, submission hint level, challenge editorial and concept tag fields.
- Trusted-server gem-award primitive with idempotency keys; authenticated quest claim function checks current Algeria date, completed progress and duplicate claims.
- Arabic/French/English translation keys for the Wave 1 UI.
- Pure helpers and Node unit tests for hint scoring, Arabic search normalization, custom input validation, spaced-review dates, and stable daily quest selection.

### Feature flags and analytics events
| Feature | Flag | Events planned |
|---|---|---|
| Daily/weekly quests and gems | `ff_quests` | `quest_progress`, `quest_claimed` |
| Streak freeze/repair | `ff_streak_freeze` | `streak_freeze_purchased`, `streak_freeze_consumed`, `streak_repaired` |
| Hint ladder | `ff_hint_ladder` | `hint_opened` |
| Editorial | `ff_editorial` | `editorial_opened`, `solution_compared` |
| Spaced review | `ff_spaced_review` | `review_started`, `review_passed`, `review_failed` |
| Skill map/recommendations | `ff_skill_map` | `skill_map_viewed`, `recommendation_shown`, `recommendation_opened` |
| Custom run | `ff_custom_run` | `custom_run_started`, `custom_run_finished` |
| Concept cards | `ff_concept_cards` | `concept_card_completed`, `concept_card_skipped` |

### Commands
- `npm run test:wave1`
- `npm run validate:content`

### Not complete / requires follow-up
- No feature UI has been wired into the current homepage/challenge routes yet.
- Streak purchase/consumption/repair RPCs are not implemented.
- Quest assignment/progress event pipeline and the +5 all-daily bonus are not implemented.
- Editorial access gate, hint unlocking API, review scheduler worker, skill radar/recommender UI, custom-run rate limiter/runner, and 10 concept-card data are pending.
- No Playwright/Cypress E2E dependency exists yet; E2E tests must be added with the UI flows.
- Database migration has not been applied to a live Supabase instance; RLS and RPC behavior still require integration tests against Supabase.
- The migration adds columns but does not backfill editorial/hints or alter historical scores.
