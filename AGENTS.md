# ForgeDM Desktop

本仓库是 **ForgeDM Desktop** —— 基于 GitHub Desktop 的 ForgeDM 桌面客户端（企业级数据版本托管平台）。

动手前必须阅读 [FORGEDM.md](./FORGEDM.md)，并遵守其中的：

- **定制分层纪律**：L0 零冲突层 → L1 低冲突层 → L2 补丁层（能 L0 不 L1，能 L1 不 L2）
- **i18n 专项策略**：翻译资产与代码补丁分离，上游升级靠脚本重放而非 rebase 历史提交
- **提交规范**：Conventional Commits + 自有提交带 `ForgeDM-Layer: L0|L1|L2` trailer
