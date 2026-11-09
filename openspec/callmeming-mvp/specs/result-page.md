# Spec：Result Page（`/results/[token]`）

- 状态：正式合并 v1.0
- 访问方式：付款成功后的**带签名安全链接**；不强制登录
- 依据：PRD v0.4；前端贡献包 0.10；视觉 `previews/result.png`、`paid-card.png`、`mobile-result.png`（完整 390×1890）

## Requirement：安全链接结果页 SHALL 展示 3 张完整候选卡

当结果就绪时，页面 SHALL 展示恰好 3 张完整候选名卡。  
每张卡 SHALL 展示：

- 定制名（`hanzi`）
- 拼音（`pinyin`，声调符号）
- 读音：本轮 MVP `audioUrl` 恒为 `null`，**始终**展示英文近似读法 `phoneticHint`；若将来 `audioUrl` 非 null 则可点播放
- 为什么适合你（`whyItFitsYou`）
- 可复制的自我介绍（`selfIntroduction`）
- 独立的 `Copy name` 与 `Copy intro`

### Scenario：ready 状态渲染三卡

- GIVEN 用户打开 `/results/[token]`
- WHEN `GET /api/results/:token` 返回 200 且 `status: "ready"`，`cards` 长度为 3
- THEN 页面 SHALL 渲染 3 张完整候选卡
- AND 每张卡 SHALL 可见上述 Must 字段的文本内容

### Scenario：无音频时降级

- GIVEN 某张卡的 `audioUrl` 为 `null`（本轮 MVP 恒为 null）
- WHEN 渲染读音区域
- THEN 系统 SHALL 展示 `phoneticHint`
- AND SHALL NOT 展示无法播放的伪播放控件并声称可听（可隐藏播放按钮或显示为不可用，但读法文本必须在）

### Scenario：有音频时可播放（前瞻；本轮不交付音频）

- GIVEN 某张卡的 `audioUrl` 为非空 URL（本轮不应出现）
- WHEN 用户触发播放
- THEN 系统 SHALL 尝试播放该音频
- AND 播放反馈动效可丰富，但 SHALL NOT 挡住用户阅读文本或复制

## Requirement：生成中（202）SHALL 轮询且超时提示查邮件

结果 token 来自 Waffo successUrl 或事后邮件，不来自 `POST /api/checkout`。  
Waffo 的 successUrl 可能不会自动跳转，用户点 Done 后才进入本页。  
持有合法 token、但结果尚未就绪（包括 webhook 还没到达）时，API 返回 `202 { status: "generating" }`；前端 SHALL 每 2 秒轮询一次，SHALL NOT 显示无效链接；文案按「正在准备你的名字」。  
大约 60 秒仍为 `generating` 时，SHALL 提示用户稍后通过邮件里的安全链接再打开。

### Scenario：进入 generating

- GIVEN 用户打开合法 token 的结果页（含付款后立刻打开、webhook 尚未到达）
- WHEN `GET /api/results/:token` 返回 202 且 `status: "generating"`
- THEN 页面 SHALL 展示「正在准备你的名字」类友好状态
- AND SHALL NOT 展示完整名卡内容
- AND SHALL 开始每 2 秒轮询同一 token

### Scenario：轮询转为 ready

- GIVEN 页面处于 generating 轮询中
- WHEN 某次轮询收到 200 `ready` 与 3 张卡
- THEN 页面 SHALL 停止轮询并渲染完整结果
- AND 可播放揭示/书写感动效，但减动模式下应立即展示全文

### Scenario：轮询约 60s 仍未 ready

- GIVEN 页面持续 generating
- WHEN 每 2 秒轮询已约达 60s 仍未收到 `ready` 或 `failed`
- THEN 系统 SHALL 提示用户稍后通过邮件里的链接再打开
- AND 可继续温和轮询或提供手动刷新，但 SHALL NOT 假装已交付 3 张卡

### Scenario：生成失败

- GIVEN 用户打开 `/results/[token]`，或页面正在轮询
- WHEN `GET /api/results/:token` 返回 200 且 `status: "failed"`
- THEN 页面 SHALL 停止轮询
- AND SHALL 展示 `message` 或等价友好错误
- AND SHALL NOT 展示任何名卡

## Requirement：无效或过期链接 SHALL 友好错误且无名卡

### Scenario：404 not_found

- GIVEN 用户打开 `/results/[token]`
- WHEN API 返回 404 且 body 为 `{ error: "not_found", message: string }`（无法识别、已过期或已退款；后端不区分原因）
- THEN 页面 SHALL 展示友好错误说明
- AND SHALL NOT 展示任何名卡（含汉字、拼音、讲解、自我介绍）
- AND SHALL NOT 向用户暗示该 token 是否对应一笔真实订单
- AND SHALL 提供返回首页的路径

## Requirement：复制 SHALL 为纯前端剪贴板操作

用户 SHALL 能复制名字与自我介绍。  
复制 SHALL NOT 依赖后端 API。

### Scenario：复制自我介绍成功

- GIVEN 结果页处于 ready
- WHEN 用户对某张卡触发 `Copy intro` 且浏览器允许剪贴板写入
- THEN 系统 SHALL 将 `selfIntroduction` 写入剪贴板
- AND 控件文案 SHALL 区分 `Copy intro` 与 `Copy name`；成功态均为 `Copied`
- AND SHALL 给出非阻挡式成功反馈（动效可丰富）

### Scenario：复制名字成功

- GIVEN 结果页处于 ready（桌面或 390 结果页）
- WHEN 用户触发独立的 `Copy name`
- THEN 剪贴板内容 SHALL 仅为该卡 `hanzi`（如林安然；不含拼音、不含自我介绍）
- AND 控件文案 SHALL 为 `Copy name`，并与 `Copy intro` 分开
- AND 桌面结果页 SHALL 将 `Copy name` 与拼音、Play 放在同一行
- AND 390 结果页 SHALL 将 `Copy name` 放在拼音下方单独一行按钮
- AND 桌面结果页与 390 结果页 SHALL 都提供该控件
- AND 成功态为 `Copied`，且 SHALL 有成功反馈

### Scenario：手机结果页三卡竖排

- GIVEN 用户在约 390 宽的结果页查看 ready 态
- WHEN 渲染 3 张完整候选卡
- THEN 三张卡 SHALL 竖排展示
- AND SHALL NOT 挤成三列
- AND 第三张卡（沈清越）的英文 gloss、`Copy intro` 与页脚免责声明 SHALL 以完整预览 `previews/mobile-result.png`（390×1890）为准
- AND SHALL NOT 对着旧版 390×1720 裁切图实现

### Scenario：剪贴板权限失败

- GIVEN 用户触发复制
- WHEN 浏览器拒绝剪贴板写入
- THEN 系统 SHALL 展示失败提示，并尽量提供可选中文本以便手动复制
- AND SHALL NOT 静默失败

## Requirement：结果页动效 SHALL 丰富且非命理铺满

### Scenario：揭示与书写感

- GIVEN 结果从 generating 进入 ready，或用户首次看到某卡
- WHEN 播放揭示/书写感动效
- THEN 动效可以更完整
- AND SHALL NOT 以八卦、罗盘、红金印章铺满作为主视觉手段
- AND SHALL NOT 使用抽签、翻牌、转盘作为获名交互

### Scenario：复制与读音反馈

- GIVEN 用户播放读音或复制成功
- WHEN 反馈展示
- THEN 反馈可丰富
- AND SHALL NOT 阻挡继续浏览其他候选卡

### Scenario：prefers-reduced-motion

- GIVEN 用户偏好减少动态效果
- WHEN ready 内容渲染
- THEN 全部 Must 文本字段 SHALL 立即可见
