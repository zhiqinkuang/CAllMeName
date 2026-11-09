# CallMeMing MVP — Design（正式合并）

- 版本：正式合并 v1.0
- 日期：2026-11-08（Asia/Shanghai）
- 维护方：程序开发主管
- 合并来源：前端贡献包 frontend-contrib-0.10；后端 OpenSpec 评审通过 v0.4
- 依据：PRD v0.4；Waffo 官方文档 https://docs.waffo.ai/ ；视觉 `/workspace/callmeming-ui/`
- 契约真源：`api-contract.md`

## 1. 架构概览

```
浏览器 (callmeming.com)
  │
  ├─ POST /api/names/free          → 频控 + 轻量名生成（不落库名字）
  ├─ POST /api/checkout            → 校验表单 → 建本地 order → Waffo createSession → 返回 { checkoutUrl }
  ├─ GET  /api/results/:token      → 202 generating | 200 ready/failed | 404
  └─ 页面 /results/[token]         → 结果页（前端路由；数据来自 results API）

Waffo Hosted Checkout
  └─ POST /api/webhooks/waffo      → 验签 + 幂等写入后尽快 2xx；生成与发信异步

数据：Supabase Postgres
运行：Next.js（Vercel）
邮件：Resend；发件人暂定 `CallMeMing <hello@mail.callmeming.com>`（若主域更好配可改为 `hello@callmeming.com`，与运维对齐）
生成：词表抽样汉字和拼音；付费卡英文讲解走可替换 LLM 适配层（MVP 默认 Anthropic Claude Sonnet，model id 用环境变量）；免费路径只走词表，不调 LLM
```

权威支付确认以 **Waffo webhook `order.completed`** 为准，不以浏览器回跳为准。`POST /api/checkout` **不返回** result token。原始 token 只写入 Waffo `successUrl` 与事后邮件；数据库只存哈希。

## 2. 前端信息架构与页面结构

```
/                          英语首页（SEO + 免费生成 + 付费表单）
  └─ 外部 Waffo Pancake    托管收银台（站内不自建刷卡表单）
/results/[token]           安全链接结果页（3 张完整候选卡）
```

### 2.1 `/` 首页（上线结构）

区块顺序：**Hero → 免费生成器 → Free vs Custom → How it works → FAQ×3 → Footer**。

1. **品牌 / Hero**：字标全称 CallMeMing；副标题可用 `A Real Chinese Name`（仅副标题/搜索描述）。
   - Document title：`CallMeMing — Real Chinese Name Generator for Learners`
   - meta description：`CallMeMing — A Real Chinese Name generator for learners. This Chinese name generator gives you a real Chinese name you can actually introduce yourself with, not a transliteration and not fortune-telling.`
   - H1：`Get a real Chinese name you can actually introduce yourself with`
   - 定义句（PRD 原句）：`CallMeMing gives you a real Chinese name—not a transliteration and not a fortune-telling reading—so you can say who you are in Chinese with confidence.`
2. **免费生成器**：含 Name style（Typically feminine / Typically masculine / Either is fine），默认 Either is fine，不挡直接生成。Empty / Generating / 已生成 / Daily limit 是**状态变体**；上线时同一时间只显示当前一种。约 390 宽时按展厅标本通栏青白台展示，不要做成三张等宽浮卡。限流界面文案用 “a few names each day”，不写每小时 3 次、每天 10 次。
3. **Free vs Custom / 付费定制**：三字段必填；站内 CTA `Continue to payment · $6.99`；付款页 Waffo 托管。
4. **FAQ** 保留 3 条，须含 “Is this fortune-telling?”。
5. **页脚**：品牌全称；不做命理声明堆砌。

### 2.2 外部收银台

- 成功后 `window.location.href = checkoutUrl`；**禁止** `window.open`。
- checkout 响应只含 `checkoutUrl`，不含 token。
- Waffo `successUrl` 不自动跳转，用户点 Done 后才回 `/results/[token]`。
- **无 `cancelUrl`**；关闭收银台不会回站；不得依赖 `/?checkout=canceled`。

### 2.3 `/results/[token]` 结果页

1. 合法 token 未就绪 → generating 并轮询（文案按「正在准备你的名字」）。
2. ready → 3 张完整候选卡。
3. failed → 停止轮询并展示错误，无名卡。
4. 无效/过期/退款 → 404 友好错误，无名卡，不区分原因。

每张完整卡信息层级：

- 大号汉字名
- 拼音（声调符号）
- 读音：本轮 MVP `audioUrl` 恒为 null，展示 `phoneticHint`；若将来有 URL 可播，但不挡阅读/复制
- **Copy name**（只复制汉字，如林安然）：桌面与拼音、Play 同一行；手机在拼音下方单独一行按钮
- Why it fits you
- Self-introduction + **Copy intro**
- 390 结果页三张卡竖排，不要挤成三列；以完整 `previews/mobile-result.png`（390×1890）为准，不要对着旧版 390×1720 裁切图实现。页脚免责声明示例：`Pick one to take with you. CallMeMing does not sell destiny readings.`

### 2.4 视觉依据

先看 `/workspace/callmeming-ui/CallMeMing-设计说明.md` 与 `CallMeMing-关键动效说明.md`。关键预览：`foundations.png`、`homepage-hero-cards.png`、`form.png`、`result.png`、`paid-card.png`、`mobile-generator.png`、`mobile-result.png`。390 画板：`CallMeMing-手机生成区与结果页.pen`。

### 2.5 动效原则

- 免费卡：入场/揭示可丰富，不挡操作；禁止抽签/翻牌/转盘。
- 付费卡：揭示、书写感、读音/复制反馈可更完整；不以八卦、罗盘、印章铺满。
- 遵守 `prefers-reduced-motion`：减动时立即展示全部文字。
- 时序与参数以实现说明为准。

### 2.6 交互状态摘要

| 区域 | 状态 | 行为 |
|------|------|------|
| 免费生成 | idle / loading / success / rate_limited / error | 见上；限流不阻断付费路径 |
| 付费表单 | invalid / submitting / redirecting / api_400 | 校验失败不发请求；跳转用 location.href |
| 首页 | 关闭收银台 | 无取消回调；自行回站为普通首页 |
| 结果页 | generating (202) | 每 2 秒轮询；约 60s 提示邮件链接 |
| 结果页 | ready / failed / not_found | 见 `api-contract.md` |
| 复制 | success / failure | 纯前端；非阻挡反馈 |

## 3. 数据模型（Supabase / Postgres）

### 3.1 `free_rate_limit_events`

只存 IP 哈希与时间，**不持久化免费名字**。

| 列 | 类型 | 说明 |
|----|------|------|
| `id` | uuid PK | |
| `ip_hash` | text NOT NULL | `SHA-256(ip + RATE_LIMIT_PEPPER)` |
| `created_at` | timestamptz NOT NULL | |

频控（**已定**）：同一 `ip_hash` **滚动小时窗口 ≤ 3 次**；自然日按 **UTC** 计数，**每天 ≤ 10 次**。

### 3.2 `orders`

| 关键列 | 说明 |
|--------|------|
| `status` | 见状态机 |
| `english_name` | trim 后 1–80；允许带变音符号拉丁字母、空格、连字符、撇号 |
| `gender_preference` | feminine \| masculine \| neutral |
| `desired_feeling` | friendly \| calm \| bright \| elegant \| modern \| scholarly |
| `amount_usd` / `currency` | 6.99 / USD |
| Waffo 字段 | session_id、checkout_url、expires_at、order_id、payment_id |
| `buyer_email` | 仅来自 webhook；站点表单不收集、不预填 |
| `result_token_hash` | SHA-256；原始 token 不落库 |
| `result_expires_at` | `created_at + 365 days` |
| `fulfilled_at` / `email_sent_at` / `email_error` / `failure_code` | 履约与邮件 |

创建 checkout 时：`successUrl = https://callmeming.com/results/{raw_token}`。官方：successUrl 不自动跳转；无 cancelUrl。

### 3.3 `name_cards`

付费结果 3 条；免费名不入库。字段：`hanzi`、`pinyin`（声调符号）、`phonetic_hint`、`why_it_fits_you`、`self_introduction`、`audio_url`（本轮恒 null）。唯一约束 `(order_id, rank)`，rank 1..3。

### 3.4 `webhook_events`

PK `(event_type, event_id)` 幂等。

### 3.5 订单状态机

```
created → awaiting_payment → expired（可选）
awaiting_payment → paid | expired
expired → paid   # 后来合法 order.completed 仍须履约
paid → fulfilling → ready | failed
ready | failed → refunded
```

对前端映射：

| 内部 status | HTTP / API |
|-------------|------------|
| created / awaiting_payment / expired / paid / fulfilling（合法 token、未过期） | `202 { status: "generating" }` |
| ready | `200 { status: "ready", cards }` |
| failed | `200 { status: "failed", message }` |
| 无法识别或 `now > result_expires_at` | `404 { error: "not_found" }` |
| refunded | `404 { error: "not_found" }`（与无效/过期同文案） |

## 4. 表单枚举

### 4.1 `genderPreference`（UI 标签 **Name style**）

| value | UI 文案 |
|-------|---------|
| `feminine` | Typically feminine |
| `masculine` | Typically masculine |
| `neutral` | Either is fine |

名字语气偏好，不是生理性别，也不是命理。

### 4.2 `desiredFeeling`

| value | UI |
|-------|-----|
| friendly / calm / bright / elegant / modern / scholarly | Friendly / Calm / Bright / Elegant / Modern / Scholarly |

不提供八字、五行、幸运色；不接受自由文本。

## 5. 生成策略

### 5.1 硬规则

- 1 字姓 + 1–2 字名，总汉字 2 或 3；禁止 ≥4 字音译长串。
- 禁止把英文名整段逐音节音译作为默认输出。
- 付费可轻微借鉴英文名读音/首音，但整体须像中国人真名。
- 禁止八字、五行、幸运色、命理。
- 规避不当谐音（拒绝表 + 二次过滤）。

### 5.2 混合方案（已定）

1. **词表**：姓氏用公有领域来源（如百家姓）并在仓库注明出处；名字用字和双字搭配用仓库内自建允许表 + 不当谐音拒绝表。SHALL NOT 爬商业起名站或许可证不明数据集。
2. **抽样**：付费按 genderPreference + desiredFeeling 加权抽 3 个互异 `(hanzi, pinyin)`；免费仅按可选 `genderPreference` 加权，缺省 `neutral`；拼音用声调符号。
3. **LLM（可替换适配层）**：仅付费卡写英文 `whyItFitsYou` / `selfIntroduction`；不得改汉字；安全过滤触发则重抽。MVP 默认 Anthropic Claude Sonnet（`ANTHROPIC_MODEL`）。单次超时约 20–25 秒，失败重试 1 次；仍失败 → 订单 `failed`，不自动退款。
4. **免费路径**：只走词表，**不调 LLM**；只返回 hanzi + pinyin；SHALL 接收并使用请求中的 `genderPreference`，不得丢弃该字段。
5. **音频**：不进本轮 MVP；`audioUrl` 保持 null。

### 5.3 履约时机

仅在 `order.completed` 处理成功、订单进入 `paid` 之后生成完整 3 卡。

## 6. 支付（Waffo Pancake）

文档：https://docs.waffo.ai/ （create-session、webhooks、checkout-session、one-time-payments）。

### 6.1 商品与创建 session

- one-time 数字商品 **$6.99 USD**，`taxIncluded: false`。
- 环境变量：`WAFFO_MERCHANT_ID`、`WAFFO_PRIVATE_KEY`、`WAFFO_PRODUCT_ID`、`WAFFO_STORE_ID` / slug、`WAFFO_ENV`。
- 推荐 SDK `@waffo/pancake-ts`：`productId`、`currency: USD`、`language: en`、`orderMerchantExternalId`、`metadata.orderId`、`successUrl`、`expiresInSeconds`；**不传** `buyerEmail`；**无** `cancelUrl`。
- 响应：`sessionId`、`checkoutUrl`、`expiresAt`。对外只交 `checkoutUrl`。

### 6.2 Webhook

- `POST /api/webhooks/waffo`；头 `X-Waffo-Signature`（RSA-SHA256）、`X-Waffo-Event`。
- MVP 订阅：`order.completed`、`refund.succeeded`。
- 步骤：raw body 验签失败 → 401；`(eventType, eventId)` 幂等；找不到本地订单 → 高优先级告警仍 **2xx**；尽快 2xx（10s 内），生成与发信异步；仅 `paymentStatus === "succeeded"` 履约；本地曾 `expired` 仍须履约；已 ready/fulfilling 则幂等跳过。
- 退款：标 `refunded`；安全链接立即 404。
- 生成失败：`failed`；不自动退款。

### 6.3 上线前与运维对齐

商品 UUID、税类、KYB、发件域名 SPF/DKIM、预发域名购入与 CORS/webhook URL。不要对外宣布 staging 域名已锁定。

## 7. 安全链接与邮件

- `raw_token` 高熵；库内只存 SHA-256；有效期自订单创建起 **1 年**。
- 无效、过期、退款统一 `404 { error: "not_found" }`，不区分原因。
- 邮件：Resend；收件人 = webhook `buyerEmail`；含安全链接 + 三名纯文本备份；不附动画。发件人暂定 `CallMeMing <hello@mail.callmeming.com>`。邮件失败记 `email_error`，订单仍可为 ready。

## 8. 密钥、CORS 与错误码

密钥：Waffo、`RATE_LIMIT_PEPPER`、`RESEND_API_KEY`、`ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL`、Supabase service role。私钥不进浏览器。CORS 白名单见 §10.12。错误码见 `api-contract.md`。

## 9. 工程执行约束

- 默认 Claude CLI 本地工作台；异常时 Cursor/Codex 并注明。
- 前端代码写出后先交 GEO SEO 工程师做搜索与 AI 可见性验证，再进入后续验收（含 gstack）。
- **QA 文件就绪前不得写业务代码**；禁止 OpenSpec apply 写业务代码；实现者不另起验收标准。

## 10. 已定结论（程序开发主管 2026-11-08）

1. **免费频控**：同一 IP（只存哈希）滚动小时窗口 ≤ 3 次；自然日按 **UTC** 计数，每天 ≤ 10 次。
2. **安全链接**：自订单创建起有效 **1 年**。`refunded` 后立即失效，对外 `404 { error: "not_found" }`，不区分原因。
3. **生成**：词表抽样汉字和拼音；付费卡 `whyItFitsYou` / `selfIntroduction` 用 LLM 写英文，不得改汉字（安全过滤则重抽）。免费只走词表。可替换适配层，MVP 默认 Anthropic Claude Sonnet（model id 环境变量）。超时约 20–25 秒，失败重试 1 次，仍失败 → `failed`，不自动退款。
4. **语料**：姓氏公有领域（如百家姓）并注明出处；名字允许表 + 不当谐音拒绝表在仓库内自建。不爬商业起名站或许可证不明数据集。
5. **邮件**：Resend。发件人暂定 `CallMeMing <hello@mail.callmeming.com>`（可改为 `hello@callmeming.com`，与运维对齐）。SPF/DKIM 等域名买下并解析后再配。
6. **successUrl 不自动跳转**：结果页 generating 文案「正在准备你的名字」；约 60 秒后提示邮件链接。无 `cancelUrl`，不依赖 `/?checkout=canceled`。
7. **邮箱**：站内表单不加可选邮箱，不预填 `buyerEmail`。
8. **拼音**：声调符号（如 `Lǐ Wěi`）；`phoneticHint` 为英文近似读法，不是 IPA。
9. **`refunded` 对外**：404，文案与无效/过期相同。
10. **webhook 找不到本地订单**：验签后高优先级告警，返回 2xx，不用非 2xx 触发重试。本地曾 `expired` 后收到合法 `order.completed` 仍须履约。Webhook 先尽快 2xx，生成和发信异步。
11. **音频**：不进本轮 MVP，`audioUrl` 保持 null。
12. **CORS**：环境变量白名单。主站 `https://callmeming.com`；预发建议 `https://staging.callmeming.com`（购入并经运维确认后再用，不要宣布已锁定）。Waffo Test webhook → 预发 `/api/webhooks/waffo`，Live → 主站同一路径。Vercel preview 域仅白名单放行，不要用 `*`。
