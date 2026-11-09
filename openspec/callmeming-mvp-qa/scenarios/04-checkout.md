# 验收契约：Checkout（付费表单与结账跳转 · 前端）

- 追溯权威：`specs/checkout.md`；`api-contract.md` §2；`design.md` §2.2 / §4 / §6
- 表面：Browser

---

## CO-01 三字段均有效时提交正确 body

- **场景**：合法三字段提交调用 checkout，desiredFeeling 为小写枚举
- **入口**：首页付费表单 → 点击 `Continue to payment · $6.99`
- **前置条件**：英文名合法；已选 Name style；已选 desiredFeeling
- **期望结果**：
  1. 调用 `POST /api/checkout`
  2. body 为 camelCase：`{ englishName, genderPreference, desiredFeeling }`
  3. `desiredFeeling` 为小写枚举值之一（如 `friendly`），不得发送展示文案 `Friendly`
- **优先级**：P0
- **追溯**：`specs/checkout.md` → Scenario：三字段均有效时允许提交

---

## CO-02 客户端校验失败不发请求

- **场景**：缺字段或英文名不合法时阻止提交
- **入口**：付费表单提交
- **前置条件**：任一必填为空 / 未选；或 `englishName` trim 后为空、>80、或含非法字符（超出：带变音拉丁字母、空格、连字符、撇号）
- **期望结果**：
  1. 展示字段级校验提示
  2. SHALL NOT 调用 `POST /api/checkout`
- **优先级**：P0
- **追溯**：`specs/checkout.md` → Scenario：缺字段或英文名不合法时不发请求

---

## CO-03 Name style 文案与枚举

- **场景**：genderPreference UI 标签与选项文案正确，且非命理
- **入口**：付费表单 Name style 控件
- **前置条件**：表单可见
- **期望结果**：
  1. 字段标签为 **Name style**
  2. 选项文案：`Typically feminine` / `Typically masculine` / `Either is fine`
  3. 对应 API 值：`feminine` / `masculine` / `neutral`
  4. 语义为名字语气偏好，不是生理性别命理项
- **优先级**：P0
- **追溯**：`specs/checkout.md` Requirement：付费表单；`design.md` §4.1；`api-contract.md` UI 文案表

---

## CO-04 desiredFeeling 六选项锁定

- **场景**：希望传达的感觉为固定六选项，非自由文本、非命理
- **入口**：付费表单 desiredFeeling 控件
- **前置条件**：表单可见
- **期望结果**：
  1. 选项仅：Friendly / Calm / Bright / Elegant / Modern / Scholarly
  2. 提交值为小写：`friendly` / `calm` / `bright` / `elegant` / `modern` / `scholarly`
  3. SHALL NOT 改为命理项或自由字符串输入
- **优先级**：P0
- **追溯**：`specs/checkout.md`；`design.md` §4.2

---

## CO-05 禁止命理字段

- **场景**：付费表单不提供八字 / 五行 / 幸运色 / 生辰
- **入口**：渲染付费表单
- **前置条件**：表单可见
- **期望结果**：
  1. SHALL NOT 提供八字、五行、幸运色、生辰等命理输入
- **优先级**：P0
- **追溯**：`specs/checkout.md` → Scenario：禁止命理字段

---

## CO-06 成功后 location.href 跳转且仅 checkoutUrl

- **场景**：200 仅含 checkoutUrl 时用 location.href 跳转，不用 window.open
- **入口**：`POST /api/checkout` 成功后的前端跳转
- **前置条件**：返回 200 且 body 为 `{ checkoutUrl: string }`（不含 token）
- **期望结果**：
  1. 使用 `window.location.href = checkoutUrl` 跳转
  2. SHALL NOT 使用 `window.open`
  3. SHALL NOT 在站内渲染银行卡输入表单
  4. SHALL NOT 期望响应里带有结果 token / sessionId / orderId
- **优先级**：P0
- **追溯**：`specs/checkout.md` → Scenario：跳转 checkoutUrl；`api-contract.md` §2 前端约定

---

## CO-07 支付完成后经 Done 回结果页

- **场景**：Waffo successUrl 不自动跳转；用户点 Done 后进结果页并按 generating 处理
- **入口**：Waffo 成功页 → Done → `/results/[token]`
- **前置条件**：用户已在 Waffo 完成付款
- **期望结果**：
  1. 点 Done 后才回到 `/results/[token]`
  2. 结果页按合法 token、结果可能未就绪处理（可 202 generating 并轮询）
  3. SHALL NOT 在 202 时显示「无效链接」
- **优先级**：P0
- **追溯**：`specs/checkout.md` → Scenario：支付完成后回到结果页；`design.md` §10.6

---

## CO-08 提交中防重复

- **场景**：请求进行中忽略重复点击或保持禁用
- **入口**：付费提交按钮
- **前置条件**：已提交且请求进行中
- **期望结果**：
  1. 忽略重复提交或保持禁用，直至请求结束或已开始跳转
- **优先级**：P0
- **追溯**：`specs/checkout.md` → Scenario：提交中防重复

---

## CO-09 API 400 字段错误展示

- **场景**：服务端 validation_error 时展示 fields/message，不跳转
- **入口**：checkout 返回 400
- **前置条件**：body `{ error: "validation_error", message, fields? }`
- **期望结果**：
  1. 优先展示 `fields` 字段级错误，否则展示 `message`
  2. 用户可修改后重试
  3. SHALL NOT 跳转外部收银台
- **优先级**：P0
- **追溯**：`specs/checkout.md` → Scenario：API 400 校验错误

---

## CO-10 无 cancelUrl / 关闭收银台不回站

- **场景**：关闭收银台无取消回调；不依赖 canceled query
- **入口**：已跳转 Waffo 后关闭 / 未完成付款
- **前置条件**：官方无 cancelUrl
- **期望结果**：
  1. 前端 SHALL NOT 依赖 `/?checkout=canceled` 或任何取消回跳
  2. SHALL NOT 展示完整定制名卡
  3. SHALL NOT 认为用户已获得结果 token
  4. 自行回站后可再次填写并提交
- **优先级**：P0
- **追溯**：`specs/checkout.md` → Scenario：关闭收银台不会回站

---

## CO-11 checkout_create_failed / 网络失败

- **场景**：创建 session 失败时错误 + 重试，不声称已付款
- **入口**：`POST /api/checkout` 网络错误、5xx 或 `checkout_create_failed`
- **前置条件**：表单有效
- **期望结果**：
  1. 展示错误与重试
  2. SHALL NOT 声称已经付款成功
- **优先级**：P0
- **追溯**：`specs/checkout.md` → Scenario：创建 session 失败

---

## CO-12 CTA 与价格文案

- **场景**：站内 CTA 与价格为 $6.99
- **入口**：付费定制区提交区域
- **前置条件**：付费定制区可见
- **期望结果**：
  1. 站内 CTA 为 `Continue to payment · $6.99`
  2. 界面展示 `$6.99` 作为本次一次性商品价格
  3. 金额本身为 6.99 美元标价（税费可在结账另计，若文案需要）
  4. SHALL NOT 在站内展开托管收银台之外的刷卡表单
- **优先级**：P0
- **追溯**：`specs/checkout.md` → Scenario：表单旁价格与提交文案

---

## CO-13 英文名允许变音与连字符

- **场景**：客户端接受 José / François / Mary-Jane / O'Connor 类输入
- **入口**：englishName 字段
- **前置条件**：其余字段合法
- **期望结果**：
  1. 上述合法形式可通过客户端校验并发起请求（或至少不因变音符号被前端拦截）
  2. SHALL NOT 只限 ASCII 字母
- **优先级**：P0
- **追溯**：`specs/checkout.md`；`api-contract.md` §2 englishName 规则
