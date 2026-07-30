# Changelog

All notable repository and package changes are recorded here. Package versioning and generated
package changelogs are managed by Changesets.

## Unreleased

- No changes have been recorded after 1.0.1.

## 1.0.1 - 2026-07-30

- Published `@trsoliu/audio-core@1.0.1` and `vue-audio-native@1.0.1` through OIDC Trusted
  Publishing with provenance, then verified fresh Vite Vue and Nuxt SSR registry consumers.
- Corrected the stable npm installation guidance for core and Vue, and made Changesets keep package
  README version examples synchronized with every generated release.
- Restricted stable OIDC publication to an allowlisted Changesets version commit and repeated the
  live default-branch head check immediately before publishing.
- Preserved `vue-audio-native@legacy` at `0.1.41` and both prerelease lines on their existing `next`
  tags.
- Changed no runtime audio behavior from 1.0.0; the maintainer accepted the explicitly documented
  residual risk from unexecuted physical WebView device tests.

## 1.0.0 - 2026-07-30

- Published `@trsoliu/audio-core@1.0.0` and `vue-audio-native@1.0.0` with provenance, kept Vue 2 on
  `vue-audio-native@legacy`, and verified clean Vite, Nuxt, React and Next registry consumers.
- Accepted the maintainer's version-bound automated compatibility assessment for stable 1.0.0,
  while preserving unexecuted WebView rows as explicit residual risk instead of false test evidence.
- Replaced the device-only stable gate with an auditable dual-path gate: complete device evidence or
  an exact-version maintainer decision with automated assessment and risk acceptance.
- Published `@trsoliu/audio-core@1.0.0-beta.2` and `vue-audio-native@1.0.0-beta.3` through OIDC
  Trusted Publishing with provenance, then verified clean Vite, Nuxt, React and Next consumers.
- Added a mutually exclusive OIDC release path that waits until Changesets records every retained
  beta changeset for a publishable package as consumed, binds publication to an ancestor-verified
  versioning push, supports an exact-SHA-bound default-branch recovery after a failed release run,
  reconfirms the live remote branch immediately before publication,
  tolerates multi-commit rebase merges, and verifies exact `next` tags before
  treating registry versions as complete while retrying transient registry failures; stable
  publication still requires the documented evidence gate.
- Expanded the Vue and audio-core API references with every public option, event payload, snapshot
  state, error code, command, slot, Bridge event and npm README usage contract; also corrected the
  headless Vue template ref example and clarified that low-level controller values come from
  `@trsoliu/audio-core`.
- Kept volume and playback-rate snapshots finite when integrations pass `NaN` or infinite values,
  and limited conflicting-input migration warnings to development builds.
- Fixed WebView Bridge teardown so removing an adapter happens before a simultaneous source switch.
- Pinned publishable packages to the official npm registry so local mirror settings cannot redirect a release.
- Added a manual, gated GitHub Actions bootstrap for the first npm beta using a short-lived
  environment secret before permanent migration to OIDC Trusted Publishing.
- Included hidden Silen output in the GitHub Pages artifact so the public Agent Contract under
  `.well-known/silen` is deployed with the documentation site.
- Made the beta bootstrap tolerate npm registry propagation delays and the registry-required
  `latest` alias on a new package that has no stable version; `next` remains the prerelease channel.
- Added a machine-enforced stable-release device gate and pinned every action in the privileged
  Trusted Publishing workflow to an immutable commit.
- Fixed the published Vue declaration bundle so strict TypeScript consumers can resolve component
  props, events, slots and exposed controls without private `__VLS_*` compiler symbols.
- Retired the short-lived token bootstrap workflow after beta publication, clean registry-consumer
  verification and Vue 2 `legacy` tag finalization; permanent releases use OIDC only.
- Configured npm Trusted Publishers for core, Vue and React against their exact `release.yml`
  workflows and protected `npm` environments.
- Fixed Changesets release versioning to refresh the pnpm lockfile after coordinated core and Vue
  package version updates, keeping generated release PRs installable with `--frozen-lockfile`.

### Added

- Typed, framework-independent `@trsoliu/audio-core` controller and public state contract.
- Vue 3 component, plugin, composable, playlist, source fallback, Media Session, exclusive groups,
  protocol-neutral WebView Bridge and structured errors.
- shadcn-vue Demo, browser capability lab, Vite/Nuxt fixtures and five-project Playwright matrix.
- Silen documentation site, project map, deterministic AI retrieval checks, public Agent Contract,
  `llms.txt` artifacts and GitHub Pages deployment.

### Changed

- Replaced Vue CLI, Babel, Node Sass and polling playback logic with pnpm, Turborepo, Vite and
  event-driven TypeScript.
- Hardened media-event precedence so a late `canplay` cannot overwrite `paused`, while active
  buffering returns to `playing` without waiting for a second framework update.
- Made package-content validation accept both npm 11 and npm 12 `npm pack --json` report shapes.
- `vue-audio-native@1.x` now targets Vue 3 while preserving documented 0.x props, events, slots,
  component registration and `app.use()` behavior.

### Release boundary

- `@trsoliu/audio-core@1.0.0-beta.1`, `vue-audio-native@1.0.0-beta.1` and
  `react-audio-native@1.0.0-beta.1` and the corrected `vue-audio-native@1.0.0-beta.2` are published.
- Stable `1.0.0` is authorized by the recorded maintainer assessment and remains subject to the
  complete automated, registry-consumer and OIDC publication gates.

### Security

- Updated transitive development tooling away from vulnerable `ini` and `@hono/node-server`
  versions; published player tarballs remain isolated from documentation dependencies.
