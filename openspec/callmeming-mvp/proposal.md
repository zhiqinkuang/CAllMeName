# Proposal：CallMeMing MVP（正式 OpenSpec）

- 版本：正式合并 v1.0
- 状态：前后端已审稿已合并；待测试工程师写 gstack QA；**QA 就绪前不实现**
- 日期：2026-11-08（Asia/Shanghai）
- 维护方：程序开发主管
- 关联 PRD：地道中文名独立站 PRD v0.4
- 工程规范：《程序开发工程规范》v1.2
- 合并来源：前端贡献包 frontend-contrib-0.10；后端 OpenSpec 评审通过 v0.4

## 1. 为什么做

正在学中文、或马上要和中国人打交道的英语用户，需要一个能拿去自我介绍的地道中文名。搜索流量真实，但常见工具要么随机拼字、要么整段音译、要么堆命理字段。CallMeMing 用「免费轻量名卡承接搜索 → 付费交付完整候选卡（含为什么适合你与自我介绍）」验证：有没有人愿意为定制名字和讲解付 $6.99。

## 2. 做什么（Must）

1. **英语落地页（Next.js）**：品牌一律写全称 **CallMeMing**；`A Real Chinese Name` 仅作副标题与搜索描述。Title / H1 / 定义句 / meta description 见 `specs/homepage.md`（原文锁定）。
2. **免费生成**：无需注册、无需生辰/八字；首页含 Name style（Typically feminine / Typically masculine / Either is fine），默认 Either is fine，不挡直接生成；`POST /api/names/free` 接受可选 `genderPreference`（缺省 `neutral`），返回 3 张轻量名卡（汉字 + 拼音）；禁止整段英文音译长串；同一 IP 频控（滚动小时窗口 ≤ 3 次；UTC 自然日 ≤ 10 次）。免费路径只走词表，不调 LLM。
3. **付费定制**：必填英文名、Name style（genderPreference）、希望传达的感觉；`POST /api/checkout` 只返回 `{ checkoutUrl }`；前端用 `window.location.href` 跳转 Waffo Pancake 托管收银台（$6.99 USD，不含税）。站内 CTA：`Continue to payment · $6.99`。
4. **付费交付**：仅在 webhook `order.completed` 确权后生成 3 张完整候选卡；结果页 `/results/[token]`；邮件（Resend）发安全链接与纯文本备份到 Waffo `buyerEmail`。
5. **技术栈**：Supabase（Postgres）+ Next.js，部署 Vercel；收款 Waffo Pancake（Merchant of Record）。
6. **视觉与交互**：以 `/workspace/callmeming-ui/` 已审桌面稿 + 390 手机生成区/结果页为准；prefers-reduced-motion；不做抽签/翻牌/转盘；不用八卦、罗盘、印章铺满。付费卡 Copy name（仅汉字）与 Copy intro 分开。

## 3. 不做什么（MVP 排除）

- 八字、五行、幸运色、命理报告或命理风动效（抽签/翻牌/转盘）
- 强制注册 / 登录 / 历史查询
- 多语言站、付费广告、人民币标价
- 单独的自我介绍文章页、可保存静态分享图、谐音风险提示
- 站内自建刷卡表单；依赖 `/?checkout=canceled`（Waffo 无 `cancelUrl`）
- TTS / 可点播音频（本轮 `audioUrl` 恒为 `null`）
- 站内表单收集或预填邮箱
- 对前端暴露 `sessionId` / `resultToken` / `orderId`
- 用 OpenSpec apply 或绕过 QA 文件直接写业务代码
- 抛开已审设计稿自行定视觉

## 4. 成功标准

1. 本正式 OpenSpec 完整，前后端契约一致，开放问题已落为 `design.md` §10 已定结论。
2. 测试工程师可据此编写 gstack QA 文件。
3. QA 就绪后按 `tasks.md` TDD 实现；前端代码写出后先交 GEO SEO 可见性验证，再进入后续验收（含 gstack）。
4. 产品行为可测：免费 3 名卡 + 频控；未付款看不到完整结果；付款后安全链接与邮件交付；webhook 幂等。

## 5. 影响面

| 角色 | 影响 |
|------|------|
| 前端 | 首页、免费名卡、结账跳转、结果页；消费 `api-contract.md`；代码写出后先交 GEO SEO |
| 后端 | 免费生成、限流、checkout、webhook 履约、安全链接、邮件 |
| UI 设计 | 已审桌面 + 390；实现以设计稿为准 |
| 测试 | 写 gstack QA；覆盖限流、校验、无取消回站、202、failed、404 等 |
| GEO SEO | 前端写出后做搜索与 AI 可见性验证 |
| 运维 | 域名、CORS、Resend SPF/DKIM、Waffo webhook URL |

## 6. 禁止事项（执行时）

- QA 文件就绪前写业务代码
- 实现者另写验收标准
- 双轨实现（OpenSpec apply + Superpowers 同时写同一批业务代码）
- 无设计依据时自行定稿界面与交互
- 编造未在 Waffo 官方文档核对过的字段
