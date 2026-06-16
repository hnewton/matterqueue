---
name: Matterqueue
type: concept
doc_level: compilation
state: active
focus: true
try_it: true
map_it: false
compilation: true
build_doc: true
todoist: false
created_date: 2026-06-15
modified_date: 2026-06-16
synergies:
  - The Current
  - ThinkMutant
  - Trail System
  - CoachingEngine
uses:
  - QuestionEngine
  - CoachingEngine
actions:
  - description: Build matterqueue-core.js shared module
    type: task
    state: done
    position: 1
  - description: Build viewer HTML against hand-crafted test MDs
    type: prototype
    state: done
    position: 2
  - description: Verify schema against viewer — adjust if gaps surface
    type: decision
    state: done
    position: 3
  - description: Build migration tool HTML
    type: task
    state: done
    position: 4
  - description: Run migration pass against aggregate and index
    type: task
    state: done
    position: 5
  - description: Verify viewer against migrated MDs and close index
    type: prototype
    state: open
    queued: true
    position: 6
  - description: Write instructions MD
    type: task
    state: open
    queued: false
    position: 7
  - description: Add /compile command to essential-prompts
    type: task
    state: open
    queued: false
    position: 8
  - description: Test Change 5 hard-gate behavior in essential-prompts
    type: research
    state: open
    queued: false
    position: 9
  - description: Design domain template for venture portfolio as reference implementation
    type: task
    state: open
    queued: false
    position: 10
  - description: Create CoachingEngine spark MD
    type: task
    state: done
    position: 11
  - description: Evaluate Matterqueue as product for teams
    type: research
    state: open
    queued: false
    position: 12
---
## Idea Capsule — 2026-06-15

**Name** — Matterqueue

**One Phrase** — Your concept portfolio, always build-ready

**Core Sentence** — Matterqueue gives founders and operators a local markdown-based system where every idea, engine, and workflow lives in its own file — with typed front matter, a derived build queue, and a local HTML viewer that makes the portfolio legible and actionable without a database, a server, or a subscription.

**One Paragraph** — Most concept portfolios are either flat lists that don't mature or complex tools that add overhead. Matterqueue is a folder of markdown files — one per concept — where front matter carries structured state (depth, lifecycle, actions, relationships) and a local HTML viewer derives the build queue, graph view, and action queue directly from the files. Nothing is maintained separately. The queue is always current because it is always derived. Built first for a single founder portfolio, it is also the prototype for a team product.

**Key Insights**
- The build queue is derived, never maintained — position field in front matter plus viewer sort equals the queue; no separate task tool required
- Signal Queue feeding Build Queue is the core architecture — concept maturation is distinct from execution; this is the product's argument against flat backlog tools
- Individual MD files replace aggregate documents — the aggregate was a snapshot; the MDs are live
- The viewer is local HTML using File System Access API — no install, no npm, no server; lives in Dropbox alongside the MDs
- Stage 1 build is also the product prototype — building for self and building the product are the same act

**User** — Primary: solo founder or operator managing a concept portfolio across multiple domains. Secondary: small team (post Stage 1) where shared visibility into concept maturation and build queue matters.

**Model** — Stage 1: personal tool, no monetization. Product path: subscription for team version with multi-user sync, shared queue, and conflict resolution layer. Matterqueue-as-pattern is also licensable — the architectural approach (MD-as-document-store, derived queue, typed front matter) has application beyond venture portfolios.

**Why It's Real**
- Built and validated the pattern through personal use — the aggregate and index documents this system replaces were already being maintained manually; the pain is demonstrated
- No tool found that manages concept maturation with depth tracking, absorption relationships, compilation history, and validation state — gap confirmed through market scan
- Backlog.md is the closest architectural cousin — same MD-as-document-store pattern — but execution-only, no concept maturation layer
- File System Access API is stable in Chrome and handles the local read/write requirement without infrastructure
- Dropbox file-level sync is reliable with plain text — the deployment target is already in use

**Flags**
- Chrome-only constraint confirmed — File System Access API verified stable in Chrome 86+; Chrome is the designated tool
- YAML parsing reliability mitigated — round-trip validation in write-back spec; 55-test suite including adversarial YAML cases passing
- Single-user architecture is a deliberate Stage 1 constraint — multi-user adds conflict resolution complexity that should wait until Stage 1 is proven

**Synergy**
- **The Current** — raw captures prototype; eventual absorption relationship where The Current feeds signal into Matterqueue concept MDs as structured front matter
- **ThinkMutant** — graph and clustering views in Matterqueue viewer are early version of what ThinkMutant will do at scale; Matterqueue is the data layer ThinkMutant will query
- **Trail System** — Chat Index is its chat-indexing aspect: starred conversations become concept MDs; Trail System is the retrieval layer for session history that Matterqueue references but doesn't replace; post Stage 1 integration

---

## Brief — 2026-06-16

### Sessions 4–6 — 2026-06-16 (Schema verification, acceptance tests, migration tool + run)
Schema verified against the viewer in Chrome and locked at v1.4 (actions allowed at spark). Viewer hardened across Sessions 4–5: folder-handle persistence via IndexedDB with auto-restore, sync log persisted to _synclog.json, drag-to-reorder for actions and Focus, "Depends on"/"Used in" derivation with autocomplete, and the appendLog duplicate-key bug fixed. Playwright acceptance suite added — 69 tests across 10 groups. Migration tool (matterqueue-migrate.html) built in Claude Code as an aggregate-driven, single-file tool sharing matterqueue-core.js; verified headlessly against the real aggregate and index, then run: 61 MDs generated into venture-portfolio (49 ideas + 12 engines), _queue.json reset to empty, _review.md produced. One Paragraph drafted per idea for human review; named engines from the aggregate's Section 1 map created as spark MDs with distrust notes. Fictional test corpus (Glassbell etc.) removed. QuestionEngine and CoachingEngine spark MDs created to resolve Matterqueue's uses: references.

---

## Brief — 2026-06-15

### Session 1 — 2026-06-14 (Design session)
Named and designed Matterqueue. Retired Foldqueue. Confirmed six domains. Established Signal Queue → Build Queue as core architecture. Settled that aggregate and index are snapshots — individual MDs carry forward. Confirmed HTML viewer in Chrome using File System Access API. Established Dropbox as deployment target. Identified three pre-build technical problems: front matter schema, migration pass design, write-back mechanism.

### Session 2 — 2026-06-15 (Pre-build spec session)
Resolved all three pre-build problems. Full front matter schema locked at v1.3: spark/capsule/brief/compilation doc levels; active/parked/absorbed/retired states; actions with open/blocked/done states and queued boolean; uses: and synergies: as front matter relationship fields; compilation: and build_doc: boolean flags signaling external artifacts; _queue.json for global queue order. Compilation document and Build doc established as external artifacts — not body sections. Migration pass design complete — two-pass (generate then audit), batch confirmation mode, standalone HTML tool, _review.md three-tier gap report. Write-back mechanism design complete — diff/Sync model, YAML round-trip validation, content hash conflict detection, shared matterqueue-core.js module. Applied six essential-prompts amendments. CoachingEngine surfaced as new concept — needs spark MD.

### Session 3 — 2026-06-15 (Build session)
Stage 1 build begun. matterqueue-core.js built and verified: 55 tests passing including 15 adversarial YAML round-trip cases. Write-back spec amended to v1.3: simplified conflict resolution (one prompt, safe default), partial Sync failure reporting (named file list), body append heading-not-found changed to explicit warning, Dropbox version history established as explicit safety net, viewer view architecture formally defined. Test corpus built: 9 fictional MDs (Glassbell, Driftmap, Frostline, Vaultmoth, Hollowframe, Canopynet, Pushwave, Fieldlog, Mirrorslot) in venture-portfolio/ folder, covering all state/type/doc_level values and action states. matterqueue-viewer.html built through two iterations: first version had vertical sidebar (unreadable), queue/actions not rendering (sentinel bug), filter bug; second version restructured to horizontal mode/sub-nav (Concepts | Actions modes), bugs fixed, view titles dynamic, Focus view has drag-to-sort. Deferred to post-migration: group-by, kanban view, click-to-section, inline action editing in All Actions.

---

## Action Log

**2026-06-16** — Migration tool (matterqueue-migrate.html) built, verified, and run. 61 MDs generated into venture-portfolio (49 ideas + 12 engines); _queue.json reset to empty; _review.md generated. Fictional test corpus removed; matterqueue.md installed from the maintained record; QuestionEngine and CoachingEngine spark MDs created. Blocking items cleared.

**2026-06-15** — matterqueue-core.js built and verified. 55 tests passing. Full round-trip test (parse → serialize → parse → compare) passes on real Matterqueue front matter including adversarial YAML strings.

**2026-06-15** — matterqueue-viewer.html built through two iterations. First version: vertical sidebar, four bugs identified. Second version: horizontal mode/sub-nav, bugs fixed, functional pending schema verification.

---

## Decision Log

**2026-06-16** — Migration executed aggregate-first: the aggregate is the spine; the index is used only for Pass-2 reconciliation. State derived from each idea's Recommendation rather than index buckets; doc_level from block shape (advanced → brief, mini → capsule with [FILL:] for absent fields, infrastructure/dissolved → spark); One Paragraph authored at migration time rather than left as [FILL:]; named engines materialized as spark MDs and wired via uses:; clusters dropped (not in schema). build-matterqueue.md and compilation-matterqueue.md kept canonical in docs/; compilation:/build_doc: flags signal the artifacts exist regardless of folder location.

**2026-06-15** — Chrome confirmed as designated tool. File System Access API verified stable in Chrome 86+ via console check. Build commitment made.

**2026-06-15** — Write-back spec amended to v1.3. Safety model simplified for single-user Dropbox deployment: conflict resolution is one prompt with safe default (skip); Dropbox version history is the explicit safety net; on-load name reference validation dropped; post-replace verification dropped.

**2026-06-15** — Viewer navigation restructured from vertical sidebar to horizontal mode/sub-nav. Concepts | Actions as top-level modes. Sub-nav shows mode-specific views. Vertical rotated text was unreadable.

**2026-06-15** — Test corpus uses fictional concept names (Glassbell etc.) to avoid collision with real portfolio concepts during migration. Corpus is throwaway after viewer verification.

**2026-06-15** — Deferred to post-migration: group-by axes for both views, kanban view (highest-value non-table view), click-to-section from table rows, inline action editing in All Actions. Named and described in build-matterqueue.md Deferred Viewer Features section.

**2026-06-15** — Compilation document and Build doc are external files, not body sections in the concept MD. Flagged via compilation: and build_doc: boolean front matter fields. Viewer surfaces navigation links when true. Filename derived from concept slug: compilation-matterqueue.md and build-matterqueue.md.

**2026-06-15** — Build order revised: matterqueue-core.js → viewer (against hand-crafted test MDs) → schema verification → migration tool → migration run → verify and close index. Viewer before migration prevents retrofitting 50 MDs if schema gaps surface during build.

**2026-06-15** — Matterqueue gets its own MD even though it does not appear in the aggregate or index. It is the reference implementation for the system and should be managed within the system it defines.

**2026-06-15** — doc_level set to compilation. Two full sessions of design work, three spec documents, a locked schema — compilation-level development. compilation: true and build_doc: true set accordingly.

**2026-06-15** — QuestionEngine and CoachingEngine distinguished. QuestionEngine: methodology — which questions at which depth level, domain-agnostic. CoachingEngine: delivery — applies QuestionEngine's architecture within the context of a specific concept and doc_level. CoachingEngine uses QuestionEngine. CoachingEngine is a new concept not yet in the aggregate; needs a spark MD post-migration.

---

## Open Questions Log

**2026-06-16** `resolved` — CoachingEngine does not yet have an MD: created as a spark MD this session, alongside a QuestionEngine spark, resolving Matterqueue's uses: references. The QuestionEngine vs CoachingEngine split remains an open design question.

**2026-06-15** `resolved` — Chrome-only constraint: is Chrome acceptable as the designated tool before committing viewer architecture to File System Access API? Resolution: confirmed. File System Access API verified stable in Chrome 86+ via console check. Chrome is the designated tool.

**2026-06-15** `resolved` — File System Access API stability: quick verification warranted before build commitment. Resolution: confirmed stable. showDirectoryPicker, showOpenFilePicker, SubtleCrypto all present as function in Chrome.

**2026-06-15** `open` — Matterqueue as product for teams: confirmed genuine concept; when does it get a formal build queue entry?

**2026-06-15** `open` — Trail System (chat-index) integration as a Matterqueue extension: confirmed the right direction; a separate build item, post-Stage 1 scope.

**2026-06-15** `open` — QuestionEngine may need to be split into architecture (QuestionEngine — methodology, domain-agnostic) and delivery (CoachingEngine — applies questions in context of a specific concept and doc_level). Review existing QuestionEngine capsule during migration to determine if split is warranted or if the existing entry already covers both.

**2026-06-15** `open` — /brainstorm command: add to essential-prompts alongside /compile. Structured generative prompt that runs in a session and surfaces candidates for evaluation. Output may produce new spark MDs or enrich an existing concept's Brief.

**2026-06-15** `open` — Focus order persistence: drag-to-sort in Focus view is currently session-only. Should focus order be persisted to _focus.json or similar? Decide before building the feature formally.
