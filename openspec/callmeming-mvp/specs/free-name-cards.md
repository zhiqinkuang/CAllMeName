# Spec：Free Name Cards（免费轻量名卡）

- 状态：正式合并 v1.0
- 数据形状：见 `../api-contract.md` 的 `FreeCard`
- 依据：PRD v0.5；前端贡献包 0.10

## Requirement：未登录访客 SHALL 可生成 3 张轻量名卡

系统 SHALL 允许未登录访客通过首页免费入口生成恰好 3 张轻量名卡。  
每张卡 SHALL 至少包含汉字 `hanzi` 与拼音 `pinyin`。  
系统 SHALL NOT 在免费路径要求注册或填写生辰/八字。

### Scenario：Name style 默认不挡生成

- GIVEN 未登录访客在首页且未改 Name style
- WHEN 页面初始渲染完成
- THEN Name style SHALL 默认选中 Either is fine
- AND 用户 SHALL 能直接触发 Generate
- AND 请求 `POST /api/names/free` SHALL 携带 `genderPreference: "neutral"`，或等价地省略该字段（服务端按 `neutral` 处理）

### Scenario：成功生成三张卡

- GIVEN 未登录访客在首页且未触发限流
- WHEN 用户触发免费生成且 `POST /api/names/free` 返回 200 与 `cards` 长度为 3
- THEN 界面 SHALL 展示 3 张轻量名卡
- AND 每张卡 SHALL 可见显示 `hanzi` 与拼音
- AND 界面拼音 SHALL 使用展厅标本格式，例如 `Lín Ānrán` 显示为 `[lín · ān rán]`（小写、保留声调、姓与名之间用 `·`、名内音节空格、方括号）；SHALL NOT 在首页主名或次级名上直接写 `Lín Ānrán` / `Duàn Qǐmíng` 这种未加括号的词首大写形式
- AND API 返回的 `pinyin` 仍为带声调的词首大写存储值，前端用显示格式化，SHALL NOT 为此改写接口存值
- AND SHALL NOT 展示完整「为什么适合你」或完整自我介绍（免费层不写完整讲解）
- AND 在约 390 宽的首页生成区，3 张卡 SHALL 竖排展示，SHALL NOT 挤成三列

### Scenario：请求进行中

- GIVEN 用户已触发免费生成
- WHEN 请求尚未返回
- THEN 系统 SHALL 展示加载反馈（Generating）
- AND SHALL 防止同一时刻重复并发提交（或等价防抖），以免连点打爆接口
- AND SHALL NOT 同时展示 Empty 占位与 Daily limit 文案

### Scenario：生成器状态互斥

- GIVEN 免费生成器处于 Empty、Generating、已生成 3 张轻量卡、或 Daily limit 之一
- WHEN 渲染该区域
- THEN 界面 SHALL 只展示当前这一种状态
- AND SHALL NOT 把 Empty、Generating、Daily limit 并列展示为常驻区块

## Requirement：首次打开 SHALL 自动预览且同一会话可复用

系统 SHALL 在真人访客首次打开首页时按默认 Either is fine 自动生成一组轻量名并计 1 次。  
同一会话内刷新或再次进入首页，系统 SHALL 展示已有那一组，SHALL NOT 再请求，SHALL NOT 再计数。  
仅当用户点击 Generate（含更换 Name style 后点击）时，系统 SHALL 生成新的一组并计数。更换 Name style 本身 SHALL NOT 自动重新生成。  
已达限流时，首次进入 SHALL 立即展示限流状态。清空客户端存储不得绕过服务端 IP 频控。  
搜索引擎等爬虫打开首页 SHALL 展示一组固定或缓存的示例名，SHALL NOT 走真实生成，SHALL NOT 计入限流。

### Scenario：首次自动预览计一次

- GIVEN 未登录真人访客首次打开首页，会话内尚无免费结果，且 IP 未达限流
- WHEN 页面加载且尚未点击 Generate
- THEN 系统 SHALL 以 `genderPreference: "neutral"` 调用 `POST /api/names/free`
- AND 成功后展示 3 张轻量名卡
- AND 这次调用计入免费次数
- AND 自动预览进行中 SHALL NOT 展示 “Waiting for a click”，只使用短暂占位（如 “— — —”）
- AND 名字出现时 SHALL 使用与点击 Generate 成功后相同的主名入场动效

### Scenario：同一会话刷新复用结果

- GIVEN 本次会话已成功展示一组免费名
- WHEN 用户刷新或再次进入首页
- THEN 界面 SHALL 展示同一组名字
- AND SHALL NOT 再请求 `POST /api/names/free`
- AND SHALL NOT 再计数

### Scenario：更换 Name style 不自动再生

- GIVEN 页面已展示一组免费名
- WHEN 用户只更改 Name style、尚未点击 Generate
- THEN 系统 SHALL 继续展示当前这一组
- AND SHALL NOT 自动发起新的生成请求

### Scenario：爬虫首页展示示例名

- GIVEN 搜索引擎或社交预览爬虫打开首页
- WHEN 页面渲染
- THEN 系统 SHALL 展示一组固定或缓存的示例轻量名
- AND SHALL NOT 调用真实词表生成
- AND SHALL NOT 计入 IP 频控

## Requirement：免费名质量期望 SHALL 体现在前端展示与错误处理

前端 SHALL 按 API 返回展示名字，SHALL NOT 在客户端把用户英文名整段音译成长串并冒充免费结果。  
（「像真人会用、禁止整段音译」的生成规则由后端保证；前端不得另造一套生成逻辑。）

### Scenario：不在前端伪造音译结果

- GIVEN 免费生成流程
- WHEN 客户端处理结果
- THEN 名卡内容 SHALL 来自 `POST /api/names/free` 的响应
- AND 前端 SHALL NOT 用本地音译算法填充 `hanzi`/`pinyin` 作为成功结果

## Requirement：频率限制（429）SHALL 有友好反馈

当 API 返回 429 `rate_limited` 时，前端 SHALL 向用户展示可理解的限制说明。

> 限流（**已定**，由后端执行）：同一 IP 滚动小时窗口 ≤ 3 次；UTC 自然日 ≤ 10 次。界面文案使用 “a few names each day”（完整句可用 “You can generate a few names each day”）；SHALL NOT 把每小时 3 次或每天 10 次写进界面。可用 `retryAfterSeconds` 提示稍后再试，但不因此写出配额次数。

### Scenario：触发限流

- GIVEN 访客免费生成次数已达后端限制
- WHEN `POST /api/names/free` 返回 429，body 含 `error: "rate_limited"`、`retryAfterSeconds`、`message`
- THEN 界面 SHALL 展示含 “a few names each day” 的限流说明（可用设计完整句 “You can generate a few names each day”）
- AND SHALL NOT 把每小时 3 次或每天 10 次写进界面
- AND SHALL 提示用户稍后重试（可参考 `retryAfterSeconds`，仍不写出配额次数）
- AND SHALL NOT 展示伪造的 3 张名卡

### Scenario：限流后仍可浏览付费区

- GIVEN 免费生成因 429 失败
- WHEN 用户滚动或定位到付费定制区
- THEN 付费表单 SHALL 仍可填写与提交（限流不阻断付费路径）

## Requirement：动效 SHALL 丰富但不挡操作

免费名卡的入场与揭示动效 SHALL 可以丰富，但 SHALL NOT 阻挡用户看见名字或进行下一步操作。  
系统 SHALL NOT 使用抽签、翻牌、转盘类命理动画。

### Scenario：揭示不锁死操作

- GIVEN 免费生成成功且入场/揭示动效开始
- WHEN 动效尚未结束
- THEN 用户 SHALL 仍能阅读已渲染的汉字与拼音（或在减动模式下立即看到全文）
- AND 用户 SHALL 不必等待动效播完才能滚动到付费区或再次尝试生成（若未限流）

### Scenario：禁止命理动画

- GIVEN 任何免费名卡展示过程
- WHEN 播放过渡或揭示效果
- THEN 系统 SHALL NOT 呈现抽签、翻牌或转盘式交互作为获名手段

### Scenario：prefers-reduced-motion

- GIVEN 用户系统偏好减少动态效果
- WHEN 免费名卡渲染成功
- THEN 系统 SHALL 立即展示全部文字内容（汉字与拼音）
- AND 可弱化或取消装饰性动画

## Requirement：错误与空响应 SHALL 可恢复

### Scenario：网络或 5xx 错误

- GIVEN 用户触发免费生成
- WHEN 请求失败（网络错误或非 429 的服务错误）
- THEN 系统 SHALL 展示友好错误与重试入口
- AND SHALL NOT 留下残缺的「假成功」三卡状态

### Scenario：响应形状异常

- GIVEN API 返回 200 但 `cards` 缺失或长度不为 3
- WHEN 前端处理响应
- THEN 系统 SHALL 视为错误并提示重试
- AND SHALL NOT 只渲染部分卡并称为成功完成
