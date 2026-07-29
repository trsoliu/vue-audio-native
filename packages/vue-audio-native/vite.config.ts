import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const globalBuild = mode === 'global'

  return {
    build: {
      emptyOutDir: !globalBuild,
      lib: {
        cssFileName: 'style',
        entry: globalBuild ? 'src/global.ts' : 'src/index.ts',
        fileName: (format) =>
          format === 'es'
            ? 'index.js'
            : format === 'cjs'
              ? 'index.cjs'
              : 'vue-audio-native.global.js',
        formats: globalBuild ? ['iife'] : ['es', 'cjs'],
        name: 'VueAudioNative',
      },
      rollupOptions: {
        external: globalBuild
          ? ['vue']
          : ['@lucide/vue', '@trsoliu/audio-core', 'vue'],
        output: {
          exports: globalBuild ? 'default' : 'named',
          globals: {
            vue: 'Vue',
          },
        },
      },
      sourcemap: true,
      target: 'es2019',
    },
    plugins: [
      vue(),
      tailwindcss(),
      ...(globalBuild
        ? []
        : [
            dts({
              bundleTypes: true,
              include: ['src'],
            }),
          ]),
    ],
  }
})
