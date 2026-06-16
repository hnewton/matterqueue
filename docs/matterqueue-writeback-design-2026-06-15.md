# Matterqueue Write-Back Mechanism Design
*Version 1.3 — 2026-06-15*
*Status: Locked — Stage 1 reference*
*Amendments v1.1: YAML round-trip validation; content hash conflict detection; shared matterqueue-core.js module*
*Amendments v1.2: queued boolean on actions; _queue.json global queue file; three viewer views; Queue ordering via drag-and-drop; local position distinct from global queue order*
*Amendments v1.3: simplified safety model for single-user Dropbox; conflict resolution UI simplified; partial Sync failure report revised; body append heading-not-found changed to warn-and-abort; viewer view architecture added; Dropbox version history established as explicit safety net*

---

## Overview

The viewer maintains an in-memory diff of all changes made during a session. The underlying MD files are not touched until the user clicks Sync. At Sync, the diff is applied to the on-disk files in a single write pass across all affected MDs.

The viewer feels like a live editor. Changes are immediate in the UI. The file on disk is the confirmed, committed state.

---

## Architecture

### Three layers

```
DISK LAYER         MD files in Dropbox folder — authoritative committed state
                   ↕ read on load / write on Sync
MEMORY LAYER       In-memory representation of all loaded MDs — current session state
                   ↕ UI reads from and writes to memory
UI LAYER           Viewer interface — optimistic updates, reflects memory state instantly
```

Changes flow: UI → Memory (instant) → Disk (on Sync only).

---

## In-Memory Representation

On load, the viewer reads all MDs in the domain folder and builds an in-memory store:

```javascript
// Per-MD memory structure
{
  filename: "thinkmutant.md",
  rawContent: "[full file content as string — never modified]",
  loadedContentHash: "[SHA-256 hash of rawContent at load time]",
  frontMatter: { /* parsed YAML as JS object */ },
  body: "[markdown body as string — original]",
  pendingBodyAppends: {
    actionLog: [],
    decisionLog: [],
    openQuestionsLog: []
  },
  dirty: false,
  lastModifiedOnDisk: "[timestamp from file at load time]"
}
```

The `rawContent` field is preserved untouched as the baseline for conflict detection. `frontMatter` is the live working object — the viewer reads from and writes to this. `body` is read-only except for `pendingBodyAppends`.

---

## Diff Tracking

A session-level diff records every change:

```javascript
// Session diff structure
{
  sessionStart: "[ISO timestamp]",
  lastChange: "[ISO timestamp]",
  changes: [
    {
      filename: "thinkmutant.md",
      field: "state",
      from: "parked",
      to: "active",
      timestamp: "[ISO timestamp]"
    },
    {
      filename: "thinkmutant.md",
      field: "actions[0].state",
      from: "open",
      to: "done",
      timestamp: "[ISO timestamp]"
    },
    {
      filename: "patterntopia.md",
      field: "actionLog",
      type: "append",
      content: "**2026-06-15** — Reviewed positioning against ThinkMutant.",
      timestamp: "[ISO timestamp]"
    }
  ]
}
```

Every UI interaction that changes data appends to this diff. The diff is the audit trail for the session. It is cleared after a successful Sync.

---

## Editable Fields

### Front matter fields — editable via viewer UI

All front matter fields are editable. Changes write to the in-memory `frontMatter` object and mark the MD as `dirty: true`.

| Field | UI control | Write-back behavior |
|---|---|---|
| `state` | Dropdown | Update field value |
| `absorbed_by` | Text input | Update field value; appears only when state → absorbed |
| `doc_level` | Dropdown | Update field value; triggers state transition prompts |
| `focus` | Toggle | Update boolean; triggers >2 focus warning if applicable |
| `try_it` | Toggle | Update boolean |
| `map_it` | Toggle | Update boolean |
| `todoist` | Toggle | Update boolean |
| `uses` | Tag input | Add/remove list items |
| `synergies` | Tag input | Add/remove list items |
| `actions` | Structured list | Add / edit / reorder / change state / change type / flag as queued |
| `action.description` | Text input | Update field value |
| `action.type` | Dropdown | Update field value |
| `action.state` | Dropdown | Update field value; triggers prompts on done for prototype/decision/research types |
| `action.queued` | Toggle / flag button | Set true from Concept view or All Actions view; adds action to Queue view and `_queue.json`. Set false from Queue view to remove. Triggers soft warning if queue exceeds 10 items. |
| `action.position` | Drag to reorder | Recalculate local position integers within this MD on drop |

**Queue ordering** — global execution order is set by drag-and-drop in the Queue view. Reordering in Queue view writes to `_queue.json` only — does not affect `position` field in MD front matter. Local `position` and global queue order are independent.

### System files — viewer-managed

| File | Write trigger | Notes |
|---|---|---|
| `_queue.json` | On Sync, whenever `queued` flags or queue order changed | Ordered list of `{ filename, description }` for all `queued: true` actions. Authoritative global execution order. |

### Front matter fields — read only in viewer

| Field | Reason |
|---|---|
| `name` | Renaming has system-wide implications (uses:/synergies: references). Not editable in viewer — requires manual MD edit and corpus-wide find/replace. |
| `type` | Structural classification. Not changed in normal operation. |
| `created_date` | Set at creation. Never modified. |
| `modified_date` | Set by write-back on Sync. Not user-editable. |

### Body fields — append only

The viewer never edits existing body content. It only appends to the three log sections.

| Log section | When appended |
|---|---|
| Action Log | User marks an action as done; user adds a manual log entry |
| Decision Log | User resolves a `decision` action type; state transition triggers auto-entry |
| Open Questions Log | User adds an open question; user marks a question resolved |

Append entries are held in `pendingBodyAppends` until Sync.

### Body fields — human-edited only

The following body sections are never touched by the viewer programmatically:

- Idea Capsule (all versions)
- One Paragraph
- Brief sections
- Compilation sections
- Synergy narrative

These are authored in a text editor and read by the viewer for display only.

**Exception — absorption Brief draft:** On absorption confirmation, the viewer presents a drafted Brief entry for the absorbing MD. If human confirms, this is treated as a body append (not an edit) — appended as a new Brief section above existing Brief sections.

---

## YAML Parsing and Reconstruction

### Parsing

On load, the viewer splits each MD at the front matter delimiter:

```javascript
function parseMarkdownFile(rawContent) {
  const fmMatch = rawContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { frontMatter: {}, body: rawContent };
  
  return {
    frontMatter: parseYAML(fmMatch[1]),  // parsed to JS object
    body: fmMatch[2]                      // raw string, preserved exactly
  };
}
```

The body is stored as a raw string from the point after the closing `---` delimiter to end of file. It is never parsed further by the write-back system — only read for display and appended to for logs.

### Reconstruction

On Sync, each dirty MD is reconstructed from its in-memory state:

```javascript
function reconstructMarkdownFile(md) {
  const yamlString = serializeYAML(md.frontMatter);
  
  // Validation pass — parse output back immediately and compare to source object
  // If round-trip fails, abort write for this MD rather than risk silent corruption
  const roundTrip = parseYAML(yamlString);
  if (!yamlRoundTripValid(md.frontMatter, roundTrip)) {
    throw new Error(`YAML validation failed for ${md.filename} — write aborted`);
  }
  
  const bodyWithAppends = applyBodyAppends(md.body, md.pendingBodyAppends);
  return `---\n${yamlString}\n---\n${bodyWithAppends}`;
}

function yamlRoundTripValid(original, roundTrip) {
  // Deep compare original frontMatter object to round-tripped parse
  // Returns false if any field value changed in serialization/deserialization
  return JSON.stringify(original) === JSON.stringify(roundTrip);
}
```

If validation throws: write is aborted for that MD, error surfaced to human, MD remains dirty for retry. No partial writes.

The `modified_date` field is updated to today's date as part of reconstruction — always, for every dirty MD on Sync.

### YAML serialization

The viewer uses a minimal YAML serializer — no external library. Rules:

- Scalar fields: `key: value`
- Boolean fields: `key: true` or `key: false`
- Date fields: `key: YYYY-MM-DD`
- List fields (uses:, synergies:): each item on its own line, two-space indent, dash prefix
- actions: list: each action as a YAML mapping block, two-space indent

Field order in output matches field order in the schema spec — consistent, readable, diffable in a text editor.

```yaml
---
name: ThinkMutant
type: concept
doc_level: compilation
state: active
focus: true
try_it: true
map_it: false
absorbed_by:
created_date: 2026-05-01
modified_date: 2026-06-15
uses:
  - InsightMutant
  - Document ingest and structure extraction engine
synergies:
  - The Current
  - Subtext
todoist: false
actions:
  - description: Prototype mind map rendering
    type: prototype
    state: open
    position: 1
  - description: Define JSON schema for idea graph
    type: task
    state: done
    position: 2
---
```

**Preservation rule:** Any YAML field present in the original file that is not in the schema spec is preserved as-is in reconstruction. Unknown fields are passed through — the serializer does not strip unrecognized keys.

---

## Body Append Mechanism

Log appends are applied to the body string at Sync time. Each log section has a known heading pattern. New entries are inserted immediately after the heading line.

```javascript
function applyBodyAppends(body, pendingAppends) {
  let result = body;

  if (pendingAppends.actionLog.length > 0) {
    result = insertAfterHeading(result, '## Action Log', 
      pendingAppends.actionLog.join('\n\n'));
  }
  if (pendingAppends.decisionLog.length > 0) {
    result = insertAfterHeading(result, '## Decision Log',
      pendingAppends.decisionLog.join('\n\n'));
  }
  if (pendingAppends.openQuestionsLog.length > 0) {
    result = insertAfterHeading(result, '## Open Questions Log',
      pendingAppends.openQuestionsLog.join('\n\n'));
  }

  return result;
}

function insertAfterHeading(body, heading, content) {
  const headingIndex = body.indexOf(heading);
  if (headingIndex === -1) {
    // Heading not found — caller must handle this case
    // Do NOT silently append; surface a warning to the human instead
    throw new Error(`Heading "${heading}" not found in body`);
  }
  const afterHeading = headingIndex + heading.length;
  return body.slice(0, afterHeading) + '\n\n' + content + body.slice(afterHeading);
}
```

**Heading-not-found behavior (v1.3):** If the expected heading is not found, the viewer does NOT silently create a new section. Instead it surfaces a warning and does not write the append:

```
⚠️ Could not find "## Action Log" in [filename].
The viewer cannot append safely. No changes were written to this file.
Edit the log manually in your text editor, or rename the heading to:
## Action Log
```

**Exception:** If `doc_level` is `spark`, log sections may not exist yet. The viewer may create the section at the end of the body for spark MDs only.

**Rationale:** Silent fallback to end-of-body creates duplicate headings when the user has renamed a section in their text editor. Duplicate headings require manual merge — worse than not appending at all.
```

Appends are prepended to the top of each log section (reverse chronological — newest first). The existing log content follows below unchanged.

---

## Sync Process

### Pre-Sync conflict check

Before writing, the viewer checks each dirty MD for external modification using both timestamp and content hash — timestamp alone is unreliable since Dropbox can update timestamps during sync without content changing:

```javascript
async function checkForConflicts(dirtyMDs, directoryHandle) {
  const conflicts = [];
  for (const md of dirtyMDs) {
    const fileHandle = await directoryHandle.getFileHandle(md.filename);
    const file = await fileHandle.getFile();
    const currentContent = await file.text();
    const currentHash = await contentHash(currentContent);
    
    // Conflict only if content actually changed — not just timestamp
    if (currentHash !== md.loadedContentHash) {
      conflicts.push({
        filename: md.filename,
        diskModified: new Date(file.lastModified).toISOString(),
        sessionStart: md.sessionStart
      });
    }
  }
  return conflicts;
}

async function contentHash(text) {
  // SHA-256 via SubtleCrypto — available in all modern browsers, no library needed
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}
```

`loadedContentHash` is computed from `rawContent` at load time and stored in the MD memory structure. If content hash matches, no conflict — even if Dropbox updated the timestamp.

If conflicts are detected, the viewer surfaces them before writing. One prompt per conflicted file — safe default is skip:

```
⚠️ [filename] was modified outside the viewer since this session started.
Your viewer changes will overwrite those external changes if you proceed.

  [Skip this file — keep disk version]   [Overwrite — keep viewer changes]
```

- Default button is **Skip this file** — safe default
- **Overwrite** requires a single explicit click — no second confirmation needed
- One prompt per conflicted file — no bulk resolution
- After resolution: if Skip, reload that file from disk into memory; if Overwrite, proceed with write

No field-level diff display. Single-user context means the user knows whether they edited the file externally — one clear question is enough.

**Rationale:** Dropbox version history is a first-class safety net for this deployment. Every write the viewer makes creates a Dropbox file version recoverable for 30+ days. If a write produces unexpected results, the recovery path is: identify the file → right-click in Dropbox → Version history → Restore. This justifies the simplified conflict UI.

### Write pass

After conflict resolution, Sync writes all dirty MDs:

```javascript
async function syncAll(dirtyMDs, directoryHandle) {
  const results = { succeeded: [], failed: [] };
  
  for (const md of dirtyMDs) {
    try {
      const reconstructed = reconstructMarkdownFile(md);
      const fileHandle = await directoryHandle.getFileHandle(md.filename);
      const writable = await fileHandle.createWritable();
      await writable.write(reconstructed);
      await writable.close();
      results.succeeded.push(md.filename);
    } catch (error) {
      results.failed.push({ filename: md.filename, error: error.message });
    }
  }
  
  return results;
}
```

Write order: alphabetical by filename. No dependency ordering needed — each MD is independent.

### Post-Sync

After a successful Sync:
- Diff is cleared
- All `dirty` flags reset to false
- `lastModifiedOnDisk` updated to current timestamp for each written MD
- `rawContent` updated to reconstructed content
- `pendingBodyAppends` cleared
- Sync confirmation displayed: `Synced [n] files at [time].`

If any writes failed:
- Failed files remain dirty
- A clear post-Sync report is displayed naming all written and unwritten files:

```
Sync complete — [n] of [n] files written.

✅ Written: thinkmutant.md, patterntopia.md
❌ Not written: cobaltbat.md — [reason]

Changes to unwritten files are preserved in the viewer.
Check whether any written files reference names in unwritten files before continuing.
```

- The cross-file reference warning is shown whenever any file fails — even if the user doesn't think references are involved
- No rollback of successfully written files — partial Sync is accepted
- Unwritten files remain dirty and retryable

---

## State Transition Behaviors at Write-Back

These behaviors trigger in the UI at the moment of change (not at Sync). The resulting data changes are written at Sync.

### → absorbed

1. Viewer prompts: *"[Name] has been absorbed into [absorbed_by value]. Review [name]'s open actions — recreate any that should carry forward. Open [name] now?"* (Open / Done)
2. System drafts Decision Log entry for absorbing MD: `[date] — [absorbed name] absorbed into this concept. See [filename] for full history.` — presented for human confirmation before adding to pendingBodyAppends
3. System drafts Brief entry for absorbing MD — presented for human confirmation before adding to pendingBodyAppends
4. Both confirmed entries held in pendingBodyAppends until Sync

### → retired

1. Confirmation prompt: *"Mark [name] as retired? This is a clean close — nothing carries forward."* (Confirm / Cancel)
2. On confirm: state updated in memory

### doc_level → compilation

1. Prompt: *"Compilation signals build-readiness. Add [name] to the active build queue?"* (Yes / Not yet)
2. On Yes: `focus: true` suggested (human confirms)

### focus: true on third concept

1. Warning: *"You have 3 concepts marked as focus. Recommended limit is 2. Continue?"* (Continue / Cancel)
2. Soft warning — human can override

### action.state → done (type: prototype)

1. Viewer prompts for Action Log entry: *"Add a prototype result note?"* (text input, optional)
2. If entered: appended to Action Log in pendingBodyAppends
3. `try_it: true` set automatically if not already set

### action.state → done (type: decision)

1. Viewer prompts for Decision Log entry: *"What was decided?"* (text input, optional)
2. If entered: appended to Decision Log in pendingBodyAppends

### action.state → done (type: research)

1. Viewer prompts for Action Log entry: *"Add a research result note?"* (text input, optional)
2. If entered: appended to Action Log in pendingBodyAppends
3. `map_it: true` set automatically if not already set

---

## Sync Reminder System

### Pending change indicator

Visible at all times when diff is non-empty. Displays in the viewer header:

```
● 3 files with unsynced changes   [Sync now]
```

Dot is amber. Count updates as changes accumulate. Not a blocking prompt — always visible, never intrusive.

### Length threshold reminder

When the diff contains changes to more than 5 MDs, the indicator becomes more prominent — color shifts, count is bolded. No popup, no interruption.

### Age threshold reminder

If the oldest unsynced change is more than 30 minutes old, a soft reminder appears below the indicator:

```
● 3 files with unsynced changes — oldest from 34 min ago   [Sync now]
```

Dismissible. Reappears every 15 minutes until Sync.

### On close / navigate away

If the viewer is closed or the tab is navigated away with unsynced changes, the browser's native `beforeunload` event fires a prompt:

```
You have unsynced changes in 3 files. Leave without syncing?
```

Standard browser dialog — cannot be customized. Human clicks Stay or Leave. If Stay: viewer remains open. If Leave: changes are lost (in-memory only). This is the safety net — the age reminder is the primary nudge.

**Note on beforeunload:** Browser behavior varies. Some browsers suppress this prompt in certain conditions. The age reminder system is the more reliable nudge — do not rely on beforeunload as the only safety.

---

## One Paragraph Generation in Viewer

The viewer supports generating a One Paragraph draft for any MD that has a `[FILL:]` placeholder or an empty One Paragraph field. This uses the same in-browser generation approach as the migration tool.

**Trigger:** Human clicks "Generate" next to the One Paragraph field in the concept view.

**Input:** Core Sentence + Key Insights + Why It's Real fields from the in-memory frontMatter and body.

**Output:** Draft presented inline in the viewer for human edit and confirmation. On confirm: One Paragraph field updated in the Idea Capsule body section.

**Body edit exception:** One Paragraph is a body field (inside the Idea Capsule section), not a front matter field. Updating it requires a targeted body edit — not an append. The viewer uses a find-and-replace on the specific line:

```javascript
function updateOneParagraph(body, newText) {
  // Match: **One Paragraph** — [anything until next blank line or next ** field]
  return body.replace(
    /(\*\*One Paragraph\*\* — )([^\n]*(?:\n(?!\n|\*\*).*)*)/,
    `$1${newText}`
  );
}
```

This is the one case where the viewer performs a targeted body edit rather than an append. It is scoped tightly to the One Paragraph field pattern to minimize corruption risk.

**Safety:** If the regex match fails (body structure unexpected), the viewer does not write. Instead: *"Could not locate One Paragraph field in body. Edit manually in your text editor."*

---

## Error States and Recovery

| Error | Behavior |
|---|---|
| File System Access API not available | Viewer loads in read-only mode. All write controls disabled. Banner: "Write-back unavailable — Chrome required for editing." |
| Folder permission revoked mid-session | Sync fails with permission error. Viewer prompts to re-grant folder access. Diff preserved in memory. |
| YAML serialization produces invalid output | Write aborted for that MD. Error logged. Human prompted to report. Raw in-memory state preserved. |
| Body append heading not found | Section appended at end of body with correct heading. No data lost. |
| Sync partial failure | Failed files remain dirty. Succeeded files cleared. Retry available. |
| File modified externally during session | Conflict surfaced pre-Sync. Human resolves per file. No silent overwrites. |

---

## Future: Multi-User Considerations

Current design is single-user. For multi-user, the primary changes would be:

- **Conflict detection** — content hash comparison already implemented in Stage 1; extend with user identity in diff and advisory lock file
- **Sync frequency** — possibly auto-Sync on each change rather than batched, to reduce conflict window
- **Locking** — advisory lock file written to folder when a user opens for editing; cleared on close
- **Diff format** — extended to include user identity

These are not Stage 1 concerns. The current diff/Sync architecture is forward-compatible with these additions.

---

## Shared Module — matterqueue-core.js

The migration tool and viewer share a single JS module to prevent implementation drift. Build this first.

**Contents:**
- YAML parser and serializer (including round-trip validation)
- MD file splitter — front matter / body separator
- Body append functions (`insertAfterHeading`)
- One Paragraph targeted replace (`updateOneParagraph`)
- Name slug derivation
- Content hash utility (`contentHash` via SubtleCrypto)

Both HTML files load `matterqueue-core.js` as a local script reference. Bug fixes and improvements apply to both tools simultaneously.

---

---

## Dropbox Version History — Explicit Safety Net

Dropbox version history is a first-class safety net for this deployment. Every write the viewer makes creates a Dropbox file version recoverable for 30+ days.

This policy justifies several simplifications in the spec:
- Single confirmation on conflict resolution (not multi-step)
- No rollback on partial Sync failure
- No on-load name reference validation
- No post-replace verification on One Paragraph

Recovery path for any write problem: identify the file → right-click in Dropbox → Version history → Restore. This is a 30-second fix, not a 2-hour repair.

---

## Viewer View Architecture

### Single-concept context

Views that operate on one MD at a time. Accessed by clicking a concept from any collection-level view.

| View | Displays | Editable |
|---|---|---|
| **Overview** | All front matter fields as structured UI. Concept name, type, doc_level, state, focus/try_it/map_it/todoist toggles, absorbed_by input (when state: absorbed), uses and synergies as tag inputs, actions list with type/state dropdowns, queue toggle, description input, remove button. Navigation links to compilation-[slug].md and build-[slug].md when flagged. | State, doc_level, flags, absorbed_by, uses, synergies, actions (add / edit / change type / change state / queue toggle) |
| **Body** | Markdown-rendered body. Jump menu derived from body headings. Log sections show append controls — dated entry field + confirm button. | Append-only to log sections |

### Collection-level context

**Concept views**

| View | Displays | Editable |
|---|---|---|
| **All Concepts** (home/default) | All MDs as rows: name, type, state, doc_level, focus indicator. Filter controls: state / type / doc_level. View title updates dynamically with active filter. Dirty indicator per row. | State, doc_level, focus inline per row |
| **Focus** | Only MDs where focus: true. Same row display. Warning banner if more than 2 focus concepts. Drag-to-sort for manual ordering (session-only). | Same inline edits; drag to reorder |

**Action views**

| View | Displays | Editable |
|---|---|---|
| **Queued** | Actions where queued: true only, in _queue.json order. Concept name, description, type badge, state badge. Blocked actions visually distinct. Soft cap warning at 10 items. Title reads "Queued [action_label]". | Drag to reorder (writes to _queue.json), remove button per item |
| **All [action_label]** | Every open and blocked action across all MDs. Default filter: open + blocked only (done requires explicit filter change). Grouped by concept name. Title updates dynamically with active filter. | Flag as queued per item |

**Navigation model**
- All Concepts is the home view — what loads after folder picker
- Concepts / Actions are top-level mode buttons in the header
- Focus, Queued, All Actions are sub-nav tabs within their mode
- Concept Overview and Body are drill-downs — not primary nav items
- Back button returns to the collection view the concept was opened from

**Persistent header elements (all views)**
- Domain label (from _system.md label field)
- Sync dot + unsaved count — always visible when dirty, pulses amber
- Sync button — always visible
- Sync Log button — opens log view

**Landing state (before folder open)**
Single screen with folder picker prompt. On open: reads _system.md; if absent, surfaces error. If present: loads all MDs, computes content hashes, checks duplicate names, navigates to All Concepts view.

**Deferred viewer features (post-migration)**
- Group-by axes: All Concepts (state/type/doc_level/focus-first); All Actions (concept/type/state/queued vs unqueued)
- Kanban view — highest-value non-table view; columns: active/parked/absorbed; drag to change state
- Click-to-section — clicking action in All Actions opens concept Overview scrolled to that action
- Inline action editing in All Actions — state and queue toggle inline in rows
- Graph view — nodes = MDs, edges = synergies: declarations
- Dependency view — derived from uses: fields

---

## Write-Back Spec Summary

| Decision | Value |
|---|---|
| Write timing | On explicit Sync only — never on individual change |
| In-memory state | Full parsed representation of all loaded MDs |
| Diff tracking | Per-change log keyed by filename and field |
| Conflict detection | Content hash comparison via SHA-256 (SubtleCrypto) — not timestamp alone |
| Conflict resolution UI | One prompt per file; safe default is Skip (keep disk); single click to Overwrite; no field-level diff |
| Partial Sync failure | Named file report: all written and unwritten files listed; cross-file reference warning shown; no rollback |
| Body append heading-not-found | Warn and abort — do not write; exception for spark MDs with no log sections |
| Body modification | Append-only (logs) + One Paragraph targeted replace only |
| YAML serialization | Handwritten serializer; no external library; consistent field order |
| YAML validation | Round-trip parse after serialization; abort write on mismatch |
| Sync reminder — indicator | Always visible when diff non-empty |
| Sync reminder — age | 30 min threshold; reappears every 15 min; dismissible |
| Sync reminder — length | 5 MD threshold; indicator prominence increases |
| Sync reminder — close | beforeunload browser prompt; secondary to age reminder |
| Post-Sync | Diff cleared; dirty flags reset; rawContent + loadedContentHash updated |
| Partial Sync failure | Failed files remain dirty; succeeded files cleared; retry available |
| Read-only fields | name, type, created_date, modified_date |
| modified_date update | Automatic on every Sync write |
| Shared module | matterqueue-core.js — built first; consumed by both migration tool and viewer |
| Queue view | queued: true actions only; global order from _queue.json; drag to reorder |
| All Actions view | every open/blocked action across all MDs; primary flagging instrument |
| Concept view | actions within single MD; local position order; queued actions flagged |
| _queue.json | viewer-managed; written on Sync; ordered array of { filename, description } |
| Queue soft cap | warning at 10 queued items; not a block |

---

*Matterqueue Write-Back Mechanism Design v1.3 — locked for Stage 1 build*
*Amendments v1.1: YAML round-trip validation; content hash conflict detection; shared matterqueue-core.js module*
*Amendments v1.2: queued boolean on actions; _queue.json global queue file; three viewer views; Queue ordering via drag-and-drop; local position distinct from global queue order*
*Amendments v1.3: simplified conflict resolution UI (one prompt, safe default); partial Sync failure named-file report; body append heading-not-found changed to warn-and-abort; Dropbox version history as explicit safety net; viewer view architecture added as spec section*
*Note: write-back operates on concept MDs and _queue.json only — compilation-[slug].md and build-[slug].md are human/AI-authored external artifacts; viewer surfaces navigation links to them but does not write to them. Schema reference: matterqueue-schema-2026-06-15.md v1.3*
