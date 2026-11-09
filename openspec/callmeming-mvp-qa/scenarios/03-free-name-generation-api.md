# 验收契约：Free Name Generation（API / 后端）

- 追溯权威：`specs/free-name-generation/spec.md`；`api-contract.md` §1；`design.md` §3.1 / §5 / §10.1
- 表面：API / Storage

---

## FN-01 成功返回三枚轻量名卡

- **场景**：未超限 IP 调用免费接口得到恰好 3 张 FreeCard；可选 `genderPreference`（v1.1）
- **入口**：`POST /api/names/free`
- **前置条件**：请求方 IP 未超过频控；无需账号或邮箱
- **期望结果**：
  1. Body 可为 `{}`，也可含可选 `genderPreference`（`feminine` / `masculine` / `neutral`）；**不是**「只能 `{}` / 不允许字段 / Body 必须为空对象」
  2. 未传、`null` 或 Body 为 `{}` 时按 `neutral` 抽样，仍返回 HTTP 200（不因此 400）
  3. 合法 `genderPreference` 时 HTTP 200，且服务端使用该字段做词表抽样（不得当未知字段丢弃）
  4. 非法枚举（如 `"other"`）→ HTTP 400，`error` = `validation_error`（可含 `fields.genderPreference`）
  5. 成功时 JSON 含恰好 3 个元素的 `cards`；每个元素含非空 `hanzi` 与非空 `pinyin`
  6. 不要求请求携带账号或邮箱
- **优先级**：P0
- **追溯**：`api-contract.md` v1.1 §1；`specs/free-name-generation/spec.md` → Scenario：成功返回三枚名卡

---

## FN-02 名卡仅为轻量字段

- **场景**：免费响应不含完整讲解字段
- **入口**：同 FN-01 成功响应
- **前置条件**：FN-01 成功
- **期望结果**：
  1. 每个名卡对象 SHALL NOT 包含 `whyItFitsYou`
  2. SHALL NOT 包含 `selfIntroduction`
- **优先级**：P0
- **追溯**：`specs/free-name-generation/spec.md` → Scenario：名卡仅为轻量字段

---

## FN-03 汉字长度 2 或 3 且互异

- **场景**：免费名像真人会用：2–3 汉字，三卡互异
- **入口**：成功免费生成响应
- **前置条件**：FN-01 成功
- **期望结果**：
  1. 每个 `hanzi` 汉字数量为 2 或 3
  2. 三个 `hanzi` 互不相同
  3. SHALL NOT 出现 ≥4 字整段音译长串作为默认输出
- **优先级**：P0
- **追溯**：`specs/free-name-generation/spec.md` → Scenario：汉字长度合法；Requirement：名字形式像真人会用

---

## FN-04 免费输出无命理营销字段

- **场景**：免费响应不含八字 / 五行 / 幸运色
- **入口**：成功免费生成响应与生成约束
- **前置条件**：FN-01 成功
- **期望结果**：
  1. 输出 SHALL NOT 包含八字、五行或幸运色内容
- **优先级**：P0
- **追溯**：`specs/free-name-generation/spec.md` → Scenario：不出现命理营销字段

---

## FN-05 滚动小时窗口 ≤3 → 第 4 次 429

- **场景**：同一 IP 滚动一小时内第 4 次免费生成被拒
- **入口**：`POST /api/names/free`
- **前置条件**：该 IP（按哈希）在滚动一小时窗口内已成功生成 3 次
- **期望结果**：
  1. HTTP 429
  2. `error` 为 `rate_limited`
  3. 含正整数 `retryAfterSeconds`
  4. 不返回新的 `cards`
- **优先级**：P0
- **追溯**：`specs/free-name-generation/spec.md` → Scenario：小时额度用尽返回 429；`design.md` §10.1

---

## FN-06 UTC 自然日 ≤10 → 第 11 次 429

- **场景**：同一 IP 当前 UTC 自然日第 11 次免费生成被拒
- **入口**：`POST /api/names/free`
- **前置条件**：该 IP 在当前 UTC 自然日已成功生成 10 次（需测试夹具控制时钟或事件计数）
- **期望结果**：
  1. HTTP 429
  2. `error` 为 `rate_limited`
  3. 含正整数 `retryAfterSeconds`
  4. 不返回新的 `cards`
- **优先级**：P0
- **追溯**：`specs/free-name-generation/spec.md` → Scenario：UTC 自然日额度用尽返回 429

---

## FN-07 不落库免费名字正文

- **场景**：免费路径只持久化 ip_hash + 时间，不存名字
- **入口**：任意免费生成（成功或失败）后检查存储
- **前置条件**：可查询 `free_rate_limit_events`（或等价表）
- **期望结果**：
  1. SHALL NOT 将免费 `hanzi`/`pinyin` 作为业务记录长期保存
  2. 仅允许保存 `ip_hash` 与时间戳用于频控
  3. 不存明文 IP（存哈希）
- **优先级**：P0
- **追溯**：`specs/free-name-generation/spec.md` → Scenario：不落库免费名字正文；`design.md` §3.1

---

## FN-08 免费路径不调用 LLM

- **场景**：免费生成只走词表
- **入口**：成功免费生成的生成路径观测（日志 / mock / 适配层计数）
- **前置条件**：可观测 LLM 客户端调用次数
- **期望结果**：
  1. SHALL NOT 调用 LLM
  2. 三个 `hanzi` 均来自词表抽样
- **优先级**：P0
- **追溯**：`specs/free-name-generation/spec.md` → Scenario：免费生成不调用 LLM；`design.md` §5.2

---

## FN-09 拼音使用声调符号

- **场景**：免费 `pinyin` 为声调符号而非数字音调
- **入口**：成功免费生成响应
- **前置条件**：FN-01 成功
- **期望结果**：
  1. `pinyin` 使用声调符号（如 `Lǐ Wěi`）
  2. SHALL NOT 使用数字音调（如 `Li3 Wei3`）
- **优先级**：P0
- **追溯**：`specs/free-name-generation/spec.md` → Scenario：拼音使用声调符号；`api-contract.md` FreeCard

---

## FN-10 429 错误形状

- **场景**：限流错误体符合契约
- **入口**：触发 FN-05 或 FN-06
- **前置条件**：429 响应
- **期望结果**：
  1. Body 形如 `{ error, message, retryAfterSeconds }`
  2. `error` = `rate_limited`
  3. `message` 可展示（契约示例：`Too many free generations. Try again later.`）
- **优先级**：P0
- **追溯**：`api-contract.md` §1 Response 429；错误形状表
