# compilation-matterqueue — 2026-06-16
*External artifact — referenced from matterqueue.md via compilation: true*
*Updated: end of Session 5 (2026-06-16)*

---

## Context

Matterqueue is a markdown-folder-based concept portfolio system designed and built across five sessions (2026-06-14 through 2026-06-16). Each concept, engine, or workflow is an individual MD file with typed YAML front matter. A local HTML viewer derives the build queue and action queue directly from the files — nothing is maintained separately. The system lives in Dropbox, runs in Chrome via the File System Access API, and requires no server, no install, and no npm. The shared module (matterqueue-core.js) is complete (55 tests). The viewer is built, iterated, and verified — including a Playwright acceptance test suite (69 tests passing). An `appendLog` duplicate key bug was found and fixed. Migration tool build is the immediate next step.

---

## Decisions

- **Matterqueue is pattern and product** — one name covers the architectural pattern and the product; Foldqueue retired.
- **Signal Queue feeding Build Queue is the core architecture** — concept maturation layer distinct from execution layer; the product's argument against flat backlog tools.
- **Six domains confirmed** — venture portfolio, investment watchlist, skill building, hypothesis ledger, marketing campaigns, strategic relationships; folder per domain.
- **Folder = domain** — `_system.md` at root carries domain config (domain, label, action_label); individual MDs inherit domain from folder.
- **Individual MDs replace aggregate** — aggregate and index are snapshots; individual MDs carry forward as live working reference.
- **Index stays live until viewer verified** — do not close index before viewer works.
- **Doc levels: spark / capsule / brief / compilation** — four levels; ceiling is compilation; build environment picks up where compilation leaves off.
- **Type values: concept / engine / workflow** — workflow replaces infrastructure surface.
- **State values: active / parked / absorbed / retired** — gradient; absorbed implies something survived, retired implies nothing did.
- **Build queue is derived, never maintained separately** — queued: boolean on action items + _queue.json global order = the queue.
- **Build items embedded in front matter as actions: YAML list** — states: open / blocked / done; types: task / prototype / research / decision.
- **action.queued: boolean** — pulls action into global Queue view; soft cap configurable via _system.md (default 10).
- **action.position: local to MD only** — sort order within concept view; independent of global queue order.
- **_queue.json: global queue order** — viewer-managed; ordered array of { filename, description }; written on Sync.
- **Actions allowed at spark doc_level (schema v1.4)** — a spark with a next step is a valid real-world case; schema v1.3 was wrong to exclude it. Optional at spark level.
- **Viewer navigation: horizontal mode/sub-nav** — Concepts | Actions as top-level mode buttons in header; sub-nav bar shows mode-specific views. All | Focus under Concepts; Queued | All [action_label] under Actions.
- **All/Focus are sub-nav tabs, not preset buttons in view** — All/Focus were briefly moved to a preset bar inside the Concepts view then moved back. Sub-nav is the right place for view-level switching.
- **Action label is domain-adaptive** — read from `_system.md` action_label field; used throughout viewer labels.
- **View titles update dynamically with active filter** — "Focus · active" when focus preset is active and state filter is applied.
- **Focus preset** — All shows all MDs; Focus narrows to focus:true MDs. Both implemented as sub-nav tabs wired to `setConceptPreset()`.
- **Filters visible in Focus mode** — filters apply within the focus pool; useful for housecleaning a large focus set.
- **Filter bars use labeled group structure** — field label (STATE, TYPE, LEVEL) followed by pill buttons; applies to Concepts, Actions, and Queue filter bars.
- **Queue State filter: All / Blocked only** — cap warning based on total queue size not filtered count.
- **Focus limit: 5** — raised from 2; configurable via `_system.md` `focus_limit` field (default 5).
- **Queue cap: 10** — configurable via `_system.md` `queue_cap` field (default 10).
- **`focus_limit` and `queue_cap` configurable via `_system.md`** — viewer reads at load, falls back to defaults when absent. First step toward domain-configurable behavior; state values, action types, doc levels are next candidates when a second domain warrants it.
- **Drag handle affordance in Focus rows** — `⠿` glyph in first column when rows are draggable; dirty dot and handle coexist when row is both dirty and draggable.
- **Jump menu via scroll containment** — `subtab-body` is the scroll container; jump menu sits outside in `.jump-menu-sticky` div; body content in `.body-scroll-area` scrolls independently. Jump menu stays visible at all times when reading body.
- **Todoist: boolean only at Stage 1** — todoist: true/false; no ID, no sync back. Intended evolution: flag triggers one-way push of action to Todoist. Two-way sync (completion state back) only if Todoist API makes it trivial — do not build complexity for it.
- **"Uses" renamed to "Depends on" in UI** — directionality clearer; "engine doesn't depend on concepts, it is used by them." Field key in front matter unchanged (`uses:`).
- **"Used in" derived automatically** — engine and workflow Overviews show which concepts depend on them, derived at render time from `uses:` fields across all loaded MDs; clickable; no separate field needed.
- **Depends on and Synergies autocomplete** — tag inputs autocomplete from loaded MD names; resolved names clickable (open that concept); unresolved names show ⚠ warning; deduplication on entry; Escape closes autocomplete.
- **Folder handle persisted via IndexedDB** — auto-restored on reload with one-click permission prompt; change folder button in header for switching.
- **Sync log persisted to `_synclog.json`** — written after every Sync; loaded on folder open; full history survives close and reload.
- **Sub-nav hidden in Sync Log view** — Concepts/Actions sub-nav tabs do not appear when Sync Log is active.
- **Smooth scroll on body jump links** — `scrollIntoView({ behavior: 'smooth' })` replaces anchor navigation; no jarring jump.
- **Action drag-to-reorder within Concept Overview** — `⠿` handle in action rows; `position` fields recalculated on drop.
- **Click action in All Actions → concept at action** — `openConceptAtAction()` opens that concept's Overview scrolled to the specific action row.
- **Acceptance tests (Playwright): 69 tests passing** — mock filesystem via `addInitScript` bypasses File System Access API; covers folder load, all views, filter logic, sync YAML correctness, drag-to-reorder, autocomplete, conflict modal, state transitions, sync indicator, queue cap. Committed to repo.
- **`appendLog` duplicate key bug found and fixed** — `{ [fieldMap[section]]: [entry], actionLog:[], ... }` silently overwrote computed key with empty array; fixed by building `appends` object separately. Found via Playwright test work.
- **uses: field** — standardized names; architectural dependencies; drives dependency view.
- **synergies: field** — standardized names; peer relationships; drives graph view and dynamic clustering.
- **compilation: and build_doc: boolean flags** — signal external artifacts exist; viewer surfaces navigation links; same pattern as try_it/map_it.
- **Compilation document is external** — compilation-[slug].md; human-facing synthesis (Context/Decisions/Open Questions); not a body section in the concept MD.
- **Build doc is external** — build-[slug].md; AI working instrument; loaded into Claude Project for active build sessions; not a body section in the concept MD.
- **Concept MD body structure** — Idea Capsule (current) / Brief / Idea Capsule (original) / Action Log / Decision Log / Open Questions Log. No Compilation section in body.
- **Batched Sync with explicit Sync action** — optimistic UI, diff in memory, single write pass; modified_date auto-updated on every Sync.
- **Write-back safety model simplified for single-user Dropbox** — conflict resolution is one prompt per file with safe default (skip); Dropbox version history is the explicit safety net; no field-level diff UI needed.
- **`showConflictModal` fix** — was silently resolving to overwrite due to input-value path; replaced with standalone promise with explicit 'skip'/'overwrite' resolution; 'Keep disk version' gets focus.
- **`insertAfterHeading` throws on heading-not-found** — v1.3 spec behavior now in code; test updated; spark exception implemented in `appendLog` (creates section at end of body for spark MDs with no log sections).
- **`appendLog` direct body mutation accepted as deliberate deviation** — writes to `md.body` directly rather than `pendingBodyAppends`; functionally safe in single-user architecture; flagged for post-migration cleanup.
- **Partial Sync failure: named file report** — must name all written and unwritten files; warn about cross-file references; no rollback.
- **Body append heading-not-found: warn via banner and abort** — changed from silent fallback to explicit warning; exception for spark MDs with no log sections.
- **YAML round-trip validation** — serialized output parsed back immediately; write aborted on mismatch; 55-test suite including adversarial cases.
- **Content hash conflict detection** — SHA-256 via SubtleCrypto; not timestamp alone.
- **Shared module: matterqueue-core.js** — built first; consumed by both migration tool and viewer; 55 tests passing.
- **Migration tool: standalone HTML** — same stack as viewer; File System Access API; no install; no npm.
- **Migration: two-pass** — Pass 1 generates (batch confirmation mode); Pass 2 audits corpus (_review.md three-tier gap report).
- **Build order: core module → viewer → schema verification → acceptance tests → migration tool → migration run → verify** — acceptance tests added as item 3.5; required before migration.
- **HTML viewer in Chrome, File System Access API, Dropbox folder** — local, no server, no install; Chrome confirmed as designated tool ✅
- **Dropbox preferred** — file-level sync, reliable with plain text; version history is explicit safety net for write-back errors.
- **No MongoDB, no SQLite at Stage 1** — filesystem is the database; SQLite only if absorption demands it.
- **Viewer is stateless** — all data in MD files and _queue.json; replace viewer HTML in place to update without losing data.
- **Test corpus uses fictional names** — prevents collision with real portfolio concepts during migration; corpus throwaway after viewer verification.
- **Name unique system-wide** — viewer warns on duplicate at load; soft guardrail.
- **Slug derived from name at runtime** — no slug field in front matter.
- **Clusters dropped** — ThinkMutant generates dynamically from synergies: field.
- **Hook folded into One Paragraph** — not a separate field; One Paragraph opens with sharpest entry point, expands core sentence, closes with why now; three to five sentences.
- **Idea Capsule fields retained** — Name, One Phrase, Core Sentence, One Paragraph, Key Insights, User, Model, Why It's Real, Flags, Synergy.
- **Idea Capsule fields dropped** — Yes-and, Recommendation, Next Step (triage artifacts).
- **Logs are append-only, reverse chronological** — Action Log, Decision Log, Open Questions Log.
- **State transition behaviors: five triggers** — → absorbed (prompt + Decision Log entry + Brief draft); → retired (confirmation); focus:>focus_limit (soft warning); doc_level → compilation (prompt to create compilation doc); queued: true on (queue_cap+1)th item (soft warning).
- **Absorbed ideas get full MDs as historical records** — all prior content preserved; state: absorbed; absorbed_by populated.
- **Actions do not auto-migrate on absorption** — human consciously decides which carry forward; viewer prompts review.
- **Deferred viewer features** — group-by (both views), kanban view (highest-value non-table view), click-to-section from table rows, inline action editing in All Actions; all post-migration.
- **Graph view and dependency view** — deferred post-Stage 1.
- **Multi-user architecture** — not Stage 1; current diff/Sync architecture is forward-compatible.
- **QuestionEngine: methodology** — which questions at which depth level; domain-agnostic; already in portfolio.
- **CoachingEngine: contextual delivery** — applies QuestionEngine architecture within context of specific concept and doc_level; new concept not in aggregate or index; needs spark MD.
- **matterqueue.md is the reference implementation** — first concept MD; managed within the system it defines.
- **essential-prompts amended (Session 4: Change 11)** — `/sync-docs` command added for Project-based build workflow; replaces `/close` as end-of-session command when working inside a Claude Project.
- **essential-prompts amended (Session 5: Change 12)** — git push block added to `/sync-docs` Step 4; Claude Code workflow note added.
- **`/sync-docs` command** — audits session, identifies affected spec files, produces updated versions as outputs, displays git push block; does not generate Trail or Capsule; build doc Build State is the re-entry mechanism.
- **Project workflow: no capsule needed** — Claude Project persistent files carry context; `/sync-docs` updates them at session end; build doc Loaded Context section is the handoff prompt.
- **Claude Code for build/execution sessions** — Claude Code (local terminal with filesystem access) is the right tool when output is files and test results; Project conversations for design, spec, and compilation work. Complementary, not either/or.
- **Project conversation for design sessions** — when a concept is shifting or you need to think before building; Claude Code has a bias toward execution.
- **Repo structure settled** — `docs/` (spec files), `tests/` (Playwright suite), `prototypes/` (throwaway explorations), `workbench/` (local state — gitignored); all inside `~/projects/matterqueue/`.
- **Workbench inside repo, gitignored** — keeps all Matterqueue-related directories in one place; `.gitignore` controls tracking, not folder location.
- **Git push block in `/sync-docs`** — runs every session end; commit message generated from session summary; applies to both Project conversation and Claude Code sessions.
- **Spec files in two places** — `docs/` in repo (source of truth for Claude Code) and Project knowledge (source of truth for Project conversations); `/sync-docs` keeps them in sync.
- **UI code: Playwright acceptance tests replace manual verification** — 69 tests cover all views, interactions, and write-back behaviors; manual Chrome verification no longer required for covered behaviors.

---

## Open Questions

1. **Focus order persistence** — drag-to-sort in Focus view is session-only; decide whether to persist to `_focus.json` before building formally.
2. **CoachingEngine spark MD** — new concept not in aggregate or index; create manually post-migration.
3. **QuestionEngine split** — existing capsule may conflate methodology and delivery; review at migration; split if warranted.
4. **/compile command** — not in essential-prompts; needs integration alongside /sync-docs; post-session.
5. **/brainstorm command** — structured generative command; output may produce spark MDs or enrich Brief; not in essential-prompts; post-session.
6. **Change 5 blocking behavior** — hard gate may be too strict; flag-and-proceed may be more practical; needs testing.
7. **IdeaEngine vs ThinkMutant** — is idea generation a ThinkMutant capability or a separate engine? Unresolved.
8. **Domain template specs** — deferred; venture portfolio is reference implementation; others follow after Stage 1 proven.
9. **Matterqueue as product for teams** — confirmed genuine concept; not yet on build queue; timing of formal queue entry.
10. **Chat Index as Matterqueue extension** — confirmed right direction; separate build item; post Stage 1 scope.
11. **Instructions MD** — deferred to end of Stage 1 when viewer behavior is confirmed.
12. **One Paragraph generation approach for migration tool** — FILL: placeholder fallback confirmed; actual generation approach not yet decided.
13. **Group-by default axis per view** — needed when building the feature post-migration.
14. **`appendLog` direct body mutation** — deliberate deviation from `pendingBodyAppends` model; flagged for post-migration cleanup.
15. **`renderMarkdown` escape-before-regex** — latent bug; headings with `&`, `<`, `>` render escaped entities; no impact on current corpus; fix before production use.
16. **`matterqueue-writeback-design-2026-06-15-amendments-v1.3.md`** — referenced in Session 3 build log as a separate file; verify whether it exists separately or was folded into main write-back design doc.
17. **Domain-configurable field values** — state values, action types, doc levels as YAML config in `_system.md`; right long-term architecture; post-Stage 1.
18. **Single-file viewer deployment** — merging `matterqueue-core.js` inline into `matterqueue-viewer.html` eliminates co-location requirement and file:// origin issues; recommended before migration run.
19. **docs/ migration** — move spec files from Project knowledge into `docs/` in repo; Claude Code would then read them directly from disk; do before or after migration tool build?
20. **Claude Code for migration tool build** — migration tool is a good first Claude Code session; decide at session start.
