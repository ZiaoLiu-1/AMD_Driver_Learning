// ============================================================
// AMD Linux Driver Learning Platform - Module 11 Micro-Lessons
// Module 11: Career & Contribution (社区贡献与职业发展)
// 4 lessons in 2 groups, ~15 min each, total ~60 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module11MicroLessons: MicroLessonModule = {
  moduleId: 'career',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 11.1: 内核补丁实战
    // ════════════════════════════════════════════════════════════
    {
      id: '11-1',
      number: '11.1',
      title: '内核补丁实战',
      titleEn: 'Kernel Patch Workflow in Practice',
      icon: 'Mail',
      description: '掌握从 git format-patch 到 git send-email 的完整内核补丁提交流程，学会写出高质量的 commit message 并专业地回应代码审查。',
      lessons: [
        // ── Lesson 11.1.1 ──────────────────────────────────────
        {
          id: '11-1-1',
          number: '11.1.1',
          title: '内核补丁工作流',
          titleEn: 'Kernel Patch Workflow',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['git', 'format-patch', 'send-email', 'checkpatch', 'amd-gfx'],
          concept: {
            summary: 'Linux 内核的补丁提交不使用 Pull Request——而是通过 git format-patch 生成补丁文件、scripts/checkpatch.pl 检查代码风格、scripts/get_maintainer.pl 找到正确的审查者、然后 git send-email 发送到 amd-gfx 邮件列表。理解并熟练掌握这个工作流是成为内核贡献者的门槛。',
            explanation: [
              'Linux 内核是世界上最大的协作开源项目之一，但它不使用 GitHub/GitLab 的 Pull Request 模式。所有补丁通过电子邮件提交和审查——这是 Linus Torvalds 从 2002 年至今坚持的方式。对于 amdgpu 驱动，补丁发送到 amd-gfx@lists.freedesktop.org 邮件列表，由 AMD 的维护者（Alex Deucher、Harry Wentland 等）审查。',
              'git format-patch 是生成补丁文件的标准命令。它将你的 git commit 转换为标准的邮件格式文件（.patch）。常用方式：git format-patch HEAD~1 生成最近一个提交的补丁，git format-patch -3 生成最近 3 个提交的补丁系列。对于补丁系列，git format-patch 会自动添加编号（[PATCH 1/3]、[PATCH 2/3]、[PATCH 3/3]）并生成一封封面邮件（cover letter）。',
              'scripts/checkpatch.pl 是内核的代码风格检查脚本。在发送补丁之前，必须运行它来检查代码是否符合内核编码规范。运行方式：scripts/checkpatch.pl 0001-your-patch.patch。它会检查：缩进（必须用 Tab，8 字符宽）、行长度（不超过 100 字符）、空格使用（if 后面必须有空格）、commit message 格式（Subject 不超过 75 字符）等。目标是 0 errors, 0 warnings。少量 WARNING 在合理情况下可以接受（如超长的字符串常量），但 ERROR 必须修复。',
              'scripts/get_maintainer.pl 帮你找到应该将补丁发送给谁。运行方式：scripts/get_maintainer.pl 0001-your-patch.patch。它分析补丁修改的文件，从 MAINTAINERS 文件中查找对应的维护者和邮件列表。对于 amdgpu 补丁，通常输出 Alex Deucher（维护者）、amd-gfx@lists.freedesktop.org（邮件列表）等。你需要将他们添加到 git send-email 的 To/Cc 列表中。',
              'git send-email 将补丁文件通过 SMTP 发送到邮件列表。首次使用需要配置 SMTP 服务器：git config --global sendemail.smtpserver smtp.gmail.com 等。发送补丁系列时：git send-email --to amd-gfx@lists.freedesktop.org --cc alex.deucher@amd.com 0001-*.patch。补丁发送后，维护者和社区成员会在邮件列表上回复 Review 意见。如果需要修改，发送 v2 版本：git format-patch --subject-prefix="PATCH v2" HEAD~1。',
              '补丁版本迭代（v2/v3...）是常见的流程。v2 补丁应该在 commit message 末尾（--- 分隔符之后）添加 changelog，说明 v1 到 v2 的变更。封面邮件也应该更新 changelog。保持耐心和专业——大多数补丁需要 2-3 轮迭代才能被接受。',
              'Since 2023, the b4 tool (https://b4.docs.kernel.org/) has become the recommended way to send kernel patches, replacing the manual git send-email workflow. b4 automates: retrieving maintainer lists, formatting cover letters, threading patch series, and tracking versions. Key commands: b4 prep (prepare a patch series from commits), b4 send (send the series to the correct mailing lists), b4 trailers (collect Reviewed-by/Acked-by from replies). Many AMD engineers now use b4 as their daily tool. While git send-email still works and is widely documented, showing familiarity with b4 in an interview signals that your knowledge is current.',
            ],
            keyPoints: [
              'Linux 内核通过邮件列表提交补丁，不使用 Pull Request',
              'git format-patch 生成标准补丁文件（.patch），支持补丁系列编号',
              'scripts/checkpatch.pl 检查代码风格——目标是 0 errors, 0 warnings',
              'scripts/get_maintainer.pl 找到正确的维护者和邮件列表',
              'git send-email 发送到 amd-gfx@lists.freedesktop.org 邮件列表',
              'v2/v3 版本迭代：--subject-prefix="PATCH v2"，附加 changelog',
              'b4 is the modern (2023+) patch sending tool — automates maintainer lookup, threading, and version tracking',
            ],
          },
          diagram: {
            title: '完整的内核补丁提交流程',
            content: `内核补丁提交完整流程

Step 1: 编写代码 & 提交
─────────────────────────
$ vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c
$ make M=drivers/gpu/drm/amd -j$(nproc)     # 编译
$ make W=1 M=drivers/gpu/drm/amd            # 检查额外警告

$ git add -p                                 # 逐块选择要提交的修改
$ git commit -s                              # -s 自动添加 Signed-off-by
  │
  │  Commit message 格式:
  │  ┌─────────────────────────────────────────┐
  │  │ drm/amdgpu: fix VM page table update    │ ← Subject (≤75 字符)
  │  │                                         │
  │  │ The VM page table update was missing     │ ← Body (what & why)
  │  │ a TLB flush after unmapping pages,       │
  │  │ causing stale mappings that lead to      │
  │  │ GPU page faults on RDNA3 hardware.       │
  │  │                                         │
  │  │ Fixes: abc123def ("drm/amdgpu: ...")    │ ← 引用引入 Bug 的提交
  │  │ Signed-off-by: You <you@email.com>      │ ← 法律声明
  │  └─────────────────────────────────────────┘
  ▼
Step 2: 检查
─────────────
$ scripts/checkpatch.pl --strict HEAD~1..HEAD
  total: 0 errors, 0 warnings, 15 lines checked    ← ✓ 通过

$ scripts/get_maintainer.pl --git HEAD~1..HEAD
  Alex Deucher <alexander.deucher@amd.com> (maintainer)
  Christian König <christian.koenig@amd.com> (reviewer)
  amd-gfx@lists.freedesktop.org (list)
  dri-devel@lists.freedesktop.org (list)
  │
  ▼
Step 3: 生成补丁文件
─────────────────────
$ git format-patch HEAD~1
  0001-drm-amdgpu-fix-VM-page-table-update.patch
  │
  ▼
Step 4: 发送
─────────────
$ git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    --cc alexander.deucher@amd.com \\
    --cc christian.koenig@amd.com \\
    0001-drm-amdgpu-fix-VM-page-table-update.patch

  邮件列表: ✉️ 补丁已发送
  │
  ▼
Step 5: 等待 Review & 迭代
──────────────────────────
  Reviewer: "请把 TLB flush 移到 mutex unlock 之前"
  │
  ▼
$ git commit --amend                         # 修改提交
$ git format-patch --subject-prefix="PATCH v2" HEAD~1
$ git send-email ... \\
    --in-reply-to="<original-message-id>"    # 回复原始邮件线程
  ▼
  Reviewer: "Reviewed-by: Christian König <...>"  ← ✓ 审查通过
  Maintainer: 合并到 amd-staging-drm-next         ← ✓ 已合并`,
            caption: '从代码修改到补丁被合并的完整流程。每一步都有对应的命令和工具。大多数补丁需要 2-3 轮 Review 迭代。',
          },
          codeWalk: {
            title: '完整的补丁提交命令演示',
            file: 'terminal',
            language: 'bash',
            code: `#!/bin/bash
# 完整的内核补丁提交工作流演示

# ========================================
# Step 1: 配置 git send-email (只需做一次)
# ========================================
git config --global sendemail.smtpserver smtp.gmail.com
git config --global sendemail.smtpserverport 587
git config --global sendemail.smtpencryption tls
git config --global sendemail.smtpuser your.email@gmail.com
# Gmail 需要使用 App Password (非账户密码)

# ========================================
# Step 2: 修改代码并提交
# ========================================
cd ~/kernel-src

# 创建工作分支
git checkout -b fix/vm-tlb-flush amd-staging-drm-next

# 编辑代码
vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c

# 只编译 amdgpu 模块验证编译通过
make M=drivers/gpu/drm/amd -j$(nproc)

# 提交 (-s 自动添加 Signed-off-by)
git add drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c
git commit -s
# 编辑器中写 commit message:
#   drm/amdgpu: flush TLB after VM page table unmap
#
#   Add missing TLB invalidation after unmapping pages
#   from GPU virtual address space. Without this flush,
#   subsequent GPU accesses may hit stale page table
#   entries, causing VM_FAULT on RDNA3 (gfx1100+).
#
#   Fixes: a1b2c3d4e5f6 ("drm/amdgpu: rework VM unmap")
#   Signed-off-by: Your Name <your.email@gmail.com>

# ========================================
# Step 3: 检查补丁质量
# ========================================
# 代码风格检查
scripts/checkpatch.pl --strict -g HEAD~1..HEAD
# 目标: total: 0 errors, 0 warnings

# 找到维护者
scripts/get_maintainer.pl -g HEAD~1..HEAD
# 输出:
#   Alex Deucher <alexander.deucher@amd.com>
#   Christian König <christian.koenig@amd.com>
#   amd-gfx@lists.freedesktop.org

# ========================================
# Step 4: 生成补丁文件
# ========================================
# 单个补丁
git format-patch HEAD~1
# → 0001-drm-amdgpu-flush-TLB-after-VM-page-table-unmap.patch

# 补丁系列 (多个提交)
git format-patch --cover-letter HEAD~3
# → 0000-cover-letter.patch  (需要编辑)
# → 0001-first-change.patch
# → 0002-second-change.patch
# → 0003-third-change.patch

# ========================================
# Step 5: 发送补丁
# ========================================
git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    --cc alexander.deucher@amd.com \\
    --cc christian.koenig@amd.com \\
    --cc dri-devel@lists.freedesktop.org \\
    0001-drm-amdgpu-flush-TLB-after-VM-page-table-unmap.patch

# ========================================
# Step 6: v2 迭代 (Review 后修改)
# ========================================
# 根据 Review 意见修改代码
vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c
git add -u && git commit --amend
# 在 commit message 的 --- 分隔符后添加 changelog:
#   ---
#   v2: Move TLB flush before mutex_unlock (Christian)

git format-patch --subject-prefix="PATCH v2" HEAD~1
git send-email \\
    --in-reply-to="<message-id-of-v1>" \\
    --to amd-gfx@lists.freedesktop.org \\
    --cc alexander.deucher@amd.com \\
    0001-drm-amdgpu-flush-TLB-after-VM-page-table-unmap.patch`,
            annotations: [
              'git config sendemail.* 只需配置一次，Gmail 需要在安全设置中创建 App Password',
              'git commit -s 自动添加 Signed-off-by 行——这是内核补丁的法律要求（DCO 声明）',
              'scripts/checkpatch.pl --strict 启用更严格的检查，包括某些 WARNING 级别的建议',
              'scripts/get_maintainer.pl -g 从 git 历史（而非补丁文件）中分析维护者',
              '--in-reply-to 将 v2 补丁放入 v1 的邮件线程中，方便 Reviewer 跟踪',
              'v2 changelog 写在 --- 分隔符之后，这样 git am 应用补丁时会自动忽略它',
            ],
            explanation: '这套命令是每个内核贡献者必须掌握的。建议你先在一个小的修改上练习这个流程（如修复一个 typo 或改善一条注释），熟悉每个步骤后再提交实质性的代码修改。amd-gfx 邮件列表对新手友好——你的第一个补丁会得到耐心的 Review。',
          },
          miniLab: {
            title: '完整走一遍补丁提交流程',
            objective: '在你的本地内核仓库中完成一次完整的补丁准备流程（不需要真的发送邮件），熟悉每个命令。',
            steps: [
              '进入内核源码：cd ~/kernel-src && git checkout -b practice/first-patch',
              '做一个小修改——在 drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c 的某个注释中修复一个 typo 或改善措辞',
              '提交：git add -p && git commit -s（写规范的 commit message）',
              '运行 checkpatch：scripts/checkpatch.pl --strict -g HEAD~1..HEAD（确保 0 errors）',
              '运行 get_maintainer：scripts/get_maintainer.pl -g HEAD~1..HEAD（看到维护者列表）',
              '生成补丁文件：git format-patch HEAD~1（查看生成的 .patch 文件内容）',
              '用 git send-email --dry-run 模拟发送（不会真的发邮件）：git send-email --dry-run --to test@example.com 0001-*.patch',
              '清理练习分支：git checkout main && git branch -D practice/first-patch',
            ],
            expectedOutput: `$ scripts/checkpatch.pl --strict -g HEAD~1..HEAD
total: 0 errors, 0 warnings, 5 lines checked
0001-drm-amdgpu-fix-comment-typo.patch has no obvious style problems

$ scripts/get_maintainer.pl -g HEAD~1..HEAD
Alex Deucher <alexander.deucher@amd.com> (maintainer:AMD DISPLAY CORE)
amd-gfx@lists.freedesktop.org (open list:AMD AMDGPU)

$ git format-patch HEAD~1
0001-drm-amdgpu-fix-comment-typo.patch

$ git send-email --dry-run --to test@example.com 0001-*.patch
(dry-run) sendmail ... 0001-drm-amdgpu-fix-comment-typo.patch
OK. Log says:
Dry-OK. Log says: ...`,
            hint: '如果 git send-email 报错 "send-email is not a git command"，安装它：sudo apt install git-email。--dry-run 模式完全安全，不会发送任何邮件。',
          },
          debugExercise: {
            title: '找出补丁提交流程中的问题',
            language: 'bash',
            description: '以下是一个开发者提交补丁的命令序列，但其中有多处问题。找出所有错误。',
            question: '这个补丁提交流程有哪些问题？为什么补丁可能被维护者拒绝？',
            buggyCode: `# 开发者的错误提交流程

# 1. 直接在主分支上修改
git checkout amd-staging-drm-next
vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c

# 2. 提交（没有 -s 标志）
git add .
git commit -m "fixed bug"

# 3. 跳过 checkpatch
# "反正我知道我的代码是对的"

# 4. 生成补丁
git format-patch HEAD~1

# 5. 只发给邮件列表，不 Cc 维护者
git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    0001-fixed-bug.patch

# 6. v2 不回复原始线程
git commit --amend -m "fixed bug v2"
git format-patch HEAD~1
git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    0001-fixed-bug-v2.patch`,
            hint: '检查每一步：分支管理、提交消息格式、代码检查、收件人列表、版本迭代方式。',
            answer: '六个问题：（1）直接在主分支修改——应该创建工作分支（git checkout -b fix/vm-bug），直接在跟踪远程的主分支上提交会搞乱本地分支状态。（2）git add . 添加了所有文件——可能意外包含不相关的修改，应该用 git add -p 逐块选择。git commit -m "fixed bug" 缺少 -s 标志（无 Signed-off-by），且 commit message 不符合规范：缺少 "drm/amdgpu:" 前缀、Subject 太短不够描述性、没有 Body 解释 what 和 why。（3）跳过 checkpatch——维护者会在 Review 中指出代码风格问题并要求重新提交，浪费双方时间。应该始终在发送前运行。（4）git format-patch 本身没问题，但因为 commit message 格式错误，生成的补丁文件名也是无意义的。（5）没有 Cc 维护者——只发到邮件列表，维护者可能不会注意到。必须使用 get_maintainer.pl 找到维护者并 --cc 他们。（6）v2 没有使用 --subject-prefix="PATCH v2"、没有 --in-reply-to 回复原始线程、commit message 仍然不规范、没有添加 v1→v2 的 changelog。正确做法见 Step 6 的示例。',
          },
          interviewQ: {
            question: '描述你向 Linux 内核提交补丁的完整流程。你会如何确保补丁质量？',
            difficulty: 'medium',
            hint: '从代码修改到最终被合并，包括 checkpatch、get_maintainer、format-patch、send-email、Review 迭代。',
            answer: '完整流程：（1）准备工作：基于 amd-staging-drm-next 创建工作分支，确保与上游同步。（2）代码修改：编辑代码，make M=drivers/gpu/drm/amd 编译验证无警告，运行相关的 IGT 测试确认功能正确且无回归。（3）提交：git add -p 逐块审查要提交的修改（避免意外包含无关改动），git commit -s 提交并添加 Signed-off-by。Commit message 使用标准格式：Subject "drm/amdgpu: <concise description>"，Body 解释 what 和 why（不是 how），必要时添加 Fixes: 标签。（4）质量检查：scripts/checkpatch.pl --strict 确保 0 errors 0 warnings；scripts/get_maintainer.pl 找到正确的维护者。（5）发送：git format-patch 生成补丁，git send-email 发送到 amd-gfx 邮件列表，Cc 所有 get_maintainer 列出的人。（6）Review 迭代：认真阅读每条 Review 意见，修改代码后发送 v2（使用 --subject-prefix 和 --in-reply-to），在 changelog 中说明每个版本的变更。（7）等待合并：通常维护者会添加 Reviewed-by/Acked-by 标签后合并到 staging 分支，最终流入 Linus 的主线。质量保证的关键：不跳过 checkpatch，commit message 写清楚 what/why，每次发送前在真实硬件上测试。',
            amdContext: '在 AMD 面试中，如果你能说出"我已经向 amd-gfx 邮件列表提交过补丁"并展示具体的 commit，这比任何面试回答都有说服力。即使是一个小的 typo 修复也展示了你对流程的熟悉。',
          },
        },

        // ── Lesson 11.1.2 ──────────────────────────────────────
        {
          id: '11-1-2',
          number: '11.1.2',
          title: '写好 Commit Message 与回应 Review',
          titleEn: 'Writing Good Commit Messages & Responding to Reviews',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['commit-message', 'code-review', 'Signed-off-by', 'Fixes-tag', 'etiquette'],
          concept: {
            summary: 'Commit message 的质量和对 Review 的专业回应是内核开发者最重要的软技能。好的 commit message 解释 "what & why"（不是 how），遵循 "drm/amdgpu: ..." 的 Subject 格式，并正确使用 Fixes/Signed-off-by/Reviewed-by 标签。回应 Review 时要逐点回复，对有争议的意见提供技术论据。',
            explanation: [
              'Commit message 是你的补丁给世界的第一印象。内核维护者每天阅读数十甚至上百个补丁——一个模糊的 commit message（如 "fix bug"）会被直接忽略或要求重写。好的 commit message 让 Reviewer 在阅读代码之前就理解你在做什么和为什么。5 年后的维护者通过 git blame 看到你的代码时，commit message 是他理解这段代码目的的唯一线索。',
              'Subject 行格式：以子系统前缀开头，如 "drm/amdgpu: fix VM page fault on TLB invalidation"。对于 amdgpu 驱动的不同模块，前缀有细分："drm/amdgpu: "（通用）、"drm/amd/display: "（显示/DC 模块）、"drm/amd/pm: "（电源管理）、"drm/amdkfd: "（KFD/计算）。Subject 不超过 75 字符（git log --oneline 的显示宽度），用小写开头（fix 而非 Fix），不加句号。动词用祈使句（fix、add、remove、refactor 而非 fixed、adds）。',
              'Body 部分解释两件事：What（修改了什么，观察到什么问题）和 Why（为什么需要这个修改，根本原因是什么）。不要解释 How（代码怎么改的——Reviewer 看 diff 就知道）。例外：如果修改涉及不直观的算法或硬件行为，可以简要解释 How。Body 每行不超过 75 字符，段落间用空行分隔。',
              'Fixes: 标签格式：Fixes: <12 位 commit hash> ("原始 commit 的 Subject")。这个标签告诉维护者和自动化工具：你的补丁修复了哪个提交引入的 Bug。它被 stable 内核维护者用来判断是否需要将你的修复 backport 到 stable 分支。生成方法：git log --oneline | grep "引入 bug 的关键词"，找到 commit，然后 git log --format="Fixes: %h (\"%s\")" -1 <commit-hash>。',
              'Signed-off-by 是 Developer Certificate of Origin（DCO）声明——你签名表示这段代码是你写的（或你有权提交它），并同意以 GPL 许可发布。每个贡献者必须添加。Reviewed-by 表示某人审查了代码并认为可以合并。Acked-by 表示某人（通常是子系统维护者）同意这个补丁，但可能没有做详细的代码审查。Tested-by 表示某人在真实硬件上测试了这个补丁。这些标签按时间顺序排列在 commit message 末尾。',
              '回应 Review 的专业态度：逐点回复每条意见（即使是你不同意的）；技术上有争议时提供数据和论据（如性能测试结果、硬件规格说明）；对于你接受的修改意见，在下一版本中实现并在 Reply 中确认；永远保持礼貌——内核社区重视技术讨论的建设性。不要认为 Review 意见是人身攻击，它们是让代码变得更好的过程。',
            ],
            keyPoints: [
              'Subject: "drm/amdgpu: <imperative verb> <concise description>"，≤75 字符',
              'Body: 解释 What & Why（不是 How），每行 ≤75 字符',
              'Fixes: 标签引用引入 Bug 的 commit，帮助 stable backport 决策',
              'Signed-off-by: DCO 声明（必须）；Reviewed-by/Acked-by/Tested-by: Review 标签',
              '回应 Review: 逐点回复，技术争议提供论据，保持建设性态度',
              'v2 changelog 写在 --- 分隔符后，说明每版变更及提出建议的人',
            ],
          },
          diagram: {
            title: 'Commit Message 剖析：好的 vs 差的',
            content: `Commit Message 对比

差的 Commit Message
──────────────────────
fix bug

Signed-off-by: dev@email.com

问题:
├─ Subject 没有子系统前缀
├─ "fix bug" 完全没有描述性
├─ 没有 Body 解释问题和原因
├─ 没有 Fixes: 标签
└─ 5 年后看到这个 commit 不知道它修了什么


好的 Commit Message
──────────────────────
drm/amdgpu: fix page fault on VM unmap due to missing TLB flush
                │                        │
                │                        └─ 简洁描述问题
                └─ 子系统前缀

When unmapping pages from GPU virtual address space, the TLB
(Translation Lookaside Buffer) was not invalidated before
releasing the physical pages. This caused subsequent GPU memory
accesses to hit stale page table entries, triggering:
                                                │
  [drm:amdgpu_vm_bo_update] *ERROR* VM fault    │ ← What: 观察到的现象
  src_id:0 ring:0 vmid:3 addr:0x800100000       │

The root cause is commit a1b2c3d4e5f6 which refactored the     │
unmap path but accidentally removed the amdgpu_vm_flush() call.  │ ← Why: 根因
The fix adds back the TLB invalidation between the PTE clear    │
and the page release, matching the sequence in the map path.    │

Tested on RX 7600 XT (gfx1102) with IGT amd_basic@vm-tests.   ← 测试信息

Fixes: a1b2c3d4e5f6 ("drm/amdgpu: refactor VM unmap path")     ← Fixes 标签
Signed-off-by: Your Name <your@email.com>                        ← DCO 签名
---                                                              ← 分隔符
v2: Move TLB flush before mutex_unlock per Christian's review    ← v2 changelog
v1: https://lore.kernel.org/amd-gfx/original-message-id/        ← v1 链接

Review 标签在合并时由维护者添加:
Reviewed-by: Christian König <christian.koenig@amd.com>
Acked-by: Alex Deucher <alexander.deucher@amd.com>`,
            caption: '好的 commit message 让 Reviewer 在看代码前就理解问题和方案。Fixes 标签帮助 stable backport，changelog 帮助跟踪迭代。',
          },
          codeWalk: {
            title: 'Review 回应的示范对话',
            file: 'amd-gfx mailing list thread',
            language: 'text',
            code: `# 这是一个虚构但典型的 amd-gfx Review 对话

# ═══════════════════════════════════════════════
# v1: 你的原始补丁
# ═══════════════════════════════════════════════
From: You <your@email.com>
Subject: [PATCH] drm/amdgpu: fix use-after-free in VM fault handler

The VM fault handler accesses bo->tbo.resource after the BO
might have been freed by a concurrent eviction. Add a reference
count to prevent the BO from being freed while the fault
handler is using it.

Fixes: abc123 ("drm/amdgpu: add VM fault handler")
Signed-off-by: You <your@email.com>
---
 drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c | 8 +++++---
 1 file changed, 5 insertions(+), 3 deletions(-)

# ═══════════════════════════════════════════════
# Review 1: Christian König (资深 Reviewer)
# ═══════════════════════════════════════════════
From: Christian König <christian.koenig@amd.com>

> +    amdgpu_bo_ref(bo);
> +    /* handle the fault */
> +    amdgpu_vm_handle_fault(adev, bo);
> +    amdgpu_bo_unref(&bo);

The approach is correct, but please use
drm_gem_object_get/put instead of amdgpu_bo_ref/unref
here. We're trying to move away from the amdgpu-specific
reference counting in favor of the DRM core API.

Also, what happens if amdgpu_vm_handle_fault() returns
an error? We should still call unref in that case.

# ═══════════════════════════════════════════════
# 你的回应 (专业、具体、感谢建议)
# ═══════════════════════════════════════════════
From: You <your@email.com>

On Mon, Jan 15, Christian König wrote:
> The approach is correct, but please use
> drm_gem_object_get/put instead of amdgpu_bo_ref/unref

Good point, I'll switch to the DRM core API in v2.

> Also, what happens if amdgpu_vm_handle_fault() returns
> an error? We should still call unref in that case.

You're right, the current code would leak the reference
on error. I'll restructure to use a goto-based cleanup
pattern:

    drm_gem_object_get(&bo->tbo.base);
    ret = amdgpu_vm_handle_fault(adev, bo);
    if (ret)
        goto out_unref;
    /* ... */
out_unref:
    drm_gem_object_put(&bo->tbo.base);

Will send v2 shortly. Thanks for the review!

# ═══════════════════════════════════════════════
# v2: 根据 Review 意见修改
# ═══════════════════════════════════════════════
From: You <your@email.com>
Subject: [PATCH v2] drm/amdgpu: fix use-after-free in VM fault handler

[same body as v1, plus the fix for error path]

Fixes: abc123 ("drm/amdgpu: add VM fault handler")
Signed-off-by: You <your@email.com>
---
v2:
 - Use drm_gem_object_get/put instead of amdgpu_bo_ref/unref
   (Christian)
 - Fix reference leak on error path (Christian)

# ═══════════════════════════════════════════════
# Review 2: 通过!
# ═══════════════════════════════════════════════
From: Christian König <christian.koenig@amd.com>
Reviewed-by: Christian König <christian.koenig@amd.com>`,
            annotations: [
              'v1 的 commit message 清晰解释了问题（use-after-free）、原因（并发 eviction）和方案（引用计数）',
              'Reviewer 指出了两个改进点：使用 DRM 核心 API 和错误路径处理——这是典型的高质量 Review',
              '你的回应逐点回复了每条意见，对 API 建议表示同意，对错误路径提供了具体的修复方案',
              'v2 的 changelog 记录了每个变更及建议者的名字——这是内核社区的礼貌',
              'Reviewed-by 标签由 Reviewer 在回复中给出，不是你自己添加的',
              '整个过程可能跨越 2-3 天——耐心是内核开发者的美德',
            ],
            explanation: '这段对话展示了内核 Review 的理想模式：Reviewer 指出具体的技术问题（不是人身攻击），开发者认真回应并修改（不是辩解或忽略），最终达成技术共识。注意 v2 changelog 中感谢 Reviewer 的方式——在括号中写名字。这种专业的沟通能力和你的技术能力一样重要。',
          },
          miniLab: {
            title: '练习写 Commit Message 和模拟 Review',
            objective: '针对一个假设的 bug 修复，练习写出高质量的 commit message，并练习回应 Review 意见。',
            steps: [
              '场景假设：你修复了 amdgpu_gmc.c 中的一个 bug——VRAM 大小报告比实际少了 256MB，原因是没有包含 firmware 保留区的大小。',
              '写出完整的 commit message（Subject + Body + Fixes + Signed-off-by），保存到 ~/practice_commit_msg.txt',
              '自我 Review：检查 Subject 是否 ≤75 字符、是否以 "drm/amdgpu:" 开头、Body 是否解释了 What 和 Why',
              '模拟 Review 意见："在计算 VRAM 大小时，需要考虑到 SR-IOV 环境下 firmware 保留区大小不同的情况。"',
              '写出你对这条 Review 意见的回复',
              '写出 v2 的 commit message（包括 changelog）',
              '对比你的 commit message 和上面图表中的"好的例子"——差距在哪里？',
            ],
            expectedOutput: `# 参考答案 (你的可能不同，关键是格式和内容质量)

Subject: drm/amdgpu: include fw reserved VRAM in total size report

Body:
The reported VRAM size was 256MB less than the physical
VRAM because amdgpu_gmc_vram_size() did not account for
the firmware reserved region at the top of VRAM.

This caused user-space tools (rocm-smi, radeontop) to
display incorrect VRAM total, confusing users.

Include the fw_vram_usage_size in the total to match the
physical VRAM size visible in the GPU specification.

Fixes: def456 ("drm/amdgpu: reserve VRAM for firmware")
Signed-off-by: Your Name <your@email.com>`,
            hint: '好的 commit message 的特征：一个外部人（不了解你的代码修改）读完 Subject 和 Body 就知道发生了什么、为什么需要修复。',
          },
          debugExercise: {
            title: '修复错误的 Commit Message',
            language: 'text',
            description: '以下 commit message 有多处不符合内核规范的问题。找出所有问题并改正。',
            question: '这个 commit message 有哪些格式和内容问题？重写一个正确版本。',
            buggyCode: `Fix the SDMA bug that was causing issues on the new GPU.

I changed the register offset from 0x1234 to 0x1238 because the
old one was wrong. Also fixed a typo in the comment nearby.

Signed-off-by: developer <dev@company.com>
Fixes: some old commit`,
            hint: '检查 Subject 格式（前缀、大小写、长度）、Body 内容（what vs how）、Fixes 标签格式、以及是否应该将两个不同的修改放在同一个补丁中。',
            answer: '问题清单：（1）Subject 缺少子系统前缀——应该是 "drm/amdgpu: fix SDMA register offset for ..."。（2）Subject 以大写字母开头——应该小写 "fix"。（3）Subject 太笼统——"bug that was causing issues" 没有描述具体问题。（4）Body 解释了 How（"changed the register offset from 0x1234 to 0x1238"）而非 Why——应该解释为什么旧偏移量是错的（如"硬件规格书勘误"或"RDNA3 改变了寄存器布局"）。（5）Fixes 标签格式完全错误——应该是 Fixes: <12位hash> ("原始 Subject")，而不是 "some old commit"。（6）将两个不同的修改（寄存器修复 + typo 修复）放在同一个补丁中——内核规范要求每个补丁只做一件事（One logical change per patch）。应该拆分为两个独立的补丁。正确版本：Subject: drm/amdgpu: fix SDMA doorbell offset on RDNA3。Body: "The SDMA doorbell register offset was incorrect for RDNA3 GPUs (gfx11). The hardware reference manual (v4.2, Table 3.7) specifies offset 0x1238 for SDMA0_DOORBELL, but the driver used 0x1234 which was the GCN5 offset. This caused SDMA ring timeouts on RX 7600 XT." + 独立的 typo 修复补丁。',
          },
          interviewQ: {
            question: '一个内核 commit message 应该包含什么信息？解释 Signed-off-by、Reviewed-by 和 Fixes 标签的含义。',
            difficulty: 'easy',
            hint: '从 Subject 格式、Body 的 What/Why、以及各个标签的法律和技术含义角度回答。',
            answer: 'Commit message 结构：（1）Subject 行：以子系统前缀开头（如 "drm/amdgpu:"），用祈使句简洁描述修改（≤75 字符），小写字母开头，不加句号。（2）空行。（3）Body：详细解释 What（修改了什么、观察到什么问题）和 Why（为什么需要这个修改、根本原因是什么）。不解释 How——diff 已经展示了代码修改。每行 ≤75 字符。（4）标签区域：Fixes: <hash> ("subject") — 引用引入 bug 的原始 commit，被 stable 维护者用来判断是否需要 backport 到 stable 分支。这个标签使用 git log 格式自动生成。Signed-off-by: Name <email> — Developer Certificate of Origin (DCO) 声明。签名者声明代码是自己写的（或有权提交），并同意以内核的开源许可证发布。每个贡献者必须添加。Reviewed-by: Name <email> — 某人审查了代码并认为可以合并。比 Acked-by 更强——意味着 Reviewer 逐行检查了代码。Acked-by: Name <email> — 某人同意这个修改方向，但可能没有做详细代码审查。通常由子系统维护者给出。Tested-by: Name <email> — 某人在真实硬件上测试了补丁，确认它解决了问题且没有引入回归。',
            amdContext: '这个问题在 AMD 面试中属于基础题——如果你连 commit message 格式都不熟悉，面试官会质疑你是否有过内核开发经验。但反过来，如果你能流畅地回答并举出自己提交的补丁作为例子，这会是强有力的加分项。',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 11.2: 职业发展
    // ════════════════════════════════════════════════════════════
    {
      id: '11-2',
      number: '11.2',
      title: '职业发展',
      titleEn: 'Career Development',
      icon: 'Rocket',
      description: '将你在本课程中积累的技能和项目转化为职业优势——构建引人注目的工程师 Portfolio，深入了解 AMD 的团队结构和面试流程。',
      lessons: [
        // ── Lesson 11.2.1 ──────────────────────────────────────
        {
          id: '11-2-1',
          number: '11.2.1',
          title: '构建你的 AMD 工程师 Portfolio',
          titleEn: 'Building Your AMD Engineer Portfolio',
          duration: 15,
          difficulty: 'beginner',
          tags: ['portfolio', 'GitHub', 'blog', 'LinkedIn', 'career'],
          concept: {
            summary: '一个精心构建的 Portfolio 是你技术能力的公开证明——对于 GPU 驱动这个小众领域，一个包含内核补丁、驱动分析文章、IGT 测试用例和本学习平台完成记录的 Portfolio 比任何简历描述都有说服力。本节教你如何构建一个让 AMD 招聘经理印象深刻的 Portfolio。',
            explanation: [
              'GPU 驱动开发是一个高度专业化的领域——全球可能只有几千人在做这个工作。这意味着招聘经理在评估候选人时，非常看重可验证的技术能力。一个公开的 Portfolio 让他们可以直接看到你的代码质量、技术理解深度和学习能力，而不需要依赖面试中的口头描述。',
              'Portfolio 的核心内容应包括：（1）内核补丁记录——链接到你在 amd-gfx 邮件列表上的补丁（即使是 typo 修复也展示了你熟悉补丁流程）。使用 lore.kernel.org 搜索你的邮箱地址找到所有公开的补丁。（2）amdgpu 源码分析——选择驱动的一个子系统（如 VM 管理、GFX ring、电源管理），写一篇深入的分析文章，展示你对代码的理解。（3）IGT 测试用例——你为 amdgpu 编写的测试代码，展示你的测试思维和 C 编程能力。（4）本学习平台的完成记录——所有模块的学习笔记和 lab 完成情况。',
              '技术博客是展示深度理解的最佳方式。推荐的博客平台：GitHub Pages（免费，与你的 GitHub 关联）、个人域名博客（更专业）、或 Medium/知乎（如果你目标是中文受众）。博客文章的结构：问题描述 → 相关背景 → 源码分析（附带代码片段和注释）→ 实验验证 → 总结。一篇高质量的 amdgpu 源码分析文章可能比 10 篇普通技术文章更有价值。',
              'LinkedIn 优化：Headline 直接写目标岗位（如 "GPU Driver Engineer | Linux Kernel | AMD amdgpu"）；Summary 突出你的内核贡献和驱动知识；Experience 中列出你的 open source contributions（即使是在学习阶段）。使用关键词让 AMD 招聘人员能搜索到你：Linux kernel, DRM, amdgpu, GPU driver, Mesa, VRAM management, KMS 等。',
              'GitHub 仓库组织：创建一个专门的 "gpu-driver-portfolio" 仓库，包含 README（概述你的技能和项目）、patches/（你提交的内核补丁副本）、analysis/（源码分析文章）、tests/（你写的 IGT 测试）、notes/（学习笔记）。README 是这个仓库最重要的部分——它是招聘经理的第一印象。',
            ],
            keyPoints: [
              'Portfolio 比简历描述更有说服力——GPU 驱动领域重视可验证的技术能力',
              '核心内容：内核补丁 + amdgpu 源码分析 + IGT 测试 + 学习记录',
              '技术博客：选择 amdgpu 一个子系统深入分析，一篇质量 > 十篇数量',
              'LinkedIn 优化：Headline 包含目标关键词，让 AMD 招聘人员能搜到你',
              'GitHub 仓库结构化组织，README 是第一印象',
              'lore.kernel.org 搜索你的邮箱可找到所有公开的邮件列表贡献',
            ],
          },
          diagram: {
            title: '理想的 GPU 驱动工程师 Portfolio 结构',
            content: `Portfolio 内容架构

GitHub: github.com/yourname
├── gpu-driver-portfolio/           ★ 主 Portfolio 仓库
│   ├── README.md                   ← 概述、技能总结、链接索引
│   ├── patches/                    ← 你的内核补丁副本
│   │   ├── 0001-fix-vm-tlb.patch
│   │   └── 0002-add-igt-test.patch
│   ├── analysis/                   ← 源码深度分析
│   │   ├── amdgpu-vm-subsystem.md  ← "amdgpu VM 子系统源码分析"
│   │   └── gfx-ring-buffer.md     ← "GFX Ring Buffer 工作原理"
│   ├── tests/                      ← 你编写的测试代码
│   │   └── amd_vram_stress.c      ← IGT VRAM 压力测试
│   └── learning-notes/             ← 模块学习笔记
│       ├── module05-amdgpu-init.md
│       └── module07-display.md
│
├── linux/ (fork)                   ← Linux 内核 fork
│   └── (你的补丁分支)               包含你的代码修改
│
└── igt-gpu-tools/ (fork)           ← IGT fork
    └── (你的测试分支)               包含你写的测试

博客 (blog.yourname.com 或 GitHub Pages)
├── "深入 amdgpu VM 子系统：从页表到 TLB"
├── "用 ftrace 追踪一次 GPU Hang 的完整过程"
├── "我的第一个内核补丁：从 typo 到 Reviewed-by"
└── "RDNA3 GFX Ring Buffer 完全指南"

LinkedIn Profile
┌─────────────────────────────────────────────┐
│ Your Name                                    │
│ GPU Driver Engineer | Linux Kernel           │
│ AMD amdgpu | DRM | Mesa                      │
│                                              │
│ Summary:                                     │
│ Linux kernel contributor focused on GPU      │
│ driver development. Submitted patches to     │
│ amd-gfx mailing list. Deep knowledge of     │
│ amdgpu driver internals (VM, GFX, PM).       │
│                                              │
│ Open Source Contributions:                   │
│ • Linux kernel amdgpu driver (patches)       │
│ • IGT GPU test suite (new tests)            │
│ • Technical blog on GPU driver internals    │
└─────────────────────────────────────────────┘

邮件列表记录 (可公开验证)
lore.kernel.org/amd-gfx/?q=your@email.com
├── [PATCH] drm/amdgpu: fix comment typo
├── [PATCH v2] drm/amdgpu: add IGT VRAM stress test
└── (每个补丁都是你能力的公开证明)`,
            caption: 'Portfolio 的每个组件从不同角度展示你的能力：补丁展示流程熟练度，分析展示理解深度，测试展示质量意识，博客展示沟通能力。',
          },
          codeWalk: {
            title: 'Portfolio README 模板',
            file: 'gpu-driver-portfolio/README.md',
            language: 'markdown',
            code: `# GPU Driver Engineering Portfolio

## About Me

I'm a GPU driver engineer focused on the Linux kernel's AMD
amdgpu driver. I have hands-on experience with:

- **Kernel Development**: Submitted patches to amd-gfx mailing
  list for amdgpu driver improvements
- **Driver Internals**: Deep understanding of amdgpu subsystems
  (VM management, GFX command submission, power management)
- **Testing**: Written IGT GPU test cases for VRAM allocation
  and command submission validation
- **Hardware**: Practical experience with RDNA3 (RX 7600 XT /
  Navi33 / gfx1102)

## Kernel Patches

| # | Subject | Status | Link |
|---|---------|--------|------|
| 1 | drm/amdgpu: fix TLB flush on VM unmap | Merged | [lore](https://lore.kernel.org/amd-gfx/) |
| 2 | drm/amdgpu: add missing VRAM size check | Under Review | [lore](https://lore.kernel.org/amd-gfx/) |

## Source Code Analysis

### [amdgpu VM Subsystem Deep Dive](analysis/amdgpu-vm-subsystem.md)
How amdgpu manages GPU virtual address spaces: page tables,
TLB invalidation, VM faults, and the relationship between
amdgpu_vm, amdgpu_bo_va, and the hardware page table walker.

### [GFX Ring Buffer: From PM4 to GPU Execution](analysis/gfx-ring-buffer.md)
The complete path of a GPU command: from Mesa's PM4 packet
construction through amdgpu_cs_ioctl to the hardware Command
Processor reading from the GFX ring buffer.

## IGT Test Contributions

- \`amd_vram_stress.c\` — VRAM allocation stress test with
  positive, negative, and boundary test cases
  ([code](tests/amd_vram_stress.c))

## Technical Blog Posts

- 示例：深入 amdgpu VM 子系统：从页表到 TLB（替换为你的真实博客链接）
- 示例：我的第一个内核补丁之旅（替换为你的真实博客链接）

## Skills & Tools

\`\`\`
Languages:  C (kernel), Python (testing/scripting)
Kernel:     amdgpu, DRM, KMS, TTM, KUnit, kselftest
Userspace:  Mesa (radeonsi/radv), libdrm, IGT GPU Tools
Tools:      git, ftrace, perf, sparse, checkpatch
Hardware:   RDNA3 (Navi33), RDNA2, PCIe, MMIO, VRAM
\`\`\`

## Education & Certifications

- AMD Linux Driver Learning Platform: All 12 modules completed
- [Linux Kernel Development](link) — self-study curriculum
\`\`\``,
            annotations: [
              'README 开头直接说明你是谁、你会什么——招聘经理的时间有限',
              '内核补丁表格带 lore.kernel.org 链接——让任何人都能验证你的贡献',
              '源码分析选择具体的子系统——展示深度理解而非浅尝辄止',
              'IGT 测试展示你的质量意识——不只是写代码，还知道怎么测试',
              'Skills 部分使用关键词——帮助 ATS（Applicant Tracking System）匹配你的简历',
              '博客链接展示你的沟通能力——能把复杂技术解释清楚',
            ],
            explanation: '这个 README 模板是你的 Portfolio 的"首页"。招聘经理通常只花 30 秒浏览一个 GitHub Profile——你的 README 需要在这 30 秒内让他看到：你有内核补丁经验、你理解驱动内部实现、你有测试能力。每个链接都指向可以深入验证的内容。',
          },
          miniLab: {
            title: '开始构建你的 Portfolio',
            objective: '创建 Portfolio 仓库的基础结构，并完成第一个内容——你在本课程学到的知识总结。',
            steps: [
              '在 GitHub 上创建仓库：gpu-driver-portfolio（Public，带 README）',
              '克隆到本地：git clone https://github.com/<yourname>/gpu-driver-portfolio.git',
              '创建目录结构：mkdir -p patches analysis tests learning-notes',
              '编辑 README.md——参考上面的模板，填入你的真实信息（即使补丁列表暂时为空）',
              '写第一篇学习笔记：在 learning-notes/ 下创建一个你最感兴趣的模块的总结',
              '如果你已经写了 IGT 测试（Module 10），将代码复制到 tests/ 目录',
              '提交并推送：git add . && git commit -m "Initial portfolio structure" && git push',
              '在 LinkedIn 的 Featured 部分添加你的 Portfolio 仓库链接',
            ],
            expectedOutput: `$ tree gpu-driver-portfolio/
gpu-driver-portfolio/
├── README.md
├── analysis/
│   └── .gitkeep
├── learning-notes/
│   └── module05-amdgpu-init-notes.md
├── patches/
│   └── .gitkeep
└── tests/
    └── .gitkeep

$ git log --oneline
abc1234 Initial portfolio structure`,
            hint: '不要等到 Portfolio "完美"了才发布——先创建基础结构，然后在学习过程中逐步添加内容。一个有真实学习轨迹的 Portfolio 比一个精心包装但空洞的更有价值。',
          },
          debugExercise: {
            title: '评估一份 GPU 驱动工程师简历',
            language: 'text',
            description: '以下是一份求职 AMD GPU 驱动岗位的简历摘要。找出它的优缺点，并提出改进建议。',
            question: '这份简历有什么好的地方和需要改进的地方？如何让它对 AMD 招聘经理更有吸引力？',
            buggyCode: `Resume Summary:
"Experienced software engineer with 3 years in C/C++
development. Familiar with Linux and open source."

Experience:
- Developed a user-space application using OpenGL
- "Familiar with GPU concepts"
- "Interested in kernel development"

Skills:
C, C++, Python, Java, Linux, Git, Docker, AWS

Education:
BS Computer Science, University of XYZ, 2022

Projects:
- Personal website (React + Node.js)
- Todo app (Flutter)`,
            hint: '从 AMD 招聘经理的角度看——他在找什么？内核经验？驱动知识？可验证的贡献？这份简历能回答这些问题吗？',
            answer: '优点：（1）有 3 年 C/C++ 经验——GPU 驱动的基础语言。（2）有 OpenGL 应用开发经验——说明接触过图形领域。缺点和改进：（1）Summary 太泛——"Familiar with Linux and open source" 对 GPU 驱动岗位没有区分度。改进：明确提到 GPU driver、kernel module、DRM 等关键词。（2）"Familiar with GPU concepts" 太模糊——什么概念？VRAM 管理？命令提交？着色器编译？改进：列出具体的技术知识点。（3）"Interested in kernel development" 是致命缺陷——对于 GPU 驱动岗位，"感兴趣"远远不够。改进：展示行动——阅读过 amdgpu 源码（哪些模块）、提交过补丁（链接）、写过分析文章（链接）。（4）Skills 列表包含不相关的技术（Java、Flutter、Docker、AWS）——稀释了核心竞争力。改进：突出相关技能：C（kernel）、DRM/KMS、amdgpu、IGT、ftrace、libdrm。（5）Projects 与岗位完全不相关——React 网站和 Todo app 不能展示任何驱动开发能力。改进：替换为 GPU 驱动相关项目：amdgpu 源码分析、IGT 测试用例、内核补丁。',
          },
          interviewQ: {
            question: '你做过哪些与 GPU 驱动相关的项目或贡献？请具体描述。',
            difficulty: 'easy',
            hint: '准备 2-3 个具体的例子：一个内核补丁（展示代码能力）、一个源码分析（展示理解深度）、一个测试项目（展示质量意识）。',
            answer: '示范回答（根据本课程的学习内容）：（1）内核补丁贡献：我向 amd-gfx 邮件列表提交了 [具体补丁]，修复了 amdgpu 驱动中 [具体问题]。补丁经过两轮 Review 后被合并到 amd-staging-drm-next。在这个过程中，我学会了内核的补丁提交流程（checkpatch、format-patch、send-email）和专业的 Review 回应方式。（2）amdgpu 源码深入分析：我深入分析了 amdgpu 的 VM 子系统，从 amdgpu_vm_init 到 GPU 页表更新的完整流程。我把分析结果写成了一篇技术博客文章，附带源码引用和执行流程图。这帮助我理解了 GPU 虚拟内存管理与 CPU 的核心区别。（3）IGT 测试编写：我为 amdgpu 编写了一个 VRAM 分配压力测试（amd_vram_stress.c），包含正面测试（各种大小的分配）和负面测试（无效参数处理），以及 1000 次分配/释放的压力测试来检测内存泄漏。这个测试已经提交到 IGT 仓库。每个例子都有公开链接可以验证——这是我 Portfolio 的核心价值。',
            amdContext: '在 AMD 面试中，"具体描述"意味着面试官期望听到具体的代码、具体的文件、具体的问题——而不是泛泛的"我学过驱动"。准备好随时在屏幕上打开你的 GitHub 展示代码。',
          },
        },

        // ── Lesson 11.2.2 ──────────────────────────────────────
        {
          id: '11-2-2',
          number: '11.2.2',
          title: 'AMD 面试准备',
          titleEn: 'AMD Interview Preparation',
          duration: 15,
          difficulty: 'beginner',
          tags: ['AMD', 'interview', 'career', 'STAR', 'salary'],
          concept: {
            summary: 'AMD 的 GPU 驱动工程师面试包含技术深度考察和行为面试两部分。不同团队（Display/3D/Compute/PM/Toolchain）的考察重点不同。本节详细分析 AMD 的团队结构、常见面试题型、STAR 行为面试法和薪资范围，帮助你做出有针对性的准备。',
            explanation: [
              'AMD 的 GPU 驱动开发主要集中在两个地点：加拿大 Markham（多伦多附近，AMD 总部之一）和中国上海（AMD 上海研发中心）。两个办公室都有完整的驱动团队。Markham 团队规模更大，是 amdgpu 驱动的核心开发基地。上海团队近年来快速扩张，特别是在显示（DC）和计算（KFD/ROCm）方向。',
              '团队结构和面试重点：（1）Display Team（显示团队）— 负责 DC（Display Core）模块，处理模式设置（KMS）、HDMI/DP 输出、HDR、FreeSync/VRR。面试重点：DRM KMS API、atomic commit、CRTC/Plane/Connector 概念、色彩管理、VBlank 和 Page Flip。Alex Deucher 和 Harry Wentland 是这个团队的关键人物。（2）3D/Graphics Team（图形团队）— 负责 GFX 引擎相关代码：命令提交（CS）、Ring Buffer 管理、GPU 调度（scheduler）、VM（虚拟内存）管理。面试重点：PM4 命令包、Ring Buffer 工作原理、GPU 调度策略、TLB 管理。Christian König 是这个领域的专家。（3）Compute/KFD Team（计算团队）— 负责 KFD（Kernel Fusion Driver）和 ROCm 支持：HSA（Heterogeneous System Architecture）队列、GPU 计算调度、SVM（Shared Virtual Memory）。面试重点：GPU 计算模型、HSA 架构、GPUVM、进程间 GPU 隔离。（4）Power Management Team（电源管理团队）— 负责 SMU（System Management Unit）驱动、DVFS（动态调频调压）、电源状态管理。面试重点：GPU 电源状态（D0/D3）、频率/电压调节、thermal throttling。（5）Toolchain/Infra Team（工具链/基础设施团队）— 负责 CI 系统、测试框架、构建系统、固件工具。面试重点：CI 架构、IGT 框架、内核构建系统、自动化测试策略。',
              '技术面试通常包含：（1）基础知识——Linux 内核基础（内存管理、进程调度、中断处理、锁机制）、C 语言深度（指针运算、内存对齐、volatile/const 语义、位操作）。（2）GPU 驱动知识——DRM/KMS 框架、amdgpu 驱动架构、IP Block 概念、你在 Portfolio 中展示的项目的深度追问。（3）系统设计/调试——给你一个 GPU hang 的 dmesg 日志让你分析根因、设计一个新的驱动功能、分析一段有 bug 的内核代码。（4）编码——通常不是 LeetCode 算法题，而是内核风格的 C 代码：实现一个链表操作、写一个 ioctl handler、分析一段有竞态条件的代码。',
              '行为面试使用 STAR 方法（Situation-Task-Action-Result）：（1）Situation：描述背景和挑战；（2）Task：你的具体任务；（3）Action：你采取的行动；（4）Result：产生的结果和学到的教训。常见问题：描述一次你调试复杂 bug 的经历、你如何处理技术分歧、你如何学习新技术领域。即使你的例子不是来自 GPU 驱动（而是来自其他开发经历），展示系统化的思维过程比具体领域更重要。',
              '薪资参考（2024-2025 年，仅供参考，实际因级别/经验/地点不同而异）：Markham（加拿大）— Junior/New Grad: CAD 80-100K，Mid-level (3-5 yrs): CAD 110-140K，Senior (5-10 yrs): CAD 140-180K+。上海（中国）— Junior: RMB 25-35W/年（含奖金），Mid-level: RMB 35-55W/年，Senior: RMB 55-80W/年。美国（如果有 Remote 或 US 岗位）— Junior: USD 100-130K，Mid-level: USD 130-170K，Senior: USD 170-220K+。这些数字不包含 RSU（股票奖励）和年终奖金。AMD 的股票激励近年来价值可观。',
            ],
            keyPoints: [
              'AMD 驱动团队：Display / 3D-Graphics / Compute-KFD / Power-Management / Toolchain',
              '主要地点：加拿大 Markham（核心）和中国上海（快速扩张）',
              '技术面试：内核基础 + GPU 驱动知识 + 系统设计/调试 + C 编码',
              '行为面试：STAR 方法（Situation-Task-Action-Result）',
              '编码考察是内核风格 C 代码，不是 LeetCode 算法题',
              '可验证的开源贡献（内核补丁）是最有力的求职证明',
            ],
          },
          diagram: {
            title: 'AMD GPU 驱动团队结构与面试重点矩阵',
            content: `AMD GPU 驱动团队结构

┌─────────────────────────────────────────────────────────────┐
│                    AMD GPU Driver Division                    │
│                                                              │
│  Markham (Canada)                Shanghai (China)            │
│  ─────────────────               ────────────────            │
│  主力开发团队                    快速扩张中                   │
│  Alex Deucher (Lead)             Display & Compute focus     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Teams                              │   │
│  ├──────────┬──────────┬──────────┬─────────┬──────────┤   │
│  │ Display  │ 3D/GFX   │ Compute  │ Power   │ Toolchain│   │
│  │ (DC)     │          │ (KFD)    │ Mgmt    │ (CI)     │   │
│  ├──────────┼──────────┼──────────┼─────────┼──────────┤   │
│  │ KMS      │ CS/Ring  │ HSA      │ SMU     │ IGT      │   │
│  │ Atomic   │ PM4 Cmd  │ SVM      │ DVFS    │ CI Pipes │   │
│  │ HDMI/DP  │ GPU Sched│ ROCm     │ Thermal │ Build    │   │
│  │ HDR/VRR  │ VM/TLB   │ MPI      │ D-states│ Sparse   │   │
│  │ Color    │ Fence    │ IPC      │ Clocks  │ Automate │   │
│  └──────────┴──────────┴──────────┴─────────┴──────────┘   │
└─────────────────────────────────────────────────────────────┘

面试考察重点矩阵
─────────────────

          │ C/Kernel │ DRM/KMS  │ GPU Arch │ Debugging │ Testing
──────────┼──────────┼──────────┼──────────┼───────────┼────────
Display   │  ★★★    │  ★★★★★ │  ★★★    │  ★★★★   │ ★★★
3D/GFX    │  ★★★★  │  ★★★    │  ★★★★★ │  ★★★★★ │ ★★★
Compute   │  ★★★★  │  ★★      │  ★★★★★ │  ★★★★   │ ★★★
Power Mgmt│  ★★★★  │  ★★      │  ★★★★   │  ★★★    │ ★★
Toolchain │  ★★★    │  ★★      │  ★★      │  ★★★    │ ★★★★★

★ = 考察深度 (1-5)

面试流程 (典型)
────────────────
Round 1: Phone Screen (45 min)
  → 基础技术 + 项目经历
  → C 语言 + 内核基础问题

Round 2: Technical Deep Dive (60 min × 2)
  → 两个技术面，分别侧重不同方面
  → GPU 驱动知识 + 系统设计/调试

Round 3: Behavioral (45 min)
  → STAR 方法，团队协作，学习能力

Round 4: Hiring Manager (30 min)
  → 职业目标，团队匹配度`,
            caption: '不同团队的面试重点不同——在准备时，根据你感兴趣的团队有针对性地深入学习。Display 团队重 KMS，3D 团队重 GPU 架构，Compute 团队重 HSA/ROCm。',
          },
          codeWalk: {
            title: '分析一个真实的 AMD 招聘岗位要求',
            file: 'AMD Job Posting Analysis',
            language: 'text',
            code: `# =====================================================
# 真实 AMD 招聘岗位分析 (基于公开信息, 综合多个岗位)
# 岗位: GPU Kernel Driver Engineer
# 地点: Markham, ON, Canada / Shanghai, China
# =====================================================

# --- Job Description (原文摘要) ---
"We are looking for a GPU Kernel Driver Engineer to work
on AMD's open-source Linux GPU driver stack. You will
develop and maintain the amdgpu kernel driver, collaborate
with upstream Linux kernel community, and work closely
with hardware teams to enable new GPU features."

# --- Required Qualifications ---
# 逐条分析你在本课程中学到了什么

1. "BS/MS in Computer Science or Electrical Engineering"
   → 学历要求, 大多数岗位要求本科或硕士

2. "3+ years experience in C programming"
   → 本课程的所有代码练习都使用 C
   → 重点: 指针, 内存管理, 位操作, 内核编码风格
   ✓ Module 0-11 的所有 Code Walk 和 Lab

3. "Experience with Linux kernel development"
   → 本课程核心内容
   ✓ Module 0: 开发环境搭建
   ✓ Module 10: KUnit 和 kselftest
   ✓ Module 11: 补丁提交流程

4. "Knowledge of GPU architecture and graphics pipeline"
   → 本课程覆盖
   ✓ Module 1: GPU 硬件架构 (RDNA3)
   ✓ Module 2: 着色器和图形管线
   ✓ Module 3: 命令处理器和 Ring Buffer

5. "Familiarity with DRM/KMS framework"
   → 本课程覆盖
   ✓ Module 4: DRM 核心框架
   ✓ Module 7: KMS 和显示管理

# --- Preferred Qualifications (加分项) ---

6. "Upstream Linux kernel contributions"
   → 你的补丁记录!
   ✓ Module 11: 补丁工作流, 你在 amd-gfx 的提交

7. "Experience with GPU memory management (TTM, GEM)"
   ✓ Module 5: amdgpu 内存管理
   ✓ Module 6: TTM 和 Buffer Object

8. "Experience with GPU power management"
   ✓ Module 9: 电源管理和 SMU

9. "Familiarity with GPU testing (IGT)"
   ✓ Module 10: IGT 框架和测试编写

10. "Good communication skills for upstream collaboration"
    ✓ Module 11: Review 回应和邮件列表沟通

# --- 你的优势总结 ---
#
# 如果你完成了本课程的所有模块:
# Required: 覆盖 5/5 ✓
# Preferred: 覆盖 5/5 ✓ (假设你也提交了补丁)
#
# 关键差异化因素:
# 1. 可验证的 amd-gfx 补丁贡献
# 2. 公开的 Portfolio (分析文章 + 测试代码)
# 3. 对 amdgpu 驱动架构的深入理解
#
# 这些是大多数候选人不具备的 — 你的竞争优势`,
            annotations: [
              '大多数 AMD 驱动岗位要求 3+ 年 C 经验——但质量比年限更重要',
              '"Linux kernel development" 不要求你是内核维护者——有补丁贡献经验就足够',
              '"GPU architecture" 知识通过本课程可以系统获得',
              'Preferred qualifications 中的每一项都是本课程的一个模块',
              '"Upstream contributions" 是最强的差异化因素——大多数候选人没有',
              '完成本课程并有补丁记录，你已经满足了几乎所有要求',
            ],
            explanation: '这份分析展示了本课程与真实 AMD 岗位要求的精确映射。每个 Required 和 Preferred qualification 都对应课程中的一个或多个模块。关键洞察：大多数候选人有 C 编程经验，但很少有人有真实的内核补丁贡献——这是你最大的差异化机会。',
          },
          miniLab: {
            title: '模拟 AMD 技术面试',
            objective: '用本课程中学到的知识，完成一次模拟的 AMD GPU 驱动工程师技术面试。',
            steps: [
              '计时 45 分钟，独立回答以下 5 个面试题（不看答案）',
              '题 1（基础）：解释 GPU 驱动在 Linux 系统中的作用，amdgpu 驱动的主要子系统有哪些？',
              '题 2（DRM/KMS）：什么是 DRM Atomic Commit？解释 CRTC、Plane 和 Connector 的关系。',
              '题 3（调试）：当你看到 dmesg 中出现 "[drm:amdgpu_job_timedout] *ERROR* ring gfx_0.0.0 timeout"，你会如何调试？列出前 5 步。',
              '题 4（编码）：手写一个简单的 ioctl handler，接收用户空间传入的 buffer 地址和大小，验证参数有效性，并将其映射到 GPU 虚拟地址空间（伪代码即可）。',
              '题 5（行为）：使用 STAR 方法描述一次你解决复杂技术问题的经历。',
              '完成后，回顾你在各题中的表现，标记需要加强的领域',
              '针对薄弱领域，回到对应的课程模块复习',
            ],
            expectedOutput: `模拟面试自评表:

题目                    自评        需要复习的模块
─────────────────────   ─────       ─────────────
1. GPU 驱动角色          ★★★★☆     Module 0, 5
2. DRM Atomic Commit    ★★★☆☆     Module 4, 7
3. GPU Hang 调试        ★★★★☆     Module 5, 10
4. ioctl handler 编码   ★★★☆☆     Module 4, 5
5. STAR 行为面试        ★★★★★     N/A

整体准备度: 75%
重点补强: DRM/KMS 深度 + 编码练习`,
            hint: '面试中最重要的是展示你的思维过程——即使答案不完美，清晰的分析思路也会给面试官留下好印象。不确定的地方说"我不确定，但我会这样思考..."，比沉默或瞎猜好得多。',
          },
          debugExercise: {
            title: '分析面试编码题中的竞态条件',
            language: 'c',
            description: '以下是一个简化的 ioctl handler，处理用户空间请求分配 GPU buffer。面试官让你找出其中的并发安全问题。',
            question: '这个 ioctl handler 有什么并发安全问题？在多线程场景下会发生什么？如何修复？',
            buggyCode: `/* 简化的 GPU buffer 分配 ioctl handler */
static int amdgpu_gem_create_ioctl(struct drm_device *dev,
                                    void *data,
                                    struct drm_file *filp)
{
    struct drm_amdgpu_gem_create *args = data;
    struct amdgpu_device *adev = drm_to_adev(dev);
    struct amdgpu_bo *bo;
    int ret;

    /* 检查是否有足够的 VRAM */
    if (args->in.bo_size > adev->gmc.vram_available) {
        /* BUG: vram_available 在检查和分配之间可能改变 */
        return -ENOMEM;
    }

    /* 分配 buffer */
    ret = amdgpu_bo_create(adev, args->in.bo_size, 0,
                            AMDGPU_GEM_DOMAIN_VRAM,
                            0, NULL, &bo);
    if (ret)
        return ret;

    /* 更新可用 VRAM */
    adev->gmc.vram_available -= args->in.bo_size;
    /* BUG: 非原子操作, 两个线程可能同时读-改-写 */

    /* 创建 GEM handle 返回给用户空间 */
    ret = drm_gem_handle_create(filp, &bo->tbo.base,
                                 &args->out.handle);
    if (ret) {
        adev->gmc.vram_available += args->in.bo_size;
        amdgpu_bo_unref(&bo);
        return ret;
    }

    return 0;
}`,
            hint: '思考两个线程同时调用这个 ioctl 时的时序：TOCTOU（Time of Check to Time of Use）问题和非原子的 read-modify-write。',
            answer: '两个并发安全问题：（1）TOCTOU（Time-of-Check-Time-of-Use）竞态：线程 A 检查 vram_available > bo_size（条件满足），线程 B 在 A 检查之后、分配之前也检查并分配了大量 VRAM，导致 A 实际分配时 VRAM 已不足——但 A 认为检查已通过。这可能导致过度分配 VRAM。修复：将检查和分配放在同一个锁保护区域内，或者不依赖预检查，让 amdgpu_bo_create 内部处理 ENOMEM。（2）非原子 read-modify-write：adev->gmc.vram_available -= args->in.bo_size 不是原子操作。两个线程可能同时读取相同的 vram_available 值，各自减去自己的 bo_size，然后写回——其中一个减法会丢失。例如：available=1000MB，A 分配 200MB，B 分配 300MB，正确结果应该是 500MB，但可能变成 700MB 或 800MB。修复方案：（a）使用 mutex 保护整个检查-分配-更新序列：mutex_lock(&adev->gmc.vram_lock); 检查 → 分配 → 更新; mutex_unlock()。（b）使用 atomic64_t 替代普通变量：atomic64_sub(bo_size, &adev->gmc.vram_available)。（c）实际的 amdgpu 驱动使用 TTM 框架管理 VRAM，TTM 内部已经处理了这些并发问题——不需要手动维护 vram_available 计数器。面试中最佳回答：指出两个问题，给出锁方案，然后提到实际驱动是通过 TTM 解决的。',
          },
          interviewQ: {
            question: '为什么你想加入 AMD 做 GPU 驱动开发？你对 AMD 的哪个团队最感兴趣？',
            difficulty: 'easy',
            hint: '展示你对 AMD 开源策略的理解和你的技术热情。提到具体的团队（如 Display 或 3D/GFX）以及你感兴趣的技术方向。',
            answer: '示范回答：我想加入 AMD 做 GPU 驱动开发基于三个原因：（1）技术挑战——GPU 驱动是我所知的最复杂的系统软件之一，需要同时理解硬件架构、操作系统内核和应用层需求。amdgpu 驱动的 400 万行代码中有太多值得深入的技术问题，从内存管理到电源优化到显示控制。（2）开源文化——AMD 是唯一完全开源 GPU 驱动栈的厂商。这意味着我可以在加入之前就阅读代码、提交补丁、参与社区讨论。我已经通过 amd-gfx 邮件列表提交了 [具体补丁]，体验了这个社区的技术水平和协作氛围。（3）团队偏好——我对 3D/Graphics 团队最感兴趣，特别是 GPU 虚拟内存管理和命令提交子系统。在学习 amdgpu 源码的过程中，我被 VM 子系统的设计所吸引——GPU 页表管理和 TLB 优化涉及的系统级思维是我最享受的技术挑战。我在 Portfolio 中的 VM 子系统分析文章展示了我对这个领域的深入理解。',
            amdContext: '这个问题几乎一定会在 AMD 面试的行为面环节被问到。关键是展示你不只是"找一份工作"——你对 GPU 驱动有真正的热情，而且你已经用行动证明了（补丁、分析、学习记录）。提到具体的团队说明你做了调研，不是海投简历。',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    '掌握完整的内核补丁工作流：format-patch → checkpatch → get_maintainer → send-email',
    '能写出符合内核规范的 commit message（Subject + Body + Fixes + Signed-off-by）',
    '理解 Review 流程，能专业地回应 Review 意见并发送 v2 版本',
    '建立了公开的 GPU 驱动工程师 Portfolio（GitHub + 博客 + LinkedIn）',
    '了解 AMD 的团队结构（Display/3D/Compute/PM/Toolchain）和各团队的技术重点',
    '完成了模拟面试练习，标记了需要加强的领域',
    '向 amd-gfx 邮件列表提交了至少一个补丁（即使是 typo 修复）',
    '准备好了 2-3 个具体的项目/贡献可以在面试中详细描述',
  ],
};
