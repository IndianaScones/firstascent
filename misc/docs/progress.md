# Progress log

Running log of what was done each session and what's next. Newest entry first. See `PROCEDURES.md`.

## 2026-10-15 (Bomber Anchor regressions from the Portaledge refactor fixed)

Work began 2026-10-14 and was playtested on Studio by Jonathan in two rounds on 2026-10-14 and 2026-10-15.

**Phase-rule exception:** one-time exception granted for this task only. As granted, it allowed:
- editing `firstascent.js` at the Bomber Anchor sites (Part B of the task);
- editing `DECISIONS.md`, `PROCEDURES.md` ("Scope before migration" only), `TODO.md` and `progress.md`;
- committing and pushing (normal push).

Jonathan extended it during the task, after playtesting:
- UX changes inside the Bomber Anchor flow, which he specified: the hand no longer counts as "outside" for the click-outside popup behavior, and "+" stays hidden until a card is selected for discard. They touched `onConfirmSummitBetaBomberAnchor`, `onShowHidePortaledge`, `onSelectBomberAnchorDiscard` and `onUndoSummitBeta`;
- a one-line edit to `states.inc.php` (the crimper fix);
- committing his own one-line `hex_num` fix in `modules/utils.js`.

The "Current phase" section of `PROCEDURES.md` is unchanged; the review phase continues. The uncommitted testing overrides in `firstascent.game.php` were not touched, staged or committed.

**Done** (all pushed to origin `main`, normal push, `f287bb2..fd78ef9`)
- **`fec912e`, docs.**
  - `DECISIONS.md`: regressions from the Portaledge refactor are fixed in the legacy code when the fix is simple. Outside playtesters use the legacy build before the migration ships; other legacy bugs stay deferred.
  - `PROCEDURES.md`: that is the third in-scope code task.
  - `TODO.md`: resolved Bomber Anchor items deleted (the convention is to delete them; the fix is recorded here). Added the `chooseSummitBetaToken` z-index issue and a test scenario for `selectPortaledge`/`riskSummitBeta`.
- **`5df6cd3`, the click-time errors.**
  - **Cause:** any Summit Beta token click runs `removeActionButtons()`, which empties `#generalactions`. That holds `#draw_counter` and, since the refactor, `#available_sb_message`. In the June baseline (309ffba) the message sat after `#phase_tracker`, outside it.
  - **`onSelectPortaledge`:** five `#draw_counter` writes needed guards, not one. The four `draw_counter.style.color` writes after js:4739 would have thrown next.
  - **Energy Drink, Simul Climb and Bomber Anchor confirm:** guarded the `#available_sb_message` removal, as Rerack already does.
  - **`onUndoSummitBeta`:** resets `bomber_anchor`, before the `await`.
- **`0114572`, the intended behavior.**
  - You may draw only as many Portaledge cards as you discard, up to 3. Confirm is enabled only when the two are equal and at least one. Draw-first (no card selected) is inert.
  - Resync in the hand-card handler: a new discard re-shows "+" and disables Confirm; a deselect clears the draws and re-shows "+".
  - In `resting`, Bomber Anchor uses the `selectPortaledge` logic instead of the rest counter.
  - Portaledge draws chosen before the token was used are cleared at Bomber Anchor confirm. They were invisible but counted against the cap and would have been sent on Confirm.
  - Hand clicks no longer close the portaledge, also after reopening it.
  - Undo Token clears the selectable classes on every hand card.
- **`1aaad2b`, crimper.** `confirmBomberAnchor` calls `confirmAssetsForDiscard` and `confirmPortaledge`, which each run `checkAction`. State 60 (`crimperClimbingCards`) listed neither, so Confirm failed with "This game action is impossible right now". Added both.
- **`fd78ef9`, `hex_num`.** Jonathan's fix: `checkPotential` read `hex_num` without declaring it in the Crag Mama branch.

**What was and wasn't a refactor regression** (checked against 309ffba)
- Regressions: the `#draw_counter` write and the `#available_sb_message` removals.
- Not regressions:
  - the missing cap with zero discards (the logic is identical to June);
  - the crimper `possibleactions`;
  - the hand-card resync gaps.

Fixed anyway, at Jonathan's request or as part of the intended behavior.

**Other Bomber Anchor state that survives Undo Token** (not changed)
- `portaledge_num` and the stale `portaledge_selection_handlers` entries: harmless, because every reader reassigns them first.
- The outside-click listener set at Bomber Anchor confirm isn't removed on Undo. It is one shared global listener, so removing it could kill an unrelated popup's. It wasn't observed in playtesting.

**Verification before Studio**
- A Chromium DOM harness ran the real function bodies against a stubbed DOM and framework: 47 assertions, scratch only and not committed.
- The same assertions failed 21 of the first 39 on the committed code, including the exact errors Jonathan saw.
- With only the stale-draws line removed it failed the new stale-picks cases, so it does detect that symptom.

**Playtest results (Studio, Jonathan)**
- **Round 1, hand-first and draw-first, the cap and Confirm,** with Bomber Anchor as the only any-time token and with several (no difference):
  - **Worked:** `drawAssets`, `climbOrRest`, `climbingCard`, `discardAssets`, `stealFromAssetBoard`, `addTokenToPitch`, `addAssetToAssetBoard`, `chooseTechniqueToken`, `selectOpponent`.
  - **Energy Drink and Simul Climb,** each as the only any-time token: no errors or warnings.
  - **Ordinary Portaledge draws:** incidentally tested, fine.
  - **Problems, since fixed:**
    - crimper Confirm failed;
    - Undo Token left unselected hand cards looking selectable;
    - selecting a hand card closed the portaledge, which was not wanted;
    - "+" showed before any card was selected.
  - **Problem, undiagnosed:** in `chooseSummitBetaToken`, a left-edge pitch overlapping the revealed tokens drew in front of the token after Bomber Anchor was discarded. In `TODO.md`.
- **Round 2:**
  - Click-outside, "+" visibility, the cap, Confirm and Undo all work correctly.
  - `resting` with no prior picks works for both Undo and Confirm, and the rest continues normally. Selecting the token hides the portaledge, and Confirm fades it back in. That is the resting state's own click-outside listener treating the hand-token click as "outside". It wasn't intended, but Jonathan says it isn't undesirable.
  - `resting` with prior picks: "+" was silently inert, now fixed.
  - Crimper and `resting` with prior picks are confirmed resolved.
- **Not tested:** Bomber Anchor in `selectPortaledge` and `riskSummitBeta`. Jonathan isn't concerned before the migration. Logged as a test scenario in `TODO.md`.

**Outstanding**
- **Replay check** (from 2026-10-14, still deferred): step through a Studio replay, including a rest, and confirm there are no fallback warnings. Run it before outside playtesters use the build.
- **The `chooseSummitBetaToken` z-index issue** in `TODO.md`. A console check of `#summit_pile`'s inline z-index before and after the token is discarded would pin it down.
- **Uncommitted testing overrides** in `firstascent.game.php` remain in the working tree.

**Next**
1. The replay check.
2. A review-only migration planning session, in a new session.

## 2026-10-14 (Freeze work closed: conclusions and two targeted fixes)

Work began 2026-10-13 and was playtested on Studio by Jonathan on 2026-10-14.

**Phase-rule exception:** one-time exception granted for this task only. It allowed:
- editing the `animationPromise` function in `modules/utils.js`, and only that function;
- editing the three `$('trade_button')` sites in `firstascent.js` (Rerack, Bomber Anchor, Simul Climb);
- committing and pushing (normal push).

The "Current phase" section of `PROCEDURES.md` is unchanged; the review phase continues. The uncommitted testing overrides in `firstascent.game.php` were not touched, staged or committed.

**Done**
- **A1:** nothing to commit. The investigation docs were already committed as `fbcd7f9` and `db8fd36`.
- **`fb8a1f7`, docs.**
  - `DECISIONS.md`: freeze conclusions (a silent class and a loud class), the three decisions with their reasons, and migration principles a–d. It also has two small consistency edits Jonathan approved.
  - `PROCEDURES.md`: "Scope before migration" now lists the two fixes and notes the tooling as dropped.
  - `CLAUDE.md`: the priority bullet and the doc map.
  - `FREEZE_INVESTIGATION.md`: a status note at the top.
  - `TODO.md`: the bugs found while playtesting the fixes.
- **`948f472`, `animationPromise` fallback.**
  - What it does: settles a wait that can't finish, through the normal completion path, with one `[FA animation fallback]` warning. One frame after the class is applied, it checks whether the element is out of the document, not rendered, or has no running animation. It also settles on a cancel that leaves nothing running, and on a timeout backstop (remaining duration plus 1 s, re-armed while the tab is hidden). An element already removed from the document isn't re-inserted.
  - Before deploying, it was tested in a Chromium harness that loads the real function (22 cases).
  - An audit of every removal site found one deliberate removal of in-flight elements. In the card-49 race, `updateDiscardTopCard` clears the discard pile while refill card backs are flying out of it. That led to the "not re-inserted" rule.
- **`88209ef`, `trade_button` guards** at js:8222, 12831, 12876 and 12996 (line numbers from before the change). When the button is missing, the check is skipped; `onUndoSummitBeta` then restores the bar and recreates the button.
- All three commits were pushed to origin `main` (normal push).

**Playtest results (Studio, Jonathan)**
- **Freeze scenarios now continue instead of freezing:**
  - watcher, rest with a card draw and Water/Psych-only rest (1a, 1b);
  - active player, rest and trade (2a, 2b);
  - Rerack in `climbOrRest` before choosing a pitch (4);
  - Cool-Headed Crimper watcher (6).
- **The next portaledge window after 1a and 2a** opens normally, with no close animation and no warning.
- **Nothing-hidden checks: no fallback warnings.** These were rest, trade, a full round, Rerack in another state, Simul Climb, and Bomber Anchor in `climbOrRest`. Bomber Anchor resolved there with no errors after Confirm, which verifies the js:12996 guard.
- **Bomber Anchor selection is broken by the recent Portaledge refactor:**
  - js:4739 throws on each "+" click;
  - draws are uncapped;
  - with a hand card chosen first, Confirm stays disabled.

  None of this is caused by the fixes. It's recorded in `TODO.md`.

**Fallback warnings seen in playtesting**
- **Expected, in the hidden-container tests:**
  - 1a/1b: one `portaledge_close` on `#portaledge` (not rendered);
  - 2a: two per drawn card (`flip_transform`, `asset_portaledge_to_display`) plus one `portaledge_close`;
  - 2b: three;
  - 6: one `climbing_card_slot_to_discard`;
  - Bomber Anchor confirmed with the portaledge hidden: as 2b.
- **Normal play:** none.
- **Climbing card 49 with a refill (forced with the testing overrides):** about 7 `element is not in the document | … class: portaledge_reshuffle_R` warnings per refill, from utils:3587.
  - Cause: a race that was already there. Both Portaledge draws refill the same deck at once, and each shuffle loop covers both refills' 14 card backs. At `i === 6` it removes them all, then keeps shuffling the removed ones.
  - No stray card backs were left. It's recorded in `TODO.md`.

**Outstanding**
- **Replay check** (deferred by Jonathan): step through a Studio replay, including a rest, and confirm there are no fallback warnings. Run it before outside playtesters use the build.
- **The Bomber Anchor errors at js:4739 and js:5820** are regressions from the recent Portaledge refactor, not long-standing legacy bugs. They are candidates for a separate small fix task before outside playtesting; that isn't decided yet.

**Next**
1. A review-only migration planning session, in a new session.

## 2026-10-12 (Freeze investigation, playtest results)

**Phase-rule exceptions:** none granted, and none needed. The task was review-only. Files written: `misc/docs/FREEZE_INVESTIGATION.md`, `misc/docs/TODO.md` and this entry. No code was changed. Nothing is committed: docs-only changes wait for Jonathan's approval. The uncommitted `firstascent.game.php` change and `misc/docs/temp.txt` in the working tree predate this task and weren't touched.

**Commit:** approved by Jonathan on 2026-10-13. Committed as `fbcd7f9` ("Record freeze playtest results": `FREEZE_INVESTIGATION.md`, `TODO.md` and `progress.md`, staged by explicit path) and pushed to origin `main` (normal push). `firstascent.game.php` wasn't staged.

**Done**
- Recorded Jonathan's §8.0 playtest results and his answers to the step-1 questions in a new "Playtest results" section of `FREEZE_INVESTIGATION.md`. Each result was checked against the code, and each section separates what it proves from what it suggests.
- Verdicts:
  - **S1 (hidden portaledge): confirmed** for the watcher rest, active rest and active trade. The Bomber Anchor branch is still open.
  - **S2 (`trade_button`): confirmed** for Rerack in `climbOrRest`.
  - **S3: the step-1 trigger is ruled out.** Tokens can't be switched mid-flow, which the step-1 review missed. A new trigger (Undo Token after hiding the portaledge) is inferred and untested.
  - **S4: confirmed** for `#crimper_display`.
  - **S5, S6, S7: still open.** S5 is weakened and S6 downgraded.
- Key facts established:
  - BGA on Studio doesn't suppress unhandled rejections. So throw-before-release freezes are loud, and clean-console freezes come from promises that never settle.
  - During an S1 freeze the frozen client's log stops.
  - The framework shows a wait cursor on frozen clients, watchers included.
- The reported production "Discarding Summit Beta Token" freeze was very probably S2 (Rerack, per the replay). This conflicts with the console report; the possible reconciliations and a new question are in §9.
- Updated in `FREEZE_INVESTIGATION.md`:
  - the summary and the suspect ranking, with a verdict at the head of each suspect;
  - the cross-references that relied on the step-1 S3 trigger;
  - §6 (silenced errors).
- Added §8.4: what step 2 still needs to establish, with the unresolved-`animationPromise` registry (element and visibility) first, plus follow-up playtests that need no tooling. Rewrote §9.
- Added to `TODO.md`, not fixed:
  - Bomber Anchor: uncapped Portaledge draws, the js:4739 throw, the js:5820 throw, and `this.bomber_anchor` not being reset by Undo;
  - the untranslated "Hide card" comparison;
  - the implicit globals.

**Next**
1. Jonathan reviews the updates, answers §9, and decides whether to run the follow-up playtests in §8.4.
2. Step 2: diagnostic tooling on a throwaway branch, never merged into `main`, scoped by §8.4. It needs Jonathan to end the review phase or grant an exception.

## 2026-10-12 (Freeze investigation, step 1)

**Phase-rule exceptions:** none granted, and none needed. The task was review-only. The only files written were `misc/docs/FREEZE_INVESTIGATION.md` (new) and this entry. Nothing committed: docs-only changes wait for Jonathan's approval.

**Done**
- Reviewed the client notification handling, animation helpers, action-bar writes and latent client state in `firstascent.js` and `modules/utils.js`, against the server notifications and transitions in `firstascent.game.php` and `states.inc.php`.
- Wrote `misc/docs/FREEZE_INVESTIGATION.md`: ranked suspects, Summit Beta discard trace, notification inventory, action-bar writes, latent-state inventory, silenced errors, links to the `TODO.md` `[state]` items, step 2 recommendations and open questions.
- Main findings (verified in code):
  - **Hidden-portaledge stall.** Notification handlers await `portaledge_close` on `#portaledge`. Any client, active player or watcher, can have hidden it with a single click outside it, and an animation on a hidden element never ends, so the queue never releases.
  - **`trade_button` TypeError.** Rerack, Bomber Anchor and Simul Climb used during `climbOrRest` throw on the removed `#trade_button` before the queue is released. Rerack and Bomber Anchor match the "Discarding Summit Beta Token" freeze.
  - **Stale `#bomber_anchor_counter`.** If Bomber Anchor is abandoned for another token, the counter stays and makes `onUndoSummitBeta` hang. The bar never gets restored.

**Next**
1. Jonathan reviews `FREEZE_INVESTIGATION.md`, answers its open questions (§9), and decides whether to run the targeted playtests in §8.0.
2. Step 2: diagnostic tooling (client state snapshot and set/clear logging) on a throwaway branch, never merged into `main`.

## 2026-10-12 (Studio SSH key auth)

**Phase-rule exception:** one-time exception granted for this task only. It allowed reading and editing `.vscode/sftp.json`, reading the installed SFTP extension's files, running the Windows OpenSSH `ssh-add -l`, and editing, committing and pushing `CLAUDE.md` and `progress.md` (normal push). The "Current phase" section is unchanged.

**Done**
- Studio SFTP switched from password to SSH key auth. `.vscode/sftp.json` now uses the extension's `agent` option pointing at the Windows OpenSSH agent pipe, which holds the `bga_studio` ed25519 key. The extension (Natizyskunk SFTP 1.16.3, ssh2 1.13.0) supports that pipe. VS Code deploy verified ("SFTP: Diff Active File with Remote" worked).
- The old password is confirmed dead: Studio rejected it after the key upload, so no admin reset is needed.
- The backups from the git cleanup were deleted by Jonathan.
- `CLAUDE.md` file-map row for `.vscode/sftp.json` updated.

**Next**
1. Freeze investigation (review first, writing `FREEZE_INVESTIGATION.md`).

## 2026-10-12 (SFTP config removal)

**Phase-rule exception:** one-time exception granted for this task only. It allowed editing `.gitignore`, rewriting git history, making the two copies of `.vscode/sftp.json` (a file backup and the mirror clone), reading the password once for the history check, editing `CLAUDE.md` and `progress.md`, and force-pushing after Jonathan's confirmation. The "Current phase" section is unchanged.

**Done**
- `.vscode/sftp.json` is untracked (listed in `.gitignore`) and removed from all git history with git-filter-repo. All commit hashes changed.
- Verified no revision of the rewritten history contains the file or its password.
- `CLAUDE.md` file-map row for `.vscode/sftp.json` updated.
- Force-pushed to origin (all branches and tags) after Jonathan's confirmation.

**Follow-ups for Jonathan**
- Delete the mirror backup (`../firstascent-backup.git`) and the file backup (`../sftp.json.backup`) once the push is verified. The mirror still holds the old history.
- Re-clone, don't pull, on any other machine with a clone.
- Check that the Claude.ai project's GitHub sync shows the new history.
- Consider asking GitHub Support to purge cached views of the old commits.

**Next**
1. Switch Studio SFTP to SSH key auth.
2. Freeze investigation (review first, writing `FREEZE_INVESTIGATION.md`).

## 2026-10-12

**Done**
- Docs reorganized into `misc/docs/` (`RULES.md`, `TODO.md`, `DECISIONS.md`, `bga/current/`, `bga/legacy/`).
- `TODO.md` restructured.
- Markdown escapes fixed in `DECISIONS.md` and `TODO.md` (own commit); stray paste artifact removed from `TODO.md`.
- `CLAUDE.md` and `PROCEDURES.md` created.
- Guide Mode decision (not implemented) recorded in `DECISIONS.md`.
- `modules/utils.php` vs `modules/Utils.php` casing mismatch added to `TODO.md`.

**Phase-rule exceptions:** none.

**Next**
1. Remove `.vscode/sftp.json` from git and from git history (separate task, with a one-time exception to the phase rule; ends with a push).
2. Switch Studio SFTP to SSH key auth.
3. Freeze investigation (review first, writing `FREEZE_INVESTIGATION.md`).
