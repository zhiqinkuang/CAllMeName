# 覆盖追溯表：正式 OpenSpec → QA 场景

权威目录：`/workspace/openspec/callmeming-mvp/`（正式 OpenSpec **v1.1**）  
QA 目录：`/workspace/openspec/callmeming-mvp-qa/`（QA **v1.1** 文档同步）  
场景总数：109（未增删 ID）  
视觉基准：`/workspace/callmeming-ui/exhibit/`

## specs/homepage.md

| OpenSpec 场景 / 要求 | QA ID |
|----------------------|-------|
| Document title | HP-01, GEO-01 |
| meta description | HP-02, GEO-01 |
| H1 | HP-03, GEO-01 |
| 首屏定义句 | HP-04, GEO-03 |
| 副标题角色 | HP-05, GEO-02 |
| 免费与付费同页可达（含免费 Name style） | HP-06, EX-03 |
| 上线首页结构与状态变体（含 Customize；390 一主二从） | HP-07, HP-08, HP-09, GEO-04 |
| 禁止命理主路径 | HP-10, EX-01, EX-02 |
| 首屏加载 | HP-11 |
| 免费区初始空态 | HP-12 |
| 付费区初始空态 | HP-13, CO-12 |
| 关闭收银台后无回调 | HP-14, CO-10, EX-05 |

## specs/free-name-cards.md

| OpenSpec 场景 / 要求 | QA ID |
|----------------------|-------|
| 成功生成三轻量名（UI 一主二从；API 3 FreeCard） | FC-01, FC-02 |
| 请求进行中 | FC-03 |
| 生成器状态互斥 | FC-04, HP-08 |
| 不在前端伪造音译 | FC-05 |
| 触发限流 | FC-06 |
| 限流后仍可付费 | FC-07 |
| 揭示不锁死操作 | FC-08 |
| 禁止命理动画 | FC-09, EX-02 |
| prefers-reduced-motion | FC-10 |
| 网络或 5xx | FC-11 |
| 响应形状异常 | FC-12 |

## specs/free-name-generation/spec.md

| OpenSpec 场景 / 要求 | QA ID |
|----------------------|-------|
| 成功返回三枚名卡 | FN-01 |
| 名卡仅为轻量字段 | FN-02 |
| 汉字长度合法 / 像真人会用 | FN-03 |
| 不出现命理营销字段 | FN-04, EX-01 |
| 小时额度用尽 429 | FN-05 |
| UTC 自然日额度用尽 429 | FN-06 |
| 不落库免费名字正文 | FN-07 |
| 免费生成不调用 LLM | FN-08 |
| 拼音使用声调符号 | FN-09 |
| 错误形状 | FN-10 |

## specs/checkout.md

| OpenSpec 场景 / 要求 | QA ID |
|----------------------|-------|
| 三字段均有效时允许提交 | CO-01, CO-03, CO-04 |
| 缺字段或不合法不发请求 | CO-02, CO-13 |
| 禁止命理字段 | CO-05, EX-01 |
| 跳转 checkoutUrl | CO-06, EX-04, EX-09 |
| 支付完成后回到结果页 | CO-07 |
| 提交中防重复 | CO-08 |
| API 400 | CO-09 |
| 关闭收银台不会回站 | CO-10, EX-05 |
| 创建 session 失败 | CO-11 |
| 价格与 CTA | CO-12 |

## specs/paid-checkout-and-fulfillment/spec.md

| OpenSpec 场景 / 要求 | QA ID |
|----------------------|-------|
| 缺字段拒绝结账 | PF-01 |
| 非法枚举拒绝 | PF-02 |
| 英文名长度边界 | PF-03 |
| 变音拉丁名可通过 | PF-04 |
| 结账成功只返回跳转 URL | PF-05, EX-09 |
| Waffo 失败 | PF-06 |
| 未付款不交付 | PF-07, PF-18 |
| 回跳早于 webhook → generating | PF-08, SE-06 |
| 首次 order.completed 履约 | PF-09 |
| webhook 幂等 | PF-10 |
| 签名无效 | PF-11 |
| 找不到本地订单 | PF-12 |
| expired 后仍履约 | PF-13 |
| 先 2xx 再异步 | PF-14 |
| 付费卡字段齐全 | PF-15, RP-01, RP-02 |
| 禁止命理内容 | PF-16, EX-01 |
| 退款后链接失效 | PF-17, SE-05 |

## specs/result-page.md

| OpenSpec 场景 / 要求 | QA ID |
|----------------------|-------|
| ready：API 3 FullCard；UI 主纸 + Other candidates + Open paper | RP-01 |
| 无音频降级 phoneticHint | RP-02, EX-06 |
| 有音频可播放（前瞻，本轮不交付） | 记录为非本轮；EX-06 锁定 audioUrl null |
| 进入 generating | RP-03 |
| 轮询转为 ready | RP-04 |
| 约 60s 提示邮件 | RP-05 |
| 生成失败 | RP-06 |
| 404 not_found | RP-07 |
| 状态互斥 | RP-08 |
| Copy intro | RP-09 |
| Copy name | RP-10 |
| 390 结果页主纸 + Other candidates（展厅；非三同构竖卡） | RP-11 |
| 剪贴板权限失败 | RP-12 |
| 揭示与书写感 / 禁命理 | RP-13, EX-02 |
| 复制与读音反馈 | RP-14 |
| prefers-reduced-motion | RP-15 |
| 轮询约定（api-contract） | RP-16 |

## specs/secure-result-access-and-email/spec.md

| OpenSpec 场景 / 要求 | QA ID |
|----------------------|-------|
| 原始 token 不落库不经 checkout 返回 | SE-01 |
| 有效 token 可读结果 | SE-02 |
| 随机 token 统一不存在 | SE-03 |
| 过期链接 | SE-04 |
| 退款后失效 | SE-05 |
| 回跳早于 webhook | SE-06 |
| 履约后变 ready | SE-07 |
| 生成失败可感知 | SE-08 |
| ready 后发邮件 | SE-09 |
| 不强制站点收集邮箱 | SE-10 |
| 邮件失败不吞结果 | SE-11 |
| 无会话亦可读 | SE-12, EX-03 |

## api-contract.md

| 章节 | QA ID |
|------|-------|
| §1 POST /api/names/free（v1.1 可选 genderPreference；`{}`/`null`/缺省→neutral；非法→400） | FN-*, FC-* |
| §2 POST /api/checkout | CO-*, PF-01..07 |
| §3 GET /api/results/:token | RP-*, SE-*, PF-08, PF-15 |
| §4 webhooks/waffo | PF-09..14, PF-17 |
| §5 权威支付确认 | PF-18 |

## design.md / proposal.md / tasks.md / README.md

| 来源 | QA ID |
|------|-------|
| design §2 信息架构与状态 | HP-*, FC-*, RP-* |
| design §3 数据模型 / 频控 | FN-05..07 |
| design §4 表单枚举 | CO-03, CO-04 |
| design §5 生成策略 | FN-03, FN-08, PF-16 |
| design §6 支付 | PF-05..14, CO-06, CO-10 |
| design §7 安全链接与邮件 | SE-* |
| design §10 已定结论 | 全部相关 P0（频控、1 年、audio null、无 cancelUrl、拼音声调等） |
| proposal §2 Must | 各 Critical Paths |
| proposal §3 Non-goals | EX-01..09 |
| tasks G-T10 GEO SEO | GEO-01..04, GEO-GATE |
| 展厅视觉：免费一主二从；结果主纸+Other candidates | RP-11, HP-09, FC-02 |

## 主管 must-cover 清单对齐

| 主管要求 | QA 覆盖 | 与正式包关系 |
|----------|---------|--------------|
| 免费 3 卡 + 滚动小时≤3 + UTC 日≤10；UI 只写 a few names each day | FC-01, FC-06, FN-01, FN-05, FN-06 | 一致 |
| checkout 只返回 checkoutUrl；location.href；无 cancelUrl | CO-06, CO-10, PF-05, EX-05, EX-09 | 一致 |
| 结果页 202 / 200 ready / 200 failed / 404 | RP-03..07, PF-08, PF-15, SE-06..08 | 一致 |
| Copy name / Copy intro | RP-09, RP-10 | 一致 |
| 桌面 + 390 对照展厅（一主二从 / 主纸+Other candidates） | HP-09, FC-02, RP-10, RP-11 | 以 exhibit 为准；旧「三同构竖卡」已弃 |
| 状态互斥 | HP-08, FC-04, RP-08 | 一致 |
| GEO SEO 写入契约，前端后 / gstack 前执行 | 08-geo-seo.md | 一致；细项不编造排名指标 |
| 品牌 / Title / H1 / 付费三字段 / $6.99 Waffo / 安全链接邮件 / 质量护栏 / 禁命理 | HP-*, CO-*, PF-*, SE-*, EX-*, FN-03 | 一致 |
| 主管底稿：音频能做就做非阻断 | — | **冲突**：正式包明确 audioUrl 恒 null、TTS 不做 → QA 跟正式包（RP-02, EX-06） |
| 主管底稿：拼音 + 英文近似必有 | RP-01, RP-02, PF-15 | 一致（phoneticHint 必有） |
