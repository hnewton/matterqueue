# Matterqueue

Matterqueue is a browser-based tool for viewing and editing Markdown files that
use YAML front matter. It runs entirely client-side with no external runtime
dependencies, using the Chrome File System Access API to read and write files
directly on disk.

## Components

- **`matterqueue-core.js`** — Shared, dependency-free module consumed by the
  viewer and migration tools. Provides Markdown/YAML parsing, canonical YAML
  serialization, round-trip validation, and write-back helpers (heading
  inserts, paragraph updates, body appends).
- **`matterqueue-viewer.html`** — Standalone viewer UI for browsing front matter
  and body content.
- **`matterqueue-core.test.js`** — Playwright test suite covering the core
  module.
- **`venture-portfolio/`** — Test corpus of sample Markdown files and queue
  metadata used during development and testing.

## Core API

The core module attaches its exports to `window.MQ` for browser use:

- `parseMarkdownFile(rawContent)` → `{ frontMatter, body }`
- `parseYAML(yamlString)` → JS object
- `serializeYAML(obj)` → YAML string
- `yamlRoundTripValid(original, roundTrip)` → boolean
- `reconstructMarkdownFile(md)` → string
- `applyBodyAppends(body, pendingAppends)` → string
- `insertAfterHeading(body, heading, content)` → string
- `updateOneParagraph(body, newText)` → string
- `nameToSlug(name)` → string
- `contentHash(text)` → `Promise<string>`

## Requirements

- A Chromium-based browser with File System Access API support.
- [Node.js](https://nodejs.org/) and npm for running the test suite.

## Testing

Tests use [Playwright](https://playwright.dev/):

```bash
npm install
npx playwright test
```

## License

ISC
