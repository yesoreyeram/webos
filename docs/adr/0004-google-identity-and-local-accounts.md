# ADR-0004: Google Identity Services + local accounts, multiple profiles per account

- **Status:** Accepted
- **Date:** 2026-10-26

## Context

Users asked for social login with **multiple profiles under one login**. On a static host:
- **Google Identity Services** can issue an ID token entirely client-side.
- **GitHub OAuth** needs a client secret and a token exchange endpoint without CORS, so it would require a broker such as Firebase or a proxy.
- **Microsoft Entra ID** (MSAL, PKCE) is possible but wasn't requested for v1.

The site must also work with no provider configured, and offline.

## Decision

- Support two providers behind an `AuthProvider` interface:
  - **local**, which works offline with no setup;
  - **google**, enabled only when `VITE_GOOGLE_CLIENT_ID` is set at build time.
- Model **Account → Profiles (1..8)**. The account id is `SHA-256(provider + ':' + subject)`. Each profile owns isolated files, settings and layout.
- Don't persist tokens. The ID token is validated and discarded.

## Consequences

- ✅ "One sign-in, many profiles" works the same for local and Google accounts.
- ✅ No secrets and no backend. Adding Microsoft or GitHub (through a broker) later means writing a new `AuthProvider`.
- ⚠️ Google sign-in **identifies** a user but doesn't protect local data on a shared device. That's the job of the profile PIN/passphrase (ADR-0005), and the UI and docs say so.
- ⚠️ Data doesn't follow the Google account to other devices (no sync in v1).
