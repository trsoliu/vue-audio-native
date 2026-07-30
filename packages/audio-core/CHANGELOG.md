# @trsoliu/audio-core

## 1.0.0

### Major Changes

- c02e6fe: Introduce the typed framework-independent audio controller and the Vue 3 player, while preserving
  the documented Vue component name, plugin install path, legacy props, legacy events and slots.
  WebView host bridges are protocol-neutral and can be detached without receiving later source or
  state events.
  Package publication is pinned to the official npm registry.

### Patch Changes

- a8cc79d: Publish complete npm API and Events references, including option defaults, callback payloads,
  snapshot states, structured errors, command behavior, Bridge events, and correct Vue headless ref
  usage. Keep volume and playback-rate state finite for invalid numeric input, and keep conflicting
  input warnings out of production builds.

## 1.0.0-beta.2

### Patch Changes

- a8cc79d: Publish complete npm API and Events references, including option defaults, callback payloads,
  snapshot states, structured errors, command behavior, Bridge events, and correct Vue headless ref
  usage. Keep volume and playback-rate state finite for invalid numeric input, and keep conflicting
  input warnings out of production builds.
