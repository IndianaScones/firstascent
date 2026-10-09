\# Decisions



The reasoning behind key project decisions. Update this file when a decision changes.



\## People and ownership

Jonathan (BGA: IndianaScones) develops First Ascent for BGA; Garrett is the game's publisher. BGA's reviewer (Ian) judged the game not ready for Alpha, mainly for overall UX readability, and requested usability testing with new players. UX and usability decisions belong to Jonathan and Garrett. Claude helps discuss and implement them.



\## Migrate to the current BGA framework

The codebase uses the legacy framework (partly deprecated) and has no class structure. Migration and the class restructure are one effort: the current framework's class-based structure provides most of the restructuring. Resubmission to BGA waits until after the migration (expected: roughly a couple of weeks, depending on availability).



\## Most bugs are deferred to the migration

Client-side visual and interaction bugs live in code being rebuilt, so fixing them in legacy code is wasted effort. Detailed reproduction steps in TODO.md serve as regression tests for the migrated code. Before migrating, only two things are done: fixing the SQL strict-mode game creation issue, and investigating the freezes.



\## The freezes are the top priority

The game intermittently freezes just before or after animations, at very common points that work more than 90% of the time. There are no console errors, and a refresh always fixes it (server state fine, client stuck). In Jonathan's experience, similar bugs in this codebase have almost always been latent client state: something earlier leaves state behind that a later, ordinary action trips over, so the cause is likely unrelated to where the freeze appears. Timing, input, and browser behavior are possible but much less likely.



Approach: a review-only investigation focused on latent state (FREEZE\_INVESTIGATION.md), then diagnostic tooling on a throwaway branch: a console-runnable client state snapshot (capture during a freeze, refresh, capture again, compare; the difference is the bug) and logging of key flag/listener sets and clears with their originating action. Then playtest until a freeze occurs.



Principles for the migration: the client renders from authoritative server state rather than accumulating step-by-step changes, and a state snapshot/consistency check stays permanently available in development builds.



\## Workflow

A Claude.ai design project handles architecture, strategy, bug priorities, evaluation of Claude Code's output, and writing prompts for Claude Code. It has read-only access to the repo via GitHub sync. Claude Code works in the repo. The repo is the single source of truth: decisions made in design discussions are written into repo docs through Claude Code. Model guidance: Opus for investigation, architecture, and migration planning; Sonnet for carrying out well-specified steps.



\## To evaluate before migration begins

claude-code-bga, a community Claude Code skill (MIT, not BGA-affiliated) for the current framework, linked from the BGA wiki page "Using AI for BGA game development." It offers migration experience, a documented list of BGA pitfalls, and an automated deploy-and-test loop via Claude in Chrome. Review it before installing, and keep SFTP credentials out of git.

