# Spec：Checkout（付费表单与结账跳转）

- 状态：正式合并 v1.0
- 价格：一次性数字商品 **$6.99 USD**（不含税；税由 Waffo 在结账时按地区处理）
- 支付：Waffo Pancake 托管收银台；站内不自建刷卡表单
- 依据：PRD v0.4；前端贡献包 0.10；契约 `../api-contract.md`

## Requirement：付费表单 SHALL 收集三字段且均必填

付费定制表单 SHALL 包含且仅以以下业务字段为 Must 输入（不得堆命理项）：

1. `englishName`（英文名）— 文本，必填；提交前 SHALL trim，trim 后长度 1–80；允许带变音符号的拉丁字母、空格、连字符和撇号（如 Mary-Jane、O'Connor、José、François），SHALL NOT 只限 ASCII 字母  
2. `genderPreference` — `feminine` / `masculine` / `neutral`；字段标签 **Name style**，UI 文案：`Typically feminine` / `Typically masculine` / `Either is fine`（对应上列 API 值；名字语气偏好，不是命理）  
3. `desiredFeeling` — 必填，锁定为 `"friendly"` / `"calm"` / `"bright"` / `"elegant"` / `"modern"` / `"scholarly"`  

`desiredFeeling` 文案映射（value 用小写）：  
`friendly`→Friendly，`calm`→Calm，`bright`→Bright，`elegant`→Elegant，`modern`→Modern，`scholarly`→Scholarly；SHALL NOT 改为命理项，也不得改成自由字符串

### Scenario：三字段均有效时允许提交

- GIVEN 用户已填写符合规则的英文名，并选择了性别偏好与希望传达的感觉
- WHEN 用户点击支付/结账提交
- THEN 前端 SHALL 调用 `POST /api/checkout`，body 为 camelCase JSON：  
  `{ englishName, genderPreference, desiredFeeling }`  
- AND `desiredFeeling` SHALL 为小写枚举值之一（如 `friendly`），不得发送展示文案 `Friendly`

### Scenario：缺字段或英文名不合法时不发请求

- GIVEN 任一必填字段为空或未选择，或 `englishName` 在 trim 后为空、超过 80 个字符，或不只包含带变音符号的拉丁字母、空格、连字符和撇号
- WHEN 用户尝试提交
- THEN 前端 SHALL 阻止提交并展示字段级校验提示
- AND SHALL NOT 调用 `POST /api/checkout`

### Scenario：禁止命理字段

- GIVEN 用户查看付费表单
- WHEN 渲染表单控件
- THEN 系统 SHALL NOT 提供八字、五行、幸运色、生辰等命理输入

## Requirement：成功创建收银台后 SHALL 跳转托管支付页

### Scenario：跳转 checkoutUrl

- GIVEN 表单校验通过
- WHEN `POST /api/checkout` 返回 200 且 body 为 `{ checkoutUrl: string }`（不含 token）
- THEN 前端 SHALL 使用 `window.location.href = checkoutUrl` 跳转
- AND SHALL NOT 使用 `window.open`（Waffo 文档：Safari / 移动端会拦截）
- AND SHALL NOT 在站内渲染银行卡输入表单（付款页由 Waffo 托管；设计范围止于 `Continue to payment · $6.99`）
- AND SHALL NOT 期望响应里带有结果 token

### Scenario：支付完成后回到结果页

- GIVEN 用户已在 Waffo 完成付款
- WHEN Waffo 的 successUrl 未自动跳转
- THEN 用户点 Done 后才回到 `/results/[token]`
- AND 前端结果页 SHALL 按合法 token 但结果可能尚未就绪来处理（`202 generating` 并轮询），SHALL NOT 显示无效链接

### Scenario：提交中防重复

- GIVEN 用户已提交且请求进行中
- WHEN 用户再次点击提交
- THEN 系统 SHALL 忽略重复提交或保持禁用，直至请求结束或已开始跳转

## Requirement：校验失败与支付取消 SHALL 有友好兜底

### Scenario：API 400 校验错误

- GIVEN 前端已提交
- WHEN `POST /api/checkout` 返回 400 且 body 为 `{ error: "validation_error", message: string, fields?: { [field: string]: string } }`
- THEN 界面 SHALL 优先展示 `fields` 中的字段级错误，否则展示 `message`
- AND 用户 SHALL 能修改后重试
- AND SHALL NOT 跳转外部收银台

### Scenario：关闭收银台不会回站

- GIVEN 用户已跳转 Waffo 但关闭收银台或未完成付款
- WHEN Waffo 不发送取消回调（官方没有 `cancelUrl`）
- THEN 前端 SHALL NOT 依赖 `/?checkout=canceled` 或任何取消回跳
- AND SHALL NOT 展示完整定制名卡
- AND SHALL NOT 认为用户已获得结果 token
- AND 用户之后自行回到本站时，可再次填写并提交付费表单

### Scenario：创建 session 失败

- GIVEN 表单有效
- WHEN `POST /api/checkout` 因网络或 5xx/`checkout_create_failed` 失败
- THEN 系统 SHALL 展示错误与重试
- AND SHALL NOT 声称已经付款成功

## Requirement：价格展示 SHALL 明确为 $6.99

### Scenario：表单旁价格与提交文案

- GIVEN 付费定制区可见
- WHEN 用户阅读提交区域
- THEN 站内 CTA SHALL 为 `Continue to payment · $6.99`
- AND 界面 SHALL 展示 `$6.99` 作为本次一次性商品价格
- AND 文案可注明税费可能在结账时另计（若产品文案需要），但金额本身 SHALL 为 6.99 美元标价
- AND SHALL NOT 在站内展开托管收银台之外的刷卡表单
