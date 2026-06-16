# Matterqueue Front Matter Schema
*Version 1.5 — 2026-06-16*
*Status: Locked — Stage 1 reference*
*Amendments v1.1: system MD dates removed; try_it/map_it clarified; name uniqueness added; state transition behaviors added; absorption Decision Log behavior added; instructions MD deferred*
*Amendments v1.2: queued boolean on action items; _queue.json global queue file; three viewer views (Queue / All Actions / Concept); position field clarified as local-only*
*Amendments v1.3: compilation and build_doc boolean flags added; external artifact types defined (compilation-[concept].md, build-[concept].md); Compilation section removed from concept MD body; body structure updated; field presence table updated*
*Amendments v1.5: compilation redefined as a process — `compilation:` is a performed-flag (like `try_it`/`map_it`), not a file pointer; `compilation-[slug].md` external artifact removed; `build-[slug].md` is the only external artifact; see `compilation-process.md`*

---

## Overview

Each idea, engine, or workflow in Matterqueue is a single markdown file. Front matter is YAML. The body is a living record. The viewer reads front matter for structure and state; the body for content and history.

Every MD file belongs to a domain folder. The folder contains one system MD at the root that carries domain configuration. Individual MDs inherit domain from their folder — they do not repeat it.

---

## System MD — Domain Configuration

One per domain folder. Stored as `_system.md` at the folder root.

```yaml
---
domain: venture-portfolio
label: Venture Portfolio
action_label: Build Items
---
```

**Fields:**

| Field | Type | Description |
|---|---|---|
| `domain` | string | Machine-readable domain identifier. Slug format. |
| `label` | string | Human-readable domain name. Displayed in viewer. |
| `action_label` | string | Viewer label for actions list. Domain-adaptive. Examples: Build Items / Campaign Actions / Next Moves / Research Actions / Practice Items / Validation Steps |

*No date fields — system MD rarely changes. Finder timestamp is sufficient.*

---

## Concept MD — Front Matter

### Full example

```yaml
---
name: ThinkMutant
type: concept
doc_level: compilation
state: active
focus: true
try_it: true
map_it: false
compilation: true
build_doc: true
absorbed_by:
created_date: 2026-05-01
modified_date: 2026-06-15
uses:
  - InsightMutant
  - Document ingest and structure extraction engine
synergies:
  - The Current
  - Subtext
  - Siteframe
todoist: false
actions:
  - description: Prototype mind map rendering from ThinkMutant graph output
    type: prototype
    state: open
    queued: true
    position: 1
  - description: Define JSON schema for idea graph
    type: task
    state: done
    position: 2
  - description: Evaluate Markmap vs D3 for rendering
    type: research
    state: blocked
    position: 3
---
```

---

### Field reference

#### Identity

| Field | Type | Required | Values / Notes |
|---|---|---|---|
| `name` | string | ✅ | Display name. Exact match used by other MDs in `uses:` and `synergies:`. Case-sensitive. Slug derived at runtime — lowercase, spaces to hyphens, special characters stripped. |
| `type` | enum | ✅ | `concept` / `engine` / `workflow` |
| `doc_level` | enum | ✅ | `spark` / `capsule` / `brief` / `compilation` |
| `state` | enum | ✅ | `active` / `parked` / `absorbed` / `retired` |
| `absorbed_by` | string | ❌ | Present only when `state: absorbed`. Free text. Name one or more absorbing ideas. Example: `ShapeSake` or `ShapeSake, Patterntopia` |

#### Type definitions

**concept** — A standalone product, venture, or idea with its own user, model, and reason to exist.

**engine** — A named capability that powers multiple other concepts but is not itself a user-facing product. Buildable as a standalone system. Examples: InsightMutant, HypothesisEngine, Photo → 2D vector engine.

**workflow** — A shared process or capability that multiple concepts rely on but that has no front door and no build queue of its own. Not a product, not an engine — a shared primitive. Examples: flat output fulfillment pipeline, semantic matching layer, document ingest process.

#### Doc level definitions

**spark** — Named and captured. One sentence minimum. Exists so the idea isn't lost. No required body sections beyond the name.

**capsule** — Structured entry using the Idea Capsule schema. Evaluable. Dense and scannable — complete enough to assess, short enough to read in two minutes.

**brief** — More than a capsule, less than a compilation. Working notes, early signals, open questions, session outputs accumulated over time. No fixed structure beyond the capsule it builds on.

**compilation** — Multiple sessions synthesized. Build-ready. Ceiling of the MD folder system. The synthesis lives *in* the concept MD (current Idea Capsule on top, prior versions preserved below; Brief sections for accumulated context) — there is no separate compilation file. Reaching this level is the output of the compilation process (see `compilation-process.md`). One external artifact may exist alongside the concept MD when it enters active build: `build-[slug].md` (AI working instrument), flagged via `build_doc:`.

#### State definitions

**active** — Hands on it now or imminent. In the current sprint.

**parked** — Shelved intentionally. Will revisit. Explicit intention to return.

**absorbed** — Concept lives on inside another product or idea. No longer standalone. `absorbed_by` field required.

**retired** — No longer pursuing. Clean close. Nothing notable salvaged. Not a failure notation.

*States ordered by gradient: active → parked → absorbed → retired. Absorbed implies something survived. Retired implies nothing did.*

---

#### Flags

| Field | Type | Required | Notes |
|---|---|---|---|
| `focus` | boolean | ❌ | `true` signals current primary focus. Viewer pins or highlights. Limit 1–2 across all MDs. Manual discipline — no enforced constraint. |
| `try_it` | boolean | ❌ | Permanent signal that a prototype action has been identified or run. Maps to action `type: prototype`. Not a completion tracker — set to true when the first prototype action is created; never flipped back. |
| `map_it` | boolean | ❌ | Permanent signal that a research or mapping action has been identified or run. Maps to action `type: research`. Not a completion tracker — set to true when the first research action is created; never flipped back. Neither, one, or both may be true independently. |
| `todoist` | boolean | ❌ | `true` if this concept has a corresponding Todoist entry. No ID. No sync back. Boolean only. |
| `compilation` | boolean | ❌ | `true` signals a **compilation pass has been performed** — loose context (old chats, notes) gathered and synthesized into this MD. A performed-flag like `try_it`/`map_it`, **not** a file pointer; no external compilation file exists. See `compilation-process.md`. |
| `build_doc` | boolean | ❌ | `true` signals that `build-[slug].md` exists in this folder. Viewer surfaces as a navigation link. Set when the concept enters active build. |

---

#### Relationships

| Field | Type | Required | Notes |
|---|---|---|---|
| `uses` | list | ❌ | Engines and workflows this concept depends on architecturally. Names must match the `name` field of the target MD exactly. Case-sensitive. Drives dependency view in viewer. |
| `synergies` | list | ❌ | Peer ideas with meaningful relationship — shared audience, shared engine hypothesis, compounding effect, or potential absorption. Names must match the `name` field of the target MD exactly. Drives graph view and dynamic clustering in viewer. Distinct from `uses:` — these are lateral relationships, not dependencies. |

---

#### Dates

| Field | Type | Required | Notes |
|---|---|---|---|
| `created_date` | date | ✅ | YYYY-MM-DD. Set at file creation. Never updated. |
| `modified_date` | date | ✅ | YYYY-MM-DD. Updated on every write-back by the viewer. |

---

#### Actions

```yaml
actions:
  - description: [text]
    type: [task / prototype / research / decision]
    state: [open / blocked / done]
    queued: [true / false]
    position: [integer]
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `description` | string | ✅ | What the action is. Plain text. |
| `type` | enum | ✅ | `task` / `prototype` / `research` / `decision` |
| `state` | enum | ✅ | `open` / `blocked` / `done` — a spectrum. Open = not started or in progress. Blocked = cannot move, external dependency. Done = complete. |
| `queued` | boolean | ❌ | `true` pulls this action into the global Queue view for active ordering. Omitted when false — only present when set. Default is unqueued. |
| `position` | integer | ✅ | Local sort order within this MD's concept view. Lower number = higher priority within concept. Distinct from global queue order. |

**Action type definitions:**

**task** — A concrete doing. Something that gets executed.

**prototype** — A build to test a hypothesis. Produces a verdict. Prototype outcome recorded in Action Log.

**research** — Investigation or validation. Produces information that informs a decision.

**decision** — A question that needs to be resolved. Produces a Decision Log entry when done.

**Action label in viewer:** Determined by `action_label` in the domain system MD. The YAML key `actions:` is consistent across all domains for parsing. The display label adapts per domain.

---

## _queue.json — Global Queue Order

A single `_queue.json` file lives at the domain folder root alongside `_system.md`. It stores the global ordered list of queued actions — the human-curated execution sequence across all MDs.

```json
{
  "updated": "YYYY-MM-DD",
  "queue": [
    { "filename": "matterqueue.md", "description": "Build matterqueue-core.js" },
    { "filename": "patterntopia.md", "description": "Draft positioning doc" },
    { "filename": "thinkmutant.md", "description": "Prototype mind map rendering" }
  ]
}
```

**Rules:**
- Owned entirely by the viewer — not human-authored
- Written on Sync whenever queue order changes
- Read on load to reconstruct queue order
- An action appears here only when `queued: true` in its MD front matter
- Order in this file is the authoritative global execution order
- Soft cap: viewer warns when queue exceeds 10 items — "Queue has 10 items. Consider completing before adding more." Not a block.

---

---

## Body Structure

Standard section order for all MDs. Not all sections are present at every doc_level — see requirements below.

The Build doc is an **external file**, not a body section. It lives alongside the concept MD in the folder and is flagged via `build_doc:`. There is no separate compilation document — compilation synthesis lives in the concept MD body; `compilation:` is a performed-flag.

```
## Idea Capsule — [most recent date]
## Brief — [date]          ← brief doc_level and above
## Idea Capsule — [original date] *(original)*
## Action Log
## Decision Log
## Open Questions Log
```

**Table of contents** — derived from body headings at runtime by viewer. Renders as jump menu. No front matter field required.

---

### Idea Capsule schema

Used at `capsule` doc_level and above. Current version sits at top of body. When the concept advances and the capsule is updated, the prior version moves below the Compilation section, clearly dated and labeled *(original)* or *(prior — [date])*.

```markdown
## Idea Capsule — [YYYY-MM-DD]

**Name** — [display name] *(alt names if any)*
**One Phrase** — [sharpest internal distillation; the shorthand you'd use in a list]
**Core Sentence** — [who does what they couldn't before, or what becomes possible]
**One Paragraph** — [external pitch. Open with the sharpest entry point — the angle
that makes someone lean in. Expand into who does what they couldn't before. Close
with why it's real or why now. Three to five sentences. Written to be spoken or sent.]

**Key Insights**
- [2–5 bullets — the sharpest things that make this real or different]

**User** — [who specifically; primary, secondary if relevant]

**Model** — [how it makes money or creates value; honest if unclear]

**Why It's Real**
- [2–5 bullets — evidence, analogies, personal connection, market signal]

**Flags** — [honest concerns; distinguish execution sequencing problems from concept flaws]

**Synergy**
- [Named connections to other ideas. For each: shared audience / shared engine hypothesis
  / compounding effect / potential absorption precursor. Narrative explanation of why
  and how — the front matter synergies: field handles machine-readable peer relationships;
  this section handles the story.]
```

**Doc level requirements:**

| Doc level | Idea Capsule required? | External artifacts |
|---|---|---|
| spark | ❌ — name and one sentence in body is sufficient | None |
| capsule | ✅ — full schema above | None |
| brief | ✅ — full schema; Brief sections accumulate below | None |
| compilation | ✅ — full schema; prior capsule versions preserved below Brief | `build-[slug].md` when in active build |

---

### Brief

Appears at `brief` doc_level and above. Append-only. No fixed internal structure — working notes, session outputs, signals, open threads. Dated header. Multiple Brief sections may exist as the concept develops.

```markdown
## Brief — [YYYY-MM-DD]

[Working notes, session outputs, early signals, open threads.
No fixed structure. Accumulates over time. Not replaced — new
Brief sections added above older ones.]
```

---

## External Artifacts

At `compilation` doc_level, one external file may live alongside the concept MD in the folder once the concept enters active build. It is not a body section — it is referenced via the `build_doc:` flag. Compilation has no external file; its synthesis lives in the concept MD body (see `compilation-process.md`).

### build-[slug].md

AI working instrument. Loaded into the Claude Project for the active build session. Contains everything needed to drive construction without re-reading the full concept MD. Produced when a concept enters active build. Updated each build session.

```markdown
# build-[concept] — [YYYY-MM-DD]

## Build State
[What has been built. What is in progress right now. Present tense.
1–3 sentences. Written for an AI opening this document cold.]

## Feature Queue
[What is being built this sprint. Ordered for execution. Enough
detail to build from without asking clarifying questions. Not action
items — build specifications.]

1. [feature/component — description with enough detail to execute]
2. [feature/component]
3. [feature/component]

## Constraints
[Hard non-negotiables the build must honor. Short and scannable.
Examples: Chrome only / no npm / no server / File System Access API /
Dropbox folder / vanilla JS / no build step.]

## Open Build Decisions
[Questions that must be resolved during build — implementation forks,
not concept questions. Each is a blocker or a fork in the code.]

1. [question]
2. [question]

## Specs
[External spec files if any. Filename and what it covers.
For complex concepts only — simple concepts may not need external specs.]

- [spec filename] — [what it covers]

## Build Log
[Append-only. One entry per build session. What was built, what was
decided, what changed. Reverse chronological — newest first.]

**[YYYY-MM-DD]** — [what happened this session]

## Loaded Context
[Files to load at the start of the build session. In order.]

1. essential-prompts.md ← behavioral rules
2. [concept].md ← concept record and front matter
3. build-[concept].md ← this file
4. [spec files as needed]
```

**File naming:** The build doc derives its filename from the concept name slug, consistent with the concept MD naming rules. `ThinkMutant` → `build-thinkmutant.md`.

**Viewer behavior:** When `build_doc: true` is set in front matter, the viewer surfaces a navigation link to `build-[slug].md` in the concept view header. `compilation: true` is a performed-flag only — no file, no link.

**Specs as supporting artifacts:** For technically complex concepts, spec documents (architecture, schema, mechanism designs) live alongside the build doc in the folder and are referenced from the build doc's Specs section. They are not embedded in the build doc — they are the detail layer it points to. Simple concepts may have no external specs; their build doc contains everything needed inline.

---

### Logs

All logs are append-only and reverse chronological (newest entry first).

```markdown
## Action Log

**[YYYY-MM-DD]** — [What was done, attempted, or built. Prototype results,
tasks completed, things tried. One entry per action. Can reference action
item by description.]

---

## Decision Log

**[YYYY-MM-DD]** — [What was decided and why. Replaces the need to
re-litigate settled questions in future sessions.]

---

## Open Questions Log

**[YYYY-MM-DD]** `open` — [Question text]
**[YYYY-MM-DD]** `resolved` — [Question text. Resolution: [one sentence].]
```

---

## Spark MD — Minimal example

At `spark` doc_level the body requires only a name and one sentence. Front matter is minimal.

```yaml
---
name: Walkframe
type: concept
doc_level: spark
state: parked
created_date: 2026-05-01
modified_date: 2026-05-01
---
```

```markdown
A replicable community walking club framework that engineers inclusion
for people who find community hard.
```

---

## Absorbed MD — Minimal example

Absorbed concepts keep their MD as a record. State and absorbed_by are the key fields. Body preserves whatever was written before absorption.

```yaml
---
name: Manhole
type: concept
doc_level: capsule
state: absorbed
absorbed_by: ShapeSake
created_date: 2026-05-01
modified_date: 2026-06-10
---
```

---

## Naming rules

- `name` field is the canonical identifier across the entire system
- **Name must be unique system-wide** — `uses:` and `synergies:` resolve by exact name match; duplicate names break the graph silently. Viewer warns on duplicate detection at load — soft guardrail, not a hard block.
- `uses:` and `synergies:` values must match `name` fields exactly — case-sensitive, character-for-character
- File name is derived from `name` at runtime: lowercase, spaces to hyphens, special characters stripped or replaced
  - `ThinkMutant` → `thinkmutant.md`
  - `Photo → 2D vector engine` → `photo-2d-vector-engine.md`
  - `EF Coach` → `ef-coach.md`
- The viewer derives the slug — no slug field in front matter

---

## Field presence by doc_level

| Field | spark | capsule | brief | compilation |
|---|---|---|---|---|
| name | ✅ | ✅ | ✅ | ✅ |
| type | ✅ | ✅ | ✅ | ✅ |
| doc_level | ✅ | ✅ | ✅ | ✅ |
| state | ✅ | ✅ | ✅ | ✅ |
| absorbed_by | if absorbed | if absorbed | if absorbed | if absorbed |
| focus | ❌ | optional | optional | optional |
| try_it | ❌ | optional | optional | optional |
| map_it | ❌ | optional | optional | optional |
| todoist | ❌ | optional | optional | optional |
| compilation | ❌ | optional | optional | ✅ when a compilation pass has been performed |
| build_doc | ❌ | ❌ | ❌ | ✅ when in active build |
| uses | ❌ | optional | optional | optional |
| synergies | ❌ | optional | optional | optional |
| created_date | ✅ | ✅ | ✅ | ✅ |
| modified_date | ✅ | ✅ | ✅ | ✅ |
| actions | optional | optional | optional | ✅ |

---

## State Transition Behaviors

System-triggered prompts on specific state changes. All others are silent.

| Transition | System behavior |
|---|---|
| → `absorbed` | Prompts: "Review [absorbed idea]'s open actions — recreate any that should carry forward in [absorbing idea]. Open [absorbed idea] now?" (Open / Done). Appends one entry to absorbing idea's Decision Log: `[date] — [absorbed name] absorbed into this concept. See [filename] for full history.` |
| → `retired` | Confirmation prompt: "Mark [name] as retired? This is a clean close — nothing carries forward." (Confirm / Cancel). Prevents accidental retirement. |
| `focus: true` on a third concept | Warning: "You have 3 concepts marked as focus. Recommended limit is 2. Continue?" Soft warning — not a block. |
| `doc_level` → `compilation` | Prompt: "Compilation signals build-readiness. Create build-[slug].md now?" (Yes / Not yet). If Yes: opens the build doc template. |
| `queued: true` on 11th action | Warning: "Queue has 10 items. Consider completing before adding more." Soft warning — not a block. |

All other transitions — `parked`, action state changes, `try_it`/`map_it` flags — are silent.

---

## Viewer Views

Three distinct views. Each has a distinct job.

**Queue view** — the active execution sequence. Shows only actions where `queued: true`, ordered by global position in `_queue.json`. Human drag-and-drops to reorder. Flagging an action as queued from any other view adds it here. Soft cap at 10 items. Blocked actions visually distinct — still shown, clearly stalled. This is the "what's next" view.

**All Actions view** — every `open` or `blocked` action across all MDs. Full picture — could be 50+ items. Not ordered for execution. Primary use: scan and flag items as `queued: true` to pull them into the Queue view. Grouped by MD name. Filterable by type and state.

**Concept view** — actions within a single MD, ordered by local `position`. Primary use: working within one concept. Queued actions visually flagged. All action management (add, edit, reorder locally, flag as queued) available here.

**Additional viewer behaviors:**
- **Graph view** — nodes are MDs; edges are `synergies:` declarations. Bidirectional display even if only one MD declares the relationship.
- **Dependency view** — derived from `uses:` fields. Shows what each engine or workflow powers.
- **Focus pin** — MDs with `focus: true` pinned or visually distinguished in all views.
- **Action label** — read from domain system MD `action_label` field. Applied to all action displays in that folder.
- **Jump menu** — derived from body headings at render time. No front matter field needed.
- **Duplicate name warning** — surfaced on load if any two MDs share the same `name` field value.

---

*Matterqueue Schema v1.5 — locked for Stage 1 build*
*Amendments v1.1: system MD dates removed; try_it/map_it clarified; name uniqueness added; state transition behaviors added; absorption Decision Log behavior added; instructions MD deferred*
*Amendments v1.2: queued boolean on action items; _queue.json global queue file; three viewer views (Queue / All Actions / Concept); position field clarified as local-only*
*Amendments v1.3: compilation and build_doc boolean flags added; external artifact types defined; Compilation section removed from concept MD body; compilation doc_level definition updated; body structure updated; field presence table updated*
*Amendments v1.4: actions field allowed at spark doc_level (optional); a spark with a next step is a valid and common real-world case*
*Amendments v1.5: compilation redefined as a process — `compilation:` is a performed-flag (like `try_it`/`map_it`), not a file pointer; `compilation-[slug].md` external artifact removed; `build-[slug].md` is the only external artifact; compilation process documented in `compilation-process.md`*
