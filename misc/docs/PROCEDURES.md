# Procedures

Working rules for Claude Code sessions in this repo. Read this file at the start of every session, together with the latest entry in `progress.md` and `misc/docs/DECISIONS.md`. Consult `misc/docs/BGA_PITFALLS.md` before any step that touches Studio files, test tables, PHP or database code, zombies and states, or the client.

## Current phase: migration
Code changes are made only as steps of `misc/docs/MIGRATION_PLAN.md`, one step per session, in plan order unless Jonathan reorders them. Each session names its step ID at the start. Editing a file outside the step's "Files" list needs Jonathan's go-ahead. P8's steps are written in its own planning session after P7.

Structural, fix, UX and tooling changes go in separate commits (see "Commits"). Commit after Jonathan's Studio playtest of the step; push after Jonathan approves.

The migration (P0–P7) is parity only (`DECISIONS.md`, D10): decided UX changes from `misc/docs/UX_CHANGES.md` are implemented in P8, not opportunistically. The exceptions are listed in D10.

`TODO.md` bugs are fixed in the slice that owns them (`MIGRATION_PLAN.md` §8.4), not opportunistically.

The legacy build is frozen at tag `legacy-final`. A legacy fix happens only at Jonathan's request, through the hotfix path in `MIGRATION_PLAN.md` §10 (a branch from `legacy-final`, D2).

Review-only sessions (planning, investigation) stay docs-only.

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

## Installs and agreements
- Installing software, and accepting any terms or agreements, need Jonathan's confirmation in that session before the command runs.
- This includes command-line flags such as winget's `--accept-source-agreements` (even for a search) and `--accept-package-agreements`. Name the agreement and the flag when asking.

## Code conventions
- Never assume a fixed length for player IDs (for example, expecting 7 digits). Treat them as opaque identifiers.

## Decisions
- When Jonathan relays a decision from the design discussions, record it (with its reasoning) in `misc/docs/DECISIONS.md` in the same session.

## Progress log
- Keep a running log in `misc/docs/progress.md`. Add an entry at the end of each session (newest first) with the date, what was done, and what's next.
