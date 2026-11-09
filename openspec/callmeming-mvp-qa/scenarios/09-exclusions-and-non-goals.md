# 验收契约：排除项与 Non-goals（反向验收）

- 追溯权威：`proposal.md` §3；`tasks.md`「明确延后 / 本轮不做」；`design.md` §10.11；各 specs 禁止条款
- 表面：Browser / API
- 说明：以下场景验证「SHALL NOT 出现」。出现则 Fail。

---

## EX-01 无八字 / 五行 / 幸运色字段与内容

- **场景**：主路径与交付内容无命理字段 / 命理解读
- **入口**：首页表单、免费卡、付费卡 whyItFitsYou / selfIntroduction、邮件纯文本
- **前置条件**：走完免费与付费主路径样例
- **期望结果**：
  1. 无八字、五行、幸运色输入
  2. 交付文案不宣称上述命理依据
- **优先级**：P0
- **追溯**：`proposal.md` §3；`specs/homepage.md` / `free-name-generation` / `paid-checkout-and-fulfillment`

---

## EX-02 无抽签 / 翻牌 / 转盘 / 八卦罗盘印章铺满

- **场景**：动效与主视觉非命理风
- **入口**：免费揭示、结果页揭示
- **前置条件**：观察动效与主视觉
- **期望结果**：
  1. 无抽签、翻牌、转盘获名交互
  2. 不以八卦、罗盘、红金印章铺满作主视觉
- **优先级**：P0
- **追溯**：`proposal.md` §3；`specs/free-name-cards.md` / `result-page.md`

---

## EX-03 无强制注册 / 登录墙

- **场景**：免费生成与付费结果均不强制登录
- **入口**：`/` 免费生成；`/results/[token]` ready
- **前置条件**：无会话
- **期望结果**：
  1. 不要求注册即可免费生成
  2. 不要求登录即可查看付费结果
- **优先级**：P0
- **追溯**：`proposal.md` §3；`specs/secure-result-access-and-email/spec.md`

---

## EX-04 无站内刷卡表单

- **场景**：付款由 Waffo 托管，站内止于 CTA
- **入口**：付费区
- **前置条件**：表单可见 / 提交成功跳转前
- **期望结果**：
  1. 站内无银行卡号 / CVV 等自建刷卡表单
- **优先级**：P0
- **追溯**：`proposal.md` §3；`specs/checkout.md`

---

## EX-05 无 cancelUrl 依赖

- **场景**：不实现 / 不依赖 `/?checkout=canceled`
- **入口**：关闭 Waffo 后回站
- **前置条件**：未完成付款
- **期望结果**：
  1. 无基于 cancelUrl 的取消回调处理作为必要路径
  2. 不依赖 `/?checkout=canceled`
- **优先级**：P0
- **追溯**：`proposal.md` §3；`specs/checkout.md` / `homepage.md`

---

## EX-06 本轮无 TTS / 非空 audioUrl

- **场景**：FullCard.audioUrl 恒为 null
- **入口**：ready results API 与结果页读音区
- **前置条件**：订单 ready
- **期望结果**：
  1. 每张卡 `audioUrl` 为 `null`
  2. 仍展示 `phoneticHint`；不因无音频阻塞 ready
- **优先级**：P0
- **追溯**：`proposal.md` §3；`design.md` §10.11；`api-contract.md` FullCard  
- **说明**：主管底稿曾写「音频能做就做、非首发阻断」；**正式包改为明确不做**。QA 以正式包为准。

---

## EX-07 无自我介绍文章页 / 静态分享图 / 谐音风险提示

- **场景**：MVP 不交付这三类功能入口
- **入口**：全站导航与结果页
- **前置条件**：ready 与首页可用
- **期望结果**：
  1. 无单独自我介绍文章页作为 MVP 交付
  2. 无可保存静态分享图功能作为 MVP 交付
  3. 无谐音风险提示作为 MVP 交付
- **优先级**：P0（排除项：出现则范围膨胀 Fail）
- **追溯**：`proposal.md` §3；`tasks.md` 明确延后

---

## EX-08 无多语言站 / 人民币标价 / 付费广告

- **场景**：MVP 英语站、$6.99 USD、无付费广告范围
- **入口**：首页与结账展示
- **前置条件**：主路径可见
- **期望结果**：
  1. 首页默认英语主路径
  2. 标价为 $6.99 USD（非人民币主标价）
  3. 无「本轮付费广告投放」产品功能要求（非运维事项）
- **优先级**：P0（排除项）
- **追溯**：`proposal.md` §3

---

## EX-09 checkout 响应不暴露敏感标识

- **场景**：不对前端暴露 sessionId / resultToken / orderId
- **入口**：`POST /api/checkout` 200 响应
- **前置条件**：结账成功
- **期望结果**：
  1. 仅 `checkoutUrl`
  2. 无 `sessionId` / `resultToken` / `orderId` / `resultPath`
- **优先级**：P0
- **追溯**：`proposal.md` §3；`api-contract.md` §2
