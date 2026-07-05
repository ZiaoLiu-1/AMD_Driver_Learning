// ============================================================
// AMD Linux Driver Learning Platform - Module 11 Micro-Lessons (English)
// Module 11: Career & Contribution
// 4 lessons in 2 groups, ~15 min each, total ~60 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module11MicroLessonsEn: MicroLessonModule = {
  moduleId: 'career',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 11.1: Kernel patching in action
    // ════════════════════════════════════════════════════════════
    {
      id: '11-1',
      number: '11.1',
      title: 'Kernel patching in action',
      titleEn: 'Kernel Patch Workflow in Practice',
      icon: 'Mail',
      description: 'Master the complete kernel patch submission process from git format-patch to git send-email, learn to write high-quality commit messages and respond to code reviews professionally.',
      lessons: [
        // ── Lesson 11.1.1 ──────────────────────────────────────
        {
          id: '11-1-1',
          number: '11.1.1',
          title: 'Kernel patch workflow',
          titleEn: 'Kernel Patch Workflow',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['git', 'format-patch', 'send-email', 'checkpatch', 'amd-gfx'],
          concept: {
            summary: 'Patch submissions for the Linux kernel do not use Pull Requests - instead, git format-patch generates the patch file, scripts/checkpatch.pl checks the code style, scripts/get_maintainer.pl finds the correct reviewer, and then git send-email is sent to the amd-gfx mailing list. Understanding and mastering this workflow is the threshold for becoming a kernel contributor.',
            explanation: [
              'The Linux kernel is one of the largest collaborative open source projects in the world, but it doesn\'t use GitHub/GitLab\'s Pull Request model. All patches are submitted and reviewed via email - this is the way Linus Torvalds has insisted from 2002 to the present day. For the amdgpu driver, patches are sent to the amd-gfx@lists.freedesktop.org mailing list and reviewed by AMD maintainers (Alex Deucher, Harry Wentland, etc.).',
              'git format-patch is the standard command for generating patch files. It converts your git commits into a standard email format file (.patch). Commonly used methods: git format-patch HEAD~1 generates the latest submitted patch, git format-patch -3 generates the latest 3 submitted patch series. For patch series, git format-patch will automatically add numbers ([PATCH 1/3], [PATCH 2/3], [PATCH 3/3]) and generate a cover letter.',
              'scripts/checkpatch.pl is the kernel\'s code style checking script. Before sending a patch, it should be run to check common formatting and style issues. Run as: scripts/checkpatch.pl 0001-your-patch.patch. It checks things such as indentation, spacing, and common patch-format problems. The official kernel docs still describe 80 columns as the preferred code style limit, while patch email bodies are wrapped at about 75 columns and subject summaries are typically kept within 70-75 characters. checkpatch output should be treated as a guide rather than an infallible rule engine: ERRORs usually need fixing, while some WARNINGs may be justifiable.',
              'scripts/get_maintainer.pl helps you find who to send patches to. Run as: scripts/get_maintainer.pl 0001-your-patch.patch. It analyzes the files modified by the patch and finds the corresponding maintainer and mailing list from the MAINTAINERS file. For amdgpu patches, the usual output is Alex Deucher (maintainer), amd-gfx@lists.freedesktop.org (mailing list), etc. You need to add them to the To/Cc list of git send-email.',
              'git send-email sends patch files to the mailing list via SMTP. For first time use, you need to configure the SMTP server: git config --global sendemail.smtpserver smtp.gmail.com, etc. When sending a patch series: git send-email --to amd-gfx@lists.freedesktop.org --cc alex.deucher@amd.com 0001-*.patch. After a patch is sent, maintainers and community members respond to Review comments on the mailing list. If modifications are needed, send the v2 version: git format-patch --subject-prefix="PATCH v2" HEAD~1.',
              'Patch version iteration (v2/v3...) is a common process. v2 patches should add a changelog at the end of the commit message (after the --- separator) to describe the changes from v1 to v2. The cover email should also update the changelog. Be patient and professional - most patches take 2-3 iterations before they are accepted.',
              'The b4 tool (https://b4.docs.kernel.org/) is now a widely used helper for kernel patch workflows. It can automate maintainer lookup, cover-letter preparation, thread handling, and trailer collection. Key commands include b4 prep, b4 send, and b4 trailers. However, it should be presented as an additional workflow tool rather than a universal replacement for git send-email, because official kernel submission guidance still documents email-based submission directly.',
            ],
            keyPoints: [
              'The Linux kernel submits patches through the mailing list, without using Pull Requests',
              'git format-patch generates standard patch files (.patch) and supports patch series numbers.',
              'scripts/checkpatch.pl checks code style - target 0 errors, 0 warnings',
              'scripts/get_maintainer.pl finds the correct maintainer and mailing list',
              'git send-email Send to amd-gfx@lists.freedesktop.org mailing list',
              'v2/v3 version iteration: --subject-prefix="PATCH v2", append changelog',
              'b4 is the modern (2023+) patch sending tool — automates maintainer lookup, threading, and version tracking',
            ],
          },
          diagram: {
            title: 'Complete kernel patch submission process',
            content: `Kernel patch submission complete process

Step 1: Write code & submit
─────────────────────────
$ vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c
$ make M=drivers/gpu/drm/amd -j$(nproc)     #compile
$ make W=1 M=drivers/gpu/drm/amd            #Check for additional warnings

$ git add -p                                 #Select changes to commit block by block
$ git commit -s                              #-s automatically adds Signed-off-by
  │
│ Commit message format:
  │  ┌─────────────────────────────────────────┐
  │  │ drm/amdgpu: fix VM page table update    │ ←Subject (≤75 characters)
  │  │                                         │
  │  │ The VM page table update was missing     │ ← Body (what & why)
  │  │ a TLB flush after unmapping pages,       │
  │  │ causing stale mappings that lead to      │
  │  │ GPU page faults on RDNA3 hardware.       │
  │  │                                          │
  │  │ Fixes: abc123def ("drm/amdgpu: ...")    │ ←Reference the commit that introduced the bug
  │  │ Signed-off-by: You <you@email.com>      │ ←Legal statement
  │  └─────────────────────────────────────────┘
  ▼
Step 2: Check
─────────────
$ scripts/checkpatch.pl --strict HEAD~1..HEAD
  total: 0 errors, 0 warnings, 15 lines checked    ←✓ Pass

$ scripts/get_maintainer.pl -f drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c
  Alex Deucher <alexander.deucher@amd.com> (maintainer)
  Christian König <christian.koenig@amd.com> (reviewer)
  amd-gfx@lists.freedesktop.org (list)
  dri-devel@lists.freedesktop.org (list)
  │
  ▼
Step 3: Generate patch file
─────────────────────
$ git format-patch HEAD~1
  0001-drm-amdgpu-fix-VM-page-table-update.patch
  │
  ▼
Step 4: Send
─────────────
$ git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    --cc alexander.deucher@amd.com \\
    --cc christian.koenig@amd.com \\
    0001-drm-amdgpu-fix-VM-page-table-update.patch

Mailing list: ✉️ Patch sent
  │
  ▼
Step 5: Wait for Review & Iteration
──────────────────────────
Reviewer: "Please move TLB flush before mutex unlock"
  │
  ▼
$ git commit --amend                         #Modify Submit
$ git format-patch --subject-prefix="PATCH v2" HEAD~1
$ git send-email ... \\
    --in-reply-to="<original-message-id>"    #Reply to original message thread
  ▼
  Reviewer: "Reviewed-by: Christian König <...>"  ←✓ Review passed
  Maintainer: merged into the maintainer integration branch (e.g. amd-staging-drm-next) ←✓ Merged`,
            caption: 'The complete process from code modification to patch being merged. There are corresponding commands and tools for each step. Most patches require 2-3 review iterations.',
          },
          codeWalk: {
            title: 'Complete patch submission command demonstration',
            file: 'terminal',
            language: 'bash',
            code: `#!/bin/bash
#Complete kernel patch submission workflow demonstration

# ========================================
#Step 1: Configure git send-email (only needs to be done once)
# ========================================
git config --global sendemail.smtpserver smtp.gmail.com
git config --global sendemail.smtpserverport 587
git config --global sendemail.smtpencryption tls
git config --global sendemail.smtpuser your.email@gmail.com
#Gmail requires an App Password (not an account password)

# ========================================
#Step 2: Modify the code and submit
# ========================================
cd ~/kernel-src

#Create a working branch (one-time setup first:
#   git remote add agd5f https://gitlab.freedesktop.org/agd5f/linux.git
#   git fetch agd5f amd-staging-drm-next)
git checkout -b fix/vm-tlb-flush agd5f/amd-staging-drm-next

#Edit code
vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c

#Only compile the amdgpu module and verify that the compilation passes
make M=drivers/gpu/drm/amd -j$(nproc)

#Submit (-s automatically adds Signed-off-by)
git add drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c
git commit -s
#Write commit message in the editor:
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
#Step 3: Check patch quality
# ========================================
#Code style check
scripts/checkpatch.pl --strict -g HEAD~1..HEAD
#Goal: total: 0 errors, 0 warnings

#Find the maintainer (get_maintainer takes a patch file, not a commit range)
git format-patch -1 -o /tmp/p
scripts/get_maintainer.pl /tmp/p/0001-*.patch
#Output:
#   Alex Deucher <alexander.deucher@amd.com>
#   Christian König <christian.koenig@amd.com>
#   amd-gfx@lists.freedesktop.org

# ========================================
#Step 4: Generate patch file
# ========================================
#single patch
git format-patch HEAD~1
# → 0001-drm-amdgpu-flush-TLB-after-VM-page-table-unmap.patch

#Patch series (multiple commits)
git format-patch --cover-letter HEAD~3
#→ 0000-cover-letter.patch (needs editing)
# → 0001-first-change.patch
# → 0002-second-change.patch
# → 0003-third-change.patch

# ========================================
#Step 5: Send patch
# ========================================
git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    --cc alexander.deucher@amd.com \\
    --cc christian.koenig@amd.com \\
    --cc dri-devel@lists.freedesktop.org \\
    0001-drm-amdgpu-flush-TLB-after-VM-page-table-unmap.patch

# ========================================
#Step 6: v2 iteration (modify after review)
# ========================================
#Modify the code based on Review comments
vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c
git add -u && git commit --amend
#Add changelog after the --- delimiter of the commit message:
#   ---
#   v2: Move TLB flush before mutex_unlock (Christian)

git format-patch --subject-prefix="PATCH v2" HEAD~1
git send-email \\
    --in-reply-to="<message-id-of-v1>" \\
    --to amd-gfx@lists.freedesktop.org \\
    --cc alexander.deucher@amd.com \\
    0001-drm-amdgpu-flush-TLB-after-VM-page-table-unmap.patch`,
            annotations: [
              'git config sendemail.* Configure only once, Gmail requires creating App Password in security settings',
              'git commit -s automatically adds the Signed-off-by line - this is a legal requirement for kernel patches (DCO statement)',
              'scripts/checkpatch.pl --strict enables stricter checks, including certain WARNING level recommendations',
              'scripts/get_maintainer.pl takes a patch file or -f <file> (no commit ranges) — run git format-patch first, then point it at the .patch',
              '--in-reply-to Put the v2 patch into the v1 email thread to facilitate Reviewer tracking',
              'v2 changelog is written after the --- delimiter so that git am will automatically ignore it when applying the patch.',
            ],
            explanation: 'This set of commands is a must for every kernel contributor. It is recommended that you practice this process on a small modification first (such as fixing a typo or improving a comment), and then commit to substantive code modifications after you are familiar with each step. Review quality and turnaround time vary by subsystem and maintainer workload, so the durable advice is to send a small, well-tested patch and follow the documented process carefully.',
          },
          miniLab: {
            title: 'Completely go through the patch submission process',
            objective: 'Go through a complete patch preparation process in your local kernel repository (no need to actually send emails) and become familiar with each command.',
            steps: [
              'Enter the kernel source code: cd ~/kernel-src && git checkout -b practice/first-patch',
              'Make a small change - fix a typo or improve the wording in a comment in drivers/gpu/drm/amd/amdgpu/amdgpu_drv.c',
              'Submit: git add -p && git commit -s (write a standardized commit message)',
              'Run checkpatch: scripts/checkpatch.pl --strict -g HEAD~1..HEAD (ensure 0 errors)',
              'Generate patch file: git format-patch HEAD~1 (view the contents of the generated .patch file)',
              'Run get_maintainer: scripts/get_maintainer.pl 0001-*.patch (see maintainer list)',
              'Use git send-email --dry-run to simulate sending (it will not actually send an email): git send-email --dry-run --to test@example.com 0001-*.patch',
              'Clean up the practice branch: git checkout main && git branch -D practice/first-patch',
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
            hint: 'If git send-email reports an error "send-email is not a git command", install it: sudo apt install git-email. --dry-run mode is completely safe and no email will be sent.',
          },
          debugExercise: {
            title: 'Identify issues in the patch submission process',
            language: 'bash',
            description: 'The following is a command sequence used by a developer to submit a patch, but there are many problems in it. Find any errors.',
            question: 'What are the issues with this patch submission process? Why might a patch be rejected by the maintainer?',
            buggyCode: `#Developer's bug submission process

#1. Modify directly on the main branch
git checkout <maintainer-branch>
vim drivers/gpu/drm/amd/amdgpu/amdgpu_vm.c

#2. Submit (without -s flag)
git add .
git commit -m "fixed bug"

#3. Skip checkpatch
#"I know my code is correct anyway"

#4. Generate patches
git format-patch HEAD~1

#5. Only send to mailing list, not Cc maintainers
git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    0001-fixed-bug.patch

#6. v2 does not reply to the original thread
git commit --amend -m "fixed bug v2"
git format-patch HEAD~1
git send-email \\
    --to amd-gfx@lists.freedesktop.org \\
    0001-fixed-bug-v2.patch`,
            hint: 'Check every step: branch management, commit message format, code inspection, recipient list, version iteration method.',
            answer: 'Six problems: (1) Modify directly on the master branch - a working branch should be created (git checkout -b fix/vm-bug). Submitting directly on the master branch tracking the remote will mess up the local branch status. (2) git add . All files are added - they may accidentally contain irrelevant modifications and should be selected block by block with git add -p. git commit -m "fixed bug" lacks the -s flag (no Signed-off-by), and the commit message does not conform to the specification: the "drm/amdgpu:" prefix is ​​missing, the Subject is too short and not descriptive enough, and there is no Body to explain what and why. (3) Skip checkpatch - the maintainer will point out code style issues in the Review and ask for resubmission, wasting both parties\' time. Should always be run before sending. (4) There is no problem with git format-patch itself, but because the commit message is in the wrong format, the generated patch file name is also meaningless. (5) No Cc maintainer - just send to the mailing list, the maintainer may not notice. Maintainers must be found using get_maintainer.pl and --cc them. (6) v2 does not use --subject-prefix="PATCH v2", does not use --in-reply-to to reply to the original thread, the commit message is still not standardized, and the changelog of v1→v2 is not added. See the example in Step 6 for the correct approach.',
          },
          interviewQ: {
            question: 'Describe your complete process for submitting patches to the Linux kernel. How will you ensure patch quality?',
            difficulty: 'medium',
            hint: 'From code modification to final merging, including checkpatch, get_maintainer, format-patch, send-email, and Review iterations.',
            answer: 'Complete process: (1) Preparation: Create a working branch based on the kernel branch you are actually targeting, such as mainline, drm-tip/drm-next context, or the relevant maintainer integration branch. (2) Code modification: Edit the code, make M=drivers/gpu/drm/amd, compile and verify that there are no warnings, and run the relevant IGT test to confirm that the function is correct and there are no regressions. (3) Submit: git add -p reviews the modifications to be submitted block by block (to avoid accidentally including irrelevant changes), git commit -s submits and adds Signed-off-by. Commit message uses the standard format: Subject "drm/amdgpu: <concise description>", the Body explains what and why (not how), and adds Fixes: tags if necessary. (4) Quality check: scripts/checkpatch.pl --strict should be treated as a strong preflight check; scripts/get_maintainer.pl finds the correct maintainer. (5) Send: git format-patch generates the patch, git send-email sends it to the amd-gfx mailing list, Cc all people listed by get_maintainer. (6) Review iteration: Carefully read each review opinion, modify the code and send v2 (use --subject-prefix and --in-reply-to), and explain the changes of each version in the changelog. (7) Waiting for merging: the maintainer may add Reviewed-by/Acked-by tags and merge the patch into the relevant integration tree before it eventually flows toward Linux mainline. The key to quality assurance: do not skip checkpatch, write clearly what/why in the commit message, and test on real hardware before sending each time.',
            amdContext: 'In an AMD interview, if you can say "I have submitted a patch to the amd-gfx mailing list" and show specific commits, this is more convincing than any interview answer. Even a small typo fix demonstrates your familiarity with the process.',
          },
        },

        // ── Lesson 11.1.2 ──────────────────────────────────────
        {
          id: '11-1-2',
          number: '11.1.2',
          title: 'Write the Commit Message and respond to the Review',
          titleEn: 'Writing Good Commit Messages & Responding to Reviews',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['commit-message', 'code-review', 'Signed-off-by', 'Fixes-tag', 'etiquette'],
          concept: {
            summary: 'The quality of commit messages and professional responses to reviews are the most important soft skills for kernel developers. A good commit message explains "what & why" (not how), follows the Subject format of "drm/amdgpu: ...", and uses Fixes/Signed-off-by/Reviewed-by tags correctly. When responding to Reviews, respond point by point and provide technical arguments for controversial opinions.',
            explanation: [
              'The Commit message is the first impression your patch gives to the world. Kernel maintainers read dozens or even hundreds of patches every day - a vague commit message (such as "fix bug") will be ignored or required to be rewritten. A good commit message lets reviewers understand what you are doing and why before they even read the code. When the maintainer 5 years later sees your code through git blame, the commit message is his only clue to understand the purpose of this code.',
              'Subject line format: Start with the subsystem prefix, such as "drm/amdgpu: fix VM page fault on TLB invalidation". For different modules of the amdgpu driver, the prefixes are subdivided: "drm/amdgpu: " (general), "drm/amd/display: " (display/DC module), "drm/amd/pm: " (power management), "drm/amdkfd: " (KFD/compute). Subject should not exceed 75 characters (the display width of git log --oneline), start with lowercase (fix instead of Fix), and do not add a period. Use imperative verbs (fix, add, remove, refactor instead of fixed, adds).',
              'The Body section explains two things: What (what was modified, what problems were observed) and Why (why this modification is needed, what is the root cause). Don\'t explain how (how the code was changed - Reviewer will know by looking at the diff). Exception: If the modification involves unintuitive algorithmic or hardware behavior, a brief explanation of the How can be provided. Each line of Body should not exceed 75 characters, and paragraphs should be separated by blank lines.',
              'Fixes: Tag format: Fixes: <12-bit commit hash> ("Subject of the original commit"). This label tells maintainers and automated tools which commit introduced your patch to fix the bug. It is used by stable kernel maintainers to determine whether your fix needs to be backported to the stable branch. Generation method: git log --oneline | grep "keywords that introduce bugs", find the commit, and then git log --format="Fixes: %h ("%s")" -1 <commit-hash>.',
              'Signed-off-by is a Developer Certificate of Origin (DCO) statement - your signature indicates that you wrote this code (or that you have the right to submit it) and agree to release it under the GPL license. Each contributor must be added. Reviewed-by means someone reviewed the code and thought it could be merged. Acked-by means someone (usually a subsystem maintainer) agrees with the patch, but may not have done a detailed code review. Tested-by means someone tested the patch on real hardware. These tags are arranged chronologically at the end of the commit message.',
              'Professional attitude in responding to Reviews: Reply to each opinion point by point (even if you disagree with it); provide data and arguments (such as performance test results, hardware specifications) when there is a technical dispute; implement the modifications you accept in the next version and confirm them in Reply; always remain polite - the kernel community values ​​the constructiveness of technical discussions. Don\'t think of review comments as personal attacks; they are part of the process of making the code better.',
            ],
            keyPoints: [
              'Subject: "drm/amdgpu: <imperative verb> <concise description>", ≤75 characters',
              'Body: Explanation of What & Why (not How), ≤75 characters per line',
              'Fixes: tags refer to commits that introduce bugs to help make stable backport decisions',
              'Signed-off-by: DCO statement (required); Reviewed-by/Acked-by/Tested-by: Review tag',
              'Response Review: Reply point by point, provide arguments for technical disputes, and maintain a constructive attitude',
              'v2 changelog is written after the --- delimiter, describing each version change and the person who made the suggestion',
            ],
          },
          diagram: {
            title: 'Anatomy of Commit Message: Good vs. Bad',
            content: `Commit Message comparison

Bad Commit Message
──────────────────────
fix bug

Signed-off-by: dev@email.com

question:
├─ Subject has no subsystem prefix
├─ "fix bug" is not descriptive at all
├─ No Body to explain the problem and reasons
├─ No Fixes: tag
└─ I saw this commit 5 years later and I don't know what it fixed.


OK Commit Message
──────────────────────
drm/amdgpu: fix page fault on VM unmap due to missing TLB flush
                │                        │
│ └─ Briefly describe the problem
└─ Subsystem prefix

When unmapping pages from GPU virtual address space, the TLB
(Translation Lookaside Buffer) was not invalidated before
releasing the physical pages. This caused subsequent GPU memory
accesses to hit stale page table entries, triggering:
                                                │
  [drm:amdgpu_vm_bo_update] *ERROR* VM fault    │ ←What: observed phenomenon
  src_id:0 ring:0 vmid:3 addr:0x800100000       │

The root cause is commit a1b2c3d4e5f6 which refactored the     │
unmap path but accidentally removed the amdgpu_vm_flush() call.  │ ←Why: root cause
The fix adds back the TLB invalidation between the PTE clear    │
and the page release, matching the sequence in the map path.    │

Tested on RX 7600 XT (gfx1102) with the IGT amd_vm suite.    ←Test information

Fixes: a1b2c3d4e5f6 ("drm/amdgpu: refactor VM unmap path")     ←Fixes Tag
Signed-off-by: Your Name <your@email.com>                        ←DCO signature
---                                                              ←delimiter
v2: Move TLB flush before mutex_unlock per Christian's review    ← v2 changelog
v1: https://lore.kernel.org/amd-gfx/original-message-id/        ←v1 link

Review tags are added by the maintainer when merging:
Reviewed-by: Christian König <christian.koenig@amd.com>
Acked-by: Alex Deucher <alexander.deucher@amd.com>`,
            caption: 'A good commit message allows Reviewers to understand the problem and solution before looking at the code. The Fixes tag helps with the stable backport, and the changelog helps track iterations.',
          },
          codeWalk: {
            title: 'Sample dialogue for Review response',
            file: 'amd-gfx mailing list thread',
            language: 'text',
            code: `#This is a fictional but typical amd-gfx Review conversation

# ═══════════════════════════════════════════════
#v1: your original patch
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
#Review 1: Christian König (Senior Reviewer)
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
#Your response (professional, specific, thanks for the suggestion)
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
#v2: Modified according to Review opinions
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
#Review 2: Passed!
# ═══════════════════════════════════════════════
From: Christian König <christian.koenig@amd.com>
Reviewed-by: Christian König <christian.koenig@amd.com>`,
            annotations: [
              'The commit message of v1 clearly explains the problem (use-after-free), the cause (concurrent eviction) and the solution (reference counting)',
              'Reviewers pointed out two improvements: use of DRM core API and error path handling - this is typical of high-quality reviews',
              'Your response addresses each comment point by point, agrees with the API suggestion, and provides specific fixes for the error path',
              'The v2 changelog records each change and the name of the proposer - this is courtesy of the kernel community',
              'The Reviewed-by tag is given by the Reviewer in the reply, not added by you yourself',
              'The entire process may span 2-3 days - patience is a kernel developer virtue',
            ],
            explanation: 'This conversation shows the ideal model of kernel review: the reviewer points out specific technical issues (not personal attacks), the developers respond seriously and modify them (not excuse or ignore), and finally reach a technical consensus. Note the way to thank Reviewers in the v2 changelog - write their names in parentheses. This professional communication skill is just as important as your technical skills.',
          },
          miniLab: {
            title: 'Practice writing Commit Message and simulate Review',
            objective: 'Practice writing a high-quality commit message for a hypothetical bug fix, and practice responding to review comments.',
            steps: [
              'Scenario: You fix a bug in amdgpu_gmc.c - the VRAM size reported is 256MB less than the actual size because the size of the firmware reserved area is not included.',
              'Write out the complete commit message (Subject + Body + Fixes + Signed-off-by) and save it to ~/practice_commit_msg.txt',
              'Self-Review: Check whether the Subject is ≤75 characters, whether it starts with "drm/amdgpu:", and whether the Body explains What and Why',
              'Simulation Review Comment: "When calculating the VRAM size, you need to take into account the different sizes of the firmware reserved area in the SR-IOV environment."',
              'Write your reply to this Review',
              'Write the commit message of v2 (including changelog)',
              'Compare your commit message to the "good example" in the chart above - what\'s the gap?',
            ],
            expectedOutput: `#Reference answer (yours may be different, the key is format and content quality)

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
            hint: 'Characteristics of a good commit message: An outsider (who doesn\'t know your code changes) will know what happened and why it needs to be fixed after reading the Subject and Body.',
          },
          debugExercise: {
            title: 'Fix wrong Commit Message',
            language: 'text',
            description: 'The following commit message has many issues that do not comply with the kernel specifications. Find any problems and correct them.',
            question: 'What are the format and content issues with this commit message? Rewrite a correct version.',
            buggyCode: `Fix the SDMA bug that was causing issues on the new GPU.

I changed the register offset from 0x1234 to 0x1238 because the
old one was wrong. Also fixed a typo in the comment nearby.

Signed-off-by: developer <dev@company.com>
Fixes: some old commit`,
            hint: 'Check the Subject format (prefix, case, length), Body content (what vs how), Fixes tag format, and whether two different modifications should be placed in the same patch.',
            answer: 'Problem list: (1) Subject is missing subsystem prefix - it should be "drm/amdgpu: fix SDMA register offset for ...". (2) Subject starts with a capital letter - "fix" should be lowercase. (3) Subject is too general - "bug that was causing issues" does not describe the specific problem. (4) Body explained How ("changed the register offset from 0x1234 to 0x1238") rather than Why - it should explain the evidence for the change, such as the relevant hardware-generation difference, driver regression, or code path that proves the old value is wrong. (5) The Fixes tag format is completely wrong - it should be Fixes: <12-bit hash> ("original Subject"), not "some old commit". (6) Put two different modifications (register fix + typo fix) in the same patch - the kernel specification requires that each patch only do one thing (One logical change per patch). Should be split into two separate patches. Correct version: Subject: drm/amdgpu: fix SDMA doorbell offset on RDNA3. Body: "The SDMA doorbell register offset used by this path is incorrect for the target RDNA3 hardware and can lead to SDMA ring timeouts. Use the RDNA3-specific value and leave the nearby typo cleanup as a separate patch." + independent typo fix.',
          },
          interviewQ: {
            question: 'What information should a kernel commit message contain? Explain the meaning of the Signed-off-by, Reviewed-by, and Fixes tags.',
            difficulty: 'easy',
            hint: 'Answer from the perspective of Subject format, Body What/Why, and the legal and technical meaning of each tag.',
            answer: 'Commit message structure: (1) Subject line: Start with the subsystem prefix (such as "drm/amdgpu:"), use an imperative sentence to briefly describe the modification (≤75 characters), start with a lowercase letter, and do not add a period. (2) Blank line. (3) Body: Explain in detail What (what was modified, what problems were observed) and Why (why this modification is needed, what is the root cause). No explanation of the How - the diff already shows the code modification. ≤75 characters per line. (4) Tag area: Fixes: <hash> ("subject") - refers to the original commit that introduced the bug, and is used by stable maintainers to determine whether backport to the stable branch is needed. This tag is automatically generated using the git log format. Signed-off-by: Name <email> — Developer Certificate of Origin (DCO) statement. The signer declares that he or she wrote the code (or has the right to submit it) and agrees to release it under the kernel\'s open source license. Each contributor must be added. Reviewed-by: Name <email> — Someone reviewed the code and thought it could be merged. Stronger than Acked-by - means the Reviewer checked the code line by line. Acked-by: Name <email> — Someone agrees with the direction of the change, but may not have done a detailed code review. Usually given by the subsystem maintainer. Tested-by: Name <email> — Someone tested the patch on real hardware and confirmed that it solved the problem and introduced no regressions.',
            amdContext: 'This question is a basic question in AMD interviews - if you are not familiar with the commit message format, the interviewer will question whether you have any experience in kernel development. But conversely, if you can answer fluently and give examples of patches you submitted, this will be a strong bonus.',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 11.2: Career Development
    // ════════════════════════════════════════════════════════════
    {
      id: '11-2',
      number: '11.2',
      title: 'career development',
      titleEn: 'Career Development',
      icon: 'Rocket',
      description: 'Turn the skills and projects you develop in this course into a career advantage—build a compelling engineering portfolio and gain insight into AMD\'s team structure and interview process.',
      lessons: [
        // ── Lesson 11.2.1 ──────────────────────────────────────
        {
          id: '11-2-1',
          number: '11.2.1',
          title: 'Build your AMD Engineer Portfolio',
          titleEn: 'Building Your AMD Engineer Portfolio',
          duration: 15,
          difficulty: 'beginner',
          tags: ['portfolio', 'GitHub', 'blog', 'LinkedIn', 'career'],
          concept: {
            summary: 'A carefully constructed portfolio is a public proof of your technical ability - for the niche field of GPU driver, a portfolio that includes kernel patches, driver analysis articles, IGT test cases and completion records of this learning platform is more convincing than any resume description. This section teaches you how to build a portfolio that will impress AMD hiring managers.',
            explanation: [
              'GPU driver development is a highly specialized field, so hiring managers tend to place a premium on verifiable technical ability. A public portfolio allows them to directly see your code quality, depth of technical understanding, and learning ability without having to rely only on verbal descriptions in interviews.',
              'The core content of the portfolio should include: (1) Kernel patch records - links to your patches on the amd-gfx mailing list (even typo fixes demonstrate your familiarity with the patching process). Use lore.kernel.org to search your email address to find all public patches. (2) amdgpu source code analysis - select a subsystem of the driver (such as VM management, GFX ring, power management) and write an in-depth analysis article to show your understanding of the code. (3) IGT test case - the test code you wrote for amdgpu, showing your testing thinking and C programming capabilities. (4) Completion records of this learning platform - study notes and lab completion status of all modules.',
              'Technical blogs are the best way to demonstrate deep understanding. Recommended blogging platforms: GitHub Pages (free, tied to your GitHub), personal domain blog (more professional), or Medium/Zhihu (if you target a Chinese audience). The structure of the blog post: problem description → related background → source code analysis (with code snippets and comments) → experimental verification → summary. A high-quality amdgpu source code analysis article may be more valuable than 10 ordinary technical articles.',
              'LinkedIn optimization: Headline directly writes the target position (such as "GPU Driver Engineer | Linux Kernel | AMD amdgpu"); Summary highlights your kernel contributions and driver knowledge; Experience lists your open source contributions (even in the learning stage). Use keywords to make yourself searchable by AMD recruiters: Linux kernel, DRM, amdgpu, GPU driver, Mesa, VRAM management, KMS, etc.',
              'GitHub repository organization: Create a dedicated "gpu-driver-portfolio" repository, including README (overview of your skills and projects), patches/ (copies of kernel patches you submitted), analysis/ (source code analysis articles), tests/ (IGT tests you wrote), notes/ (study notes). The README is the most important part of this repository – it\'s the hiring manager\'s first impression.',
            ],
            keyPoints: [
              'A portfolio is more persuasive than a resume description - the GPU driver field values ​​verifiable technical abilities',
              'Core content: kernel patch + amdgpu source code analysis + IGT test + learning record',
              'Technology Blog: Select a subsystem of amdgpu for in-depth analysis, the quality of one article > the quantity of ten articles',
              'LinkedIn Optimization: Headline includes targeted keywords so AMD recruiters can search for you',
              'Structure your GitHub repository deliberately — the README is the first impression',
              'Search lore.kernel.org for your email address (?q=f:you@mail.com) to list all your public mailing-list contributions',
            ],
          },
          diagram: {
            title: 'The ideal portfolio structure for GPU driver engineers',
            content: `Portfolio content architecture

GitHub: github.com/yourname
├── gpu-driver-portfolio/ ★ Main Portfolio repository
│   ├── README.md                   ←Overview, skill summary, link index
│   ├── patches/                    ←A copy of your kernel patch
│   │   ├── 0001-fix-vm-tlb.patch
│   │   └── 0002-add-igt-test.patch
│   ├── analysis/                   ←In-depth source code analysis
│   │   ├── amdgpu-vm-subsystem.md  ←"Amdgpu VM subsystem source code analysis"
│   │   └── gfx-ring-buffer.md     ←"How GFX Ring Buffer works"
│   ├── tests/                      ←Test code you wrote
│   │   └── amd_vram_stress.c      ←IGT VRAM stress test
│   └── learning-notes/             ←Module study notes
│       ├── module05-amdgpu-init.md
│       └── module07-display.md
│
├── linux/ (fork)                   ←Linux kernel fork
│ └── (your patch branch) contains your code changes
│
└── igt-gpu-tools/ (fork)           ← IGT fork
└── (your test branch) contains the tests you wrote

Blog (blog.yourname.com or GitHub Pages)
├── "A Deep Dive into the amdgpu VM Subsystem: From Page Tables to TLB"
├── "Use ftrace to track the complete process of a GPU Hang"
├── "My first kernel patch: from typo to Reviewed-by"
└── "RDNA3 GFX Ring Buffer Complete Guide"

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

Mailing list records (publicly verifiable)
lore.kernel.org/amd-gfx/?q=your@email.com
├── [PATCH] drm/amdgpu: fix comment typo
├── [PATCH v2] drm/amdgpu: add IGT VRAM stress test
└── (Each patch is a public proof of your ability)`,
            caption: 'Each component of the portfolio demonstrates your capabilities from a different perspective: patches demonstrate process proficiency, analysis demonstrates depth of understanding, tests demonstrate quality awareness, and blogs demonstrate communication skills.',
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

- Example: A deep dive into the amdgpu VM subsystem: from page tables to TLB (replace with your real blog link)
- Example: My journey to my first kernel patch (replace with your real blog link)

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
              'Start your README by stating directly who you are and what you do – hiring managers have limited time',
              'Kernel patch form with link to lore.kernel.org - allows anyone to verify your contribution',
              'Source code analysis selects specific subsystems - demonstrating deep understanding rather than just scratching the surface',
              'IGT testing demonstrates your quality awareness - not just writing code, but knowing how to test it',
              'Use keywords in the Skills section - help ATS (Applicant Tracking System) match your resume',
              'Blog links demonstrate your communication skills - being able to explain complex technologies clearly',
            ],
            explanation: 'This README template is the "home page" of your portfolio. Hiring managers usually only spend 30 seconds browsing a GitHub Profile - your README needs to show him within these 30 seconds: you have kernel patching experience, you understand the driver internal implementation, and you have the ability to test. Each link leads to content that can be verified in depth.',
          },
          miniLab: {
            title: 'Start building your portfolio',
            objective: 'Create the infrastructure for a portfolio repository and complete the first section - a summary of what you learned in this course.',
            steps: [
              'Create a repository on GitHub: gpu-driver-portfolio (Public, with README)',
              'Clone to local: git clone https://github.com/<yourname>/gpu-driver-portfolio.git',
              'Create the directory structure: mkdir -p patches analysis tests learning-notes',
              'Edit README.md - refer to the template above and fill in your real information (even if the patch list is temporarily empty)',
              'Write your first study note: Create a summary of the module you are most interested in under learning-notes/',
              'If you have already written IGT tests (Module 10), copy the code into the tests/ directory',
              'Commit and push: git add . && git commit -m "Initial portfolio structure" && git push',
              'Add a link to your portfolio repository in the Featured section of LinkedIn',
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
            hint: 'Don\'t wait until your portfolio is "perfect" before launching it – create the infrastructure first and then add content as you learn. A portfolio with a real learning trajectory is more valuable than one that is well packaged but empty.',
          },
          debugExercise: {
            title: 'Evaluate a GPU Driver Engineer Resume',
            language: 'text',
            description: 'The following is a summary of a resume applying for an AMD GPU driver position. Find out its strengths and weaknesses and make suggestions for improvements.',
            question: 'What is good about this resume and what needs improvement? How do you make it more attractive to AMD hiring managers?',
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
            hint: 'Look at it from the AMD hiring manager\'s perspective – what is he looking for? Kernel experience? Driving knowledge? Verifiable contribution? Does this resume answer these questions?',
            answer: 'Advantages: (1) 3 years of experience in C/C++ - the basic language for GPU drivers. (2) Have experience in OpenGL application development - indicating that you have been exposed to the graphics field. Disadvantages and improvements: (1) Summary is too general - "Familiar with Linux and open source" does not differentiate between GPU driver positions. Improvement: Explicitly mention keywords such as GPU driver, kernel module, and DRM. (2) "Familiar with GPU concepts" is too vague - what concept? VRAM management? Order submission? Shader compilation? Improvement: List specific technical knowledge points. (3) "Interested in kernel development" is a fatal flaw - for GPU driver positions, "interested" is not enough. Improvement: Show actions - read amdgpu source code (which modules), submitted patches (link), and wrote analysis articles (link). (4) The Skills list contains irrelevant technologies (Java, Flutter, Docker, AWS) - diluting core competencies. Improvement: Highlight related skills: C (kernel), DRM/KMS, amdgpu, IGT, ftrace, libdrm. (5) Projects are completely irrelevant to the position - React website and Todo app cannot demonstrate any driver development capabilities. Improvement: Replaced with GPU driver related projects: amdgpu source code analysis, IGT test cases, kernel patches.',
          },
          interviewQ: {
            question: 'What projects or contributions have you done related to GPU drivers? Please describe it in detail.',
            difficulty: 'easy',
            hint: 'Prepare 2-3 concrete examples: a kernel patch (demonstrates code prowess), a source code analysis (demonstrates depth of understanding), and a test project (demonstrates quality awareness).',
            answer: 'Model answers (based on the learning content of this course): (1) Kernel patch contribution: I submitted [specific patch] to the amd-gfx mailing list to fix [specific issue] in the amdgpu driver. The patch went through review in the normal kernel workflow, and I learned the patch submission process (checkpatch, format-patch, send-email) and professional review response methods. (2) In-depth analysis of amdgpu source code: I conducted an in-depth analysis of the VM subsystem of amdgpu, from amdgpu_vm_init to the complete process of GPU page table update. I wrote the analysis results into a technical blog article, with source code references and execution flow charts. This helped me understand the core differences between GPU virtual memory management and CPU. (3) IGT test writing: I wrote a VRAM allocation stress test (amd_vram_stress.c) for amdgpu, which contains positive tests (allocations of various sizes) and negative tests (invalid parameter processing), as well as 1000 allocation/release stress tests to detect memory leaks. This test has been submitted to the IGT repository. Every example has a public link to verify it – a core value of my portfolio.',
            amdContext: 'In an AMD interview, "specific description" means that the interviewer expects to hear specific code, specific files, and specific questions-not a general "I have learned drivers." Be prepared to have your GitHub demo code open on your screen at any time.',
          },
        },

        // ── Lesson 11.2.2 ──────────────────────────────────────
        {
          id: '11-2-2',
          number: '11.2.2',
          title: 'AMD interview preparation',
          titleEn: 'AMD Interview Preparation',
          duration: 15,
          difficulty: 'beginner',
          tags: ['AMD', 'interview', 'career', 'STAR', 'salary'],
          concept: {
            summary: 'AMD GPU driver interviews generally combine technical depth with behavioral evaluation. Different subdomains such as display, graphics, compute, power management, or infrastructure tend to emphasize different topics. This section should be treated as directional preparation guidance rather than a source of official organizational or compensation facts.',
            explanation: [
              'AMD has public engineering presence in multiple locations, but specific team distribution, org structure, and ownership boundaries change over time and should not be presented as fixed facts unless confirmed from current public job postings or official organizational material.',
              'A safer way to think about interview preparation is by technical domain rather than exact team charts: display-oriented roles emphasize DRM/KMS, atomic modesetting, and display pipelines; graphics roles emphasize command submission, scheduling, and memory management; compute roles emphasize KFD, HSA, GPUVM, and ROCm concepts; power-management roles emphasize SMU, DVFS, and thermal or power states; infrastructure roles emphasize CI, testing, build systems, and automation.',
              'Technical interviews usually include: (1) Basic knowledge - Linux kernel basics (memory management, process scheduling, interrupt handling, locking mechanism), C language depth (pointer operations, memory alignment, volatile/const semantics, bit operations). (2) GPU driver knowledge - DRM/KMS framework, amdgpu driver architecture, IP Block concept, in-depth questioning of the projects you display in your portfolio. (3) System design/debugging - Give you a GPU hang dmesg log to allow you to analyze the root cause, design a new driver function, and analyze a buggy kernel code. (4) Coding - usually not LeetCode algorithm questions, but kernel-style C code: implementing a linked list operation, writing an ioctl handler, and analyzing a piece of code with race conditions.',
              'Behavioral interviews use the STAR method (Situation-Task-Action-Result): (1) Situation: describe the background and challenges; (2) Task: your specific task; (3) Action: the action you took; (4) Result: the results produced and lessons learned. Frequently Asked Questions: Describe a time when you debugged a complex bug, how you handled technical differences, and how you learned about new technology areas. Even if your examples don\'t come from GPU drivers (but from other development experiences), it\'s more important to demonstrate a systematic thought process than a specific domain.',
              'Compensation, office scope, and interview loops are highly time-sensitive and location-specific. Any salary or team-structure guidance should come from current public job postings, recruiter conversations, and reputable compensation datasets rather than being treated as durable technical content.',
            ],
            keyPoints: [
              'AMD driver work commonly spans display, graphics, compute, power-management, and infrastructure/testing domains',
              'Exact locations and reporting structures should be verified from current public postings rather than treated as static facts',
              'Technical interview: Kernel basics + GPU driver knowledge + system design/debugging + C coding',
              'Behavioral Interviewing: STAR Method (Situation-Task-Action-Result)',
              'The coding test is kernel-style C code, not LeetCode algorithm questions',
              'Verifiable open source contributions (kernel patches) are the most powerful proof of employment',
            ],
          },
          diagram: {
            title: 'AMD GPU driver team structure (illustrative) and interview focus matrix',
            content: `AMD GPU driver team structure (illustrative — not an official org chart; verify against current public job postings)

┌─────────────────────────────────────────────────────────────┐
│                    AMD GPU Driver Division                    │
│                                                              │
│  Markham (Canada)                Shanghai (China)            │
│  ─────────────────               ────────────────            │
│  One of several major dev hubs   One of several major hubs   │
│  Many upstream maintainers here  Display & Compute focus     │
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

Interview focus matrix
─────────────────

          │ C/Kernel │ DRM/KMS  │ GPU Arch │ Debugging │ Testing
──────────┼──────────┼──────────┼──────────┼───────────┼────────
Display   │  ★★★    │  ★★★★★ │  ★★★    │  ★★★★   │ ★★★
3D/GFX    │  ★★★★  │  ★★★    │  ★★★★★ │  ★★★★★ │ ★★★
Compute   │  ★★★★  │  ★★      │  ★★★★★ │  ★★★★   │ ★★★
Power Mgmt│  ★★★★  │  ★★      │  ★★★★   │  ★★★    │ ★★
Toolchain │  ★★★    │  ★★      │  ★★      │  ★★★    │ ★★★★★

★ = Depth of investigation (1-5)

Interview process (typical)
────────────────
Round 1: Phone Screen (45 min)
→ Basic technology + project experience
→ C language + kernel basic issues

Round 2: Technical Deep Dive (60 min × 2)
→ Two technical aspects, each focusing on different aspects
→ GPU driver knowledge + system design/debugging

Round 3: Behavioral (45 min)
→ STAR method, teamwork, learning ability

Round 4: Hiring Manager (30 min)
→ Career goals, team fit`,
            caption: 'Different teams have different interview priorities - when preparing, study in depth based on the team you are interested in. The Display team focuses on KMS, the 3D team focuses on GPU architecture, and the Compute team focuses on HSA/ROCm.',
          },
          codeWalk: {
            title: 'Analyze a real AMD recruitment job requirement',
            file: 'AMD Job Posting Analysis',
            language: 'text',
            code: `# =====================================================
#Analysis of real AMD recruitment positions (based on public information, integrating multiple positions)
#Position: GPU Kernel Driver Engineer
#Location: Markham, ON, Canada / Shanghai, China
# =====================================================

#--- Job Description (original summary) ---
"We are looking for a GPU Kernel Driver Engineer to work
on AMD's open-source Linux GPU driver stack. You will
develop and maintain the amdgpu kernel driver, collaborate
with upstream Linux kernel community, and work closely
with hardware teams to enable new GPU features."

# --- Required Qualifications ---
#A point-by-point analysis of what you learned in this course

1. "BS/MS in Computer Science or Electrical Engineering"
→ Education requirements, most positions require a bachelor's or master's degree

2. "3+ years experience in C programming"
→ All coding exercises in this course are in C
→ Focus: pointers, memory management, bit operations, kernel coding style
✓ All Code Walks and Labs for Module 0-11

3. "Experience with Linux kernel development"
→ Core content of this course
✓ Module 0: Development environment setup
✓ Module 10: KUnit and kselftest
✓ Module 11: Patch submission process

4. "Knowledge of GPU architecture and graphics pipeline"
→ This course covers
✓ Module 1: GPU hardware architecture (RDNA3)
✓ Module 2: Shaders and Graphics Pipeline
✓ Module 3: Command Processor and Ring Buffer

5. "Familiarity with DRM/KMS framework"
→ This course covers
✓ Module 4: DRM core framework
✓ Module 7: KMS and display management

#--- Preferred Qualifications (bonus points) ---

6. "Upstream Linux kernel contributions"
→ Your patch record!
✓ Module 11: Patch workflow, your commit in amd-gfx

7. "Experience with GPU memory management (TTM, GEM)"
✓ Module 5: amdgpu memory management
✓ Module 6: TTM and Buffer Object

8. "Experience with GPU power management"
✓ Module 9: Power Management and SMU

9. "Familiarity with GPU testing (IGT)"
✓ Module 10: IGT framework and test writing

10. "Good communication skills for upstream collaboration"
✓ Module 11: Review responses and mailing list communication

#--- Summary of your advantages ---
#
#If you complete all modules of this course:
#Required: Coverage 5/5 ✓
#Preferred: Coverage 5/5 ✓ (assuming you also submit a patch)
#
#Key differentiators:
#1. Verifiable amd-gfx patch contribution
#2. Public Portfolio (analysis articles + test code)
#3. In-depth understanding of amdgpu driver architecture
#
#These are things most candidates don't have — your competitive advantages`,
            annotations: [
              'Most AMD driver jobs require 3+ years of C experience - but quality matters more than years',
              '"Linux kernel development" does not require you to be a kernel maintainer - experience in patch contribution is sufficient',
              '"GPU architecture" knowledge can be systematically acquired through this course',
              'Each of the Preferred qualifications is a module of this course',
              '"Upstream contributions" are the strongest differentiator - most candidates don\'t have them',
              'By completing this course and having a patch record, you have met almost all the requirements',
            ],
            explanation: 'This analysis demonstrates the precise mapping of this course to real AMD job requirements. Each Required and Preferred qualification corresponds to one or more modules in the course. Key Insight: Most candidates have C programming experience, but few have real kernel patch contributions - your biggest differentiation opportunity.',
          },
          miniLab: {
            title: 'Mock AMD technical interview',
            objective: 'Use the knowledge you learned in this course to complete a simulated AMD GPU driver engineer technical interview.',
            steps: [
              'Time 45 minutes to answer the following 5 interview questions independently (without looking at the answers)',
              'Question 1 (Basics): Explain the role of the GPU driver in the Linux system. What are the main subsystems of the amdgpu driver?',
              'Question 2 (DRM/KMS): What is DRM Atomic Commit? Explain the relationship between CRTC, Plane and Connector.',
              'Question 3 (Debugging): When you see "[drm:amdgpu_job_timedout] *ERROR* ring gfx_0.0.0 timeout" appearing in dmesg, how will you debug it? List the first 5 steps.',
              'Question 4 (Coding): Handwrite a simple ioctl handler to receive the buffer address and size passed in from user space, verify the validity of the parameters, and map it to the GPU virtual address space (pseudocode is enough).',
              'Question 5 (Behavior): Use the STAR method to describe a time when you solved a complex technical problem.',
              'Once completed, review your performance on each question and mark areas that need improvement.',
              'For weak areas, return to the corresponding course module to review',
            ],
            expectedOutput: `Mock interview self-evaluation form:

Topics Self-Assessment Modules that require review
─────────────────────   ─────       ─────────────
1. GPU driver role ★★★★☆ Module 0, 5
2. DRM Atomic Commit    ★★★☆☆     Module 4, 7
3. GPU Hang Debugging ★★★★☆ Module 5, 10
4. ioctl handler coding ★★★☆☆ Module 4, 5
5. STAR Behavioral Interview ★★★★★ N/A

Overall readiness: 75%
Key enhancements: DRM/KMS depth + coding exercises`,
            hint: 'The most important thing in an interview is to show your thought process - even if the answer is not perfect, a clear analysis will leave a good impression on the interviewer. Where you are unsure, it is much better to say "I\'m not sure, but I would think like this..." than to remain silent or make blind guesses.',
          },
          debugExercise: {
            title: 'Analyzing race conditions in interview coding questions',
            language: 'c',
            description: 'The following is a simplified ioctl handler that handles user space requests to allocate GPU buffers. The interviewer asks you to identify the concurrency security issues.',
            question: 'What are the concurrency security issues with this ioctl handler? What happens in a multi-threaded scenario? How to fix it?',
            buggyCode: `/*Simplified GPU buffer allocation ioctl handler */
static int amdgpu_gem_create_ioctl(struct drm_device *dev,
                                    void *data,
                                    struct drm_file *filp)
{
    struct drm_amdgpu_gem_create *args = data;
    struct amdgpu_device *adev = drm_to_adev(dev);
    struct amdgpu_bo *bo;
    int ret;

    /*Check if there is enough VRAM */
    if (args->in.bo_size > adev->gmc.vram_available) {
        /*BUG: vram_available may change between check and allocation */
        return -ENOMEM;
    }

    /*allocate buffer */
    ret = amdgpu_bo_create(adev, args->in.bo_size, 0,
                            AMDGPU_GEM_DOMAIN_VRAM,
                            0, NULL, &bo);
    if (ret)
        return ret;

    /*Update available VRAM */
    adev->gmc.vram_available -= args->in.bo_size;
    /*BUG: Non-atomic operation, two threads may read-modify-write at the same time */

    /*Create GEM handle and return to user space */
    ret = drm_gem_handle_create(filp, &bo->tbo.base,
                                 &args->out.handle);
    if (ret) {
        adev->gmc.vram_available += args->in.bo_size;
        amdgpu_bo_unref(&bo);
        return ret;
    }

    return 0;
}`,
            hint: 'Think about the timing when two threads call this ioctl at the same time: TOCTOU (Time of Check to Time of Use) problem and non-atomic read-modify-write.',
            answer: 'Two concurrency security issues: (1) TOCTOU (Time-of-Check-Time-of-Use) race condition: Thread A checks vram_available > bo_size (condition is met), thread B also checks and allocates a large amount of VRAM after A checks but before allocating, resulting in insufficient VRAM when A actually allocates - but A thinks the check has passed. This can lead to overcommitment of VRAM. Fix: Put check and allocation in the same lock-protected region, or don\'t rely on precheck and let amdgpu_bo_create handle ENOMEM internally. (2) Non-atomic read-modify-write: adev->gmc.vram_available -= args->in.bo_size is not an atomic operation. Two threads might simultaneously read the same vram_available value, each subtract their own bo_size, and write back - one of the subtractions would be lost. For example: available=1000MB, A allocates 200MB, B allocates 300MB, the correct result should be 500MB, but it may become 700MB or 800MB. Fixes: (a) Use mutex to protect the entire check-allocate-update sequence: mutex_lock(&adev->gmc.vram_lock); check → allocate → update; mutex_unlock(). (b) Use atomic64_t instead of ordinary variables: atomic64_sub(bo_size, &adev->gmc.vram_available). (c) The actual amdgpu driver uses the TTM framework to manage VRAM, and TTM already handles these concurrency issues internally - no need to manually maintain the vram_available counter. Best answer in the interview: Point out two problems, give the lock solution, and then mention that the actual driver is solved through TTM.',
          },
          interviewQ: {
            question: 'Why do you want to join AMD for GPU driver development? Which team at AMD are you most excited about?',
            difficulty: 'easy',
            hint: 'Demonstrate your understanding of AMD\'s open source policies and your passion for technology. Mention specific teams (such as Display or 3D/GFX) and technical directions that interest you.',
            answer: 'Model answer: I want to join AMD to do GPU driver development for three reasons: (1) Technical challenges - GPU drivers are one of the most complex system software I know and require a simultaneous understanding of hardware architecture, operating system kernel, and application-layer requirements. The amdgpu stack covers memory management, command submission, display control, media, and power management, which makes it a technically rich area to study. (2) Open source culture - AMD publishes substantial parts of its Linux graphics and compute software stack in the open, which means I can read code, submit patches, and participate in community discussion before joining. I\'ve submitted [specific patches] via the amd-gfx mailing list and experienced that workflow directly. (3) Team preference - I am most interested in the 3D/Graphics team, specifically the GPU virtual memory management and command submission subsystem. In the process of learning the amdgpu source code, I was attracted by the design of the VM subsystem - the system-level thinking involved in GPU page table management and TLB optimization are the technical challenges I enjoy most. My VM subsystem analysis article in my portfolio demonstrates my depth in this area.',
            amdContext: 'This question will almost certainly be asked during the behavioral portion of an AMD interview. The key is to show that you\'re not just "looking for a job" - you have a real passion for GPU drivers, and you\'ve proven it with actions (patches, analysis, learning records). Mentioning a specific team shows that you have done research, not an overseas investment resume.',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 11.3: From Patches to Offer: The Execution Playbook
    // ════════════════════════════════════════════════════════════
    {
      id: '11-3',
      number: '11.3',
      title: 'From Patches to Offer: The Execution Playbook',
      titleEn: 'From Patches to Offer: The Execution Playbook',
      icon: 'Compass',
      description: 'The first two groups taught the "how". This group answers "where do I start, and what happens after?" — how to systematically find your first patch opportunity in real code, what happens to a patch after it merges, and how to translate all of it into resume language and an application strategy a hiring manager can verify in 30 seconds.',
      lessons: [
        // ── Lesson 11.3.1 ──────────────────────────────────────
        {
          id: '11-3-1',
          number: '11.3.1',
          title: 'Finding Your First Patch Opportunity & Life After Merge',
          titleEn: 'Finding Your First Patch Opportunity & Life After Merge',
          duration: 20,
          difficulty: 'intermediate',
          tags: ['kernel-doc', 'W=1', 'coccinelle', 'first-patch', 'stable', 'regression'],
          concept: {
            summary: 'Knowing the workflow (Module 11.1) is not the same as having a patch to send — the biggest newcomer blocker is "what can I possibly fix in 4 million lines of code?". This lesson gives you an executable opportunity radar — kernel-doc warnings, W=1 build warnings, static-analysis findings, bug-tracker triage — ranked by merge probability, and explains the journey after merge: amd-staging-drm-next → drm-next → mainline → stable backports, plus the right response when your patch causes a regression. Lab 7 is the hands-on companion.',
            explanation: [
              'The opportunity pyramid, by merge probability from high to low: documentation/comment fixes (kernel-doc, clear typos) > real build warnings (W=1) > static-analysis findings (coccinelle/smatch/sparse) > bug fixes requiring hardware reproduction > new features (nearly impossible for newcomers). Start your first patch at the top of the pyramid: the goal is not to look clever, but to walk the full pipeline at minimal risk and establish your public submission record. Equally important is the anti-list: pure checkpatch style fixes (whitespace, brace placement, line re-wrapping) are generally unwelcome in drm/amd — bulk "beautification" creates git blame noise; drivers/staging/ is the practice ground for style cleanups, not drm/amd.',
              'kernel-doc warnings are the community-recognized best entry point. scripts/kernel-doc -none <file> scans at zero cost; these warnings usually appear because a commit changed a function signature without updating the comment — which hands you the commit-message material for free ("commit X changed the parameters but the comment was not updated"; find it with git log -S on the function name). The fix also forces you to learn kernel-doc syntax: @param: descriptions, Returns:/Return:, @member: for struct fields. The display (DC) subtree is header-dense with lots of history — fertile ground for this class of warning.',
              'W=1 and static analysis are the second tier. make W=1 M=drivers/gpu/drm/amd enables stricter-than-default warnings (unused variables, missing static, kernel-doc and more); make coccicheck MODE=report M=drivers/gpu/drm/amd runs Coccinelle semantic patches; make C=1 invokes sparse for type/lock-annotation checks. Three disciplines: (1) some findings are false positives or categories maintainers deliberately tolerate — read the target file\'s git log first to see what kinds of cleanups were recently accepted; (2) you must fully understand and verify any fix a static analyzer suggests — blind fixes are exposed immediately in review; (3) one problem per patch.',
              'Four gates between a warning and a patch: (1) reproduce the warning at the tip of amd-staging-drm-next — a fix against an outdated tree is meaningless; (2) dedup on lore.kernel.org/amd-gfx by searching the file name — if someone already sent the same fix, switch targets, or reply with Tested-by on their patch, which is also a contribution; (3) local validation — kernel-doc -none prints nothing (or the warning is gone) and the module still builds; (4) checkpatch.pl --strict reports zero issues. Only after all four gates do you enter the Module 11.1 sending flow. Lab 7 turns this into a step-by-step exercise.',
              'The journey after merge is worth being able to narrate to an interviewer: an amdgpu patch is first picked into amd-staging-drm-next by the maintainers; it then moves in batches into drm-next (the DRM subsystem staging branch for the next kernel); it lands in Linus\'s mainline during the next merge window; and if it carries a Fixes: tag and applies to released kernels, stable maintainers (and the AUTOSEL automation) backport it into stable/LTS series — meaning your small fix can show up in an Ubuntu/Fedora kernel update months later. Track your patch: git log --author=you on each branch, or watch for the maintainer\'s "Applied, thanks" reply in the lore thread.',
              'When your patch causes trouble, how you respond builds (or destroys) community trust faster than the patch itself. The kernel\'s iron rule is "no regressions": if someone reports your patch broke something (Reported-by, a bisect landing on your commit), respond within 24-48 hours, help confirm, and either send a quick fix (Fixes: pointing at your own commit) or agree to a revert — restore users first, get it right later. Conversely, you can also accumulate public contributions by testing other people\'s patches and reproducing regressions (Tested-by:) — claiming bugs your hardware can reproduce on the gitlab.freedesktop.org/drm/amd issue tracker is the entry point.',
            ],
            keyPoints: [
              'Opportunity pyramid: kernel-doc/typos > W=1 warnings > static analysis > bug fixes > features — start at the top',
              'Pure checkpatch style cleanups are unwelcome in drm/amd — kernel-doc and real warnings are the safe zone',
              'Four gates: reproduce on latest branch → dedup on lore → local validation (tool clean + builds) → checkpatch --strict',
              'Merge path: amd-staging-drm-next → drm-next → mainline merge window → (with Fixes:) stable backports',
              'On regressions: respond fast, fix or agree to revert — your regression response defines your reputation',
              'Testing for others (Tested-by, bug triage) also accumulates as public, verifiable contribution',
            ],
          },
          diagram: {
            title: 'First-Patch Opportunity Radar & Patch Lifecycle',
            content: `Opportunity pyramid (merge probability × experience needed)

           ▲ hard
           │   ┌────────────────────┐
           │   │ new feature/refactor│ ← newcomers: no — needs trust
           │   ├────────────────────┤
           │   │      bug fix        │ ← needs hw repro + root cause
           │   ├────────────────────┤
           │   │ static-analysis hit │ ← coccinelle/smatch; filter FPs
           │   ├────────────────────┤
           │   │  W=1 build warning  │ ← real, but check maintainer taste
           │   ├────────────────────┤
      easy │   │  kernel-doc /       │ ← ★ START HERE:
           ▼   │  comment·typo fix   │   small, unambiguous, welcomed
               └────────────────────┘

Four gates (hands-on in Lab 7)
──────────────────────────────
① Reproduce on latest amd-staging-drm-next
② Dedup on lore.kernel.org/amd-gfx (no in-flight fix)
③ kernel-doc -none silent + module builds
④ checkpatch.pl --strict clean
        │
        ▼ Send (Module 11.1 flow)

The journey after merge
───────────────────────
amd-staging-drm-next ──→ drm-next ──→ Linus mainline
  (maintainer applies)  (subsystem     (merge window)
                         staging)          │
                            fixes with Fixes: tags
                                           ▼
                                 stable / LTS backports
                          (lands in distro kernel updates)

When your patch causes a regression
───────────────────────────────────
report / bisect points at you → respond in 24-48h
   ├─ quick fix possible → send it (Fixes: your commit)
   └─ not possible → agree to revert; users first`,
            caption: 'The full decision map: start at the top of the pyramid (kernel-doc), pass four gates before sending, and understand the post-merge journey so you can tell an interviewer exactly where your code lives and how it got there.',
          },
          codeWalk: {
            title: 'A Complete Opportunity-Scan Session',
            file: 'terminal',
            language: 'bash',
            code: `# ============================================
# Opportunity radar: scan to locked target
# (realistic session example)
# ============================================

# --- Radar 1: kernel-doc scan ---
$ find drivers/gpu/drm/amd/display -name "*.h" | \\
    xargs -r scripts/kernel-doc -none 2>&1 | head -8
dc_stream.h:142: warning: Function parameter or struct member
  'adjust' not described in 'dc_stream_adjust_vmin_vmax'
dc_link.h:88: warning: Excess function parameter 'link'
  description in 'dc_link_detect'
...

# --- Radar 2: W=1 warning census ---
$ make W=1 M=drivers/gpu/drm/amd -j$(nproc) 2>&1 | \\
    grep -c "warning:"
37

# --- Gate ①: warning still exists on the latest branch ---
$ git fetch agd5f amd-staging-drm-next --depth=50
$ git checkout -b kdoc-fix agd5f/amd-staging-drm-next
$ scripts/kernel-doc -none \\
    drivers/gpu/drm/amd/display/dc/dc_stream.h 2>&1 | grep adjust
dc_stream.h:142: warning: ... 'adjust' not described ...  # still there ✓

# --- Gate ②: dedup on lore ---
# browser: https://lore.kernel.org/amd-gfx/?q=dc_stream_adjust_vmin_vmax
# → no recent identical fix ✓

# --- Who changed the signature without the comment? ---
$ git log --oneline -3 -- drivers/gpu/drm/amd/display/dc/dc_stream.h
$ git log -S "dc_stream_adjust_vmin_vmax" --oneline | tail -3

# --- Fix + gates ③/④ ---
$ vim drivers/gpu/drm/amd/display/dc/dc_stream.h  # add @adjust: line
$ scripts/kernel-doc -none \\
    drivers/gpu/drm/amd/display/dc/dc_stream.h
(silent ✓)
$ make M=drivers/gpu/drm/amd -j$(nproc)           # still builds ✓
$ git add -p && git commit -s
$ scripts/checkpatch.pl --strict -g HEAD~1..HEAD
total: 0 errors, 0 warnings ✓
# → continue with the Module 11.1 / Lab 7 sending flow`,
            annotations: [
              'Two radars produce candidates; the four gates run in order — fail any gate, move to the next candidate',
              'git log -S "<function>" finds the commit that touched it — your commit message can state "comment out of sync since commit X"',
              'dc_stream.h and dc_stream_adjust_vmin_vmax are a real file and function; the warning line/content here is illustrative — use your actual scan results',
              'While fixing kernel-doc, read the whole function — this is reading code with a mission, the best way to learn',
              'After all gates pass, continue with the b4 rehearsal and send in Lab 7 step 7',
            ],
            explanation: 'This session shows the full decision process from scan to "ready to send" — usually under an hour. Note that every step has an explicit pass/fail criterion: this engineering approach means you do not depend on inspiration; you own a repeatable contribution pipeline. After the first patch merges, the same radar keeps producing the second and the third.',
          },
          miniLab: {
            title: 'Run Your Own Opportunity Scan',
            objective: 'Complete a full scan on amd-staging-drm-next and produce a ranked candidate list (sending not required for this lesson).',
            steps: [
              'Sync the branch: git fetch agd5f amd-staging-drm-next --depth=200 && git checkout -b scan agd5f/amd-staging-drm-next',
              'Radar 1: run scripts/kernel-doc -none across all .h files under drivers/gpu/drm/amd/display, saving to /tmp/kdoc.log',
              'Radar 2: make W=1 M=drivers/gpu/drm/amd 2>&1 | grep "warning:" | sort | uniq -c | sort -rn to see the warning distribution',
              'Pick 3 candidates; for each run git log --oneline -5 -- <file> (what cleanups did maintainers recently accept?) plus a lore dedup search',
              'Rank the 3 by "how well I understand it × merge probability" and write candidates.md: warning text, file & function, origin (git log evidence), dedup result, fix idea',
              '(Optional) execute the fix for candidate #1 and pass gates ③/④ — that is the entry point of Lab 7',
            ],
            expectedOutput: `Example structure for candidates.md:

## Candidate 1 (top pick)
- Warning: dc_stream.h:142 'adjust' not described
- Function: dc_stream_adjust_vmin_vmax (display/DC)
- Origin: git log -S shows commit abc1234 added the param
- Dedup: nothing in-flight on lore (searched 2026-06)
- Plan: add @adjust: description, reference abc1234

## Candidate 2 / Candidate 3 ... (same structure)`,
            hint: 'If the display subtree has too many warnings to choose from, count warnings per file and pick the file with the fewest — 1-2 warnings in one file usually means one commit fixes it completely: the ideal first-patch size.',
          },
          debugExercise: {
            title: 'Why Will This "First Patch" Plan Get Rejected?',
            language: 'text',
            description: 'Below is a newcomer\'s plan for a patch to amd-gfx. Find every problem that would get it rejected or ignored.',
            question: 'List every problem in this plan and produce a corrected version.',
            buggyCode: `The plan:
1. Base: the 6.8 kernel source package shipped with Ubuntu 24.04
2. Changes (all in one patch):
   a. run checkpatch over drivers/gpu/drm/amd/amdgpu/, find all
      "line over 100 characters" hits, and re-wrap every one
   b. also fix 3 comment typos while at it
   c. change one "if (ret != 0)" to "if (ret)" — "more idiomatic"
3. No need to build — "it is only formatting and comments,
   compilation cannot break"
4. git commit -m "cleanup amdgpu code style"
5. Send directly to the maintainer's personal email, to avoid
   embarrassment on the public list
6. If no reply in three days, send the same patch again`,
            hint: 'Check seven dimensions: base branch, patch splitting, whether the change type is welcome, validation, commit message, recipients, follow-up etiquette.',
            answer: 'Problem list: (1) Wrong base — a distro 6.8 source package is far behind amd-staging-drm-next: the warnings may already be fixed and the diff will not apply cleanly. Base on the maintainer\'s development branch. (2) Three unrelated change types in one patch — violates one-logical-change-per-patch; must be split. (3) Wrong change types: (a) bulk line re-wrapping is pure style churn that drm/amd maintainers generally reject (git blame noise); (c) the if (ret) rewrite has no functional meaning and will also be rejected. Only (b), the typo fixes, is sendable — as its own minimal patch, or better, switch to a kernel-doc fix. (4) "No need to build" is wrong — re-wrapping can split strings or macros, and comment edits can break kernel-doc; every patch must be build-tested. (5) Non-compliant commit message: missing subsystem prefix (drm/amdgpu:), missing -s (no Signed-off-by), and "cleanup code style" says nothing about what/why. (6) Mailing the maintainer privately bypasses public review — patches must be publicly reviewable: To: the amd-gfx list, Cc: everyone get_maintainer prints. "Embarrassment" on the list is exactly how a public record gets built. (7) Re-sending the identical patch after three days is too pushy — the correct move is one polite ping in the original thread after about a week. Corrected plan: base on amd-staging-drm-next; keep only the typo fix as a minimal standalone patch (or do a kernel-doc fix instead); pass build + kernel-doc -none + checkpatch --strict; proper commit message with Signed-off-by; git send-email --to amd-gfx --cc maintainers; ping once in-thread after a week of silence.',
          },
          interviewQ: {
            question: 'You are handed a 4-million-line driver codebase you have never seen, and asked to make your first meaningful upstream contribution within a month. Walk me through your approach.',
            difficulty: 'medium',
            hint: 'This tests methodology: how you systematically find an entry point, validate, and interact with the community — not raw talent.',
            answer: 'My four-week plan: Week 1 — environment and map: get a dev setup that can incrementally build the target module; read MAINTAINERS and the last ~200 commits to learn the active areas, the active maintainers, and what kinds of changes they accept; subscribe to the mailing list to absorb the review culture. Week 2 — opportunity scan: use zero-cost tools to mass-produce candidates — scripts/kernel-doc -none, make W=1, make coccicheck — plus entry-level bug-tracker issues my hardware can reproduce; filter every candidate three ways: still present on the latest development branch, no in-flight duplicate on the list archive, and I can genuinely read the surrounding code. Week 3 — execution: pick the smallest, most unambiguous target (typically a kernel-doc or real build-warning fix); fix it and pass all local validation (tool silent, module builds, checkpatch --strict clean); write a commit message that explains the origin (git log -S to find the commit that introduced the inconsistency); send to the right list with maintainers Cc\'d via get_maintainer. Week 4 — iterate and expand: respond to review point by point and send v2 quickly; start a second, slightly larger target; build presence by testing other people\'s patches (Tested-by:). Core principle: the first contribution exists to establish a credible public record and process fluency — small and perfect beats large and risky.',
            amdContext: 'Interviewers asking this want a repeatable engineering method, not luck. If you can open lore.kernel.org on the spot and show this is exactly how you landed your first patch, the question stops being hypothetical — it becomes your home turf.',
          },
        },

        // ── Lesson 11.3.2 ──────────────────────────────────────
        {
          id: '11-3-2',
          number: '11.3.2',
          title: 'The Resume Playbook: Making AMD See Your Evidence',
          titleEn: 'The Resume Playbook: Making AMD See Your Evidence',
          duration: 20,
          difficulty: 'beginner',
          tags: ['resume', 'bullet', 'careers', 'application', '12-week-plan'],
          concept: {
            summary: 'A resume is not a list of experiences — it is an index of evidence. This lesson is a drop-in translation layer: convert each lab and artifact from this course into bullets shaped as "verb + specific system + method + verifiable link"; tune keywords per target area (display / graphics & memory / compute / compiler / testing); and follow a 12-week evidence plan plus a layered application-channel list. Core principle: every bullet must be verifiable by a hiring manager within 30 seconds.',
            explanation: [
              'Evidence first. GPU drivers are a small world, and every hard claim on your resume can be verified live in an interview: write "submitted patches" and you will be asked for the lore link; write "analyzed the VM subsystem" and you will be quizzed on amdgpu_vm.c details. For people who actually did the work this is an advantage — most candidates have course certificates and "familiar with"; you have clickable links. Three rules: (1) every bullet carries at least one verifiable artifact (lore link / GitHub / blog); (2) verbs match facts exactly — submitted (sent) ≠ merged (accepted); ban the vague "contributed to"; (3) only write numbers that are truly countable (N patches, M lab reports) — smaller and true beats bigger and fuzzy.',
              'The bullet formula: verb + specific object (subsystem/tool names) + method + artifact with link. Standard mappings for this course: Lab 1 → "Built and booted custom Linux kernels (v6.12 LTS) with amdgpu as a loadable module; iterated driver changes in virtme-ng VMs". Lab 2 → "Triggered controlled GPU hangs with IGT amd_deadlock, captured devcoredumps, root-caused the hung ring and reset path via umr + dmesg". Lab 3 → "Traced the dma_fence lifecycle through amdgpu command submission with ftrace". Lab 6 → "Ran and extended the DRM core KUnit suites (drm_buddy — the allocator behind the amdgpu VRAM manager)". Lab 7 → "Submitted <N> patches to the amd-gfx mailing list (kernel-doc/W=1 fixes in drivers/gpu/drm/amd); <M> merged into amd-staging-drm-next". The platform itself → "Designed and shipped a bilingual (EN/ZH) AMDGPU-internals learning platform (React/TypeScript, 14 modules, 75+ micro-lessons, 7 guided labs)". Placeholders must become real numbers.',
              'Tune keywords per direction. Linux GPU driver roles typically cluster into a few technical areas; reorder bullets and keywords per the job description: display — DRM/KMS, atomic commit, DC, DP/HDMI; graphics & memory — TTM, GPUVM, drm_buddy, command submission, dma_fence, drm_gpu_scheduler; compute — KFD, ROCm, HSA queues, SVM; compiler — LLVM AMDGPU backend, ISA, register allocation; testing & tooling — IGT, KUnit, bisect, CI. Role titles and locations change over time — always verify against live searches on careers.amd.com ("Linux", "GPU driver", "kernel"); historically Markham (Greater Toronto) and Shanghai have publicly posted Linux GPU driver roles, but treat current postings as the source of truth.',
              'Layered application channels. (1) Direct: careers.amd.com (students and new grads: watch the University/Early-Career categories) plus AMD recruiters on LinkedIn (the 11.2.1 keyword optimization makes you findable). (2) Community visibility: your amd-gfx patches, review interactions, and issue triage are work samples read by your future teammates — many driver developers are active on that very list; keep your lore record and freedesktop GitLab activity clean and professional. (3) Adjacent-employer stepping stones: companies like Igalia, Collabora, Red Hat, Canonical, and the Valve-contractor ecosystem do full-time open-source Linux graphics work, need the same skills, and are often more newcomer-friendly — building full-time upstream experience there first is a well-trodden path into GPU vendors. (4) Student channels: internships/co-op programs usually have a friendlier bar for kernel newcomers (verify what is actually open this cycle).',
              'The 12-week evidence plan (see diagram). There is exactly one discipline: every week ships one linkable artifact. Weeks 1-4 foundation (Labs 1-3 plus study notes online); weeks 5-8 going upstream (Lab 6 KUnit report, Lab 7 scan and first patch sent, review iteration or a second patch); weeks 9-12 packaging (one deep subsystem write-up, resume and LinkedIn fully linkified, applications out, mock interviews via 11.2.2). Stretch the calendar if needed — but never break the weekly cadence: the public timeline on lore and GitHub is itself the most persuasive hidden message in your application, because it demonstrates sustained delivery.',
              'Honesty red lines. Never write "merged" when you only "submitted"; never call the learning platform a "production product" or invent user counts; never imply private relationships with AMD engineers. The community is small enough that inflated claims get caught, and the cost far exceeds the value of any honest small result. The flip side: honest small results plus a publicly checkable growth trajectory (lore timeline, GitHub history) is precisely the "low-risk, high-potential" profile hiring managers want — it is the strongest card a newcomer can play.',
            ],
            keyPoints: [
              'Bullet formula: verb + specific subsystem + method/tool + verifiable artifact link',
              'submitted ≠ merged — verbs must match facts; the community record is public',
              'Keywords per direction: display (KMS/DC), graphics & memory (TTM/GPUVM), compute (KFD/ROCm), compiler (LLVM), testing (IGT/KUnit)',
              'Channels: careers.amd.com + community visibility + adjacent employers (Igalia/Collabora/Red Hat...) + student programs',
              'The single discipline of the 12-week plan: one linkable artifact per week',
              'Honesty red lines: small and true + public trajectory = the "low-risk, high-potential" profile',
            ],
          },
          diagram: {
            title: '12-Week Evidence Plan & Bullet Translation Formula',
            content: `12-week evidence plan (one linkable artifact per week)

Wk   Action                         Artifact (all linkable)
──   ──────                         ───────────────────────
 1   Env setup + Lab 1              portfolio repo + notes/lab1-kernel-build.md
 2   Lab 3 ftrace tracing           analysis/fence-trace.md
 3   Lab 2 GPU-hang debugging       analysis/gpu-hang-report.md
 4   Module 5 source deep-read      VM or Ring subsystem notes
 ─────────────────────────────────────────────────────────
 5   Lab 6 KUnit                    drm_buddy report + own test
 6   Lab 7 opportunity scan         candidates.md
 7   Lab 7 first patch SENT ★       lore link #1
 8   Review iteration / 2nd target  v2 thread or lore link #2
 ─────────────────────────────────────────────────────────
 9   Deep-dive one subsystem        long-form analysis (blog)
10   (Optional) KUnit/IGT test work test-patch lore link
11   Resume + LinkedIn linkified    1-page resume, every bullet linked
12   Apply + mock interview (11.2.2) application tracker

 Slow the calendar if needed — never break the weekly cadence.

Bullet translation formula
──────────────────────────
 [verb]       [specific object]       [method/tool]      [artifact]
 Submitted    N patches → amd-gfx     kernel-doc/W=1     lore link
 Built        custom kernel v6.12     virtme-ng          build notes
 Root-caused  controlled GPU hangs    IGT + devcoredump  analysis
 Extended     DRM KUnit (drm_buddy)   new boundary test  report
 Shipped      bilingual platform      React/TS           site + repo

 ✗ "Familiar with GPU drivers"      ← unverifiable, delete
 ✗ "Contributed to Linux kernel"    ← vague; use submitted/merged + N
 ✓ "2 patches merged in drm/amd/display (kernel-doc fixes),
    lore.kernel.org/amd-gfx/?q=f:you@mail.com"`,
            caption: 'The top table is the cadence; the bottom table is the translation. Resume screening averages 30 seconds — every bullet must stand alone, credible and clickable.',
          },
          codeWalk: {
            title: 'Weak Bullets → Strong Bullets (as a diff)',
            file: 'resume_bullets.diff',
            language: 'diff',
            code: `--- resume_weak.md
+++ resume_strong.md
@@ Skills & Projects @@
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
              'Every "-" line shares the same disease: unverifiable, no concrete object, no artifact',
              'Every "+" line has the same skeleton: verb + specific system + method + clickable evidence in brackets',
              'Numbers must be real: 3 patches means write 3, not "multiple"; if nothing merged, write only submitted',
              'The lore f: (from) query lists all your public contributions in one URL — put it front and center',
              'The last bullet upgrades "built a website" into an engineering delivery with scale metrics',
            ],
            explanation: 'The diff makes the translation gap visible: the strong version contains zero adjectives (passionate/expert/familiar) — only verbs, nouns, and links. That is the grammar of an engineering resume: let the evidence speak. The same applies to a Chinese resume: replace 熟悉 GPU 驱动 with 向 amd-gfx 提交 3 个补丁（2 个已合并，lore 链接）.',
          },
          miniLab: {
            title: 'Translate Your Progress into Five Bullets',
            objective: 'Use the formula to write 5 resume-ready bullets (one English set, one Chinese set) from the labs and artifacts you have actually completed, and verify every link.',
            steps: [
              'Honest inventory: list the labs you have completed and the artifacts that actually exist (what is done? what has a linkable output?)',
              'Apply the formula to each: verb + specific object + method/tool + artifact link',
              'Audit verbs against facts: submitted / merged / built / analyzed / extended — delete every familiar / passionate / expert',
              'Actually click every link in all 5 bullets: a 404, a private repo, or an empty doc counts as a failure',
              'Have a friend who knows nothing about kernels read the English set — they should be able to retell what you did (the specificity test)',
              'Add the 5 bullets to the Highlights section at the top of your portfolio README, and to both language versions of your resume',
            ],
            expectedOutput: `5 bullets (example — replace with your real content and links):

• Submitted 2 kernel-doc fix patches to amd-gfx
  (drivers/gpu/drm/amd/display); 1 merged —
  lore.kernel.org/amd-gfx/?q=f:you@mail.com
• Built & booted custom v6.12 kernels with amdgpu
  as a module; documented the Ubuntu cert pitfall —
  github.com/you/portfolio/notes/lab1-kernel-build.md
• Root-caused a controlled GPU hang (IGT amd_deadlock
  → devcoredump → umr) on RDNA3 —
  github.com/you/portfolio/analysis/gpu-hang-report.md
• Extended the DRM KUnit drm_buddy suite with a
  boundary test; suites pass under UML —
  github.com/you/portfolio/tests/kunit-drm-buddy-report.md
• Shipped a bilingual AMDGPU learning platform
  (14 modules, 7 labs, React/TS) — your-site.example

Check: each ≤3 lines, ≥1 link, zero adjectives.`,
            hint: 'Cannot produce 5 bullets? That is an action signal, not a writing problem — go back to the 12-week table and see which artifact this week should produce. The resume is the output; the cadence is the cause.',
          },
          debugExercise: {
            title: 'Audit an Inflated Resume Section',
            language: 'text',
            description: 'Every line in this resume section has a problem — some are unverifiable, some are inflated, some will be exposed live in an interview.',
            question: 'Identify the problem in each line and decide: delete, rewrite, or honestly downgrade?',
            buggyCode: `OPEN SOURCE & PROJECTS

• Contributed extensively to the Linux kernel GPU subsystem
• Expert in AMDGPU driver internals (VM, scheduler, display)
• My patches are used by millions of Ubuntu users worldwide
• Worked closely with AMD maintainers on driver improvements
• Built a production-grade GPU driver education SaaS platform
  serving the developer community
• Deep experience with ROCm/HIP performance optimization
  on data-center GPUs`,
            hint: 'Ask two questions per line: (1) can an interviewer verify it in 30 seconds? (2) what happens after three levels of follow-up questions?',
            answer: 'Line by line: (1) "Contributed extensively" — vague verb plus unquantifiable "extensively". Rewrite to precise fact: "Submitted N patches (M merged) to amd-gfx — <lore link>". (2) "Expert in ... internals" — expert is the interviewer\'s conclusion, not a self-granted title; three levels of follow-up (GPUVM page-table levels, eviction triggers, scheduler entity/rq relationships) and any stumble backfires. Rewrite to evidence: "Wrote a 5k-word analysis of the amdgpu VM subsystem — <link>". (3) "used by millions" — even if your fix genuinely reached Ubuntu via stable, this attribution is dangerous inflation (merged ≠ you served millions). Honest downgrade: "1 fix backported to stable 6.12.x via Fixes: tag" (if true), else delete. (4) "Worked closely with AMD maintainers" — one or two review rounds is not working closely; follow-ups make this awkward. Rewrite: "Iterated patches through review with amdgpu maintainers (v2 accepted) — <thread link>". (5) "production-grade SaaS serving the community" — a learning platform with no paying users or SLA is not production SaaS; inventing scale crosses the integrity line. Rewrite to the real delivery: "Designed & shipped a bilingual AMDGPU learning platform (14 modules, 7 labs) — <link>". (6) "data-center GPUs" — if you own a consumer RX 7600 XT and your ROCm work was compatibility-matrix-gated experiments, this is plainly false. Delete or downgrade: "Ran HIP kernels and profiling exercises on RDNA3 (consumer ROCm path, compatibility-matrix gated)". Conclusion: zero of the six lines survive as written — but behind each one there is a smaller, true fact; writing that fact is enough.',
          },
          interviewQ: {
            question: 'Your resume says you submitted patches to amdgpu. Pick one and walk me through it: what did it change, why was it needed, and what did the review teach you?',
            difficulty: 'medium',
            hint: 'Close with STAR: situation (how you found it) → task → action (validation and process) → result (link + lessons). Proactively be honest about the patch size.',
            answer: 'Model answer (kernel-doc fix scenario — replace with your real experience): Situation — while scanning the display subtree with scripts/kernel-doc -none, I found a function in dc_stream.h whose comment was missing a description for a newer parameter; git log -S showed a commit months earlier had changed the signature without updating the comment. Task — fix the warning and walk the complete upstream process. Action — I passed the four gates first: confirmed the warning still existed at the tip of amd-staging-drm-next and that lore showed no in-flight fix; after adding the @param description, kernel-doc -none went silent, the module still built, and checkpatch --strict was clean; my commit message referenced the commit that introduced the inconsistency; get_maintainer gave me the recipients and I sent it to amd-gfx with maintainers Cc\'d via git send-email. Result — a maintainer replied the next day with a wording suggestion; I sent v2 (changelog crediting the suggestion), and the patch was applied to amd-staging-drm-next — here is the lore thread link. Three lessons: (1) upstream respects "small and correct" — a 10-line fix still gets a real review; (2) a commit message is a letter to the maintainer five years from now, not a note to myself; (3) review is collaboration, not an exam — responding point by point with attribution beats defending. I am deliberately upfront that this was a small patch: its value is that I now have muscle memory for every step, and my second patch cost a tenth of the first.',
            amdContext: 'The interviewer will almost certainly open your lore link on the spot. The real test is whether you can narrate your own work accurately, without inflation, with details that survive follow-ups — exactly the skill daily code review and cross-team collaboration require.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Master the complete kernel patch workflow: format-patch → checkpatch → get_maintainer → send-email',
    'Able to write commit messages that comply with kernel specifications (Subject + Body + Fixes + Signed-off-by)',
    'Understand the review process, be able to respond to review comments professionally and send v2 version',
    'Established a public GPU driver engineer portfolio (GitHub + Blog + LinkedIn)',
    'Understand AMD\'s team structure (Display/3D/Compute/PM/Toolchain) and the technical focus of each team',
    'Completed mock interview exercises and marked areas for improvement',
    'Submitted at least one patch (even a typo fix) to the amd-gfx mailing list',
    'Be prepared with 2-3 specific projects/contributions that can be described in detail during the interview',
    'Can present your learning path as evidence-based growth with patch links, write-ups, and tests instead of only resume claims',
    'Ran a full opportunity scan (kernel-doc + W=1) on amd-staging-drm-next and produced a ranked candidate list',
    'Every resume bullet follows the "verb + object + method + link" formula, and every link actually resolves',
    'Started the 12-week "one linkable artifact per week" cadence and shipped at least week one',
  ],
};
