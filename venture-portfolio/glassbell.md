---
name: Glassbell
type: engine
doc_level: compilation
state: active
focus: true
try_it: true
map_it: true
compilation: true
build_doc: true
todoist: true
created_date: 2026-04-10
modified_date: 2026-06-16
uses:
  - Pushwave
  - Ambient delivery engine
synergies:
  - Driftmap
  - Frostline
actions:
  - description: Prototype the ambient notification UI
    type: prototype
    state: open
    queued: true
    position: 1
  - description: Define payload schema for notification types
    type: task
    state: open
    queued: true
    position: 2
  - description: Evaluate push vs pull delivery model
    type: research
    state: done
    position: 3
  - description: Decide on persistence model for notification history
    type: decision
    state: blocked
    position: 4
---

## Idea Capsule — 2026-05-20

**Name** — Glassbell
**One Phrase** — Ambient notifications that feel like weather, not interruption
**Core Sentence** — Glassbell delivers contextual signals to peripheral awareness — a subtle environmental layer that keeps you informed without demanding attention.
**One Paragraph** — Most notification systems are built around interruption: the badge, the buzz, the red dot. Glassbell takes the opposite position. Information arrives as ambient change — a shift in light, a soft tone, a peripheral indicator — that you notice when you're ready rather than when the system demands it. The model is closer to weather than to alerts: you glance at the sky when you want to know, not because it rang.

**Key Insights**
- Peripheral awareness is an underexplored delivery surface — most tools compete for focal attention; Glassbell claims the space around it
- The value is in the filtering layer — ambient delivery only works if what arrives is genuinely worth knowing; signal quality is the product
- Pushwave handles delivery; Glassbell handles the experience layer on top of it
- Hollowframe was an early attempt at the same problem that tried to do too much — absorbed into Glassbell after its core insight (peripheral display) was validated

**User** — Primary: knowledge workers who find notification systems cognitively expensive. Secondary: teams who want shared ambient awareness of project state without synchronous check-ins.

**Model** — Subscription. Team tier adds shared ambient channels. Enterprise tier adds integration with project management tools.

**Why It's Real**
- Notification fatigue is a documented and worsening problem — the market is actively looking for alternatives
- The peripheral display pattern is validated in physical computing (ambient orbs, status lights) but not yet in software
- Hollowframe prototype confirmed the core interaction model works — people do notice ambient change without being interrupted by it

**Flags**
- Hardware dependency risk — the best ambient experience requires a dedicated display; software-only version is a compromise
- Signal quality is everything — if Glassbell delivers noise, it's worse than a standard notification because there's no badge count to ignore
- Pushwave is a dependency — Glassbell's delivery layer is not self-contained

**Synergy**
- **Driftmap** — shared interest in contextual awareness; Driftmap handles spatial context, Glassbell handles temporal/state context; possible combined ambient layer for location-aware teams
- **Frostline** — Frostline captures raw environmental signal; Glassbell presents it; natural pipeline from capture to ambient display

---

## Brief — 2026-05-01

Session established Pushwave as the delivery dependency and confirmed the experience layer is where the product value lives. Evaluated push vs pull: pull wins for ambient use cases because the user controls attention timing. Push creates interruption even when the content is low-priority.

Hollowframe absorption decision made this session. Hollowframe had been trying to build both the capture layer and the display layer simultaneously — scope was too broad. Peripheral display insight from Hollowframe is the keeper. Capture layer drops.

---

## Idea Capsule — 2026-04-10 *(original)*

**Name** — Glassbell
**One Phrase** — Notifications that don't interrupt
**Core Sentence** — A peripheral notification layer that informs without demanding attention.
**One Paragraph** — What if your notification system felt more like ambient sound than a phone ringing? Glassbell explores that question.

**Key Insights**
- Interruption is a cost, not a feature
- Peripheral awareness is underused in software

**User** — Anyone overwhelmed by notifications.

**Model** — Unknown.

**Why It's Real**
- Personal pain point
- Physical ambient displays already exist and work

**Flags**
- Unclear how to do this without hardware

**Synergy**
- None identified yet

---

## Action Log

**2026-05-20** — Evaluated push vs pull delivery. Pull wins for ambient use case — user controls when they attend to the signal. Push creates micro-interruptions even at low priority. Marked map_it: true after research completed.

**2026-05-01** — Hollowframe peripheral display prototype tested with three users. All three reported noticing ambient change without feeling interrupted. Core interaction model validated. Marked try_it: true.

---

## Decision Log

**2026-05-20** — Pull delivery model adopted. Glassbell polls for state changes on a configurable interval rather than receiving pushed events. Tradeoff: slight latency on delivery vs elimination of push-induced micro-interruptions. Latency acceptable for ambient use case.

**2026-05-01** — Hollowframe absorbed into Glassbell. Hollowframe's peripheral display insight survives. Hollowframe's capture layer dropped — out of scope. See hollowframe.md for full history.

---

## Open Questions Log

**2026-06-15** `open` — What is the minimum hardware requirement for a viable ambient display? Can a browser tab in a corner of the screen work, or does this require a dedicated device?

**2026-05-20** `open` — How do you define signal quality programmatically? The filtering layer needs criteria — what makes something worth ambient delivery vs worth suppressing?

**2026-05-01** `resolved` — Is peripheral display viable without dedicated hardware? Resolution: browser tab prototype is viable for early adopters willing to dedicate a screen region. Hardware version is the long-term product.
