# Migrating to Vue Audio Native 1.0

Version 1.0 targets Vue 3.3 or newer. Existing Vue 2 applications must pin the legacy line:

```bash
pnpm add vue-audio-native@legacy
```

The `legacy` npm tag will point to `0.1.41`; the 1.x runtime does not bundle Vue 2 compatibility.

## Existing Vue 3-compatible markup

The component name, default plugin and legacy surface remain valid:

```ts
import { createApp } from 'vue'
import VueAudioNative from 'vue-audio-native'
import 'vue-audio-native/style.css'

createApp(App).use(VueAudioNative).mount('#app')
```

```vue
<vue-audio-native
  url="/audio/example.mp3"
  size="small"
  :show-current-time="true"
  :show-controls="false"
  :show-volume="true"
  :show-download="true"
  :autoplay="false"
  :wait-buffer="true"
  download-name="example.mp3"
  hint="No audio"
  @on-change="onPlayingChange"
  @on-timeupdate="onTimeUpdate"
  @on-metadata="onMetadata"
  @on-audio-id="onAudioId"
>
  <template #slotTip>No audio</template>
</vue-audio-native>
```

## Recommended 1.x API

Prefer `tracks` for playlists and source fallback, or `src` for a single item. Non-empty `tracks`
wins over `src`, which wins over legacy `url`.

```vue
<script setup lang="ts">
import { VueAudioNative, type AudioTrack } from 'vue-audio-native'
import 'vue-audio-native/style.css'

const tracks: readonly AudioTrack[] = [
  {
    id: 'episode-1',
    title: 'Episode 1',
    sources: [
      { src: '/episode-1.ogg', type: 'audio/ogg' },
      { src: '/episode-1.mp3', type: 'audio/mpeg' },
    ],
  },
]
</script>

<template>
  <VueAudioNative
    :tracks="tracks"
    repeat-mode="all"
    media-session
    exclusive
    group="podcast"
    @statechange="snapshot => console.log(snapshot.state)"
  />
</template>
```

The package now ships independent CSS. Import `vue-audio-native/style.css`; consumers do not need
Tailwind and no Preflight or global utility classes are injected.

## Behavior changes

- Playback is event-driven; `readyState` polling and timer-based buffer checks are removed.
- Autoplay rejection is reported as `AUTOPLAY_BLOCKED` and leaves the controls usable.
- Invalid duration renders `--:--`; long media uses hour formatting.
- Multiple players are independent unless both `exclusive` and the same `group` are supplied.
- Media Session is opt-in.
- Waveforms render only supplied `peaks`; remote audio is never fetched for analysis.
- Engines missing the custom-control capability set fall back to native `<audio controls>`.
