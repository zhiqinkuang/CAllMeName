# CallMeMing MVP — gstack QA 文件（验收契约 / 测试计划）

- 状态：**主管已审核通过**（本阶段只出契约，不对未实现功能跑修复型 QA，不写业务代码）
- 版本：QA v1.1（文档同步；场景数仍为 109，未增删 ID）
- 日期：2026-11-08 初稿；**2026-11-09（Asia/Shanghai）按主管要求同步与正式契约 v1.1 / 展厅冲突的旧写法，不扩大范围**
- 权威来源：`/workspace/openspec/callmeming-mvp/`（正式 OpenSpec **v1.1**）
- 视觉基准：`/workspace/callmeming-ui/exhibit/`（现行开发视觉；根目录旧 MVP 预览只留档）
- 维护角色：测试工程师
- 审核：程序开发主管

## 1. 这是什么

本目录是 CallMeMing MVP 的 **gstack QA 文件**：测试计划与验收契约（单一验收真源）。  
实现阶段的单元 / 接口 / 组件测试从本契约与 OpenSpec 派生；系统级验收执行 **同一套** QA 文件。  
实现者不得另起验收标准；不得擅自扩大或缩小 OpenSpec 范围。

## 2. 目录结构

```
callmeming-mvp-qa/
├── README.md                 # 本说明
├── test-plan.md              # gstack 风格分层测试计划（Quick / Standard / Exhaustive）
├── coverage-map.md           # 正式 OpenSpec → QA 场景追溯表
└── scenarios/                # 验收契约场景（可执行检查表）
    ├── 01-homepage.md
    ├── 02-free-name-cards.md
    ├── 03-free-name-generation-api.md
    ├── 04-checkout.md
    ├── 05-paid-checkout-and-fulfillment.md
    ├── 06-result-page.md
    ├── 07-secure-result-access-and-email.md
    ├── 08-geo-seo.md
    └── 09-exclusions-and-non-goals.md
```

## 3. 如何阅读验收契约

每个场景固定五段（团队约定）：

| 字段 | 含义 |
|------|------|
| **场景** | 可观测行为的一句话描述 |
| **入口** | 页面路由、API、Webhook 或操作起点 |
| **前置条件** | 执行前必须成立的状态 |
| **期望结果** | 可判定通过 / 失败的断言（无主观措辞） |
| **优先级** | `P0` = Must / 放行阻断；`P1` = 重要但不单独阻断首发（仅当正式包明确降级时）；`Gate` = 流程闸门 |

另附：

- **ID**：稳定场景编号（如 `HP-01`）
- **追溯**：正式 OpenSpec 文件与章节
- **表面**：Browser / API / Webhook / Email / Process

判定规则：期望结果中每一条 AND 断言均成立 → Pass；任一失败 → Fail。  
本阶段 **只维护契约**；实现完成后才执行，默认先出报告，结论交给程序开发主管。

## 4. 主流程中的位置

```
正式 OpenSpec（callmeming-mvp/）
  → 本目录 gstack QA 文件（当前）
  → Superpowers / 等价 TDD 实现
  → 前端代码写出后：GEO SEO 工程师做搜索与 AI 可见性验证（见 scenarios/08-geo-seo.md）
  → 测试工程师用本目录同一套文件做 gstack 系统级验收
  → 主管审核 → 归档 / PR
```

### GEO SEO 执行时机（强制）

- `scenarios/08-geo-seo.md` **现在写入契约**，不得省略。
- **执行时机**：前端代码写出之后、正式 gstack 验收之前（OpenSpec `tasks.md` G-T10 / `README.md` 主流程）。
- 前端 SHALL NOT 自行判定该轮是否通过；以 GEO SEO 工程师结论为准。
- 未完成 GEO SEO 闸门前，不得宣称系统级验收完成。

## 5. 视觉对照

界面与布局以正式包 + **展厅标本**为准：

- `/workspace/callmeming-ui/exhibit/CallMeMing-展厅标本-设计说明.md`
- `/workspace/callmeming-ui/exhibit/CallMeMing-展厅标本-关键动效说明.md`
- 展厅预览：`/workspace/callmeming-ui/exhibit/previews/`（含 `mobile-result.png` / `mobile-generator.png` 等）
- 结果页 UI：**一张主纸 + Other candidates + Open paper**（不是三张同构完整卡竖排）；API 仍返回 3 张完整 FullCard
- 免费生成区（含 ≈390）：展厅通栏青白台 **一主二从**；次级两卡在 390 下可横排；SHALL NOT 验收为「三张等宽浮卡挤成三列」的旧稿
- 根目录旧 MVP `previews/` / 设计说明只留档；SHALL NOT 对着旧版 390×1720 裁切图实现

## 6. 范围边界（摘要）

**必验（Must）**：免费 3 轻量名（API 3 FreeCard；UI 一主二从）+ 可选 Name style / `genderPreference` + IP 频控；付费三字段 → 仅 `checkoutUrl` → `location.href`；无 `cancelUrl`；结果页 202/200 ready/200 failed/404；ready UI 为主纸 + Other candidates + Open paper（API 3 FullCard）；Copy name（汉字）/ Copy intro（英文 selfIntroduction）；桌面与 390 对照展厅；状态互斥；品牌 / Title / H1；webhook 履约与邮件；质量护栏与禁止命理；`audioUrl` 恒 null；限流文案只用 “a few names each day”。

**本轮不做（写入 09，作排除项验证）**：TTS / 非空 `audioUrl`；登录与历史；自我介绍文章页；静态分享图；谐音风险提示；八字/五行/幸运色；命理动画；站内刷卡表单；`/?checkout=canceled`。

## 7. 工作台说明

- 团队默认：在项目目录用 Claude CLI 编写 / 执行 gstack QA。
- 本轮编写：Claude CLI 不可用，由测试工程师按正式 OpenSpec 直接写出本目录文件（规范允许的降级路径）；换工作台不降级验收标准。

## 8. 仓库迁移

QA 文档暂存本目录。GitHub 仓库建好后再迁入；**当前不要迁移**。
