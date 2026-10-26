# ADR-0003: IndexedDB-backed virtual file system

- **Status:** Accepted
- **Date:** 2026-10-26

## Context

Apps need a shared, hierarchical file system with binary content, transactions and a realistic quota. The candidates were:
- `localStorage`: about 5 MB, strings only, synchronous;
- the Origin Private File System (OPFS): good for blobs, but no transactions across metadata and inconsistent tooling across browsers;
- IndexedDB.

## Decision

Implement the VFS on **IndexedDB** (via the tiny `idb` wrapper):
- a `nodes` store holds metadata, with a `[profileId, parentId]` index;
- a separate `blobs` store holds file content;
- every operation runs in a single transaction;
- the active profile's node table is cached in memory after unlock for fast listing and search.

## Consequences

- ✅ Large quotas (typically GBs), structured data, atomic multi-store transactions, available in all target browsers and in tests via `fake-indexeddb`.
- ✅ The storage adapter is behind an interface, so OPFS can back `blobs` later without touching apps.
- ⚠️ Data is subject to browser eviction. We request `navigator.storage.persist()` and encourage backups.
- ⚠️ Schema changes need versioned migrations with tests.
