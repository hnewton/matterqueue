---
name: Driftmap
type: concept
doc_level: brief
state: active
focus: false
try_it: false
map_it: true
todoist: false
created_date: 2026-05-15
modified_date: 2026-06-15
synergies:
  - Glassbell
  - Frostline
actions:
  - description: Write positioning doc against Google Maps and Felt
    type: task
    state: open
    queued: true
    position: 1
  - description: Survey existing collaborative mapping tools
    type: research
    state: done
    position: 2
  - description: Define the core use case — navigation or annotation?
    type: decision
    state: open
    position: 3
---

## Idea Capsule — 2026-05-15

**Name** — Driftmap
**One Phrase** — Collaborative maps that evolve with your understanding
**Core Sentence** — Driftmap is a shared spatial canvas where teams annotate, interpret, and update their understanding of a territory over time — not a navigation tool but a living document of what a place means to a group.
**One Paragraph** — Maps are usually made once and treated as authoritative. Driftmap starts from the opposite premise: the map is always provisional, always being revised by the people who use the territory. A field team adds observations. A strategist adds interpretation. A newcomer adds questions. The map accumulates understanding rather than just location data — and that accumulated understanding is the product.

**Key Insights**
- The gap is between navigation tools (Google Maps, Apple Maps) and annotation tools (Felt, Miro) — Driftmap lives in that gap
- Temporal layering is the key feature — seeing how the map changed over time is more valuable than seeing the current state alone
- The use case is teams with ongoing relationship to a geography: field researchers, real estate operators, community organizers

**User** — Primary: small teams (5–20) with ongoing relationship to a specific geography. Secondary: individual researchers or journalists mapping a developing story.

**Model** — Team subscription. Pricing per active map or per seat — not yet decided.

**Why It's Real**
- Felt proved there is appetite for collaborative web-based mapping — but Felt is annotation on top of navigation; Driftmap is interpretation-first
- The temporal layer is absent from every tool surveyed — no tool shows you the history of how a team's understanding of a place evolved

**Flags**
- Geography as a constraint may be too narrow — most collaboration tools work across domains; Driftmap is spatial-only
- The core use case (navigation vs annotation) is not yet resolved — this is a decision gate before any prototype work

**Synergy**
- **Glassbell** — shared interest in contextual awareness; Driftmap handles spatial context, Glassbell handles state/temporal context; possible combined layer for location-aware teams
- **Frostline** — Frostline's capture layer could feed raw observations directly into a Driftmap annotation layer

---

## Brief — 2026-05-15

Initial exploration session. Surveyed the mapping tool landscape: Google Maps (navigation), Felt (lightweight collaborative annotation), Mapbox (developer platform), Miro with map templates (generic canvas). None treat the map as a living interpretive document. The gap is real.

Key unresolved question: is the core use case navigational (getting somewhere) or interpretive (understanding a place)? These lead to very different products. Navigational requires routing, real-time data, mobile-first. Interpretive requires rich annotation, version history, and a desktop-first reading experience. Must resolve before prototype.

---

## Action Log

**2026-05-20** — Completed landscape survey. Felt is the closest competitor but is annotation-on-navigation rather than interpretation-first. No tool found with temporal layering of team understanding. Gap confirmed. Marked map_it: true.

---

## Decision Log

---

## Open Questions Log

**2026-05-15** `open` — Navigation vs annotation as the core use case: which is primary? This determines the entire product architecture. Resolve before any prototype work begins.

**2026-05-15** `open` — Is geography as a constraint a strength (focus) or a weakness (narrow market)? Compare to tools that work across domains.
