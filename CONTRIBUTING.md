# Contributing

感谢你帮助改进 Vue Audio Native。

## Local setup

1. 使用 Node.js 22.22.2 及以上版本并启用 Corepack。
2. 运行 `pnpm install`。
3. 从最新的 `master` 创建功能分支。
4. 先写会失败的测试，再完成实现。
5. 提交前运行 `pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm test:pack`。

涉及浏览器交互时还需运行 `pnpm test:e2e`。涉及公开 API、兼容策略、依赖边界或
发布方式的变更，应新增或更新 `docs/adr` 中的 ADR，并为可发布包添加 Changeset。

## Pull requests

- 一个 PR 聚焦一个可审查的目标。
- 说明行为变化、兼容性影响和验证证据。
- 不提交构建产物、测试音频、凭据、本机路径或来源不明的素材。
- 公共组件不得引入 Demo 专属的 shadcn、Radix、Reka 或 Sonner 依赖。

提交代码即表示你同意以本项目的 MIT 许可证发布该贡献。
