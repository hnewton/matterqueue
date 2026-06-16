---
name: RouteMutant
type: concept
doc_level: brief
state: active
focus: false
try_it: false
map_it: false
todoist: false
created_date: 2026-06-16
modified_date: 2026-06-16
uses:
  - Temporal pattern engine
synergies:
  - InsightMutant
  - DiffMutant
  - ForecastMutant
  - DataMutants
  - HypothesisEngine
  - MapMutant
actions:
  - description: One conversation with one mobile vet or field service operator before anything else
    type: task
    state: open
    position: 1
  - description: Not a pitch — a listening session
    type: task
    state: open
    position: 2
  - description: What historical data do they actually have?
    type: task
    state: open
    position: 3
---
## Idea Capsule — 2026-06-16

**Name** — RouteMutant

**One Phrase** — *Your Routes Already Know*

**Core Sentence** — A route intelligence and pattern advisory system that runs as a sidecar to existing workflows for mobile field operators — extracting the patterns already embedded in their historical route data, making them legible through a paid forensic report, and compounding them into a subscription intelligence layer that surfaces proactive suggestions before the route runs and flags anomalies as they emerge.

**One Paragraph** — Field operators — mobile vets, crop scouts, service techs — know their scheduling feels wrong but can't prove why, while the answer sits unread in their own historical route data. RouteMutant runs as a sidecar to whatever they already use, reads that history back as a paid forensic report, then compounds into a subscription that surfaces the next best move before the route runs. The forensic-first model is the trick: the thing customers pay for is the thing that generates the data the product needs, so there's no cold start. It's DiffMutant's playbook pointed at routes, and the pattern library quietly becomes the platform.

**Key Insights**
- Sidecar not platform — operators keep using whatever tools they already use; RouteMutant runs alongside, learns from historical data, surfaces intelligence back; no behavior change required; adoption is frictionless, churn is nearly costless
- Forensic-first phase is both revenue model and data acquisition strategy simultaneously — Phase 0 is paid consulting that produces the corpus Phase 1 needs; most data businesses give something away to get data; RouteMutant charges for the thing that generates it
- Bayesian not deterministic — not solving a full Vehicle Routing Problem; updating beliefs from historical patterns and surfacing the next best decision; this framing reduces scope and sets correct expectations with operators
- Pricing the forensic report as a no-brainer is the most important pre-build decision — $500-$2,000 is the probable zone depending on what the operator believes the problem costs them; operator's perceived cost of the problem determines willingness to pay
- InsightMutant provides the interpretive frame before data is touched — without intake conversation, pattern-matching produces patterns without meaning; with it, the forensic pass looks for evidence of specific operator-named priorities; the difference between a pattern library and a meaningful pattern library
- Pattern library compounds with every engagement — anonymized patterns from mobile vets in one region inform forensic analysis for mobile vets in another; the library is the platform play hiding inside the sidecar
- ICP fuzziness is the real flag — "mobile vet" is a vertical not yet a buyer with a budget line and procurement pattern; warm relationship compresses the sales cycle from months to weeks
- Warm relationship is the real unlock in a fuzzy ICP market — a personal connection with one operator is worth more than any cold outreach strategy

**User**
- Primary: mobile veterinarians doing farm calls and large-animal visits
- Secondary: crop scouts, field sales representatives, field service technicians
- Tertiary: operations managers at organizations running field teams

**Model**
- Phase 0: paid forensic report — $500-$2,000 per engagement; revenue from day one
- Phase 1: subscription — encoded patterns become knowledge base; periodic data sync; anomaly flagging
- Phase 2: advisor layer — proactive suggestions before route runs; premium subscription tier
- Phase 3: real-time sidecar — live re-evaluation as stops complete; earned phase only
- Pattern library licensing — anonymized cross-operator patterns licensed to vertical software platforms

**Why It's Real**
- Deep existing session with four-phase build arc fully defined
- DiffMutant forensic playbook maps directly — same pattern extraction approach, same paid-first engagement model
- Forensic-first eliminates the cold start problem
- InsightMutant intake conversation already designed and available
- Sidecar positioning removes the single biggest adoption barrier in field operations software

**Flags**
- ICP fuzziness is the primary risk — buyer profile, budget line, and procurement pattern not yet established
- DiffMutant goes first — ICP is cleaner; RouteMutant is Q3 or later unless warm relationship exists
- Forensic report concrete deliverable not yet defined for mobile vet vertical
- Pricing not validated

**Synergy**
- InsightMutant — intake conversation before forensic phase
- DiffMutant — RouteMutant is DiffMutant applied to route sequences; same forensic playbook, different domain; DiffMutant goes first
- ForecastMutant — forward suggestions in Phase 2 are Bayesian forecasts applied to route sequencing
- DataMutants — commercial delivery vehicle for forensic phase
- HypothesisEngine — pattern validation methodology is structurally identical
- MapMutant — route visualization layer; forensic report rendered as geographic map

---

## Brief — 2026-06-16

**Current stage** — Deep existing session with four-phase build arc fully defined, target verticals identified, sidecar positioning validated; ICP validation needed before proceeding

---

## Action Log

---

## Decision Log

**2026-06-16** — Migrated from triage aggregate. Verdict: Dig In.

---

## Open Questions Log

