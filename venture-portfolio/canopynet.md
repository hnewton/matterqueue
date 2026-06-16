---
name: Canopynet
type: concept
doc_level: brief
state: active
focus: false
try_it: true
map_it: false
todoist: false
created_date: 2026-05-22
modified_date: 2026-06-15
synergies:
  - Vaultmoth
actions:
  - description: Prototype the shared context layer between two active sessions
    type: prototype
    state: done
    position: 1
  - description: Define what shared context means — presence, state, or history?
    type: decision
    state: open
    position: 2
  - description: Write up prototype findings
    type: task
    state: open
    position: 3
---

## Idea Capsule — 2026-05-22

**Name** — Canopynet
**One Phrase** — Shared context layer for parallel workstreams
**Core Sentence** — Canopynet maintains a live shared context between parallel workstreams — so that two people working on related problems simultaneously can see each other's current state without interrupting each other.
**One Paragraph** — Collaboration tools are built for sequential handoffs or synchronous meetings. Canopynet addresses the gap between those: two people working in parallel on related problems who need ambient awareness of each other's current direction without stopping to sync. The shared context layer is not a chat channel or a shared document — it is a live read of what each person is currently working on and where they are in it, available peripherally rather than on demand.

**Key Insights**
- The problem is parallel work coordination, not sequential handoff — existing tools solve the wrong thing
- Ambient awareness of parallel workstreams is distinct from notification or messaging
- The prototype confirmed that even a minimal shared context (current task + status) reduces redundant work between parallel workers

**User** — Small teams (2–5) working on related problems in parallel. Remote-first.

**Model** — Team subscription. Pricing per connected workstream pair.

**Why It's Real**
- Prototype validated the core value: teams who used even a minimal shared context layer reported fewer "I didn't know you were doing that" moments
- No existing tool addresses parallel workstream coordination as a primary use case

**Flags**
- Defining "shared context" precisely is the open design problem — presence (are you online?), state (what are you working on?), and history (what did you just finish?) are three different products
- Privacy tension: workers may not want their current task visible to a peer in real time

**Synergy**
- **Vaultmoth** — Vaultmoth surfaces relevant archived documents; Canopynet could trigger Vaultmoth retrieval based on what a parallel worker is currently doing

---

## Brief — 2026-05-22

Prototype session confirmed the core value proposition. Two-person test with shared context limited to: current task name, current status (thinking / doing / stuck), last completed task. Even this minimal signal reduced coordination overhead. Participants reported feeling "less alone" without feeling watched.

Key unresolved: what is the right granularity of shared context? Current task name is coarse. Full document content is invasive. The sweet spot is somewhere in between — probably intent-level rather than content-level.

---

## Action Log

**2026-05-25** — Prototype of shared context layer between two active sessions complete. Confirmed: current task + status is enough signal to reduce redundant work. More granular context created discomfort. Marked try_it: true.

---

## Decision Log

---

## Open Questions Log

**2026-05-22** `open` — What is the right granularity of shared context? Intent-level (what are you trying to accomplish?) vs task-level (what are you currently doing?) vs content-level (what are you writing/building?). Each has different privacy and utility tradeoffs.
