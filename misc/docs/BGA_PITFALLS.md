# BGA pitfalls

Pitfalls to keep in mind when working on Studio files, test tables, PHP and database code, zombies and states, and the client. Consult this file before any step that touches those areas, and when a Studio symptom looks odd.

Moved from `MIGRATION_PLAN.md` §9.5 (decision D3, 2026-10-21). They come from the community skill claude-code-bga (commit `e11cf64`, 2026-07-15, MIT), which is not installed; the evaluation is in `MIGRATION_PLAN.md` §9. Items marked **[inferred]** are reasoning, not read in the BGA docs or the code. If an item contradicts the docs in `bga/current/`, the docs are the reference and this file gets corrected.

## Studio file hygiene
- **Stale remote files.**
  - Uploads never delete. Remove moved or deleted files on Studio by hand.
  - Stale state files show up as "Invalid id for state class".
- **In-flight tables keep the old schema and state ids.** Start fresh tables after structural steps.

## Test-table friction
- **Express-start tables are real-time.** Keep one tab open per player, or the table is abandoned.
- **A stale open table silently blocks "Create".** Use "Express stop" on it.
- **The "BGA unexpected exceptions logs" view is account-wide,** not per game.
- **Hotseat players share `gamedatas`.** Test with separate tabs per player.
- **The debug menu fills in player ids.**
  - For a debug function's `int $playerId` parameter, Studio's popin lists the table's player names as links. Clicking one fills in that player's id, so there's no need to look the ids up first.
  - Seen on Studio in the P1.1b1 playtest (2026-10-28), not in claude-code-bga.

## PHP and database
- **`getCollectionFromDb` keys by the first column.** Duplicate values silently overwrite rows.
- **Database values come back as strings.**
- **`playerStats->init` takes no player id** (P1.4).
- **`${var}` string interpolation is deprecated.** One remains: a log string at `php:2638` (cards 15 and 24), found by `php -l` in P0.2. It is in `TODO.md`, planned for P1.5.
- **`define()` constants under a namespace.** Unqualified names fall back to the global namespace **[inferred: PHP semantics]**, so the risk is smaller than claude-code-bga says.

## Zombies and states
- **Every active-player state must always offer a legal action.** Relevant to bail and to stuck positions.
- **Zombie delegation.**
  - `act*` methods take the magic `$activePlayerId`.
  - The multiactive `choosePermanentAssets` needs a helper with an explicit player id.
- **The zombie mode level must be declared in the Game Metadata Manager before alpha.** Not in this repo's docs. Confirm with BGA before resubmission (P7.2).

## Client
- **`performAction` only from user events,** never from notification handlers or state methods.

## Limits
- **The notification payload limit is 128K** (`bga/current/game-files/Main game logic_ Game.php - Board Game Arena.md:1063`). It bounds the post-state design in `MIGRATION_PLAN.md` §4.1.
