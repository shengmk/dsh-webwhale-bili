# GitHub 发布清单（下一次对话）

## 代码

- [ ] 在 `dsh-webwhale-bili/` 执行 `git init`
- [ ] 提交源码：`lib/`、`scripts/`、`README.md`、`MIGRATION.md`、`CHANGELOG.md`、`RELEASE_NOTES.md`、`LICENSE`、`package.json`、`cordis.patch.yml`
- [ ] 不提交：`node_modules/`、`state.db`、`state.json`、`credentials.json`、`dev_id`、`release/`
- [ ] 确认 `.gitignore` 生效

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

## 未闭合

- Codex 最终 PASS 未取得
- 真实 B站按钮测试已在 `computer-use.md` 记录；但执行器仍未接入自动流程
- 仓库尚无 `.git`，首次发布需新建
