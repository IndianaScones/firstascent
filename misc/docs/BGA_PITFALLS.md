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
- **Studio's debug menu lists the debug functions without the `debug_` prefix.** Seen on Studio in P1.2 (1c, 2026-11-01): all 14 present, none extra.
- **After a refused debug call, Studio's own code may log a second console error,** `Uncaught (in promise) {message: '', args: null}`, at `triggerDebug` in `ly_studio.js`. Seen on Studio in P1.2 (3c).
- **Studio forces a page refresh on a table left idle for a while.** Seen on Studio in the replay fix's trial 2 (table 995807), between 1g and 1h and between 1l and 1m, after Jonathan had been away from the keyboard.

## PHP and database
- **`getCollectionFromDb` keys by the first column.** Duplicate values silently overwrite rows.
- **Database values come back as strings.**
- **`playerStats->init` takes no player id** (P1.4).
- **`${var}` string interpolation is deprecated.** One remains: a log string in `php:confirmClimbingCardChoice` (cards 15 and 24), found by `php -l` in P0.2. It is in `TODO.md`, planned for P1.5.
- **`define()` constants under a namespace.** Unqualified names fall back to the global namespace **[inferred: PHP semantics]**, so the risk is smaller than claude-code-bga says.

## Zombies and states
- **Every active-player state must always offer a legal action.** Relevant to bail and to stuck positions.
- **Zombie delegation.**
  - `act*` methods take the magic `$activePlayerId`.
  - The multiactive `choosePermanentAssets` needs a helper with an explicit player id.
- **The zombie mode level must be declared in the Game Metadata Manager before alpha.** Not in this repo's docs. Confirm with BGA before resubmission (P7.2).

## Client
- **`performAction` only from user events,** never from notification handlers or state methods.

## Replays
Seen in the replay fix (F13; `progress.md`, 2026-11-09). "Seen on production" means on the BGA Production site; [S] means on Studio.
- **A replay never clicks.** Elements that only a click on that client creates (the asset board, `.selected_pitch`, `#discard_box`, the Bomber Anchor counter) are missing in a replay, and in a second window of the same player, which doesn't click either **[inferred]**. Handlers must not assume them (`DECISIONS.md`, "Handlers that find an element missing").
- **A replay's page holds the whole game's log from the start,** in `replaylogs_move_N` containers (seen on production; [S] table 995807: 32 containers at move 30). A document-wide query or sweep reaches log entries from the future.
- **Each log line can be on the page three times in a replay:** the `replaylogs_move_N` copy from the start, `log_N` in the log panel, and `dockedlog_N` in the docked log. A document-wide sweep reaches all of them [S, table 995807].
- **Console queries in a replay needed the game's frame.** In the replays, console queries needed `frame.html` selected to reach the game's code. With the top frame, a query printed an empty table (seen on production) or "missing" for every id ([S] table 995807). The live tabs answered with `top` selected (trial 1) or `gamelframe` (trial 2). The two contexts were never compared directly, so what the top frame shows or hides is not established.
- **Debug functions that change state without a notification make a replay diverge,** because a replay plays only the notifications **[inferred]**. Seen: after `debug_endGameSoon`, the Rope totals in the player panels weren't updated in the replays (table 995807; predicted in advance).

## Limits
- **The notification payload limit is 128K** (`bga/current/game-files/Main game logic_ Game.php - Board Game Arena.md:1063`). It bounds the post-state design in `MIGRATION_PLAN.md` §4.1.
