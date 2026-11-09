# 验收契约：GEO SEO 可见性验证

- 追溯权威：`tasks.md` G-T10 / F-T1；`README.md` 主流程；`specs/homepage.md` 品牌与 SEO；`proposal.md` §4 / §5；`design.md` §9
- 表面：Process / Browser（静态 SEO 可测项）+ GEO SEO 工程师人工 / 工具验证
- **执行时机（强制）**：前端代码写出之后、正式 gstack 系统级验收之前。本文件场景**现在写入契约**；**现在不执行**（产品尚未实现）。不得省略本文件。

---

## 执行闸门说明

1. 前端按 OpenSpec 写出页面后，先把页面交给 **GEO SEO 工程师**做搜索引擎与 AI 可见性验证。
2. 前端 SHALL NOT 自行判断该轮是否通过。
3. 该轮完成并记录结论后，才进入测试工程师的 gstack 系统级验收（执行本目录其余场景）。
4. 未完成本闸门 → 不得宣称「验收完成」。

正式 OpenSpec **未**列出具体 SERP 排名阈值或第三方 GEO 工具清单；下列 GEO-01～GEO-04 覆盖正式包中**可客观锁定**的 SEO / 可见性前置契约；GEO-GATE 覆盖流程闸门本身。更细的搜索 / AI 可见性检查方法由 GEO SEO 角色按 G-T10 执行，本 QA **不编造**额外排名指标。

---

## GEO-01 Document title / meta / H1 对爬虫可见

- **场景**：首页关键 SEO 文案存在于服务端或首屏 HTML，可供搜索引擎读取
- **入口**：`GET /`（查看原始 HTML / 渲染后 head）
- **前置条件**：前端代码已写出并可访问
- **期望结果**：
  1. title = `CallMeMing — Real Chinese Name Generator for Learners`
  2. meta description 为正式包锁定原文，且含 `A Real Chinese Name` 与 `Chinese name generator`
  3. H1 = `Get a real Chinese name you can actually introduce yourself with`
  4. 上述内容不以仅客户端、对爬虫不可见的方式「假注入」而缺失于可抓取输出（以 GEO SEO 工程师验证方法为准）
- **优先级**：P0（Gate 前置可测项）
- **追溯**：`specs/homepage.md`；`tasks.md` F-T1 / G-T10
- **执行标记**：`AFTER_FRONTEND_BEFORE_GSTACK`

---

## GEO-02 品牌与副标题角色在可索引文案中正确

- **场景**：可索引内容中主品牌为 CallMeMing；A Real Chinese Name 不升格
- **入口**：首页可抓取文案 / meta
- **前置条件**：同 GEO-01
- **期望结果**：
  1. 主品牌展示为 CallMeMing 全称
  2. `A Real Chinese Name` 仅出现在副标题和/或搜索描述语境
- **优先级**：P0
- **追溯**：`specs/homepage.md` Requirement：品牌与 SEO
- **执行标记**：`AFTER_FRONTEND_BEFORE_GSTACK`

---

## GEO-03 定义句与反命理 / 反音译定位可被检索语境读取

- **场景**：定义句原文及「非音译、非算命」定位存在于页面可读取文本
- **入口**：首页主文案
- **前置条件**：同 GEO-01
- **期望结果**：
  1. 定义句原文在页
  2. 对搜索 / AI 可见性验证时，页面明确传达非 transliteration、非 fortune-telling 定位（以正式文案为准，不另写营销稿）
- **优先级**：P0
- **追溯**：`specs/homepage.md` Scenario：首屏定义句；`proposal.md` §1–§2
- **执行标记**：`AFTER_FRONTEND_BEFORE_GSTACK`

---

## GEO-04 FAQ「Is this fortune-telling?」可索引

- **场景**：FAQ 含该问句，助于澄清品类
- **入口**：首页 FAQ 区块
- **前置条件**：同 GEO-01
- **期望结果**：
  1. FAQ 保留 3 条且包含 “Is this fortune-telling?”
- **优先级**：P0
- **追溯**：`specs/homepage.md` Scenario：上线首页结构与状态变体
- **执行标记**：`AFTER_FRONTEND_BEFORE_GSTACK`

---

## GEO-GATE GEO SEO 工程师放行

- **场景**：搜索引擎与 AI 可见性验证轮次完成并留痕后，才进入 gstack 验收
- **入口**：流程闸门（非单页点击）
- **前置条件**：前端代码已写出；GEO-01～GEO-04 相关页面可交验
- **期望结果**：
  1. GEO SEO 工程师完成「搜索引擎与 AI 可见性验证」并给出通过 / 有条件通过 / 不通过结论
  2. 前端未自行宣布该轮通过
  3. 仅当该闸门通过（或主管书面确认残留风险）后，测试工程师才执行正式 gstack 系统级验收
  4. 验收报告注明 GEO SEO 结论引用
- **优先级**：Gate（流程阻断）
- **追溯**：`tasks.md` G-T10 / X-T11；`README.md` 主流程；`design.md` §9
- **执行标记**：`AFTER_FRONTEND_BEFORE_GSTACK`
