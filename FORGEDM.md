# ForgeDM 项目宪章（桌面端）

> 本文件是 ForgeDM 项目的"主基调"：产品定位、架构、分支策略、定制纪律。
> 任何开发（人类或 AI Agent）动手前必须先读本文件，并严格遵守第 4 章的分层纪律。

## 1. 产品定位

ForgeDM 是**企业级数据版本托管平台**。

- **客户画像**：以机械行业为主的小规模、重协作企业。
- **产品原则：通用优先** —— 优先服务机械行业场景，但不在代码中硬编码行业逻辑；平台能力对所有行业可用。
- **桌面客户端的使命**：让**非程序员**（机械工程师、设计师）也能完成版本托管的日常操作——克隆、提交、同步、锁定文件。UI 默认中文，术语去程序员化。

## 2. 架构：两个仓库，一个产品

| 仓库 | 上游（remote: `upstream`） | 角色 |
|---|---|---|
| `f1owkang/ForgeDM` | `go-gitea/gitea` | 服务端，托管平台本体 |
| `f1owkang/ForgeDM-desktop`（本仓库） | `desktop/desktop` | 桌面客户端 |

产品路线图的单一事实源在 ForgeDM 仓库的 [`ROADMAP.md`](https://github.com/f1owkang/ForgeDM/blob/main/ROADMAP.md)，本仓库不另维护。

## 3. 分支与基线策略

- **开发基线永远锚定上游 release tag**（`release-X.Y.Z`），不追上游 `development` 滚动分支。
- 自有发布打 `vX.Y.Z-<suffix>` 标签（现有惯例：`v0.1.2-i18n` 等），后续统一为 `forgedm-vX.Y.Z`。
- 上游升级流程 = 选定新 release tag → 重放自有补丁 → 解决少量冲突 → 回归测试 → 打新 tag。
- 目标：一次上游升级的手工冲突解决量控制在**< 1 人天**（与 ROADMAP 验收度量一致）。

### 当前基线

| 项 | 值 |
|---|---|
| 上游基线 | `release-3.6.4`（2026-08-11，当前最新稳定版） |
| 自有提交 | 60 个（57 代码 + 3 文档）：中文化（i18n）、语言偏好设置、CI 修复（MSVC 2022、Linux 打包）、自动发布工作流；实时以 `git rev-list --count release-3.6.4..HEAD` 为准，`git log --grep ForgeDM-Layer release-3.6.4..HEAD` 可查登记后补丁 |
| 历史基线 | `release-3.6.1`（备份分支 `backup/development-pre-3.6.4`），2026-08-24 前移至 3.6.4，仅 1 处 i18n 冲突 |
| 自有 tag | `v0.1.0-test`、`v0.1.1-chinese`、`v0.1.2-i18n` |
| 基线决议 | ✅ 符合"锚定 release tag"策略。下次升级目标：`release-3.6.2` 或更高稳定 tag |

## 4. 定制分层纪律（核心）

为让社区升级低成本，所有定制必须落在**最低可行层级**：

### L0 · 零冲突层（首选）

- 新增独立文件：`app/src/forgedm/`、`app/styles/forgedm*` 等 vendor 前缀路径，上游永不撞名
- 构建配置与资源替换（应用名、图标、productName）走打包层

### L1 · 低冲突层

- 新增模块 + 在上游文件中的**最小接线**（菜单项、设置入口等）
- 接线处必须成对标记：

```ts
// FORGEDM-BEGIN: <特性名>
...接线代码...
// FORGEDM-END
```

### L2 · 补丁层（最后手段）

- 修改上游文件内部逻辑：改动最小化，带 `// FORGEDM: <原因>` 注释
- **必须**登记到本文件第 7 章的补丁登记表

**判定顺序：能 L0 不 L1，能 L1 不 L2。拿不准就问项目所有者，不要擅自改上游逻辑。**

## 5. i18n 专项策略（全项目最大的升级冲突源）

上游 GitHub Desktop **没有 i18n 框架**。我们目前的中文化是源码级补丁：50+ 个提交、遍布数百个文件。这意味着每次上游升级，所有被改过的文件都是潜在冲突点。

**既定方向：翻译资产与代码补丁分离（脚本化重放）。**

1. 翻译表独立维护（英文原文 → 中文译文），不散落在源码提交里
2. 用 codemod 脚本对**干净的上游 tag** 重新应用翻译，一次性生成 i18n 补丁
3. 上游升级 = 在新 tag 上重跑脚本，**而不是 rebase 50 个历史提交**

过渡期安排：现有 `development` 分支继续维护；i18n 脚本化改造单独立项，完成前新字符串的翻译仍走直接改源码，但必须带 `// FORGEDM:` 注释并登记。

## 6. 提交规范

- Conventional Commits：`type(scope): subject`
- 自有提交必须带层级 trailer（可用 `git log --grep ForgeDM-Layer` 审计全部自有补丁）：

```
feat(forgedm): add language preference setting

ForgeDM-Layer: L1
```

- 现有 57 个代码类历史自有提交为"登记前时代"，不追溯补标（带 `ForgeDM-Layer` trailer 的仅登记后 3 个 docs 提交）

## 7. 补丁登记表（L2 补丁必须登记）

| 文件 | 原因 | 标记 | 可移除条件 |
|---|---|---|---|
| （数百个 UI 源码文件） | 中文化 i18n 补丁（历史提交，未逐个标记） | 无（历史） | i18n 脚本化改造完成后整体重生 |
| CI 工作流（MSVC 2022 pin、Linux 打包） | 构建我们的发行版 | 提交 `049daad2fb` 等 | 上游支持 Linux 打包 |
| `app/src/lib/stores/cloning-repositories-store.ts`（catch 块） | 克隆私有实例失败时追加连接诊断提示（WP-C Task 3） | `FORGEDM-BEGIN/END` + import 标记 | 上游在克隆错误路径提供诊断扩展点 |

---

*宪章版本：v1（2026-08-24）。修改本文件需要项目所有者批准。*
