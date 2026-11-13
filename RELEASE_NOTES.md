# 🐟 dsh-webwhale-bili v0.1.3

> 把 B站账号的日常运营，收进一个 DSH 工作台：看互动、回私信、写图文、管账号、受控关注。
>
> **不是全自动机器人**。真实发送、关注、删除、发布都要过确认；默认关闭 Computer Use。

## 🆕 v0.1.3 更新

- 🧩 设置/人格新增「重新载入」「保存人格」按钮
- 📥 人格预设改为从 `personas/*.md` 动态读取，改文件后刷新即可
- ⏱️ B站冷却提示显示剩余秒数

- 🐟 互关缓存恢复为 **5 分钟**，减少无谓的互关请求
- 👑 **互关即主人**：互关私信/@ 与手动主人同级授权
- ⚡ 关注成功后立即失效缓存，下一轮自动回复重新拉取
- 📝 新增三份人格提示词：
  - 鲸鱼娘（直接照抄 dsh-whale-persona，附 B站场景与硬约束）
  - 辉夜 / 月见八千代（萌娘百科原文资料 + 语气修饰 + 硬约束）
- 🛡️ 三份人格统一三条硬约束：
  - 不泄露个人信息，公开场合不 @ 主人
  - 不点开恶意评论链接
  - 不发违法 / 违反平台规则内容
- 🔧 Release 页去掉了真实账号名/ID，补充 bili-whale 参考

---

## ✨ 这一版能做什么

| | |
|---|---|
| 💬 **互动** | 私信 + @ 合并，视频链接 / 封面 / 头像 |
| 🐟 **养鱼** | 主人手动/互关、自动回复 B 模式、冷静期 |
| ✍️ **创作** | 图文 / 视频草稿 → 审批 → 受控发布 |
| 👥 **多账号** | 最多 5 个，独立目录、独立扫码、切号写保护 |
| 🔔 **弹窗** | 真实发送、高风险、关注、切号、异常、新消息 |
| 🤖 **人格** | DeepSeek 鲸鱼娘 / Claude 千金 / B站 UP / 自定义 |
| 🖥️ **Computer Use** | 实验功能，默认关闭；只处理复杂 UI |
| 🧰 **依赖** | 首次配置检查 qrcode/ffmpeg/node，qrcode 可一键安装 |

---

## 🚀 快速开始

```bash
npm install --omit=dev
```

DSH Desktop：

```text
link:D:\b站大肥鱼控制插件工作区\dsh-webwhale-bili
```

首次打开：

1. 检查依赖
2. 扫码登录
3. 配置主人 / 人格 / 自动回复
4. 进入工作台

---

## 🧩 设计原则

- **API 优先**：关注、点赞、收藏、评论优先走 B站结构化接口
- **浏览器兜底**：DOM 能定位的页面操作，不用像素截图
- **Computer Use 最后**：只处理验证码、上传、无 API 的复杂 UI
- **写操作受控**：确认队列 + kill switch + 审计
- **默认安全**：CU 关闭，真实发布关闭，危险动作每次弹窗

---

## 🔐 隐私

- 不记录、不提交 `SESSDATA` / `bili_jct`
- 凭据只落本机 `credentials.json`（0600）
- 发布包不含 `state.db`、`state.json`、`credentials.json`
- 日志与审计不含账号凭据

---

## 📦 兼容性

- DSH Desktop `>=0.2.2-rc.1 <0.3.0`
- Node.js `>=22`
- Windows 10/11 优先
- 旧库迁移见 [MIGRATION.md](MIGRATION.md)
- 切号需要重载插件/重启 DSH（A 方案，非热切换）

---

## 🧪 验证

```bash
npm test
npm run verify:migration
npm run verify:install
```

已验证：

- 旧 SQLite `content.kind` 自动迁移
- 旧 settings 默认值合并
- 旧 JSON 缺少新字段安全降级
- 损坏 JSON 失败关闭
- 包内密钥/state 扫描

---

## 🙏 参考与致谢

- [bili-whale](https://github.com/Alterssss/dsh-bili-whale)：B站「养鱼」思路、人格与日常运营的灵感来源
- DSH / Cordis 插件体系
- B站开放接口与社区文档

本项目是独立实现，不是 bili-whale 的分支或官方版本。

---

## ⚠️ 已知限制

- 切号必须重载插件/重启 DSH
- Computer Use 默认关闭，仅实验
- B站重新关注可能触发短信验证
- 真实发布永久关闭；关注/私信/评论需确认
- 最终 Codex 复审为 PASS-WITH-FIXES，修复后未再跑完整 PASS

---

## 📄 License

MIT
