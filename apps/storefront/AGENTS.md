# Storefront UI 约束

- 禁止毛玻璃和背景模糊：不使用 `backdrop-filter`、`backdrop-blur-*` 或模糊背景玻璃面板。
- 优先使用 Tailwind CSS；非必要不新增 CSS，不用叠加覆盖规则修补组件样式。
- 优先复用 `src/modules/common/components/ui/` 中的 shadcn UI 组件。表单、按钮、标签页、选择器、复选框、弹层等交互控件，不直接使用浏览器原生控件实现。
- shadcn 组件内部必需的 DOM 元素及页面语义结构不受上一条限制；业务页面通过组件接口使用控件，保证视觉、焦点和交互一致。
- 图片和视频必须保持原始宽高比例，明确使用等比覆盖或等比完整展示，禁止通过拉伸填满容器。
- 修复样式时保留已确认的设计意图、品牌视觉和层次，不因组件实现问题将设计简化为普通控件。交互动效保持克制、布局稳定；产品分类切换使用轻微透明度过渡，不使用整组位移或逐张错峰。

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
