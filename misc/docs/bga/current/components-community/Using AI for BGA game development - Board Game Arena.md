# Using AI for BGA game development

> Source: http://en.boardgamearena.com/doc/Using_AI_for_BGA_game_development

This page is to share resources and advice about using AI for BGA development.

## Overview

At the point of writing (Apr 2026) there is no model that can successfully code meaningful game completely using BGA framework.
But AI can be used for a lot of tasks, examples of usages:

- Generating boilerplate code
- Translating game rules from a rulebook into structured game logic and state machines
- Writing and maintaining unit tests for game operations
- Converting game material (cards, tokens, boards) from spreadsheets into PHP data structures
- Debugging complex state machine flows by analyzing execution traces
- Extracting patterns across multiple open source games
- Writing client-side UI code (TypeScript/JS) for token rendering and animations
- Reviewing code for common BGA framework pitfalls and anti-patterns
- Generating CSS/SCSS for card layouts and sprite positioning from asset images
- Explaining unfamiliar parts of the BGA framework or existing codebase
- Reviewing against bga UI guildlines
- Migrating game from old framework

## Setup

To set up AI for success you need to add some documentation to your project, I suggest to use misc/docs folder.
In addition you can run something like /init command to create initial AI document which it will use for your project.

Files:

- CLAUDE.md (or AI.md) - top-level project instructions that AI tools read automatically (would be in root of project)
- RULES.md - exact rules converted from PDF (you can use AI to do that too. Make sure it is NOT summarized)
- DESIGN.md - design of your game (software design) - if it does not exist ask AI to create software design document
- PROCEDURES.md - add workflows that you want AI to follow (can reference explicit skills)
- PLAN.md - implementation plan (when game is not complete)
- TODO.md - todo list (when game is complete but few things left)
- ASSETS.md - asset pipeline documentation (PDF sources, sprite sheets, conversion steps, sounds, fonts)

## Skills

The best way to save the workflows is to use skills. If you developed some AI skills share it here by providing link (and contact if not clear from link).

DISCLAIMER: skills shared here comes from community and not affiliated with BGA itself, contact repo maintainer for questions

### claude-code-bga — from rulebook to a testable game on Studio

[claude-code-bga](https://github.com/rbellec/claude-code-bga) (MIT) is a skill for [Claude Code](https://claude.ai/claude-code) targeting the new (2025+) BGA framework. Rather than a single prompt, it packages the full development workflow:

- **Project setup** — Makefile, SFTP deploy, config files, git workflow;
- **Framework patterns** — PHP state machine and ES6 client, plus on-demand reference guides for the standard BGA libraries (Deck, BgaCards, Stock, Counter, Scrollmap, …);
- **Rules clarification** — ambiguities found during implementation are logged as tracked questions and assumptions to discuss with the game's author, instead of being silently guessed;
- **Automated deploy-and-test loop** — via the Claude in Chrome extension: deploy, start a hotseat table on Studio, read the browser console for PHP/JS errors, fix, repeat (~30 s per cycle);
- **Known pitfalls** — dbmodel.sql comments, table name conflicts, zombie handling, and other traps documented with their fixes.

It has been used to implement several games on Studio (e.g. [Quantum Tic-Tac-Toe](https://github.com/rbellec/BGA_quantum_tic_tac_toe), [Go On Rasalva](https://github.com/rbellec/Go-On-Rasalva-on-BGA)), to migrate a legacy game to the new framework, and to walk through rule edge cases directly on Studio tables during testing. The generated code still needs review by the developer — the skill automates the BGA-specific plumbing and test cycle, not the game design decisions.

## Other resources

- Chrome MCP server allows AI to see the real game <https://developer.chrome.com/blog/chrome-devtools-mcp>
- <https://www.reddit.com/r/ClaudeAI/comments/1us9hfz/asked_claude_what_in_my_docs_was_hurting_its/>
- <https://www.reddit.com/r/ClaudeAI/comments/1uc7izy/i_added_a_clause_to_andrej_karpathys_4_claudemd/>
- <https://www.reddit.com/r/ClaudeAI/comments/1t4ncbj/10_things_about_claude_that_took_me_way_too_long/>

---
