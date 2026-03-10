// ============================================================
// AMD Linux Driver Learning Platform - Module 11 Micro-Lessons (English)
// Module 11: Career & Contribution (社区contributionandcareer发展)
// 4 lessons in 2 groups, ~15 min each, total ~60 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module11MicroLessonsEn: MicroLessonModule = {
  moduleId: 'career',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 11.1: kernelpatch实战
    // ════════════════════════════════════════════════════════════
    {
      id: '11-1',
      number: '11.1',
      title: 'kernelpatch实战',
      titleEn: 'Kernel Patch Workflow in Practice',
      icon: 'Mail',
      description: 'masterfrom git format-patch to git send-email completekernelpatchcommitprocess, 学will写出高质量 commit message 并专业地回应code review. ',
      lessons: [
        // ── Lesson 11.1.1 ──────────────────────────────────────
        {
          id: '11-1-1',
          number: '11.1.1',
          title: 'kernelpatchwork流',
          titleEn: 'Kernel Patch Workflow',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['git', 'format-patch', 'send-email', 'checkpatch', 'amd-gfx'],
          concept: {
            summary: 'Linux kernelpatchcommitnotuse Pull Request — but ratherthrough git format-patch generatepatchfile, scripts/checkpatch.pl checkcode风格, scripts/get_maintainer.pl findcorrectreviewer, then git send-email sendto amd-gfx mailing list. understand并熟练masterthiswork流is成askernelcontributor门槛. ',
            explanation: [
              'Linux kernelis世界on最大协作open-sourceproject之一, 但它notuse GitHub/GitLab  Pull Request pattern. allpatchthrough电子邮件commitand审查 — 这is Linus Torvalds from 2002 年至今坚持approach. for amdgpu driver, patchsendto amd-gfx@lists.freedesktop.org mailing list, 由 AMD maintainer(Alex Deucher, Harry Wentland 等)审查. ',
              'git format-patch isgeneratepatchfilestandardcommand. 它willyour git commit convertasstandard邮件formatfile(.patch). 常用approach: git format-patch HEAD~1 generate最近acommitpatch, git format-patch -3 generate最近 3 个commitpatchseries. forpatchseries, git format-patch willautomaticadd编号([PATCH 1/3], [PATCH 2/3], [PATCH 3/3])并generate一封封面邮件(cover letter). ',
              'scripts/checkpatch.pl iskernelcode风格check脚本. insendpatchbefore, mustrun它checkcodewhether符合kernel编码specification. runapproach: scripts/checkpatch.pl 0001-your-patch.patch. 它willcheck: 缩进(must用 Tab, 8 字符宽), 行长度(notexceed 100 字符), 空格use(if after面musthas空格), commit message format(Subject notexceed 75 字符)等. goalis 0 errors, 0 warnings. 少量 WARNING in合理情况belowcan接受(如超长字符串constant), 但 ERROR mustfix. ',
              'scripts/get_maintainer.pl 帮你findshouldwillpatchsend给谁. runapproach: scripts/get_maintainer.pl 0001-your-patch.patch. 它analyzepatchmodifyfile, from MAINTAINERS fileinlookupcorrespondingmaintainerandmailing list. for amdgpu patch, usuallyoutput Alex Deucher(maintainer), amd-gfx@lists.freedesktop.org(mailing list)等. 你needwill他们addto git send-email  To/Cc listin. ',
              'git send-email willpatchfilethrough SMTP sendtomailing list. 首次useneedconfiguration SMTP 服务器: git config --global sendemail.smtpserver smtp.gmail.com 等. sendpatchseries时: git send-email --to amd-gfx@lists.freedesktop.org --cc alex.deucher@amd.com 0001-*.patch. patchsendafter, maintainerand社区成员willinmailing liston回复 Review 意见. ifneedmodify, send v2 version: git format-patch --subject-prefix="PATCH v2" HEAD~1. ',
              'patchversion迭代(v2/v3...)iscommonprocess. v2 patchshouldin commit message 末尾(--- 分隔符after)add changelog, indicate v1 to v2 变更. 封面邮件alsoshouldupdate changelog. 保持耐心and专业 — 大多数patchneed 2-3 轮迭代only thencanby接受. ',
              'Since 2023, the b4 tool (https://b4.docs.kernel.org/) has become the recommended way to send kernel patches, replacing the manual git send-email workflow. b4 automates: retrieving maintainer lists, formatting cover letters, threading patch series, and tracking versions. Key commands: b4 prep (prepare a patch series from commits), b4 send (send the series to the correct mailing lists), b4 trailers (collect Reviewed-by/Acked-by from replies). Many AMD engineers now use b4 as their daily tool. While git send-email still works and is widely documented, showing familiarity with b4 in an interview signals that your knowledge is current.',
            ],
            keyPoints: [
              'Linux kernelthroughmailing listcommitpatch, notuse Pull Request',
              'git format-patch generatestandardpatchfile(.patch), supportpatchseries编号',
              'scripts/checkpatch.pl checkcode风格 — goalis 0 errors, 0 warnings',
              'scripts/get_maintainer.pl findcorrectmaintainerandmailing list',
              'git send-email sendto amd-gfx@lists.freedesktop.org mailing list',
              'v2/v3 version迭代: --subject-prefix="PATCH v2", 附加 changelog',
              'b4 is the modern (2023+) patch sending tool — automates maintainer lookup, threading, and version tracking',
            ],
          },
          diagram: {
            title: 'completekernelpatchcommitprocess',
            content: `kernelpatchcommitcompleteprocess

Step 1: writecode & commit
─────────────────────────
$ vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c
$ make M=drivers/gpu/drm/amd -j$(nproc)     # compilation
$ make W=1 M=drivers/gpu/drm/amd            # check额outside警告

$ git add -p                                 # 逐blockselecttocommitmodify
$ git commit -s                              # -s automaticadd Signed-off-by
  │
  │  Commit message format:
  │  ┌─────────────────────────────────────────┐
  │  │ drm/amdgpu: fix VM page table update    │ ← Subject (≤75 字符)
  │  │                                         │
  │  │ The VM page table update was missing     │ ← Body (what & why)
  │  │ a TLB flush after unmapping pages,       │
  │  │ causing stale mappings that lead to      │
  │  │ GPU page faults on RDNA3 hardware.       │
  │  │                                         │
  │  │ Fixes: abc123def ("drm/amdgpu: ...")    │ ← 引用引入 Bug commit
  │  │ Signed-off-by: You <you@email.com>      │ ← 法律声明
  │  └─────────────────────────────────────────┘
  ▼
Step 2: check
─────────────
$ scripts/checkpatch.pl --strict HEAD~1..HEAD
  total: 0 errors, 0 warnings, 15 lines checked    ← ✓ through

$ scripts/get_maintainer.pl --git HEAD~1..HEAD
  Alex Deucher <alexander.deucher@amd.com> (maintainer)
  Christian König <christian.koenig@amd.com> (reviewer)
  amd-gfx@lists.freedesktop.org (list)
  dri-devel@lists.freedesktop.org (list)
  │
  ▼
Step 3: generatepatchfile
─────────────────────
$ git format-patch HEAD~1
  0001-drm-amdgpu-fix-VM-page-table-update.patch
  │
  ▼
Step 4: send
─────────────
$ git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    --cc alexander.deucher@amd.com \\
    --cc christian.koenig@amd.com \\
    0001-drm-amdgpu-fix-VM-page-table-update.patch

  mailing list: ✉️ patchalreadysend
  │
  ▼
Step 5: wait Review & 迭代
──────────────────────────
  Reviewer: "请the TLB flush 移to mutex unlock before"
  │
  ▼
$ git commit --amend                         # modifycommit
$ git format-patch --subject-prefix="PATCH v2" HEAD~1
$ git send-email ... \\
    --in-reply-to="<original-message-id>"    # 回复raw邮件thread
  ▼
  Reviewer: "Reviewed-by: Christian König <...>"  ← ✓ 审查through
  Maintainer: mergeto amd-staging-drm-next         ← ✓ alreadymerge`,
            caption: 'fromcodemodifytopatchbymergecompleteprocess. 每一步allhascorrespondingcommandandtool. 大多数patchneed 2-3 轮 Review 迭代. ',
          },
          codeWalk: {
            title: 'completepatchcommitcommand演示',
            file: 'terminal',
            language: 'bash',
            code: `#!/bin/bash
# completekernelpatchcommitwork流演示

# ========================================
# Step 1: configuration git send-email (只需做once)
# ========================================
git config --global sendemail.smtpserver smtp.gmail.com
git config --global sendemail.smtpserverport 587
git config --global sendemail.smtpencryption tls
git config --global sendemail.smtpuser your.email@gmail.com
# Gmail needuse App Password (非账户密码)

# ========================================
# Step 2: modifycode并commit
# ========================================
cd ~/kernel-src

# createworkbranch
git checkout -b fix/vm-tlb-flush amd-staging-drm-next

# 编辑code
vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c

# 只compilation amdgpu moduleverifycompilationthrough
make M=drivers/gpu/drm/amd -j$(nproc)

# commit (-s automaticadd Signed-off-by)
git add drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c
git commit -s
# 编辑器in写 commit message:
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
# Step 3: checkpatch质量
# ========================================
# code风格check
scripts/checkpatch.pl --strict -g HEAD~1..HEAD
# goal: total: 0 errors, 0 warnings

# findmaintainer
scripts/get_maintainer.pl -g HEAD~1..HEAD
# output:
#   Alex Deucher <alexander.deucher@amd.com>
#   Christian König <christian.koenig@amd.com>
#   amd-gfx@lists.freedesktop.org

# ========================================
# Step 4: generatepatchfile
# ========================================
# 单个patch
git format-patch HEAD~1
# → 0001-drm-amdgpu-flush-TLB-after-VM-page-table-unmap.patch

# patchseries (multiplecommit)
git format-patch --cover-letter HEAD~3
# → 0000-cover-letter.patch  (need编辑)
# → 0001-first-change.patch
# → 0002-second-change.patch
# → 0003-third-change.patch

# ========================================
# Step 5: sendpatch
# ========================================
git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    --cc alexander.deucher@amd.com \\
    --cc christian.koenig@amd.com \\
    --cc dri-devel@lists.freedesktop.org \\
    0001-drm-amdgpu-flush-TLB-after-VM-page-table-unmap.patch

# ========================================
# Step 6: v2 迭代 (Review aftermodify)
# ========================================
# according to Review 意见modifycode
vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c
git add -u && git commit --amend
# in commit message  --- 分隔符afteradd changelog:
#   ---
#   v2: Move TLB flush before mutex_unlock (Christian)

git format-patch --subject-prefix="PATCH v2" HEAD~1
git send-email \\
    --in-reply-to="<message-id-of-v1>" \\
    --to amd-gfx@lists.freedesktop.org \\
    --cc alexander.deucher@amd.com \\
    0001-drm-amdgpu-flush-TLB-after-VM-page-table-unmap.patch`,
            annotations: [
              'git config sendemail.* 只需configurationonce, Gmail needinsecuritysetincreate App Password',
              'git commit -s automaticadd Signed-off-by 行 — 这iskernelpatch法律to求(DCO 声明)',
              'scripts/checkpatch.pl --strict enable更严格check, includecertain WARNING levelrecommended',
              'scripts/get_maintainer.pl -g from git 历史(rather thanpatchfile)inanalyzemaintainer',
              '--in-reply-to will v2 patch放入 v1 邮件threadin, 方便 Reviewer 跟踪',
              'v2 changelog 写in --- 分隔符after, 这样 git am applicationpatch时willautomatic忽略它',
            ],
            explanation: '这套commandiseachkernelcontributormustmaster. recommended你先ina小modifyonpracticethisprocess(如fixa typo or改善一条注释), 熟悉eachstepafteragaincommit实质性codemodify. amd-gfx mailing list对新手友好 — your第apatchwill得to耐心 Review. ',
          },
          miniLab: {
            title: 'complete走一遍patchcommitprocess',
            objective: 'inyourlocalkernelrepositoryincompleteoncecompletepatch准备process(notneed真send邮件), 熟悉eachcommand. ',
            steps: [
              '进入kernelsource code: cd ~/kernel-src && git checkout -b practice/first-patch',
              '做a小modify — in drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c 某个注释infixa typo or改善措辞',
              'commit: git add -p && git commit -s(写specification commit message)',
              'run checkpatch: scripts/checkpatch.pl --strict -g HEAD~1..HEAD(ensure 0 errors)',
              'run get_maintainer: scripts/get_maintainer.pl -g HEAD~1..HEAD(看tomaintainerlist)',
              'generatepatchfile: git format-patch HEAD~1(viewgenerate .patch file内容)',
              '用 git send-email --dry-run simulatesend(will not真发邮件): git send-email --dry-run --to test@example.com 0001-*.patch',
              'cleanuppracticebranch: git checkout main && git branch -D practice/first-patch',
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
            hint: 'if git send-email 报错 "send-email is not a git command", install它: sudo apt install git-email. --dry-run patterncompletelysecurity, will notsend任何邮件. ',
          },
          debugExercise: {
            title: 'findpatchcommitprocessinissue',
            language: 'bash',
            description: 'belowisadevelopment者commitpatchcommand序列, 但wherehas多处issue. findallerror. ',
            question: 'thispatchcommitprocesshaswhichissue? whypatchmaybymaintainer拒绝? ',
            buggyCode: `# development者errorcommitprocess

# 1. directlyin主branchonmodify
git checkout amd-staging-drm-next
vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c

# 2. commit(no -s flag)
git add .
git commit -m "fixed bug"

# 3. 跳过 checkpatch
# "反正我know我codeis对"

# 4. generatepatch
git format-patch HEAD~1

# 5. 只发给mailing list, not Cc maintainer
git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    0001-fixed-bug.patch

# 6. v2 not回复rawthread
git commit --amend -m "fixed bug v2"
git format-patch HEAD~1
git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    0001-fixed-bug-v2.patch`,
            hint: 'check每一步: branchmanagement, commitmessageformat, codecheck, 收件人list, version迭代approach. ',
            answer: '六个issue: (1)directlyin主branchmodify — shouldcreateworkbranch(git checkout -b fix/vm-bug), directlyin跟踪remote主branchoncommitwill搞乱localbranchstate. (2)git add . addallfile — may意outsidecontainnotrelatedmodify, should用 git add -p 逐blockselect. git commit -m "fixed bug" 缺少 -s flag(无 Signed-off-by), 且 commit message not符合specification: 缺少 "drm/amdgpu:" before缀, Subject 太短not够describe性, no Body explain what and why. (3)跳过 checkpatch — maintainerwillin Review in指出code风格issue并to求re-commit, 浪费双方时between. should始终insendbeforerun. (4)git format-patch 本身没issue, 但because commit message formaterror, generatepatchfile名is also无意义. (5)no Cc maintainer — 只发tomailing list, maintainermaywill notnoteto. mustuse get_maintainer.pl findmaintainer并 --cc 他们. (6)v2 nouse --subject-prefix="PATCH v2", no --in-reply-to 回复rawthread, commit message stillnotspecification, noadd v1→v2  changelog. correct做法见 Step 6 example. ',
          },
          interviewQ: {
            question: 'describe你向 Linux kernelcommitpatchcompleteprocess. how would youensurepatch质量? ',
            difficulty: 'medium',
            hint: 'fromcodemodifytofinalbymerge, include checkpatch, get_maintainer, format-patch, send-email, Review 迭代. ',
            answer: 'completeprocess: (1)准备work: based on amd-staging-drm-next createworkbranch, ensureandupstreamsynchronization. (2)codemodify: 编辑code, make M=drivers/gpu/drm/amd compilationverify无警告, runrelated IGT testingconfirmfunctioncorrect且无回归. (3)commit: git add -p 逐block审查tocommitmodify(avoid意outsidecontain无关改动), git commit -s commit并add Signed-off-by. Commit message usestandardformat: Subject "drm/amdgpu: <concise description>", Body explain what and why(is not how), 必to时add Fixes: label. (4)质量check: scripts/checkpatch.pl --strict ensure 0 errors 0 warnings; scripts/get_maintainer.pl findcorrectmaintainer. (5)send: git format-patch generatepatch, git send-email sendto amd-gfx mailing list, Cc all get_maintainer 列出人. (6)Review 迭代: 认真read每条 Review 意见, modifycodeaftersend v2(use --subject-prefix and --in-reply-to), in changelog inindicateeachversion变更. (7)waitmerge: usuallymaintainerwilladd Reviewed-by/Acked-by labelaftermergeto staging branch, final流入 Linus mainline. 质量保证key: not跳过 checkpatch, commit message 写清楚 what/why, each timesendbeforeinrealhardwareontesting. ',
            amdContext: 'in AMD interviewin, if你can说出"我already向 amd-gfx mailing listcommit过patch"并demonstratespecific commit, 这比任何interviewanswerallhas说服力. even ifisa小 typo fixalsodemonstrate你对process熟悉. ',
          },
        },

        // ── Lesson 11.1.2 ──────────────────────────────────────
        {
          id: '11-1-2',
          number: '11.1.2',
          title: '写好 Commit Message and回应 Review',
          titleEn: 'Writing Good Commit Messages & Responding to Reviews',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['commit-message', 'code-review', 'Signed-off-by', 'Fixes-tag', 'etiquette'],
          concept: {
            summary: 'Commit message 质量and对 Review 专业回应iskerneldevelopment者最important软skill. 好 commit message explain "what & why"(is not how), 遵循 "drm/amdgpu: ..."  Subject format, 并correctuse Fixes/Signed-off-by/Reviewed-by label. 回应 Review 时to逐点回复, 对has争议意见providetechnology论据. ',
            explanation: [
              'Commit message isyourpatch给世界第一印象. kernelmaintainer每天read数十甚至on百个patch — a模糊 commit message(如 "fix bug")willbydirectly忽略orto求重写. 好 commit message let Reviewer inreadcodebeforeunderstand你in做whatandwhy. 5 年aftermaintainerthrough git blame 看toyourcode时, commit message is他understandthiscode目unique线索. ',
              'Subject 行format: 以subsystembefore缀开头, 如 "drm/amdgpu: fix VM page fault on TLB invalidation". for amdgpu driverdifferentmodule, before缀has细分: "drm/amdgpu: "(general), "drm/amd/display: "(display/DC module), "drm/amd/pm: "(power management), "drm/amdkfd: "(KFD/compute). Subject notexceed 75 字符(git log --oneline display宽度), 用小写开头(fix rather than Fix), not加句号. 动词用祈使句(fix, add, remove, refactor rather than fixed, adds). ',
              'Body 部分explain两件事: What(modifywhat, observetowhatissue)and Why(whyneedthismodify, 根本causeiswhat). nottoexplain How(codehow改 — Reviewer 看 diff know). 例outside: ifmodify涉及not直观算法orhardware行as, can简toexplain How. Body 每行notexceed 75 字符, 段落between用空行分隔. ',
              'Fixes: labelformat: Fixes: <12 位 commit hash> ("raw commit  Subject"). thislabel告诉maintainerandautomatic化tool: yourpatchfix哪个commit引入 Bug. 它by stable kernelmaintainer用判断whetherneedwillyourfix backport to stable branch. generatemethod: git log --oneline | grep "引入 bug key词", find commit, then git log --format="Fixes: %h (\"%s\")" -1 <commit-hash>. ',
              'Signed-off-by is Developer Certificate of Origin(DCO)声明 — 你签名representthiscodeis你写(or你has权commit它), 并同意以 GPL 许canpublish. eachcontributormustadd. Reviewed-by represent某人审查code并认ascanmerge. Acked-by represent某人(usuallyissubsystemmaintainer)同意thispatch, 但mayno做detailedcode review. Tested-by represent某人inrealhardwareontestingthispatch. theselabel按时betweenorder排列in commit message 末尾. ',
              '回应 Review 专业态度: 逐点回复每条意见(even ifis你different意); technologyonhas争议时providedataand论据(如performancetestingresult, hardware规格indicate); for你接受modify意见, inbelow一versioninimplementation并in Reply inconfirm; 永远保持礼貌 — kernel社区重视technology讨论建设性. notto认as Review 意见is人身攻击, theyisletcode变得更好process. ',
            ],
            keyPoints: [
              'Subject: "drm/amdgpu: <imperative verb> <concise description>", ≤75 字符',
              'Body: explain What & Why(is not How), 每行 ≤75 字符',
              'Fixes: label引用引入 Bug  commit, 帮助 stable backport 决策',
              'Signed-off-by: DCO 声明(must); Reviewed-by/Acked-by/Tested-by: Review label',
              '回应 Review: 逐点回复, technology争议provide论据, 保持建设性态度',
              'v2 changelog 写in --- 分隔符after, indicate每版变更及提出recommended人',
            ],
          },
          diagram: {
            title: 'Commit Message profiling: 好 vs 差',
            content: `Commit Message compare

差 Commit Message
──────────────────────
fix bug

Signed-off-by: dev@email.com

issue:
├─ Subject nosubsystembefore缀
├─ "fix bug" completelynodescribe性
├─ no Body explainissueandcause
├─ no Fixes: label
└─ 5 年after看tothis commit notknow它修what


好 Commit Message
──────────────────────
drm/amdgpu: fix page fault on VM unmap due to missing TLB flush
                │                        │
                │                        └─ 简洁describeissue
                └─ subsystembefore缀

When unmapping pages from GPU virtual address space, the TLB
(Translation Lookaside Buffer) was not invalidated before
releasing the physical pages. This caused subsequent GPU memory
accesses to hit stale page table entries, triggering:
                                                │
  [drm:amdgpu_vm_bo_update] *ERROR* VM fault    │ ← What: observeto现象
  src_id:0 ring:0 vmid:3 addr:0x800100000       │

The root cause is commit a1b2c3d4e5f6 which refactored the     │
unmap path but accidentally removed the amdgpu_vm_flush() call.  │ ← Why: 根因
The fix adds back the TLB invalidation between the PTE clear    │
and the page release, matching the sequence in the map path.    │

Tested on RX 7600 XT (gfx1102) with IGT amd_basic@vm-tests.   ← testinginformation

Fixes: a1b2c3d4e5f6 ("drm/amdgpu: refactor VM unmap path")     ← Fixes label
Signed-off-by: Your Name <your@email.com>                        ← DCO 签名
---                                                              ← 分隔符
v2: Move TLB flush before mutex_unlock per Christian's review    ← v2 changelog
v1: https://lore.kernel.org/amd-gfx/original-message-id/        ← v1 linking

Review labelinmerge时由maintaineradd:
Reviewed-by: Christian König <christian.koenig@amd.com>
Acked-by: Alex Deucher <alexander.deucher@amd.com>`,
            caption: '好 commit message let Reviewer in看codebeforeunderstandissueandplan. Fixes label帮助 stable backport, changelog 帮助跟踪迭代. ',
          },
          codeWalk: {
            title: 'Review 回应示范对话',
            file: 'amd-gfx mailing list thread',
            language: 'text',
            code: `# 这isa虚构但typical amd-gfx Review 对话

# ═══════════════════════════════════════════════
# v1: yourrawpatch
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
# your回应 (专业, specific, 感谢recommended)
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
# v2: according to Review 意见modify
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
# Review 2: through!
# ═══════════════════════════════════════════════
From: Christian König <christian.koenig@amd.com>
Reviewed-by: Christian König <christian.koenig@amd.com>`,
            annotations: [
              'v1  commit message 清晰explainissue(use-after-free), cause(并发 eviction)andplan(reference counting)',
              'Reviewer 指出two改进点: use DRM core API anderrorpathhandle — 这istypical高质量 Review',
              'your回应逐点回复每条意见, 对 API recommendedrepresent同意, 对errorpathprovidespecificfixplan',
              'v2  changelog recordeach变更及recommended者名字 — 这iskernel社区礼貌',
              'Reviewed-by label由 Reviewer in回复in给出, is not你selfadd',
              'entireprocessmay跨越 2-3 天 — 耐心iskerneldevelopment者美德',
            ],
            explanation: 'this对话demonstratekernel Review 理想pattern: Reviewer 指出specifictechnologyissue(is not人身攻击), development者认真回应并modify(is not辩解or忽略), final达成technology共识. note v2 changelog in感谢 Reviewer approach — in括号in写名字. 这种专业沟通abilityandyourtechnologyability一样important. ',
          },
          miniLab: {
            title: 'practice写 Commit Message andsimulate Review',
            objective: '针对a假设 bug fix, practice写出高质量 commit message, 并practice回应 Review 意见. ',
            steps: [
              'scenario假设: 你fix amdgpu_gmc.c ina bug — VRAM sizereport比actual少 256MB, causeisnocontain firmware reserve区size. ',
              '写出complete commit message(Subject + Body + Fixes + Signed-off-by), saveto ~/practice_commit_msg.txt',
              '自我 Review: check Subject whether ≤75 字符, whether以 "drm/amdgpu:" 开头, Body whetherexplain What and Why',
              'simulate Review 意见: "incompute VRAM size时, need考虑to SR-IOV environmentbelow firmware reserve区sizedifferent情况. "',
              '写出你对这条 Review 意见回复',
              '写出 v2  commit message(include changelog)',
              'compareyour commit message andon面图表in"好例子" — 差距in哪inside? ',
            ],
            expectedOutput: `# 参考答案 (yourmaydifferent, keyisformatand内容质量)

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
            hint: '好 commit message 特征: aoutside部人(not解yourcodemodify)读完 Subject and Body know发生what, whyneedfix. ',
          },
          debugExercise: {
            title: 'fixerror Commit Message',
            language: 'text',
            description: 'below commit message has多处not符合kernelspecificationissue. findallissue并改正. ',
            question: 'this commit message haswhichformatand内容issue? 重写acorrectversion. ',
            buggyCode: `Fix the SDMA bug that was causing issues on the new GPU.

I changed the register offset from 0x1234 to 0x1238 because the
old one was wrong. Also fixed a typo in the comment nearby.

Signed-off-by: developer <dev@company.com>
Fixes: some old commit`,
            hint: 'check Subject format(before缀, size写, 长度), Body 内容(what vs how), Fixes labelformat, andwhethershouldwilltwodifferentmodify放in同apatchin. ',
            answer: 'issue清单: (1)Subject 缺少subsystembefore缀 — shouldis "drm/amdgpu: fix SDMA register offset for ...". (2)Subject 以大写字母开头 — should小写 "fix". (3)Subject 太笼统 — "bug that was causing issues" nodescribespecificissue. (4)Body explain How("changed the register offset from 0x1234 to 0x1238")rather than Why — shouldexplainwhy旧offset量is错(如"hardware规格书勘误"or"RDNA3 改变register布局"). (5)Fixes labelformatcompletelyerror — shouldis Fixes: <12位hash> ("raw Subject"), 而is not "some old commit". (6)willtwodifferentmodify(registerfix + typo fix)放in同apatchin — kernelspecificationto求eachpatch只做一件事(One logical change per patch). should拆分astwoindependentpatch. correctversion: Subject: drm/amdgpu: fix SDMA doorbell offset on RDNA3. Body: "The SDMA doorbell register offset was incorrect for RDNA3 GPUs (gfx11). The hardware reference manual (v4.2, Table 3.7) specifies offset 0x1238 for SDMA0_DOORBELL, but the driver used 0x1234 which was the GCN5 offset. This caused SDMA ring timeouts on RX 7600 XT." + independent typo fixpatch. ',
          },
          interviewQ: {
            question: 'akernel commit message shouldcontainwhatinformation? explain Signed-off-by, Reviewed-by and Fixes label含义. ',
            difficulty: 'easy',
            hint: 'from Subject format, Body  What/Why, and各个label法律andtechnology含义角度answer. ',
            answer: 'Commit message structure: (1)Subject 行: 以subsystembefore缀开头(如 "drm/amdgpu:"), 用祈使句简洁describemodify(≤75 字符), 小写字母开头, not加句号. (2)空行. (3)Body: detailedexplain What(modifywhat, observetowhatissue)and Why(whyneedthismodify, 根本causeiswhat). notexplain How — diff alreadydemonstratecodemodify. 每行 ≤75 字符. (4)labelregion: Fixes: <hash> ("subject") — 引用引入 bug raw commit, by stable maintainer用判断whetherneed backport to stable branch. thislabeluse git log formatautomaticgenerate. Signed-off-by: Name <email> — Developer Certificate of Origin (DCO) 声明. 签名者声明codeisself写(orhas权commit), 并同意以kernelopen-source许can证publish. eachcontributormustadd. Reviewed-by: Name <email> — 某人审查code并认ascanmerge. 比 Acked-by 更强 — 意味着 Reviewer 逐行checkcode. Acked-by: Name <email> — 某人同意thismodify方向, 但mayno做detailedcode review. usually由subsystemmaintainer给出. Tested-by: Name <email> — 某人inrealhardwareontestingpatch, confirm它resolveissue且no引入回归. ',
            amdContext: 'thisissuein AMD interviewin属于basics题 — if你连 commit message formatallnot熟悉, interviewerwill质疑你whetherhas过kerneldevelopmentexperience. 但反过, if你can流畅地answer并举出selfcommitpatch作as例子, 这willis强has力加分项. ',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 11.2: career发展
    // ════════════════════════════════════════════════════════════
    {
      id: '11-2',
      number: '11.2',
      title: 'career发展',
      titleEn: 'Career Development',
      icon: 'Rocket',
      description: 'will你in本课程in积累skillandproject转化ascareer优势 — build引人注目engineer Portfolio, 深入解 AMD teamstructureandinterviewprocess. ',
      lessons: [
        // ── Lesson 11.2.1 ──────────────────────────────────────
        {
          id: '11-2-1',
          number: '11.2.1',
          title: 'buildyour AMD engineer Portfolio',
          titleEn: 'Building Your AMD Engineer Portfolio',
          duration: 15,
          difficulty: 'beginner',
          tags: ['portfolio', 'GitHub', 'blog', 'LinkedIn', 'career'],
          concept: {
            summary: 'a精心build Portfolio is你technologyability公开proof — for GPU driverthis小众领域, acontainkernelpatch, driveranalyze文章, IGT testing用例and本learn平台completerecord Portfolio 比任何resumedescribeallhas说服力. 本节教你howbuildalet AMD hiring经理印象深刻 Portfolio. ',
            explanation: [
              'GPU driverdevelopmentisa高度专业化领域 — 全球mayonly几千人in做thiswork. this meanshiring经理in评估candidate时, 非常看重canverifytechnologyability. a公开 Portfolio let他们candirectly看toyourcode质量, technologyunderstand深度andlearnability, 而notneeddependencyinterviewin口头describe. ',
              'Portfolio core内容应include: (1)kernelpatchrecord — linkingto你in amd-gfx mailing listonpatch(even ifis typo fixalsodemonstrate你熟悉patchprocess). use lore.kernel.org 搜索your邮箱addressfindall公开patch. (2)amdgpu source codeanalyze — selectdriverasubsystem(如 VM management, GFX ring, power management), 写一篇深入analyze文章, demonstrate你对codeunderstand. (3)IGT testing用例 — 你as amdgpu writetestingcode, demonstrateyourtesting思维and C programmingability. (4)本learn平台completerecord — allmodulelearn笔记and lab complete情况. ',
              'technology博客isdemonstrate深度understand最佳approach. recommended博客平台: GitHub Pages(免费, andyour GitHub 关联), 个人域名博客(更专业), or Medium/知乎(if你goalisin文受众). 博客文章structure: issuedescribe → related背景 → source codeanalyze(附带code片段and注释)→ experimentverify → 总结. 一篇高质量 amdgpu source codeanalyze文章may比 10 篇普通technology文章更has价值. ',
              'LinkedIn optimization: Headline directly写goalposition(如 "GPU Driver Engineer | Linux Kernel | AMD amdgpu"); Summary 突出yourkernelcontributionanddriver知识; Experience in列出your open source contributions(even ifisinlearnstage). usekey词let AMD hiring人员can搜索to你: Linux kernel, DRM, amdgpu, GPU driver, Mesa, VRAM management, KMS 等. ',
              'GitHub repository组织: createa专门 "gpu-driver-portfolio" repository, contain README(概述yourskillandproject), patches/(你commitkernelpatch副本), analysis/(source codeanalyze文章), tests/(你写 IGT testing), notes/(learn笔记). README isthisrepository最important部分 — 它ishiring经理第一印象. ',
            ],
            keyPoints: [
              'Portfolio 比resumedescribe更has说服力 — GPU driver领域重视canverifytechnologyability',
              'core内容: kernelpatch + amdgpu source codeanalyze + IGT testing + learnrecord',
              'technology博客: select amdgpu asubsystem深入analyze, 一篇质量 > 十篇count',
              'LinkedIn optimization: Headline containgoalkey词, let AMD hiring人员can搜to你',
              'GitHub repositorystructure化组织, README is第一印象',
              'lore.kernel.org 搜索your邮箱canfindall公开mailing listcontribution',
            ],
          },
          diagram: {
            title: '理想 GPU driverengineer Portfolio structure',
            content: `Portfolio 内容architecture

GitHub: github.com/yourname
├── gpu-driver-portfolio/           ★ 主 Portfolio repository
│   ├── README.md                   ← 概述, skill总结, linking索引
│   ├── patches/                    ← yourkernelpatch副本
│   │   ├── 0001-fix-vm-tlb.patch
│   │   └── 0002-add-igt-test.patch
│   ├── analysis/                   ← source code深度analyze
│   │   ├── amdgpu-vm-subsystem.md  ← "amdgpu VM subsystemsource codeanalyze"
│   │   └── gfx-ring-buffer.md     ← "GFX Ring Buffer workprinciple"
│   ├── tests/                      ← 你writetestingcode
│   │   └── amd_vram_stress.c      ← IGT VRAM 压力testing
│   └── learning-notes/             ← modulelearn笔记
│       ├── module05-amdgpu-init.md
│       └── module07-display.md
│
├── linux/ (fork)                   ← Linux kernel fork
│   └── (yourpatchbranch)               containyourcodemodify
│
└── igt-gpu-tools/ (fork)           ← IGT fork
    └── (yourtestingbranch)               contain你写testing

博客 (blog.yourname.com or GitHub Pages)
├── "深入 amdgpu VM subsystem: frompage tableto TLB"
├── "用 ftrace tracingonce GPU Hang completeprocess"
├── "我第akernelpatch: from typo to Reviewed-by"
└── "RDNA3 GFX Ring Buffer completely指南"

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

mailing listrecord (can公开verify)
lore.kernel.org/amd-gfx/?q=your@email.com
├── [PATCH] drm/amdgpu: fix comment typo
├── [PATCH v2] drm/amdgpu: add IGT VRAM stress test
└── (eachpatchallis你ability公开proof)`,
            caption: 'Portfolio eachcomponentfromdifferent角度demonstrateyourability: patchdemonstrateprocess熟练度, analyzedemonstrateunderstand深度, testingdemonstrate质量意识, 博客demonstrate沟通ability. ',
          },
          codeWalk: {
            title: 'Portfolio README template',
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

- example: 深入 amdgpu VM subsystem: frompage tableto TLB(替换asyourreal博客linking)
- example: 我第akernelpatch之旅(替换asyourreal博客linking)

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
              'README 开头directlyindicate你is谁, 你willwhat — hiring经理时betweenhas限',
              'kernelpatch表格带 lore.kernel.org linking — let任何人allcanverifyyourcontribution',
              'source codeanalyzeselectspecificsubsystem — demonstrate深度understandrather than浅尝辄止',
              'IGT testingdemonstrateyour质量意识 — not只is写code, stillknowhowtesting',
              'Skills 部分usekey词 — 帮助 ATS(Applicant Tracking System)matchyourresume',
              '博客linkingdemonstrateyour沟通ability — canthecomplextechnologyexplain清楚',
            ],
            explanation: 'this README templateisyour Portfolio "首页". hiring经理usually只花 30 秒浏览a GitHub Profile — your README needin这 30 秒内let他看to: 你haskernelpatchexperience, 你understanddriverinternalimplementation, 你hastestingability. eachlinkingall指向can深入verify内容. ',
          },
          miniLab: {
            title: 'startbuildyour Portfolio',
            objective: 'create Portfolio repositorybasicsstructure, 并complete第a内容 — 你in本课程学to知识总结. ',
            steps: [
              'in GitHub oncreaterepository: gpu-driver-portfolio(Public, 带 README)',
              '克隆tolocal: git clone https://github.com/<yourname>/gpu-driver-portfolio.git',
              'createdirectorystructure: mkdir -p patches analysis tests learning-notes',
              '编辑 README.md — 参考the abovetemplate, 填入yourrealinformation(even ifpatchlist暂时as空)',
              '写第一篇learn笔记: in learning-notes/ belowcreatea你最感兴趣module总结',
              'if你already写 IGT testing(Module 10), willcodecopyto tests/ directory',
              'commit并推送: git add . && git commit -m "Initial portfolio structure" && git push',
              'in LinkedIn  Featured 部分addyour Portfolio repositorylinking',
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
            hint: 'notto等to Portfolio "完美"only thenpublish — 先createbasicsstructure, theninlearnprocessin逐步add内容. ahasreallearn轨迹 Portfolio 比a精心wrapper但空洞更has价值. ',
          },
          debugExercise: {
            title: '评估一份 GPU driverengineerresume',
            language: 'text',
            description: 'belowis一份job application AMD GPU driverpositionresume摘to. find它优缺点, 并提出改进recommended. ',
            question: '这份resumehaswhat好地方andneed改进地方? howlet它对 AMD hiring经理更has吸引力? ',
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
            hint: 'from AMD hiring经理角度看 — 他in找what? kernelexperience? driver知识? canverifycontribution? 这份resumecananswertheseissue吗? ',
            answer: '优点: (1)has 3 年 C/C++ experience — GPU driverbasics语言. (2)has OpenGL applicationdevelopmentexperience — indicate接触过graphics领域. 缺点and改进: (1)Summary 太泛 — "Familiar with Linux and open source" 对 GPU driverpositionno区分度. 改进: 明确提to GPU driver, kernel module, DRM 等key词. (2)"Familiar with GPU concepts" 太模糊 — what概念? VRAM management? command submission? shadercompilation? 改进: 列出specifictechnology知识点. (3)"Interested in kernel development" is致命缺陷 — for GPU driverposition, "感兴趣"远远not够. 改进: demonstrate行动 — read过 amdgpu source code(whichmodule), commit过patch(linking), 写过analyze文章(linking). (4)Skills listcontainnotrelatedtechnology(Java, Flutter, Docker, AWS) — 稀释core竞争力. 改进: 突出relatedskill: C(kernel), DRM/KMS, amdgpu, IGT, ftrace, libdrm. (5)Projects andpositioncompletelynotrelated — React 网站and Todo app notcandemonstrate任何driverdevelopmentability. 改进: 替换as GPU driverrelatedproject: amdgpu source codeanalyze, IGT testing用例, kernelpatch. ',
          },
          interviewQ: {
            question: '你做过whichand GPU driverrelatedprojectorcontribution? 请specificdescribe. ',
            difficulty: 'easy',
            hint: '准备 2-3 个specific例子: akernelpatch(demonstratecodeability), asource codeanalyze(demonstrateunderstand深度), atestingproject(demonstrate质量意识). ',
            answer: '示范answer(according to本课程learn内容): (1)kernelpatchcontribution: 我向 amd-gfx mailing listcommit [specificpatch], fix amdgpu driverin [specificissue]. patch经过两轮 Review afterbymergeto amd-staging-drm-next. inthisprocessin, 我学willkernelpatchcommitprocess(checkpatch, format-patch, send-email)and专业 Review 回应approach. (2)amdgpu source code深入analyze: 我深入analyze amdgpu  VM subsystem, from amdgpu_vm_init to GPU page tableupdatecompleteprocess. 我theanalyzeresult写成一篇technology博客文章, 附带source code引用andexecuteprocess图. 这帮助我understand GPU virtualmemory managementand CPU coredifference. (3)IGT testingwrite: 我as amdgpu writea VRAM allocation压力testing(amd_vram_stress.c), contain正面testing(各种sizeallocation)and负面testing(invalidparameterhandle), and 1000 次allocation/release压力testingdetectmemoryleak. thistestingalreadycommitto IGT repository. each例子allhas公开linkingcanverify — 这is我 Portfolio core价值. ',
            amdContext: 'in AMD interviewin, "specificdescribe"意味着interviewer期望听tospecificcode, specificfile, specificissue — 而is not泛泛"我学过driver". 准备好随时in屏幕on打开your GitHub demonstratecode. ',
          },
        },

        // ── Lesson 11.2.2 ──────────────────────────────────────
        {
          id: '11-2-2',
          number: '11.2.2',
          title: 'AMD interview准备',
          titleEn: 'AMD Interview Preparation',
          duration: 15,
          difficulty: 'beginner',
          tags: ['AMD', 'interview', 'career', 'STAR', 'salary'],
          concept: {
            summary: 'AMD  GPU driverengineerinterviewcontaintechnology深度考察and行asinterview两部分. differentteam(Display/3D/Compute/PM/Toolchain)考察重点different. 本节detailedanalyze AMD teamstructure, commoninterview题型, STAR 行asinterview法and薪资range, 帮助你做出has针对性准备. ',
            explanation: [
              'AMD  GPU driverdevelopmentmain集inintwo地点: 加拿大 Markham(多伦多附近, AMD 总部之一)andin国on海(AMD on海研发in心). two办公室allhascompletedriverteam. Markham teamscale更大, is amdgpu drivercoredevelopment基地. on海team近年快速扩张, especiallyindisplay(DC)andcompute(KFD/ROCm)方向. ',
              'teamstructureandinterview重点: (1)Display Team(displayteam)— responsible for DC(Display Core)module, handlepatternset(KMS), HDMI/DP output, HDR, FreeSync/VRR. interview重点: DRM KMS API, atomic commit, CRTC/Plane/Connector 概念, 色彩management, VBlank and Page Flip. Alex Deucher and Harry Wentland isthisteamkey人物. (2)3D/Graphics Team(graphicsteam)— responsible for GFX enginerelatedcode: command submission(CS), Ring Buffer management, GPU scheduling(scheduler), VM(virtual memory)management. interview重点: PM4 command packet, Ring Buffer workprinciple, GPU schedulingstrategy, TLB management. Christian König isthis领域专家. (3)Compute/KFD Team(computeteam)— responsible for KFD(Kernel Fusion Driver)and ROCm support: HSA(Heterogeneous System Architecture)queue, GPU computescheduling, SVM(Shared Virtual Memory). interview重点: GPU compute模型, HSA architecture, GPUVM, processbetween GPU 隔离. (4)Power Management Team(power managementteam)— responsible for SMU(System Management Unit)driver, DVFS(dynamic调频调压), 电源statemanagement. interview重点: GPU 电源state(D0/D3), frequency/电压调节, thermal throttling. (5)Toolchain/Infra Team(toolchain/basics设施team)— responsible for CI system, testingframework, buildsystem, firmwaretool. interview重点: CI architecture, IGT framework, kernelbuildsystem, automatic化testingstrategy. ',
              'technologyinterviewusuallycontain: (1)basics知识 — Linux kernelbasics(memory management, processscheduling, interrupt handling, locking mechanism), C 语言深度(pointer运算, memoryalignment, volatile/const 语义, 位operate). (2)GPU driver知识 — DRM/KMS framework, amdgpu driverarchitecture, IP Block 概念, 你in Portfolio indemonstrateproject深度追问. (3)systemdesign/debugging — 给你a GPU hang  dmesg loglet你analyze根因, designa新driverfunction, analyze一段has bug kernelcode. (4)编码 — usuallyis not LeetCode 算法题, but ratherkernel风格 C code: implementationalinked listoperate, 写a ioctl handler, analyze一段hasrace conditionconditioncode. ',
              '行asinterviewuse STAR method(Situation-Task-Action-Result): (1)Situation: describe背景andchallenge; (2)Task: yourspecific任务; (3)Action: 你采取行动; (4)Result: generateresultand学to教训. commonissue: describeonce你debuggingcomplex bug 经历, 你howhandletechnology分歧, 你howlearn新technology领域. even ifyour例子is not自 GPU driver(but rather自otherdevelopment经历), demonstratesystem化思维process比specific领域更important. ',
              '薪资参考(2024-2025 年, 仅供参考, actual因level/experience/地点different而异): Markham(加拿大)— Junior/New Grad: CAD 80-100K, Mid-level (3-5 yrs): CAD 110-140K, Senior (5-10 yrs): CAD 140-180K+. on海(in国)— Junior: RMB 25-35W/年(含奖金), Mid-level: RMB 35-55W/年, Senior: RMB 55-80W/年. 美国(ifhas Remote or US position)— Junior: USD 100-130K, Mid-level: USD 130-170K, Senior: USD 170-220K+. these数字notcontain RSU(股票奖励)and年终奖金. AMD 股票激励近年价值can观. ',
            ],
            keyPoints: [
              'AMD driverteam: Display / 3D-Graphics / Compute-KFD / Power-Management / Toolchain',
              'main地点: 加拿大 Markham(core)andin国on海(快速扩张)',
              'technologyinterview: kernelbasics + GPU driver知识 + systemdesign/debugging + C 编码',
              '行asinterview: STAR method(Situation-Task-Action-Result)',
              '编码考察iskernel风格 C code, is not LeetCode 算法题',
              'canverifyopen-sourcecontribution(kernelpatch)is最has力job applicationproof',
            ],
          },
          diagram: {
            title: 'AMD GPU driverteamstructureandinterview重点矩阵',
            content: `AMD GPU driverteamstructure

┌─────────────────────────────────────────────────────────────┐
│                    AMD GPU Driver Division                    │
│                                                              │
│  Markham (Canada)                Shanghai (China)            │
│  ─────────────────               ────────────────            │
│  主力developmentteam                    快速扩张in                   │
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

interview考察重点矩阵
─────────────────

          │ C/Kernel │ DRM/KMS  │ GPU Arch │ Debugging │ Testing
──────────┼──────────┼──────────┼──────────┼───────────┼────────
Display   │  ★★★    │  ★★★★★ │  ★★★    │  ★★★★   │ ★★★
3D/GFX    │  ★★★★  │  ★★★    │  ★★★★★ │  ★★★★★ │ ★★★
Compute   │  ★★★★  │  ★★      │  ★★★★★ │  ★★★★   │ ★★★
Power Mgmt│  ★★★★  │  ★★      │  ★★★★   │  ★★★    │ ★★
Toolchain │  ★★★    │  ★★      │  ★★      │  ★★★    │ ★★★★★

★ = 考察深度 (1-5)

interviewprocess (typical)
────────────────
Round 1: Phone Screen (45 min)
  → basicstechnology + project经历
  → C 语言 + kernelbasicsissue

Round 2: Technical Deep Dive (60 min × 2)
  → twotechnology面, 分别侧重different方面
  → GPU driver知识 + systemdesign/debugging

Round 3: Behavioral (45 min)
  → STAR method, team协作, learnability

Round 4: Hiring Manager (30 min)
  → careergoal, teammatch度`,
            caption: 'differentteaminterview重点different — in准备时, according to你感兴趣teamhas针对性地深入learn. Display team重 KMS, 3D team重 GPU architecture, Compute team重 HSA/ROCm. ',
          },
          codeWalk: {
            title: 'analyzeareal AMD hiringpositionto求',
            file: 'AMD Job Posting Analysis',
            language: 'text',
            code: `# =====================================================
# real AMD hiringpositionanalyze (based on公开information, 综合multipleposition)
# position: GPU Kernel Driver Engineer
# 地点: Markham, ON, Canada / Shanghai, China
# =====================================================

# --- Job Description (原文摘to) ---
"We are looking for a GPU Kernel Driver Engineer to work
on AMD's open-source Linux GPU driver stack. You will
develop and maintain the amdgpu kernel driver, collaborate
with upstream Linux kernel community, and work closely
with hardware teams to enable new GPU features."

# --- Required Qualifications ---
# 逐条analyze你in本课程in学towhat

1. "BS/MS in Computer Science or Electrical Engineering"
   → 学历to求, 大多数positionto求本科or硕士

2. "3+ years experience in C programming"
   → 本课程allcodepracticealluse C
   → 重点: pointer, memory management, 位operate, kernel编码风格
   ✓ Module 0-11 all Code Walk and Lab

3. "Experience with Linux kernel development"
   → 本课程core内容
   ✓ Module 0: developmentenvironment搭建
   ✓ Module 10: KUnit and kselftest
   ✓ Module 11: patchcommitprocess

4. "Knowledge of GPU architecture and graphics pipeline"
   → 本课程overwrite
   ✓ Module 1: GPU hardwarearchitecture (RDNA3)
   ✓ Module 2: shaderandgraphics pipeline
   ✓ Module 3: commandhandle器and Ring Buffer

5. "Familiarity with DRM/KMS framework"
   → 本课程overwrite
   ✓ Module 4: DRM coreframework
   ✓ Module 7: KMS anddisplaymanagement

# --- Preferred Qualifications (加分项) ---

6. "Upstream Linux kernel contributions"
   → yourpatchrecord!
   ✓ Module 11: patchwork流, 你in amd-gfx commit

7. "Experience with GPU memory management (TTM, GEM)"
   ✓ Module 5: amdgpu memory management
   ✓ Module 6: TTM and Buffer Object

8. "Experience with GPU power management"
   ✓ Module 9: power managementand SMU

9. "Familiarity with GPU testing (IGT)"
   ✓ Module 10: IGT frameworkandtestingwrite

10. "Good communication skills for upstream collaboration"
    ✓ Module 11: Review 回应andmailing list沟通

# --- your优势总结 ---
#
# if你complete本课程allmodule:
# Required: overwrite 5/5 ✓
# Preferred: overwrite 5/5 ✓ (假设你alsocommitpatch)
#
# key差异化因素:
# 1. canverify amd-gfx patchcontribution
# 2. 公开 Portfolio (analyze文章 + testingcode)
# 3. 对 amdgpu driverarchitecture深入understand
#
# theseis大多数candidatenot具备 — your竞争优势`,
            annotations: [
              '大多数 AMD driverpositionto求 3+ 年 C experience — 但质量比年限更important',
              '"Linux kernel development" notto求你iskernelmaintainer — haspatchcontributionexperience足够',
              '"GPU architecture" 知识through本课程cansystem获得',
              'Preferred qualifications in每一项allis本课程amodule',
              '"Upstream contributions" is最强差异化因素 — 大多数candidateno',
              'complete本课程并haspatchrecord, 你already满足几乎allto求',
            ],
            explanation: '这份analyzedemonstrate本课程andreal AMD positionto求精确mapping. each Required and Preferred qualification allcorresponding课程inaormultiplemodule. key洞察: 大多数candidatehas C programmingexperience, 但很少has人hasrealkernelpatchcontribution — 这is你最大差异化机will. ',
          },
          miniLab: {
            title: 'simulate AMD technologyinterview',
            objective: '用本课程in学to知识, completeoncesimulate AMD GPU driverengineertechnologyinterview. ',
            steps: [
              '计时 45 分钟, independentanswerbelow 5 个interview题(not看答案)',
              '题 1(basics): explain GPU driverin Linux systemin作用, amdgpu drivermainsubsystemhaswhich? ',
              '题 2(DRM/KMS): whatis DRM Atomic Commit? explain CRTC, Plane and Connector relationship. ',
              '题 3(debugging): when你看to dmesg in出现 "[drm:amdgpu_job_timedout] *ERROR* ring gfx_0.0.0 timeout", how would youdebugging? 列出before 5 步. ',
              '题 4(编码): 手写asimple ioctl handler, receiveuser space传入 buffer addressandsize, verifyparametervalid性, 并will其mappingto GPU virtualaddress space(伪codei.e.can). ',
              '题 5(行as): use STAR methoddescribeonce你resolvecomplextechnologyissue经历. ',
              'completeafter, 回顾你in各题in表现, markneed加强领域',
              '针对薄弱领域, 回tocorresponding课程module复习',
            ],
            expectedOutput: `simulateinterview自评表:

题目                    自评        need复习module
─────────────────────   ─────       ─────────────
1. GPU driver角色          ★★★★☆     Module 0, 5
2. DRM Atomic Commit    ★★★☆☆     Module 4, 7
3. GPU Hang debugging        ★★★★☆     Module 5, 10
4. ioctl handler 编码   ★★★☆☆     Module 4, 5
5. STAR 行asinterview        ★★★★★     N/A

整体准备度: 75%
重点补强: DRM/KMS 深度 + 编码practice`,
            hint: 'interviewin最importantisdemonstrateyour思维process — even if答案not完美, 清晰analyze思路alsowill给interviewer留below好印象. not确定地方说"我not确定, 但我will这样思考...", 比沉默or瞎猜好得多. ',
          },
          debugExercise: {
            title: 'analyzeinterview编码题inrace conditioncondition',
            language: 'c',
            description: 'belowisa简化 ioctl handler, handleuser spacerequestallocation GPU buffer. interviewerlet你find其in并发securityissue. ',
            question: 'this ioctl handler haswhat并发securityissue? in多threadscenariobelowwill发生what? howfix? ',
            buggyCode: `/* 简化 GPU buffer allocation ioctl handler */
static int amdgpu_gem_create_ioctl(struct drm_device *dev,
                                    void *data,
                                    struct drm_file *filp)
{
    struct drm_amdgpu_gem_create *args = data;
    struct amdgpu_device *adev = drm_to_adev(dev);
    struct amdgpu_bo *bo;
    int ret;

    /* checkwhetherhas足够 VRAM */
    if (args->in.bo_size > adev->gmc.vram_available) {
        /* BUG: vram_available incheckandallocation之betweenmay改变 */
        return -ENOMEM;
    }

    /* allocation buffer */
    ret = amdgpu_bo_create(adev, args->in.bo_size, 0,
                            AMDGPU_GEM_DOMAIN_VRAM,
                            0, NULL, &bo);
    if (ret)
        return ret;

    /* updateavailable VRAM */
    adev->gmc.vram_available -= args->in.bo_size;
    /* BUG: 非atomic operation, twothreadmaymeanwhile读-改-写 */

    /* create GEM handle return给user space */
    ret = drm_gem_handle_create(filp, &bo->tbo.base,
                                 &args->out.handle);
    if (ret) {
        adev->gmc.vram_available += args->in.bo_size;
        amdgpu_bo_unref(&bo);
        return ret;
    }

    return 0;
}`,
            hint: '思考twothreadmeanwhilecallthis ioctl 时时序: TOCTOU(Time of Check to Time of Use)issueand非atomic read-modify-write. ',
            answer: 'two并发securityissue: (1)TOCTOU(Time-of-Check-Time-of-Use)race condition: thread A check vram_available > bo_size(condition满足), thread B in A checkafter, allocationbeforealsocheck并allocation大量 VRAM, cause A actualallocation时 VRAM alreadynot足 — 但 A 认ascheckalreadythrough. 这maycause过度allocation VRAM. fix: willcheckandallocation放in同a锁protectregion内, ornotdependency预check, let amdgpu_bo_create internalhandle ENOMEM. (2)非atomic read-modify-write: adev->gmc.vram_available -= args->in.bo_size is notatomic operation. twothreadmaymeanwhilereadsame vram_available 值, 各自减self bo_size, then写回 — wherea减法will丢失. for example: available=1000MB, A allocation 200MB, B allocation 300MB, correctresultshouldis 500MB, 但may变成 700MB or 800MB. fixplan: (a)use mutex protectentirecheck-allocation-update序列: mutex_lock(&adev->gmc.vram_lock); check → allocation → update; mutex_unlock(). (b)use atomic64_t 替代普通variable: atomic64_sub(bo_size, &adev->gmc.vram_available). (c)actual amdgpu driveruse TTM frameworkmanagement VRAM, TTM internalalreadyhandlethese并发issue — notneed手动维护 vram_available count器. interviewin最佳answer: 指出twoissue, 给出锁plan, then提toactualdriveristhrough TTM resolve. ',
          },
          interviewQ: {
            question: 'why你想add AMD 做 GPU driverdevelopment? 你对 AMD 哪个team最感兴趣? ',
            difficulty: 'easy',
            hint: 'demonstrate你对 AMD open-sourcestrategyunderstandandyourtechnology热情. 提tospecificteam(如 Display or 3D/GFX)and你感兴趣technology方向. ',
            answer: '示范answer: 我想add AMD 做 GPU driverdevelopmentbased on三个cause: (1)technologychallenge — GPU driveris我所知最complexsystem软件之一, needmeanwhileunderstandhardwarearchitecture, operatesystemkernelandapplicationlayer需求. amdgpu driver 400 万行codeinhas太多值得深入technologyissue, frommemory managementto电源optimizationtodisplay control. (2)open-source文化 — AMD isuniquecompletelyopen-source GPU driverstack厂商. this means我caninaddbeforereadcode, commitpatch, 参and社区讨论. 我alreadythrough amd-gfx mailing listcommit [specificpatch], 体验this社区technology水平and协作氛围. (3)team偏好 — 我对 3D/Graphics team最感兴趣, especially GPU virtualmemory managementandcommand submissionsubsystem. inlearn amdgpu source codeprocessin, 我by VM subsystemdesign所吸引 — GPU page tablemanagementand TLB optimization涉及system级思维is我最享受technologychallenge. 我in Portfolio in VM subsystemanalyze文章demonstrate我对this领域深入understand. ',
            amdContext: 'thisissue几乎一定willin AMD interview行as面环节by问to. keyisdemonstrate你not只is"找一份work" — 你对 GPU driverhas真正热情, moreover你already用行动proof(patch, analyze, learnrecord). 提tospecificteamindicate你做调研, is not海投resume. ',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'mastercompletekernelpatchwork流: format-patch → checkpatch → get_maintainer → send-email',
    'can写出符合kernelspecification commit message(Subject + Body + Fixes + Signed-off-by)',
    'understand Review process, can专业地回应 Review 意见并send v2 version',
    '建立公开 GPU driverengineer Portfolio(GitHub + 博客 + LinkedIn)',
    '解 AMD teamstructure(Display/3D/Compute/PM/Toolchain)and各teamtechnology重点',
    'completesimulateinterviewpractice, markneed加强领域',
    '向 amd-gfx mailing listcommitat leastapatch(even ifis typo fix)',
    '准备好 2-3 个specificproject/contributioncanininterviewindetaileddescribe',
  ],
};
