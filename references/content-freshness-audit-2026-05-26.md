# AMD Driver Learning Content Freshness Audit

Date: 2026-05-26  
Repo: `/Users/liuziao/Desktop/AMD_Driver_Learning`  
Reference doc: `/Users/liuziao/Desktop/resume/网站Review与改造清单.md`  
Mode: audit only; no implementation fixes.

## 1. Executive Summary

Overall score: **72/100**.

The site is technically ambitious and most broad concepts are directionally useful, but several high-risk learning paths now mix current upstream material with stale or over-broad claims. The most urgent problems are in installation content, ROCm/RX 7600 XT assumptions, IGT test names, virtme-ng command syntax, and SEO/a11y metadata. The build and tests pass, but the production bundle warning confirms the homepage stats/build-health area should not imply the app is already optimized.

Issue count:

| Severity | Count |
| --- | ---: |
| Critical | 2 |
| High | 7 |
| Medium | 8 |
| Low | 3 |

Highest-risk areas:

1. ROCm support is presented too broadly for consumer Radeon/RX 7600 XT/gfx1102.
2. IGT lab commands reference stale or nonexistent AMDGPU test/subtest names.
3. Setup/lab virtme-ng examples conflict with current upstream examples and the repo's own script comments.
4. Ubuntu 22.04 dependency instructions install a 24.04 package name.
5. English pages render with `html lang="zh-CN"` and lack basic social/discovery metadata.

Top 10 fixes:

1. Gate all ROCm/HIP lessons by the official ROCm Radeon/Ryzen compatibility matrix and mark RX 7600 XT as "verify before use", not assumed supported.
2. Replace `amd_deadlock --run-subtest hang-ring-gfx` and `amdgpu_test` references with current IGT AMDGPU test names from upstream source.
3. Normalize virtme-ng install/run guidance around `pipx`, `vng --build`, and `vng`/`vng -r`/documented kernel selection forms.
4. Split Ubuntu 22.04 and 24.04 dependency blocks for `libprocps-dev` vs `libproc2-dev`.
5. Fix `b4 send /tmp/patches/...` wording; make `b4 prep` the modern path and `git send-email` the direct patch-file path.
6. Make `html lang` locale-aware and add `og:image`, `robots.txt`, and `sitemap.xml`.
7. Refresh curriculum/home stats to match actual content: 14 modules, 640 hours, 78 micro-lessons, and validated question counts.
8. Update Source Guide links away from unlabeled Linux 6.8 snapshots or clearly label the source guide as "Linux 6.8 snapshot".
9. Align kernel config scripts so `CONFIG_DRM_AMDGPU` is module/built-in intentionally, not accidentally contradictory.
10. Retire or refresh stale handoff/reference docs that still describe incomplete English translation work.

## 2. Audit Scope

Audited route/page files:

- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/App.tsx`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/Home.tsx`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/ModulePage.tsx`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/MicroLessonPage.tsx`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/LabsPage.tsx`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/LabDetailPage.tsx`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SourceGuidePage.tsx`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/GlossaryPage.tsx`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/PracticePage.tsx`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/AssessmentPage.tsx`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/index.html`

Audited data/content files:

- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/curriculum.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/curriculum_en.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/ecosystem_module.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/ecosystem_module_en.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/engineering_phases.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/glossary_data.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/glossary_data_en.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/labs.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/mastery_checks.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/micro_lessons_index.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/module*_micro_lessons*.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/module2_group*.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/source_roadmap.ts`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/locales/en.json`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/locales/zh.json`

Audited docs/scripts affecting content:

- `/Users/liuziao/Desktop/AMD_Driver_Learning/TRANSLATION_HANDOFF.md`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/UI_SPEC.md`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/scripts/amd-dev-env-setup.sh`
- `/Users/liuziao/Desktop/AMD_Driver_Learning/references/*.md`
- `/Users/liuziao/Desktop/resume/网站Review与改造清单.md`

Skipped:

- Build output under `dist/`.
- Dependency folders such as `node_modules/`.
- Pure UI implementation files without user-facing technical claims, except where needed for route/rendered inspection.

## 3. Verification Sources

Primary/current sources used:

- Linux Kernel Archives current release page: https://www.kernel.org/
- Linux kernel docs, AMDGPU: https://docs.kernel.org/gpu/amdgpu/index.html
- ROCm 7.2 quick start install guide: https://rocm.docs.amd.com/projects/install-on-linux/en/docs-7.2.0/install/quick-start.html
- ROCm system requirements: https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html
- ROCm Radeon/Ryzen compatibility matrix: https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/compatibility/compatibility.html
- IGT `amd_deadlock.c`: https://gitlab.freedesktop.org/drm/igt-gpu-tools/-/raw/master/tests/amdgpu/amd_deadlock.c
- IGT `amd_basic.c`: https://gitlab.freedesktop.org/drm/igt-gpu-tools/-/raw/master/tests/amdgpu/amd_basic.c
- virtme-ng upstream README: https://github.com/arighi/virtme-ng
- b4 send docs: https://b4.docs.kernel.org/en/latest/contributor/send.html
- b4 install docs: https://b4.docs.kernel.org/en/latest/installing.html
- Git `git-send-email` docs: https://git-scm.com/docs/git-send-email
- Ubuntu Jammy package page for `libprocps-dev`: https://packages.ubuntu.com/jammy/libprocps-dev
- Ubuntu Noble package page for `libproc2-dev`: https://packages.ubuntu.com/noble/libproc2-dev
- Linux firmware repository: https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git/
- LLVM CMake docs: https://llvm.org/docs/CMake.html
- LLVM Getting Started docs: https://llvm.org/docs/GettingStarted.html
- AMD Radeon RX 7600 XT product/specs page: https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7600-xt.html
- AMD Instinct MI300 product page: https://www.amd.com/en/products/accelerators/instinct/mi300/mi300x.html
- freedesktop AMD staging repo: https://gitlab.freedesktop.org/agd5f/linux

Local rendered inspection:

- `http://localhost:3000/en/`
- `http://localhost:3000/en/setup`
- `http://localhost:3000/en/labs/lab-2-gpu-hang`
- `http://localhost:3000/en/source-guide`
- `http://localhost:3000/en/glossary`
- `http://localhost:3000/en/assessment`
- `http://localhost:3000/zh/`

## 4. Findings By Severity

### Critical

#### F-001: ROCm/RX 7600 XT support is over-broad and assumed in core lessons

- Severity: Critical
- Phase/page/module: Setup Guide, Module 0, Module 7, Module 9, ROCm/HIP lessons
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:890`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:901`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:935`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/curriculum.ts:241`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/curriculum_en.ts:133`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/module7_micro_lessons_en.ts:170`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/module7_micro_lessons_en.ts:186`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/module9_micro_lessons.ts:170`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/module9_micro_lessons.ts:187`
- Current claim: ROCm setup is required for Modules 7/8; any AMD GPU/RDNA or CDNA family is implied suitable; `rocminfo` should list "your AMD GPU"; lessons repeatedly target RX 7600 XT/gfx1102 with HIP/ROCm commands.
- Why risky/wrong/stale: Learners with RX 7600 XT may spend hours installing ROCm and debugging missing HSA agents if their exact card/OS/ROCm release is not supported. The site treats ROCm as a general AMDGPU learning prerequisite instead of a compatibility-matrix-gated optional path.
- Verified current info: ROCm 7.2 install docs say users must confirm kernel/system requirements before install. AMD's Radeon/Ryzen ROCm docs publish separate compatibility matrices and say previous matrices/instructions must be selected by version. Current consumer GPU support is model/version/OS-specific, not "any AMD GPU" or "RDNA family" blanket support.
- Source links:
  - https://rocm.docs.amd.com/projects/install-on-linux/en/docs-7.2.0/install/quick-start.html
  - https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html
  - https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/compatibility/compatibility.html
- Recommended fix: Move ROCm to an optional, matrix-gated path. Add an explicit preflight: GPU model, gfx target, OS, kernel, ROCm release, and official compatibility result. Replace "your GPU as HSA Agent" examples with "if supported by the matrix".
- Confidence: High.

#### F-002: IGT AMDGPU test/subtest names are stale and will fail

- Severity: Critical
- Phase/page/module: Labs, Setup Guide, Testing module
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/labs.ts:192`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/labs.ts:193`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:535`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/curriculum.ts:3248`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/curriculum.ts:3251`
- Current claim: Lab 2 runs `sudo ./build/tests/amdgpu/amd_deadlock --run-subtest hang-ring-gfx`; fallback suggests `amdgpu_test`; testing module lists `./build/tests/amdgpu/amdgpu_test --list-subtests`; setup uses `amd_basic --run-subtest cs-gfx`.
- Why risky/wrong/stale: Current upstream IGT AMDGPU tests do not expose `hang-ring-gfx` or a monolithic `amdgpu_test` binary. `amd_basic` dynamic subtests are named more specifically than plain `cs-gfx` in current source, so the quick sanity command is also suspect.
- Verified current info: Current `tests/amdgpu/amd_deadlock.c` defines dynamic names such as `amdgpu-deadlock-sdma`, `amdgpu-gfx-illegal-reg-access`, `amdgpu-gfx-illegal-mem-access`, `amdgpu-deadlock-gfx`, `amdgpu-compute-illegal-mem-access`, and `amdgpu-deadlock-compute`. Current `amd_basic.c` defines dynamic/top-level names such as `memory-alloc`, `userptr-with-IP-DMA`, `cs-gfx-with-IP-GFX`, `cs-compute-with-IP-COMPUTE`, and `cs-sdma-with-IP-DMA`.
- Source links:
  - https://gitlab.freedesktop.org/drm/igt-gpu-tools/-/raw/master/tests/amdgpu/amd_deadlock.c
  - https://gitlab.freedesktop.org/drm/igt-gpu-tools/-/raw/master/tests/amdgpu/amd_basic.c
- Recommended fix: Replace all static IGT examples with commands verified against current upstream, and add a `--list-subtests` discovery step before named subtests. Remove `amdgpu_test` unless tied to a specific external package/version.
- Confidence: High.

### High

#### F-003: virtme-ng usage is inconsistent and partly stale

- Severity: High
- Phase/page/module: Setup Guide, Lab 1, setup script
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:478`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:486`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:604`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:831`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/labs.ts:131`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/scripts/amd-dev-env-setup.sh:96`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/scripts/amd-dev-env-setup.sh:252`
- Current claim: Setup repeatedly uses `vng --build --run`; Lab 1 uses `pip install virtme-ng`, `vng --build`, and `vng -k arch/x86/boot/bzImage`; the script comments say current usage is `vng --run --kdir /path/to/linux/source`.
- Why risky/wrong/stale: Users receive three different command styles. Upstream README examples commonly separate build and run (`vng --build`, then `vng`) and document `vng -r` for kernel selection. The repo's own script contradicts the visible Setup Guide.
- Verified current info: virtme-ng upstream examples include `vng --build --commit v6.2-rc4` followed by `vng`; running a previously compiled kernel from the current local repository is `vng`; host/current kernel is `vng -r`; precompiled version forms also use `vng -r`.
- Source links:
  - https://github.com/arighi/virtme-ng
- Recommended fix: Pick one verified virtme-ng flow and use it everywhere. Prefer `pipx install virtme-ng`, `vng --build`, then `vng` from the kernel tree, with `vng -r ...` examples only when selecting installed/precompiled kernels.
- Confidence: Medium-high; exact current CLI supports many aliases, but the current docs do not support the guide's mixed mental model clearly.

#### F-004: Ubuntu 22.04 dependency block installs Noble-only package name

- Severity: High
- Phase/page/module: Setup Guide, setup script
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:170`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:172`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/scripts/amd-dev-env-setup.sh:56`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/scripts/amd-dev-env-setup.sh:60`
- Current claim: The note says `libprocps-dev` was renamed to `libproc2-dev` in Ubuntu 24.04, but the command used for "Ubuntu / Debian" and the setup script always installs `libproc2-dev`.
- Why risky/wrong/stale: On Ubuntu 22.04/Jammy, users are directed to install a package name intended for newer Ubuntu. This directly breaks the advertised Ubuntu 22.04+ path.
- Verified current info: Ubuntu Jammy has `libprocps-dev`; Ubuntu Noble has `libproc2-dev`.
- Source links:
  - https://packages.ubuntu.com/jammy/libprocps-dev
  - https://packages.ubuntu.com/noble/libproc2-dev
- Recommended fix: Split Ubuntu 22.04 and 24.04 dependency snippets or use a version-detected branch in the script.
- Confidence: High.

#### F-005: `b4 send /tmp/patches/...` is not the modern arbitrary patch-file workflow

- Severity: High
- Phase/page/module: Setup Guide, patch submission workflow
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:622`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:623`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:1126`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:1142`
- Current claim: "b4 send /tmp/patches/0001-*.patch # modern way"; later the guide also shows a correct `b4 prep` followed by `b4 send`.
- Why risky/wrong/stale: The short daily workflow teaches a command that conflicts with b4's contributor docs. Learners may believe `b4 send` sends arbitrary `git format-patch` output.
- Verified current info: b4 docs state that the endpoint accepts series prepared with `b4 prep`; `b4 send -o /tmp/presend` is the documented pre-send preview form. Direct patch files remain a `git send-email` path.
- Source links:
  - https://b4.docs.kernel.org/en/latest/contributor/send.html
  - https://b4.docs.kernel.org/en/latest/installing.html
  - https://git-scm.com/docs/git-send-email
- Recommended fix: Replace the short workflow with `b4 prep`, `b4 prep --edit-cover`, `b4 prep --check`, `b4 send -o /tmp/presend`, `b4 send`; keep `git format-patch` + `git send-email` as the direct patch-file alternative.
- Confidence: High.

#### F-006: Locale/SEO/a11y metadata is stale or missing

- Severity: High
- Phase/page/module: Global shell, Home, all English routes
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/index.html:2`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/index.html:8`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/index.html:28`
- Current claim: The app shell hardcodes `<html lang="zh-CN">` and has a static generic description. Local rendered inspection of `/en/`, `/en/setup`, `/en/source-guide`, `/en/glossary`, and `/en/assessment` still reported `html.lang = zh-CN`; no `og:image` was present; no `robots.txt` or `sitemap.xml` was found.
- Why risky/wrong/stale: English pages are mislabeled for assistive tech, search, translation, and browser language heuristics. Missing OG image/sitemap/robots contradicts the reference doc's SEO/a11y improvement checklist.
- Verified current info: Rendered local pages confirmed the hardcoded language. Static search of the repo found no sitemap or robots public asset. The reference review document also flags these as known issues.
- Source links:
  - Local rendered inspection of `http://localhost:3000/en/`
  - `/Users/liuziao/Desktop/resume/网站Review与改造清单.md`
- Recommended fix: Set `document.documentElement.lang` from route locale at runtime or render locale-specific HTML; add `og:image`, canonical URLs where applicable, `robots.txt`, and `sitemap.xml`.
- Confidence: High.

#### F-007: Curriculum/home stats disagree with actual inventory

- Severity: High
- Phase/page/module: Home, Module 0 intro, locale stats
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/curriculum.ts:114`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/curriculum_en.ts:26`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/locales/en.json:31`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/locales/zh.json:31`
- Current claim: Module 0 says the path has 11 modules and 400-600 hours. Rendered Home shows 14 modules, 640+ hours, 50+ code examples, 40+ interview questions.
- Why risky/wrong/stale: The first module and the homepage disagree on the size of the curriculum. This damages trust and makes the time commitment look unmaintained.
- Verified current info: Local data inspection counted 14 curriculum modules and 640 hours. Micro-lesson data contains 78 lessons with code walks/labs/debug exercises. Curriculum interview questions plus mastery/checklist content can support a "40+" number only if the site defines what is counted.
- Source links:
  - Local data inspection using `tsx` import of `getCurriculum('en')` and `microLessonIndex`.
- Recommended fix: Update Module 0 to 14 modules and 640 hours, or compute these values from data. Add a source/counting definition for homepage stats.
- Confidence: High.

#### F-008: Source Guide is pinned to Linux 6.8 while presented as current source reading

- Severity: High
- Phase/page/module: Source Guide, UI spec/reference docs
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/source_roadmap.ts:30`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/UI_SPEC.md:468`
- Current claim: `BOOTLIN_BASE` points to `https://elixir.bootlin.com/linux/v6.8/source`; UI spec says "kernel v6.8".
- Why risky/wrong/stale: Linux 6.8 is old relative to the audit date. Kernel.org reported stable 7.0.10 and mainline 7.1-rc5 on 2026-05-26. Source-reading pages that look current can send learners to stale amdgpu files.
- Verified current info: Kernel.org current release listing on 2026-05-26 shows stable 7.0.10, mainline 7.1-rc5, and linux-next next-20260526.
- Source links:
  - https://www.kernel.org/
  - https://elixir.bootlin.com/linux/v6.8/source
- Recommended fix: Either label the page clearly as a "Linux 6.8 snapshot" or switch links to a maintained version variable and add an "audited against kernel X" date.
- Confidence: High.

#### F-009: Setup script enables AMDGPU built-in while guide teaches module workflow

- Severity: High
- Phase/page/module: Setup script, kernel build workflow
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/scripts/amd-dev-env-setup.sh:110`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/labs.ts:90`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/labs.ts:93`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:600`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:607`
- Current claim: The script runs `scripts/config --enable CONFIG_DRM_AMDGPU`, which sets built-in `=y`; Lab 1 expects `CONFIG_DRM_AMDGPU=m`; Setup Guide teaches `make M=drivers/gpu/drm/amd` and `insmod amdgpu.ko`.
- Why risky/wrong/stale: Built-in and module workflows are materially different. `rmmod/insmod` and module-only rebuild loops do not work the same way if AMDGPU is built into the kernel.
- Verified current info: Kernel `scripts/config --enable` means boolean/module option enabled, not necessarily module. To force a module build, `scripts/config --module CONFIG_DRM_AMDGPU` is the expected pattern when the symbol supports module mode.
- Source links:
  - Linux source/kconfig tooling in local kernel scripts convention.
  - https://docs.kernel.org/gpu/amdgpu/index.html
- Recommended fix: Decide whether the beginner workflow is built-in or module. For amdgpu driver iteration, prefer module where supported and make the script use `--module`; otherwise remove `rmmod/insmod` claims from the matching path.
- Confidence: Medium-high.

### Medium

#### F-010: `amdgpu_gpu_recover` debugfs trigger is version-sensitive and insufficiently caveated

- Severity: Medium
- Phase/page/module: Setup Guide, dual-machine debug workflow
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:553`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:878`
- Current claim: `sudo cat /sys/kernel/debug/dri/0/amdgpu_gpu_recover # trigger manual GPU reset`.
- Why risky/wrong/stale: This path is debugfs/version/config dependent and may not exist on current or distro kernels. Current Linux master inspection did not find `amdgpu_gpu_recover` in `drivers/gpu/drm/amd/amdgpu/amdgpu_debugfs.c`, while `amdgpu_gpu_recovery` exists as a module parameter. This needs version-specific confirmation before teaching as essential.
- Verified current info: AMDGPU debugfs files are kernel-version/config dependent. The current claim should be treated as "if present" and paired with discovery commands under `/sys/kernel/debug/dri/*/`.
- Source links:
  - https://docs.kernel.org/gpu/amdgpu/index.html
  - https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/
- Recommended fix: Replace with `ls /sys/kernel/debug/dri/0/ | grep amdgpu` discovery, add "if present on your kernel", and document the current supported GPU recovery controls for the selected kernel version.
- Confidence: Medium; marked needs verification.

#### F-011: linux-firmware instructions omit distro/initramfs caveats

- Severity: Medium
- Phase/page/module: Setup Guide, firmware prerequisites
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:208`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:212`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/pages/SetupGuide.tsx:213`
- Current claim: If firmware is missing, clone `linux-firmware` and run `sudo make install`.
- Why risky/wrong/stale: Direct firmware installation can bypass distro package management and may require initramfs regeneration depending on boot path and distro. The guide does not tell users how to verify the actual missing firmware filename from `dmesg` or how to roll back.
- Verified current info: The linux-firmware repo is the upstream source of AMDGPU firmware blobs, but distros generally package it and initramfs behavior is distro-specific.
- Source links:
  - https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git/
- Recommended fix: Prefer distro `linux-firmware` packages first; teach `dmesg | grep -i firmware`, exact missing blob matching, and distro-specific initramfs regeneration (`update-initramfs`/`dracut`) as conditional steps.
- Confidence: Medium.

#### F-012: RX 7600 XT PCIe lane count is wrong in Chinese glossary

- Severity: Medium
- Phase/page/module: Glossary
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/glossary_data.ts:49`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/glossary_data_en.ts:186`
- Current claim: Chinese glossary says RX 7600 XT uses PCIe 4.0 x16. English glossary says AMD specs list PCIe Gen4 x8.
- Why risky/wrong/stale: The bilingual content contradicts itself, and learners using PCIe examples may misdiagnose a normal x8 link as a problem.
- Verified current info: AMD RX 7600 XT quick-reference specs list PCIe Gen 4 x8.
- Source links:
  - https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7600-xt.html
- Recommended fix: Change the Chinese glossary to PCIe 4.0 x8 and add "slot may be x16 mechanically; electrical link is x8".
- Confidence: High.

#### F-013: Ecosystem module incorrectly captions MI300 as RDNA3/shared consumer architecture

- Severity: Medium
- Phase/page/module: Module 0.5 AMD ecosystem
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/ecosystem_module.ts:82`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/ecosystem_module_en.ts:88`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/ecosystem_module.ts:57`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/ecosystem_module_en.ts:62`
- Current claim: Caption says consumer RX 7600 XT shares the same amdgpu kernel code as Instinct MI300 (RDNA3).
- Why risky/wrong/stale: MI300 is an Instinct/CDNA-family datacenter accelerator, not an RDNA3 consumer graphics GPU. The broader lesson text correctly says consumer ROCm support is more limited, but the caption muddies a key architecture distinction.
- Verified current info: AMD Instinct MI300 products are positioned for AI/HPC/datacenter acceleration and ROCm, not RDNA3 consumer graphics/display.
- Source links:
  - https://www.amd.com/en/products/accelerators/instinct/mi300/mi300x.html
  - https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/compatibility/compatibility.html
- Recommended fix: Reword to "amdgpu contains support for both Radeon and Instinct families, but RDNA and CDNA paths differ; KFD/ROCm support is prioritized for Instinct."
- Confidence: Medium-high.

#### F-014: RDNA "latest" glossary entry is stale

- Severity: Medium
- Phase/page/module: Glossary
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/glossary_data.ts:23`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/ecosystem_module.ts:122`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/ecosystem_module_en.ts:119`
- Current claim: Chinese glossary says RDNA's current latest is RDNA3, while ecosystem modules mention RDNA4 (2025).
- Why risky/wrong/stale: The app contradicts itself on a basic architecture timeline.
- Verified current info: The site itself already includes RDNA4 as a 2025 architecture generation; kernel.org on the audit date is well beyond the Linux 6.8/RDNA3-only timeframe used elsewhere.
- Source links:
  - AMD GPUOpen/AMD graphics architecture materials should be used for final copy validation: https://gpuopen.com/
- Recommended fix: Remove "latest" from glossary definitions or update to a dated architecture timeline.
- Confidence: Medium.

#### F-015: SVM/cache-coherency claim for Navi33 is over-specific and likely wrong

- Severity: Medium
- Phase/page/module: Module 7 ROCm/KFD memory
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/module7_micro_lessons.ts:471`
- Current claim: Navi33 supports PCIe cache coherency protocols "like CCIX predecessor or CXL-related mechanisms"; KFD then provides coarse/fine-grained coherency options.
- Why risky/wrong/stale: Consumer RDNA3 over PCIe should not be described as generally supporting CPU-GPU cache-coherent PCIe/CXL behavior without a precise AMD/ROCm source. This is advanced architecture content where a wrong claim teaches an incorrect mental model.
- Verified current info: ROCm/HSA SVM behavior is hardware/platform dependent; consumer Radeon support must be checked against ROCm compatibility and official AMD architecture docs. No primary source was found in this audit proving the Navi33 CCIX/CXL statement.
- Source links:
  - https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/compatibility/compatibility.html
  - https://docs.kernel.org/gpu/amdgpu/index.html
- Recommended fix: Mark this as "needs verification"; replace with conservative language about KFD/SVM support depending on GPU, IOMMU, kernel, ROCm release, and platform memory model.
- Confidence: Medium; needs verification.

#### F-016: `rocm-smi --showoccupancy` needs verification

- Severity: Medium
- Phase/page/module: Module 9 LLVM/occupancy lesson
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/module9_micro_lessons.ts:816`
- Current claim: "Use ROCm tool to compute Occupancy: `rocm-smi --showoccupancy` or manually calculate 1536/VGPR_count."
- Why risky/wrong/stale: `rocm-smi` is generally a device management/status CLI, while occupancy calculation is commonly handled by profiler/compiler reports or manual architecture math. The audit did not verify `--showoccupancy` in current official docs.
- Verified current info: Needs verification against current ROCm CLI docs for the exact ROCm version taught.
- Source links:
  - https://rocm.docs.amd.com/
- Recommended fix: Verify the option or replace it with a supported tool/version-specific path, such as compiler resource output, rocprof/omniperf documentation, or an explicitly manual calculation.
- Confidence: Low-medium; needs verification.

#### F-017: AMDGPU stack openness claim is over-broad

- Severity: Medium
- Phase/page/module: Module 0.5 micro-lessons
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/module05_micro_lessons.ts:863`
- Current claim: "AMD's entire software stack (driver + Mesa + ROCm) is open source; only firmware is binary blob."
- Why risky/wrong/stale: This is directionally true for much of AMD's Linux graphics stack but too absolute. ROCm packaging and GPU enablement include binary firmware and some components/distribution artifacts that should be described more carefully.
- Verified current info: Linux AMDGPU and Mesa are open-source; AMDGPU firmware is distributed as binary blobs in linux-firmware; ROCm is an AMD platform with many open-source components but should not be flattened into "entire stack".
- Source links:
  - https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git/
  - https://rocm.docs.amd.com/
  - https://docs.kernel.org/gpu/amdgpu/index.html
- Recommended fix: Rephrase to "the core Linux kernel driver and Mesa userspace drivers are open source; ROCm has substantial open-source components; firmware remains binary."
- Confidence: Medium.

### Low

#### F-018: `TRANSLATION_HANDOFF.md` is stale

- Severity: Low
- Phase/page/module: Docs/reference content
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/TRANSLATION_HANDOFF.md:25`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/TRANSLATION_HANDOFF.md:36`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/TRANSLATION_HANDOFF.md:40`
- Current claim: Only Module 0, Module 0.5, Module 1, and Module 2 Group 1 English translations are complete; multiple `_en.ts` files remain high-priority todo.
- Why risky/wrong/stale: The current repo has many English module files routed through the micro-lesson index. The handoff doc can mislead future editors or reviewers about translation status.
- Verified current info: Inventory found `module2_group2_en.ts`, `module2_group3_en.ts`, `module3_micro_lessons_en.ts`, `module4_micro_lessons_en.ts`, `module6_micro_lessons_en.ts`, and many additional English files.
- Source links:
  - Local inventory with `rg --files client/src/data`.
- Recommended fix: Replace with a generated translation status table or archive the handoff doc as historical.
- Confidence: High.

#### F-019: Lab 1 typo and config checkpoint ambiguity reduce trust

- Severity: Low
- Phase/page/module: Lab 1
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/labs.ts:84`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/labs.ts:90`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/data/labs.ts:93`
- Current claim: Title says "pitfix fixes"; commands expect `CONFIG_DRM_AMDGPU=m` after copying current kernel config but do not explicitly set it.
- Why risky/wrong/stale: The typo is minor, but the config checkpoint can fail on systems where AMDGPU is built-in or disabled.
- Verified current info: The exact result depends on the host's current config. This lab should teach a deterministic `scripts/config --module CONFIG_DRM_AMDGPU` or explain built-in/module outcomes.
- Source links:
  - https://docs.kernel.org/gpu/amdgpu/index.html
- Recommended fix: Fix typo; make the config step deterministic and align it with F-009.
- Confidence: Medium.

#### F-020: Build passes but bundle warning contradicts a "production-ready" impression

- Severity: Low
- Phase/page/module: Home/build health, docs/reference
- File:line:
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/locales/en.json:31`
  - `/Users/liuziao/Desktop/AMD_Driver_Learning/client/src/locales/zh.json:31`
- Current claim: Home presents polished product stats; build emits a large chunk warning.
- Why risky/wrong/stale: This is not a content correctness failure, but it matters because the homepage acts as a credibility surface. The app ships one production JS asset around 4.16 MB uncompressed and Vite warns about chunks over 500 kB.
- Verified current info: `pnpm build` succeeded and emitted: `dist/public/assets/index-DQYLNNOo.js 4,161.66 kB | gzip: 1,184.48 kB`, plus Vite's chunk-size warning.
- Source links:
  - Local `pnpm build` result.
- Recommended fix: Record bundle status in the issue backlog; consider route-level code splitting for content-heavy data modules before making performance claims.
- Confidence: High.

## 5. Findings By Phase/Page

| Phase/Page/Module | Findings |
| --- | --- |
| Home / global shell | F-006, F-007, F-020 |
| Setup Guide | F-001, F-003, F-004, F-005, F-010, F-011 |
| Module 0 intro/curriculum | F-001, F-007 |
| Module 0.5 ecosystem | F-013, F-014, F-017 |
| Module 7 ROCm/KFD | F-001, F-015 |
| Module 9 LLVM/HIP | F-001, F-016 |
| Labs | F-002, F-003, F-019 |
| Testing curriculum | F-002 |
| Source Guide | F-008 |
| Glossary | F-012, F-014 |
| Assessment/mastery checks | No direct correctness defect found; count/stat rollups should be clarified under F-007. |
| Locale files | F-006, F-007, F-020 |
| Docs/references/scripts | F-004, F-008, F-009, F-018 |

## 6. Installation-Specific Issues

Priority install blockers:

1. ROCm support matrix mismatch: F-001.
2. IGT test names: F-002.
3. virtme-ng command/install drift: F-003.
4. Ubuntu `libprocps-dev`/`libproc2-dev` split: F-004.
5. b4 workflow mismatch: F-005.
6. AMDGPU built-in vs module config mismatch: F-009.
7. debugfs `amdgpu_gpu_recover` version sensitivity: F-010.
8. linux-firmware direct install caveats: F-011.

Suggested install page order:

1. Distro and kernel build prerequisites.
2. Deterministic kernel config path.
3. virtme-ng smoke test.
4. IGT build and dynamic test discovery.
5. Optional hardware/dual-machine testing.
6. Optional ROCm/HIP path gated by official compatibility matrix.
7. Optional patch submission with b4/git-send-email.

## 7. Content Freshness Matrix

| Area | Freshness | Risk | Notes |
| --- | --- | --- | --- |
| Setup Guide package installs | Mixed | High | ROCm 7.2 commands match current docs, but Ubuntu package split and virtme-ng drift need fixes. |
| ROCm/HIP content | Stale/over-broad | Critical | Consumer Radeon support must be matrix-gated. |
| RX 7600 XT hardware examples | Mixed | Medium | gfx1102/Navi33 mostly useful; PCIe x16 Chinese glossary wrong; ROCm assumption risky. |
| Kernel source links | Stale by default | High | Source Guide pins Linux 6.8 while kernel.org current is 7.0/7.1-rc. |
| IGT tests | Stale | Critical | Multiple command examples likely fail. |
| b4/git-send-email | Partly current | High | Long flow mostly OK; short "modern way" wrong. |
| linux-firmware | Incomplete | Medium | Needs distro/initramfs/rollback caveats. |
| Glossary | Mixed | Medium | Some definitions are stable; "latest RDNA3" and PCIe x16 need updates. |
| Assessment/mastery checks | Mostly stable | Low | No direct stale API found; stats/counted questions need definition. |
| Locale/SEO metadata | Stale | High | English pages use `zh-CN`; no OG image/sitemap/robots. |
| Reference docs | Stale | Low | Translation handoff and UI spec contain outdated counts/status. |
| Build health | Passing with warning | Low | Tests pass; bundle warning should feed performance backlog. |

## 8. Recommended Upgrade Plan

Phase 1: unblock correctness

1. Patch ROCm copy and module examples to require official compatibility checks.
2. Replace IGT commands with current upstream names and discovery commands.
3. Fix Ubuntu package split and virtme-ng command flow.
4. Correct b4 short workflow.

Phase 2: align curriculum and source snapshots

1. Refresh module/hour/stat text from actual data.
2. Decide whether Source Guide is a Linux 6.8 snapshot or a rolling-current guide.
3. Fix RX 7600 XT glossary and ecosystem architecture captions.

Phase 3: clean credibility/docs

1. Add locale-aware `html lang`, OG image, sitemap, and robots.
2. Update or archive stale handoff/reference docs.
3. Track bundle splitting as a performance task after content corrections.

## 9. Appendix

Commands run:

```bash
rg --files
rg -n "ROCm|gfx1102|RX 7600 XT|virtme|vng|amd_deadlock|amdgpu_test|b4 send|linux-firmware|amdgpu_gpu_recover|libproc2|libprocps|v6.8|html lang|og:image|sitemap|robots" .
pnpm check
pnpm test
pnpm build
pnpm dev
git ls-remote https://gitlab.freedesktop.org/agd5f/linux.git "refs/heads/amd-staging-drm-next"
git ls-remote https://gitlab.freedesktop.org/agd5f/linux.git "refs/heads/drm-next"
curl -L https://gitlab.freedesktop.org/drm/igt-gpu-tools/-/raw/master/tests/amdgpu/amd_deadlock.c
curl -L https://gitlab.freedesktop.org/drm/igt-gpu-tools/-/raw/master/tests/amdgpu/amd_basic.c
```

Build/test results:

- `pnpm check`: passed.
- `pnpm test`: passed, 2 test files, 8 tests.
- `pnpm build`: passed, with Vite chunk-size warning. Main JS asset observed at about 4,161.66 kB uncompressed and 1,184.48 kB gzip.
- Local site inspection: completed on Vite dev server at `http://localhost:3000/`; checked `/en/`, `/en/setup`, `/en/labs/lab-2-gpu-hang`, `/en/source-guide`, `/en/glossary`, `/en/assessment`, and `/zh/`.

Rendered inspection notes:

- `/en/` displayed 14 modules, 640+ hours, 50+ code examples, 40+ interview questions.
- All checked `/en/*` pages reported `html.lang = zh-CN`.
- `/en/setup` rendered the ROCm 7.2 snippets and `amdgpu_gpu_recover` debugfs command.
- No `og:image` meta tag was found in the rendered head.

Unresolved questions:

1. Confirm exact current ROCm status for RX 7600 XT/gfx1102 on Linux by model, ROCm version, distro, kernel, and workload. The content must not assume support until this is verified from AMD's matrix.
2. Confirm whether `amdgpu_gpu_recover` exists in the exact kernel version the guide wants to teach; current master inspection made this look version-dependent.
3. Confirm whether `rocm-smi --showoccupancy` exists in the targeted ROCm release; if not, replace with a supported profiler/compiler resource workflow.
4. Decide whether the curriculum should target current kernel.org stable/mainline, AMD `amd-staging-drm-next`, or a pinned educational snapshot.

