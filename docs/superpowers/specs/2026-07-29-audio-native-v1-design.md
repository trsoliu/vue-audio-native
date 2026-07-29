# Audio Native 1.0 Design

## Goal

Deliver stable Vue 3 and React audio players backed by the same TypeScript
controller, with modern package exports, accessible controls, responsive demos,
legacy Vue API compatibility, and verified browser/WebView degradation.

## Architecture

`@trsoliu/audio-core` owns the media state machine, source fallback, playlist,
repeat, errors, Media Session, and instance coordination. Framework adapters
render the media element and controls, subscribe to immutable snapshots, and
translate framework props/events into the shared controller contract.

The Vue repository contains the core, Vue package, Vue demo, and compatibility
fixtures. The React package and React demo are maintained in a separate public
repository and consume the published core package.

## Compatibility

Vue 1.x supports Vue 3.3 or newer. It keeps the legacy `url`, visibility props,
event names, `slotTip`, default plugin export, and `vue-audio-native` component
name. Vue 2 consumers remain pinned to the immutable 0.1.41 release line.

The browser build targets ES2019. The supported baseline is Chromium 96,
Firefox 115, and Safari/iOS 15.6. Older engines receive native-controls
degradation where possible; IE11 is excluded.

## Visual system

The player uses compiled Tailwind utilities, Lucide icons, semantic CSS custom
properties, pointer and keyboard input, and no global reset. Demos use shadcn
source components locally with Nova/Neutral styling; shadcn is excluded from
published package graphs.

## Release

Publish beta packages under `next`, validate clean registry consumers and real
WebViews, assign 0.1.41 to `legacy`, then promote 1.0.0 to `latest` with GitHub
releases and npm provenance.
