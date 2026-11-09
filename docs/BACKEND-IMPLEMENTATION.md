# CallMeMing 后端实现记录

## 工作台

**工作台：Cursor（Claude CLI 不可用）**

本机 `command -v claude` 为空，按正式 tasks.md 要求改用 Cursor 完成本轮后端 TDD 实现，并在此注明。

## 契约版本

实现以 `/workspace/openspec/callmeming-mvp/` **正式合并 v1.1** 为准（`api-contract.md` + specs）。

### 正式契约 v1.1（已按文件落地，非文档旁注）

权威文件：`/workspace/openspec/callmeming-mvp/api-contract.md` v1.1 与 `specs/free-name-generation/spec.md`。

- `POST /api/names/free` 接受可选 `genderPreference`（`feminine` | `masculine` | `neutral`）。
- 未传 / `null` / Body `{}` → 按 `neutral` 词表抽样，**不**返回 400。
- 合法值会传入生成器加权抽样（测试通过 hooks 断言 preference 实参，不仅测 HTTP 200）。
- 非法值（如 `"other"`）→ `400 validation_error`（可含 `fields.genderPreference`）。
- 不做登录/注册/历史查询 API；付费结果仅安全链接 + 邮件交付。
- `GET /api/results/:token` ready 时恰好 3 张完整 FullCard（含 whyItFitsYou / selfIntroduction；`audioUrl` 恒 `null`）。

## 本地可调用接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | `{ ok: true }` |
| POST | `/api/names/free` | 可选 `genderPreference`；200 三张 FreeCard；429 频控 |
| POST | `/api/checkout` | 仅返回 `{ checkoutUrl }` |
| GET | `/api/results/:token` | 202 generating / 200 ready|failed / 404 |
| POST | `/api/webhooks/waffo` | 验签 + 幂等；履约异步 |

### 示例 curl（本地 `npm run dev`，内存仓储 + mock 适配层）

```bash
curl -s http://localhost:3000/api/health

curl -s -X POST http://localhost:3000/api/names/free \
  -H 'content-type: application/json' \
  -d '{}'

curl -s -X POST http://localhost:3000/api/names/free \
  -H 'content-type: application/json' \
  -d '{"genderPreference":"feminine"}'

curl -s -X POST http://localhost:3000/api/checkout \
  -H 'content-type: application/json' \
  -d '{"englishName":"Alice","genderPreference":"feminine","desiredFeeling":"elegant"}'
```

## 怎么跑测试

```bash
cd /workspace/callmeming
npm test
```

使用 Vitest；默认 `PERSISTENCE_DRIVER=memory` + mock Waffo/LLM/Email。

## 适配层与换真密钥

| 能力 | 环境变量 | 说明 |
|------|----------|------|
| Persistence | `PERSISTENCE_DRIVER=memory\|supabase` + `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | 无云资源时用内存 |
| Waffo | `WAFFO_DRIVER=mock\|real` + `WAFFO_MERCHANT_ID` + `WAFFO_PRIVATE_KEY` + `WAFFO_PRODUCT_ID` | real 走 `@waffo/pancake-ts` |
| Webhook 验签 | `WAFFO_WEBHOOK_PUBLIC_KEY`（可选） | 未设时 real 可用 SDK 内嵌公钥；测试用 fixtures RSA |
| LLM | `LLM_DRIVER=mock\|anthropic` + `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL` | 仅付费讲解英文 |
| Email | `EMAIL_DRIVER=mock\|resend` + `RESEND_API_KEY` + `EMAIL_FROM` | 默认 From `CallMeMing <hello@mail.callmeming.com>` |
| CORS | `CORS_ALLOWED_ORIGINS` 逗号白名单 | **禁止** `*`；主站 `https://callmeming.com`；预发建议见 `.env.example` 注释，勿宣布已锁定 |
| 其它 | `APP_BASE_URL`、`RATE_LIMIT_PEPPER` | successUrl 与 IP 哈希盐 |

密钥只放本机 `.env.local`（已 gitignore）。仓库仅有 `.env.example` 占位符。

## Schema

`supabase/migrations/001_init.sql`：`free_rate_limit_events`、`orders`、`name_cards`、`webhook_events`；RLS 开启且 anon/authenticated 无业务读写策略（服务端用 service role）。

## 语料

- 姓氏：公有领域《百家姓》子集，见 `lib/server/names/corpus/README.md`
- 名字：仓库自建允许表 + 拒绝表；不爬商业起名站

## 明确未做 / 延后

- TTS / 非空 `audioUrl`
- 登录注册墙与历史查询
- 前端视觉组件改动
- 真实云 Supabase / Waffo Live / Resend 域名 SPF-DKIM（需运维）
