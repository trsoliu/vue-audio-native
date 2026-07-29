# vue-audio-native

Typed Vue 3 audio player for browsers and embedded WebViews, with modern and legacy-compatible APIs.
Vue `>=3.3 <4` is a peer dependency.

```ts
import { createApp } from 'vue'
import VueAudioNative from 'vue-audio-native'
import 'vue-audio-native/style.css'

createApp(App).use(VueAudioNative).mount('#app')
```

```vue
<VueAudioNative
  :tracks="tracks"
  repeat-mode="all"
  :media-session="true"
  @statechange="snapshot => console.log(snapshot.state)"
/>
```

The legacy `url`, display props, `on-*` events, `slotTip`, component name, and
`app.use()` registration remain available in version 1.x. Vue 2 projects should
install `vue-audio-native@legacy`.

## Exports

- `VueAudioNative` and alias `AudioPlayer`
- default Vue plugin for `app.use()`
- `useAudioPlayer()` headless composable
- `detectAudioCapabilities()`
- all controller, track, snapshot, bridge and error types from `@trsoliu/audio-core`

The component exposes `AudioPlayerHandle` through template refs. Inputs resolve in this order:
non-empty `tracks`, then `src`, then legacy `url`.

## Styling

Import `vue-audio-native/style.css`. It is standalone compiled CSS with no Tailwind Preflight,
global utilities, shadcn, Reka or other UI runtime. Theme the player with:

```css
.audio-native {
  --audio-native-background: #0b0f14;
  --audio-native-foreground: #f5f7fa;
  --audio-native-muted: #9aa4b2;
  --audio-native-border: #303846;
  --audio-native-accent: #70f37c;
  --audio-native-accent-foreground: #061008;
}
```

See the repository migration guide for the complete legacy mapping and behavior changes.
