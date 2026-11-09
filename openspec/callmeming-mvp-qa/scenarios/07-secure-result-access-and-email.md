# 验收契约：Secure Result Access and Email

- 追溯权威：`specs/secure-result-access-and-email/spec.md`；`api-contract.md` §3；`design.md` §7 / §10.2 / §10.5 / §10.7
- 表面：API / Storage / Email / Browser

---

## SE-01 原始 token 不落库且 checkout 不返回

- **场景**：只存 token 哈希；checkout 响应无 token
- **入口**：成功 `POST /api/checkout` 后检查 orders 与响应
- **前置条件**：结账成功
- **期望结果**：
  1. 存在 `result_token_hash`
  2. 不存在可逆还原原始 token 的列
  3. 响应 JSON 不含 token 字段
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：原始 token 不落库也不经 checkout 返回

---

## SE-02 有效 token 可读 ready 结果

- **场景**：正确原始 token + ready 订单返回 3 张完整卡
- **入口**：`GET /api/results/{token}`
- **前置条件**：订单 ready；持有正确原始 token
- **期望结果**：
  1. HTTP 200；`status` = `ready`
  2. 含 3 张完整卡
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：有效 token 可读取自己的结果

---

## SE-03 随机 token 统一 not_found

- **场景**：从未发行 token → 404，不泄露内部 id
- **入口**：`GET /api/results/{random}`
- **前置条件**：token 字符串从未发行
- **期望结果**：
  1. HTTP 404；`error` = `not_found`
  2. message 不包含内部 order id
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：随机 token 统一不存在

---

## SE-04 过期链接 404（1 年有效期）

- **场景**：超过 result_expires_at（自订单创建起 1 年）→ 404 无名卡
- **入口**：`GET /api/results/{token}`
- **前置条件**：token 哈希匹配但 `now > result_expires_at`
- **期望结果**：
  1. HTTP 404；`error` = `not_found`
  2. 不返回完整 `cards`
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：过期链接；`design.md` §10.2

---

## SE-05 退款后链接立即失效

- **场景**：refunded 订单原 token → 404，文案与无效/过期相同
- **入口**：`GET /api/results/{token}`
- **前置条件**：订单 `refunded`；仍持有原 token
- **期望结果**：
  1. HTTP 404；`error` = `not_found`
  2. message 与无效或过期链接相同
  3. 不返回完整 `cards`
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：退款后链接立即失效

---

## SE-06 回跳早于 webhook → generating

- **场景**：合法 token 但订单未 ready 时 202 generating
- **入口**：`/results/{token}` → results API
- **前置条件**：订单 awaiting_payment / paid / fulfilling
- **期望结果**：
  1. HTTP 202；`status` = `generating`
  2. 无完整定制卡字段
  3. UI 文案按「正在准备你的名字」，非无效链接
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：回跳早于 webhook

---

## SE-07 履约后轮询变为 ready

- **场景**：同一 token 从 generating 变为 ready 返回 3 卡
- **入口**：再次 `GET /api/results/{token}`
- **前置条件**：后台已处理 order.completed 并写好 3 卡
- **期望结果**：
  1. HTTP 200；`status` = `ready`
  2. 返回 3 张完整卡
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：履约完成后轮询变为 ready

---

## SE-08 生成失败可感知

- **场景**：订单 failed → 200 status=failed，中性英文说明
- **入口**：`GET /api/results/{token}`
- **前置条件**：订单因生成失败进入 `failed`
- **期望结果**：
  1. HTTP 200；`status` = `failed`
  2. 提供可展示的中性英文说明
  3. 不泄露内部堆栈
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：生成失败可感知

---

## SE-09 ready 后发送邮件（链接 + 纯文本备份）

- **场景**：履约成功后向 Waffo buyerEmail 发安全链接与三名纯文本备份
- **入口**：履约流程邮件步骤（Resend）
- **前置条件**：订单刚变为 ready；`buyer_email` 非空；尚未 `email_sent_at`
- **期望结果**：
  1. 向该邮箱发出一封邮件
  2. 正文含 `https://callmeming.com/results/{token}` 等价链接
  3. 含三个名字的汉字、近似读法与自我介绍纯文本
  4. SHALL NOT 附带动画或依赖动画才能阅读的内容
  5. `email_sent_at` 被设置
  6. 发件人形态为 `CallMeMing <hello@mail.callmeming.com>`（或与运维对齐后的 `hello@callmeming.com`）
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：ready 后发送邮件；`design.md` §10.5

---

## SE-10 站内不收集 / 不预填邮箱

- **场景**：checkout 请求 schema 无邮箱；不预填 Waffo buyerEmail
- **入口**：`POST /api/checkout` 与站点付费表单
- **前置条件**：检查请求 schema 与 UI
- **期望结果**：
  1. 请求 schema SHALL NOT 包含邮箱字段
  2. 系统不得预填 Waffo `buyerEmail`
  3. 只依赖 Waffo 收银台收集的邮箱经 webhook 回传
  4. 站内表单无邮箱输入
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：不强制站点二次收集邮箱；`design.md` §10.7

---

## SE-11 邮件失败不吞掉结果页

- **场景**：名卡已写入但邮件失败时 results 仍 ready
- **入口**：`GET /api/results/{token}`
- **前置条件**：名卡已写入；邮件服务商失败；记 `email_error`
- **期望结果**：
  1. 仍可 `status=ready` 看到名卡
  2. 订单记录邮件错误供运维重试
  3. 不向其他用户暴露该错误细节
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：邮件失败不吞掉结果页

---

## SE-12 无登录亦可读结果

- **场景**：无 Cookie/会话也能用合法 token 看 ready 结果
- **入口**：无登录状态下 `GET /api/results/{token}` 与结果页
- **前置条件**：合法 token；订单 ready
- **期望结果**：
  1. 仍返回 ready 完整卡
  2. 登录 / 注册不是查看付费结果的前置条件
- **优先级**：P0
- **追溯**：`specs/secure-result-access-and-email/spec.md` → Scenario：无会话亦可读结果；`proposal.md` §3
