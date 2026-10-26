# ADR-0005: Per-profile encryption at rest with PIN/passphrase-derived keys

- **Status:** Accepted
- **Date:** 2026-10-26

## Context

Profiles share one browser origin. Without encryption, a PIN would only be a UI gate that anyone could bypass with DevTools. We want real confidentiality for protected profiles, with no server and using only native browser crypto.

## Decision

- Use envelope encryption with **WebCrypto**:
  - **KEK** = PBKDF2-SHA256(secret, 16-byte salt, 600k iterations) → AES-KW-256;
  - **DEK** = random AES-GCM-256, stored only wrapped by the KEK.
- Every record payload is encrypted with AES-GCM (random 96-bit IV, AAD binding profile/store/record/schema version).
- Changing the PIN re-wraps the DEK only. Rotating the key re-encrypts the data.
- PIN correctness is proven by a successful unwrap, so no PIN hash is stored.
- Offer both PIN and passphrase, and recommend a passphrase for sensitive data.

## Consequences

- ✅ Protected profiles can't be read or silently modified without the secret, even with DevTools or a disk copy (subject to secret strength).
- ✅ Native, constant-time primitives; keys are non-extractable in memory.
- ⚠️ A short numeric PIN is guessable offline by a determined attacker with a copy of the database. Docs and UI explain this, and passphrases are offered.
- ⚠️ A forgotten secret means the data is lost. The UI warns about this and nudges users to back up.
- ⚠️ The tree structure (`parentId`) and record sizes stay visible. Names, metadata and contents are encrypted.
