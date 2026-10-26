# Security policy

## Supported versions

| Version | Supported |
|---|---|
| Latest release on `main` (deployed to GitHub Pages) | ✅ |
| Older releases | ❌ (update to the latest; the PWA prompts automatically) |

## Reporting a vulnerability

Report vulnerabilities **privately** through GitHub: **Security → Report a vulnerability** (private vulnerability reporting) on this repository. **Don't** open a public issue.

Please include:
- affected version or commit;
- browser and OS;
- reproduction steps or proof of concept;
- impact.

**What to expect:**

| Step | Target |
|---|---|
| Acknowledgement | within 3 business days |
| Initial assessment and severity | within 7 days |
| Fix for high/critical issues | as fast as possible, typically within 30 days |
| Public advisory | after a fix is deployed, crediting you unless you prefer otherwise |

## Scope

- **In scope:** the WebOS web application, its build and deploy workflows, and documentation that affects security.
- **Out of scope:**
  - attacks requiring full control of the user's device or browser profile (see the documented limitations);
  - vulnerabilities in third-party services (report those to the vendor);
  - missing HTTP headers that GitHub Pages can't set (documented in [docs/SECURITY.md](docs/SECURITY.md#5-content-security-policy-and-browser-hardening)).

The security architecture and threat model are documented in [docs/SECURITY.md](docs/SECURITY.md).
