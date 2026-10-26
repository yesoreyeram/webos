# WebOS

**A clean, modern desktop that runs entirely in your browser.** It has windowed apps, a private file system, multiple profiles under one sign-in, and an offline-ready shell. It's deployed as a static site on GitHub Pages.

![WebOS Focus Shell: Files and Text Editor snapped side by side](docs/prototypes/05-desktop-multitasking.png)

> **Status: Phase 1 (design and architecture).** The prototypes and architecture are ready for review, and the application build starts after sign-off. Track progress in the [pull requests](https://github.com/yesoreyeram/webos/pulls).

## Highlights

- **Focus Shell.** A top system bar for system and context, a centered dock for apps, and a `Ctrl K` command palette that finds anything. Includes workspaces, snap layouts and Today widgets.
- **Seven built-in apps:** Files, Text Editor (Markdown), Terminal, Calendar & Clock, Media Viewer, Calculator, Settings.
- **One sign-in, many profiles.** Use Google or a local account. Each profile gets its own files, settings, wallpaper and layout.
- **Private by design.** No backend and no tracking. Data stays in your browser. PIN- or passphrase-protected profiles are **encrypted at rest** (AES-GCM-256).
- **Enterprise-grade engineering:**
  - strict TypeScript and enforced module boundaries;
  - a strict CSP;
  - WCAG 2.2 AA;
  - unit and e2e tests;
  - CI/CD to GitHub Pages.
- **Installable PWA** that works offline, in light and dark themes, on desktop and phone.

## Screens

| | | |
|---|---|---|
| ![Sign in](docs/prototypes/01-sign-in.png) | ![Profiles](docs/prototypes/02-profile-picker.png) | ![Lock](docs/prototypes/03-lock-screen.png) |
| Sign in | Profiles | Lock screen |
| ![Command palette](docs/prototypes/06-command-palette.png) | ![Launcher](docs/prototypes/07-launcher.png) | ![Quick settings](docs/prototypes/08-quick-settings-notifications.png) |
| Command palette | Launcher | Quick settings |
| ![Terminal + Calendar](docs/prototypes/10-terminal-calendar.png) | ![Media viewer](docs/prototypes/11-media-viewer.png) | ![Dark mode](docs/prototypes/12-desktop-dark.png) |
| Terminal + Calendar | Media viewer | Dark mode |

All 13 screens, including mobile, are in the [prototype gallery](docs/prototypes/README.md).

## Documentation

| Document | Contents |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | Context, layers, kernel services, app SDK, window manager, VFS, data model, flows, performance, testing |
| [Requirements](docs/REQUIREMENTS.md) | Functional requirements with acceptance criteria, non-functional targets, traceability |
| [Security](docs/SECURITY.md) | Threat model (STRIDE), CSP, cryptography, authentication, SDLC, incident response |
| [Deployment](docs/DEPLOYMENT.md) | GitHub Pages setup, workflows, Google sign-in setup, custom domain, rollback, troubleshooting |
| [UX and design system](docs/UX.md) | Principles, shell anatomy, tokens, components, interaction patterns, keyboard model |
| [ADRs](docs/adr/README.md) | Key architecture decisions |

## Quick start

Requirements: Node.js 22+ and npm 10+.

```bash
npm ci
npm test                   # unit tests (Vitest)
npm run e2e                # end-to-end tests (Playwright)
npm run prototypes:render  # regenerate prototype PNGs
```

The app scripts (`dev`, `build`, `preview`) arrive with the application scaffold.

## Deploy to GitHub Pages

1. Go to **Settings → Pages → Source** and select **GitHub Actions**.
2. Merge to `main`. The **Deploy to GitHub Pages** workflow publishes the site to `https://<owner>.github.io/webos/`.
3. Optional: to enable Google sign-in, add a repository variable `GOOGLE_CLIENT_ID` (see [DEPLOYMENT § 4](docs/DEPLOYMENT.md#4-enabling-google-sign-in-optional)).

The full guide, including custom domains, rollback and troubleshooting, is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Every PR includes screenshots, unit and e2e test results, and deployment notes. To report a vulnerability, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
