# 验收契约：Free Name Cards（前端免费轻量名卡）

- 追溯权威：`specs/free-name-cards.md`；`api-contract.md` §1；`design.md` §2.1 / §2.5 / §2.6
- 表面：Browser（消费 API）

---

## FC-01 未登录成功展示三张轻量卡

- **场景**：未登录访客触发免费生成后看到恰好 3 张轻量名卡
- **入口**：首页免费生成控件 → `POST /api/names/free`（可带可选 `genderPreference`；默认 UI Either is fine → `neutral`）
- **前置条件**：未登录；IP 未触发限流；API 返回 200 且 `cards.length === 3`
- **期望结果**：
  1. 界面按展厅一主二从展示恰好 3 个轻量名（主名 + 两从名）
  2. 每个名可见 `hanzi` 与 `pinyin`
  3. SHALL NOT 展示完整「为什么适合你」或完整自我介绍
  4. 不要求注册或填写生辰 / 八字
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md` → Scenario：成功生成三张卡

---

## FC-02 390 宽一主二从（展厅）

- **场景**：约 390 宽首页生成区按展厅通栏青白台一主二从展示
- **入口**：`GET /` viewport ≈ 390；已生成成功态
- **前置条件**：FC-01 成功（API 恰好 3 张 FreeCard）
- **期望结果**：
  1. UI 为一主名 + 二从名；主名最大
  2. 次级两卡在 ≈390 下允许横排
  3. SHALL NOT 按旧期望「三张卡必须纯竖排」或「三张等宽浮卡」判失败
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md`；展厅标本设计说明（通栏青白台一主二从）

---

## FC-03 Generating 加载与防连点

- **场景**：请求进行中展示 Generating，并防止重复并发提交
- **入口**：触发免费生成后、响应返回前
- **前置条件**：请求已发出未返回
- **期望结果**：
  1. 展示加载反馈（Generating）
  2. 防止同一时刻重复并发提交（或等价防抖）
  3. SHALL NOT 同时展示 Empty 占位与 Daily limit 文案
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md` → Scenario：请求进行中

---

## FC-04 生成器四态互斥

- **场景**：Empty / Generating / 已生成 / Daily limit 互斥
- **入口**：免费生成器区域
- **前置条件**：分别制造四种状态
- **期望结果**：
  1. 任一时刻只展示当前一种状态
  2. SHALL NOT 将 Empty、Generating、Daily limit 并列常驻
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md` → Scenario：生成器状态互斥

---

## FC-05 不在前端伪造音译结果

- **场景**：名卡内容只来自 API，前端不本地音译冒充成功
- **入口**：免费生成流程客户端处理
- **前置条件**：可观察网络响应与 UI 渲染
- **期望结果**：
  1. 名卡内容来自 `POST /api/names/free` 响应
  2. 前端 SHALL NOT 用本地音译算法填充 `hanzi`/`pinyin` 作为成功结果
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md` → Scenario：不在前端伪造音译结果

---

## FC-06 429 限流友好文案（不暴露配额数字）

- **场景**：触发限流后 UI 文案含 “a few names each day”，不写具体次数
- **入口**：`POST /api/names/free` 返回 429
- **前置条件**：body 含 `error: "rate_limited"`、`retryAfterSeconds`、`message`
- **期望结果**：
  1. 界面展示含 “a few names each day” 的说明（可用完整句 “You can generate a few names each day”）
  2. SHALL NOT 把「每小时 3 次」或「每天 10 次」写进界面
  3. 提示稍后重试（可参考 `retryAfterSeconds`，仍不写出配额次数）
  4. SHALL NOT 展示伪造的 3 张名卡
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md` → Scenario：触发限流；`api-contract.md` §1 Response 429

---

## FC-07 限流不阻断付费路径

- **场景**：免费 429 后付费表单仍可填写提交
- **入口**：429 之后滚动 / 定位到付费定制区
- **前置条件**：免费生成因 429 失败
- **期望结果**：
  1. 付费表单仍可填写
  2. 付费表单仍可提交（限流不阻断付费路径）
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md` → Scenario：限流后仍可浏览付费区

---

## FC-08 动效不锁死操作

- **场景**：入场 / 揭示动效不阻挡阅读与下一步
- **入口**：免费生成成功后的揭示动效
- **前置条件**：成功返回三卡且动效开始
- **期望结果**：
  1. 用户仍能阅读已渲染汉字与拼音（或减动模式下立即看到全文）
  2. 不必等动效播完才能滚动到付费区或（未限流时）再次尝试生成
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md` → Scenario：揭示不锁死操作

---

## FC-09 禁止命理动画

- **场景**：免费名卡展示过程无抽签 / 翻牌 / 转盘
- **入口**：任意免费名卡过渡或揭示
- **前置条件**：生成成功或播放过渡
- **期望结果**：
  1. SHALL NOT 呈现抽签、翻牌或转盘式交互作为获名手段
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md` → Scenario：禁止命理动画

---

## FC-10 prefers-reduced-motion

- **场景**：减动偏好下立即展示全部汉字与拼音
- **入口**：免费名卡成功渲染
- **前置条件**：系统 `prefers-reduced-motion: reduce`
- **期望结果**：
  1. 立即展示全部文字内容（汉字与拼音）
  2. 可弱化或取消装饰性动画
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md` → Scenario：prefers-reduced-motion

---

## FC-11 网络或 5xx 可恢复错误

- **场景**：非 429 失败时友好错误 + 重试，无假成功三卡
- **入口**：触发免费生成
- **前置条件**：网络错误或非 429 服务错误
- **期望结果**：
  1. 展示友好错误与重试入口
  2. SHALL NOT 留下残缺的「假成功」三卡状态
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md` → Scenario：网络或 5xx 错误

---

## FC-12 响应形状异常视为错误

- **场景**：200 但 cards 缺失或长度≠3 时不部分成功
- **入口**：前端处理异常形状响应
- **前置条件**：API 返回 200 但 `cards` 缺失或长度不为 3
- **期望结果**：
  1. 视为错误并提示重试
  2. SHALL NOT 只渲染部分卡并称为成功完成
- **优先级**：P0
- **追溯**：`specs/free-name-cards.md` → Scenario：响应形状异常
