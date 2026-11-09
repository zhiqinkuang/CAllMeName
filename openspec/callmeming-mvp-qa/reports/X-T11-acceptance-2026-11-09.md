# CallMeMing MVP — X-T11 系统级验收报告

- **结论：有条件通过**
- 日期：2026-11-09（Asia/Shanghai）
- 执行角色：测试工程师（执行助手）
- 报告路径：`/workspace/openspec/callmeming-mvp-qa/reports/X-T11-acceptance-2026-11-09.md`
- 证据目录：`/workspace/openspec/callmeming-mvp-qa/reports/evidence-xt11/`
- 模式：report-first（未改业务代码 / 未进 fix-mode / 未改 OpenSpec / 未改 QA 场景文件）

---

## 1. 结论

**有条件通过。**

关键路径（免费生成 + 频控、结账只返回 `checkoutUrl`、mock webhook 履约 → ready 三张 FullCard、`audioUrl` 恒 null、结果页一张主纸 + Other candidates + Open paper、Copy name/intro、404/generating/failed、排除项反向验收、首页锁定文案烟雾核验）在本地 memory + mock 环境下可跑通。

剩余问题为：少量非阻断产品文案/交互缺陷（表单演示预填、FAQ 声称 playable audio、剪贴板失败仍显示 Copied）；以及预期中的真云依赖受阻（真实 Waffo Hosted Checkout Done 回跳、真实 Resend 投递、真实 Supabase、公网 GEO SERP）。这些不足以判「不通过」。

---

## 2. 测试环境与方法

| 项 | 值 |
|----|----|
| Claude CLI | **不可用**（`command -v claude` 为空） |
| gstack CLI | **不可用** |
| 实际方法 | Cursor/本机：代码阅读 + Vitest + 本地 Next.js HTTP(curl) + Playwright headless 截图/交互；履约路径用仓库 mock Waffo/LLM/Email + 测试夹具 RSA 验签 |
| 服务 | 复用已运行的 `next dev --turbopack --port 3000`（`http://127.0.0.1:3000`）。端口 3010 上另有旧 `next start` 构建，**`/api/health` 404，未用作验收基准** |
| 驱动 | `PERSISTENCE_DRIVER=memory`，`WAFFO_DRIVER=mock`，`LLM_DRIVER=mock`，`EMAIL_DRIVER=mock`（无真云密钥） |
| 时间 | 2026-11-09 11:56–12:00 Asia/Shanghai（CST, UTC+8） |
| 代码提交 | `406b203d7b436e8bc643729c6a87eb76bb67d36e` — `feat(backend): CallMeMing MVP APIs with TDD (OpenSpec v1.1)`（工作区另有未提交前端样式改动，非本验收写入） |
| 契约真源 | `/workspace/openspec/callmeming-mvp/` **v1.1** |
| QA | `/workspace/openspec/callmeming-mvp-qa/` 已审 v1.0（109 条） |
| 视觉基准 | `/workspace/callmeming-ui/exhibit/` |
| 辅证 | `npm test` → **16 files / 59 tests passed**（`evidence-xt11/npm-test.txt`）；仓库自带测试**不替代** QA 逐条结论，仅作辅证 |
| 深度 | 按 test-plan **Standard**，并对 Exhaustive 中可本地完成的 webhook/频控/减动等做了补测 |

---

## 3. 覆盖统计

| 归类 | 条数 | 说明 |
|------|------|------|
| 通过 | **101** | 本地实测或 mock 夹具 + 代码/前端单测交叉证实 |
| 失败（产品缺陷，对应 QA ID） | **2** | HP-13、RP-12（见缺陷清单 DEF-01/DEF-03） |
| 受阻 | **2** | CO-07 真 Waffo Done；SE-09 真 Resend 投递（mock 路径已通过） |
| 文档差异 | **4** | HP-09、FC-02、RP-01、RP-11（另有 FN-01/HP-07 旁注，不重复占条） |
| 未执行 | **0** | 无编造；可测项均已尝试 |
| **合计** | **109** | |

另有 **DEF-02**（FAQ/Free vs Custom 声称 playable audio）记入缺陷清单，作为跨场景文案问题；**不**把 EX-06 整条改判失败（其正式断言 audioUrl null / phoneticHint / 不阻塞 ready 已通过）。真云/SERP 等环境限制见第 5 节受阻说明，不全部升格为 QA ID「受阻」以免重复计数。

> 统计口径：每条 QA ID 唯一归入一类。文档差异优先于「按旧 QA 判失败」。云依赖未接真钥标受阻，不判产品失败。

---

## 4. 缺陷清单

### DEF-01 — 付费表单演示预填（HP-13）

| 字段 | 内容 |
|------|------|
| QA | HP-13 |
| 严重级别 | **P2（非阻断）** |
| 现象 | 首页付费区初始 `englishName="Elena"`，Feeling 预选 **Calm**（`DEMO_CUSTOMER`） |
| 期望 | 正式 `specs/homepage.md`：三字段为空或未选默认，不得预填命理含义 |
| 证据 | `evidence-xt11/ui-playwright-console.txt`（`FAIL_PREFILL`）；`evidence-xt11/ui-followup-log.json`；`lib/demo-data.ts` + `components/CustomizeForm.tsx` |
| 备注 | exhibit 标本可用 Elena/Calm 演示；上线空态契约仍要求空/未选。不挡结账主路径 |

### DEF-02 — 文案声称 playable audio（EX-06 / 收口#7）

| 字段 | 内容 |
|------|------|
| QA | EX-06 相关文案；首页 FAQ / Free vs Custom |
| 严重级别 | **P2（非阻断，误导性文案）** |
| 现象 | FAQ「What do I get for $6.99?」写 **playable audio**；Free vs Custom 写 **Meaning, audio, self-intro**。同时 API ready 卡 `audioUrl` 均为 `null`，Play 仅视觉 Playing… |
| 期望 | 本轮 `audioUrl` 恒 null；收口#7 Play 无音频；勿向用户承诺可听音频 |
| 证据 | `components/HomePage.tsx`；`evidence-xt11/homepage.html`；`fulfillment-dump.json`（`audioUrls:[null,null,null]`）；`rp01-ready-desktop.png` |
| 备注 | 结果页 Play 按钮本身符合 exhibit「视觉 Playing」；缺陷在营销/FAQ 文案 |

### DEF-03 — 剪贴板拒绝仍显示 Copied（RP-12）

| 字段 | 内容 |
|------|------|
| QA | RP-12 |
| 严重级别 | **P2（非阻断）** |
| 现象 | `copyText` 在 `clipboard.writeText` 失败时 catch 空处理后仍 `setCopiedName/Intro(true)`，界面显示 Copied，无失败提示、无引导手动选中 |
| 期望 | 非静默失败；展示失败提示；尽量提供可选中文本 |
| 证据 | `components/ResultView.tsx` L136–148（代码审阅） |
| 备注 | 成功路径 Copy name=汉字、Copy intro=英文 selfIntroduction 已 Playwright 实测通过（RP-09/10） |

---

## 5. 受阻清单

| ID | 原因 |
|----|------|
| CO-07 | 真实 Waffo Hosted Checkout「付款后点 Done 回站」需外网托管收银台；本轮仅 mock `checkoutUrl`，未走真人付款 |
| PF-06（真 Waffo） | 真密钥创建 session 失败需 real driver；本地用 mock `failNext` 验证了 502 形状（辅证通过），真网关未测 |
| SE-09（真投递） | `EMAIL_DRIVER=mock`：已验证 mock 发信对象/链接/三卡纯文本结构；未接 Resend，无真实收件箱可达性证明 |
| SE-04 边界运维 | 过期逻辑已用时钟夹具验证 404；生产 1 年到期需时间或运维夹具，不作为阻断 |
| GEO 公网项 | 无部署公网 URL；未编造 SERP/排名。主管声明 G-T10 已通过；本地烟雾核验 title/meta/H1/定义句/FAQ |
| 真 Supabase | 无云密钥；memory 仓储验证业务语义；持久化换真库未测 |
| 真 Waffo webhook 签名（线上 PEM） | 运行中的 dev 服务未注入测试 PEM；履约验签/幂等/退款在 **in-process mock + RSA fixture** 完成（见 fulfillment-dump / vitest） |
| RP-05 墙钟 60s | 未真实等待 60 秒；已确认 `RESULTS_TIMEOUT_MS=60_000` 与 UI 文案 “Check the email you used at checkout…” 存在 |

---

## 6. 文档差异（QA v1.0 旧写法 vs 现行 v1.1 / 主管收口 / exhibit）

| 主题 | QA v1.0 | 现行 | 处理 |
|------|---------|------|------|
| 免费 Body | 多处写 Body 可为 `{}` 且暗示无字段 | v1.1 可选 `genderPreference`；`{}`/`null`/缺省→`neutral` | **文档差异**；实现符合 v1.1（实测非法值 400） |
| 结果页结构 | RP-01/RP-11 倾向「三张同构完整卡竖排」 | 收口 + exhibit：一张主纸 + Other candidates + Open paper；API 仍 3×FullCard | **文档差异**；UI 符合收口（截图 `rp01-ready-desktop.png`） |
| 手机生成区 | HP-09/FC-02「三卡竖排不挤成三列」 | exhibit「通栏青白台一主二从」；390 下次级两卡可横排 | **文档差异**；对照 exhibit，不判产品缺陷 |
| 感觉选项 | QA 与契约六项一致 | Friendly…Scholarly 六项锁定 | 一致（通过） |
| selfIntroduction | QA 强调可复制自我介绍 | 收口：仅英文；Copy intro=英文；Copy name=汉字 | 实现符合；通过 |
| 登录/历史 | EX-03 | 本轮无登录墙、无历史 | 通过 |
| audioUrl | RP-02/EX-06 恒 null | 收口#7 同 | API 通过；FAQ 文案另见 DEF-02 |
| 限流文案 | “a few names each day” | 收口#7 同 | 通过（`?generator=limit`） |
| GEO | 08 场景 | 主管：G-T10 已通过 | 本地烟雾通过；公网受阻 |
| HP-07 区块列表 | Hero→生成器→Free vs Custom→How→FAQ→Footer（未点名 Customize） | 实现含 Customize 表单且同页可达 | **文档差异/列表不全**；结构可接受 |

---

## 7. 按模块的场景结果表

图例：✅通过 · ❌失败 · ⛔受阻 · 📄文档差异 · ⬜未执行

### 7.1 Homepage（HP-01..14）

| ID | 结果 | 依据摘要 |
|----|------|----------|
| HP-01 | ✅ | Playwright：title 精确匹配 |
| HP-02 | ✅ | meta description 锁定原文 + 规定短语 |
| HP-03 | ✅ | H1 精确匹配 |
| HP-04 | ✅ | 定义句含 transliteration / fortune-telling |
| HP-05 | ✅ | 品牌 CallMeMing；副标题角色正确 |
| HP-06 | ✅ | 免费入口 + 付费表单同页，无登录 |
| HP-07 | ✅ | FAQ×3 含 “Is this fortune-telling?”；区块含 Customize（见文档差异） |
| HP-08 | ✅ | `?generator=` 强制态互斥抽查 |
| HP-09 | 📄 | 390 一主二从符合 exhibit，非旧「三竖卡」 |
| HP-10 | ✅ | 无命理输入；FAQ 否定八字/五行 |
| HP-11 | ✅ | 可交互后可点 Generate（烟雾） |
| HP-12 | ✅ | Empty：「Waiting for a click」，无假三卡 |
| HP-13 | ❌ | DEF-01 预填 Elena/Calm；价格 $6.99 本身 ✅ |
| HP-14 | ✅ | 无 `checkout=canceled` 依赖（HTML/代码） |

### 7.2 Free Name Cards（FC-01..12）

| ID | 结果 | 依据摘要 |
|----|------|----------|
| FC-01 | ✅ | 生成后主名+两从可见；无 why/intro |
| FC-02 | 📄 | 同 HP-09 / exhibit |
| FC-03 | ✅ | Generating「Writing names…」+ disabled |
| FC-04 | ✅ | empty/generating/limit/ready 互斥 |
| FC-05 | ✅ | 客户端 `postFreeNames`；无本地音译冒充 |
| FC-06 | ✅ | limit 文案含 “a few names each day”，无 3/10 次数 |
| FC-07 | ✅ | limit 后付费表单仍可填 |
| FC-08 | ✅ | 揭示不锁死（可滚动） |
| FC-09 | ✅ | 无抽签/翻牌/转盘 |
| FC-10 | ✅ | `prefers-reduced-motion` CSS + 立即出字 |
| FC-11 | ✅ | `free-names.ts` 网络错误友好文案；前端 error 态 |
| FC-12 | ✅ | cards 长度≠3 当错误（客户端校验） |

### 7.3 Free Name API（FN-01..10）

| ID | 结果 | 依据摘要 |
|----|------|----------|
| FN-01 | ✅ | live `{}` → 200，3 卡；📄 QA 未写 genderPreference |
| FN-02 | ✅ | 无 whyItFitsYou / selfIntroduction |
| FN-03 | ✅ | 汉字 2–3；三卡互异 |
| FN-04 | ✅ | 无八字/五行/幸运色字段 |
| FN-05 | ✅ | 同 IP 第 4 次 429 + retryAfterSeconds |
| FN-06 | ✅ | unit `rate-limit.test.ts` UTC 日 10→11（时钟夹具） |
| FN-07 | ✅ | vitest：只存 rate 事件，不落免费名正文；IP 哈希 |
| FN-08 | ✅ | `generateFreeCards` 词表抽样，注释/结构无 LLM |
| FN-09 | ✅ | 拼音声调符号，非数字调 |
| FN-10 | ✅ | 429 形状 `{error,message,retryAfterSeconds}` |

另：`genderPreference` 合法值 200；`other`→400（v1.1，超出旧 QA 正文但已测）。

### 7.4 Checkout 前端（CO-01..13）

| ID | 结果 | 依据摘要 |
|----|------|----------|
| CO-01 | ✅ | 提交 camelCase 小写枚举（frontend 单测 + 代码） |
| CO-02 | ✅ | 空名不发请求 + 字段错误 |
| CO-03 | ✅ | Name style 三文案（生成区+表单各一组） |
| CO-04 | ✅ | Feeling 六项锁定 |
| CO-05 | ✅ | 无命理字段 |
| CO-06 | ✅ | `redirectToCheckout`→`location.href`；单测禁 window.open |
| CO-07 | ⛔ | 真 Waffo Done 回跳未测 |
| CO-08 | ✅ | `submitting` 禁用提交钮 |
| CO-09 | ✅ | API 400 形状；UI 展示 fields/message |
| CO-10 | ✅ | 无 cancelUrl 依赖 |
| CO-11 | ✅ | mock 502 `checkout_create_failed`；UI 有错误分支 |
| CO-12 | ✅ | CTA `Continue to payment · $6.99` |
| CO-13 | ✅ | José 可通过客户端并发起请求；API 接受 François |

### 7.5 Paid checkout & fulfillment（PF-01..18）

| ID | 结果 | 依据摘要 |
|----|------|----------|
| PF-01 | ✅ | 缺 desiredFeeling → 400 validation_error |
| PF-02 | ✅ | genderPreference=other → 400 |
| PF-03 | ✅ | 空白 englishName → 400 |
| PF-04 | ✅ | José / François → 200 |
| PF-05 | ✅ | 仅 checkoutUrl；awaiting_payment；successUrl 含 token；无 cancelUrl/buyerEmail |
| PF-06 | ✅ | mock failNext → 502（真网关 ⛔ 见受阻） |
| PF-07 | ✅ | 随机 token 404；未付款无 cards |
| PF-08 | ✅ | 合法 token 早到 → 202 generating |
| PF-09 | ✅ | mock order.completed → 履约 3 卡 ready + 邮件 |
| PF-10 | ✅ | vitest 幂等，名卡仍 3 |
| PF-11 | ✅ | 错签 401 |
| PF-12 | ✅ | 无本地订单 → 2xx + alert |
| PF-13 | ✅ | expired 后 completed 仍履约 |
| PF-14 | ✅ | 路由先 2xx，履约异步（`after` / 测试显式 fulfill） |
| PF-15 | ✅ | ready 3 FullCard；声调；phoneticHint；audioUrl null |
| PF-16 | ✅ | 讲解无命理措辞；汉字像真人名 |
| PF-17 | ✅ | refunded → 404 同文案 |
| PF-18 | ✅ | 无 webhook 前不返回完整卡 |

### 7.6 Result page（RP-01..16）

| ID | 结果 | 依据摘要 |
|----|------|----------|
| RP-01 | 📄→按收口✅ | 主纸+Other candidates+Open paper；非三张同构；API 3 卡 |
| RP-02 | ✅ | phoneticHint 可见；audioUrl null；Play 为视觉态（exhibit） |
| RP-03 | ✅ | preparing 文案；非无效链接 |
| RP-04 | ✅ | frontend 单测：generating→ready 停轮询并渲染 |
| RP-05 | ✅* | 代码+常量 60s；墙钟未等（见受阻备注） |
| RP-06 | ✅ | failed 停轮询、无名卡 |
| RP-07 | ✅ | 404 友好；Wordmark 回首页；无名卡 |
| RP-08 | ✅ | 状态互斥（ready/generating/failed/404） |
| RP-09 | ✅ | Copy intro = 英文 selfIntroduction |
| RP-10 | ✅ | Copy name = 仅汉字 |
| RP-11 | 📄 | 390 主纸布局符合 exhibit；非旧三竖卡裁切图 |
| RP-12 | ❌ | DEF-03 |
| RP-13 | ✅ | 无命理铺满/抽签翻牌转盘 |
| RP-14 | ✅ | Copied 反馈不挡浏览其他候选 |
| RP-15 | ✅ | reduced-motion CSS 全局降动效 |
| RP-16 | ✅ | 单飞轮询间隔 2s；终态停止（代码+单测） |

### 7.7 Secure access & email（SE-01..12）

| ID | 结果 | 依据摘要 |
|----|------|----------|
| SE-01 | ✅ | 只存 hash；checkout 响应无 token |
| SE-02 | ✅ | 有效 token ready 可读 |
| SE-03 | ✅ | 随机 token 404 |
| SE-04 | ✅ | 时钟夹具过期 → 404 同文案 |
| SE-05 | ✅ | refunded → 404 |
| SE-06 | ✅ | 202 generating |
| SE-07 | ✅ | 履约后 ready |
| SE-08 | ✅ | failed 中性英文 |
| SE-09 | ⛔/✅mock | mock 发信通过；真 Resend 受阻 |
| SE-10 | ✅ | 站内无邮箱字段；不预填 buyerEmail |
| SE-11 | ✅ | 邮件失败仍 ready + emailError |
| SE-12 | ✅ | 无登录可读 |

### 7.8 GEO SEO（GEO-01..04, GEO-GATE）

| ID | 结果 | 依据摘要 |
|----|------|----------|
| GEO-01 | ✅ | 本地 HTML title/meta/H1 可抓取 |
| GEO-02 | ✅ | 品牌/副标题角色正确 |
| GEO-03 | ✅ | 定义句在页 |
| GEO-04 | ✅ | FAQ 含 Is this fortune-telling? |
| GEO-GATE | ✅* | 主管声明 G-T10 已通过；本报告引用，不推翻；公网 SERP 未测 |

### 7.9 Exclusions（EX-01..09）

| ID | 结果 | 依据摘要 |
|----|------|----------|
| EX-01 | ✅ | 无命理输入；交付文案不宣称命理依据 |
| EX-02 | ✅ | 无抽签/翻牌/转盘/八卦铺满 |
| EX-03 | ✅ | 无登录墙 |
| EX-04 | ✅ | 无站内刷卡 |
| EX-05 | ✅ | 无 cancelUrl 依赖 |
| EX-06 | ✅ API / ❌文案 | audioUrl null 通过；FAQ audio 见 DEF-02 |
| EX-07 | ✅ | 无文章页/分享图/谐音提示入口 |
| EX-08 | ✅ | 英语主路径、$6.99 USD |
| EX-09 | ✅ | checkout 仅 checkoutUrl |

---

## 8. 风险与建议（给程序开发主管 · 不改代码）

1. **有条件通过可进入下一闸门**，但建议在修 P2 文案/空态/剪贴板反馈前不要对外宣称「文案与交付完全一致」。
2. **优先改文案**：FAQ / Free vs Custom 去掉或改写 “playable audio / audio”，改为 phonetic / Play（视觉）表述，避免与 `audioUrl: null` 矛盾。
3. **付费空态**：上线表单去掉 Elena/Calm 演示预填，或明确产品决策修订 OpenSpec「空态」条款并同步 QA。
4. **剪贴板失败**：失败分支勿显示 Copied；给可选中文本或 toast。
5. **真云联调清单**（不挡本次有条件通过）：Waffo Test Done 回跳、Resend 收件、Supabase 持久化、webhook 真公钥。
6. **QA 迁仓前**：建议把 QA v1.0 中「三张同构卡」「免费 Body 仅 `{}`」等与 v1.1/exhibit 冲突处做文档修订，避免下轮误判。
7. **验收工作台**：Claude CLI / gstack 不可用；本轮用 Cursor + Vitest + Playwright + curl，标准未降级。

---

## 9. 关键证据索引

| 文件 | 用途 |
|------|------|
| `npm-test.txt` | 59 单测全绿 |
| `fn01.json` / `fn05-*.json` / `fn-invalid.json` | 免费 API / 频控 / 校验 |
| `pf0*.json` / `se03.json` | 结账校验与 404 |
| `homepage.html` / `gen-*.html` | SEO 与生成器态 HTML |
| `fulfillment-dump.json` | mock 履约全链路 |
| `vitest-fulfillment.txt` | webhook/e2e/rate-limit 复跑 |
| `ui-playwright-console.txt` / `ui-followup-log.json` | UI 断言日志 |
| `hp-desktop.png` / `hp-mobile-390-ready.png` | 首页视觉 |
| `fc01-ready-desktop.png` / `fc03-generating.png` / `fc06-limit.png` | 免费态 |
| `rp01-ready-desktop.png` / `rp11-ready-mobile-390.png` | 结果主纸布局 |
| `rp03-generating.png` / `rp06-failed.png` / `rp07-404.png` | 结果状态 |

---

## 10. 需要人工/浏览器补验的 UI 项（本机 headless 已尽量覆盖）

已用 Playwright headless 覆盖首页/390/结果态截图与复制。以下若主管要求「真人盯视觉像素级」仍可补：

1. 对照 exhibit PNG 的像素级色板/字号 diff（本轮做了信息架构与关键文案抽查，未做逐像素对比工具）。
2. 真机 Safari 上 `location.href` 跳转与剪贴板权限弹窗。
3. 真实 Waffo 成功页点 Done 后的回站手感（CO-07）。

---

**报告结束。**
