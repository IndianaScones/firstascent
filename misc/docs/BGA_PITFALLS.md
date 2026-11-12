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
- **`bga->globals` against the old `global_variables` JSON column.** Seen on Studio in P1.3 (`debug_globalsShape`, 37 cases; DB 8.4.4-4, PHP 8.4.27; `progress.md`, 2026-11-10 and 2026-11-11).
  - `bga->globals->get` returns JSON objects as PHP arrays (nested ones too), with their keys in the order the old column returned them on MySQL 8.4: shorter keys first, then bytewise (`9` before `10`). A top-level empty object comes back as `stdClass`, and a stored `0` as int `0`. Lists, null, false, `""`, `"0"`, fractional floats and a missing key (null) come back as stored; a whole float is stored as an int (`2.0` reads `2`).
  - The old wrapper returned null for a top-level 0 because of its own truthiness test on the JSON text (`if ($json_obj)`, `UtilTrait.php:44` at `331e4d0`), not because of the column.
  - The old wrapper built its SQL from unescaped JSON: `é` was stored as `u00e9`, and the apostrophe, `"`, `\` and newline cases couldn't be run through it. `bga->globals->set` stores and returns all of them unchanged (the re-run's cases 30, 32, 33).
- **The undo savepoint covers `bga_globals`.** Seen on Studio in P1.3, step 8: after Undo of a climbing card, Jonathan reported "all values remained correct". phpMyAdmin's table tree for a post-deploy table (`ebd_firstascent_1005120`) lists a table whose name begins `zz_savepoint_bga_glob` (cut off in the tree) next to the other `zz_savepoint_` copies; read as `zz_savepoint_bga_globals` **[inferred]**. Two restores of Studio saves (the "Load Previous State" button, and a save loaded in T5) went without incident, which is light evidence that Studio saves cover it too.

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
- **A refused debug call in a game appears to freeze that game's replay at that point,** so a table meant for a replay check shouldn't include one. Seen on Studio in P1.3's first T3 (table 1002510; `progress.md`, 2026-11-11): `debug_endGameSoon` was refused for a player who hadn't climbed, in round 3's second `climbOrRest`. Both replays (one per seat) stopped at that `climbOrRest`; both consoles end with `Try to lock interface while it is already locked !` from `ly_studio.js` (`ntf_archivewaitingdelay`) and no error from the game's code. A rerun without the refusal (a new T3-shaped table) reached the end in both replays (consoles not saved). Not isolated: a refusal sends no notification and changes no state **[inferred]**, so why the replay stops there is not known.

## Limits
- **The notification payload limit is 128K** (`bga/current/game-files/Main game logic_ Game.php - Board Game Arena.md:1063`). It bounds the post-state design in `MIGRATION_PLAN.md` §4.1.
