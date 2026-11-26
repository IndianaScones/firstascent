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

## Playtest lists
The session that makes a code change writes its playtest list, as `<step>-playtest-v1.md` in the work folder. A change to a list is a new version (`-v2.md` and so on); earlier versions are kept. Approved lists to follow as models: `p1-5-playtest-v4.md`, `p1-5a-playtest-v3.md`, `p1-6-playtest-v2.md`, `p1-7-playtest-v3.md`.

**Check the rules first.**
- Before writing a step, check what it asks the players to do against `misc/docs/RULES.md` and Jonathan's rulings in `misc/docs/RULES_CHECK.md`, not against the code alone. This covers who may climb where, turn order, setup counts, what a turn allows, costs, and the options a card offers.
- Where the code and the rules disagree, write a finding for Jonathan, never an expected result. Don't invent rules behaviour to make a step work.
- Record the check in the `progress.md` entry with page numbers. If nothing disagrees, write "no rules finding" and name the pages checked.

**What goes in.**
- Every step must exercise something the old and the new code could do differently, or be needed to reach one. So must every report line. Leave out the rest, such as log lines or hand counts that can't show a difference.
- Leave out checks that the harness or another step already shows. No existing-table check: no table spans a deploy (D12).

**Format.**
- Keep it simple and visually organized: each step is short instructions, one per line, then a "Report" quote block.
- No source references, line numbers, tags (such as [R], [C] or [S]), reasoning, or explanations of basic rules. Those go in the `progress.md` entry.
- "Before you start" holds the rules for the whole list: saving consoles, noting debug calls, what to do when a debug call is refused, the known problems not caused by the step, and a ready-made `SELECT … FROM stats` query when statistics are used.
- Write statistics as `name (id)`.
- At the top of each table, give a short role setup and a reminder to save each tab's console as a `.log` file before closing any tab.
- Put instructions that apply across rounds before round 1.

**Content.**
- Name who goes first in each round. With 2 players, turn order alternates between rounds.
- Character selection runs in reverse order. Write the roles as: "W is the player asked to choose a character first. Z chooses second and is first in round 1."
- In a 2-player game the first draw is 5 cards for each player (`RULES.md` p. 5, Set Up: Player Area, step 15).
- Only 3 of the 12 characters are offered in a 2-player game. When a step needs a particular character, use `debug_setAvailableCharacters` before anyone chooses. Never let both sides of one mat be chosen (`otherSideOf` in `UtilTrait.php`).
- Every Pitch tile except The Trifecta is placed at random per table, so "P1" and "P2" in a list are board positions, not pitch ids.
- After a successful debug call, the list says to press F5 in the other tab. `debug_giveAssets`, for one, reloads only the caller's page.

**Jonathan's results.**
- He reports step by step in a text file, with each tab's console as a `.log` file. Read both. Read log lines by content, not by their order.
- Record "as expected" without the numbers asked for as not seen.
- Record anything played differently from the list as a deviation, quoting his file.
- Record the files in the entry by path and counts.
- If he asks for a change to a list, write a new version in the same style. Don't make a separate fill-in template.

## Work folder and machines
Files outside the repo (diffs, playtest lists, handoff patches, scratch outputs) go in the work folder: the folder that contains the clone.
- Desktop: work folder `D:\Documents\BGA Studio\`, clone `D:\Documents\BGA Studio\firstascent`.
- Laptop: work folder `C:\BGA Studio\`, clone `C:\BGA Studio\firstascent`.

Each session prompt starts by naming the machine. Each new `progress.md` entry names the machine it ran on. Paths in earlier entries are desktop paths unless the entry says otherwise. A step moved between machines mid-step travels as `handoff.patch` in the work folder, and the prompt of the session that picks it up says so.

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
