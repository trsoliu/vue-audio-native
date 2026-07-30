---
'@trsoliu/audio-core': patch
'vue-audio-native': patch
---

Publish complete npm API and Events references, including option defaults, callback payloads,
snapshot states, structured errors, command behavior, Bridge events, and correct Vue headless ref
usage. Keep volume and playback-rate state finite for invalid numeric input, and keep conflicting
input warnings out of production builds.
