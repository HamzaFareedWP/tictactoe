---
name: next
description: >-
  Implements the next unchecked item in SPEC.md, then stops for review.
  Use when the user runs /next, asks for the next spec item, or wants
  spec-driven Tic-Tac-Toe work continued one step at a time.
disable-model-invocation: true
---

# Next spec item

Work through `SPEC.md` one item at a time.

## Steps

1. Read `SPEC.md` and find the first checklist line that is still `- [ ]`.
2. If every item is `- [x]`, say the spec is complete and stop. Do not invent new work.
3. Implement only that item. Leave later items untouched.
4. Mark that item `- [x]` in `SPEC.md`.
5. Stop. Summarize what changed and which files moved. Do not start the following item.

## Rules

- Game rules stay in `script.js`. Visual changes stay in `style.css`. Structure stays in `index.html`.
- Do not restyle the game while a functional item is the one in progress.
- If the item is ambiguous, ask one question and wait. Do not guess past a real fork.
