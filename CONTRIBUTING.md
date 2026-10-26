# Contributing to WebOS

Thanks for helping build WebOS! This guide covers setup, conventions and what every pull request needs.

## Setup

```bash
git clone https://github.com/yesoreyeram/webos.git
cd webos
npm ci
npx playwright install chromium   # first time only, for e2e tests
```

| Script | Purpose |
|---|---|
| `npm test` | Unit tests (Vitest) |
| `npm run e2e` | End-to-end tests (Playwright, Chromium) |
| `npm run check:docs` | Validate relative links in Markdown docs |
| `npm run prototypes:render` | Re-render prototype PNGs from `docs/prototypes/src` |
| `npm run prototypes:icons` | Regenerate the prototype icon sprite |

App scripts (`dev`, `build`, `preview`, `lint`, `typecheck`) are added with the application scaffold.

## Workflow

1. Create a branch from `main`: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`.
2. Keep changes focused. One concern per PR.
3. Write or update tests with the change.
4. Run the checks locally (`npm test && npm run e2e && npm run check:docs`).
5. Open a PR using the template and fill in **every** section.

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat(files): add grid view`, `fix(vfs): restore from trash on name conflict`, `docs: update deployment guide`.

## Pull request requirements

Every PR description must include:

- **Summary:** what changed and why.
- **Screenshots** of every UI change (light and dark where relevant, and 390 px mobile when layout changes). Commit them under `docs/screenshots/<pr-topic>/` or `docs/prototypes/` and embed them.
- **Unit tests:** what's covered, the command and its result (pass counts, coverage for touched modules).
- **E2E tests:** specs added or updated, the command and its result.
- **Deployment notes:** GitHub Pages impact, new configuration (variables), migrations, rollback considerations.

## Code standards

- TypeScript strict mode; no `any` without justification.
- Respect layer boundaries (see [ARCHITECTURE § 3.1](docs/ARCHITECTURE.md#31-dependency-rules)). Apps only use `src/sdk`.
- Accessibility is part of "done": keyboard support, labels, focus management, contrast.
- No new third-party network requests without a security review (CSP).
- User-facing strings go through `t()`.

## Reporting bugs and security issues

- Bugs and feature requests: GitHub Issues.
- Vulnerabilities: **don't open a public issue.** Follow [SECURITY.md](SECURITY.md).
