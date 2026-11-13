# dsh-webwhale-bili v0.1.0

B站账号自运营工作台，DSH 嵌入页。

## 功能

- 总览 / 养鱼 / 创作 / 设置 / 体检
- 私信 + @ 合并、视频链接/封面/头像
- 自动回复 B 模式（主人/互关直回，其他审查，高风险确认）
- 图文/视频草稿与审批
- 多账号独立目录、独立扫码、切号写保护（需重载）
- 关注确认队列、每日限额、failed/unknown、审计
- Computer Use 动作队列：安全动作 60 秒 token，危险动作每次弹窗
- 依赖检查：qrcode/ffmpeg/node；qrcode 一键安装

## 兼容

- DSH Desktop `>=0.2.2-rc.1 <0.3.0`
- Node.js `>=22`
- 旧库迁移见 [MIGRATION.md](MIGRATION.md)

## 验证

```bash
npm test
npm run verify:migration
npm run verify:install
```

## 已知限制

- 切号必须重载插件/重启 DSH（非热切换）
- Computer Use 执行器不是常驻服务
- B站重新关注可能触发短信验证
- 最终 Codex 复审未取得 PASS

## 安全

- 不记录/提交 SESSDATA、bili_jct、state.db、credentials.json
- 真实发送/关注受控
- MIT License
