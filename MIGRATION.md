# 迁移与兼容性

## 支持的宿主

- DSH Desktop `0.2.2-rc.1`（当前验证版本）
- Node.js `>=22`
- Windows 10/11 优先；其他平台可运行只读部分，Windows 桌面执行器不可用

## 数据目录

默认：

```text
~/.dsh/webwhale-bili/
  accounts.json          # 多账号注册表；缺失时自动创建默认账号
  state.db               # 账号 1 的 SQLite
  credentials.json       # 0600，仅本机
  accounts/<id>/         # 其他账号独立目录
```

## 从旧版本升级

### 数据库

- 旧 `content` 表没有 `kind` 列：启动时自动 `ALTER TABLE ADD COLUMN kind ... DEFAULT 'video'`
- 旧 `settings` 缺少新键：读取时合并 `DEFAULT_SETTINGS`，不会覆盖用户已有值
- 旧 `meta`：
  - `owners` 缺失 → 空主人列表
  - `replyQueue` 缺失 → 空队列
  - `followRequests` 缺失 → 空队列
  - `computerActions` 缺失 → 空动作队列
- 遗留 `executing` 关注：启动时对账为 `unknown`，不自动重试
- 损坏的 JSON fallback：已有文件损坏时 `killed=true`（失败关闭），不会静默恢复写权限

### 账号

- 没有 `accounts.json` → 使用默认目录，向后兼容单账号
- 旧单账号目录不会自动迁移到 `accounts/<id>/`；切号前请先备份
- 切号后旧宿主实例写请求返回 409，必须重载插件/重启 DSH

## 回滚

1. 停用插件
2. 恢复升级前的 `state.db` / `state.json` / `accounts.json`
3. 重新启用插件

数据库迁移只新增列/键，不删除旧数据；回滚到旧版本时 `kind` 列会被忽略。

## 验证命令

```bash
node scripts/gate-check.mjs
node scripts/verify-migration.mjs
node scripts/verify-install.mjs
```
