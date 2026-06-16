---
name: Frostline
type: concept
doc_level: capsule
state: active
focus: true
try_it: false
map_it: false
todoist: false
created_date: 2026-06-01
modified_date: 2026-06-15
synergies:
  - Glassbell
  - Driftmap
actions:
  - description: Build capture widget prototype
    type: prototype
    state: open
    queued: true
    position: 1
  - description: Define the minimum viable capture event schema
    type: task
    state: open
    position: 2
---

## Idea Capsule — 2026-06-01

**Name** — Frostline
**One Phrase** — Passive environmental capture for teams in the field
**Core Sentence** — Frostline runs quietly in the background and captures environmental signals — location, weather, time, device state — so field teams don't have to log context manually.
**One Paragraph** — The hardest part of fieldwork is capturing what's happening while you're focused on doing it. Frostline solves this by running as a background process that logs environmental signals automatically: where you are, what the conditions are, what your device registers. The raw log is not the product — it's the feedstock. Frostline's output flows into whatever tool the team uses to interpret the field: Driftmap for spatial context, Glassbell for ambient display, or a plain CSV for everything else.

**Key Insights**
- Passive capture is more reliable than active logging — people forget to log; sensors don't
- The value is in the feedstock, not the capture tool — Frostline is an ingredient, not a finished product
- Schema design is the critical early decision — what events are captured, in what format, determines what downstream tools can do with it

**User** — Primary: field researchers, environmental monitors, location-based operations teams. Secondary: any team whose work has a physical context that currently goes undocumented.

**Model** — Usage-based or team subscription. Pricing per captured event volume or per active device. Integration marketplace as a secondary revenue layer.

**Why It's Real**
- Manual field logging is universally acknowledged as a pain point in fieldwork contexts
- Sensor APIs on mobile devices are mature and accessible — the capture layer is technically straightforward
- Driftmap and Glassbell both have natural integration points that create immediate use cases for Frostline output

**Flags**
- Battery and privacy concerns — background capture raises both; must be opt-in and transparent
- Without a downstream integration, Frostline is just a log file — value depends on what it connects to
- Schema lock-in risk — whatever schema is chosen early will be hard to change once downstream tools depend on it

**Synergy**
- **Glassbell** — Frostline captures; Glassbell presents; natural pipeline from environmental signal to ambient display
- **Driftmap** — Frostline captures field observations; Driftmap annotates and interprets them; strongest integration case

---

## Action Log

---

## Decision Log

---

## Open Questions Log

**2026-06-01** `open` — What is the minimum viable capture event schema? Location + timestamp is obvious. Weather, device state, network conditions — which of these are worth capturing by default vs on request?

**2026-06-01** `open` — How does Frostline handle consent and transparency? Background capture requires clear user awareness. What does the consent model look like?
