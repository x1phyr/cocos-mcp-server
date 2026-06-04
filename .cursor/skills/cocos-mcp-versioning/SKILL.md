---
name: cocos-mcp-versioning
description: >-
  Enforces version numbers and changelog layout for cocos-mcp-server (SemVer,
  Keep a Changelog, README vs DEV split, Cocos Store vs Git version lines).
  Use when bumping version, writing 更新日志/changelog, adding roadmap or
  release notes, editing DEV.md version sections, or creating version docs.
---

# cocos-mcp-server 版本与更新日志规范

本 skill 绑定本仓库约定，避免重复建文档、混用「商城 v1.5.0」与「Git 下一版 v1.5.0」。

## 依据（外部规范）

| 规范 | 用途 |
|------|------|
| [Semantic Versioning 2.0.0](https://semver.org/lang/zh-CN/) | `package.json` 的 `version`：`MAJOR.MINOR.PATCH` |
| [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) | README 更新日志结构与分类（Added / Changed / Fixed…） |

本仓库在 SemVer 之上增加：**两条版本叙事线**（见下），不得合并成一张表或新文件。

## 单一事实来源

| 字段 | 唯一来源 |
|------|----------|
| **当前 Git 发行版** | `package.json` → `"version"` |
| **默认 MCP 端口** | `package.json` → `"mcpDefaultPort"`（不写进 changelog 以外的 env） |

改版本**必须先**改 `package.json`，再改文档。禁止文档版本领先于 `package.json`。

## 文档分工（禁止新增平行文件）

| 文件 | 只允许写的内容 | 禁止 |
|------|----------------|------|
| **README.md** / **README.EN.md** | § **更新日志**：**已发布**条目；保留上游「商城 v1.5.0」历史块 | 新建 `ROADMAP.md`、`CHANGELOG.md`；在 README 再抄一份完整路线图表 |
| **DEV.md** | 开发流程；§ **版本说明**（指向 README）；§ **版本规划**（**未发布**草案） | 把已发布 changelog 全文搬进 DEV；在 DEV 复制 README 历史表 |
| **FEATURE_GUIDE_*.md** | 工具 API；页脚可写「基于 vX.Y.Z」 | 当 changelog 用 |

锚点固定：

- 已发布：`README.md#更新日志` / `README.EN.md` 对应 Changelog 标题
- 规划：`DEV.md#版本规划`
- 分工说明：`DEV.md#版本说明`

## 两条版本线（必区分）

| 名称 | 含义 | 写在哪里 |
|------|------|----------|
| **Git 版本** | 本仓库 `package.json` 的 SemVer | README 更新日志顶部最新条；DEV 版本说明「当前」 |
| **Cocos 商城版本** | README 中「已在商城更新」的 **v1.5.0（2024-07）** 等上游大版本 | **仅**保留在 README 既有章节，**不重命名、不当作本仓库下一版** |

Git 下一功能版（如扩展注册工具）在 DEV §版本规划 中写 **v1.5.0（规划中）** 时，**必须**带一句：与商城 v1.5.0 无关。

## SemVer  bump 规则（本仓库）

| 变更类型 |  bump | 示例 |
|----------|-------|------|
| 破坏性 API / MCP 协议不兼容 | MAJOR | 2.0.0 |
| 新功能、新脚本命令、默认行为扩展 | MINOR | 1.5.0 |
| 仅修复、文档修正、无行为变化 | PATCH | 1.4.2 |

## 发布新版本时的编辑顺序

复制此清单执行：

```
- [ ] 1. package.json → version（及必要时 mcpDefaultPort）
- [ ] 1b. package-lock.json 根 `version` 与包内 `"cocos-mcp-server".version` 同步（可 `npm install`）
- [ ] 1c. 若改过 `source/constants.ts` / `mcp-server` 的 `serverInfo.version` → `npm run build`
- [ ] 2. README.md → 更新日志：顶部新增 ### vX.Y.Z - YYYY年M月D日（当前版本）
- [ ] 3. README.EN.md → 同步 Changelog 条目（英文）
- [ ] 4. DEV.md → 文首 **vX.Y.Z**；版本说明「当前」；若功能已交付则从版本规划移除或标为已实现
- [ ] 5. FEATURE_GUIDE_CN.md / EN 页脚版本（若该版改动工具行为）
- [ ] 6. npm run check:identity
- [ ] 7. 勿提交 local.env.json、.cursor/*.local.*
```

### README 新条目模板（Keep a Changelog 风格）

在 `## 更新日志` 下**最上方**插入，并把旧「当前版本」改为普通条目：

```markdown
### vX.Y.Z - YYYY年M月D日（当前版本）

- **Added**: …
- **Changed**: …
- **Fixed**: …

详见 **[DEV.md](./DEV.md)**。（若本条主要是开发工作流）

**后续规划（未实现）**：… — 见 **[DEV.md § 版本规划](./DEV.md#版本规划)**（与商城 v1.5.0 无关）。
```

英文 README 同步：`### vX.Y.Z - Month D, YYYY (Current version)`，分类用 Added / Changed / Fixed。

**仅当本 release 仍无新规划时**，可省略「后续规划」一句；不要把未实现功能写进「当前版本」条目的 bullet 里。

### DEV.md 规划条目模板

未实现功能**只**出现在 `## 版本规划`：

```markdown
| **vX.Y.Z** | 一句话主题 | 规划中 |
```

实现并发布后：从规划表删除或改「已实现」，并在 README 写已发布条目。

## Agent 禁止事项

1. **不要**新建 `ROADMAP.md`、`VERSION.md`、`CHANGELOG.md`（除非用户明确要求且删除重复段落后方可议）。
2. **不要**在 README 与 DEV 各维护一份相同版本对照表。
3. **不要**把「规划中」写成「当前版本」或写入 `package.json`。
4. **不要**用商城 v1.5.0 的标题样式描述 Git 未发布的 v1.5.0（避免 `## 🚀 重大更新 v1.5.0` 式标题用于 Git 规划）。
5. **不要**在 commit 文档时跳过 `npm run check:identity`。

## 快速决策

| 用户意图 | 动作 |
|----------|------|
| 写已发布说明 | 只改 README（+ EN）+ `package.json` + DEV 文首/版本说明 |
| 写下一版想法 / 协议草案 | 只改 DEV §版本规划；README 最多一行链接 |
| 问「当前版本」 | 读 `package.json` `version`，不是 README 商城段 |

## 发布后审查（至少做两轮）

**第一轮 — 版本真源**

```bash
node -p "require('./package.json').version"
rg '"version": "1\\.4\\.' package.json package-lock.json
```

- `package.json` = README 顶部「当前版本」= DEV 文首与「本仓库 Git 当前」
- `package-lock.json` 两处根版本与上式一致
- 勿留 `ROADMAP.md`；勿把「规划中」写进 `package.json`

**第二轮 — 文档与仓库卫生**

```bash
npm run check:identity
rg '当前版本|Current version' README.md README.EN.md
git status   # 无漏提交的 DEV/README 改动
```

- README 仅**一条**「当前版本」标题（中英各一）
- 商城 v1.5.0 章节未改标题、未与 Git v1.5 规划混写
- 未 staged：`local.env.json`、`.cursor/*.local.*`

**第三轮 — 可选运行时**

- `npm run build` 后 `initialize` 的 `serverInfo.version` 与 `package.json` 一致（读 `PACKAGE_VERSION`）

## 参考

- 项目现状示例：[DEV.md § 版本说明](../../DEV.md#版本说明)、[README.md § 更新日志](../../README.md#更新日志)
