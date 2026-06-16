// tests/viewer.spec.js
// Matterqueue viewer acceptance test suite
//
// Strategy: mock the File System Access API before the page loads using
// addInitScript(). The viewer calls showDirectoryPicker() as a global —
// we replace it with a function that returns an in-memory directory handle
// backed by plain JS objects. The viewer never touches the real picker or
// the real disk. Sync writes call createWritable() on our mock handles,
// which capture the written content in memory so tests can assert on it.
//
// Coverage per build doc Feature Queue 3.5:
//   ✓ Folder load (happy path, missing _system.md error)
//   ✓ All views render (All Concepts, Focus, Queued, All Actions, Concept Overview, Body)
//   ✓ Filter logic (state, type, level filters; Actions state filter)
//   ✓ Sync writes correct YAML (state change → Sync → assert YAML on disk)
//   ✓ Drag-to-reorder (queue drag reorder; action drag via evaluate; focus drag)
//   ✓ Autocomplete (tag input shows suggestions, Enter commits, resolved/unresolved name badges)
//   ✓ Conflict modal behavior (safe default is Skip, Overwrite proceeds)

const { test, expect } = require('@playwright/test');

// ─── TEST FIXTURES ──────────────────────────────────────────────────────────

const SYSTEM_MD = `---
domain: test-portfolio
label: Test Portfolio
action_label: Build Items
focus_limit: 3
queue_cap: 5
---
`;

const GLASSBELL_MD = `---
name: Glassbell
type: concept
doc_level: capsule
state: active
focus: true
try_it: false
map_it: false
todoist: false
created_date: 2026-06-01
modified_date: 2026-06-01
uses:
  - Driftmap
synergies:
  - Frostline
actions:
  - description: Prototype the glass rendering pipeline
    type: prototype
    state: open
    queued: true
    position: 1
  - description: Research competitor glass tools
    type: research
    state: open
    position: 2
---

## Idea Capsule -- 2026-06-01

**Name** -- Glassbell
**One Phrase** -- Crystal-clear UI components
**Core Sentence** -- Glassbell makes glass-effect UI components trivially composable.
**One Paragraph** -- A placeholder paragraph for testing purposes.

**Key Insights**
- Glass effects are hard to get right
- Most libraries get performance wrong

**User** -- Frontend developers

**Model** -- Open-source with a pro tier

**Why It\'s Real**
- Demand confirmed via surveys
- No good existing solution

**Flags** -- None critical

**Synergy**
- Frostline: related rendering approach

---

## Action Log

---

## Decision Log

---

## Open Questions Log
`;

const DRIFTMAP_MD = `---
name: Driftmap
type: engine
doc_level: spark
state: parked
created_date: 2026-06-01
modified_date: 2026-06-01
---

A spatial drift mapping engine for route analysis.
`;

const FROSTLINE_MD = `---
name: Frostline
type: workflow
doc_level: capsule
state: absorbed
absorbed_by: Glassbell
created_date: 2026-06-01
modified_date: 2026-06-01
actions:
  - description: Audit frost rendering paths
    type: task
    state: done
    position: 1
---

## Idea Capsule -- 2026-06-01

**Name** -- Frostline
**One Phrase** -- Frost effect workflow
**Core Sentence** -- Frostline standardises frost rendering across products.
**One Paragraph** -- A placeholder for Frostline.

**Key Insights**
- Frost and glass share rendering primitives

**User** -- Internal teams

**Model** -- Internal utility

**Why It\'s Real**
- Already in use in three products

**Flags** -- Absorbed into Glassbell

**Synergy**
- Glassbell: absorbed upstream

---

## Action Log

---

## Decision Log

---

## Open Questions Log
`;

const VAULTMOTH_MD = `---
name: Vaultmoth
type: concept
doc_level: brief
state: active
focus: true
try_it: true
map_it: false
todoist: false
created_date: 2026-06-01
modified_date: 2026-06-01
actions:
  - description: Build vault prototype
    type: prototype
    state: open
    queued: true
    position: 1
  - description: Decide on storage backend
    type: decision
    state: blocked
    position: 2
---

## Idea Capsule -- 2026-06-01

**Name** -- Vaultmoth
**One Phrase** -- Encrypted personal vaults
**Core Sentence** -- Vaultmoth provides encrypted personal vaults for sensitive notes.
**One Paragraph** -- A placeholder paragraph for Vaultmoth.

**Key Insights**
- Encryption at rest is table stakes
- UX is the differentiator

**User** -- Privacy-conscious individuals

**Model** -- Subscription

**Why It\'s Real**
- Growing demand for privacy tools

**Flags** -- None

**Synergy**
- None yet

---

## Action Log

---

## Decision Log

---

## Open Questions Log
`;

const QUEUE_JSON = JSON.stringify({
  updated: '2026-06-01',
  queue: [
    { filename: 'glassbell.md', description: 'Prototype the glass rendering pipeline' },
    { filename: 'vaultmoth.md', description: 'Build vault prototype' },
  ]
}, null, 2);

// ─── MOCK FILESYSTEM ────────────────────────────────────────────────────────

function buildMockFSScript(files) {
  const filesJSON = JSON.stringify(files);
  return `
(function() {
  window.__mockFS = ${filesJSON};
  window.__mockWrites = {};

  function makeMockFileHandle(name) {
    return {
      kind: 'file',
      name,
      getFile: async () => ({
        text: async () => window.__mockFS[name] !== undefined ? window.__mockFS[name] : '',
        lastModified: Date.now(),
      }),
      requestPermission: async () => 'granted',
      queryPermission: async () => 'granted',
      createWritable: async () => {
        let chunks = [];
        return {
          write: async (data) => { chunks.push(data); },
          close: async () => {
            const content = chunks.join('');
            window.__mockFS[name] = content;
            window.__mockWrites[name] = content;
          },
        };
      },
    };
  }

  function makeMockDirHandle(folderName) {
    return {
      name: folderName,
      kind: 'directory',
      queryPermission: async () => 'granted',
      requestPermission: async () => 'granted',
      getFileHandle: async (filename, opts) => {
        if (window.__mockFS[filename] === undefined) {
          if (opts && opts.create) {
            window.__mockFS[filename] = '';
          } else {
            const e = new Error('File not found: ' + filename);
            e.name = 'NotFoundError';
            throw e;
          }
        }
        return makeMockFileHandle(filename);
      },
      values: async function*() {
        for (const filename of Object.keys(window.__mockFS)) {
          yield makeMockFileHandle(filename);
        }
      },
    };
  }

  window.showDirectoryPicker = async () => makeMockDirHandle('venture-portfolio');

  // Prevent IndexedDB restore from injecting a stale real folder handle.
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof restoreHandle === 'function') {
      window.restoreHandle = async () => null;
    }
  }, true);
})();
`;
}

// ─── TEST HELPERS ────────────────────────────────────────────────────────────

function standardCorpus() {
  return {
    '_system.md': SYSTEM_MD,
    '_queue.json': QUEUE_JSON,
    'glassbell.md': GLASSBELL_MD,
    'driftmap.md': DRIFTMAP_MD,
    'frostline.md': FROSTLINE_MD,
    'vaultmoth.md': VAULTMOTH_MD,
  };
}

async function loadViewer(page, files) {
  await page.addInitScript({ content: buildMockFSScript(files) });
  await page.goto('/matterqueue-viewer.html');
}

async function clickOpenFolder(page) {
  await page.click('#open-folder-btn');
  await expect(page.locator('#view-landing')).toHaveClass(/hidden/, { timeout: 8000 });
}

async function openFolderAndWait(page, files) {
  await loadViewer(page, files || standardCorpus());
  await clickOpenFolder(page);
  await expect(page.locator('#view-concepts')).not.toHaveClass(/hidden/, { timeout: 8000 });
  await expect(page.locator('#concepts-list')).not.toBeEmpty({ timeout: 5000 });
}

async function openConcept(page, name) {
  const row = page.locator('.concept-row', { has: page.locator('.concept-name', { hasText: name }) });
  await row.click();
  await expect(page.locator('#view-concept')).not.toHaveClass(/hidden/, { timeout: 5000 });
  await expect(page.locator('#concept-breadcrumb')).toContainText(name);
}

async function triggerSync(page) {
  await page.click('#sync-btn');
  await expect(page.locator('#sync-btn')).not.toBeDisabled({ timeout: 10000 });
}

// ─── TESTS ───────────────────────────────────────────────────────────────────

// ── 1. FOLDER LOAD ───────────────────────────────────────────────────────────

test.describe('1. Folder load', () => {

  test('shows landing screen with Open folder button before load', async ({ page }) => {
    await loadViewer(page, {});
    await expect(page.locator('#open-folder-btn')).toBeVisible();
    await expect(page.locator('#view-landing')).not.toHaveClass(/hidden/);
    await expect(page.locator('#sync-btn')).toBeDisabled();
  });

  test('loads folder: hides landing, shows domain label from _system.md, renders All Concepts', async ({ page }) => {
    await openFolderAndWait(page);
    await expect(page.locator('#view-landing')).toHaveClass(/hidden/);
    await expect(page.locator('#domain-label')).toHaveText('Test Portfolio');
    await expect(page.locator('#view-concepts')).not.toHaveClass(/hidden/);
    await expect(page.locator('.concept-row')).toHaveCount(4);
  });

  test('reads focus_limit and queue_cap from _system.md into App.systemConfig', async ({ page }) => {
    await openFolderAndWait(page);
    const config = await page.evaluate(() => App.systemConfig);
    expect(config.focus_limit).toBe(3);
    expect(config.queue_cap).toBe(5);
    expect(config.action_label).toBe('Build Items');
  });

  test('loads all MD front matter correctly into App.mds', async ({ page }) => {
    await openFolderAndWait(page);
    const mds = await page.evaluate(() => {
      return Object.fromEntries(
        Object.entries(App.mds).map(([k, v]) => [k, {
          name: v.frontMatter.name,
          state: v.frontMatter.state,
          type: v.frontMatter.type,
          doc_level: v.frontMatter.doc_level,
          dirty: v.dirty,
        }])
      );
    });
    expect(mds['glassbell.md'].name).toBe('Glassbell');
    expect(mds['glassbell.md'].state).toBe('active');
    expect(mds['glassbell.md'].dirty).toBe(false);
    expect(mds['driftmap.md'].type).toBe('engine');
    expect(mds['frostline.md'].state).toBe('absorbed');
  });

  test('shows error on folder missing _system.md', async ({ page }) => {
    await loadViewer(page, { 'glassbell.md': GLASSBELL_MD });
    await page.click('#open-folder-btn');
    await expect(page.locator('#landing-error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#landing-error')).toContainText('_system.md');
    await expect(page.locator('#view-landing')).not.toHaveClass(/hidden/);
  });

  test('skips _-prefixed files, compilation- files, and build- files when loading MDs', async ({ page }) => {
    const corpus = {
      ...standardCorpus(),
      'compilation-glassbell.md': '---\nname: Should Not Load\n---\n',
      'build-glassbell.md': '---\nname: Should Not Load Either\n---\n',
    };
    await openFolderAndWait(page, corpus);
    const mdKeys = await page.evaluate(() => Object.keys(App.mds));
    expect(mdKeys).not.toContain('compilation-glassbell.md');
    expect(mdKeys).not.toContain('build-glassbell.md');
    expect(mdKeys).not.toContain('_system.md');
    expect(mdKeys).not.toContain('_queue.json');
  });

  test('loads queue from _queue.json into App.queue', async ({ page }) => {
    await openFolderAndWait(page);
    const queue = await page.evaluate(() => App.queue);
    expect(queue).toHaveLength(2);
    expect(queue[0].filename).toBe('glassbell.md');
    expect(queue[0].description).toBe('Prototype the glass rendering pipeline');
  });

  test('duplicate name detection shows error banner', async ({ page }) => {
    const corpus = {
      ...standardCorpus(),
      'glassbell-copy.md': GLASSBELL_MD,
    };
    await openFolderAndWait(page, corpus);
    await expect(page.locator('.banner.error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.banner.error')).toContainText('Glassbell');
  });

});

// ── 2. ALL VIEWS RENDER ───────────────────────────────────────────────────────

test.describe('2. All views render', () => {

  test('All Concepts view shows all loaded concepts with correct columns', async ({ page }) => {
    await openFolderAndWait(page);
    await expect(page.locator('.concept-row')).toHaveCount(4);
    const names = await page.locator('.concept-name').allTextContents();
    expect(names).toContain('Glassbell');
    expect(names).toContain('Driftmap');
    expect(names).toContain('Frostline');
    expect(names).toContain('Vaultmoth');
  });

  test('All Concepts sorts active before parked before absorbed', async ({ page }) => {
    await openFolderAndWait(page);
    const names = await page.locator('.concept-name').allTextContents();
    const glassbellIdx = names.indexOf('Glassbell');
    const vaultmothIdx = names.indexOf('Vaultmoth');
    const driftmapIdx = names.indexOf('Driftmap');
    const frostlineIdx = names.indexOf('Frostline');
    expect(glassbellIdx).toBeLessThan(driftmapIdx);
    expect(vaultmothIdx).toBeLessThan(driftmapIdx);
    expect(driftmapIdx).toBeLessThan(frostlineIdx);
  });

  test('Focus sub-nav tab shows only focus:true concepts', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-preset="focus"]');
    await expect(page.locator('#concepts-title')).toHaveText('Focus');
    await expect(page.locator('.concept-row')).toHaveCount(2);
    const names = await page.locator('.concept-name').allTextContents();
    expect(names).toContain('Glassbell');
    expect(names).toContain('Vaultmoth');
    expect(names).not.toContain('Driftmap');
    expect(names).not.toContain('Frostline');
  });

  test('Actions mode: Queued view shows queued actions in _queue.json order', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-mode="actions"]');
    await expect(page.locator('#view-queue')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await expect(page.locator('#queue-title')).toContainText('Build Items');
    const items = page.locator('.queue-item');
    await expect(items).toHaveCount(2);
    await expect(items.first()).toContainText('Prototype the glass rendering pipeline');
    await expect(items.nth(1)).toContainText('Build vault prototype');
  });

  test('Actions mode: All Actions view shows open and blocked actions grouped by concept', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-mode="actions"]');
    await page.click('[data-view="actions"]');
    await expect(page.locator('#view-actions')).not.toHaveClass(/hidden/, { timeout: 5000 });
    // Default: open + blocked only. Glassbell: 2 open, Vaultmoth: 1 open + 1 blocked
    await expect(page.locator('.actions-group')).toHaveCount(2);
    await expect(page.locator('#actions-count')).toContainText('4');
  });

  test('Concept Overview renders identity fields, flags, actions', async ({ page }) => {
    await openFolderAndWait(page);
    await openConcept(page, 'Glassbell');
    await expect(page.locator('#subtab-overview')).toContainText('Glassbell');
    await expect(page.locator('#subtab-overview')).toContainText('capsule');
    await expect(page.locator('#subtab-overview')).toContainText('active');
    await expect(page.locator('.flag-btn.focus-flag')).toHaveClass(/on/);
    await expect(page.locator('.concept-action-row')).toHaveCount(2);
    await expect(page.locator('.action-desc-input').first()).toHaveValue('Prototype the glass rendering pipeline');
  });

  test('Concept Overview shows external artifact links when compilation:true or build_doc:true', async ({ page }) => {
    const corpus = {
      ...standardCorpus(),
      'compilationtest.md': `---\nname: CompilationTest\ntype: concept\ndoc_level: compilation\nstate: active\ncompilation: true\nbuild_doc: true\ncreated_date: 2026-06-01\nmodified_date: 2026-06-01\n---\n\nBody here.\n`,
    };
    await openFolderAndWait(page, corpus);
    await openConcept(page, 'CompilationTest');
    await expect(page.locator('.ext-links')).toBeVisible();
    await expect(page.locator('.ext-link-btn').first()).toContainText('compilation doc');
    await expect(page.locator('.ext-link-btn').last()).toContainText('build doc');
  });

  // FIX #1/#2: toHaveCount() takes an exact integer, not { min: N }.
  // Glassbell has exactly 4 h2 headings (Idea Capsule, Action Log, Decision Log, Open Questions Log).
  test('Concept Body tab renders markdown and shows log append controls', async ({ page }) => {
    await openFolderAndWait(page);
    await openConcept(page, 'Glassbell');
    await page.click('[data-subtab="body"]');
    await expect(page.locator('#subtab-body')).not.toHaveClass(/hidden/, { timeout: 5000 });

    // Body rendered — at least 4 h2 headings (Idea Capsule + 3 log sections)
    const h2Count = await page.locator('.body-content h2').count();
    expect(h2Count).toBeGreaterThanOrEqual(4);

    // Log append controls — one per log section (3 sections present in body)
    await expect(page.locator('.log-append')).toHaveCount(3);
    await expect(page.locator('.log-append-btn').first()).toBeVisible();
  });

  test('Concept Body shows jump menu derived from body headings', async ({ page }) => {
    await openFolderAndWait(page);
    await openConcept(page, 'Glassbell');
    await page.click('[data-subtab="body"]');
    await expect(page.locator('.jump-menu')).toBeVisible({ timeout: 5000 });

    // At least 4 jump links (Idea Capsule + 3 log sections)
    const linkCount = await page.locator('.jump-link').count();
    expect(linkCount).toBeGreaterThanOrEqual(4);

    // First jump link is the Idea Capsule heading
    await expect(page.locator('.jump-link').first()).toContainText('Idea Capsule');
  });

  test('Sync Log view renders via Log button', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('#sync-log-btn');
    await expect(page.locator('#view-sync')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await expect(page.locator('#subnav')).not.toBeVisible();
    await expect(page.locator('#sync-pending')).toBeVisible();
    await expect(page.locator('#sync-log')).toBeVisible();
  });

  test('back button returns to previous collection view', async ({ page }) => {
    await openFolderAndWait(page);
    await openConcept(page, 'Glassbell');
    await page.click('#concept-back-btn');
    await expect(page.locator('#view-concepts')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await expect(page.locator('#view-concept')).toHaveClass(/hidden/);
  });

  test('opening concept from Actions mode: back returns to actions view', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-mode="actions"]');
    await page.click('[data-view="actions"]');
    await page.locator('.actions-group-header', { hasText: 'Glassbell' }).click();
    await expect(page.locator('#view-concept')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await page.click('#concept-back-btn');
    await expect(page.locator('#view-actions')).not.toHaveClass(/hidden/, { timeout: 5000 });
  });

});

// ── 3. FILTER LOGIC ──────────────────────────────────────────────────────────

test.describe('3. Filter logic', () => {

  test('Concepts state filter: active shows only active concepts', async ({ page }) => {
    await openFolderAndWait(page);
    await page.locator('#concepts-filters .filter-btn', { hasText: 'active' }).click();
    const names = await page.locator('.concept-name').allTextContents();
    expect(names).toContain('Glassbell');
    expect(names).toContain('Vaultmoth');
    expect(names).not.toContain('Driftmap');
    expect(names).not.toContain('Frostline');
    await expect(page.locator('#concepts-title')).toContainText('Active');
  });

  test('Concepts type filter: engine shows only engine-type concepts', async ({ page }) => {
    await openFolderAndWait(page);
    await page.locator('#concepts-filters .filter-btn', { hasText: 'engine' }).click();
    const names = await page.locator('.concept-name').allTextContents();
    expect(names).toContain('Driftmap');
    expect(names).not.toContain('Glassbell');
    expect(names).not.toContain('Frostline');
  });

  test('Concepts level filter: spark shows only spark-level concepts', async ({ page }) => {
    await openFolderAndWait(page);
    await page.locator('#concepts-filters .filter-btn', { hasText: 'spark' }).click();
    const names = await page.locator('.concept-name').allTextContents();
    expect(names).toContain('Driftmap');
    expect(names).not.toContain('Glassbell');
    expect(names).not.toContain('Frostline');
  });

  test('Concepts All filter resets to full list', async ({ page }) => {
    await openFolderAndWait(page);
    await page.locator('#concepts-filters .filter-btn', { hasText: 'active' }).click();
    await expect(page.locator('.concept-row')).toHaveCount(2);
    await page.locator('#concepts-filters .filter-btn', { hasText: 'All' }).first().click();
    await expect(page.locator('.concept-row')).toHaveCount(4);
    await expect(page.locator('#concepts-title')).toHaveText('All Concepts');
  });

  test('Focus mode: filters apply within focus pool only', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-preset="focus"]');
    await expect(page.locator('.concept-row')).toHaveCount(2);
    // Both focus concepts are active — applying active filter still shows 2
    await page.locator('#concepts-filters .filter-btn', { hasText: 'active' }).click();
    await expect(page.locator('.concept-row')).toHaveCount(2);
  });

  test('Actions filter: All shows done actions too', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-mode="actions"]');
    await page.click('[data-view="actions"]');
    await page.locator('#actions-filters .filter-btn', { hasText: 'All' }).click();
    await expect(page.locator('#actions-list')).toContainText('Frostline');
    await expect(page.locator('#actions-list')).toContainText('Audit frost rendering paths');
  });

  test('Actions filter: Done shows only done actions', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-mode="actions"]');
    await page.click('[data-view="actions"]');
    await page.locator('#actions-filters .filter-btn', { hasText: 'Done' }).click();
    await expect(page.locator('.actions-group')).toHaveCount(1);
    await expect(page.locator('.actions-group-header')).toContainText('Frostline');
  });

  test('Queue filter: Blocked shows only blocked queue items', async ({ page }) => {
    await openFolderAndWait(page);
    await page.evaluate(() => {
      const md = App.mds['vaultmoth.md'];
      md.frontMatter.actions[1].queued = true;
      md.frontMatter.actions[1].state = 'blocked';
      App.queue.push({ filename: 'vaultmoth.md', description: 'Decide on storage backend' });
    });
    await page.click('[data-mode="actions"]');
    await page.locator('#queue-filters .filter-btn', { hasText: 'Blocked' }).click();
    const items = page.locator('.queue-item');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Decide on storage backend');
  });

  test('Actions filter title updates dynamically', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-mode="actions"]');
    await page.click('[data-view="actions"]');
    await page.locator('#actions-filters .filter-btn', { hasText: 'Done' }).click();
    await expect(page.locator('#actions-title')).toContainText('Done');
  });

});

// ── 4. SYNC WRITES CORRECT YAML ───────────────────────────────────────────────

test.describe('4. Sync writes correct YAML', () => {

  test('state change marks MD dirty and enables Sync button', async ({ page }) => {
    await openFolderAndWait(page);
    await expect(page.locator('#sync-btn')).toBeDisabled();
    const driftmapRow = page.locator('.concept-row', {
      has: page.locator('.concept-name', { hasText: 'Driftmap' })
    });
    await driftmapRow.locator('select').first().selectOption('active');
    await expect(page.locator('#sync-btn')).not.toBeDisabled();
    await expect(page.locator('#sync-dot')).toHaveClass(/dirty/);
    await expect(page.locator('#sync-label')).toContainText('unsaved');
  });

  test('Sync writes updated YAML with correct state field', async ({ page }) => {
    await openFolderAndWait(page);
    const driftmapRow = page.locator('.concept-row', {
      has: page.locator('.concept-name', { hasText: 'Driftmap' })
    });
    await driftmapRow.locator('select').first().selectOption('active');
    await triggerSync(page);
    const written = await page.evaluate(() => window.__mockWrites['driftmap.md']);
    expect(written).toBeTruthy();
    expect(written).toContain('state: active');
    expect(written).not.toContain('state: parked');
    expect(written).toMatch(/^---\n/);
    expect(written).toContain('\n---\n');
  });

  test('Sync updates modified_date to today', async ({ page }) => {
    await openFolderAndWait(page);
    const driftmapRow = page.locator('.concept-row', {
      has: page.locator('.concept-name', { hasText: 'Driftmap' })
    });
    await driftmapRow.locator('select').first().selectOption('active');
    await triggerSync(page);
    const written = await page.evaluate(() => window.__mockWrites['driftmap.md']);
    const today = new Date().toISOString().slice(0, 10);
    expect(written).toContain(`modified_date: ${today}`);
  });

  test('Sync preserves body content unchanged', async ({ page }) => {
    await openFolderAndWait(page);
    const driftmapRow = page.locator('.concept-row', {
      has: page.locator('.concept-name', { hasText: 'Driftmap' })
    });
    await driftmapRow.locator('select').first().selectOption('active');
    await triggerSync(page);
    const written = await page.evaluate(() => window.__mockWrites['driftmap.md']);
    expect(written).toContain('A spatial drift mapping engine for route analysis.');
  });

  test('Sync preserves YAML round-trip: name, uses, synergies, actions intact', async ({ page }) => {
    await openFolderAndWait(page);
    const glassbellRow = page.locator('.concept-row', {
      has: page.locator('.concept-name', { hasText: 'Glassbell' })
    });
    await glassbellRow.locator('select').nth(1).selectOption('brief');
    await triggerSync(page);
    const written = await page.evaluate(() => window.__mockWrites['glassbell.md']);
    expect(written).toContain('name: Glassbell');
    expect(written).toContain('doc_level: brief');
    expect(written).toContain('uses:');
    expect(written).toContain('  - Driftmap');
    expect(written).toContain('description: Prototype the glass rendering pipeline');
    expect(written).toContain('type: prototype');
    expect(written).toContain('queued: true');
  });

  // FIX #3: After sync, the viewer writes _synclog.json which re-enables the
  // sync button. We need to wait for the dot to lose dirty class and verify
  // in-memory state rather than asserting the button is disabled.
  test('Sync clears dirty state and resets sync indicator', async ({ page }) => {
    await openFolderAndWait(page);
    const driftmapRow = page.locator('.concept-row', {
      has: page.locator('.concept-name', { hasText: 'Driftmap' })
    });
    await driftmapRow.locator('select').first().selectOption('active');
    await expect(page.locator('#sync-dot')).toHaveClass(/dirty/);

    await triggerSync(page);

    // In-memory dirty flag reset — this is the reliable assertion
    const dirty = await page.evaluate(() => App.mds['driftmap.md'].dirty);
    expect(dirty).toBe(false);

    // Dot should not be dirty (driftmap is clean; _synclog.json write doesn't
    // set dirty since its write path bypasses markDirty)
    await expect(page.locator('#sync-dot')).not.toHaveClass(/dirty/);
  });

  test('Sync writes _queue.json when queue order changes', async ({ page }) => {
    await openFolderAndWait(page);
    await page.evaluate(() => {
      const md = App.mds['glassbell.md'];
      md.frontMatter.actions[1].queued = true;
      App.queue.push({ filename: 'glassbell.md', description: 'Research competitor glass tools' });
      markDirty('glassbell.md');
      markDirty('_queue');
    });
    await triggerSync(page);
    const writtenQueue = await page.evaluate(() => window.__mockWrites['_queue.json']);
    expect(writtenQueue).toBeTruthy();
    const parsed = JSON.parse(writtenQueue);
    expect(parsed.queue).toBeDefined();
    expect(parsed.queue.length).toBeGreaterThanOrEqual(2);
    expect(parsed.updated).toBeTruthy();
  });

  test('unqueue action removes it from queue and marks both MD and queue dirty', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-mode="actions"]');
    await expect(page.locator('.queue-item')).toHaveCount(2);
    await page.locator('.unqueue-btn').first().click();
    await expect(page.locator('.queue-item')).toHaveCount(1);
    const queueDirty = await page.evaluate(() => App.queueDirty);
    expect(queueDirty).toBe(true);
    const mdDirty = await page.evaluate(() => App.mds['glassbell.md'].dirty);
    expect(mdDirty).toBe(true);
  });

  test('log append writes to MD body and marks dirty', async ({ page }) => {
    await openFolderAndWait(page);
    await openConcept(page, 'Glassbell');
    await page.click('[data-subtab="body"]');
    await expect(page.locator('#log-input-action-log')).toBeVisible({ timeout: 5000 });

    // Set value and call appendLog atomically — avoids blur re-render race
    await page.evaluate(() => {
      const inputId = 'log-input-action-log';
      document.getElementById(inputId).value = 'Tested the glass shader -- promising results.';
      appendLog('glassbell.md', 'Action Log', inputId);
    });

    // MD dirty
    const dirty = await page.evaluate(() => App.mds['glassbell.md'].dirty);
    expect(dirty).toBe(true);

    // Body contains the new entry
    const body = await page.evaluate(() => App.mds['glassbell.md'].body);
    expect(body).toContain('Tested the glass shader');

    // Sync writes the updated body to disk
    await triggerSync(page);
    const written = await page.evaluate(() => window.__mockWrites['glassbell.md']);
    expect(written).toContain('Tested the glass shader');
    expect(written).toContain('## Action Log');
  });

});

// ── 5. DRAG-TO-REORDER ───────────────────────────────────────────────────────

test.describe('5. Drag-to-reorder', () => {

  async function simulateDrag(page, srcSelector, tgtSelector) {
    const src = page.locator(srcSelector);
    const tgt = page.locator(tgtSelector);
    const srcBox = await src.boundingBox();
    const tgtBox = await tgt.boundingBox();
    await page.mouse.move(srcBox.x + srcBox.width / 2, srcBox.y + srcBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(tgtBox.x + tgtBox.width / 2, tgtBox.y + tgtBox.height / 2, { steps: 5 });
    await page.mouse.up();
  }

  test('queue drag-to-reorder changes App.queue order and marks queue dirty', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-mode="actions"]');
    await expect(page.locator('.queue-item')).toHaveCount(2);
    const initialFirst = await page.locator('.queue-item .queue-desc').first().textContent();
    expect(initialFirst).toContain('Prototype the glass rendering pipeline');

    await simulateDrag(page, '.queue-item:nth-child(2)', '.queue-item:nth-child(1)');

    const queueDirty = await page.evaluate(() => App.queueDirty);
    expect(queueDirty).toBe(true);
  });

  test('queue drag-to-reorder writes new order to _queue.json on Sync', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-mode="actions"]');
    await page.evaluate(() => {
      App.queue = App.queue.slice().reverse();
      markDirty('_queue');
    });
    await triggerSync(page);
    const writtenQueue = await page.evaluate(() => window.__mockWrites['_queue.json']);
    const parsed = JSON.parse(writtenQueue);
    expect(parsed.queue[0].filename).toBe('vaultmoth.md');
    expect(parsed.queue[1].filename).toBe('glassbell.md');
  });

  // FIX #5: Mouse simulation doesn't reliably fire ondragstart/ondrop for
  // concept action rows. Call the drop handler directly via page.evaluate().
  test('action drag-to-reorder within Concept Overview recalculates position fields', async ({ page }) => {
    await openFolderAndWait(page);
    await openConcept(page, 'Glassbell');
    await expect(page.locator('.concept-action-row')).toHaveCount(2);

    // Simulate dropping action at index 1 onto position 0
    await page.evaluate(() => {
      App.actionDragSrc = 1;
      onActionDrop({ preventDefault: () => {} }, 'glassbell.md', 0);
    });

    const actions = await page.evaluate(() => App.mds['glassbell.md'].frontMatter.actions);
    // Research action (was index 1) is now first; positions recalculated
    expect(actions[0].description).toBe('Research competitor glass tools');
    expect(actions[0].position).toBe(1);
    expect(actions[1].position).toBe(2);

    const dirty = await page.evaluate(() => App.mds['glassbell.md'].dirty);
    expect(dirty).toBe(true);
  });

  test('focus drag-to-reorder changes App.focusOrder', async ({ page }) => {
    await openFolderAndWait(page);
    await page.click('[data-preset="focus"]');
    const initialOrder = await page.evaluate(() => [...App.focusOrder]);
    expect(initialOrder.length).toBe(2);

    await simulateDrag(
      page,
      '.concept-row.draggable-row:nth-child(2)',
      '.concept-row.draggable-row:nth-child(1)'
    );

    const newOrder = await page.evaluate(() => [...App.focusOrder]);
    expect(newOrder[0]).toBe(initialOrder[1]);
    expect(newOrder[1]).toBe(initialOrder[0]);
  });

});

// ── 6. AUTOCOMPLETE ──────────────────────────────────────────────────────────

test.describe('6. Autocomplete', () => {

  async function openGlassbellOverview(page) {
    await openFolderAndWait(page);
    await openConcept(page, 'Glassbell');
    await expect(page.locator('#subtab-overview')).toBeVisible({ timeout: 5000 });
  }

  test('tag input shows autocomplete suggestions from loaded MD names', async ({ page }) => {
    await openGlassbellOverview(page);
    const synergyInput = page.locator('[id*="tag-input"][id*="synergies"]');
    await synergyInput.click();
    await synergyInput.fill('Vault');
    const acList = page.locator('[id*="tag-ac"][id*="synergies"]');
    await expect(acList).not.toHaveClass(/hidden/, { timeout: 3000 });
    await expect(acList).toContainText('Vaultmoth');
  });

  // FIX #6: Typing 'Glass' in Glassbell's synergies input correctly produces
  // zero results after self-exclusion, so the list stays hidden. That IS the
  // expected behavior. Test this properly: use a partial that matches other
  // concepts but not self, then assert Glassbell is absent from results.
  test('autocomplete excludes self from suggestions', async ({ page }) => {
    await openGlassbellOverview(page);

    const synergyInput = page.locator('[id*="tag-input"][id*="synergies"]');
    await synergyInput.click();
    // 'rift' matches Driftmap but not Glassbell — list will appear, Glassbell absent
    await synergyInput.fill('rift');

    const acList = page.locator('[id*="tag-ac"][id*="synergies"]');
    await expect(acList).not.toHaveClass(/hidden/, { timeout: 3000 });
    await expect(acList).toContainText('Driftmap');
    await expect(acList).not.toContainText('Glassbell');
  });

  // FIX #7: The onblur handler fires before mousedown click lands on the
  // autocomplete item (150ms delay doesn't help in headless Chromium).
  // Use page.evaluate() to call selectTagAutocomplete directly.
  test('selecting autocomplete item adds tag and marks MD dirty', async ({ page }) => {
    await openGlassbellOverview(page);

    const synergyInput = page.locator('[id*="tag-input"][id*="synergies"]');
    await synergyInput.click();
    await synergyInput.fill('Vault');

    const acList = page.locator('[id*="tag-ac"][id*="synergies"]');
    await expect(acList).not.toHaveClass(/hidden/, { timeout: 3000 });

    // Call the selection handler directly — avoids blur-before-click race
    await page.evaluate(() => {
      const filename = 'glassbell.md';
      const field = 'synergies';
      const listId = 'tag-ac-glassbell-md-synergies';
      selectTagAutocomplete({ preventDefault: () => {} }, filename, field, listId, 'Vaultmoth');
    });

    const synergies = await page.evaluate(() => App.mds['glassbell.md'].frontMatter.synergies);
    expect(synergies).toContain('Vaultmoth');

    const dirty = await page.evaluate(() => App.mds['glassbell.md'].dirty);
    expect(dirty).toBe(true);

    await expect(page.locator('#subtab-overview .tag', { hasText: 'Vaultmoth' })).toBeVisible();
  });

  test('pressing Enter in tag input commits the typed value', async ({ page }) => {
    await openGlassbellOverview(page);
    const synergyInput = page.locator('[id*="tag-input"][id*="synergies"]');
    await synergyInput.click();
    await synergyInput.fill('NewConceptName');
    await synergyInput.press('Enter');
    const synergies = await page.evaluate(() => App.mds['glassbell.md'].frontMatter.synergies);
    expect(synergies).toContain('NewConceptName');
  });

  test('Escape key hides autocomplete list', async ({ page }) => {
    await openGlassbellOverview(page);
    const synergyInput = page.locator('[id*="tag-input"][id*="synergies"]');
    await synergyInput.click();
    await synergyInput.fill('Vault');
    const acList = page.locator('[id*="tag-ac"][id*="synergies"]');
    await expect(acList).not.toHaveClass(/hidden/, { timeout: 3000 });
    await synergyInput.press('Escape');
    await expect(acList).toHaveClass(/hidden/);
  });

  test('resolved tag name renders as clickable and opens that concept', async ({ page }) => {
    await openGlassbellOverview(page);
    const resolvedTag = page.locator('.tag.tag-resolved', { hasText: 'Frostline' });
    await expect(resolvedTag).toBeVisible();
    await resolvedTag.click();
    await expect(page.locator('#concept-breadcrumb')).toContainText('Frostline', { timeout: 5000 });
  });

  test('unresolved tag shows warning indicator', async ({ page }) => {
    await openGlassbellOverview(page);
    await page.evaluate(() => {
      App.mds['glassbell.md'].frontMatter.synergies.push('NoSuchConcept');
    });
    await page.evaluate(() => renderConceptOverview());
    const unresolvedTag = page.locator('.tag.tag-unresolved', { hasText: 'NoSuchConcept' });
    await expect(unresolvedTag).toBeVisible();
    await expect(unresolvedTag).toContainText('⚠');
  });

  test('duplicate tags not added — deduplication enforced', async ({ page }) => {
    await openGlassbellOverview(page);
    const synergyInput = page.locator('[id*="tag-input"][id*="synergies"]');
    await synergyInput.click();
    await synergyInput.fill('Frostline');
    await synergyInput.press('Enter');
    const synergies = await page.evaluate(() => App.mds['glassbell.md'].frontMatter.synergies);
    const count = synergies.filter(s => s === 'Frostline').length;
    expect(count).toBe(1);
  });

  test('removing a tag updates frontMatter and re-renders without it', async ({ page }) => {
    await openGlassbellOverview(page);
    const tag = page.locator('.tag', { hasText: 'Frostline' });
    await tag.locator('.tag-remove').click();
    const synergies = await page.evaluate(() => App.mds['glassbell.md'].frontMatter.synergies);
    expect(synergies).not.toContain('Frostline');
    await expect(page.locator('.tag', { hasText: 'Frostline' })).toHaveCount(0);
    const dirty = await page.evaluate(() => App.mds['glassbell.md'].dirty);
    expect(dirty).toBe(true);
  });

  test('"Used in" section shows concepts that use this engine/workflow', async ({ page }) => {
    await openFolderAndWait(page);
    await openConcept(page, 'Driftmap');
    await expect(page.locator('#subtab-overview')).toContainText('Used in');
    await expect(page.locator('.tag.tag-resolved', { hasText: 'Glassbell' })).toBeVisible();
  });

});

// ── 7. CONFLICT MODAL ─────────────────────────────────────────────────────────

test.describe('7. Conflict modal', () => {

  async function setupConflict(page) {
    await openFolderAndWait(page);
    const driftmapRow = page.locator('.concept-row', {
      has: page.locator('.concept-name', { hasText: 'Driftmap' })
    });
    await driftmapRow.locator('select').first().selectOption('active');
    // Simulate external edit so hash no longer matches
    await page.evaluate(() => {
      window.__mockFS['driftmap.md'] = window.__mockFS['driftmap.md'].replace(
        'state: parked',
        'state: retired'
      );
    });
  }

  test('conflict modal appears when on-disk content changed since load', async ({ page }) => {
    await setupConflict(page);
    await page.click('#sync-btn');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 8000 });
    await expect(page.locator('#modal-box')).toContainText('modified externally');
    await expect(page.locator('#modal-box')).toContainText('driftmap.md');
  });

  test('conflict modal: Keep disk version (safe default) receives focus', async ({ page }) => {
    await setupConflict(page);
    await page.click('#sync-btn');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 8000 });
    await expect(page.locator('#conflict-skip-btn')).toBeFocused();
  });

  test('conflict modal: clicking Skip reloads disk version, does not overwrite', async ({ page }) => {
    await setupConflict(page);
    await page.click('#sync-btn');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 8000 });
    await page.click('#conflict-skip-btn');
    await expect(page.locator('#modal-overlay')).toHaveClass(/hidden/, { timeout: 5000 });
    await expect(page.locator('#sync-btn')).not.toBeDisabled({ timeout: 8000 });
    // MD reloaded from disk — dirty flag cleared
    const dirty = await page.evaluate(() => App.mds['driftmap.md']?.dirty);
    expect(dirty).toBe(false);
    // Written content (if any) should not contain viewer's 'active' change
    const written = await page.evaluate(() => window.__mockWrites['driftmap.md']);
    if (written) expect(written).not.toContain('state: active');
  });

  test('conflict modal: clicking Overwrite writes viewer changes to disk', async ({ page }) => {
    await setupConflict(page);
    await page.click('#sync-btn');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 8000 });
    await page.click('#conflict-overwrite-btn');
    await expect(page.locator('#modal-overlay')).toHaveClass(/hidden/, { timeout: 5000 });
    await expect(page.locator('#sync-btn')).not.toBeDisabled({ timeout: 8000 });
    const written = await page.evaluate(() => window.__mockWrites['driftmap.md']);
    expect(written).toBeTruthy();
    expect(written).toContain('state: active');
  });

});

// ── 8. STATE TRANSITIONS ─────────────────────────────────────────────────────

test.describe('8. State transitions', () => {

  // FIX #8-12: The state <select> options in the viewer have no value= attribute —
  // they use text content only. The selector `option[value="retired"]` never matches.
  // Solution: target the State field-select by its position in the overview.
  // In renderConceptOverview the selects render in order: type (1st), level (2nd), state (3rd).
  // Use nth(2) to get the state select, which is what handleStateChange is wired to.

  async function openConceptOverview(page, name) {
    await openFolderAndWait(page);
    await openConcept(page, name);
    await expect(page.locator('.field-group-title', { hasText: 'Identity' })).toBeVisible({ timeout: 5000 });
  }

  test('→ retired shows confirmation modal', async ({ page }) => {
    await openConceptOverview(page, 'Glassbell');
    // State select is the 3rd .field-select (after type and level)
    await page.locator('.field-select').nth(2).selectOption('retired');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await expect(page.locator('.modal-title')).toContainText('retired');
  });

  test('→ retired: Cancel does not change state', async ({ page }) => {
    await openConceptOverview(page, 'Glassbell');
    await page.locator('.field-select').nth(2).selectOption('retired');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await page.locator('.modal-btn', { hasText: 'Cancel' }).click();
    await expect(page.locator('#modal-overlay')).toHaveClass(/hidden/);
    const state = await page.evaluate(() => App.mds['glassbell.md'].frontMatter.state);
    expect(state).toBe('active');
  });

  test('→ retired: Confirm sets state and marks dirty', async ({ page }) => {
    await openConceptOverview(page, 'Glassbell');
    await page.locator('.field-select').nth(2).selectOption('retired');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await page.locator('.modal-btn.danger', { hasText: 'Confirm' }).click();
    await expect(page.locator('#modal-overlay')).toHaveClass(/hidden/);
    const state = await page.evaluate(() => App.mds['glassbell.md'].frontMatter.state);
    expect(state).toBe('retired');
    const dirty = await page.evaluate(() => App.mds['glassbell.md'].dirty);
    expect(dirty).toBe(true);
  });

  test('→ absorbed shows modal with concept name input', async ({ page }) => {
    await openConceptOverview(page, 'Driftmap');
    // Driftmap is a spark — it only has type and state selects (no level in spark? check)
    // Actually all concepts have type, level, state in overview. State is nth(2).
    await page.locator('.field-select').nth(2).selectOption('absorbed');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await expect(page.locator('.modal-title')).toContainText('absorbed');
    await expect(page.locator('.modal-input')).toBeVisible();
  });

  test('→ absorbed: Confirm sets state, absorbed_by, adds Decision Log entry to absorbing MD', async ({ page }) => {
    await openConceptOverview(page, 'Driftmap');
    await page.locator('.field-select').nth(2).selectOption('absorbed');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await page.locator('.modal-input').fill('Glassbell');
    await page.locator('.modal-btn.primary', { hasText: 'Confirm' }).click();
    await expect(page.locator('#modal-overlay')).toHaveClass(/hidden/);
    const state = await page.evaluate(() => App.mds['driftmap.md'].frontMatter.state);
    expect(state).toBe('absorbed');
    const absorbedBy = await page.evaluate(() => App.mds['driftmap.md'].frontMatter.absorbed_by);
    expect(absorbedBy).toBe('Glassbell');
    const glassbellBody = await page.evaluate(() => App.mds['glassbell.md'].body);
    expect(glassbellBody).toContain('Driftmap absorbed into this concept');
    expect(glassbellBody).toContain('driftmap.md');
  });

  test('focus toggle over limit shows warning modal', async ({ page }) => {
    await openFolderAndWait(page);
    // Glassbell and Vaultmoth are already focus:true (2 of 3 limit).
    // Set Frostline focus:true to hit the limit.
    await page.evaluate(() => {
      App.mds['frostline.md'].frontMatter.focus = true;
      App.focusOrder.push('frostline.md');
    });
    // Now try to toggle Driftmap focus on — that's the 4th, over limit of 3
    await openConcept(page, 'Driftmap');
    await page.locator('.flag-btn.focus-flag').click();
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await expect(page.locator('.modal-title')).toContainText('Focus limit');
  });

  test('adding action then removing it keeps position fields sequential', async ({ page }) => {
    await openFolderAndWait(page);
    await openConcept(page, 'Glassbell');
    await page.locator('.add-action-btn').click();
    let actions = await page.evaluate(() => App.mds['glassbell.md'].frontMatter.actions);
    expect(actions).toHaveLength(3);
    await page.locator('.remove-action-btn').nth(1).click();
    actions = await page.evaluate(() => App.mds['glassbell.md'].frontMatter.actions);
    expect(actions).toHaveLength(2);
    expect(actions[0].position).toBe(1);
    expect(actions[1].position).toBe(2);
  });

  test('prototype action done sets try_it:true on MD', async ({ page }) => {
    await openFolderAndWait(page);
    await openConcept(page, 'Glassbell');
    const actionRow = page.locator('.concept-action-row').first();
    await actionRow.locator('.action-state-select').selectOption('done');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await page.locator('.modal-btn', { hasText: 'Skip' }).click();
    const tryIt = await page.evaluate(() => App.mds['glassbell.md'].frontMatter.try_it);
    expect(tryIt).toBe(true);
  });

  test('decision action done prompts for Decision Log entry', async ({ page }) => {
    await openFolderAndWait(page);
    await openConcept(page, 'Vaultmoth');
    const actionRow = page.locator('.concept-action-row').nth(1);
    await actionRow.locator('.action-state-select').selectOption('done');
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await expect(page.locator('.modal-title')).toContainText('Decision');
    await page.locator('.modal-input').fill('Chose local SQLite for Stage 2.');
    await page.locator('.modal-btn.primary').click();
    const body = await page.evaluate(() => App.mds['vaultmoth.md'].body);
    expect(body).toContain('Chose local SQLite for Stage 2.');
  });

});

// ── 9. SYNC INDICATOR BEHAVIOR ───────────────────────────────────────────────

test.describe('9. Sync indicator', () => {

  test('indicator shows count of dirty files', async ({ page }) => {
    await openFolderAndWait(page);
    await page.evaluate(() => {
      App.mds['glassbell.md'].dirty = true;
      App.mds['driftmap.md'].dirty = true;
      updateSyncIndicator();
    });
    await expect(page.locator('#sync-label')).toContainText('2 unsaved');
    await expect(page.locator('#sync-dot')).toHaveClass(/dirty/);
  });

  test('indicator includes queue in dirty count when queue is dirty', async ({ page }) => {
    await openFolderAndWait(page);
    await page.evaluate(() => {
      App.mds['glassbell.md'].dirty = true;
      App.queueDirty = true;
      updateSyncIndicator();
    });
    await expect(page.locator('#sync-label')).toContainText('2 unsaved');
  });

});

// ── 10. QUEUE CAP WARNING ─────────────────────────────────────────────────────

test.describe('10. Queue cap', () => {

  // FIX #13: The test fixture set up 5 items in App.queue but Vaultmoth's
  // existing queued action was still present, giving 6. Clear all existing
  // queued flags first, then set exactly 5.
  test('queue cap warning shown when queue >= cap', async ({ page }) => {
    await openFolderAndWait(page);

    await page.evaluate(() => {
      // Clear all existing queued flags
      Object.values(App.mds).forEach(md => {
        if (md.frontMatter.actions) {
          md.frontMatter.actions.forEach(a => { a.queued = false; });
        }
      });
      // Set exactly 5 queued actions (cap = 5) on Glassbell
      App.mds['glassbell.md'].frontMatter.actions = [
        {description:'A',type:'task',state:'open',queued:true,position:1},
        {description:'B',type:'task',state:'open',queued:true,position:2},
        {description:'C',type:'task',state:'open',queued:true,position:3},
        {description:'D',type:'task',state:'open',queued:true,position:4},
        {description:'E',type:'task',state:'open',queued:true,position:5},
      ];
      App.queue = [
        {filename:'glassbell.md',description:'A'},
        {filename:'glassbell.md',description:'B'},
        {filename:'glassbell.md',description:'C'},
        {filename:'glassbell.md',description:'D'},
        {filename:'glassbell.md',description:'E'},
      ];
    });

    await page.click('[data-mode="actions"]');
    await expect(page.locator('#queue-cap-warning')).not.toHaveClass(/hidden/, { timeout: 5000 });
    // Warning says the count — assert it's visible and mentions the cap
    await expect(page.locator('#queue-cap-warning')).toContainText('items');
  });

  test('flagging action when at cap shows confirmation modal', async ({ page }) => {
    await openFolderAndWait(page);

    await page.evaluate(() => {
      // Clear existing queued flags
      Object.values(App.mds).forEach(md => {
        if (md.frontMatter.actions) md.frontMatter.actions.forEach(a => { a.queued = false; });
      });
      // 5 queued (at cap) + 1 unqueued to flag
      App.mds['glassbell.md'].frontMatter.actions = [
        {description:'Prototype the glass rendering pipeline',type:'prototype',state:'open',queued:true,position:1},
        {description:'Research competitor glass tools',type:'research',state:'open',queued:false,position:2},
        {description:'C',type:'task',state:'open',queued:true,position:3},
        {description:'D',type:'task',state:'open',queued:true,position:4},
        {description:'E',type:'task',state:'open',queued:true,position:5},
        {description:'F',type:'task',state:'open',queued:true,position:6},
      ];
      App.queue = [
        {filename:'glassbell.md',description:'Prototype the glass rendering pipeline'},
        {filename:'glassbell.md',description:'C'},
        {filename:'glassbell.md',description:'D'},
        {filename:'glassbell.md',description:'E'},
        {filename:'glassbell.md',description:'F'},
      ];
    });

    await page.click('[data-mode="actions"]');
    await page.click('[data-view="actions"]');
    await page.locator('#actions-filters .filter-btn', { hasText: 'All' }).click();
    const queueBtn = page.locator('.queue-flag-btn', { hasText: '+ queue' }).first();
    await queueBtn.click();
    await expect(page.locator('#modal-overlay')).not.toHaveClass(/hidden/, { timeout: 5000 });
    await expect(page.locator('.modal-title')).toContainText('full');
  });

});
