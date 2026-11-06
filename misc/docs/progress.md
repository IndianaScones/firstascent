# Progress log

Running log of what was done each session and what's next. Newest entry first. See `PROCEDURES.md`.

## 2026-11-05 (the replay fix, F13: in progress)

An updated "in progress" entry for the replay fix. It replaces the entry of 2026-11-04 (committed as `c3cb6cd`) and keeps everything in it that is still true. Since that entry, Jonathan played playtest list v2 on Studio (trial 1, table 998675), and F13 didn't pass: one replay stopped at a new error. A second session investigated it (stop A2) and applied a second change (stop B2). Both changes are in the working tree, and neither is committed. Next is Jonathan's retest with playtest list v3; after it, a new session makes the `fix:` commit and the closing docs. This entry is session 2's in-progress `docs:` commit (its prompt's §8), separate from the closing `docs:` commit.

**The two sessions.** Times are Jonathan's local time (CST), converted from the transcripts' UTC timestamps.
- **Session 1** started 2026-11-03 at 21:51 with the prompt "First Ascent: the replay fix (one-time exception; its own fix: commit, for F13)" (transcript `f45ad816-…`). It is the replay fix decided in P1.2's closing docs: its own `fix:` commit, after `46b6d81` and before P1.3. It isn't a step of `MIGRATION_PLAN.md`.
- **Session 2** started 2026-11-05 at 15:16 with the prompt "First Ascent: the replay fix (F13), session 2" (transcript `0b71df26-…`). It continues the fix under the same exception, extended by its prompt's §2 (quoted under "Go-aheads").

**Line numbers** in `firstascent.js` and `modules/utils.js` come in three states:
- **HEAD:** `46b6d81` (`c3cb6cd` has the same code files). Session 1's sections use these unless marked otherwise.
- **After the first change:** the state session 1 left (`replay-fix.diff`), marked "after the fix" in session 1's sections. Playtest list v2, trial 1's consoles and stop A2 use these.
- **Now:** after both changes. Stop B2, playtest list v3 and the second change's section use these.

"Complete line shifts" below converts HEAD to now. From "after the first change" to now: `firstascent.js` lines after old 10671 move +5, and `modules/utils.js` lines after old 1770 move +4. Other files' line numbers are unchanged.

**Model:**
- **Session 1:** Opus 5.5, at the Extra effort level (Jonathan's answer to my question: "Opus 5.5, Extra"). My own context names the model Opus 5.5 (`claude-opus-5-5`), which agrees.
- **Session 2:** Opus 5.5, at the Extra effort level (Jonathan's answer to my question: "Opus 5.5, Extra effort"). My own context names the model Opus 5.5 (`claude-opus-5-5`), which agrees.

**Phase-rule exception:** one-time exception granted for this task only (Jonathan's decision of 2026-11-03). As granted, it allowed:
- after his go-ahead at stop A, editing `firstascent.js` and `modules/utils.js`, only for the changes in the revised proposal he approves;
- editing `progress.md`, `TODO.md` and `MIGRATION_PLAN.md` as session 1's prompt describes (its §6 and §8);
- writing diffs and scratch copies outside the repo, in `D:\Documents\BGA Studio\`;
- one `fix:` commit (referencing F13) and one `docs:` commit, each after his approval; a normal push after his approval.

Nothing else: no other code file, no new debug function, no deploy (Jonathan deploys to Studio). Nothing goes to the BGA Production site: production keeps the legacy build until P7.4, with no hotfix. Jonathan's reason, in his words: "Garrett and I do not tend to replay games". The session prompt's "we don't review alpha games by replay" said more than he did (his note, item 6 of his stop A reply).

Jonathan extended it at stop A (item 5 of his reply): `misc/docs/DECISIONS.md`, for one entry recording decisions 2 and 3 of the prompt's §4, with their reasoning. I propose the wording at the docs stop. Decisions 1, 4, 5 and 6 go in `progress.md` only.

Session 2's prompt extended it (its §2, quoted under "Go-aheads"):
- stop A2, a read-only investigation, then a revised proposal as a new diff;
- after the design discussion's review and his "apply", editing `firstascent.js` and `modules/utils.js`, only for the changes in the proposal he approves;
- one in-progress `docs:` commit of `progress.md` (this entry) after his "commit docs", and a normal push after his "push";
- not in session 2: the `fix:` commit and the closing docs. They come after the retest, in a new session.

Jonathan extended it again in his stop B2 reply: `misc/docs/UX_CHANGES.md`, for one entry in the closing docs (see "Closing docs: what's left").

Everything else still holds: no other code file, no new debug function, no deploy (Jonathan deploys to Studio), nothing to the BGA Production site. The 2026-11-04 entry was committed under session 1's rollover rule as `c3cb6cd`, apart from the closing `docs:` commit. The "Current phase" section of `PROCEDURES.md` is unchanged.

**State at this checkpoint**
- **HEAD:** `c3cb6cd` ("docs: the replay fix (F13) in progress (fix applied, not committed; rollover checkpoint)"), on `46b6d81`, level with `origin/main`. After `git fetch origin` on 2026-11-05, `git rev-list --left-right --count origin/main...HEAD` gave `0 0`. Nothing was committed or pushed in session 2 before this entry.
- **Staged:** nothing.
- **Unstaged:**
  - `firstascent.js` and `modules/utils.js`: both changes. Their working-tree diff is byte-identical to `replay-fix-2.diff` (`cmp`, 2026-11-06). They go in the `fix:` commit, after the retest and Jonathan's go-ahead, staged by explicit path (his decision C, session 2's §4).
  - `misc/docs/progress.md`: this entry. It is committed as a `docs:` commit after his "commit docs", staging only this file; the two code files stay out of that commit. After that commit, HEAD is that commit on `c3cb6cd`, and only the two code files show as modified.
- **Byte counts** (working copies; the first change's counts in brackets):
  - `firstascent.js`: 744,236 bytes, CRLF 13,567 (743,782 and 13,562; 742,886 and 13,555 at HEAD).
  - `modules/utils.js`: 229,085 bytes, CRLF 4,986 (228,622 and 4,982; 226,854 and 4,954 at HEAD).
  - Neither file has a bare LF or a bare CR, and neither ends with a newline (as at HEAD). `git ls-files --eol` shows `i/lf w/crlf` for both.
  - These match the design discussion's prediction (Jonathan's stop A2 reply).
- **Studio** (as far as I know; I can't see it): trial 1 ran the first change (sizes on Studio 743,782 and 228,622 bytes [S]). In his stop B2 reply, Jonathan said he'll deploy both files and play from v3 with his corrections. No v3 result had been reported when this entry was written.

**Status of each item**

Session 1 (2026-11-03 and 2026-11-04):
- **Start check (§1): done on 2026-11-03. Every result matched.**
  - `git fetch origin` brought nothing new. HEAD was `46b6d81`, the left-right count was `0 0`, and the tree was clean.
  - `git log --oneline bc4a9c9..HEAD -- firstascent.js modules/utils.js` printed nothing (`bc4a9c9` is `legacy-final`).
  - The working copies were 742,886 and 226,854 bytes, CRLF throughout (13,555 CR against 13,555 LF, and 4,954 against 4,954), with no final newline.
  - `replay-fix-proposal.diff` (v1): 63 lines, 3,762 bytes, no CR, `firstascent.js | 18` (9 insertions, 9 deletions). `git apply --check --cached` passed.
  - node isn't installed. PHP 8.4, Perl and Python (the `py` launcher, 3.13) are.
- **Stop A (§5): delivered 2026-11-03 at 22:23 and reviewed** in Jonathan's reply of 23:07 (quoted in full under "Go-aheads"). The findings are under "Findings (stop A)".
- **The revised proposal: approved with one comment change** (item 1 of his reply). `replay-fix-proposal-v2.diff` is 155 lines and 9,320 bytes, LF only. Its stat is `firstascent.js | 35` (21 insertions, 14 deletions) and `modules/utils.js | 28` (28 insertions). `git apply --check --cached` passed.
- **The fix: applied 2026-11-03 at 23:09, not committed.**
  - **How it was applied:** by an exact-match script (`replay_fix_edits_approved.php`: v2's script with the approved comment), keeping each file's CRLF. Every edit matched exactly once: 2 in `modules/utils.js`, 10 in `firstascent.js`.
  - **`replay-fix.diff`:** 155 lines, 9,320 bytes, LF, with v2's `--stat`. A plain diff against v2 differs only on two lines:
    - line 140, the approved comment ("finds an element missing");
    - line 111, the `modules/utils.js` index line (`a97e5e7..e5d43a5` becomes `a97e5e7..c5b4077`). That is the post-image hash, so it follows from the comment.

    `firstascent.js`'s index line is identical (`5dc9ec8..984e873`).
  - **The changes:**
    - Two helpers in `modules/utils.js`, after `shouldAnimate`:
      - `warnMissingElement(where, what, outcome)` writes `console.warn` with `[FA missing element] <where> | no <what> | <outcome>`. The pipes follow `[FA animation fallback]` (`utils.js:287`). Console only: players see nothing.
      - `queryOrWarn(selector, where)` returns the first match, or `null` after a warning; the caller then skips that step.
    - v1's nine lines become `queryOrWarn(...)?.` calls:
      - `notif_confirmCharacter` 7579 (`.character_placeholder`);
      - `notif_riskShowAssets` 8451–8452, `notif_riskReturnAssets` 8572, `notif_confirmYourRequirements` 8954–8955 and `notif_confirmAddTokenToPitch` 10649–10650 (`.selected_pitch`). The two-line sites read it once;
      - `notif_bomberAnchorCleanup` 12985 (`#bomber_anchor_counter`).
    - **The board:** in `notif_confirmCharacter`'s active branch, after 7586, the board is created if `#asset_board_<player_id>` is missing (warning: "board created"). Lines 7604–7606 are deleted.
    - **Rerack:** `notif_confirmRerackPrivate` warns when `#discard_box` is missing ("cards placed without animation") and animates only when it exists (`shouldAnimate() && discard_box`). 12875 becomes `$('discard_box')?.remove()`.
    - **The log hook:** in `addTooltipsToLog`, a `pitch_tt` item whose `.p<type>` isn't on the page is left unmarked (no `tt_processed`) and skipped, so a later sweep completes its tooltip. A `tt_deferred` class keeps the warning to one per item. The warning names the item's id, the pitch type and its container (the nearest ancestor with an id).
  - **Live play where the element exists:**
    - Nothing changes, except the deletion of 7604–7606. Today a tab hidden between the click and the notification gets a duplicate board with the same id; with the fix it gets one board. Jonathan approved this change (item 2 of his stop A reply).
    - A visible tab is unchanged. The log hook never fires in live play (see "The log path").
  - **The messages:**
    - `notif_confirmCharacter | no .character_placeholder | step skipped`;
    - `notif_confirmCharacter | no #asset_board_<id> | board created`;
    - `<handler> | no .selected_pitch | step skipped`, for the four `.selected_pitch` sites;
    - `notif_bomberAnchorCleanup | no #bomber_anchor_counter | step skipped`;
    - `notif_confirmRerackPrivate | no #discard_box | cards placed without animation`;
    - `addTooltipsToLog | no .p<type> for <n>_item_tooltip_<type> (in <container>) | tooltip deferred`.
  - **The line shifts of the first change** were recorded in the 2026-11-04 entry (`c3cb6cd`), with three ranges left out. "Complete line shifts" below replaces that list.
- **The syntax check: not run in session 1** (node isn't installed here). Recorded at Jonathan's level:
  - At stop A: "The design discussion ran node --check (node v22) on its own copies of both files (my working copies, uploaded on 2026-11-03) with v2 applied: both parse."
  - At stop B: the design discussion applied `replay-fix.diff` to its copies of his working copies. The result gave the blob hashes in its index lines (984e873, c5b4077), and the patched files parse with node --check (node v22).

  There was no browser parse.
- **Stop B (§6): delivered 2026-11-03 at 23:10 and reviewed** in Jonathan's reply of 2026-11-04 at 00:22 (quoted in full under "Go-aheads"). Stop B gave the fix, the diff and playtest list v2. His reply raised two points on the list:
  - his question, answered below;
  - a correction, made in the list recorded here.

Trial 1 (Jonathan's, between the sessions):
- **Deploy and playtest v2: done on table 998675.** Jonathan's results are under "Trial 1". **F13 didn't pass:** IndianaScones0's replay stopped at a new error, and both replays showed `[FA animation fallback]` warnings.
- **The count query (1b):** Jonathan's result, in his words: "1b - as expected" (expected n = 124).

Session 2 (2026-11-05 and 2026-11-06):
- **Start check (§5): done on 2026-11-05. Every result matched.** The details are under "Findings (stop A2)".
- **Stop A2 (§6): delivered 2026-11-05 at 15:48 and reviewed** in Jonathan's reply of 2026-11-06 at 11:14 (quoted in full under "Go-aheads").
- **The second proposal: approved as it is**, with his decisions 1–5, on one condition, which stop B2 answered before applying anything. `replay-fix-2-proposal.diff`: 31 lines, 1,844 bytes, LF only, `firstascent.js | 5` and `modules/utils.js | 4` (9 insertions).
- **The second change: applied 2026-11-06 at 11:16, not committed.** See "The second change".
- **Stop B2 (§7): delivered 2026-11-06 at 11:20 and reviewed** in his reply of 12:38 (quoted in full under "Go-aheads"). He accepted the condition's answers and playtest list v3, with three corrections, made in the list below.
- **The syntax check: not run in session 2** (node isn't installed here). Recorded at Jonathan's level, from his stop A2 reply: "Both patched files parse with node --check (node v22)", on the design discussion's copy of `b\`. There was no browser parse.
- **The retest (v3): Jonathan's.** No result had been reported when this entry was written.
- **The `fix:` commit: not made.** One `fix:` commit for both changes, after the revised fix passes (his decision C), in a new session.
- **The closing docs: not started.** A new session, after the retest. See "Closing docs: what's left".

**His question at stop B, and my answer**
- **His question:** "1n says 'Ask me before you start'. What should I ask you before the replays, and why?"
- **My answer:** nothing. It was a wording error of mine in v2.
  - The prompt's §7 says "Ask me for the console from its beginning" (that is, I ask him for it). v1's 1n turned that into "I'll ask you for the console from its beginning".
  - When I rewrote 1n for v2, "Ask me before you start" came in with no step behind it.
  - The intended text is "Send me the console from its beginning". The list below is corrected.

**Corrections to the P1.2 entry** (recorded here; the P1.2 entry isn't edited)
- **Decision 6:** the P1.2 entry's "Cost of each trial" line says "guard all five places"; there are six (its "In short" lists them).
- **The Replay doc citation:** the P1.2 entry cites "[D] Replay doc:11" for "All notifications sent to the browser are added to the archive". That sentence is at line 10 of `misc/docs/bga/current/guides/Game replay - Board Game Arena.md`.

**Findings (stop A), with their classification**
- **§3.2, the production replay: checked against the code.**
  - **The stack:** `utils.js:1268:64` is the `.` before `id` in ``document.querySelector(`.p${pitch_type}`).id``, and `1258:40` is the `forEach`. The file hasn't changed since `legacy-final`, so production had the same columns.
  - **The `firstascent.js:1:36620` frame** is the `addToLog` hook (js:1692–1694): the frame above it is dojo's `addToLog` wrapper, which only the `dojo.connect` at 1692 installs. The other callers of `addTooltipsToLog` call it directly: `notif_preGameEnd` (js:13551) and `utils.js:2654`.
  - **The sweep:**
    - It covers the whole document (1257). Pitch items come from `logInject` (1295; the pitch case is 1319–1335, `getTooltipForLog` 1009–1017), which `format_string_recursive` calls (js:1791, 1831). `logInject` converts only the first pitch in a log string (1303, 1319–1334).
    - Each item is marked `tt_processed` (1260) before the lookup that throws (1268). So each missing item throws exactly once, and the throw ends that sweep's `forEach`.
    - In the production game, the first 7 log lines of the replay would each throw once, and the first sweep handled 13 items before its throw. If the framework adds the log line before calling the handler, those 7 notifications lose their handler. The first of them is a `confirmCharacter`.
  - **Pitches 27, 39, 40 and 41:** `material.inc.php` has no Headwall flag; the hex a pitch lands on decides it. Headwall hexes are ≥22 on the desert board and ≥28 on the forest board (js:12506, `Game.php:642–643`).
    - Pitches 39–41 are value 5. Value-5 pitches (types 38–43) go only on desert hexes 22, 24, 26, 31 and 32, and on forest hexes 29, 31, 33 and 41–43 (`Game.php:409, 423`). All of these are Headwall hexes, so 39–41 are Headwall pitches in every game.
    - Pitch 27 is value 3. Value-3 pitches go on desert hexes 17, 20, 23 and 25 (`Game.php:407`), and only 23 and 25 are Headwall. That production game had 2 players, so it used the desert board (Jonathan, 2026-11-04; `Game.php:158`). Pitch 27 wasn't on the board when the replay started, so in that game it was on 23 or 25, a Headwall pitch. In another game it can be a third-row pitch.
  - **Why no `.p<type>` exists before the reveal:** face-down Headwall pitches carry the classes `p44`–`p48` (`view.php:60, 86–95`). The real pitches are built by `notif_revealHeadwall` (12507–12525, placed at 12562 or 12578).
  - **The call paths differ** (recorded as observed; what it means isn't known):
    - Studio (3g): `dispatchNotification ← sendNextArchive ← onArchiveNext`.
    - Production: `dispatchNotification ← dispatchNotifications ← processSynchronizedMoveNotifications ← flushMoveBuffer ← pushToSyncBuffer`.
  - **`confirmCharacter`** is synchronous (7232), and its releases are at 7600 and 7610.
  - **Personal objectives:**
    - `dealPersonalObjectives` is sent privately (`Game.php:952`).
    - The public `dealOpponentObjectives` (949) is ignored on the picker's own client (js:7237).
    - So if the seat that picked first sees its own objectives dealt face up in a replay, the archive holds that seat's private notifications. This is an observation step of the trial.
- **§3.3, the design discussion's reading: confirmed, with the following.**
  - **a) The board:** confirmed.
    - The click creates it (3053–3082). The else branch at 7589 creates opponents' boards; the animated branch creates none; the non-animated branch does (7604–7606).
    - `matchBoardAssets` dereferences the board at 3661→3667 and 3794→3801, and is called from 17 lines.
    - All three board templates use `id="asset_board_${player}"` (tpl:185, 232, 272).
    - **Disagreement on the predicted failure:** `matchBoardAssets` is async and is awaited inside `new Promise(async (resolve) => …)` (8960, 8990). So the throw at 3667 prints `Uncaught (in promise) TypeError`, and `resolve` (8995) never runs. The queue hangs and the error is visible: the "Loud" class, not a silent hang.
    - `riskReturnAssets` 8573–8574 also dereferences the board.
    - With the board created in the active branch, the existence test proposed for 7605 would always be false, so the fix deletes 7604–7606 instead.
  - **b) Which branch a replay takes:** confirmed (`utils.js:1291–1293`; Game.js doc:2122–2124, doc:573, doc:1213).
  - **c) Display only:** confirmed (4146, 4150–4154, resolving at 4186; the Trifecta text at 8937 and 8791, filled only at `utils.js:1935`).
    - `TODO.md:40` already records the Trifecta "undefined" in live play, on an opponent's client, so it isn't replay-only.
    - `notif_discardJesusPiece` (13073) relies on the discard of used tokens in the same way.
  - **d) Throws if private notifications aren't archived:** confirmed, and the survey found more of that kind (below).
  - **e) Live play:** confirmed. A second window of the same player also lacks the board and `#discard_box`. The Bomber Anchor counter is created only at 5673–5681, and its only other read is guarded (6304–6305). I found no F5 path to 12985 without it.
  - **f) The 8448 hunk:** confirmed (8450–8461 has no else branch).
  - **g) The P1.2 survey's gaps:** agreed. This survey covered both kinds.
- **The survey: how I looked.**
  - I read all 67 handlers. A script listed the 41 branches that depend on the viewer, and I read each pair.
  - A static scan looked for classes, ids and properties that only click paths create and that notification paths read, following the 67 `utils.js` helpers the handlers can reach.
  - I also checked all 49 element creations inside click handlers for reads in the handlers.
  - The scan is regex-based (it missed `trifecta_selections`, because `setup` binds that click), so I read every hit by hand.
- **Throws, fixed in the fix:**
  - the six v1 sites (nine lines);
  - the board in `notif_confirmCharacter` (new);
  - `notif_confirmRerackPrivate` (new). `#discard_box` and its cards exist only from the click (`onConfirmSummitBetaRerack` 5378–5383). The animated branch throws at 12785 (the card is null) and 12817; the other branch throws at 12875;
  - the log hook `utils.js:1268` (new; decision 3).
- **Not guarded; these depend on whether the viewer's private notifications are archived.** They read the viewer's own hand cards and tokens:
  - `notif_riskShowAssets` 8478–8479;
  - `notif_bomberAnchorCleanup` 12996–12997;
  - `notif_confirmRerackPrivate` 12877–12878;
  - `notif_confirmEnergyDrink` 12915–12916;
  - `notif_useSpiderStick` 13177–13179 and 13218;
  - `notif_matchingTechniques` 11896–11899, 11948, 12123–12124 and 12137–12138;
  - Simul Climb, 8407–8409;
  - the hand cards in `notif_confirmAssetsForDiscardPrivate`.

  If the archive holds those notifications, these elements exist. If it doesn't, far more fails than these lines. Jonathan approved leaving them unguarded (item 3 of his reply).
- **Display only (for `TODO.md`):**
  - used Summit Beta tokens stay in hand in a replay (`discardPlayedSummitBetaTokens`, `utils.js:4144–4187`, and `notif_discardJesusPiece` 13073);
  - the Trifecta drawer text (8791, 8937), already `TODO.md:40` for live play.
- **No problem:**
  - the branches that only bind clicks: `notif_drawClimbingCard` 9145–9185, `notif_confirmCrimperClimbingCard` 13307–13355 and `notif_summitBetaChoices` 11604–11667;
  - the guarded or loop-only reads of `.selected_resource(_wrap)`, `.draw_num`, `.selected_choice`, `#sb_skills_wrapper`, `#draw_num` and `.disable_for_risk_resolution`;
  - `played_asset`: `matchBoardAssets` adds it to every card it places (`utils.js:3677`);
  - `#minus_one` and `#plus_one` (8108–8109): they are created in the same block as the class that gates their removal (1880–1889, 5534–5542);
  - `onUndoSummitBeta`, which handlers call: its reads are guarded (6299, 6304). It ends with `restoreServerGameState()` (6327); how that behaves in a replay isn't documented and wasn't checked;
  - `.selected_pitch` in helpers: no helper that reads it is reachable from a handler.
- **The log path:**
  - **Other tooltip types:** the asset, climbing, Summit Beta and objective tooltips read only `gamedatas` (`utils.js:1051–1061, 1130–1159, 1179–1255`). Only the pitch tooltip needs the board.
  - **Live play: no problem.** `revealHeadwall`'s log line has no pitch (`'The Headwall is revealed'`, `UtilTrait.php:706`). The only pitch log items are built at `Game.php:1600` (a climb, logged at 1629 and 1652), 1786 (Risk it, 1797) and 4151 (adding a token, 4162).
    - Each names a pitch the player chose on the board.
    - The add-token picker excludes `p44`–`p48` (js:4946).
    - The reveal happens at the next `stNextClimb` (`Game.php:5738`), before anyone can choose a Headwall pitch.

    So the hook throws only in a replay.
- **Found in passing** (approved for `TODO.md`, item 7 of his reply):
  - **The `getSkillTokens` key bug** (display only, live play too): the hook passes the hex number (`utils.js:1268–1269`), but `pitch_asset_tokens` is keyed by pitch type (`Game.php:4156`; setup passes the type, js:1643). So the log tooltip shows the wrong pitch's tokens.
  - **Implicit globals,** for the item at `TODO.md:87`: `asset_board` (js:7545, 7554, 7566), `new_pitches` (js:12505), `token` (`utils.js:1071`).

**Trial 1 (table 998675): Jonathan's results, at his level**

Recorded as session 2's prompt gives them ("my results, to record at this level"), quoted in full from its §3:

> Two players: IndianaScones0 (2369492) and IndianaScones1 (2369493). The table was created after the deploy.
>
> My report, quoted:
> > Sizes:
> > `firstascent.js` = 743,782 B
> > `utils.js` = 228,622 B
> >
> > typeof gameui.utils.warnMissingElement run in both tabs returned 'function'
> >
> > 1a - completed
> > 1b - as expected
> > 1c - completed
> > 1d - completed, players are IndianaScones0 and IndianaScones1. IndianaScones1 was first to select a character.
> > 1e - completed - after the draw, 4 slab cards ended up in the Spread. The last one drawn was discarded and replaced as expected. No errors or warnings in the console.
> > 1f - completed
> > 1g - completed
> > 1h - completed
> > 1i - completed
> > 1j - completed
> > 1k - completed; climber was not forced to retreat
> > 1l - completed; climber used `forceDie` set to 1 and risked climbing Headwall pitch.
> > 1m - completed; as expected except nowhere in the results does it report that the game was shortened with `debug_endGameSoon`
> > 1n - IndianaScones1's replay was viewed first. Each character and asset board appeared. Hand and personal objectives appeared, and current picker (first or otherwise) sees its own objectives dealt face up. The Headwall pitches' tooltips worked fine after the reveal. One note: Clicking "Next move" with the Portaledge open hides the Portaledge, whereas the replay buttons should be passed as exceptions for the `clickOutside` functionality. IndianaScones0's replay was viewed next. There was an error when placing a Gear Asset Token on a pitch as a result of the non-viewed seat resolving the climbing card "Chopped Bolts". Continuing to click "Next move" did nothing, and I quit this replay here.
>
> On 1m: the list's "The results will say the game was shortened" meant our written results, not the game's results screen. Record that the game was shortened with debug_endGameSoon.
>
> My answers to the design discussion's follow-up questions, each with its question:
> - "Did either live tab show a [FA missing element] warning or an error during 1a–1m?"
>   > No, but I'm quite confident it's because I was looking at top in the console rather than frame.html.
>   The design discussion's note (UNVERIFIED): the typeof check returned 'function' with the console on top, so in live play the game's code ran in top; and as far as it knows, Chrome prints every frame's messages unless the console's "Selected context only" setting is on.
> - "Whose climb drew [Chopped Bolts]?" This answer corrects 1n's "the non-viewed seat":
>   > Chopped Bolts was drawn by IndianaScones0, 2369492. Oddly, it isn't mentioned in the log when I follow the "View game replay" button, before I've chosen which seat to view. There's a text list of log entries and it skips Chopped Bolts being drawn. I've included a picture of that portion of the log. It goes straight from climbing Dinkus Dog to adding the gear token from Chopped Bolts.
> - "Rerun IndianaScones0's replay to the error and copy the full stack. Expand the error with the game's frame selected, and note the URL's player= value."
>   > Having switched to frame.html, I am now seeing warnings crop up during the replay. I've expanded the error and copied/pasted the whole log. I don't see a player= value in the expanded error, but I do see this: @	frame.html?version=2…nts=2369492%3B:1995, which has IndianaScones0's player id after nts=.
>   In the pasted text, the frame URL reads "…&player=2369492&comments=2369492". Seat 1's log reads "player=2369493&comments=2369492". So player= names the replay's seat, and comments= doesn't.
> - "Who made each Risk it, and did 1l's retreat?"
>   > Both Risk it attempts were made by IndianaScones0. No retreat.
> - "1o: I assume it wasn't run."
>   > I did run it, but that was when I unwittingly was set to top and not frame.html, so there were no warnings to confirm in the second open window.
> - "When you saw the Portaledge open during the replay, had you opened it yourself, or did it open on its own?"
>   > When the Portaledge opened during replay, it did so on it's own, as a result of a "Next move". I'm not sure what you mean by "had you opened it yourself", since aside from editing the elements tab in dev tools, I would have no way of opening it myself.
>
> The consoles, in D:\Documents\BGA Studio\replay-trial-1\. Check that they're there; if not, stop and ask.
> - IndianaScones1.log: seat 1's replay, saved from the console (1,171 lines, 48,152 bytes as the design discussion received it).
> - IndianaScones0.log: seat 0's replay, first run (132 lines, 7,802 bytes as received).
> - IndianaScones0-rerun.log: seat 0's rerun with the game's frame selected and the error expanded, saved from my paste.
>
> The new error, from IndianaScones0-rerun.log (line numbers after the fix):
> > utils.js:24 Uncaught (in promise) TypeError: Cannot read properties of null (reading 'parentElement')
> > beforeAnimation @ utils.js:24
> > (anonymous) @ utils.js:230
> > animationPromise @ utils.js:227
> > (anonymous) @ utils.js:2935
> > discardClimbingCard @ utils.js:2930
> > notif_confirmAddTokenToPitch @ firstascent.js:10706
> > await in notif_confirmAddTokenToPitch
> > (then dojo and ly_studio frames, down to onArchiveNext)
> It comes just after "[FA missing element] notif_confirmAddTokenToPitch | no .selected_pitch | step skipped" (queryOrWarn @ utils.js:1319, called from notif_confirmAddTokenToPitch @ firstascent.js:10652). After it, "Next move" did nothing.
>
> The design discussion's reading of the consoles. Check it against the files; don't take it as given.
> - Seat 0's replay, before the error:
>   - four tooltip deferrals (.p26 three times in replaylogs_move_36, .p27 once in replaylogs_move_37);
>   - the placeholder skipped, and "#asset_board_2369492 | board created" at the second pick;
>   - confirmYourRequirements twice, then bomberAnchorCleanup, then confirmAddTokenToPitch;
>   - 6 [FA animation fallback] warnings.
> - Seat 1's replay reached gameEnd:
>   - three deferrals;
>   - the placeholder skipped, and "#asset_board_2369493 | board created" at the first pick;
>   - confirmYourRequirements three times;
>   - confirmRerackPrivate;
>   - 18 [FA animation fallback] warnings;
>   - no error from the game's code. The other errors are browser messages (Permissions-Policy, a blocked browser-update.org script, the iframe sandbox note).
> - All 24 fallback warnings are on #portaledge or cards inside it, titled "Drawing Asset/s from the Portaledge". They fire in resting and selectPortaledge, and in seat 0's replay also in climbOrRest during Bomber Anchor's draw. None hung.
> - Card 2 (Chopped Bolts): in both consoles, the state goes from climbOrRest straight to addTokenToPitch, with no climbingCard state.
> - The stack's 8956 (confirmYourRequirements) and 10652 (confirmAddTokenToPitch) match the shifts the first session reported for old 8954–8955 and 10649–10650.
>
> What the trial answered (my observations and that reading):
> - Studio offered a replay from each seat; I viewed both.
> - Each replay created only its own viewer's board, at that viewer's own pick. So the replay didn't treat the viewer as active at the other seat's pick.
> - Private notifications: see my 1n observation. Also, the Rerack guard placed the cards in the holder's seat, and no unguarded hand or token read threw.
> - Coverage: notif_riskShowAssets ran in no replay (both Risk its were IndianaScones0's, and its replay stopped first). notif_riskReturnAssets ran nowhere (no retreat).

**Checked in session 2 against the console files: the design discussion's reading is confirmed.**
- **The files** (in `D:\Documents\BGA Studio\replay-trial-1\`):
  - `IndianaScones1.log`: 48,152 bytes, 1,171 lines.
  - `IndianaScones0.log`: 7,802 bytes, 132 lines.
  - `IndianaScones0-rerun.log`: 9,917 bytes, 191 lines. It has CRLF line endings; the other two use LF.
- **Seat 0's deferrals** are items 128, 129 and 133 (`.p26`, `replaylogs_move_36`) and 134 (`.p27`, `replaylogs_move_37`). **Seat 1's** are 106 and 110 (`.p26`) and 111 (`.p27`).
- **The fallback warnings** add up to 6 (seat 0) + 18 (seat 1) = 24.
- **Card 2** goes from `climbOrRest` straight to `addTokenToPitch` in both consoles (seat 1, lines 343–346; seat 0's rerun).
- **The rerun's stack** matches the code after the first change: utils:24, 227, 230, 2930 and 2935, and js:10706. Now they are utils:24, 227, 230, 2934 and 2939, and js:10711.

**Findings (stop A2), with their classification**

Line numbers in this section are as at stop A2, after the first change: add 5 to `firstascent.js` lines after old 10671, and 4 to `modules/utils.js` lines after old 1770, for today's.

- **The start check (§5): done on 2026-11-05. Every result matched.**
  - `git fetch origin` brought nothing new. HEAD was `c3cb6cd` on `46b6d81`, and the left-right count was `0 0`.
  - Only `firstascent.js` and `modules/utils.js` were modified, both unstaged. Nothing was staged, and there were no untracked files.
  - `git diff -- firstascent.js modules/utils.js` was byte-identical to `replay-fix.diff` (`cmp`).
  - The working copies were 743,782 and 228,622 bytes, with 13,562 and 4,982 CRs, equal to their LF counts. A Perl check found no bare CR or LF, and neither file ended with a newline.
  - The three console files were present (sizes under "Trial 1").
- **1. The new throw.**
  - **The null element** is `ele` in `beforeAnimation` (utils:24, `ele.parentElement`). `discardClimbingCard` (utils:2929–2943) takes `$('climbing_discard_straightened').firstElementChild` (2932) and animates it to `#climbing_discard_90` (2935): the climbing card in play.
  - **What puts the card there in live play.** `notif_drawClimbingCard` places it in `#climbing_slot` on every client (js:9132, 9143). Then:
    - on the adder's client, a click: `onConfirmAssetType` (js:4923–4968) awaits `retractClimbingCard()` at js:4928, which moves the card to `#climbing_discard_straightened` (utils:2898–2928). Only after that does it add the Confirm button that sends the action (js:4964 → `onConfirmAddTokenToPitch`, 4969–4986);
    - on every other client, the notification's own branch: js:10675, `if (notif.args.player_id != this.player_id) { await this.utils.retractClimbingCard(); }`;
    - state entry does nothing here: `onEnteringState('addTokenToPitch')` (js:2256–2266) doesn't retract.
  - **Why the adder's replay lacked it.** In a replay, `this.player_id` is the seat being viewed (`player=2369492` in the frame URL). So js:10675 skipped the retract, the click never ran, and the card was still in `#climbing_slot`. In seat 1's replay (`player=2369493`), js:10675 did the retract.
  - **Cards that share card 2's path:** 2, 6, 36, 41, 50, 54 and 63 (Chopped bolts, Sandbagged, Camera crew, Falcon nest, Pee off the ledge, Bring the wide gear, Rockfall!). They go to `addTokenToPitch` (`Game.php:1755–1757`; for the Cool-Headed Crimper, 5111–5113 and js:13263).
  - **Cards with a `climbingCard` state avoid it.**
    - The choice click doesn't retract (js:4418–4438).
    - The handlers retract on every client whenever the slot holds the card (js:9316, 9335, 9360).
    - The states that follow retract in state entry (js:2097, 2170, 2186, 2269, 2298, 2381). Other handlers retract the same way (js:10462, 10635, 10787, 11365, 11432, 11570).
    - Every `discardClimbingCard` call and every read of `#climbing_discard_straightened` in the handlers (js:7947–13418) is guarded or follows one of those retracts. js:4928 is the only retract a click does.
  - **Classification: the loud class** (an exception before the release), in its `new Promise(async …)` form (`FREEZE_INVESTIGATION.md` Background point 4, second bullet; §6).
    - `animationPromise`'s executor throws at utils:230. The `await` at utils:2935 rejects inside `discardClimbingCard`'s async executor (utils:2930), which prints `Uncaught (in promise)`.
    - The outer promise never settles, so the handler waits at js:10706 forever, and its release (js:10714) never runs. That fits "Next move did nothing" [inferred].
    - The non-animated branch would throw too: `destination.append(null)`, then `climbing_div.classList` (js:10708–10709) [C].
    - Live play has the same throw in a second window of the adder's own player, which didn't click either [C].
- **2. The survey.**
  - **How I looked.**
    - I reran session 1's method lister and viewer-branch scan on the working copies: 146 methods in js, 100 in utils, and 40 viewer-dependent branches in handlers.
    - New, aimed at what was missed before:
      - every DOM move, removal and `style.display` change inside the click handlers (js:2908–7214), found by grep and read by hand;
      - the 39 instance variables the click handlers set, checked for reads in handlers and in `utils.js`. The handlers only push to or clear handler arrays and delete `jesus_piece_requirements`; the `utils.js` reads are in click-path helpers;
      - every climbing-card discard site, traced to where its retract comes from;
      - dereferences of click-made classes in the private handlers and active branches the trial didn't reach.
  - **The sites the first change guards, and whether anything later uses what each skips:**
    - js:7579 `.character_placeholder`: removes the placeholder, which exists only from the click (js:3086). Nothing else reads it.
    - js:7587–7591, the board: creates what `onSelectCharacter` (js:3053–3082) would have. Later steps use it, and it's there: both replays showed the boards.
    - js:8453 `riskShowAssets`: clears and hides `#trifecta_selected_box`, which only `chooseTrifectaOption` fills (utils:1976, a click). In a replay the box is already empty, and js:8919–8926 clears it again on a Trifecta climb.
    - js:8574 `riskReturnAssets`: removes `.selected_pitch`. Its other readers are click handlers or helpers only clicks reach (utils:3949 and 3968 run only from js:3334; utils:4353, 4482 and 4578 from no handler or state entry); js:2464 and utils:4123 are loops.
    - js:8956–8958 `confirmYourRequirements`: removes the pitch's `cursor` and `.selected_pitch`. An unselected pitch keeps `.available_pitch`, so the loop at js:8951–8954 cleans it.
    - js:10652–10654 `confirmAddTokenToPitch`: the same. Here the classes come only from the click (js:4941–4961), and the handler uses `selected_pitch_id` from the notification's args.
    - js:12992 `#bomber_anchor_counter`: removes the counter, which exists only from the click.
    - The Rerack guard, js:12775–12778: skips the animated branch. The other branch builds the same end state from the args, and the discard pile's top is fixed before it (js:12748–12773). Seen in seat 1's replay.
    - The log hook, utils:1264–1273: leaves the item unprocessed. A later sweep adds the tooltip (Jonathan: "The Headwall pitches' tooltips worked fine after the reveal").
  - **Beyond those sites:**
    - **The new throw** (above). It is the only throw or hang the survey found.
    - **Trade, in the trader's own replay** (display only; not in the trial). The click moves the three traded cards to the discard (js:3809–3825) and opens the Portaledge (js:3849–3851). `confirmTradePublic` is ignored on the trader's client (js:7254), and `confirmTradePrivate` (js:8742–8769) moves nothing out of the hand. So the cards stay in that replay's hand: `sanitizeHand` (utils:1409) runs only from a click path (utils:4417). Its draw would fall back with warnings, but nothing throws (`portaledge()` only loops over its controls, utils:3286–3288, 3369–3371, 3383–3385).
    - **Bomber Anchor's Portaledge** in the holder's replay: see B below.
    - **No problem:** `old_board_slot_num` (js:11237) is guarded and never used. The Crimper's handler takes its cards from the args (js:13243–13246).
  - **What this method can miss:**
    - helpers reached from clicks that I didn't read line by line. I read the ones that move elements; the other ~25 I checked only for calls from handlers and state entry;
    - moves done through `innerHTML` rebuilds;
    - counters read as "the last class in classList";
    - timing: the un-awaited async blocks in state entry, against how fast someone steps through a replay;
    - which framework callbacks run in a replay: taken from trial 1's logs, not from the docs.
- **3. A missing-element case in `animationPromise`, against a guard at this site.** Recommendation: the guard at this site, no general fallback. Jonathan's decision 5 (stop A2 reply): no general fallback.
  - It wouldn't fix this site on its own. The check would have to come before `func.before` (utils:230), and even then `discardClimbingCard` goes on to `card_ele.classList` at utils:2936 and hangs the same way.
  - With a second guard there, the replay would keep a wrong board: the card would stay in `#climbing_slot`, the next card drawn would join it, and every later `$('climbing_slot').firstElementChild` would pick the stale one [inferred].
  - In live play, there are about 200 call sites (146 direct calls and 57 `.bind`, by grep). Today a null element there is a bug that stops one client loudly; with the fallback it would become a warning and a board out of step, or the same throw one line later.
  - The migration already plans the principled version: P4's wrapper logs `[FA notif error]` and re-renders from the model (`MIGRATION_PLAN.md` §4.3), and P5.7 removes `discardClimbingCard`'s async executor (§4.3.1).
- **4. B: the Portaledge.**
  - **What opens it:**
    - live and replay: state entry opens it for every viewer in `resting` (js:2056–2059) and `selectPortaledge` (js:2233–2236), and installs the click-outside listener (js:2067–2074, 2244–2251);
    - live only, a click: trade (js:3851) and Bomber Anchor (js:5716–5717);
    - a handler: `portaledge()` when `auto` (utils:3277–3281), `portaledgeOpponent()` when `auto || bomber_anchor` (utils:3428–3431).
  - **What closes it:** the draw helpers, and the click-outside hide branch.
  - **The path when "Next move" is clicked.** The listener is on the game frame's window, in the capture phase (utils:1797–1807). "Next move" is in that frame: its handler runs from `frame.html…:1995` (the rerun's stack), and Jonathan saw the Portaledge hide. The target is outside `[#portaledge, #generalactions]` (utils:1791–1795), so `triggerOutsideClickClose` (1810–1818) runs, then `onShowHidePortaledge`'s hide branch (js:4374–4381): display `''`, `portaledge_open` removed, the red "Show Portaledge" button added, the listener removed.
  - **What else that one listener can close.** There is one listener at a time; each new one replaces the last (utils:1789).
    - In a replay: the climbing card (js:1985, through `#show_hide_card_button`), the Crimper's display (js:2411, 13339), and the ones setup installs (js:1225, 1253, 1448).
    - In live play, also the click-opened ones: js:3031, 3115, 3371, 3861, 4282, 4341, 4372 and 5727, and utils:1866, 1905, 1950 and 2006.
  - **The 24 warnings: 19 explained, 5 not.**
    - **The 19:** every warning in `resting` and `selectPortaledge`, in both seats. State entry opened the Portaledge, the "Next move" click hid it, and that move's draw then ran inside the hidden Portaledge. The viewer's own draw warns on `flip_transform` and `asset_portaledge_to_display` for each card, plus `portaledge_close`. A watcher warns only on `portaledge_close`, because its card backs fly from the hand counter by the offset method (utils:3452–3453) [C].
    - **The 5:** seat 0, `climbOrRest`, Bomber Anchor's draw (cards 139 and 96, plus the close). There only the click opens the Portaledge (js:5716–5717), and `portaledge()` doesn't open it for Bomber Anchor. `portaledgeOpponent` does (utils:3428–3431), which is why seat 1's view of that move has no warning. Nothing was proposed for these five (session 2's §4 B).
- **5. The log line** (for the later `TODO.md` entry; read only).
  - It is built at `Game.php:4162`: `'${player_name} adds a ${asset_type} token to ${pitch_for_log}'`. Its args carry no climbing card.
  - Other cards add their name in `confirmClimbingCardChoice`: it builds `climbing_card_for_log` as a nested log, `'/${climbing_card_name}(${card_type})\'` (`Game.php:2240–2247`), and prefixes the line with it: `'${climbing_card_for_log}: ${player_name} chooses …'` (2250–2259). The client's `logInject` matches it with `climbing_regex` (utils:1326) and turns it into a climbing-card tooltip item.
  - The draw itself logs nothing for any card (`drawClimbingCard`'s message is `''`, `Game.php:1747`). For the add-token cards, the token line is the only one. That is why the replay's log list goes from the climb straight to the token line.

**The second proposal (stop A2) and its review**
- **The files**, in `D:\Documents\BGA Studio\`:
  - `replay-fix-2-work\a\`: the working copies after the first change, LF-normalized (`git hash-object` `984e873…` and `c5b4077…`, the post-image hashes of `replay-fix.diff`).
  - `replay-fix-2-work\b\`: the same with the proposal applied (`aeaf737…` and `8a0a442…`).
  - `replay-fix-2-proposal.diff`: 31 lines, 1,844 bytes, LF only. `--stat`: `firstascent.js | 5 +++++`, `modules/utils.js | 4 ++++`.
- **How it was made:** PHP wrote the LF copies to `a\` and `b\`. `replay_fix_2_edits.php` edited `b\`, each edit required to match exactly once. The diff is two `git diff --no-index --no-prefix` runs from `replay-fix-2-work`, joined. Check: `git apply --check`, then `git apply`, on a scratch copy of `a\`; the result is `cmp`-equal to `b\`.
- **The review:** Jonathan's stop A2 reply (quoted in full under "Go-aheads"). The design discussion checked the diff and `a\`/`b\` as uploaded, and ran `node --check` on `b\`. Jonathan checked the replay test on Studio and the "Next move" button's chain of ids. He approved the proposal as it is, with decisions 1–5, on one condition (answered under "The second change").

**The second change: applied 2026-11-06 at 11:16, not committed**
- **How it was applied:** by `replay_fix_2_edits.php` in its `crlf` mode, on the working copies. Each edit matched exactly once (one per file). No other edits.
- **The same as the reviewed proposal:** the working copies, LF-normalized, are `cmp`-equal to `b\`.
- **`replay-fix-2.diff`** (`git diff -- firstascent.js modules/utils.js`, written 2026-11-06): 178 lines, 10,922 bytes, LF only. `--stat`: `firstascent.js | 40`, `modules/utils.js | 32` (58 insertions, 14 deletions). Index lines: `5dc9ec8..aeaf737` and `a97e5e7..8a0a442`. The design discussion reversed it from its copy of `b\` and got the pre-images `5dc9ec8` and `a97e5e7` (Jonathan's stop B2 reply).
- **Change 1: `notif_confirmAddTokenToPitch`** (js:10676–10680 now). After the opponents' retract (js:10675), an `else if ($('climbing_slot').firstElementChild)` branch on the adder's client warns and awaits `retractClimbingCard()` before the token animation, as an opponent's client does.
  - **Warning:** `[FA missing element] notif_confirmAddTokenToPitch | no card in #climbing_discard_straightened | card retracted from #climbing_slot`.
  - **Live play: opponents and spectators are unchanged** (the first branch is untouched).
  - **Live play: the adder's single window is unchanged.** `onConfirmAssetType` awaits the retract (js:4928) before it adds the Confirm button that sends the action (js:4964, 4969–4986). An F5 puts the card back in the slot (js:1230–1242), but Confirm then goes through `onConfirmAssetType` again.
  - **Live play: a second window of the adder's own player changes.** It retracts the card and warns, instead of stopping with the TypeError. Jonathan approved this change (decision 1 of his stop A2 reply).
- **Change 2: the click-outside listener** (utils:1799–1802 now). In a replay, a click that is outside the popup and `#generalactions` and also outside the game's own area returns early, so the popup stays open.
  - **The replay test:** `(typeof g_archive_mode !== 'undefined' && g_archive_mode) || typeof g_replayFrom !== 'undefined'`.
  - **The game's own area:** `#FirstAscent_table_display` (tpl:14), the root of the game's template. A click inside it, on the popup itself or on `#generalactions` still closes the popup.
  - **Warning: none.** It would fire on every "Next move".
  - **Live play: none, by reading.** `g_archive_mode` is true only after the game ends (`Game.js` doc:2119–2120; live code uses it as a plain boolean, doc:226 and doc:1398). `g_replayFrom` is undefined outside a replay (doc:2116–2117; d.ts:22–24). Not yet checked in a live game; v3 checks it.
  - **The broad version, as proposed:** in a replay, clicks on the log, the player panels and the top bar also leave a popup open (Jonathan's decision 2). It depends on `#FirstAscent_table_display` (tpl:14), which P6 may change when it builds the layout in JS and removes the `.tpl`.
  - **An in-game "replay from this move"** sets `g_replayFrom`, so it gets the same exemption during a live game. Accepted (his decision 3); no step covers it.
  - **Checked on Studio by Jonathan** (stop A2 reply), in table 998675's replay with frame.html selected: the replay test gave `true`; `#FirstAscent_table_display` exists; it doesn't contain the "Next move" button. The button's chain of ids: `IMG | archive_next < archivecontrol_editmode < archivecontrol < current_header_infos_wrap < topbar_content < topbar < overall-content < ebd-body`. My query for "Next move" gave an empty array: it looks only at elements without child elements whose whole text is "Next move".
- **What it leaves:** Bomber Anchor's draw in the holder's own replay and trade in the trader's own replay still warn; the fallback settles them, with no hang. Both are display-only (Jonathan's decision 4).
- **The condition (stop A2 reply), answered at stop B2 and accepted.** Numbers as now.
  - **`#climbing_slot` exists for the whole game**, so change 1's new check can't throw on the adder's client:
    - it comes from the template (tpl:24). Setup moves it into `#titlebar_extras_wrapper` (js:543–544), which setup creates inside `#page-title` (js:157–161);
    - the only code that removes one is setup's cleanup of duplicates (js:534–541, "the extra climbing slot added when undoing a climbing card"). It runs only at setup and keeps the first slot;
    - during a game it is only moved: into `#board` for a card's flight (utils:2834, from js:9140 and 9258) and back (utils:2867, from js:9144 and 9262);
    - nothing rebuilds a parent of the slot. Every `innerHTML = ''` is on `#summit_pile`, `#gameaction_status`, `#pagemaintitletext`, the objective tracker or a discard pile (js:11789; utils:1758, 1761, 2235, 3639, 4741, 4760). Every `replaceChildren` is on `#summit_discard` or a discard pile (js:12273, 12721, 12893, 12942, 12981, 13021, 13072; utils:4206). No `.remove()` targets the slot or `#titlebar_extras_wrapper`, and the slot has no class for a removal by class to reach;
    - so `$('climbing_slot')` is never null, and `.firstElementChild` returns null or the card. When it returns the card, `retractClimbingCard` finds it (utils:2907);
    - what reading can't cover: the framework itself rebuilding `#page-title`. The docs don't describe it. The existing reads at js:4928, 9101 and 10635 would break the same way, and no game has shown it.
    - The design discussion's note (stop B2 reply): change 1's check "is the same read as js:2298, 4928, 9316, 9335, 9360, 10462, 10503 and 10635, which already run in live play."
  - **On the Crimper's path, the slot holds the chosen card on every client:**
    - `notif_crimperDrawsClimbingCards` puts both cards in the Crimper's display, not in the slot (js:9245, 9297);
    - `notif_confirmCrimperClimbingCard` runs on every client. It sends the unchosen card to `#climbing_discard_90` (js:13287 animated, 13351 not) and puts the chosen card in `#climbing_slot` (js:13294 animated, 13353 not);
    - the server then goes to `addTokenToPitch` (`Game.php:5111–5113`). The Crimper's own client follows the same path as any adder: the token-type buttons (js:2685), then `onConfirmAssetType`, which retracts the card (js:4928);
    - in live play the slot is empty when the notification arrives, so the new branch doesn't fire. In the Crimper's own replay, the slot holds the chosen card, so the branch retracts it and warns.
- **What ran and what was only read** (stop B2):
  - ran: the edit script, on `b\` and on the working copies; `git apply --check` and `git apply` on a scratch copy of `a\`, then `cmp` with `b\`; LF-normalizing the working copies, then `cmp` with `b\`; the byte, CR and LF counts (`wc`, `tr`, Perl); `git diff`, `--stat` and `ls-files --eol`;
  - not run: no parse here (no node; the `node --check` result is the design discussion's); no browser run. Both answers to the condition, and every [C] expectation in v3, come from reading the code.

**Complete line shifts against HEAD** (both changes; the docs' citations aren't refreshed). Every changed old line is in an entry, including the three ranges the first list left out (old `firstascent.js` 8954–8955, 10649–10650 and 12771). The design discussion recomputed these from the diff's hunks and found them equal, row by row (Jonathan's stop B2 reply).
- **`firstascent.js`** (13,556 lines at HEAD, 13,568 now):
  - old 1–7578: unchanged;
  - old 7579: replaced in place;
  - old 7580–7586: unchanged;
  - 5 lines added after old 7586 (now 7587–7591): the board;
  - old 7587–7603: +5;
  - old 7604–7606: deleted;
  - old 7607–8450: +2;
  - old 8451–8452: replaced in place (now 8453–8454);
  - old 8453–8571: +2;
  - old 8572: replaced in place (now 8574);
  - old 8573–8953: +2;
  - old 8954–8955: replaced by three lines (now 8956–8958);
  - old 8956–10648: +3;
  - old 10649–10650: replaced by three lines (now 10652–10654);
  - old 10651–10671: +4 (old 10671, the opponents' retract, is now 10675);
  - 5 lines added after old 10671 (now 10676–10680): change 1;
  - old 10672–12770: +9;
  - old 12771 (`if (this.utils.shouldAnimate()) {`): replaced by four lines (now 12780–12783): the F13 comment, the `#discard_box` warning, a blank line, and the changed test;
  - old 12772–12874: +12;
  - old 12875: replaced in place (now 12887);
  - old 12876–12984: +12;
  - old 12985: replaced in place (now 12997);
  - old 12986–13556: +12.
- **`modules/utils.js`** (4,955 lines at HEAD, 4,987 now):
  - old 1–1259: unchanged;
  - 15 lines added after old 1259 (now 1260–1274): the log hook;
  - old 1260–1294: +15;
  - 13 lines added after old 1294 (now 1310–1322): `warnMissingElement` and `queryOrWarn`;
  - old 1295–1770: +28;
  - 4 lines added after old 1770 (now 1799–1802): change 2;
  - old 1771–4955: +32 (for example `matchBoardAssets` 3621 → 3653).

**Playtest list v2, as issued at stop B, with Jonathan's correction and my wording fix** (both marked "corrected 2026-11-04")

v2 is v1 plus the steps marked "(added)".
- **Tags:** [S] seen on Studio, [D] docs, [C] code reading, "(seen on production)" seen on the BGA Production site.
- **Line numbers:** `firstascent.js` and `modules/utils.js` as after the fix; other files unchanged.

**Table 1 (F13).** 2 players (the desert board, `Game.php:158`), one tab each, express start, created after the deploy. It is played to its end, but shortened with `debug_endGameSoon` (1m).

- **Before 1a (added).** Deploy `firstascent.js` and `modules/utils.js` to Studio, and check their sizes there against the working copies: 743,782 and 228,622 bytes (CRLF).
  - If the upload converted line endings, they would be 730,220 and 223,640 bytes (LF). I computed those; they aren't observed.
  - After the F5 in 1a, run `typeof gameui.utils.warnMissingElement` in each tab's console. Expected: `"function"` [C].
  - If the console says `gameui` isn't defined, pick the game's frame in the console's context dropdown. A replay needed that (seen on production); for a live Studio table it isn't known.
- **1a.** Press F5 in every open table tab, then create Table 1.
  - Open the console in both tabs and keep both tabs open to the end. Express-start tables are abandoned when no client stays on the page [S].
  - Expected throughout the live game: no `[FA missing element]` warning and no new console error [C].
- **1b.** Run the count query in "Go to game database" → SQL: `SELECT COUNT(*) AS n FROM cards_and_tokens WHERE card_type='asset';`
  - Expected: n = 124 [C: the sum of `number_in_deck` over the 37 asset types, `Game.php:324–332`].
  - It runs early because whether a finished table's database stays reachable isn't known.
- **1c.** In character selection, before any pick: `stackClimbingDeck` with "39,26,2", then `stackSummitBeta` with "9,1". The first item listed ends on top, and each call reloads the page [C].
  - Both calls only reorder hidden piles. The cards and tokens then arrive through game notifications, which the replay replays [C].
  - Don't use debug functions that change what's on screen without a notification: `giveAssets`, `giveSummitBeta`, `discardSummitBeta`, `setAvailableCharacters`, `setSharedObjectives`, `redrawStartingSpread`. The replay wouldn't see the change [C, inference].
- **1d.** The character picks. Avoid Phil and the Cool-headed Crimper [C]:
  - Phil draws two Summit Beta tokens when selection ends (`Game.php:5484–5506`) and would take the stacked ones.
  - The Crimper draws two climbing cards per climb.

  Record which seat picked first. Expected live: as usual, with no warning [C].
- **1e.** Round 1: Rack Up as usual.
- **1f.** Round 1, Climb Phase.
  - The first climber climbs a plain pitch. Climbing card 39 comes up; choose option a (lose 1 Water, draw 1 Summit Beta token). That player gains Bomber Anchor [C: `Game.php:2173–2180`].
  - The other player rests. That is F13's rest.
- **1g.** The Follow Phase and the Rerack Phase as usual.
- **1h.** Round 2: on the holder's turn, use Bomber Anchor.
  - Discard 2 hand cards, choose 2 from the Portaledge, then Confirm. It worked in Rack Up on 2026-10-15 [S]; it is an any-time token [C: `utils.js:3936–3941`].
  - The 2 discards also stock the asset discard pile for 1j [C].
- **1i.** Round 2, Climb Phase: both players climb [C: `Game.php:1755–1757`].
  - The game's second climb draws card 26; option a gives Rerack.
  - The third climb draws card 2; add a Gear token to a pitch.
- **1j.** The Rerack holder uses Rerack and takes 2 cards from the discard pile [C: js:5371–5383].
- **1k.** After 1j, so that no one holds Rerack: a Risk it, after `forceDie` with 3.
  - With Rerack, Energy Drink, Simul Climb or Lucky Chalkbag in hand, a bad roll goes to `riskSummitBeta` instead (`Game.php:1883, 1916`) [C].
  - It retreats only if the risker has no available card, or not enough Psych beyond the pitch's requirement (`Game.php:1925, 1933–1939`). Otherwise it goes to `selectOpponent` [C].
  - Record whether it retreated.
- **1l.** The Headwall.
  - A player climbs into the third row (desert hexes 16–21, `UtilTrait.php:696`). "The Headwall is revealed" appears in the log after that climb [C].
  - Then that player climbs a Headwall pitch. That climb's log names a pitch that the replay's board doesn't hold at its start [C].
  - At the earliest, that is the player's 3rd and 4th climbs, in rounds 3 and 4. `stackAssetDeck` can supply the cards they need [C].
- **1m.** The end: `endGameSoon` for a player with at least 2 climbed pitches. With exactly one climbed pitch you get the warning seen in P1.2's 3d [S].
  - That player's next climb ends the game: the Climb and Follow Phases complete, there's no Rerack, then final scoring, and the table ends [S P1.2].
  - The results will say the game was shortened with `debug_endGameSoon`.
  - The replay's Rope counter may differ until the next climb. Record it; it's display only [C].
- **1n.** The replays. Step with "Next move" from the start to the end, from each seat Studio offers. Send me the console from its beginning. *(Corrected 2026-11-04, my wording fix: v2 as issued said "Ask me before you start, and send me the console from its beginning". Nothing is to be asked before the replays; see "His question at stop B".)*
  - **(added)** If Studio doesn't offer a replay from each seat, record which seats it offers and replay from those.
  - For console queries, pick the game's frame in the console's context dropdown; the top frame shows nothing (seen on production).
  - **Expected (F13):** the replay runs to the end, through the rest, with no `[FA animation fallback]` warning and no new console error. This is the check, so it isn't [S] for this build.
  - **Guard warnings** to record, not failures [C]:
    - `[FA missing element] notif_confirmCharacter | no .character_placeholder | step skipped`, and `… | no #asset_board_<id> | board created`, at each pick where the replay treats the viewer as active. In P1.2's 3g, the same missing placeholder made the TypeError at 7579 (before the fix) [S]; this warning didn't exist then. *(Corrected 2026-11-04, Jonathan's correction: v2 as issued said "3g showed this at one pick [S]".)*
    - **(added)** The board warning names `#asset_board_<id>`. If the id is the other seat's player, the replay treated the viewer as active at the other seat's pick. Record whose id each such warning names.
    - `notif_confirmYourRequirements | no .selected_pitch | step skipped`, at the viewer's climbs.
    - `notif_confirmAddTokenToPitch | no .selected_pitch | step skipped`, in the seat that added the token.
    - `notif_bomberAnchorCleanup | no #bomber_anchor_counter | step skipped`, in the holder's seat.
    - `notif_confirmRerackPrivate | no #discard_box | cards placed without animation`, in the holder's seat.
    - `notif_riskShowAssets | no .selected_pitch | step skipped` on any Risk it, and `notif_riskReturnAssets | no .selected_pitch | step skipped` on a retreat, in the risker's seat.
    - Near the start, once per log item that names a pitch not yet on the board: `addTooltipsToLog | no .p<type> for <n>_item_tooltip_<type> (in <container>) | tooltip deferred`. The production game had 7 such items (seen on production).
  - **Observations:**
    - whether each character and each asset board appears;
    - which seat picked first, and whose perspective the replay shows;
    - whether the viewer's hand and personal objectives appear, and whether the first picker sees its own objectives dealt face up. If so, its private notifications are in the archive (`Game.php:952`).
    - after the reveal, whether hovering a Headwall pitch name in the log shows its tooltip [C];
    - display divergences: used Summit Beta tokens staying in hand (`utils.js:4172–4215`), the reracked cards appearing without the flight, the Trifecta text, the Rope counter after 1m.
- **1o** (optional, your call). During the live game, open a second visible window of one player, if Studio allows it (unknown).
  - Expected [C]: that window shows the 1n warnings for its own player's actions, and no TypeError.

**Coverage** *(added 2026-11-04, not part of v2 as issued)*:
- No step runs the live-play case of the 7604–7606 deletion (a tab hidden between the click and the notification). Its evidence is the code reading, on which the design discussion and I agree. Jonathan's decision: no step for it.
- `notif_riskReturnAssets`'s guard runs only if 1k retreats.

The final entry must not call those parts playtested.

v2 is superseded by v3, below. Trial 1 played v2.

**Playtest list v3, as issued at stop B2, with Jonathan's three corrections** (each marked "corrected 2026-11-06")

v3 is v2 with its two 2026-11-04 corrections applied in place, plus the steps marked "(added)". v2's own "(added)" marks are dropped.
- **Tags:** [S] seen on Studio, [D] docs, [C] code reading, "(seen on production)" seen on the BGA Production site. "Trial 1" is table 998675.
- **Line numbers:** `firstascent.js` and `modules/utils.js` as after both changes (now); other files unchanged.

**Table 1 (F13).** 2 players (the desert board, `Game.php:158`), one tab each, express start, a new table created after the deploy. It is played to its end, but shortened with `debug_endGameSoon` (1m).

- **Before 1a.** Deploy `firstascent.js` and `modules/utils.js` to Studio, and check their sizes there against the working copies: 744,236 and 229,085 bytes (CRLF).
  - If the upload converted line endings, they would be 730,669 and 224,099 bytes (LF). I computed those; they aren't observed.
  - After the F5 in 1a, run `typeof gameui.utils.warnMissingElement` in each tab's console. Expected: `"function"` [C]. In trial 1, both live tabs gave it with the console set to top [S].
  - If the console says `gameui` isn't defined, pick the game's frame in the console's context dropdown. A replay needs that (seen on production; [S] trial 1).
  - **(added)** In each live tab's console, run the replay test: `(typeof g_archive_mode !== 'undefined' && g_archive_mode) || typeof g_replayFrom !== 'undefined'`. Expected: `false` [D: Game.js doc:2116–2120]. If it gives `true`, stop before playing and tell me.
- **1a.** Press F5 in every open table tab, then create Table 1.
  - Open the console in both tabs and keep both tabs open to the end. Express-start tables are abandoned when no client stays on the page [S].
  - **(added)** In each tab, note the console's context dropdown (top or the game's frame) and whether "Selected context only" is on.
  - Expected throughout the live game: no `[FA missing element]` warning and no new console error [C].
- **1b.** Run the count query in "Go to game database" → SQL: `SELECT COUNT(*) AS n FROM cards_and_tokens WHERE card_type='asset';`
  - Expected: n = 124 [C: the sum of `number_in_deck` over the 37 asset types, `Game.php:324–332`].
  - It runs early because whether a finished table's database stays reachable isn't known.
- **1c.** In character selection, before any pick: `stackClimbingDeck` with "39,26,2", then `stackSummitBeta` with "9,1". The first item listed ends on top, and each call reloads the page [C].
  - Both calls only reorder hidden piles. The cards and tokens then arrive through game notifications, which the replay replays [C].
  - Don't use debug functions that change what's on screen without a notification: `giveAssets`, `giveSummitBeta`, `discardSummitBeta`, `setAvailableCharacters`, `setSharedObjectives`, `redrawStartingSpread`. The replay wouldn't see the change [C, inference].
- **1d.** The character picks. Avoid Phil and the Cool-headed Crimper [C]:
  - Phil draws two Summit Beta tokens when selection ends (`Game.php:5484–5506`) and would take the stacked ones.
  - The Crimper draws two climbing cards per climb.

  Record which seat picked first. Expected live: as usual, with no warning [C].
- **1e.** Round 1: Rack Up as usual.
- **1f.** Round 1, Climb Phase.
  - The first climber climbs a plain pitch. Climbing card 39 comes up; choose option a (lose 1 Water, draw 1 Summit Beta token). That player gains Bomber Anchor [C: `Game.php:2173–2180`].
  - The other player rests. That is F13's rest.
- **1g.** The Follow Phase and the Rerack Phase as usual.
  - **(added) Change 2 in live play.** During the rest's `resting` state, in the watcher's tab, click once on the status text in the page title bar, outside the game's area. *(Corrected 2026-11-06, Jonathan's correction 1: v3 as issued said "click once on the board, outside the Portaledge".)*
    - Expected: the Portaledge hides and the red "Show Portaledge" button appears, as before the fix [C: js:4374–4381]. The new early return needs the replay test to be `true` (utils:1799–1802), so live play keeps today's behavior.
    - Bring it back with "Show Portaledge" before the rester confirms. A draw into a hidden Portaledge gives `[FA animation fallback]` warnings, which the fallback settles.
    - *Checked by reading, as Jonathan's correction asks:* the status text (`#pagemaintitletext`) is outside `#FirstAscent_table_display`. The game's template has no such element (its root is tpl:14), and the game never moves `#page-title` or `#pagemaintitletext`; it moves its own elements into `#page-title` (js:157–161, 543–544) [C; the framework's page structure isn't in the docs]. Not settled by reading: whether the status text is inside `#generalactions`, the listener's other target. The game treats them as separate elements (it inserts its own elements right after `#pagemaintitletext`, js:5681, 12000, 13140). If it were inside, the click wouldn't hide the Portaledge, and this step would show it. The step is unchanged.
- **1h.** Round 2: on the holder's turn, use Bomber Anchor.
  - Discard 2 hand cards, choose 2 from the Portaledge, then Confirm. It worked in Rack Up on 2026-10-15 [S]; it is an any-time token [C: `utils.js:3940–3945`].
  - The 2 discards also stock the asset discard pile for 1j [C].
  - **(added)** In the holder's replay, this draw is expected to warn (1n).
- **1i.** Round 2, Climb Phase: both players climb [C: `Game.php:1755–1757`].
  - The game's second climb draws card 26; option a gives Rerack.
  - The third climb draws card 2; add a Gear token.
  - **(added)** Record who adds the token. In that player's live tab, expect no `[FA missing element]` warning at this step [C]: the click retracts the card (js:4928) before the Confirm button exists (js:4964).
- **1j.** The Rerack holder uses Rerack and takes 2 cards from the discard pile [C: js:5371–5383].
- **1k.** After 1j, so that no one holds Rerack: a Risk it, after `forceDie` with 3.
  - With Rerack, Energy Drink, Simul Climb or Lucky Chalkbag in hand, a bad roll goes to `riskSummitBeta` instead (`Game.php:1883, 1916`) [C].
  - It retreats only if the risker has no available card, or not enough Psych beyond the pitch's requirement (`Game.php:1925, 1933–1939`). Otherwise it goes to `selectOpponent` [C].
  - **(added)** Set it up to retreat, so that `notif_riskReturnAssets` runs in a replay:
    - risk it on a pitch whose Psych requirement equals the risker's Psych. With face 3, the risker then lacks the 1 Psych beyond the requirement [C];
    - available cards are the hand plus the Asset Board, less the risked cards (`Game.php:1833`);
    - no debug function sets Psych; `forceDie` only sets the face;
    - a retreat costs the risker that climb, so 1l's Headwall climbs may come a round later. *(Corrected 2026-11-06, Jonathan's correction 3: added.)*
  - Record the risker and whether it retreated.
- **1l.** The Headwall.
  - A player climbs into the third row (desert hexes 16–21, `UtilTrait.php:696`). "The Headwall is revealed" appears in the log after that climb [C].
  - Then that player climbs a Headwall pitch. That climb's log names a pitch that the replay's board doesn't hold at its start [C].
  - At the earliest, that is the player's 3rd and 4th climbs, in rounds 3 and 4. `stackAssetDeck` can supply the cards they need [C].
- **1m.** The end: `endGameSoon` for a player with at least 2 climbed pitches. With exactly one climbed pitch you get the warning seen in P1.2's 3d [S].
  - That player's next climb ends the game: the Climb and Follow Phases complete, there's no Rerack, then final scoring, and the table ends [S P1.2].
  - Your written results say the game was shortened with `debug_endGameSoon`. (That's our results, not the game's results screen.)
  - The replay's Rope counter may differ until the next climb. Record it; it's display only [C].
- **1n.** The replays. Step with "Next move" from the start to the end, from each seat Studio offers. Send me the console from its beginning. In trial 1, Studio offered both seats [S].
  - If Studio doesn't offer a replay from each seat, record which seats it offers and replay from those.
  - For console queries and saved consoles, pick the game's frame (frame.html) in the console's context dropdown; the top frame shows nothing (seen on production; [S] trial 1).
  - **(added)** In each replay, with frame.html selected, the replay test gives `true` [S, table 998675].
  - **Expected (F13):** the replay runs to the end, through the rest, with no new console error, and with fallback warnings only as below. This is the check, so it isn't [S] for this build.
  - **(added)** No `[FA animation fallback]` warning in `resting` or `selectPortaledge` [C]. Bomber Anchor's draw warns in the holder's replay (five warnings in trial 1) [C].
  - **(added)** Once, in a `resting` or `selectPortaledge` state, click once on the status text in the page title bar: the Portaledge stays open [C]. Then click once on an empty part of the board (not a pitch, card, token or button): it hides, as in live play [C]. Re-show it with the red button before the next "Next move". If the red button doesn't bring it back in a replay, the next draw's `[FA animation fallback]` warnings come from this test; record them as such. *(Corrected 2026-11-06, Jonathan's correction 2: v3 as issued said ""Next move" with the Portaledge open leaves it open [C: utils:1799–1802]. Once, in a `resting` or `selectPortaledge` state, click on the board instead: the Portaledge hides, as in live play [C]. Re-show it with the red button before the next "Next move".")*
  - **Guard warnings** to record, not failures [C]:
    - `[FA missing element] notif_confirmCharacter | no .character_placeholder | step skipped`, and `… | no #asset_board_<id> | board created`, at each pick where the replay treats the viewer as active. In P1.2's 3g, the same missing placeholder made the TypeError at 7579 (before the fix) [S]. In trial 1, both warnings came at the viewer's own pick, in each seat [S].
    - The board warning names `#asset_board_<id>`. If the id is the other seat's player, the replay treated the viewer as active at the other seat's pick. Record whose id each such warning names.
    - `notif_confirmYourRequirements | no .selected_pitch | step skipped`, at the viewer's climbs.
    - `notif_confirmAddTokenToPitch | no .selected_pitch | step skipped`, in the seat that added the token.
    - **(added)** At that add-token step, in the adder's replay: `[FA missing element] notif_confirmAddTokenToPitch | no card in #climbing_discard_straightened | card retracted from #climbing_slot`, and the replay goes on [C]. Trial 1 stopped at this step with the TypeError at utils.js:24 [S].
    - `notif_bomberAnchorCleanup | no #bomber_anchor_counter | step skipped`, in the holder's seat.
    - `notif_confirmRerackPrivate | no #discard_box | cards placed without animation`, in the holder's seat.
    - `notif_riskShowAssets | no .selected_pitch | step skipped` on any Risk it, and `notif_riskReturnAssets | no .selected_pitch | step skipped` on a retreat, in the risker's seat. Neither has run in a replay yet.
    - Near the start, once per log item that names a pitch not yet on the board: `addTooltipsToLog | no .p<type> for <n>_item_tooltip_<type> (in <container>) | tooltip deferred`. The production game had 7 such items (seen on production); trial 1 had 4 in seat 0 and 3 in seat 1 [S].
  - **Observations:**
    - whether each character and each asset board appears;
    - which seat picked first, and whose perspective the replay shows;
    - whether the viewer's hand and personal objectives appear, and whether the first picker sees its own objectives dealt face up. If so, its private notifications are in the archive (`Game.php:952`);
    - after the reveal, whether hovering a Headwall pitch name in the log shows its tooltip [C];
    - display divergences: used Summit Beta tokens staying in hand (`utils.js:4176–4219`), the reracked cards appearing without the flight, the Trifecta text, the Rope counter after 1m;
    - **(added)** whether any popup stays open in the way during a replay, for example the climbing card or the Crimper's display. BGA's UX guidelines (F.1) ask for no blocking popups in replays (`bga_ux_guidelines.md:508–516`). Table 1 has no Crimper (1d), so the Crimper's display won't come up.
- **1o** (optional, your call). During the live game, open a second visible window of one player, if Studio allows it (unknown).
  - **(added)** Note when it was opened (at which step), what happened while it was open, and its console's context dropdown and "Selected context only" setting.
  - Expected [C]: that window shows the 1n warnings for its own player's actions, and no TypeError.
  - **(added)** If it's open at its player's add-token step (1i), expect the change-1 warning, and the window goes on [C]. That is the live change Jonathan approved.

**Coverage (v3):**
- No step runs the live-play case of the 7604–7606 deletion (a tab hidden between the click and the notification). Jonathan's decision: no step for it.
- `notif_riskReturnAssets`'s guard runs only if 1k retreats.
- **(added)** Change 1's live branch runs only in 1o's second window, and only if that window is open at the add-token step.
- **(added)** The Crimper's path into the add-token handler (`Game.php:5111–5113`) has no step; its evidence is the reading under "The second change".
- **(added)** An in-game "replay from this move" (`g_replayFrom`) has no step (Jonathan's decision 3).
- **(added)** No step trades; the trader's own replay is display-only (Jonathan's decision 4).

The final entry must not call those parts playtested.

At stop B2 I also noted, for the popup observation: `bga_ux_guidelines.md:108` says a needed popup should go when "any click, touch, timed or on-screen action" happens. Jonathan's decision on it is in his stop B2 reply (quoted under "Go-aheads").

**Closing docs: what's left** (session 1's prompt §8, session 2's §4 and §8, and the go-aheads). They come in a new session, after the retest.
- **`progress.md`:** the final entry replaces this one. It records the items in session 1's §8, plus:
  - from item 10 of his stop A reply:
    - that 1m shortened the game with `debug_endGameSoon`; the results say so, not "end to end";
    - the Replay doc:10 correction;
    - the line shifts: **the complete list** ("Complete line shifts", all ranges, both changes);
  - the correction line (decision 6);
  - the exception text as above;
  - the playtest results (trial 1 and v3) and the count query results, at the level Jonathan reports them;
  - the go-ahead quotes of both sessions, kept or condensed with a pointer to this entry's commit (as P1.2's final entry pointed to `0217be6`).
- **`TODO.md`**, as proposed at stop A and approved (item 7), plus session 2's items:
  - Remove the replay entry (line 53) with the fix.
  - Add: used Summit Beta tokens stay in hand in a replay or a second window (`discardPlayedSummitBetaTokens` discards only `.selected_token`; also Jesus Piece).
  - Extend line 40 (the Trifecta drawer) with its cause (`trifecta_selections` is filled only by the click, `utils.js:1935` at HEAD) and the replay case.
  - Add the `getSkillTokens` key bug.
  - Add `asset_board`, `new_pitches` and `token` to the implicit-globals item at line 87.
  - Add the log line, for sometime after the migration is completed (session 2's §4, in Jonathan's words): "Hmm, it appears that's a gap in the intended log effect. The log line "IndianaScones0 adds a Gear token to Irene's Arete" should be "Chopped Bolts: IndianaScones0 adds a Gear token to Irene's Arete", and "Chopped Bolts" should be injected in the same way as other climbing card names. This can be added as a step much later in the process. TODO.md for sometime after the migration is completed." Where it is built: "Findings (stop A2)", item 5.
  - Add, one entry each (Jonathan's decision 4, stop A2 reply): Bomber Anchor's draw in the holder's own replay, and trade in the trader's own replay. Both are display-only: the Portaledge is opened only by the click, so the draw gives `[FA animation fallback]` warnings; in the trader's replay, the traded cards also stay in hand.
- **`MIGRATION_PLAN.md`, F13's repeats** (P1.3, P2.2, P2.6, P3.5, P4.1, P7.3). Jonathan accepted the shape proposed at stop A (item 8); the final wording comes in the docs diff.
  - **"From each seat" can stay:** Studio offered a replay from each seat in trial 1 [S] (item 8 of his stop A reply).
  - **They name the expected `[FA animation fallback]` warnings** in that seat's own replay: Bomber Anchor's draw in the holder's, trade in the trader's (his decision 4).
  - The shape proposed at stop A:
    - **P1.3 Repros:** "F13 re-checked (D9): the replay of a new game created after the deploy, with a rest, from each seat, runs to the end with no `[FA animation fallback]` warning and no new console error. `[FA missing element]` warnings are expected in a replay (the replay fix, `<hash>`); record which fired."
    - **P2.2 and P2.6:** "P2.2 and P2.6 replay F13 as in P1.3 (a new game with a rest, from each seat, to the end)."
    - **P3.5:** Playtest: "A replay of a new game through at least a full round, from each seat (F13), as in P1.3." Also proposed: a line saying that the recreated log hook (U13) keeps the deferral of pitch tooltips.
    - **P4.1:** its step text has no F13 line today (only §8.4 lists P4.1). Add to its Playtest: "F13: a replay of a new game with a rest, from each seat: no fallback warning, no new console error; `[FA missing element]` warnings recorded", and add F13 to its Repros.
    - **P7.3:** "the replay check (F13, as in P1.3)".
  - **Optional, his call:** a pointer from P1.2's 3g result line to the fix commit, and §8.1's F13 row reworded the same way.
  - **Propose (only), at the docs stop:** whether P4's or P5's scope should point to the `UX_CHANGES.md` entry below.
- **`DECISIONS.md`:** one entry recording decisions 2 and 3 of session 1's §4 (the `[FA missing element]` console warning, and the deferred pitch tooltip in the log hook), with their reasoning, since later steps rebuild that code (P3.5, P4). I propose the wording at the docs stop.
- **`UX_CHANGES.md`** (the exception, extended in Jonathan's stop B2 reply): one entry, with the next free UX id, checked against the file. I propose the wording at the docs stop. It records:
  - the rule, decided by Jonathan: in live play and in replays, only a click inside `#FirstAscent_table_display`, on the popup itself or on `#generalactions` closes a popup;
  - that this fix implements it in replays only (change 2). Live play is unchanged for now: its half is a UX change (a `ux:` commit under §10 of the plan, not part of this `fix:` commit);
  - where the live half can land: the plan puts UX changes in P8, and the P4/P5 rebuild of the click-outside listener can implement it instead.
- **The `#FirstAscent_table_display` note** (Jonathan's decision 2, stop A2 reply; extended in his stop B2 reply): change 2, and now the UX rule too, depend on `#FirstAscent_table_display` (tpl:14), which P6 may change when it builds the layout in JS and removes the `.tpl`.
- **The in-game replay** (Jonathan's decision 3): record that an in-game "replay from this move" gets the exemption during a live game, and that no step covers it.
- **Proposed at the docs stop, not made:**
  - For `BGA_PITFALLS.md`: Jonathan's two candidates (a replay's page holds the whole game's log from the start, so a document-wide query reaches future log entries; in a production replay the game ran in a frame other than the top one). Trial 1 saw the second on Studio too: the replay's console needed frame.html, while the live tabs answered on top [S]. Two of mine: "a replay never clicks"; "debug functions that change state without a notification make a replay diverge".
  - For `FREEZE_INVESTIGATION.md` (session 1's prompt §6 example): the production replay as S6 evidence. A throw in `addTooltipsToLog`, inside the `addToLog` hook, most likely ended that dispatch before the handler ran: an inference from the character not appearing on the board (seen on production). "Next move" still advanced (seen on production). `FREEZE_INVESTIGATION.md:682` calls the effect on dispatch "unverified (S6)".
- **Then:** `git diff > "D:\Documents\BGA Studio\replay-fix-docs.diff"`, with its line count and `--stat`. Jonathan reviews it. On "commit docs": one `docs:` commit, staged by explicit path. On "push": a normal push.

**Go-aheads, quoted in full** (a record of a go-ahead isn't a grant)

Session 1's go-aheads:

From the session prompt (2026-11-03), the rollover rule:

> Rollover: if the session is auto-compacted (including while idle), roll over at the next checkpoint. Write an "in progress" progress.md entry (HEAD and push state, staged and unstaged changes, files outside git, each item's status, go-aheads quoted in full, pending decisions) and stop; I commit it as a docs: commit.

The prompt's §2:

> ## 2. The one-time exception (my decision, 2026-11-03)
> Record it in this session's progress.md entry, as the one of 2026-10-14 was recorded (in the 2026-10-15 entry). It allows:
> - after my go-ahead at stop A: editing firstascent.js and modules/utils.js, only for the changes in the revised proposal I approve;
> - editing misc/docs/progress.md, misc/docs/TODO.md and misc/docs/MIGRATION_PLAN.md as described in §6 and §8;
> - writing diffs and scratch copies outside the repo, in D:\Documents\BGA Studio\;
> - one fix: commit (referencing F13) and one docs: commit, each after my approval; a normal push after my approval.
> Nothing else: no other code file, no new debug function, no deploy (I deploy to Studio). Nothing goes to the BGA Production site: production keeps the legacy build until P7.4, with no hotfix (we don't review alpha games by replay).

The prompt's §3.2 report and console (quoted as §8 asks):

> My report, quoted:
> > 1. Both replays were from the same BGA Production site game, only from the perspective of each character. That game did reach the Headwall.
> > 2. I started each replay with the "Next move" button. The log panel showed the entry from the action that threw the error, but no later entries.
> > 3. "Next move" still worked, and the drawing of personal objective cards worked correctly, but the character did not appear on the board.
> One replay was from the seat of the player who picked a character first, the other from the other seat. The console was the same in both (from my screenshots):
> > During notification confirmCharacter
> > Cannot read properties of null (reading 'id')
> > TypeError: Cannot read properties of null (reading 'id')
> >     at utils.js:1268:64
> >     at Array.forEach (<anonymous>)
> >     at Object.addTooltipsToLog (utils.js:1258:40)
> >     at Object.<anonymous> (firstascent.js:1:36620)
> >     at Object.i [as addToLog] (dojo.js:1:43007)
> >     at Object.dispatchNotification (ly_studio.js:1:414165)
> >     at Object.dispatchNotifications (ly_studio.js:1:411878)
> >     at Object.processSynchronizedMoveNotifications (ly_studio.js:1:407669)
> >     at Object.flushMoveBuffer (ly_studio.js:1:406021)
> >     at Object.pushToSyncBuffer (ly_studio.js:1:405831)
> > (then two more errors: "url=" and "line=")

The prompt's §4:

> ## 4. My decisions (2026-11-03)
> 1. Investigate first, in this session: read-only stop A (§5), a revised proposal, my review, then apply.
> 2. Each guard that fires writes a console warning with one fixed prefix (console only; players see nothing). Propose the prefix and the messages at stop A.
> 3. The log hook (utils.js:1268) is fixed in this session too. Direction: when the pitch element is missing, skip that item without marking it tt_processed, so a later sweep completes its tooltip once the pitch exists. Log it once per item, not at every sweep, with the item's id and pitch type.
> 4. Studio only (see §2).
> 5. Display-only divergences (3.3c, and any the survey finds) aren't fixed here. They go into TODO.md, one entry or one per kind as you propose, including the Trifecta text.
> 6. The P1.2 entry's "Cost of each trial" line says "guard all five places"; there are six. Add a one-line correction in this session's entry; don't edit the P1.2 entry.
> Also this session's duties, decided in P1.2's closing docs: update F13's repeats in MIGRATION_PLAN.md (P1.3, P2.2, P2.6, P3.5, P4.1, P7.3); remove the replay entry from TODO.md with the fix; run the asset count query on the new game and record the result.

The production result, sent with the prompt ("Record it at this level"):

> A result from the production replay (2026-11-03), for stop A and for the entry. Record it at this level.
>
> I reran the design discussion's console query in the replay tab, after a reload and one "Next move" (the utils.js:1268 error had fired). The first run printed an empty table: the console was set to the top frame. With the console switched to the game's frame, it listed 28 elements matching .item_tooltip.pitch_tt:
> - all inside elements with ids replaylogs_move_6 … replaylogs_move_85, all with offsetParent set;
> - 21 have their pitch on the board (document.querySelector('.p' + type) found one);
> - 7 don't: 178_item_tooltip_27 (replaylogs_move_56, "Bloody Fingers"); 205_, 206_ and 211_item_tooltip_41 (replaylogs_move_66, "Teflon Corner"); 229_item_tooltip_39 (replaylogs_move_73, "Desert Gold"); 232_item_tooltip_27 (replaylogs_move_75, "Bloody Fingers"); 273_item_tooltip_40 (replaylogs_move_85, "No Place Like Home");
> - in document order, the first of the 7 is 178_item_tooltip_27, after 13 items whose pitch exists.
> The query: console.table([...document.querySelectorAll('.item_tooltip.pitch_tt')].map(e => { const t = e.id.slice(-2).replace(/^\D+/g, ''); return { id: e.id, type: t, onBoard: !!document.querySelector('.p' + t), hidden: e.offsetParent === null, container: e.parentElement?.closest('[id]')?.id, text: e.textContent.trim() }; }));
>
> What this settles, and what follows:
> 1. It replaces §3.2's UNVERIFIED note. When the replay starts, the game's frame already holds the whole game's log in replaylogs_move_N containers, and addTooltipsToLog's sweep over the whole document (utils.js:1257) reaches it at the replay's first log line. In the normal log panel I saw no later entries; where replaylogs sits on the page isn't known.
> 2. Verify by reading, with citations: utils.js:1260 marks an item tt_processed before the lookup that throws, so each missing item throws once, at a later notification's log line. In this game that would be 7 throws, and if the log line is added before the handler, each skips that notification's handler. Also check whether pitches 27, 39, 40 and 41 are Headwall pitches (material.inc.php and the code). The design discussion assumes so but hasn't checked.
> 3. An addition to decision 3: the guard's message also names the item's container (its nearest ancestor with an id).
> 4. The trial: the game must log at least one climb on a pitch that isn't on the board when the replay starts (presumably a Headwall pitch), so that the log-hook guard fires. Add to the list: in a replay, console queries need the game's frame selected in the console's context dropdown; the top frame shows nothing.
> 5. Candidates for misc/docs/BGA_PITFALLS.md, to propose at the docs stop, not to add now: a replay's page holds the whole game's log from the start, so a document-wide query reaches future log entries; in a production replay the game ran in a frame other than the top one.

His reply to stop A (2026-11-03 at 23:07):

> Stop A reviewed. The design discussion reviewed replay-fix-proposal-v2.diff as uploaded: 155 lines, 9,320 bytes, LF only, the same --stat. Record this message in the entry, quoted in full.
>
> 1. Go ahead: apply replay-fix-proposal-v2.diff, with one change. In the comment above warnMissingElement in modules/utils.js, "finds missing an element" becomes "finds an element missing". Nothing else differs from v2; show that by a plain diff between replay-fix.diff and the proposal.
> 2. Go-aheads for the points you raised:
>    - The deletion of firstascent.js 7604–7606 is approved, including its live-play change: a tab hidden between the click and the notification gets one board instead of a duplicate with the same id.
>    - The Rerack guard in notif_confirmRerackPrivate is approved as part of this fix.
> 3. The hand and token reads that depend on private notifications stay unguarded, as you propose.
> 4. Syntax: no browser parse. The design discussion ran node --check (node v22) on its own copies of both files (my working copies, uploaded on 2026-11-03) with v2 applied: both parse. Record it at that level.
> 5. DECISIONS.md: PROCEDURES.md's "Decisions" section applies. I extend the exception to misc/docs/DECISIONS.md, for one entry recording decisions 2 and 3 of the session prompt's §4 (the [FA missing element] console warning, and the deferred pitch tooltip in the log hook), with their reasoning, since later steps rebuild that code (P3.5, P4). Decisions 1, 4, 5 and 6 are scoped to this fix and go in progress.md only. Propose the wording at the docs stop.
> 6. The exception text: replace "(alpha games aren't reviewed by replay)" with my words: "Garrett and I do not tend to replay games". The session prompt's "we don't review alpha games by replay" said more than I did; note that in the entry.
> 7. TODO.md: also add the two items you found in passing (the getSkillTokens key bug; the implicit globals, for the item at TODO.md:87).
> 8. F13's repeats: the shape you propose is fine. The final wording comes in the docs diff, after the trial, since whether Studio offers a replay from each seat decides whether "from each seat" can stay.
> 9. The playtest list: re-issue it at stop B as v2, with these steps added in the same style, marked "(added)":
>    - before 1a: deploy firstascent.js and modules/utils.js to Studio, and check their sizes on Studio against the working-copy sizes you report at stop B. After the F5, in each tab's console, typeof gameui.utils.warnMissingElement returns "function" [C];
>    - in 1n: the board warning names #asset_board_<id>. If the id is the other seat's player, the replay treated the viewer as active at the other seat's pick. Record whose id each such warning names;
>    - in 1n: if Studio doesn't offer a replay from each seat, record which seats it offers and replay from those;
>    - tags: what was seen on the BGA Production site is tagged "(seen on production)", not [S], which means seen on Studio. This applies to 1n's "Production had 7 such items" and "[S production]".
> 10. The entry also records:
>    - that 1m shortens the game with debug_endGameSoon (the results say so, not "end to end");
>    - the Replay doc:10 correction;
>    - the line shifts the fix causes in firstascent.js and modules/utils.js (as P1.2 recorded Game.php's +2), since the docs' citations aren't refreshed.
>
> Then stop B, as in the session prompt's §6.

His reply to stop B (2026-11-04 at 00:22):

> Stop B reviewed. The design discussion checked replay-fix.diff as uploaded: 155 lines, 9,320 bytes, LF only. It differs from replay-fix-proposal-v2.diff only at lines 111 and 140. Applied to its copies of my working copies, it gives the blob hashes in its index lines (984e873, c5b4077), and the patched files parse with node --check (node v22). Record this message in the entry, quoted in full.
>
> I'll deploy firstascent.js and modules/utils.js to Studio and play from playtest list v2. Two points on the list:
> 1. 1n says "Ask me before you start". What should I ask you before the replays, and why? Answer now; I'll play 1a–1m meanwhile.
> 2. 1n's "3g showed this at one pick [S]": 3g showed the TypeError at 7579, caused by the same missing placeholder, not this warning, which didn't exist then. Correct that wherever the entry records the list; no need to reissue it.

His review of `replay-fix-wip-docs.diff` (2026-11-04 at 13:34):

> Review of replay-fix-wip-docs.diff. The design discussion checked it as uploaded: 438 lines, 50,288 bytes, LF only, progress.md +427. It's approved with the corrections below. Record this message in the entry, quoted in full, under "Go-aheads".
>
> Make the corrections by script with exact-match checks, keeping progress.md's CRLF. Write "D:\Documents\BGA Studio\replay-fix-wip-docs-v2.diff" (don't overwrite replay-fix-wip-docs.diff) and give me its line count, bytes and --stat. No other edits. Then stop: "commit docs" and "push" come after the design discussion reviews v2.
>
> 1. Status. I haven't deployed or playtested yet. Correct the entry where it says otherwise, keeping the markup:
>    - the opening paragraph: "Jonathan's Studio deploy and playtest (playtest list v2) are under way." becomes "Jonathan's Studio deploy and playtest (playtest list v2) come next; he hadn't started them when this entry was committed.";
>    - "Status of each item": "Deploy and playtest: Jonathan's, under way at the rollover." becomes "Deploy and playtest: Jonathan's, not started when this entry was committed.";
>    - "State at the rollover", the Studio bullet: "I don't know whether the deploy has happened, or the file sizes on Studio." becomes "When this entry was committed, he hadn't deployed (his review of this entry, quoted under "Go-aheads")."
>
> 2. The FREEZE_INVESTIGATION.md proposal swaps the observation and the inference. That the character didn't appear is what I saw on production; that the throw ended the dispatch before the handler ran is the inference. Replace its second and third sentences ("A throw in addTooltipsToLog … Yet "Next move" still advanced.") with: "A throw in addTooltipsToLog, inside the addToLog hook, most likely ended that dispatch before the handler ran: an inference from the character not appearing on the board (seen on production). "Next move" still advanced (seen on production)."
>
> 3. Coverage. After 1o, add a short paragraph marked "added 2026-11-04, not part of v2 as issued":
>    - No step runs the live-play case of the 7604–7606 deletion (a tab hidden between the click and the notification). Its evidence is the code reading, on which you and the design discussion agree. My decision: no step for it.
>    - notif_riskReturnAssets's guard runs only if 1k retreats.
>    The final entry must not call those parts playtested.
>
> 4. Pitch 27. The reasoning uses the desert hexes but doesn't say the production game was on the desert board. After "and only 23 and 25 are Headwall.", add: "That production game had 2 players, so it used the desert board (Jonathan, 2026-11-04; Game.php:158)."
>
> 5. Line shifts: old firstascent.js line 12771 falls in no range (one ends at 12770, the next starts at 12772). Add what happened to it, from replay-fix.diff.
>
> 6. "Files outside git": add replay-fix-wip-docs-v2.diff (this entry after this review; its counts are in your report), and mark replay-fix-wip-docs.diff as superseded by it. In "Next", item 1 names the v2 diff.
>
> With the v2 report, show the docs: commit message as text. The one you proposed is fine: "docs: the replay fix (F13) in progress (fix applied, not committed; rollover checkpoint)". The commit stages misc/docs/progress.md alone, by explicit path; firstascent.js and modules/utils.js stay unstaged.

From his reply to session 1's v2 docs diff (2026-11-04), item 1, as session 2's prompt quotes it:

> 1. The two other line-shift gaps (old firstascent.js 8954–8955 and 10649–10650): don't add them now. The closing docs record all three ranges in the final entry.

Session 2's go-aheads:

Session 2's prompt, the rollover rule (§9):

> - Rollover: if the session is auto-compacted (including while idle), roll over at the next checkpoint. Write the updated entry as in §8, from the transcript, not the summary, and stop; I commit it as a docs: commit.

Session 2's prompt, §2 (the exception, restated). Its first paragraph, and the extension; its other paragraphs re-quote session 1's go-aheads, quoted in full above:

> ## 2. Scope: the exception, restated
> A record of a go-ahead isn't a grant; this section is the grant for this session.
>
> As amended by items 5 and 6 of my reply to stop A (quoted in full below): misc/docs/DECISIONS.md for one entry, and the reason in my words, "Garrett and I do not tend to replay games".
>
> Extended today (2026-11-05), my decision:
> - Stop A2 (§6): a read-only investigation, then a revised proposal as a new diff, covering the new throw and whatever §4 sends to it.
> - After the design discussion's review and my "apply": editing firstascent.js and modules/utils.js, only for the changes in the proposal I approve.
> - At the end of this session: one in-progress docs: commit of misc/docs/progress.md (like c3cb6cd) after my "commit docs", and a normal push after my "push". It is separate from the closing docs: commit.
> - Not in this session: the fix: commit and the closing docs (TODO.md, MIGRATION_PLAN.md, DECISIONS.md, the final progress.md entry). They come after the retest, in a new session.
> - Everything else in the quote above still holds: no other code file, no new debug function, no deploy (I deploy to Studio), nothing to the BGA Production site.

Session 2's prompt, §4:

> ## 4. My decisions (2026-11-05)
> A, C, D and the missing-element point accept the design discussion's recommendations, quoted.
>
> A. The new throw:
> > The exception covers only the reviewed changes. I recommend extending it for the next session to cover three things: a read-only investigation stop; a revised proposal as a new diff; applying it after my review and your go-ahead. The survey should cover all nine guarded sites, not just this one: what each skipped step would have produced, and whether anything later uses it. riskShowAssets and riskReturnAssets never ran in any replay, so only reading covers them.
>
> The missing-element point (part of A's scope):
> > The animation helper already turns a hidden element into a warning plus a fallback, but a missing element crashes it and hangs the replay. My recommendation: ask the stop to weigh a missing-element case in that existing fallback against a guard at this one site, and report the trade-off. A general fallback would stop this kind of hang anywhere, but it could also mask a live-play bug behind a console warning. No change would be made without a proposal and your go-ahead.
>
> B. The [FA animation fallback] warnings: stop A2 finds what opens and closes #portaledge in a replay, and whether a click on the replay controls reaches the click-outside handler (and what else that handler closes). If that explains the warnings, the revised proposal includes my suggestion: the replay controls are exempt from click-outside. I approve or reject it at stop A2. If it doesn't explain all of them, report which ones it leaves, and propose nothing for those.
>
> C. Commit timing:
> > I recommend keeping the fix uncommitted until the revised fix passes, then making one fix: commit, as the exception says. replay-fix.diff stays the backup of the reviewed part.
>
> D. The retest:
> > A revised fix needs a new table created after the deploy, so the list runs again as v3. I recommend the whole list, since the replay needs a whole game anyway, plus whatever the investigation targets. Claude Code's stop B can propose it.
> Add these to v3 in the same style, marked "(added)":
> - in 1a and 1o: note the console's context dropdown and its "Selected context only" setting;
> - in 1o: when the second window was opened, and what happened while it was open;
> - if a debug function can force a Risk it to retreat, a step that does, so notif_riskReturnAssets runs in a replay;
> - a step reaching each code path the revised fix changes.
>
> For the closing docs (not this session), a TODO.md entry, in my words:
> > Hmm, it appears that's a gap in the intended log effect. The log line "IndianaScones0 adds a Gear token to Irene's Arete" should be "Chopped Bolts: IndianaScones0 adds a Gear token to Irene's Arete", and "Chopped Bolts" should be injected in the same way as other climbing card names. This can be added as a step much later in the process. TODO.md for sometime after the migration is completed.

His reply to stop A2 (2026-11-06 at 11:14):

> Stop A2 reviewed. Record this message in the entry, quoted in full.
>
> The design discussion's checks:
> - replay-fix-2-proposal.diff as uploaded: 31 lines, 1,844 bytes, LF only, the same --stat.
> - replay-fix-2-work\ (zipped and uploaded): a\ hashes to 984e873 and c5b4077, the post-image of replay-fix.diff. The proposal passes git apply --check on a\, and the result is byte-identical to b\ (aeaf737, 8a0a442). Both patched files parse with node --check (node v22).
> - From those, the working copies after "apply" should be 744,236 and 229,085 bytes, with 13,567 and 4,986 CRs.
>
> My checks on Studio, in table 998675's replay, with frame.html selected in the console's context dropdown:
> - (typeof g_archive_mode !== 'undefined' && g_archive_mode) || typeof g_replayFrom !== 'undefined' gave true.
> - !!document.getElementById('FirstAscent_table_display') gave true.
> - Your query for "Next move" gave an empty array. It looks only at elements without child elements whose whole text is "Next move".
> - After Inspect on the "Next move" button, document.getElementById('FirstAscent_table_display').contains($0) gave false. The button's chain of ids is: IMG | archive_next < archivecontrol_editmode < archivecontrol < current_header_infos_wrap < topbar_content < topbar < overall-content < ebd-body.
> The live half of the replay test (false in a live game) isn't checked yet; v3 checks it (below).
>
> My decisions:
> 1. Change 1 is approved, including its live-play change: a second window of the adder's own player retracts the card and warns, instead of stopping with the TypeError.
> 2. Change 2: the broad version, as proposed. The closing docs record that it depends on #FirstAscent_table_display (tpl:14), which P6 may change when it builds the layout in JS and removes the .tpl.
> 3. An in-game "replay from this move" sets g_replayFrom, so it gets the same exemption during a live game. Accepted; record that no step covers it.
> 4. Bomber Anchor's draw in the holder's own replay, and trade in the trader's own replay, are display-only (decision 5 of the first session's §4). For the closing docs: a TODO.md entry for each, and F13's repeats name them as expected [FA animation fallback] warnings in that seat's own replay.
> 5. No general missing-element fallback in animationPromise, as your §3 recommends.
>
> Go ahead: apply replay-fix-2-proposal.diff as it is, on one condition. Before applying, cite where #climbing_slot is created and show that nothing removes it during a game, so change 1's new check can't throw on the adder's client in live play. Also confirm what the slot holds when the Cool-Headed Crimper's path (Game.php:5111–5113) reaches the handler. If either isn't so, stop and report before applying anything. Include the citations in the stop B2 report.
>
> Then stop B2 as in the prompt's §7. Add these to list v3, in the same style, marked "(added)":
> - before 1a, in each live tab's console: the replay test above gives false [D]. If it gives true, I stop before playing and tell you;
> - in 1n, in each replay with frame.html selected: the same test gives true [S, table 998675];
> - in 1n: no [FA animation fallback] warning in resting or selectPortaledge [C]; Bomber Anchor's draw warns in the holder's replay (five warnings in trial 1) [C]; at the add-token step in the adder's replay, "[FA missing element] notif_confirmAddTokenToPitch | no card in #climbing_discard_straightened | card retracted from #climbing_slot", and the replay goes on [C];
> - in 1n: whether any popup stays open in the way during a replay, for example the climbing card or the Crimper's display. BGA's UX guidelines (F.1) ask for no blocking popups in replays.

His reply to stop B2 (2026-11-06 at 12:38):

> Stop B2 reviewed. Record this message in the entry, quoted in full.
>
> The design discussion's checks:
> - replay-fix-2.diff as uploaded: 178 lines, 10,922 bytes, LF only, the same --stat. Reversed from its copy of b\, it gives 5dc9ec8 and a97e5e7, the pre-images in its index lines, so it takes HEAD to exactly b\.
> - Your line-shift tables match the shifts it recomputed from the diff's hunks, row by row, including the three ranges, and the trial's stack lines under the new numbering (utils:2934 and 2939, js:10711).
> - Your sizes and CR counts match its prediction (744,236 and 229,085 bytes; 13,567 and 4,986 CRs).
> - In its copy of b\: change 1's check is the same read as js:2298, 4928, 9316, 9335, 9360, 10462, 10503 and 10635, which already run in live play. The click-outside listener (utils:1797–1810) and the hide branch (js:4374–4381) read as you describe.
>
> Your answers to my condition are accepted.
>
> The popup point (bga_ux_guidelines.md, A.4 and F.1) is decided. In my words:
> > I'd like to exclude clicks in the log, player panels, and top bar from closing popups in both live play and replay.
> Asked whether that means only those three regions or everything outside the game's area:
> > I agree with scoping popup-closing clicks to `#FirstAscent_table_display`.
> Asked where the live-play half goes, I accepted the design discussion's recommendation (keep change 2 replay-only, as reviewed, and record the live rule as a decided UX change in misc/docs/UX_CHANGES.md):
> > Your recommendation for where the live-play half goes is fine.
> Asked how to record it:
> > Decided by me is fine.
>
> So the rule, in live play and in replays: only a click inside #FirstAscent_table_display, on the popup itself or on #generalactions closes a popup. Change 2 already implements it in replays, so the code stays as applied. Live play is unchanged for now: its half is a UX change (a ux: commit under §10 of the plan, not part of this fix: commit), so it is recorded, not made.
> - I extend the exception to misc/docs/UX_CHANGES.md, for one entry in the closing docs. The entry records the rule as decided by me, and that this fix implements it in replays only. It also records where the live half can land: the plan puts UX changes in P8, and the P4/P5 rebuild of the click-outside listener can implement it instead. Use the next free UX id, checked against the file, and propose the wording at the docs stop.
> - At the docs stop, also propose (only) whether P4's or P5's scope in MIGRATION_PLAN.md should point to that entry.
> - The closing docs' note that change 2 depends on #FirstAscent_table_display (tpl:14), which P6 may change, now covers the UX rule too.
> Add these three items to the entry's closing-docs checklist.
>
> Playtest list v3 is accepted with three corrections. Make them wherever the entry records the list; no need to reissue it:
> 1. 1g's added step: "click once on the board, outside the Portaledge" becomes "click once on the status text in the page title bar, outside the game's area". The expected result is unchanged: the Portaledge hides and the red button appears, as before the fix. This is the live check that change 2 needs the replay test, so live play keeps today's behavior. Confirm by reading that the title bar's text is outside #FirstAscent_table_display, and adjust the step if it isn't.
> 2. 1n's added click step becomes: once, in a resting or selectPortaledge state, click once on the status text in the page title bar: the Portaledge stays open [C]. Then click once on an empty part of the board (not a pitch, card, token or button): it hides, as in live play [C]. Re-show it with the red button before the next "Next move". If the red button doesn't bring it back in a replay, the next draw's [FA animation fallback] warnings come from this test; record them as such.
> 3. In 1k's added retreat setup: a retreat costs the risker that climb, so 1l's Headwall climbs may come a round later.
>
> I'll deploy firstascent.js and modules/utils.js to Studio and play from v3 with these corrections. Go ahead with §8 of the prompt: the updated in-progress entry, then the docs diff, then stop.

**Files outside git**
- **In `D:\Documents\BGA Studio\`:**
  - `replay-fix-proposal.diff` (v1; 63 lines, 3,762 bytes): P1.2's proposal. Superseded by v2; not applied.
  - `replay-fix-proposal-v2.diff` (155 lines, 9,320 bytes, LF): the revised proposal, reviewed at stop A and approved with one comment change.
  - `replay-fix-v2-work\`: `a\` holds HEAD's two files as LF blobs; `b\` holds them with v2 applied, so it has v2's comment, not the approved one.
  - `replay-fix.diff` (155 lines, 9,320 bytes, LF): the applied fix. It equals the working-tree diff of the two files (`cmp`, 2026-11-04), and the design discussion checked it at stop B.
  - `replay-fix-wip-docs.diff` (438 lines, 50,288 bytes, LF): the 2026-11-04 entry as first written, for review. Approved with six corrections (his review, quoted under "Go-aheads"). **Superseded by `replay-fix-wip-docs-v2.diff`.**
  - `replay-fix-wip-docs-v2.diff`: the 2026-11-04 entry after those corrections, for review. Its line count, bytes and `--stat` are in my report to Jonathan, not here (they would change this file).
  - Unchanged from earlier sessions: the P1.2 and P1.1 diffs. `firstascent-overrides\` is untouched.
  - `replay-trial-1\`: trial 1's consoles, from Jonathan (sizes under "Trial 1").
  - `replay-fix-2-work\`: `a\` holds the working copies after the first change, as LF (`984e873`, `c5b4077`); `b\` holds them with the second proposal applied (`aeaf737`, `8a0a442`).
  - `replay-fix-2-proposal.diff` (31 lines, 1,844 bytes, LF): the second proposal, reviewed at stop A2 and approved as it is.
  - `replay-fix-2.diff` (178 lines, 10,922 bytes, LF): the whole fix against HEAD, both changes. It equals the working-tree diff of the two files (`cmp`, 2026-11-06), and the design discussion checked it at stop B2.
  - `replay-fix-2-wip-docs.diff`: this entry, for review. Its line count, bytes and `--stat` are in my report to Jonathan, not here (they would change this file).
- **Session 1's scratchpad,** `C:\Users\Jonat\AppData\Local\Temp\claude\8fc825ef9cb91d6c\f45ad816-dbbf-4627-9a29-d25d34a8715d\scratchpad\`, outside the repo:
  - the survey: `methods.php`, `clickstate.php`, `js_methods.txt`, `utils_methods.txt`, `js_branches.txt`, `candidates.txt`, `candidates2.txt`, `candidates3.txt`, `reach.txt`, `click_creates.txt`;
  - the edits: `replay_fix_edits.php` (v2) and `replay_fix_edits_approved.php` (the one applied), plus `cur_fix.diff` (the working-tree diff used for the `cmp`);
  - the 2026-11-04 entry: `entry_template.md` and `build_entry.php`, which inserts it and takes the quotes verbatim from the transcript dumps;
  - the transcript readers: `tx_index.php` and `tx_dump.php`. Their output in `tx\` is `m3.md` (the session prompt and the production result), `m751.md` (stop A), `m755.md` (the stop A reply), `m831.md` (stop B) and `m835.md` (the stop B reply). `stopA_reply.md` is a copy of the stop A reply.
- **Session 1's transcript,** outside the repo: `C:\Users\Jonat\.claude\projects\D--Documents-BGA-Studio-firstascent\f45ad816-dbbf-4627-9a29-d25d34a8715d.jsonl`. The session prompt is its first message.
- **Session 2's scratchpad,** `C:\Users\Jonat\AppData\Local\Temp\claude\8fc825ef9cb91d6c\0b71df26-2e89-450a-8f9e-5b8655db587a\scratchpad\`, outside the repo:
  - the survey: `js_methods.txt`, `utils_methods.txt`, `js_branches.txt` and `click_sets.txt` (made with session 1's `methods.php`), and `cards.php` (climbing card names from `material.inc.php`);
  - the second change: `replay_fix_2_edits.php` (the edits; its `crlf` mode is the one applied to the working copies), `p1.diff` and `p2.diff` (the proposal's two halves), `applytest\` (the `git apply` check on a copy of `a\`), `lfcheck\` (the working copies, LF-normalized, for the `cmp` with `b\`);
  - the `cmp`s with `replay-fix.diff` at session 2's start and at stop A2: `cur_fix.diff` and `cur_fix_end.diff`;
  - this entry: `entry2_template.md` and `build_entry2.php`, which inserts it and takes the quotes verbatim from the transcript and the old entry; `tx\` holds session 2's prompt (`prompt.md`) and Jonathan's stop A2 and stop B2 replies.
- **Session 2's transcript,** outside the repo: `C:\Users\Jonat\.claude\projects\D--Documents-BGA-Studio-firstascent\0b71df26-2e89-450a-8f9e-5b8655db587a.jsonl`. The session prompt is its first message.

**Compaction**
- Session 1 was auto-compacted once, at 2026-11-04 00:22:13, when Jonathan's stop B reply arrived. The transcript's `compact_boundary` record (line 841) says: `trigger: auto`, `precomputed: true`, 407,762 tokens before, 28,487 after. The summary was written while the session was idle.
- Stop B had been delivered at 23:10, before the compaction. So the rollover checkpoint is my answer to his stop B questions, and the 2026-11-04 entry.
- The summary got one thing wrong: it said stop B's message hadn't been written yet. The transcript shows it was delivered.
- Session 2 had not been compacted when this entry was written (its transcript has no `compact_boundary` record).

**Pending decisions** (only what is still open)
- **The v3 results** (Jonathan's), including:
  - the replay test in the live tabs (expected `false`) and in each replay (expected `true`);
  - whether any popup stays open in the way during a replay (F.1);
  - 1g's corrected step, which also shows whether the status text counts as outside `#generalactions`;
  - whether 1k retreated, and 1o if run.
- **The `fix:` commit:** one commit for both changes (his decision C). Its message is shown after his go-ahead, after the retest; then "commit the fix".
- **F13's final wording:** in the docs diff ("from each seat" stays; the expected warnings of decision 4 are named).
- **To propose at the docs stop:**
  - the `DECISIONS.md` wording;
  - the `UX_CHANGES.md` entry (its id and wording);
  - whether P4's or P5's scope in `MIGRATION_PLAN.md` should point to it;
  - the `BGA_PITFALLS.md` and `FREEZE_INVESTIGATION.md` proposals;
  - the optional `MIGRATION_PLAN.md` pointers.
- **A question for Jonathan, raised here:** `PROCEDURES.md`'s "Decisions" section asks that decisions relayed from the design discussions go into `DECISIONS.md` in the same session. Session 2 received some (stop A2 reply: decisions 1–5; stop B2 reply: the popup rule), but the exception covers only one `DECISIONS.md` entry (decisions 2 and 3 of session 1's §4), and session 2's §2 puts `DECISIONS.md` in the closing docs. Whether that entry, or another, also records session 2's decisions (for example decision 5, no general missing-element fallback, which P4.1's design touches) is his call.
- **Carried over from the P1.2 entry, still open:** the three items under its "Pending decisions": the fix step for the redraw loop, the fix step for the zombie path in `chooseSummitBetaToken`, and retiring `firstascent-overrides\`.

**Next**
1. Jonathan reviews `replay-fix-2-wip-docs.diff` and, on "commit docs", this entry is committed as a `docs:` commit, staging only `misc/docs/progress.md`; on "push", a normal push.
2. Jonathan deploys both files to Studio and plays v3 on a new table.
3. A new session continues the replay fix from this entry:
   - **The start check:**
     - `git status` and `git log --oneline -3`: HEAD is this entry's commit on `c3cb6cd`, and only `firstascent.js` and `modules/utils.js` are modified;
     - `git diff -- firstascent.js modules/utils.js` is byte-identical to `replay-fix-2.diff`;
     - the byte counts above.
   - Jonathan's v3 results, recorded at his level.
   - After his go-ahead, the `fix:` commit message as text. On "commit the fix": `firstascent.js` and `modules/utils.js`, staged by explicit path.
   - The closing docs (above). On "commit docs": one `docs:` commit. On "push": a normal push.
4. Then P1.3.

## 2026-11-02 (P1.2: done)

P1.2 (move the server to `modules/php/Game.php`) is done. Its code commits are pushed and were playtested on Studio, and its closing docs are written by the session described under "This session". This entry replaces the "in progress" entry of 2026-11-02, which is at `0217be6` (`git show 0217be6:misc/docs/progress.md`; the entry starts at line 5 there). That version is the full text this one condenses. This entry keeps the facts, results, findings, decisions and state. It drops what only records process: the closing-docs checklist (done now) and the full quotes of code session 1's and 2's go-aheads (listed below, with pointers). Text kept from the earlier entry stays in the voice of the session that wrote it: "I" and "my report" mean code session 2 (in the record of code session 1, code session 1).

P1.2 ran in three sessions:
- **Code session 1** (started 2026-10-30; transcript `2eb67ffe-…`): the start check, the `TODO.md` restore, section 4's checks, the tool commit `322754e`. Its record is kept at the end of this entry.
- **Code session 2** (started 2026-10-31 at 15:58 CDT with the prompt "P1.2 (continued): the rename, the adaptation, the deploy and the closing docs"; transcript `7de0b7e8-…`): the rename, the adaptation, the material fix, the playtest, the two code commits and their push, then the rollover entry (`0217be6`). It was auto-compacted twice (see "Compaction").
- **This session** (2026-11-02; transcript `9beef41f-…`): the closing docs. Docs only.

Times are Jonathan's local time (CDT until 2026-11-01 02:00, CST after), converted from the transcript's UTC timestamps.

**State at the end of P1.2**
- **HEAD at the start of this session:** `0217be6` (committed 2026-11-02 12:38:05 −0600, pushed at 12:38:13), level with `origin/main`, working tree clean, nothing staged.
- **P1.2's commits,** oldest first, all pushed:
  - `322754e` tool: add debug_frameworkCheck, a Studio-only check of the running class (P1.2) (code session 1)
  - `e3cf621` docs: P1.2 in progress (tool commit done; rollover checkpoint)
  - `0bce03f` struct: move the server files to modules/php/ (P1.2, rename only)
  - `c453c4a` struct: adapt the moved server files to the current framework (P1.2)
  - `0217be6` docs: P1.2 in progress (code commits pushed; second rollover checkpoint)
  - this session's `docs:` commit, which adds this entry: after Jonathan's "commit docs", pushed after his "push". Its hash can't be written into the entry it contains; it is in my report.
- **Pushes:** `e3cf621` (with its ancestor `322754e`) was on `origin/main` by 2026-10-31 15:41:25 −0500; `c453c4a` (with `0bce03f`) was pushed at Jonathan's "push", 2026-11-01 23:52:59 −0600 (`e3cf621..c453c4a  main -> main`), and `0217be6` on 2026-11-02 at 12:38:13 −0600. Normal pushes, no tags.
- **Studio** (as far as I know; I can't see it): `modules/php/Game.php` (the committed file, with the material fix: 350,578 bytes) and `modules/php/UtilTrait.php` (69,152 bytes), uploaded by Jonathan with WinSCP; the root `firstascent.game.php` and `modules/utils.php` are deleted. The root `material.inc.php` must be there: `Game.php` requires it in the constructor. The other Studio files are as in the P1.1 entry's "State at the stop".
- **Byte counts at `c453c4a`** (PHP, not `grep`): `Game.php` 350,578 bytes, CRLF 6,534; `UtilTrait.php` 69,152 bytes, CRLF 1,414; no bare LF or bare CR in either. `git ls-files --eol`: `i/lf w/crlf` for both.

**Status of each item**
- **5.2, the rename: committed** as `0bce03f` (`struct:`, "move the server files to modules/php/ (P1.2, rename only)"), 2026-11-01 19:29:43. `modules/php/` was created empty, then `git mv firstascent.game.php modules/php/Game.php` and `git mv modules/Utils.php modules/php/UtilTrait.php`. `git show -M --name-status` gives `R100` for both files, and `git show -M --format= 0bce03f` is byte-identical to `p1.2-move.diff` (checked with `cmp` on 2026-11-02). The message says the commit alone doesn't run on Studio (the class is still the global `FirstAscent` and the `require_once('modules/utils.php')` path is gone) and that the two commits were playtested together.
  - **Deviation from "Show each message before committing":** the rename commit's message was written inside the same `git commit` command (visible in that tool call), together with the `git diff --cached --stat -M` that was the stat check. It was not shown as a separate text first, and the command did not wait on the stat. My report of 2026-11-01 said I had shown each message first; that was wrong for this one. The index state is not in doubt (`R100`, `cmp` above).
- **5.3, the adaptation: committed** as `c453c4a` (`struct:`, "adapt the moved server files to the current framework (P1.2)"), 2026-11-01 19:30:28, staged by explicit path (`modules/php/Game.php`, `modules/php/UtilTrait.php`; never `git add -A`). Before the commit, `git diff --cached --stat -M` matched `p1.2-v2.diff` (`Game.php` 24, `UtilTrait.php` 6); afterwards `git show -M --format= c453c4a` is byte-identical to `p1.2-v2.diff` (`cmp`, 2026-11-02). The message was shown as text before the commit. It records the checks and the playtest report, including the two findings that aren't P1.2's and what was not run as separate steps (the root-file check, 1a's F5 and log check, 1e's count query). I added the root-file check to that list after showing the message, and said so before committing.
  - **`Game.php`:** `namespace Bga\Games\FirstAscent;` replaces `require_once('modules/utils.php')`; `class Game extends \Bga\GameFramework\Table` (was `class FirstAscent extends Bga\GameFramework\Table`); the nested functions `sortGear`, `sortFace`, `sortCrack` and `sortSlab` become the closures `$sortGear` and so on, taken by the four `array_filter` calls; `feException` in `zombieTurn` becomes `\Bga\GameFramework\VisibleSystemException`; and the material require in the constructor (next item). The header comment at line 11 still reads `firstascent.game.php`, left as it is on Jonathan's instruction.
  - **`UtilTrait.php`:** `namespace Bga\Games\FirstAscent;` after `<?php`; the two `\BgaSystemException` (`isPlayerZombie`, `debug_goToState`) become `\Bga\GameFramework\SystemException`. `dieLog` is unchanged.
  - **Changed lines:** 17 insertions and 13 deletions (`Game.php` 13 and 11, `UtilTrait.php` 4 and 2), against about 15 estimated in the design discussion and about 80 in the plan. Before the material fix it was 15 and 13.
  - **Start check and inventory re-run** (prompt §2; reported 2026-10-31): every result matched the record. HEAD `e3cf621`, level with `origin/main`, tree clean; `git diff --stat 322754e HEAD` touched only `progress.md` and `MIGRATION_PLAN.md`; `git ls-files modules/` listed `README`, `Utils.php`, `utils.js` (on disk `utils.php`); `--eol` `i/lf w/crlf` for both files; game file 350,331 bytes (CRLF 6,532), trait 69,086 (CRLF 1,412), no bare LF or CR. The game file's inventory matched exactly (42,286 tokens). The trait had 10,838 tokens against 10,699, every difference inside the inserted lines 1303–1326 (the tool commit) or a +24 line shift: the Debug attribute count 12→13; `new` of an already-qualified class 52→54 (`\Bga\GameFramework\SystemException` 12→13 at line 1306, and `\ReflectionClass` at 1310); callable- and name-taking built-ins 8→10 (`get_class` 1321, `get_parent_class` 1322); distinct built-ins 39→44 and call sites 121→129. One mismatch with the design expectation, which had one new `new` (51) and found two, because the guard's `throw new SystemException` is also in the inserted lines; nothing outside them, so not a stop.
  - **Checks that ran for real** (state after the material fix): `php -l` passes on both files (the known `${var}` deprecation is at `Game.php:2591`); the token check shows 8 residual clusters in `Game.php` (the 7 mapped to the go-ahead of 2026-10-31 plus the `require dirname ( __DIR__ , 2 ) . '/material.inc.php' ;` cluster at line 32, 10 tokens) and 3 in the trait, 42,286 → 42,302 tokens in `Game.php`; `technique_matching.php` passed all checks on 232,352 cases (24,192 + 188,160 + 20,000) and 13 named cases, identical to the baseline, and HEAD's file alone passes with the same counts (it runs the extracted allocation block, not the class); `Bga\Games\FirstAscent\Game` declared against a scratch copy of the `_ide_helper.php` stubs with my own autoloader (parent `Bga\GameFramework\Table`, trait loads, `COMMON_TRANSLATIONS` defined, 14 `debug_` methods with `debug_frameworkCheck` and its attribute); a PHP 8.4 test showing a string callable to a nested function throws a TypeError under a namespace, while a closure and a direct call both work; a scratch test of the `require` expression from a namespaced class under another working directory, which set the seven properties. **Only read:** the call-site breakdown, name resolution, the exception class names (checked against the stubs and the docs), the `dieLog` expectation. **Not run locally:** the class against the framework (the Studio playtest did that).
  - **The 21 call sites** (callable- or name-taking, as recorded at `fdf421b`):
    - Strings naming the nested functions (converted): 4 in the game file, 0 in the trait.
    - Strings naming built-ins (`intval` ×5, `strval` ×2): 3 and 4.
    - Closures or arrow functions: 3 and 2.
    - `$sortType` variables: 2 and 2.
    - No callback: 1 and 0.
    - Total 13 and 8 = 21. `debug_frameworkCheck` added 2 (`get_class($this)`, `get_parent_class($this)`), so 23 at HEAD; both take an object, so nothing to convert.
  - **The `$sortType` trace:** assigned once in each of `argSelectPortaledge` (`Game.php:5313`) and `drawFromPortaledge` (`UtilTrait.php:596`), both times a closure with `use ($type)`. No other assignment, so no value is a string naming a function.
  - **The 50 versus 52 count** (answered to Jonathan, nothing edited): the trait at `fdf421b` has 52 `new` of a class name starting with a backslash (2 `\BgaSystemException`, 12 `\Bga\GameFramework\SystemException`, 38 `\Bga\GameFramework\VisibleSystemException`). Session 1's "50" is the last two groups, and its "3 legacy" is the two `\BgaSystemException` plus `feException` (game file, line 6488), so 50 + 3 = 53 = 52 in the trait + 1 in the game file, with no double count.
  - **Line numbers:** `Game.php` lines shift by +2 from line 30 on (the material require), for example the `${var}` deprecation 2589 → 2591, the Portaledge log lines 2145, 2147 and 2760 → 2147, 2149 and 2762, and `getAllDatas`'s material reads 761–770 → 763–772; `UtilTrait.php` lines after line 3 shift by +2 (the namespace). My report after 5.3 said `Game.php` lines were unchanged by the adaptation (this file never said so); that held only until the material fix. No citation refresh in this step, as decided.
  - **The namespace's case:** the docs and `_ide_helper.php` don't settle how the framework derives the namespace and class from `firstascent`. Studio did: the warnings of the first attempt and 1b name `Bga\Games\FirstAscent\Game`, declared in `modules/php/Game.php`.
- **The material fix: committed** (inside `c453c4a`; a go-ahead outside the approved scope, quoted below).
  - **What it is:** two lines at `Game.php` 31–32, right after `parent::__construct()`: a comment and `require dirname(__DIR__, 2) . '/material.inc.php';`. It was applied by script with exact-match checks and CRLF kept.
  - **Why:** the first Studio attempt failed. The record of that attempt and of the go-ahead follows; the line-number correction is under 5.3 above.
  - **Studio attempt 1: Table 1 failed at creation** (Jonathan's report; the Studio reference is GS0 01/11 04:47:59; the code was as in `p1.2.diff`).
    - **First warning:** `Undefined property: Bga\Games\FirstAscent\Game::$asset_cards in modules/php/Game.php on line 326`, then `Trying to access array offset on null` at line 326.
    - **Loop and timeout:** later the same warning alternated between lines 709 and 713, the `while` loop of `drawStartingSpread` (`Game.php` 707–715 before the fix), until `Fatal error: Maximum execution time of 10 seconds exceeded`.
    - **Why the loop never ended** (my reading from the code; the Deck code isn't in the repo): the 37 `createCards` entries got `'nbr' => null`, so no asset card exists. The Spread is empty, `checkSpread()` (`UtilTrait.php:657–669`) returns false for an empty Spread, and nothing in the loop can add a card.
    - **What was missing:** the seven properties that the root `material.inc.php` sets (`pitches`, `summit_beta_tokens`, `shared_objectives`, `asset_cards`, `climbing_cards`, `personal_objectives`, `characters`) were not set on the namespaced class. Each is read (`Game.php` first at 326; `getAllDatas` sends all seven; `view.php` reads `shared_objectives` and `pitches`).
    - **Cause unknown.** The docs don't say who includes the root `material.inc.php` for a legacy main file: Material doc:7 says a root file "will be automatically loaded", doc:11 says it is "included by the constructor of your main game logic", and doc:200 says a file under `modules/php` is not included automatically. The legacy class had the same parent, `Bga\GameFramework\Table`, and `parent::__construct()` runs in both (`Game.php:30`), so that constructor is not ruled out as the one that included it.
    - **What the attempt also showed** (read from the order of the warnings, not from the full log; line numbers as deployed, before the fix): the framework found and constructed the namespaced class (the warnings cite `modules/php/Game.php`); trait methods ran before line 326 (`setGlobalVariable` first called at line 80); `getGameinfos()` (line 56) and the `player` insert (`DbQuery` at line 69) ran; the dynamic property `$this->cards_and_tokens` (line 37) raised no warning.
  - **Go-ahead outside the approved scope** (Jonathan, after the analysis of the failure), in his words: "Go-ahead for the material fix, as proposed: in modules/php/Game.php's constructor, right after parent::__construct(), the comment line and require dirname(__DIR__, 2) . '/material.inc.php';. It goes in the adaptation commit (struct:). Record this go-ahead in progress.md, since it's outside the scope I approved." A record of a go-ahead isn't a grant.
    - **Applied** (uncommitted when he gave the go-ahead; now in `c453c4a`): two lines at `Game.php` 31–32, a comment and `require dirname(__DIR__, 2) . '/material.inc.php';`. `Game.php` is now 350,578 bytes with CRLF 6,534; `UtilTrait.php` is unchanged (69,152 and 1,414).
  - **Result:** with the fix every table in the playtest was created, and setup and every page load read all seven material properties with no warning (Jonathan's report below). Who included the root `material.inc.php` for the legacy main file stays unknown, and the `Table` constructor is not ruled out.
  - **The corrections in the plan** (this session): §1.3 (the `material.inc.php` bullet and the namespacing pitfalls), §3.1, §9.4's row and P1.2's scope say what Studio showed: the failure without the require, and every table working with `require dirname(__DIR__, 2) . '/material.inc.php';` at `Game.php:32`. They say that who included the root file for the legacy main file is unknown and the `Table` constructor is not ruled out, and they state no new general rule. §9.4's row was kept in the corrections by Jonathan's decision of 2026-11-02 (item 4, quoted at `0217be6`).
- **The deploys** (Jonathan deploys; I don't). Tool: WinSCP, not the VS Code SFTP extension (his message of 2026-10-31 21:43).
  - **Deploy 1** (2026-10-31): `modules/php/Game.php` as in `p1.2.diff` (350,365 bytes, CRLF 6,532) and `modules/php/UtilTrait.php` (69,152 bytes, CRLF 1,414); the root `firstascent.game.php` and `modules/utils.php` deleted on Studio. After the upload he checked Studio's file list (his message of 2026-11-02, item 1): `modules/php/` holds `Game.php` and `UtilTrait.php`, and the two root files are gone. Table 1 then failed at creation (see the material fix).
  - **Deploy 2:** I told him to stop the failed table and use new tables; he re-uploaded `modules/php/Game.php` only (his message of 2026-11-02, item 2; the trait was unchanged). He didn't read its size, so Studio's size for that upload is not observed; the committed file is 350,578 bytes. His playtest report is headed "Studio, after the material fix".
  - **The CRLF sizes.** He said that if WinSCP converts line endings, the Studio sizes would be the LF ones (343,833 for `Game.php`, 67,738 for the trait). What he reported (2026-10-31 22:02): "WinSCP showed 343 KB for Game.php on both the local and remote sides; exact bytes weren't read." The conclusion that WinSCP kept CRLF rests on the two sides matching, not on the figure ("343 KB" can't tell the cases apart: 343,833 bytes is 343.8 KB, and 350,365 bytes is 342.2 KiB). The LF sizes were computed alternatives, not observed.
  - **From deploy 1 on,** Studio no longer holds the legacy file set. A legacy hotfix would also need §10's redeploy steps (`MIGRATION_PLAN.md`). Restoring the legacy pair is Jonathan's decision: re-upload `322754e`'s two files and delete the `modules/php/` files.
- **The playtest: run, reported.** Jonathan's own play on Studio, after the material fix, on new tables; as far as he recalls he restored no saves. The expected results came from the list in `MIGRATION_PLAN.md` (P1.2's Playtest), each tagged [S], [D] or [C]. His report, in full (2026-11-01 19:28; the instruction that follows it in the same message ("commit P1.2") is quoted at `0217be6`):

  > Playtest report (Studio, after the material fix). All results are from my own play; as far as I recall, I restored no saves. I played from a copy of the list from before v3, so the Studio root check, 1a's F5 and log check, and 1e's count query were not run as written.
  >
  > Table 1
  > - 1a: as expected.
  > - 1b: the reload worked, and the log line was exactly as expected.
  > - 1c: Studio's debug menu shows the names without the debug_ prefix (for example stackClimbingDeck). All 14 are present and there are no extras. Record the display as a finding: the list's expected text assumed the prefix.
  > - 1d: the board and everything on it as expected.
  > - 1e: the first query as expected (four piles, n = 7, within their ranges). The count query was not run; the full piles and the draws in 1h rule out a setup with no cards, but the total of 124 is unchecked. I'll run it on the next new table.
  > - 1f, 1g, 1h, 1i, 1j: as expected, no errors or warnings. In 1h, the line "\<Z> uses Lucky Chalkbag, rerolls a checkmark and successfully climbs the pitch" appeared. The resting player's draws matched their piles.
  > - U2's sample: every action in it worked.
  > - The root check and 1a's F5: not run as separate steps. Setup and every page load read all seven material properties, and no warning appeared.
  >
  > Table 2
  > - 2a to 2d: as expected, no errors or warnings.
  >
  > Table 3
  > - 3a, 3b: as expected.
  > - 3c: refused as expected, no reload, nothing changed. After the expected console error, a second one appeared: "Uncaught (in promise) {message: '', args: null}", at triggerDebug in ly_studio.js. Record it as a finding, from Studio's debug menu.
  > - 3d, 3e, 3f: as expected, no errors or warnings.
  > - 3g: the replay fails on the first "Next move": "During notification confirmCharacter: Cannot read properties of null (reading 'remove')", TypeError at Object.notif_confirmCharacter (firstascent.js:7579:65), through dispatchNotification, sendNextArchive and onArchiveNext in ly_studio.js. A replay of a production game (legacy build) fails the same way, so the bug predates P1.2.

  - **Not run as written:** the Studio root check (`material.inc.php` at the Studio root), 1a's F5 and log check, and 1e's count query (`SELECT COUNT(*) … WHERE card_type='asset'`, expected 124), because he played from a copy of the list from before v3. He says setup and every page load read all seven material properties with no warning (the root check and 1a's F5 were not run as separate steps), and that the total of 124 is unchecked until he runs it on the next new table. 2d says "the same SQL as 1e"; in the pre-v3 list that was the first query only, so I read his 2d as run without the count query (he didn't say).
  - **Where each result comes from:** his report, from his own play on Studio; not a Studio save/restore replay; plus code review for the sites that can't fire on Studio (`feException` → `VisibleSystemException` in `zombieTurn`, reached only for a zombie in an unsupported state; the two `\BgaSystemException` replacements; the class name `\Bga\GameFramework\SystemException`, checked against `_ide_helper.php` line 2326 and the docs, not run).
  - **Findings in it:** 1c (the menu shows the names without `debug_`), 3c (a second console error), 3g (the replay failure; the finding below).
- **U1–U3 and the other open points, as that report settles them** (my reading of the report; nothing separate was reported):
  - **U1 (which main file loads):** the namespaced class in `modules/php/Game.php` ran, not the legacy file. The warnings of the first attempt cite `Bga\Games\FirstAscent\Game` and `modules/php/Game.php`, and 1b's log line was "exactly as expected" (class `Bga\Games\FirstAscent\Game`, file `modules/php/Game.php`; the legacy file printed `FirstAscent` and `firstascent.game.php`). U1 was avoided as planned, not tested with both files present: the root `firstascent.game.php` was deleted on Studio (his message of 2026-11-02, item 1; see "The deploys" above), so what the framework does when both files exist is not shown.
  - **The trait by autoload:** it loaded. In the first attempt trait methods ran before the failing line (`setGlobalVariable` is first called at line 80, the failure was at 326), and every table after the fix played. The `require_once __DIR__ . '/UtilTrait.php'` fallback was not needed and was never proposed.
  - **U2 (`action.php` dispatch):** "U2's sample: every action in it worked."
  - **U3 (`view.php` and the `.tpl`):** 1d ("the board and everything on it as expected") and 2a (the forest board).
  - **`dieLog`:** it resolved under the namespace. In 1h the line `<Z> uses Lucky Chalkbag, rerolls a checkmark and successfully climbs the pitch` appeared, and `dieLog` builds it. §1.3's correction is worded from this (done in this session).
  - **The Portaledge piles** (the four closures' output): 1e's first query as expected (four piles, n = 7, within their ranges), and the resting player's draws matched their piles in 1h.
  - **The done criterion** ("a game plays end to end, and `debug_frameworkCheck` reports `Bga\Games\FirstAscent\Game`"): met by 1b and by Table 3, which was shortened with `debug_endGameSoon` (called in 3d) and reached final scoring and the end of the table (3f).
- **Findings 1c and 3c** (both from Jonathan's report): 1c, Studio's debug menu shows the 14 function names without the `debug_` prefix (all present, none extra); 3c, after a refused debug call and its expected console error, Studio's own code logged a second one, `Uncaught (in promise) {message: '', args: null}` at `triggerDebug` in `ly_studio.js`. Recorded in P1.2's Status in the plan (as results lines; 1c's expected text is left as the record of what was predicted) and in `BGA_PITFALLS.md` under "Test-table friction".
- **Finding, predates P1.2: a replay fails on the first "Next move"** (3g). Jonathan's report: "During notification confirmCharacter: Cannot read properties of null (reading 'remove')", a `TypeError` at `Object.notif_confirmCharacter` (`firstascent.js:7579:65`), through `dispatchNotification`, `sendNextArchive` and `onArchiveNext` in `ly_studio.js`. A replay of a production game (the legacy build) fails the same way, so the bug is in the client code that existed before P1.2. P1.2 changed no client file. Read-only investigation, nothing edited; line numbers are for `firstascent.js` and `modules/utils.js` at `c453c4a` (the same as at HEAD before it).
  - **In short.** The six sites that read or remove an element only a click creates are `notif_confirmCharacter` (`firstascent.js:7579`, the reported failure), `notif_riskShowAssets` (8450–8452), `notif_riskReturnAssets` (8569–8572), `notif_confirmYourRequirements` (8954–8955), `notif_confirmAddTokenToPitch` (10644–10650) and `notif_bomberAnchorCleanup` (12983–12985). `replay-fix-proposal.diff` guards them with `?.` (nine lines; not applied). Three questions stay open: whether the viewer's private notifications are in the replay archive; whether `onEnteringState` and `onUpdateActionButtons` run in a replay; whether the non-animated (instantaneous-mode) branches are complete. The details follow.
  - **1. What 7579 removes, where it is created, why it is missing:**
    - Line 7579 is `document.querySelector('.character_placeholder').remove();` in `notif_confirmCharacter` (7422), inside the branch `if (this.isCurrentPlayerActive())` (7576). Column 65 in the stack is the `.remove` call; `querySelector` returned `null`.
    - The only place that creates `.character_placeholder` is `onSelectCharacter` (3034): `placeholder.className = 'character_placeholder'` (3086), put into the page with `character_ele.before(placeholder)` (3088). That function is a click handler: `onEnteringState` for `characterSelection` binds it with `ele.onclick = bound_handler` (1859–1863), and it runs only if `checkAction('selectCharacter')` passes (3037). The class name appears elsewhere only in the CSS (`firstascent.css:2671`).
    - In live play, `notif_confirmCharacter` reaches 7579 only for the player who is active, and that player has just clicked a character, so the placeholder exists. In a replay nobody clicks: the replay sends the archived notifications back to the page ([D] Replay doc:5–13), so the placeholder is never built. The trace also shows that `isCurrentPlayerActive()` was true in the replay at that point (the exception is inside that branch): the framework treated the viewer as the active player, so the viewer's own perspective is replayed. That `isCurrentPlayerActive()` is true in a replay is read from this stack, not from a doc.
    - The handler is not `async` and its release call, `this.notifqueue.setSynchronousDuration()` (7600, 7610), comes after 7579, so the throw also strands the queue. It is the same class as the freezes in `DECISIONS.md` (line 67, "Loud": an exception before the handler's release call).
  - **2. Other handlers that are likely to fail the same way.**
    - **How I looked:** I split the 67 `notif_` handlers (66 in `firstascent.js`, plus `notif_confirmRequirements` in `modules/utils.js:2276`) and listed the lines that branch on the viewer (`isCurrentPlayerActive`, `this.player_id`) or dereference `document.querySelector(...)` or `dojo.query(...)[0]` with no guard. I read each hit. Then I listed the client properties assigned only in click handlers and read in notification handlers. The scripts are in code session 2's scratchpad (`notif_survey.php`, `state_props.php`, `enclosing.php`). It is a static reading; no replay was run.
    - **Same mechanism, would throw** (an element that only a click creates is read or removed with no guard; `.selected_pitch` is added by the click handler `onSelectPitch`, `firstascent.js:3316`, and, after F5, by `setup` for the Risk it pitch, 1337):
      - `notif_confirmYourRequirements`, 8954–8955: `dojo.query('.selected_pitch')[0].nextElementSibling…` and `….classList.remove('selected_pitch')`, no branch. It is the private notification of the climber, so it runs at every climb by the viewer. This is the most likely next failure.
      - `notif_riskShowAssets`, 8450–8452: inside `if (this.isCurrentPlayerActive())`, `document.querySelector('.selected_pitch').nextElementSibling`, then `selected_pitch.classList`.
      - `notif_riskReturnAssets`, 8569–8572: inside `if (player_id == this.player_id)` (`player_id` is `getActivePlayerId()`), `document.querySelector('.selected_pitch').classList.remove(…)`.
      - `notif_confirmAddTokenToPitch`, 10644–10650: inside `if (notif.args.player_id == this.player_id)`, the same two lines as 8954–8955.
      - `notif_bomberAnchorCleanup`, 12983–12985: inside `if (this.isCurrentPlayerActive())`, `$('bomber_anchor_counter').remove()`. That element is created by the click handler `onConfirmSummitBetaBomberAnchor` (5673–5681); the removal in `onUndoSummitBeta` (6304–6305) is guarded, this one is not.
    - **Wrong text, no throw:** `notif_confirmOpponentRequirements` (8791) and `notif_confirmYourRequirements` (8937) read `this.utils.trifecta_selections[player_id]`, a map that only a click fills (`modules/utils.js:1935`, in `chooseTrifectaOption`). In a replay the Trifecta drawer would read "undefined". The same holds in live play for a client that did not click; I haven't checked that on Studio, and it is not part of this finding.
    - **Looked at and not candidates:** `.selected_resource` (11233 is guarded by a length test; the others are `forEach`); the many reads of `#climbing_discard_straightened` (the container is built in `setup`, 530, and the card in it by earlier notifications); `enableSummitBetaTokens`, `checkRequirements`, `checkPotential` and `resetStateOnSummitBeta`, which read `.selected_pitch`, are called from no `notif_` handler (grep); the `isCurrentPlayerActive()` branches in `notif_drawClimbingCard`, `notif_confirmCrimperClimbingCard`, `notif_summitBetaChoices`, `notif_confirmEnergyDrink`, `notif_useSpiderStick` and `notif_confirmRequirements` (`utils.js:2305`) only bind handlers or use elements that notifications build (I found no click-created element in them); `delete this.jesus_piece_requirements` (13076) is safe on a missing property.
    - **Could a replay run to the end after a fix at 7579 alone?** Not if the viewer climbs: `notif_confirmYourRequirements` would then be the next throw, and the others when the game has a Risk it, an Add-token effect or a Bomber Anchor by the viewer. Whether it runs to the end after all of them are guarded I can't say from the code. Three things are open:
      - Whether private notifications are in the viewer's archive: the Replay doc says "All notifications sent to the browser are added to the archive" ([D] Replay doc:11) and doesn't say whose browser. If they are not, `notif_confirmYourRequirements` never runs, and the viewer's own climbs would not show at all (the public notification is ignored for the viewer by `setIgnoreNotificationCheck`, 7260).
      - Whether `onEnteringState` and `onUpdateActionButtons` run in a replay: the docs I have don't say; the stack shows only the notification path.
      - The non-animated branches: `shouldAnimate()` is false when `instantaneousMode` is on (`utils.js:1291–1293`), which a replay uses to fast-forward ([D] Game.js doc:2122–2124). In live play those branches run only in a hidden tab. I read some (for example 9163, 13212, 13337) and they look complete; I did not read them all.
    - **Cost of each trial:** replays use the static files archived at game start ([D] Replay doc:9–13), so a client fix reaches only games created after the deploy, and each trial needs a new finished game (Table 3 shape, `debug_endGameSoon`). That is the reason to guard all five places in one change and not one per trial.
  - **3. The smallest fix, as a diff, not applied:** `D:\Documents\BGA Studio\replay-fix-proposal.diff` (63 lines; `firstascent.js | 18`, 9 insertions, 9 deletions). It turns the unguarded dereference into `?.` at nine lines in six places: 7579, 8451–8452, 8572, 8954–8955, 10649–10650, 12985. The idiom is already used in this file (`document.getElementById('sprite_preloader')?.remove()`, 1869). `git apply --check --cached` passes on the index; the file is LF only. It is the smallest set I can show by reading; I cannot show that it is enough (the three open points above).
    - **Live play:** unchanged where the element exists, which is every path I traced: the active player always clicked first (character, pitch, Bomber Anchor), and after F5 the Risk it pitch gets `selected_pitch` again in `setup` (1337). Where the element is missing, the old code threw before the handler's release call (the "Loud" freeze class); the new code continues. I did not trace whether F5 in the middle of the Bomber Anchor flow can reach 12985 with no counter, which would be a live throw today. A gate on replay mode (`g_archive_mode`) instead would be a larger change and would leave the same defect reachable in live play.
  - **Plan effect, not edited:** F13 (§8.1) is repeated in P1.3, P2.2, P2.6, P3.5, P4.1 and P7.3 (§8.4); none of those can pass while a replay stops at the first move. D9 folded F13 into P1 as a check of the replay's fallback warnings; this finding says the replay check can't pass on the current client.
  - **Decision on the timing** (Jonathan, his message of 2026-11-02, item 5, quoted at `0217be6`; his message of 2026-11-01 23:52 had listed it under "Pending decisions"): the replay fix is its own `fix:` commit, in its own session, after P1.2's closing docs and before P1.3. Open: the go-ahead for `firstascent.js`, which comes with that session's prompt, and whether the proposal is enough. Nothing was changed. My recommendation, given on 2026-11-01 with the finding, was the same: apply `replay-fix-proposal.diff` as its own commit before P1.3 and test it with a new Table-3-shaped game created after the deploy.
  - **Recorded in this session:** `TODO.md` has an entry for the replay bug (Jonathan's decision of 2026-11-02, quoted below). F13's repeats in P1.3, P2.2, P2.6, P3.5, P4.1 and P7.3 are not edited: the replay fix session updates them. P1.2's Status in the plan records F13's result as it is: not passed.

**This session: the closing docs** (2026-11-02; transcript `9beef41f-…`). Docs only: no code file was edited and nothing was deployed. Jonathan's go-aheads for it are quoted in full further down.
- **Start check** (read-only, step A of the prompt): `git fetch origin` brought nothing new. HEAD `0217be6`; `git rev-list --left-right --count origin/main...HEAD` gave `0 0`; `git status` clean; `p1.2-docs.diff` did not exist. All as expected. Two extra checks: `git show 0217be6` for `progress.md` and `MIGRATION_PLAN.md` is byte-identical to `p1.2-wip2-docs-v2.diff` (580 lines, `cmp`); and `CLAUDE.md` is `i/lf w/lf` while the five other docs are `i/lf w/crlf` (`git ls-files --eol`).
- **The searches** (`CLAUDE.md` and `misc/docs/*.md`, not `misc/docs/bga/`, not older `progress.md` entries; line numbers are those before this session's edits):
  - **T23 and the strict-mode issue:** `TODO.md:57`; `MIGRATION_PLAN.md:608–609` (P1.2 Carries), `:625` (P1.3 Repros), `:1647` (§8.4 row), `:1894` (§13 D9); `DECISIONS.md:38` (D9). Other mentions: `MIGRATION_PLAN.md:109`, `:336`, `:1584`, `:1826`, `:1845` and `DECISIONS.md:55`. Not hits, because they are other "strict" issues: `MIGRATION_PLAN.md:514` (`declare(strict_types=1)`), `:714–718` (P3.1, JS strict mode) and `TODO.md:88` (implicit JS globals). No hit in `CLAUDE.md`, `PROCEDURES.md`, `BGA_PITFALLS.md`, `RULES_CHECK.md`, `FREEZE_INVESTIGATION.md` or `UX_CHANGES.md`. Excluded and not edited: older `progress.md` entries (lines 968, 1087, 1103 and 1170 at `0217be6`).
  - **The two old paths in `PROCEDURES.md` and `BGA_PITFALLS.md`:** none. The only hit is the BGA doc title "Main game logic_ Game.php" at `BGA_PITFALLS.md:40`, which is not an old path. Nothing to edit. (They also remain in baseline citations elsewhere: `MIGRATION_PLAN.md` 50 lines, `RULES_CHECK.md` 4, `FREEZE_INVESTIGATION.md` 2, `DECISIONS.md` 1; no citation refresh, as decided.)
  - **The `php:` notation** is defined at `MIGRATION_PLAN.md:9–21` (the short-names table). `RULES_CHECK.md`, `TODO.md` and `BGA_PITFALLS.md` use the prefix without defining it. `FREEZE_INVESTIGATION.md:17` has its own definition (`php:`, and `utils:` for `modules/utils.js`); it is left as it is.
- **T23 is dropped. This is Jonathan's judgement, not a verified fact:** the item comes from a forum post from 2020, he judges the issue benign, and its cause was never traced. It is recorded that way in `DECISIONS.md` (D9's amendment, and the sentence at line 55), in the plan (Summary's D9 line, P1.2's Carries, P1.3's Repros, §8.1's T23 row, §8.4's T23 cells, §13's D9 line) and here. `MIGRATION_PLAN.md:336`, `:1826` and `:1845` are history and were left. The `TODO.md` entries for T23 and T24 are removed; §8.4's T24 cells say fixed (`0bce03f` renames `Utils.php` to `UtilTrait.php`; `c453c4a` deletes the `require_once`).
- **Decisions applied** (the prompt's §4, decisions 1 to 5, and Jonathan's reply to stop A):
  - **1c and 3c:** results lines in P1.2's Status (plan); two bullets in `BGA_PITFALLS.md` under "Test-table friction" (neither finding was in that file). 1c's expected text is not edited.
  - **The replay bug:** an entry at the end of "Client bugs" in `TODO.md`. F13's repeats are not edited (the replay fix session updates them). 2d is not edited: the count query (expected 124) stays unchecked in P1.2's record and runs on the replay fix session's new game.
  - **The material corrections:** §1.3, §3.1, §9.4's row and P1.2's scope (see "The corrections in the plan" under the material fix). U1, U2 and U3 results are in §1.2, §1.3 and §1.7.
  - **The `php:` note** is under the short-names table, in the wording Jonathan gave.
  - **`CLAUDE.md`:** the paths and the wording he approved on lines 9, 17, 19 and 20, nothing else.
  - **Corrections after his review of `p1.2-docs.diff`** (his message, quoted below; the result is `p1.2-docs-v2.diff`), items 1 to 7 in the plan and item 8 here:
    - P1.2's Status: the count query is now "Not run", separate from "Not run as separate steps" (the root check and 1a's F5 and log check); "no errors or warnings" appears only for 1f to 1j, 2a to 2d and 3d to 3f, and 1a, 1b, 1d, 3a and 3b are "as expected".
    - "Done when" in the plan's Status, and the done-criterion line above, say that Table 3 was shortened with `debug_endGameSoon`, called in 3d. "Met" stands.
    - §9.4's row, §1.3's "The docs don't settle it:", U2 as "at least 7 of the 25 actions" (§1.2 and §1.7), and the explicit material require added to §1.3's "Consequence" line.
    - The model line (below).
  - **Correction after his review of `p1.2-docs-v2.diff`** (his message, quoted below; the result is `p1.2-docs-v3.diff`): in §9.4's row of the plan the word "either" is deleted, because it suggested the `modules/php` file had been tried. The sentence now reads: "On Studio (P1.2) the root file was not included for the namespaced `Game` until `Game.php:32` required it; a file under `modules/php` was not tried."
  - **`CLAUDE.md`'s working copy is LF** (`i/lf w/lf`), unlike the other docs (`i/lf w/crlf`). This commit keeps each file's endings as they are: the edit script detects a file's ending and aborts on a mixed one, and `CLAUDE.md` has no CR before or after (6,056 → 6,214 bytes, 51 lines both times). Git warns "LF will be replaced by CRLF the next time Git touches it" for that file, because of the repo's `core.autocrlf`; the index stays LF, as before.
- **`CLAUDE.md` line 17: how the figures were computed.** "~6.5k lines, 351 KB" for `Game.php` at `c453c4a` (the committed file): 6,534 lines (`wc -l`; the blob and the working copy have the same line count) and 350,578 bytes in the working copy (CRLF, as checked out), 350.6 KB in decimal units, rounded to 351. The convention is inferred from the first commit of `CLAUDE.md` (`071c550`): decimal KB (bytes ÷ 1000, rounded) of the file as checked out, lines to 0.1k. There `modules/utils.js` (blob 215,435 bytes + 4,856 lines for CRLF = 220,291) gave "220 KB", `firstascent.game.php` (357,138 + 6,766 = 363,904; 6,766 lines) gave "~6.8k lines, 364 KB", and `material.inc.php` (LF, 166,601) gave "167 KB". The convention isn't uniform: `firstascent.js`'s "727 KB" matches its blob size (726,633), not the CRLF size. Not computed that way: the `Game.php` blob is 344,044 bytes (344 KB). The other rows are not refreshed (for example `firstascent.js` is now 742,886 bytes on disk), as decided: nothing else in `CLAUDE.md`.
- **The edits** (step B), by script with exact-match checks: the script plans every edit first (each old text must occur exactly once, at its turn) and writes only if all succeed. The corrections after the first and second reviews were further passes of the same kind (`edit_docs_v2.php` and `edit_docs_v3.php` for the plan; `build_progress.php` re-run for this entry). Bytes before → after (the final state), CRLF count before → after:
  - `TODO.md`: 11,578 → 11,673; 88 → 87 (2 edits: the T23 and T24 entries out, the replay entry in).
  - `DECISIONS.md`: 14,418 → 14,763; 120 → 121 (2 edits: D9's amendment, the sentence at line 55).
  - `BGA_PITFALLS.md`: 3,002 → 3,355; 40 → 42 (1 edit: the two bullets).
  - `CLAUDE.md` (LF): 6,056 → 6,214; 51 → 51 lines (4 edits).
  - `MIGRATION_PLAN.md`: 194,723 → 201,012; 1,928 → 1,949 (18 edits, then 8 more after the review of `p1.2-docs.diff`, then 1 more after the review of `p1.2-docs-v2.diff`).
  - `progress.md`: this entry, built by script from the in-progress entry (verbatim line ranges with their first words checked, plus new text). Its counts and the diff's line count and `--stat` are in my report.

**Go-aheads of this session, quoted in full** (a record of a go-ahead isn't a grant). The session prompt's §2 let it edit `progress.md`, `MIGRATION_PLAN.md`, `TODO.md`, `DECISIONS.md` (D9 only), `BGA_PITFALLS.md` (only the two lines of decision 1 in §4) and `CLAUDE.md` (only within the go-ahead quoted in §4); any other file, or any other part, needed Jonathan's go-ahead. Its §5 set the order: A, read-only, then stop; B, the edits after his go-ahead; C, the diff, then stop; D, after "commit docs". Its §4 follows, in full.

> ### Quoted in full from the in-progress entry
>
> From §3 of the prompt of 2026-10-30 (code session 1), its closing-docs items:
>
> > "**T23 is dropped** (Jonathan's decision, 2026-10-30). The item comes from a forum post from 2020, and Jonathan judges the issue benign. Record it as his judgement, not as a verified fact."
>
> > "Search `CLAUDE.md` and `misc/docs/` (not `misc/docs/bga/`, not older `progress.md` entries) for every other mention of T23 or the strict-mode issue. Report the hits, and edit them only after my go-ahead."
>
> > "**`CLAUDE.md`:** the file-map rows, and any sentence, that name `firstascent.game.php` or `modules/utils.php` get the new paths. Nothing else in `CLAUDE.md`."
>
> > "**The `php:` citation prefix:** keep it, and add a note that from P1.2 on it means `modules/php/Game.php`, and that `utils.php:` citations written before P1.2 refer to the file that is now `modules/php/UtilTrait.php`. Find where the doc notation is defined, if anywhere. If it isn't defined anywhere, propose a place and wait."
>
> > "**No citation refresh in this step:** the adaptation shifts lines by only a few."
>
> > "**`TODO.md`:** also remove the "Server bugs" entry about `firstascent.game.php` requiring `modules/utils.php` while git tracks `modules/Utils.php` (T24), now resolved."
>
> > "**Other docs:** search `PROCEDURES.md` and `BGA_PITFALLS.md` for the two old paths and report the hits. Edit them only after my go-ahead."
>
> > "**Playtest scope for U2** ("every action still works"): a sample of actions proves the `action.php` dispatch, plus a targeted check for every site the adaptation changed. Not a full list of actions."
>
> > "Record any further go-ahead I give in the progress.md entry. A record of a go-ahead isn't a grant."
>
> The T23 drop covers the places the entry's checklist lists: the TODO.md "Server bugs" entry on the strict-mode issue; T23 in P1.2's "Carries (D9)" and in P1.3's "Repros" (F13 stays in both); §8.4's T23 row; §13's D9 line; and D9 in DECISIONS.md, amended with the drop, the date and the reason, with F13 staying folded into P1.
>
> From my message of 2026-10-31 before 5.1, item 3:
>
> > 3. dieLog stays unchanged. Go-ahead for the closing docs: correct §1.3's "namespacing pitfalls" in MIGRATION_PLAN.md: four nested functions (sortGear, sortFace, sortCrack, sortSlab) passed as string callables become closures; dieLog is called directly. Word what dieLog does under the namespace from the Lucky Chalkbag playtest result, not from the inference.
>
> From the material go-ahead of 2026-10-31 23:23, item 4:
>
> > 4. Add to the closing docs (section 8), for the MIGRATION_PLAN.md edits:
> >    - correct §1.3's "stays auto-included" and §3.1's "where it is auto-included" from the Studio result;
> >    - add the explicit require to P1.2's scope.
> >    Show the wording in the docs diff for my review.
>
> From my review of 2026-11-02, item 4:
>
> > 4. §9.4's row: keep it in the corrections, with §1.3 and §3.1. Its fact column ("only the root material.inc.php is" auto-included) is contradicted by the Studio result too: the root file wasn't included for the namespaced class. Mark it decided.
>
> ### My decisions of 2026-11-02 for these closing docs
>
> These are new. This prompt is their record.
>
> 1. **The 1c and 3c findings.**
>    - Record each as a results line in P1.2's status in MIGRATION_PLAN.md.
>    - Add one line each to misc/docs/BGA_PITFALLS.md, in its Studio section (propose another place if none fits):
>      - Studio's debug menu lists the debug functions without the debug_ prefix (seen on Studio in P1.2, 1c: all 14 present, none extra).
>      - After a refused debug call, Studio's own code may log a second console error, "Uncaught (in promise) {message: '', args: null}" at triggerDebug in ly_studio.js (seen on Studio in P1.2, 3c).
>    - If BGA_PITFALLS.md already says either, report it instead of adding a line.
>    - Don't edit 1c's expected text. P1.2's playtest list stays as the record of what was predicted.
> 2. **A TODO.md entry for the replay bug**, kept minimal, in the client bugs section (propose a place if there's none). It says:
>    - a replay of a finished game stops at the first move, with a TypeError in notif_confirmCharacter (firstascent.js:7579, from the console in my playtest report);
>    - this happens on Studio and on a production game, so it predates P1.2;
>    - it is what F13 checks;
>    - the details are in P1.2's progress.md entry;
>    - planned fix: its own fix: commit, in its own session, after P1.2's closing docs and before P1.3.
>    The fix session removes the entry with its fix.
> 3. **F13's repeats** in P1.3, P2.2, P2.6, P3.5, P4.1 and P7.3 are not edited now. The replay fix session updates them. P1.2's status records F13's result as it is.
> 4. **2d is not edited.** The asset count query (expected 124) stays unchecked in P1.2's record. It will run on the replay fix session's new game, and that session's entry records the result.
> 5. **The final progress.md entry is condensed.** It keeps the facts, results, findings, decisions and state, and points to 0217be6 for the full quotes of code session 2's go-aheads. The outline comes at the first stop (§5, step A).
>    - Kept in full: the replay finding (the six sites with their citations, the three open questions, and replay-fix-proposal.diff's status: a proposal, not applied, not yet reviewed in a design discussion), the material record and the pending decisions.
>    - This session's go-aheads (this prompt's §4 and anything I add) are quoted in full.
>    - Code session 1's record: the checklist says to keep it. If you think it should be condensed too, propose that in the outline. I decide.

His reply to stop A (2026-11-02), in full:

> Stop A reviewed. Go ahead with step B, then C, on these decisions. Record this message in the entry, quoted in full.
>
> 1. The outline is approved, with these changes:
>    - "Next" also says that the asset count query (expected 124) runs on the replay fix session's new game, and that the replay fix session updates F13's repeats (decisions 3 and 4 of the session prompt).
>    - "This session" states the T23 drop as my judgement, not a verified fact.
>    - Code session 1's "Go-aheads and decisions" block: condense it to a pointer to 0217be6, as you propose. The rest of its record stays.
>    - Record that CLAUDE.md's working copy is LF (i/lf w/lf), unlike the other docs, and that this commit keeps its endings as they are.
>
> 2. T23, the extra mentions. Go-ahead for:
>    - MIGRATION_PLAN.md:109, worded to match §13's D9 line;
>    - MIGRATION_PLAN.md:1584: keep the row, marked dropped on 2026-10-30, as my judgement (D9);
>    - DECISIONS.md:55, as you propose, also naming the date and that it was my judgement.
>    Leave lines 336, 1826 and 1845. §8.4's T23 cells and P1.3's Repros as you propose.
>
> 3. The php: note, under the short-names table, in this wording:
>    > The table gives the names at the baseline. From P1.2 on, `php` means `modules/php/Game.php` and `utils.php` means `modules/php/UtilTrait.php`: the same two files, moved in P1.2. Citations written before P1.2 keep their prefix and point to the same code; their line numbers are not refreshed.
>    Leave FREEZE_INVESTIGATION.md's own definition.
>
> 4. CLAUDE.md:
>    - Line 9, reworded:
>      > - **Now:** partway through the migration (the current step is in `misc/docs/progress.md`); no class structure yet. The code is two giant files (client `firstascent.js`, server `modules/php/Game.php`, moved into the current file layout in P1.2), with states in `states.inc.php`, actions in `firstascent.action.php`, and layout in `.tpl`/`.view.php`.
>    - Line 17: the path, and the class as you propose. Update the line count and size from the committed file, in the convention the other rows use, and say in the entry how you computed them.
>    - Lines 19 and 20: as you propose.
>    Nothing else in CLAUDE.md.
>
> 5. Placements, as you propose:
>    - BGA_PITFALLS.md: the two bullets under "Test-table friction", as you wrote them;
>    - TODO.md: the replay entry at the end of "Client bugs";
>    - P1.2's status: the bullet first in the step, as in P1.1.
>
> 6. Model: this session runs on is Sonnet 5.5 Extra.
>
> Then write p1.2-docs.diff and stop as in §5, step C.

His review of the first docs diff, `p1.2-docs.diff` (2026-11-02), in full:

> The docs diff is approved with these corrections. Make them by script with exact-match checks (keep each file's endings), write "D:\Documents\BGA Studio\p1.2-docs-v2.diff" (don't overwrite p1.2-docs.diff), and give its line count and --stat. No other edits.
>
> 1. P1.2's Status, results: separate the count query from the steps covered implicitly.
>    - "Not run: 1e's count query (the asset total, expected 124). It is unchecked and will run on the replay fix session's new game."
>    - "Not run as separate steps: the Studio root check and 1a's F5 and log check. Setup and every page load read all seven material properties with no warning."
>
> 2. P1.2's Status, results: "with no errors or warnings" only where my report said it (1f to 1j, 2a to 2d, 3d to 3f). 1a, 1b, 1d, 3a and 3b were "as expected".
>
> 3. Done when, in the plan's Status and in the entry's done-criterion line: say that Table 3 was shortened with debug_endGameSoon, citing the step that calls it. "Met" stands.
>
> 4. §9.4's row, the docs column, after the doc citation:
>    > On Studio (P1.2) the root file was not included for the namespaced `Game` either, until `Game.php:32` required it; a file under `modules/php` was not tried. Kept in this table by Jonathan's decision of 2026-11-02; see §1.3.
>
> 5. §1.3: "The docs conflict:" becomes "The docs don't settle it:". The rest of that sentence stays.
>
> 6. U2 in §1.2 and §1.7: the sample is "at least 7 of the 25 actions" (the playtest list's count, from the code), not "7".
>
> 7. §1.3's "Consequence" line: add the explicit material require to the list of what P1.2 is.
>
> Record this message in the entry, quoted in full. Then stop for my review before "commit docs".
>
> 8. The model line for this session: "Sonnet 5.5, at the Extra effort level". "Extra" in my answer to stop A was the effort setting, not a model variant, so your context's Sonnet 5.5 agrees with it. Keep my stop-A reply quoted as it is.

His review of the second docs diff, `p1.2-docs-v2.diff` (2026-11-02), in full:

> p1.2-docs-v2.diff is approved with one correction. In §9.4's row, delete the word "either", so the sentence reads "On Studio (P1.2) the root file was not included for the namespaced `Game` until `Game.php:32` required it; a file under `modules/php` was not tried." The word was in my wording and suggested the modules/php file had been tried.
>
> Make it by script with an exact-match check (keep CRLF), add one line about it to the entry's corrections, and record this message there, quoted in full. Write "D:\Documents\BGA Studio\p1.2-docs-v3.diff" (don't overwrite v2), give its line count and --stat, and stop for my review before "commit docs". No other edits.

**Go-aheads of code sessions 1 and 2** (condensed; each is used unless it says otherwise). The full quotes are in `git show 0217be6:misc/docs/progress.md`: the block "Go-aheads" (line 199 there) for code session 2 and "Go-aheads and decisions" (line 418) for code session 1. The ones that were still to use when this session began are quoted in full above (the prompt's §4).
- **Code session 2:**
  - 2026-10-31 15:58, the session prompt: the go-ahead to start 5.2 if every start-check result matched; its rules for commits and push (the rename commit, then the adaptation commit, explicit paths, messages shown first, push only after "push"), for the closing docs, and that approvals name their action.
  - 2026-10-31 21:43: the code diffs approved as reviewed (`p1.2-move.diff`, `p1.2.diff`), not "commit P1.2"; the header comment at `Game.php` line 11 left as it is; the 50-versus-52 explanation; the playtest-list diff; the WinSCP record.
  - 2026-10-31 22:02: the playtest list approved with five changes (`p1.2-playtest-v2.diff`); the WinSCP note corrected.
  - 2026-10-31 22:59, Table 1 failed: a limit, not a go-ahead ("Change no code yet"), and a request to propose the fix as an exact diff.
  - 2026-10-31 23:23, the material go-ahead, outside the approved scope (quoted in the material fix above): items 1 to 3 used (the fix, `p1.2-v2.diff`, `p1.2-playtest-v3.diff`, the records); item 4 (the §1.3 and §3.1 corrections, the explicit require in P1.2's scope) used in this session.
  - 2026-11-01 19:28, "commit P1.2" (the two commits, messages shown first, no push) and the three read-only questions about `firstascent.js:7579`.
  - 2026-11-01 23:52, "push" (the two code commits) and the rollover instruction.
  - 2026-11-02, the review of `p1.2-wip2-docs.diff`: five corrections (the Studio file list; deploy 2; the approvals of `p1.2-v2.diff` and `p1.2-playtest-v3.diff`, given before the redeploy and recorded then; §9.4's row kept; the replay fix's timing).
- **Code session 1:** the pre-5.1 go-ahead (the exception mapping, the autoload with the fallback held back, `dieLog` unchanged, the closures), the `TODO.md` restore (`git checkout -- misc/docs/TODO.md`), "commit P1.2 tool" and "push" (used); the closing-docs items of its §3 (used in this session; quoted above).

**Files outside git**
- **In `D:\Documents\BGA Studio\`** (line counts re-checked with `wc -l` on 2026-11-02):
  - **Code session 1:** `p1.2-tool.diff` (35 lines; the tool commit, committed as `322754e`; the staged diff was identical, `cmp`) and `p1.2-wip-docs.diff` (178 lines; committed as `e3cf621`). The P1.1 diffs are unchanged.
  - **Code session 2, current:**
    - `p1.2-move.diff` (8 lines): the rename commit as committed (`0bce03f`). Approved.
    - `p1.2-v2.diff` (88 lines, +17/−13; `Game.php` 24, `UtilTrait.php` 6): the adaptation as committed in `c453c4a` (byte-identical, `cmp`). Approved in his review before the redeploy; his message of 2026-11-02, item 3, is the record.
    - `p1.2-playtest-v3.diff` (95 lines, +78/−6): P1.2's playtest list in the plan. Approved the same way. Committed in `0217be6`.
    - `p1.2-wip2-docs-v2.diff` (580 lines): the in-progress entry and the playtest list. Committed as `0217be6` (byte-identical to that commit's patch of the two files, `cmp`).
    - `replay-fix-proposal.diff` (63 lines; `firstascent.js` 9 insertions, 9 deletions): the replay fix. **A proposal, not applied, not yet reviewed in a design discussion.** LF only, and valid against `firstascent.js` at `c453c4a` (`git apply --check --cached` passed; P1.2 did not change the file).
  - **Superseded, not overwritten:** `p1.2.diff` (79 lines; by `p1.2-v2.diff`; it is the code that failed at table creation), `p1.2-playtest.diff` (85) and `p1.2-playtest-v2.diff` (90) (by `p1.2-playtest-v3.diff`), `p1.2-wip2-docs.diff` (565; by `p1.2-wip2-docs-v2.diff`).
  - **This session:** `p1.2-docs.diff` (856 lines), the closing docs as first written; approved with corrections and **superseded by `p1.2-docs-v2.diff`** (891 lines; approved with one correction and **superseded by `p1.2-docs-v3.diff`**). Neither was overwritten. The line count and `--stat` of the v3 diff are in my report.
  - `firstascent-overrides\` is untouched.
- **Scratchpads** (outside the repo; `C:\Users\Jonat\AppData\Local\Temp\claude\D--Documents-BGA-Studio-firstascent\<session id>\scratchpad\`):
  - **Code session 1** (`2eb67ffe-…`): listed under "Files outside git, code session 1" at the end of this entry.
  - **Code session 2** (`7de0b7e8-dc7a-43aa-8211-303c7440cadf`):
    - Inventories: `inventory.php` (copied from session 1's), `inv_game_now.txt`, `inv_utils_now.txt`; `list_new.php` (every `new <class>`), `top_level.php`.
    - Checks: `tokcheck.php` (token check), `load_check.php` and `ide_stubs.php` (declaration check against the IDE stubs), `ns_semantics.php` (string callable versus closure under a namespace), `layout/` (the `require dirname(__DIR__, 2)` expression under another working directory), `cc.php` and `mat.php` (scratch tests that load `material.inc.php` into a scratch object), `tm_head.txt`, `tm_new.txt`, `tm_new2.txt` (`technique_matching.php` output).
    - Edits, each by exact-match script with CRLF kept: `edit_adapt.php`, `edit_material.php`, `edit_plan_playtest.php`, `edit_plan_review.php`, `edit_plan_v3.php`, `edit_progress_update.php`, `edit_progress_winscp.php`, `edit_progress_material.php`, `edit_progress_replay.php`; their blocks `playtest_block.md`, `progress_update_block.md`, `progress_material_block.md`, `progress_replay_block.md`; the plan before each edit (`plan_before_review.md`, `plan_before_v3.md`).
    - The material analysis: `propose_material.php`, `Game.cur.lf.php`, `Game.proposed.lf.php`, `delta_v1_v2.txt`; `head/` (the two files as at `fdf421b`, LF).
    - The replay investigation: `notif_survey.php` with `notif_survey.txt` and `notif_survey2.txt`, `state_props.php`, `enclosing.php`, `replay_fix.php`, `rf/` (the two `firstascent.js` copies and the diff).
    - Transcript readers written for this checkpoint: `user_msgs.php` and `asst_msgs.php` with their output folders `um2/` and `as2/`, `as2s/`; `region.php`. `msg_adapt.txt` is the adaptation commit message.
  - **This session** (`9beef41f-a691-48e9-9943-6a3dcb414126`): `edit_lib.php` (the shared exact-match edit helper), `edit_docs.php` (the edits to `TODO.md`, `DECISIONS.md`, `BGA_PITFALLS.md`, `CLAUDE.md` and `MIGRATION_PLAN.md`), `edit_docs_v2.php` and `edit_docs_v3.php` (the plan corrections after the first and second reviews), `build_progress.php` (builds this entry), `prompt_s4.md`, `stopA_msg.md`, `review1_msg.md` and `review2_msg.md` (the quoted go-aheads).
- **Transcripts,** outside the repo, in `C:\Users\Jonat\.claude\projects\D--Documents-BGA-Studio-firstascent\`: `2eb67ffe-a03f-4360-b47e-050b6dd0ee93.jsonl` (code session 1), `7de0b7e8-dc7a-43aa-8211-303c7440cadf.jsonl` (code session 2; the session prompt is its first message) and `9beef41f-a691-48e9-9943-6a3dcb414126.jsonl` (this session).

**Compaction**
- **Code session 1:** auto-compacted once, during 5.1 (see its record below).
- **Code session 2:** auto-compacted twice, so not "no compaction noticed". The transcript has two `compact_boundary` records, both `trigger: auto`: the first at line 1026, 2026-11-01 19:28:45, as his playtest report arrived (431,179 tokens before, 17,245 after); the second at line 1534, 2026-11-01 23:52:39, as his "push" message arrived (229,972 before, 18,209 after; a notice follows it: "Compacted using a summary written while you were away"). That session didn't see either happen; it knew of the first from the transcript only. After the second it re-read the prompt, his messages and its own reports from the transcript, and checked the commits, the diffs and the plan against git and the files. Its git writes were the two commits (2026-11-01 19:29:43 and 19:30:28) and the push (23:52:59).
- **This session:** no compaction noticed (as of `p1.2-docs-v3.diff`).

**Model**
- **Code session 1:** Sonnet 5.5 (Opus had been recommended for it in the design discussion, not in the session prompt).
- **Code session 2:** Sonnet 5.5, Jonathan's answer to its question (2026-11-02). Its own context named the same model.
- **This session:** Sonnet 5.5, at the Extra effort level (Jonathan's answer to my question, item 6 of his reply to stop A, as he corrected it in item 8 of his review of the first docs diff: "Extra" was the effort setting, not a model variant). My own context names the model Sonnet 5.5 (`claude-sonnet-5-5`), which agrees. His stop-A reply is quoted above as he wrote it.

**Pending decisions** (only what is still open)
- **The replay fix,** which is next:
  - The go-ahead to edit `firstascent.js` comes with the prompt of the session that does the fix.
  - Whether `replay-fix-proposal.diff` (not applied) is enough: the three open questions in the finding (private notifications in the replay archive; `onEnteringState` and `onUpdateActionButtons` in a replay; the non-animated branches). Testing it needs a new Table-3-shaped game created after the deploy.
- **Carried over from the P1.1 entry, still open,** as written there:
  - "The planned fix for the redraw loop: P5.2, with R-6's setup path (proposed). Once confirmed, §8.4 gets a row."
  - "The fix step for the zombie path in `chooseSummitBetaToken` (`TODO.md`, found in (b2)): to be decided."
  - "Retiring `D:\Documents\BGA Studio\firstascent-overrides\`."

**Next**
- Jonathan reviews `p1.2-docs-v3.diff`; then "commit docs" (one `docs:` commit, staged by explicit path) and, after that, "push".
- Then the replay fix, in its own session, as its own `fix:` commit, after P1.2's closing docs and before P1.3. That session:
  - gets the go-ahead for `firstascent.js` with its prompt, and decides whether `replay-fix-proposal.diff` is enough;
  - tests the fix on a new finished game (Table 3's shape) created after the deploy, since replays use the files archived at game start;
  - updates F13's repeats in P1.3, P2.2, P2.6, P3.5, P4.1 and P7.3 (decision 3 of this session's prompt);
  - removes the replay entry from `TODO.md` with its fix;
  - runs the asset count query on its new game, `SELECT COUNT(*) AS n FROM cards_and_tokens WHERE card_type='asset';` (expected 124), and records the result in its entry (decision 4 of this session's prompt). It closes the count query that P1.2 left unchecked.
- Then P1.3.

**Record of code session 1** (2026-10-30/31; transcript `2eb67ffe-…`). Kept as it was in the in-progress entry (`0217be6`), where it was carried from the first checkpoint, except that its "Go-aheads and decisions" block is now a pointer (below).

**Compaction, code session 1** (as Jonathan observed it)
- The session was auto-compacted once, during 5.1. Jonathan saw it in the app. I didn't see the event: my context then began with a continuation summary, followed by my section 4 report and his go-ahead for 5.1, verbatim. In the transcript, the summary record comes after the go-ahead message; its own timestamp (2026-10-31T05:37Z) is earlier than the go-ahead's (19:51Z), so I rely on the file order and on what he saw.
- The prompt's rollover rule: "**Roll over** at the next checkpoint after an auto-compaction (a long session is reason enough)". This is that checkpoint: the tool commit is pushed, and 5.2 is not started.
- **What I did after it:** re-read the session prompt and Jonathan's later messages from the transcript. Every quotation below is from there, not from the summary, and the start-check and `TODO.md` facts were re-read from the transcript's tool output. Nothing in this entry rests on the summary alone. The summary had dropped one instruction of §3 (where the `php:` notation is defined); it was in the closing-docs checklist of the in-progress entry (`0217be6`) and is used in this session.
- No unplanned git action happened. The one git write outside the plan, `git checkout -- misc/docs/TODO.md`, was approved (below).

**Model, code session 1**
- Code session 1 ran on Sonnet 5.5. Opus had been recommended for it in the design discussion, not in the session prompt.

**Items, code session 1**
- **Start check (§2):** one result differed, so I stopped, as the prompt says.
  - `git fetch origin`; HEAD `fdf421b`, level with `origin/main` (0 ahead, 0 behind).
  - `git diff --stat 2cc1d9e HEAD`: four files, all in `misc/docs/`.
  - `git ls-files modules/`: `modules/README`, `modules/Utils.php`, `modules/utils.js`. The file on disk is `modules/utils.php`. `core.ignorecase` is `true`.
  - `git ls-files --eol`: `i/lf w/crlf` for `firstascent.game.php` and `modules/Utils.php`. Bytes: the game file 350,331 (CRLF 6,532), the trait 67,972 (CRLF 1,388), no bare LF and no bare CR in either.
  - **Differed:** `git status` listed ` M misc/docs/TODO.md`.
- **The `TODO.md` restore** (Jonathan's approval, 2026-10-30; done):
  - **File:** `misc/docs/TODO.md`.
  - **Cause:** Jonathan: "Inkwell caused this: I opened misc/docs/TODO.md in it before the session started, and I've closed Inkwell now." The file's modification time was 2026-10-30 23:04:13 CDT, before the start check. The `MIGRATION_PLAN.md` overwrite recorded in the P1.1 entry had the same likely cause.
  - **What it looked like:** git listed it as modified, but `git diff` showed only the CRLF warning. The working copy was `i/lf w/lf`, 11,490 bytes (the blob's size), and the index entry's cached size was 11,578 (the CRLF form). The other docs are `w/crlf`.
  - **Checked before the restore:** `git status --porcelain=v1` listed only that file (0 other lines), and `git cat-file blob HEAD:misc/docs/TODO.md | cmp - misc/docs/TODO.md` reported identical bytes. So nothing could be lost.
  - **Restore:** `git checkout -- misc/docs/TODO.md`, exit 0, the one command approved.
  - **Checked after:** `git ls-files --eol` shows `i/lf w/crlf`; 11,578 bytes, CRLF 88, bare LF 0, bare CR 0; `git status --short` was empty.
- **Section 4, the pre-change checks** (read-only; reported 2026-10-31; Jonathan's go-ahead followed). The raw output is in `inv_game.txt` and `inv_utils.txt`.
  - **4.1, the inventory** (token-based, on HEAD's blobs: 42,286 tokens in the game file, 10,699 in the trait):
    - **Class names:** `extends` 1 (the game file: qualify); `new` of a legacy exception 3 (`feException` in `zombieTurn`; `\BgaSystemException` in `isPlayerZombie` and `debug_goToState`); `new` of an already-qualified class 50 (all in the trait); `::` after `self` or `parent` 295 in the game file and 15 in the trait; attributes 12 (all in the trait, all qualified). Nothing for `catch`, `instanceof`, `implements`, property types or dynamic `new`. No other legacy exception class exists.
    - **Callable- and name-taking built-ins:** 13 call sites in the game file and 8 in the trait. 4 string callables need converting (`'sortGear'`, `'sortFace'`, `'sortCrack'`, `'sortSlab'`); 7 strings name built-in functions (`intval` ×5, `strval` ×2); the rest are closures, arrow functions or calls with no callback. The breakdown to 21 is under 5.3 above.
    - **Nested named functions:** 5, all in the game file: the four above in `setupNewGame` (HEAD lines 347–350), and `dieLog` in `confirmLuckyChalkbag` (4839), called directly at 4895.
    - **Other:** no `get_class`, `::class` or `__CLASS__`; `COMMON_TRANSLATIONS` is a `define()` (global), used unqualified; the class name is a class only at its declaration; one `require_once` (`modules/utils.php`, line 15); no unqualified function or constant collides.
  - **4.2, the headers:** in P1.2's scope in the plan.
  - **4.3, the markers:** `technique_matching.php` passed all checks at HEAD (32 s). The header edits don't touch the MARKERS.
  - **4.4, Studio deploy:** host `1.studio.boardgamearena.com`, port 2022, `remotePath` `/firstascent/`, `uploadOnSave: true`, `useTempFile: false`, ignore `.vscode` and `.git`. **Unknown:** whether the extension creates the remote `modules/php/` when it uploads a file. `git mv` triggers no save.
  - **Differences from the plan:** four string callables, not one; `dieLog` is called directly, not as a string; the adaptation is about 15 changed lines, not about 80 (11 in `Game.php`, 4 in the trait).
- **The tool commit and its playtest** (`322754e`, `tool:`):
  - **What:** `debug_frameworkCheck` in the trait, after `debug_redrawStartingSpread`. +24 lines, only `modules/Utils.php`.
  - **Checks that ran:** `php -l` (no errors); the byte check against HEAD (one insertion of 1,114 bytes, nothing removed); the token check (10,699 → 10,838 tokens, one insertion of 139 tokens from `#[` to `}`, nothing removed); line endings CRLF 1,412, bare LF 0, bare CR 0; the staged diff identical to `p1.2-tool.diff`. **Not run:** the function itself (Studio only).
  - **Playtest** (Studio, fresh table; Jonathan's report, 2026-10-31): "the debug menu lists 14 debug_ functions and no helper. Framework check logged exactly the line you expected for the legacy file, with the placeholders filled in." The line I expected: `Framework check: running class FirstAscent, parent class Bga\GameFramework\Table, declared in firstascent.game.php`. The code-reading expectation matched, so no finding.
  - **Settled by it:** the `${…}` placeholders are filled from the args of a `log_only` line that has no client handler, and the class's file (not the trait's) is the one reported.
  - **After the move** the line should read `running class Bga\Games\FirstAscent\Game, parent class Bga\GameFramework\Table, declared in modules/php/Game.php`.
  - Committed after "commit P1.2 tool" (message: `commit_tool_msg.txt`) and pushed after "push".

**Go-aheads and decisions, code session 1:** the full quotes (the session prompt's §3, Jonathan's message of 2026-10-31 before 5.1, and his message after the tool playtest) are in `git show 0217be6:misc/docs/progress.md`, in the block "Go-aheads and decisions" (line 418 there). The ones used up in code session 1 are the §3 mapping and the `debug_frameworkCheck` spec (`322754e`), the `TODO.md` restore, "commit P1.2 tool" and "Push."; the closing-docs items of §3 were used in this session and are quoted above in the prompt's §4. A record of a go-ahead isn't a grant.

**Files outside git, code session 1**
- In `D:\Documents\BGA Studio\`:
  - `p1.2-tool.diff`: the tool commit, 35 lines, +24 −0 in `modules/Utils.php`. The staged diff at commit time was identical (`cmp`);
  - `p1.2-wip-docs.diff`: that checkpoint's docs diff (committed as `e3cf621`);
  - from earlier sessions, unchanged: the P1.1 diffs.
- Code session 1's scratchpad, `C:\Users\Jonat\AppData\Local\Temp\claude\D--Documents-BGA-Studio-firstascent\2eb67ffe-a03f-4360-b47e-050b6dd0ee93\scratchpad\`. It stays out of the repo:
  - `inventory.php` (the token-based inventory: `php inventory.php <file> <_ide_helper.php>`), `extra.php`, and its results at HEAD, `inv_game.txt` and `inv_utils.txt`. Section 2 of each lists the callable- and name-taking call sites (13 and 8);
  - `locals.php` (distinct variables in a line range: `php locals.php <file> <from> <to>`);
  - `edit_plan1.php` (the plan edit), `edit_tool.php` and `fix_blank.php` (the trait edit), `check_tool.php` (the byte and token checks: `php check_tool.php <HEAD blob> <before copy> <after file>`), `commit_tool_msg.txt` (the commit message);
  - `head/` (`firstascent.game.php` and `Utils.php` as at `fdf421b`, LF) and `utils.before.php` (the trait before the edit);
  - `user_msgs.php`, `early_events.php` and `usermsgs/`: scripts and extracts that read the session transcript.
- The session transcript, outside the repo: `C:\Users\Jonat\.claude\projects\D--Documents-BGA-Studio-firstascent\2eb67ffe-a03f-4360-b47e-050b6dd0ee93.jsonl`.
- `D:\Documents\BGA Studio\firstascent-overrides\` and the P1.1 scratchpads: untouched.

## 2026-10-24 (P1.1: done)

The session started 2026-10-23 (Jonathan's local date) and stopped before (b1), at Jonathan's request. The (b1) session started 2026-10-26 and stopped 2026-10-28 with (b1) committed. The (b2) session started 2026-10-28 and stopped 2026-10-30 with (b2) committed. The (d) session ran on 2026-10-30: (d) was committed, playtested and pushed, and P1.1 closed in this entry. The spec for (b1) and (b2), with Jonathan's answers Q1–Q8 and his (b2) decisions, is in `MIGRATION_PLAN.md` §6.2. P1.1's updated scope, including (d) and its list, is in P1.1. This entry doesn't repeat them.

**Compaction**
- **(b1) session:** auto-compacted once, after the implementation and before the closing report. No unplanned git action happened. The session prompt asks for this entry to be updated at the next checkpoint after a compaction. That update was due with the closing report. It was made later, on 2026-10-27, after Jonathan's review and before the playtest.
- **(b2) session:** auto-compacted once, on 2026-10-30, after the (b2) playtest list was written into P1.1 and before the closing message of that turn. The checkpoint update was missed in that turn. It was made at Jonathan's playtest report (2026-10-30), and the commit waited for his confirmation. No unplanned git action happened.
- **(d) session:** no compaction noticed before this entry was written. No unplanned git action happened. No doc changed without an edit.
- This final update replaces both checkpoint updates.

**`MIGRATION_PLAN.md` overwritten during the (b2) playtest** (2026-10-30)
- At 13:32:43 (the file's modification time), after this session's last edit of the file and before Jonathan's playtest report, the working file was replaced by the version committed at `f2a7b12` (2026-10-21), byte for byte, with LF endings.
- It dropped everything committed to the plan since then, and the (b2) playtest list. Git didn't do it: the reflog had no entry after `8d02d04`, and there was no stash.
- **Likely cause** (Jonathan): Inkwell, which he has closed.
- **Restored** at Jonathan's go-ahead (2026-10-30):
  - `git checkout HEAD -- misc/docs/MIGRATION_PLAN.md`, which wrote CRLF;
  - then the (b2) list, re-applied from this session's own edit, read from the session transcript. The text is the approved one, and the stat is +101/−1, as before the overwrite.
- **Checked:** `TODO.md` and this file held only this session's edits, in CRLF, and `git status` showed nothing else changed. The working copy's diff of the two code files was identical to `p1.1b2.diff`.

**State at the stop**
- **HEAD:** `2cc1d9e` (P1.1d, `struct:`), pushed at Jonathan's "push". After `git fetch origin`, `main` and `origin/main` are level.
- **Staged:** nothing.
- **Unstaged:**
  - `misc/docs/MIGRATION_PLAN.md`: P1.1's status and (d)'s scope sentence, §6.2's two citations, and the `${var}` line in P1.5's scope;
  - `misc/docs/BGA_PITFALLS.md` and `misc/docs/TODO.md`: the `${var}` citation, by function name;
  - this file.
  - They go in one `docs:` commit after Jonathan's "commit docs", pushed after his "push".
- **Studio:**
  - `modules/utils.php` and `firstascent.game.php` as at `2cc1d9e`, deployed for the (d) playtest;
  - the other game files as at `bc4a9c9`.
- **Files outside git:**
  - In `D:\Documents\BGA Studio\`:
    - `p1.1d.diff`: (d) as committed, 179 lines (`firstascent.game.php | 67`, `modules/Utils.php | 5`);
    - `p1.1d-docs.diff`: this docs diff;
    - from earlier sessions, unchanged: `p1.1b2.diff`, `p1.1b2-docs.diff`, `p1.1b1.diff`, `p1.1b1-docs.diff`, `p1.1a.diff`, `p1.1a-v2.diff` and `p1.1-docs.diff`.
  - The scratchpad of the (d) session, `C:\Users\Jonat\AppData\Local\Temp\claude\D--Documents-BGA-Studio-firstascent\47f2ee00-63ce-402a-befc-623621c9178b\scratchpad\`. It stays out of the repo:
    - `items.php` (classifies each item), `remove_lines.php` (the removal), `tokcheck.php` (the token check), `eolcount.php` (the line-ending counts), `apply_docs.php` (this docs step's edits);
    - `p11b2_harness_d.php`, the (b2) harness with the commented-die-line check relaxed, run as `php p11b2_harness_d.php <repo> [quiet]`;
    - `commit_d.txt`, the commit message;
    - `head/` (HEAD's blobs and the pre-change working copies), `headrepo/` (HEAD's files laid out for the harness), and the diffs `before_stage.diff`, `cached_d.diff` and `committed_d.diff`.
  - The earlier scratchpads, unchanged (they stay out of the repo):
    - the (b2) session's, `C:\Users\Jonat\AppData\Local\Temp\claude\D--Documents-BGA-Studio-firstascent\b0816e3d-91f3-4980-986b-0b61d9d0fb49\scratchpad\`. The (d) session ran its harness from there and changed nothing in it:
      - the stub harness `p11b2_harness.php`, run as `php p11b2_harness.php <repo> [quiet]`;
      - `p11b2_mutants.php`, run as `php p11b2_mutants.php <repo>`. It writes its copies to `mut/`, removed after the runs;
      - `commit_b2.txt`, the commit message;
      - `transcript_tools\`: the scripts that read the session transcript for the restore, the extracted edit, and `cached_b2.diff`, the staged diff compared with `p1.1b2.diff`;
    - the (b1) session's (`…\032e89f2-8e43-4bcd-9f68-3c63b37b8733\scratchpad\`), where `p11b1_harness.php` was run again for the (b1) regression check, and the first session's (`…\2b85d47a-21c5-4b19-88da-a92b6dd232b6\scratchpad\`).
  - `D:\Documents\BGA Studio\firstascent-overrides\`, untouched. Retiring it is Jonathan's decision.

**Start check ((b2) session):** `git fetch origin`; HEAD `8d02d04`, level with `origin/main`, working tree clean. `git diff --stat c5500ec HEAD` touches only `MIGRATION_PLAN.md`, `BGA_PITFALLS.md` and this file. `git diff --stat 4cdc882 HEAD -- firstascent.game.php` shows no change.

**Start check ((b1) session):** `git fetch origin`; HEAD `a5b9306`, level with `origin/main`, working tree clean. `git diff --stat 4cdc882 HEAD` touches only `misc/docs/`, so the game files are as at `4cdc882`.

**Start check (first session):** `git fetch origin`; HEAD `7e9d749`, level with `origin/main`, working tree clean.

**Items**
- **(a)** done: `4cdc882` `struct:`, playtested.
- **(b1)** done: `c5500ec` `tool:`, playtested.
- **(b2)** done: `b8c0f79` `tool:`, playtested.
- **(d)** done: `2cc1d9e` `struct:`, playtested. The citation refresh is in the closing `docs:` commit.
- **(c)** confirmed: the guard on `debug_goToState` is at `utils.php:929–934` and throws `\BgaSystemException('Studio only')` outside Studio.

**(d): the scaffolding removal** (`2cc1d9e`, `struct:`)
- **What:** 15 items, 72 deleted lines, no added lines, as a mechanical sweep (§2.1). The pattern is the commented-out testing scaffolding that the (b1) and (b2) debug functions replace, plus the dead `php_debug()` stub.
  - **`firstascent.game.php`:** 14 items, 62 lines, plus 5 blank lines that the removal left doubled: 67 lines.
    - `setupNewGame`, 8 items (56 lines): 307–322 (the climbing-deck `$testingN` lookups and stacking), 334 (the token moved to the Used pile), 336–339 (the Summit Beta supply's), 401–414 (the "SPREAD TESTING" block), 432–433 (the shared objectives override), 526–534 (the character-pool TESTING block), 544–548 (the personal objective deck TESTING block), 563–567 (the commented three-starting-cards loop).
    - `getAllDatas`, 1 line: the label at 806, "FOR DEBUGGING THROUGH JAVASCRIPT". It sat above live code (`// Turn order` and the `player_order` write), which stays.
    - `riskIt`, `confirmClimbingCardChoice`, `confirmLuckyChalkbag`, 3 lines: the commented `$face_rolled` line after each `rollRiskDie` call (1866, 2495, 4856).
    - `stNextRound`, 1 line (6340): the old starting-player direction.
    - `stPreGameEnd`, 1 line (6470): the commented jump to `testEnd`.
  - **`modules/utils.php`:** the `php_debug()` stub (223–226), 4 lines, plus 1 doubled blank line: 5 lines. It was the only live code removed. Nothing calls it.
  - **Blank lines:** five in `firstascent.game.php` (HEAD lines 415, 434, 535, 549 and 807) and one in `modules/utils.php` (227), each the blank line after a removed range. Two more went inside ranges: 402 and, in the stub, 225.
  - **Kept:** 6391 and 6402 (the commented personal-objective stat calls), the `upgradeTableDb` template, and `utils.php` 33–35.
  - **Numbers:** 67 + 5 = 72 deletions; the diff body has 72 `-` lines (64 with text, 8 blank) and no `+` line; 13 hunks in `firstascent.game.php` and 1 in `modules/Utils.php`.
- **Start check:** `git fetch origin`; HEAD `a5118b2`, level with `origin/main`, working tree clean. `git diff --stat b8c0f79 HEAD` touched only `misc/docs/`. `git diff --stat 4cdc882 HEAD -- firstascent.game.php` showed `firstascent.game.php | 6`, (b2)'s three roll lines. No doc changed without an edit: at the stop before the deploy, `git status` showed only the two code files, and before the docs edits the four docs I edit had their earlier modification times and CRLF endings only.
- **Pre-change checks** (reported before the removal; every result matched the plan):
  1. **The items at HEAD.** The plan's line numbers still held. A token-based classifier (`items.php`) found no live token in any `firstascent.game.php` item, and their enclosing functions are those above. The `php_debug()` stub is a live method. Item 401–414 holds one blank line (402).
  2. **No overlap** with the kept items or with the live `$this->rollRiskDie('<site>')` lines (1865, 2494, 4855), or with the live neighbours of 6340 and 6470.
  3. **`php_debug`, whole repo** (all files, git-ignored `.vscode/` included; not `misc/docs/bga/`): one code hit, the declaration at `modules/utils.php:223`. No call, and no declaration in `firstascent.js`, `modules/*.js`, the `.tpl`, `action.php`, `states.inc.php`, `misc/tests/`, `_ide_helper.php` or `bga-framework.d.ts`. The other hits are prose in `MIGRATION_PLAN.md` and this file.
  4. **MARKERS** of `misc/tests/technique_matching.php`: none is a removed line.
- **How the lines were removed:** by a script (`remove_lines.php`), not the Edit tool, so the CRLF endings stayed byte for byte. The script checked each range's first and last line against the expected text, and that each removed line ended in CRLF, before it wrote anything.
- **Checks** (scratch scripts outside the repo):
  1. **`php -l`:** both files pass. The only message is the known `${var}` deprecation, now at `firstascent.game.php:2589`, in `confirmClimbingCardChoice` (2653 at `b8c0f79`; 64 removed lines sit above it). The earlier 2638 is the same string before (a): `php -l` on `4cdc882~1` reports 2638, and on `4cdc882` reports 2653.
  2. **Token check** (`token_get_all` on HEAD's version and the working copy; `T_COMMENT`, `T_DOC_COMMENT` and `T_WHITESPACE` dropped; line endings normalised to LF first, because a `T_OPEN_TAG` token carries its newline and the HEAD blob is LF):
     - `firstascent.game.php`: 42,286 tokens in both, **identical**. Compared with both the HEAD blob and the pre-change CRLF copy.
     - `modules/utils.php`: 10,705 tokens at HEAD, 10,699 now. **The residual is exactly six tokens, only in HEAD: `function php_debug ( ) { }`.** None is only in the working copy.
  3. **`php misc/tests/technique_matching.php`** with HEAD's `firstascent.game.php` as the baseline: all checks passed. The baseline comparison is identical (24,192, 188,160 and 20,000 cases; every other counter 0).
  4. **The (b2) harness** (`p11b2_harness.php <repo> quiet`): passed 19,709, failed 1. The failure is its own check "three rollRiskDie sites, each followed by its commented line". Its regex requires the `// $face_rolled = N;` lines that (b2) left for (d). That is how the harness extracts text from the game file, not the code, so no game code changed for it. Because the regex then matched nothing, its per-site check (that each `rollRiskDie` call is inside the function it names) also ran on no site.
     - **Covered by a scratch copy** (`p11b2_harness_d.php`, in the (d) scratchpad; the (b2) scratchpad is untouched) with the commented die line made optional: **passed 19,678, failed 0** on the working copy, including the per-site check. On HEAD's files the same copy passed 19,628, failed 0, and the original harness passed 19,687, failed 0.
     - The pass counts vary between runs, because some of its runs are random. The R-10 line it prints (four Gear on top) stayed between about 1 in 77 and 1 in 125.
- **Line endings, and why bash missed the CRs.**
  - **Counts**, byte by byte (PHP): before the removal `firstascent.game.php` had 6,599 CRLF, 0 bare LF and 0 bare CR, and `modules/utils.php` had 1,393, 0 and 0. After it they have 6,532 (−67) and 1,388 (−5), still with no bare LF and no bare CR. The HEAD blobs are all LF (6,599 and 1,393 bare LF). Neither file ends with a newline, before or after, and the HEAD blobs don't either. `git ls-files --eol` shows `i/lf w/crlf` for both throughout.
  - **The miss:** mid-session, `grep -c $'\r'` returned 0 and `sed -n Np | cat -A` showed no `^M`, although git reported `w/crlf`. The files had CRs all along. Git for Windows' `grep` (without `-U`) and `sed` (without `-b`) read in text mode and strip the CR at each line end. On a test file, plain `grep` counted 0 and `grep -U` counted 2; `sed` printed `a\n` and `sed -b` printed `a\r\n`. On the real file, `grep -cU` counted 6,532 lines with a CR, one for every line. `od -c`, `cat`, `head` and `wc -l` keep the bytes, and `head -3 | cat -A` shows `^M$`.
  - **Effect:** none of the checks depended on those two tools for line endings. The removal script, the PHP counts, a PowerShell byte count and `git ls-files --eol` all read the bytes. For a CR check on these files, use `od`, PHP or `grep -U`.
  - The diff file `p1.1d.diff` has no CR (179 LF lines), as `git diff` writes it.
- **Diff and message:** `p1.1d.diff` (`D:\Documents\BGA Studio\`), 179 lines, 14 hunks. Jonathan confirmed that the diff matched what he reviewed. While he played the build, he asked for two changes to the message: the token moved to the Used pile listed on its own (334, "(1)", totals kept), and a sentence that the relaxed harness copy passes in full. The playtest line was filled in at commit time, in his words.
- **Playtest** (Studio; results reported 2026-10-30; all pass)
  - `firstascent.game.php` and `modules/utils.php` deployed, F5 in every open tab.
  - **Table 1** (a new table, 2 players, as in the list): every check under "New table" passed, including the starting-player change after a full round.
  - **Table 2** (a second new table, because Table 1 had already played a round for the last setup check): S-smoke passed, with no new console errors or `[FA …]` warnings.
  - **The optional extra:** a "Risk it" on a pitch showed no "Debug:" line in the log.
  - **No replays:** no Studio save/restore was used.
  - **Where the results come from:** Jonathan's report only. It doesn't list the individual setup results (for example, whether The Elitist came up). Some of the list's expectations came from my reading of the code (three characters with 2 players, The Elitist's +4 by chance, the starting-player rotation) and the rest from earlier Studio runs. His report says all passed, so no mismatch was recorded.
- **Staging, commit and push:**
  - `git add -- firstascent.game.php modules/Utils.php`, the tracked names. `git diff --cached --stat`: 2 files, 72 deletions. The staged diff, compared with `cmp`, was identical to `p1.1d.diff`, and so was `git diff HEAD~1 HEAD` after the commit.
  - Committed as `2cc1d9e` after Jonathan's "commit P1.1d", and pushed (a normal push) after his "push". After `git fetch origin`, `main` and `origin/main` are level.
- **The citation refresh, and the search for 2638 and 2653** (`misc/docs/`, not `misc/docs/bga/`, not the older entries of this file):
  - **Checked in the code first:** `stNextCharacterSelect` (5472) contains Phil's deal (the `// Phil` block, with two `pickCardForLocation('summit_beta_supply', …)` calls); `getAllDatas` (734) contains `available_characters` (769); `confirmClimbingCardChoice` (2070) contains the `${var}` log string (2589).
  - **Edited, as named in the session prompt:** `BGA_PITFALLS.md:26` ("a log string in `php:confirmClimbingCardChoice`"); `TODO.md`, the "Server bugs" entry ("`php:confirmClimbingCardChoice`"); `MIGRATION_PLAN.md` P1.5's scope line ("in `php:confirmClimbingCardChoice`"); §6.2's two citations (the Phil note: "`php:stNextCharacterSelect`"; `debug_setAvailableCharacters`: "`php:getAllDatas`"); P1.1's status and (d)'s scope sentence.
  - **Hits left as they are:**
    - This file, lines in this entry from (a), (b1) and (b2): "`${var}` deprecation at `firstascent.game.php:2653`". They were true when written.
    - `FREEZE_INVESTIGATION.md:472`: "2653" is a line number in a table of the closed investigation, unrelated to the log string.
    - The P0.2 entry of this file (`php:2638`): an older entry, excluded.
  - Other `php:` line citations in those docs (for example `getAllDatas ~796` and `~830` in §5.4) drifted too. They weren't named, so they weren't changed.
- **Go-aheads in the (d) session**
  - **Outside the step's list:**
    - `misc/docs/BGA_PITFALLS.md`, the `${var}` item's citation: Jonathan's go-ahead of 2026-10-28, restated in the session prompt for 2026-10-30.
    - `misc/docs/TODO.md`, the "Server bugs" entry that starts "`php:2638`, in `confirmClimbingCardChoice`", and the `${var}` line in `MIGRATION_PLAN.md` P1.5's scope: the same refresh, nothing else in either. Jonathan's go-ahead, 2026-10-30.
  - **In the step's list:** this entry; P1.1's status and (d)'s scope sentence; §6.2's two citations.
  - The (d) commit and its push. This docs commit and its push wait for Jonathan's "commit docs" and "push".

**(b2): the six debug functions** (`b8c0f79`, `tool:`)
- **`modules/utils.php`:**
  - the six functions of §6.2's "Added in P1.1", after `debug_endGameSoon`;
  - two helpers at the end of the trait: `findDebugAssets` (copy selection and the shortage refusal) and `rollRiskDie` (the die hook);
  - `parseDebugIds` gains `bool $repeats = false`. The (b1) calls pass four arguments, so their behavior doesn't change.
- **`firstascent.game.php`:** only the three roll lines. Each `bga_rand(1, 3)` becomes `$this->rollRiskDie('<site>')`. The commented `// $face_rolled = …` lines stay, for (d).
- **My choices where §6.2 leaves the detail open**, flagged to Jonathan with the diff:
  - the die global is `forced_die_face`, since the game already uses `face_rolled` (`php:1946`, `5088`);
  - the log line reads `Debug: the risk die is forced to N (<site>)`;
  - a shortage message names where the other copies are, for example "(elsewhere: portaGear)";
  - after a redraw, the Spread's slot order follows card id, as at setup, not the listed order;
  - a redraw may list more than four cards: the extras stay on top of the deck;
  - two defensive refusals that can't trigger today, as in (b1): an id missing from `personal_objective_deck`, and a token in a location other than the expected ones.
- **Noted, not handled:** `debug_discardSummitBeta` can empty the supply. Phil's deal (`stNextCharacterSelect`) draws two tokens with no reshuffle, so it would fail on an empty supply, and card 19 would offer fewer than two tokens. Jonathan didn't ask for a refusal.
- **Pre-code checks** (reported before the code was written):
  1. **Asset cards held by id in the deck or the discard pile:** no state offers them by id, as `chooseSummitBetaToken` does for tokens. Two globals hold Asset ids:
     - `asset_identifier`, a fixed map from card id to `type_arg`, which moving a card doesn't affect;
     - `asset_discard`, which mirrors the discard pile. `getAllDatas` rewrites it (`php:841–843`), `updateAssetDiscard` (`utils.php:674`) maintains it, and `drawFromPortaledge` (`utils.php:638–644`) calls `playCard()` on an id read from it. I proposed a sync rather than a refusal (decided, below).
  2. **The die global:** `getGlobalVariable` returns null for a missing key, and `setGlobalVariable` creates it with an upsert, so `setupNewGame` doesn't change. `getAllDatas` already reads `riskSummitBetaFace`, which setup never sets (`php:908`).
  3. **The die sites:** all three are `bga_rand(1, 3)`, at `php:1865`, `2494` and `4855`, as §6.2 says. There's no other risk-die roll, including in `zombieTurn`. `confirmRiskSummitBeta` reuses the stored face.
  4. **The Lucky Chalkbag reroll** runs in server state 50, `riskSummitBeta` (`states:273–282`). The face is stored in `riskSummitBetaFace` and redrawn on reload (`js:1394–1405`). Only the title "Reroll Risk Die?" (`js:6251`) is client-side. So `debug_forceDie` can be called between a roll and its reroll.
  5. **The player panels:** the player's own panel shows the `resource_tracker` skills plus permanent skills, and the techniques with wilds (`utils.js:1462–1499`). Every panel shows the hand count, from the database (`php:863–864`), and Water and Psych, which a gift doesn't touch. `updateResourceTracker` also rewrites `max_water_psych` from the player's character.
  6. **`personal_objective_deck`:** a JSON list of ints, `range(1,12)` shuffled (`php:541–550`). `confirmCharacter` pops from the end, and the first pop is dealt first (`php:971–982`). Nothing else reads it. It's read without `asArray`, so it must stay a JSON list after a removal.
  7. **The Spread** is in the database only (`the_spread`, with the slot as `location_arg`). No global records it.
  8. **`parseDebugIds`** refuses duplicates, and an empty string fails its digit check. I proposed the `$repeats` flag (implemented).
- **Jonathan's answers during (b2)** (asked with the pre-code report, all as recommended, 2026-10-28): refuse `debug_giveAssets` for a player with no character; count Spread copies as deck copies in the redraw; keep `asset_discard` in sync; take the bottom-most copy first.
- **Decisions recorded in §6.2** (2026-10-28):
  - Each "Proposed" in "Added in P1.1" became "Decided (2026-10-28)", with Jonathan's details:
    - `debug_forceDie`: a new call overwrites; one roll only; one Studio-only helper; a `log_only` line.
    - `debug_discardSummitBeta`: the supply only, with the Used-pile and offered-token refusals.
    - `debug_giveAssets`: the panels show the gift; no statistics; no hand limit.
  - A new "Asset cards" item: the deck or the discard pile only, the deck first, the bottom-most copy first, and `asset_discard` kept in sync.
  - The "Open for (b2)" line records the answer: a repeated `type_arg` means that many copies, refused if too few are available. This replaces Q6 for the three Asset functions only.
  - The four answers above.
  - The "When" of `debug_setSharedObjectives` now cites `initSharedObjectives`, not `setupNewGame ~442–627`.
  - At Jonathan's go-ahead (2026-10-30), `debug_redrawStartingSpread` also records the popin check (playtest, scenario 2).
- **Checks:**
  - `php -l` passes on both files. The only message is the known `${var}` deprecation at `firstascent.game.php:2653`.
  - **Stub harness** (`p11b2_harness.php`): 19,663 checks in the final run, before the commit, with no failure. Its error handler turns PHP warnings into exceptions. 61 earlier runs, after its test bugs were fixed, also passed.
    - **It covers:** copy selection (deck before discard, bottom-most first); the shortage refusal, with nothing changed before it; the stacking order; the personal-objective deal order (2,000 random runs through the real deal code); the offered-token refusal, with the offer built through `getCardsOnTop` as card 19 builds it; the die helper on and off Studio (an overwrite, clearing with 0, one roll only, and the global never read off Studio); the six guards, the attributes and the `debug_` names.
    - **Ran for real:** the whole of `modules/utils.php`, the text of `drawStartingSpread`, the deal block of `confirmCharacter`, and `material.inc.php`.
    - **Stubbed:** the Deck methods; the global variables (in memory, with `utils.php`'s rule that a falsy value reads as null); the two SQL reads and the Spread-slot update; `loadPlayersBasicInfos`, `getCurrentMainState`, `getBgaEnvironment`, `bga->notify` and `bga_rand`; the exception classes and the `Debug` attribute. `incStat`, `initStat` and `getActivePlayerId` were stubbed to throw if called, and none was.
    - **Its early failures were test bugs:** tests named fixed cards that were sometimes all on the Portaledge, and one assumed that no Gear prints a wild technique (26, 27, 29, 35 and 36 do).
  - **Mutants** (`p11b2_mutants.php`): 28 of 29 caught. The survivor stores 0 instead of null for a cleared face, which behaves the same, because `getGlobalVariable` reads a stored 0 as null. The mutants also showed that an `array_values` call in `debug_stackPersonalObjectives` was redundant (`array_merge` renumbers), so it was removed.
  - **R-10 in the harness:** runs of 3,000 four-Gear redraws gave between 1 in 71 and 1 in 115, around the 1 in 92 estimate.
  - **(b1) regression:** the (b1) harness passes 17,063 checks. Its one failure is its count of `debug_` methods, which expected 7 and now finds 13.
- **Jonathan's review before the deploy:** six questions, answered from the code with citations (2026-10-30). They found no bug in (b2). They covered:
  - the stub strings and the id ranges;
  - `personal_objectives` at setup;
  - `asset_discard` and `getAllDatas`;
  - how long `summit_beta_tokens` lasts;
  - hand cards' `location_arg`, and the globals that list hand cards by id;
  - the Deck doc citations.
  - Question 4 found the zombie path in production code (`TODO.md`; go-ahead below).
- **Staging:**
  - `git add -- firstascent.game.php modules/Utils.php`, the tracked names. Both files were CRLF in the working copy, with LF in the index.
  - `git diff --cached --stat` showed 2 files, 189 insertions and 5 deletions, the same as `p1.1b2.diff`'s stat. The staged diff was identical to `p1.1b2.diff`.

**(b2) playtest** (Studio; results reported 2026-10-30; all pass)
- `modules/utils.php` and `firstascent.game.php` deployed, F5 in every open tab.
- **Table A** (3 players):
  - **Scenario 0:** passed. The debug menu shows the six new functions next to the seven existing ones, and neither helper.
  - **Scenario 1:** passed. The players were dealt the expected personal objectives.
  - **Scenario 2:** passed.
    - `("3,3,9,27")` gave two Hand Jam, Palming and Rope.
    - Studio's popin submits an empty string, and `("")` gave four random cards. Recorded in §6.2.
  - **Scenario 3:** passed. The deck card drawn was Palming, and the refill put a Palming and a Layback in the Spread.
  - **Scenario 4:** passed.
    - `"22,22,26"` was refused with the shortage refusal, and `"24,24,26"` was accepted, so G was 24.
    - X's hand +3, Gear +3, G's technique +2 and Wild +1 for Locker, Water and Psych unchanged. After F5, the other tabs showed 8 cards in X's hand.
  - **Scenario 5:** passed.
    - **Extra refusal:** Jonathan first typed `"24,24,24,"`. It was refused as an invalid id, because of the trailing comma: `parseDebugIds` reads the empty item after it as an id.
    - `"24,24,24"` was refused with the expected message.
    - Step 3 took G from the discard pile. Step 4 gave Y the stacked G and the last G from the discard pile, and the player panels were right after F5.
    - Step 5 was refused with the expected message.
  - **Scenario 6:** passed.
    - Extra Water was on top of the Used pile, and steps 2 and 3 were refused with the expected messages.
    - On card 19, `("8")` was refused and `("10")` accepted. After the reload the offer was still 7 and 8, and the choice worked as usual.
  - **Scenario 7:** passed, 7a to 7e.
    - The log lines named the forced face and site as listed, and the rolls in 7b and after 7e had no "Debug:" line.
    - In 7d, the -1 Card -1 Psych face was still shown after `debug_forceDie(1)`'s reload.
    - No Summit Beta prompt appeared after the roll in 7a or 7b.
  - **Scenario 8:** passed. Every listed refusal showed the expected message, and none reloaded the page.
- **Table B, scenario 9:** five calls of `debug_redrawStartingSpread("22,24,30,31")`, all as expected, with no error. That's consistent with the R-10 estimate, and neither confirms nor contradicts it: at 1 in 92, five calls reach the edge case about 1 time in 19.
- **APIs on Studio:** `bga->notify` (the `log_only` line) and `VisibleSystemException` worked, as in (b1).
- **Replays:** Jonathan's report doesn't mention a Studio save/restore replay.
- **Where the results come from:**
  - **Jonathan's report, on Studio:** scenarios 0–9, the extra refusal, and the popin's empty string.
  - **The harness and code review only:**
    - The `gameEnd` refusals.
    - The `asset_discard` sync. `getAllDatas` also rewrites that global from the database on every load (`php:getAllDatas ~841–843`; B1 in `MIGRATION_PLAN.md` §5.4), and the reload after each successful call runs it. So Studio can't show whether the sync ran. It becomes the only sync once P5.2 makes `getAllDatas` free of side effects. Until then the harness is its only check (mutants 19–21).
    - The die helper's Studio check: `rollRiskDie` reads the global only on Studio. The harness checks the off-Studio path, which Studio can't show.
    - The guard's `SystemException`, which never fires on Studio.

**Go-aheads in the (b2) session**
- **Outside the step's list:**
  - `misc/docs/TODO.md`: one entry under "Server bugs" for the zombie path in `chooseSummitBetaToken` (`climbing_card_info` isn't cleared). Found while answering Jonathan's pre-deploy question 4. Jonathan's go-ahead, 2026-10-30.
  - `MIGRATION_PLAN.md` §6.2, the `debug_redrawStartingSpread` entry: the popin check. Jonathan's go-ahead, 2026-10-30.
- **Git, at Jonathan's go-ahead (2026-10-30):** restoring `MIGRATION_PLAN.md` from HEAD, above.
- **In the step's list:**
  - P1.1's status;
  - the (b2) playtest list, approved 2026-10-30. At Jonathan's request, scenario 6's first note now says "the first three steps" and "the last step's stack", so it reads correctly however the list is rendered;
  - §6.2's (b2) decisions, with the four answers;
  - the `debug_setSharedObjectives` citation;
  - (d)'s added item, the citation refresh. It carries Jonathan's go-ahead for `BGA_PITFALLS.md` (2026-10-28) into (d).
- The (b2) commit and its push. This docs commit and its push wait for Jonathan's "commit docs" and "push".

**(b1): the six debug functions** (`c5500ec`, `tool:`)
- The six §6.2 functions are in `modules/utils.php` (`UtilTrait`), after `debug_goToState`: 275 inserted lines and no other change. `firstascent.game.php` is unchanged.
- The helpers are `parseDebugIds`, `checkDebugId`, `checkDebugPlayer`, `otherSideOf` and `logDebugWarning`.
- **My choices where §6.2 leaves the detail open**, flagged to Jonathan with the diff:
  - state checks use `$this->gamestate->getCurrentMainState()->name`;
  - the stats delete filters on the stat ids and on the table's player ids;
  - a card or token in a location other than the allowed ones is refused (defensive; it can't happen today);
  - list items may have spaces around the ids;
  - warnings start with "Debug warning: ".
- **Where the current APIs are used:**
  - `bga->playerScore` and `bga->playerStats` are called only in the Elitist revert;
  - `bga->notify` only in `logDebugWarning`;
  - the unchanged `initSharedObjectives` keeps the legacy calls (`initStat`, `incStat`, and `DbQuery` for the +4).
- **Checks:**
  - `php -l` passes. The only message is the known `${var}` deprecation at `firstascent.game.php:2653`.
  - The stub harness passes 17,064 checks. It loads the real trait, the real `initSharedObjectives` text, `material.inc.php` and `stats.json`. Its error handler turns PHP warnings into exceptions.
  - It covers:
    - every refusal, and that nothing changes before it;
    - the guard;
    - the stacking order;
    - the token moves, with Q1's reindexing;
    - the `pitch_tracker` padding;
    - the attributes and the `debug_` names.
  - **The Elitist-revert equivalence runs, 1,612:** 403 for each of 2, 3, 4 and 5 players. Each set is a target exactly once.
    - The "from" sets: three fixed sets that contain 11, plus 400 random ordered sets.
    - Per player count, 53–65 runs revert The Elitist, and about half share an objective with the target.
  - **Mutants:** all 11 were caught. One needed an extra test with the ids listed in the other order.
- **Pre-code checks:**
  1. **`$players`:** `initSharedObjectives` reads only its keys, so `loadPlayersBasicInfos()` gives it the same input. Recorded in §6.2.
  2. **Citations at HEAD:** three are off.
     - getAllDatas `~818`: `available_characters` is at 831.
     - stNextCharacterSelect `~5533–5594`: the function is at 5537–5616, and Phil's deal at 5546–5607.
     - The "When" of `debug_setSharedObjectives`, `setupNewGame ~442–627`, is stale:
       - the set is drawn at 422–430 and passed at 435;
       - `initSharedObjectives` is 585–761, with The Elitist's +4 at 682–697 and the objective statistics at 751–759.
     - The rest match within a line or two, including the client citations (read only).
     - §6.2 is left unchanged, as the session prompt required.
  3. **The `stats` table:**
     - Troubleshooting:29–30: the error message, with the columns and the unique key `stats_table_id`;
     - `dbmodel.sql:15`: a standard table; Troubleshooting:411 also mentions it;
     - stats.json doc:35: a table statistic and a player statistic may share an id. The only table statistic here is 90;
     - Tools and tips:34: "Go to game database" opens phpMyAdmin;
     - `_ide_helper.php` has only the signatures of the stat methods.
- **Staging:**
  - `git add modules/Utils.php`, the tracked name. `git ls-files --eol` showed `i/lf w/crlf`.
  - `git diff --cached --stat` showed 275 insertions, and the staged diff was byte-identical to `p1.1b1.diff`.
  - Note: `git show <rev>:<path>` applies the working-tree line-ending conversion, so it shows CRs that the blob doesn't have. `git cat-file blob` and `git ls-files --eol` show the index as stored.
- **Line endings of the docs:**
  - The Edit tool in this session wrote LF to the docs it edited: `MIGRATION_PLAN.md`, `BGA_PITFALLS.md` and this file. The other docs are CRLF in the working copy.
  - All three were set back to CRLF before the docs commit. Git shows no change from this.
- **Jonathan's review before the deploy:** six questions, answered from the code, found no bug. They covered:
  - `isPlayerZombie`;
  - the shape of the offered Summit Beta tokens;
  - the stat id map;
  - the location and type strings;
  - the Elitist-revert runs;
  - the stubbed framework methods.
- The review found one gap. Nothing in the playtest checked the refusal of a Summit Beta token on offer in `chooseSummitBetaToken`. The harness built the offered list itself rather than through `getCardsOnTop`.
- **Playtest additions approved by Jonathan.** P1.1's playtest list in the plan stays unchanged.
  - **Scenario 6 addition** (in the session prompt), on Table C:
    1. `debug_setSharedObjectives(16, 11, 10)`: every score goes up by 4.
    2. Then `debug_setSharedObjectives(1, 3, 5)`, a set without 11 and without both sides of one token.
    3. Expected: every score drops by 4, and the end-of-game statistics show lines only for the second set.
    - `bga->playerScore` and `bga->playerStats` are called only in the Elitist revert.
  - **Scenario 7 addition, the offered token** (approved 2026-10-27, after the review), on Table A after scenario 4 and before scenario 5:
    1. Just before a climb, `debug_stackSummitBeta("5,6")` and `debug_stackClimbingDeck("19")`.
    2. The climber takes option B of Hangry partner (19).
    3. Expected: the two tokens offered are 5 and 6, in that order.
    4. `debug_giveSummitBeta(5, <player id>)` is refused with "Summit Beta token 5 is offered in chooseSummitBetaToken".
    5. Then choosing a token works as usual.

**(b1) playtest** (Studio, 3 players, desert board; results reported 2026-10-28; all pass)
- `modules/utils.php` deployed, F5 in every open tab.
- **Done when:** the debug menu shows the six functions next to `debug_goToState`, and none of the five helpers.
- **The debug menu and player ids:**
  - For an `int $playerId` parameter, the popin lists the table's player names as links. Clicking one fills in that player's id.
  - Future playtest lists don't need the "try player id 1" workaround.
  - Recorded in `BGA_PITFALLS.md` ("Test-table friction").
- **Table A:**
  - **Scenario 1:** passed. Crag Mama stayed, and the Q4 warning appeared in the log.
  - **Scenario 2:** passed. The starting player, the Cool-Headed Crimper, climbed.
    - The first climbing card drawn was 3, "Party above you forgot some gear".
    - The first Summit Beta token drawn was Bomber Anchor, gained from that card.
  - **Scenario 4:** passed.
    - Bomber Anchor was already in player X's hand from card 3. Giving it to another player moved it, and it left X's hand.
    - Player id 1 was refused, with the table's ids and names listed.
  - **The scenario 7 addition (offered token):** passed.
    - On card 19, option B, giving a token offered in `chooseSummitBetaToken` was refused with the expected message.
    - Jonathan's report doesn't separately mention the order of the offered tokens (5, then 6) or the choice that followed.
  - **Scenario 5:** passed.
    - 1 Rope after the reload, and the next climb showed "This is the final round!".
    - The Climb and Follow Phases completed, then final scoring, and the table ended. There was no Rerack.
- **Table B, scenario 3:** passed. Off-Width Aficionado, The Elitist and All-Arounding were shown, every score was 4, and there was no warning.
- **Table C, scenario 6:** passed, including the addition.
  - The two `debug_setSharedObjectives` calls gave +4, then −4.
  - `debug_endGameSoon` after one climb logged the warning, which stayed after a refresh.
  - The end-of-game statistics had "Points from…" lines only for Ridgeline Challenge North, Stay in the Shade and Jolly Jammer.
  - Neither "Shared Objectives scored" nor "Points gained from Shared Objectives" included The Elitist. "Points gained…" equals the sum of the three lines.
- **Refusals (7):** all passed.
  - `debug_setAvailableCharacters`: the four cases, plus listing more characters than remain: "More characters listed (4) than available_characters holds (3)".
  - `debug_stackClimbingDeck`: refused in both `crimperClimbingCards` and `climbingCard`.
  - `debug_stackSummitBeta` on a token in a hand:
    - Jonathan set it up with `debug_giveSummitBeta`, not after scenario 4.
    - The first attempt gave an unexpected result, which Jonathan puts down to a misstep of his. What it showed isn't recorded, and it wasn't investigated.
    - Repeated from a Studio save/restore replay, it refused with the expected message.
  - `debug_setSharedObjectives`: all three cases.
  - `debug_giveSummitBeta` with an unknown player, and `debug_endGameSoon` for a player who hasn't climbed: passed.
- **Warnings (8):** all passed. The shared-objective pair warning was tested with (1, 2, 3).
- **The reload check (9):**
  - A successful call reloads the page of the window that made it.
  - A refusal doesn't reload.
  - Other open windows need a manual F5.
  - Recorded in §6.2.
- **APIs on Studio:** `bga->notify`, `bga->playerScore`, `bga->playerStats`, `getCurrentMainState()` and `VisibleSystemException` all worked in this file. The guard's `SystemException` never fires on Studio, so it is reviewed in code only.
- **Replays:** one result came from a Studio save/restore replay, the `debug_stackSummitBeta` refusal for a token in a hand. The rest came from live play.
- **Jonathan's game note:**
  - A player can't be left with no available pitch after their first climbed pitch.
  - It takes at least 3 climbed pitches to reach a position that forces a bail, or fewer only with help from opponents.
  - So the case behind the one-pitch warning is rare in practice.

**Go-aheads in the (b1) session**
- **Outside the step's list:** `misc/docs/BGA_PITFALLS.md`, one item under "Test-table friction": the debug menu fills in player ids. Jonathan's go-ahead, 2026-10-28.
- The other docs edits are those the session prompt allows: this entry, P1.1's status, and three §6.2 markers (`reload`, `loadPlayersBasicInfos()`, and the `stats` table's columns).
- Jonathan approved the two playtest additions above. The plan's list is unchanged.
- The (b1) commit and its push, and this docs commit and its push.

**Gap check (D4)**
- Every override in Jonathan's patch is reproduced by a planned function:
  - the climbing deck by `debug_stackClimbingDeck` (the Table A stack: `"26,23,39,57,11,21,13,18,15"`);
  - the Summit Beta supply by `debug_stackSummitBeta` (`"7,6"`);
  - the characters by `debug_setAvailableCharacters` (`"10,4"`);
  - the commented `[16, 11, 10]` by `debug_setSharedObjectives`.
- Between setup and the first Climb Phase:
  - nothing draws from the climbing deck;
  - Summit Beta has one deal, Phil's two tokens at the end of character selection.
  - So stacking during `characterSelection` matches the setup overrides (for Phil, before the last confirm).
- **Not covered** by the planned functions: personal objectives, the Spread test, the three starting cards, the token moved to the Used pile, and the three forced die rolls.
- **Jonathan's decision:** a new debug function for each (option A), in a separate (b2), the die hook reading its global only on Studio.
  - The setup-time Spread redraw is reproducible through a third extraction, `drawStartingSpread()`, added to (a) at his go-ahead.
  - §6.3 stays dropped; U8 and Q-T5 stay moot.
- **Scaffolding:**
  - Jonathan chose to remove everything in the scaffolding table, and the `php_debug()` stub, in a separate `struct:` commit, (d), after (b2).
  - The "not testing" lines were my choices, which Jonathan accepted: remove the label at 806 and the old direction at 6340, and keep the rest.
  - The list is in P1.1.

**(a): the extraction** (`4cdc882`, `struct:`)
- Three verbatim moves out of `setupNewGame`:
  - `drawStartingSpread(): void` (was 417–435);
  - `initSharedObjectives(array $current_shared_objectives, array $players): void` (was 453–625);
  - `pickAvailableCharacters(array $players): array` (was 714–723).
- Jonathan approved the `$players` parameter and the one added line, `$board = $this->getGlobalVariable('board');`. Case 12 (A Day in the Alpine) read `setupNewGame`'s local `$board`.
- **Checks:**
  - `php -l` passes; the only message is the known `${var}` deprecation, now at line 2653.
  - The moved text is byte-identical to HEAD. The residual is 15 lines: 3 calls, 3 headers, 3 closing braces, the `return`, the `$board` line and 4 blank lines.
  - Before the Spread move: the block has no `return`, and none of its variables is read later in `setupNewGame`.
  - The harness (`p11a_harness.php`) made 21,440 runs, with no difference and no PHP warning (its error handler turns warnings into exceptions). Each run executes HEAD's inline code and the new method on the same input, and counts once.
    - **Shared objectives, 13,440 runs:** every ordered triple of distinct ids 1–16, which is 3,360 (the 560 unordered sets in all 6 orders). That includes sets with both sides of one token, which setup can't produce. They ran once for each of 2, 3, 4 and 5 players.
    - **Boards:** the board follows the player count, as setup chooses it: desert for 2 and 3 players, forest for 4 and 5. So each board ran with two player counts, not every count on both boards.
    - **Characters, 8,000 runs:** seeds 1–2,000 for each of the four player counts.
  - The harness fails if the `$board` line is removed.
  - **Correction:**
    - The `4cdc882` commit message says "2-5 players, both boards". That reads as every player count on both boards, which would have been 26,880 objective runs. The runs were as listed above.
    - My Part 1 report proposed "all 560 sets". The harness ran the 3,360 ordered sets instead.
    - The pushed commit is not amended.
- **Staging:** `git add firstascent.game.php`, with CRLF converted to LF by autocrlf. `git diff --cached --stat` showed 172 insertions and 157 deletions, as Jonathan asked.

**(a) playtest** (Studio, 2026-10-24; all pass)
- `firstascent.game.php` deployed, F5 in every open tab.
- **3 players, desert board:**
  - 4 characters, all from different mats.
  - Stonemaster, Ridgeline Challenge (South) and Smear Campaign, from different tokens.
  - Scores all 0 (no Elitist).
  - The Spread had 4 cards, one per slot, not all one type.
- **5 players, forest board:**
  - 6 characters, all from different mats.
  - A Day in the Alpine, Star Stemmer and Stay in the Shade, from different tokens.
  - Scores all 0.
  - The Spread had 4 cards, one per slot, not all one type.
- **Statistics** (the 3-player table, `debug_goToState(98)` after all characters were chosen):
  - Final scoring ran, and the table ended in a tie at 0.
  - "Points from Ridgeline Challenge South: 0", "Points from Smear Campaign: 0" and "Points from Stonemaster: 0".
  - No line for the other 13 objectives.
- **S-smoke** (2 players and a spectator):
  - Character selection and Rack Up (Spread draws and refills), a climb and a rest, climbing card 56 with a Portaledge draw, the Follow Phase and the Rerack: no problems.
  - F5 in `climbOrRest` and in `resting`: no problems.
- **Console:** no errors and no `[FA …]` warnings.
- **No replays:** no result came from a Studio save/restore.
- **Jonathan's notes:**
  - A Day in the Alpine was seen only on the forest board. So the `$board` line was confirmed by the harness and its mutation check, not on Studio.
  - Neither the setup redraw (a starting Spread all of one type) nor The Elitist came up.

**Findings**
- **The setup redraw loop for 4 of a kind on the starting Spread** (`php:drawStartingSpread`; read in code, not run):
  - It removes cards from the list of the four starting cards, read once.
  - After four passes the list is empty, and a fifth pass reads a null card id.
  - Odds: about 1 in 7,100 games, and about 1 in 92 calls of (b2)'s Spread function with four Gear on top.
  - During the session I first gave 1 in 5,400 and 1 in 70. The recount puts each replacement in a 93-card deck.
  - Recorded in `TODO.md`, with the planned fix proposed for P5.2 (to confirm), and as R-10 in `RULES_CHECK.md`, answered by Jonathan.
- **`#[Debug(reload: true)]`** stays unverified in this file. The (b1) playtest checks it (§6.2).

**Go-aheads given in this session** (beyond the step's files and this entry)
- `misc/docs/TODO.md`:
  - the redraw-loop entry, with the odds, the reproduction route and a proposed planned fix;
  - Q-R6's citation changed to `php:drawStartingSpread`.
- `misc/docs/RULES_CHECK.md`:
  - a new item after R-6, requested as R-9 and recorded as R-10, because R-9 already exists (the five wild Gear Cards);
  - Jonathan kept R-10;
  - R-6 is unchanged (baseline convention).
- `misc/docs/MIGRATION_PLAN.md`:
  - §6.2 and P1.1's scope, with the design agreed in this session;
  - P1.1's status, as the task allowed;
  - §6.3's opening line (the gap-check result), at Jonathan's request in the docs review.
- The (a) commit, and its push.

**Pending decisions**
- The planned fix for the redraw loop: P5.2, with R-6's setup path (proposed). Once confirmed, §8.4 gets a row.
- The fix step for the zombie path in `chooseSummitBetaToken` (`TODO.md`, found in (b2)): to be decided.
- Retiring `D:\Documents\BGA Studio\firstascent-overrides\`.

**Next**
1. P1.2 (move the server to `modules/php/Game.php`), in a new session. P1.1 is closed.

## 2026-10-23 (P0.3: tags and the phase switch)

Git and docs only; no code changed. Two annotated tags went on `bc4a9c9`, and "Current phase" in `PROCEDURES.md` switched from review to migration. Jonathan released the P0.2 batch to Production during the session. The heading date is Jonathan's local date; BGA's date for the release is 2026-10-24. This entry supersedes the "Not pushed yet" and "Next" of the P0.2 entry below.

**Phase-rule exception:** one, for this task only. Beyond `CLAUDE.md` and `misc/docs/`, it allowed:
- creating two annotated tags, `legacy-final` and `prod-alpha-<release date>`, both on `bc4a9c9`, after Jonathan's go-ahead "tag";
- pushing `main` (normal push) and those two tags by name, after his approval "push".

Nothing else: no code file was edited, staged or committed; no deploys, Studio or Production actions; no installs or agreements. The session ran under the review-phase rules plus this exception from start to finish. Switching "Current phase" was the task's own scope; the new text governs later sessions, not this one.

**Checks before tagging** (read-only; all passed)
- `git fetch origin`; working tree clean; HEAD and `origin/main` both at `bc4a9c9`. `main` was already on origin, so the P0.2 entry's "Not pushed yet" is history.
- `git log --oneline f2a7b12..bc4a9c9`: bb780d7, b91ebb3, 512ce89, 53570af, 4d87e62, 6ee82c1, bc4a9c9.
- `git diff --stat 4d87e62 bc4a9c9`: 7 files, all under `misc/`. So the game files at `bc4a9c9` are identical to `4d87e62`.
- `git diff --stat prod-alpha-2026-10-20 bc4a9c9`, outside `misc/` and `CLAUDE.md`: `firstascent.game.php`, `states.inc.php`, `modules/Utils.php`, `firstascent.js`.
- Tags: `prod-alpha-2026-10-20` on `4701af1`, local and on origin; `legacy-final` and `prod-alpha-2026-10-24` existed nowhere (checked locally and with `git ls-remote`).

**Release and Studio checks** (Jonathan's confirmation)
- Studio matched `bc4a9c9`: he uploaded the four game files (`firstascent.game.php`, `states.inc.php`, `modules/utils.php`, `firstascent.js`), and Studio has no stray `modules/Utils.php`, only `modules/utils.php`.
- Studio's `firstascent.game.php`: line 307 starts with `// $testing1`, line 728 is `//     $available_characters[] = '5';` and line 730 is `// if (!in_array('12', $available_characters)) {`. The task prompt had put the `'5'` line at 730. The file at `bc4a9c9` has it at 728, so Studio matched the repo and the prompt's number was wrong.
- The release date was first given as 2026-10-15, the date of Production's previous deploys, which can't contain the batch (its commits are dated 2026-10-22). "Production release" means the deploy to the Production site, not the Studio sync. The session paused until Jonathan released the build.
- **Release: 2026-10-24** (BGA's date, most likely Paris time or UTC; Jonathan's local date was still 2026-10-23). No private-alpha table was running (D12).
- **Correction to the 2026-10-20 claim.** Production's build list shows the last three deploys as 2026-10-15, 2026-10-15 and 2026-10-24. There is no 2026-10-20 deploy, so "rebuilt on 2026-10-20" (`MIGRATION_PLAN.md` §10 and §13 Q-T1) doesn't match Production's record. The tag `prod-alpha-2026-10-20` and its message are untouched. The last build before 2026-10-24 is dated 2026-10-15. P0.1 found that only docs changed between `fd78ef9` and `4701af1`. So the tag marks the deployed game files if the build dated 2026-10-15 was made from `fd78ef9`'s files, as Jonathan's Q-T1 answer (Production runs the committed code) implies. What happened on 2026-10-20 isn't known. A note was added in both places in the plan; the P0.1 entry below is unchanged.

**Tags** (annotated; both on `bc4a9c9`; `git rev-parse <tag>^{commit}` printed `bc4a9c9780b9adf7d7527f64a9fdb1609d618982` for each)
- `legacy-final`: "the frozen legacy build (end of P0.2)". The message lists the P0.2 batch (bb780d7, b91ebb3, 512ce89, 53570af, 4d87e62), the harness 6ee82c1 and the docs record bc4a9c9, says the game files are identical to `4d87e62`, and says the build is frozen and legacy hotfixes follow `MIGRATION_PLAN.md` §10. It doesn't call `bc4a9c9` the last commit of the legacy framework, because later commits (this task's docs commit, and P1.1's debug functions in the legacy file) are still legacy-framework code.
- `prod-alpha-2026-10-24`: the Production private-alpha build released on 2026-10-24, built from Studio matching `bc4a9c9`, with no private-alpha table running (D12). The message lists the game files changed since `prod-alpha-2026-10-20`.
- **Why `bc4a9c9`:** it is the latest commit, as in P0.1, where `prod-alpha-2026-10-20` went on `4701af1` and not on the last code commit `fd78ef9`. The game files at `bc4a9c9` are identical to `4d87e62`; the two later commits touch `misc/` only. This task's docs commit lands after the tags, so the tags don't include it; that is intended.

**Phase switch**
- `PROCEDURES.md`: the whole "Current phase: review" section (heading, the rule and the one-time-exceptions paragraph) was replaced with the draft in `MIGRATION_PLAN.md` §11, verbatim and without the blockquote markers. The heading now reads "Current phase: migration". Every other section is unchanged, including "Installs and agreements".
- `MIGRATION_PLAN.md`: the P0.2 status is done, with the release date; P0.3 has a status line; §10 names the commit in the two P0.3 tag lines and carries the 2026-10-20 note; §11 notes that its draft was applied in P0.3; Q-T1 carries the 2026-10-20 note. The header status (line 3) and P0.2's phase-rule line (line 301) were corrected after the search below.

**"Scope before migration" retired.** The section was deleted after checking that each item is recorded elsewhere:
- item 1, the freeze fixes (`948f472`, `88209ef`): the 2026-10-14 entry below; the closed investigation is in `DECISIONS.md`;
- item 2, the Portaledge regressions (`5df6cd3`, `0114572`, `1aaad2b`, `fd78ef9`): the 2026-10-15 entry below and `DECISIONS.md` ("Already fixed under the earlier rule");
- item 3, the legacy fix batch: the 2026-10-22 entry below (commits, playtest, overrides, PHP CLI) and `DECISIONS.md`, "The legacy build gets one final fix batch, then it is frozen";
- T23: `DECISIONS.md`, D9;
- the closing rule "don't fix other `TODO.md` bugs in legacy code": replaced by the new phase text (the legacy build is frozen at `legacy-final`; `TODO.md` bugs are fixed in the slice that owns them), and recorded in `DECISIONS.md` ("Every other bug found stays deferred to the migration"; the reproduction steps in `TODO.md` serve as regression tests);
- the dropped step-2 diagnostic tooling: `DECISIONS.md`, "Step-2 diagnostic tooling … is dropped for the legacy code";
- "being in scope does not lift the phase rule": no longer applicable.

Nothing was found unrecorded, so nothing needed Jonathan's decision before the deletion.

**Search of `CLAUDE.md` and `misc/docs/`** (excluding `misc/docs/bga/` and earlier `progress.md` entries) for "Scope before migration", "review phase", "Current phase" and "phase-rule exception":
- `PROCEDURES.md`: the target of this task; edited.
- `MIGRATION_PLAN.md` §11: the draft applied; note added.
- `MIGRATION_PLAN.md:293–294`, P0.1's scope, and P0.3's own scope: they describe those steps as planned; left as they are.
- `CLAUDE.md:48` ("It states the current phase and what may be edited"): still accurate; no edit.
- `DECISIONS.md:65` and `FREEZE_INVESTIGATION.md:1` ("review-only"): they describe past sessions; no edit.
- `RULES_CHECK.md:64`: "Follow Phase rules check" matched by accident; unrelated.
- Two edits were proposed to Jonathan, because the text would mislead a future session, and made after his go-ahead:
  - `MIGRATION_PLAN.md:3` said "Status: draft … no phase-rule exception was granted", although the plan was approved on 2026-10-21. Jonathan gave the replacement text: "Status: approved by Jonathan on 2026-10-21; decisions D1–D14 are recorded in `DECISIONS.md`. Drafted and revised in a review-only session on 2026-10-15." The line was checked to read as reported before it was replaced, and keeps its bold label;
  - `MIGRATION_PLAN.md:301` (P0.2) cited `PROCEDURES.md`, "Scope before migration", a section that no longer exists. The parenthetical now reads "(granted for that task only; see the 2026-10-22 entry in `progress.md`)".

**Docs commit and push:** one `docs:` commit, staged by explicit path, after Jonathan's "commit docs"; it lands after the tags. The docs commit and both tags are pushed (`git push origin main`, then the two tags by name, never `--tags`) after his approval ("push").

**Next**
1. P1.1, the debug functions (`MIGRATION_PLAN.md` §2.3 and §6). Its prerequisite, P0.3, is met once the push is done.

## 2026-10-22 (P0.2: the legacy fix batch)

Started 2026-10-21, finished 2026-10-22. The code part of P0.2 is committed and playtested; the Production release is pending (Jonathan makes it). Not pushed yet.

**Phase-rule exception:** one, for this task only. The "Current phase" section of `PROCEDURES.md` is unchanged; it switches in P0.3. Besides `CLAUDE.md` and `misc/docs/`, it allowed:
- `firstascent.game.php`: saving Jonathan's testing overrides as a patch outside the repo and reverting the file (after his confirmation); applying or reversing the patch only at his request; editing `stNextDraw` (Q-R2) and `stMatchingTechniques` (Q-R8);
- `states.inc.php`: `confirmAssets` in state 60, only after B7 was confirmed on Studio;
- `modules/utils.php` (tracked as `modules/Utils.php`): the guard on `debug_goToState`;
- `firstascent.js`: committing Jonathan's one-line fix as it was, and no other edit;
- installing a PHP 8.4 CLI, after he confirmed the method;
- git: one `fix:` commit per item and one `docs:` commit; a normal push after his approval. No tags (P0.3 makes them), no deploys and no Production actions (Jonathan does both).

**Extensions Jonathan granted during the task:**
- activating the overrides for one table (Table A): copy the clean file outside the repo, apply the patch, uncomment and set the values, then restore the file from the copy, checked by hash (not with `git checkout` or `git apply -R`);
- committing the harness under `misc/tests/` as a separate `tool:` commit;
- a new "Installs and agreements" section in `PROCEDURES.md`, outside "Scope before migration".

**Files outside the repo**, in `D:\Documents\BGA Studio\firstascent-overrides\`:
- `2026-10-21-p0.2-overrides.patch`: Jonathan's overrides (three hunks in `setupNewGame`, 24 changed lines, all comments as saved). `git apply --check` passed against the reverted file.
- `firstascent.game.php.with-overrides`: the full file before the revert.
- `firstascent.game.php.clean-qr2-qr8`: HEAD plus Q-R2 and Q-R8, restored after Table A was created (SHA-256 `9f6c2d9bfabafb7f7a1ac1fe3db664a1b76334e3391a46e5eea0bbbcab10cdea`). The working file matched it before staging.

**PHP CLI:** PHP 8.4.25 (ZTS, x64) from the winget package `PHP.PHP.8.4`, the official zip from `downloads.php.net` with its hash checked. It is in `%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\`, which winget added to the user PATH. Jonathan's "install" covered `--accept-package-agreements` (PHP License 3.01). Earlier, a `winget search` ran with `--accept-source-agreements` before he had confirmed anything; he flagged it, and `PROCEDURES.md` now has "Installs and agreements".

**Commits** (staged by explicit path, in this order):
- `bb780d7` fix: Q-R2. Only its hunk was staged, with `git apply --cached`.
- `b91ebb3` fix: Q-R8. The rest of `firstascent.game.php`, with `git add`; afterwards `git diff firstascent.game.php` was empty.
- `512ce89` fix: B7.
- `53570af` fix: B5.
- `4d87e62` fix: Jonathan's `firstascent.js` fix (climbing card 57, option b), committed unchanged; it staged as a one-line change.
- `6ee82c1` tool: the harness, `misc/tests/technique_matching.php`.
- The `docs:` commit with this entry.

**Q-R2:** the bail branch of `stNextDraw` appended the player before its switch and again inside it. The count check runs before the append, so the extra entry skipped the next player. Removing the extra append exposed a second problem: `bailed_pitch` stays set until the player next climbs, so the Rerack's closing pass landed on a bailer who wasn't last and would have logged the bail note again. The branch now skips a player already in `finished_drawing`. The duplicate `case 10:` (B6) is harmless: the two labels share one body. Left for P1.10 and P2.6.

**B7:** confirmed on Studio (refused) before the fix. In state 60, `confirmAssets`' B8 bookkeeping does nothing, the Spread and deck paths are the same as in `climbOrRest`, and the Simul Climb branch returns without a transition, so the Crimper's choice stays pending.

**B5:** `getBgaEnvironment()` is a final public static method of `Bga\GameFramework\Table` (`_ide_helper.php:2304`; Game.php doc:2098), which `FirstAscent` extends. The guard throws `\BgaSystemException`, the class the trait already uses.

**Q-R8 trace and fix**
- Sets are formed from face-up Asset Board symbols (one per card; Sendy Jammer's Gear Cards and the five wild Gear Cards count as wilds), Technique Tokens, and New Rubber (one wild symbol, at most once).
- The old code built per-type candidates in three orders plus one all-or-nothing wild-only block, sorted them by least New Rubber, least tokens, most card icons, most wilds, then points, and committed them greedily.
- `is_pure_wild_on_empty` excluded only a per-type candidate of exactly 3 wilds, the same set as the wild-only block. No comment explained it; it came with the wild-only block in `309ffba` (2026-06-01). Wild-only sets already scored, with the type "wild" (logged "Wild"); nothing downstream reads the type except the log.
- The old allocation didn't make the most sets. For example, 1 Balance token, 1 Precision token and 4 wilds scored 1 set (the most is 2). Removing the exclusion alone wouldn't have fixed that, could lose a set that scored before (1 Precision card, 1 Balance token, 1 Power token and 6 wilds: 3 sets became 2), and would have relabeled wild-only sets.
- Jonathan chose an exhaustive search: the most sets, then the least New Rubber, then the fewest tokens; wild-only sets keep the type "wild". He accepted that token and New Rubber use can change, and that some log labels change ("Wild" in place of a type).
- The rewrite: in `f2a7b12`, `stMatchingTechniques` is lines 5839–6203, and lines 5850–5851 and 5861–6102 (Phases 1–3) were replaced. In `b91ebb3` the new block is lines 5858–5920 of `stMatchingTechniques` (5838–6021). Phase 4 is unchanged.
- Checks: the harness against two brute forces on 232,352 cases (up to 6 tokens per type and 9 wilds) found no failure, and never fewer sets than the old code. The whole function, run with stubbed framework calls and warnings as errors over 3,000 random 3-player rounds and an empty round, read no undefined variable or index.
- Findings for R-3 and R-7 are in `RULES_CHECK.md`, as findings only. Jonathan's answer on the five wild Gear Cards is R-9 (the modelling is correct).

**Playtest** (Studio, clean files deployed; all pass, with no console errors or `[FA …]` warnings):
- Table A (3 players) was created with the overrides active: the climbing deck stacked 26, 23, 39, 57, 11, 21, 13, 18, 15; the Summit Beta supply Simul Climb, then New Rubber; characters 10 and 4 forced. The clean file was restored right after, checked by hash.
- The `firstascent.js` fix (card 57, option b): pass.
- B7: the Crimper used Simul Climb while choosing between the two cards. The Spread refilled, the token went to Used, the log read "IndianaScones1 uses Simul Climb and takes Toe Jam, Gaston, and Chalk Bag from the Spread", and both cards stayed choosable. The cards came back hidden behind "Show cards" until F5, the predicted glitch, now in `TODO.md` (P5.9).
- Q-R8:
  - R1: "No 2-Point Tokens are awarded for matching Techniques"; play moved on normally.
  - R2, after reloading a Studio save and replaying the climb: Sendy "used 3 Precision Techniques, including New Rubber and gains one 2-Point Token/s". Which tokens remained wasn't recorded, so the R2 token use isn't verified.
  - On another table, an ordinary match and a token-assisted set in one Follow Phase: 1 wild (Helmet), 1 Precision card (Gaston) and 3 Power cards (Heel Hook, Chicken Wing ×2) on the board, 2 Precision tokens in hand. The log read "IndianaScones1 used 3 Precision and 3 Power Techniques, including 1 Precision Technique Token/s and gains two 2-Point Token/s"; one token was used and the other kept (the fewest-tokens tie-break), and everything animated correctly.
- Q-R2: pass in all three cases (2 players with the first bailing, on Table B; 3 players with the middle, then the first bailing, on a separate table). Each time one "bailed out" line, the others drew 3 Cards, and the Rerack ended normally.
- B5: `debug_goToState` jumped to state 98; final scoring ran and the table ended, with no errors.
- S-smoke (Table B, 2 players and a spectator): pass, including F5 in `climbOrRest` and in `resting`.

**Coverage gaps:** a wild-only set and the exact New Rubber case (2 tokens of one type plus New Rubber and nothing else) weren't observed on Studio. The New Rubber case couldn't be reached as scripted: a Gear Card Sendy plays for a requirement counts as a wild, so it completed a set with New Rubber in R2. Both cases are covered by the harness and the strict full-function run, not by a Studio playtest. The B7 regression checks weren't run: Simul Climb in `climbOrRest`, and Bomber Anchor in state 60. The fix only adds `confirmAssets` to state 60's possible actions, so `climbOrRest` is untouched.

**Other findings and records**
- `php -l` flagged a `${var}` log string at `php:2638` (cards 15 and 24): in `TODO.md`, planned for P1.5; `BGA_PITFALLS.md` corrected.
- `MIGRATION_PLAN.md` §6.1 now names the characters (10 Cool-Headed Crimper, 12 Buff Boulderer). During the session I said §6.1 called 12 Phil; it gave no name, and Phil is character 8.
- Docs updated: `TODO.md` (Q-R2, Q-R8, B7 and B5 removed; the crimper display glitch and `php:2638` added), `RULES_CHECK.md` (R-2 and R-8 fixed, R-8 re-described, R-3 and R-7 findings, R-9 new), `MIGRATION_PLAN.md` (P0.2 status and the Q-R8 scope line, §5.4, §6.1, P1.5, P5.9, P5.11, §8.4), `PROCEDURES.md` (item 3 done; "Installs and agreements"), `BGA_PITFALLS.md`.

**Release:** pending. Jonathan makes it when no table is running (D12), after Studio matches HEAD.

**Next**
1. The push, after Jonathan's approval; then his Production release.
2. P0.3: tag `legacy-final` and the release (`prod-alpha-<date>`), then switch "Current phase" in `PROCEDURES.md`.

## 2026-10-21 (P0.1: migration decisions recorded)

A docs session. Jonathan decided D1–D14 and answered the rules questions (Q-R1–Q-R8, Q-T1–Q-T4, Q-T6, Q-T7, Q-P1, Q-P2); this session recorded them.

**Phase-rule exception:** one, for this task only: creating the git tag `prod-alpha-2026-10-20` and pushing it together with the commits, after Jonathan's approval. Nothing else went beyond the review-phase rules: only `CLAUDE.md` and files under `misc/docs/` were edited. The "Current phase" section of `PROCEDURES.md` is unchanged; it switches in P0.3.

**Working tree**
- Jonathan's `firstascent.js` fix (one line near line 3210; climbing card 57) remains uncommitted until P0.2. `git diff --stat` shows it as a one-line change; the working copy is CRLF against LF in the index, as for every file here.
- `firstascent.game.php` wasn't touched, staged or committed. It still holds Jonathan's testing overrides (24 changed lines). They are set aside at the start of P0.2 (the draft said P0.3; moved because P0.2 edits the same file).

**Done**
- **Tag:** `git diff --stat fd78ef9 HEAD` showed only `CLAUDE.md`, `MIGRATION_PLAN.md` and `progress.md` changed since `fd78ef9`, so no deployed game file changed. The annotated tag `prod-alpha-2026-10-20` is on `4701af1`; it is pushed with the commits after Jonathan's approval.
- **`DECISIONS.md`:**
  - D1–D14 in a new section, each with the decision, the reason and a plan pointer; Q-P2 confirmed;
  - the sizing replaces "roughly a couple of weeks" (about 80–100 sessions for P0–P7, plus P8 not yet sized), and the resubmission sentence matches D14;
  - the legacy-fix rule replaced: one final batch (P0.2), then the legacy build is frozen at `legacy-final`; the two other passages that named the old rule were updated to match;
  - "To evaluate before migration begins" became "Evaluated before migration begins", resolved by D3.
- **`RULES_CHECK.md` (new):** R-1 to R-8 (aliases Q-R1 to Q-R8) with Jonathan's answers.
- **`UX_CHANGES.md` (new):** the format and scheduling rule; UX-1 to UX-4 (the BGA review feedback) and UX-5 (T31), all "proposed". The review message is quoted unchanged at the end. The dates of the reviews aren't recorded; the items first appear in `TODO.md` on 2026-10-09.
- **`BGA_PITFALLS.md` (new):** the pitfalls from plan §9.5.
- **`TODO.md`:** the review feedback and T31 removed (moved to `UX_CHANGES.md`); added Q-R2, Q-R8, B7, B5 (P0.2), and Q-R6, B8 (their slices).
- **`MIGRATION_PLAN.md`:** no longer a draft. P0 renumbered (P0.2 legacy fix batch, P0.3 tags and phase switch; the former P0.3 and P0.4 removed); P1.1, P1.2, P1.3, P2.3, P4.2 and the P5 shared shape and slice rows updated; new phase P8; §2.4, §4.3, §5.3–5.4, §6, §7, §8.4, §9, §10, §11, §12 and §13 updated to the decisions.
- **`PROCEDURES.md`:** "Scope before migration" lists the legacy fix batch as the next in-scope code task and T23 as folded into P1; `BGA_PITFALLS.md` added to the read-first line (Jonathan approved that edit outside the section).
- **`CLAUDE.md`:** `RULES_CHECK.md`, `UX_CHANGES.md` and `BGA_PITFALLS.md` added to the doc map; the `TODO.md` and `MIGRATION_PLAN.md` entries corrected.

**Additions after Jonathan's review of the first version** (the first docs commit had been made, unpushed, after an accidental early go-ahead; it was amended to include the first two)
- **`CLAUDE.md`:** the resubmission sentence in "Current state and goal" now follows D14: after the full plan, including P8, with the migrated build going to the private alpha at P7.4. Jonathan allowed this one-sentence change.
- **`RULES.md`:** a short project note at the top says that rulings which differ from or add to the printed rulebook (bail out, the Portaledge top-up, rested players in the Follow Phase, wild-only Technique sets) are recorded in `RULES_CHECK.md`. The rulebook text is unchanged. Jonathan saw the note before it was committed.
- **Q-T3 answered:** BGA profile names can't contain apostrophes but can contain dashes; accents are unknown. Recorded in plan §13. B2 (§5.4), F10 (§8.1) and the P5.13 playtest focus now say to test names with dashes, and that the apostrophe case can't arise through player names.
- **Q-T4 answered:** yes, harness files are tracked under `misc/tests/`. Recorded in plan §13 and §8.2.

**Corrections after the patch review** (a third docs commit, staged by explicit path)
- **`TODO.md`, B7:** rewritten so it can't be misread. The server's refusal of Simul Climb in state 60 is predicted, not yet verified on Studio; the refusal is the bug, because Simul Climb should be usable there (`RULES.md` p.8).
- **`DECISIONS.md`:** "(D2, D9)" removed from the legacy-fix section, because the batch was Jonathan's decision on 2026-10-21 and isn't one of D1–D14. D6 now says the message is for now, to be revisited after the P4.2 playtest if it proves noisy; the plan's four mentions of D6 say the same.
- **Portaledge top-up (Q-R5):** whether the code reshuffles the Asset deck after the top-up hasn't been checked. `RULES_CHECK.md` R-5 and the plan (§5.4, P5.4, §13) now say so instead of saying the reshuffle is missing; P5.4 checks it.
- **`PROCEDURES.md`, "Scope before migration":** item 1 (the freeze fixes, `948f472` and `88209ef`) and item 2 (the Portaledge regressions) marked done; item 2 is superseded by item 3.

**Interpretations to confirm**
- T23's fix is placed in P1.2 (its own `fix:` commit) or falls out of P1.3's removal of `global_variables`; the cause isn't traced.
- Q-R6 is mapped to P5.2 (setup path) with the during-play check in P5.3; B8 to P5.9.
- `TODO.md` items carry a "Planned fix: <step>" note; the file had no step mapping before.
- P7.4 still releases the migrated build to the private alpha, before P8 (Jonathan's answer in the session).

**Outstanding**
- Whether BGA player names can contain accents is unknown (Q-T3); test with dashes, and with accents if Studio allows them.
- **`MIGRATION_PLAN.md` revert incident (resolved).** During this session the file was restored to its committed text within about 25 seconds of each write; the other docs were not affected. The likely cause was Inkwell, a markdown reader that had the file open; Jonathan has closed it. Until then the file was set read-only, which stopped the reverts. The last plan edits were prepared in a scratch copy, then copied over once the attribute was cleared, and a hash check over about 70 seconds showed the file stayed unchanged. If it recurs, check for a reader or another session that has the file open.

**Next**
1. P0.2, the legacy fix batch: set aside the overrides, Q-R2, Q-R8, B7 (verify first), B5, commit the `firstascent.js` fix, install the PHP CLI, then Jonathan's Production release. It needs a one-time exception.
2. P0.3: tag `legacy-final` and the release, then switch "Current phase" in `PROCEDURES.md`.

## 2026-10-15 (Migration plan drafted and revised)

A review-only planning session. Jonathan reviewed the first draft, asked for revisions, and approved the revised plan.

**Phase-rule exception:** none granted. The session stayed within the review phase:
- the only files written were `misc/docs/MIGRATION_PLAN.md` (new), this entry and `CLAUDE.md`;
- no code file was changed, nothing was deployed, and Studio wasn't touched;
- nothing was recorded in `DECISIONS.md`. The plan's proposals aren't decisions until Jonathan records them there (P0.1).

The uncommitted testing overrides in `firstascent.game.php` were read for §6 of the plan but not touched, staged or committed. Jonathan edited them during the session; §6.1 describes them as first read, and its design doesn't depend on their values.

**Done** (one commit with the plan, `CLAUDE.md` and this entry: "Add the migration plan draft and log the planning session"; pushed to origin `main`, normal push)
- **`MIGRATION_PLAN.md`.** A one-page summary (approach, phases with session counts, coexistence in brief, decisions D1–D14), then 13 sections:
  1. which legacy and current-framework pieces can coexist, with doc citations and a list of cheap Studio checks (U1–U18);
  2. the step catalog P0.1–P7.4, each step with scope, files, done criteria, playtest, `TODO.md` repros and Studio state;
  3. the class structure, server and client;
  4. the freeze principles from `DECISIONS.md` as concrete design;
  5. the server port and rules checking;
  6. debug functions to replace the testing overrides;
  7. BGA components;
  8. the regression strategy (`TODO.md` items T1–T32, freeze scenarios F1–F13);
  9. the claude-code-bga evaluation, with a scoped trial proposal;
  10. branching and commits;
  11. the end of the review phase;
  12. UX changes during the migration;
  13. open decisions and questions.
- **Revisions after Jonathan's review:**
  - **P4.4–P4.6** are now a mechanical, timing-neutral move. Every notification handler goes behind the error-policy wrapper, and a `release` callback replaces `setSynchronousDuration()`. The async hygiene (`.then` chains, `new Promise(async …)` executors, fire-and-forget work) is deferred to the slice that owns each handler, as separate commits. The recommendation and its reasons are in P4.4–P4.6. §4.3.1 lists, by slice, all 35 executors and the five releases inside `.then` chains.
  - **§4.1.1, the re-entry inventory for D5.** The no-transition flows can end in 14 states. Re-entering them is safe on the server in 13; `drawAssets` needs B8 fixed first. The legacy client isn't re-entry-safe, so D5 applies only through the new JS state classes. A Studio check in P5.1 comes before P5.9 relies on re-entry. For any state ruled out, the fallback is a private `refreshStateArgs` notification.
  - **D14, the resubmission milestone:** four options with their trade-offs, no recommendation.
  - **Session counts per phase:** about 80–100 sessions in all, 44–52 of them in P5.
  - **P0.1** now includes revising the "roughly a couple of weeks" estimate in `DECISIONS.md`.
- **claude-code-bga** (§9): cloned read-only into a scratch directory outside the repo and read. Nothing was installed, added as a skill or run.
- **`CLAUDE.md`:** `MIGRATION_PLAN.md` added to the doc map.

**Findings from reading the code** (§5.4 of the plan; none verified on Studio)
- **Q-R2, suspected bug:** a bailed player is appended to `finished_drawing` twice. So when any player except the last bails, the last player in Rerack order never draws.
- **B7, suspected bug:** Simul Climb is probably refused in `crimperClimbingCards` (state 60). It's the same gap as the Bomber Anchor one fixed in `1aaad2b`.
- **B8, latent bug:** Simul Climb runs the Rerack draw bookkeeping in `confirmAssets`.
- **B5:** `debug_goToState` is public and unguarded in the production build.
- **Q-R1:** "bail out" doesn't appear in `RULES.md`.
- Also Q-R3–Q-R8, B1–B4 and B6.

They're recorded only in the plan; `TODO.md` doesn't have them.

**Open decisions** (§13)
- D1: the approach and phase order.
- D2: branching (`main` plus tags and a hotfix branch, or a long-lived migration branch).
- D3: claude-code-bga (don't install it; run the scoped trial or not).
- D4: stashing the testing overrides before P1.1.
- D5: ending the no-transition flows with a server self-transition.
- D6: what a player sees when a notification handler fails.
- D7: scope and timing of server-side input validation (B3).
- D8: BGA components.
- D9: when to do the SQL strict-mode fix (T23) and the replay check (F13).
- D10: the UX change register.
- D11: the rules-check record and the answers to Q-R1–Q-R8.
- D12: release cut-over for private-alpha tables.
- D13: local test tooling.
- D14: the resubmission milestone.

**Open questions** (§13)
- **Rules, Q-R1–Q-R8:** listed in §5.4.
- **Technical, Q-T1–Q-T7:**
  - which commit the Production private-alpha build was made from;
  - whether private-alpha tables are running now, and how long they last;
  - whether Studio test accounts can have names containing `'`, `-` or accents;
  - tracking harness files under `misc/tests/`;
  - whether the SFTP setup uploads `misc/` on save;
  - two optional debug functions.
- **Process, Q-P1–Q-P2:** moving the BGA review feedback into the UX register now, and the review format for code steps.

**Outstanding**
- **Replay check** (from 2026-10-14): still deferred. When to do it is part of D9.
- **The `chooseSummitBetaToken` z-index issue** in `TODO.md`.
- **Uncommitted testing overrides** in `firstascent.game.php` remain in the working tree.

**Next**
1. Jonathan answers D1–D14 and the open questions.
2. A P0.1 docs session records the answers: the decisions in `DECISIONS.md`, `PROCEDURES.md` "Current phase", and the revised estimate.

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
