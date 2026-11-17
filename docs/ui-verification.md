# Storefront UI 与商品链路验收

2026-11-17。本地前台：http://localhost:8000/kr；Medusa Admin：http://localhost:9001/app。

## 组件结构

前台不存在 `src/modules/shokz`。改版直接使用 Starter 的原有文件：

| 页面或能力 | 实现位置（相对 apps/storefront/src） |
| --- | --- |
| 首页主视觉与产品推荐 | modules/home/components/hero、featured-products |
| 导航、移动菜单、搜索、购物车抽屉 | modules/layout/templates/nav、layout/components/cart-dropdown |
| 商品列表、分类、搜索 | modules/store/templates |
| 商品卡片 | modules/products/components/product-preview |
| 详情购买区与选项 | modules/products/templates/product-info、products/components/product-actions |
| 图片、放大、视频 | modules/products/components/image-gallery |
| 图文长页、规格、FAQ | modules/products/components/product-tabs |
| 比较（新增功能） | modules/products/templates/compare.tsx、lib/context/compare-context.tsx |
| 产品匹配问答（新增功能） | modules/home/components/product-finder |
| 购物车、结账、订单、账户 | Starter 对应的 cart、checkout、order、account 组件 |
| shadcn Base UI | modules/common/components/ui |

前台采用 Hugeicons，未保留手绘 SVG 图标组件、Headless UI 或 Radix 前台依赖。商品、变体、价格、库存、购物车和订单在运行时通过 Medusa SDK 读取和修改。验收脚本不依赖采集快照。

## 已运行检查

- Storefront 生产构建成功，TypeScript 检查通过。
- Storefront Lint 命令成功：0 个错误、16 条 React effect 告警。
- `pnpm poc:verify` 通过：22 款商品、47 个 SKU、有效 KRW 价格、无空选项；韩文搜索、价格筛选与排序；购物车增删和数量；零配送费与零税；默认支付会话与订单金额一致。
- 同一购物车并发及重复完成只产生一张订单；默认支付授权后可通过原生后台 API 测试捕获。
- 注册客户登录、读取保存地址、下单及查询账户订单通过。
- 1350 个当前引用的 Medusa 媒体地址均响应成功且非空。商品主图和旧款长图另由浏览器逐张解码验证。

`pnpm poc:verify` 会在本地创建游客与演示客户测试订单，并消耗演示库存；它仅使用默认支付，不产生真实扣款。Stripe、3DS、拒付和外部支付 Webhook 已不属于本项目的支付范围。

## 浏览器验收

由指定 GPT-6.1 Terra、max 子代理执行。当前会话未提供 Computer 插件操作工具，实际使用 Playwright；不将其表述为已完成 Computer 插件验收。

覆盖首页、两页目录、四分类、搜索、22 款商品图集、商品比较、游客及注册客户结账、地址管理、账户订单和后台订单核对。1440、768、390、375 视口的首页、列表、Air 2、比较和购物车没有页面级横向溢出。

已修正并复核的主要问题包括无效 SKU 组合、空选项、误用箭头素材、图片清晰度、遗漏与重复 FAQ、视频及尺码指南入口、立即购买地址步骤、比较 URL 同步、手机双浮条遮挡，以及订单金额与韩文文案。

浏览器逐商品对照、截图和具体覆盖边界位于 `.scratch/verification/browser-report.md`；SDK 记录位于 `.scratch/verification/commerce-report.json`；媒体记录位于 `.scratch/verification/medusa-media-report.json`。

## 当前分工

本记录覆盖前台 UI 与验收。数据库、素材迁移、采集文件清理及初始化命令由并行任务负责，未在此重复实现或替其声明完成。

采集快照 `apps/backend/data/`、Medusa 本地文件存储 `apps/backend/static/`、环境文件和生成的浏览器验收记录不进入 Git。现有本地数据库和素材保留；商品初始化脚本依赖本地导入快照，不能仅凭此源码提交还原当前演示数据。

## 当前源站差异与交接

- 配件配送费：官网首屏标示 ₩3,000，本地执行已确认的 POC 规则——韩国标准配送免费、额外税费为零。已用仅含收纳袋的实际购物车验证配送费及税费均为 ₩0，无新增订单；记录见 `.scratch/verification/accessory-shipping-report.json`。
- OpenDots One 保护套：Medusa 选项定义有粉色，但实际 SKU 仅黑／灰；前台已按实际 SKU 排除粉色，购买区、手机选项和色板均使用相同规则。
- OpenDots One 长页视频及两款产品的赠品展示：保留为内容／素材核对项，未将其宣称为已完整复刻。赠品不会在本地订单中自动添加。
- OpenFit 2+ 无实际 SKU 对应的米色已从前台选项和色板中排除；真实 SKU 之间不成立的组合仍禁用。
- 全站底部比较浮条已移除；导航栏提供带已选数量的比较入口，商品购买区与详情导航也可进入比较。
