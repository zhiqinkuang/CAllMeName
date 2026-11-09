# Spec: Paid Checkout and Fulfillment

- 能力：`paid-checkout-and-fulfillment`
- 产品：CallMeMing
- 版本：正式合并 v1.0
- 契约：`../../api-contract.md`

## Purpose

用户提交简短定制表单后，经 Waffo Pancake 一次性支付 `$6.99 USD`（不含税标价）；**仅在 webhook 确认支付成功后**生成并交付 3 套完整候选名卡。未付款不得展示完整定制结果。

## Requirements

### Requirement: 结账前校验必填定制字段

系统 SHALL 在创建 Waffo checkout session 之前校验：`englishName`、`genderPreference`、`desiredFeeling` 均为必填且合法。`englishName` SHALL 在 trim 后长度为 1–80 个字符；允许带变音符号的拉丁字母、空格、连字符和撇号（如 Mary-Jane、O'Connor、José、François）；SHALL NOT 只接受 ASCII 字母。

#### Scenario: 缺字段拒绝结账

- GIVEN 请求体缺少 `desiredFeeling`
- WHEN 客户端发送 `POST /api/checkout`
- THEN 响应状态为 `400`
- AND `error` 为 `validation_error`
- AND 系统 SHALL NOT 调用 Waffo 创建 session
- AND 系统 SHALL NOT 写入完整名卡

#### Scenario: 非法枚举拒绝结账

- GIVEN `genderPreference` 为 `"other"`（非 `feminine`|`masculine`|`neutral`）
- WHEN 调用结账接口
- THEN 返回 `400` 且 `error` 为 `validation_error`

#### Scenario: 英文名长度边界

- GIVEN `englishName` 去首尾空白后为空或长度大于 80
- WHEN 调用结账接口
- THEN 返回 `400` 且 `error` 为 `validation_error`

#### Scenario: 带变音符号的拉丁名可通过校验

- GIVEN `englishName` 为 `"José"` 或 `"François"`，且其余字段合法
- WHEN 调用 `POST /api/checkout`
- THEN 系统 SHALL NOT 仅因变音符号返回 `400` 且 `error` 为 `validation_error`

---

### Requirement: 创建 Waffo 一次性收银台 session

系统 SHALL 使用 Waffo 官方 `create-session`（SDK 或 REST）创建对应的 **onetime** 商品 session，`currency` 为 `USD`，标价商品为 `$6.99`（Dashboard 配置）。

#### Scenario: 结账成功只返回跳转 URL

- GIVEN 合法定制字段且 Waffo Test/Prod 凭证可用
- WHEN 调用 `POST /api/checkout`
- THEN 响应 `200`
- AND 含非空 `checkoutUrl`
- AND 响应 SHALL NOT 包含 `resultToken`、`sessionId`、`orderId` 或 `resultPath`
- AND 本地订单状态为 `awaiting_payment`
- AND 创建 session 时传入 `orderMerchantExternalId` = 本地订单 id
- AND `successUrl` 为 `https://callmeming.com/results/{token}` 形式的绝对 https URL

#### Scenario: Waffo 失败不影响伪造已支付

- GIVEN Waffo 创建 session 返回错误
- WHEN 调用结账接口
- THEN 响应 `502` 且 `error` 为 `checkout_create_failed`
- AND 不存在面向用户的「已支付」状态
- AND 无 `name_cards` 行

#### Scenario: 未付款不交付完整结果

- GIVEN 订单处于 `awaiting_payment`
- WHEN 调用方不持有该单 result token
- THEN 无法通过 results API 读到完整 `cards`
- AND 随机 token 得到 `404 { error: "not_found" }`

#### Scenario: 支付回跳早于 webhook 时进入 generating

- GIVEN 用户已从 Waffo `successUrl` 打开 `/results/[token]`
- AND 订单仍为 `awaiting_payment` 或 `paid`/`fulfilling`
- WHEN `GET /api/results/:token`
- THEN 响应状态为 `202`
- AND `status` 为 `generating`
- AND 响应 SHALL NOT 包含完整 `cards`

---

### Requirement: 以 webhook 确认支付后才履约

系统 SHALL 在验证签名的 `order.completed` 且 `data.paymentStatus` 为 `succeeded` 之后，才生成 3 张完整候选卡并将订单置为 `ready`。

#### Scenario: 首次 order.completed 触发履约

- GIVEN 存在 `awaiting_payment` 订单，其 id 等于 webhook `data.orderMerchantExternalId`
- AND webhook 签名合法、`eventType` 为 `order.completed`
- WHEN 服务端处理该 webhook
- THEN 订单写入 `buyer_email`（来自 `data.buyerEmail`）、`waffo_order_id`、`waffo_payment_id`
- AND 系统生成恰好 3 条 `name_cards`（rank 1..3）
- AND 每张卡含 `hanzi`、`pinyin`、`phoneticHint`、`whyItFitsYou`、`selfIntroduction` 对应列
- AND `whyItFitsYou` 与 `selfIntroduction` 为英文
- AND 订单状态变为 `ready` 且 `fulfilled_at` 非空

#### Scenario: webhook 幂等不重复生成

- GIVEN 同一 `(eventType, eventId)` 已被成功处理且订单已 `ready`
- WHEN 相同 webhook 再次投递
- THEN 系统不新增 `name_cards` 行
- AND 仍返回处理成功语义（HTTP 2xx）
- AND 名卡数量仍为 3

#### Scenario: 签名无效拒绝

- GIVEN `X-Waffo-Signature` 无效
- WHEN 调用 `POST /api/webhooks/waffo`
- THEN 响应 `401`
- AND 不修改订单状态
- AND 不生成名卡

#### Scenario: 验签通过但找不到本地订单

- GIVEN webhook 签名合法
- AND 无法用 `orderMerchantExternalId` 或 `orderMetadata.orderId` 找到本地订单
- WHEN 处理该 webhook
- THEN 系统记高优先级告警
- AND 响应 HTTP 2xx
- AND SHALL NOT 以非 2xx 触发支付平台重试

#### Scenario: 本地曾标 expired 后收到已付款 webhook

- GIVEN 本地订单状态为 `expired`
- AND 收到签名合法且 `paymentStatus` 为 `succeeded` 的 `order.completed`
- WHEN 处理该 webhook
- THEN 系统仍须履约（进入 `paid`/`fulfilling` 并生成名卡）
- AND SHALL NOT 因过期态丢弃已付款订单

#### Scenario: webhook 先快速 2xx 再异步履约

- GIVEN 合法 `order.completed`
- WHEN 服务端接收
- THEN 在验签与幂等写入完成后尽快返回 2xx（官方 10 秒时限内）
- AND 生成名卡与发信在响应之后异步执行

---

### Requirement: 完整名卡内容与禁止项

付费名卡 SHALL 像真人会用：汉字 2–3 字；可轻微借鉴英文名读音但禁止整段音译长串；SHALL NOT 输出八字/五行/幸运色。

#### Scenario: 付费卡字段齐全

- GIVEN 订单 `ready`
- WHEN `GET /api/results/:token`
- THEN 响应 `200` 且 `status` 为 `ready`
- AND `cards.length` 为 3
- AND 每张含 `phoneticHint` 与英文 `whyItFitsYou`、`selfIntroduction`
- AND 本轮 MVP 每张卡的 `audioUrl` 为 `null`（不堵塞 ready）
- AND 每张卡的 `pinyin` 使用声调符号，SHALL NOT 使用数字音调

#### Scenario: 禁止命理内容

- GIVEN 履约生成流程
- WHEN 检查写入的 `whyItFitsYou`/`selfIntroduction` 与生成约束
- THEN 文本 SHALL NOT 宣称八字、五行或幸运色依据

---

### Requirement: 退款事件可追踪

系统 SHALL 处理 `refund.succeeded`，将订单标记为 `refunded`；此后 results API SHALL 返回 `404 { error: "not_found" }`，文案与无效或过期链接相同。

#### Scenario: 退款后订单可识别且链接立即失效

- GIVEN 订单已 `ready` 且收到合法 `refund.succeeded` 对应同一 Waffo order
- WHEN 处理完成
- THEN 本地订单状态为 `refunded`
- AND 随后持原 token 查询 results 返回 `404` 且 `error` 为 `not_found`
- AND message 与无效或过期链接相同
- AND 不返回完整 `cards`
