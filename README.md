# dsh-webwhale-bili

B站账号自运营工作台（DSH 嵌入页）· **0.1.0 可发布版**。

- 侧栏入口 + `main` 主面板：总览 / 养鱼 / 创作 / 设置 / 体检；真实写操作走确认队列。
- 首次打开有配置引导：扫码登录测试号 → 确认常用配置 → 进入工作台；可「先看演示」跳过，之后从头部「配置」重开。
- B站扫码登录：宿主生成二维码，客户端只拿到 data URL/状态/账号名；cookies 落 `~/.dsh/webwhale-bili/credentials.json`（0600），不进日志。
- 评论/回复带视频的条目渲染 `视频《…》` 外链，新窗口打开。
- 主页面：总控制台 12 项 + 养鱼/创作/设置 3 张可用卡 + 3 张待接入占位；点卡进面板内二级页，可返回。
- **主人授权**：`owners.activeSource` 全局单选手动/互关；成员带 source 标签；`bili.mutual` 只读互关；关注必须 request/approve 后执行。
- **Computer Use（实验，默认关闭）**：`computerExperimental=false`；日常关注/取关禁止走 CU，只走 `follow.request` + API。开启实验后才允许动作队列：安全动作 60 秒 token，危险动作每次弹窗。
- **依赖检查**：首次配置/体检会检查 qrcode、ffmpeg、node；qrcode 缺失可一键 npm 安装，ffmpeg 只检测不静默下载。
- **自动回复（B 模式）**：`lib/auto-reply.js` 每 90 秒轮询私信；主人 + 已知互关低风险直回，其他低风险进审查，高风险进确认；非主人 @ 忽略。首次启动只建立基线，不回旧消息；同一发送者 10 分钟冷却；kill switch 立即停。
- **真实写桥（受控）**：`lib/bili-write.js` 提供私信发送、关注、视频评论；裸 `bili.sendDm` / `bili.postComment` RPC 已移除，私信只走 B 模式自动回复，关注只走 request/approve/execute。测试账号与目标不在文档中暴露。
- **真实只读数据桥**：登录后宿主用 `nav` 取账号、`x/msgfeed/reply` 取「回复我的」，并读取最近投稿列表（WBI 签名，只读）；互动 tab 显示真实回复、视频链接与投稿；支持输入 BV 号读取指定视频评论，并把单条评论「存为草稿」到内容库；全部只发 GET，不写 B站。
- 体检卡实时探测 Node/ffmpeg/凭据/登录态/数据目录/kill switch；ffmpeg 找不到时才提示安装。
- **A3–A6 本地闭环**：新建/改稿/提交审批/通过/驳回（原因必填）；审批绑定 content_id+version，改稿后旧审批持久化 `approval_stale`；kill switch 一开所有写 RPC 拒绝，恢复需要服务端一次性 challenge。
- 写 RPC 要求 owner 浏览器 principal（`browserPeer`/`connection.admit`）；model/tool peer 不能审批。真实发布永久关闭。

## 安装

要求：DSH Desktop `>=0.2.2-rc.1 <0.3.0`、Node.js `>=22`。

```bash
cd dsh-webwhale-bili
npm install --omit=dev
```

在 DSH Desktop 的插件管理里安装：

```text
link:D:\b站大肥鱼控制插件工作区\dsh-webwhale-bili
```

或：

```text
plugin_manager install_bundle target=link:D:\b站大肥鱼控制插件工作区\dsh-webwhale-bili
```

首次配置会检查 `qrcode` / `ffmpeg` / `node`；`qrcode` 缺失可一键安装。

## 升级与兼容

见 [MIGRATION.md](MIGRATION.md)。关键点：

- 旧 `content` 表自动补 `kind` 列
- 旧 settings 自动合并新默认值
- 旧 `owners/followRequests/computerActions` 缺失时安全降级
- 损坏 JSON 失败关闭（`killed=true`）
- 切号后必须重载插件/重启 DSH

## 验证

```bash
npm test                  # gate-check
npm run verify:migration  # 旧库迁移
npm run verify:install    # 包内容/密钥扫描
```

host 半侧（路由/扫码/工具）改动需要重启 DSH；客户端 bundle 改动刷新页面即可。

## 验证

```bash
node scripts/gate-check.mjs
```

| 脚本 | 作用 |
|---|---|
| `scripts/verify-bundle.mjs` | package / patch / client 形状；7 个 tab；禁止 Client 包、iframe、cookie、直连 B站 API |
| `scripts/verify-skeleton.mjs` | 假 `window` 加载 factory；假 ctx 注册 sidebar/main；缺槽/抛错时降级不崩 |
| `scripts/verify-store.mjs` | SQLite seed、settings 校验、审批审计、重开持久化 |
| `scripts/verify-auth.mjs` | mock B站 QR：start → poll success，验证 cookie key 映射 |
| `scripts/verify-content.mjs` | A3–A6 状态机、approval_stale、killed、owner principal、revive challenge、fence |
| `scripts/gate-check.mjs` | 串联以上 + 明显凭据字面量扫描 |

扫码链路另做手工探针：点击「扫码登录测试号」应出现二维码；扫码后状态从 `waiting → scanned → success`，账号名回到页面。

## 结构

```text
package.json
cordis.patch.yml          # insert: webwhale-bili
lib/index.js              # host: tool + RPC route
lib/store.js              # SQLite/JSON 单写状态
lib/routes.js             # 信任栅栏 + settings/pending/auth RPC
lib/auth.js               # B站二维码登录与凭据落盘
lib/bili.js               # 只读真实数据：nav + 回复我的
lib/client.js             # window.__ModuleLoader__ factory; 8 tabs + onboarding
scripts/                  # 6 个验证/审查脚本
```

## 边界

- 不 import 任何 `@deepseek-ai/dsh-client-*`；React 只从宿主 baseline `require('react')`。
- 客户端不直接请求 B站 API；只渲染外链。扫码/账号校验在宿主。
- 凭据只落 0600 文件；UI/审计/工具结果不回显 cookie。
- 槽位注册逐个 `safe()` 包裹；组件外层有 ErrorBoundary。
- 后续再接真实内容/互动同步、上传 spike；审批 actor 依赖 DSH owner 浏览器 principal，无第二套账号。 

