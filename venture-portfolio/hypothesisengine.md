---
name: HypothesisEngine
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
  - ForecastMutant
  - DiffMutant
  - DataMutants
  - InsightMutant
  - HeadSim
  - The Current
actions:
  - description: Re-enter existing conversation
    type: task
    state: open
    position: 1
  - description: Integrate Austin conversation constraints
    type: task
    state: open
    position: 2
  - description: Confirm current stage of six-stage pipeline
    type: task
    state: open
    position: 3
---
## Idea Capsule — 2026-06-16

**Name** — HypothesisEngine

**One Phrase** — *Hypotheses That Survive*

**Core Sentence** — A systematic hypothesis generation and validation engine that separates trade idea creation from trade selection, uses AI and adversarial generation to produce rule candidates from structural market logic, validates them through vectorized backtesting and rigorous statistical methods, and maintains a browsable living library of rules ranked by performance — expressed first in EURUSD and SPY, designed from day one to repoint at any time-series domain.

**One Paragraph** — Most systematic trading fails by conflating two different jobs: generating a trade idea and deciding which triggers to actually take. HypothesisEngine separates them — AI and adversarial generation produce rule candidates from structural market logic, rigorous vectorized backtesting with multiple-comparison corrections decides which survive, and a living library ranks the winners by performance, while the human never touches the fragile middle. Built first for EURUSD and SPY, it's architected from day one to repoint at any time-series domain, from volatility to vibration sensors. AI generates the candidates; statistics decides the survivors.

**Key Insights**
- The core architectural distinction: separate the trade idea from the trade selection — a rule may trigger 30 times a day; whether you take the first 10, the best-positioned 5, or apply a daily limit is a separate filter layer sitting above the idea library; conflating these is where most systems fail
- Two distinct engines: Idea Engine (generates, validates, stores rules) and Trade Filter (decides which triggered instances to actually execute) — these must be architected and reasoned about independently
- The automatic loop is the generative heart — Generate → Mark → Optimize → Refine → Generate again; GAN-style adversarial validation where one model generates ideas and another hunts for their failure conditions is more robust than passive backtesting
- Hitting percentage vs. slugging percentage is the performance frame — 75% win rate with 1:1 risk-reward is the baseline constraint filter
- Inversion pattern is strong — starts from structural edge sources (behavioral bias, institutional flow, information lag, liquidity gaps, regime persistence) rather than recycling published indicators
- Vectorized approach is the speed unlock — Python/NumPy vectorization means thousands of hypotheses evaluated against full historical datasets in seconds
- Walk-forward validation with Benjamini-Hochberg and Bonferroni corrections — multiple comparison problem solved by design
- Domain adapter layer is the real asset — TemporalPatternEngine repointed at SPY, other instruments, vibration sensors, regulatory monitoring through clean adapter interfaces

**User**
- Primary: systematic traders building rule-based strategies without a full quant team — own account first
- Secondary: DataMutants as internal user — same validation infrastructure for commercial data science projects
- Tertiary: industrial and regulatory domains via adapter layer — vibration/IoT anomaly detection, compliance signal detection

**Model**
- Personal use first — own trading account; real financial feedback proves the engine
- DataMutants deployment — commercial expression for client projects
- Potential SaaS later — hypothesis validation as a service
- Domain licensing — adapter layer licensed to industrial or regulatory applications

**Why It's Real**
- Deep existing conversation with six-stage pipeline, hypothesis library H001-H018, closed-loop automation, and tech stack already defined
- TemporalPatternEngine with domain-agnostic adapter layer already architecturally specified
- Python/Pandas/NumPy/scikit-learn/hmmlearn stack proven and available
- Dukascopy for EURUSD historical data; Alpaca/Interactive Brokers for execution
- Benjamini-Hochberg and Bonferroni corrections solve multiple comparison problem — most retail systems ignore this; genuine differentiator
- Personal investment background; first and most honest user

**Flags**
- Feasibility risk is named explicitly — not certain the full automatic loop is achievable at the quality level required; one complete cycle end-to-end before expanding
- Premature generalization — adapter layer ambition is correct but trading expression must produce validated rules before repointing
- Overfitting is existential — walk-forward validation and multiple comparison corrections are the guard; withhold test data architecture (rolling vs. anchored vs. blocked cross-validation) is an open architecture decision
- Execution infrastructure (broker API, live deployment) is a different complexity class from backtesting — sequence carefully
- SPY vs. EURUSD should not be mixed in the same validation pass without explicit regime separation
- Austin conversation not yet integrated

**Synergy**
- ForecastMutant — shared PatternMutant engine; HypothesisEngine is the trading expression, ForecastMutant is the operational forecasting expression
- DiffMutant — HypothesisEngine is DiffMutant's primary concrete expression; adapter layer architecture is how DiffMutant should be built across all domains
- DataMutants — commercial delivery vehicle; same validation infrastructure deployed for client projects
- InsightMutant — hypothesis generation upstream; AI asking structural "what conditions create an edge?" is an InsightMutant-pattern applied to markets
- HeadSim — behavioral bias is both the trading edge source (stop hunts, bull/bear traps) and the HeadSim cognitive simulation curriculum; same bias library, two products; HeadSim was formerly Mindmarket
- The Current — trading review logs, hypothesis performance history, rule evolution over time as corpus

---

## Brief — 2026-06-16

**Current stage** — Deep existing conversation with six-stage pipeline, hypothesis library H001-H018, closed-loop automation, and tech stack already defined; Austin conversation not yet integrated

---

## Action Log

---

## Decision Log

**2026-06-16** — Migrated from triage aggregate. Verdict: Dig In.

---

## Open Questions Log

