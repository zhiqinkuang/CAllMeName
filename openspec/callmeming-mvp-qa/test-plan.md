# Test Plan — CallMeMing MVP

- Generated for gstack QA consumption（验收契约阶段）
- Date：2026-11-08（Asia/Shanghai）
- Authority：`/workspace/openspec/callmeming-mvp/`
- QA dir：`/workspace/openspec/callmeming-mvp-qa/`
- Mode：acceptance-contract only（本阶段不执行、不修复、不写业务代码）

## Affected Pages / Routes

| 路由 / 端点 | 测什么 |
|-------------|--------|
| `GET /` | 品牌 / Title / H1 / 定义句 / 结构 / 免费 Name style + 四态 / 付费三字段 / CTA / 390 一主二从（展厅）/ 禁命理 |
| `POST /api/names/free` | 可选 genderPreference（缺省/`{}`/`null`→neutral；非法→400）；3 FreeCard、频控小时/日、不落库、不调 LLM、声调拼音 |
| `POST /api/checkout` | 校验、仅 checkoutUrl、无 token、无 cancelUrl、502 |
| 外部 Waffo Hosted Checkout | $6.99 USD；successUrl；无 cancelUrl；Done 后回站 |
| `GET /api/results/:token` | 202 generating / 200 ready / 200 failed / 404 |
| `/results/[token]` | 轮询、主纸+Other candidates+Open paper（API 仍 3 FullCard）、Copy name/intro、390 对照展厅、状态互斥 |
| `POST /api/webhooks/waffo` | 验签、幂等、履约、退款、找不到订单仍 2xx |
| Email（Resend） | 安全链接 + 纯文本备份；失败不吞结果 |

## Critical Paths（P0）

1. **免费主路径**：未登录 → 生成 3 轻量卡 → 限流文案不暴露数字 → 限流不挡付费  
   Value: protects=免费获客与反白嫖；fails_when=可无限刷或 UI 写出配额/假三卡；why_new=MVP 核心；seam=none；no_claim=不证明付费履约  
   场景：FC-01..07, FN-01..10, HP-06..10

2. **付费结账跳转**：三字段 → POST checkout → 仅 checkoutUrl → `location.href` → Waffo  
   Value: protects=收款入口正确；fails_when=window.open/暴露 token/站内刷卡/cancelUrl；why_new=MVP 核心；seam=none；no_claim=不证明 webhook 已达  
   场景：CO-01..13, PF-01..06

3. **履约与结果**：webhook order.completed → 3 FullCard → 安全链接 ready；早到则 202 轮询  
   Value: protects=付款后交付；fails_when=未付款可见完整卡或 202 当无效链；why_new=MVP 核心；seam=none；no_claim=邮件可达性受 DNS/Resend 运维影响时记环境风险  
   场景：PF-08..18, RP-01..08, SE-01..08

4. **复制与 390 布局**：Copy name 仅汉字；Copy intro 仅英文 selfIntroduction；结果页主纸+Other candidates；免费区/结果页对照展厅（一主二从，非三张同构竖卡）  
   Value: protects=可带走的自我介绍体验；fails_when=复制错字段或按旧三同构竖卡误判；why_new=展厅已审；seam=none；no_claim=不证明 TTS  
   场景：RP-09..11

5. **排除命理 / 音频 / 登录墙**：反向验收  
   Value: protects=品牌定位与范围；fails_when=出现八字五行幸运色或强制登录或非空 audioUrl；why_new=PRD/OpenSpec Non-goals；seam=none；no_claim=无  
   场景：EX-01..09, RP-02

## Edge Cases（P0）

- 小时第 4 次 / UTC 日第 11 次 429（FN-05, FN-06）
- checkout 400 / 502（CO-09, CO-11, PF-01..03, PF-06）
- José / François 英文名（CO-13, PF-04）
- webhook 重放幂等；错签 401；无本地订单 2xx（PF-10..12）
- expired 后仍履约（PF-13）
- refunded → 404 同文案（PF-17, SE-05）
- 60s 仍 generating 提示邮件（RP-05）
- 剪贴板拒绝（RP-12）
- 邮件失败仍 ready（SE-11）
- cards 形状异常（FC-12）

## Quick（~冒烟）

1. `/` — title / H1 / CallMeMing 全称可见（HP-01, HP-03, HP-05）
2. 免费生成一次 → 3 卡汉字+拼音（FC-01, FN-01）
3. 付费区可见 CTA `Continue to payment · $6.99` 与三字段（CO-12, HP-13）
4. checkout 成功响应形状仅 `checkoutUrl`（可用 mock）（PF-05）
5. 随机 results token → 404 友好（RP-07, SE-03）

## Standard（默认验收深度）

含 Quick，并加上：

1. 生成器四态互斥；429 文案 “a few names each day”（FC-04, FC-06）
2. 小时 / 日频控 API（FN-05, FN-06）
3. checkout：`location.href`、无 window.open、无 cancelUrl（CO-06, CO-10）
4. 结果页 202 轮询 → ready；failed；404（RP-03..07）
5. Copy name / Copy intro（RP-09, RP-10）
6. 桌面 + 390 对照展厅：免费一主二从、结果主纸+Other candidates（HP-09, RP-11）
7. webhook 履约 + 邮件纯文本（PF-09, SE-09）
8. 排除项抽查（EX-01..06）
9. **确认 GEO-GATE 已完成**（08-geo-seo.md）后再出系统级验收结论

## Exhaustive

含 Standard，并加上：

1. prefers-reduced-motion 免费卡与结果页（FC-10, RP-15）
2. 动效禁命理动画全路径（FC-08, FC-09, RP-13）
3. webhook：幂等、错签、无订单告警、expired 后履约、退款（PF-10..14, PF-17）
4. 英文名边界与变音（CO-02, CO-13, PF-03, PF-04）
5. 免费不调 LLM、不落库名字（FN-07, FN-08）
6. 付费讲解无命理措辞；汉字 2–3 字质量护栏（PF-16, FN-03）
7. 邮件失败不吞结果；无站内邮箱（SE-10, SE-11）
8. CORS / 健康检查等非本契约扩写项：仅当正式包另有任务时再验（本 QA 不扩 scope）

## GEO SEO（单独闸门，非 Quick 冒烟替代）

- 文件：`scenarios/08-geo-seo.md`
- 时机：`AFTER_FRONTEND_BEFORE_GSTACK`
- 负责人：GEO SEO 工程师；测试工程师在 gstack 验收前核对 GEO-GATE

## Tests to Retire

- none（无既有测试）

## Pending Decisions

- none（正式 OpenSpec 已定结论见 `design.md` §10；若评审变更则改本 QA）

## 场景文件索引

| 文件 | 前缀 | 数量（约） |
|------|------|------------|
| `scenarios/01-homepage.md` | HP | 14 |
| `scenarios/02-free-name-cards.md` | FC | 12 |
| `scenarios/03-free-name-generation-api.md` | FN | 10 |
| `scenarios/04-checkout.md` | CO | 13 |
| `scenarios/05-paid-checkout-and-fulfillment.md` | PF | 18 |
| `scenarios/06-result-page.md` | RP | 16 |
| `scenarios/07-secure-result-access-and-email.md` | SE | 12 |
| `scenarios/08-geo-seo.md` | GEO | 5 |
| `scenarios/09-exclusions-and-non-goals.md` | EX | 9 |
