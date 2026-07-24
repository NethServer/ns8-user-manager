# CLAUDE.md

This file provides guidance to AI agents when working with code in this repository.

## What this is

Frontend for managing users and groups of an AD or LDAP domain provisioned in NS8 (NethServer 8). It is a standalone Vue 3 SPA served by the `users-admin` module; it talks to a backend HTTP API (`api-moduled`) over `axios`. There is no backend code in this repo.

This repo is not deployed standalone — it's built as a release tarball and pulled into the `ns8-openldap` and `ns8-samba` module images at their build time (`build-images.sh` downloads `ns8-user-manager-<version>.tar.gz` and unpacks it under `imageroot/api-moduled/public`). See [ns8-samba/build-images.sh](https://github.com/NethServer/ns8-samba/blob/main/build-images.sh) and [ns8-openldap/build-images.sh](https://github.com/NethServer/ns8-openldap/blob/main/build-images.sh). Bumping the version here (via release-please, see Conventions below) doesn't take effect downstream until those modules' `build-images.sh` is updated to point at the new release tag.

## Commands

All development runs inside a podman container — no local Node install needed. `dev.sh` wraps podman; anything after it runs in the container.

```shell
./dev.sh                 # build dev image if missing, run vite dev server on http://localhost:5173 (hot reload)
./dev.sh build           # force-rebuild the dev container image
./dev.sh preview         # build prod bundle and serve it (npm run preview)
./dev.sh bash            # shell into the container
./dev.sh npm run lint    # run any npm script in the container
./dev.sh npm run lint-fix
./dev.sh npm run type-check
./build.sh               # production build → dist/ (isolated podman build, multi-stage Containerfile)
```

`npm run build` = type-check (`vue-tsc`) + `vite build` in parallel. There is **no test suite** and no test runner configured. Lint (`eslint .`), Prettier, and conventional-commit title checks run in CI (`.github/workflows/ci.yml`) on every PR.

Node version is pinned in `.nvmrc` (used by CI and the Containerfile base image).

## Dev setup gotchas

- **Server side:** the target NS8 `api-moduled.service` must run with `Environment=GIN_MODE=debug` (not `release`) to bypass CORS. File: `/etc/systemd/user/api-moduled.service`; after editing run `systemctl --user daemon-reload && systemctl --user restart api-moduled` as the module user.
- **Client side:** copy `.env.development.example` → `.env.development` and set `VITE_ENDPOINT` to the module URL (`https://<ns8-host>/users-admin/<domain>`). This becomes the axios `baseURL`.
- **`config.json`** is a *runtime* file (not bundled), read from the server root at startup — see Runtime config below.

## Architecture

**Stack:** Vue 3 (`<script setup>`) + Vite + TypeScript + Pinia + Tailwind v4 + vue-i18n + vue-router. UI components come from `@nethesis/vue-components` (prefixed `Ne*`) — prefer these over hand-rolled components. Path alias `@` → `src/`.

**Auth & authorization (the core model):**
- `src/composables/useAuth.ts` is the single source of truth. Login (`POST /api/login`) returns a JWT; token, expire, uid, and `scopes` are persisted in `localStorage`. `previouslyLogged` gates routes and also checks token expiry.
- **Scopes drive access:** an empty `scopes` array means a full admin (can reach the User Manager view). A **non-empty** scope array means a self-service (`selfadm`) user restricted to their own account. Note the inversion — the backend omits `scope` from the JWT claims when the user has full access, so empty = admin.
- `src/router.ts` enforces this: `/users` (`user_manager`) redirects non-admins back to `/user/account`; root redirects unauthenticated users to `/login`. Uses **hash history** (`createWebHashHistory`) because the module is served from a subpath.

**Axios setup (`src/main.ts`):** `baseURL` from `VITE_ENDPOINT` (falls back to `./`), 5s timeout, request interceptor injects `Bearer` token. Two response interceptors: the first **rewrites every error `.message` into an i18n key** (e.g. `errors.forbidden`, `errors.network`) so components can pass `error.message` straight to `t()`; the second auto-logs-out and redirects to `/login` on 401. When adding error handling, rely on these — don't re-map HTTP status codes in components.

**Data fetching:** composables under `src/composables/` (`useUsers`, `useGroups`, `usePasswordPolicy`) own their own `loading`/`error`/`data` refs and fire the request on call. They call `axios.post('/api/...')`. Reusable API response shapes live in `src/lib/axiosHelpers.ts` (`BaseResponse`).

**State:** Pinia stores in `src/stores/` are for cross-component app state only — `config` (runtime config.json) and `notifications` (toast engine, id-keyed Map; render via `NotificationHandler.vue`). Per-view data stays in composables.

**Validation:** `src/lib/validation.ts` — `MessageBag` (a `Map<string, string[]>`) collects field errors; `getFirstMessage(key)` returns the first message per field, i18n-key friendly.

**Views vs components:** `src/views/` are routed pages (`LoginView`, `UserAccount`, `UserManager`, `BaseTemplate` is the authed layout shell with sidebar). `src/components/` are the pieces — list/drawer/modal per entity (`CreateUserDrawer`, `EditGroupDrawer`, `DeleteUserModal`, etc.). CRUD uses side drawers (`SideDrawer.vue`) for create/edit and modals for delete.

**i18n:** `src/i18n/{en-US,it-IT}.json`, loaded at build via `@intlify/unplugin-vue-i18n`. Locale defaults to `navigator.language`, fallback `en-US`. Translations are managed on Weblate — edit `en-US.json` as the source; don't hand-edit other locales unless necessary.

## Runtime configuration

After build, a `config.json` placed next to `index.html` (fetched via `GET /config.json` in `src/stores/config.ts`) sets:
- `domain` — shown on login and top-right;
- `services` — string array, rendered (after i18n translation) as a bullet list on the account page;
- `schema` — `'ad'` or `'rfc2307'`, the directory backend type (some fields/behavior differ by schema).

In dev, put this file in the module's `public` folder on the server (e.g. `/home/<domain>/.config/api-moduled/public/config.json`).

## Conventions

- Commits follow **Conventional Commits** (enforced by commitlint + Husky and CI). Releases are automated by **release-please** on merge to `main` (bumps version, updates `CHANGELOG.md`); `publish.yml` attaches the built tarball to the GitHub release. Do not bump `package.json` version or edit `CHANGELOG.md` manually.
- Prettier config: no semicolons, single quotes, width 100, no trailing commas; i18n JSON uses 4-space indent. Imports are auto-organized by `prettier-plugin-organize-imports`.
- Licensed GPL-3.0-or-later.
