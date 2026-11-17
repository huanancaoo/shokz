<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  Building blocks for digital commerce
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

## Shokz POC 商品媒体

商品媒体由 Medusa Local File Provider 托管，完整 URL 为 `http://localhost:9001/static/<file-key>`。后台上传的新图片也使用这个地址。

修复已入库的 `/shokz/...` 图片和视频引用，在 `apps/backend` 目录执行：

```bash
pnpm exec medusa exec ./src/scripts/migrate-shokz-media.ts
```

该命令通过原生上传、商品及变体工作流迁移缩略图、图库、详情媒体和变体图库；保留商品、图片、变体 ID 与价格、库存。同时发布首页、品牌页、文章和 Logo 的完整媒体地址到 storefront。重复执行复用已上传文件。

所有采集源文件位于 backend：`data/assets/` 保存图片和视频，`data/catalog.json` 保存商品快照，`data/content/` 保存原始品牌内容，`data/asset-manifest.json` 记录采集来源。`/shokz/...` 只作为源数据中的素材标识，不是前台访问路径。字体属于前台资源，保存在 `apps/storefront/public/fonts/`。

采集脚本位于 `scripts/import-source.py`、`scripts/import-home.py` 和 `scripts/source_content.py`，不会向 storefront 的 public 目录写文件。`seed-shokz.ts` 导入商品并生成前台内容快照；`static/` 保存 File Module 的上传文件和 `.shokz-media.json` 去重索引，两者需一起保留，均不纳入 Git。

在仓库根目录执行：

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r apps/backend/scripts/requirements.txt
pnpm poc:capture
pnpm poc:seed
pnpm poc:verify-assets
```

只迁移已入库商品和重新发布前台媒体地址，执行 `pnpm poc:media`。前台的 `src/content/*.json` 为发布产物，采集内容应在 backend 更新后重新生成。

前台通过 `images.dangerouslyAllowLocalIP` 允许 Next.js 优化本机 Medusa 图片；此配置用于本地 POC。

## Compatibility

This starter is compatible with versions >= 2 of `@medusajs/medusa`.

## Getting Started

Visit the [Quickstart Guide](https://docs.medusajs.com/learn/installation) to set up a server.

Visit the [Docs](https://docs.medusajs.com/learn/installation#get-started) to learn more about our system requirements.

## What is Medusa

Medusa is a set of commerce modules and tools that allow you to build rich, reliable, and performant commerce applications without reinventing core commerce logic. The modules can be customized and used to build advanced ecommerce stores, marketplaces, or any product that needs foundational commerce primitives. All modules are open-source and freely available on npm.

Learn more about [Medusa’s architecture](https://docs.medusajs.com/learn/introduction/architecture) and [commerce modules](https://docs.medusajs.com/learn/fundamentals/modules/commerce-modules) in the Docs.

## Community & Contributions

The community and core team are available in [GitHub Discussions](https://github.com/medusajs/medusa/discussions), where you can ask for support, discuss roadmap, and share ideas.

Join our [Discord server](https://discord.com/invite/medusajs) to meet other community members.

## Other channels

- [GitHub Issues](https://github.com/medusajs/medusa/issues)
- [Twitter](https://twitter.com/medusajs)
- [LinkedIn](https://www.linkedin.com/company/medusajs)
- [Medusa Blog](https://medusajs.com/blog/)
