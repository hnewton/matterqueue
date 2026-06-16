---
name: DocMutant Robotics
type: concept
doc_level: brief
state: active
focus: false
try_it: true
map_it: true
todoist: false
created_date: 2026-06-16
modified_date: 2026-06-16
synergies:
  - Subtext
  - DiffMutant
  - HypothesisEngine
  - DataMutants
  - InsightMutant
  - RouteMutant
actions:
  - description: "One action before anything else: identify the first design partner"
    type: research
    state: open
    position: 1
  - description: Pre-deployment robotics startup, 10-30 person team, seed/Series A, actively testing policy before deployment
    type: task
    state: open
    position: 2
  - description: Conversation goal is task episode schema field validation not a pitch
    type: task
    state: open
    position: 3
---
## Idea Capsule — 2026-06-16

**Name** — DocMutant Robotics

**One Phrase** — *The CI/CD Pipeline for Robots*

**Core Sentence** — A document-to-task-schema extraction pipeline that ingests procedural robotics documents — manuals, safety standards, task specifications — and outputs simulator-agnostic task schemas that give pre-deployment robotics teams the structured scenario inputs they currently spend weeks building by hand, filling the confirmed gap between simulator availability and deployment-ready policy validation.

**One Paragraph** — Every robotics simulator exists, but nobody built the pipeline that feeds them — pre-deployment teams still spend weeks hand-building scenario inputs from manuals and safety standards. DocMutant Robotics is that missing pipeline: ingest the procedural documents, output simulator-agnostic task schemas, and give teams the structured inputs policy validation actually requires. The gap is confirmed by primary source, the buyer is a clean self-serve robotics startup, and the existing document-ingest stack makes a three-week solo prototype genuinely feasible. It's the CI/CD pipeline for robots, starting at the layer everyone skipped.

**Key Insights**
- The confirmed gap is the most important fact — RoboGate paper explicitly states no CI/CD equivalent exists in robotics; the gap is real, documented, and unaddressed commercially
- Feasible solo in 3 weeks — existing document ingest stack from Subtext/Siteframe work; Genesis World as v1 execution backend; laptop-capable; no robotics co-founder required for this phase
- Simulator-agnostic task schema is the strategic asset — output must be portable schema not simulator-specific scene files; preserves the path to any simulator backend and makes the product simulator-neutral from day one
- Self-serve buyer profile is unusually clean — pre-deployment robotics startups, 10-30 person teams, seed/Series A; credit card accessible; no enterprise sales required
- Design partner conversation is the actual next step — one robotics team conversation to validate task episode schema fields is worth more than any further architecture work
- Inversion pattern — most robotics tooling focuses on training and simulation setup; DocMutant Robotics focuses on the document-to-schema extraction that comes before simulation can even begin
- Sidecar not replacement — robotics teams keep their existing simulators; DocMutant Robotics feeds them
- ScenarioMutant is the destination not the product — scenario generation and variation engine is the intended next phase after DocMutant Robotics is validated; requires robotics co-founder or design partner for physics validation layer; do not conflate the two

**User**
- Primary: pre-deployment robotics startups (10-30 person teams, seed/Series A) needing policy validation infrastructure before shipping; credit card buyers, no procurement required
- Secondary: robotics research teams at universities and labs needing systematic scenario inputs for policy evaluation
- Tertiary: larger robotics companies wanting to systematize their document-to-simulation pipeline

**Model**
- Self-serve SaaS — subscription access to extraction pipeline; credit card accessible; no enterprise sales
- Usage-based layer — schema generation volume, simulator backend integrations, API calls
- Design partner engagements — early paid access in exchange for schema validation and feedback; forensic-first instinct; revenue from day one
- ScenarioMutant upgrade path — DocMutant Robotics as entry product; ScenarioMutant as destination when co-founder or design partner materializes

**Why It's Real**
- Two dedicated sessions with full architecture defined
- Competitive gap confirmed by primary source — RoboGate paper explicitly names the CI/CD gap
- Genesis World plugin architecture confirmed — Apache 2.0; building on it is intended use; laptop-capable
- Existing ingest stack available — Subtext/Siteframe document ingestion infrastructure is the foundation
- 3-week prototype is genuinely feasible — existing stack, clear output format, single execution backend
- No direct competitor at this layer — Kashikoi (YC) is closest but focused on digital/software testing

**Flags**
- DocMutant naming collision with Subtext — must be resolved before either product is publicly named; highest priority naming decision in the portfolio; options: SchemaMutant, TaskMutant, ProcMutant
- Task episode schema fields not yet validated — design partner conversation is the prerequisite
- Design partner identification is the actual blocker — all further architecture is lower value than one conversation with one robotics team
- ScenarioMutant physics validation not feasible solo — do not attempt without robotics co-founder or design partner
- Company/platform name unresolved — VariantRobotics rejected; Variantics undecided; trademark checks pending
- Kashikoi (YC) monitoring required — if expands to physical robotics, becomes first direct competitor

**Synergy**
- Subtext — shared document ingest and structure extraction infrastructure; same engine, different output schema and domain; naming collision needs resolution
- DiffMutant — drift detection across schema versions and policy results over time
- HypothesisEngine — shared validation instinct; rules that survive backtesting in trading are structurally identical to robot policies that survive scenario variation testing
- DataMutants — commercial delivery vehicle for design partner engagements
- InsightMutant — intake conversation before design partner engagement
- RouteMutant — shared forensic-first engagement model; paid design partner access generates revenue while validating the schema format

---

## Brief — 2026-06-16

**Current stage** — Two dedicated sessions with full architecture defined; competitive gap confirmed by primary source (RoboGate paper); build sequence, simulator stack, buyer profile all documented; blocked only by design partner identification and naming collision resolution

---

## Action Log

---

## Decision Log

**2026-06-16** — Migrated from triage aggregate. Verdict: Dig In.

---

## Open Questions Log

