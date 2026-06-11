# Deep Audit — 求职转化力 + 内容质量（2026-06-10）

执行方式：7 个并行扫描 agent（A1 转化链路 / A2 JD 调研 / A3 上游流程 / B1-B3 内容分段 / B4 版本验证）+ 1 个独立对抗验证 agent 复核全部 file:line 断言 + 主线对一手来源终裁。本次**未改任何代码**。

对抗验证有实际效果：推翻了 3 条候选发现，并纠正了验证 agent 自身的 1 个错误前提（详见 §6）。所有进入 §2 的发现均为「扫描发现 → 独立复核引用原文 → 冲突时以一手来源终裁」三步走完的结论。

---

## 1. 执行摘要与评分

### 方向 A：求职转化力 — **55/100**

课程层是好的：lab-6/7 + Module 11.3 的「机会金字塔 → 四道闸门 → b4 → lore 跟踪」设计经一手来源逐条验证后基本站得住（反 checkpatch 垃圾补丁立场与 docs.kernel.org 的 display-contributing 官方口径强一致，submitted≠merged 被反复正确区分）。**断点在产品层**：7 个 lab 中 5 个在「产生可链接证据」前一步就结束；进度只有 localStorage 且全站唯一出口操作是删除；雷达页发现 issue 后没有任何站内下一步（课程在 module11:1053 明确承诺了 issue triage 入口，产品没有承接）；11.3.2 简历公式给出的 `notes/lab1.md`、`analysis/hang.md` 占位链接，站内实验流程不生产对应文件。另有 2 个**命令级错误**直接威胁最高价值路径 lab-7：照打必报错（§2 A-7/A-8）。

JD 实证（2026-06-10 实抓 5 份 AMD 在招 JD + Igalia/Collabora/Canonical/Red Hat 原文）：AMD Linux 内核岗几乎全部要求 4-8 年经验，新毕业生现实路径是「公开贡献记录被注意 + 相邻雇主（Canonical Junior Kernel Engineer 明确面向毕业生）平行投递」——这恰好印证本站「一切围绕可点击证据」的策略是对的，执行没跟上。

### 方向 B：内容质量与新鲜度 — **76/100**

May 修复的错误类别（IGT 子测试、virtme-ng、dynamic_debug、ROCm 矩阵挂钩、zh 侧软化）整体守住了，b4/lore/MAINTAINERS 等流程内容经一手验证非常健康。拉低分数的是三个 May 审计未覆盖的**系统性问题**：①全仓库 BAR 编号混乱（≥12 处互相矛盾，仅 module3 一处正确）；②RX 7600 XT 显存 8GB 残留二次漏网（8 处 `8192 MB`/`8176 MiB` 字样，现有不变量测试只禁了字节数 `8589934592`，没禁 MB 写法——这正是漏网原因）；③Module 4/5 高频教学函数 `dc_commit_state()` 在站点自己钉的 v6.12 里已不存在（已验证 v6.12 `dc.h` 只有 `dc_commit_streams`），且面试答案明确教学生说出这个函数名。另有 ROCm 安装 URL 落后一个 patch 版本、一个虚构的 IGT 子测试名、一批 zh/en 语义分歧（zh 硬编码数字/分支名而 en 已对冲——May 的「单边修复」失败模式换了个方向重演）。

---

## 2. 发现表

严重度定义：Critical=面试/操作中直接露馅或命令报错；High=技术错误或显著漂移；Medium=失精/分歧/对冲违规；Low=瑕疵。
路径省略 `client/src/`。zh/en 同位置错误记一条。每条末尾给对抗验证结论。

### 方向 A：转化链路

| # | 严重度 | 位置 | 证据 | 建议修复 | 对抗验证 |
|---|---|---|---|---|---|
| A-1 | **P0/Critical** | data/labs.ts（lab-1 末步 order:6「使用 virtme-ng 安全测试」；lab-2 末步 order:4「分析 dmesg 日志」；lab-3 末步 order:4 trace 存 `/tmp` 即止；lab-4 末步 order:4；lab-5 末步 order:5 要求"画出"初始化图但无保存步骤） | Labs 1-5 做完后站外不存在任何可点击产物；对照 lab-6 step7（`tests/kunit-drm-buddy-report.md` + Portfolio 链接）、lab-7 step8（lore 链接进 Portfolio）有完整收尾 | 每个 lab 补一个产出步骤：lab-1→`notes/lab1-kernel-build.md`、lab-2→`analysis/gpu-hang-report.md`、lab-3→`analysis/fence-trace.md`、lab-4→`notes/amdgpu-module-params.md`、lab-5→`analysis/ip-block-init-order.md`，文件名与 11.3.2 简历公式占位一一对应 | 独立 agent 逐 lab 复读末步原文，CONFIRMED |
| A-2 | **P0** | data/module11_micro_lessons.ts:1249-1251、1336-1341（en 同） | 12 周计划与简历 bullet 示例引用 `github.com/you/portfolio/notes/lab1.md`、`analysis/hang.md`、`tests/kunit.md`，但 labs 1-3 无任何步骤生成这些文件；「申请记录表」(:1262)、「长文分析」(:1259) 全站仅出现一次、无模板支撑 | 与 A-1 联动：lab 收尾步骤文件名对齐这些占位路径 | CONFIRMED（注：占位路径属示例性质，但"课程教带链接、实验不产链接"的断裂属实） |
| A-3 | **P1** | pages/RadarPage.tsx:522-530,613-621；data/labs.ts（无 lab-8）；module11:1053 | issue 卡片只有 GitLab 外链；课程明确写「认领你的硬件能复现的 bug 就是入口」，产品未承接；RadarIssue 已含 iid/labels/patchMatches，数据就绪 | 新增 `lab-8-issue-triage`（复现→dmesg/devcoredump→规范 comment/Tested-by→链接进 portfolio，~200 行数据）+ Radar 卡片一键带参跳转（~50 行）。**这是四个候选功能中证据价值最高的**：freedesktop GitLab 公开评论与补丁同级可点击，且展示真实硬件调试能力 | CONFIRMED |
| A-4 | **P1** | contexts/ProgressContext.tsx:49,135-138；hooks/useLabProgress.ts:11；pages/Home.tsx:70-77 | 三个 progress key 全站唯一出口操作是删除；无任何 export/share 代码；`startedAt/completedAt`、notes 等导出原料已在库里 | evidence/bullet 生成器页（~300 行）：lab 完成态+用户自填 lore/portfolio 链接 → 按 11.3.2 公式输出中英 bullet。注意自报进度本身不是证据，定位为 bullet 生成器；依赖 A-1 先落地 | CONFIRMED |
| A-5 | **P2** | pages/AssessmentPage.tsx:23（useState，刷新即失）；pages/PracticePage.tsx:93-95（无计时/会话/错题本） | 唯一模拟面试官追问的功能结果易失；题库 ~115 题/语言已聚合，包装是缺口 | Assessment 结果落 localStorage+弱项→lab 反向链接（数据已有 relatedLabId，零内容成本）；Practice 计时模式缓做（产出零可点击证据，排最后） | CONFIRMED |
| A-6 | **P2** | module11:578-735（11.2.1 已含完整 README 模板与目录结构） | portfolio 模板生成器若做成站内 zip 下载收益低（招聘经理点开的是 GitHub） | 建公开 GitHub 模板仓库 `gpu-driver-portfolio-template`（骨架文件名对齐 A-1），11.2.1 与各 lab 收尾步骤给 "Use this template" 链接。代码量≈0，模板仓库本身又是一个公开作品 | 方案评估，无需验证 |
| A-7 | **Critical** | data/labs.ts:720-722（zh/en 内联同错） | `b4 prep --enroll-base agd5f/amd-staging-drm-next`——b4 文档与源码（command.py：`'-e', '--enroll', dest='enroll_base'`）证实**该长选项从未存在**，照打必报错；:721 hint「若你的 b4 版本不支持 --enroll-base」前提错误 | 改 `b4 prep -e agd5f/amd-staging-drm-next`，重写 hint | A3 对 b4.docs.kernel.org/contributor/prep.html + GitHub 源码验证；B4 独立复核同结论。CONFIRMED（两源交叉） |
| A-8 | **Critical** | data/labs.ts:708；module11_micro_lessons.ts 与 _en.ts 各 :83/:173/:237/:246 区域 | `scripts/get_maintainer.pl -g HEAD~1..HEAD`——get_maintainer.pl 源码无 `-g`，`--git` 是布尔开关，`HEAD~1..HEAD` 会被当 patch 文件名而 die。系 checkpatch 的 `-g` 误移植，全站多处复制 | 改 `git format-patch -1 && scripts/get_maintainer.pl 0001-*.patch`（module11:37 已有的正确形式），zh/en 同步修 | A3 对 torvalds/linux master get_maintainer.pl 源码验证。复核 agent 曾判"正确"，**以源码终裁推翻**。CONFIRMED |
| A-9 | Low | module11:801-823（zh/en 同） | 11.2.2 把 Markham/Shanghai 组织架构与 "Alex Deucher (Lead)" 画成确定性图表，同课 concept 文本 (:784,788) 又声明组织架构不应当作事实——图文自相矛盾 | 图中加「示意，以当前公开信息为准」标注 | CONFIRMED |
| A-10 | Low | module11_micro_lessons_en.ts:573-574 | 英文误译："GitHub warehouse"（仓库→repository）、"Search your inbox"（应为 search for your email address） | 修正两处译文 | CONFIRMED |

**JD 对照结论（A2，2026-06-10 实抓，链接见 §7）**：AMD 在招 Linux 内核岗高频要求依次为 upstream workflow/邮件列表补丁（77966 原文 "building and submitting patches on a mailing list"）、kernel C、跨子系统调试、virtualization/QEMU（78449 整岗）、ACPI/PCIe/RAS/CXL 平台（77966）、固件边界 PMU/RAS/BIOS（86720）、backporting（86642）、单元测试（77966 职责）。**学了但难证明的空白**：固件交互（PSP/SMU/DMUB 全站只有 mastery_check 一题带过）、虚拟化/SR-IOV（零覆盖，而 AMD 已开源 GIM 驱动，是冷门可贡献切入点）、backporting/stable 流程（11.3.1 一段话带过）、CI/kernelci（Collabora 明文加分项）、benchmark（86642 明文）。display 专岗本轮未抓到在招 JD，该盲区按证据强度排序应在 PM/虚拟化/固件之后。注意：AMD JD 链接寿命极短（9 个 Req ID 中 4 个已 404），站内任何 JD 引用必须带抓取日期。

### 方向 B：内容质量

| # | 严重度 | 位置 | 证据 | 建议修复 | 对抗验证 |
|---|---|---|---|---|---|
| B-1 | **Critical（系统性）** | 寄存器空间被错标 BAR2：module0:601-602（zh/en）、module2_group1.ts:133,139（zh/en）、module2_group2.ts:44、module5:113-115（zh/en）、curriculum.ts:427；被错标 BAR0：curriculum.ts:1866-1867、module3:428；BAR0/BAR2 功能互换：curriculum.ts:1163（"VRAM 空间（BAR2，约 8GB）"+"MMIO 寄存器（BAR0，256MB）"）、curriculum.ts:1170 | 全仓库存在 ≥3 种互相矛盾的 BAR 映射；唯一与实际 amdgpu 源码一致的是 module3:352-353（`rmmio = pci_resource_start(pdev, 5)`）。正确布局：BAR0=VRAM aperture、BAR2=doorbell、BAR5=MMIO 寄存器（May 审计 M9 已确认 BAR5=MMIO，但只修了 module3 一处） | 全仓库统一为 BAR0=VRAM/BAR2=doorbell/BAR5=MMIO；修复时对 v6.12 `amdgpu_device.c` 再核对一次；加不变量测试（§4-T2） | 复核 agent 逐处引用原文并输出全局 BAR 用法清单，CONFIRMED。这是 May「单点修复不够」教训的又一实例：M9 修了 module3 却没 re-grep 全仓库 |
| B-2 | **Critical** | `8192 MB`/`8176`/`8GB` 作为 RX 7600 XT 显存：module2_group1.ts:146 与 _en.ts:146（"VRAM 总量: 8192 MB"/"VRAM Total: 8192 MB"）、module5:~630（zh/en "VRAM: 2048MB / 8192MB used"）、module10:~466（zh/en "GPU VRAM: 8176 MB"）、module4:1205/_en:1208（"drm-total-vram: 8176 MiB"）、module2_group3:~355（zh/en "heap[0]: size=8192 MiB ... VRAM"）、curriculum.ts:235/2490（"8GB GDDR6"）、curriculum.ts:1163（"约 8GB"） | RX 7600 XT 为 **16GB GDDR6**（AMD 官网产品页与新闻稿，2026-06-10 复核）。May H1 修了一批（含 dmesg 8176M→16368M）但漏掉以上 8 处；现有不变量测试只禁字节数 `8589934592`，未禁 MB 写法 | 8192→16384、8176 MiB→16368 MiB（驱动报告值，与 May H1 修过的 dmesg 一致）、8GB→16GB；加不变量测试（§4-T1） | **本次对抗验证最关键一条**：复核 agent 反向断言"RX 7600 XT 实为 8GB、16GB 才是错的"，与 May 审计冲突；按「禁止凭记忆断言」规则对 AMD 官网终裁：16GB 成立，复核 agent 前提被推翻，B1 原发现 CONFIRMED |
| B-3 | **High** | module4:525,591,638,667,730-731（zh/en 同行号）；module5:905,972,981,988,1400,1431,1451,1469,1476,1556,1562,1571（zh/en） | `dc_commit_state()` 被当作现行核心 API 教学，:730 面试答案教学生说出该函数名。一手验证：v6.12（站点钉的 Source Guide 版本）`dc.h` 中**只有** `enum dc_status dc_commit_streams(...)`，`dc_commit_state` 已无声明（仅 dc_stream.h 一条陈旧注释提及） | 全部出现处改为 `dc_commit_streams()` 并加「API 随版本演进，面试讲原理」注记；面试答案删除背诵具体函数名的引导；加不变量测试（§4-T3） | 主线 fetch v6.12 dc.h 原文 grep 终裁，CONFIRMED |
| B-4 | **High** | pages/SetupGuide.tsx:933-934,940-941,949 | 安装 URL `amdgpu-install/7.2/ubuntu/noble/amdgpu-install_7.2.70200-1_all.deb`；官方 quick-start 今日为 `7.2.4/.../amdgpu-install_7.2.4.70204-1`，RHEL 示例已到 9.7 | 三处 URL 升级 7.2.4/70204-1；考虑抽成常量+不变量测试（§4-T7） | B4 对 rocm.docs.amd.com quick-start 验证；复核 agent 确认站内原文。CONFIRMED |
| B-5 | **High** | module11_micro_lessons.ts:~369 与 _en.ts:~369 | 示例 commit message "Tested on RX 7600 XT (gfx1102) with IGT `amd_basic@vm-tests`"——IGT 官方手册中 amd_basic 无 `vm-tests` 子项（vm 类测试在独立的 `amd_vm`：vmid-reserve-test 等）。教学生把虚构子测试名写进给维护者看的 commit message，是 lab-7 路径上的露馅点 | 改 `amd_vm` 或 `amd_basic@memory-alloc` | B4 对 drm.pages.freedesktop.org/igt-gpu-tools 手册验证；复核 agent 仅确认了"格式正确"未查子项存在性，**以 IGT 手册终裁**。CONFIRMED |
| B-6 | Medium | module05:502 与 _en.ts:502；curriculum.ts:2461,2485 | "L2 Cache: 32MB (Infinity Cache)"——Navi33 L2 实际 ~2MB，32MB 是独立的末级 Infinity Cache；module8:263 同仓库已是正确表述（"L2 (~2MB) + Infinity Cache (32MB 末级)"），即 May M11 修了 module8 没 re-grep 别处 | 对齐 module8 口径；glossary 增补 Infinity Cache 词条（zh/en） | 复核 agent 确认原文与 module8 的矛盾。CONFIRMED |
| B-7 | Medium | module10:187 与 _en.ts:187；curriculum.ts:3236 | IGT 依赖列表只写 `libprocps-dev`——Ubuntu 24.04 无此包（已改名 libproc2-dev），与 SetupGuide.tsx:175-179 的双写处理自相矛盾 | 统一双写（24.04 用 libproc2-dev / 22.04 用 libprocps-dev）；加不变量测试（§4-T8） | B4 对 packages.ubuntu.com 验证 + 复核确认。CONFIRMED |
| B-8 | Medium（zh/en 分歧类，5 处） | ① module0:886,906,974,1005 zh 硬编码 `agd5f` URL+`amd-staging-drm-next` vs _en:907,975,1004 用 `<kernel-tree-url>`/`<maintainer-branch>` 占位；② module11:118,143,267 zh 裸分支名 vs _en:117,142,143 占位符（zh :143 的 `git checkout -b fix/... amd-staging-drm-next` 不配 remote 必失败）；③ module0:500 zh "4200000+ total" vs en "multi-million"；module0:36,42 与 module05:549,556 "超过 400 万行"未对冲；④ module10:959 zh "FLAKE 测试自动重试 2-3 次" vs _en:807 已对冲为 "infrastructure-specific"；⑤ module11:~769 zh "两轮 Review 后被合并" vs en "normal kernel workflow" | May 的失败模式（单边修复）反向重演：这一批是**英文修了中文没修** | zh 对齐 en 的对冲口径；②中代码块改 remote 限定形式 `agd5f/amd-staging-drm-next` 并补 `git remote add` 前置；加分歧类不变量测试（§4-T6/T9） | 复核 agent 逐处引用两语原文（修正了两处行号），CONFIRMED |
| B-9 | Medium（事实对冲残留） | "持续招聘"：module0:396,405、ecosystem_module.ts:243；"最重要的 GPU 软件开发中心"：ecosystem_module.ts:29（en :32 "primary" 同样问题）；"AMD Markham Toolchain 团队的核心工作"：module9:462,674、curriculum.ts:2682,2690（zh/en 同有） | 招聘是周期性的（A2 实抓即见 4/9 JD 已 404）；"最重要/primary/核心工作"是不可验证的组织断言，LLVM AMDGPU 后端是多组织共同维护的社区项目 | "持续招聘"→"有相关岗位，以 careers.amd.com 实时职位为准"；"最重要"→"重要……之一"（en 同步 "a major"）；Markham Toolchain→"AMD 工程师是主要贡献者之一"；加不变量测试（§4-T5） | 复核 agent 确认全部位置（含 en 侧 "primary" 同病）。CONFIRMED |
| B-10 | Low | ① module6:~1119 hint "RX 7600 XT 可能是 gfx1100 或 gfx1102"（实际确定为 gfx1102，gfx1100 是 Navi31）；② module8:461（zh/en）"使用 rocm_agent_enumerator 和 hipOccupancyMaxPotentialBlockSize 计算最优 Block 大小"（前者只枚举 agent，与 occupancy 无关）；③ module6 6.1.3（:470-471,606-608）教 rocprof 但未注明 gfx1102 不在 ROCm 官方支持列表（module8:180-185 有此对冲，6.1.3 没有）；④ module3:473-481 zh 文件含整段未翻译英文（dev_err_probe 段落+keyPoint） | — | ①直说 gfx1102；②句中删 rocm_agent_enumerator；③补一句兼容矩阵对冲（与 module8 同款）；④翻译该段 | 复核 agent 确认（②原报告误写 module9，已纠为 module8:461）。CONFIRMED |
| B-11 | 信息 | 教学盲区（与 A2 JD 调研交叉印证）：display/KMS 实操（11.2.2 自己把 KMS 列为 ★★★★★ 面试域，站内无对应实操）、PM/SMU 内幕、Mesa→libdrm→ioctl 桥接、固件 PSP/SMU/DMUB（仅 mastery_check mq-4 一题）、虚拟化/SR-IOV（零覆盖）、backporting/stable、CI/benchmark。另：B3 报告 module9 的 JD 映射课把 "GPU power management" 映射到「Module 9: 电源管理和 SMU」而 Module 9 实际是 LLVM 后端（**此条未经独立复核，置信度中，实施前先确认**） | — | 见 §3 第 8 项的扩展排序 | 盲区为评估性结论；标注的一条存疑项已注明 |

---

## 3. 升级方案（按 证据产出/工作量 排序）

| 序 | 项目 | 改哪些文件 | 规模 | 对求职的具体价值 |
|---|---|---|---|---|
| 1 | **Labs 1-5 补产出收尾步骤**（A-1/A-2） | data/labs.ts（5 个 lab 各 +1 step，文件名对齐 11.3.2 占位路径）；module11 12 周计划微调 | ~150 行内容，半天 | 直接解锁简历 bullet 的链接目标；11.3.2 的承诺从此站内可兑现。整个转化链路的根因修复 |
| 2 | **修 5 处命令/版本硬错误**（A-7/A-8/B-4/B-5/B-7） | labs.ts、module11 zh+en、SetupGuide.tsx、module10 zh+en、curriculum.ts | 半天 | 保护「最高 ROI 路径」lab-7 不在第 6/7 步报错劝退；保护 commit message 不带虚构子测试名露馅 |
| 3 | **BAR 统一 + 16GB 残留 + dc_commit_streams**（B-1/B-2/B-3/B-6） | module0/2/3/4/5、curriculum.ts、module05、glossary（zh+en 全部同步） | 1-2 天（修复+对 v6.12 源码核对+新不变量测试） | 内容可信度核心：BAR/缓存/显存/display API 全是面试可追问点，现状会让学生说出三种互相矛盾的 BAR 布局和一个已删除的函数名 |
| 4 | **Lab 8 issue triage + Radar 一键路径**（A-3） | data/labs.ts（新 lab，~200 行）、RadarPage.tsx+LabDetailPage.tsx（~60 行） | 1-2 天 | 新证据流：freedesktop GitLab 公开 triage 评论/Tested-by 与补丁同级可点击，且展示真实硬件（RX 7600 XT）调试能力；闭环课程已承诺的入口 |
| 5 | **GitHub portfolio 模板仓库**（A-6） | 站外新仓库；module11 11.2.1 与各 lab 收尾步骤加链接 | 零代码，2 小时 | 一键起步 + 模板仓库本身是又一个公开作品 |
| 6 | **zh/en 分歧批量修 + 事实对冲残留**（B-8/B-9/B-10/A-9/A-10） | module0/05/3/6/8/9/10/11、ecosystem、curriculum（zh+en） | 1 天 | 防"学中文版的人面试说出 2-3 次重试/两轮 review/持续招聘"这类可被当场反驳的断言 |
| 7 | **Evidence/bullet 生成器页**（A-4） | 新 pages/EvidencePage.tsx + App.tsx 路由 | ~300 行 | 把 lab 完成态+真实链接套进 11.3.2 公式输出中英 bullet；依赖第 1 项先落地 |
| 8 | **内容扩展（对 JD 盲区）** | 优先级按 JD 证据强度：①固件 PSP/SMU/DMUB 概览课（module2 或 5 加一组）②虚拟化/SR-IOV+GIM 简介课 ③backporting/stable 实操课（11.3 扩展）④vkms display lab 与 PM observability lab（improvement-plan P2 已列）⑤CI/kernelci+benchmark 一课 | 每项 0.5-2 天内容 | 对照 §2 A 末段：固件/平台/虚拟化是 AMD JD 高频但全网教学稀缺，差异化最大 |
| 9 | **Assessment 持久化 / Practice 计时**（A-5） | AssessmentPage.tsx、PracticePage.tsx | 各 ~150-250 行 | 纯内功，零可点击证据，排最后 |

---

## 4. 提议的新不变量测试（content_invariants.test.ts 增补）

按 May 教训「每类已修错误必须机械化防回归」：

- **T1 显存禁字**：FORBIDDEN 增 `"VRAM 总量: 8192"`、`"VRAM Total: 8192"`、`"8192MB used"`、`"8176 MB"`、`"8176 MiB"`、`"(8GB GDDR6"`、`"约 8GB"`（RX 7600 XT 语境；按行匹配即可，这些串无合法用途）。
- **T2 BAR 禁字**：`"寄存器空间（BAR 2"`、`"寄存器空间（BAR2"`、`"映射寄存器 BAR"`（紧邻 `(pdev, 2)`）、`"BAR2 ← GPU 寄存器"`、`"BAR0（MMIO 寄存器"`、`"Register BAR"`+`bar(0)|bar(2)` 同行；外加正向断言：`pci_resource_start(.*pdev, 5)` 在 data 中至少出现 1 次（防止"修复"时把唯一正确处也改错）。
- **T3 显示 API**：禁 `dc_commit_state`（允许历史口径行，复用 HISTORICAL_ONLY 模式：`已演进|replaced|renamed|no longer`）。
- **T4 上游命令**：禁 `--enroll-base`；禁 `get_maintainer.pl -g`、`get_maintainer.pl --git `；禁 `amd_basic@vm-tests`。
- **T5 事实对冲**：禁 `持续招聘`、`最重要的 GPU 软件开发中心`、`primary GPU software development center`、`Markham Toolchain 团队的核心工作`。
- **T6 硬编码数字**：禁 `4200000+`、`超过 400 万行`、`自动重试 2-3 次`、`两轮 Review`。
- **T7 ROCm 版本一致性**：SetupGuide 中 `amdgpu-install_` 出现的版本串必须全部相等（提取后 Set.size===1），并与导出常量 `ROCM_INSTALLER_VERSION` 一致——把"升级时漏改一处"变成测试失败。
- **T8 包名成对**：任何包含 `libprocps-dev` 的内容行必须同时包含 `libproc2-dev`（反之亦然）。
- **T9 zh/en 分支名分歧**：zh 数据文件与对应 `_en` 文件中 `amd-staging-drm-next` 出现次数必须相等（容许 module11/labs 的操作语境，但两语必须同进退）。
- **T10 zh 文件英文孤岛**：zh micro_lessons 的 explanation/concept 字段中连续 ≥200 字符不含 CJK 即失败（捕获 module3:473 类翻译遗漏；阈值可调避免误伤代码块）。
- **T11 lab 收尾产出**（第 1 项实施后启用）：每个 lab 最后一步的 title/instruction 必须匹配 `/portfolio|报告|report|notes\/|analysis\//i`。

---

## 5. 维护性观察

- AMD JD 引用必须带抓取日期（本轮 9 个 Req ID 已 404 4 个）。
- kernel.org 今日实况：mainline 7.1-rc7、stable 7.0.11、LTS 6.18.34/6.12.92（6.12 EOL Dec 2028）——Source Guide 钉 v6.12 仍安全；bootlin 路径经 GitHub v6.12 tag 抽查存在（bootlin 本体被 Anubis 拦截无法程序化验证，浏览器用户不受影响）。
- 复核确认仍健康、无需动作：IGT `cs-gfx-with-IP-GFX`/`amdgpu-deadlock-gfx`、virtme-ng v1.40 命令形式、b4 prep/check/send 主流程、amd-staging-drm-next 地位（cgit 镜像+amd-gfx pull 线程+AUR 交叉确认）、lore `f:` 查询、RX 9070 XT=Navi48/gfx1201/0x7550（多源确认，站内该表正确）、ROCm 矩阵仍无 RX 7600 XT（7.2.1 矩阵页）、HSA_OVERRIDE_GFX_VERSION 口径。

## 6. 对抗验证记录（被推翻/降级的候选发现）

1. **复核 agent 断言"RX 7600 XT=8GB、站内 16GB 才是错"** → 对 AMD 官网终裁推翻；B-2 按 16GB 成立。教训写给未来审计：对抗验证者自己也必须服从"一手来源优先于记忆"。
2. **B2 候选"lab-4 `echo 2 > pp_dpm_sclk` 应为 echo 3"** → 复核：RDNA3 dGPU sclk 通常 3 档（0/1/2），`echo "2"` 锁最高档语义自洽。REFUTED（保留一条 backlog：在实机上 `cat pp_dpm_sclk` 确认档位数）。
3. **B2 候选"module6_en 存在重复 group 6-2 结构"** → grep 计数 zh/en 各 1 次。REFUTED。
4. **复核 agent 判 A-8（get_maintainer -g）与 B-5（vm-tests）"正确"** → 分别被 get_maintainer.pl 源码与 IGT 官方手册推翻，原发现成立。
5. **B3 候选"rocm_agent_enumerator 在 module9"** → 实际在 module8:461，语境确认后降级为 Low（B-10②）。

## 7. 主要来源

kernel.org 及 /category/releases.html；rocm.docs.amd.com（quick-start、release versions、Radeon Linux 兼容矩阵）；amd.com RX 7600 XT 产品页+新闻稿（16GB GDDR6）；raw.githubusercontent.com torvalds/linux v6.12（dc.h、dc_stream.h、get_maintainer.pl、checkpatch.pl、路径抽查）；b4.docs.kernel.org contributor/prep+send 及 b4 源码 command.py；drm.pages.freedesktop.org/igt-gpu-tools（amd_basic/amd_deadlock/amd_vm 子项）；docs.kernel.org gpu/amdgpu/display/display-contributing.html（反风格清理官方口径）；github.com/arighi/virtme-ng（v1.40）；packages.ubuntu.com jammy/noble；careers.amd.com Req 77966/78449/86642/79565/86720；igalia.com/jobs、jobs.lever.co/collabora、canonical.com/careers/5370815、redhat.com upstream-first 博客；phoronix.com（AMD 招聘、GIM 开源、Valve 签约）；cgit.freedesktop.org/~agd5f + mail-archive amd-gfx（amd-staging-drm-next 交叉确认）；korg.docs.kernel.org/lore.html。

---

## 8. 实施记录（2026-06-10，经用户确认后执行）

已实施升级方案第 **1、2、3、6** 项 + 新不变量测试；第 4（Lab 8 + Radar 路径）、5（模板仓库）、7（bullet 生成器）、8（内容扩展）、9（Assessment/Practice）项为新功能，留待下一轮。改动 35 个文件（+422/-238），**未 commit、未 push**。

逐项：

- **A-1/A-2**：labs.ts 为 labs 1-5 各加一个「产出物」收尾步骤（notes/lab1-kernel-build.md、analysis/gpu-hang-report.md、analysis/fence-trace.md、notes/lab4-module-params.md、analysis/ip-block-init-order.md）；module11 11.3.2 的 12 周计划表与 bullet 示例路径（zh+en）改为与这些文件名一一对应（含 tests/kunit-drm-buddy-report.md 对齐 lab-6）。
- **A-7**：`b4 prep --enroll-base` → `b4 prep -e`（labs.ts + hint 重写）。
- **A-8**：`get_maintainer.pl -g/--git <range>` 全部改为补丁文件形式或 `-f <file>`（labs.ts、module11 zh+en 的 diagram/codeWalk/keyPoints/miniLab steps/expectedOutput，miniLab 中 format-patch 与 get_maintainer 步骤已对调）。
- **B-5**：`amd_basic@vm-tests` → "the IGT amd_vm suite"（zh+en）。
- **B-4**：SetupGuide 三处 ROCm 安装 URL 7.2/70200-1 → 7.2.4/70204-1。
- **B-7**：module10 zh+en 与 curriculum.ts 的 IGT 依赖改为 libproc2-dev||libprocps-dev 双写。
- **B-1**：全仓库 BAR 统一为 BAR0=VRAM aperture、BAR2=Doorbell、BAR5=MMIO 寄存器（module0/2_group1/2_group2/3/5 zh+en、curriculum.ts:426-427/1048/1163/1170/1866、curriculum_en:326-328、glossary BAR 词条）；module2_group1 的 lspci/resource 示例输出、awk NR、变量名同步修正。
- **B-2**：8 处 RX 7600 XT 显存 8GB 残留 → 16GB（8192→16368 MB、8176→16368 MiB、curriculum 两处 8GB GDDR6→16GB）。
- **B-3**：60 处 `dc_commit_state` → `dc_commit_streams`（module4/5/05、curriculum，zh+en），并在 module4 4.x 概念段与 module5 keyPoint 各加一条「v6.12 接口名，老版本叫 dc_commit_state，API 随版本演进」注记。
- **B-6**：module05:502 zh+en 拆分 "L2 ~2MB / Infinity Cache 32MB"；curriculum.ts:2461 与 2485 图表同步拆层；glossary 新增 Infinity Cache 词条（zh+en）。
- **B-8**：module0 zh 分支硬编码改占位符/对冲（en 同步加 e.g. 示例）；module11 zh+en codeWalk 改 remote 限定形式 `agd5f/amd-staging-drm-next` 并补一次性 remote 配置注释；buggyCode 裸 checkout 改占位符；"4200000+/超过 400 万行"（5 处）→ 对冲表述；module10:959 "重试 2-3 次" → 对冲；module11 "两轮 Review" → "若干轮"；module5 doorbell"产生硬件中断" → 与 en 一致的非中断表述；module3:473 区域英文孤岛已译中。
- **B-9**：持续招聘（3 处）、"最重要的 GPU 软件开发中心"/"primary"（zh+en）、"Markham Toolchain 团队的核心工作"（4 处 zh+en）全部对冲；11.2.2 组织架构图加「示意，非官方架构」标注并去人名 Lead 断言（A-9）；en 误译 "GitHub warehouse"/"Search your inbox" 修正（A-10）。
- **B-10**：module6 hint 明确 gfx1102；module8:461 rocm_agent_enumerator 移出占用率语境；module6 6.1.3 rocprof 段补 gfx1102 不在 ROCm 支持列表的对冲（zh+en）。
- **测试（§4 落地）**：content_invariants.test.ts 新增 23 条 FORBIDDEN 禁字（VRAM/BAR/命令/对冲/硬编码数字类）、dc_commit_state 历史口径白名单、T7 ROCm 安装版本一致性、T8 libprocps/libproc2 成对、T9 禁止裸分支 checkout、T11 每个 lab 末步必须产出可链接产物。原 11 测试 + 新增 → **30 个测试**。
- **验证门**：`pnpm check` ✓ / `pnpm test` 30/30 ✓ / `pnpm build` ✓（在干净 Linux 副本上全新安装验证，用户本机 node_modules 未被改动）。
- 测试调试中发现并修正一处禁字过宽（"8192MB used" 会误伤合法的 GTT 8GB 行，已收窄为 "VRAM: 2048MB / 8192MB"）。

未做（记入 backlog）：lab-4 `pp_dpm_sclk` 档位数需实机确认（§6.2）；module9 JD 映射标签错位疑似项（B-11，未经复核）；P0 部署/README/portfolio 仓库等站外动作。
