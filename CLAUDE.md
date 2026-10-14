# First Ascent — BGA implementation

## Overview
First Ascent is a 2–5 player climbing board game (designed by Kate Otte). Players climb a hex-tile mountain by spending Asset cards, Water and Psych. Each round has three phases: Climb, Follow, Rerack. A player climbing their eighth Pitch (using their last Rope) triggers the end of the game: the current Climb Phase and Follow Phase are completed, then final scoring. There is no final Rerack Phase (RULES.md p. 13). Full rules: `misc/docs/RULES.md`.

This repo is the Board Game Arena (BGA) Studio implementation (game name `firstascent`). It is tested on BGA Studio, not locally, and deployed to Studio over SFTP.

## Current state and goal
- **Now:** legacy BGA framework with no class structure. The code is two giant files (client `firstascent.js`, server `firstascent.game.php`), with states in `states.inc.php`, actions in `firstascent.action.php`, and layout in `.tpl`/`.view.php`.
- **Goal:** migrate to the current BGA framework (`modules/php/Game.php`, `modules/php/States/` state classes, `modules/js/Game.js`, autowired actions). Restructure into classes along the way. Most known bugs are fixed in the migrated code, not the legacy code; see `misc/docs/PROCEDURES.md` for what is in scope before the migration. Resubmission to BGA waits until the migration is done.
- **Top priority:** the intermittent freezes. Cause found and investigation closed: a notification handler either waits on an animation that can never finish (for example, inside a container the player hid) or throws before its release call, stranding that client's queue until a refresh. Two targeted legacy fixes cover this; the rest goes into the migration principles. Conclusions, decisions and principles: `misc/docs/DECISIONS.md`.

## File map (existing code, repo root)
| File | Role |
|---|---|
| `firstascent.js` | Client UI (legacy Dojo `define`/`declare`). ~13.5k lines, 727 KB. **Largest file.** |
| `firstascent.game.php` | Server game logic (`FirstAscent extends Table`): setup, `getAllDatas`, state `st*`/`arg*` functions, game actions. ~6.8k lines, 364 KB. **Second largest.** |
| `modules/utils.js` | Client helper class (`bgagame.utils`): animations, selectables, z-index handling. Loaded by `firstascent.js`. 220 KB. |
| `modules/utils.php` | `UtilTrait`, shared server helpers. Required as `utils.php`, tracked in git as `Utils.php` (see TODO.md). |
| `firstascent.action.php` | AJAX entry points, forwarding to `game.php` (legacy). |
| `states.inc.php` | State machine (~30 states, `gameSetup` → … → `gameEnd`). |
| `material.inc.php` | Static game data: cards, pitches, tokens, characters (data only, 167 KB). |
| `firstascent_firstascent.tpl`, `firstascent.view.php` | HTML layout template (legacy). |
| `firstascent.css` | All styles. |
| `dbmodel.sql`, `stats.json`, `gameoptions.json`, `gameinfos.inc.php` | DB schema, stats, options, game metadata. |
| `img/` | Board, card, token and sprite images. |
| `_ide_helper.php`, `bga-framework.d.ts` | IDE stubs for the framework. Not game code; ignore. |
| `.vscode/sftp.json` | Studio deploy config for the VS Code SFTP extension (Natizyskunk). Authenticates with an SSH key via the Windows OpenSSH agent (`agent` option); contains no secret. Untracked (listed in `.gitignore`): don't commit it, and don't edit it without Jonathan's go-ahead. |
| `version.php`, `LICENCE_BGA`, `misc/README`, `modules/README` | BGA boilerplate. Don't edit. |

## Doc map: `misc/docs/`
- `PROCEDURES.md`: working rules (read first).
- `progress.md`: session log. The latest entry says what was done and what's next.
- `RULES.md`: complete rulebook transcription (page markers `<!-- p. N -->`). It also transcribes Guide Mode (simplified rules, p. 18 onward). Guide Mode is not implemented and not planned; ignore it, and never treat a difference from Guide Mode as a bug.
- `TODO.md`: BGA review feedback, known bugs (`[state]` = client out of sync with game state), test scenarios, planned improvements.
- `DECISIONS.md`: reasoning behind project decisions.
- `FREEZE_INVESTIGATION.md`: the closed freeze investigation: review, playtest results, suspects and code locations. Conclusions are in `DECISIONS.md`.
- `bga/current/`: current BGA framework docs: `game-files/` (Game.php, Game.js, State classes, dbmodel, …), `components/` (BgaCards, ItemManager, BgaAnimations, …), `components-community/`, `guides/`, `studio/` (debugging, logs, troubleshooting), `bga_ux_guidelines.md`.
- `bga/legacy/`: deprecated framework pages (action.php, states.inc.php, view/tpl, Deck, Stock).

**Rule: legacy docs are for understanding existing code only. All new or migrated code must follow `misc/docs/bga/current/`.**

## Working rules
See `misc/docs/PROCEDURES.md`. Read it before starting any work. It states the current phase and what may be edited.

## Decisions
Read `misc/docs/DECISIONS.md` before any planning, investigation, or migration work. It contains principles that all migrated code must follow, plus the reasoning behind project decisions. Don't duplicate its content here.
