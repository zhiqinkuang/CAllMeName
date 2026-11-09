# 验收契约：Homepage（`/`）

- 追溯权威：`specs/homepage.md`；`design.md` §2.1；`proposal.md` §2.1 / §3
- 表面：Browser

---

## HP-01 Document title

- **场景**：首页 document title 与 PRD / OpenSpec 锁定文案一致
- **入口**：`GET /`（英语首页）
- **前置条件**：应用已部署或本地可访问首页；未登录访客
- **期望结果**：
  1. `document.title` 精确等于 `CallMeMing — Real Chinese Name Generator for Learners`
  2. SHALL NOT 使用其它备选 Title 作为实际上线 title（以正式 `specs/homepage.md` 为准）
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：Document title

---

## HP-02 meta description

- **场景**：meta description 原文锁定，且含规定短语
- **入口**：`GET /`
- **前置条件**：同 HP-01
- **期望结果**：
  1. 存在 meta description，文案精确为：`CallMeMing — A Real Chinese Name generator for learners. This Chinese name generator gives you a real Chinese name you can actually introduce yourself with, not a transliteration and not fortune-telling.`
  2. 描述包含 `A Real Chinese Name` 与 `Chinese name generator`
  3. `A Real Chinese Name` 仅作搜索描述用语，不升格为主品牌字标
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：meta description

---

## HP-03 H1

- **场景**：主标题 H1 文案锁定
- **入口**：`GET /`
- **前置条件**：主内容渲染完成
- **期望结果**：
  1. 页面存在且仅以主标题角色展示 H1：`Get a real Chinese name you can actually introduce yourself with`
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：H1

---

## HP-04 首屏定义句

- **场景**：PRD 定义句原文展示，核心否定项不可改写
- **入口**：`GET /` 首屏主文案区
- **前置条件**：首屏渲染完成
- **期望结果**：
  1. 展示原文：`CallMeMing gives you a real Chinese name—not a transliteration and not a fortune-telling reading—so you can say who you are in Chinese with confidence.`
  2. SHALL NOT 改写、缩写或替换核心否定项（transliteration / fortune-telling）
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：首屏定义句

---

## HP-05 品牌全称与副标题角色

- **场景**：主品牌为 CallMeMing 全称；`A Real Chinese Name` 仅副标题/搜索描述
- **入口**：`GET /` 品牌 / Hero 区
- **前置条件**：同 HP-01
- **期望结果**：
  1. 对外品牌展示为全称 **CallMeMing**
  2. SHALL NOT 将 Ming 作为独立品牌字标
  3. 若出现 `A Real Chinese Name`，仅作为副标题或搜索描述
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Requirement：品牌与 SEO；Scenario：副标题角色

---

## HP-06 免费与付费同页可达（未登录）

- **场景**：未登录访客无需注册、无需生辰八字即可找到免费入口与付费表单
- **入口**：`GET /`
- **前置条件**：无登录会话 / Cookie
- **期望结果**：
  1. 可见免费生成入口
  2. 免费生成器提供 **Name style**（Typically feminine / Typically masculine / Either is fine），默认 Either is fine，不挡直接生成
  3. 可见付费定制表单（英文名、Name style、希望传达的感觉；感觉六项 Friendly / Calm / Bright / Elegant / Modern / Scholarly）
  4. 不要求注册即可看到上述入口
  5. 不要求填写生辰 / 八字
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：免费与付费同页可达

---

## HP-07 上线首页区块顺序与 FAQ

- **场景**：首页结构顺序与 FAQ 内容符合正式包
- **入口**：`GET /`
- **前置条件**：主结构渲染完成
- **期望结果**：
  1. 区块顺序：Hero → 免费生成器 → Free vs Custom → **Customize / 付费定制表单** → How it works → FAQ → Footer（Customize 与 Free vs Custom 同页可达，不得漏验）
  2. FAQ 恰好保留 3 条
  3. FAQ 包含 “Is this fortune-telling?”
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：上线首页结构与状态变体

---

## HP-08 生成器状态互斥（首页）

- **场景**：免费生成器同一时间只显示一种状态
- **入口**：`GET /` 免费生成器区域
- **前置条件**：分别处于 Empty / Generating / 已生成 3 卡 / Daily limit 之一
- **期望结果**：
  1. 界面只展示当前这一种状态
  2. SHALL NOT 把 Empty、Generating、Daily limit 作为常驻并列区块同时展示
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：上线首页结构与状态变体；`specs/free-name-cards.md` → Scenario：生成器状态互斥

---

## HP-09 390 首页生成区一主二从（展厅）

- **场景**：约 390 宽时免费生成区按展厅通栏青白台 **一主二从** 展示（不是旧稿「三卡竖排 / 三张等宽浮卡」）
- **入口**：`GET /`，viewport ≈ 390 CSS px 宽
- **前置条件**：已成功展示 3 张轻量名（API 仍 3 FreeCard），或对照展厅 Empty 态布局
- **期望结果**：
  1. 布局为一主名 + 二从名（一主二从）；主名视觉权重明显高于次级
  2. 次级两卡在 ≈390 下**允许横排**；SHALL NOT 验收为「必须三张等宽卡纯竖排」
  3. SHALL NOT 做成三张等宽浮卡挤成三列的旧稿形态
- **优先级**：P0
- **追溯**：正式包 `design.md` §2.1（390 按展厅通栏青白台）；展厅 `/workspace/callmeming-ui/exhibit/`

---

## HP-10 禁止命理主路径

- **场景**：首页主路径无命理字段与命理交互
- **入口**：`GET /` 免费区与付费表单、主视觉
- **前置条件**：页面可用
- **期望结果**：
  1. SHALL NOT 要求填写八字、五行、幸运色等命理项
  2. SHALL NOT 以八卦、罗盘、抽签 / 翻牌 / 转盘作为主路径交互
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：禁止命理主路径；`proposal.md` §3

---

## HP-11 首屏加载不挡免费生成

- **场景**：加载态可理解，装饰动效不阻止可交互后的免费生成点击
- **入口**：首次打开 `GET /`
- **前置条件**：资源可能仍在加载
- **期望结果**：
  1. 展示可理解的加载反馈或骨架 / 占位（视觉以设计稿为准）
  2. 可交互控件就绪后，装饰性动效 SHALL NOT 阻止点击免费生成
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：首屏加载

---

## HP-12 免费区初始空态

- **场景**：未生成前明确展示入口，不假装已有三卡
- **入口**：`GET /` 免费区
- **前置条件**：用户尚未成功生成免费名卡
- **期望结果**：
  1. 明确展示生成入口
  2. SHALL NOT 假装已有 3 张真实名卡数据
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：免费区初始空态

---

## HP-13 付费区初始空态与价格

- **场景**：付费表单初始无命理预填；价格含 $6.99
- **入口**：`GET /` 付费定制区
- **前置条件**：用户尚未填写付费表单
- **期望结果**：
  1. 三字段为空或处于未选默认（不得预填命理含义）
  2. 价格展示包含 `$6.99`
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：付费区初始空态

---

## HP-14 关闭收银台后无取消回跳依赖

- **场景**：关闭 Waffo 后不依赖 cancelUrl / `/?checkout=canceled`
- **入口**：从首页跳转 Waffo 后关闭收银台，再自行回到 `/`
- **前置条件**：曾触发结账跳转但未完成付款；本站无取消回调
- **期望结果**：
  1. 前端 SHALL NOT 等待或处理 `/?checkout=canceled`
  2. 自行回到 `/` 时表现为普通首页，仍可重新填写 / 提交付费表单
  3. SHALL NOT 展示完整定制名卡
  4. SHALL NOT 认为已获得结果 token
- **优先级**：P0
- **追溯**：`specs/homepage.md` → Scenario：关闭收银台后无回调；`design.md` §2.2
