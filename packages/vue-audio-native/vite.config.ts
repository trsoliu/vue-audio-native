import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const developmentBuild = mode === 'development'
  const globalBuild = mode === 'global'
  const libraryBuild = mode === 'library'

  return {
    build: {
      emptyOutDir: libraryBuild,
      lib: {
        cssFileName: 'style',
        entry: globalBuild ? 'src/global.ts' : 'src/index.ts',
        fileName: (format) =>
          format === 'es'
            ? developmentBuild
              ? 'index.development.js'
              : 'index.js'
            : format === 'cjs'
              ? developmentBuild
                ? 'index.development.cjs'
                : 'index.cjs'
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
    define: {
      'import.meta.env.DEV': JSON.stringify(developmentBuild),
    },
    plugins: [
      vue(),
      tailwindcss(),
      ...(libraryBuild
        ? [
            dts({
              bundleTypes: true,
              include: ['src'],
            }),
          ]
        : []),
    ],
  }
})
