# Fable5 批判性求职评估 — 2026-07-05

执行方式：本次 = 阶段1 ASCII/对齐修复（已提交 `e533c24`）→ 阶段2 官方一手来源今日复核（ROCm 文档、kernel docs、Phoronix→kernel.org 交叉）+ 复用两份已对抗验证的历史审计（2026-05-26 freshness、2026-06-10 deep audit，其发现的修复状态已逐条 grep 复核）→ 阶段3 招聘视角评估。**本阶段未修改任何教程内容。**

时点声明：所有"当前/最新"均指 2026-07-05；AMD JD 数据引自 2026-06-10 实抓（AMD JD 链接寿命极短，引用时保留抓取日期）。

---

## 1. Executive Summary

**内容正确性：健康（近期三轮审计+修复后）。** 2026-06-10 深度审计的 Critical/High 发现（BAR 布局混乱、16GB 显存残留、dc_commit_state 幽灵 API、b4/get_maintainer 命令错误、虚构 IGT 子测试）已全部修复并固化为不变量测试（30/30 通过）。本次今日复核新增发现集中在**时效漂移**而非事实错误：最重要的一条是 amdgpu 用户态队列已于 Linux 6.16 合入实验性支持，而站内新模块仍写"正在跟进"（F-1）。ROCm 支持口径经与今日官方矩阵逐字对照**完全一致且诚实**——RX 7600 XT/gfx1102 确实不在 ROCm 7.2.4 官方支持列表，站内所有相关位置均已对冲。

**求职转化力：仍是主要短板（延续 6-10 审计 55/100 的判断，产品层缺口未动）。** 内容层面这个站已经属于"能读懂 amdgpu 代码的人写的课程"，但 7 个 lab 中 5 个仍不产生站外可点击证据，lab-8（issue triage）、evidence 生成器等 6-10 审计的 P0/P1 建议全部未实施。**对 AMD 直投而言，网站学习本身不构成录用信号——公开可验证的上游痕迹才是。**

**一句话结论：内容可信度已达标，下一阶段的全部投入应从"写更多课"转向"让学习产生公开证据"。**

---

## 2. Source-Backed Correctness Findings（阶段2）

### 2.1 今日新发现

| # | Severity | 位置 | 问题 | 一手来源（访问 2026-07-05） | 影响 | 建议修复 | 需要不变量测试? |
|---|---|---|---|---|---|---|---|
| F-1 | **Medium** | `data/gpu_arch_micro_lessons.ts` 15-3-4（concept 第4段、keyPoints、interviewQ.answer 中 "图形栈正在跟进/userq 工作正在跟进"；`_en.ts` 同位置） | amdgpu 用户态队列已随 Linux **6.16** 合入实验性支持（GFX11/GFX12），内核已有正式文档页，Mesa 25.2 已合入图形用户队列支持——"正在跟进"的说法落后一个内核周期 | docs.kernel.org/gpu/amdgpu/userq.html；phoronix.com/news/Linux-6.16-AMDGPU-User-Queues（结论回验 kernel docs） | 面试聊到 userq 时说"还没合入"会露馅——这恰是该课自己标注的"前沿加分题" | 措辞改为"Linux 6.16 起已合入实验性支持（amdgpu_user_queue 文档页），Mesa 25.2 起支持图形用户队列；默认路径仍是内核队列"；zh/en 同步 | 否（措辞类，建议纳入季度 freshness 扫描清单） |
| F-2 | Low | `pages/SetupGuide.tsx:927-928` | ROCm 支持口径与今日官方完全一致（好事），但标注"截至 2026-05"；且官方新增了 **TheRock 社区 nightly 构建**通道、ROCm 7.13.0 preview 已列入 RX 7600 (gfx1102) | rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html（"If a GPU is not listed…not officially supported" + TheRock 注记） | 学习者用 7600 XT 想跑 HIP 时，TheRock/preview 是比 HSA_OVERRIDE 更体面的非官方路径 | 日期戳更新为 2026-07；补一句 TheRock/7.13-preview 备注（保持"非官方/不保证"定性） | 否 |
| F-3 | Low | `data/gpu_arch_micro_lessons.ts` 15-2-4/15-3-1 miniLab（"有 ROCm 环境…"） | 新模块 lab 用条件句提及 ROCm，但未重复 gfx1102 不受支持的对冲（module8/SetupGuide 有完整版） | 同 F-2 来源 | 一致性：新学员从 1.5 模块先于 module8 到达 ROCm 命令 | 各加一句"（RX 7600 XT 不在官方支持列表，见环境搭建页说明）" | 否 |
| F-4 | Info | `data/source_roadmap.ts:30-34` | KERNEL_TAG=v6.12（LTS）锚定本身正确且有注释说明；但 6.13-6.16 的重要演进（userq、gfx12 系列完善）不会出现在锚定读码路径里 | kernel.org releases；docs.kernel.org amdgpu 目录 | 面试者需要知道"我读的是 v6.12 快照，X 特性在 6.16 已变"这类版本自觉 | Source Guide 加"锚定版本 vs 当前主线差异"小节（半年一更） | 否 |
| F-5 | Info（正面确认） | 全站 ROCm/硬件规格/命令类内容 | 抽验今日复核全部通过：ROCm 生产版本 7.2.4（SetupGuide URL 已是 7.2.4/70204-1 ✓）；RX 7600 XT 16GB/BAR0=VRAM/BAR2=doorbell/BAR5=MMIO 等由不变量测试锁定 ✓；IGT `amd_basic@vm-tests` 等已被禁字符串 ✓ | 同上 + 6-10 审计修复提交 `ec5ba88` | — | — | 已有 T1-T9 |

### 2.2 历史审计遗留（复核确认仍未实施，全部为产品/覆盖面缺口而非内容错误）

| 来源 | 项 | 状态（今日 grep 复核） |
|---|---|---|
| 6-10 A-3 | lab-8 issue-triage（Radar→复现→规范 comment→Tested-by） | **未实施**（labs.ts 无 lab-8） |
| 6-10 A-4 | 进度→bullet/evidence 生成器 | 未实施 |
| 6-10 A-5 | Assessment 结果持久化 + 弱项→lab 反链 | 未实施 |
| 6-10 A-6 | 公开 GitHub portfolio 模板仓库 | 未实施 |
| 6-10 B-11 | 教学盲区：display/KMS 实操、PM/SMU、Mesa→libdrm→ioctl 桥接、固件（PSP/SMU/DMUB）、SR-IOV/虚拟化、backporting/stable、CI/kernelci、benchmark | 部分缓解（SR-IOV/GIM 已有提及：module0/5/11；其余仍是空白）。注：ROCm 官方文档现已提供正式的虚拟化/GIM 支持矩阵，可作为补课一手材料（见 F-2 来源页 Virtualization support 节） |

### 2.3 zh/en 语义一致性

结构一致性由测试强制（30/30）。语义层：6-10 审计发现的 5 处"单边对冲"（B-8）已修复并有 T6/T9 类测试兜底；本周新增的 gpu-arch/cc-kernel 内容为同批双语撰写并经翻译代理逐段对照。残余风险：未来单边编辑。**建议保持"任何 zh 事实性修改必须同 commit 修 en"的纪律（已写入 dev-log carry-forward）。**

---

## 3. Job-Readiness Scorecard（招聘官视角，1-5）

| 维度 | 分 | 依据 |
|---|---|---|
| 内核/驱动概念正确性 | **4.5** | 三轮审计+不变量测试；命令可照打；术语与内核文档口径一致 |
| 硬件架构理解（新增 1.5 模块后） | **4.5** | wave/CU/WGP/occupancy/VRAM-GTT/ring-doorbell-MQD 链条完整，数字全部挂官方出处 |
| 内核 C 语言能力训练 | **4** | 0.7 模块 19 课覆盖语言→惯用法→并发上下文，配 debug 练习；缺的是"在真实大 diff 上改代码"的肌肉 |
| 上游流程知识（b4/lore/MAINTAINERS） | **4** | 6-10 修复后命令级正确；但知识≠履历 |
| 调试实战能力 | **3** | dmesg/devcoredump/umr/ftrace 都有课；lab 止步于"看到现象"，缺"写出 RCA 报告"的强制产出 |
| **可验证证据产出** | **1.5** | 7 个 lab 仅 lab-6/7 有站外产物出口；无 issue triage、无公开 portfolio 模板、进度不可导出 |
| 面试题覆盖与质量 | **4** | ~115 题/语言、双语、带 amdContext；缺压力面/白板编码模拟 |
| 对"能不能上手干活"的训练 | **2.5** | 读码路线好；但没有任何一个练习要求"改内核代码→编译→跑通测试→形成 patch"闭环（lab-7 有形无环：不强制真实发出） |

**加权印象分：内容 A-，转化 D+。** 这与 6-10 审计结论一致——瓶颈不在再加一门课。

---

## 4. Module / Lab 逐项评估（证据产出视角）

| 单元 | 学习价值 | 能否产生可验证作品 | 备注 |
|---|---|---|---|
| 0 引言 / 0.5 生态 / 1.5 GPU架构 / 1.7 图形API | 高 | ❌（认知类） | 面试谈资扎实；1.5 的 12 张图是讲解利器 |
| 0.7 C/C++（19 课） | 高 | ⚠️ 半 | miniLab 全部本机可跑但无归档要求→加"提交到个人 repo"一步即可转化 |
| 1 基础准备 / 3 内核 | 高 | ⚠️ | 内核模块编译类练习天然适合 portfolio，缺收尾步骤 |
| 2 硬件接口 / 4 DRM / 5 amdgpu | 很高（面试核心区） | ❌→可改 | 5.x 的 fence/CS/TTM 读码笔记若模板化=优质长文素材 |
| 6 调试 | 高 | ⚠️ | hang 分析是最好写成公开 RCA 的素材，未强制 |
| 7/8 ROCm | 中高 | ⚠️ | 受 gfx1102 支持限制（对冲已诚实）；建议增加 TheRock 路线实测 |
| 9 LLVM | 中 | ❌ | 概念够用；离"能改后端"很远（这对 driver 岗可接受） |
| 10 测试（IGT/KUnit） | 高 | ✅（lab-6） | kunit 报告是现成作品出口 |
| 11 职业 | 很高（策略正确） | ✅（lab-7，但见下） | "证据金字塔"方法论是全站最有差异化的内容 |
| lab-1..5 | 中 | ❌ | 6-10 A-1 收尾步骤已加文件名占位（fix 提交），但仍无"推到公开 repo"的硬性动作 |
| lab-6 KUnit | 高 | ✅ | 全站最佳闭环 |
| lab-7 first patch | 很高 | ✅（若真发） | 命令已修正确；缺"发出后如何跟 review 迭代 v2"的续篇 |

---

## 5. Missing Topics & Unknown Unknowns

按（JD 出现频率 × 站内空白度）排序（JD 证据：6-10 实抓 5 份 AMD + Igalia/Collabora/Canonical/Red Hat）：

1. **修改-构建-验证闭环缺失（最大 unknown unknown）**：全站没有一个练习要求学员真的改一行 amdgpu 代码并跑通。AMD JD 原文 "building and submitting patches on a mailing list" 是行为要求，不是知识要求。
2. **display/KMS 实操**：站内自评 ★★★★★ 面试域，无对应 lab（atomic commit 追踪、modeset 日志分析都可以在任何 AMD 卡上做）。
3. **虚拟化/SR-IOV/GIM**：AMD JD 78449 整岗方向；ROCm 官方虚拟化矩阵（2026 版）+ 开源 GIM 驱动 = 现成教材与冷门贡献切入点；站内仅零星提及。
4. **固件边界（PSP/SMU/DMUB）**：JD 86720 主题；站内一题带过。不需要深（NDA 墙内），但要能讲清"驱动↔固件职责分界 + 固件加载链"。
5. **backporting/stable 流程**：JD 86642；11.3.1 一句话。做一个"把 mainline fix backport 到 6.12 LTS"的 lab 性价比极高（正好利用站点的 v6.12 锚定）。
6. **CI/kernelci/IGT 自动化**：Collabora 明文加分项。
7. **性能/benchmark 方法论**：JD 86642 明文；现有 rocprof 内容受 gfx1102 限制，可转向 mesa perf/gpuvis 路线。
8. **userq/新特性追踪机制**：F-1 暴露的流程问题——站点缺"内核版本→特性矩阵"这种随版本滚动的页面（radar 只追 issue/patch，不追特性落地）。

---

## 6. Prioritized Improvement Roadmap

**P0（直接决定证据产出，2 周内）**
1. lab-8 issue-triage（6-10 A-3 设计已完备：Radar 卡片带参→复现→dmesg/devcoredump→GitLab 规范评论→链接入 portfolio）。
2. 公开 portfolio 模板仓库 + 所有 lab 收尾步骤指向它（6-10 A-6，代码量≈0）。
3. lab-7 续篇：v2 迭代/回应 review/跟踪 merge 状态（把"发出"变成"跟完"）。

**P1（4-6 周）**
4. "改一行代码" lab：给 amdgpu 加一条 drm_dbg 打印→重编内核模块→验证输出→format-patch（不必发出，练闭环）。
5. display/KMS 实操 lab（atomic ioctl 追踪 + modeset 失败注入分析）。
6. backport lab（mainline→v6.12）。
7. F-1/F-2/F-3 内容更新（半小时工作量，待批准后做）。
8. evidence/bullet 生成器（6-10 A-4）。

**P2（12 周内）**
9. SR-IOV/GIM 概览课 + GIM 仓库 issue 跟踪加入 radar。
10. 固件边界一课 + PM/SMU 一课。
11. Assessment 持久化 + 弱项反链（A-5）；特性-版本矩阵页（对 F-4/F-1 类漂移的系统解）。

---

## 7. 概率评估（诚实版）

前提假设：申请人为新毕业生/转行者（无 4-8 年内核履历——6-10 实抓显示 AMD Linux 内核岗几乎全部要求 4-8 年）；目标含 AMD 直投 + 相邻雇主（Canonical/Collabora/Igalia/Red Hat，其中 Canonical Junior Kernel Engineer 明确面向毕业生）；一个申请周期 ≈ 6-12 个月、持续投递与社区活动。**以下是基于 JD 证据链的量级判断，不是承诺；每档指"进入面试后走完全程拿到 offer 的综合可能性"的相对量级。**

| 情景 | AMD 直投 | 相邻雇主（junior 通道） | 判断依据 |
|---|---|---|---|
| A. 只学完网站，无公开证据 | 极低（<5%） | 低（5-15%） | 简历过不了经验筛；面试到了也缺"做过什么"的回答素材。网站给的是面试表达力，不是入场券 |
| B. + 完成全部 portfolio 报告（公开 repo） | 低（5-12%） | 中低（15-30%） | 有可点击链接后简历筛通过率上升；但自建报告的权重远低于第三方背书 |
| C. + 真实 amd-gfx/lore 补丁往来或 Tested-by/Reviewed-by | 中低（10-20%，且主要走"被注意→内推/实习/合同工"路径） | 中（25-45%） | lore 可搜索的名字是这个领域最硬的初级信号；6-10 JD 调研的核心结论即"公开贡献记录被注意"是绕过年限墙的现实路径 |
| D. + merged patch（≥1 个非 trivial）或持续贡献记录 | 中（20-35%，跨周期） | 中高（40-60%） | merged patch 直接回答 JD 的行为要求；数量与领域相关性（display/PM/虚拟化>拼写修复）显著影响上限 |

不确定性来源：招聘周期波动（4/9 JD 一个月内 404）、岗位地域、内推有无、以及"非 trivial 贡献"本身的达成率（lab-8/backport lab 正是为提高这个达成率设计的）。**网站的正确定位：把你从情景 A 运到 C/D 的传送带——传送带本身不是终点。**

---

## 8. Action Plans

**2 周**：完成 P0 三项；用户批准后落 F-1/F-2/F-3 文本修复；开始每天 30 分钟 lore/amd-gfx 跟读（radar 已提供入口），选定 1 个可复现 issue。

**6 周**：P1 全部落地；完成 lab-8 一次真实 issue triage（评论发出）；完成"改一行代码"lab 与 backport lab 各一次并归档 portfolio；第一个真实补丁（文档/注释/简单 fix 级别）经 b4 流程发出。

**12 周**：P2 落地；目标 1 个 merged trivial patch + 1 个实质性 review 往来；portfolio 含 ≥2 篇 RCA 长文 + kunit/IGT 报告；开始按 6-10 JD 清单定向补面试弱项（固件边界、SR-IOV 概念题）；同步投递相邻雇主 junior 岗。

---

## 附录 A：情景修订 — new grad / intern + 内推（2026-07-05 补充）

用户画像更新：应届/junior 通道，目标含 intern 与 entry-level，**已有内推**。这推翻了 §7 的两个最坏假设（简历筛年限墙、无入场券），评估修订如下。

### A.1 为什么内推 + intern 通道改变一切

§7 的低概率主要来自一个瓶颈：AMD Linux 内核正职岗要求 4-8 年，新毕业生简历过不了机筛。但 **intern/new-grad 岗不适用年限墙**，而内推直接解决"简历被看到"——剩下的唯一变量就是面试表现本身。这正是本站能直接作用的环节。

intern/new-grad 面试的真实构成（与正职岗完全不同的权重）：
1. **C/C++ 基础**（指针、内存、位操作、并发直觉）——本站 0.7 模块 19 课就是为这个准备的，debug 练习即面试题型
2. **OS/体系结构基础**（虚拟内存、中断、缓存、锁）——模块 1/1.5/3 覆盖
3. **基础 coding 题**（DS/algo，通常 easy-medium）——**本站完全没有，这是你当前最大的面试风险点**
4. GPU/驱动领域知识——对 intern 是**差异化加分项**而非要求；你在这项上会碾压同池候选人
5. 项目讲述 + 热情证明——见 A.3

### A.2 修订后的概率量级（intern/new-grad + 内推前提）

| 情景 | 拿到面试 | 面试→offer（单次完整流程） | 备注 |
|---|---|---|---|
| 现状直接投 intern | 高（内推基本保证简历被看） | 20-35% | 领域知识强，但 coding 环节裸奔 + 证据薄 |
| + 4-6 周 coding 刷题 + 2 个 portfolio 产物 | 高 | **35-55%** | 补齐短板后，领域深度成为决定性差异化 |
| + 1 个真实 lore 补丁/issue triage 记录 | 高 | **45-65%** | 对 intern 候选人这是罕见信号，面试官会主动追问——把面试变成你的主场 |

new-grad 正职（非 intern）：team-dependent，Markham/上海周期性招 new grad；内推 + 上述证据下，单周期 15-30%。intern→return offer 是概率最高的正职路径（行业惯例 return rate 高于外部招聘一个量级）。**以上仍是量级判断非承诺；单次面试方差极大，按"多轮尝试的期望"理解。**

### A.3 一个被忽视的资产：这个网站本身

对 new-grad 简历而言，本站是一个**双重作品**：(1) 全栈工程项目（React/TS/双语/CI/内容测试体系/自动化 radar——都是可讲的工程决策）；(2) 领域承诺证明（"我为了入行 AMD 驱动，建了一个通过 30 项事实不变量测试、对照官方 ISA 手册逐条核实的学习平台"——这句话在 intern 面试里价值极高）。建议：README 补一段英文项目陈述 + 部署链接放简历；准备 2 分钟讲稿（技术决策：为什么要内容不变量测试、双语架构怎么做的）。

### A.4 修订版行动计划（intern 时间轴优先）

时间敏感提醒：北美 intern 招聘季节性强（秋招为主，夏季岗提前 6-9 个月开放；AMD 部分岗位滚动开放）。**和内推人确认目标组与开放时间是第 0 步**——组别（display/kernel/tools/ROCm）决定面试重点。

- **立即（本周）**：联系内推人确认组别与时间点；简历成稿（网站 + 学习路径写进 projects；用 11.3.2 的 bullet 公式）
- **2 周**：coding 面试恢复训练开始（每天 1-2 题，数组/字符串/链表/哈希为主——驱动岗 intern 很少考 hard DP）；完成 P0-2 portfolio 模板仓库并迁入现有 lab 产物
- **4-6 周**：lab-8 做一次真实 issue triage（GitLab 评论 = 可点击证据）；C/OS 面试题从站内 115 题过滤 easy/medium 做 3 轮模拟；mock interview 至少 2 次（找人或录音自评）
- **投递窗口打开即投**——不要等"准备完美"；intern 面试的领域部分你已经超配，短板只在 coding 手感

### A.5 对网站的增量建议（服务此画像，待批准）

1. Practice 页加"intern track"过滤器（easy/medium + C/OS 基础标签）——数据已有，纯前端 ~50 行
2. 模块 11 加一课"new grad/intern 面试与正职面试的区别"（现有内容全部面向正职叙事）
3. C 基础 debug 练习改造成"白板模式"（隐藏答案计时作答）——对 coding 面试的最低成本迁移

---

## 附录 B：本次访问的一手来源
- rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html（2026-07-05，ROCm 7.2.4 支持矩阵 + TheRock 注记 + 虚拟化/GIM 矩阵）
- rocm.docs.amd.com/en/latest/compatibility/compatibility-matrix.html（2026-07-05）
- docs.kernel.org/gpu/amdgpu/userq.html（2026-07-05，userq 官方文档存在性=已合入证据）
- phoronix.com/news/Linux-6.16-AMDGPU-User-Queues（二手线索，结论回验 kernel docs）
- 历史：references/deep-audit-2026-06-10.md（含 5 份 AMD JD 原文摘录与链接）、content-freshness-*-2026-05-26.md
