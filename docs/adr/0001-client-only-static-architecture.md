# ADR-0001: Client-only static architecture on GitHub Pages

- **Status:** Accepted
- **Date:** 2026-10-26

## Context

WebOS must be hostable on GitHub Pages, which serves static files only: no server code, no custom headers, no databases. We also want strong privacy (no user data on servers) and zero operating cost.

## Decision

Build WebOS as a **static single-page application**:
- all logic runs in the browser;
- all user data is stored in the browser (IndexedDB);
- the only network dependencies are the static assets and, optionally, Google Identity Services for sign-in.

## Consequences

- ✅ Free hosting, no backend to secure or scale, works offline, user data never leaves the device.
- ✅ Portable: `dist/` runs on any static host.
- ⚠️ No cross-device sync or sharing in v1. Export/import backups cover migration.
- ⚠️ Security relies on client-side controls. Device-level access is out of our control (mitigated by per-profile encryption, see ADR-0005).
- ⚠️ No server-set headers. CSP is delivered via a meta tag (ADR-0006).

## Future

- Optional sync through a pluggable remote storage adapter (e.g., WebDAV, S3-compatible, or a user's own cloud drive), with end-to-end encryption.
- Third-party apps in `<iframe sandbox="allow-scripts">` communicating through a versioned `postMessage` SDK with capability prompts.
