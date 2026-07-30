# Agent guide

This file is the authoritative repository contract for AI coding agents. Human instructions in the
active task always take precedence. Keep changes reviewable, bounded to this repository, and backed
by current tests.

## Read first

1. Read `README.md`, `DESIGN.md`, `docs/project-map/index.mdx` and the relevant ADR.
2. For documentation work, read the installed Silen contract at
   `@aicode-nexus/silen/agent/manifest.json`; the deployed contract is generated at
   `/vue-audio-native/.well-known/silen/manifest.json`.
3. Inspect the existing diff before editing. Never discard unrelated user changes.

## Architecture

- `packages/audio-core`: framework-free browser media state, capability detection, coordination,
  Media Session and WebView Bridge contracts.
- `packages/vue-audio-native`: Vue 3 adapter, component, plugin, composable, styles and legacy API
  compatibility.
- `apps/demo-vue`: shadcn-vue product Demo; Demo UI dependencies must not enter published packages.
- `apps/compatibility-lab`: UA-independent device and WebView probe.
- `fixtures/vite-vue` and `fixtures/nuxt`: consumer and SSR build evidence.
- `docs`: Silen source, project map, ADRs, compatibility policy and public AI knowledge base.

The public audio state contract lives in `@trsoliu/audio-core`. Framework adapters translate that
contract; they must not fork playback behavior.

## Non-negotiable behavior

- Use TypeScript for source, tests, scripts and configuration. JSON, CSS, Vue templates, Markdown
  and static assets are the intentional exceptions.
- Drive playback from standard media events. Do not add ready-state polling or persistent timers.
- Detect capabilities, not user agents. Unsupported custom controls fall back to native audio
  controls.
- Keep import-time code SSR safe; never create media or DOM objects during module evaluation.
- Preserve the documented Vue legacy props, events, component name, slots and plugin install path.
- Keep `AUTOPLAY_BLOCKED` recoverable and map media failures to structured public errors.
- Keep instances independent unless both `exclusive` and the same `group` are set.
- Keep Media Session opt-in and the host Bridge protocol-neutral.
- Never fetch audio to derive peaks. Render only caller-provided waveform data.
- Use Lucide for package and Demo icons. shadcn-vue/Reka/Tailwind belong only to Demo workspaces.
- Published CSS must contain no Tailwind Preflight, global utilities, OKLCH or `color-mix()` output.
- Do not edit generated `dist`, `coverage`, `.nuxt`, `.output`, `.silen/dist` or dependency folders.

## Required workflow

For behavior changes, add or update a failing regression test before implementation. Then run the
smallest relevant test followed by the release gates:

```bash
pnpm security:audit
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build
pnpm docs:build
pnpm docs:index
pnpm docs:audit
pnpm docs:eval
pnpm test:pack
pnpm test:e2e
```

Core coverage must remain at least 90% for statements/functions/lines and 85% for branches. The Vue
adapter must remain at least 85% and 80% respectively. Package checks must keep core under 8 KB gzip,
component JavaScript under 25 KB gzip and CSS under 12 KB gzip.

## Documentation and change records

- Update `CHANGELOG.md` and add a Changeset for user-visible package behavior.
- Update `docs/project-map/index.mdx` when workspace boundaries or ownership change.
- Update compatibility, migration, release or device-smoke pages when their contracts change.
- Run `pnpm docs:build`, `pnpm docs:audit` and `pnpm docs:eval` after documentation edits.
- Keep Silen as a root development dependency and `docs` as a content directory rather than a pnpm
  workspace; otherwise its dependency links become public Markdown routes.
- Keep the isolated Silen SSR plugin in `docs/.silen/config.ts`; it prevents ancestor
  `node_modules` from introducing a second React runtime during static rendering.
- `pnpm docs:mcp` is read-only. Do not add `--allow-write` without explicit user authorization.
- Public Agent Contract files must not contain secrets, private endpoints, local absolute paths or
  unpublished operational data.

## Release safety

- Publish `@trsoliu/audio-core` before the matching Vue and React versions.
- Verify npm ownership for the existing `vue-audio-native` name; never silently rename it.
- Prereleases use the `next` dist-tag. Vue 2 remains on `0.1.41` via `legacy` before stable release.
- Stable publication requires either complete device rows or the explicit, version-bound maintainer
  assessment defined in `docs/device-smoke.md`; never infer or fabricate either path.
- Stable publishing uses GitHub Actions OIDC Trusted Publishing and provenance.
- Never commit credentials, npm tokens, registry auth, device recordings or local filesystem paths.

## Git

Use focused commits on `codex/*` branches. Do not force-push, rewrite published history, bypass a
failed gate, or merge before required CI checks are green.
