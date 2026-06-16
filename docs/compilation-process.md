# Compilation — Concept Maturation Process
*A general process for compiling loose context (old conversations, notes, uploads) into a structured concept document — creating a new one or maturing an existing one.*
*Domain-agnostic; currently applied in Matterqueue. Home: `docs/` for now — portable, may move to a global/methods location later.*

---

## What compilation is

A **process, not an artifact.** Compiling a concept means gathering its scattered context and synthesizing it into the concept's own canonical document. The output *augments the concept doc* — it does not produce a separate "compilation file." "Compilation performed" is a state of the concept, not a file that exists.

## When to run it

When a concept has accumulated enough loose material (old chats, notes, half-formed docs) to be worth consolidating, or when you want to refresh/mature an existing concept.

---

## Process

### 1. Locate
Does the concept doc already exist? This decides **create** vs **update**.

### 2. Gather
- Search old chats by the concept's name + known aliases.
- Collect distilled session artifacts (e.g. Capsules / Trails).
- Accept uploaded notes and files.
- Load the existing concept doc, if any.

Keep a **source list** for provenance.
*Access note:* automated chat search depends on the environment (e.g. only some transcripts are searchable from a given tool). Sources not reachable are supplied/uploaded by the human.

### 3. Extract & dedup
Pull decisions, insights, and claims from each source. Dedup. Resolve contradictions — **latest decision wins; surface genuine conflicts** rather than silently choosing.

### 4. Synthesize
Distill the material into the concept doc's structured fields. Derive relationships (dependencies / peers) using names that resolve to real concepts. Set classification (type / state / maturity level).

### 5. Write — augment, never overwrite
- **New concept:** create the doc from the synthesis (structured summary + a working-notes section holding the gathered context + empty logs).
- **Existing concept:**
  - **Produce a new current summary and preserve the prior one** — the new version goes on top; the previous version moves below, dated and labeled *(prior — [date])*. Nothing is overwritten.
  - Add a dated **working-notes** entry capturing the new context.
  - Append **log** entries (decisions / open questions / actions) for anything surfaced.

### 6. Flag
Mark that compilation was performed. Advance the maturity level if a threshold was crossed.

### 7. Review
Present the result — a **diff** for updates — and let the human edit and confirm before it's committed.

### 8. Provenance
Record which sources were compiled, in the working-notes entry: *"Compiled from: …"*.

---

## Matterqueue binding (current application)

| General step | Matterqueue specifics |
|---|---|
| Concept doc | `<slug>.md` in the domain folder |
| Structured fields | the **Idea Capsule** schema (Name, One Phrase, Core Sentence, One Paragraph, Key Insights, User, Model, Why It's Real, Flags, Synergy) |
| New summary + preserve prior | new `## Idea Capsule — [date]` on top; previous becomes `## Idea Capsule — [date] *(prior — [date])*` below (schema rule) |
| Working-notes entry | a `## Brief — [date]` section (newest above older) |
| Logs | Action Log / Decision Log / Open Questions Log |
| "Compilation performed" flag | `compilation: true` — a performed-flag like `try_it` / `map_it`, **not** a file pointer |
| Relationships | `uses:` / `synergies:` (exact concept names) |
| Review pattern | the migration tool's batch-confirm model |

---

## Status

Not a command yet — a documented process, run by hand or with AI assistance. It may later become a `/compile` command or a tool, but that is not required for it to be used. ~8 advanced concepts (those with multiple prior conversations) are the first candidates.
