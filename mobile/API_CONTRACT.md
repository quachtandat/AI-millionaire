# Mobile API contract

Verified against `backend/src/app.js`, route files, controllers, and services. The Axios base URL already ends in `/api`; service paths below are relative to it.

| Feature | Method and path | Auth | Mobile request / response contract |
|---|---|---:|---|
| Register | `POST /auth/register` | No | `{ username, email, password }`; success user is in `data`. |
| Login | `POST /auth/login` | No | `{ email, password }`; `data` contains `{ token, user }`. |
| Current user | `GET /auth/me` | Yes | User object in `data`; used to restore a saved JWT. |
| Start game | `POST /games/start` | Yes | Returns `{ gameId, currentLevel, currentPrize, status }`. |
| Get game and question | `GET /games/:id` | Yes | `data` contains `{ game, question }`; question fields omit the correct answer. |
| Answer | `POST /games/:id/answer` | Yes | Send `{ selectedAnswer: "A" | "B" | "C" | "D" }` (camelCase as required by the controller); result is in `data`. |
| Question timeout | `POST /games/:id/timeout` | Yes | Send `{ expectedLevel }`; marks the game `lost` if that level is still current, and ignores stale timer requests. |
| Stop game | `POST /games/:id/stop` | Yes | Game status, level, and prize are in `data`. |
| 50:50 | `POST /games/:id/lifelines/fifty-fifty` | Yes | Returns `removedOptions`. |
| Audience | `POST /games/:id/lifelines/audience` | Yes | Returns `percentages` keyed by A–D. |
| Phone | `POST /games/:id/lifelines/phone` | Yes | Returns `advice`, `suggestedAnswer`, and `confidence`. |
| History | `GET /games/history` | Yes | Array of game summaries in `data`. |
| Game detail | `GET /games/:id/detail` | Yes | `{ game, answers }` in `data`. |
| Ranking | `GET /games/ranking?limit=20` | Yes | Array with rank, username, highest prize/level, and games played. |
| Statistics | `GET /games/statistics` | Yes | Personal game and answer statistics in `data`. |
| Profile | `GET /users/profile` | Yes | User profile in `data`. |
| Update profile | `PUT /users/profile` | Yes | Send `{ username, email, avatar_url }`; user object in `data`. |
| Upload avatar | `POST /users/avatar` | Yes | `multipart/form-data`, field name `avatar`; URL is returned as `data.avatar_url`. |

`POST /games/start` does not include the first question, so the mobile service follows it with `GET /games/:id`. The mobile game state maps only the question text, four options, and non-answer metadata into its player-facing question object. The answer endpoint's `selectedAnswer` casing intentionally follows the backend controller rather than the snake_case example in the plan.
