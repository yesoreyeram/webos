# ADR-0002: React + TypeScript + Vite + Zustand

- **Status:** Accepted
- **Date:** 2026-10-26

## Context

The UI is a component-heavy desktop: windows, menus, palettes and seven apps. We need enterprise-grade maintainability, strong typing, fast builds, small bundles, and a large hiring and tooling ecosystem. The options considered were React + TS + Vite, vanilla TS + Vite, and no-build vanilla JS.

## Decision

- **React 19** for UI, **TypeScript (strict)** everywhere, **Vite** for dev and build.
- **Zustand** for shared state. It's selector-based and usable outside React by kernel services.
- No meta-framework (Next.js etc.), because no server rendering is possible on Pages.

## Consequences

- ✅ Familiar stack; excellent a11y libraries and testing tools (Testing Library, Playwright).
- ✅ Per-app code splitting via `React.lazy` keeps the shell small (budget ≤ 150 KB gzipped).
- ⚠️ React adds ~45 KB gzipped compared to vanilla. That's acceptable within the budget.
- ⚠️ Frequent geometry updates such as window drag must bypass React rendering (transform + rAF, commit on release).
