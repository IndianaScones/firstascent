# TODO

Tags: `[state]` = the interface falling out of sync with the actual game state; `[?]` = unsure which section the item belongs in (best guess).

## Client bugs

* [state] at some point, my summit beta token still appeared selectable during opponent's turn (it was not actually selectable, just a visual issue)
* rerack box proportions are off on mobile
* on mobile (or resized shrunken desktop window), permanent assets tokens are jumping up slightly before sliding down to asset board - only sometimes
* recheck responsiveness of scorecard - opponent objectives button can go to weird places if screen scrunched horizontally and if scorecard is too small, names go outside of the lines
* [state] asset_hand_to_board z-indices are wrong, cards slide under cards remaining in hand

  * not reproducible from load/refresh. Must be something about cards getting z-indices when they’re drawn and not freeing them up afterwards or something. In any event, happens only to cards drawn since the last page load
* dark mode issues:

  * color of numbers for choosing water/psych while resting
  * dark gray color’s name in titlebar (eg, “You must give 2 Asset card/s to PlayerName”)
  * blue/red draw/discard nums (0/3, etc) in titlebar
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
* [state] bomber anchor in `chooseSummitBetaToken` - after Bomber Anchor is discarded, a pitch at the left edge that slightly overlaps the two revealed Summit Beta tokens is drawn in front of the token, where before the token was in front. The `summit_pile` z-index handling (js:1347 sets 201, js:2560 clears it, `onUndoSummitBeta` sets it again before `restoreServerGameState`) is unchanged since the June 2026 baseline (309ffba), but the Portaledge refactor rewrote much of the CSS and the animation z-index tracker (`utils.js` `moveToNewParent`). Not diagnosed; to check: `#summit_pile`'s inline `z-index` before and after the token is discarded
* "Hide card(s)" button - `onShowHideCard` compares the button's text with the untranslated English 'Hide card' / 'Hide cards' (js:4257, 4290). In any other language the button never hides the card(s)
* refillPortaledge - the first refill step uses card backs that are too large and slightly off target, in every refill since the Portaledge refactor. The shuffle step is correct
* climbing card 49 (shared Gear draw) - race: both Portaledge draws run at once (the opponent's isn't awaited, js:10827/10830, 10866), so with a refill both refill the same deck at once. About 7 `[FA animation fallback]` warnings per refill; no flight to the opponent's hand counter
* a hidden portaledge or crimper display should reappear before cards animate (desired behavior per Jonathan). Today cards fly in from the upper left, or from off-screen above the page

## Server bugs

* [?] benighted - shared technique token climbing card discarded after current player choose a token but before next player chooses one
* Fix this SQL game creation strict mode issue: https://boardgamearena.com/forum/viewtopic.php?t=48813
* `firstascent.game.php` requires `modules/utils.php`, but git tracks the file as `modules/Utils.php`. A deploy from a fresh clone to Studio (case-sensitive filesystem) would break the require. Expected to be resolved by the migration's file restructure.
* Q-R2 (confirmed): a bailed player is appended to `finished_drawing` twice, so the Rerack ends early. Planned fix: P0.2 (legacy fix batch)

  * repro, on Studio: 2 players; the first in Rerack order bails, and the second climbed
  * observed: the first player draws nothing, with a log note that they bailed. The second player is skipped, and the next round's Climb Phase starts. No errors or warnings. Expected: the second player draws 3 Cards (RULES.md p.11)
  * code: `php:stNextDraw ~5635–5686`
* Q-R8: Technique sets made only of wilds don't score. Planned fix: P0.2 (legacy fix batch)

  * expected: wild-only Technique sets score 2 points: Sendy Jammer with 3 Gear Cards, or Gear Cards plus Technique Tokens with no natural symbol. The technique type of such a set may be chosen arbitrarily
  * code: `php:stMatchingTechniques ~5896` (`is_pure_wild_on_empty`) excludes these sets
* B7 (suspected): Simul Climb is offered in state 60 (`crimperClimbingCards`), but the server should refuse it, because `confirmAssets` isn't one of that state's possible actions. It's the same shape as the crimper fix in `1aaad2b`. Verify on Studio before fixing. Planned fix: P0.2 (legacy fix batch)

  * repro: a Cool-Headed Crimper holding Simul Climb tries to use it while choosing between the Crimper's two cards
  * code: `states.inc.php ~289–290`
* B5: `debug_goToState` (`modules/utils.php ~929`) has no Studio-only guard, and it is in the Production build. Add the guard (throw when `getBgaEnvironment()` isn't `'studio'`). Planned fix: P0.2 (legacy fix batch); moved from P1.1(c)
* Q-R6: at setup, the Spread card replaced for 4 of a kind is shuffled back into the deck (`php:setupNewGame ~419–430`). It should go to the discard pile, on top. Also check that the during-play path (`php:confirmAssets ~1086–1095`) puts the card on top of the discard pile, unless a card was discarded more recently. Planned fix: P5.2 (setup path); P5.3 (during-play check)
* B8 (latent): Simul Climb runs the Rerack draw bookkeeping in `php:confirmAssets ~1012–1020` (it drops the player from `rerack_1` and turns `x_cards` 1 into 3), so `drawAssets` data is wrong on re-entry. Harmless today. Must be fixed before any slice relies on re-entering `drawAssets` (`MIGRATION_PLAN.md` §4.1.1). Planned fix: P5.9 (a `fix:` commit before it relies on re-entry)

## Test scenarios

* test summit meeple overlap on forest board
* bomber anchor in `selectPortaledge` and `riskSummitBeta`: not yet tested on Studio after the legacy Bomber Anchor fixes (October 2026). Test them with the migrated code
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
* [?] declare the implicit globals: `last_replacement` (js:7997, 8361), `args` (js:8196; utils:3182, 3218), `start_pos`, `end_pos`, `x_diff`, `y_diff` (js:13261–13266), `climbing_card` (js:1231). Assigning to an undeclared variable throws in strict mode, which ES modules use, so the migrated code can't keep them
