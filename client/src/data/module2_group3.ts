import type { MicroLessonModule } from "./micro_lesson_types";

export const module2Group3: MicroLessonModule = {
  moduleId: "hardware",
  groupId: "group3",
  groupTitle: "GPU 内存与设备管理",
  groupDescription: "深入理解 GPU 内存域、Command Ring、固件加载和设备重置——AMDGPU 驱动的核心运行机制",
  lessons: [
  {
    id: "2-11-1",
    title: "2.11 GPU \u5185\u5b58\u57df (Memory Domains)",
    duration: "18 min",
    summary: "GPU \u9a71\u52a8\u9700\u8981\u7ba1\u7406\u591a\u79cd\u5185\u5b58\u533a\u57df\u3002AMDGPU \u5b9a\u4e49\u4e86\u4e09\u79cd\u4e3b\u8981\u5185\u5b58\u57df\uff1aVRAM\uff08\u663e\u5b58\uff09\u3001GTT\uff08\u901a\u8fc7 GART \u6620\u5c04\u7684\u7cfb\u7edf\u5185\u5b58\uff09\u548c\u7cfb\u7edf\u5185\u5b58\u3002\u7406\u89e3\u8fd9\u4e9b\u57df\u662f\u5b66\u4e60 GEM/TTM \u5185\u5b58\u7ba1\u7406\u7684\u57fa\u7840\u3002",
    keyPoints: [
          "VRAM\uff1aGPU \u672c\u5730\u663e\u5b58\uff0c\u8bbf\u95ee\u901f\u5ea6\u6700\u5feb\uff0c\u901a\u8fc7 PCIe BAR \u6620\u5c04",
          "GTT (Graphics Translation Table)\uff1a\u7cfb\u7edf\u5185\u5b58\u901a\u8fc7 IOMMU/GART \u6620\u5c04\u5230 GPU \u5730\u5740\u7a7a\u95f4",
          "System RAM\uff1aCPU \u53ef\u76f4\u63a5\u8bbf\u95ee\uff0cGPU \u901a\u8fc7 PCIe \u8bbf\u95ee\uff08\u901f\u5ea6\u6700\u6162\uff09",
          "\u5185\u5b58\u57df\u8fc1\u79fb\uff1a\u9a71\u52a8\u6839\u636e\u4f7f\u7528\u9891\u7387\u5728\u57df\u4e4b\u95f4\u8fc1\u79fb buffer object",
          "AMDGPU_GEM_DOMAIN_VRAM = 0x4, AMDGPU_GEM_DOMAIN_GTT = 0x2"
        ],
    diagram: {
      title: "AMDGPU \u5185\u5b58\u57df\u67b6\u6784\u56fe",
      content: `
  ┌─────────────────────────────────────────────────────────┐
  │                    GPU 地址空间                          │
  │  ┌─────────────────┐    ┌──────────────────────────┐   │
  │  │   VRAM Domain   │    │      GTT Domain           │   │
  │  │  (Local VRAM)   │    │  (System RAM via GART)    │   │
  │  │                 │    │                           │   │
  │  │  ● 最快访问     │    │  ● CPU/GPU 共享           │   │
  │  │  ● GPU 独占     │    │  ● 通过 IOMMU 映射        │   │
  │  │  ● 通过 BAR0    │    │  ● DMA 传输               │   │
  │  │    访问         │    │                           │   │
  │  └────────┬────────┘    └──────────┬───────────────┘   │
  │           │                        │                    │
  └───────────┼────────────────────────┼────────────────────┘
              │ PCIe BAR0              │ IOMMU/GART
  ┌───────────▼────────────────────────▼────────────────────┐
  │                    物理内存                              │
  │  ┌─────────────────┐    ┌──────────────────────────┐   │
  │  │  GPU VRAM       │    │    System RAM (DDR)       │   │
  │  │  (GDDR6/HBM)    │    │    (CPU 主内存)           │   │
  │  └─────────────────┘    └──────────────────────────┘   │
  └─────────────────────────────────────────────────────────┘

  内存域优先级 (amdgpu_bo_create):
  VRAM > GTT > System RAM
  驱动根据 GPU 访问频率自动迁移 BO
`,
      caption: "AMDGPU \u4e09\u79cd\u5185\u5b58\u57df\u7684\u7269\u7406\u6620\u5c04\u5173\u7cfb"
    },
    codeWalk: {
      title: "AMDGPU \u5185\u5b58\u57df\u5b9a\u4e49\uff08include/uapi/drm/amdgpu_drm.h\uff09",
      language: "c",
      code: `/* AMDGPU 内存域标志位定义 */
#define AMDGPU_GEM_DOMAIN_CPU    0x1  /* CPU 可访问的系统内存 */
#define AMDGPU_GEM_DOMAIN_GTT    0x2  /* GPU 通过 GART 访问的系统内存 */
#define AMDGPU_GEM_DOMAIN_VRAM   0x4  /* GPU 本地显存 (VRAM) */
#define AMDGPU_GEM_DOMAIN_GDS    0x8  /* Global Data Store */
#define AMDGPU_GEM_DOMAIN_GWS    0x10 /* Global Wave Sync */
#define AMDGPU_GEM_DOMAIN_OA     0x20 /* Ordered Append */

/* Buffer Object 创建时指定首选域和允许域 */
struct drm_amdgpu_gem_create {
    __u64 bo_size;           /* Buffer 大小 */
    __u64 alignment;         /* 对齐要求 */
    __u64 domains;           /* 首选内存域 (VRAM/GTT/CPU) */
    __u64 domain_flags;      /* 域标志 */
};

/* 驱动内部 BO 创建 */
int amdgpu_bo_create(struct amdgpu_device *adev,
                     struct amdgpu_bo_param *bp,
                     struct amdgpu_bo **bo_ptr)
{
    /* 根据 bp->domain 选择内存域 */
    /* 优先尝试 VRAM，失败则回退到 GTT */
    /* 最终回退到 System RAM */
}`,
      explanation: "AMDGPU \u4f7f\u7528\u4f4d\u63a9\u7801\u5b9a\u4e49\u5185\u5b58\u57df\u3002\u521b\u5efa BO \u65f6\uff0c\u9a71\u52a8\u6309 VRAM > GTT > System \u987a\u5e8f\u5c1d\u8bd5\u5206\u914d\uff0c\u5931\u8d25\u65f6\u81ea\u52a8\u56de\u9000\u3002\u8fd9\u79cd\u8bbe\u8ba1\u786e\u4fdd\u4e86\u5185\u5b58\u5206\u914d\u7684\u7075\u6d3b\u6027\u548c\u53ef\u9760\u6027\u3002"
    },
    miniLab: {
      title: "\u89c2\u5bdf AMDGPU \u5185\u5b58\u57df\u5206\u914d",
      objective: "\u4f7f\u7528 sysfs \u67e5\u8be2 GPU \u5185\u5b58\u57df\u4f7f\u7528\u60c5\u51b5",
      steps: [
          "\u67e5\u770b VRAM \u4f7f\u7528: cat /sys/class/drm/card0/device/mem_info_vram_used",
          "\u67e5\u770b GTT \u4f7f\u7528: cat /sys/class/drm/card0/device/mem_info_gtt_used",
          "\u67e5\u770b\u603b VRAM: cat /sys/class/drm/card0/device/mem_info_vram_total",
          "\u5b89\u88c5 radeontop: sudo apt install radeontop",
          "\u8fd0\u884c radeontop \u5b9e\u65f6\u76d1\u63a7: sudo radeontop -d -",
          "\u89c2\u5bdf\u8fd0\u884c 3D \u5e94\u7528\u65f6 VRAM \u4f7f\u7528\u91cf\u7684\u53d8\u5316"
        ],
      expectedOutput: "mem_info_vram_used: 512000000 (\u7ea6 512MB)\nmem_info_gtt_used: 128000000 (\u7ea6 128MB)\nmem_info_vram_total: 8589934592 (8GB for RX 7600 XT)"
    },
    debugExercise: {
      title: "\u5185\u5b58\u57df\u5206\u914d\u9519\u8bef",
      language: "c",
      question: "找出并修复以下代码中的问题",
      buggyCode: `/* 问题：这段代码会导致什么问题？ */
struct drm_amdgpu_gem_create args = {
    .bo_size = 1024 * 1024 * 1024,  /* 1GB */
    .alignment = 4096,
    .domains = AMDGPU_GEM_DOMAIN_VRAM,  /* 只允许 VRAM */
    .domain_flags = 0,
};
/* 假设 GPU 只有 512MB VRAM */
ret = ioctl(fd, DRM_IOCTL_AMDGPU_GEM_CREATE, &args);
if (ret == 0) {
    printf("Success!\n");
}`,
      hint: "\u5f53 VRAM \u4e0d\u8db3\u65f6\uff0c\u9a71\u52a8\u4f1a\u600e\u4e48\u5904\u7406\uff1f\u5e94\u8be5\u5982\u4f55\u8bbe\u7f6e domains \u5b57\u6bb5\u5141\u8bb8\u56de\u9000\uff1f",
      solution: "\u5e94\u8be5\u8bbe\u7f6e domains = AMDGPU_GEM_DOMAIN_VRAM | AMDGPU_GEM_DOMAIN_GTT\uff0c\u5141\u8bb8\u9a71\u52a8\u5728 VRAM \u4e0d\u8db3\u65f6\u56de\u9000\u5230 GTT \u5185\u5b58\u57df\uff0c\u907f\u514d\u5206\u914d\u5931\u8d25\u3002"
    },
    interviewQuestion: {
      question: "\u89e3\u91ca AMDGPU \u4e2d VRAM \u548c GTT \u5185\u5b58\u57df\u7684\u533a\u522b\uff0c\u4ee5\u53ca\u9a71\u52a8\u4f55\u65f6\u4f1a\u5728\u4e24\u8005\u4e4b\u95f4\u8fc1\u79fb buffer object\uff1f",
      hint: "\u8003\u8651 GPU \u8bbf\u95ee\u901f\u5ea6\u3001CPU \u8bbf\u95ee\u9700\u6c42\u548c\u5185\u5b58\u538b\u529b\u4e09\u4e2a\u56e0\u7d20",
      answer: "VRAM \u662f GPU \u672c\u5730\u663e\u5b58\uff08GDDR6/HBM\uff09\uff0c\u8bbf\u95ee\u901f\u5ea6\u6700\u5feb\uff0c\u901a\u8fc7 PCIe BAR0 \u6620\u5c04\uff1bGTT \u662f\u901a\u8fc7 GART/IOMMU \u6620\u5c04\u5230 GPU \u5730\u5740\u7a7a\u95f4\u7684\u7cfb\u7edf\u5185\u5b58\uff0cCPU \u548c GPU \u90fd\u53ef\u4ee5\u8bbf\u95ee\u4f46 GPU \u8bbf\u95ee\u8f83\u6162\u3002\u9a71\u52a8\u5728\u4ee5\u4e0b\u60c5\u51b5\u8fc1\u79fb BO\uff1a1) VRAM \u538b\u529b\u5927\u65f6\u5c06\u4e0d\u5e38\u7528\u7684 BO \u8fc1\u79fb\u5230 GTT\uff1b2) CPU \u9700\u8981\u9891\u7e41\u8bbf\u95ee\u65f6\u8fc1\u79fb\u5230 GTT \u6216\u7cfb\u7edf\u5185\u5b58\uff1b3) GPU \u9891\u7e41\u8bbf\u95ee\u65f6\u8fc1\u79fb\u56de VRAM\u3002TTM \u5185\u5b58\u7ba1\u7406\u5668\u8d1f\u8d23\u8fd9\u4e2a\u8fc1\u79fb\u8fc7\u7a0b\u3002"
    },
    completionChecklist: [
          "\u80fd\u8bf4\u51fa VRAM\u3001GTT\u3001System RAM \u4e09\u79cd\u57df\u7684\u533a\u522b",
          "\u77e5\u9053 AMDGPU_GEM_DOMAIN_* \u7684\u503c\u548c\u542b\u4e49",
          "\u7406\u89e3\u4e3a\u4ec0\u4e48\u8981\u8bbe\u7f6e\u591a\u4e2a domain \u5141\u8bb8\u56de\u9000",
          "\u80fd\u7528 sysfs \u67e5\u8be2 GPU \u5185\u5b58\u4f7f\u7528\u60c5\u51b5"
        ]
  },
  {
    id: "2-12-1",
    title: "2.12 Command Ring Buffer",
    duration: "20 min",
    summary: "GPU \u4e0d\u80fd\u76f4\u63a5\u6267\u884c CPU \u53d1\u6765\u7684\u547d\u4ee4\u3002CPU \u5c06\u547d\u4ee4\u5199\u5165\u4e00\u4e2a\u73af\u5f62\u7f13\u51b2\u533a\uff08Ring Buffer\uff09\uff0cGPU \u7684 Command Processor \u4ece\u4e2d\u8bfb\u53d6\u5e76\u6267\u884c\u3002\u8fd9\u662f GPU \u9a71\u52a8\u8c03\u5ea6\u7684\u6838\u5fc3\u673a\u5236\uff0c\u4e5f\u662f AMDGPU scheduler \u7684\u57fa\u7840\u3002",
    keyPoints: [
          "Ring Buffer \u662f\u4e00\u4e2a\u5faa\u73af\u961f\u5217\uff0cCPU \u5199\u5165\uff08write pointer\uff09\uff0cGPU \u8bfb\u53d6\uff08read pointer\uff09",
          "AMDGPU \u6709\u591a\u79cd ring\uff1aGFX ring\uff08\u56fe\u5f62\uff09\u3001SDMA ring\uff08\u5185\u5b58\u62f7\u8d1d\uff09\u3001Compute ring\uff08\u8ba1\u7b97\uff09",
          "Packet\uff1aring \u4e2d\u7684\u547d\u4ee4\u5355\u5143\uff0c\u5305\u542b packet type\u3001opcode \u548c\u53c2\u6570",
          "Fence\uff1a\u63d2\u5165 ring \u7684\u540c\u6b65\u6807\u8bb0\uff0cCPU \u7b49\u5f85 GPU \u5b8c\u6210\u7279\u5b9a\u4f4d\u7f6e\u7684\u547d\u4ee4",
          "Ring \u6ee1\u65f6 CPU \u5fc5\u987b\u7b49\u5f85 GPU \u6d88\u8d39\uff0c\u9632\u6b62\u8986\u76d6\u672a\u6267\u884c\u7684\u547d\u4ee4"
        ],
    diagram: {
      title: "GPU Command Ring Buffer \u5de5\u4f5c\u539f\u7406",
      content: `
  CPU 侧                              GPU 侧
  ┌──────────────┐                   ┌──────────────────┐
  │  User Space  │                   │  Command         │
  │  (Vulkan/GL) │                   │  Processor (CP)  │
  └──────┬───────┘                   └────────┬─────────┘
         │ ioctl                               │ 读取命令
         ▼                                     │
  ┌──────────────┐  写入命令                   │
  │  amdgpu      │──────────────────────────►  │
  │  scheduler   │                             │
  └──────────────┘                             │

  Ring Buffer (环形队列):
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
  │PKT│PKT│PKT│PKT│   │   │   │   │
  └───┴───┴───┴───┴───┴───┴───┴───┘
        ▲               ▲
        │               │
     rptr (GPU 读)   wptr (CPU 写)
     GPU 已执行到此  CPU 写到此处

  Packet 结构:
  ┌──────────────┬──────────┬─────────────────┐
  │  Header      │  Opcode  │  Data/Params    │
  │  (type/size) │          │                 │
  └──────────────┴──────────┴─────────────────┘

  Fence 机制:
  Ring: [CMD1][CMD2][FENCE_VALUE=42][CMD3]
                         │
                         └── GPU 写 42 到 fence buffer
                             CPU 轮询直到读到 42
`,
      caption: "Ring Buffer \u7684 rptr/wptr \u673a\u5236\u548c Fence \u540c\u6b65\u539f\u7406"
    },
    codeWalk: {
      title: "AMDGPU Ring \u6838\u5fc3\u7ed3\u6784\uff08drivers/gpu/drm/amd/amdgpu/amdgpu_ring.h\uff09",
      language: "c",
      code: `/* AMDGPU Ring 核心数据结构 */
struct amdgpu_ring {
    struct amdgpu_device    *adev;
    const struct amdgpu_ring_funcs *funcs;

    /* Ring 缓冲区 */
    struct amdgpu_bo        *ring_obj;  /* Ring 的 BO */
    volatile uint32_t       *ring;      /* Ring 内存指针 */
    unsigned                ring_size;  /* Ring 大小（字节）*/

    /* 读写指针 */
    uint64_t                wptr;       /* CPU 写指针 */
    uint64_t                wptr_old;
    uint32_t                rptr_offs;  /* GPU 读指针偏移 */

    /* Fence 同步 */
    struct amdgpu_fence_driver fence_drv;
    uint64_t                fence_gpu_addr;  /* Fence 的 GPU 地址 */
    volatile uint32_t       *fence_cpu_addr; /* Fence 的 CPU 地址 */
};

/* 向 Ring 写入 DWORD */
static inline void amdgpu_ring_write(struct amdgpu_ring *ring,
                                      uint32_t v)
{
    ring->ring[ring->wptr++ & ring->buf_mask] = v;
}

/* 提交 Ring（更新 GPU 的 wptr 寄存器，触发 GPU 开始执行）*/
void amdgpu_ring_commit(struct amdgpu_ring *ring)
{
    ring->funcs->set_wptr(ring);
}`,
      explanation: "Ring \u7684\u6838\u5fc3\u662f wptr\uff08CPU \u5199\u5165\u4f4d\u7f6e\uff09\u548c rptr\uff08GPU \u8bfb\u53d6\u4f4d\u7f6e\uff09\u3002CPU \u901a\u8fc7 amdgpu_ring_write() \u586b\u5145\u547d\u4ee4\uff0c\u7136\u540e\u8c03\u7528 amdgpu_ring_commit() \u66f4\u65b0 GPU \u7684 wptr \u5bc4\u5b58\u5668\uff0cGPU \u7684 CP \u68c0\u6d4b\u5230 wptr \u53d8\u5316\u540e\u5f00\u59cb\u6267\u884c\u65b0\u547d\u4ee4\u3002"
    },
    miniLab: {
      title: "\u89c2\u5bdf AMDGPU Ring \u72b6\u6001",
      objective: "\u901a\u8fc7 debugfs \u67e5\u770b GPU ring \u7684\u5b9e\u65f6\u72b6\u6001",
      steps: [
          "\u786e\u8ba4 debugfs \u5df2\u6302\u8f7d: mount | grep debugfs",
          "\u67e5\u770b\u6240\u6709 ring: sudo ls /sys/kernel/debug/dri/0/ | grep ring",
          "\u67e5\u770b GFX ring \u72b6\u6001: sudo cat /sys/kernel/debug/dri/0/amdgpu_ring_gfx_0.0.0",
          "\u67e5\u770b SDMA ring: sudo cat /sys/kernel/debug/dri/0/amdgpu_ring_sdma0.0.0",
          "\u8fd0\u884c glxgears \u540e\u518d\u6b21\u67e5\u770b ring \u72b6\u6001\uff0c\u89c2\u5bdf wptr \u53d8\u5316",
          "\u67e5\u770b fence \u72b6\u6001: sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info"
        ],
      expectedOutput: "GFX ring \u72b6\u6001\u8f93\u51fa\u793a\u4f8b:\nRing GFX_0.0.0:\n  use_doorbell = 1\n  wptr = 0x1234\n  rptr = 0x1234 (ring idle)\n  driver_hung = 0"
    },
    debugExercise: {
      title: "Ring Buffer \u6ea2\u51fa\u95ee\u9898",
      language: "c",
      question: "找出并修复以下代码中的问题",
      buggyCode: `/* 问题：这段代码有什么潜在风险？ */
void submit_commands(struct amdgpu_ring *ring, int count)
{
    int i;
    for (i = 0; i < count; i++) {
        /* 直接写入，没有检查 ring 空间 */
        amdgpu_ring_write(ring, PACKET3(PACKET3_NOP, 0));
    }
    amdgpu_ring_commit(ring);
}`,
      hint: "Ring \u662f\u6709\u9650\u5927\u5c0f\u7684\u5faa\u73af\u961f\u5217\u3002\u5982\u679c CPU \u5199\u5165\u901f\u5ea6\u8d85\u8fc7 GPU \u6d88\u8d39\u901f\u5ea6\uff0c\u4f1a\u53d1\u751f\u4ec0\u4e48\uff1f\u5e94\u8be5\u5728\u5199\u5165\u524d\u8c03\u7528\u4ec0\u4e48\u51fd\u6570\uff1f",
      solution: "\u5e94\u8be5\u5728\u5199\u5165\u524d\u8c03\u7528 amdgpu_ring_alloc(ring, count) \u9884\u7559\u7a7a\u95f4\uff0c\u8be5\u51fd\u6570\u4f1a\u7b49\u5f85 GPU \u6d88\u8d39\u8db3\u591f\u7684\u7a7a\u95f4\u3002\u76f4\u63a5\u5199\u5165\u53ef\u80fd\u8986\u76d6 GPU \u5c1a\u672a\u6267\u884c\u7684\u547d\u4ee4\uff0c\u5bfc\u81f4 GPU hang \u6216\u6e32\u67d3\u9519\u8bef\u3002"
    },
    interviewQuestion: {
      question: "\u89e3\u91ca GPU Command Ring Buffer \u7684\u5de5\u4f5c\u539f\u7406\uff0c\u4ee5\u53ca Fence \u662f\u5982\u4f55\u5b9e\u73b0 CPU-GPU \u540c\u6b65\u7684\uff1f",
      hint: "\u4ece rptr\u3001wptr \u7684\u89d2\u8272\uff0c\u4ee5\u53ca fence \u503c\u7684\u5199\u5165\u548c\u8f6e\u8be2\u673a\u5236\u6765\u89e3\u91ca",
      answer: "Ring Buffer \u662f\u4e00\u4e2a\u5faa\u73af\u961f\u5217\uff0cCPU \u901a\u8fc7 wptr \u5199\u5165\u547d\u4ee4\uff0cGPU \u7684 CP \u901a\u8fc7 rptr \u8bfb\u53d6\u5e76\u6267\u884c\u3002CPU \u66f4\u65b0 wptr \u5bc4\u5b58\u5668\u901a\u77e5 GPU \u6709\u65b0\u547d\u4ee4\u3002Fence \u662f\u63d2\u5165 ring \u7684\u7279\u6b8a\u547d\u4ee4\uff0cGPU \u6267\u884c\u5230 fence \u65f6\u5c06\u4e00\u4e2a\u9012\u589e\u7684\u503c\u5199\u5165\u5185\u5b58\u4e2d\u7684 fence buffer\u3002CPU \u901a\u8fc7\u8f6e\u8be2\uff08\u6216\u4e2d\u65ad\uff09\u7b49\u5f85 fence buffer \u8fbe\u5230\u9884\u671f\u503c\uff0c\u4ece\u800c\u77e5\u9053 GPU \u5df2\u5b8c\u6210 fence \u4e4b\u524d\u7684\u6240\u6709\u547d\u4ee4\u3002"
    },
    completionChecklist: [
          "\u80fd\u89e3\u91ca wptr \u548c rptr \u7684\u4f5c\u7528",
          "\u77e5\u9053 AMDGPU \u6709\u54ea\u51e0\u79cd ring \u7c7b\u578b",
          "\u7406\u89e3 Fence \u5982\u4f55\u5b9e\u73b0 CPU-GPU \u540c\u6b65",
          "\u77e5\u9053 ring \u6ee1\u65f6 CPU \u5e94\u8be5\u5982\u4f55\u5904\u7406"
        ]
  },
  {
    id: "2-13-1",
    title: "2.13 VRAM vs GTT \u6df1\u5ea6\u5bf9\u6bd4",
    duration: "15 min",
    summary: "\u5728 AMDGPU \u9a71\u52a8\u4e2d\uff0c\u9009\u62e9\u6b63\u786e\u7684\u5185\u5b58\u57df\u5bf9\u6027\u80fd\u81f3\u5173\u91cd\u8981\u3002VRAM \u9002\u5408 GPU \u9891\u7e41\u8bbf\u95ee\u7684\u8d44\u6e90\uff08\u7eb9\u7406\u3001\u5e27\u7f13\u51b2\uff09\uff0cGTT \u9002\u5408 CPU-GPU \u5171\u4eab\u6570\u636e\uff08uniform buffer\u3001staging buffer\uff09\u3002\u672c\u8282\u6df1\u5165\u5206\u6790\u4e24\u8005\u7684\u6027\u80fd\u7279\u5f81\u548c\u4f7f\u7528\u573a\u666f\u3002",
    keyPoints: [
          "VRAM \u5e26\u5bbd\uff1aGDDR6 \u7ea6 288 GB/s\uff08RX 7600 XT\uff09\uff0cHBM2e \u7ea6 1.2 TB/s\uff08MI300X\uff09",
          "GTT \u5e26\u5bbd\uff1a\u53d7 PCIe \u5e26\u5bbd\u9650\u5236\uff0cPCIe 4.0 x16 \u7ea6 32 GB/s\uff08\u53cc\u5411\uff09",
          "VRAM \u9002\u5408\uff1a\u7eb9\u7406\u3001\u6e32\u67d3\u76ee\u6807\u3001\u6df1\u5ea6\u7f13\u51b2\u3001\u9891\u7e41\u8bfb\u5199\u7684 shader buffer",
          "GTT \u9002\u5408\uff1auniform buffer\uff08CPU \u66f4\u65b0\u9891\u7e41\uff09\u3001staging buffer\uff08CPU\u2192GPU \u6570\u636e\u4f20\u8f93\uff09",
          "Resizable BAR (ReBAR)\uff1a\u5141\u8bb8 CPU \u76f4\u63a5\u8bbf\u95ee\u5168\u90e8 VRAM\uff0c\u6d88\u9664 GTT \u4e2d\u8f6c"
        ],
    diagram: {
      title: "VRAM vs GTT \u6027\u80fd\u5bf9\u6bd4",
      content: `
  性能对比（RX 7600 XT 为例）:

  VRAM (GDDR6):
  ┌─────────────────────────────────────────────────┐
  │  GPU Read/Write Bandwidth: ~288 GB/s            │
  │  GPU Latency: ~100 ns                           │
  │  CPU Access: 通过 PCIe BAR (慢, ~32 GB/s)      │
  │  Use Case: 纹理, 帧缓冲, 频繁 GPU 访问          │
  └─────────────────────────────────────────────────┘

  GTT (System RAM via GART):
  ┌─────────────────────────────────────────────────┐
  │  GPU Read/Write Bandwidth: ~32 GB/s (PCIe限制)  │
  │  CPU Access: ~50 GB/s (DDR5 带宽)               │
  │  GPU Latency: ~1000 ns (PCIe 延迟)              │
  │  Use Case: Uniform Buffer, Staging, 共享数据    │
  └─────────────────────────────────────────────────┘

  Resizable BAR (ReBAR):
  ┌─────────────────────────────────────────────────┐
  │  CPU 可直接访问全部 VRAM (不再需要 GTT 中转)    │
  │  减少 CPU→GPU 数据传输的 staging buffer 需求    │
  │  需要 UEFI + PCIe 4.0 支持                      │
  └─────────────────────────────────────────────────┘

  数据流对比:
  无 ReBAR: CPU → System RAM → DMA → VRAM (两次拷贝)
  有 ReBAR: CPU → VRAM (直接写入, 一次拷贝)
`,
      caption: "VRAM \u548c GTT \u7684\u5e26\u5bbd\u3001\u5ef6\u8fdf\u548c\u4f7f\u7528\u573a\u666f\u5bf9\u6bd4"
    },
    codeWalk: {
      title: "AMDGPU BO \u57df\u9009\u62e9\u903b\u8f91\uff08drivers/gpu/drm/amd/amdgpu/amdgpu_object.c\uff09",
      language: "c",
      code: `/* AMDGPU BO 创建时的域选择 */
int amdgpu_bo_create(struct amdgpu_device *adev,
                     struct amdgpu_bo_param *bp,
                     struct amdgpu_bo **bo_ptr)
{
    /* 根据 domain 设置 TTM placement */
    amdgpu_bo_placement_from_domain(bo, bp->domain);

    /* TTM 尝试按 placement 顺序分配 */
    /* 1. 首先尝试 VRAM */
    /* 2. VRAM 失败则尝试 GTT */
    /* 3. GTT 失败则尝试 System */
    r = ttm_bo_init_reserved(&adev->mman.bdev, &bo->tbo,
                              bp->type, &bo->placement,
                              page_align, &ctx, NULL,
                              NULL, &amdgpu_bo_destroy);
    return r;
}

/* 设置 BO 的 TTM placement */
void amdgpu_bo_placement_from_domain(struct amdgpu_bo *abo,
                                      u32 domain)
{
    struct ttm_placement *placement = &abo->placement;

    if (domain & AMDGPU_GEM_DOMAIN_VRAM) {
        places[c].mem_type = TTM_PL_VRAM;
        places[c].flags = 0;
        c++;
    }
    if (domain & AMDGPU_GEM_DOMAIN_GTT) {
        places[c].mem_type = TTM_PL_TT;
        places[c].flags = 0;
        c++;
    }
    placement->num_placement = c;
    placement->placement = places;
}`,
      explanation: "amdgpu_bo_placement_from_domain() \u5c06\u7528\u6237\u6307\u5b9a\u7684 AMDGPU \u57df\u6807\u5fd7\u8f6c\u6362\u4e3a TTM placement \u7ed3\u6784\u3002TTM \u6309\u7167 placement \u6570\u7ec4\u7684\u987a\u5e8f\u5c1d\u8bd5\u5206\u914d\uff0c\u5b9e\u73b0\u4e86 VRAM \u4f18\u5148\u3001GTT \u56de\u9000\u7684\u7b56\u7565\u3002"
    },
    miniLab: {
      title: "\u6d4b\u91cf VRAM vs GTT \u5e26\u5bbd\u5dee\u5f02",
      objective: "\u4f7f\u7528\u5de5\u5177\u6d4b\u91cf VRAM \u548c GTT \u7684\u5b9e\u9645\u5e26\u5bbd",
      steps: [
          "\u5b89\u88c5 vulkan-tools: sudo apt install vulkan-tools",
          "\u67e5\u770b GPU \u5185\u5b58\u4fe1\u606f: vulkaninfo 2>/dev/null | grep -A5 heapIndex",
          "\u5b89\u88c5 clinfo: sudo apt install clinfo",
          "\u67e5\u770b OpenCL \u5185\u5b58\u4fe1\u606f: clinfo | grep -i \"global mem\\|local mem\"",
          "\u8fd0\u884c glmark2 \u57fa\u51c6\u6d4b\u8bd5: sudo apt install glmark2 && glmark2",
          "\u5bf9\u6bd4 VRAM \u548c GTT \u7684\u5e26\u5bbd\u6570\u636e\uff08VRAM \u5e94\u7ea6\u4e3a GTT \u7684 8-10 \u500d\uff09"
        ],
      expectedOutput: "Vulkan heap \u4fe1\u606f\u793a\u4f8b:\nheap[0]: size=8192 MiB, flags=DEVICE_LOCAL (VRAM)\nheap[1]: size=16384 MiB, flags=0 (System/GTT)\nVRAM bandwidth: ~288 GB/s\nGTT bandwidth: ~30-40 GB/s via PCIe"
    },
    debugExercise: {
      title: "\u9519\u8bef\u7684\u5185\u5b58\u57df\u9009\u62e9\u5bfc\u81f4\u6027\u80fd\u95ee\u9898",
      language: "c",
      question: "找出并修复以下代码中的问题",
      buggyCode: `/* 问题：这个纹理分配策略有什么性能问题？ */
struct drm_amdgpu_gem_create args = {
    .bo_size = 4096 * 4096 * 4,  /* 4K 纹理, 64MB */
    .alignment = 4096,
    /* 只允许 GTT，不允许 VRAM */
    .domains = AMDGPU_GEM_DOMAIN_GTT,
    .domain_flags = 0,
};
/* 这个纹理会被 shader 每帧采样数百万次 */`,
      hint: "\u9891\u7e41\u88ab GPU shader \u8bbf\u95ee\u7684\u7eb9\u7406\u5e94\u8be5\u653e\u5728\u54ea\u4e2a\u5185\u5b58\u57df\uff1fGTT \u7684 PCIe \u5e26\u5bbd\u9650\u5236\u4f1a\u9020\u6210\u4ec0\u4e48\u5f71\u54cd\uff1f",
      solution: "\u5e94\u8be5\u8bbe\u7f6e domains = AMDGPU_GEM_DOMAIN_VRAM | AMDGPU_GEM_DOMAIN_GTT\u3002\u9891\u7e41\u88ab GPU \u8bbf\u95ee\u7684\u7eb9\u7406\u5e94\u4f18\u5148\u653e\u5728 VRAM\uff08288 GB/s\uff09\uff0c\u800c\u4e0d\u662f GTT\uff0832 GB/s PCIe \u9650\u5236\uff09\u3002\u9519\u8bef\u7684\u57df\u9009\u62e9\u4f1a\u5bfc\u81f4 GPU \u6bcf\u6b21\u91c7\u6837\u7eb9\u7406\u90fd\u8981\u901a\u8fc7 PCIe \u4f20\u8f93\uff0c\u9020\u6210\u4e25\u91cd\u7684\u6027\u80fd\u74f6\u9888\u3002"
    },
    interviewQuestion: {
      question: "\u5728 AMDGPU \u9a71\u52a8\u4e2d\uff0c\u4ec0\u4e48\u60c5\u51b5\u4e0b\u5e94\u8be5\u4f7f\u7528 GTT \u5185\u5b58\u57df\u800c\u4e0d\u662f VRAM\uff1fResizable BAR \u5982\u4f55\u6539\u53d8\u4e86\u8fd9\u4e2a\u51b3\u7b56\uff1f",
      hint: "\u8003\u8651 CPU \u5199\u5165\u9891\u7387\u3001GPU \u8bbf\u95ee\u9891\u7387\u548c PCIe \u5e26\u5bbd\u4e09\u4e2a\u56e0\u7d20",
      answer: "GTT \u9002\u5408 CPU \u9891\u7e41\u66f4\u65b0\u7684\u6570\u636e\uff08\u5982 uniform buffer\u3001per-frame constants\uff09\uff0c\u56e0\u4e3a CPU \u8bbf\u95ee GTT \u4f7f\u7528 DDR \u5e26\u5bbd\uff08~50 GB/s\uff09\uff0c\u6bd4\u901a\u8fc7 PCIe \u8bbf\u95ee VRAM \u5feb\u3002VRAM \u9002\u5408 GPU \u9891\u7e41\u8bfb\u5199\u4f46 CPU \u5f88\u5c11\u8bbf\u95ee\u7684\u6570\u636e\uff08\u7eb9\u7406\u3001\u6e32\u67d3\u76ee\u6807\uff09\u3002Resizable BAR \u5141\u8bb8 CPU \u4ee5\u5b8c\u6574 PCIe \u5e26\u5bbd\u76f4\u63a5\u5199\u5165 VRAM\uff0c\u6d88\u9664\u4e86 staging buffer \u7684\u9700\u6c42\uff0c\u4f7f\u5f97\u5f88\u591a\u539f\u672c\u9700\u8981\u653e\u5728 GTT \u7684\u6570\u636e\u53ef\u4ee5\u76f4\u63a5\u653e\u5728 VRAM\uff0c\u51cf\u5c11\u4e86\u4e00\u6b21 CPU\u2192GPU \u7684\u6570\u636e\u62f7\u8d1d\u3002"
    },
    completionChecklist: [
          "\u77e5\u9053 VRAM \u548c GTT \u7684\u5178\u578b\u5e26\u5bbd\u6570\u503c",
          "\u80fd\u5224\u65ad\u54ea\u79cd\u8d44\u6e90\u5e94\u8be5\u653e\u5728 VRAM\uff0c\u54ea\u79cd\u653e\u5728 GTT",
          "\u7406\u89e3 Resizable BAR \u7684\u5de5\u4f5c\u539f\u7406\u548c\u6027\u80fd\u5f71\u54cd",
          "\u80fd\u7528\u5de5\u5177\u67e5\u770b GPU \u5185\u5b58\u5806\u4fe1\u606f"
        ]
  },
  {
    id: "2-14-1",
    title: "2.14 GPU \u56fa\u4ef6\u52a0\u8f7d (Firmware Loading)",
    duration: "18 min",
    summary: "\u73b0\u4ee3 GPU \u5305\u542b\u591a\u4e2a\u5fae\u5904\u7406\u5668\uff08CP\u3001SDMA\u3001SMU\u3001PSP \u7b49\uff09\uff0c\u6bcf\u4e2a\u90fd\u9700\u8981\u52a0\u8f7d\u56fa\u4ef6\uff08microcode\uff09\u624d\u80fd\u5de5\u4f5c\u3002AMDGPU \u9a71\u52a8\u5728\u521d\u59cb\u5316\u65f6\u4ece /lib/firmware/amdgpu/ \u52a0\u8f7d\u8fd9\u4e9b\u56fa\u4ef6\u6587\u4ef6\uff0c\u8fd9\u662f GPU \u521d\u59cb\u5316\u5931\u8d25\u7684\u5e38\u89c1\u539f\u56e0\u4e4b\u4e00\u3002",
    keyPoints: [
          "GPU \u56fa\u4ef6\uff1aCP microcode\u3001SDMA firmware\u3001SMU firmware\u3001PSP firmware\u3001VCN firmware",
          "\u56fa\u4ef6\u6587\u4ef6\u4f4d\u7f6e\uff1a/lib/firmware/amdgpu/\uff0c\u547d\u540d\u683c\u5f0f {chip}_{ip}_{version}.bin",
          "\u52a0\u8f7d\u6d41\u7a0b\uff1arequest_firmware() \u2192 \u9a8c\u8bc1\u5934\u90e8 \u2192 \u5199\u5165 GPU \u5bc4\u5b58\u5668",
          "PSP\uff08Platform Security Processor\uff09\uff1a\u8d1f\u8d23\u9a8c\u8bc1\u548c\u52a0\u8f7d\u5176\u4ed6\u56fa\u4ef6\uff0c\u662f\u5b89\u5168\u542f\u52a8\u7684\u6838\u5fc3",
          "\u56fa\u4ef6\u7248\u672c\u4e0d\u5339\u914d\u662f GPU \u521d\u59cb\u5316\u5931\u8d25\u7684\u5e38\u89c1\u539f\u56e0\uff0cdmesg \u4f1a\u663e\u793a\u5177\u4f53\u9519\u8bef"
        ],
    diagram: {
      title: "AMDGPU \u56fa\u4ef6\u52a0\u8f7d\u6d41\u7a0b",
      content: `
  系统启动时的固件加载顺序:

  amdgpu_device_init()
        │
        ▼
  amdgpu_firmware_load_multiple_fw()
        │
        ├──► PSP Firmware (最先加载，负责安全验证)
        │    /lib/firmware/amdgpu/navi33_psp.bin
        │
        ├──► SMU Firmware (电源管理)
        │    /lib/firmware/amdgpu/navi33_smu.bin
        │
        ├──► GFX CP Firmware (图形命令处理器)
        │    /lib/firmware/amdgpu/navi33_pfp.bin  (Pre-Fetch Parser)
        │    /lib/firmware/amdgpu/navi33_me.bin   (Micro Engine)
        │    /lib/firmware/amdgpu/navi33_mec.bin  (MEC for compute)
        │
        ├──► SDMA Firmware (DMA 引擎)
        │    /lib/firmware/amdgpu/navi33_sdma.bin
        │
        └──► VCN Firmware (视频编解码)
             /lib/firmware/amdgpu/navi33_vcn.bin

  固件文件格式:
  ┌──────────────────────────────────────────────────┐
  │  struct common_firmware_header                   │
  │  ├── size_bytes (文件大小)                       │
  │  ├── header_size_bytes (头部大小)                │
  │  ├── ip_version_major (IP 主版本)                │
  │  ├── ip_version_minor (IP 次版本)                │
  │  └── ucode_version (微码版本)                   │
  │  [固件数据...]                                   │
  └──────────────────────────────────────────────────┘
`,
      caption: "AMDGPU \u56fa\u4ef6\u52a0\u8f7d\u987a\u5e8f\u548c\u56fa\u4ef6\u6587\u4ef6\u683c\u5f0f"
    },
    codeWalk: {
      title: "AMDGPU \u56fa\u4ef6\u52a0\u8f7d\u6838\u5fc3\u4ee3\u7801\uff08drivers/gpu/drm/amd/amdgpu/amdgpu_gfx.c\uff09",
      language: "c",
      code: `/* GFX CP 固件加载示例 */
int amdgpu_gfx_cp_fw_load(struct amdgpu_device *adev,
                           const char *fw_name,
                           const struct firmware **fw)
{
    int err;
    const struct gfx_firmware_header_v1_0 *cp_hdr;

    /* 1. 请求固件文件（从 /lib/firmware/ 加载）*/
    err = request_firmware(fw, fw_name, adev->dev);
    if (err) {
        dev_err(adev->dev, "Failed to load firmware %s\n", fw_name);
        return err;
    }

    /* 2. 验证固件头部 */
    err = amdgpu_ucode_validate(*fw);
    if (err) {
        dev_err(adev->dev, "Invalid firmware %s\n", fw_name);
        release_firmware(*fw);
        return err;
    }

    /* 3. 获取固件版本信息 */
    cp_hdr = (const struct gfx_firmware_header_v1_0 *)(*fw)->data;
    adev->gfx.pfp_fw_version =
        le32_to_cpu(cp_hdr->header.ucode_version);

    return 0;
}

/* 固件路径构建示例（navi33 = RX 7600 XT 的 GPU 代号）*/
snprintf(fw_name, sizeof(fw_name),
         "amdgpu/%s_pfp.bin", adev->asic_name);
/* 结果: "amdgpu/navi33_pfp.bin" */`,
      explanation: "request_firmware() \u662f Linux \u5185\u6838\u7684\u6807\u51c6\u56fa\u4ef6\u52a0\u8f7d API\uff0c\u5b83\u4ece /lib/firmware/ \u76ee\u5f55\u52a0\u8f7d\u4e8c\u8fdb\u5236\u6587\u4ef6\u3002AMDGPU \u5728\u52a0\u8f7d\u540e\u9a8c\u8bc1\u56fa\u4ef6\u5934\u90e8\u7684\u9b54\u6570\u548c\u7248\u672c\uff0c\u786e\u4fdd\u56fa\u4ef6\u4e0e\u5f53\u524d GPU \u786c\u4ef6\u7248\u672c\u5339\u914d\u3002"
    },
    miniLab: {
      title: "\u68c0\u67e5 RX 7600 XT \u7684\u56fa\u4ef6\u6587\u4ef6",
      objective: "\u67e5\u770b\u7cfb\u7edf\u4e2d\u5df2\u5b89\u88c5\u7684 AMDGPU \u56fa\u4ef6\u6587\u4ef6\uff0c\u7406\u89e3\u56fa\u4ef6\u547d\u540d\u89c4\u5219",
      steps: [
          "\u5217\u51fa navi33 (RX 7600 XT) \u7684\u6240\u6709\u56fa\u4ef6: ls /lib/firmware/amdgpu/navi33*",
          "\u67e5\u770b\u56fa\u4ef6\u6587\u4ef6\u5927\u5c0f: ls -lh /lib/firmware/amdgpu/navi33*",
          "\u7528 dmesg \u67e5\u770b\u56fa\u4ef6\u52a0\u8f7d\u65e5\u5fd7: dmesg | grep -i \"amdgpu.*firmware\"",
          "\u67e5\u770b\u56fa\u4ef6\u5305\u7248\u672c: dpkg -l firmware-amd-graphics 2>/dev/null || rpm -q linux-firmware",
          "\u67e5\u770b PSP \u56fa\u4ef6\u5934\u90e8: xxd /lib/firmware/amdgpu/navi33_psp.bin | head -4",
          "\u5bf9\u6bd4\u4e0d\u540c IP \u56fa\u4ef6\u7684\u6587\u4ef6\u5927\u5c0f\uff0c\u7406\u89e3\u5404 IP \u7684\u590d\u6742\u5ea6"
        ],
      expectedOutput: "navi33 \u56fa\u4ef6\u6587\u4ef6\u5217\u8868\u793a\u4f8b:\n/lib/firmware/amdgpu/navi33_me.bin\n/lib/firmware/amdgpu/navi33_mec.bin\n/lib/firmware/amdgpu/navi33_pfp.bin\n/lib/firmware/amdgpu/navi33_psp.bin\n/lib/firmware/amdgpu/navi33_sdma.bin\n/lib/firmware/amdgpu/navi33_smc.bin\n/lib/firmware/amdgpu/navi33_vcn.bin"
    },
    debugExercise: {
      title: "\u56fa\u4ef6\u52a0\u8f7d\u5931\u8d25\u7684\u8bca\u65ad",
      language: "bash",
      question: "找出并修复以下代码中的问题",
      buggyCode: `# 系统 dmesg 显示以下错误，如何诊断？
[    5.234567] amdgpu 0000:03:00.0: amdgpu: Failed to load firmware "amdgpu/navi33_pfp.bin"
[    5.234568] amdgpu 0000:03:00.0: amdgpu: Fatal error during GPU init
[    5.234569] amdgpu: probe of 0000:03:00.0 failed with error -2

# 错误码 -2 是 ENOENT (文件不存在)
# 如何修复这个问题？`,
      hint: "\u9519\u8bef\u7801 -2 \u662f ENOENT\uff0c\u610f\u5473\u7740\u56fa\u4ef6\u6587\u4ef6\u4e0d\u5b58\u5728\u3002\u68c0\u67e5 /lib/firmware/amdgpu/ \u76ee\u5f55\uff0c\u8003\u8651\u56fa\u4ef6\u5305\u662f\u5426\u5df2\u5b89\u88c5\uff0c\u4ee5\u53ca\u5185\u6838\u7248\u672c\u662f\u5426\u4e0e\u56fa\u4ef6\u7248\u672c\u5339\u914d\u3002",
      solution: "\u89e3\u51b3\u6b65\u9aa4\uff1a1) \u68c0\u67e5\u56fa\u4ef6\u5305: ls /lib/firmware/amdgpu/navi33*\uff1b2) \u5982\u679c\u7f3a\u5931\uff0c\u5b89\u88c5\u56fa\u4ef6\u5305: sudo apt install firmware-amd-graphics \u6216 sudo dnf install linux-firmware\uff1b3) \u5982\u679c\u5185\u6838\u592a\u65b0\u800c\u56fa\u4ef6\u5305\u592a\u65e7\uff0c\u4ece linux-firmware git \u4ed3\u5e93\u83b7\u53d6\u6700\u65b0\u56fa\u4ef6\uff1b4) \u66f4\u65b0\u540e\u91cd\u65b0\u52a0\u8f7d\u6a21\u5757: sudo modprobe -r amdgpu && sudo modprobe amdgpu\u3002"
    },
    interviewQuestion: {
      question: "AMDGPU \u9a71\u52a8\u521d\u59cb\u5316\u65f6\u9700\u8981\u52a0\u8f7d\u54ea\u4e9b\u56fa\u4ef6\uff1f\u5982\u679c\u56fa\u4ef6\u52a0\u8f7d\u5931\u8d25\uff0c\u5982\u4f55\u8bca\u65ad\u548c\u89e3\u51b3\uff1f",
      hint: "\u5217\u4e3e\u4e3b\u8981\u56fa\u4ef6\u7c7b\u578b\uff0c\u4ee5\u53ca dmesg \u4e2d\u7684\u9519\u8bef\u4fe1\u606f\u5982\u4f55\u5e2e\u52a9\u8bca\u65ad",
      answer: "AMDGPU \u9700\u8981\u52a0\u8f7d\uff1aPSP\uff08\u5b89\u5168\u5904\u7406\u5668\uff0c\u6700\u5148\u52a0\u8f7d\uff09\u3001SMU\uff08\u7535\u6e90\u7ba1\u7406\uff09\u3001GFX CP\uff08PFP/ME/MEC\uff0c\u56fe\u5f62\u547d\u4ee4\u5904\u7406\uff09\u3001SDMA\uff08\u5185\u5b58\u62f7\u8d1d\uff09\u3001VCN\uff08\u89c6\u9891\u7f16\u89e3\u7801\uff09\u7b49\u56fa\u4ef6\u3002\u8bca\u65ad\u6b65\u9aa4\uff1a1) dmesg | grep amdgpu \u67e5\u770b\u5177\u4f53\u9519\u8bef\uff1b2) \u9519\u8bef -2(ENOENT) \u8868\u793a\u56fa\u4ef6\u6587\u4ef6\u4e0d\u5b58\u5728\uff0c\u9700\u8981\u5b89\u88c5/\u66f4\u65b0 linux-firmware \u5305\uff1b3) \u9519\u8bef -22(EINVAL) \u8868\u793a\u56fa\u4ef6\u7248\u672c\u4e0d\u5339\u914d\uff0c\u9700\u8981\u66f4\u65b0\u5185\u6838\u6216\u56fa\u4ef6\uff1b4) \u68c0\u67e5 /lib/firmware/amdgpu/ \u76ee\u5f55\u786e\u8ba4\u56fa\u4ef6\u6587\u4ef6\u5b58\u5728\u4e14\u7248\u672c\u6b63\u786e\u3002"
    },
    completionChecklist: [
          "\u77e5\u9053 AMDGPU \u9700\u8981\u52a0\u8f7d\u54ea\u4e9b\u4e3b\u8981\u56fa\u4ef6",
          "\u7406\u89e3\u56fa\u4ef6\u6587\u4ef6\u7684\u547d\u540d\u89c4\u5219\uff08chip_ip_version.bin\uff09",
          "\u80fd\u7528 dmesg \u8bca\u65ad\u56fa\u4ef6\u52a0\u8f7d\u5931\u8d25",
          "\u77e5\u9053\u5982\u4f55\u66f4\u65b0 AMDGPU \u56fa\u4ef6"
        ]
  },
  {
    id: "2-15-1",
    title: "2.15 GPU \u8bbe\u5907\u91cd\u7f6e (Device Reset)",
    duration: "20 min",
    summary: "GPU hang\uff08\u6302\u8d77\uff09\u662f\u9a71\u52a8\u5f00\u53d1\u4e2d\u6700\u68d8\u624b\u7684\u95ee\u9898\u4e4b\u4e00\u3002\u5f53 GPU \u505c\u6b62\u54cd\u5e94\u65f6\uff0c\u9a71\u52a8\u5fc5\u987b\u6267\u884c\u8bbe\u5907\u91cd\u7f6e\u6765\u6062\u590d\u7cfb\u7edf\u3002AMDGPU \u5b9e\u73b0\u4e86\u591a\u7ea7\u91cd\u7f6e\u7b56\u7565\uff0c\u4ece\u8f6f\u91cd\u7f6e\u5230\u5b8c\u6574\u7684 FLR\uff08Function Level Reset\uff09\uff0c\u8fd9\u662f AMD \u9762\u8bd5\u4e2d\u6700\u5e38\u88ab\u95ee\u5230\u7684\u8bdd\u9898\u4e4b\u4e00\u3002",
    keyPoints: [
          "GPU Hang\uff1aGPU \u505c\u6b62\u5904\u7406\u547d\u4ee4\uff0cfence \u8d85\u65f6\uff0c\u7cfb\u7edf\u53ef\u80fd\u51bb\u7ed3",
          "Soft Reset\uff1a\u4ec5\u91cd\u7f6e GPU \u7684\u7279\u5b9a IP \u6a21\u5757\uff0c\u4e0d\u5f71\u54cd PCIe \u8fde\u63a5",
          "Hard Reset\uff1a\u5b8c\u6574\u91cd\u7f6e GPU\uff0c\u91cd\u65b0\u52a0\u8f7d\u56fa\u4ef6\uff0c\u6062\u590d\u6240\u6709\u72b6\u6001",
          "FLR (Function Level Reset)\uff1a\u901a\u8fc7 PCIe \u7684 FLR \u673a\u5236\u91cd\u7f6e\u6574\u4e2a GPU \u529f\u80fd",
          "GPU Reset \u540e\u6240\u6709 context \u5931\u6548\uff0cVulkan \u6536\u5230 VK_ERROR_DEVICE_LOST"
        ],
    diagram: {
      title: "AMDGPU \u8bbe\u5907\u91cd\u7f6e\u6d41\u7a0b",
      content: `
  GPU Hang 检测与重置流程:

  GPU 超时检测 (amdgpu_job_timedout)
        │
        ▼
  ┌─────────────────────────────────────────────────┐
  │  1. 尝试 Soft Reset                             │
  │     ├── 停止所有 ring                           │
  │     ├── 重置各 IP 模块 (GFX/SDMA/VCN)          │
  │     └── 重新初始化 ring                         │
  └──────────────────┬──────────────────────────────┘
                     │ 失败
                     ▼
  ┌─────────────────────────────────────────────────┐
  │  2. 尝试 Hard Reset                             │
  │     ├── 重置整个 GPU ASIC                       │
  │     ├── 重新加载所有固件                        │
  │     └── 重新初始化所有 IP                       │
  └──────────────────┬──────────────────────────────┘
                     │ 失败
                     ▼
  ┌─────────────────────────────────────────────────┐
  │  3. PCIe FLR (Function Level Reset)             │
  │     ├── 通过 PCIe 配置空间触发 FLR              │
  │     └── 完整重置 PCIe 功能                      │
  └──────────────────┬──────────────────────────────┘
                     │ 仍然失败
                     ▼
              系统崩溃 / 需要重启

  重置后的恢复:
  ┌─────────────────────────────────────────────────┐
  │  通知所有 context: -ENODEV                      │
  │  Vulkan: VK_ERROR_DEVICE_LOST                   │
  │  OpenGL: GL_CONTEXT_LOST                        │
  │  应用程序需要重新创建 context 和资源            │
  └─────────────────────────────────────────────────┘
`,
      caption: "AMDGPU \u591a\u7ea7\u91cd\u7f6e\u7b56\u7565\u548c\u5e94\u7528\u7a0b\u5e8f\u6062\u590d\u6d41\u7a0b"
    },
    codeWalk: {
      title: "AMDGPU GPU Reset \u6838\u5fc3\u4ee3\u7801\uff08drivers/gpu/drm/amd/amdgpu/amdgpu_device.c\uff09",
      language: "c",
      code: `/* GPU Hang 超时处理 */
static enum drm_gpu_sched_stat
amdgpu_job_timedout(struct drm_sched_job *s_job)
{
    struct amdgpu_job *job = to_amdgpu_job(s_job);
    struct amdgpu_device *adev = job->adev;

    dev_err(adev->dev, "GPU job timed out, attempting reset\n");

    /* 触发 GPU 重置 */
    amdgpu_device_gpu_recover(adev, job, &reset_context);
    return DRM_GPU_SCHED_STAT_RESET;
}

/* GPU 重置主函数 */
int amdgpu_device_gpu_recover(struct amdgpu_device *adev,
                               struct amdgpu_job *job,
                               struct amdgpu_reset_context *reset_context)
{
    int r;

    /* 1. 通知所有 context GPU 正在重置 */
    amdgpu_device_set_mp1_state(adev);

    /* 2. 停止所有调度器 */
    amdgpu_amdkfd_pre_reset(adev);

    /* 3. 执行实际重置 */
    r = amdgpu_do_asic_reset(adev, reset_context);

    /* 4. 重置后恢复 */
    amdgpu_reset_capture_coredumpm(adev);

    /* 5. 通知应用程序重置完成 */
    drm_sched_start(&ring->sched, true);

    return r;
}

/* 检查 GPU 是否挂起（读取寄存器返回 0xffffffff 表示无响应）*/
bool amdgpu_device_is_hung(struct amdgpu_device *adev)
{
    uint32_t val = RREG32(mmMC_VM_FB_LOCATION_BASE);
    return (val == 0xffffffff);
}`,
      explanation: "amdgpu_job_timedout() \u662f DRM \u8c03\u5ea6\u5668\u7684\u8d85\u65f6\u56de\u8c03\uff0c\u5f53 fence \u7b49\u5f85\u8d85\u65f6\u65f6\u88ab\u8c03\u7528\u3002\u5b83\u89e6\u53d1 amdgpu_device_gpu_recover()\uff0c\u540e\u8005\u6309\u7167 soft reset \u2192 hard reset \u2192 FLR \u7684\u987a\u5e8f\u5c1d\u8bd5\u6062\u590d GPU\u3002\u91cd\u7f6e\u540e\u6240\u6709 context \u4f1a\u6536\u5230\u9519\u8bef\u901a\u77e5\uff0c\u5e94\u7528\u7a0b\u5e8f\u9700\u8981\u91cd\u65b0\u521b\u5efa GPU \u8d44\u6e90\u3002"
    },
    miniLab: {
      title: "\u76d1\u63a7 GPU Reset \u7edf\u8ba1",
      objective: "\u901a\u8fc7 sysfs \u548c dmesg \u76d1\u63a7 GPU reset \u4e8b\u4ef6",
      steps: [
          "\u67e5\u770b\u5f53\u524d GPU reset \u7edf\u8ba1: cat /sys/class/drm/card0/device/gpu_reset_count",
          "\u67e5\u770b GPU hang \u68c0\u6d4b\u8bbe\u7f6e: cat /sys/module/amdgpu/parameters/gpu_recovery",
          "\u542f\u7528\u8be6\u7ec6\u65e5\u5fd7: sudo sh -c \"echo 0x1ff > /sys/module/amdgpu/parameters/debug_mask\"",
          "\u76d1\u63a7 dmesg \u4e2d\u7684 reset \u65e5\u5fd7: sudo dmesg -w | grep -i \"reset\\|hang\\|timeout\"",
          "\u8fd0\u884c\u538b\u529b\u6d4b\u8bd5: sudo apt install stress-ng && stress-ng --gpu 1 --timeout 30s",
          "\u67e5\u770b reset \u540e\u7684\u7edf\u8ba1\u53d8\u5316: cat /sys/class/drm/card0/device/gpu_reset_count"
        ],
      expectedOutput: "dmesg \u4e2d GPU reset \u65e5\u5fd7\u793a\u4f8b:\n[  123.456] amdgpu 0000:03:00.0: amdgpu: GPU reset begin!\n[  123.789] amdgpu 0000:03:00.0: amdgpu: GPU reset succeeded\n[  123.790] amdgpu 0000:03:00.0: amdgpu: GPU reset end!\ngpu_reset_count: 1"
    },
    debugExercise: {
      title: "GPU Reset \u540e\u5e94\u7528\u7a0b\u5e8f\u5d29\u6e83",
      language: "c",
      question: "找出并修复以下代码中的问题",
      buggyCode: `/* 问题：GPU reset 后这段 Vulkan 代码会发生什么？ */
VkResult result = vkQueueSubmit(queue, 1, &submitInfo, fence);
if (result != VK_SUCCESS) {
    printf("Submit failed: %d\n", result);
    exit(1);  /* 直接退出，没有尝试恢复 */
}

result = vkWaitForFences(device, 1, &fence, VK_TRUE, UINT64_MAX);
/* GPU reset 发生时，这里会返回 VK_ERROR_DEVICE_LOST */
if (result != VK_SUCCESS) {
    printf("Wait failed\n");
    exit(1);  /* 同样直接退出 */
}`,
      hint: "VK_ERROR_DEVICE_LOST \u662f GPU reset \u7684\u6807\u51c6 Vulkan \u9519\u8bef\u7801\u3002\u4e00\u4e2a\u5065\u58ee\u7684\u5e94\u7528\u7a0b\u5e8f\u5e94\u8be5\u5982\u4f55\u5904\u7406\u8fd9\u4e2a\u9519\u8bef\uff1f",
      solution: "\u5065\u58ee\u7684\u5e94\u7528\u7a0b\u5e8f\u5e94\u8be5\uff1a1) \u6355\u83b7 VK_ERROR_DEVICE_LOST\uff1b2) \u9500\u6bc1\u6240\u6709 Vulkan \u5bf9\u8c61\uff1b3) \u9500\u6bc1 VkDevice \u548c VkInstance\uff1b4) \u91cd\u65b0\u521b\u5efa VkInstance \u548c VkDevice\uff1b5) \u91cd\u65b0\u521b\u5efa\u6240\u6709\u8d44\u6e90\uff1b6) \u4ece\u6700\u8fd1\u7684\u68c0\u67e5\u70b9\u6062\u590d\u6e32\u67d3\u72b6\u6001\u3002\u8fd9\u5c31\u662f Vulkan \u7684 device lost recovery \u673a\u5236\u3002"
    },
    interviewQuestion: {
      question: "\u5f53 GPU \u53d1\u751f hang \u65f6\uff0cAMDGPU \u9a71\u52a8\u5982\u4f55\u68c0\u6d4b\u5e76\u6062\u590d\uff1f\u8bf7\u63cf\u8ff0\u5b8c\u6574\u7684\u91cd\u7f6e\u6d41\u7a0b\uff0c\u4ee5\u53ca\u5e94\u7528\u7a0b\u5e8f\u5982\u4f55\u611f\u77e5 GPU reset\uff1f",
      hint: "\u4ece fence \u8d85\u65f6\u68c0\u6d4b\u5f00\u59cb\uff0c\u63cf\u8ff0\u591a\u7ea7\u91cd\u7f6e\u7b56\u7565\uff0c\u4ee5\u53ca Vulkan/OpenGL \u7684\u9519\u8bef\u7801",
      answer: "GPU hang \u68c0\u6d4b\uff1aDRM \u8c03\u5ea6\u5668\u4e3a\u6bcf\u4e2a job \u8bbe\u7f6e\u8d85\u65f6\u5b9a\u65f6\u5668\uff0cfence \u8d85\u65f6\u540e\u8c03\u7528 amdgpu_job_timedout()\u3002\u91cd\u7f6e\u6d41\u7a0b\uff1a1) Soft Reset\uff1a\u91cd\u7f6e\u7279\u5b9a IP \u6a21\u5757\uff08\u6700\u5feb\uff0c\u4e0d\u5f71\u54cd PCIe\uff09\uff1b2) Hard Reset\uff1a\u5b8c\u6574\u91cd\u7f6e GPU ASIC\uff0c\u91cd\u65b0\u52a0\u8f7d\u56fa\u4ef6\uff1b3) PCIe FLR\uff1a\u901a\u8fc7 PCIe \u914d\u7f6e\u7a7a\u95f4\u7684 FLR \u4f4d\u5b8c\u6574\u91cd\u7f6e\u3002\u5e94\u7528\u7a0b\u5e8f\u611f\u77e5\uff1aVulkan \u6536\u5230 VK_ERROR_DEVICE_LOST\uff0cOpenGL \u6536\u5230 GL_CONTEXT_LOST\uff0c\u9700\u8981\u91cd\u65b0\u521b\u5efa\u6240\u6709 GPU \u8d44\u6e90\u3002"
    },
    completionChecklist: [
          "\u80fd\u89e3\u91ca GPU hang \u7684\u68c0\u6d4b\u673a\u5236\uff08fence \u8d85\u65f6\uff09",
          "\u77e5\u9053 AMDGPU \u7684\u4e09\u7ea7\u91cd\u7f6e\u7b56\u7565\uff08Soft/Hard/FLR\uff09",
          "\u7406\u89e3 Vulkan VK_ERROR_DEVICE_LOST \u7684\u542b\u4e49",
          "\u77e5\u9053\u5982\u4f55\u7528 dmesg \u548c sysfs \u76d1\u63a7 GPU reset"
        ]
  }
  ]
};

// Total lessons: 5
