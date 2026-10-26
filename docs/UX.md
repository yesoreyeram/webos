# WebOS UX and design system

> Visual reference: [prototype gallery](prototypes/README.md). Token values in this document match `docs/prototypes/src/shared/proto.css`. They become `src/styles/tokens.css` in the app.

## 1. Design principles

1. **Familiar first.** Use patterns people already know: windows with right-side controls, a dock, a top status bar, right-click menus. No learning curve for the basics.
2. **Calm by default.** Neutral surfaces, one accent color, soft depth, generous whitespace. Color carries meaning (state, app identity), never decoration alone.
3. **Fast for experts.** Everything is reachable from the keyboard. The command palette (`Ctrl/⌘ K`) finds apps, files, actions and settings from anywhere.
4. **Spatially stable.** Things don't jump around. Windows reopen where you left them, and snap layouts make tidy arrangements one gesture away.
5. **Private and honest.** Show where data lives ("Stored on this device"), what's encrypted (lock badges), and what can't be recovered (forgotten PIN).
6. **Accessible to all.** WCAG 2.2 AA, visible focus, motion that respects preferences, text that scales.

## 2. Shell anatomy ("Focus Shell")

| Region | Contents | Prototype |
|---|---|---|
| **Top bar** (38 px, frosted glass) | Brand menu · workspace switcher with window counts · universal search trigger (`Ctrl K`) · save status · notifications · quick settings · date/time · profile menu | 05 |
| **Desktop** | Wallpaper · optional icons · *Today* widgets (clock + world times, agenda, recent files) · first-run *Get started* card | 04 |
| **Windows** | 42 px title bar (app tile, title, context, controls) · optional toolbar · content · 28 px status bar | 05, 09–11 |
| **Dock** (floating, centered) | Launcher · pinned apps with running dots (focused = accent pill) · separator · Trash; tooltips with shortcuts | 04, 05 |
| **Overlays** | Command palette · launcher · quick settings + notifications panel · context menus · dialogs · toasts | 06–08 |
| **Pre-desktop** | Sign-in · profile picker · lock screen | 01–03 |
| **Narrow screens** | Full-screen apps · bottom navigation · app switcher | 13 |

The shell combines the **clarity of a top status bar** (macOS), the **familiarity of a centered dock/taskbar with window controls on the right** (Windows 11/ChromeOS), and the **speed of a command palette and workspaces** (developer tools, GNOME). Each element has one job:
- the top bar handles *system and context*;
- the dock handles *apps*;
- the palette handles *everything, fast*.

## 3. Design tokens

### 3.1 Color

| Token | Light | Dark | Use |
|---|---|---|---|
| `--surface-0` | `#f4f6f9` | `#0d0f14` | Page background behind wallpaper |
| `--surface-1` | `#ffffff` | `#17191f` | Window content, cards |
| `--surface-2` | `#f7f8fa` | `#1c1f26` | Sidebars, status bars |
| `--surface-3` | `#eef0f4` | `#252932` | Hover, tracks, segmented background |
| `--border` | `#e4e7ec` | `#2a2e37` | Dividers, card borders |
| `--border-strong` | `#d0d5dd` | `#363b46` | Inputs, buttons |
| `--text-1` | `#101828` | `#eceef3` | Primary text |
| `--text-2` | `#475467` | `#a8b0bf` | Secondary text |
| `--text-3` | `#667085` | `#858d9c` | Tertiary, placeholders (still ≥ 4.5:1 on surfaces) |
| `--accent` | `#2563eb` | `#2f6fed` | Primary buttons, selection fills, focus (white text ≥ 4.5:1) |
| `--accent-text` | `#1d4ed8` | `#8cb3ff` | Accent-colored text and icons on surfaces |
| `--accent-soft` | `#eaf1fe` | `rgba(79,139,255,.16)` | Selected rows, active nav |
| `--success` / `--warning` / `--danger` | `#12b76a` / `#f79009` / `#e5484d` | same | Status |
| `--glass-bg` | `rgba(255,255,255,.72)` | `rgba(22,24,30,.66)` | Top bar, dock, panels (`backdrop-filter: saturate(180%) blur(24px)`) |

- **Accent options:** Blue `#2563eb` (default), Violet `#7c3aed`, Teal `#0d9488`, Green `#16a34a`, Orange `#ea580c`, Rose `#e11d48`, Graphite `#475467`. Each ships light and dark variants that meet 4.5:1 contrast for text on `--accent`.
- **App identity gradients** (dock tiles):

| App | Gradient | Icon |
|---|---|---|
| Files | `#60a5fa → #2563eb` | folder |
| Text Editor | `#a78bfa → #6d28d9` | notebook-pen |
| Terminal | `#475569 → #0f172a` | square-terminal |
| Calendar | `#fb7185 → #e11d48` | calendar-days |
| Clock | `#5eead4 → #0f766e` | clock |
| Media Viewer | `#f0abfc → #c026d3` | image |
| Calculator | `#fdba74 → #ea580c` | calculator |
| Settings | `#cbd5e1 → #64748b` | settings |

### 3.2 Typography

- **Families.** Inter (UI) and JetBrains Mono (code, terminal), both self-hosted variable WOFF2.

| Role | Size / line height | Weight |
|---|---|---|
| Display (lock clock) | 104 / 1.0 | 600 |
| Title XL (hero) | 32–46 / 1.1 | 700 |
| Title (page h1) | 22–24 / 1.25 | 700 |
| Heading (section) | 15–16 / 1.4 | 600 |
| Body (default UI) | 13 / 1.45 | 400–500 |
| Small (meta, status) | 12 / 1.4 | 400–500 |
| Caption / label (uppercase, 0.04em) | 11 / 1.3 | 600 |
| Mono (editor, terminal) | 12.5 / 22 px | 400 |

Inter features `cv11` and `ss03` give a cleaner single-storey "a" and rounded quotes. Tabular numerals are used for clocks and file sizes.

### 3.3 Spacing, radius, elevation, motion

- **Spacing:** 4 px grid (4, 6, 8, 10, 12, 16, 20, 24, 32).
- **Radius:**
  - `xs` 4: badges, code;
  - `sm` 6: window controls;
  - `md` 8: segmented, menus;
  - `lg` 12: windows, cards;
  - `xl` 16: panels, widgets;
  - `2xl` 20+: dock, sign-in card;
  - pills 999.
- **Elevation:**

| Level | Use |
|---|---|
| `shadow-1` | Buttons, rows |
| `shadow-2` | Chips, popovers |
| `shadow-3` | Panels, flyouts |
| `shadow-window` | Focused window (inactive windows use a lighter shadow) |
| `shadow-overlay` | Palette, launcher |

- **Motion:**
  - 120 ms for hover and press, 160–200 ms for open/close (scale 0.98 → 1 + fade), 220 ms for snapping, `cubic-bezier(.2,.8,.2,1)`.
  - `prefers-reduced-motion` turns everything into opacity-only fades of 0–80 ms.

## 4. Components (UI kit)

- **Actions:** Button (primary, secondary, ghost, danger; sm/md/lg; icon-only), ButtonGroup, IconButton, Segmented control, Chip/filter chip, Switch, Checkbox, Radio, Slider, Select/Combobox, Text input/search, Kbd, Badge, Avatar, Tooltip.
- **Containers:** Window frame, Toolbar, Sidebar nav, Tabs, Status bar, Card, Panel, Dialog (alert/confirm/form), Menu/context menu, Toast, Empty state, Skeleton, Progress bar/meter.
- **Data:** ListView/Table (sortable, selectable, virtualized), Grid view, Breadcrumb, Tree.

Every component has keyboard behavior, ARIA roles, and light/dark states documented in Storybook-style stories, delivered as component tests in v1.

## 5. Interaction patterns

| Pattern | Behaviour |
|---|---|
| **Launching** | Dock click, launcher, palette, desktop icon (double-click), `Alt 1–7`, file "Open with". A running single-instance app is focused instead of relaunched |
| **Window controls** | Minimize · maximize/restore (hover = Snap layouts flyout) · close. Double-click title bar toggles maximize |
| **Snapping** | Drag to edge/corner shows a preview (accent-tinted, 2 px outline) and snaps on release. `Alt + arrows` does the same from the keyboard. Snapped windows have 8 px gaps |
| **Command palette** | Opens instantly, preselects the best match, groups results, scope chips, `Tab` for secondary actions, `>` for commands. Remembers recent queries per profile |
| **Notifications** | Toast bottom-right (5 s, pauses on hover). Persisted in the center. DND suppresses toasts but keeps the badge count |
| **Destructive actions** | Prefer **undo** over confirmation ("Moved to Trash · Undo"). Confirm only for irreversible actions (empty Trash, delete profile/account, remove PIN) using an explicit verb ("Delete profile"), never "OK" |
| **Empty states** | Icon + one sentence + primary action ("No files yet · Upload files") |
| **Errors** | Say what happened, why, and what to do next, in plain language. No error codes without context |
| **Loading** | Skeletons for content > 150 ms; spinners only inside buttons |
| **Drag and drop** | Files between folders/windows/desktop; upload from the OS onto Files or desktop; drop targets highlight |
| **Selection** | Click, Shift-range, Ctrl/⌘-toggle, rubber-band on desktop and grid view |

## 6. Content style

- Use sentence case everywhere ("Snap layouts", not "Snap Layouts").
- Use verbs on buttons ("Save", "Move to Trash", "Continue setup").
- Keep it short: 1 line for descriptions, ≤ 2 for help text.
- Use second person and a friendly, plain tone ("Your files stay on this device.").
- Dates are relative when recent ("Today, 10:41", "Yesterday") and absolute otherwise ("22 Oct"), always via `Intl`.

## 7. Keyboard model

Shortcuts avoid browser-reserved combinations (`Ctrl+W/T/N/Tab`, `Alt+F4`, `Cmd+Q`). On macOS, `Ctrl` reads as `⌘` and `Alt` as `⌥`.

| Action | Shortcut |
|---|---|
| Command palette | `Ctrl K` |
| Launcher | `Ctrl Space` (or click the dock button) |
| Open dock app *n* | `Alt 1–7` |
| Cycle windows | ``Alt ` `` (backtick); `Shift` reverses |
| Snap left / right / maximize / restore | `Alt ←` / `Alt →` / `Alt ↑` / `Alt ↓` |
| Minimize / close window | `Alt M` / `Alt Q` |
| Next / previous workspace | `Ctrl Alt →` / `Ctrl Alt ←` |
| Move window to next workspace | `Ctrl Alt Shift →` |
| Lock profile | `Ctrl Alt L` |
| Toggle dark mode | `Ctrl Alt D` |
| Cycle regions (top bar → desktop/windows → dock) | `F6` |
| Context menu | `Shift F10` / `Menu` key |
| Show shortcuts | `Ctrl /` |

All shortcuts are listed and rebindable in **Settings → Keyboard shortcuts**.

## 8. Responsive behaviour

| Breakpoint | Layout |
|---|---|
| ≥ 1280 px | Full Focus Shell; Today widgets visible when no window overlaps |
| 1024–1279 px | Widgets collapse into the clock popover; snap layouts limited to halves/quarters |
| 768–1023 px (tablet) | Top bar condenses (search icon only); windows default to maximized; dock icons 40 px |
| < 768 px (phone) | Full-screen apps, bottom navigation (4 apps + launcher), swipe-up app switcher, FAB for primary action |

Touch targets are ≥ 44 × 44 px on touch devices, regardless of visual size.

## 9. Accessibility checklist (per screen)

- [ ] All interactive elements reachable by `Tab`/arrow keys in a logical order; focus visible (3 px accent ring)
- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI components) in both themes and with transparency disabled
- [ ] Icons have accessible names; decorative icons are `aria-hidden`
- [ ] Windows have labelled regions; dialogs trap focus and restore it on close
- [ ] Live region announces window/app changes and notifications
- [ ] No information conveyed by color alone (running dot + tooltip "running"; lock icon + text "PIN")
- [ ] Respects reduced motion, increased contrast, forced colors; works at 200 % zoom without loss
