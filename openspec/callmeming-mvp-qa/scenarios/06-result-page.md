# 验收契约：Result Page（`/results/[token]`）

- 追溯权威：`specs/result-page.md`；`api-contract.md` §3；`design.md` §2.3 / §2.5；视觉基准 `/workspace/callmeming-ui/exhibit/`（主纸 + Other candidates + Open paper）
- 表面：Browser

---

## RP-01 ready 渲染主纸 + Other candidates（API 仍 3 FullCard）

- **场景**：ready 时 API 仍返回 3 张完整 FullCard；UI 为一张主纸 + Other candidates + Open paper（不是三张同构完整卡同时铺开）
- **入口**：`/results/[token]`
- **前置条件**：`GET /api/results/:token` → 200，`status: "ready"`，`cards.length === 3`
- **期望结果**：
  1. API / 数据层：恰好 3 张完整 FullCard（字段齐全）
  2. UI：一张**主纸**展示当前主名的 Must 字段：hanzi、pinyin（声调）、phoneticHint、whyItFitsYou、英文 `selfIntroduction`，以及 `Copy name` / `Copy intro`
  3. UI：存在 **Other candidates** 目录行；可通过 **Open paper** 将另一候选升为主纸；升为主纸后该名同样具备完整 Must 字段与复制控件
  4. SHALL NOT 按旧期望「三张同构完整卡同时竖排铺满」判失败
  5. 不强制登录即可查看
- **优先级**：P0
- **追溯**：展厅标本设计说明 §3；主管收口；`api-contract.md` FullCard ×3；`specs/result-page.md` ready 场景（字段集合）

---

## RP-02 audioUrl null 时降级展示 phoneticHint

- **场景**：本轮 MVP audioUrl 恒 null，必须展示英文近似读法
- **入口**：结果卡读音区域
- **前置条件**：卡的 `audioUrl` 为 `null`（本轮恒为）
- **期望结果**：
  1. 展示 `phoneticHint`
  2. SHALL NOT 展示无法播放的伪播放控件并声称可听（可隐藏播放按钮或显示不可用）
  3. 读法文本必须在
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：无音频时降级；`design.md` §10.11  
- **说明（与主管底稿差异）**：正式包明确本轮不做 TTS / 非空 audioUrl；可点播音频**不是**本轮交付项。以正式 OpenSpec 为准。

---

## RP-03 generating 文案与轮询启动

- **场景**：202 generating 展示「正在准备你的名字」，无名卡，每 2 秒轮询
- **入口**：打开合法 token 结果页
- **前置条件**：API 返回 202 `{ status: "generating" }`
- **期望结果**：
  1. 展示「正在准备你的名字」类友好状态
  2. SHALL NOT 展示完整名卡
  3. SHALL NOT 显示无效链接
  4. 开始每 2 秒轮询同一 token
  5. 页面加载立即发起首次请求
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：进入 generating；`api-contract.md` §3 轮询约定

---

## RP-04 轮询转为 ready

- **场景**：generating 中收到 ready 后停轮询并渲染
- **入口**：轮询中的结果页
- **前置条件**：某次轮询收到 200 ready 与 3 张卡
- **期望结果**：
  1. 停止轮询
  2. 渲染完整结果
  3. 减动模式下立即展示全文
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：轮询转为 ready

---

## RP-05 约 60 秒仍 generating 提示邮件

- **场景**：约 60s 仍未 ready/failed 时提示邮件链接
- **入口**：持续 generating 的结果页
- **前置条件**：每 2 秒轮询约达 60s 仍未 ready/failed
- **期望结果**：
  1. 提示用户稍后通过邮件里的链接再打开
  2. 可继续温和轮询或提供手动刷新
  3. SHALL NOT 假装已交付 3 张卡
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：轮询约 60s 仍未 ready

---

## RP-06 failed 停轮询无名卡

- **场景**：200 failed 时停轮询、展示错误、无名卡
- **入口**：`/results/[token]` 或轮询中
- **前置条件**：API 200 `{ status: "failed", message }`
- **期望结果**：
  1. 停止轮询
  2. 展示 message 或等价友好错误
  3. SHALL NOT 展示任何名卡
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：生成失败

---

## RP-07 404 not_found 友好错误

- **场景**：无效 / 过期 / 退款统一 404 友好页，无名卡，不暗示订单存在
- **入口**：`/results/[token]`
- **前置条件**：API 404 `{ error: "not_found", message }`
- **期望结果**：
  1. 展示友好错误说明
  2. SHALL NOT 展示任何名卡（汉字、拼音、讲解、自我介绍）
  3. SHALL NOT 暗示该 token 是否对应真实订单
  4. 提供返回首页路径
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：404 not_found

---

## RP-08 结果页状态互斥

- **场景**：generating / ready / failed / not_found UI 状态互斥
- **入口**：结果页
- **前置条件**：分别处于上述 API 映射态
- **期望结果**：
  1. 同一时间只呈现与当前 API 状态对应的一种主 UI
  2. ready 才有主纸 + Other candidates（背后 API 3 FullCard）；generating/failed/404 均无名卡 / 无主纸交付
- **优先级**：P0
- **追溯**：`design.md` §2.6；`specs/result-page.md` 各状态 Scenario；`api-contract.md` §3

---

## RP-09 Copy intro 成功

- **场景**：Copy intro 写入英文 `selfIntroduction`，文案与反馈正确
- **入口**：ready 态主纸 `Copy intro`
- **前置条件**：浏览器允许剪贴板写入；结果页 ready（主纸可见）
- **期望结果**：
  1. 剪贴板为该卡英文 `selfIntroduction`（不复制中文正文、不写双语）
  2. 控件文案区分 `Copy intro` 与 `Copy name`；成功态均为 `Copied`
  3. 非阻挡式成功反馈
  4. 不依赖后端 API
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：复制自我介绍成功

---

## RP-10 Copy name 只复制汉字

- **场景**：Copy name 仅复制 hanzi；桌面与 390 布局位置符合设计
- **入口**：ready 态主纸 `Copy name`（桌面与 ≈390）
- **前置条件**：结果页 ready
- **期望结果**：
  1. 剪贴板仅为该卡 `hanzi`（如林安然；不含拼音、不含自我介绍）
  2. 控件文案 `Copy name`，与 `Copy intro` 分开
  3. 桌面：`Copy name` 与拼音、Play 同一行
  4. 390：`Copy name` 在拼音下方单独一行按钮
  5. 桌面与 390 都提供该控件
  6. 成功态 `Copied` 且有成功反馈
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：复制名字成功；正式包 README 视觉依据

---

## RP-11 390 结果页主纸 + Other candidates（展厅）

- **场景**：约 390 宽结果页按展厅：一张主纸 + Other candidates；可用 Open paper 切换主纸
- **入口**：viewport ≈ 390 的 ready 结果页
- **前置条件**：API 3 张 FullCard 已就绪并渲染
- **期望结果**：
  1. UI 为主纸 + Other candidates 目录，**不是**三张同构完整卡竖排挤成三列
  2. 主纸上可见英文 gloss / why、英文 `selfIntroduction`、`Copy intro`；页脚免责声明完整可见（对照展厅 `exhibit/previews/mobile-result.png` 或等价标本）
  3. SHALL NOT 对着旧版 390×1720 裁切图或旧「三同构竖卡」稿实现 / 验收
  4. 页脚免责声明示例语义：`Pick one to take with you. CallMeMing does not sell destiny readings.`（以展厅设计稿为准）
- **优先级**：P0
- **追溯**：展厅标本设计说明 §3–§4；正式包 README 视觉依据（以 exhibit 为现行基准）  
- **视觉资产**：`/workspace/callmeming-ui/exhibit/previews/mobile-result.png`

---

## RP-12 剪贴板权限失败

- **场景**：剪贴板拒绝时非静默失败
- **入口**：触发 Copy name 或 Copy intro
- **前置条件**：浏览器拒绝剪贴板写入
- **期望结果**：
  1. 展示失败提示
  2. 尽量提供可选中文本以便手动复制
  3. SHALL NOT 静默失败
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：剪贴板权限失败

---

## RP-13 结果页禁止命理铺满与命理动画

- **场景**：揭示 / 书写感动效非八卦罗盘印章铺满，非抽签翻牌转盘
- **入口**：generating → ready 或首次看卡
- **前置条件**：播放揭示 / 书写感动效
- **期望结果**：
  1. SHALL NOT 以八卦、罗盘、红金印章铺满作为主视觉手段
  2. SHALL NOT 使用抽签、翻牌、转盘作为获名交互
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：揭示与书写感

---

## RP-14 复制 / 读音反馈不挡浏览

- **场景**：反馈可丰富但不阻挡浏览其他候选卡
- **入口**：复制成功（及若有读音反馈）
- **前置条件**：ready 态
- **期望结果**：
  1. 反馈可丰富
  2. SHALL NOT 阻挡继续浏览其他候选卡
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：复制与读音反馈

---

## RP-15 prefers-reduced-motion（结果页）

- **场景**：减动偏好下全部 Must 文本立即可见
- **入口**：ready 内容渲染
- **前置条件**：`prefers-reduced-motion: reduce`
- **期望结果**：
  1. 全部 Must 文本字段立即可见
- **优先级**：P0
- **追溯**：`specs/result-page.md` → Scenario：prefers-reduced-motion

---

## RP-16 轮询停止条件与单飞

- **场景**：ready/failed/404 停止；同 tab 单飞；隐藏可降频
- **入口**：结果页轮询逻辑
- **前置条件**：可观察网络请求
- **期望结果**：
  1. 遇到 ready / failed / 404 停止轮询
  2. 同一 tab 单飞（无并行堆积）
  3. 页面隐藏时可降频（契约允许）
- **优先级**：P0
- **追溯**：`api-contract.md` §3 轮询约定
