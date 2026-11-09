# UX changes register

The register of proposed and decided UX changes (decision D10, 2026-10-21; format from `MIGRATION_PLAN.md` §12). UX and usability decisions belong to Jonathan and Garrett (`DECISIONS.md`, "People and ownership"). Claude helps discuss and implement them, and never decides one.

## Scheduling rule (D10)
- The migration (P0–P7) is parity only. Only *decided* items enter the plan, and they are implemented in P8 as separate `ux:` commits, each with its own playtest.
- Exceptions, which are not UX items:
  - D6's failure message (P4.2);
  - fixes for visible `TODO.md` bugs (for example T6), which stay in their slices as `fix:` commits;
  - the two D8 components adopted during the migration (PlayerCounter/TableCounter, Zone).
- If a decided item would change a component's structure, the owning slice notes it in the entry's "Affected component" field, so the component doesn't block the item later. The item itself is still implemented in P8.
- An urgent item goes through the legacy hotfix path (`MIGRATION_PLAN.md` §10) instead.

## Entry fields
- **Id** `UX-n` and the date.
- **Source:** private playtest, BGA review, Garrett, or Jonathan.
- **Observation and proposal.**
- **Decision:** who decided, and when.
- **Status:** proposed → decided → scheduled (step) → done (commit), or rejected.
- **Affected component or slice.**
- **Before and after.**
- **Playtest check.**

## Entries

UX-1 to UX-5 were moved here from `TODO.md` on 2026-10-21 (Q-P1). Moving them decides nothing about them. They were first recorded in `TODO.md` on 2026-10-09; the dates of the BGA reviews aren't recorded. The "Affected component" lines are guesses from the component map in `MIGRATION_PLAN.md` §3.2 **[inferred]**.

### UX-1 Tooltip positioning
- **Date:** 2026-10-09 (first recorded in `TODO.md`); moved here 2026-10-21.
- **Source:** BGA review (Ian). Studio Guidelines B.1.
- **Observation and proposal:** the bottom-left tooltip can still overlap the BGA footer. Please constrain tooltips within the usable game/page area.
- **Decision:** none.
- **Status:** proposed.
- **Affected component:** tooltips (`core/Tooltips.js`, P5.13) **[inferred]**.
- **Before and after:** to be written when decided.
- **Playtest check:** to be written when decided.

### UX-2 Round information in the Action Bar
- **Date:** 2026-10-09 (first recorded in `TODO.md`); moved here 2026-10-21.
- **Source:** BGA review (Ian). Studio Guidelines A.2.
- **Observation and proposal:** round information should not be permanently displayed by modifying/hacking the Action Bar layout. Persistent round/state information belongs in the game area if needed.
- **Decision:** none.
- **Status:** proposed.
- **Affected component:** the status bar (`core/StatusBar.js`, P5.1) **[inferred]**.
- **Before and after:** to be written when decided.
- **Playtest check:** to be written when decided.

### UX-3 Refresh and continuity
- **Date:** 2026-10-09 (first recorded in `TODO.md`); moved here 2026-10-21.
- **Source:** BGA review (Ian). Studio Guidelines F.2.
- **Observation and proposal:** the game can become stuck in situations where the interface does not refresh properly. The reviewer calls this blocking. The freeze work (`DECISIONS.md`, "The freezes are the top priority") addresses the freezes themselves; what else, if anything, belongs here is open.
- **Decision:** none.
- **Status:** proposed.
- **Affected component:** notifications and animations infrastructure (P4), JS state classes (P5) **[inferred]**.
- **Before and after:** to be written when decided.
- **Playtest check:** to be written when decided.

### UX-4 Obvious card and deck interactions
- **Date:** 2026-10-09 (first recorded in `TODO.md`); moved here 2026-10-21.
- **Source:** BGA review (Ian). Studio Guidelines C.2. Expanded in the review message quoted at the end of this file, which also asks for usability tests with new players on desktop and mobile.
- **Observation and proposal:** make card/deck interactions obvious. If clicking cards and/or the deck is the intended action, use clear highlights, selectable states, contextual hints, or other visual feedback. Players should not have to discover valid interactions by trial and error.
- **Decision:** none.
- **Status:** proposed.
- **Affected component:** several (hand, Spread and deck, Asset Board, Portaledge, status bar) **[inferred]**.
- **Before and after:** to be written when decided.
- **Playtest check:** to be written when decided.

### UX-5 Reference card: a resting climber lays down the meeple
- **Date:** 2026-10-09 (first recorded in `TODO.md`); moved here 2026-10-21.
- **Source:** `TODO.md`, "Planned improvements" (T31).
- **Observation and proposal:** the original note reads: "ref card says if climber rests, lay down their meeple". Its exact meaning for the digital interface isn't recorded; to be clarified when it is discussed.
- **Decision:** none.
- **Status:** proposed.
- **Affected component:** reference cards (`components/ReferenceCards.js`) **[inferred]**.
- **Before and after:** to be written when decided.
- **Playtest check:** to be written when decided.

### UX-6 A popup closes only on a click inside the game's area
- **Date:** 2026-11-09 (recorded); decided 2026-11-06.
- **Source:** Jonathan, in the replay fix (F13): in a replay, the framework's "Next move" button hid the open Portaledge before the next move drew from it (19 of the 24 `[FA animation fallback]` warnings in trial 1). BGA's UX guidelines A.4 (`bga/current/bga_ux_guidelines.md:104–110`, popups) and F.1 (`:508–516`, "No blocking popups" in replays).
- **Observation and proposal:** the click-outside listener (`utils.js:setupOutsideClickListener`) closes the open popup (the Portaledge, the climbing card, the Crimper's display and others) on any click anywhere on the page, except on the popup itself and on `#generalactions`. That includes the log, the player panels, the top bar, and in a replay the framework's replay controls.
- **Decision:** Jonathan, 2026-11-06 (his stop B2 reply). In his words:
  > I'd like to exclude clicks in the log, player panels, and top bar from closing popups in both live play and replay.

  Asked whether that means only those three regions or everything outside the game's area:
  > I agree with scoping popup-closing clicks to `#FirstAscent_table_display`.

  Asked where the live-play half goes, he accepted the design discussion's recommendation (keep the fix's change replay-only, and record the live rule here): "Your recommendation for where the live-play half goes is fine." Asked how to record it: "Decided by me is fine."
- **The rule, confirmed by Jonathan on 2026-11-09** (his review of the F13 docs diff; the wording is the design discussion's draft, which he confirmed):
  > A click inside #FirstAscent_table_display closes an open popup, unless it's on the popup itself or on #generalactions. A click anywhere outside the game's area (the log, the player panels, the top bar, and in a replay its controls) leaves it open.

  This is how the listener already reads (`utils.js:1798`, `1803–1805` now): a click on the popup or on `#generalactions` doesn't close the popup. **A slip, corrected on his confirmation:** the stop B2 reply's restatement of the rule ("only a click inside #FirstAscent_table_display, on the popup itself or on #generalactions closes a popup") had the popup and `#generalactions` the wrong way round. The slip was the design discussion's, in the reply it drafted, and session 2's `progress.md` entry copied it. Jonathan's own words, quoted under "Decision", don't have it.
- **Status:** decided; the replay half is done, the live half is not scheduled.
  - **Replay half: done** in the F13 fix, `4e82116` (`utils.js:1799–1802` now): in a replay (`(typeof g_archive_mode !== 'undefined' && g_archive_mode) || typeof g_replayFrom !== 'undefined'`), a click that is off the popup, off `#generalactions` and outside `#FirstAscent_table_display` returns early. It is broad: the log, the player panels and the top bar are outside the element. Trial 2 (table 995807): the click test was run, and was included in "As expected" (his answer to the follow-up question 1); no popup got in the way. An in-game "replay from this move" sets `g_replayFrom`, so it gets the same exemption during a live game; no step covers it (Jonathan's decision 3, stop A2 reply).
  - **Live half: not made.** It is a UX change, a `ux:` commit under `MIGRATION_PLAN.md` §10, not part of the `fix:` commit. The plan puts UX changes in P8 (D10). It can land earlier, in the P4/P5 rebuild of the listener (P5.1's `OutsideClick`, "one manager per popup instead of the single slot"), if Jonathan so decides.
- **Affected component or slice:** `OutsideClick` (P5.1; `utils.js:setupOutsideClickListener`) **[inferred]**. Both halves depend on `#FirstAscent_table_display` (tpl:14), the root of the game's template, which P6.2 may change when it builds the layout in JS and deletes the `.tpl` (Jonathan's decision 2, stop A2 reply; extended at stop B2): the id, or what replaces it, must name the game's area.
- **Before and after:** before, any click outside the popup and `#generalactions` closes it, in live play and in replays. After: only a click inside `#FirstAscent_table_display` can close it. In a replay that is already so.
- **Playtest check:** in live play, once the live half is made: with the Portaledge open in `resting`, a click on the log, a player panel or the top bar leaves it open, and a click on an empty part of the board hides it, with the red "Show Portaledge" button. In a replay: "Next move" at a `resting` state leaves the Portaledge open (seen at the four rests in trial 2; no `selectPortaledge` state came up). Related, from `TODO.md`: "when selecting a crimper card, hitting the confirm button hides the popup" (T7, `MIGRATION_PLAN.md` §8.1), another case of the same listener **[inferred]**.

## Source: the BGA review message

The message that `TODO.md` quoted under "BGA review feedback", copied unchanged. Its closing list of Studio Guidelines names A.1 (layout arrangement), A.2, B.1, C.2, C.4 (sizing and responsiveness), E.1 (design for all) and F.2. Nothing in it has been turned into an entry beyond UX-1 to UX-4.

> "Dear IndianaScones0,
>
> Hello Jonathan,
>
> Thanks for the detailed reply and for trying to address the previous feedback.
>
> I want to clarify the situation because I think we are now focusing too much on individual UI techniques — for example whether a box-shadow or a “+” icon technically matches an example from the Guidelines — while the remaining issue is broader.
>
> First Ascent is still not ready for Alpha.
>
> The main problem is that the interface is still difficult to read and understand at first glance for someone who does not already know the game.
>
> The Guidelines are not intended as a checklist where complying with each individual item automatically means the overall UX is successful. A highlight can technically follow the guideline and still not be sufficiently clear once it is placed inside a visually dense interface.
>
> Regarding your specific example: the raised cards and the “+” symbol on the Asset deck are reasonable visual cues in isolation. The issue is that, in the context of the complete screen, there are many competing elements and interaction patterns. A new player still has to understand:
>
> what is currently actionable;
>
> where they should look first;
>
> what can be clicked;
>
> what is information versus interaction;
>
> what changes after an action;
>
> and how to recover if they make the wrong choice.
>
> This is why I strongly recommend that the next step is not another isolated UI adjustment based only on our written feedback.
>
> Please run usability tests with several players who:
>
> have not played First Ascent before;
>
> have not been shown how your BGA interface works;
>
> ideally have different levels of familiarity with BGA;
>
> test both desktop and mobile;
>
> and play a meaningful portion of the game, preferably a complete game.
>
> During those tests, avoid explaining the interface. Observe where they hesitate, what they try to click, what they fail to notice, when they need to read the rules to understand the UI, and when the layout or screen movement makes them lose track of what is happening.
>
> This was already recommended during the July review, specifically because several of the remaining problems are easier to identify through real player behaviour than through another developer-to-reviewer discussion.
>
> At this stage, I would particularly look for:
>
> Immediate readability: can a new player understand the important parts of the screen within a few seconds?
>
> Action discoverability: can they identify valid cards, decks and board interactions without guessing?
>
> Visual hierarchy: is the current decision more prominent than secondary information?
>
> Layout stability: does the screen remain stable instead of jumping or moving the player away from the relevant area?
>
> Mobile usability: can the complete flow be played comfortably without truncated, misplaced or oversized components?
>
> Consistency: do similar actions behave and look similar throughout the game?
>
> Recovery and continuity: can players always understand what state the game is in after an action or refresh?
>
> The latest review also still identified concrete issues with wide-screen containment, tooltip positioning, persistent round information in the Action Bar, refresh/continuity, and interaction discoverability. Those points still need to be addressed as part of this broader pass.
>
> I appreciate that a significant amount of work has already gone into the adaptation. However, after several review cycles, I think the most useful thing now is to step away from individual fixes and validate the complete experience with fresh players.
>
> Please come back with a revised version after that testing pass rather than making another small isolated change to the current interface.
>
> Relevant Studio Guidelines:
>
> A.1 — Layout arrangement
>
> https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#A.1_Layout_arrangement
>
> A.2 — Action Bar
>
> https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#A.2_Action_Bar
>
> B.1 — Tooltips
>
> https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#B.1_Tooltips
>
> C.2 — Highlights & Glowing auras
>
> https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#C.2_Highlights_&_Glowing_auras
>
> C.4 — Sizing & responsiveness
>
> https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#C.4_Sizing_&_responsiveness
>
> E.1 — Design for all
>
> https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#E.1_Design_for_all
>
> F.2 — Refresh & Continuity
>
> https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#F.2_Refresh_&_Continuity
>
> Not ready for Alpha. A broader usability pass with new players is required before the next submission.
>
> Best,
>
> Ian"
