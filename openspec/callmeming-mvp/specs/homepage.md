# Spec：Homepage（`/`）

- 状态：正式合并 v1.0
- 页面：英语首页
- 依据：PRD v0.4；前端贡献包 0.10；视觉 `/workspace/callmeming-ui/`

## Requirement：品牌与 SEO 文案 SHALL 与 PRD 一致

系统 SHALL 在首页对外展示品牌全称 CallMeMing，且 SHALL NOT 将 Ming 作为独立品牌字标。  
系统 SHALL 将 `A Real Chinese Name` 仅用于副标题和/或搜索描述语境，SHALL NOT 将其升格为主品牌。

### Scenario：Document title

- GIVEN 用户打开首页 `/`
- WHEN 页面完成加载
- THEN document title SHALL 为 `CallMeMing — Real Chinese Name Generator for Learners`

### Scenario：meta description

- GIVEN 用户打开首页 `/`
- WHEN 页面完成加载
- THEN 文档 SHALL 提供 meta description，文案为：`CallMeMing — A Real Chinese Name generator for learners. This Chinese name generator gives you a real Chinese name you can actually introduce yourself with, not a transliteration and not fortune-telling.`
- AND 该描述 SHALL 包含 `A Real Chinese Name` 与 `Chinese name generator`
- AND `A Real Chinese Name` SHALL 仅作为搜索描述用语，SHALL NOT 升格为主品牌字标

### Scenario：H1

- GIVEN 用户打开首页 `/`
- WHEN 主内容渲染完成
- THEN 页面 SHALL 存在且仅以主标题角色展示 H1 文案：`Get a real Chinese name you can actually introduce yourself with`

### Scenario：首屏定义句

- GIVEN 用户打开首页 `/`
- WHEN 首屏主文案区渲染完成
- THEN 页面 SHALL 展示定义句原文：`CallMeMing gives you a real Chinese name—not a transliteration and not a fortune-telling reading—so you can say who you are in Chinese with confidence.`
- AND SHALL NOT 改写、缩写或替换该句核心否定项（transliteration / fortune-telling）

### Scenario：副标题角色

- GIVEN 首页展示副标题或搜索描述相关文案
- WHEN 文案包含 `A Real Chinese Name`
- THEN 该短语 SHALL 仅作为副标题或搜索描述
- AND 主品牌展示 SHALL 仍为 CallMeMing 全称

## Requirement：首页结构 SHALL 短路径承接免费与付费

首页 SHALL 在同一英语落地页提供免费生成入口与付费定制表单，页面 SHALL 保持选择少、不堆命理属性。

### Scenario：免费与付费同页可达

- GIVEN 未登录访客打开 `/`
- WHEN 页面可用
- THEN 访客 SHALL 能在不注册、不填写生辰八字的前提下找到免费生成入口
- AND 免费生成器 SHALL 提供 Name style（Typically feminine / Typically masculine / Either is fine），默认 Either is fine，且不把该项做成生成前必选门槛
- AND SHALL 能找到付费定制表单（英文名、Name style、希望传达的感觉）

### Scenario：上线首页结构与状态变体

- GIVEN 用户打开上线首页 `/`
- WHEN 页面主结构渲染完成
- THEN 区块顺序 SHALL 为：Hero → 免费生成器 → Free vs Custom → How it works → FAQ → Footer
- AND FAQ SHALL 保留 3 条，且包含 “Is this fortune-telling?”
- AND 免费生成器在同一时间 SHALL 只展示当前一种状态：Empty、Generating、已生成 3 张轻量卡、或 Daily limit
- AND SHALL NOT 把 Empty、Generating、Daily limit 作为常驻并列区块同时展示（设计画板中的并列仅为实现对照变体）
- AND 在约 390 宽的首页生成区，3 张轻量卡 SHALL 竖排展示，SHALL NOT 挤成三列

### Scenario：禁止命理主路径

- GIVEN 用户浏览首页主路径
- WHEN 查看免费或付费表单字段与主视觉
- THEN 系统 SHALL NOT 要求填写八字、五行、幸运色等命理项
- AND SHALL NOT 以八卦、罗盘、抽签/翻牌/转盘作为主路径交互

## Requirement：加载与空态 SHALL 可理解且可操作

### Scenario：首屏加载

- GIVEN 用户首次打开首页
- WHEN 资源仍在加载
- THEN 系统 SHALL 展示可理解的加载反馈或骨架/占位（具体视觉由设计稿定）
- AND SHALL NOT 因装饰性动效阻止用户在可交互控件就绪后点击免费生成

### Scenario：免费区初始空态

- GIVEN 用户尚未成功生成免费名卡
- WHEN 免费区处于初始状态
- THEN 系统 SHALL 明确展示生成入口
- AND SHALL NOT 假装已有 3 张真实名卡数据

### Scenario：付费区初始空态

- GIVEN 用户尚未填写付费表单
- WHEN 表单处于初始状态
- THEN 三字段 SHALL 为空或处于未选默认（不得预填命理含义）
- AND 价格展示 SHALL 包含 `$6.99`

## Requirement：SHALL NOT 依赖取消支付回站

Waffo 官方没有 `cancelUrl`。用户关闭收银台不会回调本站，前端 SHALL NOT 依赖 `/?checkout=canceled` 或任何取消回跳。

### Scenario：关闭收银台后无回调

- GIVEN 用户已跳转 Waffo 后关闭收银台或未完成付款
- WHEN 本站没有收到取消回调
- THEN 前端 SHALL NOT 等待或处理 `/?checkout=canceled`
- AND 用户之后自行回到 `/` 时，页面 SHALL 表现为普通首页，仍可重新填写或提交付费表单
- AND SHALL NOT 展示完整定制名卡，也不得认为已获得结果 token
