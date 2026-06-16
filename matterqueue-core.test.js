/**
 * matterqueue-core.test.js
 * Test suite for matterqueue-core.js
 * Run: node matterqueue-core.test.js
 *
 * No test framework dependency — plain Node.js assertions.
 * Each test is a named function. Pass/fail reported to console.
 * Exits with code 1 if any test fails.
 */

'use strict';

const MQ = require('./matterqueue-core.js');

// ---------------------------------------------------------------------------
// Minimal test harness
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${err.message}`);
    failures.push({ name, error: err.message });
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label || 'assertEqual'}\n     actual:   ${a}\n     expected: ${e}`);
  }
}

function assertThrows(fn, messageContains, label) {
  let threw = false;
  try { fn(); } catch (e) {
    threw = true;
    if (messageContains && !e.message.includes(messageContains)) {
      throw new Error(`${label}: threw but message "${e.message}" does not contain "${messageContains}"`);
    }
  }
  if (!threw) throw new Error(`${label || 'assertThrows'}: expected a throw but none occurred`);
}

// ---------------------------------------------------------------------------
// FIXTURES
// ---------------------------------------------------------------------------

const SIMPLE_MD = `---
name: ThinkMutant
type: concept
doc_level: compilation
state: active
focus: true
try_it: true
map_it: false
compilation: true
build_doc: false
todoist: false
created_date: 2026-05-01
modified_date: 2026-06-15
uses:
  - InsightMutant
  - Document ingest and structure extraction engine
synergies:
  - The Current
  - Subtext
actions:
  - description: Prototype mind map rendering
    type: prototype
    state: open
    queued: true
    position: 1
  - description: Define JSON schema for idea graph
    type: task
    state: done
    position: 2
---

## Idea Capsule — 2026-05-01

**Name** — ThinkMutant
**One Phrase** — AI-powered idea graph
**Core Sentence** — ThinkMutant makes the structure of your thinking visible.
**One Paragraph** — This is the existing one paragraph text.

**Key Insights**
- Insight one
- Insight two

## Action Log

## Decision Log

## Open Questions Log
`;

const SPARK_MD = `---
name: Walkframe
type: concept
doc_level: spark
state: parked
created_date: 2026-05-01
modified_date: 2026-05-01
---

A replicable community walking club framework.
`;

const ABSORBED_MD = `---
name: Manhole
type: concept
doc_level: capsule
state: absorbed
absorbed_by: ShapeSake
created_date: 2026-05-01
modified_date: 2026-06-10
---

## Idea Capsule — 2026-05-01

Prior content preserved.

## Action Log

## Decision Log

## Open Questions Log
`;

const NO_FRONTMATTER_MD = `Just a plain markdown file with no front matter delimiters.`;

// ---------------------------------------------------------------------------
// TESTS: parseMarkdownFile
// ---------------------------------------------------------------------------

console.log('\nparseMarkdownFile');

test('parses a full MD with front matter and body', () => {
  const result = MQ.parseMarkdownFile(SIMPLE_MD);
  assert(typeof result.frontMatter === 'object', 'frontMatter should be object');
  assert(typeof result.body === 'string', 'body should be string');
  assertEqual(result.frontMatter.name, 'ThinkMutant', 'name');
  assert(result.body.includes('## Idea Capsule'), 'body contains heading');
});

test('parses a spark MD with minimal front matter', () => {
  const result = MQ.parseMarkdownFile(SPARK_MD);
  assertEqual(result.frontMatter.name, 'Walkframe', 'name');
  assertEqual(result.frontMatter.doc_level, 'spark', 'doc_level');
  assertEqual(result.frontMatter.state, 'parked', 'state');
  assert(result.body.includes('walking club'), 'body content present');
});

test('handles MD with no front matter delimiters', () => {
  const result = MQ.parseMarkdownFile(NO_FRONTMATTER_MD);
  assertEqual(result.frontMatter, {}, 'frontMatter should be empty object');
  assertEqual(result.body, NO_FRONTMATTER_MD, 'body should be entire content');
});

test('parses absorbed MD correctly', () => {
  const result = MQ.parseMarkdownFile(ABSORBED_MD);
  assertEqual(result.frontMatter.state, 'absorbed', 'state');
  assertEqual(result.frontMatter.absorbed_by, 'ShapeSake', 'absorbed_by');
});

// ---------------------------------------------------------------------------
// TESTS: parseYAML
// ---------------------------------------------------------------------------

console.log('\nparseYAML');

test('parses scalar types correctly', () => {
  const yaml = `name: ThinkMutant
focus: true
map_it: false
todoist: false
created_date: 2026-05-01
absorbed_by:
position: 1`;
  const result = MQ.parseYAML(yaml);
  assertEqual(result.name, 'ThinkMutant', 'string');
  assertEqual(result.focus, true, 'boolean true');
  assertEqual(result.map_it, false, 'boolean false');
  assertEqual(result.todoist, false, 'boolean false (todoist)');
  assertEqual(result.created_date, '2026-05-01', 'date string');
  assertEqual(result.absorbed_by, null, 'empty value → null');
  assertEqual(result.position, 1, 'integer');
});

test('parses uses: and synergies: as arrays', () => {
  const yaml = `uses:
  - InsightMutant
  - Document ingest engine
synergies:
  - The Current
  - Subtext`;
  const result = MQ.parseYAML(yaml);
  assertEqual(result.uses, ['InsightMutant', 'Document ingest engine'], 'uses');
  assertEqual(result.synergies, ['The Current', 'Subtext'], 'synergies');
});

test('parses actions: list with mapping objects', () => {
  const yaml = `actions:
  - description: Prototype mind map rendering
    type: prototype
    state: open
    queued: true
    position: 1
  - description: Define JSON schema
    type: task
    state: done
    position: 2`;
  const result = MQ.parseYAML(yaml);
  assert(Array.isArray(result.actions), 'actions is array');
  assertEqual(result.actions.length, 2, 'two actions');
  assertEqual(result.actions[0].description, 'Prototype mind map rendering', 'first description');
  assertEqual(result.actions[0].type, 'prototype', 'first type');
  assertEqual(result.actions[0].state, 'open', 'first state');
  assertEqual(result.actions[0].queued, true, 'first queued');
  assertEqual(result.actions[0].position, 1, 'first position');
  assertEqual(result.actions[1].description, 'Define JSON schema', 'second description');
  assertEqual(result.actions[1].state, 'done', 'second state');
  // queued not present on second action — should be absent (not false)
  assert(!('queued' in result.actions[1]), 'queued absent when not specified');
});

test('parses empty uses: as null', () => {
  const yaml = `uses:\nsynergies:`;
  const result = MQ.parseYAML(yaml);
  assertEqual(result.uses, null, 'empty uses → null');
  assertEqual(result.synergies, null, 'empty synergies → null');
});

// ---------------------------------------------------------------------------
// TESTS: serializeYAML
// ---------------------------------------------------------------------------

console.log('\nserializeYAML');

test('serializes a full front matter object in canonical field order', () => {
  const obj = {
    modified_date: '2026-06-15',
    name: 'ThinkMutant',
    state: 'active',
    type: 'concept',
    doc_level: 'compilation',
    focus: true,
    created_date: '2026-05-01',
    todoist: false,
    uses: ['InsightMutant'],
    synergies: ['The Current', 'Subtext'],
    actions: [
      { description: 'Do something', type: 'task', state: 'open', position: 1 }
    ],
  };
  const yaml = MQ.serializeYAML(obj);
  const lines = yaml.split('\n');

  // Check field order: name before type before state
  const nameIdx = lines.findIndex(l => l.startsWith('name:'));
  const typeIdx = lines.findIndex(l => l.startsWith('type:'));
  const stateIdx = lines.findIndex(l => l.startsWith('state:'));
  const createdIdx = lines.findIndex(l => l.startsWith('created_date:'));
  const modifiedIdx = lines.findIndex(l => l.startsWith('modified_date:'));

  assert(nameIdx < typeIdx, 'name before type');
  assert(typeIdx < stateIdx, 'type before state');
  assert(createdIdx < modifiedIdx, 'created_date before modified_date');
});

test('serializes boolean fields correctly', () => {
  const obj = { name: 'Test', focus: true, map_it: false, try_it: true };
  const yaml = MQ.serializeYAML(obj);
  assert(yaml.includes('focus: true'), 'focus: true');
  assert(yaml.includes('map_it: false'), 'map_it: false');
  assert(yaml.includes('try_it: true'), 'try_it: true');
});

test('serializes null/empty fields as bare key', () => {
  const obj = { name: 'Test', absorbed_by: null };
  const yaml = MQ.serializeYAML(obj);
  assert(yaml.includes('absorbed_by:'), 'null → bare key');
  assert(!yaml.includes('absorbed_by: null'), 'not "absorbed_by: null"');
});

test('serializes uses: as block sequence', () => {
  const obj = { uses: ['InsightMutant', 'Document ingest engine'] };
  const yaml = MQ.serializeYAML(obj);
  assert(yaml.includes('uses:'), 'uses: heading');
  assert(yaml.includes('  - InsightMutant'), 'first item indented');
  assert(yaml.includes('  - Document ingest engine'), 'second item indented');
});

test('serializes actions: as mapping blocks', () => {
  const obj = {
    actions: [
      { description: 'Build something', type: 'task', state: 'open', queued: true, position: 1 },
      { description: 'Second action', type: 'prototype', state: 'done', position: 2 },
    ]
  };
  const yaml = MQ.serializeYAML(obj);
  assert(yaml.includes('  - description: Build something'), 'first action description');
  assert(yaml.includes('    type: task'), 'first action type');
  assert(yaml.includes('    queued: true'), 'queued: true present');
  assert(!yaml.includes('queued: false'), 'queued: false omitted');
  assert(yaml.includes('  - description: Second action'), 'second action');
});

test('preserves unknown fields not in canonical order', () => {
  const obj = { name: 'Test', custom_field: 'custom_value', another_field: 42 };
  const yaml = MQ.serializeYAML(obj);
  assert(yaml.includes('custom_field: custom_value'), 'custom field preserved');
  assert(yaml.includes('another_field: 42'), 'numeric custom field preserved');
});

test('quotes strings that contain ": "', () => {
  const obj = { name: 'Test', description: 'something: value here' };
  const yaml = MQ.serializeYAML(obj);
  assert(yaml.includes('"something: value here"'), 'colon-space string quoted');
});

// ---------------------------------------------------------------------------
// TESTS: adversarial YAML round-trips (Amendment 6)
// Each string type must survive parse → serialize → parse with no change.
// These guard against serializer/parser blind spots before the write path is trusted.
// ---------------------------------------------------------------------------

console.log('\nadversarial YAML round-trips');

function adversarialRoundTrip(label, fieldValue) {
  // Build a minimal front matter object with the adversarial value in 'name'
  // (using name is convenient; the serializer handles it as a plain string field)
  const obj = { name: fieldValue, type: 'concept' };
  const yaml = MQ.serializeYAML(obj);
  const reparsed = MQ.parseYAML(yaml);
  if (reparsed.name !== fieldValue) {
    throw new Error(
      `Round-trip failed for ${label}\n` +
      `     input:    ${JSON.stringify(fieldValue)}\n` +
      `     output:   ${JSON.stringify(reparsed.name)}\n` +
      `     yaml was: ${yaml}`
    );
  }
}

test('round-trip: string containing ": " (colon-space)', () => {
  adversarialRoundTrip('colon-space', 'something: value here');
});

test('round-trip: string containing " #" (space-hash)', () => {
  adversarialRoundTrip('space-hash', 'tag # label');
});

test('round-trip: string that looks like boolean true', () => {
  adversarialRoundTrip('boolean-like true', 'true');
});

test('round-trip: string that looks like boolean false', () => {
  adversarialRoundTrip('boolean-like false', 'false');
});

test('round-trip: string that looks like an integer', () => {
  adversarialRoundTrip('integer-like', '42');
});

test('round-trip: string that looks like a date', () => {
  adversarialRoundTrip('date-like', '2026-06-15');
});

test('round-trip: string with leading whitespace', () => {
  adversarialRoundTrip('leading whitespace', ' leading');
});

test('round-trip: string with trailing whitespace', () => {
  adversarialRoundTrip('trailing whitespace', 'trailing ');
});

test('round-trip: string containing double quotes', () => {
  adversarialRoundTrip('double quotes', 'say "hello" here');
});

test('round-trip: string starting with asterisk', () => {
  adversarialRoundTrip('asterisk prefix', '*anchor');
});

test('round-trip: string starting with ampersand', () => {
  adversarialRoundTrip('ampersand prefix', '&alias');
});

test('round-trip: string starting with exclamation', () => {
  adversarialRoundTrip('exclamation prefix', '!tag');
});

test('round-trip: null field stays null', () => {
  const obj = { name: 'Test', absorbed_by: null };
  const yaml = MQ.serializeYAML(obj);
  const reparsed = MQ.parseYAML(yaml);
  assertEqual(reparsed.absorbed_by, null, 'null field round-trips as null');
});

test('round-trip: action description with colon-space survives', () => {
  const obj = {
    name: 'Test',
    actions: [
      { description: 'Evaluate X: is it viable?', type: 'research', state: 'open', position: 1 }
    ]
  };
  const yaml = MQ.serializeYAML(obj);
  const reparsed = MQ.parseYAML(yaml);
  assertEqual(
    reparsed.actions[0].description,
    'Evaluate X: is it viable?',
    'action description with colon-space'
  );
});

test('round-trip: uses: list with colon-containing name survives', () => {
  const obj = { uses: ['Engine: v2', 'Plain name'] };
  const yaml = MQ.serializeYAML(obj);
  const reparsed = MQ.parseYAML(yaml);
  assertEqual(reparsed.uses[0], 'Engine: v2', 'colon in list item');
  assertEqual(reparsed.uses[1], 'Plain name', 'plain list item unchanged');
});

// ---------------------------------------------------------------------------
// TESTS: yamlRoundTripValid
// ---------------------------------------------------------------------------

console.log('\nyamlRoundTripValid');

test('returns true for identical objects', () => {
  const obj = { name: 'ThinkMutant', focus: true, position: 1 };
  assert(MQ.yamlRoundTripValid(obj, { name: 'ThinkMutant', focus: true, position: 1 }), 'identical');
});

test('returns false when a field value differs', () => {
  const a = { name: 'ThinkMutant', focus: true };
  const b = { name: 'ThinkMutant', focus: false };
  assert(!MQ.yamlRoundTripValid(a, b), 'different focus value');
});

test('returns false when a field is missing in round-trip', () => {
  const a = { name: 'ThinkMutant', todoist: false };
  const b = { name: 'ThinkMutant' };
  assert(!MQ.yamlRoundTripValid(a, b), 'missing field');
});

test('full round-trip: parse → serialize → parse → compare', () => {
  const { frontMatter } = MQ.parseMarkdownFile(SIMPLE_MD);
  const yaml = MQ.serializeYAML(frontMatter);
  const roundTrip = MQ.parseYAML(yaml);
  const valid = MQ.yamlRoundTripValid(frontMatter, roundTrip);
  assert(valid, 'full round-trip should be valid');
});

// ---------------------------------------------------------------------------
// TESTS: insertAfterHeading
// ---------------------------------------------------------------------------

console.log('\ninsertAfterHeading');

test('inserts content after a found heading', () => {
  const body = '## Action Log\n\nOld entry here.\n';
  const result = MQ.insertAfterHeading(body, '## Action Log', '**2026-06-15** — New entry.');
  assert(result.indexOf('**2026-06-15** — New entry.') < result.indexOf('Old entry here.'),
    'new entry before old entry');
  assert(result.includes('## Action Log'), 'heading still present');
});

test('throws when heading not found (warn-and-abort, v1.3 behavior)', () => {
  const body = '## Idea Capsule\n\nSome content.\n';
  assertThrows(
    () => MQ.insertAfterHeading(body, '## Action Log', '**2026-06-15** — New entry.'),
    'Heading "## Action Log" not found in body',
    'insertAfterHeading throws on missing heading'
  );
});

// ---------------------------------------------------------------------------
// TESTS: applyBodyAppends
// ---------------------------------------------------------------------------

console.log('\napplyBodyAppends');

test('applies action log appends', () => {
  const body = '## Action Log\n\n## Decision Log\n\n## Open Questions Log\n';
  const appends = {
    actionLog: ['**2026-06-15** — Did something.'],
    decisionLog: [],
    openQuestionsLog: [],
  };
  const result = MQ.applyBodyAppends(body, appends);
  assert(result.includes('Did something.'), 'action log entry present');
  assert(result.indexOf('Did something.') > result.indexOf('## Action Log'), 'after heading');
});

test('applies decision log and open questions log appends', () => {
  const body = '## Action Log\n\n## Decision Log\n\n## Open Questions Log\n';
  const appends = {
    actionLog: [],
    decisionLog: ['**2026-06-15** — Decided X.'],
    openQuestionsLog: ['**2026-06-15** `open` — Is Y true?'],
  };
  const result = MQ.applyBodyAppends(body, appends);
  assert(result.includes('Decided X.'), 'decision log entry present');
  assert(result.includes('Is Y true?'), 'open question entry present');
});

test('handles null pendingAppends gracefully', () => {
  const body = '## Action Log\n';
  const result = MQ.applyBodyAppends(body, null);
  assertEqual(result, body, 'body unchanged when null');
});

test('appends multiple entries in order', () => {
  const body = '## Action Log\n\nOld entry.\n';
  const appends = {
    actionLog: ['**2026-06-15** — Entry A.', '**2026-06-15** — Entry B.'],
    decisionLog: [],
    openQuestionsLog: [],
  };
  const result = MQ.applyBodyAppends(body, appends);
  assert(result.includes('Entry A.'), 'Entry A present');
  assert(result.includes('Entry B.'), 'Entry B present');
});

// ---------------------------------------------------------------------------
// TESTS: updateOneParagraph
// ---------------------------------------------------------------------------

console.log('\nupdateOneParagraph');

test('replaces One Paragraph content', () => {
  const body = `## Idea Capsule — 2026-06-15

**Name** — ThinkMutant
**One Phrase** — AI graph
**Core Sentence** — Makes thinking visible.
**One Paragraph** — This is the old paragraph text.

**Key Insights**
- Insight one
`;
  const result = MQ.updateOneParagraph(body, 'This is the new paragraph text.');
  assert(result.includes('This is the new paragraph text.'), 'new text present');
  assert(!result.includes('This is the old paragraph text.'), 'old text gone');
  assert(result.includes('**One Paragraph** — This is the new paragraph text.'), 'field format preserved');
});

test('throws when One Paragraph field not found', () => {
  const body = `## Idea Capsule\n\n**Name** — Test\n**One Phrase** — Short\n`;
  assertThrows(
    () => MQ.updateOneParagraph(body, 'new text'),
    'Could not locate One Paragraph field',
    'updateOneParagraph throws on missing field'
  );
});

// ---------------------------------------------------------------------------
// TESTS: nameToSlug
// ---------------------------------------------------------------------------

console.log('\nnameToSlug');

test('lowercases a simple name', () => {
  assertEqual(MQ.nameToSlug('ThinkMutant'), 'thinkmutant', 'ThinkMutant');
});

test('replaces spaces with hyphens', () => {
  assertEqual(MQ.nameToSlug('EF Coach'), 'ef-coach', 'EF Coach');
});

test('handles arrow character in name', () => {
  assertEqual(MQ.nameToSlug('Photo → 2D vector engine'), 'photo-2d-vector-engine', 'arrow');
});

test('collapses multiple hyphens', () => {
  assertEqual(MQ.nameToSlug('A  B'), 'a-b', 'multiple spaces');
});

test('strips leading/trailing hyphens', () => {
  assertEqual(MQ.nameToSlug(' Leading'), 'leading', 'leading space');
});

test('handles Matterqueue itself', () => {
  assertEqual(MQ.nameToSlug('Matterqueue'), 'matterqueue', 'Matterqueue');
});

// ---------------------------------------------------------------------------
// TESTS: contentHash (async)
// ---------------------------------------------------------------------------

console.log('\ncontentHash');

async function runAsyncTests() {
  // contentHash tests require SubtleCrypto — available in Node 15+
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    console.log('  ⚠️  SubtleCrypto not available in this Node version — skipping contentHash tests');
    console.log('     (Available in Node 15+. Will work correctly in Chrome.)');
    return;
  }

  await testAsync('produces a 64-character hex string', async () => {
    const hash = await MQ.contentHash('Hello, Matterqueue.');
    assertEqual(typeof hash, 'string', 'returns string');
    assertEqual(hash.length, 64, '64 hex chars (SHA-256)');
    assert(/^[0-9a-f]+$/.test(hash), 'hex only');
  });

  await testAsync('same content → same hash', async () => {
    const a = await MQ.contentHash('test content');
    const b = await MQ.contentHash('test content');
    assertEqual(a, b, 'deterministic');
  });

  await testAsync('different content → different hash', async () => {
    const a = await MQ.contentHash('content A');
    const b = await MQ.contentHash('content B');
    assert(a !== b, 'different content → different hash');
  });
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${err.message}`);
    failures.push({ name, error: err.message });
    failed++;
  }
}

// ---------------------------------------------------------------------------
// TESTS: reconstructMarkdownFile
// ---------------------------------------------------------------------------

console.log('\nreconstructMarkdownFile');

test('reconstructs a valid MD file with updated modified_date', () => {
  const { frontMatter, body } = MQ.parseMarkdownFile(SIMPLE_MD);
  const md = {
    filename: 'thinkmutant.md',
    frontMatter,
    body,
    pendingBodyAppends: { actionLog: [], decisionLog: [], openQuestionsLog: [] },
  };
  const result = MQ.reconstructMarkdownFile(md);
  assert(result.startsWith('---\n'), 'starts with front matter delimiter');
  assert(result.includes('\n---\n'), 'closing front matter delimiter');
  assert(result.includes('name: ThinkMutant'), 'name preserved');
  // modified_date should be today
  const today = MQ.todayISO();
  assert(result.includes(`modified_date: ${today}`), 'modified_date updated to today');
  assert(result.includes('## Idea Capsule'), 'body preserved');
});

test('reconstructed file round-trips cleanly', () => {
  const { frontMatter, body } = MQ.parseMarkdownFile(SIMPLE_MD);
  const md = {
    filename: 'thinkmutant.md',
    frontMatter,
    body,
    pendingBodyAppends: { actionLog: [], decisionLog: [], openQuestionsLog: [] },
  };
  const reconstructed = MQ.reconstructMarkdownFile(md);
  const reparsed = MQ.parseMarkdownFile(reconstructed);
  // Key fields should survive the full cycle
  assertEqual(reparsed.frontMatter.name, 'ThinkMutant', 'name survives round-trip');
  assertEqual(reparsed.frontMatter.focus, true, 'focus survives round-trip');
  assertEqual(reparsed.frontMatter.uses, ['InsightMutant', 'Document ingest and structure extraction engine'], 'uses survives round-trip');
  assertEqual(reparsed.frontMatter.actions.length, 2, 'action count survives round-trip');
  assertEqual(reparsed.frontMatter.actions[0].description, 'Prototype mind map rendering', 'action description survives');
  assertEqual(reparsed.frontMatter.actions[0].queued, true, 'queued survives round-trip');
});

test('applies body appends during reconstruction', () => {
  const { frontMatter, body } = MQ.parseMarkdownFile(SIMPLE_MD);
  const md = {
    filename: 'thinkmutant.md',
    frontMatter,
    body,
    pendingBodyAppends: {
      actionLog: ['**2026-06-15** — Built core module.'],
      decisionLog: [],
      openQuestionsLog: [],
    },
  };
  const result = MQ.reconstructMarkdownFile(md);
  assert(result.includes('Built core module.'), 'action log append present in output');
});

// ---------------------------------------------------------------------------
// TESTS: todayISO
// ---------------------------------------------------------------------------

console.log('\ntodayISO');

test('returns a YYYY-MM-DD string', () => {
  const today = MQ.todayISO();
  assert(/^\d{4}-\d{2}-\d{2}$/.test(today), `format: ${today}`);
});

// ---------------------------------------------------------------------------
// RUN AND REPORT
// ---------------------------------------------------------------------------

runAsyncTests().then(() => {
  console.log('\n' + '─'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failures.length > 0) {
    console.log('\nFailed tests:');
    for (const f of failures) {
      console.log(`  ❌ ${f.name}`);
    }
    process.exit(1);
  } else {
    console.log('\nAll tests passed. matterqueue-core.js is verified.');
  }
});
