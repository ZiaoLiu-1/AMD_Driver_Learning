// ============================================================
// AMD Linux Driver Learning Platform - Module 10 Micro-Lessons (English)
// Module 10: Testing & CI (testingand CI)
// 4 lessons in 2 groups, ~15 min each, total ~60 min
// ============================================================
import type { MicroLessonModule } from './micro_lesson_types';

export const module10MicroLessonsEn: MicroLessonModule = {
  moduleId: 'testing',
  groups: [
    // ════════════════════════════════════════════════════════════
    // Group 10.1: testingframework
    // ════════════════════════════════════════════════════════════
    {
      id: '10-1',
      number: '10.1',
      title: 'testingframework',
      titleEn: 'Testing Frameworks',
      icon: 'FlaskConical',
      description: '深入understand IGT GPU Tools testingframeworkarchitectureand用法, 学willwrite amdgpu 专用 IGT testing用例, from读懂现hastestingtoindependentwrite新testing. ',
      lessons: [
        // ── Lesson 10.1.1 ──────────────────────────────────────
        {
          id: '10-1-1',
          number: '10.1.1',
          title: 'IGT GPU testingframework详解',
          titleEn: 'IGT GPU Tools Framework Deep Dive',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['IGT', 'testing', 'GPU', 'framework', 'amdgpu'],
          concept: {
            summary: 'IGT GPU Tools is Linux GPU driverstandardtestingframework. 它provide一套丰富 C macroand辅助库, let你canwritestructure化 GPU testing — fromsimple GEM buffer allocationtocomplex多display器atomiccommit. understand IGT architectureiswrite高质量drivertestingbasics. ',
            explanation: [
              'IGT(Intel GPU Tools, 现inalreadyis供应商无关)isall主流 Linux GPU driver共用testingframework. 它source codein https://gitlab.freedesktop.org/drm/igt-gpu-tools, containexceed 1000 个testing用例. for amdgpu development, IGT isverifydrivermodifywhether引入回归maintool. ',
              'IGT corearchitecture围绕三个概念: testing(test), 子testing(subtest)and fixture. a IGT testingfileusuallycontaina igt_main block(or igt_simple_main used for单一testing), internalthrough igt_subtest definemultiple子testing. fixture through igt_fixture blockdefine, used forin子testing之betweensharedinitializationandcleanupcode. 这种structurelet你caninafilein组织multiplerelated但independenttesting. ',
              'IGT provide丰富断言macro: igt_assert(cond) is最basic断言, failure时终止current子testing并report FAIL; igt_assert_eq(a, b) comparetwo值, failure时打印two值方便debugging; igt_assert_fd(fd) 断言filedescriptorvalid; igt_assert_lte(a, b) 断言 a <= b. thesemacrointernaluse longjmp implementation跳转, ensuretestingfailureaftercancorrectcleanupresource. ',
              'igt_require(cond) is另akeymacro — whenconditionnot满足时, 它跳过(SKIP)current子testing而is notmarkas FAIL. 这used forhandlehardwareability差异: for example某个testingneed VCN 视频engine, 但testing机器mayno, 此时 igt_require will优雅地跳过而is not报错. 这forindifferenthardwareonrun同一套testing非常important. ',
              'amdgpu  IGT testing集inin tests/amdgpu/ directorybelow, include: amd_basic(basicsfunctiontesting: 打开device, 查询information), amd_cs_nop(command submission空operatetesting), amd_deadlock(deadlockdetecttesting), amd_pci_unplug(热插拔testing)等. eachfiletesting amdgpu driveraspecific方面. furthermore tests/ 根directorybelowgeneral DRM testing(如 kms_flip, kms_cursor_crc, gem_create)alsowillin amdgpu onrun. ',
              'Inside IGT\'s tests/amdgpu/ directory, tests are organized by subsystem: amd_basic (sanity: BO alloc, CS submit, device query), amd_deadlock (stress: concurrent CS + reset, identifies lock ordering bugs), amd_pci_unplug (hotplug: tests safe GPU removal under load), amd_cs (command submission: various IB sizes, priorities, preemption), amd_vm (virtual memory: mapping, unmapping, fault injection), amd_hotunplug (PCI remove + re-probe simulation), and amd_abm (display: adaptive backlight management). When verifying your amdgpu patch, the selection rule is: always run amd_basic (quick sanity), then run the test matching your change area — e.g., if you modified amdgpu_cs.c, run amd_cs; if you changed amdgpu_vm.c, run amd_vm; if you changed display/dc/, run kms_* tests. The command: sudo ./build/tests/amdgpu/amd_basic --run-subtest cs-gfx is the minimum test every amdgpu patch must pass.',
            ],
            keyPoints: [
              'IGT is Linux GPU driverstandardtestingframework, 1000+ testing用例overwriteall DRM function',
              'igt_main / igt_subtest / igt_fixture 三layerstructure组织testing, 子testingandsharedinitialization',
              'igt_assert seriesmacroused for断言, failuremark FAIL; igt_require used forbefore置conditioncheck, not满足mark SKIP',
              'amdgpu 专用testingin tests/amdgpu/ directory, general DRM testingalsoin amdgpu onrun',
              'IGT testingresulthas四种state: PASS / FAIL / SKIP / TIMEOUT',
              'run单个testing: ./build/tests/amdgpu/amd_basic; run子testing: --run-subtest "subtest-name"',
              'tests/amdgpu/ organized by subsystem: amd_basic, amd_cs, amd_vm, amd_deadlock, amd_pci_unplug',
            ],
          },
          diagram: {
            title: 'IGT testingframeworkarchitectureandexecuteprocess',
            content: `IGT GPU Tools architecture概览

IGT testingfilestructure                          executeprocess
─────────────────                          ────────

tests/amdgpu/amd_basic.c                  $ ./build/tests/amd_basic
┌──────────────────────────┐                     │
│ #include "igt.h"         │                     ▼
│ #include "lib/amdgpu/    │              igt_main entry point
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

IGT testingresultstate: 
  PASS    ✓  all断言through
  FAIL    ✗  某个 igt_assert failure
  SKIP    ○  igt_require conditionnot满足(hardwarenotsupport等)
  TIMEOUT testingexceed最大run时between(default 120s)`,
            caption: 'IGT testing由 igt_main entry point, igt_fixture sharedinitialization/cleanup, igt_subtest independent子testing三部分组成. each子testingindependentrun, 互notimpact. ',
          },
          codeWalk: {
            title: 'parseareal IGT amdgpu GEM BO testing',
            file: 'tests/amdgpu/amd_basic.c',
            language: 'c',
            code: `/* IGT amdgpu basicstesting — GEM Buffer Object allocationandinformation查询
 * file: tests/amdgpu/amd_basic.c (简化版)
 */
#include "igt.h"
#include <amdgpu.h>
#include <amdgpu_drm.h>

static int fd;                    /* DRM devicefiledescriptor */
static amdgpu_device_handle dev;  /* libdrm amdgpu devicehandle */
static uint32_t major_ver, minor_ver;

igt_main
{
    /* igt_fixture inall子testingbeforeexecuteonce
     * used for打开deviceandinitializationsharedresource */
    igt_fixture {
        fd = drm_open_driver(DRIVER_AMDGPU);
        /* drm_open_driver 打开 /dev/dri/card* 并verifyis amdgpu */
        igt_require(fd >= 0);

        int r = amdgpu_device_initialize(fd, &major_ver,
                                         &minor_ver, &dev);
        igt_assert_eq(r, 0);
        /* 此时 dev cancallall libdrm/amdgpu API */
    }

    igt_subtest("query-info") {
        struct amdgpu_gpu_info gpu_info = {};
        int r = amdgpu_query_gpu_info(dev, &gpu_info);
        igt_assert_eq(r, 0);
        /* Navi33 shouldhas非零 VRAM size */
        igt_assert(gpu_info.vram_size > 0);
        igt_info("GPU VRAM: %llu MB\\n",
                 gpu_info.vram_size / (1024 * 1024));
    }

    igt_subtest("gem-create") {
        struct amdgpu_bo_alloc_request req = {};
        amdgpu_bo_handle bo;
        /* allocation 4KB VRAM buffer */
        req.alloc_size = 4096;
        req.phys_alignment = 4096;
        req.preferred_heap = AMDGPU_GEM_DOMAIN_VRAM;

        int r = amdgpu_bo_alloc(dev, &req, &bo);
        igt_assert_eq(r, 0);
        /* 断言 bo handlevalid */
        igt_assert(bo != NULL);

        /* cleanup: release buffer object */
        r = amdgpu_bo_free(bo);
        igt_assert_eq(r, 0);
    }

    igt_subtest("vram-gtt-migration") {
        /* 此testingneed GPU meanwhilesupport VRAM and GTT */
        struct drm_amdgpu_info_vram_gtt vram_gtt = {};
        igt_require(amdgpu_query_heap_info(dev,
            AMDGPU_GEM_DOMAIN_VRAM, 0, &vram_gtt) == 0);
        igt_require(vram_gtt.vram_size > 0);

        /* ... actualmigrationtestingcode ... */
        igt_info("VRAM→GTT migration test passed\\n");
    }

    /* igt_fixture inall子testingafterexecuteonce
     * used forreleasesharedresource */
    igt_fixture {
        amdgpu_device_deinitialize(dev);
        drm_close_driver(fd);
    }
}`,
            annotations: [
              'igt_main is IGT entry pointmacro, 展开as main() + testingframeworkinitializationcode',
              'drm_open_driver(DRIVER_AMDGPU) traverse /dev/dri/card* 直tofind amdgpu driverdevice',
              'amdgpu_device_initialize() is libdrm/amdgpu initializationfunction, returndevicehandle',
              'igt_assert_eq(r, 0) 断言return valueas 0, failure时will打印actual值方便debugging',
              'igt_require(vram_gtt.vram_size > 0) 跳过notsupport VRAM device(如 APU 无independent VRAM)',
              'igt_info() 打印informationtotestingoutput, notimpact PASS/FAIL state',
            ],
            explanation: 'thistestingdemonstrate IGT typicalstructure: igt_fixture 打开device, multiple igt_subtest 各testingafunction点, finally igt_fixture cleanupresource. note igt_require use — "vram-gtt-migration" 子testingin无 VRAM deviceonwill优雅地 SKIP 而is not FAIL. 这种patternlet同一套testingcanindifferenthardwareoncorrectrun. ',
          },
          miniLab: {
            title: 'compilationandrun IGT amdgpu testing',
            objective: 'fromsource codecompilation IGT GPU Tools, run amdgpu basicstesting, 学will解读testingoutput. ',
            steps: [
              '克隆 IGT source code: git clone https://gitlab.freedesktop.org/drm/igt-gpu-tools.git && cd igt-gpu-tools',
              'installdependency: sudo apt install meson ninja-build libdrm-dev libcairo2-dev libpixman-1-dev libudev-dev libprocps-dev libjson-c-dev libdw-dev flex bison',
              'compilation: meson build && ninja -C build',
              '列出all amdgpu testing: ls build/tests/amdgpu/',
              'runbasicstesting: sudo ./build/tests/amdgpu/amd_basic(need root access GPU)',
              'run单个子testing: sudo ./build/tests/amdgpu/amd_basic --run-subtest "query-info"',
              'viewall子testinglist: ./build/tests/amdgpu/amd_basic --list-subtests',
              'rungeneral GEM createtesting: sudo ./build/tests/gem_create --device /dev/dri/card0',
            ],
            expectedOutput: `$ sudo ./build/tests/amdgpu/amd_basic
IGT-Version: 1.28 (x86_64)
Starting subtest: query-info
Subtest query-info: SUCCESS (0.003s)
Starting subtest: gem-create
Subtest gem-create: SUCCESS (0.001s)
Starting subtest: vram-gtt-migration
Subtest vram-gtt-migration: SUCCESS (0.012s)

$ ./build/tests/amdgpu/amd_basic --list-subtests
query-info
gem-create
vram-gtt-migration
semaphore
...`,
            hint: 'iftesting报 "Permission denied", ensureuse sudo. if报 "No amdgpu device found", check amdgpu driverwhetheralreadyloading: lsmod | grep amdgpu. certaintestingmayneedidle GPU(no桌面environmentrun). ',
          },
          debugExercise: {
            title: 'fixerror IGT testingcode',
            language: 'c',
            description: 'below IGT testingcodehasmultipleissuecause它notcancorrectrun. findallissue. ',
            question: 'this IGT testinghaswhichissue? whytestingmaywill误报 PASS orleakresource? ',
            buggyCode: `#include "igt.h"
#include <amdgpu.h>

igt_main
{
    int fd;
    amdgpu_device_handle dev;

    /* BUG 1: fixture innoerrorcheck */
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
        /* BUG 2: no断言allocationresult */
        /* BUG 3: norelease bo — resourceleak */
    }

    /* BUG 4: no teardown fixture */
}`,
            hint: 'check四个方面: initializationerrorhandle, 断言缺失, resourceleak, cleanup fixture. ',
            answer: '四个issue: (1)fixture in amdgpu_device_initialize return valuenocheck — ifinitializationfailure, dev isinvalidhandle, after续all子testingallwill用invalidhandleoperate, maycause segfault rather thanhas意义testingfailure. fix: int r = amdgpu_device_initialize(...); igt_assert_eq(r, 0);(2)amdgpu_bo_alloc return valueno断言 — even ifallocationfailure(return非零error code), testingalsowill not报 FAIL, 这is误报 PASS typicalcause. fix: igt_assert_eq(amdgpu_bo_alloc(dev, &req, &bo), 0);(3)allocation bo nocall amdgpu_bo_free(bo) release — in大量子testingrun时willcause GPU memoryleak, mayletafter续testing因memorynot足而failure. fix: in子testing末尾add amdgpu_bo_free(bo);(4)缺少 teardown igt_fixture — fd and dev no关闭and反initialization. fix: add igt_fixture { amdgpu_device_deinitialize(dev); drm_close_driver(fd); }. 这四类issuein Code Review inis最常by指出. ',
          },
          interviewQ: {
            question: 'describe你howasa新 amdgpu functionwrite IGT testing. fromtestingdesigntofinalcommit, yourprocessiswhat? ',
            difficulty: 'medium',
            hint: 'fromunderstandby测function UAPI interfacestart, design正面and负面testing用例, use igt_require handlehardware差异, 并ensureresourcecorrectcleanup. ',
            answer: 'write IGT testingcompleteprocess: (1)understandfunction: read UAPI header file(include/uapi/drm/amdgpu_drm.h)解新function暴露 ioctl interfaceandparameterrange, readkernel端implementation解boundarycondition. (2)testingdesign: design正面testing(valid parameters → expected results)and负面testing(invalid parameters → expected errors). for example对 BO allocation: 正面testingverify VRAM/GTT/GDS 各 heap allocationsuccess, 负面testingverify size=0 or超大 size return -EINVAL/-ENOMEM. (3)writecode: create tests/amdgpu/amd_new_feature.c, use igt_main + igt_fixture + igt_subtest structure, each子testingoverwriteascenario. 用 igt_require checkhardwarewhethersupport该function. (4)buildintegration: in tests/amdgpu/meson.build inadd新testingfile. (5)localverify: inreal GPU onruntestingconfirmentire PASS, innotsupport该function旧 GPU onconfirmrelated子testingcorrect SKIP. (6)commit: generatepatchsendto igt-dev@lists.freedesktop.org mailing list. ',
            amdContext: 'AMD interviewinmaywilllet你现场designa IGT testing用例. keyisdemonstrate你understand正面/负面testingdifference, igt_require use, andresourcemanagementimportant性. ',
          },
        },

        // ── Lesson 10.1.2 ──────────────────────────────────────
        {
          id: '10-1-2',
          number: '10.1.2',
          title: 'write amdgpu IGT testing',
          titleEn: 'Writing amdgpu IGT Tests',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['IGT', 'amdgpu', 'libdrm', 'VRAM', 'test-writing'],
          concept: {
            summary: '本节from零startwriteacomplete amdgpu IGT testing — VRAM allocation压力testing. 你willuse libdrm/amdgpu API(amdgpu_device_initialize, amdgpu_bo_alloc, amdgpu_cs_submit)write正面and负面testing, 并integrationto meson buildsystemin. ',
            explanation: [
              'write amdgpu IGT testing第一步isunderstand libdrm/amdgpu API. libdrm as amdgpu providecompleteuser-space API: amdgpu_device_initialize() initializationdevice并gethandle; amdgpu_bo_alloc() allocation GPU buffer object(BO); amdgpu_bo_va_op() management GPU virtual addressmapping; amdgpu_cs_submit() commitcommandto GPU execute. these API in <amdgpu.h> in声明, internalthrough ioctl andkernel amdgpu driver通信. ',
              'a好testingshouldmeanwhilecontain正面testing(positive test)and负面testing(negative test). 正面testingverify"correctinputgeneratecorrectresult" — for exampleallocationa 4KB VRAM buffer shouldsuccess. 负面testingverify"errorinputbycorrect拒绝" — for exampleallocation size=0  buffer shouldreturn -EINVAL, allocationexceed VRAM 总量 buffer shouldreturn -ENOMEM. 负面testinginkernelcodein尤asimportant, becausetheyverifydrivererrorhandlepath. ',
              'will新testingintegrationto IGT  meson buildsystem非常simple: in tests/amdgpu/meson.build inwillyourtestingfile名addtotestinglistin. meson willautomaticcompilation并will其registrationascanruntesting. run ninja -C build re-compilation, then用 sudo ./build/tests/amdgpu/amd_your_test execute. ',
              'inwrite涉及command submission(CS)testing时, 你need: createa IB(Indirect Buffer)存放 GPU command; use amdgpu_bo_alloc allocation IB 用memory; use amdgpu_bo_va_op will IB mappingto GPU virtualaddress space; use amdgpu_cs_submit will IB committospecific ring(GFX, SDMA 等); use amdgpu_cs_query_fence_status waitcommandcomplete. forsimplefunction性testing, commita NOP(空operate)包足够. ',
              'testing命名and组织also很important. IGT 惯例is: file名describeby测function(如 amd_vram_alloc), 子testing名用连字符分隔describe性名称(如 "basic-alloc", "oversize-alloc-negative", "multi-bo-stress"). 良好命名let CI reportincan快速识别哪个function出issue. ',
            ],
            keyPoints: [
              'libdrm/amdgpu API: amdgpu_device_initialize → amdgpu_bo_alloc → amdgpu_cs_submit',
              '正面testingverifycorrect行as(allocationsuccess), 负面testingverifyerrorhandle(invalidparameterby拒绝)',
              'integrationto meson build: in tests/amdgpu/meson.build inaddfile名i.e.can',
              'command submissiontestingprocess: alloc IB → va_op map → cs_submit → query_fence',
              '子testing命名惯例: describe性连字符名称, 如 "basic-alloc", "oversize-negative"',
              'igt_require checkhardwareability, ensuretestingindifferent GPU onallcancorrect PASS or SKIP',
            ],
          },
          diagram: {
            title: 'write amdgpu IGT testingcompletework流',
            content: `from零writea amdgpu IGT testing

Step 1: createtestingfile
─────────────────────
tests/amdgpu/
├── amd_basic.c            ← alreadyhasbasicstesting
├── amd_cs_nop.c           ← alreadyhas CS NOP testing
├── amd_deadlock.c         ← alreadyhasdeadlocktesting
├── amd_vram_stress.c      ← your新testing ★
└── meson.build            ← in此registration新testing

Step 2: testingfilestructure
─────────────────────
amd_vram_stress.c
┌──────────────────────────────────────────────┐
│ #include "igt.h"                              │
│ #include <amdgpu.h>                           │
│                                               │
│ igt_main {                                    │
│   igt_fixture { /* 打开device */ }              │
│                                               │
│   /* 正面testing */                               │
│   igt_subtest("basic-alloc")      → PASS ✓    │
│   igt_subtest("multi-size-alloc") → PASS ✓    │
│   igt_subtest("vram-gtt-both")    → PASS ✓    │
│                                               │
│   /* 负面testing */                               │
│   igt_subtest("zero-size-negative")  → PASS ✓ │
│   igt_subtest("oversize-negative")   → PASS ✓ │
│                                               │
│   /* 压力testing */                               │
│   igt_subtest("stress-1000-allocs")  → PASS ✓ │
│                                               │
│   igt_fixture { /* 关闭device */ }              │
│ }                                             │
└──────────────────────────────────────────────┘

Step 3: registrationtobuildsystem
─────────────────────
# tests/amdgpu/meson.build
amdgpu_tests = [
    'amd_basic',
    'amd_cs_nop',
    'amd_deadlock',
    'amd_vram_stress',    ← add新testing
]

Step 4: compilation & run
─────────────────────
$ ninja -C build
$ sudo ./build/tests/amdgpu/amd_vram_stress
  Subtest basic-alloc:          SUCCESS (0.001s)
  Subtest multi-size-alloc:     SUCCESS (0.003s)
  Subtest zero-size-negative:   SUCCESS (0.001s)
  Subtest oversize-negative:    SUCCESS (0.002s)
  Subtest stress-1000-allocs:   SUCCESS (0.234s)`,
            caption: 'write IGT testing四步process: createfile → writetesting → registrationbuild → compilationrun. 正面and负面testing缺一notcan. ',
          },
          codeWalk: {
            title: 'complete VRAM allocation IGT testing',
            file: 'tests/amdgpu/amd_vram_stress.c',
            language: 'c',
            code: `/* amd_vram_stress.c — VRAM allocation压力testing
 * verify amdgpu  GEM BO allocationandreleasepath
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

    /* === 正面testing === */
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

    /* === 负面testing === */
    igt_subtest("zero-size-negative") {
        /* size=0 shouldbydriver拒绝 */
        amdgpu_bo_handle bo = alloc_bo(0,
            AMDGPU_GEM_DOMAIN_VRAM);
        igt_assert(bo == NULL);
    }

    igt_subtest("oversize-negative") {
        /* allocationexceed VRAM 总量memoryshouldfailure */
        igt_require(gpu_info.vram_size > 0);
        uint64_t oversize = gpu_info.vram_size * 2;
        amdgpu_bo_handle bo = alloc_bo(oversize,
            AMDGPU_GEM_DOMAIN_VRAM);
        igt_assert(bo == NULL);
    }

    /* === 压力testing === */
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
              'alloc_bo 辅助functionencapsulation amdgpu_bo_alloc, 简化子testingincode',
              'AMDGPU_GEM_DOMAIN_VRAM in GPU VRAMallocation, AMDGPU_GEM_DOMAIN_GTT insystem memory(GPU canaccess)allocation',
              '"zero-size-negative" is负面testing — verifydrivercorrect拒绝invalidinput',
              '"oversize-negative" 用 igt_require ensuredevicehas VRAM information, thentesting过量allocation',
              '"stress-alloc-free-cycle" 循环 1000 次allocation/release, detectmemoryleakandrace conditioncondition',
              'each igt_subtest independentrun — a子testing FAIL notimpactother子testing',
            ],
            explanation: 'thiscompletetestingfiledemonstrate IGT testingwrite最佳实践: 辅助function减少重复code, 正面testingoverwrite正常path, 负面testingoverwriteerrorhandle, 压力testingdetectresourceleak. 特别note负面testing — kerneldrivermustcorrecthandleallinvalidinput, otherwisemaycausekernelcrashorsecurity漏洞. ',
          },
          miniLab: {
            title: 'writeyour第a amdgpu IGT testing',
            objective: 'based onthe abovecodetemplate, writeatesting GPU information查询 IGT testing, 并inreal GPU onrun. ',
            steps: [
              'in igt-gpu-tools/tests/amdgpu/ belowcreate amd_query_test.c',
              'implementation igt_main, in fixture ininitialization amdgpu device',
              'add igt_subtest("query-vram-size") verify VRAM size > 0',
              'add igt_subtest("query-fw-version") 查询 GFX firmwareversion并verify非零',
              'in tests/amdgpu/meson.build inadd "amd_query_test" totestinglist',
              'compilation: ninja -C build',
              'runtesting: sudo ./build/tests/amdgpu/amd_query_test',
              'verifyall子testing PASS: --list-subtests then逐个run',
            ],
            expectedOutput: `$ sudo ./build/tests/amdgpu/amd_query_test
IGT-Version: 1.28 (x86_64)
Starting subtest: query-vram-size
GPU VRAM: 8176 MB
Subtest query-vram-size: SUCCESS (0.001s)
Starting subtest: query-fw-version
GFX FW version: 0x006d
Subtest query-fw-version: SUCCESS (0.001s)`,
            hint: 'use amdgpu_query_firmware_version() 查询firmwareversion. 参考 tests/amdgpu/amd_basic.c inalreadyhas查询testing. ifcompilation报错找nottoheader file, ensure libdrm-dev and libdrm-amdgpu1 alreadyinstall. ',
          },
          debugExercise: {
            title: 'find IGT testinginlogicerror',
            language: 'c',
            description: 'belowtesting声称verify VRAM allocationon限, 但actualonhaslogic漏洞cause它永远will notfind真正 bug. ',
            question: 'whythistestingnotcanvaliddetect VRAM allocationboundaryissue? ',
            buggyCode: `igt_subtest("vram-boundary-test") {
    uint64_t total_vram = gpu_info.vram_size;
    uint64_t alloc_size = total_vram / 2;

    /* allocation 50% VRAM — shouldsuccess */
    amdgpu_bo_handle bo1 = alloc_bo(alloc_size,
        AMDGPU_GEM_DOMAIN_VRAM);
    igt_assert(bo1 != NULL);

    /* againallocation 50% — alsoshouldsuccess */
    amdgpu_bo_handle bo2 = alloc_bo(alloc_size,
        AMDGPU_GEM_DOMAIN_VRAM);
    igt_assert(bo2 != NULL);

    /* againallocation 50% — shouldfailure */
    amdgpu_bo_handle bo3 = alloc_bo(alloc_size,
        AMDGPU_GEM_DOMAIN_VRAM);
    igt_assert(bo3 == NULL);  /* 期望failure */

    /* cleanup */
    amdgpu_bo_free(bo1);
    amdgpu_bo_free(bo2);
}`,
            hint: '思考 VRAM actualuse情况 — 桌面environment, firmware, otherprocessalready占用一部分 VRAM. additionally amdgpu driversupport VRAM to GTT automaticmigration. ',
            answer: 'thistestinghastwo根本issue: (1)VRAM is not空: systemstartupafter, 桌面environment framebuffer, GPU firmwarereserve区, otherprocessalready占用部分 VRAM. total_vram / 2 假设no考虑alreadyuse VRAM. bo1 and bo2 allocationmaybecauseavailable VRAM not足 total_vram 而failure, cause assert failure — 这is假阳性(false positive). fix: 用 amdgpu_query_heap_info get max_allocation andcurrentavailable量, 而is not假设entire VRAM available. (2)drivermayautomaticmigration: when VRAM not足时, amdgpu driver TTM memory management器maywill旧 BO from VRAM migrationto GTT(system memory), 腾出空between给新allocation. so bo3 allocationmaysuccess(bo1 or bo2 bymigrationto GTT), cause igt_assert(bo3 == NULL) failure — 这is also假阳性. tocorrecttesting VRAM boundary, needuse AMDGPU_GEM_CREATE_NO_EVICT flag阻止migration. ',
          },
          interviewQ: {
            question: '你howas amdgpu driver新增a ioctl writecompletetesting用例? design正面and负面testing. ',
            difficulty: 'hard',
            hint: '以a假设新 ioctl(如set GPU priority)as例, designoverwrite正常process, boundarycondition, errorparameter, permissionchecktesting矩阵. ',
            answer: '假设新增 DRM_IOCTL_AMDGPU_SET_PRIORITY(setprocess GPU schedulingpriority), 我testingdesign: 正面testing: (1)set-default-priority: setdefaultpriority NORMAL → verify ioctl return 0; (2)set-high-priority: 以 root set HIGH priority → verifyreturn 0 且through GET_PRIORITY confirm生效; (3)set-low-priority: set LOW → verify生效; (4)priority-affects-scheduling: create HIGH and LOW twoprocess, commitsamework量, HIGH should更快complete. 负面testing: (5)invalid-priority-value: 传入 priority=9999(超出range)→ verifyreturn -EINVAL; (6)invalid-fd: 传入is not amdgpu  fd → verifyreturn -ENODEV; (7)no-permission-high: 以非 root userset HIGH → verifyreturn -EPERM(need CAP_SYS_NICE); (8)double-set: contiguousset两次differentpriority → verifyfinallyonce生效. boundarytesting: (9)set-after-close: 关闭 fd afterset → verifynotcrash. each子testing用 igt_subtest 包裹, permissionrelatedtesting用 igt_require(getuid() == 0) or igt_require(getuid() != 0) 做before置check. ',
            amdContext: 'AMD interviewinlet你designtesting用例is考察yoursystem思维 — not只is"cannotcanwork", stillto思考"inwhat情况belowwill出issue". overwrite正面, 负面, boundaryandpermissiontestingdemonstrate你对driversecurity性understand. ',
          },
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    // Group 10.2: CI andkerneltesting
    // ════════════════════════════════════════════════════════════
    {
      id: '10-2',
      number: '10.2',
      title: 'CI andkerneltesting',
      titleEn: 'CI & Kernel Testing',
      icon: 'RefreshCw',
      description: 'masterkernel自testingframework(kselftest and KUnit)usemethod, understand AMD CI basics设施architecture, 学will解读 CI pipelineresult并handleregression test. ',
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
            summary: 'Linux kernelhas两套互补testingframework: kselftest used forfromuser spacerunfunctiontesting(tools/testing/selftests/), KUnit used forinkernel spacerununit test(through kunit_test module). DRM subsystem广泛use两者 — kselftest/drm/ testing UAPI interface, KUnit testinginternal算法如 drm_buddy memory allocation器. ',
            explanation: [
              'Kernel Selftests(kselftest)is Linux kerneluser-spacetestingframework. testingcodein tools/testing/selftests/ below, eachsubsystemhasselfdirectory. for DRM/GPU, relatedtestingin tools/testing/selftests/drm/. thesetestingcompilationasuser spaceprogram, through ioctl andkernelinteraction. runapproach: make -C tools/testing/selftests/drm run_tests. kselftest output TAP(Test Anything Protocol)formatresult, 易于by CI systemparse. ',
              'KUnit is Linux kernel内建unit testframework(Kernel Unit Testing Framework), from Linux 5.5 start引入. and kselftest different, KUnit testingruninkernel space — 你candirectlytestingkernelinternalfunctionanddata structure, 无需through ioctl interface. KUnit testingusuallycompilationaskernel module, loading时automaticrunalltesting用例. ',
              'KUnit coremacro: KUNIT_ASSERT_EQ(test, a, b) 断言 a == b, failure时立i.e.stopcurrenttesting(similar assert); KUNIT_EXPECT_EQ(test, a, b) also断言 a == b, 但failure时continuerunafter续断言(similar soft assert). ASSERT used for致命error(continuerunno意义), EXPECT used for非致命error(想看toallfailure项). ',
              'drm_buddy_test.c is DRM subsystemin最typical KUnit testing之一. drm_buddy is DRM 伙伴allocation器(buddy allocator), used formanagement GPU VRAM physicaladdress space. this KUnit testingverifyallocation, release, merge, alignment等core算法correct性. becausethese算法is纯kernel态internalimplementation(not暴露给user space), so只can用 KUnit testing, notcan用 kselftest. ',
              'KUnit outputis also TAP format. 你canthrough两种approachrun KUnit testing: (1)compilationasmoduleafter insmod: insmod drm_buddy_test.ko, then dmesg viewresult; (2)use KUnit  Python run器: python3 tools/testing/kunit/kunit.py run --kconfig_add CONFIG_DRM_BUDDY_SELFTEST=m. after者更方便, because它automaticconfiguration, compilation, run并parseresult. ',
            ],
            keyPoints: [
              'kselftest inuser-spacerun, through ioctl testing UAPI interface; KUnit inkernel态run, directlytestinginternalfunction',
              'KUnit 双layer断言: KUNIT_ASSERT(致命)stoptesting vs KUNIT_EXPECT(非致命)continuerun',
              'drm_buddy_test.c testing DRM 伙伴allocation器 — 纯kernelinternal算法只can用 KUnit testing',
              '两者alloutput TAP formatresult, canby CI systemautomaticparse',
              'kselftest run: make -C tools/testing/selftests/drm run_tests',
              'KUnit run: python3 tools/testing/kunit/kunit.py run or insmod + dmesg',
            ],
          },
          diagram: {
            title: 'kselftest vs KUnit compareandapplicationscenario',
            content: `Linux kernel两套testingframeworkcompare

                    kselftest                          KUnit
                    ─────────                          ─────
run空between          user space (Ring 3)                kernel space (Ring 0)
codelocation          tools/testing/selftests/          drivers/gpu/drm/tests/
testinggoal          UAPI interface (ioctl, sysfs)         internalfunction/算法
hardwaredependency          needrealhardware                      canin UML/QEMU inrun
testing粒度          function/integration test                     unit test
outputformat          TAP                               TAP

DRM subsystemuse
─────────────────

kselftest (tools/testing/selftests/drm/)
┌──────────────────────────────────────┐
│  drm_mm.c     → testing DRM memory management器  │  ← through ioctl
│  drm_buddy.c  → testing伙伴allocation器 API   │  ← through ioctl
│  ...                                  │
│  compilation: make -C tools/testing/         │
│        selftests/drm                  │
│  run: sudo ./drm_mm                  │
└──────────────────────────────────────┘

KUnit (drivers/gpu/drm/tests/)
┌──────────────────────────────────────┐
│  drm_buddy_test.c  → internalallocation算法    │  ← directlycall
│  drm_format_test.c → 像素formatconvert    │    kernelfunction
│  drm_rect_test.c   → 矩形clipping算法   │
│  drm_mm_test.c     → memory management器      │
│                                       │
│  runapproach 1: insmod drm_buddy_test.ko │
│             dmesg | grep "TAP"        │
│                                       │
│  runapproach 2: python3 tools/testing/   │
│    kunit/kunit.py run                 │
│    --kconfig_add CONFIG_DRM_BUDDY=y   │
└──────────────────────────────────────┘

TAP outputformatexample: 
┌────────────────────────────────────┐
│ TAP version 14                     │
│ 1..4                               │
│ ok 1 drm_buddy_test_alloc_simple   │
│ ok 2 drm_buddy_test_alloc_aligned  │
│ not ok 3 drm_buddy_test_oversize   │
│ ok 4 drm_buddy_test_free_merge     │
│ # 3 passed, 1 failed               │
└────────────────────────────────────┘`,
            caption: 'kselftest fromuser-spacetesting UAPI interface, KUnit fromkernel态testinginternal算法. 两者互补, TAP outputformat统一便于 CI parse. ',
          },
          codeWalk: {
            title: 'drm_buddy allocation器 KUnit testinganalyze',
            file: 'drivers/gpu/drm/tests/drm_buddy_test.c',
            language: 'c',
            code: `/* drm_buddy_test.c — DRM 伙伴allocation器 KUnit unit test
 * file: drivers/gpu/drm/tests/drm_buddy_test.c (简化版)
 *
 * drm_buddy is DRM 伙伴allocation器, used for GPU VRAM addressmanagement
 * amdgpu use它management VRAM physicaladdress spaceallocation
 */
#include <kunit/test.h>
#include <drm/drm_buddy.h>

/* testingbasicallocationfunction */
static void drm_buddy_test_alloc_simple(struct kunit *test)
{
    struct drm_buddy mm;
    struct drm_buddy_block *block;
    LIST_HEAD(allocated);
    /* initialization 64KB 伙伴allocation器, 最小block 4KB */
    int ret = drm_buddy_init(&mm, SZ_64K, SZ_4K);
    KUNIT_ASSERT_EQ(test, ret, 0);

    /* allocationa 4KB block */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_4K, &allocated,
                                  DRM_BUDDY_TOPDOWN_ALLOCATION);
    KUNIT_EXPECT_EQ(test, ret, 0);
    KUNIT_EXPECT_EQ(test, !list_empty(&allocated), true);

    /* verifyallocationblocksize */
    block = list_first_entry(&allocated,
                              struct drm_buddy_block, link);
    KUNIT_EXPECT_EQ(test,
        drm_buddy_block_size(&mm, block), (u64)SZ_4K);

    /* cleanup */
    drm_buddy_free_list(&mm, &allocated);
    drm_buddy_fini(&mm);
}

/* testingalignmentallocation */
static void drm_buddy_test_alloc_aligned(struct kunit *test)
{
    struct drm_buddy mm;
    struct drm_buddy_block *block;
    LIST_HEAD(allocated);
    int ret = drm_buddy_init(&mm, SZ_1M, SZ_4K);
    KUNIT_ASSERT_EQ(test, ret, 0);

    /* allocation 64KB alignmentblock */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_64K, &allocated,
                                  DRM_BUDDY_TOPDOWN_ALLOCATION);
    KUNIT_EXPECT_EQ(test, ret, 0);

    block = list_first_entry(&allocated,
                              struct drm_buddy_block, link);
    /* verifyaddressis 64KB alignment */
    KUNIT_EXPECT_EQ(test,
        drm_buddy_block_offset(block) & (SZ_64K - 1), 0ULL);

    drm_buddy_free_list(&mm, &allocated);
    drm_buddy_fini(&mm);
}

/* testingallocationfailurescenario */
static void drm_buddy_test_alloc_oversize(struct kunit *test)
{
    struct drm_buddy mm;
    LIST_HEAD(allocated);
    int ret = drm_buddy_init(&mm, SZ_64K, SZ_4K);
    KUNIT_ASSERT_EQ(test, ret, 0);

    /* tryallocationexceed总sizememory — shouldfailure */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_128K, &allocated,
                                  DRM_BUDDY_TOPDOWN_ALLOCATION);
    KUNIT_EXPECT_EQ(test, ret, -ENOSPC);

    drm_buddy_fini(&mm);
}

/* registrationtesting套件 */
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
              'KUNIT_ASSERT_EQ used for致命error(如initializationfailure) — failureafter立i.e.stopcurrenttesting',
              'KUNIT_EXPECT_EQ used for非致命断言 — failureaftercontinuerun, reportallfailure项',
              'drm_buddy_init(&mm, SZ_64K, SZ_4K) create 64KB 总capacity, 4KB 最小粒度allocation器',
              'DRM_BUDDY_TOPDOWN_ALLOCATION from高address向低addressallocation, 减少fragment',
              'drm_buddy_block_offset() getallocationblockphysicaloffset, used forverifyalignment',
              'kunit_test_suite() macroregistrationtesting套件, moduleloading时automaticrun',
            ],
            explanation: 'this KUnit testingdirectlyinkernel spacecall drm_buddy allocation器internal API — 这is kselftest unable to做to, because drm_buddy not暴露给user space. note ASSERT and EXPECT differentusescenario: init 用 ASSERT(failureafterunable tocontinue), allocationresult用 EXPECT(想看toallfailure). amdgpu  VRAM management底layeruse drm_buddy, sothesetestingdirectly保证 VRAM allocationcorrect性. ',
          },
          miniLab: {
            title: 'run DRM KUnit testing',
            objective: 'compilation并run DRM subsystem KUnit testing, 学will解读 TAP formatoutput. ',
            steps: [
              '进入kernelsource codedirectory: cd ~/kernel-src',
              'use KUnit run器execute drm_buddy testing: python3 tools/testing/kunit/kunit.py run --kconfig_add CONFIG_DRM=y --kconfig_add CONFIG_DRM_BUDDY=y drm_buddy',
              'or手动compilationasmodule: make defconfig && scripts/config --enable DRM --enable DRM_BUDDY --module DRM_BUDDY_SELFTEST && make M=drivers/gpu/drm/tests -j$(nproc)',
              'loadingtestingmodule: sudo insmod drivers/gpu/drm/tests/drm_buddy_test.ko',
              'view TAP output: dmesg | tail -30(find TAP version 开头行)',
              'statisticsresult: dmesg | grep -c "ok " && dmesg | grep -c "not ok"',
              'unloadingmodule: sudo rmmod drm_buddy_test',
              'alsocanrunother DRM KUnit testing: ls drivers/gpu/drm/tests/(viewallavailabletesting)',
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

# orthrough dmesg view TAP output:
$ dmesg | grep -A 20 "TAP version"
TAP version 14
1..4
ok 1 drm_buddy_test_alloc_simple
ok 2 drm_buddy_test_alloc_aligned
ok 3 drm_buddy_test_alloc_oversize
ok 4 drm_buddy_test_free_merge`,
            hint: 'KUnit run器needkernelsource codein tools/testing/kunit/kunit.py 脚本. if你遇to Python dependencyissue, pip3 install junitparser. 手动 insmod approachin任何environmentallcanwork. ',
          },
          debugExercise: {
            title: 'fix KUnit testingin ASSERT/EXPECT 误用',
            language: 'c',
            description: 'below KUnit testing混淆 ASSERT and EXPECT usescenario, causetesting行asnot符合预期. ',
            question: 'whythistestingincertain情况belowwill segfault 而is not正常report FAIL? ',
            buggyCode: `static void test_alloc_and_check(struct kunit *test)
{
    struct drm_buddy mm;
    struct drm_buddy_block *block;
    LIST_HEAD(allocated);

    /* BUG: 用 EXPECT rather than ASSERT checkinitialization */
    int ret = drm_buddy_init(&mm, SZ_64K, SZ_4K);
    KUNIT_EXPECT_EQ(test, ret, 0);

    /* if init failure, mm not yetinitialization
     * continueuse mm willcause segfault */
    ret = drm_buddy_alloc_blocks(&mm, 0, mm.size,
                                  SZ_4K, &allocated, 0);

    /* BUG: 用 ASSERT check非致命result */
    KUNIT_ASSERT_EQ(test, ret, 0);
    /* if alloc failure, after续断言永远notexecute
     * weunable toknow block verifywhetheralsohasissue */

    block = list_first_entry(&allocated,
                              struct drm_buddy_block, link);
    KUNIT_ASSERT_EQ(test,
        drm_buddy_block_size(&mm, block), (u64)SZ_4K);

    drm_buddy_free_list(&mm, &allocated);
    drm_buddy_fini(&mm);
}`,
            hint: 'KUNIT_ASSERT failureafter立i.e.stop, KUNIT_EXPECT failureaftercontinuerun. 想想whichfailureis"unable tocontinue", whichis"cancontinue看看". ',
            answer: 'two ASSERT/EXPECT 混淆: (1)drm_buddy_init return valueshould用 KUNIT_ASSERT_EQ rather than KUNIT_EXPECT_EQ. if init failure(ret != 0), mm structure体not yetcorrectinitialization, after续use mm call drm_buddy_alloc_blocks willaccessnot yetinitializationmemory, causekernel segfault or oops. ASSERT infailure时立i.e.stoptesting, prevent这种级联crash. (2)drm_buddy_alloc_blocks return valueshould用 KUNIT_EXPECT_EQ rather than KUNIT_ASSERT_EQ. allocationfailureis非致命 — wemaystill想continuecheckother断言收集更多debugginginformation. 但neednote: if alloc failure(allocated listas空), after续 list_first_entry alsowill出issue, soactualon这inside ASSERT is also合理 — 取决于after续codewhetherdependency于allocationsuccess. 最佳实践: 对"after续codedependencybefore置condition"用 ASSERT, 对"independentcheck项"用 EXPECT. ',
          },
          interviewQ: {
            question: 'explain kselftest and KUnit difference, 各自适用whatscenario? why DRM subsystem两者allneed? ',
            difficulty: 'medium',
            hint: 'fromrun空between, testing粒度, hardwaredependency, 适用scenario四个维度compare. ',
            answer: 'kselftest vs KUnit coredifference: (1)run空between: kselftest inuser-spacerun(independentcanexecuteprogram), throughsystem call/ioctl andkernelinteraction; KUnit inkernel态run(kernel module), directlycallkernelinternalfunction. (2)testing粒度: kselftest isfunction/integration test — testing UAPI interfacewhethercorrect(如 GEM ioctl whetherreturncorrectresult); KUnit isunit test — testing单个functionor算法(如 drm_buddy allocation器alignmentlogic). (3)hardwaredependency: kselftest usuallyneedrealhardware(becausetothrough ioctl anddriverinteraction); KUnit canin UML(User Mode Linux)or QEMU inrun, notneed GPU hardware. (4)DRM 两者allneedcause: usercan见行as(patternset, buffer allocation/release, command submission)need kselftest fromuser角度verify; internal算法(buddy allocation器, 矩形clipping, formatconvert)need KUnit 做细粒度verify. 两layertesting互补: KUnit ensure算法correct, kselftest ensureinterfacecorrect. ifonly kselftest, internal算法 bug 难以精确locate; ifonly KUnit, interfacelayerissue(parameterparse, permissioncheck)willby遗漏. ',
            amdContext: 'understandtestingstrategyis AMD engineercoreability. interviewindemonstratedo you know"what用whatframeworktesting"indicate你对软件质量hassystem性思考, rather than只will写code. ',
          },
        },

        // ── Lesson 10.2.2 ──────────────────────────────────────
        {
          id: '10-2-2',
          number: '10.2.2',
          title: 'CI pipelineandregression test',
          titleEn: 'CI Pipelines & Regression Testing',
          duration: 15,
          difficulty: 'intermediate',
          tags: ['CI', 'GitLab', 'regression', 'pipeline', 'freedesktop'],
          concept: {
            summary: 'AMD  GPU driver CI basics设施runin freedesktop.org  GitLab 实例on, containcompilationcheck, staticanalyzeandreal GPU hardwaretesting三个stage. understand CI pipelineworkapproach — especiallyhow区分真正回归andknownnot稳定testing — is参andupstreamdevelopmentessentialskill. ',
            explanation: [
              'AMD amdgpu driver CI runin https://gitlab.freedesktop.org/. whena Merge Request(MR)bycommitto drm-next or amd-staging-drm-next branch时, GitLab CI automatictrigger一series pipeline 作业. these作业in AMD providehardwaretesting农场onrun, overwritefrom GCN to RDNA3 多代 GPU. CI isprevent回归(regression)进入mainlinefinally一道防线. ',
              'CI pipeline分as三个mainstage: (1)Build Stage — in多种configurationbelowcompilationkernel: x86_64 + gcc, x86_64 + clang, arm64 + cross-compile. compilationmust零error零警告(-Werror). thisstagein几分钟内complete. (2)Static Analysis Stage — run sparse(typechecktool, detect __user/__iomem pointer滥用), smatch(bug patterndetect)and checkpatch.pl(code风格check). thisstage帮助findnotthroughrun时testingcanfindissue. (3)Hardware Test Stage — inreal GPU onrun IGT testing套件. eachsupport GPU 型号has一台or多台testing机, runcomplete IGT testing集. thisstage最耗时(30-60 分钟), 但is also最has价值. ',
              'handle flaky test(not稳定testing)is CI 维护corechallenge. flaky test is指innocode变更情况below, has时 PASS has时 FAIL testing. causeinclude: hardware时序差异(different温度below GPU 行as微妙different), race conditioncondition(testinginthreadschedulingnot确定性), environmentdependency(testing假设specificdisplay器连接state). CI systemuseretrystrategy(retry 2-3 次, 任何once PASS i.e.认asthrough)缓解 flaky test impact. ',
              'CI use expected-failures file(also叫 baseline or flakes file)recordknownfailuretesting. thisfile列出inspecifichardwareonknownwillfailuretesting用例及其预期failurestate. CI inreportresult时, willactualfailureand expected-failures compare: iffailureinlistin, markas "known failure"(notblockmerge); ifis新failure(notinlistin), markas "regression"(blockmerge, must调查). 这种mechanismensure CI canoperate性 — avoid因knownissuenot断block新patchmerge. ',
              'when你commitpatch引入 CI 回归时, 你will收to CI systemautomaticreport, contain: failuretesting名称, failurespecific子testing, testingoutputlog(stdout + dmesg), and该testingin baseline on历史表现. 你needanalyzefailureisyourpatch引入真正回归stillis pre-existing flake. ifis真正回归, 你needfixor撤回patch. ',
            ],
            keyPoints: [
              'AMD CI in freedesktop.org GitLab onrun: Build → Static Analysis → Hardware Test',
              'Build Stage: gcc/clang 多configurationcompilation, -Werror 零容忍',
              'Static Analysis: sparse(typecheck)+ smatch(Bug pattern)+ checkpatch(code风格)',
              'Hardware Test: real GPU run IGT testing套件, overwrite多代hardware',
              'expected-failures file区分 "knownfailure" and "新回归" — only新回归blockmerge',
              'Flaky test strategy: retrymechanism + known-flaky mark + issue tracingfix',
            ],
          },
          diagram: {
            title: 'AMD CI pipelinecompletearchitecture',
            content: `AMD amdgpu CI pipeline (freedesktop.org GitLab)

development者commit MR (Merge Request)
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Stage 1: Build (compilationcheck)                ~5 min       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ x86_64-gcc   │  │ x86_64-clang │  │ arm64-cross  │  │
│  │ -Werror      │  │ -Werror      │  │ -Werror      │  │
│  │  PASS ✓      │  │  PASS ✓      │  │  PASS ✓      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │ entire PASS only thencontinue
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Stage 2: Static Analysis (staticanalyze)      ~10 min      │
│                                                          │
│  ┌──────────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ sparse           │  │ smatch      │  │ checkpatch │ │
│  │ __user/__iomem   │  │ Bug patterns│  │ Code style │ │
│  │ typecheck         │  │ NULL deref  │  │ format/命名  │ │
│  │  PASS ✓          │  │  PASS ✓     │  │ 1 WARNING  │ │
│  └──────────────────┘  └─────────────┘  └────────────┘ │
└──────────────────────────┬──────────────────────────────┘
                           │ 无 ERROR only thencontinue
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Stage 3: Hardware Testing (hardwaretesting)     ~30-60 min   │
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
│         │ actual FAIL vs expected:          │              │
│         │   kms_cursor@pipe-A → KNOWN ✓   │              │
│         │   amd_basic@query   → NEW!! ✗   │              │
│         └─────────────────────────────────┘              │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  CI Result              │
              │  ● 新回归: 1            │
              │    amd_basic@query      │
              │  ● knownfailure: 1 (忽略)   │
              │  ● state: BLOCKED │
              │  → fixafterre-commit       │
              └─────────────────────────┘`,
            caption: 'CI pipeline三stageprocess. keyis baseline comparison — willactual FAIL and expected-failures filecompare, only新出现回归only thenblockmerge. 这ensure CI 实用性. ',
          },
          codeWalk: {
            title: '解读 CI Pipeline resultand expected-failures file',
            file: 'CI pipeline output + expected-failures.txt',
            language: 'text',
            code: `# ========================================
# CI Pipeline resultexample(GitLab CI output)
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
# FAIL: amd_basic@query-info
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
# expected-failures.txt fileformat
# ========================================
# format: <hardware> <test>@<subtest> <expected-status> [optional-note]

# Known hardware limitations
rdna3-rx7600  kms_cursor_crc@cursor-128x128-onscreen  FAIL  # Issue #2847
rdna3-rx7600  kms_writeback@writeback-fb-id            SKIP  # No writeback support

# Known flaky tests (intermittent)
rdna3-rx7600  gem_exec_whisper@basic-queues             FLAKE  # Race condition
rdna3-rx7600  kms_flip@flip-vs-expired-vblank           FLAKE  # Timing sensitive

# GCN specific known failures
gcn5-vega56   amd_cs_nop@compute-ring                   FAIL  # FW bug, won't fix

# ========================================
# howanalyzea CI 回归
# ========================================
# Step 1: confirmwhetherin expected-failures in
$ grep "amd_basic@query-info" expected-failures.txt
(no output — notinlistin → is新回归!)

# Step 2: viewfailure dmesg log
# keyinformation: "VRAM: 0M" — VRAM detectfailure
# maycause: yourpatchimpact amdgpu_gmc  VRAM detectlogic

# Step 3: 复现
$ git log --oneline -1   # confirmcurrentishasissuecommit
$ sudo ./build/tests/amdgpu/amd_basic --run-subtest query-info

# Step 4: bisect(ifneed)
$ git bisect start HEAD known-good-commit
$ git bisect run sudo ./build/tests/amdgpu/amd_basic \\
    --run-subtest query-info`,
            annotations: [
              'CI result区分三种state: 新回归(mustfix), knownfailure(KNOWN, has issue tracing), not稳定testing(FLAKE)',
              'expected-failures.txt 按hardware平台分组, recordknownfailureandnot稳定testing',
              'FLAKE marktestingin CI inautomaticretry 2-3 次, 任何once PASS i.e.认asthrough',
              'dmesg logisdiagnose回归keyinformation — CI systemwillsaveeach timeruncomplete dmesg',
              'git bisect run canautomatic化二分lookup引入回归specificcommit',
              '回归mustinbelowamerge窗口beforefix, otherwiserelatedpatchwillby revert',
            ],
            explanation: 'thisoutputdemonstratehow解读real CI pipelineresult. coreskillis区分"新回归"and"knownfailure" — before者isyourpatch引入issueneedfix, after者isalreadyexistissuenotshouldblockyourwork. expected-failures fileisteam协作产物 — each人allhas责任保持它准确性. whenaknownissuebyfix时, needfromlistin移除corresponding条目. ',
          },
          miniLab: {
            title: 'simulate CI resultanalyzeprocess',
            objective: 'practiceanalyze CI pipelineoutput, 学will区分真正回归andknownfailure, 并master回归调查step. ',
            steps: [
              '浏览 AMD  GitLab CI page: https://gitlab.freedesktop.org/agd5f/linux/-/pipelines(viewreal CI pipeline)',
              '点击a最近 pipeline, view各个 stage state',
              'finda Hardware Test stage 作业, viewtestingresultandlog',
              'inlogin搜索 "FAIL" and "regression" key词',
              'viewproject expected-failures file(ifhas话): inrepositoryin搜索 "expected" or "flakes"',
              'practice git bisect: in你selfkernelrepositoryin, 故意引入awilllet某个testingfailuremodify, then用 git bisect locate它',
              'createaexample expected-failures.txt file, record你in本modulein遇totestingfailure',
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
            hint: 'freedesktop.org  GitLab needregistration账号only thencan看to部分 CI 详情. git bisect run needareturn 0(good)or非 0(bad)testing脚本. ',
          },
          debugExercise: {
            title: '判断 CI failureis回归stillisknownissue',
            language: 'text',
            description: 'yourpatchin CI intrigger 3 个testingfailure. according tobelowinformation判断whichis真正回归. ',
            question: 'whichfailureis你needfix真正回归? whichcan忽略? 给出理由. ',
            buggyCode: `yourpatch: "drm/amdgpu: optimize VRAM allocation path"

CI failurelist:
1. amd_basic@gem-create
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
            hint: 'analyzeeachfailure: 看 baseline 历史(beforewhether一直 PASS), whetherin expected-failures in, andfailurepatternwhetherandyourmodifyrelated. ',
            answer: '判断: (1)amd_basic@gem-create — 真正回归, mustfix. 理由: baseline is 100% PASS(fromnot yetfailure过), notin expected-failures in, 且failurecause ENOMEM(memorynot足)andyourpatch"optimize VRAM allocation path"directlyrelated. youroptimizationmay改变allocationlogiccause某种情况belowallocationfailure. (2)kms_cursor_crc@cursor-256x256-rapid-movement — knownnot稳定testing, can忽略. 理由: alreadyin expected-failures inmarkas FLAKE, baseline only 73% through率, failurecause(像素级 CRC notmatch)andyour VRAM modify无关. (3)gem_exec_whisper@basic-fds — need调查但mayis not回归. 理由: althoughnotin expected-failures in, 但 98% pass rate indicate它偶尔willfailure, 且failurecauseis timeout(rather thanlogicerror), mayis CI 机器负载高cause. recommended: retry CI once, if第二次 PASS 则confirmis flake, shouldwill其addto expected-failures in. yourcoreworkisfix #1. ',
          },
          interviewQ: {
            question: 'describe GPU driver CI pipelinemainstage, andhowhandle CI in flaky test(not稳定testing). ',
            difficulty: 'hard',
            hint: 'from CI architecture, testing分类, flaky test 识别andhandlestrategy角度answer. ',
            answer: 'CI pipelinestage: (1)Build Stage: inmultiplearchitectureandconfigurationoncompilationkernel(x86_64-gcc, x86_64-clang, arm64-cross), checkcompilation警告anderror, use -Werror ensure零警告; (2)Static Analysis: sparse check __user/__iomem type标注, smatch detect潜in bug pattern(如 NULL 解引用, 整数overflow), checkpatch checkcode风格; (3)Hardware Testing: in RDNA3, RDNA2, GCN 等多代 GPU testing机onrun IGT testing套件, overwrite GEM, KMS, CS, power management等各functionmodule; (4)Regression Analysis: willactualresultand baseline compare, will新出现 FAIL markas regression. Flaky test handlestrategy: (1)识别: statisticstestingin最近 N 次runin PASS/FAIL 比例, pass rate < 95% markas flaky; (2)分类: 时序敏感(增加timeout/retry次数), hardwarenot稳定(温度/功耗波动), race conditioncondition(加锁/serial化), environmentdependency(增加 igt_require check); (3)缓解: CI retrymechanism(任何once PASS i.e.认asthrough), expected-failures filerecordknown flaky, notblock MR merge; (4)fix: create issue tracingeach flaky test, inbelow个 release cycle infix根本cause并from expected-failures in移除. ',
            amdContext: 'AMD CI teamanddriverteam密切协作. interviewindemonstrate你understand CI not仅is"跑testing" — still涉及 baseline management, flaky test strategy, hardware farm 维护 — indicate你has成熟工程实践认知. 这in AMD  Toolchain/Infra teaminterviewin尤asimportant. ',
          },
        },
      ],
    },
  ],
  completionChecklist: [
    'understand IGT GPU Tools architecture: igt_main / igt_subtest / igt_fixture 三layerstructure',
    'canwritecomplete amdgpu IGT testing, include正面testing, 负面testingand压力testing',
    'understand kselftest and KUnit difference及各自适用scenario',
    'canrun DRM KUnit testing并解读 TAP formatoutput',
    'understand AMD CI pipeline三个stage: Build → Static Analysis → Hardware Test',
    'cananalyze CI result, 区分真正回归andknownfailure(expected-failures)',
    'master git bisect locate引入回归commit',
    'understand flaky test handlestrategy: retry, mark, tracingfix',
  ],
};
