---
name: FlightMutant
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
  - DiffMutant
  - ForecastMutant
  - MapMutant
  - RouteMutant
  - HypothesisEngine
  - The Current
actions:
  - description: "Two parallel tracks: Finish the personal tool — build Phase 2 and Phase 3 ; Investigate Expedia MCP integration — run the Todoist item this week"
    type: prototype
    state: open
    position: 1
---
## Idea Capsule — 2026-06-16

**Name** — FlightMutant

**One Phrase** — *Every Trip, All at Once*

**Core Sentence** — A flight search variation engine that takes a single natural language prompt describing a range of trip options and executes all the combinations automatically — returning ranked results with direct booking links and a savings delta against a baseline fixed route — solving the problem that a few flexible parameters explode into 50+ individual searches no human will actually run.

**One Paragraph** — You're flexible on dates, airports, and even destination — which means the trip you want is buried in fifty searches no human will ever run. FlightMutant takes one plain-language prompt, runs all the combinations automatically, and returns ranked results with booking links and a savings delta against a fixed baseline. The personal-use version is already a validated proof of concept with real API responses and savings of hundreds of dollars a ticket. It's the conceptual seed of the whole Mutant portfolio: combinatorial work that's prohibitive for people and trivial for machines.

**Key Insights**
- The entire Mutant portfolio thesis in one product — combinatorial work that's prohibitive for humans, tractable for machines; FlightMutant was the conceptual seed that produced the "what else behaves like a flight price?" question that led directly to DiffMutant and the broader portfolio
- Personal use and consumer product are different economic models, not the same product at different scales — personal use works because look-to-book ratio approaches 100%; consumer product fails because thousands of users run expensive matrix searches without buying
- Phase 1 is already validated — working POC built in Claude Code; SerpApi chosen over Amadeus; Claude Sonnet scoring flight payloads; real API responses seen
- Expedia MCP is the unresolved gate for consumer product — if MCP integration surfaces real-time pricing without direct API costs the look-to-book ratio problem may dissolve
- SMB and prosumer are underexplored entry points — corporate travel managers, small travel agencies, frequent business travelers have higher look-to-book ratios and established budget lines

**User**
- Primary (now): personal use — own travel planning; near-100% look-to-book ratio
- Secondary (near): prosumer and SMB — corporate travel managers, small travel agencies
- Tertiary (later): consumer product — contingent on resolving flight data layer economics

**Model**
- Personal use: free — API arbitrage on free/loss-leader tiers
- Prosumer/SMB: $1-$5 per search or subscription
- Consumer product: contingent on Expedia MCP or equivalent
- Phase 3 cloud deployment: Render or PythonAnywhere cron job; SendGrid email alerts only when deals found

**Why It's Real**
- Working POC exists — Phase 1 validated with real API responses; most technically proven idea in the session
- The problem is universal and viscerally understood
- Savings are concrete and large — $200-$400+ per ticket
- SerpApi free tier (250 queries/month) sufficient for personal use

**Flags**
- Flight data layer is the consumer product gate — paid APIs at scale have non-trivial cost structures; scraping is fragile and legally grey
- Look-to-book ratio problem is structural not incidental — don't build consumer infrastructure before the gate is resolved
- SerpApi's Google Flights data usage terms need review before commercial product
- Phase 2 and 3 still unbuilt — personal tool is not yet complete

**Synergy**
- DiffMutant — FlightMutant is the conceptual origin of DiffMutant; the relationship is generative not just synergistic
- ForecastMutant — price forecasting layer; "will this route get cheaper in the next two weeks?"
- MapMutant — geographic visualization of search results; destination alternatives plotted with price and savings delta
- RouteMutant — shared combinatorial variation instinct; different domain, identical underlying problem structure
- HypothesisEngine — portfolio thesis connection; both are expressions of the combinatorial work instinct
- The Current — travel captures, saved searches, booking history as a The Current corpus

---

## Brief — 2026-06-16

**Current stage** — Phase 1 POC validated with real API responses; personal use case proven; Expedia MCP investigation is the consumer product gate

---

## Action Log

---

## Decision Log

**2026-06-16** — Migrated from triage aggregate. Verdict: Dig In.

---

## Open Questions Log

