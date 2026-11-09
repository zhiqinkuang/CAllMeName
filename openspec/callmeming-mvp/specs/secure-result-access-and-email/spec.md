# Spec: Secure Result Access and Email

- 能力：`secure-result-access-and-email`
- 产品：CallMeMing
- 版本：正式合并 v1.0
- 契约：`../../api-contract.md`

## Purpose

付费用户无需注册，即可通过不可猜测的安全链接查看 3 张完整候选名卡；同时将链接与纯文本备份发送到 Waffo 付款邮箱。回跳时支付确认可能尚未完成，结果接口必须支持 `202 generating` 与轮询。

## Requirements

### Requirement: 安全链接基于不可猜测 token 且只存哈希

系统 SHALL 为每笔结账订单生成高熵随机 token；URL 形如 `https://callmeming.com/results/{token}`；数据库 SHALL 只存储 token 的哈希，SHALL NOT 存储原始 token。checkout API SHALL NOT 返回该 token。

#### Scenario: 原始 token 不落库也不经 checkout 返回

- GIVEN 成功创建 checkout
- WHEN 检查 `orders` 表与 checkout 响应
- THEN 存在 `result_token_hash`
- AND 不存在可逆还原原始 token 的列
- AND 响应 JSON 不含 token 字段

#### Scenario: 有效 token 可读取自己的结果

- GIVEN 订单已 `ready` 且客户端持有正确原始 token
- WHEN `GET /api/results/{token}`
- THEN 返回 `200` 且 `status` 为 `ready`
- AND 含 3 张完整卡

---

### Requirement: 无效或过期访问不泄露其他订单信息

系统对无法识别、已过期或已退款的 token SHALL 返回统一的不存在语义；错误信息 SHALL NOT 暗示其他订单是否存在。

#### Scenario: 随机 token 统一不存在

- GIVEN 从未发行过的 token 字符串
- WHEN 查询 results
- THEN 返回 `404` 且 `error` 为 `not_found`
- AND message 不包含内部 order id

#### Scenario: 过期链接

- GIVEN token 哈希匹配但 `now > result_expires_at`（有效期已定：自订单创建起 1 年）
- WHEN 查询 results
- THEN 返回 `404` 且 `error` 为 `not_found`
- AND 不返回完整 `cards` 内容

#### Scenario: 退款后链接立即失效

- GIVEN 订单状态为 `refunded` 且客户端仍持有原 token
- WHEN 查询 results
- THEN 返回 `404` 且 `error` 为 `not_found`
- AND message 与无效或过期链接相同
- AND 不返回完整 `cards` 内容

---

### Requirement: 支付确认延迟下的 generating 与轮询

当用户已到达结果页但 webhook 尚未完成履约时，系统 SHALL 返回 `202 { status: "generating" }`，并允许客户端按约定轮询直至 `ready`/`failed`/`404`。结果页文案应按「正在准备你的名字」来写，SHALL NOT 在 202 时表现为无效链接。

#### Scenario: 回跳早于 webhook

- GIVEN 用户打开 `/results/{token}` 且订单仍为 `awaiting_payment`、`paid` 或 `fulfilling`
- WHEN 调用 results API
- THEN 响应状态为 `202`
- AND `status` 为 `generating`
- AND 无完整定制卡字段

#### Scenario: 履约完成后轮询变为 ready

- GIVEN 同一 token 先前为 `generating`
- AND 后台已处理 `order.completed` 并写好 3 卡
- WHEN 客户端再次 `GET /api/results/{token}`
- THEN 响应 `200` 且 `status` 为 `ready`
- AND 返回 3 张完整卡

#### Scenario: 生成失败可感知

- GIVEN 订单因生成失败进入 `failed`
- WHEN 查询 results
- THEN 响应 `200` 且 `status` 为 `failed`
- AND 提供可展示的中性英文说明（不泄露内部堆栈）

---

### Requirement: 付款邮箱来自 Waffo 并发送备份邮件

系统 SHALL 使用 Resend，以 webhook 中的 `buyerEmail` 作为收件人，在履约成功后发送邮件。发件人暂定 `CallMeMing <hello@mail.callmeming.com>`（若主域更好配可改为 `hello@callmeming.com`，与运维对齐）。邮件 MUST 包含安全链接以及三名、读法、自我介绍的纯文本备份；SHALL NOT 附带动画或依赖动画才能阅读的内容。

#### Scenario: ready 后发送邮件

- GIVEN 订单刚变为 `ready` 且 `buyer_email` 非空且尚未 `email_sent_at`
- WHEN 履约流程执行邮件步骤
- THEN 向该邮箱发出一封邮件
- AND 邮件正文含 `https://callmeming.com/results/{token}` 等价链接
- AND 邮件含三个名字的汉字、近似读法与自我介绍纯文本
- AND `email_sent_at` 被设置

#### Scenario: 不强制站点二次收集邮箱

- GIVEN 用户调用 `POST /api/checkout`
- WHEN 检查请求 schema
- THEN 请求 schema SHALL NOT 包含邮箱字段
- AND 系统不得预填 Waffo `buyerEmail`
- AND 系统只依赖 Waffo 收银台收集的邮箱经 webhook 回传

#### Scenario: 邮件失败不吞掉结果页

- GIVEN 名卡已写入但邮件服务商失败
- WHEN 用户查询 results
- THEN 仍可 `status=ready` 看到名卡
- AND 订单记录邮件错误供运维重试
- AND 不向其他用户暴露该错误细节

---

### Requirement: MVP 不要求登录

系统 SHALL NOT 将登录或注册作为查看付费结果的前置条件。

#### Scenario: 无会话亦可读结果

- GIVEN 合法 token 与 `ready` 订单
- WHEN 在无登录 Cookie/会话下请求 results
- THEN 仍返回 `ready` 完整卡
