# Shokz 内容管理

## 本地启动

使用 Node.js 24.22.3 或更新的 Node.js 24 LTS、pnpm 和 Docker。在仓库根目录运行以下命令。初始化会迁移 Medusa 和 Payload 的 PostgreSQL 数据库，并将仓库中的 Shokz 内容和本地素材导入 Payload。重复导入保留已有内容的编辑结果。

```sh
pnpm poc:setup
pnpm poc:start
```

- [Payload 管理后台](http://localhost:8000/admin) 首次打开时创建管理员。
- [Medusa 管理后台](http://localhost:9001/app) 管理商城商品与交易。
- [Storefront](http://localhost:8000/kr) 显示已发布的内容与地区商品。
- [Mailpit](http://localhost:8026) 接收本地密码重置和表单通知。

Payload 的 PostgreSQL 本地端口为 `5443`。环境变量见 [Storefront 模板](./.env.template)。自托管运行时使用独立的 `PAYLOAD_DATABASE_URL`，设置随机 `PAYLOAD_SECRET`、站点公开地址 `PAYLOAD_SERVER_URL` 和 SMTP 参数。上传与导入导出文件存放于 Storefront 运行目录下的 `data/payload`，部署时应使用持久化目录。

上线前在包含应用源文件的 Storefront 目录运行 `pnpm cms:migrate`。模型变更后运行 `pnpm cms:generate` 并用 `pnpm exec payload migrate:create <name>` 生成迁移。首次导入素材需要 `apps/backend/static` 中现有的 Shokz 文件及 Storefront 的品牌视频。

## 同步商品

1. 在 Payload 后台的「管理」中创建 `commerce-sync` 账号并生成 API Key。
2. 在 Medusa 后端环境中设置 `PAYLOAD_CATALOG_URL` 为 Storefront 的服务端可达地址，并设置 `PAYLOAD_CATALOG_API_KEY`。
3. 重启 Medusa，在 **Settings → Payload** 提交全量同步。该操作补齐已发布商品，同步当前标题、链接标识与缩略图，并清理已经删除或下架的商品记录。

后续新建、更新、删除商品的事件会单向同步。Payload 将 Medusa 商品 ID 用作引用键。商品集合的写入权限仅授予上述同步账号，Payload 管理员和编辑都可以选用现有商品。博客和页面的关联商品卡片，以及 Banner 的商品跳转，使用当前地区的 Medusa 商品数据。

## 编辑网站内容

- **页面**在「内容 → 页面」编辑。「内容 → 页面区块」可添加并拖动排序正文、行动按钮、媒体、博客归档和表单，「头图区」可设置标题、导语、图片和链接。子页面的链接包含上级页面的路径。
- **博客分类**在「内容 → 博客分类」创建，可设置上级分类、排序和是否出现在博客导航。「博客 → 关联与设置」可为文章选择多个分类，已发布文章在 `/kr/journal` 按分类浏览。
- **内容搜索**可从博客页或页眉搜索面板打开，也可直接访问 `/kr/content-search`。已发布页面和博客的标题、路径、SEO 文案与正文会进入 Payload 搜索索引。
- **Banner**按排序值显示在首页。可配置桌面和移动素材，并为 Banner 选择站内地址或关联商品。
- Storefront 读取已发布文档。后台可编辑韩文、英文和中文，当前 Storefront 使用韩文内容。草稿、版本、自动保存、定时发布和实时预览由 Payload 管理。
- 页面和博客按 Website 模板分为「内容」「关联与设置」「SEO」。保存草稿后可打开「预览」，也可用实时预览工具栏切换手机、平板和桌面尺寸。SEO 预览使用店面的正式内容路径。
- 媒体集合使用 Payload 原生文件夹整理素材。

## 管理页眉和页脚

管理员可在「网站布局」打开「页眉」或「页脚」。页眉管理店面 Logo、商品菜单、桌面和移动端导航。页脚管理商品与内容链接栏、政策链接和品牌信息。Logo 也用于页脚和结账页。

顶部公告、推荐搜索词、页脚推广和订阅展示由店面组件提供。订阅区是 POC 展示，输入框和按钮均为禁用状态。

菜单项可拖动排序。选择「站内内容」可关联已发布的页面或博客。选择「自定义地址」可填写 `/store` 等站内路径或完整的 HTTPS 地址。现有韩文内容由迁移导入。保存后刷新店面查看效果，商品分类继续由 Medusa 提供。

## 管理店面主题

管理员在「网站主题 → 主题库」建立配色、字体、圆角与按钮形状方案，在「当前主题」保存选择。首次迁移会创建并启用「Shokz 默认」。保存生效主题的改动后，新访问会使用更新后的外观。删除主题前，先在「当前主题」启用另一套方案。

| 官方插件 | 管理入口或用途 |
| --- | --- |
| SEO | 博客和页面的标题、描述与分享图 |
| Nested Docs | 页面路径与博客分类层级 |
| Redirects | 在后台设置 `/journal/...` 和 `/pages/...` 的跳转，店面保留地区前缀 |
| Search | 博客和页面的已发布索引 |
| Form Builder | 表单定义、文件字段、提交记录和 SMTP 通知 |
| Import/Export | 管理员通过 CSV 或 JSON 导入导出内容，导入默认创建草稿 |
| MCP | 在 Payload 后台生成 API Key，连接同域的 `/api/mcp`，按 key 授予各内容集合的权限 |

后台同时提供 Payload REST 和 GraphQL API。运行中的 Storefront 每分钟处理到期的发布和导入导出任务。

[Medusa 官方集成指南](https://docs.medusajs.com/resources/integrations/guides/payload) · [Payload 官方插件目录](https://payloadcms.com/docs/plugins/overview)
