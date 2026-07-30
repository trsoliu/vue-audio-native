import { defineConfig, definePlugin } from '@aicode-nexus/silen'

const isolateSsrDependencies = definePlugin(() => ({
  name: 'audio-native:isolated-silen-ssr',
  vite: () => ({
    name: 'audio-native:bundle-silen-ssr-dependencies',
    config: () => ({ ssr: { noExternal: true } }),
  }),
}))

export default defineConfig({
  title: 'Vue Audio Native',
  description:
    'Vue 3 audio player documentation, architecture map and browser/WebView knowledge base.',
  lang: 'zh-CN',
  base: '/vue-audio-native/',
  siteUrl: 'https://trsoliu.github.io',
  onBrokenLinks: 'error',
  plugins: [isolateSsrDependencies],
  themeConfig: {
    locales: [
      { lang: 'zh-CN', label: '中文', root: '/' },
      {
        lang: 'en-US',
        label: 'English README',
        link: 'https://github.com/trsoliu/vue-audio-native#readme',
      },
    ],
    logo: { src: '/logo.svg', alt: 'Vue Audio Native' },
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started/' },
      { text: '项目地图', link: '/project-map/' },
      { text: '迁移指南', link: '/migration-v1/' },
      { text: 'GitHub', link: 'https://github.com/trsoliu/vue-audio-native' },
    ],
    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '文档首页', link: '/' },
          { text: '安装与快速开始', link: '/guide/getting-started/' },
          { text: 'Vue 1.0 迁移', link: '/migration-v1/' },
          { text: '公共 API', link: '/api/' },
        ],
      },
      {
        text: '工程地图',
        items: [
          { text: 'Monorepo 项目地图', link: '/project-map/' },
          { text: '状态与适配架构', link: '/wiki/architecture/' },
          { text: '浏览器与 WebView', link: '/wiki/browser-webview/' },
          { text: '兼容基线', link: '/compatibility/' },
        ],
      },
      {
        text: '维护与发布',
        items: [
          { text: '发布知识库', link: '/wiki/release/' },
          { text: '兼容性评估记录', link: '/device-smoke/' },
          { text: 'AI 协作说明', link: '/wiki/ai-collaboration/' },
          { text: '架构决策', link: '/adr/0001-modernize-audio-native/' },
        ],
      },
    ],
    search: true,
    home: {
      hero: {
        name: 'Vue Audio Native',
        text: '一个内核，覆盖 Vue 3、移动浏览器与 WebView。',
        tagline:
          '事件驱动、完整 TypeScript、兼容旧 Vue API，并为人类与 AI 同时提供可检索的工程知识。',
        image: { src: '/logo.svg', alt: 'Vue Audio Native waveform mark' },
        actions: [
          { text: '开始接入', link: '/guide/getting-started/', theme: 'brand' },
          { text: '查看项目地图', link: '/project-map/', theme: 'alt' },
        ],
      },
      features: [
        {
          title: '统一音频状态契约',
          details:
            '框架无关 audio-core 管理播放、缓冲、列表、错误、互斥和生命周期。',
          link: '/wiki/architecture/',
          linkText: '理解架构',
        },
        {
          title: 'Vue 3 与旧 API 共存',
          details:
            '现代 props、composable 和实例句柄，与 0.x 公开接入面保持明确兼容。',
          link: '/migration-v1/',
          linkText: '阅读迁移指南',
        },
        {
          title: 'AI-ready 知识库',
          details:
            '同一构建生成搜索、Markdown、llms.txt、Agent Contract 与只读 MCP。',
          link: '/wiki/ai-collaboration/',
          linkText: '查看 AI 协作边界',
        },
      ],
    },
  },
  ai: {
    llmsTxt: true,
    llmsFullTxt: true,
    markdownRoutes: true,
    index: true,
    contract: {
      enabled: true,
      instructions: '.silen/ai-public.md',
      tasksDir: '.silen/ai-tasks',
    },
  },
})
