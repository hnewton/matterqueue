---
name: ThinkMutant
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
  - The Current
  - Subtext
  - Siteframe
  - InsightMutant
  - Trail System
  - EF Coach
  - ForecastMutant
  - HypothesisEngine
actions:
  - description: Do the XMind post-mortem first
    type: task
    state: open
    position: 1
  - description: Then identify the single render mode that best demonstrates the data/presentation separation in a one-day prototype — argument map or affinity cluster are the strongest candidates
    type: prototype
    state: open
    position: 2
---
## Idea Capsule — 2026-06-16

**Name** — ThinkMutant

**One Phrase** — *The X-Ray for Ideas*

**Core Sentence** — A visual thinking and structure tool that separates the data layer from the presentation layer — taking the same underlying idea graph and rendering it as mind map, outline, affinity cluster, argument map, network graph, or decision matrix depending on what the moment requires — tactile and playful to interact with, revealing structure rather than imposing it, and serving as the visual synthesis layer for The Current and other engines in the ecosystem.

**One Paragraph** — Every set of ideas has a skeleton, but tools like Miro and XMind hand you a blank canvas and shapes and never understand what you put in them. ThinkMutant separates the idea graph from how it's shown, so the same content renders as a mind map, an outline, an affinity cluster, or an argument map — change the view and you see something new without losing anything. It reveals the structure already latent in your thinking instead of making you drag it into existence, and it does it in a way that's tactile and genuinely fun. Standalone it's a thinking tool; underneath it's the visual synthesis layer for The Current and the rest of the ecosystem.

**Key Insights**
- Separating data from presentation is the core architectural decision — the idea graph is stable underneath; the mind map, outline, affinity cluster, and argument map are all render modes of the same content; changing the view reveals something new without losing anything
- Reveals structure rather than imposing it — current tools treat structure as something you drag into existence; ThinkMutant watches what you're putting in and surfaces the hierarchy, clusters, and connections already latent in the content
- Tactile and playful is the interaction philosophy — ideas that have weight, that snap together when they belong together; the dopamine hit of watching structure emerge from chaos
- DJ/Journalist/Explorer are The Current synthesis modes that produce ThinkMutant outputs — ThinkMutant is the canvas those modes render onto
- Engine and product simultaneously — standalone consumer/prosumer tool; also the visualization engine Subtext, The Current, and other ecosystem products draw on
- Mix and match mechanism as named mode — combinatorial remixing of idea elements; InsightMutant questions define the elements before remixing starts
- NotebookLM comparison sharpens the position — NotebookLM generates read-only, flat, non-interactive mind maps; ThinkMutant is the opposite on every dimension

**User**
- Primary: knowledge workers, researchers, writers, strategists who think visually and find current tools experientially dead
- Secondary: The Current users wanting a visual synthesis layer for their captured attention corpus
- Tertiary: teams running brainstorms, post-mortems, decision sessions, workshops

**Model**
- Freemium consumer — free core with basic render modes; premium for advanced views, collaboration, ecosystem integrations
- The Current integration — native synthesis surface; ThinkMutant session outputs feed The Current corpus automatically
- API/engine layer — visualization engine licensed to Subtext, Siteframe, and other ecosystem products
- Team/workspace tier — collaborative thinking sessions; shared canvases; workshop facilitation mode

**Why It's Real**
- XMind, Miro, MindNode, Whimsical, FigJam all exist and all miss the point — they provide a canvas and shapes but don't understand what's in the canvas
- NotebookLM's mind maps prove demand exists but also prove how far short current implementations fall
- Data/presentation separation is technically achievable now
- The Current needs a visual synthesis layer

**Flags**
- Product or engine sequencing decision deferred — standalone product and ecosystem engine are both valid; market and build sequence should decide
- Interaction model is the hardest design problem — tactile and playful is an experience quality, not a feature; requires serious design investment
- XMind post-mortem not yet done — understanding exactly where it failed shapes what ThinkMutant must do differently
- Competitive landscape underspecified — Miro, Mural, FigJam, Whimsical, Obsidian Canvas, Heptabase, Scrintal all occupy adjacent territory

**Synergy**
- The Current — ThinkMutant is The Current's visual synthesis layer; DJ, Journalist, Explorer modes render onto ThinkMutant canvas
- Subtext — shares the visualization engine; Subtext ingests document corpora, ThinkMutant renders the revealed structure
- Siteframe — document ingest layer overlap; property documents rendered as structured visual profile
- InsightMutant — mix and match mechanism uses InsightMutant to define elements; Coach mode powered by InsightMutant's questioning engine
- Trail System — conversation trail as linear record; ThinkMutant as X-ray of the same conversation showing argument structure
- EF Coach — ThinkMutant as thinking scaffold; visual structure reduces cognitive load
- ForecastMutant — scenario cards rendered as ThinkMutant visualizations
- HypothesisEngine — hypothesis library browsable as a ThinkMutant network graph

---

## Brief — 2026-06-16

**Current stage** — Concept well developed; data/presentation separation confirmed as core architecture; product vs. engine sequencing deferred; XMind post-mortem not yet done

---

## Action Log

---

## Decision Log

**2026-06-16** — Migrated from triage aggregate. Verdict: Dig In.

---

## Open Questions Log

