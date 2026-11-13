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

## 安装（普通用户）

### 环境

- DSH Desktop `>=0.2.2-rc.1 <0.3.0`
- Node.js `>=22`
- Windows 10/11 优先（Computer Use 执行器仅 Windows）
- ffmpeg 可选：只影响抽帧/封面处理

### 用 DSH 插件管理安装（推荐）

不需要先下载 zip。

1. 打开 DSH Desktop：

   ```text
   设置 → 插件 → 添加插件
   ```

2. 粘贴 GitHub 仓库地址：

   ```text
   https://github.com/shengmk/dsh-webwhale-bili
   ```

   或使用安装标识：

   ```text
   github:shengmk/dsh-webwhale-bili
   ```

3. 等待 DSH 完成安装/依赖安装。

4. 启用 `dsh-webwhale-bili`。

5. 重启 DSH（bundle 层需要重启一次）。

6. 刷新页面，左侧应出现「B站工作台」。

7. 首次打开按引导：

   - 依赖检查（qrcode / ffmpeg / node）
   - 扫码登录
   - 设置主人、人格、自动回复
   - 进入工作台

> 如果 DSH 版本的插件页没有“从 GitHub 安装”入口，再用下面的离线 zip 方式。

### 离线 zip 安装（备用）

1. 打开 Release：

   <https://github.com/shengmk/dsh-webwhale-bili/releases>

2. 下载最新源码 zip，例如：

   ```text
   dsh-webwhale-bili-0.1.14-source.zip
   ```

3. 解压到一个固定目录，例如：

   ```text
   D:\Tools\dsh-webwhale-bili
   ```

4. 在解压目录安装扫码依赖：

   ```bash
   cd D:\Tools\dsh-webwhale-bili
   npm install --omit=dev
   ```

5. DSH Desktop → 设置 → 插件 → 添加插件：

   - 选择本地 bundle / 目录
   - 或输入：

     ```text
     link:D:\Tools\dsh-webwhale-bili
     ```

6. 启用 `dsh-webwhale-bili`，重启 DSH / 重载插件。

7. 刷新页面，左侧应出现「B站工作台」。

### 升级

- 下载新 Release zip，覆盖原目录
- 保留 `~/.dsh/webwhale-bili/` 数据目录
- 重新 `npm install --omit=dev`
- 重启 DSH
- 旧库会自动迁移，见 [MIGRATION.md](MIGRATION.md)

### 卸载

- DSH 插件管理里停用/移除插件
- 数据默认保留在 `~/.dsh/webwhale-bili/`
- 如需彻底清除，再手动删除该目录

### 安全

- 凭据只存本机 `~/.dsh/webwhale-bili/credentials.json`（0600）
- 不记录 `SESSDATA` / `bili_jct`
- 真实发送/关注/发布受控；默认不会自动发布
- Computer Use 默认关闭

## 本机开发安装

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

