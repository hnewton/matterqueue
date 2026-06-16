---
name: Pushwave
type: engine
doc_level: capsule
state: active
focus: false
try_it: false
map_it: false
todoist: false
created_date: 2026-04-15
modified_date: 2026-06-15
synergies:
  - Glassbell
actions:
  - description: Define event contract between Pushwave and consuming products
    type: decision
    state: open
    queued: true
    position: 1
  - description: Prototype delivery reliability under intermittent connectivity
    type: prototype
    state: blocked
    position: 2
  - description: Survey existing push delivery libraries
    type: research
    state: done
    position: 3
---

## Idea Capsule — 2026-04-15

**Name** — Pushwave
**One Phrase** — Reliable event delivery for ambient and notification products
**Core Sentence** — Pushwave is a delivery engine that handles the reliable transmission of events from producers to consumers, abstracting away connectivity unreliability and device state so that products built on top of it can focus on experience rather than plumbing.
**One Paragraph** — Every product that delivers timely information — notifications, ambient signals, status updates — has to solve the same underlying problem: how do you get an event from where it originates to where it needs to appear, reliably, even when connectivity is intermittent? Pushwave is that solution as a shared engine. Products like Glassbell consume Pushwave's delivery guarantees and build experience on top. The plumbing is built once.

**Key Insights**
- Delivery reliability is a solved problem in backend infrastructure but not yet as a lightweight embeddable engine for small products
- Every notification or ambient product reinvents this layer — Pushwave makes it shared
- The event contract between Pushwave and consuming products is the critical design decision — it determines what downstream products can and cannot do

**User** — Not a user-facing product. Consumed by other products in the portfolio (primarily Glassbell). Eventually licensable to external developers building notification or ambient products.

**Model** — Internal engine at Stage 1. Licensing model post-validation.

**Why It's Real**
- Glassbell has an immediate dependency on this layer — building it shared rather than embedded in Glassbell is the right architecture call
- The problem (reliable delivery under intermittent connectivity) is well-understood; the solution is engineering, not discovery

**Flags**
- Blocked on connectivity prototype — need a test environment that reliably simulates intermittent connectivity before the prototype is meaningful
- Event contract must be settled before any consuming product builds against it — this is the current blocking decision

**Synergy**
- **Glassbell** — primary consumer; Glassbell's delivery layer depends on Pushwave

---

## Action Log

**2026-05-01** — Surveyed push delivery libraries: Firebase Cloud Messaging, Pusher, Ably. All are server-dependent. Pushwave needs to work without a persistent server connection for the local/offline use case. None are suitable as-is. Custom implementation required.

---

## Decision Log

---

## Open Questions Log

**2026-04-15** `open` — What is the event contract format? JSON envelope with type, payload, timestamp, and priority fields is the starting assumption. Needs validation against Glassbell's actual requirements before locking.
