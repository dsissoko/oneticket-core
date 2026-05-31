---
name: oneticket-technical-skill-picker
description: Dynamically select and load the stack-specific skill sets appropriate for the current project based on architecture.md.
---
# Skill: technical-skill-picker

## Purpose

Dynamically select and load the stack-specific skill sets appropriate for the current project,
based on the technical context described in `architecture.md` and the active request.

This skill is loaded by technical agents (dev, qa, architect) via the `technical` set.
It acts as a bridge between the generic role sets and the stack-specific sets.

---

## When to apply

Apply this skill after loading your role set (dev, qa, or architect) and before starting
any technical task that requires stack-specific knowledge.

---

## Process

### Step 1 — Gather context

Read `architecture.md` and the active request to identify the stack context:
- Explicit stack mentions (framework, language, tools)
- Inferable signals (e.g. "web frontend", "browser app", "node app", "mobile app")

### Step 2 — Read available stack skills

List all skill names available in the skills directory — use skills prefixed with `oneticket-stack-` as candidates.
For each candidate, read its `description` field to understand what stack it covers.
Never invent a skill name that doesn't exist.

### Step 3 — Apply one of three cases

**Case A — Stack mentioned or inferable**

A stack is mentioned in the request or in `architecture.md`, or can be inferred from context.
→ Match against available `stack-*` sets using keywords and description.
→ Select the closest semantic match and load it.
→ If multiple sets match, load all of them.
→ Report which set was selected and why.
→ For React+Vite projects, also load `oneticket-init-appshell`. This skill describes AppShell's
  role in the project lifecycle and must be considered before any technical work begins.

**Case B — No stack mentioned**

No stack is mentioned and none can be inferred from context.
→ Post a comment listing the available `stack-*` sets with their descriptions.
→ Ask the human to choose before proceeding.
→ Do not implement anything until a stack is confirmed.

**Case C — Stack mentioned but no match found**

A stack is explicitly mentioned but no available `stack-*` set matches
(no keyword or semantic proximity found).
→ Post a comment listing the available `stack-*` sets with their descriptions.
→ State that no matching skill set exists for the requested stack.
→ Do not proceed with implementation.

---

## Rules

- Never load a stack set without reading its description and keywords first
- Never invent stack-specific instructions not covered by a loaded skill
- Never proceed with implementation before a stack set is confirmed (Cases B and C)
- If the stack in `architecture.md` is ambiguous or incomplete, treat as Case B
- Stack sets are managed by humans in `skills/skills-set.md` — do not modify them
