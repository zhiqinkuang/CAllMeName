# Spec: Free Name Generation

- 能力：`free-name-generation`
- 产品：CallMeMing
- 版本：正式合并 v1.1
- 契约：`../../api-contract.md`

## Purpose

为未登录访客提供每次 3 个像真人会用的轻量中文名（汉字 + 拼音），承接搜索流量，并用 IP 频控避免刷新白嫖。不收集生辰，不做命理，不把英文名整段音译成长串。

## Requirements

### Requirement: 访客可免费生成三枚轻量名卡

系统 SHALL 允许未注册访客调用免费生成接口，且无需填写生辰、八字或命理字段。

#### Scenario: 成功返回三枚名卡

- GIVEN 请求方 IP 未超过频控阈值
- WHEN 客户端发送 `POST /api/names/free`
- THEN 响应状态为 `200`
- AND 响应 JSON 含恰好 3 个元素的 `cards` 数组
- AND 每个元素含非空 `hanzi` 与非空 `pinyin`
- AND 不要求请求携带账号或邮箱

#### Scenario: 名卡仅为轻量字段

- GIVEN 一次成功的免费生成
- WHEN 客户端读取响应
- THEN 每个名卡对象 SHALL 不包含完整讲解字段（无 `whyItFitsYou`、无 `selfIntroduction`）
- AND 前端仅需展示汉字与拼音

---

### Requirement: 名字形式像真人会用且禁止长串音译

系统生成的免费名 SHALL 采用典型中国人名形式（1 字姓 + 1–2 字名，总长 2 或 3 个汉字），且 SHALL NOT 把英文名整段逐音节音译为默认长串（例如「迈克尔」这类 ≥4 字音译）。

#### Scenario: 汉字长度合法

- GIVEN 一次成功的免费生成
- WHEN 检查每个 `hanzi`
- THEN 每个 `hanzi` 的汉字数量为 2 或 3
- AND 三个 `hanzi` 互不相同

#### Scenario: 不出现命理营销字段

- GIVEN 一次成功的免费生成
- WHEN 检查响应正文与生成提示词约束
- THEN 输出 SHALL NOT 包含八字、五行或幸运色内容

---

### Requirement: 同一 IP 频率限制

系统 SHALL 按客户端 IP 的哈希记录免费生成次数，并在超过阈值时拒绝。阈值（**已定**）：滚动小时窗口 ≤ 3 次；自然日按 **UTC** 计数，每天 ≤ 10 次。

#### Scenario: 小时额度用尽返回 429

- GIVEN 某 IP 在滚动一小时窗口内已成功生成 3 次
- WHEN 第 4 次调用 `POST /api/names/free`
- THEN 响应状态为 `429`
- AND `error` 为 `rate_limited`
- AND 含正整数 `retryAfterSeconds`
- AND 不返回新的 `cards`

#### Scenario: UTC 自然日额度用尽返回 429

- GIVEN 某 IP 在当前 UTC 自然日已成功生成 10 次
- WHEN 第 11 次调用 `POST /api/names/free`
- THEN 响应状态为 `429`
- AND `error` 为 `rate_limited`
- AND 含正整数 `retryAfterSeconds`
- AND 不返回新的 `cards`

#### Scenario: 不落库免费名字正文

- GIVEN 任意免费生成请求（成功或失败）
- WHEN 检查持久化存储
- THEN 系统 SHALL NOT 将免费 `hanzi`/`pinyin` 作为业务记录长期保存
- AND 仅允许保存 `ip_hash` 与时间戳用于频控

---

### Requirement: 免费路径只走词表且拼音带声调

系统 SHALL 仅从仓库内公有领域姓氏表（注明出处）与自建名字允许表抽样免费名，并用不当谐音拒绝表过滤；SHALL NOT 为免费生成调用 LLM；SHALL NOT 爬取商业起名站或许可证不明的数据集。返回的 `pinyin` SHALL 使用声调符号（如 `Lǐ Wěi`），SHALL NOT 使用数字音调。

#### Scenario: 免费生成不调用 LLM

- GIVEN 一次成功的免费生成
- WHEN 检查生成路径
- THEN 系统 SHALL NOT 调用 LLM
- AND 三个 `hanzi` 均来自词表抽样

#### Scenario: 拼音使用声调符号

- GIVEN 一次成功的免费生成
- WHEN 检查每个 `pinyin`
- THEN 使用声调符号（如 `Lǐ Wěi`）
- AND SHALL NOT 使用数字音调（如 `Li3 Wei3`）

---

### Requirement: 免费生成接受可选 Name style

系统 SHALL 接受可选的 `genderPreference`（`feminine` | `masculine` | `neutral`），并按该偏好从词表加权抽样。未传、为 `null` 或 Body 为 `{}` 时 SHALL 按 `neutral`（Either is fine）处理，SHALL NOT 因此返回 400。系统 SHALL 使用该字段，SHALL NOT 将其视为未知字段而丢弃或拒绝整单。非法枚举值 SHALL 返回 `400` 且 `error` 为 `validation_error`。

#### Scenario: 未传 genderPreference 时按 neutral 生成

- GIVEN 请求方 IP 未超过频控阈值
- WHEN 客户端发送 `POST /api/names/free` 且 Body 为 `{}`
- THEN 响应状态为 `200`
- AND 系统按 `neutral` 抽样
- AND 不要求请求携带账号或邮箱

#### Scenario: 传入 feminine 时按该偏好抽样

- GIVEN 请求方 IP 未超过频控阈值
- WHEN 客户端发送 `POST /api/names/free` 且 Body 为 `{ "genderPreference": "feminine" }`
- THEN 响应状态为 `200`
- AND 系统按 `feminine` 偏好抽样
- AND SHALL NOT 丢弃该字段后改按默认值处理

#### Scenario: 非法 genderPreference 返回 400

- GIVEN 请求方发送 `{ "genderPreference": "other" }`
- WHEN 调用 `POST /api/names/free`
- THEN 响应状态为 `400`
- AND `error` 为 `validation_error`

---

### Requirement: 错误形状与前端契约一致

免费接口的错误响应 SHALL 使用 `{ error, message, retryAfterSeconds?, fields? }`。

#### Scenario: 校验类错误

- GIVEN 请求体包含非法的 `genderPreference` 值
- WHEN 调用免费生成
- THEN 返回 `400` 且 `error` 为 `validation_error`
