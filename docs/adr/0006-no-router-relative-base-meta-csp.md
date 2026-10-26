# ADR-0006: No router, relative base path, CSP via meta tag

- **Status:** Accepted
- **Date:** 2026-10-26

## Context

On GitHub Pages:
- project sites are served under `/<repo>/`;
- unknown paths return the site's `404.html`;
- custom response headers can't be set.

A desktop metaphor doesn't need URL routes: navigation happens through windows.

## Decision

- **No client-side router.** The app always loads from `index.html`. Deep links (if added later) will use the URL hash (`#open=/home/Documents/x.md`).
- **Vite `base: './'`**, so asset URLs are relative and the same build works under `/webos/`, at a custom domain root, or on another host.
- **CSP delivered as `<meta http-equiv="Content-Security-Policy">`**, with Google origins added only when sign-in is enabled. Clickjacking is mitigated by a frame-busting guard, since `frame-ancestors` is unsupported in meta tags.

## Consequences

- ✅ No `404.html` SPA hacks; no broken refreshes; portable builds.
- ⚠️ Reports via `report-to` aren't available. Violations are logged locally and caught in e2e tests.
- ⚠️ Header-only protections need a proxy or CDN (see DEPLOYMENT § 7).
