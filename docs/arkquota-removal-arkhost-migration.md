# ArkQuota Removal and Arkhost Game Ownership Migration

> Status: implementation-ready specification
> Repository: `closureStudio`
> Scope: frontend repository only
> Last verified against repository: 2026-08-19
> Implementation status: implemented in the current working tree; keep this document as the migration contract

## 1. Purpose

This document defines the complete frontend refactor required to remove ArkQuota from the repository and make Arkhost the only source of truth for a user's games.

It is intended to be handed directly to another coding agent. The implementer should not need to rediscover the current architecture or make product decisions. Where the repository does not contain a definitive current backend contract, this document records the historical contract and the exact default to implement.

The implementation must preserve idserver login and token authorization, preserve Arkhost game query through SSE with polling fallback, and move every game mutation away from ArkQuota.

## 2. Confirmed Product Decisions

The following decisions are final for this refactor:

1. Remove the entire ArkQuota integration from the frontend.
2. Arkhost is the only source of truth for the current user's games.
3. Each game returned by Arkhost represents one occupied frontend slot.
4. Do not synthesize empty slot records from ArkQuota or another backend.
5. The normal creation capacity is hardcoded to `3` games.
6. The hardcoded capacity only controls whether the frontend offers creation. It must never hide existing games.
7. If Arkhost returns 4 or more games, display every game and do not show the create entry.
8. Remove all ArkQuota slot-level rules and all features based on those rules.
9. Specifically remove phone verification, QQ verification, first-game restrictions, slot `ruleFlags`, first-game deletion protection, and quota-driven repair behavior.
10. Retain the "forgot account" UI, but disable its backend operation and show a maintenance/unavailable message when submitted.
11. Move create, delete, password update, and any repair/upsert flow to Arkhost.
12. Do not remove idserver administrator permissions or Arkhost system configuration switches. They are not ArkQuota slot rules.

## 3. Terminology and Module Seams

This specification uses the following terms consistently:

- **idserver module**: authenticates users and issues the JWT used by the frontend.
- **Arkhost adapter**: the `APIClient` implementation that talks to the selected Arkhost base URL.
- **game collection module**: the Pinia store that owns the user's Arkhost games and the SSE/polling lifecycle.
- **game action module**: the composable and captcha wrapper used by the dashboard to create, delete, update, start, and suspend games.
- **slot view model**: a lightweight frontend projection of an Arkhost game. It is not an entitlement record and contains no permission rules.
- **interface**: everything a caller needs to know to use a module, including method arguments, invariants, errors, and refresh behavior.
- **seam**: the location of a module's interface. The main external seam after this refactor is `APIClient`; dashboard callers must not know Arkhost URL details.

The target design deliberately has one adapter at the game backend seam: Arkhost. Do not retain a placeholder quota adapter or an unused `RegistryClient` interface. There is no second implementation to justify that seam.

## 4. Current Architecture

### 4.1 Authentication

Current login flow:

1. `authClient.login()` sends credentials to idserver.
2. idserver returns a token.
3. `useUserStore.login()` decodes the JWT and installs it into:
   - `apiClient`
   - `authClient`
   - `registryClient`
4. The router sends the user to `/dashboard`.

ArkQuota dependency in this flow: `useUserStore.login()` installs the token into `registryClient`. This must be removed. Installing the token into `apiClient` and `authClient` remains required.

### 4.2 Game and Quota Initialization

Current `useGamesStore.initializeGameListServerConnection()` performs both:

- `registryClient.fetchUserSlots()` through `queryUserQuota()`
- `apiClient.fetchGameList()` through `queryGameList()`

Initialization only succeeds if both requests succeed. It then attempts SSE and falls back to polling if SSE cannot be established.

This creates an unnecessary hard dependency: Arkhost may be healthy and return all games, but the dashboard still fails when ArkQuota is unavailable.

### 4.3 Game Query Transport

The repository has two Arkhost game update mechanisms:

- Direct/polling query: `GET /game` through `apiClient.fetchGameList()`.
- SSE: `EventSource` to `/sse/games?token=<jwt>`.

SSE emits at least the following event types:

- `game`: complete `ApiGameGame[]` replacement
- `log`: notification event
- `ssr`: global high-rarity notification data
- `close`: indicates another client/device has taken over the connection

The existing transport preference must remain:

1. Fetch the initial game list.
2. Try SSE.
3. Use 5-second polling if SSE is unavailable or fails to connect.

### 4.4 Game Mutations

Current mutation ownership is split:

| Operation | Current backend | Current identifier |
| --- | --- | --- |
| List games | Arkhost | none |
| Start game | Arkhost | game account |
| Suspend game | Arkhost | game account |
| Update config | Arkhost | game account |
| Create game | Arkhost | game account |
| Delete game | Arkhost | game account |
| Update password | Arkhost delete + create flow | game account |
| Repair missing Arkhost game | Arkhost delete + create flow | game account |
| Find idserver account by game | ArkQuota | game account |

The refactor removes the split. All game mutations use the Arkhost adapter and identify a game by account.

### 4.5 ArkQuota-Driven Features

ArkQuota currently supplies:

- `RegistryUserInfo.slots`
- `RegistryUserInfo.idServerPhone`
- `RegistryUserInfo.idServerQQ`
- `RegistryUserInfo.ruleFlags`
- per-slot `RegistrySlot.ruleFlags`
- per-slot UUIDs used by mutations

Those fields currently power:

- sorting used and unused slots
- hiding special empty SMS slots
- first-game phone-account requirements
- user SMS verification gating
- QQ verification gating
- generic empty-slot eligibility
- blocking deletion of the phone-linked first account
- finding the SMS verification phone number
- dashboard verification prompts
- automatic SMS sending after a first game starts
- QQ binding polling and UI
- profile SMS verification UI
- finding an idserver account from a game account
- the "quota has a game but Arkhost does not" repair card

Every item in this list is intentionally removed.

## 5. Historical Arkhost Contract Evidence

The repository history contains the pre-ArkQuota Arkhost mutation implementation.

Commit `4dd4169` contains:

```ts
const doDelGame = (params: any) => del("Game", params);
const doAddGame = (params: any) => post("Game", params);
```

Commit `16dbd52` later changed creation to a captcha-protected Arkhost request:

```ts
const doAddGame = (token: string, params: any) => captcha("game", token, params);
```

The current form already uses the payload shape:

```ts
interface GameAccountForm {
  account: string;
  password: string;
  platform: number;
}
```

### 5.1 Contract to Implement

Use the following contract unless live integration proves that the current backend has changed:

| Operation | Method and path | Payload | Captcha |
| --- | --- | --- | --- |
| Create | `POST /game` | `{ account, password, platform }` | required |
| Update password | `DELETE /game/:account`, then `POST /game` | delete: none; create: `{ account, password, platform }` | create only |
| Repair/reset | `DELETE /game/:account`, then `POST /game` | delete: none; create: `{ account, password, platform }` | create only |
| Delete | `DELETE /game/:account` | none | optional |
| List | `GET /game` | none | JWT |

Game routes are lowercase and the account is part of the delete path. Keep the frontend contract aligned with the current Arkhost route registration.

The captcha request must preserve the existing request convention:

- JWT: `Authorization: Bearer <idserver token>`
- captcha platform header: `X-Platform: postman`
- captcha token header: `token: <captcha token>`

If the current Arkhost rejects one of these historical contracts, stop only that integration step and request the current Arkhost documentation from the user. Do not restore ArkQuota as a fallback.

## 6. Target Architecture

```text
idserver login/OAuth
        |
        | JWT
        v
useUserStore
        |
        +------------------------+
        |                        |
        v                        v
   authClient                apiClient
   account auth              Arkhost adapter
                                 |
              +------------------+-------------------+
              |                  |                   |
              v                  v                   v
          GET /game      SSE /sse/games      game mutations
              |                  |                   |
              +------------------+-------------------+
                                 |
                                 v
                         useGamesStore.gameList
                                 |
                                 v
                         dashboard slot view
```

There is no ArkQuota branch in the target architecture.

### 6.1 Source-of-Truth Invariants

The implementation must enforce these invariants:

1. `gameList` is the authoritative collection of the current user's games.
2. `occupiedSlotCount === gameList.length`.
3. A returned Arkhost game is never hidden because the count exceeds 3.
4. `canCreateGame === gameList.length < MAX_GAME_SLOTS`.
5. The frontend creates at most one add-card command surface, not three synthetic empty slot records.
6. Game identity for dashboard actions is `game.status.account`.
7. A game UUID may be used as a rendering key when present, but mutations must not require a slot UUID.
8. A successful mutation is followed by an Arkhost list refresh. SSE/polling remains the eventual reconciliation mechanism.

## 7. Target Interfaces and Types

### 7.1 Constants

Add a single product constant in `src/constants/game.ts`:

```ts
export const MAX_GAME_SLOTS = 3;
```

Remove `GAME_SLOT_RULE_FLAGS`. It must have no consumers after the migration.

### 7.2 Game Account Form

Replace the quota-named `RegistryAddGameForm` with:

```ts
export interface GameAccountForm {
  account: string;
  password: string;
  platform: number;
}
```

The account in this form is the raw user-entered account. Existing helpers may still build the prefixed Arkhost account (`G...` or `B...`) when a later operation requires it.

### 7.3 Optional Slot View Model

If retaining the word "slot" makes the dashboard easier to read, use a local view type that contains no entitlement fields:

```ts
export interface GameSlotView {
  id: string;
  account: string;
  createdAt: number;
  game: ApiGameGame;
}
```

Projection rules:

```ts
const gameSlots = computed<GameSlotView[]>(() =>
  gameList.value.map((game) => ({
    id: game.status.uuid || game.status.account,
    account: game.status.account,
    createdAt: game.status.created_at,
    game,
  }))
);
```

Do not add any of the following fields:

- `ruleFlags`
- `useFlagDefaults`
- nullable `gameAccount`
- quota timestamps
- idserver phone/QQ data

It is also acceptable for `GameList.vue` to render `ApiGameGame[]` directly and avoid a separate slot type. Prefer the smaller interface if the projection provides no real leverage.

### 7.4 Arkhost Adapter Interface

`APIClient` should expose these methods:

```ts
createGame(captchaToken: string, form: GameAccountForm): Promise<RequestResult<void>>
deleteGame(captchaToken: string, account: string): Promise<RequestResult<void>>
```

`captcha.updateGamePassword(form)` is an orchestration action: it deletes the full Arkhost game account first, then runs the captcha-backed create flow. Keep this orchestration out of `APIClient` so captcha fallback cannot repeat a destructive delete.

### 7.5 HTTP Transport Interface

`AxiosServer` currently drops request data for `delete` inside `asyncRequest`. Fix that before adding Arkhost deletion.

Required helper:

```ts
captchaDelete<T>(url: string, token: string, data?: unknown): Promise<RequestResult<T>>
```

Required DELETE behavior:

```ts
this.service.delete(url, { data })
```

The helper must install the same captcha headers as `captchaPost`.

Do not keep `buildCodeFromRegisterResp` or any host-specific Registry response transformation after `REGISTRY_SERVER` is deleted.

### 7.6 Captcha Action Interface

Change `useCaptcha()` from slot-based calls:

```ts
createGame(slotUUID, form)
deleteGame(slotUUID)
updateGamePasswd(slotUUID, form)
findAccount(gameAccount)
```

to Arkhost/account-based calls:

```ts
createGame(form)
deleteGame(account)
updateGamePassword(form)
loginGame(account)
```

Remove `findAccount` from this module.

## 8. Detailed Implementation Work

### Phase 1: Remove the Registry Network Adapter

1. Delete `src/services/registryClient.ts`.
2. Remove `REGISTRY_SERVER` from `src/constants/api.ts`.
3. Remove the ArkQuota/Registry entry from `API_HEALTH_RECORDS`.
4. Remove the Registry response interfaces and response-interceptor branch from `src/services/server.ts`.
5. Remove `registryClient.setJWT(tokenValue)` from `useUserStore.login()`.
6. Verify `rg -n "registryClient|REGISTRY_SERVER" src` returns no results.

Do not remove:

- `AUTH_SERVER`
- `API_HOST_LTSC`
- `API_HOST_CLOUDFLARE`
- idserver administrator methods
- QQ Bot integration

### Phase 2: Add Arkhost Mutation Methods

1. Keep `createGame` and `deleteGame` as the low-level mutation methods in `APIClient`.
2. Add request-body-capable captcha DELETE support to `AxiosServer`.
3. Update `captchaActions.ts` so password update deletes by account and then invokes the captcha-backed create action.
4. Remove the account-recovery captcha action.
5. Keep all Arkhost URLs inside `APIClient`; dashboard modules must only pass typed data and accounts.

Response handling requirements:

- Treat `API_RESPONSE_CODE.SUCCESS` as success.
- Surface a backend-provided `message` on business failure.
- Surface the existing generic failure toast on thrown network errors.
- Do not refresh game state after a failed mutation.

### Phase 3: Make Arkhost the Store Source of Truth

Modify `src/stores/useGamesStore.ts`:

1. Remove `RegistryUserInfo` imports.
2. Remove `registryClient` and `quotaSlotsSort` imports.
3. Delete `initialUserQuota()`.
4. Delete the `userQuota` ref.
5. Delete `queryUserQuota()`.
6. Change initialization to await only `queryGameList()`.
7. Preserve existing loading flags, captcha detection, SSR notifications, SSE close handling, and polling cleanup.
8. Remove quota state from `$reset()` and the returned store interface.
9. Add `occupiedSlotCount` and `canCreateGame` computed values, or calculate them in the dashboard from `gameList` and `MAX_GAME_SLOTS`.

Recommended store interface:

```ts
return {
  config,
  gameList,
  globalSSR,
  captchaCache,
  charsCache,
  isGameListIniting,
  isLoadingGameList,
  isLoadingChars,
  firstGame,
  occupiedSlotCount,
  canCreateGame,
  findGame,
  queryGameList,
  startGameListPolling,
  stopGameListPolling,
  startSSE,
  initializeGameListServerConnection,
  gameSuspend,
  fetchChars,
  $reset,
};
```

Initialization behavior:

```text
not initialized
    -> query GET /game
    -> mark initial list complete on success
    -> try SSE
    -> if SSE connects: stop
    -> if SSE fails: start polling
```

Do not wait for or reference quota state at any step.

### Phase 4: Simplify Dashboard Rendering

Modify the dashboard modules so they render Arkhost games directly.

`DashboardView.vue`:

- Remove `userQuota` and all `Registry*` imports.
- Remove the first-game watcher that calls `authClient.sendSms()`.
- Remove `selectedSlotUUID`.
- Retain `selectedRegisterForm`, renamed to the new type if still needed for password updates.
- Display `gameList.length` as the occupied count and `MAX_GAME_SLOTS` as the configured capacity.
- Pass `canCreateGame` into `GameList`.

Recommended count text:

```text
我的托管（4 已用 / 3 槽位）
```

This intentionally allows the occupied count to exceed the capacity label.

`GameList.vue`:

- Render every entry in `userGameList`.
- Delete the second loop over `userQuota.slots`.
- Delete the quota-only repair card for unmatched slots.
- Render one `GameAddCard` after the games only when `canCreateGame` is true.
- Emit accounts and forms, never slot UUIDs.

Target event interface:

```ts
(event: "update-password", account: string): void;
(event: "delete", account: string): void;
(event: "create"): void;
```

`GameAddCard.vue`:

- Remove all props based on `RegistrySlot` and `RegistryUserInfo`.
- Remove `allowGameCreate()` and `useUserStore()` dependencies.
- Render a simple enabled create command with text such as `添加游戏托管`.
- The parent owns capacity visibility; the card does not repeat permission logic.

### Phase 5: Simplify Game Actions

Modify `useGameActions.ts`:

- Remove `GameActionsUser`, `user.isVerify`, `allowGameCreate`, and `canDeleteGame`.
- Remove `getSlot()` and normalized slot lookup.
- Open the create dialog without `slotUUID` or `isFirst`.
- Delete by game account.
- Open the password dialog from the selected `ApiGameGame` or account.
- Refresh only `queryGameList()` after successful mutations.
- Keep loading exclusion so repeated clicks cannot create duplicate concurrent actions in one tab.

Delete flow:

```text
click delete(account)
    -> acquire loading guard
    -> run captcha
    -> DELETE /game/:account
    -> if success, refresh GET /game
    -> show success
    -> if business failure, show backend message
    -> if exception, show generic delete failure
    -> release loading guard
```

Create flow:

```text
click add card
    -> recheck gameList.length < 3
    -> open CreateGame dialog
    -> validate account/password
    -> run captcha
    -> POST /game
    -> refresh GET /game
    -> show success
    -> optionally retain current automatic login behavior
```

The capacity check must run both when rendering the card and immediately before opening/submitting the dialog. This handles stale UI in multiple tabs. Arkhost remains authoritative if two tabs race.

### Phase 6: Update Create, Password, and Repair Dialogs

`CreateGame.vue`:

- Remove `slotUUID` and `isFirst` props.
- Remove the first-account phone confirmation screen.
- Remove the requirement that the first account match a mobile number.
- Keep non-empty account/password validation and platform selection.
- Call `captcha.createGame(form)`.
- Refresh only Arkhost games.
- Retain automatic login after creation unless it causes an integration failure unrelated to ArkQuota.

`UpdateGamePasswd.vue`:

- Remove `slotUUID`.
- Receive a `GameAccountForm` or enough game data to construct it.
- Call `captcha.updateGamePassword(form)`; this deletes the existing account and recreates it with the new password.
- Refresh the Arkhost game list after both success and business failure so the UI cannot retain a deleted game.
- Refresh only Arkhost games.

Repair behavior:

- Remove the quota-only "slot exists but Arkhost game is absent" repair branch because no independent slot source remains.
- If an existing Arkhost game reports a password/decryption error, retain the update-password path.
- Do not create a fake slot to repair an account that Arkhost did not return.

### Phase 7: Remove Quota Rules and Their Features

Delete:

- `src/services/gameQuota.ts`
- `src/services/gameQuota.test.ts`
- `src/components/profile/dialogs/RealName.vue`
- `src/views/profile/sms-verify/SmsVerifyView.vue`

Retain `src/components/profile/dialogs/QQBind.vue` as an independent idserver QQ-binding
dialog. It may continue to call `authClient.fetchQQBindCode()`, but it must not read
ArkQuota data, decide game capacity, unlock a game slot, or participate in any game
create/delete/update permission rule.

Remove or simplify:

- `src/components/dashboard/StatusMessage.vue`
- the `PROFILE_SMS_VERIFY` route and route constant
- `authClient.sendSms()`
- `authClient.verify()`
- `useUserStore.isVerify` if no consumer remains
- `GAME_SLOT_RULE_FLAGS`
- `NOTIFY.NOT_ALLOW_DELETE_GAME` if unused after deletion checks are removed

Keep `authClient.fetchQQBindCode()` only for the retained standalone QQ-binding dialog;
it is not a game-slot or ArkQuota dependency.

`StatusMessage.vue` options:

1. Delete it and remove the `个人信息` divider if no content remains.
2. Keep a static support/contact message that has no phone, QQ, first-game, or slot-rule state.

Prefer deletion if only unrelated static content would remain; do not preserve a shallow module solely to avoid deleting an import.

Important distinction:

- Remove ArkQuota slot eligibility rules.
- Retain `Permission.SuperAdmin`, `Permission.CreateGame`, `Permission.QueryGame`, `Permission.UpdateGame`, and `Permission.DelGame` in `constants/auth.ts` because they belong to idserver administrator/user permission management.
- Retain `allowGameCreate`, `allowGameDelete`, `allowGameUpdate`, and `allowGameLogin` in Arkhost system configuration and admin UI.

### Phase 8: Disable Account Recovery Without Removing Its UI

Keep:

- `AuthModelType.ForgetAccount`
- the "忘记了通行证账号?" entry in `LoginForm.vue`
- `ForgotAccountForm.vue`
- the login-dialog branch that renders the form

Remove:

- `registryClient.doFindAccount()`
- `useCaptcha().findAccount()`
- `RegistryAccountFound`
- account lookup response processing

Submission behavior must be deterministic:

```ts
const handleFindAccountBtnOnClick = () => {
  setMsg("找回账号功能暂未开放", Type.Info);
};
```

Do not run captcha, validate the game account, build a prefixed game account, or send a network request. The form may remain visually unchanged so it can be reconnected later.

### Phase 9: Type and Naming Cleanup

Remove from `src/shared/types/api.ts`:

- `RegistryAccountFound`
- `RegistryUserInfo`
- `RegistrySlot`
- `RegistryAddGameForm`

Add `GameAccountForm` in the game section of the same file.

Review and remove quota-derived legacy fields only when they have no non-quota contract purpose:

- `ApiUserAuth.available_slot`
- local `UserState.max_slot`

The JWT `ApiUserInfo.slot` field may remain typed for compatibility with idserver, but it must not control the frontend capacity. `MAX_GAME_SLOTS` is the only capacity used by this feature.

After cleanup, these searches should return no results outside historical documentation:

```bash
rg -n "ArkQuota|arkquota|RegistryClient|registryClient|REGISTRY_SERVER" src
rg -n "RegistrySlot|RegistryUserInfo|RegistryAccountFound|RegistryAddGameForm" src
rg -n "queryUserQuota|userQuota|quotaSlotsSort|allowGameCreate|canDeleteGame" src
rg -n "idServerPhone|idServerQQ|GAME_SLOT_RULE_FLAGS|getSMSSendPhone" src
```

## 9. File Action Matrix

This matrix is an implementation guide, not a requirement to preserve the exact current file decomposition.

| Action | File/module | Required result |
| --- | --- | --- |
| Delete | `src/services/registryClient.ts` | No ArkQuota network adapter remains |
| Delete | `src/services/gameQuota.ts` | No slot rule module remains |
| Delete | `src/services/gameQuota.test.ts` | Removed implementation has no stale tests |
| Modify | `src/services/server.ts` | Generic response handling and captcha DELETE body support |
| Modify | `src/services/apiClient.ts` | Arkhost owns create/update/delete |
| Modify | `src/services/captchaActions.ts` | Account/form-based mutation interface |
| Modify | `src/stores/useGamesStore.ts` | Arkhost list is the only source of truth |
| Modify | `src/stores/useUserStore.ts` | No Registry token installation or quota verification state |
| Modify | `src/shared/types/api.ts` | Remove Registry types, add `GameAccountForm` |
| Modify | `src/constants/api.ts` | Remove Registry host and health entry |
| Modify | `src/constants/game.ts` | Add max 3, remove slot flags |
| Modify | dashboard view/list/actions | Direct game rendering and account-based actions |
| Modify | create/update dialogs | No slot UUID or phone/first-game rules |
| Delete | QQ and phone verification UI | Remove quota-driven feature surfaces |
| Modify | auth form/actions | Forgot-account maintenance message, no request |
| Modify | router/app constants | Remove SMS verification route |
| Add | focused tests | Pin Arkhost contracts and 3-slot behavior |

## 10. Behavior Matrix

### 10.1 Slot and Creation Behavior

| Arkhost game count | Games displayed | Add card displayed | Header count |
| ---: | ---: | --- | --- |
| 0 | 0 | yes | `0 已用 / 3 槽位` |
| 1 | 1 | yes | `1 已用 / 3 槽位` |
| 2 | 2 | yes | `2 已用 / 3 槽位` |
| 3 | 3 | no | `3 已用 / 3 槽位` |
| 4 | 4 | no | `4 已用 / 3 槽位` |
| N > 4 | N | no | `N 已用 / 3 槽位` |

### 10.2 Mutation Refresh Behavior

| Operation result | Toast | Immediate list refresh | SSE/polling |
| --- | --- | --- | --- |
| Success | success | yes | remains active |
| Backend business failure | backend message | no | remains active |
| Network/transport exception | generic failure | no | remains active |
| Success but refresh fails | mutation success plus existing refresh error behavior | attempted | eventually reconciles |

### 10.3 Removed Behavior

| Previous behavior | Target behavior |
| --- | --- |
| First account must be a phone number | Any non-empty supported game account is accepted |
| First account cannot be deleted | Any returned game can be deleted |
| Verified phone unlocks slots | No phone-based unlock |
| QQ binding unlocks slots | No QQ-based unlock |
| Slot `ruleFlags` control add-card state | Only `gameList.length < 3` controls add-card visibility |
| ArkQuota can show a repair card | No independent quota record, so no repair card |
| Find email through ArkQuota | Maintenance message only |

## 11. Error Handling and Edge Cases

### 11.1 More Than Three Existing Games

Never truncate with `slice(0, 3)`. Never reject the list as invalid. Never automatically delete over-capacity games. Capacity is a creation policy, not a display filter.

### 11.2 Missing UUID

Arkhost account is the mutation identity. If `status.uuid` is empty, use `status.account` as the Vue rendering key or slot-view identifier. Do not block actions because a former slot UUID is absent.

### 11.3 Account Prefixes

Current helpers use `G` and `B` account prefixes. Preserve the established behavior:

- creation form sends the raw account plus `platform`
- post-create automatic login may use `buildGameAccount()`
- deletion sends the account exactly as Arkhost returned it
- password update derives raw account/platform through existing account helpers when needed

### 11.4 SSE and Polling Races

Both transports replace the complete game list. Mutation-triggered `queryGameList()` may race with SSE. This is acceptable if every update is treated as a complete authoritative snapshot.

Do not merge in deleted quota slots or retain games missing from the latest Arkhost snapshot.

### 11.5 Multiple Browser Tabs

Two tabs can both observe 2 games and submit a third/fourth creation. The frontend rechecks capacity before submission, but Arkhost must remain the final authority. Surface Arkhost's business error and refresh the list after any success.

### 11.6 Logout and Reset

`useGamesStore.$reset()` must:

- clear `gameList`
- clear caches
- close SSE
- stop polling
- reset initialization/loading state

There is no quota state to reset.

### 11.7 Disabled Account Recovery

The maintenance action must never leak or submit the entered game account. No captcha should open and no request should appear in the network log.

## 12. Test Plan

### 12.1 HTTP Transport Tests

Add tests that mock the Axios instance and verify:

1. `captchaDelete()` uses `DELETE` with `{ data: payload }`.
2. Captcha headers are present for create, update, and delete.
3. Non-captcha calls do not retain stale captcha headers.
4. Registry-specific response transformation no longer exists.

### 12.2 Arkhost Adapter Tests

Verify exact contracts:

1. `createGame(token, form)` calls `POST /game` with the unchanged form.
2. `captcha.updateGamePassword(form)` calls `DELETE /game/:account` first and then runs the captcha-backed `POST /game` create request.
3. `deleteGame(token, account)` calls `DELETE /game/:account` with the account in the path.
4. Game list remains `GET /game`.

### 12.3 Store Tests

Mock `apiClient` and verify:

1. Initialization calls only `fetchGameList()` before establishing transport.
2. No quota request is possible.
3. A successful initial list marks initialization complete.
4. SSE success does not start polling.
5. SSE failure starts 5-second polling.
6. `$reset()` closes SSE and clears polling.
7. `occupiedSlotCount` equals 0, 1, 3, and 4 for corresponding list sizes.
8. `canCreateGame` is true for 0-2 and false for 3 or more.

### 12.4 Game Action Tests

Verify:

1. Create opens without slot data.
2. Delete passes Arkhost account, not UUID.
3. No phone/QQ/verification state is read.
4. Successful mutations refresh only `queryGameList()`.
5. Failed mutations do not refresh.
6. Loading guards prevent duplicate local submissions.
7. Password-error games still open the password update dialog.

### 12.5 UI Tests

Render the dashboard/list with 0, 2, 3, and 4 games:

1. Every game is visible.
2. Exactly one add card appears for 0 or 2 games.
3. No add card appears for 3 or 4 games.
4. The 4-game case renders all four cards and displays `4 已用 / 3 槽位`.
5. Delete and password events contain accounts only.
6. No QQ, phone verification, first-account, or repair text is present.

### 12.6 Account Recovery Tests

Verify:

1. The forgot-account entry remains visible.
2. The existing form opens.
3. Submitting shows `找回账号功能暂未开放`.
4. No captcha or network client method is called.

### 12.7 Static Verification

Run:

```bash
npm run typeCheck
npm run test:unit -- --runInBand
npm run build
npm run lint
```

At documentation time, repository dependencies are not installed in the workspace: `vue-tsc` and `jest` are not found. The implementing agent must install dependencies with the repository's chosen package manager before treating these checks as authoritative. Do not change dependency versions solely to run the checks.

## 13. Acceptance Criteria

The refactor is complete only when all of the following are true:

- [ ] No runtime code references `arkquota-tunnel.arknights.app`.
- [ ] No runtime code imports or instantiates `registryClient`.
- [ ] No request is made to `/api/users/me`, `/api/slots/gameAccount`, `/api/mgm/slots`, or `/api/users/findEmail`.
- [ ] Login installs the JWT only into still-active clients.
- [ ] Dashboard initialization succeeds based only on Arkhost game query.
- [ ] SSE remains the preferred live update mechanism.
- [ ] Polling remains the fallback mechanism.
- [ ] Create uses Arkhost `POST /game`.
- [ ] Delete uses Arkhost `DELETE /game/:account` with the account in the path.
- [ ] Password update uses Arkhost `DELETE /game/:account` followed by `POST /game`.
- [ ] All Arkhost-returned games are displayed, including counts above 3.
- [ ] Creation is offered only below 3 games.
- [ ] Slot `ruleFlags` and quota sorting are removed.
- [ ] Phone, QQ, and first-game gates and UI are removed.
- [ ] First-game deletion protection is removed.
- [ ] The quota-only repair card is removed.
- [ ] Forgot-account UI remains and sends no request.
- [ ] idserver administrator permission management remains functional.
- [ ] Arkhost system create/update/delete/login configuration remains functional.
- [ ] Type checking, unit tests, build, and lint pass.
- [ ] `git diff` contains no unrelated formatting or metadata churn.

## 14. Implementation Order

Use this order to keep the repository navigable and reduce intermediate type errors:

1. Add `GameAccountForm` and `MAX_GAME_SLOTS`.
2. Add generic captcha DELETE transport support and its tests.
3. Add Arkhost mutation methods and their tests.
4. Move `captchaActions` to `apiClient` and remove `findAccount` there.
5. Refactor `useGamesStore` to remove quota state/query.
6. Refactor game actions and dialogs to remove slot UUIDs.
7. Refactor dashboard rendering and capacity behavior.
8. Disable forgot-account submission.
9. Delete phone/QQ/first-game feature modules and routes.
10. Delete `registryClient`, `gameQuota`, Registry constants, and Registry types.
11. Run zero-reference searches.
12. Run unit tests, type checking, build, and lint.
13. Manually verify create/delete with a real Arkhost environment if credentials and backend access are available.

Deleting ArkQuota modules near the end makes compiler errors useful during migration, but do not leave compatibility shims in the final state.

## 15. Non-Goals

This refactor does not include:

- backend changes to idserver or Arkhost
- restoring or redesigning account recovery
- a per-user configurable slot limit
- migrating the hardcoded limit into system configuration
- adding a new entitlement backend
- changing the SSE event contract
- changing game config, logs, characters, replay, admin, QQ Bot, or OAuth features
- deleting idserver permission bitmasks
- redesigning the dashboard visual style

## 16. Stop Conditions for the Implementing Agent

Do not ask for clarification about code locations; they are discoverable from this document and the repository.

Request backend documentation from the user only if one of these specific conditions occurs:

1. Arkhost rejects `POST /game` for create/recreate even though authentication and captcha are valid.
2. Arkhost rejects `DELETE /game/:account` or requires a different delete contract.
3. Arkhost uses a different captcha header contract for DELETE.
4. The successful Arkhost response envelope is incompatible with `RequestResult<T>`.

When reporting such a blocker, include the method, URL, request shape, response status, and sanitized response body. Do not include JWTs, captcha tokens, passwords, or full game account identifiers.

## 17. Definition of Done

The resulting frontend has two clear backend modules:

- idserver for identity and authentication
- Arkhost for all game state and game mutations

The game collection module has a small interface centered on `gameList`, live updates, and account-based actions. Removing ArkQuota must reduce complexity rather than redistribute quota terminology across callers. A maintainer should be able to delete every ArkQuota-specific file, type, host constant, request path, and feature without finding a hidden compatibility dependency elsewhere in `src/`.
