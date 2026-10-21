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
