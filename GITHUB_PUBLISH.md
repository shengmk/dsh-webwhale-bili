# GitHub 发布清单

**已发布（2026-11-13）**

- 仓库：https://github.com/shengmk/dsh-webwhale-bili
- Tag：v0.1.0
- Release：https://github.com/shengmk/dsh-webwhale-bili/releases/tag/v0.1.0
- 附件：`dsh-webwhale-bili-0.1.0-source.zip`
- 本地 main 已推送，远程 main 一致

## 发布后核验

```bash
git ls-remote --tags origin
curl -s https://api.github.com/repos/shengmk/dsh-webwhale-bili/releases/latest
```

## 重新发布

- 修改 `package.json` 版本
- 更新 `CHANGELOG.md` / `RELEASE_NOTES.md`
- 跑 `npm test`、`npm run verify:migration`、`npm run verify:install`
- 重建 zip，打新 tag，push，上传 asset

## 历史清单（首次发布前）

## 发布前验证

```bash
npm ci
npm test
npm run verify:migration
npm run verify:install
```

## Release

- Tag：`v0.1.0`
- 标题：`dsh-webwhale-bili v0.1.0`
- 附件：`release/dsh-webwhale-bili-0.1.0-source.zip`
- 说明：直接使用 `RELEASE_NOTES.md`

## 兼容性

- DSH Desktop `>=0.2.2-rc.1 <0.3.0`
- Node.js `>=22`
- Windows 优先；Computer Use 执行器仅 Windows
- 旧库迁移：`MIGRATION.md`
- 切号需重载 DSH

## 当前状态

- 仓库已创建并推送 main
- Tag `v0.1.0` 已推送
- Release 与 zip 已上传
- 迁移/安装检测通过
- Codex 终审：PASS-WITH-FIXES；修复后未再跑完整 PASS
- 真实 B站按钮测试记录在 `evidence/computer-use.md`
- Computer Use 默认关闭，不接日常关注
