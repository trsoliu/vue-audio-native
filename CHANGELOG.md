# Changelog

All notable repository and package changes are recorded here. Package versioning and generated
package changelogs are managed by Changesets.

## Unreleased

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
- `vue-audio-native@1.x` now targets Vue 3 while preserving documented 0.x props, events, slots,
  component registration and `app.use()` behavior.

### Release boundary

- Source versions are prepared as `1.0.0-beta.1`; no npm publication is claimed by this file.
- Stable `1.0.0` remains blocked until iOS WKWebView, Android WebView and HarmonyOS ArkWeb smoke
  evidence is complete.
