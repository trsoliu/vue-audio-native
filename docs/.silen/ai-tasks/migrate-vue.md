---
id: migrate-vue
title: Migrate a consumer to Vue Audio Native 1.x
contractVersion: 1
mode: write
requiresExplicitAuthorization: true
references:
  - mcp:search
  - mcp:read
  - artifact:markdown-routes
---

# Migrate a consumer to Vue Audio Native 1.x

## Goal

Move a Vue 3 consumer to the typed 1.x API while preserving behavior, or keep a Vue 2 consumer on the
documented legacy line.

## Steps

1. Determine the consumer's Vue major, build system and currently used legacy props/events/slots.
2. Keep Vue 2 on `vue-audio-native@legacy`; do not install 1.x.
3. For Vue 3, import the standalone CSS and migrate incrementally from `url` to `src` or `tracks`.
4. Preserve behavior with focused consumer tests, including autoplay rejection and teardown.
5. Run the consumer's clean Vite or Nuxt build.

## Verification

1. Run the consumer's typecheck, focused player tests and production build.
2. Verify autoplay rejection, source changes and unmount cleanup in the target browser path.
3. Inspect the dependency lockfile and diff to confirm Vue 2 stayed on `legacy` or Vue 3 moved to 1.x.

## Stop conditions

Stop before dependency updates or source writes unless the user has explicitly authorized the
consumer migration.
