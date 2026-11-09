# Decisions



The reasoning behind key project decisions. Update this file when a decision changes.



## People and ownership

Jonathan (BGA: IndianaScones) develops First Ascent for BGA; Garrett is the game's publisher. BGA's reviewer (Ian) judged the game not ready for Alpha, mainly for overall UX readability, and requested usability testing with new players. UX and usability decisions belong to Jonathan and Garrett. Claude helps discuss and implement them.



## Migrate to the current BGA framework

The codebase uses the legacy framework (partly deprecated) and has no class structure. Migration and the class restructure are one effort: the current framework's class-based structure provides most of the restructuring. The plan is `MIGRATION_PLAN.md`; its decisions are D1–D14 in the next section.

Resubmission to BGA waits until the full plan is done, including P8 (post-migration UX and components; D14). Sizing: about 80–100 Claude Code sessions for P0–P7, plus P8 (not yet sized). There are no dates: Jonathan's playtests and reviews set the pace.



## Migration plan decisions (D1–D14)

Decided by Jonathan on 2026-10-21, after reviewing `MIGRATION_PLAN.md`. The plan is no longer a draft. Each entry gives the decision, the reason, and where the plan describes it.

- **D1 Approach and order:** as the plan proposes. Server first; legacy-file preparation; two atomic switches (`Game.php`, `Game.js`); infrastructure (P4) before restructuring (P5); then domain slices. Reason: the legacy client talks to the server only through actions and notifications, so the server can move first, and the docs allow neither entry-point pair to coexist, so each switch is atomic and kept mechanical. Plan: Summary, §1, §2.
- **D2 Branching:** `main` plus tags. A hotfix branch is made from `legacy-final` only if a legacy hotfix is ever needed. Reason: docs must reach `main` for the Claude.ai design project's sync, and a long-lived migration branch would put them on two branches. Plan: §10.
- **D3 claude-code-bga:** not installed. Its applicable pitfalls moved from the plan (§9.5) into `BGA_PITFALLS.md`. The deploy-and-test trial (§9.6) isn't run for now; revisit it if manual deploy-and-test cycles become tedious. Reason: its commit, deploy and permission conventions conflict with `PROCEDURES.md` and this Windows/SFTP setup, but its pitfalls are worth keeping. Plan: §9.
- **D4 Testing overrides:** replaced by the Studio-only debug functions of §6.2, including `debug_endGameSoon` (Q-T6; replaces the `testEnd` state) and `debug_giveSummitBeta` (Q-T7). The setup-overrides file (§6.3) is dropped unless P1.1 finds an override the debug functions can't do; U8 and Q-T5 are then moot. Jonathan's uncommitted overrides in `firstascent.game.php` are set aside at the start of P0.2 (saved as a patch outside git; reverting the file needs his explicit confirmation). The first draft said P0.3; it moved because P0.2 edits the same file. Reason: edited tracked files mix test hunks with real changes and risk shipping them. Plan: §6, P0.2.
- **D5 No-transition flows:** as proposed in §4.1.1. A server self-transition where re-entry is safe, and an args-refresh notification elsewhere. If the U18 check in P5.1 shows that re-entry has player-visible side effects, it goes to Jonathan as a UX question. Reason: it replaces `restoreServerGameState()` outside client states with server data, and the inventory shows where re-entry is safe. Plan: §4.1.1.
- **D6 Handler failures:** when a notification handler fails, the player sees a short non-blocking message, in addition to the console log and the re-render. The wording is translatable, and Jonathan approves it at P4.2. This is for now: revisit it after the P4.2 playtest if it proves noisy. Reason: a failure should be visible to players and testers, not silent. Plan: §4.3.
- **D7 Input validation:** client-sent player ids are fixed in P1.6–P1.9. Every other `act*` input is validated against `$args` in the slice that owns it. There is no later dedicated pass. Reason: autowired actions replace the client-sent ids anyway, and the rest is easiest to validate where the slice rebuilds its args. Plan: §5.4 (B3), §2.3.
- **D8 BGA components:** the "Adopt" rows as planned. All "Candidate" rows are adopted, with this timing. Reason: the first two serve fixes inside the P5 slices, and the rest change appearance or schema, so they stay out of the parity-only migration. Plan: §7.
  - **During the migration:** PlayerCounter/TableCounter with `ebg.counter`, in the P5 slices that own each counter; Zone in the slice that fixes T25, as its fix.
  - **After the migration, in P8, before resubmission:** ItemManager, BgaAnimations (per component), BgaCards, BgaDice, BgaScoreSheet, and the last-turn banner. ItemManager must come before resubmission because of its schema change.
  - The "Not recommended" row stays out.
- **D9 Pre-migration leftovers:** the SQL strict-mode fix (T23) and the replay check (F13) are folded into P1. Reason: P1.2 and P1.3 re-check game creation anyway, so no separate legacy task is needed. Plan: §2.3 (P1.2, P1.3).
  - **Amendment (decided 2026-10-30, recorded 2026-11-02):** T23 is dropped. The item comes from a forum post from 2020, and Jonathan judges the issue benign. That is his judgement, not a verified fact: the cause was never traced. F13 stays folded into P1 (P1.2, P1.3).
- **D10 UX register:** `UX_CHANGES.md`, in the format of §12, with a changed scheduling rule. Reason: UX changes made once, after the structure settles, avoid doing them twice in code that P5 restructures, and a parity-only migration stays reviewable. Plan: §12.
  - The migration (P0–P7) is parity only. Decided UX items are implemented in P8.
  - Exceptions: D6's message (P4.2); fixes for visible `TODO.md` bugs (for example T6), which stay in their slices as `fix:` commits; the two D8 components listed for the migration.
  - If a decided item would change a component's structure, the owning slice notes it so the component doesn't block it later. The item itself is still implemented in P8.
  - Urgent items use the hotfix path (§10).
- **D11 Rules-check record:** `RULES_CHECK.md`, in the format of §5.3, seeded with Jonathan's answers to Q-R1–Q-R8. Reason: it keeps deviations and silent areas in one place without restating the rules. Plan: §5.3–5.4.
- **D12 Private-alpha tables:** no formal cut-over. Jonathan takes part in most private playtests, they are real-time, and he releases only when no table is running. Standing constraint after resubmission: every release must keep running tables working (same state ids and globals, or an `upgradeTableDb` migration). Reason: the private-alpha group is small and known; once outside players have tables, nothing can end them. Plan: §2.4.
- **D13 Local tooling:** harnesses are served with `py -m http.server`. A PHP CLI is installed for `php -l` in P0.2, matching the PHP version the BGA docs name (8.4; `bga/current/studio/Studio FAQ - Board Game Arena.md:9`). Installing it needs Jonathan's confirmation in that session. Reason: a lint pass catches syntax and namespace errors before a Studio deploy. Plan: §13.
- **D14 Resubmission:** after the full plan, including P8: the decided UX changes and the components adopted there. Reason: the reviewer's blocker is readability, and the UX changes and P8 components should be in before BGA looks again. Plan: §13.

**Q-P2:** the review format for code steps is confirmed as described in the plan: chunks of a few hundred lines with a summary of intent, the residual diff for verbatim moves, and pattern/count/exceptions for sweeps (§2.1).



## Most bugs are deferred to the migration

Client-side visual and interaction bugs live in code being rebuilt, so fixing them in legacy code is wasted effort. Detailed reproduction steps in TODO.md serve as regression tests for the migrated code. Before migrating, only two things are done in legacy code: the freeze investigation with its two targeted fixes, and one final legacy fix batch (see "The legacy build gets one final fix batch, then it is frozen"). The SQL strict-mode game creation fix was folded into P1 (D9) and then dropped on 2026-10-30, as Jonathan's judgement (D9's amendment).



## The freezes are the top priority

The game intermittently freezes just before or after animations, at very common points that work more than 90% of the time. Usually there are no console errors, and a refresh always fixes it (server state fine, client stuck). In Jonathan's experience, similar bugs in this codebase have almost always been latent client state: something earlier leaves state behind that a later, ordinary action trips over, so the cause is likely unrelated to where the freeze appears. Timing, input, and browser behavior are possible but much less likely.



Conclusions (October 2026, from a review-only investigation plus targeted playtests; details in FREEZE_INVESTIGATION.md). There are two classes of freeze, and each strands one client's notification queue:
- **Silent:** a notification handler awaits an animation that can never end, so it never releases the queue and the console stays clean. The animation can't end because its element or a container is hidden, the animation class is already on the element, or the element has been removed. One ordinary click hides the portaledge or the crimper display. Confirmed for a hidden portaledge (watcher and active player; rest and trade) and a hidden crimper display.
- **Loud:** an exception before the handler's release call, which prints `Uncaught (in promise)`. Confirmed for `$('trade_button')` being null after a Summit Beta token is used in the Climb Phase.

The suspicion of latent client state was right, but the state lives in the DOM (container visibility, leftover animation classes) that a handler waits on. It is not a flag gating the queue.



Decisions:
- **The freeze investigation is closed for the legacy code.** The migration replaces this code, so hunting for more instances has diminishing returns. The class-level understanding is what the migration needs.
- **Step-2 diagnostic tooling (snapshot, framework wrappers, throwaway branch) is dropped for the legacy code,** for the same reason. Its useful ideas, a dev-build state snapshot and a registry of unresolved animation waits, move into the migrated code.
- **Two targeted fixes go into the legacy code anyway,** because other people will playtest the legacy build before the migration ships. Both are relatively simple:
  - a fallback in `animationPromise` that settles any animation wait that can't complete and logs a warning each time. It closes the whole silent class, including instances not yet found;
  - null guards at the three confirmed `trade_button` sites.
- **Every other bug found stays deferred to the migration,** except the final legacy fix batch (next section). That includes the rest of TODO.md.



Principles for the migration:
- The client renders from authoritative server state rather than accumulating step-by-step changes.
- A state snapshot/consistency check stays permanently available in development builds. It includes a registry of unresolved animation waits.
- Every awaited animation must settle. Animation helpers resolve, with a warning visible to developers, when the element isn't rendered, the animation never starts, or it is cancelled. They also have a timeout backstop.
- A notification handler error must never strand the notification queue silently. In the current framework, `setupPromiseNotifications` removes the manual release call. But the notification still ends only "when the promise AND the minimum durations are over" (Game.js doc, `setupPromiseNotifications`, `bga/current/game-files/Game interface logic_ Game.js - Board Game Arena.md`:1000). So a handler promise that never settles still blocks the queue, and whether a rejected one ends it isn't documented. Handlers must be written so they always settle.
- Awaited animations must never depend on whether a container is currently visible. Whether the player can hide containers such as the portaledge is a UX decision (Jonathan's and Garrett's); the code must work either way.



## Handlers that find an element missing (the replay fix, F13)

Recorded 2026-11-09. Decided by Jonathan in the replay fix's design discussions: session 1's prompt of 2026-11-03 (§4, decisions 2 and 3) and his stop A2 reply of 2026-11-06 (decision 5). The code is in the legacy files, as the `fix:` commit `4e82116` (Studio only; nothing went to the Production site). Later steps rebuild this code (P3.5 and P4, and P5.13 for the log), so the reasoning is kept here. The full record is the 2026-11-09 entry in `progress.md`.

The situation: a replay never clicks, and a second window of the same player doesn't click either. So a notification handler can find missing an element that only a click on that client creates (the asset board, `.selected_pitch`, `#discard_box`, the Bomber Anchor counter). A replay's page also holds the whole game's log from the start, so a log item can name a pitch that isn't on the board yet.

- **A guard that fires writes a console warning with one fixed prefix, and players see nothing** (session 1's decision 2). The text is `[FA missing element] <where> | no <what> | <outcome>`, from `warnMissingElement` and `queryOrWarn` in `utils.js`. The caller then skips the step, or builds what the click would have built, and the handler goes on.
  - Reason: a missing element in a replay is expected, and the player can't act on it, so it isn't a failure to show (D6's message is for handler failures) **[inferred]**. The prefix and the pipes follow `[FA animation fallback]` (`utils.js:287`), so a trial can record which guards fired and a search finds them.
  - Where the element is only a click's leftover (the placeholder, `.selected_pitch`, `#bomber_anchor_counter`), the step is skipped; where a later step needs what the click built (the asset board, the climbing card in the discard), the handler builds or retracts it.
- **A log item that names a pitch not yet on the page is deferred, not dropped** (session 1's decision 3). `addTooltipsToLog` skips the item without marking it `tt_processed`, so a later sweep completes its tooltip once the pitch exists. It warns once per item (the class `tt_deferred`), naming the item's id, the pitch type and its container (the nearest ancestor with an id).
  - Reason: the hook marked an item processed before the lookup that threw, so each missing item threw once. In a production replay the throw most likely ended that notification's dispatch before its handler ran (the character didn't appear on the board; an inference, seen on production).
  - What the trials showed: the deferral stopped the throw in both Studio trials, and a later sweep processed the deferred items (trial 2's query at move 30: the deferred items carry `tt_deferred` and `tt_processed`). Jonathan, in table 995807's replay: "when a player climbed a Headwall pitch, the tooltip in the log shows the correct pitch". That concerns the visible log lines, which are separate elements (`log_N` in the log panel, `dockedlog_N` in the docked log) that get their tooltips normally; the retry's evidence is the query.
  - In live play the deferral never fires: every pitch item in a live log names a pitch the player chose on the board, and the Headwall is revealed before anyone can choose one (read in code, session 1's stop A).
  - The recreated log hook keeps the deferral (P3.5, U13; P5.13's `Log`).
- **No general missing-element fallback in `animationPromise`** (session 2's decision 5). A guard at the site instead. Jonathan: "No general missing-element fallback in animationPromise, as your §3 recommends."
  - Reason: a check in `animationPromise` would have to come before `func.before`, and even then the new throw's site (`discardClimbingCard`) goes on to the card's `classList` and hangs the same way. The replay would also keep a wrong board: the card would stay in `#climbing_slot`, and the next card drawn would join it. In live play there are about 200 call sites, where a null element today is a bug that stops one client loudly; a fallback would turn it into a warning and a board out of step, or the same throw one line later.
  - The migration plans the principled version: P4's wrapper logs `[FA notif error]` and re-renders from the model (`MIGRATION_PLAN.md` §4.3), and P5.7 removes `discardClimbingCard`'s async executor (§4.3.1).
  - This entry holds all three because they are one subject, how the client handles missing elements. Jonathan on whether decision 5 belongs: "I don't know about decision 5. Your inclination is fine." Session 2's other decisions are scoped to this fix and stay in `progress.md`; the popup rule is UX-6 in `UX_CHANGES.md`.

The fix's click-outside rule (in a replay, a click outside the game's own area leaves a popup open) depends on `#FirstAscent_table_display` (tpl:14), the root of the game's template. P6.2 may change it when it builds the layout in JS and deletes the `.tpl`; the rule would then need the id of whatever replaces it (Jonathan's decision 2, stop A2 reply; UX-6 for the rule itself).



## The legacy build gets one final fix batch, then it is frozen

Decided by Jonathan on 2026-10-21. It replaces the earlier rule, which allowed only simple regressions from the Portaledge refactor. Outside playtesters use the legacy build until the migration ships, so the known server bugs and a few leftovers are fixed once, together:
- **There is one final legacy fix batch (P0.2).** The list is in `TODO.md` (Q-R2, Q-R8, B7 after it is verified on Studio, B5) and in `MIGRATION_PLAN.md` P0.2, which also commits Jonathan's `firstascent.js` fix (climbing card 57) and installs the PHP CLI (D13).
- **After the tag `legacy-final`, the legacy build is frozen.** A legacy fix happens only at Jonathan's request, through the hotfix path in `MIGRATION_PLAN.md` §10 (a branch from `legacy-final`).
- Everything else in `TODO.md` stays deferred to the migration, as before.

Already fixed under the earlier rule: the Bomber Anchor click-time errors, in one task (`#draw_counter` and `#available_sb_message` are cleared when a Summit Beta token is used; `bomber_anchor` survived Undo Token).



## Guide Mode is not implemented

Guide Mode (the simplified rules in RULES.md p. 18 onward) will not be implemented; there are no plans for it. Reason: publisher decision. The implementation follows the standard rules only, so a difference from Guide Mode is never a bug.



## Workflow

A Claude.ai design project handles architecture, strategy, bug priorities, evaluation of Claude Code's output, and writing prompts for Claude Code. It has read-only access to the repo via GitHub sync. Claude Code works in the repo. The repo is the single source of truth: decisions made in design discussions are written into repo docs through Claude Code. Model guidance: Opus for investigation, architecture, and migration planning; Sonnet for carrying out well-specified steps.



## Evaluated before migration begins

claude-code-bga, a community Claude Code skill (MIT, not BGA-affiliated) for the current framework, linked from the BGA wiki page "Using AI for BGA game development." It offers migration experience, a documented list of BGA pitfalls, and an automated deploy-and-test loop via Claude in Chrome.

**Resolved by D3 (2026-10-21):** reviewed (`MIGRATION_PLAN.md` §9), not installed. Its applicable pitfalls are in `BGA_PITFALLS.md`. The deploy-and-test trial isn't run for now. If it is ever run, keep SFTP credentials out of git.

