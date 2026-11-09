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
  * cause and the replay case (found in the replay fix, F13): `trifecta_selections` is filled only by the click on the climbing client (`utils.js:1935` at `46b6d81`), so any client that didn't click reads it empty: an opponent in live play (the case above), a replay, a second window of the same player. The drawer text is at `firstascent.js:8791` and `8937` (`46b6d81`). Display only; the replay fix (`4e82116`) doesn't change it
* [state] Crag dog - option a changed player from 0 psych to -1

  * fine on back end, only problem on front end
* spectator - asset_display_to_board doesn’t happen - assets snap onto board instead
* [state] bomber anchor in `chooseSummitBetaToken` - after Bomber Anchor is discarded, a pitch at the left edge that slightly overlaps the two revealed Summit Beta tokens is drawn in front of the token, where before the token was in front. The `summit_pile` z-index handling (js:1347 sets 201, js:2560 clears it, `onUndoSummitBeta` sets it again before `restoreServerGameState`) is unchanged since the June 2026 baseline (309ffba), but the Portaledge refactor rewrote much of the CSS and the animation z-index tracker (`utils.js` `moveToNewParent`). Not diagnosed; to check: `#summit_pile`'s inline `z-index` before and after the token is discarded
* "Hide card(s)" button - `onShowHideCard` compares the button's text with the untranslated English 'Hide card' / 'Hide cards' (js:4257, 4290). In any other language the button never hides the card(s)
* refillPortaledge - the first refill step uses card backs that are too large and slightly off target, in every refill since the Portaledge refactor. The shuffle step is correct
* climbing card 49 (shared Gear draw) - race: both Portaledge draws run at once (the opponent's isn't awaited, js:10827/10830, 10866), so with a refill both refill the same deck at once. About 7 `[FA animation fallback]` warnings per refill; no flight to the opponent's hand counter
* a hidden portaledge or crimper display should reappear before cards animate (desired behavior per Jonathan). Today cards fly in from the upper left, or from off-screen above the page
* [state] crimper display after Simul Climb in `crimperClimbingCards` (state 60): the two Climbing Cards come back hidden behind "Show cards" (found in the P0.2 playtest, 2026-10-22). F5 shows them. Likely cause, read but not traced: `notif_confirmYourAssets` hides the display, then `onUndoSummitBeta` calls `restoreServerGameState()`, which recreates the "Hide cards" button, and clicks that button, so `onShowHideCard` (which toggles by the button's text) hides the display again. Planned fix: P5.9 (the return to the state after a no-transition flow), with P5.7's `CrimperDisplay` rendering visible on re-entry
* [state] used Summit Beta tokens stay in the hand of a client that didn't click, in a replay and in a second window of the same player (display only; found in the replay fix, F13). `discardPlayedSummitBetaTokens` (`utils.js:4144–4187` at `46b6d81`) discards only `.selected_token`, which only the click sets; `notif_discardJesusPiece` (`firstascent.js:13073` at `46b6d81`) relies on the same discard. No step is assigned yet
* the log tooltip for a pitch shows the wrong pitch's tokens (display only, live play too; found in passing in the replay fix, F13). `addTooltipsToLog` passes the hex number to `getSkillTokens` (`utils.js:1268–1269` at `46b6d81`), but `pitch_asset_tokens` is keyed by pitch type (`Game.php:4156`; setup passes the type, `firstascent.js:1643`). No step is assigned yet
* Bomber Anchor's draw in the holder's own replay (display only; found in the replay fix, F13): only the click opens the Portaledge for Bomber Anchor (`firstascent.js:5716–5717`), and `portaledge()` doesn't open it for Bomber Anchor, so the draw gives `[FA animation fallback]` warnings (five in trial 2's seat 0: cards 100 and 84, and `#portaledge`) and the cards don't fly. The fallback settles them; nothing hangs. `portaledgeOpponent` does open it (when `auto || bomber_anchor`), which is why the other seat's view of that move has no warning. These warnings are expected in the F13 check (`MIGRATION_PLAN.md`, P1.3). No step is assigned yet
* trade in the trader's own replay (display only; found in the replay fix, F13; no trial ran it). The click moves the three traded cards to the discard (`firstascent.js:3809–3825`) and opens the Portaledge (3849–3851). `confirmTradePublic` is ignored on the trader's client (7254) and `confirmTradePrivate` moves nothing out of the hand, so the traded cards stay in that replay's hand (`sanitizeHand` runs only from a click path). The trader's Portaledge draw would give `[FA animation fallback]` warnings, which the fallback settles. These warnings are expected in the F13 check (`MIGRATION_PLAN.md`, P1.3). No step is assigned yet

## Server bugs

* [?] benighted - shared technique token climbing card discarded after current player choose a token but before next player chooses one
* `php:confirmClimbingCardChoice` (cards 15 and 24, option b: all other players gain 1 Gear Card): the log string `"[${new_asset_name}(${new_asset_type_arg[0]})]"` uses `${var}` interpolation, deprecated since PHP 8.2 (`php -l` warns on 8.4; found in P0.2). PHP also fills in the English card name before the log's own placeholders see it, so that name is likely not translated. Planned fix: P1.5 (PHP modernization sweep), in its own `fix:` commit, since the corrected string changes the log
* Q-R6: at setup, the Spread card replaced for 4 of a kind is shuffled back into the deck (`php:drawStartingSpread`). It should go to the discard pile, on top. Also check that the during-play path (`php:confirmAssets ~1086–1095`) puts the card on top of the discard pile, unless a card was discarded more recently. Planned fix: P5.2 (setup path); P5.3 (during-play check)
* The setup redraw for 4 of a kind on the starting Spread can run out of cards to remove (found in P1.1 on 2026-10-24; read in code, not run). The loop (`php:drawStartingSpread`, moved unchanged out of `setupNewGame` in P1.1a; `~769`) reads the four starting cards once, before it starts, and on each pass removes the last card left in that list. The list is never refreshed, so after four passes it is empty. If the Spread is still 4 of a kind then, the fifth pass reads a null card id: a PHP warning, then `insertCardOnExtremePosition(null, …)` (what Deck does with a null id isn't known), then probably a fifth card on the Spread. Which card the rules remove on each pass is R-10 in `RULES_CHECK.md`. Odds, from the deck after the Portaledge (96 cards: 33 Gear, 21 of each Skill), with each replacement drawn from 93 cards: about 1 in 7,100 games, almost all from an all-Gear start. To reproduce: the planned Spread debug function (P1.1b2) in `characterSelection`, with four Gear forced on top; the loop then reaches its fifth pass in about 1 call in 92 ((30/93)^4). Repeat the call, or restore a Studio save made before it. **Planned fix (proposed, for Jonathan to confirm):** it depends on R-10's answer. Proposed for P5.2, with Q-R6's setup path (the same loop), in its own `fix:` commit; once confirmed, §8.4 of `MIGRATION_PLAN.md` gets a row for it
* B8 (latent): Simul Climb runs the Rerack draw bookkeeping in `php:confirmAssets ~1012–1020` (it drops the player from `rerack_1` and turns `x_cards` 1 into 3), so `drawAssets` data is wrong on re-entry. Harmless today. Must be fixed before any slice relies on re-entering `drawAssets` (`MIGRATION_PLAN.md` §4.1.1). Planned fix: P5.9 (a `fix:` commit before it relies on re-entry)
* A zombie in `chooseSummitBetaToken` (state 30) leaves `climbing_card_info` set (found in P1.1b2, 2026-10-30; traced from the code only, for state 30 only, not seen on Studio).
  * `zombieTurn`'s default branch takes `zombiePass` (`php:zombieTurn ~6540`) to state 25 (`states.inc.php:194`). `stNextClimb` moves the in-play card to the discard but doesn't clear `climbing_card_info` (`php:stNextClimb ~5777–5813`), unlike `confirmChooseSummitBetaToken` (`~4628`). The global, with the offered `summit_beta_tokens`, lasts until the next climbing card is drawn (`php:confirmRequirements ~1806`, or `confirmCrimperClimbingCard ~5169` for the Crimper).
  * Effects, read in code: until then the two tokens still count as offered, so `debug_discardSummitBeta` and `debug_giveSummitBeta` refuse them. If the zombie was the round's last climber, the next Rerack's `confirmAssets` sees an active climbing card (`~1115`, `~1209–1212`) and goes to `nextClimb`, which `drawAssets` allows (`states.inc.php:53`).
  * The other climbing-card states share the same `zombieTurn` branch and haven't been traced.
  * It's in production code: `zombieTurn`, `stNextClimb` and `confirmChooseSummitBetaToken` are identical at `legacy-final`. Not caused by P1.1b2.
  * Fix step: to be decided.

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
* [?] declare the implicit globals: `last_replacement` (js:7997, 8361), `args` (js:8196; utils:3182, 3218), `start_pos`, `end_pos`, `x_diff`, `y_diff` (js:13261–13266), `climbing_card` (js:1231), `asset_board` (js:7545, 7554, 7566), `new_pitches` (js:12505), `token` (`utils.js:1071`). Assigning to an undeclared variable throws in strict mode, which ES modules use, so the migrated code can't keep them. Line numbers as at `46b6d81`, before the replay fix; `asset_board`, `new_pitches` and `token` were added from the F13 survey
* the log line for the climbing cards that go straight to adding a token lacks the card's name (a gap in the intended log effect; for sometime after the migration is completed). Jonathan's words: "Hmm, it appears that's a gap in the intended log effect. The log line "IndianaScones0 adds a Gear token to Irene's Arete" should be "Chopped Bolts: IndianaScones0 adds a Gear token to Irene's Arete", and "Chopped Bolts" should be injected in the same way as other climbing card names. This can be added as a step much later in the process. TODO.md for sometime after the migration is completed." Where it is built: the line is made at `Game.php:4162` (`'${player_name} adds a ${asset_type} token to ${pitch_for_log}'`; its args carry no climbing card). Other cards add their name in `confirmClimbingCardChoice`, which builds `climbing_card_for_log` as a nested log and prefixes the line with it (`Game.php:2240–2259`); the client's `logInject` turns it into a climbing-card tooltip item (`climbing_regex`, `utils.js:1326` at `46b6d81`). The draw itself logs nothing for any card (`drawClimbingCard`'s message is `''`, `Game.php:1747`). Cards on this path (they go to `addTokenToPitch`): 2, 6, 36, 41, 50, 54 and 63 (`Game.php:1755–1757`; for the Cool-Headed Crimper, 5111–5113)
