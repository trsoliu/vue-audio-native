# ADR 0001: Modernize Audio Native as a shared core with framework adapters

- Status: accepted
- Date: 2026-07-29
- Decider: trsoliu

## Context

The published package is based on Vue 2, Vue CLI 3, TypeScript 3.2, Node Sass,
mouse-only interactions, and an install graph that depends on itself. The old
lockfile no longer installs with a clean `npm ci`, so it cannot provide a
reliable development baseline on current Node.js.

## Decision

Keep the original repository and history, replace its implementation with a
pnpm/Turborepo workspace, and publish a framework-independent
`@trsoliu/audio-core` used by Vue 3 and React adapters. Vue 2 remains available
as `vue-audio-native@legacy`; version 1.x supports Vue 3 and preserves the
documented legacy props, events, component name, and plugin install surface.

The React adapter lives in the separate public `trsoliu/react-audio-native`
repository. Demo-only UI may use shadcn, but published player packages may not
depend on shadcn, Radix, Reka, Sonner, or Tailwind Preflight.

## Consequences

- Audio state and browser behavior are implemented once and contract-tested.
- Vue and React packages remain small and SSR-safe.
- IE11 and Vue 2 are not supported by the 1.x runtime.
- Stable publication requires registry smoke tests and real WebView evidence.
