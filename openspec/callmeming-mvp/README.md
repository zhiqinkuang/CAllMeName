# CallMeMing MVP — 正式 OpenSpec

- 状态：**已合并正式文档**；待测试工程师编写 gstack QA 文件。**QA 文件就绪前不得写业务代码**，也不得用 OpenSpec apply 写业务代码。
- 版本：正式合并 v1.1（2026-11-09，Asia/Shanghai；v1.1 为免费接口补充可选 `genderPreference`）
- 合并来源：
  - 前端贡献包 `frontend-contrib-0.10`：`/workspace/openspec/callmeming-mvp-frontend/`
  - 后端 OpenSpec 评审通过 v0.4：`/workspace/callmeming-openspec/`
  - 已审设计：`/workspace/callmeming-ui/`（含桌面稿与 390 手机生成区/结果页）
- 依据：PRD v0.4、《程序开发工程规范》v1.2
- 维护方：程序开发主管

## 说明

本目录是 **CallMeMing MVP 的正式 OpenSpec**，不是前端或后端贡献包。前后端实现、测试 QA、GEO SEO 验证均以本目录为准。源贡献目录保持只读，本包不覆盖它们。

## 文件清单

| 文件 | 用途 |
|------|------|
| `README.md` | 本说明、状态与主流程 |
| `proposal.md` | 变更目的、Must / Non-goals、成功标准 |
| `design.md` | 合并架构、数据模型、支付、邮件、前端信息架构与交互；§10 为已定结论 |
| `api-contract.md` | **单一契约真源**（前后端共用） |
| `tasks.md` | 合并前后端任务（含 GEO SEO）；评审 + QA 就绪后按 TDD 执行 |
| `specs/free-name-generation/spec.md` | 免费生成能力与场景 |
| `specs/paid-checkout-and-fulfillment/spec.md` | 付费结账与履约 |
| `specs/secure-result-access-and-email/spec.md` | 安全链接与邮件 |
| `specs/homepage.md` | 首页 SEO、结构、文案 |
| `specs/free-name-cards.md` | 免费轻量名卡与限流交互 |
| `specs/checkout.md` | 付费表单与跳转 Waffo |
| `specs/result-page.md` | 结果页、轮询、复制与动效 |

## 视觉依据

先看 `/workspace/callmeming-ui/CallMeMing-设计说明.md` 与 `CallMeMing-关键动效说明.md`。

关键预览：

- `previews/foundations.png`、`homepage-hero-cards.png`、`form.png`
- `previews/result.png`、`paid-card.png`
- `previews/mobile-generator.png`、`mobile-result.png`（390）

源文件：`CallMeMing-手机生成区与结果页.pen`。手机上三张卡竖排，不要挤成三列（首页生成区与结果页皆然）。`Copy name` 只复制汉字本身（如林安然），与 `Copy intro` 分开：桌面与拼音、Play 同一行；手机在拼音下方单独一行按钮。`previews/mobile-result.png` 已是完整的 390×1890，覆盖第三张卡（沈清越）的英文 gloss、Copy intro 和页脚免责声明；SHALL NOT 对着旧版 390×1720 裁切图实现。上线首页生成器同一时间只显示一种状态。

## 主流程

```
正式 OpenSpec（本目录）
  → 测试工程师写 gstack QA 文件
  → Superpowers / 等价 TDD 实现（默认 Claude CLI 本地工作台；异常时 Cursor/Codex 并注明）
  → 前端代码写出后先交 GEO SEO 工程师做搜索与 AI 可见性验证
  → 后续验收（含 gstack）
```

## 主产品路径（摘要）

1. `/`：Title / H1 / PRD 定义句；未登录免费 3 张轻量名卡；同页付费三字段 → `Continue to payment · $6.99` → `window.location.href = checkoutUrl` 跳转 Waffo。
2. Waffo Hosted Checkout：$6.99 USD；无 `cancelUrl`；`successUrl` 不自动跳转，用户点 Done 后进 `/results/[token]`。
3. `/results/[token]`：轮询 `GET /api/results/:token`（每 2 秒；约 60 秒仍 generating 则提示邮件链接）→ 展示 3 张完整候选卡。
4. 权威支付确认：Waffo webhook `order.completed`；前端不接 webhook。
