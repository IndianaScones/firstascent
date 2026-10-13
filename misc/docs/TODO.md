# TODO

Tags: `[state]` = the interface falling out of sync with the actual game state; `[?]` = unsure which section the item belongs in (best guess).

## BGA review feedback

* Tooltip positioning: the bottom-left tooltip can still overlap the BGA footer. Please constrain tooltips within the usable game/page area.
* Action Bar: Round information should not be permanently displayed by modifying/hacking the Action Bar layout. Persistent round/state information belongs in the game area if needed.
* Refresh/continuity issues: the game can become stuck in situations where the interface does not refresh properly. This is blocking and needs to be fixed.
* Make card/deck interactions obvious. If clicking cards and/or the deck is the intended action, please use clear highlights, selectable states, contextual hints, or other visual feedback. Players should not have to discover valid interactions by trial and error.

The final point there is expanded upon here:

"Dear IndianaScones0,

Hello Jonathan,

Thanks for the detailed reply and for trying to address the previous feedback.

I want to clarify the situation because I think we are now focusing too much on individual UI techniques — for example whether a box-shadow or a “+” icon technically matches an example from the Guidelines — while the remaining issue is broader.

First Ascent is still not ready for Alpha.

The main problem is that the interface is still difficult to read and understand at first glance for someone who does not already know the game.

The Guidelines are not intended as a checklist where complying with each individual item automatically means the overall UX is successful. A highlight can technically follow the guideline and still not be sufficiently clear once it is placed inside a visually dense interface.

Regarding your specific example: the raised cards and the “+” symbol on the Asset deck are reasonable visual cues in isolation. The issue is that, in the context of the complete screen, there are many competing elements and interaction patterns. A new player still has to understand:

what is currently actionable;

where they should look first;

what can be clicked;

what is information versus interaction;

what changes after an action;

and how to recover if they make the wrong choice.

This is why I strongly recommend that the next step is not another isolated UI adjustment based only on our written feedback.

Please run usability tests with several players who:

have not played First Ascent before;

have not been shown how your BGA interface works;

ideally have different levels of familiarity with BGA;

test both desktop and mobile;

and play a meaningful portion of the game, preferably a complete game.

During those tests, avoid explaining the interface. Observe where they hesitate, what they try to click, what they fail to notice, when they need to read the rules to understand the UI, and when the layout or screen movement makes them lose track of what is happening.

This was already recommended during the July review, specifically because several of the remaining problems are easier to identify through real player behaviour than through another developer-to-reviewer discussion.

At this stage, I would particularly look for:

Immediate readability: can a new player understand the important parts of the screen within a few seconds?

Action discoverability: can they identify valid cards, decks and board interactions without guessing?

Visual hierarchy: is the current decision more prominent than secondary information?

Layout stability: does the screen remain stable instead of jumping or moving the player away from the relevant area?

Mobile usability: can the complete flow be played comfortably without truncated, misplaced or oversized components?

Consistency: do similar actions behave and look similar throughout the game?

Recovery and continuity: can players always understand what state the game is in after an action or refresh?

The latest review also still identified concrete issues with wide-screen containment, tooltip positioning, persistent round information in the Action Bar, refresh/continuity, and interaction discoverability. Those points still need to be addressed as part of this broader pass.

I appreciate that a significant amount of work has already gone into the adaptation. However, after several review cycles, I think the most useful thing now is to step away from individual fixes and validate the complete experience with fresh players.

Please come back with a revised version after that testing pass rather than making another small isolated change to the current interface.

Relevant Studio Guidelines:

A.1 — Layout arrangement

https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#A.1_Layout_arrangement

A.2 — Action Bar

https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#A.2_Action_Bar

B.1 — Tooltips

https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#B.1_Tooltips

C.2 — Highlights & Glowing auras

https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#C.2_Highlights_&_Glowing_auras

C.4 — Sizing & responsiveness

https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#C.4_Sizing_&_responsiveness

E.1 — Design for all

https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#E.1_Design_for_all

F.2 — Refresh & Continuity

https://en.doc.boardgamearena.com/BGA_Studio_Guidelines#F.2_Refresh_&_Continuity

Not ready for Alpha. A broader usability pass with new players is required before the next submission.

Best,

Ian"

## Client bugs

* [state] at some point, my summit beta token still appeared selectable during opponent's turn (it was not actually selectable, just a visual issue)
* rerack box proportions are off on mobile
* on mobile (or resized shrunken desktop window), permanent assets tokens are jumping up slightly before sliding down to asset board - only sometimes
* bomber anchor - make it so clicking on cards in hand doesn’t hide the portaledge - check bomber anchor a bunch with new portaledge - if it gets hidden and then cards are deselected for example, it creates problems - play with undo also
* recheck responsiveness of scorecard - opponent objectives button can go to weird places if screen scrunched horizontally and if scorecard is too small, names go outside of the lines
* [state] asset_hand_to_board z-indices are wrong, cards slide under cards remaining in hand

  * not reproducible from load/refresh. Must be something about cards getting z-indices when they’re drawn and not freeing them up afterwards or something. In any event, happens only to cards drawn since the last page load
* dark mode issues:

  * color of numbers for choosing water/psych while resting
  * dark gray color’s name in titlebar (eg, “You must give 2 Asset card/s to PlayerName”)
  * blue/red draw/discard nums (0/3, etc) in titlebar
* bomber anchor - click outside to close portaledge interfering with choosing cards in hand to discard
* when selecting a crimper card, hitting the confirm button hides the popup - make an exception to “click outside” function for the titlebar
* [?] Phil - some summit beta tokens can be used after confirming a pitch to remove red border icons and change risking it to a safe climb. These need to be handled for Phil, who needs to have a requirement risked if there are any requirements

  * If I get the current Phil/Guidebook situation sorted, immediately include the added factor of a previously climbed pitch and test that
  * The following tokens still need to be fixed - Jumar and Extra Water
* onSelectResource is close, but when risking it on a pitch, the first unnecessary resource is being treated as necessary. Any additional unnecessary resources are treated correctly. It is something about the math where for non-Phil players at least, it is not minusing a requirement for the risked asset - cuz i’m looking for “ignored”, but normally missing requirements don’t have that.
* [state] problem:

  * be Phil
  * select trifecta (missing two requirements - one gear, one skill)
  * click guidebook and then click the missing skill requirement
  * confirm pitch
  * click gear card in hand

    * what’s supposed to happen is only that a gear requirement is fulfilled
    * instead, the gear requirement is being fulfilled, but the skill requirement that was fulfilled with guidebook becomes unfulfilled (the red border doesn’t return) and the any skill requirement becomes fulfilled instead

      * afterwards, if another necessary asset in hand is clicked, the guidebook fulfillment switches back to the correct skill icon. if then another card is clicked, it switches back again to the any skill
* [state] Guidebook has to deselect itself if player fails to climb pitch (due to risking it and not being able to resolve die result)
* double check cards discarded from asset board for permanent tokens - saw another instance of the wrong card being in front during anim, then the correct one snapping in front at end of anim
* issue with red border pop-in still exists for water/psych red border - update solution to include that
* [state] check trifecta_drawer - when I climbed trifecta, garrett saw- IndianaScones: undefined

  * fixed by refresh
* [state] Crag dog - option a changed player from 0 psych to -1

  * fine on back end, only problem on front end
* spectator - asset_display_to_board doesn’t happen - assets snap onto board instead
* bomber anchor - the Portaledge "+" buttons can be clicked with no hand cards selected for discard. Before the Portaledge refactor, draws were limited to the number of selected discards. Now every "+" is shown when Bomber Anchor is confirmed (js:5683), and nothing caps the draws at the selected discards (js:4652)
* bomber anchor - every Portaledge +/- click throws `Cannot set properties of null (setting 'innerHTML')` at js:4739 in states that have no `#draw_counter` (for example `climbOrRest`). `onSelectPortaledge`'s non-resting branch assumes the `selectPortaledge` counter. The draw number updates first, but the code that hides "+" and enables/disables Confirm (js:4741–4766) never runs
* confirming Bomber Anchor when it's the last enabled any-time Summit Beta token throws `Cannot read properties of null (reading 'remove')` at js:5820, because `#available_sb_message` is already gone. The action is never sent

  * the token count and the Bomber Anchor state are already cleared at that point (js:5814–5819), so clicking Confirm again throws again
  * Energy Drink (js:5489) and Simul Climb (js:5621) have the same unguarded line; Rerack guards it (js:5434)
* [state] bomber anchor - Undo Token (`onUndoSummitBeta`) doesn't reset `this.bomber_anchor`, so the next Portaledge +/- click (for example while resting) throws on the missing `#ba_draw_num` (js:4674, 4680, 4694, 4701)
* "Hide card(s)" button - `onShowHideCard` compares the button's text with the untranslated English 'Hide card' / 'Hide cards' (js:4257, 4290). In any other language the button never hides the card(s)

## Server bugs

* [?] benighted - shared technique token climbing card discarded after current player choose a token but before next player chooses one
* Fix this SQL game creation strict mode issue: https://boardgamearena.com/forum/viewtopic.php?t=48813
* `firstascent.game.php` requires `modules/utils.php`, but git tracks the file as `modules/Utils.php`. A deploy from a fresh clone to Studio (case-sensitive filesystem) would break the require. Expected to be resolved by the migration's file restructure.

## Test scenarios

* test summit meeple overlap on forest board
* Can you trade cards after confirming a pitch but before confirming assets? If so, test. This would likely create problems where new requirements are missing/not missing.
* recreate this situation -

  * dirtbag climbing black elk - make sure when selecting pitch and before/after jumar, climb/risk/can’t fulfill requirements is correct

    * already been climbed by opponent
    * I am missing 1 psych and 1 skill
    * I have the gear card to use for substitution
    * I have Jumar
* [?] double check for instances of checking a player id and expecting 7 digits instead of working with any number

## Planned improvements

* [?] remove vestiges of toggle buttons (search toggle in game.js and utils.js)
* ref card says if climber rests, lay down their meeple
* [?] declare the implicit globals: `last_replacement` (js:7997, 8361), `args` (js:8196; utils:3182, 3218), `start_pos`, `end_pos`, `x_diff`, `y_diff` (js:13261–13266), `climbing_card` (js:1231). Assigning to an undeclared variable throws in strict mode, which ES modules use, so the migrated code can't keep them
