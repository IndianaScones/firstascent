# Progress log

Running log of what was done each session and what's next. Newest entry first. See `PROCEDURES.md`.

## 2026-10-24 (P1.1, in progress: (a) and (b1) done; (b2) next)

The session started 2026-10-23 (Jonathan's local date) and stopped before (b1), at Jonathan's request. The (b1) session started 2026-10-26 and stopped 2026-10-28 with (b1) committed. (b2) starts in a new session. The spec for (b1) and (b2), with Jonathan's answers Q1–Q8, is in `MIGRATION_PLAN.md` §6.2. P1.1's updated scope, including (d) and its list, is in P1.1. This entry doesn't repeat them.

**Compaction.** The (b1) session was auto-compacted once, after the implementation and before the closing report. No unplanned git action happened. The session prompt asks for this entry to be updated at the next checkpoint after a compaction. That update was due with the closing report. It was made later, on 2026-10-27, after Jonathan's review and before the playtest. This final update replaces it.

**State at the stop**
- **HEAD:** `c5500ec` (P1.1b1, `tool:`), pushed at Jonathan's "push". `main` and `origin/main` are level.
- **Staged:** nothing.
- **Unstaged:**
  - `misc/docs/MIGRATION_PLAN.md`: P1.1's status and three §6.2 markers;
  - `misc/docs/BGA_PITFALLS.md`: the debug menu's player links (go-ahead below);
  - this file.
  - They go in one `docs:` commit. Jonathan's message asked for that commit and for its push.
- **Studio:**
  - `modules/utils.php` as at `c5500ec`, deployed for the playtest;
  - `firstascent.game.php` at `4cdc882`;
  - the other game files as at `bc4a9c9`.
- **Files outside git:**
  - In `D:\Documents\BGA Studio\`:
    - `p1.1b1.diff`: (b1) as committed, 285 lines (`modules/Utils.php | 275 +`);
    - `p1.1b1-docs.diff`: this docs diff;
    - from the previous session, unchanged: `p1.1a.diff`, `p1.1a-v2.diff` and `p1.1-docs.diff`.
  - The scratchpad of the (b1) session, `C:\Users\Jonat\AppData\Local\Temp\claude\D--Documents-BGA-Studio-firstascent\032e89f2-8e43-4bcd-9f68-3c63b37b8733\scratchpad\`:
    - the stub harness `p11b1_harness.php`, run as `php p11b1_harness.php <repo>`. It stays out of the repo;
    - `cached.diff`, the staged diff compared with `p1.1b1.diff`.
  - The previous session's scratchpad (`…\2b85d47a-21c5-4b19-88da-a92b6dd232b6\scratchpad\`), unchanged.
  - `D:\Documents\BGA Studio\firstascent-overrides\`, untouched. Retiring it is Jonathan's decision.

**Start check ((b1) session):** `git fetch origin`; HEAD `a5b9306`, level with `origin/main`, working tree clean. `git diff --stat 4cdc882 HEAD` touches only `misc/docs/`, so the game files are as at `4cdc882`.

**Start check (first session):** `git fetch origin`; HEAD `7e9d749`, level with `origin/main`, working tree clean.

**Items**
- **(a)** done: `4cdc882` `struct:`, playtested.
- **(b1)** done: `c5500ec` `tool:`, playtested.
- **(b2)** next, in a new session: the six functions under "Added in P1.1".
- **(d)** after (b2): the scaffolding commit.
- **(c)** confirmed: the guard on `debug_goToState` is at `utils.php:929–934` and throws `\BgaSystemException('Studio only')` outside Studio.

**(b1): the six debug functions** (`c5500ec`, `tool:`)
- The six §6.2 functions are in `modules/utils.php` (`UtilTrait`), after `debug_goToState`: 275 inserted lines and no other change. `firstascent.game.php` is unchanged.
- The helpers are `parseDebugIds`, `checkDebugId`, `checkDebugPlayer`, `otherSideOf` and `logDebugWarning`.
- **My choices where §6.2 leaves the detail open**, flagged to Jonathan with the diff:
  - state checks use `$this->gamestate->getCurrentMainState()->name`;
  - the stats delete filters on the stat ids and on the table's player ids;
  - a card or token in a location other than the allowed ones is refused (defensive; it can't happen today);
  - list items may have spaces around the ids;
  - warnings start with "Debug warning: ".
- **Where the current APIs are used:**
  - `bga->playerScore` and `bga->playerStats` are called only in the Elitist revert;
  - `bga->notify` only in `logDebugWarning`;
  - the unchanged `initSharedObjectives` keeps the legacy calls (`initStat`, `incStat`, and `DbQuery` for the +4).
- **Checks:**
  - `php -l` passes. The only message is the known `${var}` deprecation at `firstascent.game.php:2653`.
  - The stub harness passes 17,064 checks. It loads the real trait, the real `initSharedObjectives` text, `material.inc.php` and `stats.json`. Its error handler turns PHP warnings into exceptions.
  - It covers:
    - every refusal, and that nothing changes before it;
    - the guard;
    - the stacking order;
    - the token moves, with Q1's reindexing;
    - the `pitch_tracker` padding;
    - the attributes and the `debug_` names.
  - **The Elitist-revert equivalence runs, 1,612:** 403 for each of 2, 3, 4 and 5 players. Each set is a target exactly once.
    - The "from" sets: three fixed sets that contain 11, plus 400 random ordered sets.
    - Per player count, 53–65 runs revert The Elitist, and about half share an objective with the target.
  - **Mutants:** all 11 were caught. One needed an extra test with the ids listed in the other order.
- **Pre-code checks:**
  1. **`$players`:** `initSharedObjectives` reads only its keys, so `loadPlayersBasicInfos()` gives it the same input. Recorded in §6.2.
  2. **Citations at HEAD:** three are off.
     - getAllDatas `~818`: `available_characters` is at 831.
     - stNextCharacterSelect `~5533–5594`: the function is at 5537–5616, and Phil's deal at 5546–5607.
     - The "When" of `debug_setSharedObjectives`, `setupNewGame ~442–627`, is stale:
       - the set is drawn at 422–430 and passed at 435;
       - `initSharedObjectives` is 585–761, with The Elitist's +4 at 682–697 and the objective statistics at 751–759.
     - The rest match within a line or two, including the client citations (read only).
     - §6.2 is left unchanged, as the session prompt required.
  3. **The `stats` table:**
     - Troubleshooting:29–30: the error message, with the columns and the unique key `stats_table_id`;
     - `dbmodel.sql:15`: a standard table; Troubleshooting:411 also mentions it;
     - stats.json doc:35: a table statistic and a player statistic may share an id. The only table statistic here is 90;
     - Tools and tips:34: "Go to game database" opens phpMyAdmin;
     - `_ide_helper.php` has only the signatures of the stat methods.
- **Staging:**
  - `git add modules/Utils.php`, the tracked name. `git ls-files --eol` showed `i/lf w/crlf`.
  - `git diff --cached --stat` showed 275 insertions, and the staged diff was byte-identical to `p1.1b1.diff`.
  - Note: `git show <rev>:<path>` applies the working-tree line-ending conversion, so it shows CRs that the blob doesn't have. `git cat-file blob` and `git ls-files --eol` show the index as stored.
- **Line endings of the docs:**
  - The Edit tool in this session wrote LF to the docs it edited: `MIGRATION_PLAN.md`, `BGA_PITFALLS.md` and this file. The other docs are CRLF in the working copy.
  - All three were set back to CRLF before the docs commit. Git shows no change from this.
- **Jonathan's review before the deploy:** six questions, answered from the code, found no bug. They covered:
  - `isPlayerZombie`;
  - the shape of the offered Summit Beta tokens;
  - the stat id map;
  - the location and type strings;
  - the Elitist-revert runs;
  - the stubbed framework methods.
- The review found one gap. Nothing in the playtest checked the refusal of a Summit Beta token on offer in `chooseSummitBetaToken`. The harness built the offered list itself rather than through `getCardsOnTop`.
- **Playtest additions approved by Jonathan.** P1.1's playtest list in the plan stays unchanged.
  - **Scenario 6 addition** (in the session prompt), on Table C:
    1. `debug_setSharedObjectives(16, 11, 10)`: every score goes up by 4.
    2. Then `debug_setSharedObjectives(1, 3, 5)`, a set without 11 and without both sides of one token.
    3. Expected: every score drops by 4, and the end-of-game statistics show lines only for the second set.
    - `bga->playerScore` and `bga->playerStats` are called only in the Elitist revert.
  - **Scenario 7 addition, the offered token** (approved 2026-10-27, after the review), on Table A after scenario 4 and before scenario 5:
    1. Just before a climb, `debug_stackSummitBeta("5,6")` and `debug_stackClimbingDeck("19")`.
    2. The climber takes option B of Hangry partner (19).
    3. Expected: the two tokens offered are 5 and 6, in that order.
    4. `debug_giveSummitBeta(5, <player id>)` is refused with "Summit Beta token 5 is offered in chooseSummitBetaToken".
    5. Then choosing a token works as usual.

**(b1) playtest** (Studio, 3 players, desert board; results reported 2026-10-28; all pass)
- `modules/utils.php` deployed, F5 in every open tab.
- **Done when:** the debug menu shows the six functions next to `debug_goToState`, and none of the five helpers.
- **The debug menu and player ids:**
  - For an `int $playerId` parameter, the popin lists the table's player names as links. Clicking one fills in that player's id.
  - Future playtest lists don't need the "try player id 1" workaround.
  - Recorded in `BGA_PITFALLS.md` ("Test-table friction").
- **Table A:**
  - **Scenario 1:** passed. Crag Mama stayed, and the Q4 warning appeared in the log.
  - **Scenario 2:** passed. The starting player, the Cool-Headed Crimper, climbed.
    - The first climbing card drawn was 3, "Party above you forgot some gear".
    - The first Summit Beta token drawn was Bomber Anchor, gained from that card.
  - **Scenario 4:** passed.
    - Bomber Anchor was already in player X's hand from card 3. Giving it to another player moved it, and it left X's hand.
    - Player id 1 was refused, with the table's ids and names listed.
  - **The scenario 7 addition (offered token):** passed.
    - On card 19, option B, giving a token offered in `chooseSummitBetaToken` was refused with the expected message.
    - Jonathan's report doesn't separately mention the order of the offered tokens (5, then 6) or the choice that followed.
  - **Scenario 5:** passed.
    - 1 Rope after the reload, and the next climb showed "This is the final round!".
    - The Climb and Follow Phases completed, then final scoring, and the table ended. There was no Rerack.
- **Table B, scenario 3:** passed. Off-Width Aficionado, The Elitist and All-Arounding were shown, every score was 4, and there was no warning.
- **Table C, scenario 6:** passed, including the addition.
  - The two `debug_setSharedObjectives` calls gave +4, then −4.
  - `debug_endGameSoon` after one climb logged the warning, which stayed after a refresh.
  - The end-of-game statistics had "Points from…" lines only for Ridgeline Challenge North, Stay in the Shade and Jolly Jammer.
  - Neither "Shared Objectives scored" nor "Points gained from Shared Objectives" included The Elitist. "Points gained…" equals the sum of the three lines.
- **Refusals (7):** all passed.
  - `debug_setAvailableCharacters`: the four cases, plus listing more characters than remain: "More characters listed (4) than available_characters holds (3)".
  - `debug_stackClimbingDeck`: refused in both `crimperClimbingCards` and `climbingCard`.
  - `debug_stackSummitBeta` on a token in a hand:
    - Jonathan set it up with `debug_giveSummitBeta`, not after scenario 4.
    - The first attempt gave an unexpected result, which Jonathan puts down to a misstep of his. What it showed isn't recorded, and it wasn't investigated.
    - Repeated from a Studio save/restore replay, it refused with the expected message.
  - `debug_setSharedObjectives`: all three cases.
  - `debug_giveSummitBeta` with an unknown player, and `debug_endGameSoon` for a player who hasn't climbed: passed.
- **Warnings (8):** all passed. The shared-objective pair warning was tested with (1, 2, 3).
- **The reload check (9):**
  - A successful call reloads the page of the window that made it.
  - A refusal doesn't reload.
  - Other open windows need a manual F5.
  - Recorded in §6.2.
- **APIs on Studio:** `bga->notify`, `bga->playerScore`, `bga->playerStats`, `getCurrentMainState()` and `VisibleSystemException` all worked in this file. The guard's `SystemException` never fires on Studio, so it is reviewed in code only.
- **Replays:** one result came from a Studio save/restore replay, the `debug_stackSummitBeta` refusal for a token in a hand. The rest came from live play.
- **Jonathan's game note:**
  - A player can't be left with no available pitch after their first climbed pitch.
  - It takes at least 3 climbed pitches to reach a position that forces a bail, or fewer only with help from opponents.
  - So the case behind the one-pitch warning is rare in practice.

**Go-aheads in the (b1) session**
- **Outside the step's list:** `misc/docs/BGA_PITFALLS.md`, one item under "Test-table friction": the debug menu fills in player ids. Jonathan's go-ahead, 2026-10-28.
- The other docs edits are those the session prompt allows: this entry, P1.1's status, and three §6.2 markers (`reload`, `loadPlayersBasicInfos()`, and the `stats` table's columns).
- Jonathan approved the two playtest additions above. The plan's list is unchanged.
- The (b1) commit and its push, and this docs commit and its push.

**Gap check (D4)**
- Every override in Jonathan's patch is reproduced by a planned function:
  - the climbing deck by `debug_stackClimbingDeck` (the Table A stack: `"26,23,39,57,11,21,13,18,15"`);
  - the Summit Beta supply by `debug_stackSummitBeta` (`"7,6"`);
  - the characters by `debug_setAvailableCharacters` (`"10,4"`);
  - the commented `[16, 11, 10]` by `debug_setSharedObjectives`.
- Between setup and the first Climb Phase:
  - nothing draws from the climbing deck;
  - Summit Beta has one deal, Phil's two tokens at the end of character selection.
  - So stacking during `characterSelection` matches the setup overrides (for Phil, before the last confirm).
- **Not covered** by the planned functions: personal objectives, the Spread test, the three starting cards, the token moved to the Used pile, and the three forced die rolls.
- **Jonathan's decision:** a new debug function for each (option A), in a separate (b2), the die hook reading its global only on Studio.
  - The setup-time Spread redraw is reproducible through a third extraction, `drawStartingSpread()`, added to (a) at his go-ahead.
  - §6.3 stays dropped; U8 and Q-T5 stay moot.
- **Scaffolding:**
  - Jonathan chose to remove everything in the scaffolding table, and the `php_debug()` stub, in a separate `struct:` commit, (d), after (b2).
  - The "not testing" lines were my choices, which Jonathan accepted: remove the label at 806 and the old direction at 6340, and keep the rest.
  - The list is in P1.1.

**(a): the extraction** (`4cdc882`, `struct:`)
- Three verbatim moves out of `setupNewGame`:
  - `drawStartingSpread(): void` (was 417–435);
  - `initSharedObjectives(array $current_shared_objectives, array $players): void` (was 453–625);
  - `pickAvailableCharacters(array $players): array` (was 714–723).
- Jonathan approved the `$players` parameter and the one added line, `$board = $this->getGlobalVariable('board');`. Case 12 (A Day in the Alpine) read `setupNewGame`'s local `$board`.
- **Checks:**
  - `php -l` passes; the only message is the known `${var}` deprecation, now at line 2653.
  - The moved text is byte-identical to HEAD. The residual is 15 lines: 3 calls, 3 headers, 3 closing braces, the `return`, the `$board` line and 4 blank lines.
  - Before the Spread move: the block has no `return`, and none of its variables is read later in `setupNewGame`.
  - The harness (`p11a_harness.php`) made 21,440 runs, with no difference and no PHP warning (its error handler turns warnings into exceptions). Each run executes HEAD's inline code and the new method on the same input, and counts once.
    - **Shared objectives, 13,440 runs:** every ordered triple of distinct ids 1–16, which is 3,360 (the 560 unordered sets in all 6 orders). That includes sets with both sides of one token, which setup can't produce. They ran once for each of 2, 3, 4 and 5 players.
    - **Boards:** the board follows the player count, as setup chooses it: desert for 2 and 3 players, forest for 4 and 5. So each board ran with two player counts, not every count on both boards.
    - **Characters, 8,000 runs:** seeds 1–2,000 for each of the four player counts.
  - The harness fails if the `$board` line is removed.
  - **Correction:**
    - The `4cdc882` commit message says "2-5 players, both boards". That reads as every player count on both boards, which would have been 26,880 objective runs. The runs were as listed above.
    - My Part 1 report proposed "all 560 sets". The harness ran the 3,360 ordered sets instead.
    - The pushed commit is not amended.
- **Staging:** `git add firstascent.game.php`, with CRLF converted to LF by autocrlf. `git diff --cached --stat` showed 172 insertions and 157 deletions, as Jonathan asked.

**(a) playtest** (Studio, 2026-10-24; all pass)
- `firstascent.game.php` deployed, F5 in every open tab.
- **3 players, desert board:**
  - 4 characters, all from different mats.
  - Stonemaster, Ridgeline Challenge (South) and Smear Campaign, from different tokens.
  - Scores all 0 (no Elitist).
  - The Spread had 4 cards, one per slot, not all one type.
- **5 players, forest board:**
  - 6 characters, all from different mats.
  - A Day in the Alpine, Star Stemmer and Stay in the Shade, from different tokens.
  - Scores all 0.
  - The Spread had 4 cards, one per slot, not all one type.
- **Statistics** (the 3-player table, `debug_goToState(98)` after all characters were chosen):
  - Final scoring ran, and the table ended in a tie at 0.
  - "Points from Ridgeline Challenge South: 0", "Points from Smear Campaign: 0" and "Points from Stonemaster: 0".
  - No line for the other 13 objectives.
- **S-smoke** (2 players and a spectator):
  - Character selection and Rack Up (Spread draws and refills), a climb and a rest, climbing card 56 with a Portaledge draw, the Follow Phase and the Rerack: no problems.
  - F5 in `climbOrRest` and in `resting`: no problems.
- **Console:** no errors and no `[FA …]` warnings.
- **No replays:** no result came from a Studio save/restore.
- **Jonathan's notes:**
  - A Day in the Alpine was seen only on the forest board. So the `$board` line was confirmed by the harness and its mutation check, not on Studio.
  - Neither the setup redraw (a starting Spread all of one type) nor The Elitist came up.

**Findings**
- **The setup redraw loop for 4 of a kind on the starting Spread** (`php:drawStartingSpread`; read in code, not run):
  - It removes cards from the list of the four starting cards, read once.
  - After four passes the list is empty, and a fifth pass reads a null card id.
  - Odds: about 1 in 7,100 games, and about 1 in 92 calls of (b2)'s Spread function with four Gear on top.
  - During the session I first gave 1 in 5,400 and 1 in 70. The recount puts each replacement in a 93-card deck.
  - Recorded in `TODO.md`, with the planned fix proposed for P5.2 (to confirm), and as R-10 in `RULES_CHECK.md`, answered by Jonathan.
- **`#[Debug(reload: true)]`** stays unverified in this file. The (b1) playtest checks it (§6.2).

**Go-aheads given in this session** (beyond the step's files and this entry)
- `misc/docs/TODO.md`:
  - the redraw-loop entry, with the odds, the reproduction route and a proposed planned fix;
  - Q-R6's citation changed to `php:drawStartingSpread`.
- `misc/docs/RULES_CHECK.md`:
  - a new item after R-6, requested as R-9 and recorded as R-10, because R-9 already exists (the five wild Gear Cards);
  - Jonathan kept R-10;
  - R-6 is unchanged (baseline convention).
- `misc/docs/MIGRATION_PLAN.md`:
  - §6.2 and P1.1's scope, with the design agreed in this session;
  - P1.1's status, as the task allowed;
  - §6.3's opening line (the gap-check result), at Jonathan's request in the docs review.
- The (a) commit, and its push.

**Pending decisions**
- (b2): the details marked "proposed" in §6.2, confirmed at the start of (b2). That includes whether a repeated Asset `type_arg` means two copies; until decided, Q6 refuses duplicates.
- The planned fix for the redraw loop: P5.2, with R-6's setup path (proposed). Once confirmed, §8.4 gets a row.
- Retiring `D:\Documents\BGA Studio\firstascent-overrides\`.

**Next**
1. (b2) in a new session.
   - Read §6.2's "Added in P1.1", and confirm the details marked "proposed" at the start (above).
   - Its playtest lists can rely on the debug menu's player links.

## 2026-10-23 (P0.3: tags and the phase switch)

Git and docs only; no code changed. Two annotated tags went on `bc4a9c9`, and "Current phase" in `PROCEDURES.md` switched from review to migration. Jonathan released the P0.2 batch to Production during the session. The heading date is Jonathan's local date; BGA's date for the release is 2026-10-24. This entry supersedes the "Not pushed yet" and "Next" of the P0.2 entry below.

**Phase-rule exception:** one, for this task only. Beyond `CLAUDE.md` and `misc/docs/`, it allowed:
- creating two annotated tags, `legacy-final` and `prod-alpha-<release date>`, both on `bc4a9c9`, after Jonathan's go-ahead "tag";
- pushing `main` (normal push) and those two tags by name, after his approval "push".

Nothing else: no code file was edited, staged or committed; no deploys, Studio or Production actions; no installs or agreements. The session ran under the review-phase rules plus this exception from start to finish. Switching "Current phase" was the task's own scope; the new text governs later sessions, not this one.

**Checks before tagging** (read-only; all passed)
- `git fetch origin`; working tree clean; HEAD and `origin/main` both at `bc4a9c9`. `main` was already on origin, so the P0.2 entry's "Not pushed yet" is history.
- `git log --oneline f2a7b12..bc4a9c9`: bb780d7, b91ebb3, 512ce89, 53570af, 4d87e62, 6ee82c1, bc4a9c9.
- `git diff --stat 4d87e62 bc4a9c9`: 7 files, all under `misc/`. So the game files at `bc4a9c9` are identical to `4d87e62`.
- `git diff --stat prod-alpha-2026-10-20 bc4a9c9`, outside `misc/` and `CLAUDE.md`: `firstascent.game.php`, `states.inc.php`, `modules/Utils.php`, `firstascent.js`.
- Tags: `prod-alpha-2026-10-20` on `4701af1`, local and on origin; `legacy-final` and `prod-alpha-2026-10-24` existed nowhere (checked locally and with `git ls-remote`).

**Release and Studio checks** (Jonathan's confirmation)
- Studio matched `bc4a9c9`: he uploaded the four game files (`firstascent.game.php`, `states.inc.php`, `modules/utils.php`, `firstascent.js`), and Studio has no stray `modules/Utils.php`, only `modules/utils.php`.
- Studio's `firstascent.game.php`: line 307 starts with `// $testing1`, line 728 is `//     $available_characters[] = '5';` and line 730 is `// if (!in_array('12', $available_characters)) {`. The task prompt had put the `'5'` line at 730. The file at `bc4a9c9` has it at 728, so Studio matched the repo and the prompt's number was wrong.
- The release date was first given as 2026-10-15, the date of Production's previous deploys, which can't contain the batch (its commits are dated 2026-10-22). "Production release" means the deploy to the Production site, not the Studio sync. The session paused until Jonathan released the build.
- **Release: 2026-10-24** (BGA's date, most likely Paris time or UTC; Jonathan's local date was still 2026-10-23). No private-alpha table was running (D12).
- **Correction to the 2026-10-20 claim.** Production's build list shows the last three deploys as 2026-10-15, 2026-10-15 and 2026-10-24. There is no 2026-10-20 deploy, so "rebuilt on 2026-10-20" (`MIGRATION_PLAN.md` §10 and §13 Q-T1) doesn't match Production's record. The tag `prod-alpha-2026-10-20` and its message are untouched. The last build before 2026-10-24 is dated 2026-10-15. P0.1 found that only docs changed between `fd78ef9` and `4701af1`. So the tag marks the deployed game files if the build dated 2026-10-15 was made from `fd78ef9`'s files, as Jonathan's Q-T1 answer (Production runs the committed code) implies. What happened on 2026-10-20 isn't known. A note was added in both places in the plan; the P0.1 entry below is unchanged.

**Tags** (annotated; both on `bc4a9c9`; `git rev-parse <tag>^{commit}` printed `bc4a9c9780b9adf7d7527f64a9fdb1609d618982` for each)
- `legacy-final`: "the frozen legacy build (end of P0.2)". The message lists the P0.2 batch (bb780d7, b91ebb3, 512ce89, 53570af, 4d87e62), the harness 6ee82c1 and the docs record bc4a9c9, says the game files are identical to `4d87e62`, and says the build is frozen and legacy hotfixes follow `MIGRATION_PLAN.md` §10. It doesn't call `bc4a9c9` the last commit of the legacy framework, because later commits (this task's docs commit, and P1.1's debug functions in the legacy file) are still legacy-framework code.
- `prod-alpha-2026-10-24`: the Production private-alpha build released on 2026-10-24, built from Studio matching `bc4a9c9`, with no private-alpha table running (D12). The message lists the game files changed since `prod-alpha-2026-10-20`.
- **Why `bc4a9c9`:** it is the latest commit, as in P0.1, where `prod-alpha-2026-10-20` went on `4701af1` and not on the last code commit `fd78ef9`. The game files at `bc4a9c9` are identical to `4d87e62`; the two later commits touch `misc/` only. This task's docs commit lands after the tags, so the tags don't include it; that is intended.

**Phase switch**
- `PROCEDURES.md`: the whole "Current phase: review" section (heading, the rule and the one-time-exceptions paragraph) was replaced with the draft in `MIGRATION_PLAN.md` §11, verbatim and without the blockquote markers. The heading now reads "Current phase: migration". Every other section is unchanged, including "Installs and agreements".
- `MIGRATION_PLAN.md`: the P0.2 status is done, with the release date; P0.3 has a status line; §10 names the commit in the two P0.3 tag lines and carries the 2026-10-20 note; §11 notes that its draft was applied in P0.3; Q-T1 carries the 2026-10-20 note. The header status (line 3) and P0.2's phase-rule line (line 301) were corrected after the search below.

**"Scope before migration" retired.** The section was deleted after checking that each item is recorded elsewhere:
- item 1, the freeze fixes (`948f472`, `88209ef`): the 2026-10-14 entry below; the closed investigation is in `DECISIONS.md`;
- item 2, the Portaledge regressions (`5df6cd3`, `0114572`, `1aaad2b`, `fd78ef9`): the 2026-10-15 entry below and `DECISIONS.md` ("Already fixed under the earlier rule");
- item 3, the legacy fix batch: the 2026-10-22 entry below (commits, playtest, overrides, PHP CLI) and `DECISIONS.md`, "The legacy build gets one final fix batch, then it is frozen";
- T23: `DECISIONS.md`, D9;
- the closing rule "don't fix other `TODO.md` bugs in legacy code": replaced by the new phase text (the legacy build is frozen at `legacy-final`; `TODO.md` bugs are fixed in the slice that owns them), and recorded in `DECISIONS.md` ("Every other bug found stays deferred to the migration"; the reproduction steps in `TODO.md` serve as regression tests);
- the dropped step-2 diagnostic tooling: `DECISIONS.md`, "Step-2 diagnostic tooling … is dropped for the legacy code";
- "being in scope does not lift the phase rule": no longer applicable.

Nothing was found unrecorded, so nothing needed Jonathan's decision before the deletion.

**Search of `CLAUDE.md` and `misc/docs/`** (excluding `misc/docs/bga/` and earlier `progress.md` entries) for "Scope before migration", "review phase", "Current phase" and "phase-rule exception":
- `PROCEDURES.md`: the target of this task; edited.
- `MIGRATION_PLAN.md` §11: the draft applied; note added.
- `MIGRATION_PLAN.md:293–294`, P0.1's scope, and P0.3's own scope: they describe those steps as planned; left as they are.
- `CLAUDE.md:48` ("It states the current phase and what may be edited"): still accurate; no edit.
- `DECISIONS.md:65` and `FREEZE_INVESTIGATION.md:1` ("review-only"): they describe past sessions; no edit.
- `RULES_CHECK.md:64`: "Follow Phase rules check" matched by accident; unrelated.
- Two edits were proposed to Jonathan, because the text would mislead a future session, and made after his go-ahead:
  - `MIGRATION_PLAN.md:3` said "Status: draft … no phase-rule exception was granted", although the plan was approved on 2026-10-21. Jonathan gave the replacement text: "Status: approved by Jonathan on 2026-10-21; decisions D1–D14 are recorded in `DECISIONS.md`. Drafted and revised in a review-only session on 2026-10-15." The line was checked to read as reported before it was replaced, and keeps its bold label;
  - `MIGRATION_PLAN.md:301` (P0.2) cited `PROCEDURES.md`, "Scope before migration", a section that no longer exists. The parenthetical now reads "(granted for that task only; see the 2026-10-22 entry in `progress.md`)".

**Docs commit and push:** one `docs:` commit, staged by explicit path, after Jonathan's "commit docs"; it lands after the tags. The docs commit and both tags are pushed (`git push origin main`, then the two tags by name, never `--tags`) after his approval ("push").

**Next**
1. P1.1, the debug functions (`MIGRATION_PLAN.md` §2.3 and §6). Its prerequisite, P0.3, is met once the push is done.

## 2026-10-22 (P0.2: the legacy fix batch)

Started 2026-10-21, finished 2026-10-22. The code part of P0.2 is committed and playtested; the Production release is pending (Jonathan makes it). Not pushed yet.

**Phase-rule exception:** one, for this task only. The "Current phase" section of `PROCEDURES.md` is unchanged; it switches in P0.3. Besides `CLAUDE.md` and `misc/docs/`, it allowed:
- `firstascent.game.php`: saving Jonathan's testing overrides as a patch outside the repo and reverting the file (after his confirmation); applying or reversing the patch only at his request; editing `stNextDraw` (Q-R2) and `stMatchingTechniques` (Q-R8);
- `states.inc.php`: `confirmAssets` in state 60, only after B7 was confirmed on Studio;
- `modules/utils.php` (tracked as `modules/Utils.php`): the guard on `debug_goToState`;
- `firstascent.js`: committing Jonathan's one-line fix as it was, and no other edit;
- installing a PHP 8.4 CLI, after he confirmed the method;
- git: one `fix:` commit per item and one `docs:` commit; a normal push after his approval. No tags (P0.3 makes them), no deploys and no Production actions (Jonathan does both).

**Extensions Jonathan granted during the task:**
- activating the overrides for one table (Table A): copy the clean file outside the repo, apply the patch, uncomment and set the values, then restore the file from the copy, checked by hash (not with `git checkout` or `git apply -R`);
- committing the harness under `misc/tests/` as a separate `tool:` commit;
- a new "Installs and agreements" section in `PROCEDURES.md`, outside "Scope before migration".

**Files outside the repo**, in `D:\Documents\BGA Studio\firstascent-overrides\`:
- `2026-10-21-p0.2-overrides.patch`: Jonathan's overrides (three hunks in `setupNewGame`, 24 changed lines, all comments as saved). `git apply --check` passed against the reverted file.
- `firstascent.game.php.with-overrides`: the full file before the revert.
- `firstascent.game.php.clean-qr2-qr8`: HEAD plus Q-R2 and Q-R8, restored after Table A was created (SHA-256 `9f6c2d9bfabafb7f7a1ac1fe3db664a1b76334e3391a46e5eea0bbbcab10cdea`). The working file matched it before staging.

**PHP CLI:** PHP 8.4.25 (ZTS, x64) from the winget package `PHP.PHP.8.4`, the official zip from `downloads.php.net` with its hash checked. It is in `%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\`, which winget added to the user PATH. Jonathan's "install" covered `--accept-package-agreements` (PHP License 3.01). Earlier, a `winget search` ran with `--accept-source-agreements` before he had confirmed anything; he flagged it, and `PROCEDURES.md` now has "Installs and agreements".

**Commits** (staged by explicit path, in this order):
- `bb780d7` fix: Q-R2. Only its hunk was staged, with `git apply --cached`.
- `b91ebb3` fix: Q-R8. The rest of `firstascent.game.php`, with `git add`; afterwards `git diff firstascent.game.php` was empty.
- `512ce89` fix: B7.
- `53570af` fix: B5.
- `4d87e62` fix: Jonathan's `firstascent.js` fix (climbing card 57, option b), committed unchanged; it staged as a one-line change.
- `6ee82c1` tool: the harness, `misc/tests/technique_matching.php`.
- The `docs:` commit with this entry.

**Q-R2:** the bail branch of `stNextDraw` appended the player before its switch and again inside it. The count check runs before the append, so the extra entry skipped the next player. Removing the extra append exposed a second problem: `bailed_pitch` stays set until the player next climbs, so the Rerack's closing pass landed on a bailer who wasn't last and would have logged the bail note again. The branch now skips a player already in `finished_drawing`. The duplicate `case 10:` (B6) is harmless: the two labels share one body. Left for P1.10 and P2.6.

**B7:** confirmed on Studio (refused) before the fix. In state 60, `confirmAssets`' B8 bookkeeping does nothing, the Spread and deck paths are the same as in `climbOrRest`, and the Simul Climb branch returns without a transition, so the Crimper's choice stays pending.

**B5:** `getBgaEnvironment()` is a final public static method of `Bga\GameFramework\Table` (`_ide_helper.php:2304`; Game.php doc:2098), which `FirstAscent` extends. The guard throws `\BgaSystemException`, the class the trait already uses.

**Q-R8 trace and fix**
- Sets are formed from face-up Asset Board symbols (one per card; Sendy Jammer's Gear Cards and the five wild Gear Cards count as wilds), Technique Tokens, and New Rubber (one wild symbol, at most once).
- The old code built per-type candidates in three orders plus one all-or-nothing wild-only block, sorted them by least New Rubber, least tokens, most card icons, most wilds, then points, and committed them greedily.
- `is_pure_wild_on_empty` excluded only a per-type candidate of exactly 3 wilds, the same set as the wild-only block. No comment explained it; it came with the wild-only block in `309ffba` (2026-06-01). Wild-only sets already scored, with the type "wild" (logged "Wild"); nothing downstream reads the type except the log.
- The old allocation didn't make the most sets. For example, 1 Balance token, 1 Precision token and 4 wilds scored 1 set (the most is 2). Removing the exclusion alone wouldn't have fixed that, could lose a set that scored before (1 Precision card, 1 Balance token, 1 Power token and 6 wilds: 3 sets became 2), and would have relabeled wild-only sets.
- Jonathan chose an exhaustive search: the most sets, then the least New Rubber, then the fewest tokens; wild-only sets keep the type "wild". He accepted that token and New Rubber use can change, and that some log labels change ("Wild" in place of a type).
- The rewrite: in `f2a7b12`, `stMatchingTechniques` is lines 5839–6203, and lines 5850–5851 and 5861–6102 (Phases 1–3) were replaced. In `b91ebb3` the new block is lines 5858–5920 of `stMatchingTechniques` (5838–6021). Phase 4 is unchanged.
- Checks: the harness against two brute forces on 232,352 cases (up to 6 tokens per type and 9 wilds) found no failure, and never fewer sets than the old code. The whole function, run with stubbed framework calls and warnings as errors over 3,000 random 3-player rounds and an empty round, read no undefined variable or index.
- Findings for R-3 and R-7 are in `RULES_CHECK.md`, as findings only. Jonathan's answer on the five wild Gear Cards is R-9 (the modelling is correct).

**Playtest** (Studio, clean files deployed; all pass, with no console errors or `[FA …]` warnings):
- Table A (3 players) was created with the overrides active: the climbing deck stacked 26, 23, 39, 57, 11, 21, 13, 18, 15; the Summit Beta supply Simul Climb, then New Rubber; characters 10 and 4 forced. The clean file was restored right after, checked by hash.
- The `firstascent.js` fix (card 57, option b): pass.
- B7: the Crimper used Simul Climb while choosing between the two cards. The Spread refilled, the token went to Used, the log read "IndianaScones1 uses Simul Climb and takes Toe Jam, Gaston, and Chalk Bag from the Spread", and both cards stayed choosable. The cards came back hidden behind "Show cards" until F5, the predicted glitch, now in `TODO.md` (P5.9).
- Q-R8:
  - R1: "No 2-Point Tokens are awarded for matching Techniques"; play moved on normally.
  - R2, after reloading a Studio save and replaying the climb: Sendy "used 3 Precision Techniques, including New Rubber and gains one 2-Point Token/s". Which tokens remained wasn't recorded, so the R2 token use isn't verified.
  - On another table, an ordinary match and a token-assisted set in one Follow Phase: 1 wild (Helmet), 1 Precision card (Gaston) and 3 Power cards (Heel Hook, Chicken Wing ×2) on the board, 2 Precision tokens in hand. The log read "IndianaScones1 used 3 Precision and 3 Power Techniques, including 1 Precision Technique Token/s and gains two 2-Point Token/s"; one token was used and the other kept (the fewest-tokens tie-break), and everything animated correctly.
- Q-R2: pass in all three cases (2 players with the first bailing, on Table B; 3 players with the middle, then the first bailing, on a separate table). Each time one "bailed out" line, the others drew 3 Cards, and the Rerack ended normally.
- B5: `debug_goToState` jumped to state 98; final scoring ran and the table ended, with no errors.
- S-smoke (Table B, 2 players and a spectator): pass, including F5 in `climbOrRest` and in `resting`.

**Coverage gaps:** a wild-only set and the exact New Rubber case (2 tokens of one type plus New Rubber and nothing else) weren't observed on Studio. The New Rubber case couldn't be reached as scripted: a Gear Card Sendy plays for a requirement counts as a wild, so it completed a set with New Rubber in R2. Both cases are covered by the harness and the strict full-function run, not by a Studio playtest. The B7 regression checks weren't run: Simul Climb in `climbOrRest`, and Bomber Anchor in state 60. The fix only adds `confirmAssets` to state 60's possible actions, so `climbOrRest` is untouched.

**Other findings and records**
- `php -l` flagged a `${var}` log string at `php:2638` (cards 15 and 24): in `TODO.md`, planned for P1.5; `BGA_PITFALLS.md` corrected.
- `MIGRATION_PLAN.md` §6.1 now names the characters (10 Cool-Headed Crimper, 12 Buff Boulderer). During the session I said §6.1 called 12 Phil; it gave no name, and Phil is character 8.
- Docs updated: `TODO.md` (Q-R2, Q-R8, B7 and B5 removed; the crimper display glitch and `php:2638` added), `RULES_CHECK.md` (R-2 and R-8 fixed, R-8 re-described, R-3 and R-7 findings, R-9 new), `MIGRATION_PLAN.md` (P0.2 status and the Q-R8 scope line, §5.4, §6.1, P1.5, P5.9, P5.11, §8.4), `PROCEDURES.md` (item 3 done; "Installs and agreements"), `BGA_PITFALLS.md`.

**Release:** pending. Jonathan makes it when no table is running (D12), after Studio matches HEAD.

**Next**
1. The push, after Jonathan's approval; then his Production release.
2. P0.3: tag `legacy-final` and the release (`prod-alpha-<date>`), then switch "Current phase" in `PROCEDURES.md`.

## 2026-10-21 (P0.1: migration decisions recorded)

A docs session. Jonathan decided D1–D14 and answered the rules questions (Q-R1–Q-R8, Q-T1–Q-T4, Q-T6, Q-T7, Q-P1, Q-P2); this session recorded them.

**Phase-rule exception:** one, for this task only: creating the git tag `prod-alpha-2026-10-20` and pushing it together with the commits, after Jonathan's approval. Nothing else went beyond the review-phase rules: only `CLAUDE.md` and files under `misc/docs/` were edited. The "Current phase" section of `PROCEDURES.md` is unchanged; it switches in P0.3.

**Working tree**
- Jonathan's `firstascent.js` fix (one line near line 3210; climbing card 57) remains uncommitted until P0.2. `git diff --stat` shows it as a one-line change; the working copy is CRLF against LF in the index, as for every file here.
- `firstascent.game.php` wasn't touched, staged or committed. It still holds Jonathan's testing overrides (24 changed lines). They are set aside at the start of P0.2 (the draft said P0.3; moved because P0.2 edits the same file).

**Done**
- **Tag:** `git diff --stat fd78ef9 HEAD` showed only `CLAUDE.md`, `MIGRATION_PLAN.md` and `progress.md` changed since `fd78ef9`, so no deployed game file changed. The annotated tag `prod-alpha-2026-10-20` is on `4701af1`; it is pushed with the commits after Jonathan's approval.
- **`DECISIONS.md`:**
  - D1–D14 in a new section, each with the decision, the reason and a plan pointer; Q-P2 confirmed;
  - the sizing replaces "roughly a couple of weeks" (about 80–100 sessions for P0–P7, plus P8 not yet sized), and the resubmission sentence matches D14;
  - the legacy-fix rule replaced: one final batch (P0.2), then the legacy build is frozen at `legacy-final`; the two other passages that named the old rule were updated to match;
  - "To evaluate before migration begins" became "Evaluated before migration begins", resolved by D3.
- **`RULES_CHECK.md` (new):** R-1 to R-8 (aliases Q-R1 to Q-R8) with Jonathan's answers.
- **`UX_CHANGES.md` (new):** the format and scheduling rule; UX-1 to UX-4 (the BGA review feedback) and UX-5 (T31), all "proposed". The review message is quoted unchanged at the end. The dates of the reviews aren't recorded; the items first appear in `TODO.md` on 2026-10-09.
- **`BGA_PITFALLS.md` (new):** the pitfalls from plan §9.5.
- **`TODO.md`:** the review feedback and T31 removed (moved to `UX_CHANGES.md`); added Q-R2, Q-R8, B7, B5 (P0.2), and Q-R6, B8 (their slices).
- **`MIGRATION_PLAN.md`:** no longer a draft. P0 renumbered (P0.2 legacy fix batch, P0.3 tags and phase switch; the former P0.3 and P0.4 removed); P1.1, P1.2, P1.3, P2.3, P4.2 and the P5 shared shape and slice rows updated; new phase P8; §2.4, §4.3, §5.3–5.4, §6, §7, §8.4, §9, §10, §11, §12 and §13 updated to the decisions.
- **`PROCEDURES.md`:** "Scope before migration" lists the legacy fix batch as the next in-scope code task and T23 as folded into P1; `BGA_PITFALLS.md` added to the read-first line (Jonathan approved that edit outside the section).
- **`CLAUDE.md`:** `RULES_CHECK.md`, `UX_CHANGES.md` and `BGA_PITFALLS.md` added to the doc map; the `TODO.md` and `MIGRATION_PLAN.md` entries corrected.

**Additions after Jonathan's review of the first version** (the first docs commit had been made, unpushed, after an accidental early go-ahead; it was amended to include the first two)
- **`CLAUDE.md`:** the resubmission sentence in "Current state and goal" now follows D14: after the full plan, including P8, with the migrated build going to the private alpha at P7.4. Jonathan allowed this one-sentence change.
- **`RULES.md`:** a short project note at the top says that rulings which differ from or add to the printed rulebook (bail out, the Portaledge top-up, rested players in the Follow Phase, wild-only Technique sets) are recorded in `RULES_CHECK.md`. The rulebook text is unchanged. Jonathan saw the note before it was committed.
- **Q-T3 answered:** BGA profile names can't contain apostrophes but can contain dashes; accents are unknown. Recorded in plan §13. B2 (§5.4), F10 (§8.1) and the P5.13 playtest focus now say to test names with dashes, and that the apostrophe case can't arise through player names.
- **Q-T4 answered:** yes, harness files are tracked under `misc/tests/`. Recorded in plan §13 and §8.2.

**Corrections after the patch review** (a third docs commit, staged by explicit path)
- **`TODO.md`, B7:** rewritten so it can't be misread. The server's refusal of Simul Climb in state 60 is predicted, not yet verified on Studio; the refusal is the bug, because Simul Climb should be usable there (`RULES.md` p.8).
- **`DECISIONS.md`:** "(D2, D9)" removed from the legacy-fix section, because the batch was Jonathan's decision on 2026-10-21 and isn't one of D1–D14. D6 now says the message is for now, to be revisited after the P4.2 playtest if it proves noisy; the plan's four mentions of D6 say the same.
- **Portaledge top-up (Q-R5):** whether the code reshuffles the Asset deck after the top-up hasn't been checked. `RULES_CHECK.md` R-5 and the plan (§5.4, P5.4, §13) now say so instead of saying the reshuffle is missing; P5.4 checks it.
- **`PROCEDURES.md`, "Scope before migration":** item 1 (the freeze fixes, `948f472` and `88209ef`) and item 2 (the Portaledge regressions) marked done; item 2 is superseded by item 3.

**Interpretations to confirm**
- T23's fix is placed in P1.2 (its own `fix:` commit) or falls out of P1.3's removal of `global_variables`; the cause isn't traced.
- Q-R6 is mapped to P5.2 (setup path) with the during-play check in P5.3; B8 to P5.9.
- `TODO.md` items carry a "Planned fix: <step>" note; the file had no step mapping before.
- P7.4 still releases the migrated build to the private alpha, before P8 (Jonathan's answer in the session).

**Outstanding**
- Whether BGA player names can contain accents is unknown (Q-T3); test with dashes, and with accents if Studio allows them.
- **`MIGRATION_PLAN.md` revert incident (resolved).** During this session the file was restored to its committed text within about 25 seconds of each write; the other docs were not affected. The likely cause was Inkwell, a markdown reader that had the file open; Jonathan has closed it. Until then the file was set read-only, which stopped the reverts. The last plan edits were prepared in a scratch copy, then copied over once the attribute was cleared, and a hash check over about 70 seconds showed the file stayed unchanged. If it recurs, check for a reader or another session that has the file open.

**Next**
1. P0.2, the legacy fix batch: set aside the overrides, Q-R2, Q-R8, B7 (verify first), B5, commit the `firstascent.js` fix, install the PHP CLI, then Jonathan's Production release. It needs a one-time exception.
2. P0.3: tag `legacy-final` and the release, then switch "Current phase" in `PROCEDURES.md`.

## 2026-10-15 (Migration plan drafted and revised)

A review-only planning session. Jonathan reviewed the first draft, asked for revisions, and approved the revised plan.

**Phase-rule exception:** none granted. The session stayed within the review phase:
- the only files written were `misc/docs/MIGRATION_PLAN.md` (new), this entry and `CLAUDE.md`;
- no code file was changed, nothing was deployed, and Studio wasn't touched;
- nothing was recorded in `DECISIONS.md`. The plan's proposals aren't decisions until Jonathan records them there (P0.1).

The uncommitted testing overrides in `firstascent.game.php` were read for §6 of the plan but not touched, staged or committed. Jonathan edited them during the session; §6.1 describes them as first read, and its design doesn't depend on their values.

**Done** (one commit with the plan, `CLAUDE.md` and this entry: "Add the migration plan draft and log the planning session"; pushed to origin `main`, normal push)
- **`MIGRATION_PLAN.md`.** A one-page summary (approach, phases with session counts, coexistence in brief, decisions D1–D14), then 13 sections:
  1. which legacy and current-framework pieces can coexist, with doc citations and a list of cheap Studio checks (U1–U18);
  2. the step catalog P0.1–P7.4, each step with scope, files, done criteria, playtest, `TODO.md` repros and Studio state;
  3. the class structure, server and client;
  4. the freeze principles from `DECISIONS.md` as concrete design;
  5. the server port and rules checking;
  6. debug functions to replace the testing overrides;
  7. BGA components;
  8. the regression strategy (`TODO.md` items T1–T32, freeze scenarios F1–F13);
  9. the claude-code-bga evaluation, with a scoped trial proposal;
  10. branching and commits;
  11. the end of the review phase;
  12. UX changes during the migration;
  13. open decisions and questions.
- **Revisions after Jonathan's review:**
  - **P4.4–P4.6** are now a mechanical, timing-neutral move. Every notification handler goes behind the error-policy wrapper, and a `release` callback replaces `setSynchronousDuration()`. The async hygiene (`.then` chains, `new Promise(async …)` executors, fire-and-forget work) is deferred to the slice that owns each handler, as separate commits. The recommendation and its reasons are in P4.4–P4.6. §4.3.1 lists, by slice, all 35 executors and the five releases inside `.then` chains.
  - **§4.1.1, the re-entry inventory for D5.** The no-transition flows can end in 14 states. Re-entering them is safe on the server in 13; `drawAssets` needs B8 fixed first. The legacy client isn't re-entry-safe, so D5 applies only through the new JS state classes. A Studio check in P5.1 comes before P5.9 relies on re-entry. For any state ruled out, the fallback is a private `refreshStateArgs` notification.
  - **D14, the resubmission milestone:** four options with their trade-offs, no recommendation.
  - **Session counts per phase:** about 80–100 sessions in all, 44–52 of them in P5.
  - **P0.1** now includes revising the "roughly a couple of weeks" estimate in `DECISIONS.md`.
- **claude-code-bga** (§9): cloned read-only into a scratch directory outside the repo and read. Nothing was installed, added as a skill or run.
- **`CLAUDE.md`:** `MIGRATION_PLAN.md` added to the doc map.

**Findings from reading the code** (§5.4 of the plan; none verified on Studio)
- **Q-R2, suspected bug:** a bailed player is appended to `finished_drawing` twice. So when any player except the last bails, the last player in Rerack order never draws.
- **B7, suspected bug:** Simul Climb is probably refused in `crimperClimbingCards` (state 60). It's the same gap as the Bomber Anchor one fixed in `1aaad2b`.
- **B8, latent bug:** Simul Climb runs the Rerack draw bookkeeping in `confirmAssets`.
- **B5:** `debug_goToState` is public and unguarded in the production build.
- **Q-R1:** "bail out" doesn't appear in `RULES.md`.
- Also Q-R3–Q-R8, B1–B4 and B6.

They're recorded only in the plan; `TODO.md` doesn't have them.

**Open decisions** (§13)
- D1: the approach and phase order.
- D2: branching (`main` plus tags and a hotfix branch, or a long-lived migration branch).
- D3: claude-code-bga (don't install it; run the scoped trial or not).
- D4: stashing the testing overrides before P1.1.
- D5: ending the no-transition flows with a server self-transition.
- D6: what a player sees when a notification handler fails.
- D7: scope and timing of server-side input validation (B3).
- D8: BGA components.
- D9: when to do the SQL strict-mode fix (T23) and the replay check (F13).
- D10: the UX change register.
- D11: the rules-check record and the answers to Q-R1–Q-R8.
- D12: release cut-over for private-alpha tables.
- D13: local test tooling.
- D14: the resubmission milestone.

**Open questions** (§13)
- **Rules, Q-R1–Q-R8:** listed in §5.4.
- **Technical, Q-T1–Q-T7:**
  - which commit the Production private-alpha build was made from;
  - whether private-alpha tables are running now, and how long they last;
  - whether Studio test accounts can have names containing `'`, `-` or accents;
  - tracking harness files under `misc/tests/`;
  - whether the SFTP setup uploads `misc/` on save;
  - two optional debug functions.
- **Process, Q-P1–Q-P2:** moving the BGA review feedback into the UX register now, and the review format for code steps.

**Outstanding**
- **Replay check** (from 2026-10-14): still deferred. When to do it is part of D9.
- **The `chooseSummitBetaToken` z-index issue** in `TODO.md`.
- **Uncommitted testing overrides** in `firstascent.game.php` remain in the working tree.

**Next**
1. Jonathan answers D1–D14 and the open questions.
2. A P0.1 docs session records the answers: the decisions in `DECISIONS.md`, `PROCEDURES.md` "Current phase", and the revised estimate.

## 2026-10-15 (Bomber Anchor regressions from the Portaledge refactor fixed)

Work began 2026-10-14 and was playtested on Studio by Jonathan in two rounds on 2026-10-14 and 2026-10-15.

**Phase-rule exception:** one-time exception granted for this task only. As granted, it allowed:
- editing `firstascent.js` at the Bomber Anchor sites (Part B of the task);
- editing `DECISIONS.md`, `PROCEDURES.md` ("Scope before migration" only), `TODO.md` and `progress.md`;
- committing and pushing (normal push).

Jonathan extended it during the task, after playtesting:
- UX changes inside the Bomber Anchor flow, which he specified: the hand no longer counts as "outside" for the click-outside popup behavior, and "+" stays hidden until a card is selected for discard. They touched `onConfirmSummitBetaBomberAnchor`, `onShowHidePortaledge`, `onSelectBomberAnchorDiscard` and `onUndoSummitBeta`;
- a one-line edit to `states.inc.php` (the crimper fix);
- committing his own one-line `hex_num` fix in `modules/utils.js`.

The "Current phase" section of `PROCEDURES.md` is unchanged; the review phase continues. The uncommitted testing overrides in `firstascent.game.php` were not touched, staged or committed.

**Done** (all pushed to origin `main`, normal push, `f287bb2..fd78ef9`)
- **`fec912e`, docs.**
  - `DECISIONS.md`: regressions from the Portaledge refactor are fixed in the legacy code when the fix is simple. Outside playtesters use the legacy build before the migration ships; other legacy bugs stay deferred.
  - `PROCEDURES.md`: that is the third in-scope code task.
  - `TODO.md`: resolved Bomber Anchor items deleted (the convention is to delete them; the fix is recorded here). Added the `chooseSummitBetaToken` z-index issue and a test scenario for `selectPortaledge`/`riskSummitBeta`.
- **`5df6cd3`, the click-time errors.**
  - **Cause:** any Summit Beta token click runs `removeActionButtons()`, which empties `#generalactions`. That holds `#draw_counter` and, since the refactor, `#available_sb_message`. In the June baseline (309ffba) the message sat after `#phase_tracker`, outside it.
  - **`onSelectPortaledge`:** five `#draw_counter` writes needed guards, not one. The four `draw_counter.style.color` writes after js:4739 would have thrown next.
  - **Energy Drink, Simul Climb and Bomber Anchor confirm:** guarded the `#available_sb_message` removal, as Rerack already does.
  - **`onUndoSummitBeta`:** resets `bomber_anchor`, before the `await`.
- **`0114572`, the intended behavior.**
  - You may draw only as many Portaledge cards as you discard, up to 3. Confirm is enabled only when the two are equal and at least one. Draw-first (no card selected) is inert.
  - Resync in the hand-card handler: a new discard re-shows "+" and disables Confirm; a deselect clears the draws and re-shows "+".
  - In `resting`, Bomber Anchor uses the `selectPortaledge` logic instead of the rest counter.
  - Portaledge draws chosen before the token was used are cleared at Bomber Anchor confirm. They were invisible but counted against the cap and would have been sent on Confirm.
  - Hand clicks no longer close the portaledge, also after reopening it.
  - Undo Token clears the selectable classes on every hand card.
- **`1aaad2b`, crimper.** `confirmBomberAnchor` calls `confirmAssetsForDiscard` and `confirmPortaledge`, which each run `checkAction`. State 60 (`crimperClimbingCards`) listed neither, so Confirm failed with "This game action is impossible right now". Added both.
- **`fd78ef9`, `hex_num`.** Jonathan's fix: `checkPotential` read `hex_num` without declaring it in the Crag Mama branch.

**What was and wasn't a refactor regression** (checked against 309ffba)
- Regressions: the `#draw_counter` write and the `#available_sb_message` removals.
- Not regressions:
  - the missing cap with zero discards (the logic is identical to June);
  - the crimper `possibleactions`;
  - the hand-card resync gaps.

Fixed anyway, at Jonathan's request or as part of the intended behavior.

**Other Bomber Anchor state that survives Undo Token** (not changed)
- `portaledge_num` and the stale `portaledge_selection_handlers` entries: harmless, because every reader reassigns them first.
- The outside-click listener set at Bomber Anchor confirm isn't removed on Undo. It is one shared global listener, so removing it could kill an unrelated popup's. It wasn't observed in playtesting.

**Verification before Studio**
- A Chromium DOM harness ran the real function bodies against a stubbed DOM and framework: 47 assertions, scratch only and not committed.
- The same assertions failed 21 of the first 39 on the committed code, including the exact errors Jonathan saw.
- With only the stale-draws line removed it failed the new stale-picks cases, so it does detect that symptom.

**Playtest results (Studio, Jonathan)**
- **Round 1, hand-first and draw-first, the cap and Confirm,** with Bomber Anchor as the only any-time token and with several (no difference):
  - **Worked:** `drawAssets`, `climbOrRest`, `climbingCard`, `discardAssets`, `stealFromAssetBoard`, `addTokenToPitch`, `addAssetToAssetBoard`, `chooseTechniqueToken`, `selectOpponent`.
  - **Energy Drink and Simul Climb,** each as the only any-time token: no errors or warnings.
  - **Ordinary Portaledge draws:** incidentally tested, fine.
  - **Problems, since fixed:**
    - crimper Confirm failed;
    - Undo Token left unselected hand cards looking selectable;
    - selecting a hand card closed the portaledge, which was not wanted;
    - "+" showed before any card was selected.
  - **Problem, undiagnosed:** in `chooseSummitBetaToken`, a left-edge pitch overlapping the revealed tokens drew in front of the token after Bomber Anchor was discarded. In `TODO.md`.
- **Round 2:**
  - Click-outside, "+" visibility, the cap, Confirm and Undo all work correctly.
  - `resting` with no prior picks works for both Undo and Confirm, and the rest continues normally. Selecting the token hides the portaledge, and Confirm fades it back in. That is the resting state's own click-outside listener treating the hand-token click as "outside". It wasn't intended, but Jonathan says it isn't undesirable.
  - `resting` with prior picks: "+" was silently inert, now fixed.
  - Crimper and `resting` with prior picks are confirmed resolved.
- **Not tested:** Bomber Anchor in `selectPortaledge` and `riskSummitBeta`. Jonathan isn't concerned before the migration. Logged as a test scenario in `TODO.md`.

**Outstanding**
- **Replay check** (from 2026-10-14, still deferred): step through a Studio replay, including a rest, and confirm there are no fallback warnings. Run it before outside playtesters use the build.
- **The `chooseSummitBetaToken` z-index issue** in `TODO.md`. A console check of `#summit_pile`'s inline z-index before and after the token is discarded would pin it down.
- **Uncommitted testing overrides** in `firstascent.game.php` remain in the working tree.

**Next**
1. The replay check.
2. A review-only migration planning session, in a new session.

## 2026-10-14 (Freeze work closed: conclusions and two targeted fixes)

Work began 2026-10-13 and was playtested on Studio by Jonathan on 2026-10-14.

**Phase-rule exception:** one-time exception granted for this task only. It allowed:
- editing the `animationPromise` function in `modules/utils.js`, and only that function;
- editing the three `$('trade_button')` sites in `firstascent.js` (Rerack, Bomber Anchor, Simul Climb);
- committing and pushing (normal push).

The "Current phase" section of `PROCEDURES.md` is unchanged; the review phase continues. The uncommitted testing overrides in `firstascent.game.php` were not touched, staged or committed.

**Done**
- **A1:** nothing to commit. The investigation docs were already committed as `fbcd7f9` and `db8fd36`.
- **`fb8a1f7`, docs.**
  - `DECISIONS.md`: freeze conclusions (a silent class and a loud class), the three decisions with their reasons, and migration principles a–d. It also has two small consistency edits Jonathan approved.
  - `PROCEDURES.md`: "Scope before migration" now lists the two fixes and notes the tooling as dropped.
  - `CLAUDE.md`: the priority bullet and the doc map.
  - `FREEZE_INVESTIGATION.md`: a status note at the top.
  - `TODO.md`: the bugs found while playtesting the fixes.
- **`948f472`, `animationPromise` fallback.**
  - What it does: settles a wait that can't finish, through the normal completion path, with one `[FA animation fallback]` warning. One frame after the class is applied, it checks whether the element is out of the document, not rendered, or has no running animation. It also settles on a cancel that leaves nothing running, and on a timeout backstop (remaining duration plus 1 s, re-armed while the tab is hidden). An element already removed from the document isn't re-inserted.
  - Before deploying, it was tested in a Chromium harness that loads the real function (22 cases).
  - An audit of every removal site found one deliberate removal of in-flight elements. In the card-49 race, `updateDiscardTopCard` clears the discard pile while refill card backs are flying out of it. That led to the "not re-inserted" rule.
- **`88209ef`, `trade_button` guards** at js:8222, 12831, 12876 and 12996 (line numbers from before the change). When the button is missing, the check is skipped; `onUndoSummitBeta` then restores the bar and recreates the button.
- All three commits were pushed to origin `main` (normal push).

**Playtest results (Studio, Jonathan)**
- **Freeze scenarios now continue instead of freezing:**
  - watcher, rest with a card draw and Water/Psych-only rest (1a, 1b);
  - active player, rest and trade (2a, 2b);
  - Rerack in `climbOrRest` before choosing a pitch (4);
  - Cool-Headed Crimper watcher (6).
- **The next portaledge window after 1a and 2a** opens normally, with no close animation and no warning.
- **Nothing-hidden checks: no fallback warnings.** These were rest, trade, a full round, Rerack in another state, Simul Climb, and Bomber Anchor in `climbOrRest`. Bomber Anchor resolved there with no errors after Confirm, which verifies the js:12996 guard.
- **Bomber Anchor selection is broken by the recent Portaledge refactor:**
  - js:4739 throws on each "+" click;
  - draws are uncapped;
  - with a hand card chosen first, Confirm stays disabled.

  None of this is caused by the fixes. It's recorded in `TODO.md`.

**Fallback warnings seen in playtesting**
- **Expected, in the hidden-container tests:**
  - 1a/1b: one `portaledge_close` on `#portaledge` (not rendered);
  - 2a: two per drawn card (`flip_transform`, `asset_portaledge_to_display`) plus one `portaledge_close`;
  - 2b: three;
  - 6: one `climbing_card_slot_to_discard`;
  - Bomber Anchor confirmed with the portaledge hidden: as 2b.
- **Normal play:** none.
- **Climbing card 49 with a refill (forced with the testing overrides):** about 7 `element is not in the document | … class: portaledge_reshuffle_R` warnings per refill, from utils:3587.
  - Cause: a race that was already there. Both Portaledge draws refill the same deck at once, and each shuffle loop covers both refills' 14 card backs. At `i === 6` it removes them all, then keeps shuffling the removed ones.
  - No stray card backs were left. It's recorded in `TODO.md`.

**Outstanding**
- **Replay check** (deferred by Jonathan): step through a Studio replay, including a rest, and confirm there are no fallback warnings. Run it before outside playtesters use the build.
- **The Bomber Anchor errors at js:4739 and js:5820** are regressions from the recent Portaledge refactor, not long-standing legacy bugs. They are candidates for a separate small fix task before outside playtesting; that isn't decided yet.

**Next**
1. A review-only migration planning session, in a new session.

## 2026-10-12 (Freeze investigation, playtest results)

**Phase-rule exceptions:** none granted, and none needed. The task was review-only. Files written: `misc/docs/FREEZE_INVESTIGATION.md`, `misc/docs/TODO.md` and this entry. No code was changed. Nothing is committed: docs-only changes wait for Jonathan's approval. The uncommitted `firstascent.game.php` change and `misc/docs/temp.txt` in the working tree predate this task and weren't touched.

**Commit:** approved by Jonathan on 2026-10-13. Committed as `fbcd7f9` ("Record freeze playtest results": `FREEZE_INVESTIGATION.md`, `TODO.md` and `progress.md`, staged by explicit path) and pushed to origin `main` (normal push). `firstascent.game.php` wasn't staged.

**Done**
- Recorded Jonathan's §8.0 playtest results and his answers to the step-1 questions in a new "Playtest results" section of `FREEZE_INVESTIGATION.md`. Each result was checked against the code, and each section separates what it proves from what it suggests.
- Verdicts:
  - **S1 (hidden portaledge): confirmed** for the watcher rest, active rest and active trade. The Bomber Anchor branch is still open.
  - **S2 (`trade_button`): confirmed** for Rerack in `climbOrRest`.
  - **S3: the step-1 trigger is ruled out.** Tokens can't be switched mid-flow, which the step-1 review missed. A new trigger (Undo Token after hiding the portaledge) is inferred and untested.
  - **S4: confirmed** for `#crimper_display`.
  - **S5, S6, S7: still open.** S5 is weakened and S6 downgraded.
- Key facts established:
  - BGA on Studio doesn't suppress unhandled rejections. So throw-before-release freezes are loud, and clean-console freezes come from promises that never settle.
  - During an S1 freeze the frozen client's log stops.
  - The framework shows a wait cursor on frozen clients, watchers included.
- The reported production "Discarding Summit Beta Token" freeze was very probably S2 (Rerack, per the replay). This conflicts with the console report; the possible reconciliations and a new question are in §9.
- Updated in `FREEZE_INVESTIGATION.md`:
  - the summary and the suspect ranking, with a verdict at the head of each suspect;
  - the cross-references that relied on the step-1 S3 trigger;
  - §6 (silenced errors).
- Added §8.4: what step 2 still needs to establish, with the unresolved-`animationPromise` registry (element and visibility) first, plus follow-up playtests that need no tooling. Rewrote §9.
- Added to `TODO.md`, not fixed:
  - Bomber Anchor: uncapped Portaledge draws, the js:4739 throw, the js:5820 throw, and `this.bomber_anchor` not being reset by Undo;
  - the untranslated "Hide card" comparison;
  - the implicit globals.

**Next**
1. Jonathan reviews the updates, answers §9, and decides whether to run the follow-up playtests in §8.4.
2. Step 2: diagnostic tooling on a throwaway branch, never merged into `main`, scoped by §8.4. It needs Jonathan to end the review phase or grant an exception.

## 2026-10-12 (Freeze investigation, step 1)

**Phase-rule exceptions:** none granted, and none needed. The task was review-only. The only files written were `misc/docs/FREEZE_INVESTIGATION.md` (new) and this entry. Nothing committed: docs-only changes wait for Jonathan's approval.

**Done**
- Reviewed the client notification handling, animation helpers, action-bar writes and latent client state in `firstascent.js` and `modules/utils.js`, against the server notifications and transitions in `firstascent.game.php` and `states.inc.php`.
- Wrote `misc/docs/FREEZE_INVESTIGATION.md`: ranked suspects, Summit Beta discard trace, notification inventory, action-bar writes, latent-state inventory, silenced errors, links to the `TODO.md` `[state]` items, step 2 recommendations and open questions.
- Main findings (verified in code):
  - **Hidden-portaledge stall.** Notification handlers await `portaledge_close` on `#portaledge`. Any client, active player or watcher, can have hidden it with a single click outside it, and an animation on a hidden element never ends, so the queue never releases.
  - **`trade_button` TypeError.** Rerack, Bomber Anchor and Simul Climb used during `climbOrRest` throw on the removed `#trade_button` before the queue is released. Rerack and Bomber Anchor match the "Discarding Summit Beta Token" freeze.
  - **Stale `#bomber_anchor_counter`.** If Bomber Anchor is abandoned for another token, the counter stays and makes `onUndoSummitBeta` hang. The bar never gets restored.

**Next**
1. Jonathan reviews `FREEZE_INVESTIGATION.md`, answers its open questions (§9), and decides whether to run the targeted playtests in §8.0.
2. Step 2: diagnostic tooling (client state snapshot and set/clear logging) on a throwaway branch, never merged into `main`.

## 2026-10-12 (Studio SSH key auth)

**Phase-rule exception:** one-time exception granted for this task only. It allowed reading and editing `.vscode/sftp.json`, reading the installed SFTP extension's files, running the Windows OpenSSH `ssh-add -l`, and editing, committing and pushing `CLAUDE.md` and `progress.md` (normal push). The "Current phase" section is unchanged.

**Done**
- Studio SFTP switched from password to SSH key auth. `.vscode/sftp.json` now uses the extension's `agent` option pointing at the Windows OpenSSH agent pipe, which holds the `bga_studio` ed25519 key. The extension (Natizyskunk SFTP 1.16.3, ssh2 1.13.0) supports that pipe. VS Code deploy verified ("SFTP: Diff Active File with Remote" worked).
- The old password is confirmed dead: Studio rejected it after the key upload, so no admin reset is needed.
- The backups from the git cleanup were deleted by Jonathan.
- `CLAUDE.md` file-map row for `.vscode/sftp.json` updated.

**Next**
1. Freeze investigation (review first, writing `FREEZE_INVESTIGATION.md`).

## 2026-10-12 (SFTP config removal)

**Phase-rule exception:** one-time exception granted for this task only. It allowed editing `.gitignore`, rewriting git history, making the two copies of `.vscode/sftp.json` (a file backup and the mirror clone), reading the password once for the history check, editing `CLAUDE.md` and `progress.md`, and force-pushing after Jonathan's confirmation. The "Current phase" section is unchanged.

**Done**
- `.vscode/sftp.json` is untracked (listed in `.gitignore`) and removed from all git history with git-filter-repo. All commit hashes changed.
- Verified no revision of the rewritten history contains the file or its password.
- `CLAUDE.md` file-map row for `.vscode/sftp.json` updated.
- Force-pushed to origin (all branches and tags) after Jonathan's confirmation.

**Follow-ups for Jonathan**
- Delete the mirror backup (`../firstascent-backup.git`) and the file backup (`../sftp.json.backup`) once the push is verified. The mirror still holds the old history.
- Re-clone, don't pull, on any other machine with a clone.
- Check that the Claude.ai project's GitHub sync shows the new history.
- Consider asking GitHub Support to purge cached views of the old commits.

**Next**
1. Switch Studio SFTP to SSH key auth.
2. Freeze investigation (review first, writing `FREEZE_INVESTIGATION.md`).

## 2026-10-12

**Done**
- Docs reorganized into `misc/docs/` (`RULES.md`, `TODO.md`, `DECISIONS.md`, `bga/current/`, `bga/legacy/`).
- `TODO.md` restructured.
- Markdown escapes fixed in `DECISIONS.md` and `TODO.md` (own commit); stray paste artifact removed from `TODO.md`.
- `CLAUDE.md` and `PROCEDURES.md` created.
- Guide Mode decision (not implemented) recorded in `DECISIONS.md`.
- `modules/utils.php` vs `modules/Utils.php` casing mismatch added to `TODO.md`.

**Phase-rule exceptions:** none.

**Next**
1. Remove `.vscode/sftp.json` from git and from git history (separate task, with a one-time exception to the phase rule; ends with a push).
2. Switch Studio SFTP to SSH key auth.
3. Freeze investigation (review first, writing `FREEZE_INVESTIGATION.md`).
