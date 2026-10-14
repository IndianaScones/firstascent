# Decisions



The reasoning behind key project decisions. Update this file when a decision changes.



## People and ownership

Jonathan (BGA: IndianaScones) develops First Ascent for BGA; Garrett is the game's publisher. BGA's reviewer (Ian) judged the game not ready for Alpha, mainly for overall UX readability, and requested usability testing with new players. UX and usability decisions belong to Jonathan and Garrett. Claude helps discuss and implement them.



## Migrate to the current BGA framework

The codebase uses the legacy framework (partly deprecated) and has no class structure. Migration and the class restructure are one effort: the current framework's class-based structure provides most of the restructuring. Resubmission to BGA waits until after the migration (expected: roughly a couple of weeks, depending on availability).



## Most bugs are deferred to the migration

Client-side visual and interaction bugs live in code being rebuilt, so fixing them in legacy code is wasted effort. Detailed reproduction steps in TODO.md serve as regression tests for the migrated code. Before migrating, only two things are done: fixing the SQL strict-mode game creation issue, and the freeze investigation with its two targeted fixes (see below).



## The freezes are the top priority

The game intermittently freezes just before or after animations, at very common points that work more than 90% of the time. Usually there are no console errors, and a refresh always fixes it (server state fine, client stuck). In Jonathan's experience, similar bugs in this codebase have almost always been latent client state: something earlier leaves state behind that a later, ordinary action trips over, so the cause is likely unrelated to where the freeze appears. Timing, input, and browser behavior are possible but much less likely.



Conclusions (October 2026, from a review-only investigation plus targeted playtests; details in FREEZE_INVESTIGATION.md). There are two classes of freeze, and each strands one client's notification queue:
- **Silent:** a notification handler awaits an animation that can never end, so it never releases the queue and the console stays clean. The animation can't end because its element or a container is hidden, the animation class is already on the element, or the element has been removed. One ordinary click hides the portaledge or the crimper display. Confirmed for a hidden portaledge (watcher and active player; rest and trade) and a hidden crimper display.
- **Loud:** an exception before the handler's release call, which prints `Uncaught (in promise)`. Confirmed for `$('trade_button')` being null after a Summit Beta token is used in the Climb Phase.

The suspicion of latent client state was right, but the state lives in the DOM (container visibility, leftover animation classes) that a handler waits on. It is not a flag gating the queue.



Decisions:
- **The freeze investigation is closed for the legacy code.** The migration replaces this code, so hunting for more instances has diminishing returns. The class-level understanding is what the migration needs.
- **Step-2 diagnostic tooling (snapshot, framework wrappers, throwaway branch) is dropped for the legacy code,** for the same reason. Its useful ideas, a dev-build state snapshot and a registry of unresolved animation waits, move into the migrated code.
- **Two targeted fixes go into the legacy code anyway,** because other people will playtest the legacy build before the migration ships. Both are relatively simple:
  - a fallback in `animationPromise` that settles any animation wait that can't complete and logs a warning each time. It closes the whole silent class, including instances not yet found;
  - null guards at the three confirmed `trade_button` sites.
- **Every other bug found stays deferred to the migration.** That includes the Bomber Anchor click-time errors, the uncapped Portaledge draws and the rest of TODO.md.



Principles for the migration:
- The client renders from authoritative server state rather than accumulating step-by-step changes.
- A state snapshot/consistency check stays permanently available in development builds. It includes a registry of unresolved animation waits.
- Every awaited animation must settle. Animation helpers resolve, with a warning visible to developers, when the element isn't rendered, the animation never starts, or it is cancelled. They also have a timeout backstop.
- A notification handler error must never strand the notification queue silently. In the current framework, `setupPromiseNotifications` removes the manual release call. But the notification still ends only "when the promise AND the minimum durations are over" (Game.js doc, `setupPromiseNotifications`, `bga/current/game-files/Game interface logic_ Game.js - Board Game Arena.md`:1000). So a handler promise that never settles still blocks the queue, and whether a rejected one ends it isn't documented. Handlers must be written so they always settle.
- Awaited animations must never depend on whether a container is currently visible. Whether the player can hide containers such as the portaledge is a UX decision (Jonathan's and Garrett's); the code must work either way.



## Guide Mode is not implemented

Guide Mode (the simplified rules in RULES.md p. 18 onward) will not be implemented; there are no plans for it. Reason: publisher decision. The implementation follows the standard rules only, so a difference from Guide Mode is never a bug.



## Workflow

A Claude.ai design project handles architecture, strategy, bug priorities, evaluation of Claude Code's output, and writing prompts for Claude Code. It has read-only access to the repo via GitHub sync. Claude Code works in the repo. The repo is the single source of truth: decisions made in design discussions are written into repo docs through Claude Code. Model guidance: Opus for investigation, architecture, and migration planning; Sonnet for carrying out well-specified steps.



## To evaluate before migration begins

claude-code-bga, a community Claude Code skill (MIT, not BGA-affiliated) for the current framework, linked from the BGA wiki page "Using AI for BGA game development." It offers migration experience, a documented list of BGA pitfalls, and an automated deploy-and-test loop via Claude in Chrome. Review it before installing, and keep SFTP credentials out of git.

