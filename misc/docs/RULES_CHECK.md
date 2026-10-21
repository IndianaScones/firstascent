# Rules check

The record of where the code departs from `RULES.md`, or where the rules are silent (decision D11, 2026-10-21; format from `MIGRATION_PLAN.md` §5.3). The migration port is structural and never changes rules logic silently. A discrepancy becomes an item here, and the code changes only after an answered item, in a `fix:` commit (`PROCEDURES.md`, "When unsure"). Guide Mode (`RULES.md` p. 18 onward) is out of scope.

- **Only deviations and silent areas are recorded.** Matching rules aren't restated.
- **Decisions** move to `DECISIONS.md`.
- **Item fields:** id, the `RULES.md` quote with page, the code location, the outcome, the status, the answer.
- **Ids:** `R-n`. Items seeded from the plan's first findings (`MIGRATION_PLAN.md` §5.4) keep that id as an alias: `R-1` is Q-R1, and so on.
- **Outcomes:** *discrepancy*, *rules silent* (implementation assumption), *implementation-only feature*, *suspected bug*.
- **Statuses:** OPEN → ASKED → ANSWERED → FIXED in `<commit>`, or ACCEPTED.
- **Code locations** are approximate lines at the 2026-10-15 baseline (`php` is `firstascent.game.php`, `utils.php` is `modules/utils.php`).
- **"For the rulebook revision"** marks answers that Garrett's revised printing should include.

All answers below are Jonathan's, recorded 2026-10-21.

## Climbing

### R-1 (Q-R1) Bail out
- **Rules:** no passage. "Bail" doesn't appear in `RULES.md`.
- **Code:** `php:confirmBail ~1996`; `states.inc.php ~81`.
- **Outcome:** implementation-only feature. The player loses 1 Water and 1 Psych, returns to the previous Pitch, and takes no Assets in the next Rerack.
- **Status:** ACCEPTED. The code is the reference. For the rulebook revision.
- **Answer:** it's Garrett's rule, made in response to a scenario found during the digital implementation. It isn't in the printed rulebook. Garrett plans a revised printing that includes it.

## Drawing and Rerack

### R-2 (Q-R2) The Rerack after a bail
- **Rules:** p. 11: "Players who climbed in the Climb Phase draw 3 Cards from The Spread and/or Asset Deck."
- **Code:** `php:stNextDraw ~5635–5686`. A bailed player is appended to `finished_drawing` twice.
- **Outcome:** suspected bug, now confirmed.
- **Status:** ANSWERED. Fix in P0.2 (the legacy fix batch); then FIXED in `<commit>`.
- **Answer:** the bug is confirmed on Studio. With 2 players, when the first in Rerack order bails and the second climbed, the first draws nothing (with a log note that they bailed), the second is skipped, and the next round's Climb Phase starts, with no errors or warnings. The repro is in `TODO.md`.

### R-6 (Q-R6) The Spread card replaced for 4 of a kind
- **Rules:** p. 11: "If 4 of a kind are on The Spread, remove the last Card added and replace it with a new Card from the deck."
- **Code:** `php:setupNewGame ~419–430` (shuffled back into the deck) vs `php:confirmAssets ~1086–1095` (goes to the discard pile).
- **Outcome:** discrepancy between setup and play.
- **Status:** ANSWERED. Fix in P5.2 (the setup path), with the during-play path checked in P5.3; then FIXED in `<commit>`.
- **Answer:** the difference is unintended. The replaced card stays on the discard pile, on top unless a card was discarded more recently.

## Portaledge

### R-5 (Q-R5) Refilling a Portaledge stack
- **Rules:** p. 8: "If a stack on The Portaledge runs out, refill it with 7 more, using Cards from the discard pile."
- **Code:** `utils.php:drawFromPortaledge ~623–629`; `php:argSelectPortaledge ~5359–5386`. The code tops up from the Asset deck.
- **Outcome:** rules silent when the discard pile holds fewer than 7 Cards of the type.
- **Status:** ACCEPTED. For the rulebook revision.
- **Answer:** a refill takes Cards from the discard pile first. If that doesn't find 7 of the type, the rest come from the Asset deck, which is then reshuffled. The code tops up from the deck without the reshuffle.
- **Note for the Portaledge slice (P5.4):** check whether the missing reshuffle matters digitally. It matters only if a player can know the deck order.

## Follow Phase

### R-3 (Q-R3) Players who rested
- **Rules:** p. 7: "Resting skips your turn in the Climb and Follow Phases but allows you to gain more Assets in the Rerack Phase."
- **Code:** `php:stMatchingTechniques ~5848`, `stFlagPermanentAssets ~6213`. Both loop over all players (only `stFlagPermanentAssets` skips zombies), and neither checks `rested`.
- **Outcome:** discrepancy with the wording of p. 7.
- **Status:** ACCEPTED.
- **Answer:**
  - In Follow Phase step 1 (matching Techniques), a player who rested normally has nothing to match, so checking them is harmless. If they hold a set of 3 tokens (Technique Tokens, possibly with New Rubber), they exchange it for a 2-point token.
  - They do take part in step 2 (Permanent Assets), since they may hold 4 or more cards of a type from earlier rounds.
  - The code checks every player in both steps, which matches.
- **Notes:**
  - This departs from the wording of `RULES.md` p. 7.
  - New Rubber's handling is to be confirmed during the Follow Phase rules check (P2.6, P5.11).

### R-7 (Q-R7) A set of 3 Technique Tokens
- **Rules:** p. 10: Technique Tokens "can be used instead of a Card when you match Technique symbols."
- **Code:** `php:stMatchingTechniques ~5876–5942`.
- **Outcome:** rules silent on a set made only of tokens.
- **Status:** ACCEPTED.
- **Answer:** a set of 3 Technique Tokens with no card scores. The code appears to match.
- **Note:** the allocation step hasn't been traced yet. Confirm it during the Follow Phase rules check (P5.11).

### R-8 (Q-R8) Sendy Jammer and wild-only sets
- **Rules:** p. 15, Sendy Jammer: "You only need 2 Cards with matching Technique symbols and any 1 Gear Card to gain 2 points in the Follow Phase."
- **Code:** `php:stMatchingTechniques ~5896` (`is_pure_wild_on_empty`) excludes sets made purely of wilds.
- **Outcome:** suspected bug, partly confirmed.
- **Status:** ANSWERED. Fix in P0.2 (the legacy fix batch); then FIXED in `<commit>`.
- **Answer:**
  - 1 card plus 2 Gear wilds scores. The technique type may be chosen arbitrarily. The code appears to allow this (the allocation step hasn't been traced yet).
  - Wild-only sets also score (Sendy Jammer with 3 Gear Cards, or Gear Cards plus Technique Tokens with no natural symbol), again with an arbitrary technique type. The current code excludes them, which is a bug.

## Characters and resources

### R-4 (Q-R4) Phil's Water and Psych cap
- **Rules:** p. 5 (diagram note): the Water and Psych tracks are "each numbered 0–6".
- **Code:** `utils.php:updateResourceTracker ~532` caps Phil at 7.
- **Outcome:** discrepancy with the p. 5 diagram note.
- **Status:** ACCEPTED.
- **Answer:** Phil's Water/Psych cap is 7.
