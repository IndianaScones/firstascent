# Freeze investigation, step 1 (review only)

**Status (2026-10-13): investigation closed.**
- **Conclusions and decisions:** `DECISIONS.md`, "The freezes are the top priority".
- **Step-2 tooling (§8): superseded.** It was not built for the legacy code. Its snapshot and animation-wait registry ideas move into the migrated code.
- **Open questions (§9): skipped.**
- **Fixes applied in the closing task** (playtested on Studio by Jonathan on 2026-10-14; results and commits in `progress.md`):
  - **Silent class (S1, S4 and any instances not found):** `animationPromise` (`modules/utils.js`) now settles an animation wait that can't complete. That covers an element not in the document or not rendered, no animation running one frame after the class is applied (this includes "class already present"), the animation cancelled, and a timeout backstop. Each fallback goes through the normal completion path and logs one `[FA animation fallback]` warning. An element that is already out of the document stays out: `after()` still runs its cleanup, but the element isn't re-inserted at its destination.
  - **S2:** null guards at the three `trade_button` sites: js:8222 (Simul Climb), js:12831 and 12876 (Rerack) and js:12996 (Bomber Anchor). Line numbers are from before the change. With the button missing, the check is skipped; `onUndoSummitBeta` → `restoreServerGameState()` then recreates the button with its state recomputed (js:2615–2616).

The rest of this document is the investigation record and is unchanged.

Date: 2026-10-12. Playtest results were added the same day: see "Playtest results" just before §1. Each suspect in §1 now opens with its verdict. No code was changed. Scope: `firstascent.js`, `modules/utils.js`, `firstascent.game.php`, `states.inc.php`, `firstascent.action.php`, plus `firstascent.css` and `firstascent_firstascent.tpl` where they decide whether an animation can run at all.

## How to read this document

- **Verified**: read in the code. Every code claim carries `file:line`. `js:` = `firstascent.js`, `utils:` = `modules/utils.js`, `php:` = `firstascent.game.php`, `css:` = `firstascent.css`, `tpl:` = `firstascent_firstascent.tpl`, `states:` = `states.inc.php`.
- **Inferred**: my reasoning, not something I observed.
- **Framework (doc)**: a claim taken from the BGA docs, with the doc and line. `misc/docs/bga/legacy/` has no page for the client-side game interface (it only covers action.php, states.inc.php, view/tpl, Deck and Stock). Notification-queue claims therefore come from `misc/docs/bga/current/game-files/Game interface logic_ Game.js - Board Game Arena.md` (cited as "Game.js doc") and from the repo's `bga-framework.d.ts` (cited as "d.ts").
- **Framework (unverified)**: undocumented framework internals. They need a runtime check in step 2.
- **Browser**: standard CSS Animations behavior, not BGA-specific.

## Background: how a client waits

These five facts underlie every suspect below.

1. **Every synchronous notification uses a dynamic duration.** All 60 synchronous subscriptions call `setSynchronous(type)` with no duration (js:7215–7397). The handler must therefore call `setSynchronousDuration`. Otherwise "the game will remain paused forever" (Game.js doc:1186–1188; d.ts:110–123). Every handler is an `async` function and calls `this.notifqueue.setSynchronousDuration()`, with no argument, as its last step after a chain of `await`s (see §3).
2. **What gets awaited is almost always `utils.animationPromise`** (utils:225–262). It resolves only when the element fires `animationend` (utils:234–245). The `transitionend` branch is never used: `'trans'` appears only in the definition. There is no timeout, no `animationcancel` handler, no check that an animation actually started, and no check of `event.target`.
   - **Browser:** `animationend` never fires in three cases, and none of them throws. (a) The element or an ancestor is `display:none` when the class is added, or becomes `display:none` mid-animation (that fires `animationcancel` instead). (b) The class is already on the element, so nothing restarts. (c) The element is removed from the document mid-animation.
   - **Browser:** `animationend` bubbles. A child's animation ending fires the parent's listener early.
3. **Consequence (inferred):** if one awaited animation never ends, that client's handler never reaches `setSynchronousDuration`. The client then never processes the following notifications, including the framework's state change, so the action bar keeps whatever custom text the handler last wrote. Other clients are unaffected. A refresh rebuilds the page from `getAllDatas`. That matches the symptoms point for point, *provided no error is thrown*.
4. **Exceptions also stall the queue.** A `TypeError` inside an async handler rejects that handler's promise before the release call. The framework subscribes these handlers through `dojo.subscribe` and ignores the returned promise (inferred from Game.js doc:1072–1122), so the rejection is unhandled. Chrome normally prints `Uncaught (in promise) …` for that. Whether BGA intercepts unhandled rejections was **framework (unverified)**. It matters a lot: if BGA does intercept them, every exception-before-release path also becomes a silent freeze.
   - **Answered on Studio by playtest 4: BGA does not intercept them.** The S2 throw printed `Uncaught (in promise) TypeError` and the release was skipped. So an exception before the release is a *loud* freeze. A freeze with a clean console comes from a promise that never settles. Production is not checked (§8.4).
   - Many helpers use `new Promise(async (resolve) => {…})` (for example js:6260, 7789, 7868, 8101, 8230; utils:2774, 2805, 2977, 3093, 3287, 3402, 4051, 4095, 4524, 4637). If the async executor throws, the outer promise never settles at all, so the awaiting handler hangs. The executor's own rejection is still unhandled, so the console shows it too (Browser).
   - Several handlers release the queue inside a `.then()` chain that has no `.catch` (js:8509–8513, 8598–8608, 8684–8700, 12655–12667, 12802–12838). A throw anywhere in such a chain means no release.
5. **Five server actions end without a state transition.** These are `confirmAssets` with Simul Climb (`return;`, php:1199–1200), `confirmTrade` (php:2027, no `nextState` in the function), `confirmRerack` (php:4717), `confirmEnergyDrink` (php:4780), and `confirmBomberAnchor` (php:4803–4828; its `confirmPortaledge` returns early at php:4188–4189 and `confirmAssetsForDiscard` at php:3585–3587).
   - After these actions no framework state change ever overwrites the client's custom action-bar text. The client restores the bar itself, through `restoreServerGameState()` (js:8060, 8698, 8718, 8745) or through `onUndoSummitBeta()`, which ends in `removeActionButtons()` + `restoreServerGameState()` (js:6310–6311). `onUndoSummitBeta()` is called from js:8421, 12666, 12704, 12837, 12881, 12958 and 13045, and is never awaited.
   - The game never calls `setClientState` (grep: no hits). The docs describe `restoreServerGameState` only "if you are in client state" (Game.js doc:188–190). Its behavior outside a client state, which is how this game always uses it, is **framework (unverified)**.
   - **Indirect evidence that it works (inferred):** the "Undo Trade" buttons call `restoreServerGameState()` and then immediately dereference `$('trade_button')` (js:3687–3688, 3883–3884), although `removeActionButtons()` had removed it (js:3672, 3805). That only works if the call synchronously re-ran `onUpdateActionButtons('climbOrRest')`. If so, it also resets `gamedatas.climbing_card_info` (js:2576) every time.

---

## Playtest results (§8.0, run 2026-10-12)

Jonathan ran the six §8.0 playtests on Studio. The line numbers in the console output (js:4739, js:5820:103, js:12831) match this checkout, so Studio was very likely running this version of `firstascent.js`.

- **Proves**: established directly by the observation.
- **Suggests**: supported by the observation, but not established.
- "Not recorded": the result didn't say. It is not a negative.

### Results

| # | Target | What happened | Freeze | Action bar | Console (all levels) | Log during freeze | Wait cursor |
|---|---|---|---|---|---|---|---|
| 1 | S1, watcher | The portaledge stayed hidden. The drawn cards seemed to fly in from near the upper left of the board, then the client froze. Water/Psych-only rest: Water adjusted, then it froze | yes, both | Water/Psych rest: "Adjusting Psych". Card rest: not recorded | nothing | **stopped**: the next player's moves went through on their side but never reached the frozen client's log | not recorded |
| 2 | S1, active player (rest; variant: trade) | The drawn cards appeared in the draw display, then it froze. Trade variant: the same | yes, both | "Drawing Asset/s from the Portaledge" | nothing | not recorded | **shown** |
| 3 | S1, Bomber Anchor | Errors at click time. The action was never sent: no animation, no freeze | no | — | `js:4739 Uncaught TypeError: Cannot set properties of null (setting 'innerHTML')`; on Confirm, `During callback: onclick / onConfirmSummitBetaBomberAnchorAssets` … `reading 'remove'` at js:5820:103 | — | — |
| 4 | S2, Rerack in `climbOrRest` | Froze after the token animation. The available pitches can't be clicked and show no tooltips; other hover effects and tooltips still work | yes | "Discarding Summit Beta Token" | `js:12831 Uncaught (in promise) TypeError: Cannot read properties of null (reading 'classList')`, from the `.then` at js:12803 | not recorded | not recorded |
| 5 | S3 | Not runnable: once Bomber Anchor is confirmed, Energy Drink can't be clicked until Bomber Anchor is resolved | — | — | — | — | — |
| 6 | S4, Cool-Headed Crimper, watcher | Froze, as expected | yes | not recorded verbatim (expected "Discarding extra Climbing Card") | nothing | not recorded | **shown** |

No result records whether a refresh fixed the freeze. The original reports say a refresh always does.

### Answers to the step-1 questions
- **The "Discarding Summit Beta Token" freeze.** From the replay, the other player had used Rerack in the Climb Phase, before choosing a pitch. It happened on production, on desktop, with an uncommon window size.
- **Console during that freeze.** Probably checked (all levels except Verbose, no filter). Jonathan isn't sure it was that freeze, or that token.
- **Other freezes.** Their circumstances aren't remembered. Whether any of them showed framework text is unknown.
- **Step-2 scope.** Log-only wrapping of framework functions and of every `notif_*` is approved. Jonathan added one requirement: record every unresolved `animationPromise` call and whether its element was visible (§8.2 item 3, §8.4).

### What each result proves

**Playtest 1 (S1, watcher): confirmed.**
- **Proves:** a client that hides the portaledge during an opponent's rest and leaves it hidden freezes when the rest resolves. Its console stays clean, and the resting player is unaffected.
- **Proves:** the frozen client's notification queue is fully blocked. Later log entries never arrive (this answers §8.3 for S1).
- **Matches the code:**
  - "Adjusting Psych" is the last title `updateWaterPsych` writes (utils:3059–3062, 3084–3086). Next, with no cards drawn, `portaledgeOpponent` awaits `portaledge_close` (utils:3376).
  - The cards "from the upper left" fit the prediction in §1: their flights start from positions measured inside the hidden portaledge.
- **Open:** the result doesn't say whether the psych cube visibly moved. If it didn't, the stall is inside the psych update (utils:3074), not at utils:3376 (§9).

**Playtest 2 (S1, active player): confirmed, for both rest and trade.**
- **Proves:** the active player freezes the same way when the portaledge is hidden before Confirm, whether resting or trading.
- **Matches the code:**
  - The flip cards are created inside the hidden portaledge decks, so their flights can't run (utils:3181–3184).
  - The real cards are then placed straight into the draw display (utils:3217), which is what was seen.
  - `portaledge()` then awaits `portaledge_close` (utils:3224). Trade reaches the same line via `notif_confirmTradePrivate` (js:8739).
- **New: a wait cursor.**
  - The game never sets one: there is no `cursor: wait` in the game's CSS or JS. It comes from the framework.
  - It fits the inferred interface lock from the `lock: true` action (js:4797; §5.5).
  - Playtest 6 suggests it isn't only that lock.

**Playtest 3 (S1, Bomber Anchor): not tested.** Two click-time errors block it, so S1's Bomber Anchor branch is **still open**. Step 1 missed the first error.
- **js:4739.**
  - `onSelectPortaledge`'s non-resting branch writes `draw_counter.innerHTML` with no null check.
  - `#draw_counter` is created only on entering `drawAssets`, `resting` and `selectPortaledge`, and by the trade flow (js:1904, 2008, 2198, 3692, 3888). In `climbOrRest`, for example, it never exists.
  - Whether `removeActionButtons()` (utils:3969, js:5668) also removes it in those states is **framework (unverified)**.
  - So during Bomber Anchor in a state without the counter, each Portaledge +/− click throws. (In `resting` the rest branch at js:4709–4735 runs instead.) The throw comes *after* `#ba_draw_num` and the deck classes are updated (js:4670–4707), and *before* the code that hides "+" and toggles Confirm (js:4741–4766).
- **js:5820.**
  - `onConfirmSummitBetaBomberAnchorAssets` decrements `enabled_summit_beta_tokens`. If that reaches 0, it removes `#available_sb_message` with no null check, and the message was already gone. §5.3 had listed this line as a click-time hazard.
  - The throw comes after the Portaledge handlers are cleared and `this.bomber_anchor` is set false (js:5814–5817). It comes before the action is sent (js:5822).
  - It happens only when Bomber Anchor is the last enabled any-time token. With a second one in hand, the count stays ≥ 1 (inferred).
  - Why the message was missing is not established. The likeliest cause: `removeActionButtons()` removes every child of `#generalactions`, the `.msg` span included. **Framework (unverified)**: the docs only say "all buttons".
  - Rerack guards the same removal (js:5434). Energy Drink (js:5489) and Simul Climb (js:5621) don't.
- **The framework catches action-button errors.** Errors in action-button callbacks are caught and logged as "During callback: onclick / <method>" (observed, ly_studio.js).
- **The regression Jonathan noticed** (the Portaledge "+" is usable with no discards selected):
  - `onConfirmSummitBetaBomberAnchor` shows every "+" (js:5683) and hides only the "−" (js:5705).
  - Nothing caps the draws at the number of selected discards. The cap logic in `onSelectPortaledge` sits after the js:4739 throw anyway.
  - Added to TODO.md, together with both errors.

**Playtest 4 (S2, Rerack): confirmed.**
- **Proves:** in `climbOrRest`, Rerack throws at js:12831 because `$('trade_button')` is null. The release (js:12838) is skipped, and the active player freezes on "Discarding Summit Beta Token". The throw site, the title and the stack frame (the `.then` at js:12803) all match §1 S2.
- **Proves** that BGA (Studio) doesn't suppress unhandled rejections from async notification handlers (Background point 4). The rejection came from a `.then` chain with no `.catch` and printed as `Uncaught (in promise)`.
- **Consequence (inferred):** an exception before the release is a *loud* freeze, visible in the frozen client's console. A freeze with a clean console comes from a promise that never settles (S1, S4 and similar), not from a throw.
- **Matches the code, for the dead pitches:**
  - `resetStateOnSummitBeta` set `pointer-events:none` on every `.cursor` element at the token click (utils:3980–3985). The handler's own `clicksOff()` did the same (js:12711 → utils:808–814).
  - The restores, `clicksOn()` (js:12836) and `onUndoSummitBeta`'s reset (js:6282), come after the throw.
  - `pointer-events:none` also blocks hover, which would explain the missing tooltips on those pitches (inferred).
- **Suggests, strongly:** the production freeze was S2. The replay shows Rerack used in `climbOrRest`, and the bar text matches.
- **This conflicts with the console answer.** On Studio, S2 always prints this error. Possible reconciliations, none verified:
  - The console that was checked wasn't the frozen client's. S2 freezes only the client of the player who used the token, and the replay says that was the other player.
  - The console was checked during a different freeze.
  - Production handles rejections differently from Studio.
  - New question in §9.
- **Not tested:** the Simul Climb (js:8222) and Bomber Anchor (js:12996) variants. They follow the same code pattern and are still verified in code only.
- **The stack shows framework internals.**
  - `confirmRerackPrivate` was dispatched from `onSynchronousNotificationEnd`. The previous `dispatchNotification` had scheduled that call through `scheduleSynchronousNotificationEnd` and a `setTimeout`.
  - By the server order (php:4751, then 4765), that previous notification was almost certainly `confirmRerackPublic`. This client ignores it (js:7364) even though it is dynamically synchronous (js:7361).
  - That suggests the framework ends ignored notifications itself, which weakens S5. This is inferred: the stack doesn't show the previous notification's type.

**Playtest 5 (S3): original trigger ruled out.** Step 1 was wrong here.
- **Proves:** once Bomber Anchor is confirmed, another token can't be clicked. So the step-1 trigger, abandoning Bomber Anchor for another token (§1 S3, step 2), can't happen.
- **Code reason, missed in step 1:**
  - `resetStateOnSummitBeta` sets `pointer-events:none` on every `.cursor` element except the chosen token's own children (utils:3980–3985).
  - Each token's click target `.summit_beta_click` carries `cursor` (tpl:337).
  - Line 3990 re-enables the token wrappers, not their click targets.
  - By the code, the other tokens are dead from the Bomber Anchor token click onward, before Confirm (inferred).
- **The stale-counter paths are gone:** §2.4 row B, and the S3 entries for Rerack and Energy Drink in §2.5 and §3. Every exit removes `#bomber_anchor_counter` (js:6290, 12966), and `onUndoSummitBeta` removes it before its await.
- **Still open, with a new trigger (inferred, untested).** The hang doesn't need a stale counter:
  1. Confirm Bomber Anchor.
  2. Click a hand card. The click-outside listener hides the portaledge (js:5712–5719); TODO.md already records this.
  3. Click "Undo Token". `onUndoSummitBeta` removes the counter (js:6290), then awaits `portaledge_close` on the hidden portaledge (js:6292).
- **What the player sees, and recovery (inferred):**
  - The title "Choose up to 3 Assets…" stays, and so do the Confirm, Undo Token and Show Portaledge buttons. `removeActionButtons()` and `restoreServerGameState()` only run after the await (js:6310–6311).
  - It isn't a queue stall. A second "Undo Token" click finds no counter, skips the await and restores the bar.
  - Clicking "Show Portaledge" instead lets the pending close animation run, which finishes the first call (Browser: showing an element that carries an animation class starts that animation).
- **Leftovers after the double-click recovery (inferred):**
  - the "+"/"−" controls and draw classes in the portaledge decks;
  - the hand cards' Bomber Anchor click handlers (js:6305 is never reached);
  - `this.bomber_anchor === true`;
  - the `portaledge_close` class on `#portaledge`, plus a pending `animationend` listener there.
- **Possible later effect (inferred):**
  - The next time the portaledge is shown, the leftover class plays the close animation. `.portaledge_close` comes after `.portaledge_open` in the CSS (css:876, 882), so it wins even when both classes are present.
  - The stale listener then resumes the first `onUndoSummitBeta` (js:6293–6314). That hides the portaledge again, strips its +/− controls and rewrites the bar, all at an unrelated moment.
  - If that happens in a later portaledge window, it sets up an S1 stall without any click by the player at that time.
  - That is the kind of latent state CLAUDE.md suspects, but this chain is entirely inferred.
- **The same exposure follows playtest 3's js:5820 throw.** Undo Token is the only way out of the stuck Bomber Anchor UI, and by then the hand clicks have usually hidden the portaledge.

**Playtest 6 (S4, crimper watcher): confirmed.**
- **Proves:** hiding `#crimper_display` freezes the watcher when the crimper's choice resolves, with a clean console. The hidden-container stall isn't specific to the portaledge.
- **Matches the code:** `notif_confirmCrimperClimbingCard` awaits `climbing_slot_to_discard` on a card inside the hidden display (js:13255).
- **New: the watcher also showed the wait cursor.**
  - A watcher has sent no action, so the cursor isn't only the `lock: true` lock.
  - The framework probably shows it whenever the notification queue is paused (inferred; **framework (unverified)**). If so, it's a player-visible sign of a blocked queue.
- **Not tested:** the `#climbing_slot` branch of S4 (js:13378–13388).

### Verdicts

| Suspect | Verdict | Evidence | Code |
|---|---|---|---|
| S1 hidden portaledge | **Confirmed** for the watcher rest, active rest and active trade. The Bomber Anchor branch and the click-time variant are **still open** | Playtests 1, 2 | utils:3224, 3376 (3367 for a watcher's card draw, inferred); js:8739, 10549, 10590 |
| S2 `trade_button` | **Confirmed** for Rerack. Simul Climb and Bomber Anchor are **still open** (verified in code) | Playtest 4 | js:12831; js:8222, 12996 |
| S3 Bomber Anchor undo | Step-1 trigger **ruled out**. The mechanism is **still open** under a new trigger (Undo Token after hiding the portaledge); it gives a stuck bar, not a queue stall | Playtest 5; utils:3980–3985, tpl:337 | js:6289–6292 |
| S4 other hidden containers | **Confirmed** for `#crimper_display`. `#climbing_slot` is **still open** | Playtest 6 | js:13255; js:13388 |
| S5 ignored + dynamic sync | **Still open**, weakened | Playtest 4 stack (inferred) | js:7215–7397 |
| S6 throws in framework callbacks | **Still open**, downgraded. Every error path observed reached the console, so an S6 throw most likely would too; it can't explain a clean-console freeze (inferred) | Playtests 3, 4 | utils:1171, 1198–1282 |
| S7 concurrency | **Still open**; no new evidence | — | §1 S7 |

---

## 1. Summary: ranked suspects

**After the playtests (2026-10-12).** Two freeze classes are now proven on Studio. Both freeze one client only, and in both the server is fine.
- **Silent:** a notification handler awaits an animation on a container the user hid (S1, S4). The console stays clean, the queue blocks so the log stops, and the framework shows a wait cursor.
- **Loud:** an exception before the release (S2). The frozen client's console shows `Uncaught (in promise) TypeError`.

The reported production freeze with the Summit Beta text was very probably the loud class (S2, Rerack), although the console report conflicts with that (see Playtest results, playtest 4). No other production freeze has known circumstances, so it isn't proven which class they belonged to. The silent class fits "no console errors".

| Rank | Suspect | Verdict | Why this rank |
|---|---|---|---|
| 1 | S1 | Confirmed | Silent. The trigger is one ordinary click by any client during any portaledge window, and that happens every round |
| 2 | S2 | Confirmed (Rerack) | Very probably the reported production freeze. Deterministic in `climbOrRest`. Loud |
| 3 | S4 | Confirmed (crimper) | Same family as S1. Needs a Cool-Headed Crimper in the game |
| 4 | S3 | Trigger revised, untested | Needs Bomber Anchor, a hidden portaledge and Undo. A second click recovers, but latent state is left behind |
| 5 | S5 | Open, weakened | No freeze observed. The stack suggests the framework handles it |
| 6 | S7 | Open | Timing-dependent. No evidence |
| 7 | S6 | Open, downgraded | Would most likely be loud |

The subsections below keep their step-1 IDs and order, and each opens with its current verdict.

Step-1 picture (inferred; the playtests confirm it for S1 and S4): I found **no flag or counter that gates notification processing**. What gates progress is **DOM state**: whether a container is visible, and whether an animation class was left on an element. Step 1 also listed a leftover `#bomber_anchor_counter`, which playtest 5 ruled out. An awaited animation depends on that state, and an ordinary click earlier in the turn can set it. That fits "latent state" in spirit; it just lives in the DOM, not in a variable. Separately, a few condition-dependent exceptions (S2) produce the same picture. They look intermittent because the same action works in other game states.

### S1. Awaited animations on a portaledge the user has hidden (strongest overall)
**Verdict (playtests 1–2): confirmed** for the watcher's rest, the active player's rest and the active player's trade. The Bomber Anchor branch is untested, because playtest 3 was blocked by click-time errors. The click-time variant is untested too.

Verified mechanism. It fits every listed symptom, including "no console errors".

- **What hides it:** in `resting` and `selectPortaledge`, every client (active player, watchers and spectators) opens `#portaledge` (js:2057–2064, 2234–2241). Each also installs a window-level, capture-phase click listener that hides it on any click outside the portaledge or `#generalactions` (js:2066–2074, 2243–2251; listener utils:1662–1683; hide branch js:4374–4381). Hiding sets `style.display = ''`, so the CSS default `display:none` applies (css:1669–1670).
  - The trading player gets the same listener (js:3850–3861), and so does Bomber Anchor (js:5708–5719).
  - TODO.md already records that, during Bomber Anchor, clicking hand cards hides the portaledge.
- **Nothing re-shows it before the move resolves.** Confirm stays enabled while the portaledge is hidden: `onConfirmPortaledge` (js:4772–4801), `onConfirmTrade` (js:3895–3928) and `onConfirmSummitBetaBomberAnchorAssets` (js:5795–5828) never check visibility.
- **Where it stalls**
  - **Active player:** `notif_confirmPortaledge` awaits `utils.portaledge(…, auto=false)` (js:10590). That function awaits `portaledge_close` on `#portaledge`: utils:3224 if cards were drawn, utils:3243 if not. The element is hidden, so no animation runs and js:10610 is never reached. The same happens in `notif_confirmTradePrivate` (js:8739) and in the Bomber Anchor confirm.
  - **Watcher or spectator:** `notif_confirmPortaledgeOpponent` awaits `utils.portaledgeOpponent(…, auto=false)` (js:10549). That awaits `portaledge_close` at utils:3362/3367 if cards were drawn, utils:3376 if not. Same stall, so js:10571 is never reached.
- **Action bar at the stall:**
  - "Drawing Asset/s from the Portaledge" (utils:3152, 3169, 3200, 3300, 3339).
  - Or "Adjusting Water"/"Adjusting Psych" (utils:3059–3062) for a rest that took only Water or Psych.
- **What the player sees (inferred):** the card-back flights to the hand counter use the offset method. Their source position is measured inside the hidden portaledge, so they probably fly in from near the viewport's top-left corner. They do complete visibly, then nothing more happens. That matches "the animation completes visually; the game never moves on".
- **Why it fits the symptoms (inferred):**
  - Only the client that clicked freezes.
  - Rests happen every round, and watchers naturally click around while waiting.
  - No error is thrown.
  - A refresh fixes it: setup re-shows the portaledge (js:1211–1226) and the server has already moved on.
  - It cannot happen right after a load unless the player clicks during a portaledge window.
- Only `notif_cleanUpClimbOrRest` checks visibility before closing the portaledge (js:13369).
- **Related click-time variant (verified mechanism, no queue involved):** awaiting `portaledge_open` on a portaledge that is *already displayed* and still carries the `portaledge_open` class starts no animation.
  - That class is added with `remove_class=false` at js:2059, 2236, 3851, 5709, 11352, 11445 and utils:3155, 3305. It is removed only when the user hides the portaledge (js:4377).
  - Bomber Anchor is allowed in `resting` and `selectPortaledge` (states:130, 223), where the portaledge is already open with that class. `onConfirmSummitBetaBomberAnchor` would then hang at js:5709, after `removeActionButtons()` (js:5668). The result is the bar "Choose up to 3 Assets in your hand and that many from the Portaledge" with no buttons.
  - Only `onEnteringState` guards against this, with `display != 'block'` (js:2057, 2234).

### S2. Unguarded `$('trade_button')` in no-transition Summit Beta flows during `climbOrRest`
**Verdict (playtest 4): confirmed** for Rerack, console error included. Simul Climb and Bomber Anchor are untested.

Verified in code; deterministic given the state; it would normally print an error. It matches the confirmed "Discarding Summit Beta token" example.

- Any Summit Beta token click runs `resetStateOnSummitBeta`, which calls `removeActionButtons()` (utils:3969). The Rerack, Simul Climb and Bomber Anchor confirm steps call `removeActionButtons()` again (js:5367, 5528, 5668). Nothing re-adds `#trade_button` before the server's notification arrives.
- `removeActionButtons` "Removes all buttons from title bar" (Game.js doc:2050–2052, documented under `statusBar`; I assume the legacy `this.removeActionButtons` behaves the same). The code depends on this: it re-creates `confirm_button` right after removing, for example js:5528 → 5550.
- The handlers then read `$('trade_button').classList` when `gamestate.name === 'climbOrRest'`:

  | Token | Handler | Title at that moment | Throw site | Release skipped |
  |---|---|---|---|---|
  | Rerack (1) | `notif_confirmRerackPrivate` | "Discarding Summit Beta Token" (js:12819, after the token animation at js:12820) | js:12831 (animated) / js:12876 (not animated) | js:12836–12838 / 12880–12882 |
  | Bomber Anchor (9) | `notif_bomberAnchorCleanup` | "Discarding Summit Beta Token" (js:12985, after js:12986) | js:12996–12998 | js:13045–13046 |
  | Simul Climb (7) | `notif_confirmYourAssets` | "Revealing chosen Assets" (js:8181) | js:8222 | js:8424–8425 |

- `climbOrRest` allows `confirmAssets`, `confirmRerack` and `confirmBomberAnchor` (states:80–81). Tokens 1, 4, 7 and 9 are enabled there (js:1923; utils:3812–3816).
- **Fit:** only the active player; the token animation has completed; custom text stays; the server is waiting on that same player, so waiting never helps; a refresh fixes it. This is "a player discarded a Summit Beta token and the bar stayed on 'Discarding Summit Beta Token'" exactly, for Rerack or Bomber Anchor.
- **Conflict:** this is a `TypeError` in an async function. Unless BGA suppresses unhandled rejections, the console should show `Uncaught (in promise) TypeError: Cannot read properties of null (reading 'classList')`. Either the console wasn't checked for that particular freeze, or BGA hides it.
  - **Resolved on Studio:** BGA doesn't hide it. Playtest 4 printed exactly that error at js:12831. What remains open is why the production report saw a clean console (Playtest results, playtest 4; §9).
- This is not latent state. It depends on the game state (`climbOrRest` versus `drawAssets` and others), which is why it would look intermittent.

### S3. `onUndoSummitBeta` awaits a close on a hidden portaledge (Bomber Anchor)
Step-1 title: "`onUndoSummitBeta` hangs on a stale `#bomber_anchor_counter`".

**Verdict (playtest 5): the step-1 trigger is ruled out.** Other tokens can't be clicked mid-flow, so the counter never goes stale. The mechanism is still open under a new trigger: Undo Token after the portaledge was hidden (Playtest results, playtest 5). That gives a stuck bar, not a queue stall. The step-1 text below is kept for reference.

Verified mechanism. It needs a specific earlier sequence. No error.

- `onUndoSummitBeta` awaits `portaledge_close` whenever `#bomber_anchor_counter` exists (js:6289–6292). That await comes *before* `removeActionButtons()` + `restoreServerGameState()` (js:6310–6311). Because every caller is a no-transition flow (Background, point 5), nothing else ever rewrites the bar. The queue is released (callers don't await it), but the bar keeps its custom text with no buttons, and the server waits on this player. The client looks frozen.
- The counter is created when Bomber Anchor is confirmed (js:5670–5678). It is removed only by `onUndoSummitBeta` (js:6290) or by `notif_bomberAnchorCleanup` (js:12966). `resetStateOnSummitBeta` (utils:3964–4029) does not remove it. Because it is a sibling of `#pagemaintitletext`, it also survives title rewrites.
- **Step-1 trigger sequence (ruled out by playtest 5):**
  1. Confirm Bomber Anchor. The counter appears, the portaledge opens and the click-outside listener is installed.
  2. Click a different Summit Beta token instead of "Undo Token". That click lands on the hand, outside the portaledge, so the listener hides the portaledge first.
     - **Not possible.** That token's `.summit_beta_click` (tpl:337) was set to `pointer-events:none` at the Bomber Anchor click (utils:3980–3985).
  3. Use that token.
  4. Its last handler calls `onUndoSummitBeta()`, which awaits `portaledge_close` on the hidden portaledge, forever.
- Resulting bar text (step-1 trigger, now moot): "Discarding Summit Beta Token" for Energy Drink (js:12906) or Rerack (js:12819), or "Discarding Summit Beta token" (lowercase) for Simul Climb (js:8400).
- **New trigger (inferred, untested):** Confirm Bomber Anchor → click a hand card (this hides the portaledge) → "Undo Token". Effects and leftovers: Playtest results, playtest 5.
- `this.bomber_anchor` also outlives the flow. It is set true at js:5731 and false only at js:5817; `onUndoSummitBeta` never resets it. The next portaledge selection then throws on the missing `#ba_draw_num` (js:4674, 4680, 4694, 4701). That is a click-time error, not a freeze, but it confirms Bomber Anchor state leaks.

### S4. The same pattern on other hideable containers
**Verdict (playtest 6): confirmed** for `#crimper_display` (watcher). The `#climbing_slot` branch is untested.

Verified.

- **Cool-Headed Crimper.**
  - In `crimperClimbingCards`, every client gets a click-outside listener that hides `#crimper_display` (js:2400–2411; hide at js:4257–4264). That element's CSS default is `display:none` (css:1168–1169).
  - `notif_confirmCrimperClimbingCard` then awaits `climbing_card_slot_to_discard` on a card inside it (js:13255). It never re-shows `#crimper_display`; js:13228 only shows `#climbing_slot`.
  - Bar: "Discarding extra Climbing Card" (js:13245). Watchers are the likeliest to hit this.
  - Related TODO.md item: the crimper confirm button hides the popup.
- **`#climbing_slot`.**
  - It is hidden by "Hide card" or a click outside (js:4290–4302, 1977–1985; CSS default `display:none`, css:1129–1130).
  - `notif_cleanUpClimbOrRest` awaits an animation on its child without re-showing it (js:13378–13388).
  - `retractClimbingCard` (utils:2783) and `notif_confirmCrimperClimbingCard` (js:13228) do re-show it.

### S5. Ignored notifications that are also dynamically synchronous
**Verdict: still open, weakened.** The playtest 4 stack suggests the framework ends an ignored, dynamically synchronous notification on its own (Playtest results, playtest 4).

Framework (doc) warns against this. Actual behavior unverified.

- 15 types combine `setSynchronous(type)` (no duration) with `setIgnoreNotificationCheck`. Lines are `setSynchronous`/`setIgnoreNotificationCheck`:
  - dealOpponentObjectives (js:7220/7221)
  - confirmOpponentAssets (7225/7227)
  - confirmTradePublic (7235/7238)
  - confirmOpponentRequirements (7242/7244)
  - confirmClimbingChoiceOpponent (7261/7262)
  - confirmAssetsForDiscardPublic (7267/7268)
  - confirmSummitBetaOpponent (7273/7274)
  - confirmSymbolTokenOpponent (7279/7280)
  - automaticPortaledgeOpponent (7283/7286)
  - confirmPortaledgeOpponent (7289/7292)
  - shareEffectPublic (7309/7310)
  - confirmAssetToAssetBoardOpponent (7315/7316)
  - confirmStealFromAssetBoardOpponent (7319/7322)
  - confirmChooseSummitBetaTokenPublic (7337/7338)
  - confirmRerackPublic (7361/7364)
- Game.js doc:1215–1236 says this combination "CANNOT" be used. When the check ignores a notification, the handler that would call `setSynchronousDuration` never runs, "and interface locking results". The documented workaround is a dummy fixed duration. d.ts:129–130 says the same.
- The active player ignores `confirmOpponentAssets` on every draw without freezing, so the current framework evidently does not lock *deterministically* here. Whether it can lock depending on timing is unknown (for example, an ignored notification arriving while an earlier synchronous one is still pending).
- It fits "one client" and "very common points". It is cheap to instrument in step 2.

### S6. Exceptions inside framework callbacks overridden by the game
**Verdict: still open, downgraded.** Every error path observed in playtests 3 and 4 reached the console, so an S6 throw most likely would too. It can't explain a clean-console freeze (inferred).

Throw sites verified; effect on the queue unverified.

- The `format_string_recursive` override (js:1791–1832) runs for every log line and every status-bar title. It ends in `utils.logInject` (utils:1198–1282), which throws in two cases:
  - **Colored names.** `@…@` is matched by `/@[\w\d ]+@/` (utils:1203) and looked up among player names (utils:1262). If nothing matches, `player.id` throws (utils:1265). Names containing `-`, `'` or accents don't match the regex, so a list like `@Bob@, @Jean-Luc@ and @Ann@` can produce a false match such as `@ and @` (inferred). The server builds exactly such lists (php:2690–2699).
  - **Unknown ids.** `getTooltipForLog` throws on an unknown asset, pitch, climbing card, Summit Beta or objective id (utils:904, 914, 924, 934, 944).
- `addTooltipsToLog` runs after every `notifqueue.addToLog` through `dojo.connect` (js:1692–1694). It throws if `.p{type}` isn't found (utils:1171).
- If either throws inside the framework's dispatch, the handler may never run, so the synchronous notification is never released (inferred). Whether the framework catches this is **unverified**.

### S7. Concurrency hazards
**Verdict: still open.** No playtest covered it.

Code verified; effects inferred; timing-dependent, lower rank.

- **Async work left running into later notifications.** These calls are not awaited:
  - `onUndoSummitBeta` (js:8421, 12666, 12704, 12837, 12881, 12958, 13045)
  - `portaledgeOpponent` (js:10826, 10829, 10865)
  - `retractClimbingCard` from `onEnteringState` (js:2097, 2170, 2269, 2298)
  - the async blocks for `resting`, `selectPortaledge` and `riskSummitBeta` (js:1990, 2183, 2380)

  These can hide or show shared containers, or remove children of `#asset_deck`, while another handler's awaited animation is running inside them.
  - Example: `onUndoSummitBeta` empties `#asset_deck` (js:6281). Draw and refill flip cards are placed there (js:7890–7897, 7953–7960, 8141, 8253, 8316).
- **`discardPlayedSummitBetaTokens`, non-active branch** (utils:4093–4152). It starts one promise chain per token, and each chain re-runs the *accumulated* animation arrays (utils:4129–4141). The extra chain calls `before()` on elements already mid-animation, re-parenting them; it can also set `#token_display` to `''` after the awaiting handler has moved on (utils:4139).
- **`shareEffectPrivate`/`Public`** open and close `#portaledge` twice concurrently (js:10826–10827, 10865–10866). By my estimate the two closes overlap by only about 200–250 ms (inferred).
- **`retractClimbingCard` restores a stale title.** It snapshots `#pagemaintitletext`, hides all action buttons, animates, then writes the snapshot back and re-shows the buttons (utils:2789–2795). If a newer title was written meanwhile, by a state change or another handler, the stale snapshot overwrites it.

### H3 assessment (private notifications)
- The one-client symptom is explained by S1 (each client's own portaledge visibility) and by S2 (a private handler). Neither needs a missing companion notification.
- One server/client mismatch exists but is latent. `$opponent_id` is set for `give_psych` (php:3173–3178); the client ignores the public notification for that opponent (js:7268); the private copy is sent only if `give_opponent || risk_it_info` (php:3247). Today `give_psych` is always set together with `give_opponent` (php:2562–2565, 5043–5046), so no client currently misses both.
- `shareEffectPrivate` and `shareEffectPublic` release the queue only inside `if (climbing_card_type_arg == '49')` (js:10811/10844, 10855/10879). The server sends them only for card 49 (php:3715), so this is latent: any other value would be a silent permanent stall.

---

## 2. Summit Beta discard trace

**Which flow?**
- The exact string "Discarding Summit Beta token", with lowercase "token", exists only at js:8042 and js:8400, both Simul Climb (token 7).
- Capitalized variants:
  - "Discarding Summit Beta Token": js:11933 and 11953 (New Rubber in `matchingTechniques`), 12819 (Rerack), 12906 and 12939 (Energy Drink), 12985 (Bomber Anchor), 13154 (Spider Stick).
  - "Discarding Summit Beta Token/s": utils:4066 and 4120 (climb tokens).
- **Update after the playtests:** the replay identifies Rerack (token 1) in `climbOrRest`, and playtest 4 reproduced that freeze.
  - Rerack's text is "Discarding Summit Beta Token" (js:12819), so the lowercase "token" in the original report was probably not exact.
  - The relevant entry is the Rerack row in §2.5. The Simul Climb trace below stays as a reference for the other no-transition flows.
  - Its S3 references (row B in §2.4) assume the step-1 trigger, which playtest 5 ruled out.

Below is the full Simul Climb trace, then a table for the other tokens.

### 2.1 Client action (active player)
1. The token is enabled by `enableSummitBetaTokens` (utils:3798–3943; tokens 1, 4, 7 and 9 at utils:3812–3816). Its click handler is bound once in `initSummitBetaToken` (utils:3785).
2. Click → `onSummitBetaSimulClimb` (js:5496–5523).
   - `resetStateOnSummitBeta('7')` (utils:3964–4029):
     - `removeActionButtons()` (3969)
     - sets `.cursor` elements to `pointer-events:none` and pushes them onto `utils.clicks` (3980–3985)
     - removes `.selectable` (3986–3989)
     - clears the trade, asset-selection and asset handlers (4022–4027)
   - Title "Use Simul Climb?" (js:5515); buttons Confirm and Undo Token (js:5517–5518).
3. Confirm → `onConfirmSummitBetaSimulClimb` (js:5525–5553): `removeActionButtons()`; title "Choose 3 Asset cards from the Deck and/or Spread" (js:5529); deck +/− controls; spread click handlers; Confirm (disabled) and Undo Token.
4. `onSelectSimulClimb` (js:5555–5603) tracks the selection, using deck classes as the counter.
5. Confirm → `onConfirmSummitBetaSimulClimbAssets` (js:5605–5634).
   - Decrements `enabled_summit_beta_tokens`, then removes `#available_sb_message` with no null check (js:5620–5621). This throws if the message is already gone, before the action is sent.
   - `checkAction('confirmAssets')` → `ajaxcall(confirmAssets.html, {lock:true, simul_climb:true})` (js:5626–5632).

### 2.2 Server
- `action.php:46,66` → `confirmAssets` (php:1005–1203). The token goes to the discard (php:1135–1144).
- Notifications, in order:
  1. `confirmOpponentAssets`: **all players** (php:1146–1165), args include `player_id` and `simul_climb`. The client ignores it when `player_id == me` (js:7227), so the active player skips it; opponents and spectators handle it.
  2. `confirmYourAssets`: **active player only** (php:1167–1191).
- Then `return;` (php:1199–1200). **No state transition.** The game stays in the same state with the same active player.

### 2.3 Client handlers and what is supposed to replace the text
**Active player: `notif_confirmYourAssets` (js:8066–8426)**
1. `clicksOff()` (8067), `disableSummitBetaTokens()` (8068), hide card view if shown, `removeActionButtons()` (8070–8073).
2. `await deckReshuffle()` if flagged (8075).
3. `resizeHand` (8084); `await drawCards()` (8100–8219), title "Revealing chosen Assets" (8181).
4. Trade-button check (8222–8224): **throws in `climbOrRest`** (S2).
5. `await refillSpread()` (8229–8386): title "Refilling Spread" (8280); may await `discardClimbingCard` (8294) and the monochrome replacements (8305–8338).
6. Simul Climb branch (8388–8422):
   - find the token (8390–8391) and strip its classes (8393–8395)
   - **title "Discarding Summit Beta token" (8400)**
   - `await token_hand_to_discard` (8401)
   - clear handlers and draw classes (8409–8417), remove the wrapper (8419), trim the discard pile (8420)
   - **`this.onUndoSummitBeta()`, not awaited (8421)**
7. `clicksOn()` (8424); `setSynchronousDuration()` (8425).

**Replacement text:** only `onUndoSummitBeta` → `removeActionButtons()` + `restoreServerGameState()` (js:6310–6311). It is expected to re-render the server state's title and buttons through `onUpdateActionButtons` (inferred; framework behavior unverified).

**Opponents and spectators: `notif_confirmOpponentAssets` (js:7774–8064)**
1. Awaited draw and refill animations (7865, 8022).
2. Simul Climb branch: create the token in the hand counter (8026–8038); **title "Discarding Summit Beta token" (8042)**; show `#token_display` (8044); `await token_counter_to_display` (8047); 1 s; `await token_display_to_discard` (8050); hide `#token_display` (8051).
3. **`restoreServerGameState()` (8060)**; release (8063).

**Replacement text:** only `restoreServerGameState()` (8060).

### 2.4 Every point where this flow can stall with "Discarding Summit Beta token" showing

| # | Where | Client | Queue blocked? | Earlier state that makes it happen | Status |
|---|---|---|---|---|---|
| A | js:8401 `await token_hand_to_discard` never resolves | active | yes | Token or an ancestor is `display:none`; the token already carries `token_hand_to_discard`; the token is removed mid-animation | Mechanism verified (Browser); no trigger found |
| B | js:8421 → js:6292 `onUndoSummitBeta` awaits `portaledge_close` | active | no, but the bar is never restored and no buttons remain; the server waits on this player | Stale `#bomber_anchor_counter` plus a hidden portaledge (S3) | Ruled out: tokens can't be switched mid-flow, so no counter exists during Simul Climb (playtest 5) |
| C | `onUndoSummitBeta` throws before js:6311 | active | no | For example, a `.selectable_token` element with no child (js:6280) | Inferred, low |
| D | js:6311 `restoreServerGameState()` doesn't rewrite the bar | active | no | Behavior outside client states unknown; may depend on internal "last server state" (Background, point 5) | Unverified; low, because js:3687–3688 suggests it does rewrite synchronously |
| E | js:8047 / 8050 token animations never end | opponent | yes | `#token_display` hidden mid-animation by still-running async work, for example a duplicate chain in `discardPlayedSummitBetaTokens` (utils:4139) (S7) | Inferred |
| F | js:8060 `restoreServerGameState()` doesn't rewrite the bar | opponent | no | As D | Unverified |
| G | Exception between js:8400 and js:8425 | active | yes | Token lookup fails, making `token_ele` null (8390–8395). Tokens are unique (php:330), so unlikely | Inferred, low |

Point 4 above (js:8222) stalls *before* this title is set, leaving "Revealing chosen Assets". It is not a cause of the confirmed example but is the same family (S2).

### 2.5 Other Summit Beta discards

| Token | Handler (active) | Title | What follows | How it stalls with that title |
|---|---|---|---|---|
| Rerack (1) | `notif_confirmRerackPrivate` js:12709 | js:12819 | `checkClimbingChoices` (12828), trade check (12831), `clicksOn` (12836), `onUndoSummitBeta` (12837), release (12838) | **S2** in `climbOrRest` (confirmed, playtest 4); S3 through `onUndoSummitBeta` ruled out (playtest 5) |
| Rerack (1), watchers | `notif_confirmRerackPublic` js:12575 | utils:4120 (via `discardPlayedSummitBetaTokens(['1'])`, js:12664) | `onUndoSummitBeta` on the *watcher* (12666/12704), release (12667/12705) | S7 duplicate chains. `onUndoSummitBeta` on a non-active client also clicks `#show_hide_card_button` (js:6312–6313), toggling the watcher's card view |
| Energy Drink (4) | `notif_confirmEnergyDrink` js:12886 | js:12906 (active), 12939 (others) | `checkClimbingChoices` (12955), `clicksOn` (12957), `onUndoSummitBeta` (12958), release (12959) | S3 ruled out (playtest 5); awaited animations only |
| Simul Climb (7) | above | js:8400 / 8042 | above | above |
| Bomber Anchor (9) | `notif_bomberAnchorCleanup` js:12962 | js:12985 (active only) | trade check (12995–13004), `resizeHand` (13006), `onUndoSummitBeta` (13045), release (13046) | **S2** in `climbOrRest`. If the portaledge was hidden, the client never gets this far: it stalls earlier in `confirmPortaledge` (S1) on "Drawing Asset/s from the Portaledge" |
| Spider Stick | `notif_useSpiderStick` js:13083 | js:13154 | release (13162 / 13188 / 13210) | awaited animations only |
| New Rubber | `notif_matchingTechniques` js:11846 | js:11933 / 11953 | continues to token awards (11969…), release (12077 / 12137) | awaited animations only |
| Climb tokens (2, 3, 5, 8, 10) | `discardPlayedSummitBetaTokens` via js:8876, 8998, 13053–13054 | utils:4066 / 4120 | followed by a state transition, so the framework rewrites the bar | awaited animations only |

---

## 3. Notification inventory

Notes for the table:
- **Sync**: "dyn" means `setSynchronous` with no duration; every synchronous registration is dyn. **Ignore** gives the js line of `setIgnoreNotificationCheck`.
- **Sent**: php lines; "all" = `notifyAllPlayers`, "priv" = `notifyPlayer`.
- **Paths**:
  - "R@N" = `setSynchronousDuration()` at js line N. "anim" / "no-anim" = the `shouldAnimate()` branches (utils:1194–1196).
  - Every syntactic branch reaches a release, **except `shareEffect*`**.
  - The non-release paths are therefore always (a) an awaited promise that never settles, or (b) a throw before the release.
  - The **Risk** column lists the specific, verified instances.
- `modules/utils.js` has no subscriptions. Its `notif_confirmRequirements` (utils:2179) is a helper awaited from js:8879 and 9002.
- **After the playtests:**
  - "S3" in the Risk column refers to the step-1 trigger, which playtest 5 ruled out.
  - Confirmed rows: `confirmPortaledgeOpponent` (playtest 1), `confirmPortaledge` and `confirmTradePrivate` (playtest 2), `confirmRerackPrivate` at js:12831 (playtest 4), `confirmCrimperClimbingCard` (playtest 6).

| Notification | Sync / ignore | Sent | Handler | Paths | Risk |
|---|---|---|---|---|---|
| confirmCharacter | dyn | all 985 | js:7406 (not async) | anim: inner async awaits `select_character` (7581) → R@7584; no-anim → R@7594 | setup only |
| dealPersonalObjectives | dyn | priv 997 | 7598 | anim: awaits 7645–7674 → R@7687; no-anim → R@7712 | |
| dealOpponentObjectives | dyn / 7221 | all 994 | 7716 | anim → R@7770; else → R@7771 | S5 |
| confirmOpponentAssets | dyn / 7227 | all 1146 | 7774 | awaits `deckReshuffle` 7780, `drawCards` 7865 (chain 7844–7853), `refillSpread` 8022 (7931, 7942–7975), Simul Climb 8047/8050 → R@8063 | S5; Simul Climb §2 E/F |
| confirmYourAssets | dyn | priv 1167 | 8066 | awaits 8075, 8219, 8386, 8401; `onUndoSummitBeta` not awaited 8421 → R@8425 | **S2 (8222)**; 8092 `$('minus_one').remove()` unguarded; §2 B |
| riskShowAssets | dyn | all 1842 | 8428 | anim: release inside `.then` of an un-awaited chain → R@8513; no-anim → R@8541 | no `.catch` |
| riskReturnAssets | dyn | all 1952, 1985, 4973, 4994, 5093, 5116 | 8545 | anim: `.then` → R@8608; no-anim → R@8633 | no `.catch` |
| confirmTradePublic | dyn / 7238 | all 2069 | 8637 | anim: chain → `await portaledgeOpponent(auto=true)` 8695 → R@8700; no-anim → R@8719 | S5; S1 click-time variant if the portaledge is already shown with its class |
| confirmTradePrivate | dyn | priv 2085 | 8723 | `await portaledge(auto=false)` 8739 → R@8748 | **S1** |
| confirmOpponentRequirements | dyn / 7244 | all 1674 | 8751 | awaits `playAssets` (8841), `discardPlayedSummitBetaTokens` 8876, `notif_confirmRequirements` 8879 → R@8881 | S5; S7 |
| confirmYourRequirements | dyn | priv 1697 | 8884 | awaits 8992, 8998, 9002 → R@9005 | |
| confirmBail | dyn | all 2017 | 9008 | awaits `updateWaterPsych` 9015; anim: meeple 9062 → R@9067; no-anim → R@9073 | |
| drawClimbingCard | dyn | all 1792 | 9077 | anim: awaits 9102, 9123 → R@9142 (inside 9144); no-anim → R@9171 | title and `removeActionButtons` first (9079–9080) |
| crimperDrawsClimbingCards | dyn | all 1779 | 9175 | anim: 9214, 9241 → R@9264; no-anim → R@9290 | |
| passedClimbingCard | dyn | all 4686 | 9294 | retract 9296, discard 9301 → R@9310 | |
| confirmClimbingChoiceOpponent | dyn / 7262 | all 2768 | 9313 | retract, `parseClimbingEffect` ×2, discard → R@9335 | S5 |
| confirmClimbingChoice | dyn | priv 2791 | 9338 | as above → R@9362 | |
| confirmAssetsForDiscardPrivate | dyn | priv 3221 (+ opponent 3248) | 9365 | many awaits (9414–9911) → R@9922 | |
| confirmAssetsForDiscardPublic | dyn / 7268 | all 3195 | 9925 | many awaits (9962–10320) → R@10329 | S5 |
| confirmSummitBetaOpponent | dyn / 7274 | all (8 sites, 2870–5562) | 10332 | `sbReshuffle` 10338, 10354, 10356 → R@10367 | S5 |
| confirmSummitBeta | dyn | priv (8 sites; one to the opponent, 3978) | 10370 | 10384–10419 → R@10437 | |
| confirmSymbolToken | dyn | priv 2665, 2943, 3356, 4644 | 10440 | 10442–10475 → R@10478 | |
| confirmSymbolTokenOpponent | dyn / 7280 | all 2933, 3346, 4634; priv to each opponent 2653 | 10481 | 10483–10504 → R@10507 | S5 (the private copy is never ignored: recipient ≠ `player_id`) |
| automaticPortaledgeOpponent | dyn / 7286 | all 3449, 3519 | 10510 | `parseClimbingEffect` → `portaledgeOpponent(auto=true)` (utils:3042) → R@10519 | S5; S1 variant |
| automaticPortaledge | dyn | priv 3462, 3529 | 10522 | → `portaledge(auto=true)` (utils:3036) → R@10532 | S1 variant |
| confirmPortaledgeOpponent | dyn / 7292 | all 4115 | 10535 | `await portaledgeOpponent(auto=false)` 10549 → R@10571 | **S1** (watcher); S5 |
| confirmPortaledge | dyn | priv 4136 | 10574 | `await portaledge(auto=false)` 10590 → R@10610 | **S1** (active) |
| updateWaterPsych | dyn | all 2423, 2437, 3668 | 10613 | 10615, 10620 → R@10622 | |
| confirmAddTokenToPitch | dyn | all 4209 | 10625 | 10654–10685 → R@10693 | |
| rollDie | dyn | all 1909, 2485, 4938 | 10696 | anim: 10708, `roll_die` 10729, `remove_die` 10735 → R@10742; no-anim → R@10758 | `die_wrapper` children's `animationend` bubbles to the wrapper's listener (10712) |
| sunnyPitch | dyn | all 803 | 10762 | the `return` at 10771 is in an inner arrow function → R@10800 | title `''` and `removeActionButtons` first (10764–10765) |
| shareEffectPrivate | dyn | priv 3855, 3878 | 10803 | **release only if `type == '49'`** (10811 → R@10844) | latent silent stall; S7 concurrent portaledge |
| shareEffectPublic | dyn / 7310 | all 3836 | 10848 | same guard (10855 → R@10879) | as above; S5 |
| confirmAssetToAssetBoard | dyn | priv 4273 | 10883 | → R@10944 | |
| confirmAssetToAssetBoardOpponent | dyn / 7316 | all 4260 | 10947 | → R@11020 | S5 |
| confirmStealFromAssetBoardOpponent | dyn / 7322 | all 4500 | 11023 | → R@11190 | S5 |
| confirmStealFromAssetBoard | dyn | priv 4517 | 11193 | → R@11339 | |
| climbingCards15And24Public | dyn | priv to the active player 2677 (despite the name) | 11342 | show portaledge + await `portaledge_open` 11351–11352, …, `portaledge_close` 11382 → R@11406 | S1 click-time variant |
| climbingCards15And24Private | dyn | priv to each opponent 2715 | 11409 | 11444–11445, …, 11503, 11509 → R@11540 | S1 click-time variant |
| summitBetaChoices | dyn | all 2607 | 11543 | → R@11654 | title and `removeActionButtons` first |
| confirmChooseSummitBetaTokenPlayer | dyn | priv 4568 | 11657 | → R@11711 | |
| confirmChooseSummitBetaTokenOpponent | dyn | priv 4583 | 11714 | → R@11789 | |
| confirmChooseSummitBetaTokenPublic | dyn / 7338 | all 4598 | 11792 | → R@11843 | S5 |
| matchingTechniques | dyn | all 6179 | 11846 | anim → R@12077; no-anim → R@12137 | |
| noMatchingTechniques | dyn | all 6198 | 12141 | 1.2 s → R@12145 | |
| noPermanentAssets | dyn | all 6237 | 12148 | 1.2 s → R@12152 | |
| grantPermanentAssets | dyn | all 6475 | 12155 | → R@12392 | |
| flipPlayedAssets | dyn | all 6279 | 12395 | → R@12463 | |
| passStartingPlayer | dyn | all 6515 | 12466 | → R@12476 | |
| revealHeadwall | dyn | all 709 | 12479 | → R@12572 | |
| confirmRerackPublic | dyn / 7364 | all 4751 | 12575 | anim: `.then` → discard tokens → `onUndoSummitBeta` → R@12667; no-anim → R@12705 | S5; S7; no `.catch` |
| confirmRerackPrivate | dyn | priv 4765 | 12709 | anim: `.then` → 12819–12838; no-anim → 12882 | **S2 (12831 / 12876)**; S3 |
| confirmEnergyDrink | dyn | all 4794 | 12886 | `updateWaterPsych` 12890, token animations → `onUndoSummitBeta` 12958 → R@12959 | S3 |
| bomberAnchorCleanup | dyn | all 4827 | 12962 | active: `$('bomber_anchor_counter').remove()` 12966 (unguarded), 12986, trade check 12996; others: 13031, 13034 → `onUndoSummitBeta` 13045 → R@13046 | **S2**; S3 |
| discardJesusPiece | dyn | all (7 sites) | 13049 | retract, `discardPlayedSummitBetaTokens` → R@13057 | utils:4103–4107: with no args on a non-active client it iterates `false` after resolving (TypeError) |
| retractRiskDie | dyn | all 4933, 5075 | 13060 | `remove_die` 13069 → R@13080 | |
| useSpiderStick | dyn | all 1760 | 13083 | anim: active → R@13162, others → R@13188; no-anim → R@13210 | |
| confirmCrimperClimbingCard | dyn | all 5142 | 13214 | anim: 13255 (inside `#crimper_display`), 13278 → R@13314; no-anim → R@13338 | **S4** |
| cleanUpClimbOrRest | dyn | all 5768 | 13366 | guarded portaledge close (13369–13374); `#climbing_slot` child animation 13388 → R@13395 | **S4** |
| preGameEnd | dyn | all 6630 | 13398 (not async) | → R@13533 | |
| undoClimbingCleanup | none | all 4670 | 13342 | synchronous | |
| updateFinalPersonalObjectivesTracker | none | all 6542 | 13350 | synchronous | |
| updatePlayerTokenTracker | none | priv 1766, 4798, 6190 | 13354 | synchronous | |
| addZombie | none | all 6666 | 13358 | synchronous | |
| updatePlayerNamesAndColors | none | all 5594 | 13362 | synchronous | |
| debug | none | — | 7402 | empty | |
| log_only, confirmClimbingChoiceLog | not subscribed | all and priv (php:1732…, 2809) | — | log only | |

---

## 4. Action bar writes

**Mechanics.** `utils.updateTitlebar` (utils:1618–1645):
- removes `.name_span` from `#page-title` and `#gameaction_status`;
- overwrites both `#pagemaintitletext` and `#gameaction_status` with `innerHTML`, coloring a leading "You";
- calls `resizeTitlebar`, which is currently a no-op: its body is commented out (utils:303–461).

Nothing records who wrote the text or what should replace it.

**Restorers:**
- `restoreServerGameState()`: js:3687, 3883, 6311, 6466, 8060, 8698, 8718, 8745.
- `updatePageTitle()`: js:5140.
- `retractClimbingCard`'s snapshot write-back: utils:2794.

**Expected follow-up kinds:**
- **[click]**: replaced by the next step of the same click flow, by an undo (`onUndoSummitBeta`, `undoOnSelectResources` or `undoTrifecta`, all ending in `restoreServerGameState` or `undoTrifecta`'s own text), or by the framework's state change after the server action.
- **[notif→state]**: overwritten by the framework's state-change title once the queue reaches the state change. This is inferred: the client relies on it implicitly.
- **[notif→restore]**: no-transition flow, so only an explicit client restore replaces the text.
- **[helper]**: shared helper; the follow-up is whatever its caller expects.

| Line | Text | Follow-up |
|---|---|---|
| js:2055 | replaces "five" with "six" in the framework title (Free Soloist / Phil) | [notif→state] |
| js:3277, 3304 | "You must choose a Pitch, Rest, or Trade Assets" | [click] |
| js:3349 | "You must choose Pitch exposure and type" | [click] |
| js:3416 | "As previously climbed, you must select N Asset/s to ignore" | [click]; Undo → `undoOnSelectResources` → restore (6466) |
| js:3425 | "You must select an Asset to risk missing as Phil" | [click], as above |
| js:3434 | "You must select Assets" | [click] |
| js:3568 | "As Buff Boulderer, you must select N requirement/s to ignore" | [click] |
| js:3674 | "You must choose 3 Assets of the same type" (trade) | [click]; Undo Trade → restore (3687) |
| js:3828 | "Discarding Asset/s" (trade, client-side animation) | → js:3849 |
| js:3849 | "You must take 1 card from the Portaledge" | [notif→restore] via `confirmTradePrivate` (8745), or Undo Trade → restore (3883). The Undo Trade path awaits `portaledge_close` first (3878): S1 click-time variant |
| js:4926 | "You must select a Pitch" | [click] |
| js:5140 | `updatePageTitle()` | resets to the framework description |
| js:5354, 5368 | "Use Rerack?" / "Choose 2 Asset Cards" | [click] → server → `confirmRerack*` |
| js:5462 | "Use Energy Drink?" | [click] |
| js:5515, 5529 | "Use Simul Climb?" / "Choose 3 Asset cards from the Deck and/or Spread" | [click] |
| js:5655, 5669 | "Use Bomber Anchor?" / "Choose up to 3 Assets in your hand and that many from the Portaledge" | [click] |
| js:5678 | inserts `#bomber_anchor_counter` *after* `#pagemaintitletext` | survives every title rewrite; removed only at 6290 / 12966 (S3) |
| js:6236 | "Reroll Risk Die?" | [click] |
| js:6510, 6531, 6623, 6652, 6789, 6809, 6884, 6903, 6956, 7156 | character-ability prompts ("You must select a requirement to …", "You must select Assets", …) | [click] |
| js:7579 | "Placing Character and dealing Personal Objectives" | [notif→state] |
| js:7843, 7917, 8181, 8280 | "Revealing chosen Assets", "Refilling Spread" | [notif→state], or [notif→restore] for Simul Climb |
| js:8042, 8400 | **"Discarding Summit Beta token"** | [notif→restore] (8060 / 8421 → 6311) |
| js:8507, 8594 | "Revealing played Assets", "Returning risked Assets to hand" | [notif→state] |
| js:8683 | "Discarding Asset/s" (trade, watcher) | [notif→restore] (8698) |
| js:8834, 8838, 8972 | "Revealing played Assets", "Placing played Asset/s on Asset Board" | [notif→state] |
| js:9079, 9177 | "Drawing Climbing Card(s)" | [notif→state] |
| js:9424, 9569, 9710, 9831, 9856, 10075, 10120 | "Discarding Asset/s", "Giving Asset/s to " (plus a name span appended to `#gameaction_status`'s parent at 9574, 9836, 10125), "Placing played Assets on Asset Board" | [notif→state], or [notif→restore] under Bomber Anchor |
| js:10341, 10388 | "Drawing Summit Beta Token" | [notif→state] |
| js:10460, 10493 | symbol-token message | [notif→state] |
| js:10657 | "Placing Asset Token on Pitch" | [notif→state] |
| js:10709 | "Rolling Risk Die" | [notif→state] |
| js:10764 | `''` (blank) | [notif→state] |
| js:10910, 10971 | "Placing Asset on Asset Board" | [notif→state] |
| js:11051, 11242 | "Stealing Asset from" (+ name span 11056, 11247) | [notif→state] |
| js:11349, 11442 | "Dealing Gear cards from the Portaledge" | [notif→state] |
| js:11552 | "Drawing Summit Beta Tokens" | [notif→state] |
| js:11678, 11732, 11805 | "Taking Summit Beta Tokens" | [notif→state] |
| js:11933, 11953 | "Discarding Summit Beta Token" | → js:11969 |
| js:11969 | "Awarding 2-Point Token/s to " (+ name spans inserted next to `#pagemaintitletext` and in `#gameaction_status_wrap`, 11974/11977) | → js:12076 (`''`), then [notif→state] |
| js:12143, 12150 | "Checking for …" | [notif→state] |
| js:12512 | "Revealing Headwall" | [notif→state] |
| js:12586, 12801 | "Taking cards from discard pile" | [notif→restore] (Rerack) |
| js:12819, 12906, 12939, 12985 | **"Discarding Summit Beta Token"** | [notif→restore] via `onUndoSummitBeta` (12837/12881, 12958, 13045) |
| js:13103 | "Awarding 2-Point Token/s to " (+ name spans 13108/13111) | → 13154 |
| js:13154 | "Discarding Summit Beta Token" (Spider Stick) | [notif→state] |
| js:13245 | "Discarding extra Climbing Card" | [notif→state] |
| utils:1911 | "You must choose a Pitch, Rest, or Trade Assets" (`undoTrifecta`) | [click]. Called from many Summit Beta click handlers, so it also overwrites in the middle of a flow |
| utils:2314 | "Placing Rope and Climber" | [notif→state] |
| utils:2789–2795 | `retractClimbingCard`: snapshot → "Discarding Climbing Card" → **writes the snapshot back** and re-shows all action buttons | can write back stale text (S7) |
| utils:3062 | "Adjusting Water" / "Adjusting Psych" | [helper] |
| utils:3152, 3169, 3200, 3300, 3339 | "Drawing Asset/s from the Portaledge" | [helper] (S1 stall text) |
| utils:3404 | "Refilling the Portaledge" | [helper] |
| utils:4066, 4120 | "Discarding Summit Beta Token/s" | [helper] |
| utils:4526 | "Shuffling the Asset Deck" | [helper] |
| utils:4643 | "Refilling the Summit Beta Pile" | [helper] |

Other action-bar contents the client writes:
- **Counters appended to `#generalactions`:** `draw_counter` (js:1904–1907, 2008–2011, 2198–2201, 3888–3891) and `discard_counter` (js:2108–2111).
- **Messages:** `bailing_message` (1945–1947), `available_sb_message` (utils:3940), `maxed_out_message` (5474–5476), plus others.
- **Ordering:** a `MutationObserver` keeps `.msg` elements at the end of `#generalactions` (js:1751–1778).
- **Undo button:** `clicksOff`/`clicksOn` remove and re-add an "Undo Climbing Card" button through the `utils.button_undo` flag (utils:736–739, 828–831). The button is re-added in whatever state is current at the time.

---

## 5. Latent state inventory

Ordered by how directly the state can gate notifications, state entry or the action bar. "Refresh" means: is it reset by a page load?

### 5.1 DOM state that gates awaited animations (highest priority)

| State | Set | Cleared | Set-without-clear paths | Refresh | Gates |
|---|---|---|---|---|---|
| `#portaledge` visibility (inline `display`) | shown: js:2058, 2235, 2062, 2239, 3850, 5708, 1212, 11351, 11444; utils:3154, 3304 | hidden by the user (js:4376); after a close (utils:3226, 3248, 3364, 3369, 3378; js:3882, 6294, 13373) | **The user hides it during any portaledge window; nothing re-shows it before `portaledge_close` is awaited** | rebuilt (js:1211–1226) | **S1, S3** |
| `portaledge_open` class on `#portaledge` | js:2059, 2236, 3851, 5709, 11352, 11445; utils:3155, 3305 (`remove_class=false`) | only js:4377 (user hide) | after every animated open; never removed on close. Conversely, `portaledge_close` stays on `#portaledge` after every hung close (the remove at utils:239 never runs; S1, S3). Showing the portaledge then replays the close, which wins over `portaledge_open` (css:876, 882) | absent after load | S1 click-time variant (awaited open while already shown); S3 leftovers |
| `#bomber_anchor_counter` | js:5670–5678 | js:6290, 12966 | none found. Step 1 named abandoning Bomber Anchor for another token, which playtest 5 ruled out: the other tokens can't be clicked (utils:3980–3985). `onUndoSummitBeta` removes the counter before its await | gone | S3, new trigger (js:6289–6292) |
| `#climbing_slot` visibility | js:1232, 2783 (utils), 4305, 13228 | js:4291, utils:2799 | user "Hide card" / click-outside during `climbingCard` | rebuilt | S4 (js:13388) |
| `#crimper_display` visibility | js:4267 (setup path not checked) | js:4258, 13299, 13322 | user hide / click-outside in `crimperClimbingCards` (all clients) | rebuilt | **S4** (js:13255) |
| `#token_display`, `#asset_deck_draw`, `#spread_draw` visibility | many (for example js:7797–7798, 8044, 8133–8134, 13028; utils:4104) | many (for example js:7850–7851, 8051, 8203–8204, 11916, 13035; utils:4139) | only through async work still running from a previous handler (S7) | default | S7, §2 E |
| `#asset_deck` children (+/−, `draw_num`, temporary flip cards) | js:1880, 5531, 7804, 7890, 7953, 8141, 8253, 8316 | `onUndoSummitBeta` empties it (js:6281); `resetStateOnSummitBeta` (utils:3970–3971) | removal while a draw/refill flip animation is in progress there | rebuilt | S7 |
| "draw + number" classes used as counters (`#asset_deck`, `.portaledge` decks) | js:5565–5582, 4671–4703 | js:2449–2453, 2509–2512, 2534–2537, 6295–6297, 8413–8417, 12972–12974 | read as "the last class in classList" (js:5559, 4656, 4663, 4780, 5618, 5809, 3904). Any later class appended to these elements breaks the counter (inferred) | rebuilt | action payloads, not the queue |
| `animationend` listeners on elements | utils:245 | only after firing (utils:240) | a never-fired listener stays on the element. A later animation on that element, or on a child (bubbling, no target check), runs `func.after` with stale arguments: re-parents the element, restores a stale z-index, and resolves a long-dead promise, which can resume an old handler mid-flow | gone | stale moves; a late `setSynchronousDuration` (inferred) |

### 5.2 Listener slots

| State | Set | Cleared | Set-without-clear | Refresh | Gates |
|---|---|---|---|---|---|
| `gameui.globalOutsideClickListener` / `globalCloseCallback` (**a single slot**, window capture-phase click listener; added after `setTimeout(0)`) | utils:1662–1683, called from js:1225, 1253, 1448, 1985, 2074, 2251, 2411, 3031, 3115, 3371, 3861, 4282, 4341, 4372, 5719, 13312; utils:1741, 1780, 1825, 1881 | utils:1694–1702, called from `onLeavingState` (js:2425) and many close paths | Replaced by any other popup (reference cards js:3031; scorecard and opponent objectives utils:1741, 1780; trifecta utils:1825/1881). So which container a stray click hides depends on what the player last opened (inferred) | rebuilt | **S1, S4**: decides what a click hides |
| `handleOutsideClick` | js:7569 (cleared) | js:7567–7570 | no setter found in the current code (only the cleanup remains) | n/a | none |
| Click handlers | always `.onclick =` (property assignment, no accumulation) plus `addActionButton` | per-state arrays emptied in `onLeavingState` (js:2429–2565) | — | rebuilt | none |
| Other `addEventListener` | utils:2484–2485, 2537–2538 and js:355–356, 369–370 (meeple hover; the same function references dedupe); js:1600 (scroll); js:1603 (`matchMedia`) | never removed | benign | rebuilt | none |
| `aspect.before(dojo.string, "substitute")` | js:32–34 (global hook; it also applies to framework calls) | never | once per page | per page | formatting only |

### 5.3 Instance flags and counters

| State | Set | Cleared / reset | Set-without-clear | Refresh | Gates |
|---|---|---|---|---|---|
| `utils.clicks` and `pointer-events:none` on `.cursor` | `clicksOff` (utils:808–814) from many callers, including **every** `updateWaterPsych` (utils:3054) and `portaledge` (3095); `resetStateOnSummitBeta` pushes too (3980–3985) | `clicksOn` (utils:833–834) | Nested or concurrent pairs (for example js:10817 + 10818 run concurrently): the first `clicksOn` re-enables everything while the other is still running | utils constructor (utils:4–18; created at js:35) | clickability |
| `utils.selectables`, `selectable_tokens`, `selectable_skills`, `selectable_wraps`, `selectable_gears`, `selectable_pitches` and the button flags (`confirm_button` … `token_buttons`) | `clicksOff('hard_off')` (utils:743–806), `clicksOff('pitches')` | `clicksOn('hard_on')` (utils:837–883), `clicksOn('pitches')` | `hard_on` re-adds classes to elements stashed in an *earlier context*. Its button restores have no null checks (utils:854, 858, 862, 866, 870, 874), so they throw if the button was removed meanwhile. If a confirmation dialog closes without either callback, the stash persists (framework behavior unverified) | constructor | §7 (selectable token) |
| `utils.button_undo` | utils:737 | utils:830 | re-adds "Undo Climbing Card" in whatever state is current (utils:829) | constructor | action bar |
| `gameui.enabled_summit_beta_tokens` | utils:3938 | decremented js:5433, 5488, 5620, 5819; utils:4083 | decremented before `checkAction`. Unguarded `#available_sb_message` removal (js:5489, 5621, 5820) throws before the action is sent. **Observed** at js:5820 in playtest 3 | re-set on the next enable | click-time errors |
| `this.bomber_anchor` | js:72, 5731 | js:5817 only | **not reset by `onUndoSummitBeta`** → `onSelectPortaledge` throws on `#ba_draw_num` (js:4674, 4680, 4694, 4701). Also cleared at js:5817 *before* the js:5820 throw (playtest 3), so a failed Confirm leaves the Bomber Anchor UI up with the flag already false | js:72 | portaledge selection |
| `this.risk_it`, `this.risky_climb` | js:67–68, 1274, 8503, 8603–8604, 8630–8631, 8845–8846, 8865–8866, 8975–8976, 8986–8987, 10701–10702, 10913–10923, 10992–11001 | same lines | — | from gamedatas | `#spread_draw` visibility (7851, 8204), titles (8834–8836), `climbOrRest` cleanup (2462) |
| Requirement flags (`*_requirements`, `guidebook_*`, `border_removed`, `phil`, `already_climbed*`, `unnecessary_requirements`, `pitch_requirements`, `ignore`, `ignore_types`, `requirements_met`) | click handlers (3259–7197) | `onLeavingState` `climbOrRest` (2476–2486); `undoOnSelectResources` (6449–6452); `onUndoSummitBetaPassive` (6338–6395) | relevant to the TODO Phil/Guidebook `[state]` items; not the queue | partly in setup (js:69–77) | requirement UI |
| `this.portaledge_num`, `portaledge_types` | js:2189–2190, 3832, 4652 | js:2539, 3875, 3898, 5816 | — | — | draw counters |
| `this.asset_discard` | setup js:689 and 15 handler sites | overwritten | — | setup | Rerack (js:5376, 5395) |
| `gamedatas.current_state` | js:1845; **js:13236 (client-side override with no state change)** | next `onEnteringState` | drifts from `gamedatas.gamestate.name` after the crimper choice; used by `resetStateOnSummitBeta`'s default argument (utils:3964) and js:6309 | rebuilt | Summit Beta reset behavior |
| `gamedatas.climbing_card_info` | js:1846–1848 | reset at the top of every `onUpdateActionButtons` (js:2576), then re-set per state (2590–2804); js:2080 | `restoreServerGameState` probably re-runs `onUpdateActionButtons` (unverified), which resets it mid-turn | rebuilt | climbing UI |
| `utils.climbing_slot_state`, `crimper_display_state` | utils:2691, 2710 | utils:2732, 2745 | `restoreClimbingSlot` without a prior `move…` throws (no callers seen in the reviewed paths) | constructor | none |
| `prevent_error_rentry` | js:1821–1826 | same block | increments and decrements together, so the `>= 10` guard can never trigger (dead logic) | — | none |

### 5.4 Z-index and inline styles

| State | Set | Cleared | Set-without-clear | Refresh | Notes |
|---|---|---|---|---|---|
| `utils.active_zIndex_map` (reference count per stacking root and origin; elevated z-index 700 or 1053 plus the computed value) | utils:35–67 | utils:175–195, only inside `after()` | any animation that never ends leaves its root and origin elevated **for the rest of the session** | new map | §7 z-index TODO |
| Element inline z-index | utils:32 | restored to the value captured at `before()` (utils:26, 172) | if a second animation starts before the first ends, the elevated value is captured as "original" and restored permanently | — | §7 |
| `onConfirmTradeResources` z-index `'10'` on cards **and their hand wrappers** | js:3812–3815 | **never** (`original_z_indices` is never read) | every trade leaves the traded cards' wrappers at z-index 10 | — | §7 |
| Leftover custom properties | `--dx`/`--dy` (non-offset method, utils:128–147, cleaned only on the offset path utils:197–214); `--ow2h`, `--oh2h`, `--dw2h`, `--dh2h` (utils:4772–4775); `--dw`/`--dh` (for example js:7815–7816, 7837–7838) | — | only on elements animated since load | — | §7 |

### 5.5 Timers and pending work
- No `setInterval`. All `setTimeout`s are one-shot delays wrapped in promises, plus `setTimeout(0)` in `setupOutsideClickListener` (utils:1680).
- One `requestAnimationFrame` in the `.msg` observer (js:1763). Observers: titlebar `ResizeObserver` and `MutationObserver` (js:1722–1737); progression `ResizeObserver` (1743–1748); `#generalactions` `MutationObserver` (1756–1777).
- Async work left running past its handler: listed in S7.
- **Interface lock.** Actions use `ajaxcall(…, {lock:true})`. Per Game.js doc:972 the interface "will be locked during server call and notification processing". A stalled queue should therefore keep it locked (inferred), and `checkAction` would answer "An action is already in progress" (Game.js doc:940).
  - **Playtests 2 and 6:** the frozen client showed a wait cursor, both for the active player and for a watcher. The game doesn't set one, so it's the framework's. A watcher has no action pending, so the cursor probably follows the notification queue, not only the action lock (inferred).

---

## 6. Silenced errors

- **`format_string_recursive` `try/catch`** (js:1818–1829): substitution errors are logged with `console.log('Bad substitution', …)`, not `console.error`, and the untranslated template is used instead. This silences errors in log and status-bar formatting. Its re-entry guard is dead logic (§5.3).
- **Missing translation** (js:1800–1804): `showMessage` + `console.error`; returns `''`.
- **No other `try/catch` or `.catch(`** in either file (grep: only js:1818/1820).
- **Unhandled rejections from async handlers** (all 58 async handlers): see Background, point 4.
  - Step 1 called this the key unverified framework behavior: if BGA suppressed them, S2 and every other throw-before-release site would be a silent freeze.
  - **Playtest 4: on Studio they reach the console** as `Uncaught (in promise)`, including from a `.then` chain. Production is not checked.
- **`new Promise(async …)` executors**: an exception inside rejects only the executor's own promise. The outer promise never settles, so there is no rejection to see on the awaiting side; the awaiting handler just hangs (Background, point 4). The executor's rejection is itself unhandled, so it still prints in the console (Browser).
- **Action-button callbacks**: the framework catches their errors and logs `During callback: onclick / <method>` with a stack (observed in playtest 3, ly_studio.js). Handlers assigned directly with `.onclick` print a plain `Uncaught TypeError` (playtest 3, js:4739).
- **`.then` chains without `.catch`** that contain the release: js:8509–8513, 8598–8608, 8684–8700, 12655–12667, 12802–12838 (same effect).
- **`animationPromise` throw** for an unknown type (utils:260), inside the executor: rejected promise. No caller passes another type.
- **`dojo.connect` after `addToLog`** (js:1692–1694): an exception in `addTooltipsToLog` propagates into the framework's caller (inferred). The effect on dispatch is unverified (S6).

---

## 7. Links to TODO.md `[state]` items

### "summit beta token still appeared selectable during opponent's turn (not actually selectable)"
Verified mechanism.
- `clicksOff('hard_off')` stashes `.selectable_token` elements and removes the class (utils:748–751). `clicksOn('hard_on')` re-adds it to every stashed element (utils:839).
- **`onConfirmBail`** (js:3586–3594) and **`onConfirmRiskSummitBeta`** (js:6475–6483) call `hard_off`, then `hard_on` in the confirm callback *right before* sending the action that ends the turn.
- **`onRest`** (js:3637–3648) even calls `disableSummitBetaTokens()` and *then* `hard_on`, re-adding the class. That case is cleaned up later by `onConfirmPortaledge` (js:4794).
- After the turn passes, `disableSummitBetaTokens` does nothing on this client, because it only runs when this client is the active player (utils:3947). `onLeavingState` never calls it.
- The click target `.summit_beta_click` stays `display:none` (utils:3956). That explains "visual only".
- **State shared with the freeze suspects:** the same Summit Beta helpers and stashes (`resetStateOnSummitBeta` pushing to `utils.clicks`, utils:3982; `onUndoSummitBeta`; `enabled_summit_beta_tokens`) run through S2 and S3.

### "asset_hand_to_board z-indices are wrong … happens only to cards drawn since the last page load"
Inferred links, none proven.
1. `active_zIndex_map` leaks whenever an animation never ends, including the many *non-awaited* ones: flips at js:7964, 8327 and utils:3183; `asset_portaledge_to_display` inside a hidden portaledge, utils:3184. The leak elevates containers for the rest of the session.
2. Overlapping animations on one element capture an elevated inline z-index as "original" and restore it permanently (utils:26, 172).
3. `animationend` bubbling, with no target check (utils:234–245), can run `after()` early: the z-index is restored and the element re-parented while its own CSS animation still runs. Parent move and child flip are both 750 ms at js:7909–7910, 8151–8152 and 8272–8273. TODO.md's "wrong card in front during anim, then the correct one snapping in front at end of anim" fits the same mechanism.
4. Only cards animated since load carry leftover inline properties (§5.4).
5. `onConfirmTradeResources` never restores the z-index `'10'` it puts on hand wrappers (js:3812–3815). That is verified leftover state; its causal role is not established.

The shared mechanism with S1, S3 and S4: every hung animation also leaks `active_zIndex_map` entries, and a refresh clears them. That matches "not reproducible from load/refresh".

### Other `[state]` items
The Phil/Guidebook items, the Guidebook deselect and the Crag Dog psych item involve the requirement flags and resource bookkeeping in §5.3. I found no overlap with the queue-gating suspects. Not investigated further.

---

## 8. Recommendations for step 2

### 8.0 Before building tooling: targeted playtests (no code change)
**Run on 2026-10-12.** Results are in "Playtest results", before §1. The expected results of #3 (blocked by click-time errors) and #5 (not runnable) did not hold. Follow-ups are in §8.4.

These confirm or refute S1–S3 directly. Each is cheap. Expected results are inferred from the code.

1. **S1, watcher.** Two players. While the opponent is resting and the portaledge is open on your screen, click once on the board outside it. It closes and a red "Show Portaledge" button appears. Don't reopen it. The opponent confirms a rest that draws at least one card. *Expected:* your client stops on "Drawing Asset/s from the Portaledge"; the opponent carries on; a refresh fixes it. Repeat with a Water/Psych-only rest. *Expected:* it stops on "Adjusting Water/Psych".
2. **S1, active player.** Rest, select cards, click a card in your hand (the portaledge closes), then click Confirm. *Expected:* a freeze on "Drawing Asset/s from the Portaledge". Variant: Trade, then hide the portaledge before Confirm.
3. **S1, Bomber Anchor.** Confirm Bomber Anchor, choose the Portaledge draws first, then the hand discards (the first hand click closes the portaledge), then Confirm. *Expected:* a freeze on "Drawing Asset/s from the Portaledge".
4. **S2.** In the Climb phase (`climbOrRest`, before selecting a pitch), use Rerack. Keep the console open with all levels shown. *Expected:* a freeze on "Discarding Summit Beta Token". Whether `Uncaught (in promise) TypeError … classList` appears answers the unhandled-rejection question.
5. **S3.** Confirm Bomber Anchor ("Use Bomber Anchor?" → Confirm), then click Energy Drink instead of Undo Token and confirm it. *Expected:* the bar sticks on "Discarding Summit Beta Token" with no buttons and no console error.
6. **S4.** Two players, one playing Cool-Headed Crimper. While the crimper chooses between two climbing cards, the watcher clicks outside the two cards. *Expected:* the watcher freezes on "Discarding extra Climbing Card".

### 8.1 Snapshot: what a console-runnable `faSnapshot()` should capture
The method is to diff a snapshot taken during a freeze against one taken after a refresh at the same point. Return plain JSON (elements as CSS paths) so the two can be diffed.

1. **Game and framework state**
   - `gamedatas.gamestate` (`name`, `id`, `active_player`); `gamedatas.current_state`; `isCurrentPlayerActive()`.
   - `instantaneousMode` (d.ts:878–880); `bgaAnimationsActive()` (d.ts:1104–1110); `document.visibilityState`.
   - `checkLock(true)` (Game.js doc:970–975; check its return semantics).
   - `window.onunhandledrejection`.
   - **Unverified internals:** the client-state flag and the "last server state" that `restoreServerGameState` uses. Find them by enumerating `Object.keys(gameui)` and filtering for `state`.
2. **Notification queue**
   - The only documented field is `next_log_id` (d.ts:108).
   - Everything else is undocumented: dump `Object.keys(gameui.notifqueue)` plus every primitive, array length and object key set, generically, so the snapshot doesn't depend on guessed names.
   - Look in particular for the pending queue, the currently waiting notification (type and uid), the synchronous-duration map, the ignore-predicate map and any pending timer. Mark them **unverified** until seen.
3. **Action bar**
   - `#pagemaintitletext` and `#gameaction_status` `innerHTML`.
   - Children of `#generalactions` (id, class, `display`).
   - Siblings of `#pagemaintitletext` (catches `#bomber_anchor_counter` and name spans).
   - `.name_span` count.
4. **Gating containers**
   - For `#portaledge`, `#climbing_slot`, `#crimper_display`, `#token_display`, `#asset_deck_draw`, `#spread_draw`, `#die_wrapper`, `#rest_water_psych` and `#discard_box`: inline and computed `display`, `classList`, inline `margin-right`, child ids.
   - `#asset_deck` `classList` and children.
5. **Animations**
   - Every element carrying any `@keyframes` class name. Build the list from `firstascent.css` at runtime by scanning `document.styleSheets`.
   - For each, `el.getAnimations()` (running or not).
   - Elements with inline `z-index ≥ 300`; elements with inline `--dx`/`--dw*` properties.
   - `utils.active_zIndex_map` entries (path, count, original).
6. **Listeners and stashes**
   - `globalOutsideClickListener != null`, the first line of `globalCloseCallback.toString()`, and its targets.
   - Lengths of every `*_handlers` array.
   - `utils.clicks`, `selectables*`, `button_undo` and the button flags.
   - Elements with inline `pointer-events:none`.
7. **Flags**
   - `risk_it`, `risky_climb`, `bomber_anchor`, `enabled_summit_beta_tokens`, `portaledge_num`, `portaledge_types`, `selected_cards`, `already_climbed*`, `*_requirements`, `ignore`, `ignore_types`, `pitch_requirements`, `choices_info`.
   - `utils.climbing_slot_state` and `crimper_display_state`; `gamedatas.climbing_card_info`.
8. **Summit Beta**
   - The classes of each hand token; the inline `display` of each `.summit_beta_click`; whether `#available_sb_message` exists.

### 8.2 Event logging
Keep a ring buffer in memory and dump it on demand. Tag each entry with an "origin": the notification type and uid being handled, or the click handler's name. Instrumentation **must log only**. It must not change control flow or timing: no `try/catch` that swallows, no auto-resolving of stuck promises. Otherwise it could mask the freeze.

1. **Notifications**
   - Wrap every `notif_*`: log start (type, uid, `move_id`), the call to `setSynchronousDuration` (wrap `notifqueue.setSynchronousDuration`), and settlement.
   - Attach a `.catch` to each handler's returned promise that only `console.error`s. This exposes S2-type throws immediately.
   - Wrap each ignore predicate to log when it returns true (S5).
2. **State entry**
   - `onEnteringState`, `onLeavingState` and `onUpdateActionButtons`, with a marker for whether the call came from `restoreServerGameState` or `updatePageTitle`.
   - The calls to `restoreServerGameState`, `updatePageTitle`, `removeActionButtons` and `addActionButton` themselves.
3. **`animationPromise`**
   - Log start: element path, class, caller origin, and three warning flags: element or ancestor `display:none`; class already present; `getAnimations()` empty one frame after adding the class.
   - Log end.
   - Watchdog: log, never resolve, when an animation hasn't ended within its duration plus 2 s.
   - **Registry of unresolved calls** (Jonathan's addition).
     - Keep every call that hasn't settled: element path, class, origin and start time.
     - Record the element's visibility (element or an ancestor `display:none`) twice: at call time and when the snapshot is taken.
     - `faSnapshot()` lists every unresolved entry.
     - Also log (only) `animationcancel` on those elements.
     - See §8.4 item 1.
4. **Title writes:** `updateTitlebar` (text and origin); `retractClimbingCard`'s snapshot and write-back.
5. **Click stashes:** `clicksOff`/`clicksOn` (type, stash sizes before and after, origin).
6. **Outside-click slot:** `setupOutsideClickListener`, `removeOutsideClickListener` and `triggerOutsideClickClose` (targets, callback, the clicked element).
7. **Show/hide:** `onShowHidePortaledge` and `onShowHideCard` (show or hide, and what triggered it: button, outside click or code).
8. **Bomber Anchor and counters:** `#bomber_anchor_counter` create and remove; `this.bomber_anchor` changes; `enabled_summit_beta_tokens` changes.
9. **Z-index map:** `active_zIndex_map` set, increment, decrement and delete.
10. **Container visibility:** a `MutationObserver` on the `style` attribute of `#portaledge`, `#climbing_slot`, `#crimper_display` and `#token_display`, logging `display` changes with the current origin.

### 8.3 Answering "does the game log keep receiving entries during a freeze?"
- **Answered for S1 by playtest 1: no.** The frozen client's log stops. The checks below would still confirm it for S2 and S4.
- Watch Studio's "Input/Output debugging section", which lists the notifications the client received (Tools and tips doc:54–61).
- Log `notifqueue.next_log_id` together with each `addToLog` call.

### 8.4 What step 2 still needs to establish (after the playtests)
The playtests settled the behavior of S1, S2 and S4. Step 2 is still worth building, for three reasons:
- No production freeze except the Rerack one has known circumstances, so the confirmed suspects aren't proven to be the only causes.
- A silent stall can come from any awaited `animationPromise` on a container that can be hidden, and a code review can't guarantee it found them all.
- Several framework behaviors are still guesses.

In priority order:

1. **Registry of unresolved `animationPromise` calls, with visibility.** Jonathan's addition, and still the most useful single item (§8.2 item 3).
   - Record on every call: an id, the element path, the class, the origin (notification type and uid, or click handler) and the start time.
   - Also record, at call time: whether the element or an ancestor is `display:none`; whether the class was already on the element; and whether `getAnimations()` is empty one frame later.
   - Log `animationcancel` too. On settle, drop the entry and log the duration. The snapshot lists every pending entry with its visibility now and at call time. Log-only: it never resolves anything.
   - **Expected in the confirmed freezes:** exactly one pending awaited entry on a hidden element.
     - Watcher: `portaledge_close` on `#portaledge` from utils:3367 or 3376.
     - Active player: utils:3224.
     - Crimper: `climbing_slot_to_discard` inside `#crimper_display`.
     - S2: no pending entry, and a rejected handler.
   - That pins each stall to one line. Any other picture contradicts the analysis. It also answers playtest 1's psych question.
   - Non-awaited entries count too. The flip cards left inside the hidden portaledge (utils:3183–3184) never settle, which tests the z-index link in §7.
2. **Find silent-stall sites without waiting for a freeze.**
   - Play full games on Studio with the registry's warning flags on: hidden at start, class already present, nothing started, cancelled.
   - Any flagged call that a notification handler awaits is a candidate freeze site, whether or not it froze that time.
   - This replaces guessing which containers can be hidden.
3. **Queue state at freeze time.**
   - The playtest 4 stack names framework internals: `dispatchNotifications`, `dispatchNotification`, `scheduleSynchronousNotificationEnd`, `onSynchronousNotificationEnd`, `pushToSyncBuffer`, `flushMoveBuffer`, `processSynchronizedMoveNotifications`. These are names observed in the Studio build; their semantics are unverified.
   - Log-only wrappers on them should show "waiting on notification X since T".
   - They should also settle S5: does every ignored, dynamically synchronous notification get a scheduled end, including one that arrives while another is pending?
4. **The wait cursor.** Find what drives it (a body class, a lock flag) and record it in the snapshot. Then a player's "I saw a wait cursor" can be told apart: blocked queue, or bar-only stall (S3).
5. **Production console behavior.** This settles part of the S2 conflict and needs no tooling.
   - On any production table, check in DevTools whether `window.onunhandledrejection` is set, and whether `getEventListeners(window)` lists an `unhandledrejection` listener.
   - Studio has nothing that suppresses them (playtest 4).
6. **`restoreServerGameState()` outside a client state** (Background point 5).
   - Log whether it synchronously re-runs `onUpdateActionButtons`. This is still unverified.
   - It decides how the no-transition flows recover (S3, §2 D/F), and the migration needs the answer.
7. **S3's new trigger and its leftovers.**
   - Log `onUndoSummitBeta` entry and exit; the registry will show its pending `portaledge_close`.
   - Then check whether the next portaledge window replays the close animation and runs the stale continuation (Playtest results, playtest 5).
8. **Lower priority.**
   - `.catch` wrappers that log each handler's origin. The console already shows S2-type throws; this only adds the notification type and uid.
   - S6 and S7 logging as in §8.2.

**Settleable by playtest, before any tooling.** Expected results are inferred from the code.
- **Re-show test.** Proves that the hidden-portaledge await is S1's only blocker.
  - During an S1 freeze, re-show the portaledge. Use the red "Show Portaledge" button if it's still there: a watcher's should be, but the active player's is removed at utils:3170. Otherwise run `$('portaledge').style.display = 'block'` in the console.
  - *Expected:* the close animation plays, then the client resumes and the log catches up.
  - Same idea for S4: re-show `#crimper_display`.
- **S1, Bomber Anchor, retried.**
  - Hold a second any-time token (Rerack, Energy Drink or Simul Climb) so js:5820 doesn't throw.
  - The js:4739 errors on Portaledge clicks will still appear outside `selectPortaledge`. They don't block Confirm.
  - Hide the portaledge with a hand click, then Confirm.
  - *Expected:* a freeze on "Drawing Asset/s from the Portaledge".
- **S1 click-time variant.**
  - During your own rest, use Bomber Anchor without ever hiding the portaledge (hiding removes the `portaledge_open` class, js:4377).
  - *Expected:* `onConfirmSummitBetaBomberAnchor` hangs at js:5709. The bar shows "Choose up to 3 Assets in your hand and that many from the Portaledge" with the counter, no buttons and no console error.
- **S2 variants.**
  - Use Simul Climb, then Bomber Anchor, in `climbOrRest`, each time holding a second any-time token (same reason).
  - For Bomber Anchor, re-show the portaledge ("Show Portaledge") before Confirm, so that S1 doesn't hit first.
  - *Expected:* `Uncaught (in promise) … 'classList'` at js:8222 for Simul Climb and js:12996 for Bomber Anchor.
- **S3, new trigger.**
  - Confirm Bomber Anchor → click a hand card → "Undo Token".
  - *Expected:* the bar keeps "Choose up to 3 Assets…" with its buttons, and a second "Undo Token" restores it.
  - *Also expected:* the next time the portaledge opens (for example on your next rest), it plays its close animation instead and disappears.

---

## 9. Open questions

Updated after the playtests. The step-1 questions were answered or can't be answered from memory (see "Playtest results", "Answers to the step-1 questions"). Step 2's tooling captures the unanswerable ones for future freezes.

1. **The production Rerack freeze and the console.** Did the client of the player who used Rerack freeze? Whose console was checked: that player's, or yours? S2 freezes only that player's client, so every other console stays clean.
2. **Playtests 1 and 4:** was the wait cursor shown? It was in 2 and 6. If it shows for every blocked queue (S1, S2, S4) and never for a stuck bar (S3), players can tell the two apart.
3. **Playtests 2, 4 and 6:** did the game log stop updating? And for every playtest: did a refresh fix the freeze? Only playtest 1 recorded the log; none recorded the refresh.
4. **Playtest 6:** what was the exact action-bar text? The expected text is "Discarding extra Climbing Card".
5. **Playtest 1, Water/Psych rest:** did the psych cube visibly move before the freeze? If yes, the stall is at utils:3376; if no, it's inside the psych update (utils:3074).
6. **Playtest 3:**
   - In which state did you use Bomber Anchor, and which any-time tokens did you hold?
   - Did you click "Undo Token" after the errors? What happened?
   - Have Energy Drink or Simul Climb ever been confirmed as your only enabled any-time token without an error? That would show whether `removeActionButtons()` removes `#available_sb_message`.
7. Do you want the playtests listed under "Settleable by playtest" in §8.4 run before tooling is built? They are the re-show test, the Bomber Anchor retry, the S1 click-time variant, the S2 variants and S3's new trigger.

---

## Other findings (not freeze-related, noted in passing)
Added to TODO.md on 2026-10-12: the `onShowHideCard` comparison, the implicit globals, and the Bomber Anchor errors from playtest 3 (js:4739, js:5820, and the uncapped Portaledge draws).

- `onShowHideCard` compares `innerHTML` with the untranslated `'Hide card'` and `'Hide cards'` (js:4257, 4290). In any other language, "Hide" therefore always takes the "show" branch.
- **Implicit globals:** `last_replacement` (js:7997, 8361); `args` (js:8196; utils:3182, 3218); `start_pos`, `end_pos`, `x_diff`, `y_diff` (js:13261–13266); `climbing_card` (js:1231).
- **Bare element globals** relying on the browser's named access by id: `portaledge` (js:1212, 12969–12971; utils:3376–3391), `summit_discard` (js:13300), `climbing_discard_90` (js:13381, 13387).
- `notif_confirmOpponentAssets` and `notif_confirmYourAssets` check `shouldAnimate()` separately before creating a flip element and before using it (js:7889/7907/7915, 8252/8270/8278). If the answer flipped between those calls, `.firstElementChild` of `null` would throw (inferred, unlikely).
