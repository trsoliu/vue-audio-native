# @trsoliu/audio-core

Typed, framework-independent control for the browser `HTMLAudioElement`.

```ts
import { createAudioController } from '@trsoliu/audio-core'

const controller = createAudioController({ src: '/audio/example.mp3' })
controller.attach(document.querySelector('audio'))
await controller.play()
```

The controller is event-driven, SSR-safe, and includes playlists, repeat modes,
source fallback, buffered seeking, Media Session integration, and optional
cross-instance playback coordination.
