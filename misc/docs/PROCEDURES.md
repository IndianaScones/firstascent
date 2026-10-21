# Procedures

Working rules for Claude Code sessions in this repo. Read this file at the start of every session, together with the latest entry in `progress.md` and `misc/docs/DECISIONS.md`. Consult `misc/docs/BGA_PITFALLS.md` before any step that touches Studio files, test tables, PHP or database code, zombies and states, or the client.

## Current phase: review
Until Jonathan says otherwise, **do not modify code files.** Only create or edit files in `misc/docs/` and `CLAUDE.md`. Jonathan will say when this phase ends; update this section then.

One-time exceptions to this rule are granted per task. When one is granted, note it in that session's `progress.md` entry. Exceptions never carry over to later tasks or change the phase.

## Scope before migration
Until the migration starts, only these code tasks are in scope:
1. The two targeted freeze fixes (done: `948f472` and `88209ef`, playtested and pushed 2026-10-14):
   - the fallback in `animationPromise` (`modules/utils.js`);
   - the null guards at the three confirmed `trade_button` sites in `firstascent.js`.

   The freeze investigation itself is closed (`DECISIONS.md`, "The freezes are the top priority").
2. Simple fixes for regressions from the recent Portaledge refactor (done: `5df6cd3`, `0114572`, `1aaad2b` and `fd78ef9`, playtested and pushed 2026-10-15; superseded by item 3). The first was the Bomber Anchor click-time errors in `firstascent.js`: the `#draw_counter` writes in `onSelectPortaledge`, the unguarded `#available_sb_message` removals, and `bomber_anchor` surviving Undo Token.
3. **Next: the legacy fix batch (P0.2 in `MIGRATION_PLAN.md`).** It is the last legacy code task. After the tag `legacy-final` the legacy build is frozen (`DECISIONS.md`, "The legacy build gets one final fix batch, then it is frozen"). The batch, whose items are in `TODO.md`:
   - Q-R2: a bailed player is appended to `finished_drawing` twice (`php:stNextDraw`);
   - Q-R8: wild-only Technique sets score 2 points (`php:stMatchingTechniques`);
   - B7: Simul Climb in `crimperClimbingCards`; verify on Studio before fixing;
   - B5: the Studio-only guard on `debug_goToState` (`modules/utils.php`);
   - Jonathan's uncommitted `firstascent.js` fix (climbing card 57), committed as it is;
   - installing a PHP CLI for `php -l`, which needs Jonathan's confirmation in that session;
   - before all of that, setting aside Jonathan's testing overrides in `firstascent.game.php` (saved as a patch outside git; reverting the file needs his explicit confirmation).

The SQL strict-mode game creation fix (T23) is no longer a legacy task: it is folded into P1 (`DECISIONS.md`, D9).

Don't fix other `TODO.md` bugs in legacy code, including the other bugs the freeze investigation found. Their reproduction steps serve as regression tests for the migrated code.

The step-2 freeze diagnostic tooling (planned for a throwaway branch) was dropped for the legacy code. Its useful ideas move into the migrated code; see `DECISIONS.md`.

Being in scope does not lift the phase rule above: code changes still need Jonathan to end the review phase or grant an exception.

## UX and usability
UX and usability decisions belong to Jonathan and Garrett (the game's publisher). When migrating or fixing code, preserve the current UI behavior and appearance unless Jonathan specifies a change. Suggest UX improvements; don't implement them on your own initiative.

## Testing
- The game is tested on BGA Studio, not locally.
- After any code change, list specifically what Jonathan should playtest to verify it: the scenario to set up (phase, character, player count), the steps, and the expected result.

## Commits
- Keep bug fixes and structural changes in separate commits. Never combine them.
- Work in small, reviewable steps. Commit after each verified step.
- Playtest verification applies to code changes (verified = playtested on Studio by Jonathan). Docs-only changes are committed once Jonathan approves them.

## When unsure
- If the rules are ambiguous, or the code contradicts `RULES.md` (excluding Guide Mode), ask Jonathan rather than guessing. Quote the `RULES.md` passage (with page number) and the code location.

## Code conventions
- Never assume a fixed length for player IDs (for example, expecting 7 digits). Treat them as opaque identifiers.

## Decisions
- When Jonathan relays a decision from the design discussions, record it (with its reasoning) in `misc/docs/DECISIONS.md` in the same session.

## Progress log
- Keep a running log in `misc/docs/progress.md`. Add an entry at the end of each session (newest first) with the date, what was done, and what's next.
