---
name: MapMutant
type: concept
doc_level: brief
state: active
focus: false
try_it: true
map_it: false
todoist: false
created_date: 2026-06-16
modified_date: 2026-06-16
synergies:
  - ForecastMutant
  - DiffMutant
  - Siteframe
  - DataMutants
  - Groundtruth
  - Pebble
  - RouteMutant
  - StationPing
actions:
  - description: "Answer the two open questions before building anything: Are there CRE maps or processes that are genuinely hated?"
    type: prototype
    state: open
    position: 1
  - description: That answer shapes the CRE entry point
    type: task
    state: open
    position: 2
  - description: Can data cleaning and enrichment be automated sufficiently to remove the clean data problem as a flag?
    type: task
    state: open
    position: 3
---
## Idea Capsule — 2026-06-16

**Name** — MapMutant

**One Phrase** — *Living Maps*

**Core Sentence** — An AI-powered map generator and persistent geographic intelligence layer that takes the same underlying geography and re-expresses it endlessly to match the question being asked, the audience being addressed, or the data that just changed — democratizing map creation for non-technical users while providing geo drift monitoring, alerts, and spatial intelligence for SME, CRE, and civic verticals.

**One Paragraph** — Most organizations still work with maps that look like 2003 — a static JPEG exported from QGIS and emailed around. MapMutant lets anyone describe what they need and get a map in seconds, then — the more powerful half — watches that geography mutate as the world changes, flagging the competitor that just opened or the catchment that just shifted. The creation tool spreads city by city as its own advertisement; the recurring revenue lives in the intelligence layer, a trivially cheap monthly digest against the hours spent checking manually. One engine, two buyers, one viral loop.

**Key Insights**
- Two products in one architecture — MapMutant as creation tool (Canva for maps, viral distribution, non-technical self-service) and MapMutant as intelligence layer (geo drift, persistent monitoring, alerts, recurring revenue); same engine, different entry points for different buyers
- Geo drift is the more powerful idea — a map that mutates as the world changes is categorically different from a map that expresses data differently at a single moment; SME competitor tracking, CRE catchment monitoring, and civic planning alerts are all geo drift in practice
- Geo IP encoding as a quiet capability — IP-to-geography translation enables website visitor mapping, regional demand heatmaps, catchment analysis from digital traffic; small feature, large surface area
- The recurring revenue lives in the intelligence layer, not the creation tool — £19/month SME spatial digest is trivial against the time currently spent manually checking competitor locations; stickiness compounds with every alert that proves its value
- The output is the ad — geographic virality compounds city by city; a council publishes a liveability map, a café owner in another city sees it, gets their own in 3 minutes, shares it; Canva's loop applied to maps
- ForecastMutant integration point — spatial forecasting is one of ForecastMutant's three forecast types; MapMutant is the natural rendering layer
- The recurring revenue lives in the intelligence layer, not the creation tool

**User**
- Primary: SME owners with persistent geographic anxiety — who's opening near me, what's changing in my catchment
- Secondary: non-technical policy analysts, urban planners, community organizers
- Tertiary: CRE brokers, asset managers, civic organizations

**Model**
- Freemium creation tool — free map generation with watermark (viral distribution mechanic); premium removes watermark, adds layers, enables presets
- SME monitoring subscription — weekly spatial digest, competitor alerts, catchment drift; £19/month per location; recurring, sticky
- SME monitoring subscription — weekly spatial digest, competitor alerts, catchment drift; £19/month per location
- CRE vertical — site analysis, tenant mix visualization; higher price point
- Civic/government — grant-fundable, institutional licensing
- Data enrichment API — DataMutants delivery vehicle

**Why It's Real**
- Deep existing session with 25 use cases fit-scored
- The old way is genuinely broken — static JPEG exported from QGIS, embedded in PDF, emailed
- SME spatial anxiety is universal and underdressed
- Geographic virality has proven precedent
- ForecastMutant and DiffMutant share infrastructure

**Flags**
- Consumer vs. enterprise tension not resolved — entry point decision needed before building
- Clean data is the foundational risk — automated enrichment feasibility not yet validated
- CRE vertical overlaps with Siteframe — complements confirmed directionally; integration points need explicit specification
- Go-to-market entry point (creation tool vs. intelligence layer) is an open decision

**Synergy**
- ForecastMutant — rendering layer for spatial forecasts
- DiffMutant — geo drift is DiffMutant applied to spatial data streams
- Siteframe — CRE vertical is complement not duplicate; Siteframe is property intelligence, MapMutant is geographic context
- DataMutants — data cleaning and enrichment pipeline
- Groundtruth — geographic fact-checking layer
- Pebble — tactical urbanism projects are inherently geographic; MapMutant as planning and communication layer
- RouteMutant — route visualization output surface
- StationPing — transit system maps, zone maps, neighborhood maps all rendered through MapMutant

---

## Brief — 2026-06-16

**Current stage** — Deep existing session; 25 use cases fit-scored; SME tracking angle developed; viral loop identified as primary distribution mechanism; go-to-market entry point (creation tool vs. intelligence layer) is an open decision

---

## Action Log

---

## Decision Log

**2026-06-16** — Migrated from triage aggregate. Verdict: Dig In.

---

## Open Questions Log

