/**
 * matterqueue-core.js
 * Shared module consumed by both the viewer (matterqueue-viewer.html)
 * and the migration tool (matterqueue-migrate.html).
 *
 * No external dependencies. Vanilla JS. Chrome / File System Access API environment.
 *
 * Exports (attach to window.MQ for browser use):
 *   parseMarkdownFile(rawContent)         → { frontMatter, body }
 *   parseYAML(yamlString)                 → JS object
 *   serializeYAML(obj)                    → YAML string
 *   yamlRoundTripValid(original, roundTrip) → boolean
 *   reconstructMarkdownFile(md)           → string
 *   applyBodyAppends(body, pendingAppends) → string
 *   insertAfterHeading(body, heading, content) → string
 *   updateOneParagraph(body, newText)     → string
 *   nameToSlug(name)                      → string
 *   contentHash(text)                     → Promise<string>
 *
 * Schema reference: matterqueue-schema-2026-06-15.md v1.3
 * Write-back reference: matterqueue-writeback-design-2026-06-15.md v1.2
 */

(function (global) {
  'use strict';

  // ---------------------------------------------------------------------------
  // MARKDOWN FILE PARSING
  // ---------------------------------------------------------------------------

  /**
   * Split a raw MD file into front matter and body.
   * Front matter is the YAML block between the opening and closing --- delimiters.
   * Body is everything after the closing --- delimiter.
   *
   * Returns { frontMatter: <parsed JS object>, body: <string> }.
   * If no front matter delimiters are found, returns { frontMatter: {}, body: rawContent }.
   */
  function parseMarkdownFile(rawContent) {
    // Match: optional BOM, opening ---, YAML block, closing ---, body
    // The closing --- must be followed by a newline or end of string
    const fmMatch = rawContent.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!fmMatch) {
      return { frontMatter: {}, body: rawContent };
    }
    return {
      frontMatter: parseYAML(fmMatch[1]),
      body: fmMatch[2],
    };
  }

  // ---------------------------------------------------------------------------
  // YAML PARSER
  // ---------------------------------------------------------------------------

  /**
   * Parse the YAML front matter string into a JS object.
   *
   * Handles the subset of YAML used by Matterqueue front matter:
   *   - Scalar values: string, boolean (true/false), null (empty or ~), date (YYYY-MM-DD), integer
   *   - Block sequences (list items prefixed with "  - ")
   *   - Block mappings for actions: list items (indented key: value pairs under a list entry)
   *   - Multi-line scalar values are not used in this schema
   *
   * Field order in input is NOT guaranteed to be preserved (JS object).
   * The serializer restores canonical order on output.
   */
  function parseYAML(yamlString) {
    const result = {};
    const lines = yamlString.split(/\r?\n/);
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Skip blank lines and comment lines at top level
      if (line.trim() === '' || line.trim().startsWith('#')) {
        i++;
        continue;
      }

      // Top-level key: value
      const topMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)?$/);
      if (!topMatch) {
        i++;
        continue;
      }

      const key = topMatch[1];
      const rest = topMatch[2] !== undefined ? topMatch[2].trim() : '';

      // Value is on the same line (scalar)
      if (rest !== '') {
        result[key] = parseScalar(rest);
        i++;
        continue;
      }

      // No value on this line — look ahead for block sequence or block mapping
      i++;

      // Collect indented children
      const children = [];
      while (i < lines.length) {
        const child = lines[i];
        // Stop at next top-level key or blank line that's followed by a top-level key
        if (child.match(/^[a-zA-Z_][a-zA-Z0-9_]*:/)) break;
        children.push(child);
        i++;
      }

      if (children.length === 0) {
        // Empty value
        result[key] = null;
        continue;
      }

      // Detect if children are a block sequence (items starting with "  - ")
      const firstNonBlank = children.find(c => c.trim() !== '');
      if (!firstNonBlank) {
        result[key] = null;
        continue;
      }

      const isSequence = firstNonBlank.match(/^\s+-\s*/);
      if (isSequence) {
        result[key] = parseBlockSequence(children);
      } else {
        // Should not occur at top level for this schema — treat as null
        result[key] = null;
      }
    }

    return result;
  }

  /**
   * Parse a block sequence into an array.
   * Each "- " entry is either a scalar or a block mapping (for actions:).
   *
   * Handles:
   *   Simple list:
   *     - ThinkMutant
   *     - The Current
   *
   *   Mapping list (actions:):
   *     - description: Build matterqueue-core.js
   *       type: task
   *       state: open
   *       queued: true
   *       position: 1
   */
  function parseBlockSequence(lines) {
    const items = [];
    let currentItem = null;
    let currentItemLines = [];

    function flushCurrentItem() {
      if (currentItem === null) return;
      if (currentItemLines.length === 0) {
        // Simple scalar item
        items.push(parseScalar(currentItem));
      } else {
        // Mapping item — currentItem is the first key:value line, rest in currentItemLines
        const mappingLines = [currentItem, ...currentItemLines];
        items.push(parseMappingBlock(mappingLines));
      }
      currentItem = null;
      currentItemLines = [];
    }

    for (const line of lines) {
      if (line.trim() === '') continue;

      // New list item
      const itemMatch = line.match(/^(\s*)-\s+(.*)?$/);
      if (itemMatch) {
        flushCurrentItem();
        const itemContent = itemMatch[2] ? itemMatch[2].trim() : '';
        if (itemContent === '') {
          // Next lines will have the mapping
          currentItem = '';
        } else if (itemContent.match(/^[a-zA-Z_][a-zA-Z0-9_]*:/)) {
          // First line of a mapping
          currentItem = itemContent;
        } else {
          // Simple scalar
          currentItem = itemContent;
        }
        continue;
      }

      // Continuation line (indented content for current mapping item)
      if (currentItem !== null && line.match(/^\s{2,}/)) {
        const trimmed = line.trim();
        if (trimmed !== '') {
          currentItemLines.push(trimmed);
        }
      }
    }

    flushCurrentItem();
    return items;
  }

  /**
   * Parse a flat list of "key: value" strings into a JS object.
   * Used for action mapping blocks.
   */
  function parseMappingBlock(lines) {
    const obj = {};
    for (const line of lines) {
      const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)?$/);
      if (m) {
        obj[m[1]] = parseScalar(m[2] !== undefined ? m[2].trim() : '');
      }
    }
    return obj;
  }

  /**
   * Parse a YAML scalar value string into the appropriate JS type.
   *
   * Rules (in order):
   *   - Empty string or "~" → null
   *   - "true" → true, "false" → false
   *   - YYYY-MM-DD → Date string (kept as string — viewer formats for display)
   *   - Integer string → number
   *   - Otherwise → string (strip surrounding quotes if present)
   */
  function parseScalar(value) {
    if (value === '' || value === '~' || value === 'null') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    // Date: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value; // Keep as string
    // Integer
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    // Quoted string — strip quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    return value;
  }

  // ---------------------------------------------------------------------------
  // YAML SERIALIZER
  // ---------------------------------------------------------------------------

  /**
   * Serialize a front matter JS object back to a YAML string.
   *
   * Field order follows the canonical schema field order.
   * Unknown fields (not in schema) are appended at the end — never dropped.
   * Values: null → empty (key: with no value), booleans → true/false,
   * strings → unquoted unless they require quoting, arrays → block sequence,
   * action objects → indented mapping block.
   *
   * Consistent field order means the output is diffable in a text editor.
   */
  function serializeYAML(obj) {
    // Canonical field order per schema v1.3
    const FIELD_ORDER = [
      'name', 'type', 'doc_level', 'state', 'absorbed_by',
      'focus', 'try_it', 'map_it', 'compilation', 'build_doc', 'todoist',
      'created_date', 'modified_date',
      'uses', 'synergies',
      'actions',
    ];

    const ACTION_FIELD_ORDER = ['description', 'type', 'state', 'queued', 'position'];

    const lines = [];
    const seen = new Set();

    // Emit fields in canonical order first
    for (const field of FIELD_ORDER) {
      if (!(field in obj)) continue;
      seen.add(field);
      emitField(field, obj[field]);
    }

    // Emit any unknown fields not in the canonical order (preservation rule)
    for (const field of Object.keys(obj)) {
      if (seen.has(field)) continue;
      emitField(field, obj[field]);
    }

    return lines.join('\n');

    function emitField(key, value) {
      if (value === null || value === undefined) {
        lines.push(`${key}:`);
        return;
      }
      if (typeof value === 'boolean') {
        lines.push(`${key}: ${value}`);
        return;
      }
      if (typeof value === 'number') {
        lines.push(`${key}: ${value}`);
        return;
      }
      if (typeof value === 'string') {
        lines.push(`${key}: ${serializeStringValue(value)}`);
        return;
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          lines.push(`${key}:`);
          return;
        }
        lines.push(`${key}:`);
        for (const item of value) {
          if (item === null || item === undefined) continue;
          if (typeof item === 'string') {
            lines.push(`  - ${serializeStringValue(item)}`);
          } else if (typeof item === 'object') {
            // Action mapping block
            let first = true;
            for (const actionField of ACTION_FIELD_ORDER) {
              if (!(actionField in item)) continue;
              const aval = item[actionField];
              // Skip 'queued' field entirely when false (omit by convention)
              if (actionField === 'queued' && aval === false) continue;
              const serialized = serializeActionValue(aval);
              if (first) {
                lines.push(`  - ${actionField}: ${serialized}`);
                first = false;
              } else {
                lines.push(`    ${actionField}: ${serialized}`);
              }
            }
            // Unknown action fields (preservation)
            for (const af of Object.keys(item)) {
              if (ACTION_FIELD_ORDER.includes(af)) continue;
              lines.push(`    ${af}: ${serializeActionValue(item[af])}`);
            }
          }
        }
        return;
      }
    }

    function serializeStringValue(str) {
      // Strings that need quoting: contain leading/trailing whitespace,
      // are boolean-like, null-like, integer-like, or contain ': ' sequences
      // that would confuse a parser.
      if (
        str !== str.trim() ||
        str === 'true' || str === 'false' || str === 'null' || str === '~' ||
        /^-?\d+$/.test(str) ||
        /^(\d{4}-\d{2}-\d{2})$/.test(str) || // dates — keep unquoted (they parse fine)
        str.includes(': ') ||
        str.includes(' #') ||
        str.startsWith('*') ||
        str.startsWith('&') ||
        str.startsWith('!')
      ) {
        // Use double quotes; escape internal double quotes
        if (/^(\d{4}-\d{2}-\d{2})$/.test(str)) return str; // dates unquoted
        return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      return str;
    }

    function serializeActionValue(val) {
      if (val === null || val === undefined) return '';
      if (typeof val === 'boolean') return String(val);
      if (typeof val === 'number') return String(val);
      return serializeStringValue(String(val));
    }
  }

  // ---------------------------------------------------------------------------
  // ROUND-TRIP VALIDATION
  // ---------------------------------------------------------------------------

  /**
   * Validate that serializing and re-parsing a front matter object
   * produces an identical result. Used to catch serialization bugs
   * before writing to disk.
   *
   * Returns true if the round-trip is valid (safe to write).
   * Returns false if any field changed during serialization → abort write.
   *
   * Comparison is deep-equal via JSON.stringify on normalized representations.
   * Date values are kept as strings in both passes so they compare cleanly.
   */
  function yamlRoundTripValid(original, roundTrip) {
    return JSON.stringify(normalizeForComparison(original)) ===
           JSON.stringify(normalizeForComparison(roundTrip));
  }

  /**
   * Normalize a front matter object for comparison:
   * - Sort keys canonically
   * - Replace null/undefined with null consistently
   * - Sort array items in list fields (uses, synergies) for stable comparison
   * - Actions: sort by position field if present
   */
  function normalizeForComparison(obj) {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
      return obj.map(normalizeForComparison);
    }
    if (typeof obj === 'object') {
      const sorted = {};
      for (const key of Object.keys(obj).sort()) {
        sorted[key] = normalizeForComparison(obj[key]);
      }
      return sorted;
    }
    return obj;
  }

  // ---------------------------------------------------------------------------
  // FILE RECONSTRUCTION
  // ---------------------------------------------------------------------------

  /**
   * Reconstruct a full MD file string from an in-memory MD record.
   *
   * The in-memory record shape:
   * {
   *   filename: string,
   *   frontMatter: object,       ← live working object
   *   body: string,              ← original body (read-only except for appends)
   *   pendingBodyAppends: {
   *     actionLog: string[],
   *     decisionLog: string[],
   *     openQuestionsLog: string[]
   *   }
   * }
   *
   * Steps:
   *   1. Update modified_date to today
   *   2. Serialize front matter to YAML
   *   3. Round-trip validate — throws on mismatch (caller catches)
   *   4. Apply pending body appends
   *   5. Return assembled file string
   *
   * Throws Error if YAML round-trip validation fails.
   */
  function reconstructMarkdownFile(md) {
    // 1. Update modified_date
    const today = todayISO();
    md.frontMatter.modified_date = today;

    // 2. Serialize
    const yamlString = serializeYAML(md.frontMatter);

    // 3. Round-trip validate
    const roundTrip = parseYAML(yamlString);
    if (!yamlRoundTripValid(md.frontMatter, roundTrip)) {
      throw new Error(
        `YAML round-trip validation failed for ${md.filename} — write aborted. ` +
        `Serialized output does not parse back to the same object.`
      );
    }

    // 4. Apply pending body appends
    const bodyWithAppends = applyBodyAppends(md.body, md.pendingBodyAppends);

    // 5. Assemble
    return `---\n${yamlString}\n---\n${bodyWithAppends}`;
  }

  // ---------------------------------------------------------------------------
  // BODY APPEND MECHANISM
  // ---------------------------------------------------------------------------

  /**
   * Apply pending log appends to the body string.
   * Each log section is identified by its heading pattern.
   * New entries are inserted immediately after the heading line (reverse chronological).
   *
   * pendingAppends shape: { actionLog: string[], decisionLog: string[], openQuestionsLog: string[] }
   * Each array entry is a formatted log entry string (already dated by caller).
   */
  function applyBodyAppends(body, pendingAppends) {
    if (!pendingAppends) return body;
    let result = body;

    if (pendingAppends.actionLog && pendingAppends.actionLog.length > 0) {
      result = insertAfterHeading(
        result,
        '## Action Log',
        pendingAppends.actionLog.join('\n\n')
      );
    }
    if (pendingAppends.decisionLog && pendingAppends.decisionLog.length > 0) {
      result = insertAfterHeading(
        result,
        '## Decision Log',
        pendingAppends.decisionLog.join('\n\n')
      );
    }
    if (pendingAppends.openQuestionsLog && pendingAppends.openQuestionsLog.length > 0) {
      result = insertAfterHeading(
        result,
        '## Open Questions Log',
        pendingAppends.openQuestionsLog.join('\n\n')
      );
    }

    return result;
  }

  /**
   * Insert content immediately after a heading line in the body.
   * If the heading is not found, the section is appended at the end of the body
   * with the correct heading — no data is lost.
   *
   * content is inserted with a blank line before and after it,
   * preserving readable separation from existing log entries.
   */
  function insertAfterHeading(body, heading, content) {
    const headingIndex = body.indexOf(heading);
    if (headingIndex === -1) {
      // Heading not found — throw rather than silently appending.
      // Silent append-at-end creates duplicate headings when the user has renamed
      // a section in their text editor. Duplicate headings require manual merge —
      // worse than not appending at all. Caller is responsible for surfacing this
      // to the human. (Write-back spec v1.3 — warn-and-abort behavior.)
      throw new Error(
        `Heading "${heading}" not found in body. ` +
        `The viewer cannot append safely. No changes were written to this section. ` +
        `Edit the log manually in your text editor, or rename the heading to: ${heading}`
      );
    }

    const afterHeading = headingIndex + heading.length;
    // Find the newline after the heading
    const newlineIndex = body.indexOf('\n', afterHeading);
    if (newlineIndex === -1) {
      // Heading is at end of body
      return `${body}\n\n${content}`;
    }

    const before = body.slice(0, newlineIndex + 1);
    const after = body.slice(newlineIndex + 1);

    // Ensure a blank line between the inserted content and any existing content
    const gap = after.startsWith('\n') ? '' : '\n';
    return `${before}\n${content}${gap}${after}`;
  }

  // ---------------------------------------------------------------------------
  // ONE PARAGRAPH TARGETED REPLACE
  // ---------------------------------------------------------------------------

  /**
   * Replace the One Paragraph field value in the Idea Capsule body section.
   * This is the one case where the viewer performs a targeted body edit
   * rather than an append.
   *
   * Matches: **One Paragraph** — [value until next blank line or next ** field]
   *
   * Returns the updated body string, or throws if the pattern is not found
   * (caller should surface an error to the human rather than writing).
   */
  function updateOneParagraph(body, newText) {
    // Match **One Paragraph** — followed by content until the next blank line
    // or the next **-prefixed field line
    const pattern = /(\*\*One Paragraph\*\* — )([^\n]*(?:\n(?!\n|\*\*).*)*)/;
    if (!pattern.test(body)) {
      throw new Error(
        'Could not locate One Paragraph field in body. Edit manually in your text editor.'
      );
    }
    return body.replace(pattern, `$1${newText}`);
  }

  // ---------------------------------------------------------------------------
  // NAME → SLUG DERIVATION
  // ---------------------------------------------------------------------------

  /**
   * Derive a filename slug from a concept name.
   * Rules per schema v1.3:
   *   - Lowercase
   *   - Spaces → hyphens
   *   - Special characters stripped or replaced
   *   - Arrow sequences (→, ->) → hyphen
   *   - Multiple consecutive hyphens collapsed to one
   *   - Leading/trailing hyphens stripped
   *
   * Examples:
   *   "ThinkMutant"                → "thinkmutant"
   *   "Photo → 2D vector engine"   → "photo-2d-vector-engine"
   *   "EF Coach"                   → "ef-coach"
   *   "Matterqueue"                → "matterqueue"
   */
  function nameToSlug(name) {
    return name
      .toLowerCase()
      .replace(/→|->|–|—/g, '-')          // arrows and dashes → hyphen
      .replace(/[^a-z0-9\s-]/g, '')       // strip non-alphanumeric (except spaces/hyphens)
      .replace(/\s+/g, '-')               // spaces → hyphens
      .replace(/-{2,}/g, '-')             // collapse multiple hyphens
      .replace(/^-+|-+$/g, '');           // strip leading/trailing hyphens
  }

  // ---------------------------------------------------------------------------
  // CONTENT HASH
  // ---------------------------------------------------------------------------

  /**
   * Compute a SHA-256 content hash of a text string using SubtleCrypto.
   * Available in all modern browsers without any library.
   * Used for conflict detection: compare hash at load time vs hash on disk at Sync.
   *
   * Returns a Promise<string> (hex-encoded hash).
   */
  async function contentHash(text) {
    const encoded = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // ---------------------------------------------------------------------------
  // UTILITIES
  // ---------------------------------------------------------------------------

  /**
   * Return today's date as a YYYY-MM-DD string (local time).
   */
  function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // ---------------------------------------------------------------------------
  // MODULE EXPORT
  // ---------------------------------------------------------------------------

  const MQ = {
    // File I/O
    parseMarkdownFile,
    reconstructMarkdownFile,
    // YAML
    parseYAML,
    serializeYAML,
    yamlRoundTripValid,
    // Body operations
    applyBodyAppends,
    insertAfterHeading,
    updateOneParagraph,
    // Utilities
    nameToSlug,
    contentHash,
    todayISO,
  };

  // Support both browser (window.MQ) and test environments (module.exports)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MQ;
  } else {
    global.MQ = MQ;
  }

})(typeof globalThis !== 'undefined' ? globalThis : this);
