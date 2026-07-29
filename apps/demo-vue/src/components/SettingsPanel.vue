<script setup lang="ts">
import { RotateCcw, ShieldCheck, Sparkles } from '@lucide/vue'
import type { RepeatMode } from 'vue-audio-native'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type DemoFormat = 'fallback' | 'wav' | 'broken'
export type DemoSize = 'small' | 'default' | 'large'

defineProps<{ locale: 'zh' | 'en' }>()

const format = defineModel<DemoFormat>('format', { required: true })
const mediaSession = defineModel<boolean>('mediaSession', { required: true })
const exclusive = defineModel<boolean>('exclusive', { required: true })
const nativeControls = defineModel<boolean>('nativeControls', { required: true })
const repeatMode = defineModel<RepeatMode>('repeatMode', { required: true })
const size = defineModel<DemoSize>('size', { required: true })
const glow = defineModel<number[]>('glow', { required: true })

const emit = defineEmits<{ reset: [] }>()
</script>

<template>
  <div class="flex flex-col gap-6 p-1">
    <div class="flex items-start gap-3 rounded-xl border bg-muted/35 p-3">
      <ShieldCheck class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <p class="text-sm text-muted-foreground">
        {{ locale === 'zh'
          ? '设置只作用于当前演示，不会改变 npm 包的默认行为。'
          : 'Settings affect this demo only and never change package defaults.' }}
      </p>
    </div>

    <FieldGroup>
      <Field>
        <FieldLabel for="demo-format">
          {{ locale === 'zh' ? '音频来源' : 'Audio source' }}
        </FieldLabel>
        <Select v-model="format">
          <SelectTrigger id="demo-format" class="w-full">
            <SelectValue :placeholder="locale === 'zh' ? '选择来源' : 'Select source'" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fallback">Multi-format fallback</SelectItem>
            <SelectItem value="wav">Generated WAV</SelectItem>
            <SelectItem value="broken">Broken source</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>
          {{ locale === 'zh'
            ? '回退模式先声明不支持的格式，再选择本地生成的 WAV。'
            : 'Fallback declares an unsupported format before the generated WAV.' }}
        </FieldDescription>
      </Field>

      <Separator />

      <Field orientation="horizontal">
        <div class="flex-1">
          <FieldTitle>Media Session</FieldTitle>
          <FieldDescription>
            {{ locale === 'zh' ? '锁屏元数据和系统媒体按键' : 'Lock-screen metadata and media keys' }}
          </FieldDescription>
        </div>
        <Switch v-model="mediaSession" aria-label="Toggle Media Session" />
      </Field>

      <Field orientation="horizontal">
        <div class="flex-1">
          <FieldTitle>{{ locale === 'zh' ? '同组互斥' : 'Exclusive group' }}</FieldTitle>
          <FieldDescription>
            {{ locale === 'zh' ? '新实例播放时暂停同组实例' : 'Pause peers when another instance starts' }}
          </FieldDescription>
        </div>
        <Switch v-model="exclusive" aria-label="Toggle exclusive playback" />
      </Field>

      <Field orientation="horizontal">
        <div class="flex-1">
          <FieldTitle>{{ locale === 'zh' ? '原生控件' : 'Native controls' }}</FieldTitle>
          <FieldDescription>
            {{ locale === 'zh' ? '检查 WebView 原生降级路径' : 'Inspect the WebView fallback path' }}
          </FieldDescription>
        </div>
        <Switch v-model="nativeControls" aria-label="Toggle native controls" />
      </Field>

      <Separator />

      <Field>
        <FieldLabel>{{ locale === 'zh' ? '循环模式' : 'Repeat mode' }}</FieldLabel>
        <ToggleGroup v-model="repeatMode" type="single" variant="outline" class="justify-start">
          <ToggleGroupItem value="off" aria-label="Repeat off">Off</ToggleGroupItem>
          <ToggleGroupItem value="one" aria-label="Repeat one">One</ToggleGroupItem>
          <ToggleGroupItem value="all" aria-label="Repeat all">All</ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <Field>
        <FieldLabel>{{ locale === 'zh' ? '播放器尺寸' : 'Player size' }}</FieldLabel>
        <ToggleGroup v-model="size" type="single" variant="outline" class="justify-start">
          <ToggleGroupItem value="small" aria-label="Small player">S</ToggleGroupItem>
          <ToggleGroupItem value="default" aria-label="Default player">M</ToggleGroupItem>
          <ToggleGroupItem value="large" aria-label="Large player">L</ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <Field>
        <div class="flex items-center gap-2">
          <Sparkles class="size-4 text-primary" aria-hidden="true" />
          <FieldLabel>{{ locale === 'zh' ? '环境光强度' : 'Studio glow' }}</FieldLabel>
        </div>
        <Slider v-model="glow" :max="100" :step="5" aria-label="Studio glow intensity" />
      </Field>
    </FieldGroup>

    <Button variant="outline" class="w-full" @click="emit('reset')">
      <RotateCcw data-icon="inline-start" aria-hidden="true" />
      {{ locale === 'zh' ? '恢复演示设置' : 'Reset demo settings' }}
    </Button>
  </div>
</template>
