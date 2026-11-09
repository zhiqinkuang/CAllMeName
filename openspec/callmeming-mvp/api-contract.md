# CallMeMing MVP — API 契约（正式 · 单一真源）

- 版本：正式合并 v1.1
- 日期：2026-11-09（Asia/Shanghai）
- 变更：v1.1 为 `POST /api/names/free` 补充可选 `genderPreference`（产品 2026-11-09 收口：免费首页 Name style，默认 Either is fine / `neutral`）
- Base URL：同源 `https://callmeming.com`（预发建议 `https://staging.callmeming.com`，购入并经运维确认后再用，不要对外宣布已锁定）
- Content-Type：`application/json; charset=utf-8`
- CORS：环境变量白名单；主站 `https://callmeming.com`，预发建议 `https://staging.callmeming.com`；Vercel preview 域只有写入白名单才能放行，不要用 `*`；默认不需要凭证（无 Cookie 会话）
- 字段命名：JSON camelCase

本文件是前后端共同契约的**唯一真源**。路径或字段变更须同步改本文件与相关 specs。

## 类型

```ts
type FreeCard = { hanzi: string; pinyin: string }; // pinyin 用声调符号，如 Lǐ Wěi

type FullCard = {
  hanzi: string;
  pinyin: string;
  phoneticHint: string;          // 给英语用户的近似读法，不是 IPA
  audioUrl: string | null;       // 本轮 MVP 恒为 null，不堵塞 ready
  whyItFitsYou: string;          // 英文
  selfIntroduction: string;      // 英文，可直接复制
};

type GenderPreference = "feminine" | "masculine" | "neutral";
type DesiredFeeling = "friendly" | "calm" | "bright" | "elegant" | "modern" | "scholarly";
```

对应 UI 文案：

| value | UI |
|-------|-----|
| `genderPreference` 字段标签 | **Name style** |
| `feminine` / `masculine` / `neutral` | Typically feminine / Typically masculine / Either is fine（名字语气偏好，不是命理） |
| `friendly` / `calm` / `bright` / `elegant` / `modern` / `scholarly` | Friendly / Calm / Bright / Elegant / Modern / Scholarly |

## 错误形状

```json
{ "error": "rate_limited", "message": "Too many free generations. Try again later.", "retryAfterSeconds": 1523 }
```

| HTTP | `error` | 说明 |
|------|---------|------|
| 400 | `validation_error` | 字段校验失败；可含 `fields?: { [field: string]: string }` |
| 404 | `not_found` | 安全链接无法识别、已过期或已退款；统一文案，不区分原因 |
| 429 | `rate_limited` | 免费频控；含 `retryAfterSeconds` |
| 502 | `checkout_create_failed` | 创建 Waffo session 失败 |
| 401 | `unauthorized` | 仅 webhook 验签失败，前端不用处理 |
| 500 | `internal_error` | 未分类 |

---

## 1. `POST /api/names/free`

无需登录。`genderPreference` 为可选字段，对应首页 **Name style**。

### Request

```json
{ "genderPreference": "neutral" }
```

| 字段 | 规则 |
|------|------|
| `genderPreference` | 可选；`feminine` \| `masculine` \| `neutral`。未传、为 `null` 或 Body 为 `{}` 时按 `neutral`（UI：Either is fine）抽样。前端首页默认选中 Either is fine，用户不改也可直接生成，此时应传 `neutral`。非法枚举值返回 `400` `{ error: "validation_error", message, fields? }`。服务端 SHALL 接收并使用该字段做词表抽样，SHALL NOT 把它当作未知字段丢弃或因此拒收整单。 |

Body 仍可为 `{}`，不因此返回 400。

频控（**已定**）：同一 IP（只存 IP 哈希）滚动小时窗口 ≤ 3 次；自然日按 **UTC** 计数，每天 ≤ 10 次。

### Response `200`

```json
{
  "cards": [
    { "hanzi": "李伟", "pinyin": "Lǐ Wěi" },
    { "hanzi": "王芳", "pinyin": "Wáng Fāng" },
    { "hanzi": "陈浩", "pinyin": "Chén Hào" }
  ]
}
```

恰好 3 张 `FreeCard`。不返回完整讲解字段。`pinyin` 使用声调符号。

### Response `429`

```json
{
  "error": "rate_limited",
  "retryAfterSeconds": 1523,
  "message": "Too many free generations. Try again later."
}
```

界面文案用 “a few names each day”，不把每小时 3 次、每天 10 次写进界面。

---

## 2. `POST /api/checkout`

校验必填定制字段后，创建本地订单与 Waffo Hosted Checkout session。未付款不生成完整结果。

### Request

```json
{
  "englishName": "Alice",
  "genderPreference": "feminine",
  "desiredFeeling": "elegant"
}
```

| 字段 | 规则 |
|------|------|
| `englishName` | 必填；trim 后 1–80 个字符；允许带变音符号的拉丁字母、空格、连字符和撇号（如 `Mary-Jane`、`O'Connor`、`José`、`François`）；不得只限 ASCII 字母 |
| `genderPreference` | `feminine` \| `masculine` \| `neutral` |
| `desiredFeeling` | `friendly` \| `calm` \| `bright` \| `elegant` \| `modern` \| `scholarly` |

**不要**在站点表单收集邮箱，也不预填 `buyerEmail`。付款邮箱只来自 Waffo 收银台，经 webhook `data.buyerEmail` 回传。

### Response `200`

```json
{ "checkoutUrl": "https://checkout.waffo.ai/.../checkout/cs_xxx" }
```

只返回 `checkoutUrl`。**不返回** `sessionId`、`resultToken`、`resultPath`、`orderId`。

结果 token 在服务端生成后：

- 只写入 Waffo `successUrl`：`https://callmeming.com/results/{token}`
- 履约后再写入付款邮件
- 数据库只存 SHA-256，原始 token 不落库

### 前端约定

1. 使用 `window.location.href = checkoutUrl` 跳转；**禁止** `window.open`（Safari / 移动端会拦截）。
2. Waffo 官方说明：`successUrl` **不会自动跳转**，买家付完先到 Waffo 成功页，点 Done 后才进入 `/results/[token]`。占位符也不会被替换。
3. Waffo API **没有** `cancelUrl`；关闭收银台不会回调。不要依赖 `/?checkout=canceled`。
4. 回到结果页后立刻 `GET /api/results/:token`；若 `202 generating` 则轮询。

### Response `400`

```json
{
  "error": "validation_error",
  "message": "englishName is required",
  "fields": { "englishName": "Required" }
}
```

### Response `502`

```json
{ "error": "checkout_create_failed", "message": "Checkout is temporarily unavailable. Please try again." }
```

---

## 3. `GET /api/results/:token`

无需登录。`:token` 为原始 result token。

### Response `200` — ready

```json
{
  "status": "ready",
  "cards": [
    {
      "hanzi": "林诗涵",
      "pinyin": "Lín Shīhán",
      "phoneticHint": "Lin Shih-han",
      "audioUrl": null,
      "whyItFitsYou": "… English …",
      "selfIntroduction": "Hi, my Chinese name is 林诗涵 (Lín Shīhán). …"
    }
  ]
}
```

`cards` 恰好 3 张。本轮 MVP `audioUrl` 恒为 `null`。`pinyin` 使用声调符号；`phoneticHint` 是英文近似读法，不是 IPA。

### Response `202` — generating

```json
{ "status": "generating" }
```

持有**合法 token** 但结果尚未就绪时返回（含 webhook 未到达、或已到达仍在生成）。不返回 `cards`。结果页文案按「正在准备你的名字」，不要写成无效链接。

### Response `200` — failed

```json
{
  "status": "failed",
  "message": "We could not prepare your names. Please contact support with your payment email."
}
```

付款成功但生成最终失败。前端应停止轮询并展示错误。

### Response `404`

```json
{ "error": "not_found", "message": "This result link is invalid." }
```

用于：无法识别的 token、已过期的 token、已退款（`refunded`）的订单。不区分原因，文案相同，不返回名卡。

### 轮询约定

| 项 | 值 |
|----|-----|
| 首次 | 页面加载立即请求 |
| 间隔 | 每 2 秒 |
| 停止 | `ready` / `failed` / `404` |
| 超时提示 | 约 60 秒仍为 `generating` 时，提示稍后通过邮件中的链接再打开 |
| 并发 | 同一 tab 单飞；页面隐藏时可降频 |

复制名字、自我介绍走浏览器剪贴板，不需要接口。MVP 不做登录 API。

---

## 4. `POST /api/webhooks/waffo`

仅服务端，不对前端暴露。验签、幂等与履约见 `design.md`。

---

## 5. 权威支付确认

以 Waffo webhook `order.completed` 且 `paymentStatus === "succeeded"` 为准，不以浏览器回跳为准。未进入 `ready` 前，results 不得返回完整定制名卡。
