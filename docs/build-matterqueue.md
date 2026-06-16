# build-matterqueue — 2026-06-16
*External artifact — referenced from matterqueue.md via build_doc: true*
*Loaded into Claude Project for active build sessions*
*Updated: end of Session 6 (2026-06-16)*

---

## Build State

Stage 1 nearly complete. `matterqueue-core.js` (55 tests) and `matterqueue-viewer.html` (Playwright suite now **70 tests**) verified. **Migration tool (`matterqueue-migrate.html`) built, verified headlessly against the real aggregate, and run** — `venture-portfolio/` now holds the migrated corpus: 49 ideas + 12 engines + Matterqueue/QuestionEngine/CoachingEngine, an empty `_queue.json`, and `_review.md` (0 blocking). Viewer `renderMarkdown` rewritten block-based (fixes capsule paragraph collapse) with a regression test. Schema amended to **v1.5** — compilation redefined as a process (see Build Log / Open Build Decisions). **Next: human verifies the corpus in the viewer, then closes the index as a snapshot.**

---

## Feature Queue

Build in this order. Each item must be working before the next begins.

1. **matterqueue-core.js — shared module** ✅ DONE
   Built and verified. 55 tests passing including 15 adversarial YAML round-trip cases. All exported functions verified. `insertAfterHeading` updated to throw on heading-not-found per write-back spec v1.3; test updated to match.

2. **Viewer HTML — against hand-crafted test MDs** ✅ DONE
   Built as single HTML file. Multiple iterations of feedback applied. `appendLog` duplicate key bug fixed (Session 5). Current architecture confirmed — see Viewer UI Decisions below. One known deferred bug: `renderMarkdown` escape-before-regex latent bug. Flagged for post-migration cleanup, not a blocker.

3. **Schema verification** ✅ DONE
   Viewer loads and runs against test corpus. Several bugs found and fixed across Sessions 4 and 5. Schema v1.4 locked.

3.5. **Acceptance tests (Playwright)** ✅ DONE
   69 tests passing across 10 groups: folder load, all views render, filter logic, sync writes correct YAML, drag-to-reorder, autocomplete, conflict modal, state transitions, sync indicator, queue cap. Mock filesystem via `addInitScript` — no real File System Access API calls. `appendLog` bug discovered and fixed during test work. Committed to repo.

4. **Migration tool HTML** ✅ DONE
   Built in Claude Code as `matterqueue-migrate.html` (single file, shares `matterqueue-core.js`). Aggregate-driven: tolerant parse → batch-confirm review UI → generate (round-trip validated) → Pass-2 audit → `_review.md`. One Paragraph authored as editable drafts baked in (`[FILL:]` fallback); no API. Verified headlessly by eval-ing the real inline script in Node against the real aggregate/index.

5. **Migration run** ✅ DONE
   Generated 61 MDs into `venture-portfolio/` (49 ideas + 12 engines); 9 fictional test MDs removed; `matterqueue.md` installed from the maintained record; QuestionEngine/CoachingEngine sparks created. `_review.md`: 0 blocking, 131 non-blocking (synergy reciprocity + 3 mini-capsule field fills), 3 suggested.

6. **Verify and close index** — NEXT. Open the viewer against `venture-portfolio/`; verify all views; resolve remaining `_review.md` items as desired; then close the index as a snapshot.

---

## Viewer UI Decisions

These decisions emerged from feedback during build. A future session building viewer enhancements needs this context.

**Navigation architecture**
- Vertical sidebar with rotated text was unreadable — replaced with horizontal layout (Session 3)
- Top header: Concepts | Actions as mode buttons
- Sub-nav bar below header: mode-specific views as horizontal tabs
- Concepts mode: All | Focus sub-nav tabs (both wired to `setConceptPreset()`)
- Actions mode: Queued | All [action_label] sub-nav tabs
- All/Focus were briefly moved to a preset bar inside the view (Session 4), then moved back to sub-nav — sub-nav is the right place for view-level switching
- Action label is domain-adaptive — read from `_system.md` `action_label` field throughout
- Sync button always visible in header; Sync Log accessible via separate "Log" button

**Filter bars**
- All filter bars use labeled group structure: `STATE [All] [active]...  TYPE [All]...`
- Field label is monospace uppercase, opacity 0.55 — visible but not dominant
- Concepts filter bar: State / Type / Level groups; hidden in Focus mode replaced with filters that apply within the focus pool
- Actions filter bar: State group only (Open + Blocked / All / Open / Blocked / Done)
- Queue filter bar: State group with All / Blocked only — cap warning based on total queue size, not filtered count

**Focus preset**
- All / Focus are sub-nav tabs under Concepts mode, wired to `App.conceptPreset`
- Focus limit: 5 (raised from 2 in Session 4); configurable via `_system.md` `focus_limit`
- Filters are visible and functional in Focus mode — apply within the focus pool
- Drag-to-sort in Focus mode: `⠿` handle appears in first column; dirty dot and handle coexist when row is both dirty and draggable
- Focus order tracked in `App.focusOrder` array; session-only (persistence decision pending)

**Queue view**
- Drag-to-reorder writes to `App.queue` and marks `_queue.json` dirty
- Blocked actions visually distinct (danger-color border)
- State filter: All / Blocked; cap warning always based on total queue size
- Queue cap: 10 (configurable via `_system.md` `queue_cap`)

**All Actions view**
- Default filter: open + blocked only (done requires explicit filter change)
- Grouped by concept (default)
- Each group header clickable — opens that concept's Overview
- queued badge shows inline per action row

**Concept detail — Body tab**
- Jump menu implemented via scroll containment, not CSS sticky
- `#subtab-body` is the scroll container (`display: flex; flex-direction: column; overflow: hidden`)
- Jump menu sits in `.jump-menu-sticky` div outside the scroll area — stays visible at all times
- Body content and log appends sit in `.body-scroll-area` which scrolls independently

**Concept detail — Overview tab**
- Overview and Body as sub-tabs within concept drill-down
- Back button returns to the collection view the concept was opened from
- Actions in Overview rendered as structured rows: description input | type select | state select | queue toggle | remove
- External artifact links (compilation doc, build doc) shown when `compilation: true` / `build_doc: true`

**State transition modals**
- → absorbed: prompts for absorbed_by name; auto-drafts Decision Log entry in absorbing concept
- → retired: confirmation required
- focus: true on 6th (≥ focus_limit): warning with continue/cancel
- queue cap at queue_cap items: warning with add-anyway option
- prototype done: prompts for Action Log result note; sets try_it: true
- research done: sets map_it: true silently
- decision done: prompts for Decision Log entry

**Write-back safety (from v1.3 amendments)**
- Conflict resolution: standalone promise with explicit 'skip'/'overwrite' resolution; 'Keep disk version' gets focus (bug fixed Session 4)
- Partial Sync failure: names all written and unwritten files, warns about cross-file references
- Body append heading-not-found: warns via banner and aborts write (v1.3 behavior now in code); spark exception implemented
- `appendLog` duplicate key bug fixed (Session 5) — was constructing `{ [fieldMap[section]]: [entry], actionLog:[], ... }` which silently overwrote the computed key with an empty array; fixed to build `appends` object separately
- Dropbox version history is the explicit safety net — design decisions simplified accordingly

**Domain-configurable values (Session 4)**
- `focus_limit` and `queue_cap` read from `_system.md` at load; fall back to defaults (5, 10) when absent
- First step toward domain-configurable behavior; state values, action types, doc levels are next candidates when a second domain warrants it
- All hardcoded references replaced with `App.systemConfig.focus_limit` and `App.systemConfig.queue_cap`

**Depends on / Used in / Synergies (Session 4/5)**
- "Uses" renamed to "Depends on" throughout UI
- "Used in" section derived automatically on engine/workflow Overview — scans all loaded MDs for `uses:` lists that include this MD's name; clickable tags open that concept directly
- Depends on and Synergies tag inputs autocomplete from loaded MD names as you type
- Resolved names clickable — open that concept's Overview directly
- Unresolved names (no matching MD) show ⚠ warning indicator
- `addTagOnEnter` handles Escape key, deduplication, and autocomplete list ID

**Folder persistence and navigation (Session 4/5)**
- Folder handle persisted to IndexedDB (`IDB_NAME = 'matterqueue'`, store `'handles'`)
- On reload: `DOMContentLoaded` attempts restore; if permission granted, loads folder automatically; if not, shows one-click "Continue with [folder name]" prompt
- Change folder button (`⟳ Folder`) in header — calls `changeFolder()`, resets App state, persists new handle
- `openConceptAtAction(filename, actionIdx)` — click action description in All Actions to open that concept's Overview scrolled to that action row

**Sync log persistence (Session 4/5)**
- Sync log written to `_synclog.json` in folder after every Sync
- Loaded from `_synclog.json` on folder open — full history survives close and reload
- Sub-nav hidden when Sync Log view is active (`setView` sets `subnav.style.display = 'none'`)

**Action drag-to-reorder (Session 4/5)**
- Actions in Concept Overview are draggable — `⠿` handle in first column (grid expanded to 6 columns)
- `onActionDragStart/Over/Drop/End` functions; `position` fields recalculated on drop
- Body jump links use `scrollIntoView({ behavior: 'smooth' })` — no jarring anchor jump

**Key bugs fixed**
- Session 3: `App.mds['_queue']` sentinel collision; `buildQueueItems()` description matching; `renderActions()` empty-state check; system font stack
- Session 4: `showConflictModal` always resolved to overwrite (standalone promise fix); `insertAfterHeading` v1.2 behavior replaced with v1.3 throw; All/Focus preset bar cramped below empty sub-nav (moved back to sub-nav)
- Session 4/5: unescaped apostrophe in `concept's Overview` string broke entire script parse; fixed to `concept&#39;s`
- Session 5: `appendLog` duplicate key bug — `{ [fieldMap[section]]: [entry], actionLog:[], decisionLog:[], openQuestionsLog:[] }` silently overwrote computed key with empty array; fixed to build appends object separately before passing to `applyBodyAppends`

---

## Deferred Viewer Features

Not in current viewer. Sequenced after migration run when working with real corpus.

**Group-by** — both views should support grouping on multiple axes:
- All Concepts group-by: state / type / doc_level / focus-first
- All Actions group-by: concept (current default) / type / state / queued vs unqueued
- Each group-by pairs with a sensible default filter

**Click-to-section** — ✅ BUILT (Session 4/5) — clicking action description in All Actions opens that concept Overview scrolled to that action via `openConceptAtAction()`.

**Kanban view** — highest-value non-table view. Columns: active / parked / absorbed. Drag concept card to change state. Natural for lifecycle management.

**Inline action editing in All Actions** — currently actions are read-only in the All Actions table. State dropdown and queue toggle inline would reduce drilling into concepts for routine updates.

**Graph view** — deferred post-Stage 1. Nodes = MDs, edges = synergies: declarations.

**Dependency graph/list view** — deferred post-Stage 1. Full tree visualization showing what depends on what across all MDs, which engines are most heavily used, orphaned engines. Derived from `uses:` fields. Distinct from the clickable name navigation (which is in the current viewer) — this is a dedicated cross-portfolio view.

**Todoist integration** — one-way push: `todoist: true` flag triggers push of action to Todoist. Two-way sync (completion state back) only if Todoist API makes it trivial. Post-Stage 1.

**`renderMarkdown` escape-before-regex bug** — body content is HTML-escaped before regex replacements fire; headings containing `&`, `<`, or `>` will render escaped entities. No impact on current corpus. Fix before production use with real content.

**`appendLog` direct body mutation** — writes directly to `md.body` rather than accumulating in `pendingBodyAppends`. Functionally safe in single-user architecture. Align with spec model post-migration.

---

## Constraints

- **Chrome only** — File System Access API not available in Safari or Firefox; Chrome confirmed as designated tool ✅
- **No npm, no build step, no server** — vanilla JavaScript only; single HTML files; open directly in Chrome
- **No external libraries** — handwritten YAML serializer; no parsing library
- **File System Access API** — stable since Chrome 86; verified working ✅
- **Dropbox folder** — viewer and migration tool operate on files in the Dropbox folder directly
- **Single HTML files** — viewer is one file; migration tool is one file; both load matterqueue-core.js as local script
- **No SQLite, no MongoDB** — filesystem is the database at Stage 1
- **Viewer is stateless** — all data in MD files and _queue.json; replace viewer HTML in place to update without losing data

---

## Repo Structure

```
~/projects/matterqueue/
  docs/           ← spec files (schema, build doc, migration design, write-back design)
  tests/          ← Playwright acceptance test suite
  prototypes/     ← throwaway explorations; not production code
  workbench/      ← local state: databases, seeds, .env — gitignored
  matterqueue-viewer.html     ← built product files at root
  matterqueue-core.js
  matterqueue-migrate.html    ← when built
  playwright.config.js
  package.json
  .gitignore      ← excludes: node_modules/, workbench/, playwright-report/, test-results/
```

Rule: if it belongs to Matterqueue, it goes in this directory. `.gitignore` controls what's tracked, not folder location.

Spec files live in two places: `docs/` in repo (source of truth for Claude Code sessions) and Project knowledge (source of truth for Project conversation sessions). `/sync-docs` keeps them in sync.

---

## Open Build Decisions

1. **Group-by implementation** — which axis should be the default for each view? Concept (current) for Actions, State for Concepts? Decide when building the group-by feature post-migration.
2. **Focus order persistence** — current focus drag sort is session-only. Should focus order be persisted to `_focus.json` or similar? Decide before building the feature formally.
3. **Viewer `compilation:` nav link** — viewer still renders a link for `compilation: true` expecting a file; per schema v1.5 `compilation:` is a performed-flag (no file). Tweak the viewer to link only `build_doc:` (with a regression test). Cosmetic, not blocking.
4. **Redundant engine MD** — `the-current-attention-layer.md` was generated as an engine but is just The Current (an existing concept). Delete or merge.
5. **`renderMarkdown` escape-before-regex** — still latent (headings containing `&`/`<`/`>` render entities); no impact on current corpus; fix before production content.

*Resolved Session 3:*
- ~~File System Access API stability~~ — confirmed stable, Chrome 86+ ✅
- ~~Viewer feature spec~~ — fully defined, see UI Decisions above ✅
- ~~Graph view Stage 1 or post~~ — post-Stage 1 ✅

*Resolved Session 4:*
- ~~`showConflictModal` resolution path~~ — standalone promise, explicit 'skip'/'overwrite' ✅
- ~~`insertAfterHeading` v1.2 vs v1.3~~ — v1.3 (throw on not-found) now in code ✅
- ~~Focus limit~~ — 5, configurable via `_system.md` ✅
- ~~Queue cap configurability~~ — configurable via `_system.md` ✅

*Resolved Session 5:*
- ~~`appendLog` duplicate key bug~~ — fixed; `appends` object built separately before passing to `applyBodyAppends` ✅
- ~~Acceptance tests~~ — 69 tests passing; committed to repo ✅
- ~~Repo structure~~ — settled; `docs/`, `tests/`, `prototypes/`, `workbench/` (gitignored) ✅
- ~~Workbench location~~ — inside repo directory, gitignored ✅
- ~~Claude Code for build sessions~~ — confirmed as right tool for execution sessions; Project conversation for design/spec ✅

*Resolved Session 6:*
- ~~One Paragraph generation~~ — authored editable drafts baked into the migration tool; `[FILL:]` fallback; no API ✅
- ~~docs/ migration~~ — specs live in `docs/`; Claude Code reads them directly ✅
- ~~Claude Code for migration tool~~ — built in Claude Code ✅
- ~~Compilation: artifact vs process~~ — compilation is a **process** (schema v1.5); `compilation:` is a performed-flag; `compilation-[slug].md` removed; `build-[slug].md` is the only external artifact; documented in `compilation-process.md` ✅
- ~~Logs location~~ — Action/Decision/Open-Questions logs stay canonical in the concept MD (the viewer's write target); build decisions go in the build doc ✅
- ~~Canonical doc homes~~ — `venture-portfolio/` = concept data; `docs/` = specs + build doc; global dev protocols (bug→test) → `~/.claude/CLAUDE.md`; project `CLAUDE.md` operational-only ✅

---

## Specs

- `matterqueue-schema-2026-06-16.md` — full front matter schema (v1.5)
- `matterqueue-migration-design-2026-06-15.md` — migration pass design (v1.2)
- `matterqueue-writeback-design-2026-06-15.md` — write-back mechanism design (v1.3)
- `compilation-process.md` — concept maturation (compilation) process; general, with Matterqueue binding

*Note: `matterqueue-writeback-design-2026-06-15-amendments-v1.3.md` referenced in Session 3 build log — verify whether this exists as a separate file or was folded into the main write-back design doc before Session 6.*

---

## Build Log

**2026-06-16 — Session 6** — First Claude Code build session. Built `matterqueue-migrate.html` (aggregate-driven, single file, shares `matterqueue-core.js`): tolerant parser → batch-confirm review UI → generate (round-trip validated) → Pass-2 audit → `_review.md`. Verified parser/generator/audit headlessly by eval-ing the real inline script in Node against the real aggregate/index (DOM + FS-API stubs). Ran the migration: 61 MDs into `venture-portfolio/` (49 ideas + 12 engines); 9 fictional test MDs removed; empty `_queue.json`; `_review.md` 0 blocking. One Paragraph authored as editable drafts (`[FILL:]` fallback). `matterqueue.md` installed from the maintained record and cleaned (synergy `Chat Index` → `Trail System`); QuestionEngine/CoachingEngine sparks created. Viewer: `renderMarkdown` rewritten block-based (fixed capsule fields + `**Key Insights**` collapsing into the first paragraph); added a regression test, proven red-before-green (suite 69 → 70). Decisions: aggregate-first migration; **compilation redefined as a process** (schema → v1.5; `compilation:` is a performed-flag; `compilation-matterqueue.md` deleted; `build-[slug].md` is the only external artifact; `compilation-process.md` created); concept-MD logs are canonical (build decisions go in the build doc); `docs/` canonical for specs. Added project `CLAUDE.md` (operational) and global `~/.claude/CLAUDE.md` (bug→test protocol). Wrote `ingest-to-schema-playbook` (reusable doc → Downloads). Next: human verifies the corpus in the viewer, then closes the index.

**2026-06-16 — Session 5** — Acceptance test suite built and all 69 tests passing. Mock filesystem via `addInitScript` bypasses File System Access API picker. 10 test groups: folder load, all views render, filter logic, sync writes correct YAML, drag-to-reorder, autocomplete, conflict modal, state transitions, sync indicator, queue cap. Root-caused `appendLog` duplicate key bug via diagnostic `page.evaluate` chain — `{ [fieldMap[section]]: [entry], actionLog:[], ... }` silently overwrote computed key with empty array; fixed in viewer and test updated to call `appendLog` directly. Committed to repo. Repo structure settled: `docs/`, `tests/`, `prototypes/`, `workbench/` (gitignored). Claude Code identified as right tool for build/execution sessions. `essential-prompts` updated: Change 12 — git push block added to `/sync-docs` Step 4; Claude Code workflow note added.

**2026-06-16 — Session 4/5 (continued)** — Schema verification pass in Chrome. Syntax error found and fixed (unescaped apostrophe at line 961 broke entire script). Folder handle persistence via IndexedDB implemented — auto-restore on reload with one-click permission prompt; change folder button added to header. Sync log persisted to `_synclog.json` — survives close and reload. Sub-nav hidden in Sync Log view. Smooth scroll on body jump links via `scrollIntoView`. Drag-to-reorder actions within Concept Overview — `⠿` handle, position recalculated on drop. Click action in All Actions → `openConceptAtAction()` opens concept at that action. "Uses" renamed to "Depends on"; "Used in" section derived automatically on engine/workflow Overview. Depends on and Synergies tag inputs now autocomplete from loaded MD names; resolved names clickable; unresolved names show ⚠. Acceptance tests (Playwright) confirmed as pre-migration build item — Feature Queue item 3.5. `/sync-docs` command added to essential-prompts as standard end-of-session command for Project workflow.

**2026-06-16 — Session 4** — Schema verification session. Full read of all uploaded files including viewer HTML, core.js, test suite, and 9 test corpus MDs. Schema analysis identified 1 schema gap (actions at spark level) and 4 code bugs. Schema amended to v1.4: actions optional at spark. Code fixes: `showConflictModal` standalone promise (safe default gets focus); `insertAfterHeading` changed to throw on heading-not-found per v1.3 spec; `appendLog` updated with warn-and-abort + spark exception; test updated (55/55 passing). UI iterations: sticky jump menu via scroll containment (subtab-body is scroll container, jump menu outside); filter bars restructured with labeled groups; All/Focus briefly moved to preset bar then moved back to sub-nav; Focus mode shows filters (apply within focus pool); drag handle affordance (⠿) in Focus rows; Queue State filter added (All/Blocked); focus limit raised to 5; `focus_limit` and `queue_cap` made configurable via `_system.md`. `/sync-docs` command designed and added to essential-prompts. Schema verification in Chrome still pending — viewer built and ready but not yet run against test corpus by human.

**2026-06-15 — Session 3** — Stage 1 build begun. `matterqueue-core.js` built and verified (55 tests). Write-back spec amended to v1.3. Test corpus built: 9 fictional MDs (Glassbell, Driftmap, Frostline, Vaultmoth, Hollowframe, Canopynet, Pushwave, Fieldlog, Mirrorslot). `matterqueue-viewer.html` built through two iterations: first version had vertical sidebar, sentinel bug, filter bug; second version restructured to horizontal mode/sub-nav, bugs fixed. Deferred to post-migration: group-by, kanban view, click-to-section, inline action editing in All Actions.

**2026-06-15 — Session 2** — Pre-build spec complete. Schema, migration, and write-back designed. Build doc created. No code written.

---

## Loaded Context

**Claude Project (current approach):**
Project knowledge contains: `build-matterqueue.md`, `essential-prompts-2026-06-16.md`, `compilation-matterqueue.md`, `matterqueue-schema-2026-06-16.md`, `matterqueue-writeback-design-2026-06-15.md`, `matterqueue-migration-design-2026-06-15.md`.

Local files (not in Project knowledge): `matterqueue-viewer.html`, `matterqueue-core.js`, `matterqueue-core.test.js`, `tests/viewer.spec.js`, `playwright.config.js`.

Upload `matterqueue.md` fresh at the start of each session — it is a live file updated by the viewer and will go stale if kept in Project knowledge.

End each session with `/sync-docs` — produces updated spec files ready to replace stale copies in Project knowledge, plus git push block.

**Claude Code sessions (recommended for migration tool build):**
Start Claude Code in the project directory: `cd ~/projects/matterqueue && claude`
Claude Code reads local files directly — no upload needed. Spec files will be in `docs/` once that migration happens. Until then, point Claude Code at the local copies.

**If using a standalone conversation:**
Load in this order:

1. `essential-prompts-2026-06-16.md` ← behavioral rules including /sync-docs
2. `matterqueue.md` ← concept record and front matter state (upload current version)
3. `compilation-matterqueue.md` ← human-facing synthesis and decisions
4. `build-matterqueue.md` ← this file; active build context
5. `matterqueue-schema-2026-06-16.md` ← schema reference
6. `matterqueue-writeback-design-2026-06-15.md` ← write-back reference
7. `matterqueue-migration-design-2026-06-15.md` ← migration reference (defer until working on migration tool)
