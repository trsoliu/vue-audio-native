# Design boundaries

Vue Audio Native is split into a framework-independent browser audio core and a thin Vue 3
adapter. The public state contract belongs to `@trsoliu/audio-core`; framework integrations must
translate that contract instead of creating their own playback state machines.

## Ownership

- `@trsoliu/audio-core` owns media events, source fallback, playlists, repeat behavior, buffered
  ranges, structured errors, capability detection, exclusive groups, Media Session and the
  protocol-neutral WebView Bridge.
- `vue-audio-native` owns Vue lifecycle integration, legacy Vue API translation, component events,
  slots, exposed controls, accessible markup and package styling.
- Demo workspaces own shadcn-vue, Reka, Tailwind, Sonner and presentation-only assets. None of those
  dependencies may enter a published package.

## Runtime rules

- Playback state is driven by standard media events. The implementation does not poll
  `readyState`, keep background timers or inspect user-agent strings.
- Importing either package is SSR safe. DOM and media objects are used only after a real
  `HTMLAudioElement` is attached by the framework adapter.
- Unsupported custom-control capabilities fall back to native audio controls. Media Session and
  host Bridge integration are explicit opt-ins.
- Multiple players are independent unless both `exclusive` and an identical `group` are set.
- Waveforms render caller-provided peaks only; packages do not fetch or decode audio to derive
  waveform data.

## Public and compatibility surfaces

- Vue 1.x targets Vue 3 while retaining the documented 0.x props, events, component name, slots and
  plugin installation path. Vue 2 remains available from `vue-audio-native@legacy`.
- `@trsoliu/audio-core` is the shared contract consumed by the separate React adapter repository.
  Matching releases use exact prerelease versions and are published core → Vue → React.
- React Native native SDKs, recording, DRM, transcoding, automatic waveform extraction and bundled
  HLS engines remain outside the 1.0 scope.

## Distribution boundaries

Published packages contain ESM, CommonJS, declarations and standalone CSS. The Vue package also
provides its documented browser bundle. Package CSS excludes Tailwind Preflight, global utilities,
OKLCH and `color-mix()` output. Stable publication requires registry-consumer verification plus
either complete WebView smoke evidence or a version-bound maintainer assessment that explicitly
accepts the remaining device risk.
