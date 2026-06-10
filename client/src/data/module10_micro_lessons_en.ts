// ============================================================
// AMD Linux Driver Learning Platform - Module 10 Micro-Lessons (English)
// Module 10: Testing & CI
// 4 lessons in 2 groups, ~15 min each, total ~60 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module10MicroLessonsEn: MicroLessonModule = {
  moduleId: 'testing',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 10.1: Testing Framework
    // ════════════════════════════════════════════════════════════
    {
      id: '10-1',
      number: '10.1',
      title: 'testing framework',
      titleEn: 'Testing Frameworks',
      icon: 'FlaskConical',
      description: 'Deeply understand the architecture and usage of the IGT GPU Tools test framework, learn to write amdgpu-specific IGT test cases, from reading existing tests to independently writing new tests.',
      lessons: [
        // ── Lesson 10.1.1 ──────────────────────────────────────
        {
          id: '10-1-1',
          number: '10.1.1',
          title: 'Detailed explanation of IGT GPU testing framework',
          titleEn: 'IGT GPU Tools Framework Deep Dive',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['IGT', 'testing', 'GPU', 'framework', 'amdgpu'],
          concept: {
            summary: 'IGT GPU Tools is the standard testing framework for Linux GPU drivers. It provides a rich set of C macros and helper libraries that let you write structured GPU tests - from simple GEM buffer allocation to complex multi-monitor atomic commits. Understanding the architecture of IGT is the basis for writing high-quality driver tests.',
            explanation: [
              'IGT (Intel GPU Tools, now vendor-neutral) is a testing framework common to all major Linux GPU drivers. Its source code is at https://gitlab.freedesktop.org/drm/igt-gpu-tools and contains more than 1000 test cases. For amdgpu development, IGT is the primary tool for verifying whether driver modifications introduce regressions.',
              'The core architecture of IGT revolves around three concepts: test, subtest and fixture. An IGT test file usually contains an igt_main block (or igt_simple_main for a single test), which internally defines multiple subtests via igt_subtest. Fixtures are defined via igt_fixture blocks for initialization and cleanup code shared between subtests. This structure allows you to organize multiple related but independent tests in a single file.',
              'IGT provides a wealth of assertion macros: igt_assert(cond) is the most basic assertion. It terminates the current subtest and reports FAIL when it fails; igt_assert_eq(a, b) compares two values ​​and prints two values ​​when it fails to facilitate debugging; igt_assert_fd(fd) asserts that the file descriptor is valid; igt_assert_lte(a, b) asserts a <= b. These macros use longjmp internally to implement jumps to ensure that resources can be properly cleaned up after test failures.',
              'igt_require(cond) is another key macro - when the condition is not met, it skips (SKIPs) the current subtest instead of marking it as FAIL. This is used to handle differences in hardware capabilities: for example, a test requires a VCN video engine, but the test machine may not have it, in which case igt_require will skip it gracefully instead of reporting an error. This is important for running the same set of tests on different hardware.',
              'The IGT tests of amdgpu are concentrated in the tests/amdgpu/ directory, including: amd_basic (basic function test: opening the device, querying information), amd_cs_nop (command submission no-operation test), amd_deadlock (deadlock detection test), amd_pci_unplug (hot plug test), etc. Each file tests a specific aspect of the amdgpu driver. In addition, common DRM/KMS tests (such as kms_flip, kms_cursor_crc, kms_atomic) in the tests/ root directory will also be run on amdgpu.',
              'Inside IGT\'s tests/amdgpu/ directory, tests are organized by subsystem: amd_basic (sanity: BO alloc, CS submit, device query), amd_deadlock (stress: concurrent CS + reset, identifies lock ordering bugs), amd_pci_unplug (hotplug: tests safe GPU removal under load), amd_cs (command submission: various IB sizes, priorities, preemption), amd_vm (virtual memory: mapping, unmapping, fault injection), amd_hotunplug (PCI remove + re-probe simulation), and amd_abm (display: adaptive backlight management). When verifying your amdgpu patch, the selection rule is: always run amd_basic (quick sanity), then run the test matching your change area — e.g., if you modified amdgpu_cs.c, run amd_cs_nop; if you changed amdgpu_vm.c, run amd_vm; if you changed display/dc/, run kms_* tests. Always list the real subtest names first (./build/tests/amdgpu/amd_basic --list-subtests), since they change upstream. A minimum sanity command is: sudo ./build/tests/amdgpu/amd_basic --run-subtest cs-gfx-with-IP-GFX.',
            ],
            keyPoints: [
              'IGT is the standard testing framework for Linux GPU drivers, with 1000+ test cases covering all DRM functions',
              'igt_main / igt_subtest / igt_fixture three-tier structure organizes tests, subtests and shared initialization',
              'The igt_assert series of macros are used for assertions, and the failure mark is FAIL; igt_require is used for precondition checking, and the failure mark is SKIP.',
              'amdgpu-specific tests are in the tests/amdgpu/ directory, and general DRM tests are also run on amdgpu',
              'There are four statuses of IGT test results: PASS / FAIL / SKIP / TIMEOUT',
              'Run a single test: ./build/tests/amdgpu/amd_basic; run a subtest: --run-subtest "subtest-name"',
              'tests/amdgpu/ organized by subsystem: amd_basic, amd_cs_nop, amd_vm, amd_deadlock, amd_pci_unplug',
            ],
          },
          diagram: {
            title: 'IGT test framework architecture and execution process',
            content: `IGT GPU Tools Architecture Overview

IGT test file structure execution process
─────────────────                          ────────

tests/amdgpu/amd_basic.c                  $ ./build/tests/amd_basic
┌──────────────────────────┐                     │
│ #include "igt.h"         │                     ▼
│ #include "lib/amdgpu/ │ igt_main entry
│          amd_ip_blocks.h"│                     │
│                          │              ┌──────┴──────┐
│ igt_main {               │              │             │
│                          │              ▼             ▼
│   igt_fixture {          │         igt_fixture   igt_fixture
│     fd = drm_open_...(); │         (setup)       (teardown)
│     amdgpu_device_init();│              │
│   }                      │              ▼
│                          │    ┌─────────┴─────────┐
│   igt_subtest("query") { │    ▼                   ▼
│     igt_assert(...);     │  subtest "query"    subtest "memory"
│   }                      │    │                   │
│                          │    ├─ igt_assert()     ├─ igt_require()
│   igt_subtest("memory") {│    │  PASS / FAIL      │  SKIP if N/A
│     igt_require(has_vram);│   │                   ├─ igt_assert()
│     igt_assert_eq(...);  │    │                   │  PASS / FAIL
│   }                      │    ▼                   ▼
│                          │  ┌──────────────────────┐
│   igt_fixture {          │  │  Results Summary     │
│     amdgpu_device_deinit │  │  query:    PASS      │
│     close(fd);           │  │  memory:   PASS      │
│   }                      │  │  Total: 2/2 PASS     │
│ }                        │  └──────────────────────┘
└──────────────────────────┘

IGT test result status:
PASS ✓ All assertions pass
FAIL ✗ An igt_assert failed
SKIP ○ igt_require conditions are not met (hardware does not support it, etc.)
TIMEOUT test exceeds maximum running time (default 120s)`,
            caption: 'The IGT test consists of three parts: igt_main entry, igt_fixture shared initialization/cleaning, and igt_subtest independent sub-test. Each subtest runs independently and does not affect each other.',
          },
          codeWalk: {
            title: 'Anatomy of an IGT amdgpu test (illustrative, modeled on amd_basic.c)',
            file: 'tests/amdgpu/amd_basic.c (illustrative)',
            language: 'c',
            code: `/*IGT amdgpu basic test - GEM Buffer Object allocation and information query
 *Illustrative/simplified — the subtest NAMES below (query-info, gem-create,
 *vram-gtt-migration) are made up for teaching. The real tests/amdgpu/amd_basic.c
 *uses dynamic subtests like memory-alloc, cs-gfx-with-IP-GFX, userptr-with-IP-DMA.
 *Always run --list-subtests to see the actual names.
 */
#include "igt.h"
#include <amdgpu.h>
#include <amdgpu_drm.h>

static int fd;                    /*DRM device file descriptor*/
static amdgpu_device_handle dev;  /*libdrm amdgpu device handle*/
static uint32_t major_ver, minor_ver;

igt_main
{
    /*igt_fixture is executed once before all subtests
     *Used to open devices and initialize shared resources */
    igt_fixture {
        fd = drm_open_driver(DRIVER_AMDGPU);
        /*drm_open_driver opens /dev/dri/card* and verifies it is amdgpu */
        igt_require(fd >= 0);

        int r = amdgpu_device_initialize(fd, &major_ver,
                                         &minor_ver, &dev);
        igt_assert_eq(r, 0);
        /*At this time dev can call all libdrm/amdgpu API */
    }

    igt_subtest("query-info") {
        struct amdgpu_gpu_info gpu_info = {};
        int r = amdgpu_query_gpu_info(dev, &gpu_info);
        igt_assert_eq(r, 0);
        /*Navi33 should have non-zero VRAM size */
        igt_assert(gpu_info.vram_size > 0);
        igt_info("GPU VRAM: %llu MB\\n",
                 gpu_info.vram_size / (1024 * 1024));
    }

    igt_subtest("gem-create") {
        struct amdgpu_bo_alloc_request req = {};
        amdgpu_bo_handle bo;
        /*Allocate 4KB VRAM buffer */
        req.alloc_size = 4096;
        req.phys_alignment = 4096;
        req.preferred_heap = AMDGPU_GEM_DOMAIN_VRAM;

        int r = amdgpu_bo_alloc(dev, &req, &bo);
        igt_assert_eq(r, 0);
        /*Assert that bo handle is valid */
        igt_assert(bo != NULL);

        /*Cleanup: Release buffer object */
        r = amdgpu_bo_free(bo);
        igt_assert_eq(r, 0);
    }

    igt_subtest("vram-gtt-migration") {
        /*This test requires the GPU to support both VRAM and GTT */
        struct drm_amdgpu_info_vram_gtt vram_gtt = {};
        igt_require(amdgpu_query_heap_info(dev,
            AMDGPU_GEM_DOMAIN_VRAM, 0, &vram_gtt) == 0);
        igt_require(vram_gtt.vram_size > 0);

        /*... actual migration test code ... */
        igt_info("VRAM→GTT migration test passed\\n");
    }

    /*igt_fixture is executed once after all subtests
     *Used to release shared resources */
    igt_fixture {
        amdgpu_device_deinitialize(dev);
        drm_close_driver(fd);
    }
}`,
            annotations: [
              'igt_main is the entry macro of IGT, which expands into main() + test framework initialization code',
              'drm_open_driver(DRIVER_AMDGPU) traverses /dev/dri/card* until it finds the device driven by amdgpu',
              'amdgpu_device_initialize() is the initialization function of libdrm/amdgpu and returns the device handle',
              'igt_assert_eq(r, 0) asserts that the return value is 0. If it fails, the actual value will be printed for debugging.',
              'igt_require(vram_gtt.vram_size > 0) skips devices that do not support VRAM (such as APU without independent VRAM)',
              'igt_info() prints information to the test output and does not affect the PASS/FAIL status',
            ],
            explanation: 'This test shows the typical structure of IGT: igt_fixture opens the device, multiple igt_subtests each test a function point, and finally igt_fixture cleans up resources. Note the use of igt_require - a VRAM-dependent subtest will gracefully SKIP rather than FAIL on devices without VRAM. This mode allows the same set of tests to run correctly on different hardware. (The subtest names here are illustrative; the real amd_basic.c uses names like memory-alloc and cs-gfx-with-IP-GFX — check --list-subtests.)',
          },
          miniLab: {
            title: 'Compile and run IGT amdgpu tests',
            objective: 'Compile IGT GPU Tools from source, run amdgpu basic tests, and learn to interpret test output.',
            steps: [
              'Clone IGT source code: git clone https://gitlab.freedesktop.org/drm/igt-gpu-tools.git && cd igt-gpu-tools',
              'Install dependencies: sudo apt install meson ninja-build libdrm-dev libcairo2-dev libpixman-1-dev libudev-dev libprocps-dev libjson-c-dev libdw-dev flex bison',
              'Compile: meson build && ninja -C build',
              'List all amdgpu tests: ls build/tests/amdgpu/',
              'Run basic tests: sudo ./build/tests/amdgpu/amd_basic (requires root access to GPU)',
              'View the real subtest names first (they change upstream): ./build/tests/amdgpu/amd_basic --list-subtests',
              'Run a single subtest (use a name from --list-subtests, e.g. memory-alloc): sudo ./build/tests/amdgpu/amd_basic --run-subtest "memory-alloc"',
              'Run another amdgpu test binary, e.g. command-submission no-op: sudo ./build/tests/amdgpu/amd_cs_nop',
            ],
            expectedOutput: `$ sudo ./build/tests/amdgpu/amd_basic
IGT-Version: 1.28 (x86_64)
Starting subtest: memory-alloc
Subtest memory-alloc: SUCCESS (0.003s)
Starting dynamic subtest: cs-gfx-with-IP-GFX
Dynamic subtest cs-gfx-with-IP-GFX: SUCCESS (0.012s)

$ ./build/tests/amdgpu/amd_basic --list-subtests
memory-alloc
userptr-with-IP-DMA
cs-gfx-with-IP-GFX
cs-compute-with-IP-COMPUTE
cs-sdma-with-IP-DMA
...`,
            hint: 'If the test reports "Permission denied", make sure to use sudo. If "No amdgpu device found" is reported, check whether the amdgpu driver has been loaded: lsmod | grep amdgpu. Some tests may require an idle GPU (no desktop environment to run).',
          },
          debugExercise: {
            title: 'Fix incorrect IGT test code',
            language: 'c',
            description: 'The following IGT test code has multiple issues that prevent it from running correctly. Find all problems.',
            question: 'What are the issues with this IGT test? Why might a test falsely report a PASS or leak resources?',
            buggyCode: `#include "igt.h"
#include <amdgpu.h>

igt_main
{
    int fd;
    amdgpu_device_handle dev;

    /*BUG 1: No error checking in fixture */
    igt_fixture {
        fd = drm_open_driver(DRIVER_AMDGPU);
        amdgpu_device_initialize(fd, NULL, NULL, &dev);
    }

    igt_subtest("alloc-test") {
        struct amdgpu_bo_alloc_request req = {};
        amdgpu_bo_handle bo;
        req.alloc_size = 4096;
        req.preferred_heap = AMDGPU_GEM_DOMAIN_VRAM;
        amdgpu_bo_alloc(dev, &req, &bo);
        /*BUG 2: No assertion of allocation result */
        /*BUG 3: bo is not released — resource leak */
    }

    /*BUG 4: No teardown fixture */
}`,
            hint: 'Check four aspects: initialization error handling, missing assertions, resource leaks, and cleanup fixtures.',
            answer: 'Four problems: (1) The return value of amdgpu_device_initialize in the fixture is not checked - if the initialization fails, dev is an invalid handle, and all subsequent sub-tests will operate with invalid handles, which may cause segfault rather than meaningful test failures. Fix: int r = amdgpu_device_initialize(...); igt_assert_eq(r, 0); (2) The return value of amdgpu_bo_alloc is not asserted - even if the allocation fails (returns a non-zero error code), the test will not report FAIL, which is a typical cause of false positive PASS. Fix: igt_assert_eq(amdgpu_bo_alloc(dev, &req, &bo), 0); (3) allocated bo was not freed by calling amdgpu_bo_free(bo) - causing a GPU memory leak when running a large number of subtests, potentially causing subsequent tests to fail due to insufficient memory. Fix: Add amdgpu_bo_free(bo); at the end of subtest (4) Missing teardown igt_fixture - fd and dev are not closed and deinitialized. Fix: Add igt_fixture { amdgpu_device_deinitialize(dev); drm_close_driver(fd); }. These four types of problems are the most frequently pointed out in code reviews.',
          },
          interviewQ: {
            question: 'Describe how you would write an IGT test for a new amdgpu feature. What is your process from test design to final submission?',
            difficulty: 'medium',
            hint: 'Start by understanding the UAPI interface of the function under test, designing positive and negative test cases, using igt_require to handle hardware differences, and ensuring resources are properly cleaned up.',
            answer: 'The complete process of writing IGT tests: (1) Understand the functions: Read the UAPI header file (include/uapi/drm/amdgpu_drm.h) to understand the ioctl interface and parameter range exposed by the new function, and read the kernel-side implementation to understand the boundary conditions. (2) Test design: Design positive tests (valid parameters → expected results) and negative tests (invalid parameters → expected errors). For example, for BO allocation: positive test verifies that VRAM/GTT/GDS each heap is allocated successfully, negative test verifies that size=0 or extremely large size returns -EINVAL/-ENOMEM. (3) Write code: Create tests/amdgpu/amd_new_feature.c, use igt_main + igt_fixture + igt_subtest structure, each subtest covers a scenario. Use igt_require to check whether the hardware supports this feature. (4) Build integration: Add new test files in tests/amdgpu/meson.build. (5) Local verification: Run the test on a real GPU to confirm all PASS, and confirm that the relevant subtests are correct SKIP on an old GPU that does not support this function. (6) Submit: Generate patches and send them to the igt-dev@lists.freedesktop.org mailing list.',
            amdContext: 'AMD may ask you to design an IGT test case on-site during the interview. The key is to show that you understand the difference between positive/negative testing, the use of igt_require, and the importance of resource management.',
          },
        },

        // ── Lesson 10.1.2 ──────────────────────────────────────
        {
          id: '10-1-2',
          number: '10.1.2',
          title: 'Writing amdgpu IGT tests',
          titleEn: 'Writing amdgpu IGT Tests',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['IGT', 'amdgpu', 'libdrm', 'VRAM', 'test-writing'],
          concept: {
            summary: 'This section writes a complete amdgpu IGT test from scratch - a VRAM allocation stress test. You will write positive and negative tests using the libdrm/amdgpu API (amdgpu_device_initialize, amdgpu_bo_alloc, amdgpu_cs_submit) and integrate into the meson build system.',
            explanation: [
              'The first step in writing amdgpu IGT tests is understanding the libdrm/amdgpu API. libdrm provides a complete user-mode API for amdgpu: amdgpu_device_initialize() initializes the device and obtains the handle; amdgpu_bo_alloc() allocates GPU buffer object (BO); amdgpu_bo_va_op() manages GPU virtual address mapping; amdgpu_cs_submit() submits commands to the GPU for execution. These APIs are declared in <amdgpu.h> and internally communicate with the kernel amdgpu driver through ioctl.',
              'A good test should include both positive tests and negative tests. Head-on testing verifies that "correct input produces correct results" - for example allocating a 4KB VRAM buffer should succeed. Negative tests verify that "bad input is correctly rejected" - for example, allocating a buffer with size=0 should return -EINVAL, and allocating a buffer that exceeds the total amount of VRAM should return -ENOMEM. Negative tests are particularly important in kernel code because they verify the driver\'s error handling paths.',
              'Integrating new tests into IGT\'s meson build system is simple: add your test filename to the test list in tests/amdgpu/meson.build. meson will automatically compile and register it as a runnable test. Run ninja -C build to recompile, then execute with sudo ./build/tests/amdgpu/amd_your_test.',
              'When writing tests involving command submission (CS), you need to: create an IB (Indirect Buffer) to store GPU commands; use amdgpu_bo_alloc to allocate memory for the IB; use amdgpu_bo_va_op to map the IB to the GPU virtual address space; use amdgpu_cs_submit to submit the IB to a specific ring (GFX, SDMA, etc.); use amdgpu_cs_query_fence_status waits for the command to complete. For simple functional testing, submitting a NOP (no operation) package is sufficient.',
              'Test naming and organization are also important. The convention for IGT is that the file name describes the function under test (e.g., amd_vram_alloc), and the subtest names are descriptive names separated by hyphens (e.g., "basic-alloc", "oversize-alloc-negative", "multi-bo-stress"). Good naming allows CI reports to quickly identify which feature is having problems.',
            ],
            keyPoints: [
              'libdrm/amdgpu API: amdgpu_device_initialize → amdgpu_bo_alloc → amdgpu_cs_submit',
              'Positive tests verify correct behavior (assignment succeeds), negative tests verify error handling (invalid parameters are rejected)',
              'Integrated into meson build: Just add the file name in tests/amdgpu/meson.build',
              'Command submission test process: alloc IB → va_op map → cs_submit → query_fence',
              'Subtest naming convention: descriptive hyphenated names, such as "basic-alloc", "oversize-negative"',
              'igt_require checks hardware capabilities to ensure that tests can pass or SKIP correctly on different GPUs',
            ],
          },
          diagram: {
            title: 'Complete workflow for writing amdgpu IGT tests',
            content: `Writing an amdgpu IGT test from scratch

Step 1: Create test files
─────────────────────
tests/amdgpu/
├── amd_basic.c            ←Existing basic tests
├── amd_cs_nop.c           ←Existing CS NOP tests
├── amd_deadlock.c         ←Existing deadlock tests
├── amd_vram_stress.c      ←Your new test ★
└── meson.build            ←Register for a new test here

Step 2: Test file structure
─────────────────────
amd_vram_stress.c
┌──────────────────────────────────────────────┐
│ #include "igt.h"                              │
│ #include <amdgpu.h>                           │
│                                               │
│ igt_main {                                    │
│   igt_fixture { /*Turn on the device*/ }              │
│                                               │
│   /*positive test*/                               │
│   igt_subtest("basic-alloc")      → PASS ✓    │
│   igt_subtest("multi-size-alloc") → PASS ✓    │
│   igt_subtest("vram-gtt-both")    → PASS ✓    │
│                                               │
│   /*negative test*/                               │
│   igt_subtest("zero-size-negative")  → PASS ✓ │
│   igt_subtest("oversize-negative")   → PASS ✓ │
│                                               │
│   /*stress test*/                               │
│   igt_subtest("stress-1000-allocs")  → PASS ✓ │
│                                               │
│   igt_fixture { /*Turn off the device*/ }              │
│ }                                             │
└──────────────────────────────────────────────┘

Step 3: Register to the build system
─────────────────────
# tests/amdgpu/meson.build
amdgpu_tests = [
    'amd_basic',
    'amd_cs_nop',
    'amd_deadlock',
    'amd_vram_stress',    ←Add new test
]

Step 4: Compile & Run
─────────────────────
$ ninja -C build
$ sudo ./build/tests/amdgpu/amd_vram_stress
  Subtest basic-alloc:          SUCCESS (0.001s)
  Subtest multi-size-alloc:     SUCCESS (0.003s)
  Subtest zero-size-negative:   SUCCESS (0.001s)
  Subtest oversize-negative:    SUCCESS (0.002s)
  Subtest stress-1000-allocs:   SUCCESS (0.234s)`,
            caption: 'The four-step process for writing IGT tests: Create file → Write test → Register build → Compile and run. Positive and negative testing are indispensable.',
          },
          codeWalk: {
            title: 'Full VRAM allocation IGT test',
            file: 'tests/amdgpu/amd_vram_stress.c',
            language: 'c',
            code: `/*amd_vram_stress.c — VRAM allocation stress test
 *Verify GEM BO allocation and deallocation paths for amdgpu
 */
#include "igt.h"
#include <amdgpu.h>
#include <amdgpu_drm.h>

static int fd;
static amdgpu_device_handle dev;
static struct amdgpu_gpu_info gpu_info;

static amdgpu_bo_handle
alloc_bo(uint64_t size, uint32_t domain)
{
    struct amdgpu_bo_alloc_request req = {
        .alloc_size = size,
        .phys_alignment = 4096,
        .preferred_heap = domain,
    };
    amdgpu_bo_handle bo;
    int r = amdgpu_bo_alloc(dev, &req, &bo);
    return r == 0 ? bo : NULL;
}

igt_main
{
    igt_fixture {
        uint32_t major, minor;
        fd = drm_open_driver(DRIVER_AMDGPU);
        igt_require(fd >= 0);
        igt_assert_eq(amdgpu_device_initialize(fd,
            &major, &minor, &dev), 0);
        igt_assert_eq(amdgpu_query_gpu_info(dev,
            &gpu_info), 0);
    }

    /*=== Positive test === */
    igt_subtest("basic-vram-alloc") {
        amdgpu_bo_handle bo = alloc_bo(4096,
            AMDGPU_GEM_DOMAIN_VRAM);
        igt_assert(bo != NULL);
        igt_assert_eq(amdgpu_bo_free(bo), 0);
    }

    igt_subtest("basic-gtt-alloc") {
        amdgpu_bo_handle bo = alloc_bo(4096,
            AMDGPU_GEM_DOMAIN_GTT);
        igt_assert(bo != NULL);
        igt_assert_eq(amdgpu_bo_free(bo), 0);
    }

    igt_subtest("multi-size-alloc") {
        uint64_t sizes[] = {4096, 64*1024, 1*1024*1024,
                            16*1024*1024};
        for (int i = 0; i < ARRAY_SIZE(sizes); i++) {
            amdgpu_bo_handle bo = alloc_bo(sizes[i],
                AMDGPU_GEM_DOMAIN_VRAM);
            igt_assert(bo != NULL);
            igt_assert_eq(amdgpu_bo_free(bo), 0);
        }
    }

    /*=== Negative test === */
    igt_subtest("zero-size-negative") {
        /*size=0 should be rejected by the driver */
        amdgpu_bo_handle bo = alloc_bo(0,
            AMDGPU_GEM_DOMAIN_VRAM);
        igt_assert(bo == NULL);
    }

    igt_subtest("oversize-negative") {
        /*Allocating memory that exceeds the total amount of VRAM should fail */
        igt_require(gpu_info.vram_size > 0);
        uint64_t oversize = gpu_info.vram_size * 2;
        amdgpu_bo_handle bo = alloc_bo(oversize,
            AMDGPU_GEM_DOMAIN_VRAM);
        igt_assert(bo == NULL);
    }

    /*=== Stress Test === */
    igt_subtest("stress-alloc-free-cycle") {
        const int count = 1000;
        for (int i = 0; i < count; i++) {
            amdgpu_bo_handle bo = alloc_bo(4096,
                AMDGPU_GEM_DOMAIN_VRAM);
            igt_assert(bo != NULL);
            igt_assert_eq(amdgpu_bo_free(bo), 0);
        }
    }

    igt_fixture {
        amdgpu_device_deinitialize(dev);
        drm_close_driver(fd);
    }
}`,
            annotations: [
              'The alloc_bo auxiliary function encapsulates amdgpu_bo_alloc to simplify the code in sub-tests',
              'AMDGPU_GEM_DOMAIN_VRAM is allocated in GPU memory, AMDGPU_GEM_DOMAIN_GTT is allocated in system memory (GPU accessible)',
              '"zero-size-negative" is a negative test - verify that the driver correctly rejects invalid input',
              '"oversize-negative" Use igt_require to ensure the device has VRAM information, then test for overcommitment',
              '"stress-alloc-free-cycle" loops 1000 allocations/frees to detect memory leaks and race conditions',
              'Each igt_subtest runs independently - FAIL of one subtest does not affect other subtests',
            ],
            explanation: 'This complete test file demonstrates best practices for IGT test writing: helper functions to reduce duplicate code, positive tests to cover normal paths, negative tests to cover error handling, and stress tests to detect resource leaks. Pay special attention to negative testing - the kernel driver must handle all invalid input correctly, otherwise it may lead to a kernel panic or security vulnerability.',
          },
          miniLab: {
            title: 'Write your first amdgpu IGT test',
            objective: 'Based on the code template above, write an IGT test that tests GPU information query and run it on a real GPU.',
            steps: [
              'Create amd_query_test.c under igt-gpu-tools/tests/amdgpu/',
              'Implement igt_main and initialize amdgpu device in fixture',
              'Added igt_subtest("query-vram-size") to verify VRAM size > 0',
              'Added igt_subtest("query-fw-version") to query GFX firmware version and verify non-zero',
              'Add "amd_query_test" to the test list in tests/amdgpu/meson.build',
              'Compile: ninja -C build',
              'Run the test: sudo ./build/tests/amdgpu/amd_query_test',
              'Verify all subtests PASS: --list-subtests and run them one by one',
            ],
            expectedOutput: `$ sudo ./build/tests/amdgpu/amd_query_test
IGT-Version: 1.28 (x86_64)
Starting subtest: query-vram-size
GPU VRAM: 8176 MB
Subtest query-vram-size: SUCCESS (0.001s)
Starting subtest: query-fw-version
GFX FW version: 0x006d
Subtest query-fw-version: SUCCESS (0.001s)`,
            hint: 'Use amdgpu_query_firmware_version() to query the firmware version. Refer to the existing query tests in tests/amdgpu/amd_basic.c. If the compilation error is that the header file cannot be found, make sure libdrm-dev and libdrm-amdgpu1 are installed.',
          },
          debugExercise: {
            title: 'Find logic errors in IGT testing',
            language: 'c',
            description: 'The following test claims to verify the upper limit of VRAM allocation, but actually has a logic flaw that causes it to never find the real bug.',
            question: 'Why is this test not effective at detecting VRAM allocation boundary issues?',
            buggyCode: `igt_subtest("vram-boundary-test") {
    uint64_t total_vram = gpu_info.vram_size;
    uint64_t alloc_size = total_vram / 2;

    /*Allocate 50% VRAM — should succeed */
    amdgpu_bo_handle bo1 = alloc_bo(alloc_size,
        AMDGPU_GEM_DOMAIN_VRAM);
    igt_assert(bo1 != NULL);

    /*Redistribute 50% — should also succeed */
    amdgpu_bo_handle bo2 = alloc_bo(alloc_size,
        AMDGPU_GEM_DOMAIN_VRAM);
    igt_assert(bo2 != NULL);

    /*reallocate 50% — should fail */
    amdgpu_bo_handle bo3 = alloc_bo(alloc_size,
        AMDGPU_GEM_DOMAIN_VRAM);
    igt_assert(bo3 == NULL);  /*Expect to fail*/

    /*Clean up */
    amdgpu_bo_free(bo1);
    amdgpu_bo_free(bo2);
}`,
            hint: 'Think about the actual usage of VRAM - the desktop environment, firmware, other processes already use some of the VRAM. In addition, the amdgpu driver supports automatic migration from VRAM to GTT.',
            answer: 'There are two fundamental problems with this test: (1) VRAM is not empty: after the system is started, part of the VRAM has been occupied by the framebuffer of the desktop environment, the GPU firmware reserved area, and other processes. The assumption of total_vram / 2 does not take into account used VRAM. The allocation of bo1 and bo2 may fail because there is insufficient VRAM available for total_vram, causing the assert to fail - this is a false positive. Fix: Use amdgpu_query_heap_info to get max_allocation and current available amount instead of assuming full VRAM is available. (2) The driver may automatically migrate: When VRAM is insufficient, the TTM memory manager of the amdgpu driver may migrate the old BO from VRAM to GTT (system memory) to make room for new allocations. So the allocation of bo3 might succeed (bo1 or bo2 was migrated to GTT), causing igt_assert(bo3 == NULL) to fail - which is also a false positive. To properly test VRAM boundaries, migration needs to be blocked using the AMDGPU_GEM_CREATE_NO_EVICT flag.',
          },
          interviewQ: {
            question: 'How do you write a complete test case for a new ioctl added by the amdgpu driver? Design positive and negative tests.',
            difficulty: 'hard',
            hint: 'Taking a hypothetical new ioctl (such as setting GPU priority) as an example, design a test matrix that covers the normal process, boundary conditions, error parameters, and permission checks.',
            answer: 'Assuming that DRM_IOCTL_AMDGPU_SET_PRIORITY (set the GPU scheduling priority of the process) is added, my test design: Positive test: (1) set-default-priority: set the default priority NORMAL → verify ioctl returns 0; (2) set-high-priority: set HIGH priority as root → verify return 0 and pass GET_PRIORITY Confirm to take effect; (3) set-low-priority: Set LOW → Verify to take effect; (4) priority-affects-scheduling: Create two processes, HIGH and LOW, and submit the same workload, HIGH should be completed faster. Negative tests: (5) invalid-priority-value: pass in priority=9999 (out of range) → verification returns -EINVAL; (6) invalid-fd: pass in an fd that is not amdgpu → verification returns -ENODEV; (7) no-permission-high: set HIGH as a non-root user → verification returns -EPERM (required CAP_SYS_NICE); (8) double-set: Set two different priorities in a row → verify that the last one takes effect. Boundary test: (9) set-after-close: set after closing fd → verify that it does not crash. Each subtest is wrapped with igt_subtest, and permission-related tests are pre-checked with igt_require(getuid() == 0) or igt_require(getuid() != 0).',
            amdContext: 'AMD asks you to design test cases in the interview to test your system thinking - not just "can it work", but also "under what circumstances will a problem occur". Covering positive, negative, boundary and permission testing demonstrates your understanding of driver security.',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 10.2: CI and Kernel Testing
    // ════════════════════════════════════════════════════════════
    {
      id: '10-2',
      number: '10.2',
      title: 'CI and kernel testing',
      titleEn: 'CI & Kernel Testing',
      icon: 'RefreshCw',
      description: 'Master the use of the kernel self-test framework (kselftest and KUnit), understand the architecture of AMD CI infrastructure, learn to interpret CI pipeline results and handle regression testing.',
      lessons: [
        // ── Lesson 10.2.1 ──────────────────────────────────────
        {
          id: '10-2-1',
          number: '10.2.1',
          title: 'Kernel Selftests and KUnit',
          titleEn: 'Kernel Selftests & KUnit',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['kselftest', 'KUnit', 'TAP', 'drm_buddy', 'unit-test'],
          concept: {
            summary: 'The Linux kernel has two complementary testing frameworks: kselftest for functional tests run from user space (tools/testing/selftests/), and KUnit for unit tests run in kernel space (via the kunit_test module). The DRM subsystem makes extensive use of both - kselftest/drm/ tests the UAPI interface, and KUnit tests internal algorithms such as the drm_buddy memory allocator.',
            explanation: [
              'Kernel Selftests (kselftest) is a user-mode testing framework for the Linux kernel. The test code is under tools/testing/selftests/, and each subsystem has its own directory. For DRM/GPU, the relevant tests are in tools/testing/selftests/drm/. These tests are compiled into userspace programs that interact with the kernel via ioctls. Running mode: make -C tools/testing/selftests/drm run_tests. kselftest outputs results in TAP (Test Anything Protocol) format, which is easy to be parsed by the CI system.',
              'KUnit is the built-in unit testing framework (Kernel Unit Testing Framework) of the Linux kernel, introduced since Linux 5.5. Unlike kselftest, KUnit tests run in kernel space - you can directly test functions and data structures inside the kernel without going through the ioctl interface. KUnit tests are usually compiled as kernel modules that automatically run all test cases when loaded.',
              'KUnit\'s core macro: KUNIT_ASSERT_EQ(test, a, b) asserts a == b, and immediately stops the current test if it fails (similar to assert); KUNIT_EXPECT_EQ(test, a, b) also asserts a == b, but continues to run subsequent assertions if it fails (similar to soft assert). ASSERT is used for fatal errors (there is no point in continuing), EXPECT is used for non-fatal errors (you want to see all failed items).',
              'drm_buddy_test.c is one of the most typical KUnit tests in the DRM subsystem. drm_buddy is DRM\'s buddy allocator, used to manage the physical address space of GPU VRAM. This KUnit test verifies the correctness of core algorithms such as allocation, deallocation, merging, and alignment. Because these algorithms are purely internal implementations of the kernel state (not exposed to user space), they can only be tested with KUnit, not kselftest.',
              'The output of KUnit is also in TAP format. You can run KUnit tests in two ways: (1) after compiling as a module insmod: insmod drm_buddy_test.ko, and then dmesg to view the results; (2) using KUnit\'s Python runner: python3 tools/testing/kunit/kunit.py run --kconfig_add CONFIG_DRM_BUDDY_SELFTEST=m. The latter is more convenient because it automatically configures, compiles, runs and parses the results.',
            ],
            keyPoints: [
              'kselftest runs in user mode and tests the UAPI interface through ioctl; KUnit runs in kernel mode and directly tests internal functions',
              'KUnit double-level assertion: KUNIT_ASSERT (fatal) stops the test vs. KUNIT_EXPECT (non-fatal) continues running',
              'drm_buddy_test.c tests the DRM buddy allocator - purely internal kernel algorithms can only be tested with KUnit',
              'Both output results in TAP format, which can be automatically parsed by CI systems',
              'kselftest run: make -C tools/testing/selftests/drm run_tests',
              'KUnit run: python3 tools/testing/kunit/kunit.py run or insmod + dmesg',
            ],
          },
          diagram: {
            title: 'kselftest vs KUnit comparison and application scenarios',
            content: `Comparison of two testing frameworks for Linux kernel

                    kselftest                          KUnit
                    ─────────                          ─────
Running space User space (Ring 3) Kernel space (Ring 0)
Code location tools/testing/selftests/ drivers/gpu/drm/tests/
Test target UAPI interface (ioctl, sysfs) internal functions/algorithms
Hardware dependencies Requires real hardware Can run in UML/QEMU
Test Granularity Functional/Integration Testing Unit Testing
Output format TAP TAP

Usage of DRM subsystem
─────────────────

kselftest (tools/testing/selftests/drm/)
┌──────────────────────────────────────┐
│  drm_mm.c     → tests the DRM memory manager │  ←via ioctl
│  drm_buddy.c  → tests the buddy allocator API │  ←via ioctl
│  ...                                  │
│ Compile: make -C tools/testing/ │
│        selftests/drm                  │
│ Run: sudo ./drm_mm │
└──────────────────────────────────────┘

KUnit (drivers/gpu/drm/tests/)
┌──────────────────────────────────────┐
│  drm_buddy_test.c  → internal allocation algorithm │  ←call directly
│ drm_format_test.c → Pixel format conversion │ Kernel function
│ drm_rect_test.c → Rectangular clipping algorithm │
│ drm_mm_test.c → Memory Manager │
│                                       │
│ Run mode 1: insmod drm_buddy_test.ko │
│             dmesg | grep "TAP"        │
│                                       │
│ Running mode 2: python3 tools/testing/ │
│    kunit/kunit.py run                 │
│    --kconfig_add CONFIG_DRM_BUDDY=y   │
└──────────────────────────────────────┘

TAP output format example:
┌────────────────────────────────────┐
│ TAP version 14                     │
│ 1..4                               │
│ ok 1 drm_buddy_test_alloc_simple   │
│ ok 2 drm_buddy_test_alloc_aligned  │
│ not ok 3 drm_buddy_test_oversize   │
│ ok 4 drm_buddy_test_free_merge     │
│ # 3 passed, 1 failed               │
└────────────────────────────────────┘`,
            caption: 'kselftest tests the UAPI interface from the user mode, and KUnit tests the internal algorithm from the kernel mode. The two are complementary, and the TAP output format is unified to facilitate CI analysis.',
          },
          codeWalk: {
            title: 'drm_buddy allocator KUnit test analysis',
            file: 'drivers/gpu/drm/tests/drm_buddy_test.c',
            language: 'c',
            code: `/*drm_buddy_test.c — KUnit unit test for the DRM buddy allocator
 *File: drivers/gpu/drm/tests/drm_buddy_test.c (simplified version)
 *
 *drm_buddy is DRM's buddy allocator for GPU VRAM address management
 *Used by amdgpu to manage physical address space allocation of VRAM
 */
#include <kunit/test.h>
#include <drm/drm_buddy.h>

/*Test basic allocation functionality */
static void drm_buddy_test_alloc_simple(struct kunit *test)
{
    struct drm_buddy mm;
    struct drm_buddy_block *block;
    LIST_HEAD(allocated);
    /*Initialize 64KB buddy allocator, minimum block 4KB */
    int ret = drm_buddy_init(&mm, SZ_64K, SZ_4K);
    KUNIT_ASSERT_EQ(test, ret, 0);

    /*Allocate a 4KB block */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_4K, &allocated,
                                  DRM_BUDDY_TOPDOWN_ALLOCATION);
    KUNIT_EXPECT_EQ(test, ret, 0);
    KUNIT_EXPECT_EQ(test, !list_empty(&allocated), true);

    /*Verify allocated block size */
    block = list_first_entry(&allocated,
                              struct drm_buddy_block, link);
    KUNIT_EXPECT_EQ(test,
        drm_buddy_block_size(&mm, block), (u64)SZ_4K);

    /*Clean up */
    drm_buddy_free_list(&mm, &allocated);
    drm_buddy_fini(&mm);
}

/*Test alignment allocation */
static void drm_buddy_test_alloc_aligned(struct kunit *test)
{
    struct drm_buddy mm;
    struct drm_buddy_block *block;
    LIST_HEAD(allocated);
    int ret = drm_buddy_init(&mm, SZ_1M, SZ_4K);
    KUNIT_ASSERT_EQ(test, ret, 0);

    /*Allocate 64KB aligned blocks */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_64K, &allocated,
                                  DRM_BUDDY_TOPDOWN_ALLOCATION);
    KUNIT_EXPECT_EQ(test, ret, 0);

    block = list_first_entry(&allocated,
                              struct drm_buddy_block, link);
    /*Verify that the address is 64KB aligned */
    KUNIT_EXPECT_EQ(test,
        drm_buddy_block_offset(block) & (SZ_64K - 1), 0ULL);

    drm_buddy_free_list(&mm, &allocated);
    drm_buddy_fini(&mm);
}

/*Test allocation failure scenario */
static void drm_buddy_test_alloc_oversize(struct kunit *test)
{
    struct drm_buddy mm;
    LIST_HEAD(allocated);
    int ret = drm_buddy_init(&mm, SZ_64K, SZ_4K);
    KUNIT_ASSERT_EQ(test, ret, 0);

    /*Attempt to allocate more memory than total size - should fail */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_128K, &allocated,
                                  DRM_BUDDY_TOPDOWN_ALLOCATION);
    KUNIT_EXPECT_EQ(test, ret, -ENOSPC);

    drm_buddy_fini(&mm);
}

/*Register test suite */
static struct kunit_case drm_buddy_tests[] = {
    KUNIT_CASE(drm_buddy_test_alloc_simple),
    KUNIT_CASE(drm_buddy_test_alloc_aligned),
    KUNIT_CASE(drm_buddy_test_alloc_oversize),
    {}
};

static struct kunit_suite drm_buddy_test_suite = {
    .name = "drm_buddy",
    .test_cases = drm_buddy_tests,
};
kunit_test_suite(drm_buddy_test_suite);

MODULE_LICENSE("GPL");`,
            annotations: [
              'KUNIT_ASSERT_EQ is used for fatal errors (such as initialization failure) - stop the current test immediately after failure',
              'KUNIT_EXPECT_EQ for non-fatal assertions - continue running after failure and report all failures',
              'drm_buddy_init(&mm, SZ_64K, SZ_4K) creates an allocator with a total capacity of 64KB and a minimum granularity of 4KB',
              'DRM_BUDDY_TOPDOWN_ALLOCATION Allocates from high addresses to low addresses to reduce fragmentation',
              'drm_buddy_block_offset() gets the physical offset of the allocated block, used to verify alignment',
              'The kunit_test_suite() macro registers the test suite and runs it automatically when the module is loaded.',
            ],
            explanation: 'This KUnit test calls the drm_buddy allocator\'s internal API directly in kernel space - something kselftest cannot do because drm_buddy is not exposed to user space. Note the different usage scenarios of ASSERT and EXPECT: use ASSERT for init (cannot continue after failure), and use EXPECT for allocation results (want to see all failures). The VRAM management layer of amdgpu uses drm_buddy, so these tests directly ensure the correctness of VRAM allocation.',
          },
          miniLab: {
            title: 'Run DRM KUnit tests',
            objective: 'Compile and run KUnit tests for the DRM subsystem and learn to interpret TAP format output.',
            steps: [
              'Enter the kernel source directory: cd ~/kernel-src',
              'Use the KUnit runner to execute the drm_buddy test: python3 tools/testing/kunit/kunit.py run --kconfig_add CONFIG_DRM=y --kconfig_add CONFIG_DRM_BUDDY=y drm_buddy',
              'Or compile it manually into a module: make defconfig && scripts/config --enable DRM --enable DRM_BUDDY --module DRM_BUDDY_SELFTEST && make M=drivers/gpu/drm/tests -j$(nproc)',
              'Load the test module: sudo insmod drivers/gpu/drm/tests/drm_buddy_test.ko',
              'View TAP output: dmesg | tail -30 (find the line starting with TAP version)',
              'Statistical results: dmesg | grep -c "ok " && dmesg | grep -c "not ok"',
              'Uninstall the module: sudo rmmod drm_buddy_test',
              'You can also run other DRM KUnit tests: ls drivers/gpu/drm/tests/ (see all available tests)',
            ],
            expectedOutput: `$ python3 tools/testing/kunit/kunit.py run drm_buddy
[09:32:15] Starting KUnit Kernel ...
[09:32:17] ===================== drm_buddy =====================
[09:32:17] [PASSED] drm_buddy_test_alloc_simple
[09:32:17] [PASSED] drm_buddy_test_alloc_aligned
[09:32:17] [PASSED] drm_buddy_test_alloc_oversize
[09:32:17] [PASSED] drm_buddy_test_free_merge
[09:32:17] ================ [PASSED] drm_buddy =================
[09:32:17] Testing complete. Passed: 4, Failed: 0, Skipped: 0

#Or view TAP output via dmesg:
$ dmesg | grep -A 20 "TAP version"
TAP version 14
1..4
ok 1 drm_buddy_test_alloc_simple
ok 2 drm_buddy_test_alloc_aligned
ok 3 drm_buddy_test_alloc_oversize
ok 4 drm_buddy_test_free_merge`,
            hint: 'The KUnit runner requires the tools/testing/kunit/kunit.py script in the kernel source. If you have Python dependency issues, pip3 install junitparser. The manual insmod method will work in any environment.',
          },
          debugExercise: {
            title: 'Fix ASSERT/EXPECT misuse in KUnit tests',
            language: 'c',
            description: 'The following KUnit test confuses the usage scenarios of ASSERT and EXPECT, causing the test to behave unexpectedly.',
            question: 'Why does this test segfault under certain circumstances instead of reporting FAIL normally?',
            buggyCode: `static void test_alloc_and_check(struct kunit *test)
{
    struct drm_buddy mm;
    struct drm_buddy_block *block;
    LIST_HEAD(allocated);

    /*BUG: Use EXPECT instead of ASSERT to check initialization */
    int ret = drm_buddy_init(&mm, SZ_64K, SZ_4K);
    KUNIT_EXPECT_EQ(test, ret, 0);

    /*If init fails, mm is not initialized
     *Continuing to use mm will cause segfault */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_4K, &allocated, 0);

    /*BUG: Use ASSERT to check for non-fatal results */
    KUNIT_ASSERT_EQ(test, ret, 0);
    /*If alloc fails, subsequent assertions are never executed
     *We have no way of knowing if there is also a problem with block validation */

    block = list_first_entry(&allocated,
                              struct drm_buddy_block, link);
    KUNIT_ASSERT_EQ(test,
        drm_buddy_block_size(&mm, block), (u64)SZ_4K);

    drm_buddy_free_list(&mm, &allocated);
    drm_buddy_fini(&mm);
}`,
            hint: 'KUNIT_ASSERT stops immediately after failure, and KUNIT_EXPECT continues after failure. Think about which failures are "cannot continue" and which ones are "can continue".',
            answer: 'Two ASSERT/EXPECT confusions: (1) The return value of drm_buddy_init should be KUNIT_ASSERT_EQ instead of KUNIT_EXPECT_EQ. If init fails (ret != 0), the mm structure is not properly initialized, and subsequent calls to drm_buddy_alloc_blocks using mm will access uninitialized memory, resulting in kernel segfault or oops. ASSERT stops the test immediately on failure, preventing this cascading crash. (2) The return value of drm_buddy_alloc_blocks should be KUNIT_EXPECT_EQ instead of KUNIT_ASSERT_EQ. The allocation failure is non-fatal - we may also want to continue checking other assertions to gather more debugging information. But please note: if alloc fails (allocated list is empty), the subsequent list_first_entry will also have problems, so in fact the ASSERT here is also reasonable - it depends on whether the subsequent code depends on the allocation success. Best practice: Use ASSERT for "preconditions that subsequent code depends on" and EXPECT for "independent check items".',
          },
          interviewQ: {
            question: 'Explain the difference between kselftest and KUnit, and what scenarios are each suitable for? Why does the DRM subsystem need both?',
            difficulty: 'medium',
            hint: 'Comparison from four dimensions: running space, test granularity, hardware dependency, and applicable scenarios.',
            answer: 'The core differences between kselftest vs KUnit: (1) Running space: kselftest runs in user mode (independent executable program) and interacts with the kernel through system calls/ioctl; KUnit runs in kernel mode (kernel module) and directly calls kernel internal functions. (2) Test granularity: kselftest is a functional/integration test - testing whether the UAPI interface is correct (such as whether GEM ioctl returns the correct result); KUnit is a unit test - testing a single function or algorithm (such as the alignment logic of the drm_buddy allocator). (3) Hardware dependency: kselftest usually requires real hardware (because it interacts with the driver through ioctl); KUnit can run in UML (User Mode Linux) or QEMU and does not require GPU hardware. (4) The reason why DRM requires both: user-visible behaviors (mode setting, buffer allocation/release, command submission) require kselftest to verify from the user\'s perspective; internal algorithms (buddy allocator, rectangular clipping, format conversion) require KUnit for fine-grained verification. The two layers of testing are complementary: KUnit ensures that the algorithm is correct, and kselftest ensures that the interface is correct. If there is only kselftest, internal algorithm bugs are difficult to pinpoint; if there is only KUnit, interface layer problems (parameter parsing, permission checking) will be missed.',
            amdContext: 'Understanding test strategies is a core competency for AMD engineers. Showing in the interview that you know "what to use and what framework to test" shows that you have systematic thinking about software quality, rather than just writing code.',
          },
        },

        // ── Lesson 10.2.2 ──────────────────────────────────────
        {
          id: '10-2-2',
          number: '10.2.2',
          title: 'CI pipeline and regression testing',
          titleEn: 'CI Pipelines & Regression Testing',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['CI', 'GitLab', 'regression', 'pipeline', 'freedesktop'],
          concept: {
            summary: 'Graphics-driver CI commonly combines compilation checking, static analysis, and hardware-backed testing. Understanding how CI pipelines work, and how to distinguish true regressions from unstable tests, is an important upstream-development skill.',
            explanation: [
              'In the Linux graphics ecosystem, CI is commonly hosted on freedesktop.org GitLab for projects such as Mesa, IGT, and related infrastructure, while upstream kernel submission itself remains email-based rather than Merge Request-based. For amdgpu-related work, it is safest to think of CI as an auxiliary validation layer around development branches and test infrastructure, not as the canonical upstream submission path.',
              'A representative driver CI pipeline is divided into three main stages: (1) Build Stage - compile relevant code in multiple configurations such as x86_64 + gcc, x86_64 + clang, or cross-compiles; (2) Static Analysis Stage - run tools such as sparse, smatch, and checkpatch.pl; (3) Hardware Test Stage - run test suites such as IGT on real hardware where available. Exact job matrices, duration, and blocking policy vary by repository and infrastructure owner.',
              'Handling flaky tests is a core challenge in CI maintenance. A flaky test refers to a test that sometimes PASSes and sometimes FAILs without relevant code changes. Causes can include timing sensitivity, race conditions, and environment dependencies. Retry-based mitigation is common in CI systems, but the exact retry policy is infrastructure-specific rather than universal.',
              'Many CI systems track expected failures or quarantine lists for known-problematic tests on specific hardware. The exact mechanism varies, but the underlying idea is to separate known instability from newly introduced regressions.',
              'When a patch appears to introduce a CI regression, the practical task is to determine whether the result is a true regression introduced by the patch, a pre-existing flaky test, or an unrelated infrastructure failure. The failure logs, dmesg output, and historical pass/fail patterns are all relevant inputs to that decision.',
            ],
            keyPoints: [
              'Typical graphics CI flow: Build → Static Analysis → Hardware Test',
              'Build Stage: gcc/clang multi-configuration compilation',
              'Static Analysis: sparse (type checking) + smatch (Bug pattern) + checkpatch (code style)',
              'Hardware Test: Real GPU running IGT test suite, covering multiple generations of hardware',
              'Known-failure tracking distinguishes recurring instability from new regressions',
              'Flaky-test strategy commonly combines retries, issue tracking, and eventual root-cause fixes',
            ],
          },
          diagram: {
            title: 'AMD CI pipeline complete architecture',
            content: `AMD amdgpu CI pipeline (freedesktop.org GitLab)

Developer submits MR (Merge Request)
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Stage 1: Build (compilation check) ~5 min │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ x86_64-gcc   │  │ x86_64-clang │  │ arm64-cross  │  │
│  │ -Werror      │  │ -Werror      │  │ -Werror      │  │
│  │  PASS ✓      │  │  PASS ✓      │  │  PASS ✓      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────┬──────────────────────────────┘
│ All PASS to continue
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Stage 2: Static Analysis ~10 min │
│                                                          │
│  ┌──────────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ sparse           │  │ smatch      │  │ checkpatch │ │
│  │ __user/__iomem   │  │ Bug patterns│  │ Code style │ │
│ │ Type checking │ │ NULL deref │ │ Format/naming │ │
│  │  PASS ✓          │  │  PASS ✓     │  │ 1 WARNING  │ │
│  └──────────────────┘  └─────────────┘  └────────────┘ │
└──────────────────────────┬──────────────────────────────┘
│ Continue only if no ERROR
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Stage 3: Hardware Testing ~30-60 min │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ RDNA3 Farm   │  │ RDNA2 Farm   │  │ GCN5 Farm    │  │
│  │ (RX 7600)    │  │ (RX 6800)    │  │ (Vega 56)    │  │
│  │              │  │              │  │              │  │
│  │ IGT tests:   │  │ IGT tests:   │  │ IGT tests:   │  │
│  │ 245 PASS     │  │ 238 PASS     │  │ 210 PASS     │  │
│  │   3 SKIP     │  │  10 SKIP     │  │  38 SKIP     │  │
│  │   1 FAIL *   │  │   1 FAIL *   │  │   1 FAIL *   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         └──────────────────┼──────────────────┘          │
│                            ▼                             │
│         ┌─────────────────────────────────┐              │
│         │   Baseline Comparison           │              │
│         │                                 │              │
│         │ expected-failures.txt:          │              │
│         │   kms_cursor@pipe-A  FAIL       │              │
│         │   gem_exec@hang      FLAKE      │              │
│         │                                 │              │
│ │ actual FAIL vs expected: │ │
│         │   kms_cursor@pipe-A → KNOWN ✓   │              │
│         │   amd_basic@query   → NEW!! ✗   │              │
│         └─────────────────────────────────┘              │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  CI Result              │
│ ● New Returns: 1 │
              │    amd_basic@query      │
│ ● Known failures: 1 (ignored) │
│ ● Status: BLOCKED │
│ → Repair and resubmit │
              └─────────────────────────┘`,
            caption: 'CI pipeline three-stage process. The key is baseline comparison - comparing the actual FAIL to the expected-failures file, only new regressions block the merge. This ensures the usefulness of CI.',
          },
          codeWalk: {
            title: 'Interpret CI Pipeline results and expected-failures files',
            file: 'CI pipeline output + expected-failures.txt',
            language: 'text',
            code: `# ========================================
#Example of CI Pipeline results (GitLab CI output)
# ========================================

# Job: igt-amdgpu-rdna3-rx7600
# Status: FAILED (1 new regression)
# Duration: 34m 12s
# Hardware: AMD RX 7600 XT (Navi33)

# --- Test Results Summary ---
# Total:  249
# Pass:   245
# Fail:   3
# Skip:   1

# --- Failures Detail ---
# FAIL: amd_basic@memory-alloc
#   Expected: gpu_info.vram_size > 0
#   Actual:   gpu_info.vram_size == 0
#   Log: <ci-job-log-url>
#   dmesg: [drm] VRAM: 0M 0b (warning: VRAM not detected)
#
# FAIL: kms_cursor_crc@cursor-128x128-onscreen (KNOWN)
#   Baseline: This test is listed in expected-failures
#   Tracking: https://gitlab.freedesktop.org/drm/amd/-/issues/2847
#
# FAIL: gem_exec_whisper@basic-queues (FLAKE)
#   Baseline: Intermittent failure, 87% pass rate
#   Last 10 runs: PPPPPPFPPP (P=pass, F=fail)

# ========================================
#expected-failures.txt file format
# ========================================
#Format: <hardware> <test>@<subtest> <expected-status> [optional-note]

# Known hardware limitations
rdna3-rx7600  kms_cursor_crc@cursor-128x128-onscreen  FAIL  # Issue #2847
rdna3-rx7600  kms_writeback@writeback-fb-id            SKIP  # No writeback support

# Known flaky tests (intermittent)
rdna3-rx7600  gem_exec_whisper@basic-queues             FLAKE  # Race condition
rdna3-rx7600  kms_flip@flip-vs-expired-vblank           FLAKE  # Timing sensitive

# GCN specific known failures
gcn5-vega56   amd_cs_nop@compute-ring                   FAIL  # FW bug, won't fix

# ========================================
#How to analyze a CI regression
# ========================================
#Step 1: Confirm whether it is in expected-failures
$ grep "amd_basic@memory-alloc" expected-failures.txt
(no output — not in the list → is a new return!)

#Step 2: View the failed dmesg log
#Key message: "VRAM: 0M" — VRAM detection failed
#Possible reason: Your patch affects the VRAM detection logic of amdgpu_gmc

#Step 3: Reproduce
$ git log --oneline -1   #Confirm that this is the commit in question
$ sudo ./build/tests/amdgpu/amd_basic --run-subtest memory-alloc

#Step 4: bisect (if necessary)
$ git bisect start HEAD known-good-commit
$ git bisect run sudo ./build/tests/amdgpu/amd_basic \\
    --run-subtest memory-alloc`,
            annotations: [
              'CI results are divided into three states: new regression (must be fixed), known failure (KNOWN, with issue tracking), and unstable test (FLAKE)',
              'expected-failures.txt Grouped by hardware platform, records known failures and unstable tests',
              'Tests marked with FLAKE are automatically retried 2-3 times in CI, and any PASS is considered passed.',
              'The dmesg log is key information for diagnosing regressions - the CI system saves the complete dmesg for each run',
              'git bisect run can automate binary search to introduce specific submissions that cause regression.',
              'Regressions must be fixed before the next merge window, otherwise the associated patch will be revert',
            ],
            explanation: 'This output shows how to interpret real CI pipeline results. The core skill is distinguishing between "new regressions" and "known failures" - the former are problems introduced by your patch that need to be fixed, and the latter are existing problems that should not block your work. The expected-failures file is a team effort - everyone is responsible for maintaining its accuracy. When a known issue is fixed, the corresponding entry needs to be removed from the list.',
          },
          miniLab: {
            title: 'Simulate CI result analysis process',
            objective: 'Practice analyzing CI pipeline output, learn to differentiate between true regressions and known failures, and master regression investigation steps.',
            steps: [
              'Browse AMD\'s GitLab CI page: https://gitlab.freedesktop.org/agd5f/linux/-/pipelines (see real CI pipelines)',
              'Click on a recent pipeline to view the status of each stage',
              'Find a Hardware Test stage job and view test results and logs',
              'Search the logs for "FAIL" and "regression" keywords',
              'Check the project\'s expected-failures file (if there is one): search the repository for "expected" or "flakes"',
              'Exercise git bisect: In your own kernel repository, deliberately introduce a change that will cause a test to fail, and then use git bisect to locate it',
              'Create a sample expected-failures.txt file to record the test failures you encounter in this module',
            ],
            expectedOutput: `$ git bisect start HEAD HEAD~5
Bisecting: 2 revisions left to test after this (roughly 2 steps)

$ git bisect run ./test_script.sh
running ./test_script.sh
...
abc1234 is the first bad commit
commit abc1234
Author: You <you@example.com>
    drm/amdgpu: accidentally break VRAM query

$ git bisect reset
Previous HEAD position was abc1234
Switched to branch 'main'`,
            hint: 'Freedesktop.org\'s GitLab requires a registered account to see some CI details. git bisect run requires a test script that returns 0 (good) or non-zero (bad).',
          },
          debugExercise: {
            title: 'Determine whether a CI failure is a regression or a known issue',
            language: 'text',
            description: 'Your patch triggered 3 test failures in CI. Use the following information to determine which are true regressions.',
            question: 'Which failures are real regressions that you need to fix? Which ones can be ignored? Give reasons.',
            buggyCode: `Your patch: "drm/amdgpu: optimize VRAM allocation path"

CI failure list:
1. amd_basic@memory-alloc
   Failure: igt_assert_eq(r, 0) failed: r = -12 (ENOMEM)
   Baseline history: 100% PASS in last 30 runs
   In expected-failures.txt: NO

2. kms_cursor_crc@cursor-256x256-rapid-movement
   Failure: CRC mismatch (expected vs actual differ by 2 pixels)
   Baseline history: 73% PASS in last 30 runs (flaky)
   In expected-failures.txt: YES (marked as FLAKE)

3. gem_exec_whisper@basic-fds
   Failure: Timeout after 120s
   Baseline history: 98% PASS in last 30 runs
   In expected-failures.txt: NO
   Note: This test occasionally times out on loaded CI machines`,
            hint: 'Analyze each failure: look at the baseline history (whether it has been PASS before), whether it is in expected-failures, and whether the failure mode is related to your modification.',
            answer: 'Verdict: (1) amd_basic@memory-alloc — a true regression that must be fixed. Reason: The baseline is 100% PASS (never failed), is not among the expected-failures, and the failure reason ENOMEM (out of memory) is directly related to your patch "optimize VRAM allocation path". Your optimization may have changed the allocation logic causing allocation to fail in some cases. (2) kms_cursor_crc@cursor-256x256-rapid-movement - known unstable test, can be ignored. Reason: Marked as FLAKE in expected-failures, baseline only has 73% pass rate, failure reason (pixel-level CRC mismatch) has nothing to do with your VRAM modification. (3) gem_exec_whisper@basic-fds — needs investigation but may not be a regression. Reason: Although it is not in expected-failures, the 98% pass rate shows that it occasionally fails, and the failure reason is timeout (not logical error), which may be caused by the high load of the CI machine. Recommendation: Retry CI once, if the second PASS is confirmed to be flake, it should be added to expected-failures. Your core job is to fix #1.',
          },
          interviewQ: {
            question: 'Describe the main stages of the GPU-driven CI pipeline and how to handle flaky tests in CI.',
            difficulty: 'hard',
            hint: 'Answer from the perspective of CI architecture, test classification, identification and processing strategies of flaky tests.',
            answer: 'A defensible answer is: (1) Build Stage - compile the relevant code in multiple configurations and architectures; (2) Static Analysis - run sparse, smatch, and style checks such as checkpatch.pl; (3) Hardware or integration testing - run suites such as IGT where supported; (4) Regression analysis - compare failures against known baselines and recent history. For flaky tests, explain the workflow rather than hard-coding one universal policy: identify repeated intermittent failure, classify likely causes (timing, race, environment, hardware sensitivity), mitigate with infrastructure-specific retries or quarantining, and track the root cause until the test can return to normal gating.',
            amdContext: 'The AMD CI team and driver team work closely together. Show in the interview that you understand that CI is not just about "running tests" - it also involves baseline management, flaky test strategies, and hardware farm maintenance - showing that you have a mature understanding of engineering practices. This is especially important during interviews with AMD\'s Toolchain/Infra team.',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'Understand the architecture of IGT GPU Tools: igt_main / igt_subtest / igt_fixture three-layer structure',
    'Able to write complete amdgpu IGT tests, including positive tests, negative tests and stress tests',
    'Understand the difference between kselftest and KUnit and their applicable scenarios',
    'Ability to run DRM KUnit tests and interpret TAP format output',
    'Understand the three stages of AMD CI pipeline: Build → Static Analysis → Hardware Test',
    'Ability to analyze CI results to distinguish true regressions from expected-failures',
    'Master git bisect to locate submissions that introduce regressions',
    'Understand the processing strategy of flaky test: retry, mark, track and fix',
    'Can turn a bug report into a small reproducible test plus a regression-check workflow before attempting the fix',
  ],
};
