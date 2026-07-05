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
              'scripts/checkpatch.pl 是内核的代码风格检查脚本。在发送补丁之前，应当运行它来检查常见的格式和风格问题。运行方式：scripts/checkpatch.pl 0001-your-patch.patch。它会检查缩进、空格使用以及常见的补丁格式问题等。官方内核文档仍将 80 列描述为推荐的代码风格上限，而补丁邮件正文一般在约 75 列处换行，Subject 摘要通常控制在 70-75 个字符以内。checkpatch 的输出应被视为一种参考，而非绝对可靠的规则引擎：ERROR 通常需要修复，而部分 WARNING 在合理情况下可以接受。',
              'scripts/get_maintainer.pl 帮你找到应该将补丁发送给谁。运行方式：scripts/get_maintainer.pl 0001-your-patch.patch。它分析补丁修改的文件，从 MAINTAINERS 文件中查找对应的维护者和邮件列表。对于 amdgpu 补丁，通常输出 Alex Deucher（维护者）、amd-gfx@lists.freedesktop.org（邮件列表）等。你需要将他们添加到 git send-email 的 To/Cc 列表中。',
              'git send-email 将补丁文件通过 SMTP 发送到邮件列表。首次使用需要配置 SMTP 服务器：git config --global sendemail.smtpserver smtp.gmail.com 等。发送补丁系列时：git send-email --to amd-gfx@lists.freedesktop.org --cc alex.deucher@amd.com 0001-*.patch。补丁发送后，维护者和社区成员会在邮件列表上回复 Review 意见。如果需要修改，发送 v2 版本：git format-patch --subject-prefix="PATCH v2" HEAD~1。',
              '补丁版本迭代（v2/v3...）是常见的流程。v2 补丁应该在 commit message 末尾（--- 分隔符之后）添加 changelog，说明 v1 到 v2 的变更。封面邮件也应该更新 changelog。保持耐心和专业——大多数补丁需要 2-3 轮迭代才能被接受。',
              'b4 工具（https://b4.docs.kernel.org/）如今已被广泛用作内核补丁工作流的辅助工具。它可以自动完成维护者查找、封面邮件准备、补丁线程处理以及 trailer 收集等工作。关键命令包括 b4 prep、b4 send 和 b4 trailers。不过，应该把它看作一个额外的工作流工具，而不是 git send-email 的通用替代品，因为官方的内核提交指南仍然直接记录了基于邮件的提交方式。',
            ],
            keyPoints: [
              'Linux 内核通过邮件列表提交补丁，不使用 Pull Request',
              'git format-patch 生成标准补丁文件（.patch），支持补丁系列编号',
              'scripts/checkpatch.pl 检查代码风格——目标是 0 errors, 0 warnings',
              'scripts/get_maintainer.pl 找到正确的维护者和邮件列表',
              'git send-email 发送到 amd-gfx@lists.freedesktop.org 邮件列表',
              'v2/v3 版本迭代：--subject-prefix="PATCH v2"，附加 changelog',
              'b4 是一个补丁发送辅助工具——可自动完成维护者查找、线程处理和版本追踪',
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
  │  │                                          │
  │  │ Fixes: abc123def ("drm/amdgpu: ...")    │ ← 引用引入 Bug 的提交
  │  │ Signed-off-by: You <you@email.com>      │ ← 法律声明
  │  └─────────────────────────────────────────┘
  ▼
Step 2: 检查
─────────────
$ scripts/checkpatch.pl --strict HEAD~1..HEAD
  total: 0 errors, 0 warnings, 15 lines checked    ← ✓ 通过

$ scripts/get_maintainer.pl -f drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c
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
  Maintainer: 合并到维护者集成分支（如 amd-staging-drm-next） ← ✓ 已合并`,
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

# 创建工作分支（前置一次性配置：
#   git remote add agd5f https://gitlab.freedesktop.org/agd5f/linux.git
#   git fetch agd5f amd-staging-drm-next）
git checkout -b fix/vm-tlb-flush agd5f/amd-staging-drm-next

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

# 找到维护者（get_maintainer 接受补丁文件，不接受 commit 区间）
git format-patch -1 -o /tmp/p
scripts/get_maintainer.pl /tmp/p/0001-*.patch
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
              'scripts/get_maintainer.pl 接受补丁文件或 -f <文件>（不支持 commit 区间）——先 git format-patch 再对 .patch 运行',
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
              '生成补丁文件：git format-patch HEAD~1（查看生成的 .patch 文件内容）',
              '运行 get_maintainer：scripts/get_maintainer.pl 0001-*.patch（看到维护者列表）',
              '用 git send-email --dry-run 模拟发送（不会真的发邮件）：git send-email --dry-run --to test@example.com 0001-*.patch',
              '清理练习分支：git checkout main && git branch -D practice/first-patch',
            ],
            expectedOutput: `$ scripts/checkpatch.pl --strict -g HEAD~1..HEAD
total: 0 errors, 0 warnings, 5 lines checked
0001-drm-amdgpu-fix-comment-typo.patch has no obvious style problems

$ git format-patch HEAD~1
0001-drm-amdgpu-fix-comment-typo.patch

$ scripts/get_maintainer.pl 0001-drm-amdgpu-fix-comment-typo.patch
Alex Deucher <alexander.deucher@amd.com> (maintainer:AMD DISPLAY CORE)
amd-gfx@lists.freedesktop.org (open list:AMD AMDGPU)

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
git checkout <maintainer-branch>
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

Tested on RX 7600 XT (gfx1102) with the IGT amd_vm suite.    ← 测试信息

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
            answer: '问题清单：（1）Subject 缺少子系统前缀——应该是 "drm/amdgpu: fix SDMA register offset for ..."。（2）Subject 以大写字母开头——应该小写 "fix"。（3）Subject 太笼统——"bug that was causing issues" 没有描述具体问题。（4）Body 解释了 How（"changed the register offset from 0x1234 to 0x1238"）而非 Why——应该解释支持这个修改的证据，例如相关的硬件代际差异、驱动回归，或能够证明旧值是错的代码路径。（5）Fixes 标签格式完全错误——应该是 Fixes: <12位hash> ("原始 Subject")，而不是 "some old commit"。（6）将两个不同的修改（寄存器修复 + typo 修复）放在同一个补丁中——内核规范要求每个补丁只做一件事（One logical change per patch）。应该拆分为两个独立的补丁。正确版本：Subject: drm/amdgpu: fix SDMA doorbell offset on RDNA3。Body: "The SDMA doorbell register offset used by this path is incorrect for the target RDNA3 hardware and can lead to SDMA ring timeouts. Use the RDNA3-specific value and leave the nearby typo cleanup as a separate patch." + 独立的 typo 修复补丁。',
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
┌──────────────────────────────────────────────┐
│ Your Name                                    │
│ GPU Driver Engineer | Linux Kernel           │
│ AMD amdgpu | DRM | Mesa                      │
│                                              │
│ Summary:                                     │
│ Linux kernel contributor focused on GPU      │
│ driver development. Submitted patches to     │
│ amd-gfx mailing list. Deep knowledge of      │
│ amdgpu driver internals (VM, GFX, PM).       │
│                                              │
│ Open Source Contributions:                   │
│ • Linux kernel amdgpu driver (patches)       │
│ • IGT GPU test suite (new tests)             │
│ • Technical blog on GPU driver internals     │
└──────────────────────────────────────────────┘

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
            answer: '示范回答（根据本课程的学习内容）：（1）内核补丁贡献：我向 amd-gfx 邮件列表提交了 [具体补丁]，修复了 amdgpu 驱动中 [具体问题]。补丁经过若干轮 Review 迭代后被维护者合并。在这个过程中，我学会了内核的补丁提交流程（checkpatch、format-patch、send-email）和专业的 Review 回应方式。（2）amdgpu 源码深入分析：我深入分析了 amdgpu 的 VM 子系统，从 amdgpu_vm_init 到 GPU 页表更新的完整流程。我把分析结果写成了一篇技术博客文章，附带源码引用和执行流程图。这帮助我理解了 GPU 虚拟内存管理与 CPU 的核心区别。（3）IGT 测试编写：我为 amdgpu 编写了一个 VRAM 分配压力测试（amd_vram_stress.c），包含正面测试（各种大小的分配）和负面测试（无效参数处理），以及 1000 次分配/释放的压力测试来检测内存泄漏。这个测试已经提交到 IGT 仓库。每个例子都有公开链接可以验证——这是我 Portfolio 的核心价值。',
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
            summary: 'AMD 的 GPU 驱动面试通常将技术深度与行为评估结合在一起。Display、Graphics、Compute、Power Management、Infrastructure 等不同子领域往往各有侧重。本节应被视为方向性的备考指引，而不是关于组织架构或薪酬的官方事实来源。',
            explanation: [
              'AMD 在多个地点都有公开的工程团队，但具体的团队分布、组织架构和职责边界会随时间变化，除非从当前公开的招聘信息或官方组织资料中得到确认，否则不应将其当作固定的事实来呈现。',
              '一种更稳妥的备考思路是按技术领域而非精确的团队架构图来准备：显示方向的岗位侧重 DRM/KMS、atomic modesetting 和显示流水线；图形方向侧重命令提交、调度和内存管理；计算方向侧重 KFD、HSA、GPUVM 和 ROCm 相关概念；电源管理方向侧重 SMU、DVFS 以及热/电源状态；基础设施方向侧重 CI、测试、构建系统和自动化。',
              '技术面试通常包含：（1）基础知识——Linux 内核基础（内存管理、进程调度、中断处理、锁机制）、C 语言深度（指针运算、内存对齐、volatile/const 语义、位操作）。（2）GPU 驱动知识——DRM/KMS 框架、amdgpu 驱动架构、IP Block 概念、你在 Portfolio 中展示的项目的深度追问。（3）系统设计/调试——给你一个 GPU hang 的 dmesg 日志让你分析根因、设计一个新的驱动功能、分析一段有 bug 的内核代码。（4）编码——通常不是 LeetCode 算法题，而是内核风格的 C 代码：实现一个链表操作、写一个 ioctl handler、分析一段有竞态条件的代码。',
              '行为面试使用 STAR 方法（Situation-Task-Action-Result）：（1）Situation：描述背景和挑战；（2）Task：你的具体任务；（3）Action：你采取的行动；（4）Result：产生的结果和学到的教训。常见问题：描述一次你调试复杂 bug 的经历、你如何处理技术分歧、你如何学习新技术领域。即使你的例子不是来自 GPU 驱动（而是来自其他开发经历），展示系统化的思维过程比具体领域更重要。',
              '薪资、办公地点范围和面试流程都高度依赖时间和地点，变化很快。任何关于薪资或团队结构的参考都应当来自当前公开的招聘信息、招聘人员的沟通以及可信的薪酬数据，而不应被当作长期稳定的技术内容来对待。',
            ],
            keyPoints: [
              'AMD 驱动工作通常涵盖显示、图形、计算、电源管理和基础设施/测试等领域',
              '具体地点和汇报结构应以当前公开招聘信息为准核实，不应当作固定事实',
              '技术面试：内核基础 + GPU 驱动知识 + 系统设计/调试 + C 编码',
              '行为面试：STAR 方法（Situation-Task-Action-Result）',
              '编码考察是内核风格 C 代码，不是 LeetCode 算法题',
              '可验证的开源贡献（内核补丁）是最有力的求职证明',
            ],
          },
          diagram: {
            title: 'AMD GPU 驱动团队结构（示意）与面试重点矩阵',
            content: `AMD GPU 驱动团队结构（示意图——非官方组织架构，以当前公开招聘信息为准）

┌─────────────────────────────────────────────────────────────┐
│                    AMD GPU Driver Division                    │
│                                                              │
│  Markham (Canada)                Shanghai (China)            │
│  ─────────────────               ────────────────            │
│  重要开发中心之一                  重要开发中心之一            │
│  上游维护者多在此（如 A. Deucher）  Display & Compute focus    │
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

    // ════════════════════════════════════════════════════════════
    // Group 11.3: 从补丁到 Offer：行动手册
    // ════════════════════════════════════════════════════════════
    {
      id: '11-3',
      number: '11.3',
      title: '从补丁到 Offer：行动手册',
      titleEn: 'From Patches to Offer: The Execution Playbook',
      icon: 'Compass',
      description: '前两组教了"怎么做"，这一组解决"从哪里开始、做完之后呢"——如何在真实代码里系统性地找到第一个补丁机会、补丁合并后会发生什么，以及如何把这一切翻译成招聘经理能在 30 秒内验证的简历语言和申请策略。',
      lessons: [
        // ── Lesson 11.3.1 ──────────────────────────────────────
        {
          id: '11-3-1',
          number: '11.3.1',
          title: '找到第一个补丁机会与合并后的旅程',
          titleEn: 'Finding Your First Patch Opportunity & Life After Merge',
          duration: 20,
          difficulty: 'intermediate',
          tags: ['kernel-doc', 'W=1', 'coccinelle', 'first-patch', 'stable', 'regression'],
          concept: {
            summary: '会走流程（Module 11.1）不等于有补丁可提——新手最大的障碍是"在 400 万行代码里我能修什么？"。本课给出一套可执行的机会雷达：kernel-doc 警告、W=1 编译警告、静态分析发现、bug 跟踪器分流，按合并概率排序；并讲清补丁合并之后的旅程——amd-staging-drm-next → drm-next → mainline → stable 回流，以及你的补丁引发回归时的正确应对。配套实操见实验七。',
            explanation: [
              '机会金字塔：合并概率从高到低依次是——文档/注释修复（kernel-doc、明确的 typo）> 真实编译警告（W=1）> 静态分析发现（coccinelle/smatch/sparse）> 需要硬件复现的 bug 修复 > 新功能（新人几乎不可能）。第一个补丁应该从塔尖开始：目标不是展示聪明，而是用最小的风险走通完整流程、在社区建立你的提交记录。同样重要的是反面清单：纯 checkpatch 风格修复（空格、括号位置、行宽折行）在 drm/amd 通常不受欢迎——大面积"美化"会制造 git blame 噪音，drivers/staging/ 才是风格清理的练习场。',
              'kernel-doc 警告是公认的最佳起点。scripts/kernel-doc -none <file> 零成本扫描；警告的产生原因通常是某次提交修改了函数签名却忘了更新注释——这直接给了你 commit message 的素材（"commit X 修改了参数但注释未同步"，用 git log -S 函数名即可找到）。修复过程还会强迫你学习 kernel-doc 语法：@param: 参数描述、Returns:/Return: 返回值、struct 成员的 @member: 注释。display（DC）子树头文件密集、历史包袱多，是这类警告的高产区。',
              'W=1 与静态分析是第二梯队。make W=1 M=drivers/gpu/drm/amd 打开比默认更严格的警告（未使用变量、缺 static、kernel-doc 等都包含在内）；make coccicheck MODE=report M=drivers/gpu/drm/amd 运行 Coccinelle 语义补丁；make C=1 调用 sparse 做类型/锁注解检查。三条纪律：①其中有误报和维护者明确容忍的类型——动手前先读目标文件的 git log，看最近合并过哪类清理；②静态分析建议的修复必须自己完全理解并验证，盲改会在 Review 中立刻露馅；③一次只修一个问题。',
              '从警告到补丁要过四道闸门：①在 amd-staging-drm-next 的最新提交上复现该警告——基于过时树的修复毫无意义；②在 lore.kernel.org/amd-gfx 用文件名查重——如果已有人发了相同修复，换目标，或在对方补丁上回 Tested-by 也是贡献；③本地验证——kernel-doc -none 零输出（或警告消失）且模块编译通过；④checkpatch.pl --strict 零告警。四道闸门全过，才进入 Module 11.1 的发送流程。实验七把这套流程做成了逐步实操。',
              '合并后的旅程值得讲给面试官听：amdgpu 补丁先被维护者收进 amd-staging-drm-next；随后批量进入 drm-next（DRM 子系统面向下个内核版本的集结分支）；在下一个 merge window 进入 Linus 的主线；如果补丁带 Fixes: 标签且适用于已发布内核，stable 维护者（以及 AUTOSEL 自动选取机制）会把它回流到 stable/LTS 系列——这意味着你的小修复可能出现在几个月后 Ubuntu/Fedora 的内核更新里。追踪自己补丁的位置：git log --author=你 在各分支查询，或在 lore 邮件线程里找维护者的 "Applied, thanks" 回复。',
              '当你的补丁引发问题时，处理方式比补丁本身更能建立（或摧毁）社区信誉。内核的铁律是"不许引入回归"：如果有人报告你的补丁导致问题（Reported-by、bisect 指向你的提交），正确反应是 24-48 小时内回应、协助确认、要么快速提交修复（Fixes: 指向你自己的提交）要么同意 revert——先恢复用户，再慢慢做对。反过来，你也可以通过帮别人测试补丁、复现回归（Tested-by:）来积累公开贡献——在 gitlab.freedesktop.org/drm/amd 的 issue 列表认领你的硬件能复现的 bug 就是入口。',
            ],
            keyPoints: [
              '机会金字塔：kernel-doc/typo > W=1 警告 > 静态分析 > bug 修复 > 新功能——第一个补丁从塔尖开始',
              '纯 checkpatch 风格清理在 drm/amd 不受欢迎——kernel-doc 与真实警告才是安全区',
              '四道闸门：最新分支复现 → lore 查重 → 本地验证（工具零输出 + 编译通过）→ checkpatch --strict',
              '合并路径：amd-staging-drm-next → drm-next → mainline merge window →（带 Fixes:）stable 回流',
              '补丁出回归时：快速回应 + 修复或同意 revert——处理回归的态度决定社区信誉',
              '帮他人测试/复现（Tested-by、bug 分流）同样是可积累的公开贡献',
            ],
          },
          diagram: {
            title: '第一个补丁的机会雷达与生命周期',
            content: `机会金字塔（合并概率 × 所需经验）

           ▲ 难
           │   ┌────────────────┐
           │   │   新功能/重构   │ ← 新人勿入：需要维护者信任
           │   ├────────────────┤
           │   │    bug 修复     │ ← 需要硬件复现 + 根因分析
           │   ├────────────────┤
           │   │  静态分析发现   │ ← coccinelle/smatch；需甄别误报
           │   ├────────────────┤
           │   │  W=1 编译警告   │ ← 真实但要先看维护者口味
           │   ├────────────────┤
        易 │   │  kernel-doc /   │ ← ★ 从这里开始：
           ▼   │  注释·typo 修复 │    小、明确、受欢迎
               └────────────────┘

四道闸门（实验七实操）
──────────────────────
① 最新 amd-staging-drm-next 上复现警告
② lore.kernel.org/amd-gfx 查重（无在途修复）
③ kernel-doc -none 零输出 + 模块编译通过
④ checkpatch.pl --strict 零告警
        │
        ▼ 发送（Module 11.1 流程）

合并后的旅程
────────────
amd-staging-drm-next ──→ drm-next ──→ Linus mainline
   （维护者收下）       （子系统集结）  （merge window）
                                          │
                              带 Fixes: 标签的修复
                                          ▼
                                  stable / LTS 回流
                          （出现在发行版内核更新中）

补丁引发回归时
──────────────
用户报告 / bisect 指向你 → 24-48h 内回应
   ├─ 能快速修复 → 发修复补丁（Fixes: 你自己的提交）
   └─ 不能 → 同意 revert，先恢复用户，事后再做对`,
            caption: '完整的决策图：从塔尖（kernel-doc）入手，过四道闸门再发送；理解合并后的旅程，你才能向面试官讲清楚"我的代码现在在哪里、怎么到那里的"。',
          },
          codeWalk: {
            title: '一次完整的机会扫描会话',
            file: 'terminal',
            language: 'bash',
            code: `# ============================================
# 机会雷达：从扫描到锁定目标（真实会话示例）
# ============================================

# --- 雷达 1: kernel-doc 扫描 ---
$ find drivers/gpu/drm/amd/display -name "*.h" | \\
    xargs -r scripts/kernel-doc -none 2>&1 | head -8
dc_stream.h:142: warning: Function parameter or struct member
  'adjust' not described in 'dc_stream_adjust_vmin_vmax'
dc_link.h:88: warning: Excess function parameter 'link'
  description in 'dc_link_detect'
...

# --- 雷达 2: W=1 警告统计 ---
$ make W=1 M=drivers/gpu/drm/amd -j$(nproc) 2>&1 | \\
    grep -c "warning:"
37

# --- 闸门 ①: 警告在最新分支上仍存在 ---
$ git fetch agd5f amd-staging-drm-next --depth=50
$ git checkout -b kdoc-fix agd5f/amd-staging-drm-next
$ scripts/kernel-doc -none \\
    drivers/gpu/drm/amd/display/dc/dc_stream.h 2>&1 | grep adjust
dc_stream.h:142: warning: ... 'adjust' not described ...   # 仍在 ✓

# --- 闸门 ②: lore 查重 ---
# 浏览器: https://lore.kernel.org/amd-gfx/?q=dc_stream_adjust_vmin_vmax
# → 近期无人发过相同修复 ✓

# --- 谁改了签名却没改注释？（commit message 素材）---
$ git log --oneline -3 -- drivers/gpu/drm/amd/display/dc/dc_stream.h
$ git log -S "dc_stream_adjust_vmin_vmax" --oneline | tail -3

# --- 修复 + 闸门 ③/④ ---
$ vim drivers/gpu/drm/amd/display/dc/dc_stream.h  # 补上 @adjust: 描述
$ scripts/kernel-doc -none \\
    drivers/gpu/drm/amd/display/dc/dc_stream.h
（零输出 ✓）
$ make M=drivers/gpu/drm/amd -j$(nproc)           # 编译通过 ✓
$ git add -p && git commit -s
$ scripts/checkpatch.pl --strict -g HEAD~1..HEAD
total: 0 errors, 0 warnings ✓
# → 进入 Module 11.1 / 实验七的发送流程`,
            annotations: [
              '两个雷达产出候选清单；四道闸门按顺序执行，任何一道不过就换下一个目标',
              'git log -S "函数名" 找到改动该函数的提交——commit message 里就能写明"注释自 commit X 起未同步"',
              'dc_stream.h 与 dc_stream_adjust_vmin_vmax 是真实存在的文件和函数；警告行号与内容为教学示例，以你的实际扫描结果为准',
              '修复 kernel-doc 时顺便通读该函数的实现——这是"带着任务读代码"的最好机会',
              '全部闸门通过后，接实验七第 7 步的 b4 演练与发送',
            ],
            explanation: '这个会话展示了从扫描到"随时可发"的完整决策过程，全程通常不超过一小时。注意每一步都有明确的通过/失败判据——这种工程化方法让你不依赖灵感，而是拥有一条可重复的贡献流水线。第一个补丁合并后，同样的雷达会继续产出第二个、第三个。',
          },
          miniLab: {
            title: '运行你自己的机会扫描',
            objective: '在 amd-staging-drm-next 上完成一次完整扫描，产出一份排好序的候选清单（本课不要求发送）。',
            steps: [
              '同步分支：git fetch agd5f amd-staging-drm-next --depth=200 && git checkout -b scan agd5f/amd-staging-drm-next',
              '雷达 1：对 drivers/gpu/drm/amd/display 的全部 .h 运行 scripts/kernel-doc -none，结果存入 /tmp/kdoc.log',
              '雷达 2：make W=1 M=drivers/gpu/drm/amd 2>&1 | grep "warning:" | sort | uniq -c | sort -rn，看警告类型分布',
              '挑出 3 个候选，对每个执行：git log --oneline -5 -- <file>（看维护者最近收过什么样的清理）+ lore 查重',
              '把 3 个候选按"理解难度 × 合并概率"排序，写成 candidates.md：警告原文、文件与函数、引入背景（git log 证据）、查重结论、修复思路',
              '（可选）对排名第一的候选执行修复并走完闸门 ③/④——这就是实验七的入口',
            ],
            expectedOutput: `candidates.md 示例结构：

## 候选 1（首选）
- 警告: dc_stream.h:142 'adjust' not described
- 函数: dc_stream_adjust_vmin_vmax（display/DC）
- 背景: git log -S 显示 commit abc1234 增加了参数
- 查重: lore 无在途修复（2026-06 检索）
- 思路: 补 @adjust: 描述，引用 abc1234

## 候选 2 / 候选 3 ...（同结构）`,
            hint: '如果 display 子树的警告多到无从下手，按文件统计数量，挑警告最少的文件——一个文件只有 1-2 条警告，通常意味着一次提交就能修干净，是理想的第一补丁尺寸。',
          },
          debugExercise: {
            title: '这个"第一补丁"计划为什么会被拒？',
            language: 'text',
            description: '以下是一位新手准备发往 amd-gfx 的补丁计划。找出所有会导致被拒绝或被忽略的问题。',
            question: '逐条列出这个计划中的问题，并给出修正后的版本。',
            buggyCode: `计划：
1. 基础：Ubuntu 24.04 自带的 6.8 内核源码包
2. 改动内容（放进同一个补丁）：
   a. 用 checkpatch 扫出 drivers/gpu/drm/amd/amdgpu/ 下
      所有 "line over 100 characters" 并全部折行
   b. 顺手修掉 3 个注释 typo
   c. 把一处 if (ret != 0) 改成 if (ret) ——"更地道"
3. 不需要编译——"只是格式和注释，不可能编译失败"
4. git commit -m "cleanup amdgpu code style"
5. 直接发给维护者私人邮箱，避免在邮件列表上丢人
6. 三天没回复就把补丁原样再发一遍`,
            hint: '从基础分支、补丁拆分、改动类型的受欢迎程度、验证、commit message、收件人、跟进礼仪七个维度逐条检查。',
            answer: '问题清单：（1）基础分支错误——发行版 6.8 源码包远落后于 amd-staging-drm-next：目标行可能早已变化，diff 无法干净应用。必须基于维护者的开发分支。（2）一个补丁混入三类改动——违反 one logical change per patch，必须拆分。（3）改动类型选错：a 的大面积行宽折行是纯风格清理，drm/amd 维护者通常不收（制造 git blame 噪音）；c 的 if (ret) 改写没有功能意义，同样会被拒。只有 b 的 typo 修复可发——且应单独成补丁，或干脆改做 kernel-doc 修复。（4）"不需要编译"是错的——折行可能切断字符串或宏定义，注释改动可能破坏 kernel-doc 格式；任何补丁都必须编译验证。（5）commit message 不合规：缺子系统前缀（应为 drm/amdgpu:）、缺 -s（无 Signed-off-by）、"cleanup code style" 没有说明 what/why。（6）私发维护者跳过邮件列表是反模式——补丁必须公开可审：To: amd-gfx 列表，Cc: get_maintainer 输出的维护者。在列表上"丢人"恰恰是建立公开记录的方式。（7）三天原样重发太急——正确做法是约一周后在原线程内礼貌 ping 一次。修正版计划：基于 amd-staging-drm-next；只保留 typo 修复并拆成最小补丁（或改做 kernel-doc 修复）；编译 + kernel-doc -none + checkpatch --strict 全部通过；规范 commit message + Signed-off-by；git send-email --to amd-gfx --cc 维护者；一周无回应再在原线程 ping。',
          },
          interviewQ: {
            question: '给你一个 400 万行、你从未接触过的驱动代码库，要求你在一个月内做出第一个有意义的上游贡献。说说你的方法。',
            difficulty: 'medium',
            hint: '考察的是方法论：如何系统性地找到入口、如何验证、如何与社区互动——而不是技术天赋。',
            answer: '我的四周计划：第 1 周——环境与地图：搭好可增量编译目标模块的开发环境；读 MAINTAINERS 与最近 200 条 git log，了解活跃区域、活跃维护者和他们最近接受的改动类型；订阅邮件列表观察 Review 风格。第 2 周——机会扫描：用零成本工具批量产出候选——scripts/kernel-doc -none、make W=1、make coccicheck，加上 bug 跟踪器里我的硬件能复现的入门级问题；对候选做三道筛选：最新开发分支上仍存在、邮件列表查重无在途修复、我能读懂周边代码。第 3 周——执行：挑最小最明确的一个（典型是 kernel-doc 或真实编译警告修复），修复并通过全部本地验证（工具零输出、编译通过、checkpatch --strict 干净）；commit message 用 git log -S 找到问题引入的提交并写明来龙去脉；get_maintainer 确定收件人后发送。第 4 周——迭代与扩展：逐点回应 Review、快速发 v2；同时启动第二个稍大的目标，并通过帮他人测试补丁（Tested-by:）增加社区存在感。关键原则：第一个贡献的目的是建立可信的提交记录和流程熟练度——小而完美胜过大而有险。',
            amdContext: '面试官问这类问题时，想听到可复制的工程方法而非运气。如果你能当场打开 lore.kernel.org 展示自己正是这样拿到第一个补丁的，这道题就从假设题变成了你的主场。',
          },
        },

        // ── Lesson 11.3.2 ──────────────────────────────────────
        {
          id: '11-3-2',
          number: '11.3.2',
          title: '简历落地手册：让 AMD 看见你的证据',
          titleEn: 'The Resume Playbook: Making AMD See Your Evidence',
          duration: 20,
          difficulty: 'beginner',
          tags: ['resume', 'bullet', 'careers', 'application', '12-week-plan'],
          concept: {
            summary: '简历不是经历的清单，而是证据的索引。本课提供一个可直接套用的翻译层：把本课程的每个实验产出翻译成"动词 + 具体系统 + 方法 + 可验证链接"格式的简历条目；按目标方向（显示/图形与内存/计算/编译器/测试）调整关键词；并给出 12 周证据积累计划和申请渠道分层。核心原则：每一条 bullet 都能被招聘经理在 30 秒内点开验证。',
            explanation: [
              '证据优先原则。GPU 驱动是一个很小的圈子，简历上的每个硬性声明都可能被面试官当场验证：写 "submitted patches" 会被要求给 lore 链接，写"分析过 VM 子系统"会被追问 amdgpu_vm.c 的细节。这对认真做事的人反而是优势——大多数候选人只有课程证书和 "familiar with"，而你有可点击的链接。三条规则：①每条 bullet 至少附一个可验证产物（lore 链接 / GitHub / 博客）；②动词与事实严格对应——submitted（已发出）≠ merged（已合并），"contributed to" 因含糊而禁用；③数字只写真实可数的（N 个补丁、M 个实验报告），宁小勿虚。',
              'Bullet 翻译公式：动词 + 具体对象（子系统/工具名）+ 方法 + 产物与链接。课程产出的标准映射：实验一 → "Built and booted custom Linux kernels (v6.12 LTS) with amdgpu as a loadable module; iterated driver changes in virtme-ng VMs"；实验二 → "Triggered controlled GPU hangs with IGT amd_deadlock, captured devcoredumps, root-caused the hung ring and reset path via umr + dmesg"；实验三 → "Traced the dma_fence lifecycle through amdgpu command submission with ftrace"；实验六 → "Ran and extended the DRM core KUnit suites (drm_buddy — the allocator behind the amdgpu VRAM manager)"；实验七 → "Submitted <N> patches to the amd-gfx mailing list (kernel-doc/W=1 fixes in drivers/gpu/drm/amd); <M> merged into amd-staging-drm-next"；平台本身 → "Designed and shipped a bilingual (EN/ZH) AMDGPU-internals learning platform (React/TypeScript, 14 modules, 75+ micro-lessons, 7 guided labs)"。占位符必须替换成真实数字。',
              '按方向调整关键词。Linux GPU 驱动相关岗位通常落在几个技术方向上，投递时按 JD 调整 bullet 顺序与关键词：显示方向——DRM/KMS、atomic commit、DC、DP/HDMI；图形与内存——TTM、GPUVM、drm_buddy、命令提交、dma_fence、drm_gpu_scheduler；计算——KFD、ROCm、HSA queues、SVM；编译器——LLVM AMDGPU backend、ISA、寄存器分配；测试与工具——IGT、KUnit、bisect、CI。岗位名称与地点随时间变化，一律以 careers.amd.com 的实时搜索（关键词 "Linux"、"GPU driver"、"kernel"）为准；历史上 Markham（多伦多地区）与上海长期出现 Linux GPU 驱动方向的公开招聘，但必须以当前职位列表为准。',
              '申请渠道分层。①直接申请：careers.amd.com（学生与新毕业生关注 University/Early Career 类目）+ LinkedIn 上的 AMD 招聘者（用 11.2.1 的关键词优化让他们能搜到你）。②社区能见度：你在 amd-gfx 的补丁、Review 互动和 issue 分流本身就是给未来同事看的工作样品——许多驱动团队成员就活跃在列表上；保持 lore 记录与 freedesktop GitLab 活动的专业度。③毗邻雇主跳板：Igalia、Collabora、Red Hat、Canonical 以及 Valve 合作生态等长期从事 Linux 图形栈开源开发的公司，需要同样的技能、对新人也常更友好——先在毗邻雇主积累全职上游经验再进 GPU 厂商是社区里的常见路径。④学生通道：实习/co-op 项目对内核新人的门槛通常更友好（以当年实际开放为准）。',
              '12 周证据积累计划（详见图表）。核心纪律只有一条：每周必须有一个可链接的产出。前 4 周打底（实验一至三 + 学习笔记上线）；中 4 周上游化（实验六的 KUnit 报告、实验七的扫描与第一个补丁发送、Review 迭代或第二个补丁）；后 4 周成型（深入一个子系统写长文分析、简历与 LinkedIn 全面链接化、开始投递并用 11.2.2 做模拟面试）。计划可以按个人节奏拉长——但"每周一个可链接产出"的节奏不能断：lore 和 GitHub 上的时间线本身就是简历里最有说服力的隐性信息，它证明的是持续交付能力。',
              '诚实红线。不要把"发送过补丁"写成"合并"；不要把学习平台写成"生产级产品"或编造用户规模；不要暗示与 AMD 工程师存在私下关系。这个社区足够小，夸大被识破的代价远高于诚实小成果的"损失"。反过来说：诚实的小成果 + 公开可查的成长轨迹（lore 时间线、GitHub 提交史），恰恰构成招聘经理眼中"低风险、高潜力"的候选人画像——这是新人能打出的最强牌。',
            ],
            keyPoints: [
              'Bullet 公式：动词 + 具体子系统 + 方法/工具 + 可验证产物链接',
              'submitted ≠ merged——动词必须与事实严格对应，社区记录公开可查',
              '按方向调整关键词：显示(KMS/DC)、图形与内存(TTM/GPUVM)、计算(KFD/ROCm)、编译器(LLVM)、测试(IGT/KUnit)',
              '渠道分层：careers.amd.com + 社区能见度 + 毗邻雇主（Igalia/Collabora/Red Hat 等）+ 学生通道',
              '12 周计划的唯一纪律：每周一个可链接的产出',
              '诚实红线：小而真实 + 公开轨迹 = "低风险高潜力"画像',
            ],
          },
          diagram: {
            title: '12 周证据积累计划与 Bullet 翻译公式',
            content: `12 周证据积累计划（每周一个可链接产出）

周   行动                          产出（全部可链接）
──   ────                          ──────────────────
 1   环境搭建 + 实验一              Portfolio 仓库 + notes/lab1-kernel-build.md
 2   实验三 ftrace 追踪             analysis/fence-trace.md
 3   实验二 GPU Hang 调试           analysis/gpu-hang-report.md
 4   Module 5 源码精读              VM 或 Ring 子系统笔记
 ────────────────────────────────────────────────────
 5   实验六 KUnit                   drm_buddy 测试报告 + 自写用例
 6   实验七 机会扫描                candidates.md
 7   实验七 第一个补丁发送 ★        lore 链接 #1
 8   Review 迭代 / 第二个目标       v2 线程 或 lore 链接 #2
 ────────────────────────────────────────────────────
 9   深入一个子系统                 长文分析（博客）
10   （可选）KUnit/IGT 测试贡献     测试补丁 lore 链接
11   简历 + LinkedIn 链接化         一页简历，每条 bullet 带链接
12   投递 + 模拟面试（11.2.2）      申请记录表

 节奏可以放慢，但"每周一个可链接产出"不能断。

Bullet 翻译公式
────────────────
 [动词]       [具体对象]            [方法/工具]       [产物]
 Submitted   N patches → amd-gfx   kernel-doc/W=1    lore 链接
 Built       custom kernel v6.12   virtme-ng         构建笔记
 Root-caused controlled GPU hangs  IGT + devcoredump 分析报告
 Extended    DRM KUnit (drm_buddy) 新增边界用例       测试报告
 Shipped     bilingual platform    React/TS          网站 + 仓库

 ✗ "Familiar with GPU drivers"     ← 不可验证，删
 ✗ "Contributed to Linux kernel"   ← 含糊，换 submitted/merged + 数字
 ✓ "2 patches merged in drm/amd/display (kernel-doc fixes),
    lore.kernel.org/amd-gfx/?q=f:you@mail.com"`,
            caption: '上表是节奏，下表是翻译。简历审阅平均只有 30 秒——每条 bullet 必须独立可信、可点击验证。',
          },
          codeWalk: {
            title: '弱简历条目 → 强简历条目（diff 视角）',
            file: 'resume_bullets.diff',
            language: 'diff',
            code: `--- resume_weak.md
+++ resume_strong.md
@@ 技能与项目 @@
-- Familiar with Linux kernel and GPU drivers
+- Submitted 3 patches to the Linux kernel amd-gfx list
+  (kernel-doc & W=1 fixes in drivers/gpu/drm/amd);
+  2 merged into amd-staging-drm-next
+  [lore.kernel.org/amd-gfx/?q=f:you@mail.com]

-- Studied GPU architecture and driver concepts
+- Root-caused controlled GPU hangs on RX 7600 XT (RDNA3):
+  triggered via IGT amd_deadlock, captured devcoredump,
+  identified hung ring & reset path from umr + dmesg
+  [github.com/you/portfolio/analysis/gpu-hang-report.md]

-- Worked with kernel testing tools
+- Extended the DRM core KUnit suite (drm_buddy — the
+  allocator behind the amdgpu VRAM manager) with a
+  boundary-condition test; all suites pass under UML
+  [github.com/you/portfolio/tests/kunit-drm-buddy-report.md]

-- Built a website about GPU drivers
+- Designed & shipped a bilingual (EN/ZH) AMDGPU-internals
+  learning platform: 14 modules, 75+ micro-lessons,
+  7 hands-on labs (React/TypeScript)
+  [your-site.example] [github.com/you/repo]`,
            annotations: [
              '每个 "-" 行的共同病：不可验证、没有具体对象、没有产物',
              '每个 "+" 行的结构：动词 + 具体系统 + 方法 + 方括号里的可点击证据',
              '数字必须真实：3 个补丁就写 3，不写 "multiple"；没合并就只写 submitted',
              'lore 的 f:（from）查询用一条 URL 列出你的全部公开贡献——放在简历最显眼处',
              '最后一条把"做了个网站"升级为带规模指标的工程交付',
            ],
            explanation: 'diff 直观展示了翻译前后的差距：强版本没有一个形容词（passionate/expert/familiar），全部是动词、名词和链接——这就是工程师简历的语法，让证据自己说话。中文简历同理：把"熟悉 GPU 驱动"替换为"向 amd-gfx 提交 3 个补丁（2 个已合并，lore 链接）"。',
          },
          miniLab: {
            title: '把你的进度翻译成五条 bullet',
            objective: '用公式把你目前已完成的实验与产出写成 5 条可放进简历的 bullet（中英各一版），并验证每条都可点击。',
            steps: [
              '诚实盘点：列出你已完成的实验和已存在的产出（哪些做完了？哪些有可链接的产物？）',
              '对每项套用公式：动词 + 具体对象 + 方法/工具 + 产物链接',
              '检查动词与事实的对应：submitted / merged / built / analyzed / extended——删掉所有 familiar / passionate / expert',
              '把 5 条里的每个链接真实点开一遍：404、私有仓库、空文档都算失败',
              '请一个不懂内核的朋友读英文版——他应该能复述出"这个人做过什么"（具体性测试）',
              '把 5 条加进 Portfolio README 顶部的 Highlights 区，中英简历各放一版',
            ],
            expectedOutput: `5 条 bullet（示例，替换为你的真实内容与链接）：

• Submitted 2 kernel-doc fix patches to amd-gfx
  (drivers/gpu/drm/amd/display); 1 merged —
  lore.kernel.org/amd-gfx/?q=f:you@mail.com
• Built & booted custom v6.12 kernels with amdgpu
  as a module; documented the Ubuntu cert pitfall —
  github.com/you/portfolio/notes/lab1-kernel-build.md
• Root-caused a controlled GPU hang (IGT amd_deadlock
  → devcoredump → umr) on RDNA3 —
  github.com/you/portfolio/analysis/gpu-hang-report.md
• Extended DRM KUnit drm_buddy suite with a
  boundary test; suites pass under UML —
  github.com/you/portfolio/tests/kunit-drm-buddy-report.md
• Shipped a bilingual AMDGPU learning platform
  (14 modules, 7 labs, React/TS) — your-site.example

检查：每条 ≤3 行、至少一个链接、零形容词。`,
            hint: '写不出 5 条？那是行动信号而不是写作问题——回到 12 周计划表，看本周该补哪个产出。简历是结果，节奏才是原因。',
          },
          debugExercise: {
            title: '审查一份"注水"的简历段落',
            language: 'text',
            description: '以下简历段落每一条都有问题——有的不可验证，有的夸大，有的会在面试中被当场戳穿。',
            question: '逐条指出问题，并判断哪些该"删除"、哪些该"改写"、哪些该"诚实化降级"。',
            buggyCode: `OPEN SOURCE & PROJECTS

• Contributed extensively to the Linux kernel GPU subsystem
• Expert in AMDGPU driver internals (VM, scheduler, display)
• My patches are used by millions of Ubuntu users worldwide
• Worked closely with AMD maintainers on driver improvements
• Built a production-grade GPU driver education SaaS platform
  serving the developer community
• Deep experience with ROCm/HIP performance optimization
  on data-center GPUs`,
            hint: '对每条问两个问题：①面试官能在 30 秒内验证吗？②如果被追问三层细节会发生什么？',
            answer: '逐条审查：（1）"Contributed extensively"——动词含糊 + extensively 无法量化。改写为精确事实："Submitted N patches (M merged) to amd-gfx — <lore 链接>"。（2）"Expert in ... internals"——expert 是面试官的结论，不是自封的头衔；被追问三层（GPUVM 页表层级、eviction 触发条件、scheduler 的 entity/rq 关系）任何一层卡住都会反噬。改写为证据："Wrote a 5k-word analysis of the amdgpu VM subsystem — <链接>"。（3）"used by millions"——即使补丁确实经 stable 进入了 Ubuntu 内核，这种归因也属危险夸大（合并 ≠ 你服务了百万用户）。诚实化降级："1 fix backported to stable 6.12.x via Fixes: tag"（如属实），否则删除。（4）"Worked closely with AMD maintainers"——一两轮邮件 Review 不是 working closely，追问细节时会非常尴尬。改写："Iterated patches through review with amdgpu maintainers (v2 accepted) — <线程链接>"。（5）"production-grade SaaS serving the community"——没有付费用户与 SLA 的学习平台不是 production SaaS，编造规模是诚信红线。改写为真实交付："Designed & shipped a bilingual AMDGPU learning platform (14 modules, 7 labs) — <链接>"。（6）"data-center GPUs"——如果你只有消费级 RX 7600 XT、且 ROCm 是按兼容矩阵跑的有限实验，这条是直接的事实错误。删除或降级："Ran HIP kernels and profiling exercises on RDNA3 (consumer ROCm path, compatibility-matrix gated)"。结论：6 条中 0 条可原样保留——但每条背后都存在一个更小的真实事实；写出那个事实就足够了。',
          },
          interviewQ: {
            question: '你简历上写"向 amdgpu 提交过补丁"。挑一个讲讲：它改了什么、为什么需要、Review 过程教会了你什么？',
            difficulty: 'medium',
            hint: '用 STAR 收束：背景（怎么发现的）→ 任务 → 行动（验证与流程）→ 结果（链接 + 学到的东西）。主动如实说明补丁的大小。',
            answer: '示范回答（kernel-doc 修复场景，按你的真实经历替换）：Situation——我用 scripts/kernel-doc -none 扫描 display 子树时，发现 dc_stream.h 一个函数的注释缺少新参数的描述；git log -S 显示几个月前一次提交修改了函数签名但没同步注释。Task——修复该警告并完整走一遍上游流程。Action——先过四道闸门：确认警告在 amd-staging-drm-next 最新提交上仍存在、lore 查重无在途修复；补上 @param 描述后 kernel-doc -none 零输出、模块编译通过、checkpatch --strict 干净；commit message 引用了引入不一致的提交；get_maintainer 确定收件人后用 git send-email 发到 amd-gfx 并 Cc 维护者。Result——维护者回复了一条措辞建议，我发了 v2（changelog 注明修改内容与建议人），随后补丁被收进 amd-staging-drm-next——这是 lore 线程链接。学到三件事：①上游对"小而正确"的尊重——10 行的修复也会被认真 Review；②commit message 是写给五年后维护者的信，不是自己的备忘；③Review 是协作不是考试——逐点回应并注明出处，比辩解高效得多。我会主动说明这是个小补丁：它的价值在于我对完整流程的每一步都有了肌肉记忆，第二个补丁的成本只有第一个的十分之一。',
            amdContext: '面试官几乎一定会当场打开你给的 lore 链接。这道题的真正考点是：你能否对自己的工作做出准确、不夸大、细节经得起追问的叙述——这正是日常代码 Review 与跨团队协作所需要的能力。',
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
    '能够把自己的学习路径组织成“有证据的成长故事”，用补丁链接、文章和测试来支撑，而不只是简历口号',
    '在 amd-staging-drm-next 上运行过一次完整的机会扫描（kernel-doc + W=1），产出了排序后的候选清单',
    '简历中的每一条 bullet 都套用了"动词 + 对象 + 方法 + 链接"公式，且链接全部真实可点击',
    '建立了"每周一个可链接产出"的 12 周节奏，并完成了至少第一周的产出',
  ],
};
