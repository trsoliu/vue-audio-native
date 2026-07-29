<script setup lang="ts">
import {
  AudioLines,
  Check,
  Clipboard,
  GitFork,
  Languages,
  Laptop,
  Menu,
  Moon,
  Radio,
  Settings2,
  Smartphone,
  Sun,
  Waves,
  Webhook,
  X,
  Zap,
} from '@lucide/vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import {
  VueAudioNative,
  type AudioPlayerError,
  type AudioSnapshot,
  type AudioTrack,
  type RepeatMode,
} from 'vue-audio-native'

import HeadlessPlayer from '@/components/HeadlessPlayer.vue'
import SettingsPanel, {
  type DemoFormat,
  type DemoSize,
} from '@/components/SettingsPanel.vue'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/sonner'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type Locale = 'zh' | 'en'
type PreviewMode = 'desktop' | 'phone' | 'webview'

interface EventEntry {
  id: number
  name: string
  detail: string
  time: string
}

const locale = ref<Locale>('zh')
const dark = ref(true)
const reducedMotion = ref(false)
const drawerOpen = ref(false)
const previewMode = ref<PreviewMode>('desktop')
const format = ref<DemoFormat>('fallback')
const mediaSession = ref(false)
const exclusive = ref(true)
const nativeControls = ref(false)
const repeatMode = ref<RepeatMode>('all')
const playerSize = ref<DemoSize>('default')
const glow = ref([72])
const playbackRate = ref(1)
const playerState = ref<AudioSnapshot['state']>('idle')
const activeTrack = ref(0)
const lastError = ref<AudioPlayerError | null>(null)
const eventLog = ref<EventEntry[]>([])
let eventId = 0
let lastLoggedSecond = -1

const copy = computed(() =>
  locale.value === 'zh'
    ? {
        eyebrow: 'Vue 3 · TypeScript · Web Audio UI',
        title: '让每一个浏览器，都拥有同一套声音体验。',
        intro:
          '一个事件驱动、可主题化、面向移动浏览器与 WebView 的音频播放器。无轮询、无框架锁定、保留旧 API。',
        settings: '演示设置',
        events: '实时事件',
        playground: '交互实验台',
        architecture: '同一内核，三种接入方式',
        multi: '多实例互斥播放',
        compatibility: '跨端兼容策略',
      }
    : {
        eyebrow: 'Vue 3 · TypeScript · Web Audio UI',
        title: 'One consistent listening experience, in every browser.',
        intro:
          'An event-driven, themeable audio player for mobile browsers and WebViews. No polling, no framework lock-in, legacy API preserved.',
        settings: 'Demo settings',
        events: 'Live events',
        playground: 'Interactive lab',
        architecture: 'One core, three integration styles',
        multi: 'Exclusive multi-instance playback',
        compatibility: 'Cross-platform strategy',
      },
)

const peaks = Array.from({ length: 180 }, (_, index) => {
  const base = Math.sin(index * 0.31) * 0.28 + Math.sin(index * 0.071) * 0.34
  return Math.min(1, Math.max(0.1, Math.abs(base) + (index % 11) / 24))
})

const audioSources = computed(() => {
  if (format.value === 'broken') {
    return { src: '/audio/missing-file.mp3', type: 'audio/mpeg' }
  }
  if (format.value === 'wav') {
    return { src: '/audio/neon-room.wav', type: 'audio/wav' }
  }
  return [
    { src: '/audio/not-requested.demo', type: 'audio/x-audio-native-demo' },
    { src: '/audio/neon-room.wav', type: 'audio/wav' },
  ]
})

const tracks = computed<readonly AudioTrack[]>(() => [
  {
    album: 'Audio Native Sessions',
    artist: locale.value === 'zh' ? '浏览器合成器' : 'Browser Synthesizer',
    artwork: [{ sizes: '800x800', src: '/cover.svg', type: 'image/svg+xml' }],
    downloadName: 'audio-native-neon-room.wav',
    id: 'neon-room',
    peaks,
    sources: audioSources.value,
    title: locale.value === 'zh' ? '霓虹录音室' : 'Neon Room',
  },
  {
    album: 'Audio Native Sessions',
    artist: locale.value === 'zh' ? '浏览器合成器' : 'Browser Synthesizer',
    artwork: [{ sizes: '800x800', src: '/cover.svg', type: 'image/svg+xml' }],
    id: 'after-hours',
    peaks: [...peaks].reverse(),
    sources: audioSources.value,
    title: locale.value === 'zh' ? '深夜回放' : 'After Hours',
  },
])

const previewWidth = computed(() =>
  previewMode.value === 'phone'
    ? 'max-w-[430px]'
    : previewMode.value === 'webview'
      ? 'max-w-[760px]'
      : 'max-w-none',
)

const snippets = {
  modern: `<VueAudioNative
  :tracks="playlist"
  repeat-mode="all"
  media-session
  @statechange="onStateChange"
/>`,
  legacy: `<vue-audio-native
  url="/audio/example.wav"
  :show-current-time="true"
  :show-volume="true"
  @on-change="onChange"
/>`,
  headless: `const { audioRef, snapshot, controls } = useAudioPlayer({
  src: '/audio/example.wav',
  exclusive: true,
  group: 'studio',
})`,
}

function record(name: string, detail: string): void {
  eventId += 1
  eventLog.value = [
    {
      detail,
      id: eventId,
      name,
      time: new Date().toLocaleTimeString([], {
        hour12: false,
        minute: '2-digit',
        second: '2-digit',
      }),
    },
    ...eventLog.value,
  ].slice(0, 48)
}

function onStateChange(snapshot: AudioSnapshot): void {
  playerState.value = snapshot.state
  record('statechange', snapshot.state)
}

function onTrackChange(track: AudioTrack | null, index: number): void {
  activeTrack.value = index
  lastLoggedSecond = -1
  record('trackchange', `${index} · ${track?.title ?? 'none'}`)
}

function onTimeUpdate(currentTime: number): void {
  const second = Math.floor(currentTime)
  if (second === lastLoggedSecond) return
  lastLoggedSecond = second
  record('timeupdate', `${currentTime.toFixed(2)}s`)
}

function onError(error: AudioPlayerError): void {
  lastError.value = error
  record('error', error.code)
}

async function copySnippet(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(locale.value === 'zh' ? '代码已复制' : 'Code copied')
  } catch {
    toast.error(
      locale.value === 'zh'
        ? '复制失败，请手动选择代码'
        : 'Copy failed. Select the code manually.',
    )
  }
}

function resetSettings(): void {
  format.value = 'fallback'
  mediaSession.value = false
  exclusive.value = true
  nativeControls.value = false
  repeatMode.value = 'all'
  playerSize.value = 'default'
  glow.value = [72]
  toast(locale.value === 'zh' ? '演示设置已恢复' : 'Demo settings reset')
}

function applyDocumentPreferences(): void {
  document.documentElement.classList.toggle('dark', dark.value)
  document.documentElement.classList.toggle('reduce-motion', reducedMotion.value)
  document.documentElement.lang = locale.value === 'zh' ? 'zh-CN' : 'en'
}

watch([dark, reducedMotion, locale], applyDocumentPreferences)
watch(format, () => {
  lastError.value = null
  record('source', format.value)
})
watch(drawerOpen, async (open) => {
  if (!open) return
  await nextTick()
  document.querySelector<HTMLElement>('[data-demo-drawer-close]')?.focus()
})

onMounted(() => {
  applyDocumentPreferences()
  record('ready', 'Vue Audio Native demo')
})
</script>

<template>
  <TooltipProvider :delay-duration="250">
    <div
      class="min-h-screen bg-background text-foreground"
      :style="{ '--studio-glow-opacity': String((glow[0] ?? 72) / 100) }"
    >
      <header class="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div class="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-4 md:px-8">
          <a href="#top" class="flex items-center gap-2 font-semibold tracking-tight">
            <span class="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Waves class="size-4" aria-hidden="true" />
            </span>
            <span>Audio Native</span>
            <Badge variant="outline">Vue 3</Badge>
          </a>

          <nav class="ml-auto hidden items-center gap-1 md:flex" aria-label="Demo navigation">
            <Button variant="ghost" size="sm" as-child>
              <a href="#playground">{{ copy.playground }}</a>
            </Button>
            <Button variant="ghost" size="sm" as-child>
              <a href="#api">API</a>
            </Button>
            <Button variant="ghost" size="sm" as-child>
              <a href="#compatibility">{{ locale === 'zh' ? '兼容性' : 'Compatibility' }}</a>
            </Button>
          </nav>

          <Separator orientation="vertical" class="hidden h-6 md:block" />

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                size="icon"
                variant="ghost"
                :aria-label="locale === 'zh' ? '切换语言' : 'Switch language'"
                @click="locale = locale === 'zh' ? 'en' : 'zh'"
              >
                <Languages aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{{ locale === 'zh' ? 'English' : '中文' }}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                size="icon"
                variant="ghost"
                :aria-label="dark ? 'Use light theme' : 'Use dark theme'"
                @click="dark = !dark"
              >
                <Sun v-if="dark" aria-hidden="true" />
                <Moon v-else aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{{ dark ? 'Light' : 'Dark' }}</TooltipContent>
          </Tooltip>

          <Button size="icon" variant="ghost" as-child>
            <a
              href="https://github.com/trsoliu/vue-audio-native"
              target="_blank"
              rel="noreferrer"
              aria-label="Open GitHub repository"
            >
              <GitFork aria-hidden="true" />
            </a>
          </Button>

          <Sheet>
            <SheetTrigger as-child>
              <Button class="hidden md:inline-flex" variant="outline">
                <Settings2 data-icon="inline-start" aria-hidden="true" />
                {{ copy.settings }}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{{ copy.settings }}</SheetTitle>
                <SheetDescription>
                  {{ locale === 'zh' ? '实时改变播放器能力与呈现方式。' : 'Change player capabilities and presentation live.' }}
                </SheetDescription>
              </SheetHeader>
              <div class="px-4 pb-6">
                <SettingsPanel
                  v-model:format="format"
                  v-model:media-session="mediaSession"
                  v-model:exclusive="exclusive"
                  v-model:native-controls="nativeControls"
                  v-model:repeat-mode="repeatMode"
                  v-model:size="playerSize"
                  v-model:glow="glow"
                  :locale="locale"
                  @reset="resetSettings"
                />
              </div>
            </SheetContent>
          </Sheet>

          <Drawer v-model:open="drawerOpen">
            <DrawerTrigger as-child>
              <Button class="md:hidden" size="icon" variant="outline" aria-label="Open demo settings">
                <Menu aria-hidden="true" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerClose as-child>
                <Button
                  data-demo-drawer-close
                  class="absolute right-4 top-4 z-10"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Close demo settings"
                >
                  <X aria-hidden="true" />
                </Button>
              </DrawerClose>
              <DrawerHeader>
                <DrawerTitle>{{ copy.settings }}</DrawerTitle>
                <DrawerDescription>
                  {{ locale === 'zh' ? '检查移动端和 WebView 降级。' : 'Inspect mobile and WebView fallbacks.' }}
                </DrawerDescription>
              </DrawerHeader>
              <ScrollArea class="max-h-[70vh] px-4 pb-8">
                <SettingsPanel
                  v-model:format="format"
                  v-model:media-session="mediaSession"
                  v-model:exclusive="exclusive"
                  v-model:native-controls="nativeControls"
                  v-model:repeat-mode="repeatMode"
                  v-model:size="playerSize"
                  v-model:glow="glow"
                  :locale="locale"
                  @reset="resetSettings"
                />
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      <main id="top" class="mx-auto flex max-w-[1480px] flex-col gap-24 px-4 py-10 md:px-8 md:py-16">
        <section class="studio-grid relative overflow-hidden rounded-[2rem] border px-5 py-8 md:px-10 md:py-12">
          <div class="studio-glow" aria-hidden="true" />
          <div class="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <div class="flex min-w-0 flex-col gap-8">
              <div class="max-w-4xl">
                <Badge class="mb-5" variant="secondary">
                  <Radio data-icon="inline-start" aria-hidden="true" />
                  {{ copy.eyebrow }}
                </Badge>
                <h1 class="max-w-4xl text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] md:text-6xl xl:text-7xl">
                  {{ copy.title }}
                </h1>
                <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
                  {{ copy.intro }}
                </p>
              </div>

              <div id="playground" class="flex flex-col gap-4">
                <div class="flex flex-wrap items-center gap-2">
                  <Badge :variant="playerState === 'error' ? 'destructive' : 'outline'">
                    {{ playerState }}
                  </Badge>
                  <Badge variant="outline">track {{ activeTrack + 1 }}/{{ tracks.length }}</Badge>
                  <Badge variant="outline">{{ format }}</Badge>
                  <Badge v-if="exclusive" variant="outline">exclusive / studio</Badge>
                  <div class="ml-auto flex items-center gap-2">
                    <span class="text-xs text-muted-foreground">{{ playbackRate }}×</span>
                    <input
                      v-model.number="playbackRate"
                      class="w-24 accent-primary"
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.25"
                      aria-label="Playback rate"
                    >
                  </div>
                </div>

                <div :class="['mx-auto w-full transition-[max-width] duration-300', previewWidth]">
                  <Skeleton v-if="playerState === 'loading'" class="mb-2 h-1 w-full" />
                  <VueAudioNative
                    :tracks="tracks"
                    :size="playerSize"
                    :native-controls="nativeControls"
                    :repeat-mode="repeatMode"
                    :playback-rate="playbackRate"
                    :media-session="mediaSession"
                    :exclusive="exclusive"
                    group="studio"
                    @statechange="onStateChange"
                    @trackchange="onTrackChange"
                    @timeupdate="onTimeUpdate"
                    @error="onError"
                  >
                    <template #artwork="{ track }">
                      <img
                        class="size-20 shrink-0 rounded-2xl border object-cover shadow-xl md:size-28"
                        :src="track.artwork?.[0]?.src"
                        :alt="`${track.title ?? 'Audio'} artwork`"
                      >
                    </template>
                    <template #before-controls>
                      <p class="text-xs uppercase tracking-[0.18em] text-primary">Live studio master</p>
                    </template>
                  </VueAudioNative>
                </div>

                <Alert v-if="lastError" variant="destructive">
                  <Zap aria-hidden="true" />
                  <AlertTitle>{{ lastError.code }}</AlertTitle>
                  <AlertDescription>{{ lastError.message }}</AlertDescription>
                </Alert>
                <Alert v-else-if="previewMode === 'webview'">
                  <Webhook aria-hidden="true" />
                  <AlertTitle>WebView capability mode</AlertTitle>
                  <AlertDescription>
                    {{ locale === 'zh'
                      ? '自动播放、下载和 Media Session 由宿主能力决定；播放器会返回结构化降级信息。'
                      : 'Autoplay, download, and Media Session depend on host capabilities; structured fallbacks remain available.' }}
                  </AlertDescription>
                </Alert>

                <div class="flex flex-wrap items-center justify-between gap-3">
                  <ToggleGroup v-model="previewMode" type="single" variant="outline">
                    <ToggleGroupItem value="desktop" aria-label="Desktop preview">
                      <Laptop aria-hidden="true" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="phone" aria-label="Phone preview">
                      <Smartphone aria-hidden="true" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="webview" aria-label="WebView preview">
                      <Webhook aria-hidden="true" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <label class="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input v-model="reducedMotion" type="checkbox" class="accent-primary">
                    {{ locale === 'zh' ? '减少动画' : 'Reduce motion' }}
                  </label>
                </div>
              </div>
            </div>

            <aside class="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border bg-card/70">
              <div class="flex items-center gap-2 border-b px-4 py-3">
                <span class="size-2 rounded-full bg-primary" aria-hidden="true" />
                <h2 class="text-sm font-medium">{{ copy.events }}</h2>
                <Badge class="ml-auto" variant="outline">{{ eventLog.length }}</Badge>
              </div>
              <ScrollArea class="h-[320px] flex-1 lg:h-auto">
                <ol class="flex flex-col gap-0 p-2 font-mono text-xs" aria-live="polite">
                  <li
                    v-for="entry in eventLog"
                    :key="entry.id"
                    class="grid grid-cols-[58px_92px_1fr] gap-2 rounded-lg px-2 py-2 hover:bg-muted/45"
                  >
                    <time class="text-muted-foreground">{{ entry.time }}</time>
                    <span :class="entry.name === 'error' ? 'text-destructive' : 'text-primary'">
                      {{ entry.name }}
                    </span>
                    <span class="truncate text-muted-foreground">{{ entry.detail }}</span>
                  </li>
                </ol>
              </ScrollArea>
            </aside>
          </div>
        </section>

        <section id="api" class="flex flex-col gap-7">
          <div class="max-w-3xl">
            <p class="mb-2 text-sm font-medium text-primary">API SURFACES</p>
            <h2 class="text-3xl font-semibold tracking-tight md:text-4xl">{{ copy.architecture }}</h2>
          </div>

          <Tabs default-value="modern" class="w-full">
            <TabsList variant="line" class="max-w-full overflow-x-auto">
              <TabsTrigger value="modern">Recommended API</TabsTrigger>
              <TabsTrigger value="legacy">Legacy Vue API</TabsTrigger>
              <TabsTrigger value="headless">Headless API</TabsTrigger>
              <TabsTrigger value="platform">Cross-platform</TabsTrigger>
            </TabsList>

            <TabsContent value="modern" class="mt-5">
              <div class="relative overflow-hidden rounded-2xl border bg-card p-5 md:p-7">
                <Button
                  class="absolute right-4 top-4"
                  size="icon"
                  variant="ghost"
                  aria-label="Copy modern API example"
                  @click="copySnippet(snippets.modern)"
                >
                  <Clipboard aria-hidden="true" />
                </Button>
                <pre class="overflow-x-auto pr-12 text-sm"><code>{{ snippets.modern }}</code></pre>
              </div>
            </TabsContent>

            <TabsContent value="legacy" class="mt-5">
              <div class="grid gap-5 lg:grid-cols-2">
                <div class="relative overflow-hidden rounded-2xl border bg-card p-5">
                  <Button
                    class="absolute right-3 top-3"
                    size="icon"
                    variant="ghost"
                    aria-label="Copy legacy API example"
                    @click="copySnippet(snippets.legacy)"
                  >
                    <Clipboard aria-hidden="true" />
                  </Button>
                  <pre class="overflow-x-auto pr-10 text-xs"><code>{{ snippets.legacy }}</code></pre>
                </div>
                <VueAudioNative
                  url="/audio/neon-room.wav"
                  size="small"
                  :show-current-time="true"
                  :show-volume="true"
                  download-name="legacy-demo.wav"
                  @on-change="playing => record('on-change', String(playing))"
                />
              </div>
            </TabsContent>

            <TabsContent value="headless" class="mt-5">
              <div class="grid gap-5 lg:grid-cols-2">
                <HeadlessPlayer src="/audio/neon-room.wav" />
                <div class="relative overflow-hidden rounded-2xl border bg-card p-5">
                  <Button
                    class="absolute right-3 top-3"
                    size="icon"
                    variant="ghost"
                    aria-label="Copy headless API example"
                    @click="copySnippet(snippets.headless)"
                  >
                    <Clipboard aria-hidden="true" />
                  </Button>
                  <pre class="overflow-x-auto pr-10 text-xs"><code>{{ snippets.headless }}</code></pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="platform" class="mt-5">
              <Alert>
                <Check aria-hidden="true" />
                <AlertTitle>Capability detection first</AlertTitle>
                <AlertDescription>
                  Chromium 96+, Firefox 115+, Safari / WKWebView 15.6+, Android 8+, HarmonyOS
                  WebView and ArkWeb. Engines below baseline fall back to native controls.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </section>

        <section class="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div class="lg:sticky lg:top-24">
            <Badge variant="outline" class="mb-4">
              <AudioLines data-icon="inline-start" aria-hidden="true" />
              GROUP COORDINATION
            </Badge>
            <h2 class="text-3xl font-semibold tracking-tight md:text-4xl">{{ copy.multi }}</h2>
            <p class="mt-4 max-w-xl leading-7 text-muted-foreground">
              {{ locale === 'zh'
                ? '两个播放器共享 studio 分组。开启 exclusive 后，任意一个开始播放都会暂停另一个；不同分组仍保持完全独立。'
                : 'Both players share the studio group. With exclusive enabled, starting one pauses the other while unrelated groups remain independent.' }}
            </p>
          </div>
          <div class="flex flex-col gap-4 rounded-[2rem] border bg-muted/20 p-4 md:p-6">
            <VueAudioNative
              src="/audio/neon-room.wav"
              size="small"
              :exclusive="exclusive"
              group="studio"
              :show-download="false"
            />
            <VueAudioNative
              src="/audio/neon-room.wav"
              size="small"
              :exclusive="exclusive"
              group="studio"
              :show-download="false"
            />
          </div>
        </section>

        <section id="compatibility" class="grid gap-8 border-t pt-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p class="mb-2 text-sm font-medium text-primary">RUNTIME MATRIX</p>
            <h2 class="text-3xl font-semibold tracking-tight md:text-4xl">{{ copy.compatibility }}</h2>
          </div>
          <Accordion type="single" collapsible default-value="mobile">
            <AccordionItem value="mobile">
              <AccordionTrigger>iOS · Android · HarmonyOS</AccordionTrigger>
              <AccordionContent>
                Touch and Pointer inputs share native range semantics. Autoplay rejection is returned
                as `AUTOPLAY_BLOCKED`; ArkWeb and embedded WebViews use capability detection.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="desktop">
              <AccordionTrigger>Chrome · Edge · Firefox · Safari</AccordionTrigger>
              <AccordionContent>
                Keyboard-operable controls, multi-source selection, structured MediaError mapping,
                reduced-motion support, and optional Media Session integration.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ssr">
              <AccordionTrigger>Vite · Nuxt · SSR</AccordionTrigger>
              <AccordionContent>
                Importing the package never creates a media element. Controllers attach only after a
                real `HTMLAudioElement` is available and release all listeners when disposed.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      <footer class="mt-20 border-t">
        <div class="mx-auto flex max-w-[1480px] flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:px-8">
          <span>Vue Audio Native 1.0 · MIT</span>
          <span class="md:ml-auto">Generated audio fixture · No third-party media</span>
        </div>
      </footer>
    </div>
    <Toaster position="top-right" rich-colors />
  </TooltipProvider>
</template>
