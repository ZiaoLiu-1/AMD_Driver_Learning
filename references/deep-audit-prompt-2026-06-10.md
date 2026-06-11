# 深度审查任务：AMD Driver Learning 平台（求职转化力 + 内容质量）

请使用 workflow 多 agent 编排来执行本任务：并行扫描各维度，每条发现必须经过独立的对抗验证（adversarial verify）后才能进入报告。

## 背景（你没有任何先前记忆，以下是全部必要上下文）

- 仓库：`/Users/liuziao/Desktop/AMD_Driver_Learning`，React 19 + Vite + TS 的双语（zh/en）学习平台，教 Linux/AMDGPU 内核驱动开发。无后端，进度存 localStorage，内容全部是 `client/src/data/` 下的 TS 数据文件。
- **核心目标**：这个网站存在的唯一目的是帮站主（学生，自有 RX 7600 XT / Navi33 / gfx1102）拿到 AMD Linux GPU 驱动岗位。每一条建议都用一个标准衡量：**它能否产出 AMD 招聘经理 30 秒内可点击验证的证据？**
- 部署：push 到 main 会自动 SSH 部署到 ziaoliu.io/amd/（`.github/workflows/deploy.yml`）。**本次任务禁止 push、禁止改代码**——只调查和写报告。
- 当前规模（2026-06-10）：14 模块、~82 微课、7 个 lab（lab-6=DRM KUnit/drm_buddy、lab-7=第一个上游补丁）、Module 11.3 求职执行课、上游雷达页（/radar，每日抓 150 条 drm/amd issue + 40 条 amd-gfx 补丁线程，含"疑似有人在做"启发式标记）、26 个测试（含内容不变量套件）、三个 Actions（ci/deploy/radar 每日自动刷新并触发部署）。
- 内容健康度 ~90/100（2026-05-26 全量核查修了 30 处；2026-06-09 抽查：kernel stable 7.0.12 / LTS 6.12.93+6.18.35、ROCm 7.2.4）。

## 必读文件（动手前先读完）

1. `CLAUDE.md` 与 `AGENTS.md` —— 设计规范（反对 SaaS 风/游戏化，双语是一等公民）
2. `references/improvement-plan-2026-06-09.md` —— 现有 P0-P3 计划。**你的任务是找它漏掉的东西并深化它，不是重抄它**
3. `references/content-freshness-verification-2026-05-26.md`（及同日 audit）—— 已修复问题清单 + 方法论教训："单点修复不够，必须全仓库 re-grep 每一类错误"
4. `client/src/data/__tests__/content_invariants.test.ts` —— 现有不变量测试（防错误回归）

## 硬性约束（违反任何一条 = 发现无效）

- **双语镜像**：每个 zh 数据文件有 `_en.ts` 对应（labs.ts/mastery_checks.ts 是单文件双字段）。任何内容问题必须同时检查两个语言版本。
- **事实对冲**：禁止薪资/团队架构/地点作为事实断言；ROCm 支持必须以官方兼容矩阵为准（RX 7600 XT 不在官方支持列表）；版本敏感声明必须用 WebFetch/WebSearch 对一手来源验证（kernel.org、rocm.docs.amd.com、IGT 源码、b4 docs），**不许凭记忆断言**。
- **上游常识**：纯 checkpatch 风格清理在 drm/amd 不受欢迎，kernel-doc/真实警告类修复才是安全区；submitted ≠ merged；freedesktop GitLab 有 Anubis 反爬（浏览器直连 API 不可行，雷达数据只能走脚本快照）。
- 验证门：`pnpm check && pnpm test && pnpm build`（仅用于理解项目，本次不改代码）。

## 调查方向 A：求职转化力（最高优先级）

审计完整的「学习 → 产出 → 简历」转化链路，找断点：

1. **证据流失点**：Labs 1-5 没有"写报告进 portfolio"的收尾步骤（6/7 有）；进度只存 localStorage、无法导出展示；完成模块/lab 后没有任何可分享产物。逐个 lab/模块评估"做完后留下了什么可链接的东西"。
2. **缺失的转化功能**（评估优先级与实现成本）：evidence/export 页（进度+产物链接 → 可分享 markdown/JSON）、雷达 issue 卡片 → Lab 8 triage 工作流的一键路径、模拟面试计时模式（题库已在 PracticePage）、portfolio 仓库模板生成器。
3. **对照真实招聘**：用 WebSearch 调研当前 AMD Linux 驱动相关岗位 JD（careers.amd.com 公开信息）与新毕业生筛选实践，把每个模块/lab 映射到可被面试追问的能力声明，找出"学了但无法证明"的空白。
4. **Module 11 与 lab-7 的时效性**：b4/lore/drm-next 流程指导是否仍与当前社区实践一致。

## 调查方向 B：内容质量与新鲜度

多 agent 并行扫描全部模块（zh+en 各自读，不要只读一边）：

1. 技术错误与过度声明（参考 5-26 报告里的错误类型：硬件规格、缓存层级、参数语义、版本敏感命令）
2. 版本漂移：所有 kernel/ROCm/IGT/工具版本号与命令，逐条对一手来源验证
3. zh/en 语义分歧（不只是结构对齐——May 审计发现过英文已修中文没修的整类问题）
4. 教学深度盲区：display/KMS 实操、电源管理、Mesa 用户态桥接已知薄弱；找出其他盲区并评估对面试的影响
5. **每发现一类错误，全仓库 grep 该类的所有实例**；为每类错误提议新的不变量测试条目

## 产出（先报告，不实施）

写入 `references/deep-audit-2026-06-10.md`：

1. 执行摘要 + 两个方向各自的评分
2. 发现表：严重度 / file:line / 证据（含验证来源链接）/ 建议修复 —— 每条都注明对抗验证结论
3. **按"证据产出/工作量"排序的升级方案**：每项写清楚改哪些文件、预估规模、对求职的具体价值
4. 提议的新不变量测试清单

写完报告后**停下来**，向我汇报摘要并等确认，再决定实施哪些项。
