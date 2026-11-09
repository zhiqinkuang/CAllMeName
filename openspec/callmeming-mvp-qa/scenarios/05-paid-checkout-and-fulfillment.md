# 验收契约：Paid Checkout and Fulfillment（后端结账与履约）

- 追溯权威：`specs/paid-checkout-and-fulfillment/spec.md`；`api-contract.md` §2–§5；`design.md` §3 / §5 / §6 / §10
- 表面：API / Webhook / Storage

---

## PF-01 缺字段拒绝结账

- **场景**：缺少 desiredFeeling（或其它必填）时 400，不调 Waffo、不写完整卡
- **入口**：`POST /api/checkout`
- **前置条件**：请求体缺少 `desiredFeeling`（或其它必填）
- **期望结果**：
  1. HTTP 400；`error` = `validation_error`
  2. SHALL NOT 调用 Waffo 创建 session
  3. SHALL NOT 写入完整名卡
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：缺字段拒绝结账

---

## PF-02 非法枚举拒绝

- **场景**：genderPreference 非法值返回 validation_error
- **入口**：`POST /api/checkout`
- **前置条件**：`genderPreference` = `"other"`（非 feminine|masculine|neutral）
- **期望结果**：
  1. HTTP 400；`error` = `validation_error`
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：非法枚举拒绝结账

---

## PF-03 英文名长度边界

- **场景**：trim 后空或 >80 返回 validation_error
- **入口**：`POST /api/checkout`
- **前置条件**：`englishName` 去首尾空白后为空或长度大于 80
- **期望结果**：
  1. HTTP 400；`error` = `validation_error`
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：英文名长度边界

---

## PF-04 变音拉丁名可通过校验

- **场景**：José / François 等不因变音符号被拒
- **入口**：`POST /api/checkout`
- **前置条件**：`englishName` 为 `"José"` 或 `"François"`，其余字段合法；Waffo 可用或可 mock
- **期望结果**：
  1. SHALL NOT 仅因变音符号返回 400 `validation_error`
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：带变音符号的拉丁名可通过校验

---

## PF-05 结账成功只返回 checkoutUrl

- **场景**：200 响应仅含 checkoutUrl；本地 awaiting_payment；successUrl 含 token
- **入口**：`POST /api/checkout`
- **前置条件**：合法定制字段；Waffo 凭证可用（Test/Prod）
- **期望结果**：
  1. HTTP 200；含非空 `checkoutUrl`
  2. 响应 SHALL NOT 包含 `resultToken`、`sessionId`、`orderId`、`resultPath`
  3. 本地订单状态为 `awaiting_payment`
  4. 创建 session 传入 `orderMerchantExternalId` = 本地订单 id
  5. `successUrl` 为 `https://callmeming.com/results/{token}` 形式的绝对 https URL
  6. 创建 session：**无** `cancelUrl`；**不传** `buyerEmail`；`currency: USD`；商品 $6.99、`taxIncluded: false`（按设计）
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：结账成功只返回跳转 URL；`design.md` §6.1；`api-contract.md` §2

---

## PF-06 Waffo 失败返回 502

- **场景**：Waffo create-session 失败时 checkout_create_failed，无已支付态、无名卡
- **入口**：`POST /api/checkout`
- **前置条件**：Waffo 创建 session 返回错误
- **期望结果**：
  1. HTTP 502；`error` = `checkout_create_failed`
  2. 不存在面向用户的「已支付」状态
  3. 无 `name_cards` 行
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：Waffo 失败不影响伪造已支付

---

## PF-07 未付款不能读完整结果

- **场景**：awaiting_payment 时随机 token 404；无私有 token 则读不到 cards
- **入口**：`GET /api/results/:token`
- **前置条件**：订单 `awaiting_payment`；调用方不持有该单 result token，或使用随机 token
- **期望结果**：
  1. 随机 token → `404 { error: "not_found" }`
  2. 无法通过 results API 读到完整 `cards`（未付款不交付）
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：未付款不交付完整结果

---

## PF-08 回跳早于 webhook → 202 generating

- **场景**：合法 token 但未 ready 时 202，不含 cards
- **入口**：`GET /api/results/:token`
- **前置条件**：用户已从 successUrl 打开结果页；订单仍为 awaiting_payment / paid / fulfilling
- **期望结果**：
  1. HTTP 202；`status` = `generating`
  2. 响应 SHALL NOT 包含完整 `cards`
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：支付回跳早于 webhook 时进入 generating

---

## PF-09 首次 order.completed 触发履约

- **场景**：合法 webhook 后生成 3 卡并 ready
- **入口**：`POST /api/webhooks/waffo`（`order.completed`，`paymentStatus=succeeded`）
- **前置条件**：存在 awaiting_payment 订单；签名合法；`orderMerchantExternalId` 匹配
- **期望结果**：
  1. 写入 `buyer_email`（来自 `data.buyerEmail`）、waffo order/payment ids
  2. 生成恰好 3 条 `name_cards`（rank 1..3）
  3. 每张含 hanzi、pinyin、phoneticHint、whyItFitsYou、selfIntroduction 对应列
  4. whyItFitsYou 与 selfIntroduction 为英文
  5. 订单 → `ready`；`fulfilled_at` 非空
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：首次 order.completed 触发履约

---

## PF-10 webhook 幂等

- **场景**：同一 (eventType, eventId) 重放不重复生成
- **入口**：重复投递已处理 webhook
- **前置条件**：订单已 ready；该事件已成功处理
- **期望结果**：
  1. 不新增 `name_cards` 行
  2. 仍返回 HTTP 2xx
  3. 名卡数量仍为 3
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：webhook 幂等不重复生成

---

## PF-11 签名无效 401

- **场景**：无效签名不改订单、不生成卡
- **入口**：`POST /api/webhooks/waffo`
- **前置条件**：`X-Waffo-Signature` 无效
- **期望结果**：
  1. HTTP 401
  2. 不修改订单状态
  3. 不生成名卡
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：签名无效拒绝

---

## PF-12 找不到本地订单仍 2xx + 告警

- **场景**：验签通过但无本地订单时告警并 2xx
- **入口**：webhook 处理
- **前置条件**：签名合法；无法用 orderMerchantExternalId / orderMetadata.orderId 找到本地订单
- **期望结果**：
  1. 记高优先级告警
  2. 响应 HTTP 2xx
  3. SHALL NOT 以非 2xx 触发支付平台重试
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：验签通过但找不到本地订单；`design.md` §10.10

---

## PF-13 expired 后合法 completed 仍履约

- **场景**：本地曾 expired 后收到已付款 webhook 仍须履约
- **入口**：webhook `order.completed` succeeded
- **前置条件**：本地订单 `expired`；签名合法
- **期望结果**：
  1. 仍履约（进入 paid/fulfilling 并生成名卡）
  2. SHALL NOT 因过期态丢弃已付款订单
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：本地曾标 expired 后收到已付款 webhook

---

## PF-14 webhook 先 2xx 再异步履约

- **场景**：验签与幂等写入后尽快 2xx；生成与发信异步
- **入口**：合法 `order.completed`
- **前置条件**：可观测响应时序与异步任务
- **期望结果**：
  1. 验签与幂等写入完成后尽快返回 2xx（官方 10 秒时限内）
  2. 生成名卡与发信在响应之后异步执行
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：webhook 先快速 2xx 再异步履约

---

## PF-15 付费卡字段齐全与 audioUrl null

- **场景**：ready 时 3 张 FullCard；声调拼音；phoneticHint；audioUrl 恒 null
- **入口**：`GET /api/results/:token`
- **前置条件**：订单 ready
- **期望结果**：
  1. HTTP 200；`status` = `ready`；`cards.length` = 3
  2. 每张含 `phoneticHint` 与英文 `whyItFitsYou`、`selfIntroduction`
  3. 本轮每张 `audioUrl` 为 `null`（不堵塞 ready）
  4. `pinyin` 使用声调符号，SHALL NOT 数字音调
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：付费卡字段齐全；`design.md` §10.8 / §10.11

---

## PF-16 禁止命理内容（付费讲解）

- **场景**：whyItFitsYou / selfIntroduction 不宣称八字五行幸运色
- **入口**：履约生成写入内容检查
- **前置条件**：订单 ready
- **期望结果**：
  1. 文本 SHALL NOT 宣称八字、五行或幸运色依据
  2. 汉字形式仍像真人会用（2–3 字；禁止整段音译长串）
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：禁止命理内容；Requirement：完整名卡内容与禁止项

---

## PF-17 退款后链接 404

- **场景**：refund.succeeded 后订单 refunded，原 token results 404 同文案
- **入口**：处理 `refund.succeeded` 后 `GET /api/results/:token`
- **前置条件**：订单曾 ready；收到合法退款事件
- **期望结果**：
  1. 本地订单状态 `refunded`
  2. results 返回 404；`error` = `not_found`
  3. message 与无效 / 过期链接相同
  4. 不返回完整 `cards`
- **优先级**：P0
- **追溯**：`specs/paid-checkout-and-fulfillment/spec.md` → Scenario：退款后订单可识别且链接立即失效

---

## PF-18 权威支付确认以 webhook 为准

- **场景**：未 webhook 确权前 results 不得返回完整定制名卡
- **入口**：仅浏览器回跳、无成功 webhook
- **前置条件**：用户到了结果页但无 order.completed succeeded 履约
- **期望结果**：
  1. 不以浏览器回跳作为已支付权威确认
  2. 未进入 ready 前，results 不得返回完整定制名卡
- **优先级**：P0
- **追溯**：`api-contract.md` §5；`design.md` §1
