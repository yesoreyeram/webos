# WebOS requirements

> Version 1.0 · Status: **Baseline for build**. Priorities use MoSCoW: **M**ust, **S**hould, **C**ould, **W**on't (v1).
> Related: [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md) · [Deployment](DEPLOYMENT.md) · [UX](UX.md) · [Prototypes](prototypes/README.md)

## 1. Purpose and scope

WebOS is a browser-based desktop environment, hosted as a static site on GitHub Pages. It gives users a familiar, fast and private workspace:
- windowed apps,
- a virtual file system,
- productivity tools,
- multiple isolated profiles under one sign-in.

**In scope (v1):**
- local and Google sign-in;
- profiles with optional PIN encryption;
- the Focus Shell (top bar, dock, launcher, command palette, quick settings, notifications, workspaces, snapping);
- seven built-in apps: Files, Text Editor, Terminal, Calendar & Clock, Media Viewer, Calculator, Settings;
- offline PWA, light/dark themes, responsive layout;
- CI/CD to GitHub Pages.

**Out of scope (v1):**
- cloud sync across devices;
- real-time collaboration;
- third-party app store;
- running native or Linux binaries;
- a web browser app (blocked in practice by `X-Frame-Options`/CSP on most sites);
- audio/video editing;
- Microsoft or GitHub sign-in. The `AuthProvider` interface allows adding them later.

## 2. Personas

| Persona | Needs | Key requirements |
|---|---|---|
| **Knowledge worker** (primary) | Quick notes, files, calendar, focus; keyboard speed | Command palette, snapping, editor, calendar |
| **Shared-device user** | Keep personal and work data apart on one browser | Profiles, PIN lock, encryption, auto-lock |
| **IT evaluator** | Assurance on privacy, security, accessibility, deployability | Security docs, CSP, no tracking, WCAG, CI/CD |
| **Developer / contributor** | Clear architecture, easy app authoring, reliable tests | App SDK, ADRs, test suites, PR template |

## 3. Assumptions and dependencies

- Users run a supported evergreen browser with JavaScript, IndexedDB and WebCrypto enabled.
- Google sign-in requires the maintainer to configure a Google OAuth **Web client ID** (public value). Without it, only local accounts are offered.
- GitHub Pages is enabled with **Source: GitHub Actions** on the repository.

## 4. Functional requirements

### 4.1 Identity and accounts (FR-AUTH)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| FR-AUTH-01 | Users can create a **local account** with a display name, with no network required. | M | Given a fresh browser, when the user chooses *Create a local account* and enters a name, then an account is created and the profile picker opens. |
| FR-AUTH-02 | Users can **sign in with Google** when a client ID is configured. | M | The *Sign in with Google* button is visible only if `VITE_GOOGLE_CLIENT_ID` is set. A successful sign-in creates or reuses the account keyed by the Google subject. The raw ID token isn't persisted. |
| FR-AUTH-03 | The sign-in screen lists **accounts previously used** on this device. | S | Remembered accounts appear with avatar, name and profile count. Selecting one opens its profile picker without re-authenticating (local data access only). |
| FR-AUTH-04 | Users can **sign out**, returning to the sign-in screen and clearing in-memory keys. | M | After sign-out, no profile data is readable without selecting the account again (and its PIN, if set). |
| FR-AUTH-05 | Users can **remove an account** from the device, deleting all of its profiles and data after confirmation. | M | Typed confirmation is required. All `accounts`, `profiles`, `nodes`, `blobs` and `kv` rows for that account are deleted. |
| FR-AUTH-06 | The ID token is validated client-side (`iss`, `aud`, `exp`, `nonce`) before use. | M | Tokens with a wrong audience, expired `exp` or mismatched nonce are rejected with an error message. |

### 4.2 Profiles (FR-PROF)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| FR-PROF-01 | An account can hold **multiple profiles** (default max 8). | M | Users can add profiles from the picker and Settings. The 9th is blocked with an explanation. |
| FR-PROF-02 | Each profile has an isolated **file system, settings, wallpaper, pinned apps, calendar and window layout**. | M | Data created in profile A is never listed, searched or opened in profile B (verified by e2e). |
| FR-PROF-03 | Users can **rename, recolor, change the icon of and delete** a profile. | M | Deleting requires confirmation and removes all of the profile's records. |
| FR-PROF-04 | Users can **set, change or remove a PIN** (4–12 digits) **or passphrase** (≥ 8 characters) per profile. | M | Setting a secret encrypts the profile's data at rest. Changing it re-wraps the key without re-encrypting data. Removing it decrypts the data after verifying the current secret. |
| FR-PROF-05 | PIN-protected profiles show a **lock screen**; repeated wrong PINs trigger exponential backoff. | M | After 5 failures, input is disabled for 30 s, doubling each time (max 15 min). |
| FR-PROF-06 | The profile **auto-locks** after a configurable idle time (off, 5, 10 (default), 30, 60 min) and on demand (`Ctrl+Alt+L`). | M | After the timeout, the lock screen appears and in-memory keys are discarded. |
| FR-PROF-07 | New profiles are seeded with a home folder (`Desktop`, `Documents/Welcome.md`, `Pictures` with samples, `Downloads`) and default settings. | S | First open shows the *Get started* card and seeded files. |
| FR-PROF-08 | Users can **export and import a profile backup** file. | S | Export produces a single `.webos-backup.json`. Import validates the schema and creates a new profile. Encrypted profiles stay encrypted in the backup. |

### 4.3 Shell (FR-SHELL)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| FR-SHELL-01 | The **top bar** shows the brand menu, workspace switcher, search trigger, save status, notifications, quick settings, date/time and profile menu. | M | Matches prototype 05. All controls are keyboard-reachable. |
| FR-SHELL-02 | The **dock** shows the launcher button, pinned apps, running indicators (focused app highlighted) and Trash. | M | Clicking a pinned app launches it or focuses it if running. Users can pin/unpin via context menu and Settings. |
| FR-SHELL-03 | The **launcher** shows pinned apps, all apps, quick actions, recent files and profile actions (lock, switch, sign out). | M | Opens from the dock button. Search filters as the user types. `Esc` closes it. |
| FR-SHELL-04 | The **command palette** (`Ctrl/⌘+K`) searches apps, files, actions and settings, with keyboard navigation and scope chips. A `>` prefix runs terminal-style commands. | M | Results appear in < 50 ms for 5k items. `Enter` runs the top hit and `Tab` shows more actions. |
| FR-SHELL-05 | **Quick settings** offers dark mode, Do Not Disturb, focus timer, reduce motion, text size, accent color, storage usage and profile actions. | M | Changes apply instantly and persist per profile. |
| FR-SHELL-06 | The **notification center** lists recent notifications with actions. Toasts appear for new ones unless DND is on. | M | Notifications persist (last 50) and can be dismissed individually or all at once. |
| FR-SHELL-07 | **Workspaces**: create, switch, rename and delete virtual desktops; move windows between them. | S | Switching hides and shows windows without reloading apps. |
| FR-SHELL-08 | **Desktop** shows optional icons (shortcuts) and the *Today* widgets (clock, agenda, recent files), which can be toggled. | S | Widgets reflect live data and can be hidden in Settings. |
| FR-SHELL-09 | **Context menus** for desktop, dock items, windows and files. | S | Right-click and `Shift+F10` both open the menu. |
| FR-SHELL-10 | A first-run **Get started** card guides PIN setup, personalization and the palette. | C | The card tracks progress and can be dismissed permanently. |

### 4.4 Windows (FR-WIN)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| FR-WIN-01 | Windows can be **moved, resized** (8 handles), **minimized, maximized/restored, closed**. | M | Drag runs at 60 fps on a mid-range laptop. Minimum sizes come from the app manifest. |
| FR-WIN-02 | **Snap** by dragging to edges/corners, via the maximize-button flyout, or with `Alt+Arrow` keys. | M | Half, quarter, thirds and 2/3 + 1/3 layouts are supported. A preview overlay shows the target zone. |
| FR-WIN-03 | **Focus and z-order** are managed. The focused window is visually distinct, and `Alt+\`` cycles windows. | M | Clicking any part of a window focuses it. |
| FR-WIN-04 | Apps can **veto close** to protect unsaved work. | M | The Editor with unsaved changes shows a *Save / Don't save / Cancel* dialog. |
| FR-WIN-05 | The **layout is restored** after reload or unlock (setting on by default). | S | The same apps reopen with the same files and geometry. |
| FR-WIN-06 | On viewports < 768 px, windows are **full-screen** with bottom navigation and an app switcher. | M | Matches prototype 13. No horizontal scrolling. |
| FR-WIN-07 | An app crash is **contained** to its window, with Restart/Close options. | M | A thrown error in one app doesn't affect others (unit + e2e). |

### 4.5 File system and Files app (FR-FS)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| FR-FS-01 | Users can **create, rename, move, copy and delete** files and folders. | M | Name rules enforced (see Architecture § 7). Conflicts prompt *Replace / Keep both / Cancel*. |
| FR-FS-02 | Delete moves items to **Trash**. Users can restore or permanently empty. | M | Restore returns the item to its original folder, renaming on conflict. |
| FR-FS-03 | **Upload** from the host (picker or drag & drop) and **download** to the host. | M | Files over 25 MB are rejected with a clear message. |
| FR-FS-04 | **List and grid** views, sort by name/date/size/kind, multi-select (Shift/Ctrl), keyboard navigation. | M | Arrow keys, `Enter` (open), `F2` (rename), `Delete` (trash) and `Ctrl+A` all work. |
| FR-FS-05 | **Search** within a folder and globally (palette). | M | Matching is case-insensitive substring and fuzzy for the palette. |
| FR-FS-06 | **Open with**: default app per file type, plus a chooser. | M | `.md` opens in Editor by default and `.png` in Media Viewer. |
| FR-FS-07 | **Starred** and **Recent** virtual locations. | S | Recent shows the last 50 opened files. |
| FR-FS-08 | **Storage meter** shows usage against the profile quota and browser estimate. | S | It updates after writes. |

### 4.6 Apps (FR-APP)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| FR-APP-ED-01 | **Text Editor**: open/save text files, tabs, undo/redo, find & replace, line numbers, word wrap, word count. | M | `Ctrl+S` saves. The unsaved dot appears on the tab. |
| FR-APP-ED-02 | Editor supports **Markdown** helpers and Edit/Split/Preview modes (sanitized preview). | S | Toolbar buttons insert syntax. The preview updates within 100 ms. |
| FR-APP-ED-03 | Editor **autosaves drafts** for recovery after a crash or closed tab. | S | Reopening offers *Restore unsaved changes*. |
| FR-APP-TERM-01 | **Terminal** implements `help ls cd pwd cat echo mkdir touch rm mv cp clear date whoami history open theme du about` over the VFS, with `>`/`>>` redirection. | M | Each command has unit tests. Errors print POSIX-style messages. |
| FR-APP-TERM-02 | Terminal offers **tab completion**, **history** (↑/↓, persisted per profile) and multiple tabs. | S | Completion lists candidates when the input is ambiguous. |
| FR-APP-CAL-01 | **Calendar**: month/week/agenda views; create, edit and delete events (title, date, time, color, notes, reminder). | M | Events persist per profile. Today is highlighted. |
| FR-APP-CAL-02 | **Reminders** raise in-app notifications, plus OS notifications if the user grants permission. | S | A reminder fires within 1 minute of the scheduled time while WebOS is open. |
| FR-APP-CLK-01 | **Clock**: local time, world clocks (add/remove cities), timer and stopwatch. | M | Uses `Intl` time zones. The timer raises a notification on completion. |
| FR-APP-MED-01 | **Media Viewer**: view PNG, JPEG, WebP, GIF and SVG with zoom, fit, rotate, next/previous, filmstrip, slideshow and *Set as wallpaper*. | M | SVG is rendered only through `<img>` (no script execution). |
| FR-APP-MED-02 | Media Viewer renders **Markdown** files read-only with sanitization. | M | `<script>`, inline event handlers, `javascript:` URLs and remote images are stripped or blocked. |
| FR-APP-CALC-01 | **Calculator**: standard and scientific modes, keyboard input, history, copy result. | M | Correct operator precedence. Floating-point output is rounded to 12 significant digits. |
| FR-APP-SET-01 | **Settings**: Appearance, Desktop & Dock, Notifications, Profiles & Account, Privacy & Security, Storage & Backup, Keyboard shortcuts, Accessibility, Language & Region, About. | M | Every setting is persisted per profile and validated by schema. |
| FR-APP-SET-02 | **About** shows version, build SHA, licenses and a local diagnostics log with export. | S | The build SHA matches the deployed commit. |

### 4.7 Platform (FR-PLAT)

| ID | Requirement | Pri | Acceptance criteria |
|---|---|---|---|
| FR-PLAT-01 | **Installable PWA**, usable offline after first load. | M | With the network disabled, reload boots to the sign-in or profile screen and apps work. |
| FR-PLAT-02 | **Update prompt** when a new version is deployed. | M | The toast offers Reload and never auto-reloads with unsaved work. |
| FR-PLAT-03 | **Themes**: light, dark, system. Seven accent colors and built-in or uploaded wallpapers. | M | Matches prototypes 05/09/12. |
| FR-PLAT-04 | **Keyboard shortcuts** are listed in Settings and avoid browser-reserved combinations. | M | See [UX § 7](UX.md#7-keyboard-model). |

## 5. Non-functional requirements

| ID | Category | Requirement | Target / metric | Verification |
|---|---|---|---|---|
| NFR-PERF-01 | Performance | Initial load (cold, fast 4G, mid-tier device) | LCP ≤ 2.0 s; TTI ≤ 2.5 s | Lighthouse CI |
| NFR-PERF-02 | Performance | Shell JS entry size | ≤ 150 KB gzipped; each app chunk ≤ 60 KB gzipped | `check-bundle-size.mjs` in CI |
| NFR-PERF-03 | Performance | Interaction latency | Window drag 60 fps; palette results < 50 ms; app open < 300 ms (warm) | Playwright traces |
| NFR-PERF-04 | Performance | Unlock time (PBKDF2 600k) | ≤ 1.5 s on mid-tier laptop | Unit benchmark + manual |
| NFR-REL-01 | Reliability | No data loss on reload or crash | All writes transactional; drafts autosaved every 2 s | Unit + e2e (reload mid-edit) |
| NFR-REL-02 | Reliability | Offline operation | 100 % of v1 features work offline except Google sign-in | e2e with `context.setOffline(true)` |
| NFR-REL-03 | Reliability | Storage durability | Request `navigator.storage.persist()`; surface status | e2e + manual |
| NFR-A11Y-01 | Accessibility | Conformance | WCAG 2.2 AA | axe (0 serious/critical) + manual audit |
| NFR-A11Y-02 | Accessibility | Keyboard | Every feature operable without a pointer; visible focus | Keyboard-only e2e |
| NFR-A11Y-03 | Accessibility | Preferences | Honour reduced motion, contrast, forced colors; text scaling 85–150 % | e2e emulation |
| NFR-COMP-01 | Compatibility | Browsers | Last 2 versions of Chrome, Edge, Firefox, Safari (desktop + mobile) | Playwright Chromium (CI), Firefox/WebKit (nightly) |
| NFR-COMP-02 | Compatibility | Viewports | 360 px → 2560 px; touch and pointer | Responsive e2e at 390×844, 1024×768, 1440×900 |
| NFR-SEC-01 | Security | Content Security Policy | Strict CSP with no `unsafe-eval` and no inline scripts | e2e listens for `securitypolicyviolation` |
| NFR-SEC-02 | Security | Untrusted content | All Markdown/HTML sanitized; SVG only via `<img>` | Unit tests with XSS corpus |
| NFR-SEC-03 | Security | Encryption at rest | AES-GCM-256 with PBKDF2-SHA256 (≥ 600k iterations) for PIN profiles | Unit tests + review |
| NFR-SEC-04 | Security | Supply chain | Lockfile, `npm ci`, Dependabot, CodeQL, no high/critical advisories | CI gates |
| NFR-PRIV-01 | Privacy | No tracking | No analytics, ads or third-party requests except Google sign-in on demand | Network assertions in e2e |
| NFR-PRIV-02 | Privacy | Data minimization | Store only `sub`, name, email, avatar URL from Google; never tokens | Code review + unit test |
| NFR-PRIV-03 | Privacy | User control | Export and delete all data for a profile or account | e2e |
| NFR-MAINT-01 | Maintainability | Code quality | Strict TS, ESLint, Prettier; zero warnings in CI | CI |
| NFR-MAINT-02 | Maintainability | Test coverage | ≥ 80 % lines on `src/kernel` and `src/lib`; e2e for every Must-have FR | Vitest coverage + traceability table |
| NFR-MAINT-03 | Maintainability | Modularity | Import boundaries enforced; adding an app touches only `src/apps/<id>` + registry | ESLint rule + ADR |
| NFR-OPS-01 | Operability | Deployment | One-click/auto deploy on merge to `main`; rollback by re-running a previous deploy | GitHub Actions |
| NFR-OPS-02 | Operability | Traceability | Version + commit SHA visible in About | e2e |
| NFR-I18N-01 | Internationalisation | Locale readiness | All strings externalized; `Intl` for dates/numbers; logical CSS | Lint rule (no literal JSX strings in shell) |
| NFR-SCAL-01 | Scalability | Data volume | Smooth with 10k files / 1 GB per profile | Seeded perf test |

## 6. Traceability

These are the planned e2e specs, in `tests/e2e/`. Every **Must** requirement maps to at least one spec.

| Spec | Covers |
|---|---|
| `auth-local.spec.ts` | FR-AUTH-01, -03, -04, -05 |
| `auth-google.spec.ts` (mocked GIS) | FR-AUTH-02, -06 |
| `profiles.spec.ts` | FR-PROF-01 … -08 |
| `shell.spec.ts` | FR-SHELL-01 … -09, FR-PLAT-03 |
| `windows.spec.ts` | FR-WIN-01 … -07 |
| `files.spec.ts` | FR-FS-01 … -08 |
| `editor.spec.ts` | FR-APP-ED-* |
| `terminal.spec.ts` | FR-APP-TERM-* |
| `calendar-clock.spec.ts` | FR-APP-CAL-*, FR-APP-CLK-01 |
| `media.spec.ts` | FR-APP-MED-*, NFR-SEC-02 |
| `calculator.spec.ts` | FR-APP-CALC-01 |
| `settings.spec.ts` | FR-APP-SET-*, NFR-OPS-02 |
| `offline-pwa.spec.ts` | FR-PLAT-01, -02, NFR-REL-02 |
| `a11y.spec.ts` | NFR-A11Y-01 … -03 |
| `security.spec.ts` | NFR-SEC-01, NFR-PRIV-01 |
| `responsive.spec.ts` | FR-WIN-06, NFR-COMP-02 |

## 7. Glossary

| Term | Meaning |
|---|---|
| Account | An identity (local or Google) that owns profiles on this device |
| Profile | An isolated workspace (files, settings, apps) inside an account |
| DEK / KEK | Data-encryption key / key-encryption key (see Security § 6) |
| Focus Shell | The WebOS desktop layout: top bar, dock, command palette, workspaces |
| VFS | Virtual file system stored in IndexedDB |
