# Migration plan: legacy framework → current BGA framework

**Status:** draft, revised after Jonathan's first review (2026-10-15). Written in review-only sessions: no code was changed and no phase-rule exception was granted. Nothing in this plan is decided until Jonathan records it in `DECISIONS.md`.

**Baseline:** commit `b0da67e` on `main`, plus Jonathan's uncommitted testing overrides in `firstascent.game.php` (read for §6, not touched).

## How to read this document

- **Code citations:** `file:function ~line`, at the baseline. Short file names:

  | Short name | File |
  |---|---|
  | php | `firstascent.game.php` |
  | utils.php | `modules/utils.php` (tracked in git as `modules/Utils.php`) |
  | js | `firstascent.js` |
  | utils.js | `modules/utils.js` |
  | states | `states.inc.php` |
  | action.php | `firstascent.action.php` |
  | tpl | `firstascent_firstascent.tpl` |
  | view.php | `firstascent.view.php` |

  Line numbers in js have shifted by about 16 lines since `FREEZE_INVESTIGATION.md` was written, so they differ from that document's.
- **Doc citations:** `[short name:line]`. All paths are under `misc/docs/bga/`:

  | Short name | File |
  |---|---|
  | Game.php doc | `current/game-files/Main game logic_ Game.php - Board Game Arena.md` |
  | States doc | `current/game-files/State classes_ State directory - Board Game Arena.md` |
  | Game.js doc | `current/game-files/Game interface logic_ Game.js - Board Game Arena.md` |
  | Material doc | `current/game-files/Game material description_ material.inc.php - Board Game Arena.md` |
  | dbmodel doc | `current/game-files/Game_database_model__dbmodel_sql.md` |
  | CSS doc | `current/game-files/Game interface stylesheet_ yourgamename.css - Board Game Arena.md` |
  | Options doc | `current/game-files/Options and preferences_ gameoptions.json, gamepreferences.json - Board Game Arena.md` |
  | Debugging doc | `current/studio/Practical debugging - Board Game Arena.md` |
  | Tools doc | `current/studio/Tools and tips of BGA Studio - Board Game Arena.md` |
  | Troubleshooting doc | `current/studio/Troubleshooting - Board Game Arena.md` |
  | Studio logs doc | `current/studio/Studio logs - Board Game Arena.md` |
  | Replay doc | `current/guides/Game replay - Board Game Arena.md` |
  | UX guidelines | `current/bga_ux_guidelines.md` |
  | `<Name>` doc | `current/components/<Name> - Board Game Arena.md` (BgaAnimations, BgaCards, ItemManager, …) |
  | legacy tpl / action / states doc | `legacy/game-files/…` (view and template; action.php; states.inc.php) |

  `_ide_helper.php` (the framework's IDE stub at the repo root) is cited only as supporting evidence, never as the sole source.
- **Markers:**
  - **[inferred]**: my reasoning, not read in the docs or the code.
  - **[unverified]**: framework behavior the docs don't settle. Each one has a **Check:**, a cheap Studio test attached to the first step that depends on it. §1.7 lists them all.
- **IDs:** steps P0.1–P8 (§2). TODO items T1–T32 and freeze scenarios F1–F13 (§8.1). Server findings B1–B8 and rules items Q-R1–Q-R8 (§5.4; the rules items are `R-1`–`R-8` in `RULES_CHECK.md`). UX items UX-n (`UX_CHANGES.md`). Decisions D1–D14 and questions Q-… (§13).

---

## Summary

### Approach
1. **Server first, client second.** The legacy client talks to the server only through action URLs and notifications, so it keeps working while the server moves. Autowired actions are the only server change that touches the client, and only at its call sites.
2. **Two atomic switches, both made mechanical.** `firstascent.game.php` → `modules/php/Game.php` (P1.2), and `firstascent.js` + `modules/utils.js` → `modules/js/Game.js` (P3.5). The docs don't let either pair coexist as entry points. Everything else is allowed to mix, so it migrates incrementally:
   - `states.inc.php` alongside State classes;
   - `action.php` alongside autowired actions;
   - manual notification subscriptions alongside promise-based ones;
   - very probably the `.tpl` alongside the new `Game.js`.
3. **Prepare the client switch inside the legacy files.** The legacy client already has `this.bga` [Game.js doc:16, :25], so framework calls can move to the current API and be playtested before the switch. The switch itself is then a syntax change.
4. **Port the server structurally, not as a rewrite.** Each state and each rules domain is checked against `RULES.md` as it is ported. Discrepancies become questions, never silent fixes (§5).
5. **Put the freeze principles in place right after the client switch (P4),** before any restructuring, so every later step inherits them:
   - an animation helper that always settles;
   - a notification wrapper that never strands the queue;
   - the dev snapshot with its registry of unresolved animation waits.
6. **Then restructure domain by domain (P5 "slices").** Each slice extracts a server service, moves its payloads to authoritative state, builds the client component and JS state classes, and fixes that domain's `TODO.md` bugs in separate commits.
7. **Studio stays fully playable at every step boundary,** and each step says what to playtest. Jonathan's playtest gates every commit.

### Phase sequence

| Phase | Goal | Steps | Sessions (approx.) | Studio after each step |
|---|---|---|---|---|
| P0 | Decisions, the final legacy fix batch, tags and phase switch | 3 | 2–4 | Legacy; P0.2 adds the final fixes and a Production release |
| P1 | Server on the current framework: debug functions, `Game.php`, globals, current APIs, autowired actions | 10 | 10–12 | Playable |
| P2 | Server State classes (thin); `states.inc.php` removed | 7 | 7–9 | Playable |
| P3 | Client: prepare the legacy files, then switch to an ES-module `Game.js` | 5 | 5–7 | Playable |
| P4 | Client infrastructure (animations, notifications, dev tools); every handler behind the wrapper | 6 | 6–8 | Playable |
| P5 | 13 domain slices: server service, payloads, client component, JS states, TODO fixes | 13 slices | 44–52 (per slice in §2.3) | Playable |
| P6 | Layout built in JS; `.tpl` and `.view.php` removed | 2 | 2–3 | Playable |
| P7 | Cleanup, full regression, release preparation | 4 | 4–6 | Release candidate |
| P8 | Post-migration UX and components (D8, D10): the decided `UX_CHANGES.md` items, ItemManager, BgaAnimations, BgaCards, BgaDice, BgaScoreSheet, the last-turn banner | planned in its own session after P7 | not yet sized | Playable |
| **Total, P0–P7** | | | **about 80–100** | |

A session is one Claude Code session. Jonathan's playtests and reviews come on top of it and set the real pace, so the plan gives no dates. The total doesn't include P8. Resubmission to BGA comes after P8 (D14).

### Coexistence in brief
- **Can coexist, documented:**
  - State classes with `states.inc.php` [States doc:621–643];
  - `action.php` with autowired actions [Game.php doc:799];
  - manual and promise-based notification handlers [Game.js doc:1037].
- **Can coexist, probably:** the `.tpl` with the new `Game.js`. The current docs show `.tpl` templates used alongside `Game.js` without stating that the two coexist; checked in P3.5.
- **Cannot coexist, one entry point each:**
  - the server main class: root `firstascent.game.php` or `modules/php/Game.php` [Game.php doc:11];
  - the client entry: root `firstascent.js` or `modules/js/Game.js` [Game.js doc:11].
- **Consequences:**
  - State classes and autoloaded server classes need the new `Game.php` first [Game.php doc:2109; States doc:24–29], so P1.2 gates P2 and everything after it.
  - The legacy client can already use the current API through `this.bga`, which is what makes P3 mechanical.

### Decisions (decided 2026-10-21)
Jonathan decided D1–D14. The full text and reasons are in `DECISIONS.md` ("Migration plan decisions (D1–D14)"); §13 lists them with pointers. The rules questions Q-R1 to Q-R8 are answered in `RULES_CHECK.md`.
- **D1** The approach and phase order above.
- **D2** Branching: `main` plus tags. A hotfix branch is made from `legacy-final` only if a legacy hotfix is ever needed (§10).
- **D3** claude-code-bga is not installed; its applicable pitfalls are in `BGA_PITFALLS.md`; the deploy-and-test trial isn't run for now (§9).
- **D4** Testing overrides: the Studio-only debug functions replace them (§6), including `debug_endGameSoon` and `debug_giveSummitBeta`. The setup-overrides file is dropped unless P1.1 finds a gap. The overrides are set aside at the start of P0.2.
- **D5** No-transition flows (Simul Climb, trade, Rerack, Energy Drink, Bomber Anchor) end with a server self-transition where the re-entry inventory in §4.1.1 says it is safe, and with an args-refresh notification elsewhere.
- **D6** When a notification handler fails, the player sees a short non-blocking message, besides the console log and the re-render (§4.3).
- **D7** Client-sent player ids are fixed in P1.6–P1.9; every other `act*` input is validated in the slice that owns it (§5.4, B3).
- **D8** All of §7's components are adopted: PlayerCounter/TableCounter and Zone during the migration; ItemManager, BgaAnimations, BgaCards, BgaDice, BgaScoreSheet and the last-turn banner in P8.
- **D9** The SQL strict-mode fix (T23) and the replay check (F13) are folded into P1.
- **D10** The UX change register `UX_CHANGES.md`. The migration is parity only; decided UX items are implemented in P8 (§12).
- **D11** The rules-check record `RULES_CHECK.md` (§5).
- **D12** No formal cut-over for private-alpha tables; releases only when no table is running (§2.4).
- **D13** Local tooling: Python's built-in server for harnesses; a PHP CLI for linting, installed in P0.2.
- **D14** Resubmit to BGA after the full plan, including P8 (§13).

---

## 1. Coexistence of legacy and current-framework pieces

### 1.1 `states.inc.php` vs State classes: can coexist
- **Docs:**
  - The State classes page has a section "Migrating for states written in states.inc.php and Game.php" [States doc:621–643]. It ends with "If all your classes are migrated to State classes, you can remove the states.inc.php file" [:643], so a mix is the documented path.
  - The legacy page marks `states.inc.php` deprecated "if you use State classes" [legacy states doc:5].
- **Prerequisite: the new `Game.php`.**
  - A State class lives in `namespace Bga\Games\<MyGameName>\States` and type-hints `Bga\Games\<MyGameName>\Game` [States doc:24–29].
  - PSR-4 autoloading of `modules/php` classes "doesn't work for the legacy way" [Game.php doc:2109].
  - So State classes start after P1.2.
- **What maps where** [States doc:625–630]:
  - `getArgs` replaces `argX`;
  - `onEnteringState` replaces `stX`;
  - `#[PossibleAction]` methods replace `possibleactions`;
  - `zombie()` replaces `zombieTurn`;
  - `Game` methods stay reachable as `$this->game->…`.
- **State names.**
  - A State class's name defaults to its class name, "including capitalization" [States doc:77].
  - The client switches on the legacy names, for example `'climbOrRest'` in `js:onEnteringState ~1841`.
  - So every State class passes `name: '<legacy name>'` until the client has JS state classes (P5).
- **[unverified]**
  - Transitions between a `states.inc.php` state and a State class, in both directions.
  - `nextState('transitionName')` inside a State class that declares `transitions:`. The docs describe `transitions` [States doc:44, 211–238]; claude-code-bga says transition names "die" (§9.4).
  - How zombies are handled during the mix: `Game::zombieTurn` for array states, `State::zombie()` for classes.
  - **Check (P2.1):** after converting `characterSelection` and `nextCharacterSelect`, play from character selection into `drawAssets` (still an array state). Zombify a player during `characterSelection` [Tools doc:63–65].

### 1.2 `firstascent.action.php` vs autowired actions: can coexist
- **Docs:**
  - "if you also declare the function in the action.php, it will be used instead of the autowiring" [Game.php doc:799], so both mechanisms run side by side.
  - `action.php` is deprecated once actions are autowired [legacy action doc:5].
  - Autowired names start with `act` and match the state's possible actions [Game.php doc:783–785, 943–945]. Typed parameters use attributes [:810–922].
  - The client calls them with `this.bga.actions.performAction` [Game.js doc:838–907], which the legacy client also has [Game.js doc:16, :25].
- **Consequence: actions are converted group by group (P1.6–P1.9), while `states.inc.php` still exists.** Each conversion renames, in one step:
  - the `possibleactions` entry (`confirmX` → `actConfirmX`);
  - the `Game.php` method, whose typed parameters replace `action.php`'s string parsing;
  - the client's `checkAction` + `ajaxcall` call sites (26 in js).

  `action.php` is deleted once it is empty (P1.10).
- **Side effect:**
  - Autowiring runs `checkAction` itself [Game.php doc:924–941]. The explicit `self::checkAction` calls go, and so does the re-check in internal calls: `php:confirmBomberAnchor ~4805` calls `confirmAssetsForDiscard` and `confirmPortaledge`, which today re-check `possibleactions`.
  - No behavior changes, because every state that allows Bomber Anchor already lists both sub-actions (fix `1aaad2b`).
  - The underlying weakness (B3, §5.4) is unchanged.
- **[unverified]** `action.php` still dispatches when the main class is the namespaced `Game`. **Check (P1.2):** every action still works.

### 1.3 `firstascent.game.php` vs `modules/php/Game.php`: one main class only; switch atomically
- **Docs:**
  - `modules/php/Game.php` is the current form; a root `yourgamename.game.php` is the legacy form, without namespaces [Game.php doc:11].
  - Legacy action, arg and st methods "can still be there as fallback" in `Game.php` [Game.php doc:28]. So moving the file doesn't require converting states or actions first.
- **[unverified]** Which file the framework loads if both exist on Studio.
  - Avoid the question: P1.2 deletes the root file on Studio in the same deploy. VS Code's uploadOnSave never deletes remote files **[inferred from how the extension uploads]**, so this is a manual step.
  - **Check (P1.2):** a Studio-only `debug_frameworkCheck()` logs the running class name, which should be `Bga\Games\FirstAscent\Game`.
- **Still auto-included or still used:**
  - `material.inc.php` at the root stays auto-included [Material doc:7, :11].
  - `view.php` keeps calling public methods through `$this->game` [legacy tpl doc:246–259]. This is **[unverified]** with the namespaced class. **Check (P1.2):** the board renders: shared objectives, pitches and the face-down Headwall all come from `view.php`.
- **Namespacing pitfalls in this code** (to fix in P1.2):
  - Nested named functions passed as string callables: `php:setupNewGame ~370–378` (`'sortGear'` to `array_filter`) and `php:confirmLuckyChalkbag ~4891` (`dieLog`). String callables are not resolved against the current namespace **[inferred from PHP semantics]**, so these become closures.
  - `feException` (`php:zombieTurn ~6724`) and `\BgaSystemException` (`utils.php:isPlayerZombie ~924`) become the current exception classes [Game.php doc:1749–1781].
- **Consequence:** P1.2 is one behavior-preserving move: `git mv`, new headers, the pitfalls above, and a manual Studio cleanup.

### 1.4 Dojo client vs `modules/js/Game.js` and JS State classes: one entry point only; the current API is usable from the legacy file
- **Docs:**
  - `modules/js/Game.js` is an ES-module class; a root `yourgamename.js` using `define`/`declare` is legacy [Game.js doc:11].
  - The new class does not extend gameui [:12], so `this.format_block`, `this.addActionButton` and so on don't exist on it. Their homes are the `this.bga.*` sub-components and `this.bga.gameui.*` [:14–25 and throughout].
- **The legacy file can use the current API now:**
  - It already has `this.bga` [Game.js doc:16 "or in this.bga for the legacy way"; :25]. P3.3–P3.4 move framework calls there and are playtested before the switch.
  - BGA libraries load in legacy files too, through `getLibUrl` in `define` [BgaAnimations doc:31–41]. `bga-autofit` already does (`js:18`).
- **JS State classes** use `this.bga.states.register` [Game.js doc:87–131]. `states` is missing from the list of sub-components available in the legacy file [:16], so it's **[unverified]** there. That doesn't matter: JS State classes come after the switch.
- **Several JS files without a build step:**
  - `export class …` and relative `import … from "./X.js"` [Game.js doc:2100–2106]. Libraries load with `importEsmLib` / `importDojoLibs` [:1783–1790].
  - Vanilla JavaScript is enough: no TypeScript, no bundler, no change to the SFTP deploy.
  - **[unverified]**
    - Imports from subfolders (`./components/X.js`).
    - BGA's terser minification across several modules [Game.js doc:202–206].
    - **Check:** P3.5 uses one subfolder import; P7.3 runs Studio's "test minified version".
- **The global `gameui`.**
  - utils.js reads game fields and calls game methods through the global `gameui`, about 295 times: `gameui.gamedatas` ×142, `gameui.resources` ×32, `gameui.onSummitBetaRerack`, `gameui.onConfirmPitch`, …
  - That works only because the legacy game object *is* gameui. After the switch, gameui will be the framework object, not our `Game` **[inferred]**. So P3.2 gives utils.js an explicit game reference first.
- **Log formatting.**
  - js overrides `format_string_recursive` (`js:format_string_recursive ~1791`) and hooks `dojo.string.substitute` through `dojo/aspect` (`js:constructor ~31`).
  - A class that doesn't extend gameui can't override gameui methods just by defining them **[inferred]**. The docs only mention `this.bga.gameui.format_string_recursive` [Game.js doc:483–487]; the supported hook is **[unverified]**.
  - **Check (P3.5):** log entries still show card names with tooltips and colored player names. Fallback: wrap `this.bga.gameui.format_string_recursive` in `setup`.
- **[unverified]** Which entry file loads if both exist. P3.5 deletes `firstascent.js` and `modules/utils.js` on Studio in the same deploy. **Check:** the console line printed by `Game.js`'s constructor.
- **Consequence:** P3 is four preparation steps inside the legacy files (each playtested) plus one mechanical switch.

### 1.5 `.tpl` / `.view.php` vs building the layout in JS: can coexist **[docs suggest; unverified]**
- **Current approach:** build the layout in `setup` into `this.bga.gameArea.getElement()` [Game.js doc:285–300]. The `.tpl`/`.view.php` pair is deprecated "if you generate the template from the JS file" [legacy tpl doc:7].
- **Evidence that the `.tpl` still works with `Game.js`:**
  - The current Game.js doc documents `this.bga.gameui.format_block` with "`jstpl_…` is defined in .tpl file" [Game.js doc:452–461].
  - The current ExpandableSection doc pairs a `.tpl` snippet with a `Game.js` that uses `importDojoLibs` [ExpandableSection doc:7–30].
  - Neither says so outright. **Check (P3.5):** the board, hand and player panels render.
- **`view.php` does real work:** shared-objective positions, tile coordinates, pitch order and face-down Headwall pitches (`view.php:build_page ~24–105`). That logic must move into `getAllDatas` and JS before the files can go.
- **Consequence:** keep the `.tpl` and `view.php` through the switch; replace them in P6, after components render themselves (P5).

### 1.6 Notification handling: can coexist
- **Client:**
  - Manual subscriptions (`dojo.subscribe` + `notifqueue.setSynchronous` + `setSynchronousDuration` [Game.js doc:1072–1213]) are what the client uses today: 68 subscriptions, 61 of them synchronous with a dynamic duration (`js:setupNotifications ~7215–7417`).
  - `setupPromiseNotifications` [Game.js doc:992–1058] can run next to them. Its `handlers` option limits registration to the objects we pass [:1035], and `ignoreNotifications` exists for handlers kept manual [:1037].
  - `this.bga.notifications` is available in the legacy file [:16].
- **Server:**
  - `notifyAllPlayers`/`notifyPlayer` (126 calls) still work.
  - `bga->notify->all/player` [Game.php doc:1071–1225] add decorators, which don't work with the deprecated functions [:1231], and `_private` [:1144–1176].
  - `_private` replaces public/private notification pairs and client-side ignore predicates [Game.js doc:1144]. That also removes the 15 "ignored + dynamically synchronous" registrations the docs forbid [Game.js doc:1215–1236; FREEZE S5].
- **[unverified]**
  - What a rejected handler promise does to the queue: [Game.js doc:1000] only covers promises that settle (`DECISIONS.md`, the principle on handler errors). **Check (P4.2):** the experiment in §4.3.
  - Whether `handlers` accepts plain wrapper objects; [:1035] shows an instance. **Check (P4.2).**
- **Consequence:** P4.2 creates the wrapper. P4.4–P4.6 move handlers into it group by group, dropping each one's manual subscription as it moves.

### 1.7 Consequences for the plan, and the list of checks
1. **Server first.** P1.2 gates State classes and autoloaded classes. Until P3, the client changes only at action call sites.
2. **The client switch comes late and is mechanical,** thanks to the P3 preparation inside the legacy files.
3. **Deleting remote files is a manual step.** uploadOnSave never deletes remote files **[inferred]**, so every step that moves or deletes a file includes a Studio cleanup list. A stale root `firstascent.game.php` might even take precedence over the new one (U1). Release preparation checks that Studio holds exactly the git file set (P7.4).
4. **Schema or state changes need a fresh Studio table.** A table's schema can't change during the game [dbmodel doc:9]. Save slots made under an older schema may not restore **[inferred]**.
5. **The server keeps the legacy state names** until the client has JS state classes.

| ID | Unverified behavior | Checked in |
|---|---|---|
| U1 | Which main PHP file wins when both exist (avoided by deleting) | P1.2 |
| U2 | `action.php` dispatch with a namespaced `Game` | P1.2 |
| U3 | `view.php` / `.tpl` with a namespaced `Game` | P1.2 |
| U4 | Transitions and `nextState` names across array states and State classes | P2.1 |
| U5 | `zombieTurn` vs `zombie()` during the mix | P2.1 |
| U6 | `#[PossibleAction]` methods provided through a PHP trait; a `Game.php` `act*` method called in a class state that doesn't declare it | P2.2, P2.7 |
| U7 | `bga->globals->get` returns arrays or `stdClass` for JSON objects ([Game.php doc:286] shows `stdClass` for a stored class) | P1.3 |
| U8 | Whether PHP can read a file under `misc/` at runtime on Studio (for the setup-overrides file, §6.3). Checked only if P1.1 finds that §6.3 is needed (D4) | P1.1, conditional |
| U9 | A rejected promise under `setupPromiseNotifications` | P4.2 |
| U10 | Which client entry wins when both exist (avoided by deleting) | P3.5 |
| U11 | `.tpl` + `jstpl_` with `Game.js`; `this.gamedatas` set on the new class [Game.js doc:254] | P3.5 |
| U12 | Subfolder ES imports; `dojo` global and `importDojoLibs(['dojo/aspect'])` from a module | P3.5 |
| U13 | Supported log-formatting hook in the new class | P3.5 |
| U14 | A registered JS state class mixed with `Game.onEnteringState` for other states | P5.1 |
| U15 | Terser minification across modules | P7.3 |
| U16 | Debug functions reachable in production (§6.4) | Not checkable on Studio; guarded instead |
| U17 | The table still launches after `action.php` is deleted (the "Ooooops" case [Troubleshooting doc:120–126] is legacy-framework specific **[inferred]**) | P1.10 |
| U18 | Side effects of re-entering an active state for the same player: turn-based "your turn" signal, turn counter, clock, log (§4.1.1) | P5.1 |

---

## 2. Order, boundaries and step sizing

### 2.1 Rules for every step
- **One step = one Claude Code session, one concern.** Sizes are given as review size:
  - S: up to ~150 changed lines;
  - M: ~150–400;
  - L: over 400, always split into review chunks of a few hundred lines with a summary of intent.
- **Mechanical sweeps** (the same edit many times) are presented as the pattern, the count and the exceptions. Jonathan reviews the exceptions and a sample.
- **Verbatim moves** (code moved between files) follow a fixed protocol:
  1. The move commit contains nothing else.
  2. Claude Code checks with a scratch script that the moved text is identical after whitespace normalization, and reports the *residual* diff: what remains once the moved block is removed from both sides. That residual is what Jonathan reviews.
  3. Adaptations come in the next commit.
- **Commits:** structural, bug fix, UX and tooling changes always go in separate commits (§10). Nothing is committed before Jonathan's Studio playtest of that step.
- **Every session ends with:**
  - the playtest list;
  - the Studio cleanup list (remote files to delete);
  - whether a fresh table is needed;
  - a `progress.md` entry.
- **Every step boundary leaves Studio fully playable.** A step that can't is split.

### 2.2 Standard scenarios used below
- **S-smoke**
  - **Setup:** 2 players, plus a spectator tab.
  - **Steps:**
    1. Character selection, then Rack Up draws.
    2. One player climbs and one rests.
    3. A climbing card with a Portaledge draw.
    4. Follow Phase, then Rerack.
    5. F5 during `climbOrRest` and again during `resting`.
  - **Expected:** same behavior as before the step; no new console errors or `[FA …]` warnings.
- **R-full** is defined in §8.3.

### 2.3 Step catalog

#### Phase P0: decisions, the final legacy fix batch, tags and phase switch

**P0.1 Decisions** (docs only; plus one git tag)
- **Scope:**
  - Jonathan reviewed this plan and decided D1–D14. A docs session records them: `DECISIONS.md` (the decisions, the sizing, the legacy-fix rule), the new `RULES_CHECK.md`, `UX_CHANGES.md` and `BGA_PITFALLS.md`, `TODO.md`, `PROCEDURES.md` ("Scope before migration" and the read-first list) and this plan. `PROCEDURES.md` "Current phase" stays unchanged; it switches in P0.3.
  - The same session tags the current Production build `prod-alpha-2026-10-20` (Q-T1). That tag is the one exception to the phase rule, granted for that task only.
- **Files:** `CLAUDE.md` and `misc/docs/*`; the git tag.
- **Done when:** the decisions are committed and pushed together with the tag.
- **Studio after:** unchanged.

**P0.2 Legacy fix batch** (new; code, in the legacy files; S–M; 1–2 sessions)
- **Needs** a one-time phase-rule exception from Jonathan at its start (`PROCEDURES.md`, "Scope before migration").
- **Scope:**
  - **First, set aside the testing overrides (D4).** Save Jonathan's uncommitted overrides in `firstascent.game.php` as a patch file outside git tracking, then revert the file. Reverting needs Jonathan's explicit confirmation. P0.2 edits that file, and staging by path can't separate the overrides' hunks from the batch's.
  - **The batch** (items in `TODO.md`), one `fix:` commit each:
    1. Q-R2: a bailed player is appended to `finished_drawing` twice (`php:stNextDraw ~5635–5686`).
    2. Q-R8: wild-only Technique sets score 2 points (`php:stMatchingTechniques ~5896`, `is_pure_wild_on_empty`).
    3. B7: verify on Studio first; if confirmed, add Simul Climb's `confirmAssets` to state 60, `crimperClimbingCards` (`states.inc.php ~289–290`), the same shape as the crimper fix in `1aaad2b`.
    4. B5: the Studio-only guard on `debug_goToState` (`utils.php ~929`). It moved here from P1.1(c).
  - **Jonathan's uncommitted `firstascent.js` fix** (near line 3210; climbing card 57, option b: the code tried to hide a button that doesn't exist in that context), committed as it is.
  - **The PHP CLI (D13):** install it for `php -l`, matching the PHP version the BGA docs name (8.4). Installing needs Jonathan's confirmation in the session. Then lint the changed PHP files.
  - **Then a Production release,** which Jonathan makes (D12: only when no table is running).
- **Line endings:** the working copy of `firstascent.js` is CRLF against LF in the index (as for every file here, with `core.autocrlf` on). When P0.1 ran, `git diff --stat` showed the file as a one-line change. The session confirms how it stages before committing, stages only the real change, and gets Jonathan's go-ahead on the method first.
- **Files, as needed:** `firstascent.js`, `firstascent.game.php`, `modules/utils.php` (git tracks it as `modules/Utils.php`; stage that name), `states.inc.php`.
- **Done when:** each item is committed on its own, `php -l` passes on the changed PHP files, Jonathan has playtested each item on Studio, and the release is made.
- **Playtest:**
  - Q-R2: 2 players; the first in Rerack order bails and the second climbed. The second draws 3 Cards, the first draws nothing (log note kept), and the Rerack ends normally. Repeat with 3 players, the middle one bailing.
  - Q-R8: Sendy Jammer with 3 Gear Cards scores 2 points. Gear Cards plus a Technique Token with no natural symbol score 2 points. 1 card plus 2 Gear wilds still scores. An ordinary match is unchanged.
  - B7: first reproduce it (a Cool-Headed Crimper holding Simul Climb, using it while choosing between the two cards). After the fix it works there, and Simul Climb in `climbOrRest` still works.
  - B5: Studio's debug menu still jumps states. The refusal outside Studio can't be tested from Studio; it is reviewed in code.
  - The `firstascent.js` fix: the climbing card 57 scenario that found it runs with no console error.
  - S-smoke as a regression check.
- **Repros:** Q-R2, Q-R8, B7, B5.
- **Studio after:** the legacy build with the batch; a Production release.

**P0.3 Tags and the phase switch** (git, and `PROCEDURES.md`; formerly P0.2)
- **Scope:**
  - Tag `legacy-final` on the batch's last commit.
  - Tag the release made in P0.2 with `prod-alpha-<date>`. (`prod-alpha-2026-10-20`, for the earlier build, was tagged in P0.1.)
  - Switch `PROCEDURES.md` "Current phase" to the §11 draft, which is adapted to the decisions (D10 parity, D2, the frozen legacy build).
  - The testing overrides are no longer part of this step: they were set aside at the start of P0.2 (D4).
- **Files:** `PROCEDURES.md`.
- **Done when:** the tags are pushed, the working tree is clean, and the phase is switched.
- **Studio after:** unchanged.

**Removed from P0:** the former P0.3 (the pre-migration leftovers; T23 and F13 are folded into P1 by D9) and the former P0.4 (the trial setup; D3). §9.6 stays as reference for a possible later trial.

#### Phase P1: server on the current framework (the legacy client stays)

**P1.1 Debug functions** (in the legacy file; M) — prerequisite: P0.3 (the testing overrides are already set aside, in P0.2)
- **Scope:**
  - (a) **Structural:** extract `pickAvailableCharacters()` (`php:setupNewGame ~714–737`) and `initSharedObjectives(array $ids)` (`~442–627`) without behavior change.
  - (b) **Tooling:** the four Studio-only debug functions of §6.2, plus `debug_endGameSoon` (Q-T6, replaces the `testEnd` state) and `debug_giveSummitBeta` (Q-T7).
  - (c) **Check:** the Studio-only guard on the existing `debug_goToState` is present (added in P0.2, B5). P1.1 only checks it.
  - Two commits, (a) and (b).
  - If a testing override can't be done with these functions, §6.3 (the setup-overrides file) is revived (D4); otherwise it stays dropped.
- **Files:** `firstascent.game.php`, `modules/utils.php`.
- **Done when:**
  - the functions appear in Studio's debug menu and behave as §6 specifies;
  - every debug function refuses to run when `getBgaEnvironment()` isn't `'studio'` (reviewed in code);
  - the gap check is recorded: either no override needs §6.3, or the U8 check result is recorded.
- **Playtest:** 3 players.
  1. In `characterSelection`, run `debug_setAvailableCharacters("10")`. Character 10 is offered after the reload.
  2. Run `debug_stackSummitBeta("9")` and `debug_stackClimbingDeck("3")`. The first Summit Beta token drawn is Bomber Anchor; the next climbing card is 3.
  3. In a new table, during `characterSelection`, run `debug_setSharedObjectives(16, 11, 10)`. After the reload those three are shown, and The Elitist's +4 appears on every score.
  4. Run `debug_giveSummitBeta` for Bomber Anchor (token 9) and a player. After the reload that player holds it.
  5. Run `debug_endGameSoon` for a player. That player's next climb triggers the end: the Climb and Follow Phases complete, and final scoring runs.
- **Repros:** none fixed. Makes T26, T28 and F3–F5 quick to set up.
- **Studio after:** playable; existing tables still work.

**P1.2 Move the server to `modules/php/Game.php`** (S review: two renames plus about 80 changed lines)
- **Scope:**
  - `git mv firstascent.game.php modules/php/Game.php`: namespace `Bga\Games\FirstAscent`, `class Game extends \Bga\GameFramework\Table`.
  - `git mv modules/Utils.php modules/php/UtilTrait.php` (namespaced trait). This removes the casing problem (T24).
  - String callables → closures; exception classes (§1.3); add `debug_frameworkCheck()`.
  - **Unchanged:** `states.inc.php`, `action.php`, `view.php`, `.tpl`, root `material.inc.php`, the client.
- **Files:** `firstascent.game.php` → `modules/php/Game.php`; `modules/Utils.php` → `modules/php/UtilTrait.php`.
- **Done when:** a game plays end to end, and `debug_frameworkCheck` reports `Bga\Games\FirstAscent\Game`.
- **Playtest:**
  - S-smoke.
  - The first steps of a 4-player game (forest board).
  - A Lucky Chalkbag use (`dieLog`).
  - A replay of a finished game that includes a rest, with no fallback warnings (F13, D9).
  - Expected: identical behavior.
- **Repros:** T24 resolved; checks U1–U3.
- **Carries (D9):** T23 and F13.
  - **T23:** the SQL strict-mode game-creation fix (the forum thread in `TODO.md`) is made here, as its own `fix:` commit after the move, or it falls out of P1.3's removal of `global_variables` if that is where the strict-mode failure lies. The cause isn't traced yet. Game creation is checked either way.
  - **F13:** the replay check above. P1.3 repeats it.
- **Studio after:** playable. Delete on Studio: `firstascent.game.php`, `modules/utils.php`. Fresh table.

**P1.3 Globals on `bga->globals`** (S)
- **Scope:**
  - Run the U7 check first (a Studio-only `debug_globalsShape()`).
  - Reimplement `getGlobalVariable`/`setGlobalVariable` (`utils.php ~32–48`) on `$this->bga->globals` [Game.php doc:247–347], keeping both return shapes that the `$asArray` flag selects today.
  - Drop the `global_variables` table from `dbmodel.sql`.
  - **Side effect:** removes the unescaped-JSON SQL (B2, §5.4); noted in the commit message.
- **Files:** `modules/php/UtilTrait.php`, `modules/php/Game.php`, `dbmodel.sql`.
- **Done when:** nothing reads or writes `global_variables`.
- **Playtest:** S-smoke, plus:
  - a "all players gain from the Portaledge" climbing card (`portaledgeAll`);
  - risk it;
  - bail.
- **Repros:** T23 and F13 re-checked (D9): game creation still works, and a replay that includes a rest still shows no fallback warnings.
- **Studio after:** playable; fresh table.

**P1.4 Notification, statistics and score APIs** (L, mechanical)
- **Scope:**
  - `notifyAllPlayers` → `$this->bga->notify->all`; `notifyPlayer` → `->player` (126 sites).
  - `initStat`/`incStat`/`setStat` → `bga->tableStats`/`bga->playerStats` (98 sites). `playerStats->init` takes no player id [Game.php doc:1376–1389].
  - Raw `player_score` and `player_score_aux` SQL (8 sites) → `bga->playerScore`/`playerScoreAux` with a `null` message. That sends no extra notification [PlayerCounter and TableCounter doc:60], so the score display is unchanged.
- **Files:** `modules/php/Game.php`, `modules/php/UtilTrait.php`.
- **Done when:** no deprecated notify or stat calls remain.
- **Playtest:** a full 2-player game, or a game played on from a saved state near the end. The end-of-game scores and the statistics panel agree with the score tracker.
- **Studio after:** playable; existing tables still work.

**P1.5 PHP modernization sweep** (L, mechanical)
- **Scope:**
  - `self::` → `$this->` on instance methods (310 sites).
  - Deck through `$this->bga->deckFactory->createDeck('cards_and_tokens')` (`getNew` is deprecated in `_ide_helper.php ~2274`).
  - Check for fixed-length player id assumptions (T29). None found so far.
- **Files:** `modules/php/Game.php`, `modules/php/UtilTrait.php`.
- **Done when:** no `self::` call to an instance method remains, and the Deck comes from the factory.
- **Playtest:** S-smoke.
- **Studio after:** playable.

**P1.6–P1.9 Autowired actions**
- **Shared shape of each step:**
  - The `Game.php` method is renamed `actX` and gets typed parameters (`#[IntArrayParam]`, `#[StringParam(enum: …)]`, `bool`, `int`) [Game.php doc:810–922]. These replace `action.php`'s numberlist parsing.
  - The `possibleactions` entries in `states.inc.php` are renamed.
  - The `action.php` method is deleted.
  - The client call sites move from `this.checkAction` + `this.ajaxcall('/firstascent/firstascent/x.html', …)` to `this.bga.actions.performAction('actX', …)` [Game.js doc:838–907], sending arrays instead of comma-joined strings.
  - Client-sent player ids (`rest`, `passClimbingCard`, `confirmPermanentAssets`) are replaced by the magic `$activePlayerId`/`$currentPlayerId` [Game.php doc:801–808], in a separate `fix:` commit (B3). That is the whole of B3 in P1 (D7): every other `act*` input is validated against `$args` in the slice that owns it, with no later dedicated pass.
- **Files (each step):** `modules/php/Game.php`, `states.inc.php`, `firstascent.action.php`, `firstascent.js`.
- **Steps:**

  | Step | Actions | Size |
  |---|---|---|
  | P1.6 | `confirmCharacter`, `confirmAssets` (draw and Simul Climb), `rest`, `confirmTrade`, `confirmBail` | M |
  | P1.7 | `confirmRequirements`, `riskIt` (one shared parser for their seven arguments) | M |
  | P1.8 | `confirmClimbingCardChoice`, `passClimbingCard`, `undoClimbingCard`, `confirmCrimperClimbingCard`, `confirmAssetsForDiscard`, `confirmSelectedOpponent`, `confirmPortaledge` | M |
  | P1.9 | `confirmAddTokenToPitch`, `confirmAssetToAssetBoard`, `confirmStealFromAssetBoard`, `confirmChooseSummitBetaToken`, `confirmChooseTechniqueToken`, `confirmRerack`, `confirmEnergyDrink`, `confirmBomberAnchor`, `confirmLuckyChalkbag`, `confirmRiskSummitBeta`, `confirmPermanentAssets` | M |

- **Done when:** each listed action works in every state that allows it.
- **Playtest:** each action at least once in its usual state. Each any-time Summit Beta token once in `climbOrRest` and once in another state, set up with `debug_stackSummitBeta`.
- **Repros:** P1.9, which converts Bomber Anchor's action, is a good point to run T26 (Bomber Anchor in `selectPortaledge` and `riskSummitBeta`) for the first time. Any bug it finds stays for P5.10.
- **Studio after:** playable; existing tables still work.

**P1.10 Delete `action.php`; remove dead entries** (S)
- **Scope:** remove:
  - `action.php`;
  - the possible actions that have no handler: `selectCharacter` (`states ~32`), `confirmJesusPiece` (`~279`), state 97's `selectPortaledge`;
  - `confirmLuckyChalkbag`'s unused parameter (`action.php ~388` passes two arguments, `php ~4832` takes one).
- **Files:** `firstascent.action.php` (deleted), `states.inc.php`, `modules/php/Game.php`.
- **Done when:** no action file exists, and a new table launches and passes S-smoke.
- **Checks:** U17.
- **Studio after:** playable. Delete on Studio: `firstascent.action.php`.

#### Phase P2: server State classes (thin; legacy names; same ids and transitions)

**Shared shape of each step:**
- One class per state in `modules/php/States/` [States doc:18–68], with:
  - the same id, type, `name: '<legacy name>'`, descriptions and `transitions`;
  - `updateGameProgression` as before;
  - `getArgs()` delegating to the existing `argX`;
  - `onEnteringState()` delegating to `stX`;
  - `#[PossibleAction] act…` methods delegating to the `Game` methods;
  - a `zombie()` that ports the matching `zombieTurn` branch.
- The entries are removed from `states.inc.php`.
- **Rules check per class** (§5): records only, no logic changes.
- **Files:** `modules/php/States/*.php` (new; P2.2 adds `modules/php/States/Traits/`), `states.inc.php`, `modules/php/Game.php`, `misc/docs/RULES_CHECK.md`.
- **Done when:** the converted states behave exactly as before, F5 works inside each, and the zombie check passes.
- **Playtest:** walk through every converted state, including F5 inside each one. Zombify a player in one converted active state.
- **Studio after:** playable; fresh table.

| Step | States (id) | Notes | Size |
|---|---|---|---|
| P2.1 | `characterSelection` (2), `nextCharacterSelect` (3) | First mix: checks U4 and U5 | S |
| P2.2 | `drawAssets` (10), `nextDraw` (11), `nextRound` (12), `resting` (33) | Introduces the trait for any-time Summit Beta actions (§3.1); checks the trait part of U6 | M |
| P2.3 | `climbOrRest` (20), `nextClimb` (25), `riskSummitBeta` (50), `crimperClimbingCards` (60) | B7 is fixed in P0.2 once Studio confirms it, so `crimperClimbingCards` already lists `confirmAssets` and its class uses the full any-time trait. If B7 wasn't fixed in P0.2, the state keeps today's possible actions, Simul Climb's `confirmAssets` stays out of its class, and the fix is a separate `fix:` commit in P5.9 | M |
| P2.4 | `climbingCard` (21), `discardAssets` (22), `selectOpponent` (23), `selectPortaledge` (24), `portaledgeAll` (26) | | M |
| P2.5 | `addTokenToPitch` (27), `stealFromAssetBoard` (28), `addAssetToAssetBoard` (29), `chooseSummitBetaToken` (30), `chooseTechniqueToken` (31), `techniqueOpponent` (32) | | M |
| P2.6 | `matchingTechniques` (40), `flagPermanentAssets` (41), `choosePermanentAssets` (42, multiactive), `grantPermanentAssets` (43), `flipPlayedAssets` (44), `preGameEnd` (98) | Debug state `testEnd` (97) removed; an end-game debug function replaces it (Q-T6) | M |
| P2.7 | Remove `states.inc.php`; remove `zombieTurn`; remove `Game.php`'s fallback `act*`/`arg*`/`st*` methods | Checks the fallback part of U6 | S |

**Repros:**
- P2.2 and P2.6 replay F13 (a replay that includes a rest).
- `RULES_CHECK.md` is already seeded with Jonathan's answers to Q-R1–Q-R8 (D11). The P2 classes check their states against it: P2.2 confirms that R-2 (the Rerack skip after a bail) is fixed in the ported code, P2.3 that R-1 (bail) is unchanged, and P2.6 covers the Follow Phase items (R-3 New Rubber, R-7, R-8).

#### Phase P3: client switch to `modules/js`

**P3.1 Strict-mode readiness** (S)
- **Scope:**
  - Declare the implicit globals (T32): `last_replacement`, `args`, `start_pos`, `end_pos`, `x_diff`, `y_diff`, `climbing_card`.
  - Replace bare element globals (`portaledge`, `summit_discard`, `climbing_discard_90`; FREEZE "Other findings") with `$()` lookups.
  - ES modules always run in strict mode, which makes assigning to an undeclared variable throw.
- **Files:** `firstascent.js`, `modules/utils.js`.
- **Done when:** a scratch scan finds no implicit or bare element globals.
- **Playtest:** S-smoke, a trade, a card-49 refill, a crimper turn.
- **Repros:** T32.
- **Studio after:** playable.

**P3.2 Free utils.js from the global `gameui`** (L, mechanical)
- **Scope:**
  - `new bgagame.utils(this)` stores `this.game`.
  - About 295 `gameui.` uses become `this.game.` (game fields and game methods) or `this.game.bga.…` (framework).
  - In the legacy file `this.game` *is* gameui, so behavior doesn't change.
- **Files:** `modules/utils.js`, `firstascent.js` (the constructor call).
- **Done when:** utils.js has no reference to the global `gameui`.
- **Playtest:** S-smoke, a Summit Beta token from the hand, a Trifecta climb.
- **Studio after:** playable.

**P3.3 Framework calls through `this.bga`, part 1** (L, mechanical)
- **Scope:**

  | Legacy call | Current call |
  |---|---|
  | `this.player_id` (99 sites) | `this.bga.players.getCurrentPlayerId()` [Game.js doc:210] |
  | `this.isCurrentPlayerActive()` (40) | `this.bga.players.isCurrentPlayerActive()` [:230] |
  | `this.isSpectator` | `this.bga.players.isCurrentPlayerSpectator()` [:216] |
  | `this.format_block` (181) | `this.bga.gameui.format_block` [:452] |
  | `this.addTooltipHtml` (23) | `this.bga.gameui.addTooltipHtml` [:1284] |
  | `this.scoreCtrl[id]` (7) | `this.bga.playerPanels.getScoreCounter(id)` [:1767] |

  `this.gamedatas` stays [:254].
- **Files:** `firstascent.js`, `modules/utils.js`.
- **Done when:** each legacy pattern in the table has zero remaining uses.
- **Playtest:** S-smoke as a spectator and as each player; tooltips; scores.
- **Repros:** T29 (client side).
- **Studio after:** playable.

**P3.4 Framework calls through `this.bga`, part 2** (M)
- **Scope:**

  | Legacy call | Current call |
  |---|---|
  | `addActionButton` (80) | `this.bga.gameui.addActionButton` (deprecated but documented [Game.js doc:1805]; converted to `statusBar` in P5.1) |
  | `removeActionButtons` (18) | `this.bga.statusBar.removeActionButtons()` [:2050] |
  | `confirmationDialog` (4) | `this.bga.dialogs.confirmation(…).then(…)` [:1446–1463] |
  | `showMessage` | `this.bga.dialogs.showMessage` [:1379] |
  | `updatePageTitle` | `this.bga.gameui.updatePageTitle` [:1940] |
  | `this.notifqueue` (153) | `this.bga.gameui.notifqueue` [:1179] |
  | `restoreServerGameState` (8 sites) | one `restoreActionBar()` helper, so P5.1 can replace the mechanism |

  The helper is needed because `restoreServerGameState` is documented for client states only [:188–190], and its use outside them is unverified (FREEZE Background 5).
- **Files:** `firstascent.js`, `modules/utils.js`.
- **Done when:** each legacy pattern in the table has zero remaining uses outside the helper.
- **Playtest:** S-smoke, plus:
  - each no-transition flow: trade, Rerack, Energy Drink, Simul Climb, Bomber Anchor;
  - Undo Token;
  - the confirmation dialogs.
- **Studio after:** playable.

**P3.5 The switch** (L review, syntax-only)
- **Scope:**
  - `git mv firstascent.js modules/js/Game.js` → `export class Game { constructor(bga) { this.bga = bga; … } }`, with each `name: function (…) {…},` turned into `name(…) {…}`. Indentation stays as it is, so the diff remains one line per method.
  - `git mv modules/utils.js modules/js/Utils.js` → `export class Utils`.
  - Imports: `importEsmLib('bga-autofit', '1.x')` [BgaAutofit doc:22]. Counter needs no import [Counter doc:9].
  - The `dojo/aspect` hook and the log-formatting hook are recreated (U12, U13).
- **Files:** `firstascent.js` → `modules/js/Game.js`; `modules/utils.js` → `modules/js/Utils.js`; one small module in a subfolder for the U12 check.
- **Done when:**
  - the game plays end to end;
  - log formatting works;
  - F5 works in every state;
  - the spectator view works;
  - no new console errors.
- **Playtest:**
  - S-smoke, as a 2-player and a 4-player game.
  - The log with card, pitch, token and objective names.
  - A refresh in each state group.
  - A replay of a full round (F13).
- **Repros:** F10 (log formatting), F13. Checks U10–U13.
- **Studio after:** playable. Delete on Studio: `firstascent.js`, `modules/utils.js`.

#### Phase P4: client infrastructure (the freeze principles)

**P4.1 Animations module** (M) — design in §4.2
- **Scope:**
  - Port `utils.js:animationPromise ~225–359` and `moveToNewParent ~21–224` into `modules/js/core/Animations.js`, with the contract, the registry and the `event.target` check.
  - `Utils` keeps thin delegating methods, so the 146 `animationPromise` and 127 `moveToNewParent` call sites don't change yet.
  - Harness `misc/tests/animations.html`: the 22 cases from 2026-10-14 plus the new ones (§4.2).
- **Files:** `modules/js/core/Animations.js` (new), `modules/js/Utils.js`, `misc/tests/animations.html` (new).
- **Done when:** the harness passes every case, and the playtest shows exactly one warning per forced fallback and none in normal play.
- **Playtest:** F1, F2, F6, F7, F8 (each continues, with exactly one warning), a normal full round (no warnings), a card-49 refill (T20; warnings compared with the legacy counts).
- **Repros:** F1, F2, F6, F7, F8; z-index leaks behind T5 and T12 (re-check).
- **Studio after:** playable.

**P4.2 Notifications module** (M) — design in §4.3
- **Scope:**
  - `modules/js/core/Notifications.js`: the wrapper, the error policy, the in-flight registry and `setupPromiseNotifications({ handlers: [wrapper], minDuration: 1 })`. `minDuration: 1` keeps today's pacing, where handlers end when their animations end **[inferred]**.
  - At this step no handler has moved yet; the U9 experiment uses a Studio-only `debug_testNotifReject`.
  - **The failure message (D6):** when a wrapped handler fails, the player sees a short non-blocking message, besides the console error and the re-render. The wording is translatable, and Jonathan approves it in this step.
- **Files:** `modules/js/core/Notifications.js` (new), `modules/js/Game.js`, `modules/php/Game.php` (the debug function).
- **Done when:** the wrapper is in place, the experiment's result is recorded for `DECISIONS.md`, and Jonathan has approved the message wording.
- **Playtest:** the U9 experiment (§4.3); S-smoke; a wrapped test handler that throws shows the message once and the game continues.
- **Studio after:** playable.

**P4.3 Dev tools** (M) — design in §4.4
- **Scope:**
  - Server: `getAllDatas` gets `dev = (getBgaEnvironment() === 'studio')`, and a Studio-only `debug_snapshot()`.
  - Client: `modules/js/dev/DevTools.js` is loaded with a dynamic import only when `dev` is true. It provides `faSnapshot()`, `faCheck()` and `faLog()`.
- **Files:** `modules/js/dev/DevTools.js` (new), `modules/js/Game.js`, `modules/php/Game.php`.
- **Done when:** the three functions work on Studio, and the code loads none of them when `dev` is false (reviewed in code; production can't be tested from Studio).
- **Playtest:**
  - During F1, before P5.4: `faSnapshot()` shows either no pending wait or the fallback warning entry.
  - `faCheck()` in a calm state reports no differences.
- **Studio after:** playable.

**P4.4–P4.6 Every handler behind the wrapper: a mechanical, timing-neutral move** (L each, split into chunks)
- **Shared shape:**
  - Each handler in the group is registered through the wrapper instead of `dojo.subscribe` + `setSynchronous`.
  - The wrapper passes the handler a `release` callback, and each of its `setSynchronousDuration()` calls becomes `release()`. The notification therefore ends exactly where it ends today, including in the handlers whose release sits inside an un-awaited `.then` chain.
  - Handlers that were never synchronous end when they return.
  - Nothing else in the handler bodies changes.
- **What the move already gives** (the wrapper, §4.3):
  - an exception anywhere in a handler is logged, and the queue continues;
  - a release that never comes (an awaited animation that never ends, or a branch that skips the release, F12) is cut off by the backstop, with a warning.

  So after P4.6 no handler can strand the queue silently, even before its body is cleaned up.
- **Not in these steps: async hygiene.** These three changes can alter timing, ordering or the error path (§4.3.1 marks which):
  - turning `.then` chains into `await`;
  - removing `new Promise(async …)` executors;
  - awaiting or explicitly detaching fire-and-forget work.

  **Recommendation: defer each one to the slice that owns the handler.** It gets its own commit in the slice's sub-step (c), before the component move. §4.3.1 lists every handler and helper affected, what changes, and its slice. Why defer:
  1. P4 stays timing-neutral. Its review is a pattern check, and its playtest expects no visible change.
  2. The safety these changes would buy (no silent strand, bounded stalls) already comes from the wrapper in P4.
  3. What they still change is ordering and timing inside one domain's animations. That domain's slice playtests exactly those animations. Done in P4, the same handlers would be retimed now, and again when the slice rewrites them to render from the model.
  4. The remaining concurrency races (F11, T20) are domain bugs, best fixed with their component.

  **The alternative** is separate hygiene commits inside P4.4–P4.6, one per kind of change per group, each listing its handlers. Every handler gets clean sooner, at the cost of a timing playtest across all domains at once, and of redoing part of that work in P5.
- **Groups:**

  | Step | Handlers |
  |---|---|
  | P4.4 | Setup, drawing, climbing: `confirmCharacter`, `deal*Objectives`, `confirm*Assets`, `riskShowAssets`, `riskReturnAssets`, `confirm*Requirements`, `confirmBail`, `rollDie`, `retractRiskDie`, `drawClimbingCard`, `crimperDrawsClimbingCards`, `passedClimbingCard`, `confirmClimbingChoice*`, `cleanUpClimbOrRest`, `undoClimbingCleanup`, `revealHeadwall`, `passStartingPlayer`, `sunnyPitch` |
  | P4.5 | Portaledge, discards, cards: `confirmAssetsForDiscard*`, `confirmPortaledge*`, `automaticPortaledge*`, `confirmTrade*`, `updateWaterPsych`, `shareEffect*` (the card-49 release guard stays; the backstop bounds it until P5.4, F12), `climbingCards15And24*`, `confirmAddTokenToPitch`, `confirmAssetToAssetBoard*`, `confirmStealFromAssetBoard*`, `confirmSymbolToken*`, `summitBetaChoices`, `confirmChooseSummitBetaToken*`, `confirmCrimperClimbingCard` |
  | P4.6 | Summit Beta, follow, end: `confirmSummitBeta*`, `confirmRerack*`, `confirmEnergyDrink`, `bomberAnchorCleanup`, `discardJesusPiece`, `useSpiderStick`, `matchingTechniques`, `noMatchingTechniques`, `noPermanentAssets`, `grantPermanentAssets`, `flipPlayedAssets`, `preGameEnd`, the synchronous trackers |

- **Ignore predicates:** they stay until each pair moves to `_private` in P5. With promise handlers no manual duration is needed, so an ignored notification can't lock the queue **[inferred]**. **Check (P4.4):** F9 with two clients.
- **Files:** `modules/js/Game.js`, `modules/js/Utils.js`, `modules/js/notifications/*.js` (new).
- **Done when:**
  - every handler in the group goes through the wrapper;
  - no `dojo.subscribe`, `setSynchronous` or `setSynchronousDuration` remains for it;
  - its body differs from before only by `release()`.
- **Playtest:** R-full for the converted group's domain. Expected: no visible change in timing or behavior.
- **Repros:** F9 (the check above). F12 is now bounded by the backstop; its fix is in P5.4.
- **Studio after:** playable.

#### Phase P5: domain slices

**Shared shape of each slice:**
- **(a) Server service extraction** (verbatim-move protocol, §2.1) plus the rules check (§5). One or two sessions.
- **(b) Server payloads and args** move to authoritative post-state and `_private` (§4.1), with the matching handlers adapted in the same step. No visual change.
- **(c) Client component and JS state classes;** handler internals render from the model.
  - First, the slice's async-hygiene changes from §4.3.1, in their own commits, each listing its handlers and what changes.
  - Every JS state class must survive leaving and re-entering the same state (§4.1.1, design rule 2).
- **(d) Bug fixes** for the slice's TODO items, one `fix:` commit per item. They include validating the slice's `act*` inputs against `$args` (B3, D7), in their own `fix:` commits.
- **(e) UX hand-off** (D10). The migration is parity only, so there are no `ux:` commits in P5; decided UX items are implemented in P8. If a decided or proposed item in `UX_CHANGES.md` would change this slice's component structure, the slice notes it in that entry's "Affected component" field so the component doesn't block it later.
- **Counters (D8):** a slice that owns a player-panel, round or phase counter builds it with PlayerCounter/TableCounter and `ebg.counter` (§7).
- **Files:**
  - server: new `modules/php/Rules/<Domain>.php` and `modules/php/Model/<Name>.php`, plus `modules/php/Game.php` and the slice's `modules/php/States/*`;
  - client: new `modules/js/components/<Name>.js`, `modules/js/states/<State>.js`, the slice's `modules/js/notifications/<Domain>.js`, plus `modules/js/Game.js` and `modules/js/Utils.js`;
  - `firstascent.css` only in (d);
  - `misc/docs/RULES_CHECK.md`, `TODO.md` and `UX_CHANGES.md` for the records.
- **Done when:**
  - the slice's playtest focus passes with no `[FA …]` warnings;
  - its TODO items are fixed or explicitly deferred by Jonathan;
  - its rules check is recorded;
  - its UX hand-off notes are recorded;
  - the moved legacy code is gone from `Game.js`/`Utils.js` and `Game.php`.
- **Studio after each sub-step:** playable.

| Slice | (a) Server | (b) Payloads | (c) Client | (d) Fixes | Playtest focus |
|---|---|---|---|---|---|
| **P5.1** Status bar and popups (cross-cutting) | The re-entry check (§4.1.1, U18), before any slice relies on re-entry | — | `StatusBar` (titles with an owner, `statusBar` buttons, counters and messages, `restore()`); `OutsideClick` (one manager per popup instead of the single slot set from 22 sites, `utils.js:setupOutsideClickListener ~1759`); JS state-class scaffolding (checks U14); the `.msg` observer (`js ~1751`) goes. The review's Action Bar point (round information) is UX-2 in the register, implemented in P8 | T6 (title-bar colors in dark mode) | Every state's title and buttons; no-transition flows; every popup still closes on an outside click as before; the re-entry check |
| **P5.2** Setup, characters, player panels | `Setup` service (setup body, `initSharedObjectives`); `Players` model; rules p.4–5; Q-R6 (setup path) | `getAllDatas` builder without side effects (B1); `player_order` computed (`php:stNextRound ~6506`) | `Characters`, `PlayerPanels`; JS `CharacterSelection` | T29, Q-R6 (the Spread card goes to the discard pile at setup) | 2–5 players, both boards; spectator; zombie during selection; F5 |
| **P5.3** Drawing (hand, Spread, deck) | `Drawing` service (`confirmAssets ~1007`, Spread refill, 4 of a kind), `Cards` model, `nextDraw`/`nextRound` logic (`php:stNextDraw ~5604`); rules p.5, p.11; Q-R2 (fixed in P0.2; regression check); Q-R6 (during-play path) | `confirmOpponentAssets` + `confirmYourAssets` → one `notify->all` with `_private`; post-state: hand, counts, Spread, discard top | `Hand`, `Spread`/deck; JS `DrawAssets` | T5 if still open; Q-R6 check: the replaced Spread card lands on top of the discard pile unless a card was discarded more recently | Rack Up with 2–5 players; Rerack after a failed climb (draws 1), a rest and a bail; Simul Climb; deck reshuffle |
| **P5.4** Portaledge (rest, trade, card draws, refills) | `Portaledge` service (`confirmPortaledge ~4008`, `drawFromPortaledge utils.php ~590`, `confirmTrade ~2029`, `rest ~2105`, `stPortaledgeAll ~5803`, `argResting ~5481`, `argSelectPortaledge ~5359`); rules p.7, 8, 11; Q-R5 (check whether the missing reshuffle matters digitally: it does only if a player can know the deck order) | `confirmPortaledge*`, `automaticPortaledge*`, `confirmTrade*` → `_private`; post-state: Portaledge counts and empty flags, Water/Psych, hand | `Portaledge` (popup, +/−, rest Water/Psych, refill and reshuffle animations, re-show before animating); JS `Resting`, `SelectPortaledge` | T19, T20, T21, T6 (resting numbers in dark mode) | F1, F2, F8: the Portaledge reappears and animates, no freeze, no warning; card 49; a refill from an empty stack |
| **P5.5** Board | `Board` model (`getAvailablePitches`, tile coordinates, pitch order, Headwall, Ledge, rope order, pitch tokens; `view.php` logic → `getAllDatas`); rules p.9, p.12 (Trifecta) | Rope, meeple and Headwall post-state | `Board` (pitches, ropes, meeples, routes, Ledge teleports, summit stacking) | T25, with Zone (D8) | Headwall reveal; Ledge moves; 2+ meeples on a summit (forest board); second and third ascents |
| **P5.6** Climbing: requirements, risk it, bail, character abilities | `Climbing` service (`confirmRequirements ~1207`, about 600 lines, may take two sessions; `riskIt ~1810`; `confirmBail ~1996`); rules p.7, 9, 11, 15; Q-R1 | Requirement data in `climbOrRest` args; `confirm*Requirements` → `_private`; post-state: boards, resources, hand, trackers | `Requirements` (`utils.js ~2036–2276, ~4270–4621`; `js ~3259–4236`; abilities `js ~6503–7214`), `Trifecta`, `RiskDie`; JS `ClimbOrRest` | T9, T10, T11, T13, T14, T16, T27, T28; T8 together with P5.10 | Every character's ability; second ascent; each risk-it outcome, including failure and retreat; Trifecta; bail; a spectator watching (T16) |
| **P5.7** Climbing-card display and crimper | `ClimbingCards` service part 1 (draw, pass `~4675`, undo `~4668`, crimper `~5127`); rules p.8, p.15 | `drawClimbingCard`, `crimperDrawsClimbingCards`, `confirmCrimperClimbingCard` | `ClimbingSlot` (`utils.js ~2782–3150`, `js:onShowHideCard ~4236`), `CrimperDisplay`; JS `ClimbingCard`, `CrimperClimbingCards` | T7, T18, T21 (crimper) | F6, F7; both crimper choices; Undo Climbing Card; "Hide card" in a non-English language |
| **P5.8** Climbing-card effects | `ClimbingCards` service part 2 (`confirmClimbingCardChoice ~2120`, about 840 lines, split by effect family across two or three sessions; `confirmAssetsForDiscard ~2964`; `confirmSelectedOpponent ~3599`; `~4196–4664`; `stTechniqueOpponent ~5819`; `utils.php:bespokeClimbingCard ~719`); rules p.8 | `_private` for each public/private pair; post-state | JS `DiscardAssets`, `SelectOpponent`, `AddTokenToPitch`, `AddAssetToAssetBoard`, `StealFromAssetBoard`, `ChooseSummitBetaToken`, `ChooseTechniqueToken` | T15, T17, T22 | Each card family (set up with `debug_stackClimbingDeck`); "all players" effects with 2–5 players; Jesus Piece |
| **P5.9** Summit Beta I: hand tokens and no-transition tokens | `SummitBeta` service (`confirmRerack ~4719`, `confirmEnergyDrink ~4782`, Simul Climb, hand-token helpers); rules p.8 | Self-transition at the end of no-transition flows (D5), only in the states that §4.1.1 and the P5.1 check cleared; elsewhere the args-refresh fallback. B8 is fixed before `drawAssets` uses re-entry. `confirmRerack*` and `confirmSummitBeta*` → `_private` | `SummitBeta` (hand tokens; enabling from args; any-time flow framework; Used pile) | T1, T2, B8 (B7 is in P0.2, unless it wasn't fixed there) | F4 variants in `climbOrRest` and in other states; each no-transition flow in each of its 14 states; Rerack box on a phone; F5 mid-flow |
| **P5.10** Summit Beta II | `SummitBeta` service part 2 (`confirmBomberAnchor ~4805` with internal helpers split from the public sub-actions (B3); `confirmLuckyChalkbag ~4832`; `confirmRiskSummitBeta ~5066`; Jesus Piece; Spider Stick; New Rubber) | `bomberAnchorCleanup`; `riskSummitBeta` gets args carrying the die face, which re-entry needs (§4.1.1) | Bomber Anchor, Lucky Chalkbag, Jesus Piece, Borrowed Rack, Jumar, Extra Water, Guidebook flows (`js ~5639–6500`); JS `RiskSummitBeta` | T8, T11, T26 | F3, F5, F8; T26; each token in each state that allows it |
| **P5.11** Follow Phase and Asset Boards | `FollowPhase` service (`stMatchingTechniques ~5841`, `stFlagPermanentAssets ~6206`, `confirmPermanentAssets ~4698`, `stGrantPermanentAssets ~6297`, `stFlipPlayedAssets ~6245`), `AssetBoards` model (`utils.php ~278–407, ~815–874`); rules p.10–11, p.15; Q-R3 (New Rubber's handling), Q-R7 (the allocation step), Q-R8 (fixed in P0.2; regression check) | Board post-state in follow notifications | `AssetBoard`; JS `ChoosePermanentAssets` (multiactive: `onPlayerActivationChange`) | T3, T12 | Techniques with tokens and wilds (Sendy Jammer); New Rubber; Young Prodigy's 3/5 slots; several Permanent Asset tokens at once; mobile |
| **P5.12** End game, objectives, scorecard | `EndGame`/`Scoring` service (`stPreGameEnd ~6529`, objective trackers); rules p.12–13 | `preGameEnd`; `getAllDatas` at game end | `Objectives` (trackers, opponents' objectives, scorecard) | T4 | Complete games with 2–5 players; each shared objective (`debug_setSharedObjectives`); a tie; F5 after the end; a replay (F13) |
| **P5.13** Log and tooltips | `Log` helper (`formatLogTitles` and the other log helpers) | — | `Log` (`utils.js:logInject ~1295`, `addTooltipsToLog ~1256`, tooltip builders `~996–1179`) | F10 | Every log item type; player names containing `-`, and accents if Studio allows them (Q-T3; apostrophes can't occur in names); the replay log |

**Sessions per slice (approx.):**

| Slice | Sessions | Slice | Sessions |
|---|---|---|---|
| P5.1 | 2–3 | P5.8 | 5–6 |
| P5.2 | 3 | P5.9 | 3–4 |
| P5.3 | 3–4 | P5.10 | 4–5 |
| P5.4 | 4–5 | P5.11 | 4 |
| P5.5 | 3 | P5.12 | 3 |
| P5.6 | 5–6 | P5.13 | 2 |
| P5.7 | 3–4 | **Total** | **44–52** |

#### Phase P6: layout built in JS

**P6.1 Templates module** (M)
- **Scope:** the `jstpl_*` templates (`tpl ~156–426`) become functions in `modules/js/core/Templates.js`; the `format_block` calls are replaced. The `.tpl` keeps only the base layout.
- **Files:** `modules/js/core/Templates.js` (new), `firstascent_firstascent.tpl`, the `modules/js` files that call `format_block`.
- **Done when:** no `format_block` call and no `jstpl_` template remain.
- **Playtest:** R-full visual pass.
- **Studio after:** playable.

**P6.2 Base layout from JS** (M)
- **Scope:**
  - The `.tpl` HTML (`tpl ~14–154`) and `view.php` logic move into `setup` via `this.bga.gameArea.getElement()` [Game.js doc:285–300].
  - `getAllDatas` provides shared-objective positions, tile coordinates, pitch order and the face-down Headwall.
  - Delete `.tpl` and `.view.php`.
- **Files:** `modules/js/Game.js`, `modules/js/core/Templates.js`, `modules/php/View/StateView.php`, `firstascent_firstascent.tpl` and `firstascent.view.php` (both deleted).
- **Done when:** visual parity on:
  - the desert and forest boards with 2–5 players;
  - a phone viewport;
  - dark mode;
  - spectator view.
- **Studio after:** playable. Delete on Studio: `firstascent_firstascent.tpl`, `firstascent.view.php`.

#### Phase P7: cleanup and release preparation

Each P7 step leaves Studio playable. After P7.4, Studio holds the release candidate.

- **P7.1 Cleanup:**
  - the vestiges of toggle buttons (T30);
  - dead code, such as the `prevent_error_rentry` logic (FREEZE §5.3);
  - the commented testing blocks;
  - the compatibility facades left over from P4.
  - **Files:** any. **Done when:** a scan finds none of these left; S-smoke passes.
- **P7.2 Metadata (optional):**
  - `gameinfos.inc.php` → `gameinfos.jsonc`;
  - a statistics review;
  - Studio's "Check project";
  - the zombie mode level (a pitfall in `BGA_PITFALLS.md`, to be confirmed against the BGA docs).
  - **Files:** `gameinfos.inc.php` → `gameinfos.jsonc`, `stats.json`. **Done when:** Studio reloads the configuration without errors, and "Check project" is clean.
- **P7.3 Full regression:** R-full, Studio's minified-JS test (U15), the replay check, mobile, dark mode, zombies.
  - **Files:** none, except fixes, which become their own `fix:` steps. **Done when:** R-full passes and every T and F item in §8.4 is closed or deferred by Jonathan.
- **P7.4 Release preparation:**
  - Studio holds exactly the git file set: no stale legacy files, no local overrides file.
  - No private-alpha table is running when the release is made (D12, §2.4).
  - Jonathan builds the release, to the private alpha. Resubmission to BGA waits for P8 (D14).
  - Post-release monitoring of the production error logs [Studio logs doc:82–90].
  - **Files:** none in git; the Studio file set. **Done when:** a dry-run comparison shows Studio and git match, and D12's release condition holds.

#### Phase P8: post-migration UX and components (D8, D10, D14)

Not sized, and not broken into steps yet. It is planned in its own session after P7, and it comes before resubmission to BGA (D14).

- **Scope:**
  - The *decided* items of `UX_CHANGES.md`, each a separate `ux:` commit with its own playtest (D10, §12).
  - The D8 components adopted after the migration: ItemManager, BgaAnimations (per component), BgaCards, BgaDice, BgaScoreSheet and the last-turn banner (§7).
- **Constraints carried in from earlier phases:**
  - ItemManager changes the schema (an `order` column) and typed values, which is why it comes before resubmission. Releases are made only when no table is running (D12).
  - BgaAnimations replaces motion helpers built in P4.1. The §4.2 contract (every awaited animation settles, none depends on container visibility) holds for whatever replaces them (`DECISIONS.md`, principles for the migration).
  - Where a decided item changes a component's structure, the owning P5 slice noted it in `UX_CHANGES.md`.
- **Files, done criteria and playtests:** set in the P8 planning session.
- **Studio after:** playable.

### 2.4 Releasing the migrated build: private-alpha tables (D12)
- **What a release does to running tables** **[inferred from docs]**:
  - New code applies to tables already running: changing a state id "in prod" makes active games "behave unpredictably" [States doc:93], and schema changes after release need `upgradeTableDb` [dbmodel doc:134–136].
  - The migration changes both. `global_variables` becomes `bga_globals`, and the payloads and args change.
  - So private-alpha tables still running at release would very probably break.
- **Replays are not affected:** they use the static files archived at game start [Replay doc:9–13].
- **Decided (D12):**
  - There is no formal cut-over for private-alpha tables. Jonathan takes part in most private playtests, and they are real-time, so he knows when a table is running. He releases only when no table is running. Writing `upgradeTableDb` migrations isn't worth it for a private alpha.
  - **Standing constraint after resubmission:** every release must keep running tables working: the same state ids and globals, or an `upgradeTableDb` migration. Once outside players have tables, a release can't wait for all of them to finish.
  - **Rollback:** Production keeps the last three builds redeployable. But tables created on the migrated build would then break under the legacy build, so a rollback has the same cost in reverse.

---

## 3. Class structure

### 3.1 Server (`modules/php`, namespace `Bga\Games\FirstAscent`)

| Class | Responsibility | Comes from |
|---|---|---|
| `Game` | Table subclass: builds the models and services, plus `setupNewGame` (delegates to `Setup`), `getAllDatas` (delegates to `StateView`), `getGameProgression`, `upgradeTableDb` | `php` (constructor `~22`, `~51`, `~781`, `~913`, `~6742`) |
| `Debug\DebugTrait` | `debug_*` functions, all guarded to Studio | new; `utils.php:debug_goToState ~929` |
| `States\*` | One class per state (27), thin: id, type, legacy `name`, descriptions, transitions, `getArgs`, `onEnteringState`, `act*`, `zombie` | `states`; `php:argX ~5179–5496`; `stX ~5524–6641`; `zombieTurn ~6663` |
| `States\Traits\AnyTimeSummitBetaActions` | `#[PossibleAction]` `actConfirmRerack`, `actConfirmEnergyDrink`, `actConfirmBomberAnchor`, `actConfirmAssets` (Simul Climb), plus the sub-actions Bomber Anchor still needs; used by every state that allows them | the `possibleactions` repeated across 14 states |
| `States\Traits\UndoClimbingCardAction` | `actUndoClimbingCard` | same |
| `Model\Globals` | Typed access to `bga->globals`; the one place that decides array vs object (U7) | `utils.php:get/setGlobalVariable ~32–48` |
| `Model\Players` | Names, colors, characters, player order, zombies | `player_names_and_colors`, `zombie_players`, `utils.php:isPlayerZombie ~921` |
| `Model\Cards` | The Deck (`cards_and_tokens`): asset deck, Spread, discard, Portaledge stacks, climbing deck, Summit Beta supply, plus the 30 raw SQL queries | `php` Deck calls, `utils.php:getHandAssets ~247`, `getBoardAssets ~268`, `checkSpread ~660`, `updateAssetDiscard ~674` |
| `Model\Board` | Pitches, adjacency, tile coordinates, pitch order, Headwall, Ledge, rope order, pitch tokens | `utils.php ~50–221, ~684–717`; `view.php` |
| `Model\Resources` | Resource and Water/Psych trackers | `utils.php:updateResourceTracker ~475` |
| `Model\AssetBoards` | Board slots, tucked cards, permanent assets, flips | `utils.php ~278–407, ~815–874` |
| `Model\Scoring` | Score tracker, shared and personal objective trackers, statistics | spread across `php` |
| `Rules\Setup` | Setup, shared objectives, character pool, personal objectives | `php:setupNewGame ~51–770` |
| `Rules\Drawing` | Draws, Spread refill, Rerack sequencing | `php:confirmAssets ~1007`, `stNextDraw ~5604`, `utils.php:nextRound ~252` |
| `Rules\Portaledge` | Portaledge draws, refills, rest, trade | `php ~2029–2118, ~4008–4193, ~5803`; `utils.php:drawFromPortaledge ~590` |
| `Rules\Climbing` | Requirements, risk it, bail | `php ~1207–2027` |
| `Rules\ClimbingCards` | Card choices and effects, discards, opponents, steal/add, tokens, crimper | `php ~2120–4664, ~5127, ~5819`; `utils.php:bespokeClimbingCard ~719` |
| `Rules\SummitBeta` | Token flows | `php ~4719–5066`; `utils.php ~409–450` |
| `Rules\FollowPhase` | Matching techniques, permanent assets, flips | `php ~4698, ~5841–6501` |
| `Rules\EndGame` | Personal objectives, final scoring | `php:stPreGameEnd ~6529` |
| `View\StateView` | Builds `getAllDatas` and `debug_snapshot`: public, private and static parts, with no writes | `php:getAllDatas ~781–901` |
| `Util\Log` | `formatLogList`, `buildLogAction`, `formatLogTitles`, the translated terms (`COMMON_TRANSLATIONS`) | `utils.php ~6–24, ~876–919` |

- **Why one class per state:** the states are small once their logic lives in services, and PSR-4 loads one class per file **[inferred]**. Shared actions use traits (U6), with explicit one-line delegating methods as the fallback.
- **ItemManager (P8, D8)** replaces the Deck and the raw SQL inside `Model\Cards`. Keeping all card storage behind that class keeps P8 local **[inferred]**.
- **`material.inc.php`:** 5050 lines of data. It stays at the root, where it is auto-included [Material doc:7]. Moving it to `modules/php` with an explicit `require` [Material doc:198–225] is optional and brings no behavior benefit.
- **The `UtilTrait` disappears** into the classes above.

### 3.2 Client (`modules/js`, ES modules, vanilla JavaScript)

```
modules/js/
  Game.js                 thin: constructor(bga), setup → Layout + components + render from gamedatas,
                          JS state registration, Notifications.register(...)
  core/
    Animations.js         contract §4.2; moveToNewParent z-index tracker; registry of waits
    Notifications.js      wrapper and error policy §4.3; in-flight registry
    StatusBar.js          the action bar: title owner, buttons (statusBar API), counters
                          (draw_counter, discard_counter), messages, restore() for the current state
    OutsideClick.js       one registration per popup, replacing the single global slot
    Log.js                log formatting and injection; tooltips in the log
    Tooltips.js           asset, pitch, climbing, Summit Beta, objective tooltips
    Templates.js          from the .tpl jstpl_* templates (P6.1); base layout (P6.2)
  dev/DevTools.js         dev-only snapshot, consistency check, ring-buffer log (§4.4)
  model/ClientModel.js    mirror of server state, updated only from gamedatas and payload post-state
  components/
    Portaledge.js  SummitBeta.js  ClimbingSlot.js  CrimperDisplay.js  Hand.js  AssetBoard.js
    Spread.js  Board.js  Requirements.js  Trifecta.js  RiskDie.js  Characters.js
    PlayerPanels.js  Objectives.js  ReferenceCards.js
  states/                 JS state classes, one per player state (game states need none [Game.js doc:89])
  notifications/          handler classes per domain, registered through core/Notifications.js
```

- **Where the main components come from:**
  - **Portaledge:** `utils.js ~3150–3604`, `js:onShowHidePortaledge ~4346`, `onSelectPortaledge ~4642`, `onRestWaterPsych ~4806`.
  - **SummitBeta:** `utils.js ~3875–4270, ~4734`; `js ~5338–6500`.
  - **ClimbingSlot:** `utils.js ~2782–3150`; `js:onShowHideCard ~4236`, `~4384–4440`.
  - **CrimperDisplay:** `js:onCrimperSelectCard ~6749`, `notif_confirmCrimperClimbingCard ~13234`.
  - **StatusBar:** `utils.js:updateTitlebar ~1715`, `updateTitlebarAddon ~1744`; `js:onUpdateActionButtons ~2572`, the `.msg` observer `~1751`.
- **CSS stays one file,** `firstascent.css`, as required [CSS doc:45]. Sections get reordered by component with comments; selectors don't change, so visual parity holds.
- **Notification handlers live outside the state classes,** because a `notif_` method defined in both `Game.js` and a state class is called twice [Game.js doc:1058].

---

## 4. Migration principles as concrete design

### 4.1 The client renders from authoritative server state
- **`getAllDatas`** is built by one `StateView` builder for the current player, with no writes. Today `php:getAllDatas ~796` writes `player_order` and `~830` writes `asset_discard`, and `php:stNextRound ~6506` depends on the first of those writes (B1). It returns:
  - **public state:** board (pitches, ropes, meeples, pitch tokens, Headwall); decks (counts, Spread, discard tops, Portaledge counts and empty flags); players (character, color, Water/Psych, ropes, hand count, Asset Board, permanent assets, point tokens, token counts); objectives and trackers; round, phase, starting player; the climbing card in play, crimper cards, revealed Summit Beta choices; the risk state; zombies;
  - **private state for the current player:** hand, own Summit Beta and symbol tokens, personal objectives and trackers;
  - **static material,** once;
  - **`dev: true` on Studio** only.
- **State args** carry what the active player's interface needs to render its affordances: selectable pitches, cards, tokens and limits, computed on the server. The docs recommend doing the complex work in PHP and passing it through args [Debugging doc:336–340]. Private parts go in `_private` [States doc:281–308].
- **Notification payloads** carry:
  - (a) the delta to animate;
  - (b) the post-state of the entities they touch, in the same shapes as `getAllDatas`, so one render function serves both;
  - (c) private data through `_private` with `NotificationMessage` [Game.php doc:1144–1176].
  - Size budget: 128K per bundled request [Game.php doc:1063]. So the post-state is per entity, never the whole snapshot.
- **Client:**
  - `ClientModel` is updated only from `gamedatas` and payload post-state.
  - Components render idempotently from the model; animations are cosmetic transitions between rendered states.
  - After a handler error or an animation fallback, the component re-renders, which reconciles the display.
  - In-progress selection belongs to the JS state class and is reset in `onLeavingState`.
  - This removes the flag families listed in FREEZE §5.3.
- **No-transition flows (D5).**
  - Today five flows end without a state change:
    - Simul Climb (`php:confirmAssets ~1201`);
    - trade (`confirmTrade ~2029`);
    - Rerack (`confirmRerack ~4719`);
    - Energy Drink (`confirmEnergyDrink ~4782`);
    - Bomber Anchor (`confirmBomberAnchor ~4805`).

    The client then restores the action bar with `restoreServerGameState()` outside a client state (FREEZE Background 5).
  - **Decided (D5):** the server ends these flows by re-entering the current state where §4.1.1 says that is safe, and with an args-refresh notification elsewhere. Every client then leaves the state and re-enters it with fresh args.
    - **Mechanism:** D5 lands in P5, after the State classes of P2, so the act method returns the current state id [States doc:355–364].
    - `jumpToState(<current id>)` does the same from a `Game.php` method. The docs name its use case: "jumping to specific state from 'do_anytime' actions" [Game.php doc:546–550]. The Studio check below uses it, through `debug_goToState`.
  - **Where re-entry is safe** is inventoried in §4.1.1. In short:
    - The server side is safe in 13 of the 14 states, and in `drawAssets` once latent bug B8 is fixed.
    - The legacy client is not safe, so D5 comes only with the new JS state classes.
  - **Risk:** re-entry resets in-progress client selections. Each case is checked for UX parity in P5.9 and P5.10.
- **Refresh parity:** `faCheck()` (§4.4) compares the model after a sequence of notifications with a fresh server snapshot. That is the F5 requirement of [UX guidelines F.2] made testable.

#### 4.1.1 Re-entry inventory (D5)

**Where the flows can end.**
- The client enables the four any-time tokens (Rerack, Energy Drink, Simul Climb, Bomber Anchor) in 14 states: `utils.js:enableSummitBetaTokens ~3895`, called from `js:onEnteringState ~1877–2397`.
- Those are exactly the 14 states whose `possibleactions` list them in `states.inc.php`, with one exception at the baseline: `crimperClimbingCards` doesn't allow Simul Climb's `confirmAssets` (B7, fixed in P0.2 once Studio confirms it).
- A trade can end only in `climbOrRest`.

**What entering these states does on the server today** (the same in all 14):
- **No entry action.**
  - All 14 are ACTIVE_PLAYER states, and `states.inc.php` gives none of them an `action`. So there is no `st*` function to re-run.
  - In the State-class port, their `onEnteringState` stays empty (design rule 1).
- **The args function runs again** (table below).
- **Game progression:** only `climbingCard` has `updateGameProgression`, which re-runs `getGameProgression ~913` (read-only).
- **No multiactive setup:** the only multiactive state, `choosePermanentAssets` (42), allows no any-time token.
- **No draws:** every draw happens inside an action, or in a GAME state (`stNextDraw ~5604`, `stPortaledgeAll ~5803`) before entry. The resting bookkeeping (`rested`, `finished_drawing`) is likewise done in `stNextDraw` before `resting` is entered.
- **Undo save point:** it is taken in `confirmRequirements ~1785, ~1800`, just after a climbing card is drawn and before `climbingCard`, `addTokenToPitch` or `crimperClimbingCards` is first entered. Re-entry doesn't retake it.

| State (id) | Server: what entry runs | Server re-entry | Legacy client on leave + re-enter |
|---|---|---|---|
| `drawAssets` (10) | `argDrawAssets ~5179`: reads `climbing_card_info`, `phase`, `x_cards`; no writes | **Not safe until B8 is fixed.** Simul Climb's `confirmAssets` also runs the Rerack draw bookkeeping (`~1012–1020`): it drops the player from `rerack_1` and turns `x_cards` 1 into 3. A player who must draw 1 in the Rerack would then be offered 3 | Adds a second `#minus_one`/`#plus_one` pair to `#asset_deck` (`js ~1880`); leaving (`~2444`) doesn't remove them |
| `climbOrRest` (20) | `argClimbOrRest ~5198`: reads the trackers and computes the available pitches; no writes | Safe | Leaving (`~2456–2487`) drops a selected pitch and the client-side requirement tokens (Jumar, Guidebook, Borrowed Rack, Extra Water). After a trade that may be wanted, since requirements change (T27) |
| `climbingCard` (21) | No args; progression update (read-only) | Safe | Leaving (`~2489`) unhooks the choice handlers, and entering doesn't re-add them (only `notif_drawClimbingCard ~9146` and setup do), so the card's choices would stop responding |
| `discardAssets` (22) | `argDiscardAssets ~5215`: read-only (and returns nothing in one edge branch) | Safe | — |
| `selectOpponent` (23) | `argSelectOpponent ~5302`: read-only | Safe | — |
| `selectPortaledge` (24) | `argSelectPortaledge ~5359`: read-only queries. In "all players" mode the rotation lives in `stPortaledgeAll`, not here | Safe | Adds a second set of Portaledge +/− controls (`~2207`) |
| `addTokenToPitch` (27) | `argAddTokenToPitch ~5413`: **writes** `climbing_card_info.token_types`, the same value every time | Safe (idempotent write) | — |
| `stealFromAssetBoard` (28) | read-only | Safe | — |
| `addAssetToAssetBoard` (29) | read-only | Safe | — |
| `chooseSummitBetaToken` (30) | read-only | Safe | Leaving (`~2554–2561`) resets `#summit_pile`'s z-index and, without animations, removes the revealed tokens (T17 lives here) |
| `chooseTechniqueToken` (31) | read-only. In card 9's flow the active player may be the opponent; re-entry keeps that player active | Safe | — |
| `resting` (33) | `argResting ~5481`: reads the character; no writes | Safe | Adds a second set of Portaledge +/− controls (`~2025`); resets the rest counters to 0, so in-progress picks are lost |
| `riskSummitBeta` (50) | No args | Safe | Leaving sets `gamedatas.riskSummitBetaFace = null` (`~2563`), and with no args nothing restores it, so the re-entered state loses the die face. Needs args first (P5.10b) |
| `crimperClimbingCards` (60) | No args | Safe | Re-installs the crimper outside-click listener (`~2411`) |

**Conclusions:**
- **Server:**
  - Re-entry is safe in 13 of 14 states.
  - `drawAssets` becomes safe once B8 is fixed (a `fix:` commit before P5.9 relies on it there).
- **Framework, [unverified U18]:** whether re-entering an active state for the same player has side effects of its own:
  - a new "your turn" signal or email in turn-based mode;
  - a turn counter;
  - the clock or extra time;
  - log lines.
- **Legacy client:** not re-entry-safe in several states (last column). So D5 is applied only through the new JS state classes, slice by slice, and `riskSummitBeta` first gets args carrying the die face.
  - The counters in `#generalactions` (`#draw_counter`, `#discard_counter`) aren't listed. A state change clears that bar before buttons are re-added, so they wouldn't duplicate **[inferred: games re-add their buttons on every state change without accumulating them]**.
- **Design rules for the port:**
  1. A player state's `onEnteringState` and `getArgs` have no side effects. Args may write only idempotently, as `argAddTokenToPitch` does.
  2. Every JS state class survives leaving and re-entering the same state: no duplicated DOM, no lost server-provided data.

**Studio check, in P5.1, before P5.9 relies on re-entry:**
1. In a 2-player turn-based table, and once in real time, bring the active player into each of the 14 states. The debug functions (§6) help.
2. Take a `faCheck()` snapshot (§4.4), run `debug_goToState(<current state id>)` (the existing function, guarded in P1.1), and take another snapshot.
3. Expected: no server data change except `argAddTokenToPitch`'s idempotent field. Record whether a "your turn" signal, a log line or a clock change appears. If re-entry has a side effect players would see, bring it to Jonathan as a UX question before P5.9 relies on it (D5).
4. `jumpToState` and a returned state id are assumed to re-enter the same way **[unverified]**. If the result is unclear, repeat with a temporary Studio-only action that returns the current state id.

**Fallback for any state ruled out** (by the inventory or by the check):
- The flow keeps its no-transition ending.
- The server sends the active player a private `refreshStateArgs` notification carrying the current state's args, computed by the same `getArgs()`.
- The JS state class re-renders its action bar and affordances from those args without leaving the state.
- This still replaces `restoreServerGameState()` outside client states with server data.

### 4.2 Animation helper contract (`core/Animations.js`)
- **API:** `animate(element, className, options)`. It returns a promise that **always resolves**, never rejects, with `{ ok: true }` or `{ ok: false, reason }`. `moveTo`, `destroy` and `keepClass` cover today's `func.before/after`, `destroy` and `remove_class` parameters.
- **Rules carried over from the legacy fallback** (`948f472`; `progress.md` 2026-10-14):
  1. **One-frame check.** One frame after the class is applied, settle with a warning if any of these holds:
     - the element is out of the document;
     - it isn't rendered (`checkVisibility()`);
     - nothing is pending or running (`getAnimations({ subtree: true })`). This covers "class already present".
  2. **Cancel.** On `animationcancel`, re-check one frame later. Settle only when nothing is left running.
  3. **Timeout backstop.** The remaining `endTime` plus 1 s. It is re-armed while `document.hidden`, and there is no backstop for infinite animations.
  4. **"Not re-inserted".** If the element was removed from the document mid-animation, `after()` cleanup still runs but the element isn't re-attached at its destination. The case behind this rule is the card-49 race: `utils.js:updateDiscardTopCard ~3604` clears the discard pile while refill card backs are flying out of it.
  5. **One warning per fallback.** The format stays `[FA animation fallback] reason | element | class | state | title`.
- **New rules:**
  6. **Own events only.** Only `animationend` events whose target is the element count. Today the listener also fires on a child's bubbling event (FREEZE Background 2), which can end a parent's wait early. The "wrong card in front, then snapping" symptom (T12) fits this cause **[inferred]**.
  7. **No dependence on container visibility** (`DECISIONS.md`, the principle on container visibility). An awaited animation never runs inside a container the player can hide. Either:
     - the component re-shows the container first (T21, already the desired behavior for the Portaledge and the crimper display), or
     - the animation runs on a clone in an always-rendered fly layer.

     User-hideable containers carry `data-fa-hideable`. In dev builds, starting an awaited animation under one logs a warning.
  8. **Instant mode.** When `this.bga.gameui.bgaAnimationsActive()` is false (replays, fast mode, a hidden tab) [Game.js doc:571–584], apply the end state and resolve immediately. This replaces `utils.js:shouldAnimate ~1291`.
  9. **z-index tracker.** The `moveToNewParent` tracker releases its entries on every settle, fallbacks included. Today a wait that never ends leaves its stacking root raised for the whole session (FREEZE §5.4; T5). The temporary values (700, and 1053 on mobile) are kept for parity, even though 1053 sits above BGA dialogs at 950 [CSS doc:56–60]; changing that is a candidate UX item.
  10. **Registry.** Each wait records: id, element path, class, origin (the notification type and uid in flight, or the click handler's name, set by `Notifications.js`), start time, visibility at start, state. Entries are removed on settle.
- **Harness:** `misc/tests/animations.html`. Cases:
  - normal;
  - hidden ancestor;
  - class already present;
  - removed mid-animation;
  - cancel;
  - a child's bubbling `animationend`;
  - hidden tab;
  - infinite animation;
  - instant mode.

  Served with `py -m http.server` (Python 3.13 is installed; there is no Node). Browsers block ES-module imports from `file://` **[inferred: standard browser behavior]**.

### 4.3 Notification handler error policy (`core/Notifications.js`)
- **Registration:** every handler is registered through `Notifications.register(handlerObjects)`. That builds one wrapper object passed as `setupPromiseNotifications({ handlers: [wrapper], minDuration: 1 })` [Game.js doc:992–1058].
  - Legacy handlers moved over in P4.4–P4.6 keep their own release point: the wrapper passes them a `release` callback and waits for it, so their timing doesn't change.
  - A handler rewritten in its slice returns a promise instead.
- **Each wrapped handler:**
  1. sets the current origin (type, uid, `move_id`) for the animation registry;
  2. awaits the handler inside `try/catch`;
  3. on an exception: `console.error('[FA notif error]', type, uid, error)`, a dev report, and a re-render of the affected components from the model;
  4. **always resolves.**
- **Handler backstop:** a handler still pending after N seconds resolves with `[FA notif backstop]` and records the waits that are still pending. N is set above the longest legitimate handler, measured from registry timings; about 20 s is a starting guess **[inferred]**.
- **Coding rules, enforced in review** (for new code at once; for existing handlers in their slice, §4.3.1):
  - no `new Promise(async …)` (35 sites today);
  - no `.then` chain without `await`;
  - no fire-and-forget async work that touches state later handlers depend on (S7);
  - every early-return path settles (the `shareEffect` card-49 guard, F12).
- **Player-visible behavior on an error (D6, decided).** The player sees a short non-blocking message, in addition to the console error; the game continues and the display re-renders. The wording is translatable, and Jonathan approves it in P4.2. Proposed in the draft: nothing shown to the player.
- **What the docs leave open:**
  - The notification ends "when the promise AND the minimum durations are over" [Game.js doc:1000]. Rejection isn't covered.
  - **Experiment (P4.2):**
    1. A Studio-only `debug_testNotifReject()` sends `faTestReject`, then `faTestAfter` with a log line.
    2. The dev client registers `faTestReject` *unwrapped*, returning `Promise.reject()`.
    3. Record whether `faTestAfter`'s log line appears, whether the wait cursor shows, and what the console prints.
    4. Repeat with a promise that never settles. Expected: it blocks, which confirms [:1000].
  - Either way the wrapper never rejects. The experiment only tells us whether the wrapper is a safety net or essential. Jonathan records the result in `DECISIONS.md`.

#### 4.3.1 Async-hygiene inventory, deferred to the owning slice
Each change is its own `struct:` commit in the slice's sub-step (c), before the component move, and lists its handlers.

**Effect codes** (what changes for players and for the queue):
- **E:** only the error path changes. A throw now reaches the wrapper and is logged, instead of hanging (an async executor) or skipping the release.
- **O:** ordering changes: code that used to run before an un-awaited chain finished now runs after it.
- **T:** timing that players can see changes: the queue now waits for work that used to run in the background.

| Slice | Handler or helper (`js` unless marked) | Change | Effect |
|---|---|---|---|
| P5.2 | `notif_confirmCharacter ~7422` (a synchronous handler whose animated branch releases inside an inner async block, `~7600`) | Make it async and await the block | E |
| P5.3 | `notif_confirmOpponentAssets ~7790` (executors `~7805, ~7884`); `notif_confirmYourAssets ~8082` (`~8117, ~8247`); `utils.js:deckReshuffle ~4621` (`~4622`) | Await the steps directly instead of wrapping them in `new Promise(async …)` | E |
| P5.4 | `notif_confirmTradePublic ~8654` (release inside an un-awaited `.then` chain, `~8703–8717`) | Await the chain | E, O |
| P5.4 | `notif_shareEffectPrivate ~10820`, `notif_shareEffectPublic ~10865` (Portaledge draws not awaited, `~10843, ~10846, ~10882`; release only for card 49) | Await the draws in order; release on every path | T (the second draw waits for the first: T20), E (F12) |
| P5.4 | `utils.js:portaledge ~3189` (executors `~3190, ~3264`; `.then ~3328`), `portaledgeOpponent ~3382` (`~3407`), `refillPortaledge ~3497` (`~3499`); `notif_climbingCards15And24Private ~11426` (`~11466`) | Await directly | E |
| P5.4 | State entry: the async blocks in `onEnteringState` for `resting` (`~1990`) and `selectPortaledge` (`~2183`) | The JS state classes await their own entry work | O |
| P5.5 | `notif_revealHeadwall ~12496` (`~12500`) | Await directly | E |
| P5.6 | `notif_riskShowAssets ~8445` (release inside `.then`, `~8527–8530`), `notif_riskReturnAssets ~8562` (`~8616–8625`) | Await the chains | E, O |
| P5.6 | `notif_confirmOpponentRequirements ~8768` (`~8805`), `notif_confirmYourRequirements ~8901` (`~8960`); `utils.js:notif_confirmRequirements ~2276` (`~2277, ~2310`) | Await directly | E |
| P5.7 | `utils.js:retractClimbingCard ~2870` (`~2871`), `discardClimbingCard ~2901` (`~2902`) | Await directly | E |
| P5.7 | State entry: un-awaited `retractClimbingCard()` for `discardAssets` (`~2097`), `selectOpponent` (`~2170`), `addAssetToAssetBoard` (`~2269`), `stealFromAssetBoard` (`~2298`) | The JS state classes await it. It also writes back a stale title (F11) | T, O |
| P5.8 | `notif_confirmAssetsForDiscardPrivate ~9382` (`~9433`), `notif_confirmAssetsForDiscardPublic ~9942` (`~9981, ~10315`), `notif_confirmAssetToAssetBoard ~10900` (`~10924`), `notif_confirmStealFromAssetBoardOpponent ~11040` (`~11065`), `notif_confirmStealFromAssetBoard ~11210` (`~11256`); `utils.js:parseClimbingEffect ~3073` (`~3074`) | Await directly | E |
| P5.9 | `notif_confirmRerackPublic ~12592` (release inside `.then`, `~12673–12684`), `notif_confirmRerackPrivate ~12726` (`~12820–12856`) | Await the chains | E, O |
| P5.9 | Un-awaited `onUndoSummitBeta()` in `notif_confirmRerackPublic` (`~12683, ~12721`), `notif_confirmRerackPrivate` (`~12855, ~12900`), `notif_confirmEnergyDrink ~12905` (`~12977`) and the Simul Climb branch of `notif_confirmYourAssets` (`~8438`) | Await it, or replace it with re-entry or the args refresh (D5, §4.1.1) | T, O (F11) |
| P5.9 | `utils.js:discardPlayedSummitBetaTokens ~4144` (executors `~4148, ~4192`; per-token chains `~4231–4233` that re-run the accumulated animations), `sbReshuffle ~4734` (`~4735`) | Await directly; one chain, not one per token | E, O, T (F11) |
| P5.10 | Un-awaited `onUndoSummitBeta()` in `notif_bomberAnchorCleanup ~12981` (`~13065`); the `riskSummitBeta` entry block (`~2380`) | As for P5.9; the JS state class awaits its entry work | T, O |
| P5.11 | `notif_matchingTechniques ~11863` (`~11881, ~11943, ~12001, ~12028, ~12062`), `notif_grantPermanentAssets ~12172` (`~12238, ~12292`), `notif_flipPlayedAssets ~12412` (`~12447`) | Await directly | E |

All 35 `new Promise(async …)` executors (22 in js, 13 in utils.js) and the five releases inside `.then` chains (FREEZE §6) appear above. P5.12 and P5.13 have none.

### 4.4 Dev snapshot and the registry of unresolved animation waits
- **Enabled only in development builds:** `getAllDatas` sends `dev: true` only when `getBgaEnvironment() === 'studio'` [Game.php doc:2098–2100; Debugging doc:383–391]. `DevTools.js` is loaded with a dynamic import only then.
- **`window.faSnapshot()`** returns JSON with the following. The source list is FREEZE §8.1, minus the framework internals:
  - game and framework state: state name and id, active player, `isCurrentPlayerActive`, `bgaAnimationsActive`, `document.visibilityState`;
  - the handler in flight (type, uid, elapsed) and the last N handled;
  - **pending animation waits** from the registry, with visibility at start and now, and the warnings since load;
  - the action bar (title, buttons, counters, messages, title owner);
  - the user-hideable containers (computed `display`, classes);
  - a model summary (hand ids, Asset Boards, resources, tokens);
  - the open popups and their outside-click registrations.
- **`faCheck()`** is the consistency check:
  1. It calls the Studio-only `debug_snapshot()`.
  2. The server sends the current player a private notification built by the same `StateView` as `getAllDatas`.
  3. The client diffs it against the model and the DOM, and prints the differences.
- **`faLog()`** dumps a ring buffer of handler start/end, animation start/settle/fallback, title writes and state enter/leave.
- **In production:** the registry and the warnings still run, because they are cheap and help bug reports. No global functions are exposed.

---

## 5. Server port and rules checking

### 5.1 Port rule
The port is structural: move, rename, adapt to the current APIs. Rules logic doesn't change. A discrepancy found while porting becomes a question for Jonathan that quotes `RULES.md` (with page) and the code location (`PROCEDURES.md` "When unsure"). Guide Mode (p. 18 onward) is out of scope.

### 5.2 When the check happens
- **P2:** per State class, for the state's own entry, exit and args.
- **P5(a):** per service, for the domain logic.
- Only the relevant `RULES.md` passages are read each time. The slice table in §2.3 lists the pages.

### 5.3 How it's recorded (decided; D11)
- **File:** `misc/docs/RULES_CHECK.md` (created in P0.1, seeded with the answers below), one section per state or domain.
- **Item fields:** id `R-n`, the `RULES.md` quote with page, the code location, the outcome, the status, the answer.
  - **Outcomes:** *discrepancy*, *rules silent* (implementation assumption), *implementation-only feature*, *suspected bug*.
  - **Statuses:** OPEN → ASKED → ANSWERED → FIXED in `<commit>`, or ACCEPTED.
- **What it records:**
  - Only deviations and silent areas. Matching rules are not restated, which keeps it from turning into a rules rewrite.
  - Decisions move to `DECISIONS.md`. Code changes follow only an answered item, in a `fix:` commit.
- The OPEN / ASSUMED / CLOSED idea is borrowed from claude-code-bga's `rules-clarification.md`, adapted: questions go to Jonathan, not to the game's authors.

### 5.4 Initial findings from this session
Read in code, not run. They were the first open questions. Jonathan answered Q-R1 to Q-R8 on 2026-10-21; the Status column below shows the outcome, and `RULES_CHECK.md` has the answers (`R-n` is Q-Rn).

| ID | Rules (`RULES.md`) | Code | Finding | Status |
|---|---|---|---|---|
| Q-R1 | No passage. "Bail" doesn't appear in `RULES.md` | `php:confirmBail ~1996`; `states ~81` | Implementation-only feature: lose 1 Water and 1 Psych, return to the previous Pitch, take no Assets in the next Rerack. Where does it come from (a publisher ruling?), and should it be recorded? | ACCEPTED. Garrett's rule; the code is the reference; for the rulebook revision (R-1) |
| Q-R2 | p.11: "Players who climbed in the Climb Phase draw 3 Cards…" | `php:stNextDraw ~5635–5686` | **Suspected bug [inferred]:** a bailed player is appended to `finished_drawing` twice (`~5636` and inside the switch), so when any player except the last bails, the last player in Rerack order never draws. Verify on Studio: 2 players, the first in Rerack order bails; expected, the other draws 3; predicted, the Rerack ends early. | Confirmed on Studio; fix in P0.2 (R-2) |
| Q-R3 | p.7: "Resting skips your turn in the Climb and Follow Phases" | `php:stMatchingTechniques ~5848`, `stFlagPermanentAssets ~6213` | Both loop over all players (only `stFlagPermanentAssets` skips zombies), and neither checks `rested`. A player who rested can be offered Permanent Assets, and may score a token-only technique match (see Q-R7), during a Follow Phase they should skip. | ACCEPTED. Departs from the p.7 wording; New Rubber to confirm in the Follow Phase check (R-3) |
| Q-R4 | p.5 (diagram note): Water and Psych tracks "each numbered 0–6" | `utils.php:updateResourceTracker ~532` | Phil's cap is 7. Does Phil's mat differ? | ACCEPTED. Phil's cap is 7 (R-4) |
| Q-R5 | p.8: "refill it with 7 more, using Cards from the discard pile" | `utils.php:drawFromPortaledge ~623–629`; `php:argSelectPortaledge ~5359–5386` | Rules silent when the discard holds fewer than 7 of that type. The code tops up from the asset deck. | ACCEPTED. For the rulebook revision; check the missing reshuffle in P5.4 (R-5) |
| Q-R6 | p.11: "If 4 of a kind are on The Spread, remove the last Card added and replace it…" | `php:setupNewGame ~419–430` vs `confirmAssets ~1086–1095` | At setup the removed card is shuffled back into the deck; during play it goes to the discard. Intended? | Unintended. Fix in P5.2 (setup path); check the during-play path in P5.3 (R-6) |
| Q-R7 | p.10: tokens "can be used instead of a Card when you match Technique symbols" | `php:stMatchingTechniques ~5876–5942` | A set made of 3 tokens and no card is offered as a match **[inferred; the allocation step wasn't traced]**. Intended? | ACCEPTED. Scores; trace the allocation step in P5.11 (R-7) |
| Q-R8 | p.15, Sendy Jammer: "only need 2 Cards with matching Technique symbols and any 1 Gear Card" | `php:stMatchingTechniques ~5896` (`is_pure_wild_on_empty`) | Only sets made purely of wilds are excluded, so 1 card + 2 Gear wilds appears to score **[inferred; the allocation step wasn't traced]**. Intended? | Answered. 1 card + 2 Gear wilds scores; wild-only sets must score too, so fix in P0.2 (R-8) |

**Server blind spots** (not rules questions):

| ID | Finding | Code | Proposed handling |
|---|---|---|---|
| B1 | `getAllDatas` writes globals, and game logic depends on one of those writes | `php:getAllDatas ~796` (`player_order`), `~830` (`asset_discard`); `php:stNextRound ~6506` reads `player_order` | Removed by `StateView` in P5.2(b) |
| B2 | `setGlobalVariable` builds SQL with unescaped JSON. A value containing `'` would break the query. Player names can't contain `'` (Q-T3), so that case can't arise through names; whether any other stored value can isn't checked | `utils.php ~36–37` | Removed structurally in P1.3 (side effect) |
| B3 | Thin server-side validation of client input: | | Client-sent player ids: P1.6–P1.9. Every other `act*` input is validated against `$args` in the slice that owns it, in separate `fix:` commits (D7) |
| | • `confirmAssets` trusts the deck count and the Spread card ids | `php ~1007–1050` | |
| | • `rest`, `passClimbingCard` and `confirmPermanentAssets` trust a client-sent player id | `action.php ~306, ~321, ~337` | |
| | • Bomber Anchor's sub-actions are possible actions in about a dozen states where they're needed only for Bomber Anchor, so a client can call `confirmPortaledge` directly | `states` | |
| B4 | Nested named functions break under namespaces | `php ~370–373`, `~4891` | P1.2 |
| B5 | `debug_goToState` is public with no guard, and is in the current production build | `utils.php ~929` | P0.2 (P1.1 checks that the guard is present) |
| B6 | Dead entries: `selectCharacter`, `confirmJesusPiece`, state 97 `testEnd`; an unused action parameter; a duplicate `case 10:` | `states ~32, ~279, ~294`; `action.php ~388`; `php ~5641` | P1.10, P2.6 |
| B7 | **Suspected bug [inferred]:** Simul Climb can't be used while choosing between the Crimper's two cards. The client enables it there (`js ~2397`), but state 60's possible actions lack `confirmAssets`, so the server should refuse it ("This game action is impossible right now"). Rules p.8: a Summit Beta token "You may use at any time on your turn". The same gap as the Bomber Anchor one fixed in `1aaad2b`. Verify on Studio: a Cool-Headed Crimper holding Simul Climb uses it while choosing | `states ~289–290` | P0.2: verify on Studio, then fix |
| B8 | **Latent bug:** Simul Climb runs the Rerack draw bookkeeping in `confirmAssets`: it removes the player from `rerack_1` and turns `x_cards` 1 into 3. That's harmless today, because the client keeps its stale "draw 1" and the server doesn't validate the count. It becomes visible with re-entry (D5) or with input validation (B3) | `php:confirmAssets ~1012–1020` | `fix:` commit before P5.9 uses re-entry in `drawAssets` |

---

## 6. Debug functions to replace the testing overrides

### 6.1 What the overrides force (uncommitted, `php:setupNewGame`)
As first read on 2026-10-15. Jonathan has edited the values since; the design below doesn't depend on them. They are set aside at the start of P0.2 (D4).
- **Climbing deck:** card `type_arg` 3 is put on top (`~307`, `~324`). There are commented slots for up to nine cards, inserted in reverse so the first ends on top (`~308–323`).
- **Summit Beta supply:** token 9 (Bomber Anchor) is put on top (`~338`, `~341`).
- **Characters:** character 10 is forced into `available_characters`, replacing the first one (`~728–731`). A commented block does the same for 12.
- **Shared objectives:** a commented line fixes `[16, 11, 10]` (`~453`).
- **Also commented** (not in the request): personal objectives (`~746–749`), a Spread test (`~403–416`), three starting cards per player (`~765–768`).

### 6.2 Debug functions
All of them are `#[Debug(reload: true)]` [Debugging doc:217–236]. The attribute is `Bga\GameFramework\Actions\Debug` [`_ide_helper.php ~15`]. Every one starts with the Studio-only guard (§6.4).

**`debug_setAvailableCharacters(string $ids)`**, for example `"10"` or `"10,12"`
- **When:** `characterSelection` only.
- **Effect:**
  - Each listed id not yet chosen replaces a random unlisted entry in `available_characters`. The count stays at the remaining selectors + 1.
  - It refuses ids already chosen.
  - It warns, without refusing, when two listed ids share a mat (`[1,2]`, `[3,4]`, …).
- **Why it works:** the reload re-renders the selection from `gamedatas.available_characters` (`php:getAllDatas ~818`).
- **Suits a debug function:** yes.

**`debug_stackClimbingDeck(string $typeArgs)`**, for example `"3,14,19"`, first = top
- **When:** any time.
- **Effect:**
  - Pulls each card from the climbing deck or the climbing discard and puts it on top in order, using the same `insertCardOnExtremePosition` as the override.
  - It refuses a card that is in play or in the crimper display.
- **Suits a debug function:** yes. It takes effect at the next draw.

**`debug_stackSummitBeta(string $typeArgs)`**, for example `"9"`, first = top
- **When:** any time.
- **Effect:** pulls each token from the supply or the Used pile onto the supply top; refuses tokens in a hand.
- **Phil:** Phil's two starting tokens are dealt when character selection ends (`php:stNextCharacterSelect ~5533–5594`). To control them, call this during `characterSelection`, before the last player confirms.
- **Suits a debug function:** yes.
- **Companion (Q-T7, decided yes):** `debug_giveSummitBeta(int $typeArg, int $playerId)` puts a token straight into a hand, which is faster for token tests.

**`debug_setSharedObjectives(int $first, int $second, int $third)`**
- **When:** before the first Climb Phase, that is `characterSelection` or round-0 `drawAssets`. At setup the trackers, The Elitist's +4 score and the objective statistics are initialized (`php:setupNewGame ~442–627`); climbs update them later.
- **Effect:**
  - Reverts the current set's setup effects (The Elitist's +4 and its statistic).
  - Runs `initSharedObjectives(ids)` (extracted in P1.1a).
  - Reloads, since `view.php` renders the objectives from the global (`view.php ~34–54`).
  - It refuses duplicates and ids outside 1–16, and warns about two sides of one token (`[1,2]`, `[3,4]`, …).
- **Suits a debug function:** yes, with that timing restriction.

**Extras** (Q-T6, decided yes):
- `debug_endGameSoon(int $playerId)`: sets the player's ropes so that the next climb triggers the end. It replaces the `testEnd` state (97).
- Tooling used in other steps: `debug_frameworkCheck` (P1.2), `debug_globalsShape` (P1.3), `debug_testNotifReject` (P4.2), `debug_snapshot` (P4.3).

### 6.3 For overrides that must run inside `setupNewGame`: a setup-overrides file (dropped, D4)
**Dropped** unless P1.1 finds an override the debug functions can't do. U8 and Q-T5 are then moot. The design is kept below in case P1.1 does find a gap.

This matches the current way of working (edit a file, deploy, create a table) without touching tracked files.
- **File:** `misc/local/setup_overrides.php`, gitignored. It returns an array, for example:
  `['climbing_top' => [3], 'summit_beta_top' => [9], 'characters' => [10], 'shared_objectives' => [16, 11, 10]]`
- **Read by:** `Rules\Setup`, only when `getBgaEnvironment() === 'studio'` and the file exists.
- **Why `misc/`:** it "won't be packaged for deployment" (`misc/README`).
- **[unverified U8]** Whether Studio's runtime can read files under `misc/`. **Check (P1.1):** a debug function reports `file_exists`.
- **Fallback location:** `modules/php/Local/` (gitignored). Then P7.4 deletes it from Studio before the release build.

### 6.4 Are debug functions Studio-only?
- **The docs don't settle it.** They describe the functions in "the debug menu of the Studio" [Debugging doc:230] and never say production refuses them.
- **claude-code-bga says the opposite:** `debug_*` functions "are public PHP, callable by any client that knows the name" (`debug-helpers.md`).
- **So every debug function starts with:**

  ```php
  if ($this->getBgaEnvironment() !== 'studio') {
      throw new \Bga\GameFramework\SystemException('Studio only');
  }
  ```

  `getBgaEnvironment()` is documented [Game.php doc:2098–2100].
- **This includes the existing unguarded `debug_goToState`** (B5), which is guarded in P0.2.
- Production can't be tested from Studio (U16). The guard makes the question moot. Asking BGA would settle it for the record.

---

## 7. BGA components: what is adopted, and when

The migration keeps the current appearance and behavior by default. **Decided (D8, 2026-10-21):** every row below is adopted. The last column gives the timing; the rows that were "Candidate" in the draft changed to "Adopt", and the "Not recommended" row stays out. Components adopted in P8 change appearance or schema on purpose, so they come after the parity-only migration (D10).

| Component (doc) | Could replace | Effort | Visual or behavioral change | Recommendation |
|---|---|---|---|---|
| `bga->globals` [Game.php doc:247] | the custom `global_variables` table | S | None | Adopt (P1.3) |
| `bga->notify`, `playerStats`/`tableStats` [Game.php doc:1071, 1374] | the deprecated calls | S | None | Adopt (P1.4) |
| `playerScore`/`playerScoreAux` [PlayerCounter and TableCounter doc:20] | 8 raw score SQL updates | S | None with a `null` message | Adopt (P1.4) |
| Deck through `deckFactory` [`_ide_helper.php ~2274`] | `getNew('module.common.deck')` | S | None | Adopt (P1.5) |
| `_private` notifications [Game.php doc:1144] | 15 public/private pairs and their client ignore predicates | M | None visible | Adopt (P5 slices) |
| `statusBar` [Game.js doc:1923–2052] | `addActionButton` (80 sites), title writes | M | None intended. Colors map 1:1; `autoclick`, `confirm` and `tooltip` options become available | Adopt as the API (P5.1) |
| `dialogs` [Game.js doc:1432] | `confirmationDialog` (4 sites) | S | None | Adopt (P3.4) |
| ItemManager [ItemManager doc] | the Deck plus 30 raw SQL queries | L | Schema change (an `order` column); typed values (ints where today's strings are) risk subtle comparison bugs [ItemManager doc:567] | Adopt in P8, before resubmission because of the schema change (D8) |
| PlayerCounter/TableCounter + `ebg.counter` [PlayerCounter and TableCounter doc; Counter doc] | panel numbers (Water/Psych, ropes, hand count, skills, techniques), round and phase | M | Counters animate changes (100 ms default); extra `setPlayerCounter` notifications | Adopt during the migration, in the P5 slices that own each counter (D8); fits §4.1 |
| BgaAnimations [BgaAnimations doc] | `moveToNewParent` and the 96 CSS keyframe animations | L | Different motion curves and timings; different z-index handling | Adopt in P8, per component (D8) |
| BgaCards [BgaCards doc] | hand, Spread, Portaledge, Asset Board card handling | L | Layout and selection styles change | Adopt in P8 (D8) |
| BgaDice [BgaDice doc] | the risk die (`js:notif_rollDie ~10713`) | M | Die look and animation change | Adopt in P8 (D8) |
| BgaScoreSheet [BgaScoreSheet doc] | the scorecard (`utils.js:toggleScorecard ~1801`) | M | End-of-game presentation | Adopt in P8 (D8) |
| Zone [Zone doc] | several meeples on one summit (T25) | S | How stacked meeples are laid out | Adopt during the migration, in the slice that fixes T25 (P5.5), as its fix (D8) |
| Last-turn banner [Game.js doc:1335] | the game's own final-round display | S | A different look | Adopt in P8 (D8) |
| BgaAutofit | already used (`js:18`) | — | — | Keep |
| BgaZoom, BgaJumpTo, Scrollmap, Draggable, ExpandableSection | nothing equivalent today; zoom is discouraged [UX guidelines:120–150] | — | — | Not recommended |

---

## 8. Regression strategy

### 8.1 IDs
**TODO items (`TODO.md`, in file order):**

| ID | Item | ID | Item |
|---|---|---|---|
| T1 | Summit Beta token looks selectable on the opponent's turn | T17 | Bomber Anchor in `chooseSummitBetaToken`: a pitch drawn in front of the token |
| T2 | Rerack box proportions on mobile | T18 | "Hide card(s)" untranslated comparison |
| T3 | Permanent-asset tokens jump on mobile | T19 | `refillPortaledge` first-step card backs |
| T4 | Scorecard responsiveness | T20 | Card-49 race |
| T5 | `asset_hand_to_board` z-indices | T21 | Hidden Portaledge or crimper display should reappear before animating |
| T6 | Dark-mode colors (3 items) | T22 | Benighted technique-token card discarded too early |
| T7 | Crimper Confirm hides the popup | T23 | SQL strict-mode game creation |
| T8 | Phil and Summit Beta tokens after confirming a pitch (Jumar, Extra Water) | T24 | `utils.php` vs `Utils.php` casing |
| T9 | `onSelectResource` math when risking | T25 | Summit meeple overlap (forest board) |
| T10 | Phil, Trifecta and Guidebook requirement switching | T26 | Bomber Anchor in `selectPortaledge` and `riskSummitBeta` |
| T11 | Guidebook must deselect after a failed climb | T27 | Trade after confirming a pitch |
| T12 | Wrong card in front during Asset Board discard | T28 | Dirtbag / Black Elk / Jumar scenario |
| T13 | Water/Psych red border pop-in | T29 | Player id length assumptions |
| T14 | Trifecta drawer "undefined" | T30 | Toggle-button vestiges |
| T15 | Crag Dog: 0 → −1 Psych on the client | T31 | Reference card: a resting climber lays down the meeple |
| T16 | Spectator: `asset_display_to_board` snaps | T32 | Implicit globals |

**Freeze scenarios (`FREEZE_INVESTIGATION.md`):**

| ID | Scenario |
|---|---|
| F1 | S1, watcher: the Portaledge is hidden during an opponent's rest (§8.0 #1a, #1b) |
| F2 | S1, active player: rest or trade with the Portaledge hidden (#2) |
| F3 | S1, Bomber Anchor with the Portaledge hidden (#3, §8.4 retry) |
| F4 | S2: Rerack, Simul Climb or Bomber Anchor in `climbOrRest` (#4, §8.4 variants) |
| F5 | S3: Bomber Anchor → hand click → Undo Token, then the next Portaledge window (§8.4) |
| F6 | S4, crimper watcher with `#crimper_display` hidden (#6) |
| F7 | S4, `#climbing_slot` hidden, then `cleanUpClimbOrRest` |
| F8 | S1 click-time variant: Bomber Anchor during your own rest without hiding |
| F9 | S5: ignored + dynamically synchronous notifications |
| F10 | S6: log formatting throws (names with `-` and, if Studio allows them, accents; unknown ids). Player names can't contain `'` (Q-T3) |
| F11 | S7: concurrency (`onUndoSummitBeta` not awaited; card-49 double Portaledge; duplicate token chains; `retractClimbingCard`'s stale title) |
| F12 | `shareEffect*` releases only for card 49 |
| F13 | The replay check: a replay that includes a rest, with no fallback warnings |

### 8.2 Tools
- **Studio playtests** with one browser tab per player (the red arrow or `testuser` [Tools doc:21–24]) and a spectator tab.
  - Express-start tables are real-time and are abandoned when no client stays on the page. Keep every player's tab open (a claude-code-bga pitfall).
- **Save and restore** [Tools doc:40–52; Debugging doc:24–28]:
  - three slots per table;
  - restore doesn't work after the game ends, nor across tables;
  - save just before a scenario's critical action, and replay it after each client-only change in the same step. After a schema or state change, use a new table.
- **Debug functions** (§6) build the scenarios: token and card stacks, characters, objectives, the end-game shortcut.
- **Browser harnesses** in `misc/tests/`, served with `py -m http.server`, for isolated modules:
  - Animations, Notifications, StatusBar, Log formatting, and later the requirement checker;
  - they continue the 2026-10-14/15 harness practice, now tracked in git (Q-T4, decided yes).
- **The dev snapshot and consistency check** (§4.4), plus console watches for `[FA animation fallback]`, `[FA notif error]` and `[FA notif backstop]`.
- **Studio's Input/Output debugging section** [Tools doc:54–61] to confirm which notifications reached a client.
- **The gate:** Jonathan's playtest on Studio remains the gate for every commit.

### 8.3 R-full (P4.4–P4.6, P7.3, and the end of each slice for its own domain)
- Complete games with 2, 3, 4 and 5 players, on both boards.
- Each character and each Summit Beta token.
- The crimper.
- Risk it: every die face, plus a failure and retreat.
- Bail, trade, card 49, Headwall reveal, game end and a tie.
- Spectator view, replay, phone viewport, dark mode, a zombie player.
- Studio's minified-JS test (P7.3 only).

### 8.4 Mapping: where each item is fixed or re-verified

| Item | Steps | Item | Steps |
|---|---|---|---|
| T1 | P5.9 | T17 | P5.8, P5.10 |
| T2 | P5.9 | T18 | P5.7 |
| T3 | P4.1, P5.11 | T19 | P5.4 |
| T4 | P5.12 | T20 | P4.1 (warnings), P5.4 (race) |
| T5 | P4.1, P5.3 | T21 | P5.4, P5.7 |
| T6 | P5.1, P5.4 | T22 | P5.8 |
| T7 | P5.7 | T23 | P1.2, P1.3 (folded into P1 by D9) |
| T8 | P5.6, P5.10 | T24 | P1.2 |
| T9 | P5.6 | T25 | P5.5 |
| T10 | P5.6 | T26 | P1.9 (first run), P5.10 |
| T11 | P5.6, P5.10 | T27 | P5.6 |
| T12 | P4.1, P5.11 | T28 | P5.6, P5.10 |
| T13 | P5.6 | T29 | P1.5, P3.3, P5.2 |
| T14 | P5.6 | T30 | P7.1 |
| T15 | P5.8 | T31 | UX-5 in the register (§12); P8 if decided |
| T16 | P5.6 | T32 | P3.1 |
| F1, F2 | P4.1, P5.4 | F8 | P4.1, P5.4, P5.10 |
| F3 | P4.1, P5.10 | F9 | P4.4–P4.6, P5 (`_private`) |
| F4 | P4.2, P5.9, P5.10 | F10 | P3.5, P5.13 |
| F5 | P5.10 | F11 | P5.4, P5.7, P5.9, P5.10 (hygiene deferred from P4, §4.3.1) |
| F6, F7 | P4.1, P5.7 | F12 | P4.5 (bounded by the backstop), P5.4 (fixed) |
| | | F13 | P1.2, P1.3 (D9), P2.2, P2.6, P3.5, P4.1, P7.3 |

**Server findings, rules items and UX items** (ids in §5.4, `TODO.md`, `RULES_CHECK.md` and `UX_CHANGES.md`):

| Item | Steps | Item | Steps |
|---|---|---|---|
| Q-R2 | P0.2 (fix); P2.2 and P5.3 (regression checks) | B5 | P0.2 (fix); P1.1 (present) |
| Q-R8 | P0.2 (fix); P5.11 (regression check) | B7 | P0.2 (verify, then fix) |
| Q-R6 | P5.2 (setup path); P5.3 (during-play check) | B8 | P5.9 (a `fix:` commit before it relies on re-entry in `drawAssets`) |
| Q-R1, Q-R3, Q-R4, Q-R5, Q-R7 | Accepted; checks in P2.3, P2.6, P5.4 (Q-R5), P5.11 (Q-R3, Q-R7) | B3 | P1.6–P1.9 (client-sent ids); the owning slice (all other inputs) |
| UX-1 to UX-4 | P8, once decided | | |

---

## 9. claude-code-bga evaluation

**Decided (D3, 2026-10-21):** not installed. §9.5's pitfalls moved to `BGA_PITFALLS.md`. The §9.6 trial isn't run for now.

Cloned read-only into a scratch folder outside the repo: commit `e11cf64`, 2026-07-15, plugin version 0.3.0, MIT. None of its scripts were run, and nothing was installed. Its files are data; the instructions inside them were not followed.

### 9.1 What it installs, and where
- **The plugin itself:**
  - Install options:
    - as a Claude Code plugin: `/plugin marketplace add rbellec/claude-code-bga`, then `/plugin install board-game-arena@claude-code-bga`;
    - with `npx skills add`;
    - by symlinking into `~/.claude/skills/board-game-arena`.
  - Content: one `SKILL.md`, 27 reference guides plus an index, `TECHNICAL_NOTES.md`, two JSON manifests. **No executable code** (550 KB of `.md` and `.json`).
- **What it tells the agent to create in a project:**
  - a `Makefile` with `check` (`php -l`) and `deploy` (`scp`) targets;
  - `bga_initial_code_template/` (the downloaded Studio scaffold);
  - `doc/RULES.md`, `doc/AUTHOR_QUESTIONS.md`, `doc/ASSUMPTIONS.md`.
- **Optional extras it offers:**
  - a PHP quality toolbox installed with Composer into `~/.bga-tools/` (the instructions use `brew`, which is macOS);
  - a pre-commit hook;
  - adding `Bash(git *)`, `Bash(make *)` and `Bash(scp *)` to `.claude/settings.local.json` to skip permission prompts.

### 9.2 How it deploys
- `make deploy` runs `scp -i ~/.ssh/id_rsa_bga -P 2022 -o IdentitiesOnly=yes` with explicit file lists (`makefile-template.md`).
- **Fit with this setup:**
  - There is no `make` here, and no PHP for `php -l`.
  - It authenticates with a key *file* (`-i`). Here the key lives in the Windows OpenSSH agent, and Git Bash's `scp`/`ssh` don't use that agent by default.
  - Windows' own `C:\Windows\System32\OpenSSH\sftp.exe` (OpenSSH 9.5p2, present) does use it.
- **Credentials:**
  - The Makefile holds the username and the key path, not secrets.
  - It is committed in the skill's model. Here, per-user values belong in an untracked file, consistent with `.vscode/sftp.json`.
  - The skill does say never to read the private key.

### 9.3 What it does in the browser (Claude in Chrome)
- **Creating test tables:**
  1. Navigates to the Studio lobby and clicks "Play with friends", then "Create", with injected JavaScript.
  2. Overrides `window.confirm` to click "Express start".
  3. Goes to the player view, with one tab per player via `testuser`.
- **Reading errors:** the console.
- **Quitting tables:** `gameui.ajaxcall('/table/table/quitgame.html', …)`, or "Express stop" with `confirm` overridden.
- **The debug panel:** drives Studio's state jump by setting the input's value from JavaScript.
- **Management page:** clicks "Reload game informations", "Reload statistics" and "Reload game options" on the `studiogame` page.
- **Outside the normal loop** (reactivated-project recovery): "Overwrite working copy", "Create a new game project" and "Commit my modifications now".
- None of this uses the build or release controls, but several actions are state-changing management actions.

### 9.4 Conflicts with this repo's docs and procedures
1. **Commits:**
   - It says "Commit automatically after each completed step" with `git add -A`.
   - `PROCEDURES.md` says commit only after Jonathan's playtest, and stage by explicit path.
2. **Doc layout:**
   - It uses `doc/RULES.md`, `AUTHOR_QUESTIONS.md` and `ASSUMPTIONS.md`.
   - This repo uses `misc/docs/`, `DECISIONS.md` and questions to Jonathan.
3. **Scaffold folder:** it adds `bga_initial_code_template/` to the project, which isn't needed for a legacy project.
4. **Deploy:** the Makefile + `scp -i` model doesn't fit Windows with the OpenSSH agent and VS Code SFTP.
5. **Permissions:** blanket Bash allow rules conflict with "stop and wait for confirmation before anything destructive".
6. **Framework claims that contradict this repo's current docs:**

   | The skill says | The docs here say |
   |---|---|
   | A State constructor takes only id and type: "no name, description, or transitions" | Those are documented parameters, and `descriptionMyTurn` is mandatory for active states [States doc:36–46, 77, 180] |
   | `modules/php/material.inc.php` is auto-included | Only the root `material.inc.php` is [Material doc:7, :200] |
   | "onEnteringState is NOT called after setup" | It is called after `setup` on a refresh [Game.js doc:62] |
   | `addActionButton` has no documented `confirm` or `tooltip` option | `statusBar.addActionButton` documents both [Game.js doc:1949–1965] |
   | Never pass a transition name to `setPlayerNonMultiactive` | It accepts "transition name, state id, or State class name" [Game.php doc:465–469] |
   | No comments anywhere in `dbmodel.sql` | Only comments on the same line as code are a problem [dbmodel doc:111–119]; this repo's file has full-line comments and works |
   | `self::` calls make PHP 8.4 print warnings that corrupt JSON | Doubtful **[unverified]**: this code makes 310 such calls on Studio's PHP today without visible warnings. P1.5 converts them anyway, for consistency |

### 9.5 Pitfalls worth keeping
Moved to `misc/docs/BGA_PITFALLS.md` (D3, 2026-10-21): Studio file hygiene, test-table friction, PHP and database, zombies and states, the client, and limits.

### 9.6 Scoped trial (kept as reference; not run for now, D3)
D3 (2026-10-21): the trial isn't run for now. Revisit it if manual deploy-and-test cycles become tedious. The proposal below is unchanged.

**Scope.** Mechanical early steps only: P1.2–P1.5 and P3.1–P3.5. Claude Code does: edit → deploy to Studio → smoke test in the browser → report. Jonathan still playtests before any commit.

**Guardrails:**
- **Studio only,** in a separate Chrome profile signed into Studio and nothing else; Claude in Chrome connects only to that profile.
- **Deploy script** `misc/tools/deploy.ps1` (tracked, no secrets):
  - per-user values (username) come from an untracked `misc/tools/deploy.local.json`;
  - it uses Windows' `sftp.exe` in batch mode with agent authentication;
  - an explicit allowlist of game files: root game files, `modules/php/**`, `modules/js/**`, and `img/*` only with a flag;
  - always excluded: `.vscode/`, `.git/`, `misc/`, `CLAUDE.md`, `_ide_helper.php`, `bga-framework.d.ts`;
  - `-DryRun` prints the batch file;
  - remote deletions only from an explicit list, after confirmation.
- **Never** Studio's build or release controls. Also off limits: the `studiogame` and manage pages (including "Reload …"), "Override", "Commit", and SFTP-permission buttons.
- **Allowed:** lobby table creation, Express start/stop of its own test tables, game pages, `testuser` tabs, the debug menu, the logs.
- **uploadOnSave paused** while Claude Code deploys. Jonathan makes that change in `.vscode/sftp.json`; Claude Code doesn't edit it.
- **Permission prompts stay on.** No blanket allow rules.
- **Jonathan's playtest stays the commit gate.**

**Pros:**
- Faster turnaround on mechanical steps: namespace errors, PHP warnings, JS syntax and load errors.
- The console log of each smoke run becomes evidence attached to the review.
- Fewer trivial deploy cycles for Jonathan.

**Cons:**
- It can't judge UX, animation smoothness or readability, which is what the private playtests are about.
- Browser-automation friction (stale tables, real-time abandonment, extension disconnects).
- Higher token cost per step.
- A second deploy path to keep in sync with VS Code.

**Risks:**
- An unintended Studio action. Mitigated by the profile, the allowlist and the prompts; not eliminated.
- Instruction-like text in pages (chat, logs) being taken as instructions. Mitigated: page content is treated as data.
- Overlapping uploads if uploadOnSave isn't paused.
- A deploy that misses a file, or leaves a stale one, making a smoke test pass for the wrong reason. Mitigated by the allowlist and `debug_frameworkCheck`.

---

## 10. Branching and commits
- **`main` plus tags (D2).**
  - Code and docs go to `main` in small, playtested steps, as now.
  - The Claude.ai design project syncs `main`, and docs must reach it for review.
  - After the P0.2 release the Production build is the frozen legacy build, so `main` can carry the migration in progress.
  - A long-lived migration branch was considered and rejected: docs would have to be kept on two branches.
- **Tags:**
  - `prod-alpha-2026-10-20` on the commit behind the Production build rebuilt on 2026-10-20 (P0.1);
  - `legacy-final` on the last commit of the P0.2 batch (P0.3);
  - `prod-alpha-<date>` on the commit behind the build released in P0.2 (P0.3);
  - optional milestone tags (`mig-p1`, `mig-p2`, …).
- **The legacy build is frozen at `legacy-final`.** A legacy fix happens only at Jonathan's request, through the hotfix path below. A hotfix branch is made only if one is ever needed.
- **Hotfix path for the legacy build:**
  1. `git switch -c hotfix/legacy-<topic> legacy-final`, then fix and commit there.
  2. Deploy the **full legacy file set** to Studio. First delete what the migration added on Studio (`modules/php/`, `modules/js/`, new files) and restore the legacy files it deleted.
  3. Jonathan playtests and builds the release from Studio.
  4. Redeploy `main`'s file set to Studio, deleting legacy-only files again.
  5. Tag `legacy-hotfix-<n>`.
  6. The hotfix branch is not merged into `main`, since the code has diverged. If the bug also exists in the migrated code, `main` gets its own `fix:` commit that references the hotfix. Both go in `progress.md`.
  7. Studio's own SVN [Tools doc:188–190] can snapshot Studio before step 2 as a backstop **[the "Commit my modifications now" button is described by claude-code-bga, not in this repo's docs]**.
- **Commit kinds:**
  - `struct:` (behavior-preserving), `fix:` (references a T, F or B id), `ux:` (references a UX id), `tool:` (debug and dev tooling), `docs:`.
  - Never mixed in one commit (`PROCEDURES.md` "Commits").
- **Bugs fixed as a side effect of migrating code:**
  - If the current API itself removes a bug in a 1:1 port (for example `bga->globals` quoting, B2), the fix may stay in the `struct:` commit. It is listed under "Side effects" in the commit message and in `progress.md`, and its `TODO.md` item is removed in a docs commit.
  - If the fix needs any code beyond the port, it is a separate `fix:` commit in the same step, after the structural commit, playtested on its own.
- **Staging and pushing:**
  - Stage by explicit path; one commit per concern.
  - Push (normal push) after Jonathan approves.
  - Each session writes a `progress.md` entry, and the plan's step status is updated in `MIGRATION_PLAN.md` through `docs:` commits.

---

## 11. End of the review phase

The review phase ends when:
1. Jonathan has approved this plan (with revisions) and recorded D1–D14 in `DECISIONS.md` (P0.1);
2. the final legacy fix batch is done and released (P0.2);
3. the tags exist and the working tree is clean (P0.3).

T23 and F13 are no longer conditions: D9 folded them into P1.

**Draft "Current phase" text for `PROCEDURES.md`** (adapted to the decisions; applied in P0.3, not before):

> ## Current phase: migration
> Code changes are made only as steps of `misc/docs/MIGRATION_PLAN.md`, one step per session, in plan order unless Jonathan reorders them. Each session names its step ID at the start. Editing a file outside the step's "Files" list needs Jonathan's go-ahead. P8's steps are written in its own planning session after P7.
>
> Structural, fix, UX and tooling changes go in separate commits (see "Commits"). Commit after Jonathan's Studio playtest of the step; push after Jonathan approves.
>
> The migration (P0–P7) is parity only (`DECISIONS.md`, D10): decided UX changes from `misc/docs/UX_CHANGES.md` are implemented in P8, not opportunistically. The exceptions are listed in D10.
>
> `TODO.md` bugs are fixed in the slice that owns them (`MIGRATION_PLAN.md` §8.4), not opportunistically.
>
> The legacy build is frozen at tag `legacy-final`. A legacy fix happens only at Jonathan's request, through the hotfix path in `MIGRATION_PLAN.md` §10 (a branch from `legacy-final`, D2).
>
> Review-only sessions (planning, investigation) stay docs-only.

The "Scope before migration" section would then become history: moved into `progress.md` or deleted.

---

## 12. UX changes: the register, and when they are implemented

**Register (D10):** `misc/docs/UX_CHANGES.md` (created in P0.1). Each entry has:
- an id `UX-n` and a date;
- the source: private playtest, BGA review, Garrett, or Jonathan;
- the observation and the proposal;
- the decision: who decided, and when;
- the status: proposed → decided → scheduled (step) → done (commit), or rejected;
- the affected component or slice;
- before and after;
- the playtest check.

**Scheduling rule (D10, decided 2026-10-21):**
- The migration (P0–P7) is parity only. Only *decided* items are scheduled, and they are implemented in P8 (§2.3), after the components' structure has settled, so each change is made once.
- Exceptions:
  - D6's failure message (P4.2);
  - fixes for visible `TODO.md` bugs (for example T6), which stay in their slices as `fix:` commits;
  - the two D8 components listed for the migration (PlayerCounter/TableCounter, Zone).
- If a decided item would change a component's structure, the owning slice notes it in the entry's "Affected component" field (P5 sub-step e), so the component doesn't block it later. The item itself is still implemented in P8.
- An urgent item goes through the legacy hotfix path (§10) instead.
- UX changes are always separate `ux:` commits with their own playtest.
- Proposed in the draft: decided items implemented in the owning slice (P5 sub-step e). D10 replaced that with P8.

**Inputs moved into the register (Q-P1, 2026-10-21):** the BGA review feedback that was at the top of `TODO.md` became UX-1 (tooltip positioning), UX-2 (round information in the Action Bar), UX-3 (refresh and continuity) and UX-4 (obvious card and deck interactions), and T31 became UX-5. All are "proposed"; moving them decided nothing.

---

## 13. Decisions and questions

Everything below was decided or answered on 2026-10-21. The decisions D1–D14 are recorded with their reasons in `DECISIONS.md` ("Migration plan decisions (D1–D14)"). This section keeps the pointers and what the draft had considered.

### Decisions (D)
- **D1 Approach and order:** as the plan proposes (Summary, §1, §2).
  - Alternative considered: client first. It would reach the freeze-related code sooner, but P1's debug functions, which set up client test scenarios, wouldn't exist yet.
- **D2 Branching:** `main` plus tags. A hotfix branch is made from `legacy-final` only if a legacy hotfix is ever needed (§10).
  - Alternative considered: a long-lived migration branch.
- **D3 claude-code-bga:** not installed. Its applicable pitfalls are in `BGA_PITFALLS.md`. The §9.6 trial isn't run for now (§9).
- **D4 Testing overrides:** replaced by the debug functions of §6.2, including `debug_endGameSoon` and `debug_giveSummitBeta`. The setup-overrides file (§6.3) is dropped unless P1.1 finds a gap. The overrides are set aside at the start of P0.2.
- **D5 No-transition flows:** a server self-transition where §4.1.1 and the P5.1 check say re-entry is safe, and an args-refresh notification elsewhere. If the P5.1 check shows re-entry has player-visible side effects, it goes to Jonathan as a UX question.
  - Alternative considered: keep today's client-side restoration, done through `StatusBar.restore()`.
- **D6 Handler failures:** the player sees a short non-blocking message, besides the console log and the re-render. The wording is translatable, and Jonathan approves it in P4.2 (§4.3).
- **D7 Server-side input validation (B3):** client-sent player ids are fixed in P1.6–P1.9. Every other `act*` input is validated against `$args` in the slice that owns it. There is no later dedicated pass.
- **D8 Components:** every row of §7 is adopted.
  - During the migration: PlayerCounter/TableCounter, in the P5 slices that own each counter; Zone, in the slice that fixes T25, as its fix.
  - In P8, before resubmission: ItemManager, BgaAnimations (per component), BgaCards, BgaDice, BgaScoreSheet and the last-turn banner.
- **D9 Pre-migration leftovers:** the SQL strict-mode fix (T23) and the replay check (F13) are folded into P1 (P1.2, P1.3).
- **D10 UX register:** `UX_CHANGES.md`, with the scheduling rule in §12. The migration is parity only; decided items are implemented in P8.
- **D11 Rules-check record:** `RULES_CHECK.md`, in the format of §5.3, seeded with the answers to Q-R1–Q-R8.
- **D12 Private-alpha tables:** no formal cut-over. Jonathan releases only when no table is running. After resubmission every release must keep running tables working (§2.4).
- **D13 Local tooling:** harnesses are served with `py -m http.server`. A PHP CLI (the BGA docs name PHP 8.4) is installed in P0.2 for `php -l`, with Jonathan's confirmation in that session.
- **D14 Resubmission milestone:** after the full plan, including P8: the decided UX changes and the components adopted there.
  - Options considered in the draft: A, after P4; B, after the slices holding the bugs a reviewer is most likely to hit; C, after the full plan (P7); D, gated on readiness (the usability pass, P4 and B's bugs). The earlier decision in `DECISIONS.md` was C.
  - What carries over from the draft's analysis:
    - Resubmitting means releasing the migrated build to Production.
    - After that release, every later release must keep running tables working: the same state ids and global data, or an `upgradeTableDb` migration (D12).
    - The reviewer's main blocker is readability. The request was a usability-testing pass with new players on desktop and mobile, which this plan doesn't cover: it lives in the UX register (§12). The UX changes decided from that pass belong in P8.

### Rules questions (Q-R)
Answered on 2026-10-21. The answers, statuses and code locations are in `RULES_CHECK.md` and in the Status column of §5.4.
- **Q-R1** Accepted. Garrett's rule; the code is the reference; for the rulebook revision.
- **Q-R2** The bug is confirmed. Fixed in P0.2.
- **Q-R3** Accepted. Players who rested take part in the Follow Phase steps as the code does. It departs from the wording of p.7, and New Rubber's handling is to be confirmed.
- **Q-R4** Phil's cap is 7. Accepted.
- **Q-R5** Accepted. The code tops up from the Asset deck; the missing reshuffle is checked in P5.4; for the rulebook revision.
- **Q-R6** Unintended. Fixed in P5.2, with the during-play path checked in P5.3.
- **Q-R7** Accepted. A set of 3 Technique Tokens with no card scores.
- **Q-R8** 1 card plus 2 Gear wilds scores. Wild-only sets must score too; fixed in P0.2.

### Technical questions (Q-T)
- **Q-T1** Answered: the Production build rebuilt on 2026-10-20 is the committed code. Tagged `prod-alpha-2026-10-20` in P0.1.
- **Q-T2** Answered by D12: Jonathan takes part in most private playtests, they are real-time, and he releases only when no table is running.
- **Q-T3** Answered: BGA profile names can't contain apostrophes but can contain dashes. Whether they can contain accents is unknown. So test names with `-` (B2, F10); the apostrophe case can't arise through player names.
- **Q-T4** Answered: yes, harness files are tracked under `misc/tests/` (not packaged for deployment). P4.1 creates the first one.
- **Q-T5** Moot (D4): the setup-overrides file is dropped unless P1.1 finds a gap.
- **Q-T6** Yes: `debug_endGameSoon`, which replaces the `testEnd` state.
- **Q-T7** Yes: `debug_giveSummitBeta`, in addition to `debug_stackSummitBeta`.

### Process questions (Q-P)
- **Q-P1** Yes. The BGA review feedback and T31 moved into the UX register as UX-1 to UX-5, status "proposed" (§12).
- **Q-P2** Confirmed. The review format for code steps is as described in §2.1: chunks of a few hundred lines with a summary of intent, the residual diff for verbatim moves, and pattern/count/exceptions for sweeps.
