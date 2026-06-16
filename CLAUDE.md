# CLAUDE.md — Matterqueue

Operational guide for working in this repo. Keep it short and imperative — rationale lives in `docs/build-matterqueue.md` (Build Log + Decisions), not here.

## What this is
Local-first, file-per-idea portfolio system. Each idea/engine/workflow is one markdown file with YAML front matter + a living body. Two single-file HTML tools read/write those files in place via the browser File System Access API:
- `matterqueue-viewer.html` — browse/edit the corpus, derived Queue/Actions views, Sync write-back.
- `matterqueue-migrate.html` — turn a source aggregate into the corpus (parse → batch-confirm → generate → audit).
Both load `matterqueue-core.js` (shared YAML/parse/serialize/slug/hash/body-append).

## Hard constraints (do not break)
- **Chrome only** — File System Access API; not available in Safari/Firefox.
- **No build step, no server, no npm runtime deps** — vanilla JS; HTML files are opened directly in Chrome (`file://`).
- **No external libraries in the product** — handwritten YAML serializer in `matterqueue-core.js`. Don't add a YAML/markdown lib.
- **Single HTML files** — viewer and migrate are each one self-contained file (`<script src="matterqueue-core.js">` is the only external ref).
- Filesystem is the database. `_system.md` carries domain config; `_queue.json` is the global queue.

## Commands
- Viewer acceptance tests: `npx playwright test` (Playwright; mocks the FS API).
- Core unit tests: `node matterqueue-core.test.js` (plain Node assertions, no framework).
- Run/preview a tool: open the `.html` directly in Chrome. The dev-preview server here is rooted at the wrong dir and can't serve these — don't rely on it.

## Working conventions
(Global dev protocols — e.g. bug-fix → regression test, red before green — live in `~/.claude/CLAUDE.md`.)
- **`matterqueue-core.js` is shared** — a fix there affects both viewer and migrate; check both.
- **Verify single-file HTML tools headlessly** when pickers block automation: extract the inline `<script>`, `eval` it in Node with a stubbed DOM + a mock/real-fs directory-handle shim, and run the real shipping functions against real data. (See `migration-run/verify.js`, `run-real.js`.)
- **`migration-run/` is gitignored scratch** — staged sources + verification harnesses live there; safe to delete.
- Dropbox version history + git are the safety nets; write-back is diff-then-Sync with content-hash conflict detection.

## Layout
```
matterqueue-core.js            shared module (+ matterqueue-core.test.js)
matterqueue-viewer.html        viewer
matterqueue-migrate.html       migration tool
venture-portfolio/             the live corpus (_system.md, _queue.json, *.md, _review.md)
docs/                          specs + build/compilation docs (canonical home)
tests/viewer.spec.js           Playwright suite
migration-run/                 gitignored scratch (harnesses, staged sources)
```

## Where decisions live
- `docs/build-matterqueue.md` — Build State, Build Log, Open Build Decisions, Constraints (the engineering log).
- Concept MD Decision Logs — product/idea decisions, in the system itself.
- `docs/essential-prompts-*.md` — cross-session behavioral/working rules.
- `docs/matterqueue-schema-*.md`, `matterqueue-writeback-*.md`, `matterqueue-migration-*.md` — locked specs.

## Known gotchas
- `renderMarkdown` (viewer) is block-based: splits on blank lines. Body fields are written blank-line-separated so they render as distinct paragraphs.
- Deferred: `renderMarkdown` escapes before inline regexes, so a heading literally containing `&`/`<`/`>` would render entities. Not in the current corpus; fix before production content.
- Migration generates from the aggregate (the spine); the index is reconciliation-only. Matterqueue, QuestionEngine, CoachingEngine are not in the aggregate and are authored/created manually.
