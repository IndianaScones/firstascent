# Progress log

Running log of what was done each session and what's next. Newest entry first. See `PROCEDURES.md`.

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
