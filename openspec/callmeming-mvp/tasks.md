# CallMeMing MVP — 正式任务清单（tasks.md）

- 版本：正式合并 v1.0
- 日期：2026-11-08（Asia/Shanghai）
- 合并来源：前端 frontend-contrib-0.10；后端评审通过 v0.4
- 工作台：默认 **Claude CLI** 本地工作台；**只有** Claude CLI 异常时才改用 Cursor 或 Codex，并在任务记录里注明
- 执行前提（全部满足后才可写业务代码）：
  1. 本正式 OpenSpec 已由程序开发主管合并发布（本目录）
  2. 测试工程师已根据本 OpenSpec 写出 **gstack QA 文件**
  3. 按任务 TDD：先写失败测试（红灯）再写最少代码（绿灯）
  4. 界面以 `/workspace/callmeming-ui/` 为准（设计说明 + 关键动效说明；桌面稿 + 390；`mobile-result.png` 为完整 390×1890，不要对着旧版 390×1720）
- **禁止**：QA 就绪前写业务代码；OpenSpec apply 写业务代码；实现者另起验收标准

每个任务：红灯 → 绿灯 → 下一任务。任务编号前缀：**F** = 前端，**B** = 后端，**G** = GEO SEO，**X** = 跨角色交付。

---

## 阶段 0 — 共享基线（后端为主，前端可并行壳）

### B-A1. 初始化 Next.js 服务端项目骨架（Vercel 可部署）
- 可验证：本地可启动；`GET /api/health` 返回 `{ ok: true }`；环境变量模板（Waffo/Supabase/邮件/LLM）就位。不含业务生成/支付逻辑。

### B-A2. Supabase schema 迁移
- 可验证：`free_rate_limit_events`、`orders`、`name_cards`、`webhook_events` 及索引/唯一约束；anon 无法直接读写业务表。依据：`design.md` §3。

### B-A3. 共享错误与校验工具
- 可验证：错误体 `{ error, message, retryAfterSeconds?, fields? }`；校验 `englishName`（含 José、François）、`genderPreference`、`desiredFeeling`；不得只限 ASCII。

### F-T1. 应用壳与 SEO 基线
- Document title、meta description、H1、定义句、品牌全称、副标题角色与 `specs/homepage.md` 一致；meta description 含 `A Real Chinese Name` 与 `Chinese name generator`。

---

## 阶段 1 — 免费生成

### B-B1. IP 频控仓储
- 滚动小时窗口 ≤ 3；UTC 自然日 ≤ 10；不存明文 IP；返回 `retryAfterSeconds`。

### B-B2. 免费名生成器（词表路径）
- 3 个互异 `{ hanzi, pinyin }`；2–3 汉字；声调符号拼音；拒绝表；不调 LLM；姓氏注明公有领域出处。

### B-B3. `POST /api/names/free`
- 200 `{ cards: FreeCard[3] }`；429 `rate_limited`；不落库名字正文。接受可选 `genderPreference`，缺省按 `neutral` 抽样；非法值 400 `validation_error`；不得丢弃或拒收该字段。Spec：`specs/free-name-generation/spec.md`。

### F-T2. 首页信息架构落地
- Hero → 生成器 → Free vs Custom → How it works → FAQ×3（含 “Is this fortune-telling?”）→ Footer。
- 生成器同一时间只显示一种状态；390 生成区三卡竖排，不挤三列。

### F-T3. 免费名卡 API 对接与三卡展示
- 对接 `POST /api/names/free`；首页 Name style 默认 Either is fine，请求传 `genderPreference`（默认 `neutral`）；成功渲染轻量名卡；处理加载/错误/形状异常。用户不选也能直接 Generate。

### F-T4. 免费限流与动效约束
- 429 文案含 “a few names each day”，不写具体次数；动效跟关键动效说明；禁止抽签/翻牌/转盘；`prefers-reduced-motion` 立即全文。

---

## 阶段 2 — 结账

### B-C1. Waffo 客户端封装（Test）
- mock 可验证请求含 `productId`、`currency: USD`、`orderMerchantExternalId`、`metadata.orderId`、`successUrl`、`language: en`；解析 sessionId/checkoutUrl/expiresAt。依据官方字段，不编造。

### B-C2. 创建本地 order + result token
- `awaiting_payment`；只存 token 哈希；原始 token 只进 successUrl；不经 checkout API 返回；`result_expires_at = created_at + 365 days`。

### B-C3. `POST /api/checkout`
- 400 validation_error；200 仅 `{ checkoutUrl }`；Waffo 失败 502；未付款无 name_cards。Spec：`specs/paid-checkout-and-fulfillment/spec.md`。

### F-T5. 付费表单校验
- 三字段必填；englishName 规则；Name style 文案 Typically feminine / Typically masculine / Either is fine；desiredFeeling 小写枚举；客户端失败不发请求。

### F-T6. Checkout 跳转
- `window.location.href = checkoutUrl`；禁止 window.open；不读 token；不依赖 cancelUrl；CTA `Continue to payment · $6.99`。

---

## 阶段 3 — Webhook、履约、结果页

### B-D1. Webhook 验签与幂等
- 错签 401；合法插入 webhook_events；重复不二次处理；找不到订单高优先级告警仍 2xx；尽快 2xx。

### B-D2. 支付确认关联订单
- 写 buyer_email / waffo ids；→ paid；expired 后合法 completed 仍履约。

### B-D3. 付费名卡生成（词表 + LLM 适配层）
- 声调拼音；LLM 只写英文讲解；audioUrl null；超时/重试/failed 规则见 design §10.3。

### B-D4. 履约编排（paid → ready）
- 首次走完全流程；重放无新增卡片。

### B-D5. `refund.succeeded`
- → refunded；随后 results 404 not_found，文案与无效/过期相同。

### B-E1. `GET /api/results/:token`
- 202 generating；200 ready（3 FullCard，audioUrl null）；200 failed；404。Spec：`specs/secure-result-access-and-email/spec.md`。

### B-E2. 履约邮件（Resend）
- ready 后发链接 + 纯文本三卡；失败记 email_error 仍 ready；发件人暂定 hello@mail.callmeming.com。

### F-T7. 结果页 ready 态
- `/results/[token]`；渲染 3×FullCard；audioUrl null 降级 phoneticHint。
- Copy name 只复制汉字，与 Copy intro 分开；桌面与拼音、Play 同一行；手机在拼音下方单独一行按钮；390 三卡竖排；以完整 mobile-result.png（390×1890）为准。

### F-T8. 结果页 generating / failed / not_found
- 202 每 2 秒轮询；约 60s 提示邮件；failed 停轮询；404 无名卡；动效与减动约束。

---

## 阶段 4 — 加固、GEO SEO、验收

### B-F1. CORS、checkout 滥用限制、日志与告警
- CORS 白名单（主站 + 建议预发）；preview 域仅白名单；webhook 找不到订单告警仍 2xx。

### B-F2. 端到端夹具（Test Mode）
- mock Waffo：free → checkout → webhook → ready → 邮件断言；记录工作台。

### F-T9. 内循环验证（可选，不替代验收）
- 按已有 QA/OpenSpec 场景做 localhost/staging 内循环；不构成 gstack 充分条件。

### G-T10. GEO SEO 可见性验证
- **前端代码写出来后**，先把页面交给 GEO SEO 工程师做搜索引擎与 AI 可见性验证。
- 前端 SHALL NOT 自行判断该轮是否通过。
- 该轮完成后再进入后续验收，不得跳过。

### X-T11. 合并前自检与后续验收
- 对照 QA 与 OpenSpec；注明工作台；确认无登录墙、无范围外功能。
- GEO SEO 之后交测试工程师 gstack 验收；主管审核后再归档/PR。

### B-F3. 准备 PR 材料
- 迁移、环境变量、Waffo Dashboard 配置清单；QA 未通过前不强行合入。

---

## 明确延后 / 本轮不做

- TTS / 非空 `audioUrl`
- 登录与历史、静态名卡导出、自我介绍文章页、谐音风险提示
- 八字/五行/幸运色、命理动画
- 用 OpenSpec apply 写业务代码
- 抛开已审设计稿自行定视觉
