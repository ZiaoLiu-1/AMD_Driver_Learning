/* ============================================================
   Labs — 5 hands-on experiments tied to engineering phases
   Based on V4.0 comprehensive audit report Section 2.2
   ============================================================ */

import type { Locale } from './curriculum_index';

export interface LabStep {
  order: number;
  title: string;
  titleEn: string;
  instruction: string;
  instructionEn: string;
  command?: string;
  codeSnippet?: string;
  hint?: string;
  hintEn?: string;
  checkpoint?: string;
  checkpointEn?: string;
}

export interface Lab {
  id: string;
  phaseId: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  prerequisites: string[];
  prerequisitesEn: string[];
  steps: LabStep[];
  expectedOutput: string;
  expectedOutputEn: string;
  tips: string[];
  tipsEn: string[];
  tags: string[];
}

export const labs: Lab[] = [
  {
    id: 'lab-1-custom-kernel',
    phaseId: 'phase-1',
    title: '实验一：编译与安装自定义内核',
    titleEn: 'Lab 1: Compile & Install a Custom Kernel',
    description:
      '掌握最基本的内核开发环境搭建和测试流程。从获取内核源码到编译、安装、启动自定义内核，建立完整的开发-测试循环。',
    descriptionEn:
      'Master the fundamental kernel development environment setup and testing workflow. Build the complete develop-test cycle from source to boot.',
    difficulty: 'beginner',
    estimatedMinutes: 90,
    prerequisites: ['Ubuntu 22.04+ 或 Fedora 38+', '至少 30GB 磁盘空间', '已安装 build-essential / gcc / make'],
    prerequisitesEn: ['Ubuntu 22.04+ or Fedora 38+', 'At least 30GB free disk space', 'build-essential / gcc / make installed'],
    steps: [
      {
        order: 1,
        title: '获取内核源码',
        titleEn: 'Get kernel source',
        instruction:
          '从 kernel.org 或 Git 仓库获取 Linux 内核源码。推荐使用 Git 以便后续追踪 amdgpu 驱动的变更历史。',
        instructionEn:
          'Obtain the Linux kernel source from kernel.org or via Git. Git is recommended for tracking amdgpu driver change history.',
        command: 'git clone --depth=1 https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git\ncd linux',
        checkpoint: '确认 linux/ 目录存在且包含 Makefile 和 drivers/gpu/drm/amd/ 目录。',
        checkpointEn: 'Verify linux/ directory exists with Makefile and drivers/gpu/drm/amd/.',
      },
      {
        order: 2,
        title: '安装编译依赖',
        titleEn: 'Install build dependencies',
        instruction:
          '安装内核编译所需的工具链和库。注意：gawk 是必须安装的，Ubuntu 的内核配置启用了 CONFIG_BUILTIN_MODULE_RANGES，该选项依赖 GNU AWK，但许多最小化安装中并不包含它。',
        instructionEn:
          'Install the toolchain and libraries needed for kernel compilation. Note: gawk is required — Ubuntu\'s kernel config enables CONFIG_BUILTIN_MODULE_RANGES which depends on GNU AWK, but it is absent from many minimal installs.',
        command:
          '# Ubuntu/Debian\nsudo apt install -y \\\n    build-essential libncurses-dev bison flex libssl-dev libelf-dev \\\n    dwarves zstd pahole \\\n    gawk  # REQUIRED: needed for CONFIG_BUILTIN_MODULE_RANGES\n\n# Fedora\nsudo dnf install -y gcc make ncurses-devel bison flex elfutils-libelf-devel openssl-devel gawk dwarves',
        checkpoint: '运行 gawk --version 和 gcc --version 均可正常显示版本号。',
        checkpointEn: 'Both gawk --version and gcc --version print version numbers without errors.',
      },
      {
        order: 3,
        title: '配置内核（含 Ubuntu/Debian 坑修复）',
        titleEn: 'Configure the kernel (with Ubuntu/Debian pitfall fixes)',
        instruction:
          '使用当前运行内核的配置作为基础。⚠️ Ubuntu/Debian 用户必须额外执行两步修复：①清除 Canonical 私有签名证书路径（该文件只存在于 Canonical 构建环境中，在你的机器上不存在）；②清除 MODULE_SIG_KEY。否则编译会以 "No rule to make target debian/canonical-certs.pem" 错误失败。',
        instructionEn:
          'Use the running kernel config as a base. ⚠️ Ubuntu/Debian users must apply two extra fixes: ① clear Canonical\'s private signing cert path (that file only exists in Canonical\'s build infra, not on your machine); ② clear MODULE_SIG_KEY. Without this you\'ll get a hard failure: "No rule to make target debian/canonical-certs.pem".',
        command:
          'cp /boot/config-$(uname -r) .config\n\n# --- Ubuntu/Debian 必须执行：清除 Canonical 私有证书路径 ---\nscripts/config --set-str SYSTEM_TRUSTED_KEYS ""\nscripts/config --set-str SYSTEM_REVOCATION_KEYS ""\nscripts/config --set-str MODULE_SIG_KEY ""\n\n# 强制 amdgpu 编译为可加载模块（=m）——发行版配置常为 =y（内置）。\n# --module 才能生成 amdgpu.ko，便于 rmmod/insmod 快速迭代。\nscripts/config --module CONFIG_DRM_AMDGPU\n\n# 用默认值填充所有新选项\nmake olddefconfig\n\n# 确认 amdgpu 已是模块\ngrep CONFIG_DRM_AMDGPU= .config\n# 应该看到 CONFIG_DRM_AMDGPU=m',
        hint: '如果不想逐条修复，也可以用 make localmodconfig 代替 cp /boot/config，这会生成一个只包含当前已加载模块的精简配置，完全避免证书问题，且编译速度更快。但需要在执行前确保 amdgpu 模块已加载（lsmod | grep amdgpu）。',
        hintEn: 'Alternatively, use make localmodconfig instead of cp /boot/config. It generates a minimal config from currently-loaded modules only — no cert issues and much faster builds. Requires amdgpu to already be loaded (lsmod | grep amdgpu) before running.',
        checkpoint: 'grep 输出显示 CONFIG_DRM_AMDGPU=m，且 grep SYSTEM_TRUSTED_KEYS .config 显示为空字符串。',
        checkpointEn: 'grep shows CONFIG_DRM_AMDGPU=m, and grep SYSTEM_TRUSTED_KEYS .config shows an empty string.',
      },
      {
        order: 4,
        title: '编译内核',
        titleEn: 'Build the kernel',
        instruction:
          '使用 -j 参数并行编译加速。$(nproc) 自动获取 CPU 核心数。首次编译可能需要 30-60 分钟。如果编译失败，并行输出可能掩盖真正的错误行；使用 make -j1 可以串行输出方便定位。',
        instructionEn:
          'Use -j flag for parallel compilation. $(nproc) auto-detects CPU cores. First build may take 30-60 minutes. If the build fails, parallel output may obscure the real error line; use make -j1 to get sequential output for easier diagnosis.',
        command:
          '# 正常编译\nmake -j$(nproc)\n\n# 如果报错，改用单线程以看清完整错误\n# make -j1 2>&1 | tail -30',
        hint: '如果看到 "错误 2" 或 "Error 2" 但没有具体错误信息，可能是系统 locale 是中文导致 make 错误消息也是中文。尝试 LC_ALL=C make -j1 以获得英文错误输出。',
        hintEn: 'If you see "Error 2" with no visible C error, your locale may be set to Chinese causing make messages in Chinese. Try LC_ALL=C make -j1 for English output and an easier-to-search error message.',
        checkpoint: '编译成功完成，无错误。最后一行应类似 "Kernel: arch/x86/boot/bzImage is ready"。',
        checkpointEn: 'Build completes without errors. Last line should be similar to "Kernel: arch/x86/boot/bzImage is ready".',
      },
      {
        order: 5,
        title: '安装模块和内核',
        titleEn: 'Install modules and kernel',
        instruction:
          '安装编译好的模块到 /lib/modules/，然后安装内核映像到 /boot/。',
        instructionEn:
          'Install compiled modules to /lib/modules/, then install the kernel image to /boot/.',
        command: 'sudo make modules_install\nsudo make install',
        checkpoint: 'ls /boot/vmlinuz-* 可以看到新安装的内核文件。',
        checkpointEn: 'ls /boot/vmlinuz-* shows the newly installed kernel file.',
      },
      {
        order: 6,
        title: '使用 virtme-ng 安全测试（推荐）',
        titleEn: 'Safe testing with virtme-ng (recommended)',
        instruction:
          '不要直接重启物理机测试。使用 virtme-ng 在虚拟机中测试新内核，避免 brick 你的系统。',
        instructionEn:
          'Do not reboot your physical machine to test. Use virtme-ng to test the new kernel in a VM, avoiding bricking your system.',
        command: 'pip install virtme-ng\n# 在内核源码树中编译，然后直接启动刚编译出的内核\nvng --build\nvng\n# vng（不带参数）会启动当前源码树中刚编译的内核；\n# vng -r 则启动宿主机正在运行的内核。',
        checkpoint: '虚拟机成功启动，运行 uname -r 显示你编译的内核版本。',
        checkpointEn: 'VM boots successfully, uname -r shows your compiled kernel version.',
      },
      {
        order: 7,
        title: '产出物：写构建笔记进 Portfolio',
        titleEn: 'Artifact: write a build report for your portfolio',
        instruction:
          '在 Portfolio 仓库的 notes/ 目录写 lab1-kernel-build.md：内核版本与来源、CONFIG_DRM_AMDGPU=m 的 .config 关键片段、Canonical 证书坑的现象与修复命令、vng 启动日志摘录（uname -r 输出）。这是 11.3.2 简历公式里第一条 bullet 的链接目标。',
        instructionEn:
          'In your portfolio repo under notes/, write lab1-kernel-build.md: kernel version and source, the key .config lines (CONFIG_DRM_AMDGPU=m), the Canonical cert pitfall symptom and fix commands, and a vng boot-log excerpt (uname -r output). This is the link target for the first resume bullet in lesson 11.3.2.',
        command: 'grep -E "CONFIG_DRM_AMDGPU|SYSTEM_TRUSTED_KEYS" .config\n# 把上述输出、修复命令和 vng 里的 uname -r 整理进\n# portfolio/notes/lab1-kernel-build.md',
        checkpoint: '笔记包含可复现的命令与日志摘录，Portfolio README 已链接它。',
        checkpointEn: 'The note contains reproducible commands plus log excerpts, and your portfolio README links to it.',
      },
    ],
    expectedOutput: '能在 virtme-ng 虚拟机中启动自定义编译的内核，并确认 amdgpu 模块可用。',
    expectedOutputEn: 'Boot a custom-compiled kernel in virtme-ng VM with amdgpu module available.',
    tips: [
      '使用 ccache 可以显著加速重复编译',
      '只修改 amdgpu 模块时，可以只编译模块：make M=drivers/gpu/drm/amd/',
      '保存 .config 文件以便后续复用',
      '⚠️ Ubuntu/Debian 必须修复两个坑再编译：① scripts/config --set-str SYSTEM_TRUSTED_KEYS "" 清除 Canonical 证书路径；② sudo apt install gawk（CONFIG_BUILTIN_MODULE_RANGES 需要它）',
      '编译并行输出可能掩盖真正的错误。若 make -j$(nproc) 失败，改用 LC_ALL=C make -j1 获取完整英文错误信息',
      '替代方案：make localmodconfig 比复制 Ubuntu 配置更快、更干净，且不存在证书问题',
      '⚠️ 确保 CONFIG_DRM_AMDGPU=m（模块）而非 =y（内置）。Ubuntu 的默认配置可能是 =y，导致编译后没有 amdgpu.ko 文件，且每次代码修改都需要完整重启才能生效。用 scripts/config --module CONFIG_DRM_AMDGPU 强制设为模块',
    ],
    tipsEn: [
      'Use ccache to significantly speed up repeated compilations',
      'When only modifying amdgpu, build just the module: make M=drivers/gpu/drm/amd/',
      'Save the .config file for reuse',
      '⚠️ Ubuntu/Debian users must fix two pitfalls before building: ① scripts/config --set-str SYSTEM_TRUSTED_KEYS "" clears Canonical cert path; ② sudo apt install gawk (needed by CONFIG_BUILTIN_MODULE_RANGES)',
      'Parallel build output can hide the real error. If make -j$(nproc) fails, use LC_ALL=C make -j1 for full English error output',
      'Alternative: make localmodconfig is faster and cleaner than copying Ubuntu\'s config, and has no cert issues',
      '⚠️ Ensure CONFIG_DRM_AMDGPU=m (module), not =y (built-in). Ubuntu\'s default config may set it to =y, which means no amdgpu.ko is produced and every code change requires a full reboot. Use scripts/config --module CONFIG_DRM_AMDGPU to force module mode',
    ],
    tags: ['kernel', 'build', 'virtme-ng', 'amdgpu'],
  },
  {
    id: 'lab-2-gpu-hang',
    phaseId: 'phase-4',
    title: '实验二：主动触发并调试 GPU Hang',
    titleEn: 'Lab 2: Trigger & Debug a GPU Hang',
    description:
      '学会使用 dmesg、devcoredump 等工具分析最常见的 GPU 故障——GPU Hang。',
    descriptionEn:
      'Learn to use dmesg, devcoredump, and other tools to analyze the most common GPU fault: GPU Hang.',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    prerequisites: ['已完成实验一', '有 AMD GPU 的物理机或 VM passthrough', '已安装 umr 工具'],
    prerequisitesEn: ['Lab 1 completed', 'Physical machine with AMD GPU or VM passthrough', 'umr tool installed'],
    steps: [
      {
        order: 1,
        title: '准备调试环境',
        titleEn: 'Prepare debug environment',
        instruction:
          '启用 drm 核心与 amdgpu 调试日志。注意：amdgpu.debug_mask 在多数内核上是只读模块参数（权限 0444），只能在模块加载时设置；drm.debug 则可以运行时修改。',
        instructionEn:
          'Enable drm core and amdgpu debug logging. Note: on most kernels amdgpu.debug_mask is a read-only module parameter (mode 0444) that can only be set at module load time; drm.debug is writable at runtime.',
        command:
          '# drm 核心日志可运行时开启（日志量大，调试完记得写回 0）\necho 0x1ff | sudo tee /sys/module/drm/parameters/debug\n\n# 检查 amdgpu.debug_mask 是否可写（多数内核为只读 0444）\nls -l /sys/module/amdgpu/parameters/debug_mask\n\n# 只读时改为加载参数（重载 amdgpu 模块或重启后生效）\necho "options amdgpu debug_mask=0xf" | sudo tee /etc/modprobe.d/amdgpu-debug.conf',
        hint: '如果直接 echo 到 debug_mask 报 Permission denied，这不是 sudo 的问题——该参数只在模块加载时读取。可改用内核启动参数 amdgpu.debug_mask=0xf 或上面的 modprobe.d 方式。各 bit 含义见 amdgpu.h 中的 AMDGPU_DEBUG_* 宏。',
        hintEn: 'If echoing into debug_mask returns Permission denied, it is not a sudo problem — the parameter is read at module load only. Use the kernel cmdline amdgpu.debug_mask=0xf or the modprobe.d approach above. Bit meanings are in the AMDGPU_DEBUG_* macros in amdgpu.h.',
        checkpoint: 'sudo dmesg -w 出现 [drm:...] 详细日志；若配置了 debug_mask，重载/重启后 cat /sys/module/amdgpu/parameters/debug_mask 显示 15（即 0xf）。',
        checkpointEn: 'sudo dmesg -w shows verbose [drm:...] logs; if debug_mask was configured, after reload/reboot cat /sys/module/amdgpu/parameters/debug_mask prints 15 (i.e. 0xf).',
      },
      {
        order: 2,
        title: '触发 GPU Hang（使用 IGT 测试）',
        titleEn: 'Trigger GPU Hang (using IGT tests)',
        instruction:
          '使用 IGT GPU Tools 的 hang 测试触发一次可控的 GPU Hang。这是安全的——驱动会自动恢复。',
        instructionEn:
          'Use IGT GPU Tools hang tests to trigger a controlled GPU Hang. This is safe—the driver will auto-recover.',
        command:
          '# 安装 IGT\ngit clone https://gitlab.freedesktop.org/drm/igt-gpu-tools.git\ncd igt-gpu-tools && meson setup build && ninja -C build\n\n# 子项名会随上游变化，先列出再运行（旧的 hang-ring-gfx 已不存在）：\n./build/tests/amdgpu/amd_deadlock --list-subtests\n# 触发一次可控的 gfx 引擎死锁/复位（当前子项名形如 amdgpu-deadlock-gfx）\nsudo ./build/tests/amdgpu/amd_deadlock --run-subtest amdgpu-deadlock-gfx',
        hint: 'IGT 的 amdgpu 测试是一组独立二进制（amd_deadlock、amd_basic 等），没有单一的 amdgpu_test 程序。先用 --list-subtests 查看实际子项名；也可写一个无限循环的 compute shader 触发 hang。',
        hintEn: 'IGT ships the amdgpu tests as separate binaries (amd_deadlock, amd_basic, ...), not a single amdgpu_test program. Use --list-subtests to see the real subtest names; alternatively write an infinite-loop compute shader to trigger a hang.',
        checkpoint: 'dmesg 显示 "amdgpu: GPU reset begin" 和 "amdgpu: GPU reset succeeded" 消息。',
        checkpointEn: 'dmesg shows "amdgpu: GPU reset begin" and "amdgpu: GPU reset succeeded" messages.',
      },
      {
        order: 3,
        title: '分析 devcoredump',
        titleEn: 'Analyze devcoredump',
        instruction:
          '当 GPU Hang 发生时，驱动会生成 devcoredump 转储。分析它可以了解 Hang 时 GPU 的状态。',
        instructionEn:
          'When a GPU Hang occurs, the driver generates a devcoredump. Analyzing it reveals the GPU state at the time of hang.',
        command:
          '# 查看 devcoredump\nls /sys/class/devcoredump/\ncat /sys/class/devcoredump/devcd*/data > gpu_dump.bin\n\n# 使用 umr 解析\numr --dump-devcoredump gpu_dump.bin',
        checkpoint: 'umr 输出显示 Hang 时的寄存器状态、Ring Buffer 位置和活跃的 Wavefront。',
        checkpointEn: 'umr output shows register state, Ring Buffer position, and active Wavefronts at hang time.',
      },
      {
        order: 4,
        title: '分析 dmesg 日志',
        titleEn: 'Analyze dmesg logs',
        instruction:
          '从 dmesg 日志中提取 GPU Hang 的关键信息：哪个 Ring 发生了 Hang，Reset 类型，恢复是否成功。',
        instructionEn:
          'Extract key GPU Hang information from dmesg: which Ring hung, reset type, and whether recovery succeeded.',
        command:
          'dmesg | grep -E "amdgpu|drm" | grep -E "hang|reset|timeout|recovery" | tail -30',
        checkpoint: '能够识别出 Hang 发生在哪个 Ring（GFX/Compute/SDMA）以及使用了哪种 Reset 类型。',
        checkpointEn: 'Can identify which Ring hung (GFX/Compute/SDMA) and which Reset type was used.',
      },
      {
        order: 5,
        title: '产出物：写 GPU Hang 分析报告进 Portfolio',
        titleEn: 'Artifact: write a GPU-hang analysis report for your portfolio',
        instruction:
          '在 Portfolio 仓库的 analysis/ 目录写 gpu-hang-report.md：触发命令（IGT 子项名）、dmesg 关键行摘录（reset begin/succeeded）、umr 对 devcoredump 的解析摘录、结论（哪个 Ring hang、哪种 Reset、恢复是否成功）。这是面试聊 GPU 调试时最有说服力的展示材料。',
        instructionEn:
          'In your portfolio repo under analysis/, write gpu-hang-report.md: the trigger command (IGT subtest name), key dmesg lines (reset begin/succeeded), umr devcoredump parsing excerpts, and conclusions (which ring hung, which reset type, whether recovery succeeded). This is your most convincing exhibit when interviews turn to GPU debugging.',
        command: 'dmesg | grep -E "amdgpu.*(reset|hang)" > /tmp/hang-evidence.txt\n# 连同 umr 输出摘录一起整理进\n# portfolio/analysis/gpu-hang-report.md',
        checkpoint: '报告包含触发→现象→分析→结论四段，Portfolio README 已链接它。',
        checkpointEn: 'The report covers trigger → symptoms → analysis → conclusion, and your portfolio README links to it.',
      },
    ],
    expectedOutput: '能独立触发 GPU Hang，收集 devcoredump 和 dmesg 日志，并分析出 Hang 的根因。',
    expectedOutputEn: 'Independently trigger a GPU Hang, collect devcoredump and dmesg logs, and analyze root cause.',
    tips: [
      'GPU Reset 后桌面可能闪烁，这是正常的',
      '保存 devcoredump 数据用于后续分析，数据会在一段时间后被清除',
      '使用 sudo dmesg -w 实时监控内核日志',
    ],
    tipsEn: [
      'Desktop may flicker after GPU Reset — this is normal',
      'Save devcoredump data for later analysis as it is cleared after some time',
      'Use sudo dmesg -w to monitor kernel logs in real-time',
    ],
    tags: ['gpu-hang', 'devcoredump', 'debugging', 'umr', 'reset'],
  },
  {
    id: 'lab-3-ftrace-fence',
    phaseId: 'phase-3',
    title: '实验三：使用 ftrace 追踪 dma_fence 生命周期',
    titleEn: 'Lab 3: Trace dma_fence Lifecycle with ftrace',
    description:
      '亲眼观察 GPU 命令的提交、执行和完成信号。通过 ftrace 追踪 dma_fence 的创建、signal 和销毁。',
    descriptionEn:
      'Observe GPU command submission, execution, and completion signals firsthand. Trace dma_fence creation, signaling, and destruction via ftrace.',
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    prerequisites: ['已完成实验一', '理解 Ring Buffer 和 dma_fence 概念'],
    prerequisitesEn: ['Lab 1 completed', 'Understanding of Ring Buffer and dma_fence concepts'],
    steps: [
      {
        order: 1,
        title: '启用 ftrace',
        titleEn: 'Enable ftrace',
        instruction:
          '挂载 tracefs 并配置 ftrace 只追踪 dma_fence 相关函数。',
        instructionEn:
          'Mount tracefs and configure ftrace to trace only dma_fence related functions.',
        command:
          'sudo mount -t tracefs nodev /sys/kernel/tracing 2>/dev/null\ncd /sys/kernel/tracing\n\n# 设置追踪过滤器\necho "dma_fence_signal*" > set_ftrace_filter\necho "amdgpu_fence*" >> set_ftrace_filter\necho function > current_tracer\necho 1 > tracing_on',
        checkpoint: 'cat set_ftrace_filter 显示已注册的追踪函数列表。',
        checkpointEn: 'cat set_ftrace_filter shows the registered trace function list.',
      },
      {
        order: 2,
        title: '触发 GPU 工作负载',
        titleEn: 'Trigger GPU workload',
        instruction:
          '运行一个简单的 GPU 任务来产生 fence 活动。可以使用 glxgears 或一个简单的 HIP 程序。',
        instructionEn:
          'Run a simple GPU task to generate fence activity. Use glxgears or a simple HIP program.',
        command:
          '# 方法 1：OpenGL\nglxgears &\nsleep 2\nkill %1\n\n# 方法 2：Vulkan\nvkcube &\nsleep 2\nkill %1',
        checkpoint: '任务运行完成，没有报错。',
        checkpointEn: 'Task completes without errors.',
      },
      {
        order: 3,
        title: '收集和分析 trace 数据',
        titleEn: 'Collect and analyze trace data',
        instruction:
          '停止追踪并读取 trace buffer。观察 fence 的创建和 signal 事件的时间戳和调用栈。',
        instructionEn:
          'Stop tracing and read the trace buffer. Observe timestamps and call stacks for fence creation and signal events.',
        command:
          'echo 0 > tracing_on\ncat trace | head -100\n\n# 查看 fence signal 的完整调用栈\necho 1 > options/func_stack_trace\n# 重新运行上述 GPU 任务\n# 然后查看 trace',
        checkpoint: '能在 trace 输出中看到 dma_fence_signal 调用，包含时间戳和触发它的中断上下文。',
        checkpointEn: 'Can see dma_fence_signal calls in trace output with timestamps and interrupt context.',
      },
      {
        order: 4,
        title: '对比分析不同 Ring 的 fence 活动',
        titleEn: 'Compare fence activity across different Rings',
        instruction:
          '分别触发 GFX（图形）和 Compute（计算）工作负载，对比它们的 fence 频率和延迟。',
        instructionEn:
          'Trigger GFX (graphics) and Compute workloads separately, comparing their fence frequency and latency.',
        command:
          '# 导出 trace 数据用于分析\ncat trace > /tmp/fence_trace.txt\ngrep "dma_fence_signal" /tmp/fence_trace.txt | wc -l\n# 统计 fence signal 的数量',
        checkpoint: '能解释 GFX Ring 和 Compute Ring 的 fence 频率差异。',
        checkpointEn: 'Can explain the fence frequency difference between GFX Ring and Compute Ring.',
      },
      {
        order: 5,
        title: '产出物：写 fence 追踪报告进 Portfolio',
        titleEn: 'Artifact: write a fence-trace report for your portfolio',
        instruction:
          '把 /tmp/fence_trace.txt 的关键摘录整理进 Portfolio 仓库 analysis/fence-trace.md：使用的 ftrace 过滤器与命令、GFX vs Compute 负载下 dma_fence_signal 的计数对比、一段解释（fence 生命周期：创建→提交→执行→中断→signal）。/tmp 重启即失——报告才是留得下来的产物。',
        instructionEn:
          'Distill the key excerpts from /tmp/fence_trace.txt into analysis/fence-trace.md in your portfolio repo: the ftrace filters and commands used, the dma_fence_signal count comparison between GFX and Compute workloads, and a paragraph explaining the fence lifecycle (create → submit → execute → interrupt → signal). /tmp vanishes on reboot — the report is what survives.',
        command: 'grep -c "dma_fence_signal" /tmp/fence_trace.txt\n# 连同 trace 摘录与对比结论整理进\n# portfolio/analysis/fence-trace.md',
        checkpoint: '报告包含命令清单、计数对比和生命周期解释，Portfolio README 已链接它。',
        checkpointEn: 'The report contains the command list, count comparison, and lifecycle explanation, and your portfolio README links to it.',
      },
    ],
    expectedOutput: '理解 dma_fence 的完整生命周期：创建 → 提交 → GPU 执行 → 中断触发 → signal → 唤醒等待者。',
    expectedOutputEn: 'Understand the complete dma_fence lifecycle: creation → submission → GPU execution → interrupt → signal → wake waiters.',
    tips: [
      'ftrace 的性能开销很小，可以在生产系统上安全使用',
      '使用 trace-cmd 工具可以更方便地管理 ftrace',
      'perf 也可以追踪 fence 事件：perf trace -e dma_fence:*',
    ],
    tipsEn: [
      'ftrace overhead is minimal and safe for production systems',
      'Use trace-cmd tool for easier ftrace management',
      'perf can also trace fence events: perf trace -e dma_fence:*',
    ],
    tags: ['ftrace', 'dma_fence', 'tracing', 'synchronization'],
  },
  {
    id: 'lab-4-module-params',
    phaseId: 'phase-1',
    title: '实验四：修改 amdgpu 模块参数',
    titleEn: 'Lab 4: Modify amdgpu Module Parameters',
    description:
      '学会通过模块参数动态调整驱动行为，例如开启调试日志或强制修改电源管理状态。',
    descriptionEn:
      'Learn to dynamically adjust driver behavior through module parameters, such as enabling debug logs or forcing power management states.',
    difficulty: 'beginner',
    estimatedMinutes: 30,
    prerequisites: ['已完成实验一', '有 AMD GPU 的系统'],
    prerequisitesEn: ['Lab 1 completed', 'System with AMD GPU'],
    steps: [
      {
        order: 1,
        title: '查看可用模块参数',
        titleEn: 'List available module parameters',
        instruction:
          '列出 amdgpu 模块所有可调参数及其当前值。',
        instructionEn:
          'List all tunable amdgpu module parameters and their current values.',
        command:
          '# 查看所有 amdgpu 参数\nls /sys/module/amdgpu/parameters/\n\n# 查看关键参数的当前值\nfor p in gpu_recovery ppfeaturemask debug_mask dc dpm; do\n  echo "$p = $(cat /sys/module/amdgpu/parameters/$p 2>/dev/null || echo N/A)"\ndone',
        checkpoint: '能列出至少 10 个参数及其值。',
        checkpointEn: 'Can list at least 10 parameters with their values.',
      },
      {
        order: 2,
        title: '启用调试日志',
        titleEn: 'Enable debug logging',
        instruction:
          '通过 debug_mask 参数开启特定子系统的调试日志。不同的 bit 控制不同子系统的日志输出。注意：debug_mask 在多数内核上是加载时参数（只读 0444），运行时想立即看日志请用 drm.debug。',
        instructionEn:
          'Enable debug logging for specific subsystems via debug_mask. Different bits control logging for different subsystems. Note: on most kernels debug_mask is a load-time parameter (read-only 0444); for immediate runtime logging use drm.debug instead.',
        command:
          '# 1) 查看权限——多数内核为 0444（只读，加载时参数）\nls -l /sys/module/amdgpu/parameters/debug_mask\n\n# 2) 加载时设置（重载 amdgpu 模块或重启后生效）\n#    例：0x4 = 只启用 VM（虚拟内存）调试日志\necho "options amdgpu debug_mask=0x4" | sudo tee /etc/modprobe.d/amdgpu-debug.conf\n# 或在 GRUB 内核命令行追加：amdgpu.debug_mask=0x4\n\n# 3) 运行时想立刻看详细日志？用 drm.debug（运行时可写）\necho 0x1ff | sudo tee /sys/module/drm/parameters/debug\nsudo dmesg -w | grep -i -E "drm|amdgpu"',
        hint: 'debug_mask 各 bit 的含义可在 amdgpu.h 中的 AMDGPU_DEBUG_* 宏查到。drm.debug 的 bit 含义（CORE/DRIVER/KMS/ATOMIC 等）见 drm_print.h。',
        hintEn: 'Bit meanings of debug_mask are in AMDGPU_DEBUG_* macros in amdgpu.h. drm.debug bit meanings (CORE/DRIVER/KMS/ATOMIC, ...) are in drm_print.h.',
        checkpoint: '确认了 debug_mask 的权限；modprobe.d 配置就绪（重载后 cat 显示新值）；drm.debug 修改后 dmesg 立即出现详细日志。',
        checkpointEn: 'Verified debug_mask permissions; modprobe.d config in place (cat shows the new value after reload); dmesg shows verbose logs immediately after changing drm.debug.',
      },
      {
        order: 3,
        title: '修改电源管理参数',
        titleEn: 'Modify power management parameters',
        instruction:
          '通过 sysfs 接口修改 GPU 的电源管理行为，观察频率和功耗变化。',
        instructionEn:
          'Modify GPU power management behavior via sysfs and observe frequency and power changes.',
        command:
          '# 查看当前 GPU 时钟频率\ncat /sys/class/drm/card0/device/pp_dpm_sclk\n\n# 强制最高频率（性能模式）\necho "manual" | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level\necho "2" | sudo tee /sys/class/drm/card0/device/pp_dpm_sclk\n\n# 恢复自动模式\necho "auto" | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level',
        checkpoint: '能观察到 GPU 频率在手动模式和自动模式之间的变化。',
        checkpointEn: 'Can observe GPU frequency changes between manual and auto modes.',
      },
      {
        order: 4,
        title: '使用 modprobe 加载参数',
        titleEn: 'Load parameters via modprobe',
        instruction:
          '在模块加载时传递参数，这在测试不同驱动配置时非常有用。',
        instructionEn:
          'Pass parameters at module load time, useful for testing different driver configurations.',
        command:
          '# 创建 modprobe 配置文件\necho "options amdgpu gpu_recovery=1 dc=1 dpm=1" | sudo tee /etc/modprobe.d/amdgpu.conf\n\n# 验证配置\ncat /etc/modprobe.d/amdgpu.conf',
        checkpoint: '配置文件创建成功。下次系统启动或手动 modprobe 时参数会生效。',
        checkpointEn: 'Config file created. Parameters take effect on next boot or manual modprobe.',
      },
      {
        order: 5,
        title: '产出物：写模块参数笔记进 Portfolio',
        titleEn: 'Artifact: write a module-parameter note for your portfolio',
        instruction:
          '在 Portfolio 仓库的 notes/ 目录写 lab4-module-params.md：你研究过的参数表（名称、含义、加载期 vs 运行时）、manual/auto 模式下 pp_dpm_sclk 的实测输出对比、debug_mask 只读这个坑的解释。小而真实的观察记录最能体现动手深度。',
        instructionEn:
          'In your portfolio repo under notes/, write lab4-module-params.md: a table of the parameters you studied (name, meaning, load-time vs runtime), measured pp_dpm_sclk output in manual vs auto mode, and an explanation of the read-only debug_mask pitfall. Small, genuine observation logs are the best evidence of hands-on depth.',
        command: 'cat /sys/class/drm/card0/device/pp_dpm_sclk\n# 把 manual/auto 两种模式的输出对比整理进\n# portfolio/notes/lab4-module-params.md',
        checkpoint: '笔记包含参数表与实测输出，Portfolio README 已链接它。',
        checkpointEn: 'The note contains the parameter table and measured output, and your portfolio README links to it.',
      },
    ],
    expectedOutput: '能通过 sysfs 和 modprobe 动态调整 amdgpu 驱动行为，理解关键模块参数的作用。',
    expectedOutputEn: 'Can dynamically adjust amdgpu driver behavior via sysfs and modprobe, understanding key module parameters.',
    tips: [
      '修改模块参数前记录原始值，方便恢复',
      '某些参数修改可能导致系统不稳定，建议在虚拟机中测试',
      'amdgpu 的完整参数列表可通过 modinfo amdgpu 查看',
    ],
    tipsEn: [
      'Record original values before modifying parameters for easy rollback',
      'Some parameter changes may cause instability — test in a VM',
      'Full parameter list available via modinfo amdgpu',
    ],
    tags: ['module-params', 'sysfs', 'power-management', 'debug'],
  },
  {
    id: 'lab-5-printk-ip-block',
    phaseId: 'phase-1',
    title: '实验五：在 IP Block 初始化代码中添加 printk',
    titleEn: 'Lab 5: Add printk to IP Block Init Code',
    description:
      '练习修改内核代码并观察其对硬件初始化流程的影响。在 amdgpu 的 IP Block sw_init/hw_init 函数中添加调试信息。',
    descriptionEn:
      'Practice modifying kernel code and observing its effect on hardware initialization. Add debug printk in amdgpu IP Block sw_init/hw_init functions.',
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    prerequisites: ['已完成实验一（能编译内核）', '理解 IP Block 架构'],
    prerequisitesEn: ['Lab 1 completed (can build kernel)', 'Understanding of IP Block architecture'],
    steps: [
      {
        order: 1,
        title: '定位目标函数',
        titleEn: 'Locate target functions',
        instruction:
          '在 amdgpu 驱动源码中找到 IP Block 的初始化入口。以 GFX IP 为例（RDNA3 使用 gfx_v11_0.c）。',
        instructionEn:
          'Locate the IP Block initialization entry point in amdgpu source. Example: GFX IP (RDNA3 uses gfx_v11_0.c).',
        command:
          'cd linux/drivers/gpu/drm/amd/amdgpu/\ngrep -n "static int gfx_v11_0_sw_init" gfx_v11_0.c\ngrep -n "static int gfx_v11_0_hw_init" gfx_v11_0.c',
        checkpoint: '找到 gfx_v11_0_sw_init 和 gfx_v11_0_hw_init 函数的行号。',
        checkpointEn: 'Found line numbers for gfx_v11_0_sw_init and gfx_v11_0_hw_init.',
      },
      {
        order: 2,
        title: '添加 printk 调试信息',
        titleEn: 'Add printk debug messages',
        instruction:
          '在 sw_init 和 hw_init 函数的入口处添加 dev_info 调试信息，记录初始化开始和结束。',
        instructionEn:
          'Add dev_info debug messages at the entry of sw_init and hw_init to record init start and end.',
        codeSnippet:
          '// 在 gfx_v11_0_sw_init 函数开头添加：\ndev_info(adev->dev, "[LAB5] GFX v11.0 sw_init BEGIN\\n");\n\n// 在函数返回前添加：\ndev_info(adev->dev, "[LAB5] GFX v11.0 sw_init COMPLETE (ret=%d)\\n", r);',
        checkpoint: '代码修改完成，保存文件。',
        checkpointEn: 'Code modification done, file saved.',
      },
      {
        order: 3,
        title: '编译修改后的模块',
        titleEn: 'Build the modified module',
        instruction:
          '只编译 amdgpu 模块而不是整个内核，大幅缩短编译时间。',
        instructionEn:
          'Build only the amdgpu module instead of the entire kernel, greatly reducing build time.',
        command:
          'cd linux/\nmake M=drivers/gpu/drm/amd/ -j$(nproc)\n\n# 安装模块\nsudo make M=drivers/gpu/drm/amd/ modules_install',
        hint: '如果只想测试而不安装，可以用 insmod 直接加载 .ko 文件。',
        hintEn: 'To test without installing, use insmod to load the .ko file directly.',
        checkpoint: '编译成功，drivers/gpu/drm/amd/amdgpu/amdgpu.ko 文件已更新。',
        checkpointEn: 'Build succeeds, drivers/gpu/drm/amd/amdgpu/amdgpu.ko updated.',
      },
      {
        order: 4,
        title: '测试并观察输出',
        titleEn: 'Test and observe output',
        instruction:
          '使用 virtme-ng 测试修改后的内核，观察 dmesg 中的自定义调试信息。',
        instructionEn:
          'Test the modified kernel with virtme-ng, observe custom debug messages in dmesg.',
        command:
          '# 使用 virtme-ng 测试\nvng --build\n\n# 在虚拟机中查看日志\ndmesg | grep "\\[LAB5\\]"',
        checkpoint: 'dmesg 中出现 [LAB5] 标记的 GFX v11.0 初始化信息。',
        checkpointEn: 'dmesg shows [LAB5] tagged GFX v11.0 initialization messages.',
      },
      {
        order: 5,
        title: '追踪完整 IP Block 初始化顺序',
        titleEn: 'Trace full IP Block init order',
        instruction:
          '在多个 IP Block 的 sw_init/hw_init 中添加类似的 printk，观察完整的初始化顺序。',
        instructionEn:
          'Add similar printk to sw_init/hw_init of multiple IP Blocks to observe the full initialization order.',
        command:
          '# 查看所有 IP Block 的初始化函数\ngrep -rn "static int.*_sw_init" drivers/gpu/drm/amd/amdgpu/*.c | head -20\n\n# 常见的 IP Block：\n# gfx_v11_0 (GFX), sdma_v6_0 (SDMA), vcn_v4_0 (VCN),\n# smu_v13_0 (SMU), dm/amdgpu_dm (Display Core)',
        checkpoint: '能画出完整的 IP Block 初始化顺序图。',
        checkpointEn: 'Can draw a complete IP Block initialization order diagram.',
      },
      {
        order: 6,
        title: '产出物：把初始化顺序图写进 Portfolio',
        titleEn: 'Artifact: commit the init-order diagram to your portfolio',
        instruction:
          '在 Portfolio 仓库的 analysis/ 目录写 ip-block-init-order.md：带 [LAB5] 标记的 dmesg 日志摘录、你画的 IP Block 初始化顺序图（ASCII 或 mermaid）、一段解释（为什么 SMU/PSP 必须先于 GFX 初始化）。上一步"画出"的图只有进了仓库才算存在。',
        instructionEn:
          'In your portfolio repo under analysis/, write ip-block-init-order.md: the [LAB5]-tagged dmesg excerpts, your IP Block init-order diagram (ASCII or mermaid), and a paragraph explaining why SMU/PSP must initialize before GFX. The diagram you "drew" in the previous step only exists once it is committed.',
        command: 'dmesg | grep "\\[LAB5\\]" > /tmp/lab5-init-order.txt\n# 连同顺序图整理进\n# portfolio/analysis/ip-block-init-order.md',
        checkpoint: '报告包含日志摘录与顺序图，Portfolio README 已链接它。',
        checkpointEn: 'The report contains log excerpts plus the diagram, and your portfolio README links to it.',
      },
    ],
    expectedOutput: '理解 amdgpu 驱动中 IP Block 的初始化顺序，并掌握在内核代码中添加调试信息的基本方法。',
    expectedOutputEn: 'Understand the IP Block initialization order in amdgpu and master adding debug printk to kernel code.',
    tips: [
      '使用 dev_info 而不是 printk，这样日志会自动带上设备信息',
      '添加唯一的标记（如 [LAB5]）方便 grep 过滤',
      '实验完成后记得恢复代码：git checkout -- gfx_v11_0.c',
    ],
    tipsEn: [
      'Use dev_info instead of printk — it auto-includes device info',
      'Add a unique tag (like [LAB5]) for easy grep filtering',
      'Restore code after the lab: git checkout -- gfx_v11_0.c',
    ],
    tags: ['printk', 'ip-block', 'kernel-dev', 'initialization'],
  },
  {
    id: 'lab-6-kunit-drm',
    phaseId: 'phase-4',
    title: '实验六：运行并扩展 DRM KUnit 单元测试（无需 GPU）',
    titleEn: 'Lab 6: Run & Extend DRM KUnit Tests (No GPU Required)',
    description:
      'KUnit 是内核内置的单元测试框架。本实验在虚拟环境（UML/QEMU）中运行 DRM 核心的 KUnit 测试套件——重点是 drm_buddy，即 amdgpu VRAM 管理器实际使用的伙伴分配器——并练习阅读、修改和编写内核单元测试。全程不需要 AMD GPU，任何 Linux 开发机都能完成。',
    descriptionEn:
      'KUnit is the kernel\'s built-in unit-testing framework. In this lab you run the DRM core KUnit suites in a virtual environment (UML/QEMU) — focusing on drm_buddy, the buddy allocator the amdgpu VRAM manager actually uses — and practice reading, modifying, and writing kernel unit tests. No AMD GPU is needed; any Linux dev machine works.',
    difficulty: 'beginner',
    estimatedMinutes: 60,
    prerequisites: ['已完成实验一（本地有内核源码树）', 'Python 3.7+（kunit.py 需要）', '无需 GPU——测试运行在虚拟内核中'],
    prerequisitesEn: ['Lab 1 completed (kernel source tree available)', 'Python 3.7+ (required by kunit.py)', 'No GPU needed — tests run inside a virtual kernel'],
    steps: [
      {
        order: 1,
        title: '认识 KUnit 与 DRM 测试目录',
        titleEn: 'Meet KUnit and the DRM test directory',
        instruction:
          'KUnit 把单元测试直接编译进一个特殊内核，并在用户态虚拟机（默认 User-Mode Linux）中运行，几十秒内得到结果。drivers/gpu/drm/tests/ 覆盖 DRM 核心的数据结构与算法——其中 drm_buddy_test.c 测试的伙伴分配器正是 amdgpu_vram_mgr 用来管理 VRAM 的。你测试的不是玩具代码，而是真实驱动路径依赖的组件。',
        instructionEn:
          'KUnit compiles unit tests directly into a special kernel and runs them in a userspace VM (User-Mode Linux by default), giving results in well under a minute. drivers/gpu/drm/tests/ covers DRM core data structures and algorithms — and the buddy allocator exercised by drm_buddy_test.c is exactly what amdgpu_vram_mgr uses to manage VRAM. You are testing a component real driver paths depend on, not toy code.',
        command: 'cd ~/linux  # 你的内核源码树\nls tools/testing/kunit/\nls drivers/gpu/drm/tests/\ncat drivers/gpu/drm/tests/.kunitconfig',
        checkpoint: '能看到 drm_buddy_test.c、drm_rect_test.c 等 20 余个测试文件，以及 .kunitconfig 配置文件。',
        checkpointEn: 'You can see 20+ test files (drm_buddy_test.c, drm_rect_test.c, ...) plus the .kunitconfig file.',
      },
      {
        order: 2,
        title: '运行 DRM KUnit 测试套件',
        titleEn: 'Run the DRM KUnit suites',
        instruction:
          '用 kunit.py 一条命令完成配置、编译和运行。--kunitconfig 指向 DRM 测试目录即可使用其自带的最小配置。',
        instructionEn:
          'kunit.py configures, builds, and runs in one command. Point --kunitconfig at the DRM tests directory to use its bundled minimal config.',
        command: './tools/testing/kunit/kunit.py run --kunitconfig=drivers/gpu/drm/tests/',
        hint: '首次运行会配置并编译 UML 内核（几分钟）。如果 UML 在你的发行版上编译失败，追加 --arch=x86_64 改用 QEMU 运行。',
        hintEn: 'The first run configures and builds a UML kernel (a few minutes). If UML fails to build on your distro, append --arch=x86_64 to run under QEMU instead.',
        checkpoint: '看到 TAP 风格的逐用例输出和 "Testing complete." 总结，所有套件通过。',
        checkpointEn: 'TAP-style per-case output ends with a "Testing complete." summary and all suites pass.',
      },
      {
        order: 3,
        title: '只运行 drm_buddy 套件并保存日志',
        titleEn: 'Run only the drm_buddy suite and save the log',
        instruction:
          '用过滤参数只跑 drm_buddy 套件——这是与 amdgpu VRAM 管理直接相关的部分，日志也是你最终报告的素材。',
        instructionEn:
          'Use the filter argument to run only the drm_buddy suite — the part directly relevant to amdgpu VRAM management. The log becomes raw material for your final report.',
        command: './tools/testing/kunit/kunit.py run --kunitconfig=drivers/gpu/drm/tests/ \'drm_buddy\' | tee ~/kunit-drm-buddy.log',
        checkpoint: '日志文件包含 drm_buddy 套件各用例（分配边界、特殊模式等）的逐项结果。',
        checkpointEn: 'The log file contains per-case results for the drm_buddy suite (allocation bounds, pathological patterns, ...).',
      },
      {
        order: 4,
        title: '读懂一个测试用例',
        titleEn: 'Read and understand one test case',
        instruction:
          '打开 drivers/gpu/drm/tests/drm_buddy_test.c，通读一个分配相关用例。重点理解两类宏：KUNIT_ASSERT_*（失败立即终止本用例——用于"继续执行没有意义"的前置条件）与 KUNIT_EXPECT_*（失败被记录但继续执行——便于一次看到所有问题）。',
        instructionEn:
          'Open drivers/gpu/drm/tests/drm_buddy_test.c and read through one allocation-related case. Focus on the two macro families: KUNIT_ASSERT_* (abort this case on failure — for preconditions where continuing is pointless) vs KUNIT_EXPECT_* (record the failure but keep going — so you see all problems in one run).',
        codeSnippet:
          '/* KUnit 测试的基本结构（示意，非逐行摘抄） */\nstatic void drm_test_buddy_alloc_example(struct kunit *test)\n{\n    struct drm_buddy mm;\n    LIST_HEAD(allocated);\n\n    /* ASSERT：初始化失败就没有继续的意义 */\n    KUNIT_ASSERT_EQ(test, drm_buddy_init(&mm, SZ_4M, SZ_4K), 0);\n\n    /* EXPECT：记录失败但继续，便于一次看到所有问题 */\n    KUNIT_EXPECT_EQ(test,\n        drm_buddy_alloc_blocks(&mm, 0, SZ_4M, SZ_1M, SZ_1M,\n                               &allocated, 0), 0);\n\n    drm_buddy_free_list(&mm, &allocated, 0);\n    drm_buddy_fini(&mm);\n}\n\n/* 用例通过 kunit_case 数组注册进 suite */\nstatic struct kunit_case drm_buddy_tests[] = {\n    KUNIT_CASE(drm_test_buddy_alloc_example),\n    {}\n};',
        checkpoint: '能说出 ASSERT 与 EXPECT 的区别，以及你读的用例验证了 drm_buddy 的哪个行为。',
        checkpointEn: 'You can explain ASSERT vs EXPECT and which drm_buddy behavior your chosen case verifies.',
      },
      {
        order: 5,
        title: '故意改坏一个断言，观察失败输出',
        titleEn: 'Break an assertion on purpose and study the failure output',
        instruction:
          '把某个 KUNIT_EXPECT_EQ 的期望值改错，重新运行，观察失败报告的格式——这正是上游 CI 报告回归时你要读懂的输出。看完后还原修改。',
        instructionEn:
          'Change the expected value of one KUNIT_EXPECT_EQ to something wrong, re-run, and study the failure report format — this is exactly the output you will read when upstream CI reports a regression. Revert afterwards.',
        command: '# 修改 drm_buddy_test.c 中某个期望值后：\n./tools/testing/kunit/kunit.py run --kunitconfig=drivers/gpu/drm/tests/ \'drm_buddy\'\n\n# 看懂失败格式后还原\ngit checkout -- drivers/gpu/drm/tests/drm_buddy_test.c',
        hint: '失败输出包含 "Expected ... == ..." 与文件名行号。注意整个套件的退出状态也会变为失败——CI 就是靠它拦截回归的。',
        hintEn: 'The failure output includes "Expected ... == ..." plus file and line. Note the suite exit status flips to failure too — that is how CI gates regressions.',
        checkpoint: '看到 not ok 的用例与期望值/实际值对比，能读懂失败报告。',
        checkpointEn: 'You see the not ok case with expected/actual values and can read the failure report.',
      },
      {
        order: 6,
        title: '编写你自己的最小用例（本地练习）',
        titleEn: 'Write your own minimal test case (local exercise)',
        instruction:
          '模仿现有用例，新增一个覆盖你关心的边界的测试——例如请求大小为 0 的块，或 min_page_size 大于请求大小时的行为。把函数加进 kunit_case 数组后重新运行。',
        instructionEn:
          'Mimicking the existing cases, add a test covering a boundary you care about — e.g. requesting a zero-size block, or behavior when min_page_size exceeds the requested size. Add your function to the kunit_case array and re-run.',
        hint: '不确定某行为是 bug 还是设计如此？先写测试记录实际行为，再读代码与提交历史确认——这正是上游开发者补测试覆盖的真实流程。DRM 维护者欢迎补充测试覆盖的补丁。',
        hintEn: 'Not sure if a behavior is a bug or by design? Write the test to capture actual behavior first, then read the code and commit history — this is the real upstream workflow for adding coverage. DRM maintainers welcome test-coverage patches.',
        checkpoint: '你的新用例出现在输出中并通过（或按预期失败，并促使你读懂了实际行为）。',
        checkpointEn: 'Your new case shows up in the output and passes (or fails as expected, leading you to understand the actual behavior).',
      },
      {
        order: 7,
        title: '产出物：写一页测试报告',
        titleEn: 'Artifact: write a one-page test report',
        instruction:
          '在 Portfolio 仓库的 tests/ 目录写 kunit-drm-buddy-report.md：环境（内核版本、UML 或 QEMU）、运行命令、通过统计、你新增用例覆盖的边界，以及一段说明 drm_buddy 与 amdgpu 的关系（amdgpu_vram_mgr.c 通过 drm_buddy_alloc_blocks 分配 VRAM）。',
        instructionEn:
          'In your portfolio repo under tests/, write kunit-drm-buddy-report.md: environment (kernel version, UML or QEMU), commands used, pass statistics, the boundary your new case covers, and a paragraph on how drm_buddy relates to amdgpu (amdgpu_vram_mgr.c allocates VRAM via drm_buddy_alloc_blocks).',
        command: 'grep -rn "drm_buddy" drivers/gpu/drm/amd/amdgpu/amdgpu_vram_mgr.c | head -10',
        checkpoint: '报告包含可复现的命令与日志摘录，Portfolio README 已链接它。',
        checkpointEn: 'The report contains reproducible commands plus log excerpts, and your portfolio README links to it.',
      },
    ],
    expectedOutput: 'kunit.py 报告 drm_buddy 等套件全部通过；产出一份可放进 Portfolio 的测试报告和一个你自己编写的 KUnit 用例。',
    expectedOutputEn: 'kunit.py reports the drm_buddy (and other) suites passing; you produce a portfolio-ready test report and one KUnit case you wrote yourself.',
    tips: [
      'KUnit 测试运行在虚拟内核里，不会触碰你的真实系统或 GPU——可以放心实验',
      '在 amdgpu_vram_mgr.c 中搜索 drm_buddy 可以看到这套分配器在真实驱动中的调用点',
      '构建失败时给 kunit.py 追加 --raw_output 查看完整内核构建输出',
      '向 DRM 核心补充 KUnit 用例（或向 IGT 补充测试）与驱动补丁一样是可验证的上游贡献，同样能写进简历',
    ],
    tipsEn: [
      'KUnit tests run inside a virtual kernel and never touch your real system or GPU — experiment freely',
      'Search for drm_buddy in amdgpu_vram_mgr.c to see where the real driver calls this allocator',
      'On build failures, append --raw_output to kunit.py to see the full kernel build output',
      'Contributing KUnit cases to DRM core (or tests to IGT) is verifiable upstream work, just like driver patches — and belongs on your resume',
    ],
    tags: ['kunit', 'testing', 'drm-buddy', 'no-gpu', 'unit-test'],
  },
  {
    id: 'lab-7-first-upstream-patch',
    phaseId: 'phase-1',
    title: '实验七：找到并准备你的第一个上游补丁',
    titleEn: 'Lab 7: Find & Prepare Your First Upstream Patch',
    description:
      '把 Module 11 学到的流程变成真实的、可写进简历的产出。用 kernel-doc 与 W=1 警告扫描在 drivers/gpu/drm/amd 中找到一个真实的小问题，修复、验证，并用 b4 或 git send-email 完成发送前的全部检查。是否真正发送由你决定——但本实验要走到"随时可发"为止。',
    descriptionEn:
      'Turn the Module 11 workflow into a real, resume-ready artifact. Use kernel-doc and W=1 warning scans to find a genuine small issue in drivers/gpu/drm/amd, fix it, validate it, and complete every pre-send check with b4 or git send-email. Whether you actually send is your call — but this lab takes you all the way to "ready to send".',
    difficulty: 'intermediate',
    estimatedMinutes: 120,
    prerequisites: ['已完成实验一与 Module 11.1（补丁工作流）', '已配置 git send-email 或安装 b4', '网络可访问 gitlab.freedesktop.org 与 lore.kernel.org'],
    prerequisitesEn: ['Lab 1 and Module 11.1 (patch workflow) completed', 'git send-email configured or b4 installed', 'Network access to gitlab.freedesktop.org and lore.kernel.org'],
    steps: [
      {
        order: 1,
        title: '基于维护者的真实开发分支工作',
        titleEn: 'Work on the maintainer\'s actual development branch',
        instruction:
          'amdgpu 补丁应基于 AMD 维护者实际合并的分支 amd-staging-drm-next（agd5f 是维护者 Alex Deucher 的 freedesktop 仓库）。基于过时的发行版内核做的修复，很可能在上游早已被改掉或会产生冲突。',
        instructionEn:
          'amdgpu patches should be based on amd-staging-drm-next, the branch AMD maintainers actually merge into (agd5f is maintainer Alex Deucher\'s freedesktop repo). A fix made against an old distro kernel has likely already changed upstream or will conflict.',
        command: 'cd ~/linux  # 你的内核树\ngit remote add agd5f https://gitlab.freedesktop.org/agd5f/linux.git 2>/dev/null\ngit fetch agd5f amd-staging-drm-next --depth=200\ngit checkout -b first-patch agd5f/amd-staging-drm-next\ngit log --oneline -5',
        hint: '--depth=200 节省时间和磁盘；之后需要 git blame 深挖历史时再执行 git fetch --unshallow agd5f。',
        hintEn: '--depth=200 saves time and disk; run git fetch --unshallow agd5f later if you need git blame to dig into history.',
        checkpoint: 'git log 显示最近几周内的 drm/amd 提交。',
        checkpointEn: 'git log shows drm/amd commits from within the last few weeks.',
      },
      {
        order: 2,
        title: '机会雷达 #1：扫描 kernel-doc 警告',
        titleEn: 'Opportunity radar #1: scan for kernel-doc warnings',
        instruction:
          'kernel-doc 注释（/** ... */）必须与函数签名保持同步。参数改名、增删后注释经常没跟上，产生 "Function parameter ... not described" 或 "Excess function parameter" 警告。这类修复小而明确，是社区公认的入门贡献。display（DC）子树头文件多，是高产区。',
        instructionEn:
          'kernel-doc comments (/** ... */) must stay in sync with function signatures. After parameters are renamed, added, or removed, comments often lag behind, producing "Function parameter ... not described" or "Excess function parameter" warnings. These fixes are small, unambiguous, and a community-recognized entry contribution. The display (DC) subtree is header-heavy and fertile ground.',
        command: 'find drivers/gpu/drm/amd/display -name "*.h" | \\\n  xargs -r scripts/kernel-doc -none 2>&1 | tee /tmp/kdoc.log | head -40\nwc -l /tmp/kdoc.log',
        checkpoint: '得到一份警告清单，从中挑出 1-3 个你能读懂对应代码的候选。',
        checkpointEn: 'You have a warning list and have picked 1-3 candidates whose surrounding code you can actually read.',
      },
      {
        order: 3,
        title: '机会雷达 #2：W=1 编译警告（可选）',
        titleEn: 'Opportunity radar #2: W=1 build warnings (optional)',
        instruction:
          'W=1 打开比默认更严格的编译警告。注意其中有误报和维护者明确不收的类型——优先选 kernel-doc、未使用变量、明显笔误类；怀疑时先看目标文件的 git log，了解维护者最近接受过什么样的清理。',
        instructionEn:
          'W=1 enables stricter-than-default compiler warnings. Beware: some are false positives or categories maintainers explicitly do not take — prefer kernel-doc, unused-variable, and obvious-typo classes. When in doubt, read the target file\'s git log to see what kind of cleanups maintainers accepted recently.',
        command: 'make W=1 M=drivers/gpu/drm/amd -j$(nproc) 2>&1 | \\\n  grep -E "warning:" | sort | uniq -c | sort -rn | head -20',
        checkpoint: '候选清单合并完成，锁定一个最小、最明确的目标。',
        checkpointEn: 'Candidate list merged; you have locked onto one minimal, unambiguous target.',
      },
      {
        order: 4,
        title: '查重：确认没人已经在修',
        titleEn: 'Dedup: make sure nobody is already fixing it',
        instruction:
          '两个检查：（1）该警告在 amd-staging-drm-next 最新提交上仍然存在；（2）amd-gfx 归档近几周没有相同修复在审。重复补丁浪费维护者时间，是新手最常见的"第一印象失分"。',
        instructionEn:
          'Two checks: (1) the warning still exists at the tip of amd-staging-drm-next; (2) no identical fix is under review in the amd-gfx archive from recent weeks. Duplicate patches waste maintainer time and are the most common first-impression mistake.',
        command: '# 浏览器打开（把 <file> 换成目标文件名）：\n#   https://lore.kernel.org/amd-gfx/?q=<file>\ngit log --oneline -10 -- <path/to/target/file>',
        checkpoint: '确认目标唯一且没有在途的相同修复。',
        checkpointEn: 'Confirmed the target is unique with no in-flight identical fix.',
      },
      {
        order: 5,
        title: '修复并自检',
        titleEn: 'Fix and self-check',
        instruction:
          '一个补丁只做一件事。commit message 按 Module 11.1.2 的规范：display 文件用 "drm/amd/display:" 前缀；Body 说明警告内容与产生原因（例如某次提交改了函数签名但没更新注释——纯注释修复一般不需要 Fixes: 标签，把事实写清楚即可）。',
        instructionEn:
          'One logical change per patch. Follow the Module 11.1.2 commit-message rules: use the "drm/amd/display:" prefix for display files; the body states the warning and its cause (e.g. a commit changed the function signature without updating the comment — pure comment fixes generally do not need a Fixes: tag, just state the facts).',
        command: '# 编辑目标文件，修复 kernel-doc 注释\nscripts/kernel-doc -none <修改的文件>      # 应当零输出\nmake M=drivers/gpu/drm/amd -j$(nproc)      # 编译仍须通过\ngit add -p && git commit -s',
        checkpoint: '目标文件 kernel-doc -none 零输出；模块编译通过；git show 的 diff 只含一个逻辑修改。',
        checkpointEn: 'kernel-doc -none on the file prints nothing; the module still builds; git show contains exactly one logical change.',
      },
      {
        order: 6,
        title: 'checkpatch 与维护者名单',
        titleEn: 'checkpatch and the maintainer list',
        instruction:
          '发送前的固定动作：checkpatch --strict 必须 0 errors / 0 warnings；get_maintainer 给出 To/Cc 名单。',
        instructionEn:
          'The fixed pre-send ritual: checkpatch --strict must report 0 errors / 0 warnings; get_maintainer produces your To/Cc list.',
        command: 'scripts/checkpatch.pl --strict -g HEAD~1..HEAD\n\n# get_maintainer 接受补丁文件（不接受 commit 区间），先生成再分析：\ngit format-patch -1 -o /tmp/patch-check\nscripts/get_maintainer.pl /tmp/patch-check/0001-*.patch',
        checkpoint: '0 errors / 0 warnings；获得 amd-gfx 列表与对应维护者的 To/Cc 名单。',
        checkpointEn: '0 errors / 0 warnings; you have the To/Cc list with amd-gfx and the right maintainers.',
      },
      {
        order: 7,
        title: '发送前演练（不发出任何邮件）',
        titleEn: 'Pre-send rehearsal (no email goes out)',
        instruction:
          '用 b4 或 git send-email 的演练模式生成"将要发送的邮件"，人工检查 To/Cc、Subject 前缀和 diff 内容。这一步之后，你的补丁处于"随时可发"状态。',
        instructionEn:
          'Use b4 or git send-email rehearsal modes to generate exactly what would be sent, then manually inspect To/Cc, the Subject prefix, and the diff. After this step your patch is in a "ready to send" state.',
        command: '# 方式 A：b4（推荐）\nb4 prep -e agd5f/amd-staging-drm-next               # 把当前分支交给 b4 管理（-e/--enroll）\nb4 prep --check                                     # 自动运行 checkpatch 等检查\nb4 send -o /tmp/presend                             # 只生成邮件文件，不发送\ncat /tmp/presend/*\n\n# 方式 B：传统流程\ngit format-patch HEAD~1\ngit send-email --dry-run --to amd-gfx@lists.freedesktop.org 0001-*.patch',
        hint: '若你的 b4 版本较旧不支持 -e/--enroll，直接用方式 B——两者产物等价。重点检查：To/Cc 是否完整、Subject 前缀是否正确、diff 是否只含本次修改。',
        hintEn: 'If your b4 version is too old for -e/--enroll, just use option B — the output is equivalent. Key checks: complete To/Cc, correct Subject prefix, and a diff containing only this change.',
        checkpoint: '/tmp/presend（或 dry-run 输出）中的邮件头与正文全部正确。',
        checkpointEn: 'Headers and body in /tmp/presend (or the dry-run output) are all correct.',
      },
      {
        order: 8,
        title: '发送与跟踪（由你决定时机）',
        titleEn: 'Send and track (on your own schedule)',
        instruction:
          '发送后：（1）lore 归档链接几分钟内可用——这就是简历上可验证的贡献记录；（2）一周左右无回应可以礼貌地回帖 ping 一次；（3）维护者有时不回邮件直接收下补丁，所以也要定期在分支里查你的名字。',
        instructionEn:
          'After sending: (1) the lore archive link appears within minutes — that is the verifiable contribution record for your resume; (2) if there is no response after about a week, a polite ping reply is acceptable; (3) maintainers sometimes pick up patches without replying, so also check the branch for your name periodically.',
        command: 'b4 send        # 或 git send-email --to ... --cc ... 0001-*.patch\n\n# 几分钟后在归档确认（替换为你的邮箱）：\n#   https://lore.kernel.org/amd-gfx/?q=f:your@email.com\n\n# 之后定期检查补丁是否已被收进分支：\ngit fetch agd5f amd-staging-drm-next\ngit log --oneline --author="Your Name" agd5f/amd-staging-drm-next',
        checkpoint: '补丁出现在 lore.kernel.org/amd-gfx 归档——把这个链接记进你的 Portfolio。',
        checkpointEn: 'Your patch appears in the lore.kernel.org/amd-gfx archive — record that link in your portfolio.',
      },
      {
        order: 9,
        title: '回应 Review 并发出 v2（把"发出"变成"跟完"）',
        titleEn: 'Respond to review and send a v2 (from "sent" to "seen through")',
        instruction:
          '收到 review 意见是常态而非失败。规则：（1）逐条回复每个意见——同意就写 "Will fix in v2"，不同意就摆技术理由，不许沉默跳过；（2）修改后发 v2：主题变为 [PATCH v2]，正文 --- 分隔线下写变更说明（如 "v2: fix parameter name per review"），并保留/添加评审者给出的 tag；（3）v2 作为对原线程的回复发出（b4 自动处理 In-Reply-To），让讨论保持在同一线程。用 git range-diff 自查 v1→v2 的差异是否恰好等于你声称的修改。',
        instructionEn:
          'Getting review comments is the norm, not failure. Rules: (1) reply to every comment — "Will fix in v2" when you agree, technical reasoning when you do not; never silently skip one; (2) send a v2: subject becomes [PATCH v2], change notes go below the --- separator (e.g. "v2: fix parameter name per review"), keep/add any tags reviewers gave; (3) send v2 as a reply to the original thread (b4 handles In-Reply-To) so discussion stays in one thread. Self-check with git range-diff that v1→v2 differs exactly as you claim.',
        command: '# 修改代码后：\ngit add -u && git commit --amend    # 单补丁小修直接 amend\nb4 prep --edit-cover                 # 记录 v2 变更说明\ngit range-diff first-patch@{1}...first-patch  # 自查 v1→v2 差异\nb4 send                              # b4 自动升版本号并回挂原线程',
        hint: '没人回复怎么办：一周后礼貌 ping 一次；再无回应就把 ping 记录留档继续等——amd-gfx 流量大，沉默常见，不等于被拒。',
        hintEn: 'If nobody replies: one polite ping after a week; if still silent, keep the ping on record and wait — amd-gfx is high-traffic, silence is common and is not rejection.',
        checkpoint: 'v2 出现在原线程内（lore 线程视图可见 v1 → 评论 → v2 的完整链条）。',
        checkpointEn: 'The v2 appears inside the original thread (the lore thread view shows the full v1 → comments → v2 chain).',
      },
      {
        order: 10,
        title: '跟踪到终点并归档整个旅程',
        titleEn: 'Track to the finish line and archive the journey',
        instruction:
          '补丁的终点有三种：被合并（维护者分支 git log 出现你的名字）、被明确拒绝（拒绝理由本身是宝贵学习材料）、或长期沉默（记录 ping 历史后可以放手）。无论哪种，把完整旅程写成 portfolio 文档：问题是什么、怎么发现的、v1→vN 每轮改了什么、评审者说了什么、结局如何。这份文档在面试里的价值常常超过补丁本身——它证明你能完整走通上游协作循环。',
        instructionEn:
          'A patch ends one of three ways: merged (your name appears in the maintainer branch git log), explicitly rejected (the reasoning is valuable learning material), or prolonged silence (record your ping history, then let go). Either way, write the full journey into a portfolio doc: what the problem was, how you found it, what changed each revision, what reviewers said, how it ended. In interviews this document is often worth more than the patch itself — it proves you can complete the upstream collaboration loop.',
        command: '# 检查是否已被收编：\ngit fetch agd5f amd-staging-drm-next\ngit log --oneline --author="Your Name" agd5f/amd-staging-drm-next\n\n# 归档（模板见本仓库 portfolio-template/ 目录）：\ncp portfolio-template/notes/lab7-patch-journey.md ~/portfolio/notes/\n# 填入：lore 线程链接、每轮 range-diff 摘要、review 往来、最终状态',
        checkpoint: '你的 portfolio 仓库中存在 notes/lab7-patch-journey.md，含 lore 线程链接与逐轮变更记录。',
        checkpointEn: 'Your portfolio repo contains notes/lab7-patch-journey.md with the lore thread link and a per-revision change log.',
      },
    ],
    expectedOutput: '一个通过 kernel-doc / 编译 / checkpatch 全部检查、随时可发送的真实补丁；发送后获得 lore.kernel.org 归档链接——简历上可验证的上游贡献记录。',
    expectedOutputEn: 'A real patch passing every kernel-doc / build / checkpatch check, ready to send at any time; once sent, a lore.kernel.org archive link — a verifiable upstream contribution for your resume.',
    tips: [
      '⚠️ 不要批量提交纯代码风格修复——drm/amd 维护者通常不接受无功能意义的大面积风格改动；kernel-doc 与真实编译警告类修复是安全区',
      '第一个补丁越小越好——10 行以内的 kernel-doc 修复比 100 行的"重构"更容易获得回应',
      '发送前基于最新的 amd-staging-drm-next 重新 rebase，并确认警告仍然存在',
      '被要求修改不是失败——回应 Review 并发出 v2 的经历，在面试中比一次通过更有故事性',
      '同类警告先只修一处（一个文件/一个函数），熟悉完整循环后再考虑系列补丁',
    ],
    tipsEn: [
      '⚠️ Do not mass-submit pure style fixes — drm/amd maintainers generally reject broad changes with no functional meaning; kernel-doc and real compiler-warning fixes are the safe zone',
      'Smaller is better for a first patch — a sub-10-line kernel-doc fix gets a response more easily than a 100-line "refactor"',
      'Rebase onto the latest amd-staging-drm-next before sending and confirm the warning still exists',
      'Being asked for changes is not failure — responding to review and sending a v2 makes a better interview story than a one-shot merge',
      'Fix one instance first (one file / one function); consider a series only after you know the full loop',
    ],
    tags: ['upstream', 'kernel-doc', 'checkpatch', 'b4', 'amd-gfx', 'portfolio'],
  },
  {
    id: 'lab-8-issue-triage',
    phaseId: 'phase-4',
    title: '实验八：认领并 triage 一个真实的 amdgpu issue',
    titleEn: 'Lab 8: Claim & Triage a Real amdgpu Issue',
    description:
      '把"雷达页看到 issue"变成一条可点击的公开贡献记录。在 drm/amd 的 GitLab tracker 挑一个你的硬件能复现（或能明确证伪）的 issue，按上游标准采集证据、排除重复、写出规范的 triage 评论。freedesktop GitLab 上的高质量评论与补丁同级可链接——这是不写一行内核代码就能产生真实证据的最短路径。',
    descriptionEn:
      'Turn "saw an issue on the Radar page" into a clickable public contribution. Pick an issue on the drm/amd GitLab tracker that your hardware can reproduce (or clearly falsify), gather evidence to upstream standards, rule out duplicates, and write a proper triage comment. High-quality comments on freedesktop GitLab are just as linkable as patches — the shortest path to real evidence without writing a line of kernel code.',
    difficulty: 'intermediate',
    estimatedMinutes: 120,
    prerequisites: ['任意 AMD GPU + amdgpu 驱动的 Linux 环境', '已完成实验二（GPU hang 分析）的 dmesg 阅读训练', 'gitlab.freedesktop.org 账号'],
    prerequisitesEn: ['Any Linux box with an AMD GPU on the amdgpu driver', 'Lab 2 (GPU hang analysis) dmesg reading practice completed', 'A gitlab.freedesktop.org account'],
    steps: [
      {
        order: 1,
        title: '用雷达页/tracker 选一个"够得着"的 issue',
        titleEn: 'Pick a reachable issue via the Radar page / tracker',
        instruction:
          '选择标准（按优先级)：① 涉及你手头的 GPU 家族（gfx 版本相同最好，如 Navi3x 之于 gfx1102）；② 有明确复现步骤或至少明确的触发场景（某游戏/某 compositor/挂起唤醒）；③ 近 3 个月内有活动但还没有维护者结论；④ 避开需要特殊硬件（VR/多屏 DSC）的。把候选 issue 的编号、标题、你选它的理由记下来。',
        instructionEn:
          'Selection criteria (in priority order): (1) involves your GPU family (same gfx version is ideal, e.g. Navi3x for gfx1102); (2) has clear repro steps or at least a well-defined trigger (a given game / compositor / suspend-resume); (3) active within ~3 months but no maintainer conclusion yet; (4) avoid issues needing exotic hardware (VR, multi-monitor DSC). Write down the issue number, title, and why you chose it.',
        command: '# 站内雷达页（/radar）已按补丁关联度聚合，或直接：\n# https://gitlab.freedesktop.org/drm/amd/-/issues/?sort=updated_desc\n# 过滤词示例: suspend, flicker, ring timeout, 你的芯片代号(navi33)',
        hint: '第一次做选"行为类"issue（闪烁/挂死/唤醒失败），别选"性能低 5%"类——后者需要基准测试功底才能给出有效证据。',
        hintEn: 'For a first triage pick a behavioral issue (flicker/hang/resume failure), not a "5% slower" one — the latter needs benchmarking rigor to produce useful evidence.',
        checkpoint: '选定 1 个 issue，能一句话说清"它声称什么、我能验证什么"。',
        checkpointEn: 'One issue chosen; you can state in one sentence what it claims and what you can verify.',
      },
      {
        order: 2,
        title: '先查重：lore 与 tracker 双向搜索',
        titleEn: 'Duplicate check first: search both lore and the tracker',
        instruction:
          '上游最不欢迎的评论是"me too"和重复报告。动手前先搜：tracker 内用关键错误串（如 ring gfx_0.0.0 timeout）搜相似 issue；lore.kernel.org/amd-gfx 搜是否已有补丁在修同一问题。如果发现重复/已有修复，这本身就是有价值的 triage 结论——在 issue 里给出链接就是一条合格贡献。',
        instructionEn:
          'The least welcome upstream comments are "me too" and duplicate reports. Before anything else, search: the tracker for similar issues using the key error string (e.g. ring gfx_0.0.0 timeout), and lore.kernel.org/amd-gfx for patches already addressing it. Finding a duplicate/existing fix is itself a valuable triage result — posting the link is a legitimate contribution.',
        command: '# tracker 内搜索错误关键串；lore 侧：\n# https://lore.kernel.org/amd-gfx/?q=<关键词>\n# 站内雷达页的 patchMatches 字段已做了一层自动关联，先看它',
        checkpoint: '确认无重复/无在途修复，或已把重复链接贴进 issue（后者直接跳到第 7 步归档）。',
        checkpointEn: 'Confirmed no duplicate / in-flight fix, or you posted the duplicate link to the issue (then jump to step 7 to archive).',
      },
      {
        order: 3,
        title: '搭建干净的复现环境并记录基线',
        titleEn: 'Set up a clean repro environment and record the baseline',
        instruction:
          '复现要在尽量"干净"的条件下做：记录内核版本（uname -r）、Mesa 版本（glxinfo | grep OpenGL.version 或 vulkaninfo --summary）、固件包版本、桌面环境/合成器、amdgpu 模块参数（cat /sys/module/amdgpu/parameters/* 有变更的项）。这组"环境指纹"是评论里必须出现的第一段——没有它任何复现声明都无效。',
        instructionEn:
          'Reproduce under conditions as clean as possible: record kernel version (uname -r), Mesa version (glxinfo | grep "OpenGL version" or vulkaninfo --summary), firmware package version, desktop environment/compositor, and any non-default amdgpu module parameters. This "environment fingerprint" is the mandatory first paragraph of your comment — without it no repro claim is valid.',
        command: 'uname -r\nglxinfo -B 2>/dev/null | grep -E "OpenGL version|renderer"\ndpkg -l | grep -E "linux-firmware|mesa" | head -5\nlspci -nn | grep -i vga',
        checkpoint: '一段可直接粘贴的环境指纹文本就绪。',
        checkpointEn: 'A paste-ready environment fingerprint block exists.',
      },
      {
        order: 4,
        title: '复现并采集一手证据',
        titleEn: 'Reproduce and capture first-hand evidence',
        instruction:
          '按 issue 的步骤触发问题，同时采集：完整 dmesg（出问题前后各留 30 行上下文）、如发生 GPU reset 则抓 devcoredump（/sys/class/devcoredump/devcd*/data，出现后 5 分钟内读走）、以及问题现象的精确描述（频率：必现/概率；触发时间点）。复现失败同样是结论——"在 X 环境下按步骤无法复现"配上环境指纹，对维护者同样有价值。',
        instructionEn:
          'Trigger the problem per the issue steps while capturing: full dmesg (keep ~30 lines of context around the event), a devcoredump if a GPU reset occurred (/sys/class/devcoredump/devcd*/data — read it within minutes of appearing), and a precise description of the symptom (always/probabilistic; when it triggers). Failure to reproduce is also a result — "cannot reproduce with steps on environment X" plus your fingerprint is equally valuable to maintainers.',
        command: 'sudo dmesg -w | tee /tmp/issue-dmesg.log   # 复现期间持续记录\n# 若发生 reset：\nls /sys/class/devcoredump/ 2>/dev/null\nsudo cat /sys/class/devcoredump/devcd*/data > /tmp/devcoredump.txt 2>/dev/null',
        hint: 'devcoredump 读一次后会消失，先落盘再分析；日志太长时贴关键段+附完整文件，别把 5000 行直接糊进评论。',
        hintEn: 'A devcoredump vanishes after one read — save to disk first. If logs are long, quote the key section and attach the full file; never paste 5000 raw lines into a comment.',
        checkpoint: '拿到带时间戳的复现（或不可复现）证据包。',
        checkpointEn: 'You have a timestamped evidence bundle for repro (or non-repro).',
      },
      {
        order: 5,
        title: '写出维护者想看的 triage 评论',
        titleEn: 'Write the triage comment maintainers want to read',
        instruction:
          '结构固定五段：① 环境指纹（第 3 步）；② 复现结果（能/不能 + 频率 + 精确触发条件）；③ 关键证据（dmesg 关键行内嵌 + 完整日志/coredump 作附件）；④ 你做过的排除（换内核版本？关某参数后消失？——有一条写一条，没有就不写）；⑤ 下一步表态（"愿意测试候选补丁，Tested-by 随叫随到"）。全程只陈述事实，不猜根因——triage 的价值在证据质量，不在诊断勇气。',
        instructionEn:
          'Fixed five-paragraph structure: (1) environment fingerprint (step 3); (2) repro result (yes/no + frequency + exact trigger); (3) key evidence (crucial dmesg lines inline, full log/coredump attached); (4) what you ruled out (different kernel? disappears with a parameter off? — one line each, only if actually done); (5) closing offer ("happy to test candidate patches, Tested-by available"). State facts only, do not guess the root cause — triage value lies in evidence quality, not diagnostic bravado.',
        checkpoint: '评论草稿完成且五段俱全，通读一遍没有推测性语言。',
        checkpointEn: 'Comment draft complete with all five sections and zero speculative language on re-read.',
      },
      {
        order: 6,
        title: '发布评论并保持跟进',
        titleEn: 'Post the comment and stay on the thread',
        instruction:
          '发布后订阅该 issue 的通知。如果维护者/开发者回复要求补充信息或测试补丁，这是最好的结果——按 lab-7 的方式在你的树上应用候选补丁（b4 shazam <lore链接> 一条命令），测试后回帖报告结果并附 Tested-by: Your Name <email>。一条被补丁 commit message 收录的 Tested-by 是公开、永久、可搜索的贡献记录。',
        instructionEn:
          'After posting, subscribe to the issue. If a maintainer/developer replies asking for more info or a patch test, that is the best outcome — apply the candidate patch to your tree the lab-7 way (b4 shazam <lore-link> in one command), test, report back, and offer Tested-by: Your Name <email>. A Tested-by recorded in a patch commit message is a public, permanent, searchable contribution.',
        command: '# 测试候选补丁的最短路径：\nb4 shazam <lore 消息链接>   # 自动抓取并 am 到当前分支\nmake -j$(nproc) modules M=drivers/gpu/drm/amd 2>/dev/null || make -j$(nproc)\n# 按 issue 场景复测后回帖',
        checkpoint: '评论已发布，通知已订阅；如有补丁测试请求，完成往返一次。',
        checkpointEn: 'Comment posted, notifications on; if a test was requested, one full round-trip completed.',
      },
      {
        order: 7,
        title: '归档为 portfolio 产物',
        titleEn: 'Archive as a portfolio artifact',
        instruction:
          '把这次 triage 写成 analysis/issue-<编号>-triage.md（模板在本仓库 portfolio-template/）：issue 链接、你的评论链接（点评论时间戳获取 permalink）、证据摘要、结局/当前状态。简历 bullet 直接可写："Triaged drm/amd issue #NNNN on RX 7600 XT: reproduced, captured devcoredump, ruled out X; comment linked."',
        instructionEn:
          'Write the triage up as analysis/issue-<id>-triage.md (template in this repo under portfolio-template/): issue link, your comment permalink (click the comment timestamp), evidence summary, outcome/current status. The resume bullet writes itself: "Triaged drm/amd issue #NNNN on RX 7600 XT: reproduced, captured devcoredump, ruled out X; comment linked."',
        checkpoint: 'portfolio 仓库存在 analysis/issue-<编号>-triage.md，内含可点击的评论 permalink。',
        checkpointEn: 'Your portfolio repo contains analysis/issue-<id>-triage.md with a clickable comment permalink.',
      },
    ],
    expectedOutput: '一条发布在 gitlab.freedesktop.org/drm/amd 上、符合上游证据标准的 triage 评论（永久可链接），以及配套的 portfolio 分析文档；最优路径下再加一条被收录的 Tested-by。',
    expectedOutputEn: 'A triage comment on gitlab.freedesktop.org/drm/amd meeting upstream evidence standards (permanently linkable), plus the matching portfolio analysis doc; on the best path, also a recorded Tested-by.',
    tips: [
      '不猜根因是纪律：维护者需要的是可信证据，错误的诊断会消耗你唯一的第一印象',
      '"无法复现"报告与"成功复现"同样有价值——前提是环境指纹完整',
      'Tested-by 的分量来自可复核：报告里必须有内核版本 + 补丁版本 + 测试场景三要素',
      '一次只跟一个 issue，跟到有结论；三个半途而废的 triage 不如一个完整闭环',
      '评论发布前通读 issue 全部历史——重复别人已给出的信息是最常见的新手减分项',
    ],
    tipsEn: [
      'Not guessing the root cause is discipline: maintainers need trustworthy evidence, and a wrong diagnosis burns your only first impression',
      'A "cannot reproduce" report is as valuable as a successful repro — provided the environment fingerprint is complete',
      'A Tested-by carries weight because it is auditable: kernel version + patch revision + test scenario are mandatory',
      'Follow one issue at a time until it concludes; one complete loop beats three abandoned triages',
      'Read the entire issue history before posting — repeating already-given information is the most common rookie penalty',
    ],
    tags: ['issue-triage', 'gitlab', 'devcoredump', 'Tested-by', 'portfolio', 'radar'],
  },
  {
    id: 'lab-9-backport-fix',
    phaseId: 'phase-1',
    title: '实验九：把一个主线修复 backport 到 v6.12 LTS',
    titleEn: 'Lab 9: Backport a Mainline Fix to v6.12 LTS',
    description:
      'backporting 是 AMD JD 里白纸黑字的日常工作（发行版内核、企业内核、stable 树都靠它），也是把"读得懂代码"升级成"改得动代码"的最安全练习：正确答案（主线提交）就在那里，你的任务是让它在老树上活过来。本实验从主线挑一个真实的 drm/amd 修复，backport 到本站锚定的 v6.12，处理冲突、编译验证并归档。',
    descriptionEn:
      'Backporting is day-job work spelled out in AMD JDs (distro kernels, enterprise kernels and stable trees all live on it), and the safest exercise for upgrading "can read code" to "can change code": the correct answer (the mainline commit) already exists — your job is to make it live on an older tree. Pick a real drm/amd fix from mainline, backport it to this site\'s pinned v6.12, resolve conflicts, build-verify, and archive.',
    difficulty: 'advanced',
    estimatedMinutes: 150,
    prerequisites: ['已完成实验一（能编译内核/模块）', '本地有 v6.12 检出 + 可 fetch 主线', '读过 Module 11.1 的 stable 规则一节'],
    prerequisitesEn: ['Lab 1 completed (can build kernel/modules)', 'Local v6.12 checkout + ability to fetch mainline', 'Module 11.1 stable-rules section read'],
    steps: [
      {
        order: 1,
        title: '选一个合格的 backport 候选',
        titleEn: 'Pick a qualified backport candidate',
        instruction:
          '在主线 drivers/gpu/drm/amd 的近期提交里找满足以下条件的修复：① 是 bugfix 而非新功能（commit message 有 Fixes: 标签最佳）；② 补丁体量 <100 行；③ 触碰的文件在 v6.12 里存在。带 Fixes: 标签的提交自带"它修的是哪个提交引入的 bug"——用它判断 v6.12 是否真的受影响（Fixes 指向的提交在 v6.12 里存在 = 受影响 = backport 有意义）。',
        instructionEn:
          'In recent mainline drivers/gpu/drm/amd commits, find a fix that: (1) is a bugfix, not a feature (a Fixes: tag in the message is ideal); (2) is under ~100 lines; (3) touches files that exist in v6.12. A Fixes: tag tells you which commit introduced the bug — use it to check whether v6.12 is actually affected (the referenced commit being present in v6.12 = affected = the backport is meaningful).',
        command: 'cd ~/linux\ngit fetch origin master --depth=1000\ngit log --oneline --grep="Fixes:" origin/master -- drivers/gpu/drm/amd | head -20\n# 对候选逐个验证 v6.12 是否受影响：\ngit log v6.12 --oneline | grep <Fixes 指向的短哈希>',
        hint: '避开触碰 dc/（display core）巨型文件的提交——那里两个版本间漂移最大，第一次 backport 会淹死在冲突里。',
        hintEn: 'Avoid commits touching huge dc/ (display core) files — drift between versions is worst there and a first backport will drown in conflicts.',
        checkpoint: '选定候选提交，且已证明 v6.12 受该 bug 影响。',
        checkpointEn: 'Candidate chosen, with proof that v6.12 is affected by the bug.',
      },
      {
        order: 2,
        title: '尝试直接 cherry-pick 并读懂失败',
        titleEn: 'Attempt the cherry-pick and read the failure',
        instruction:
          'git cherry-pick -x <hash>（-x 会在 message 里记录源提交，stable 树的惯例）。三种结局：干净应用（直接跳第 4 步）；冲突（最有学习价值，进第 3 步）；文件不存在/结构大改（换候选）。冲突不是错误，是两个版本间历史差异的清单——git status 里每个 both modified 文件都在告诉你"这段代码在 6.12 之后被谁改过"。',
        instructionEn:
          'git cherry-pick -x <hash> (-x records the source commit in the message — stable-tree convention). Three outcomes: applies cleanly (skip to step 4); conflicts (the most instructive case — go to step 3); file missing/heavily restructured (pick another candidate). A conflict is not an error, it is an inventory of history between the two versions — every both-modified file in git status tells you "this code changed after 6.12, by someone".',
        command: 'git checkout -b backport-<hash短版> v6.12\ngit cherry-pick -x <hash>\ngit status   # 看冲突清单',
        checkpoint: 'cherry-pick 已执行，结局三选一已明确。',
        checkpointEn: 'Cherry-pick executed; which of the three outcomes occurred is clear.',
      },
      {
        order: 3,
        title: '用 blame/log 考古解决冲突',
        titleEn: 'Resolve conflicts with blame/log archaeology',
        instruction:
          '解决冲突的正道不是"把 <<<< 标记删得能编译"，而是回答：主线这段上下文是被哪个提交改掉的？那个提交在不在我的目标树？用 git log v6.12..origin/master -- <文件> 列出两版本间该文件的全部变更，找到造成漂移的提交，判断：只需语境适配（函数改名/参数变化）→ 手工调整；依赖另一个前置提交 → 把前置也 backport（记录依赖链）；语义已根本变化 → 此路不通，换候选并记录原因。',
        instructionEn:
          'Proper conflict resolution is not "delete the <<<< markers until it compiles" but answering: which commit changed this context on mainline, and is that commit in my target tree? Use git log v6.12..origin/master -- <file> to list every change to the file between the versions, find the drift-causing commit, then decide: context-only adaptation (renamed function/changed parameter) → adjust by hand; depends on a prerequisite commit → backport that too (record the dependency chain); semantics fundamentally changed → dead end, switch candidates and write down why.',
        command: 'git log --oneline v6.12..origin/master -- <冲突文件> | head -20\ngit blame -L <冲突行范围> origin/master -- <冲突文件>\n# 解决后：\ngit add <文件> && git cherry-pick --continue',
        hint: '在冲突处犹豫时，打开主线版本的完整函数对照着看——上下文比冲突块本身信息量大得多。',
        hintEn: 'When stuck on a hunk, open the full mainline version of the function side by side — the context carries far more information than the conflict block itself.',
        checkpoint: '冲突全部按"考古→判断→适配"流程解决，每处冲突能说出漂移原因。',
        checkpointEn: 'All conflicts resolved via archaeology → judgment → adaptation, and you can name the drift cause for each.',
      },
      {
        order: 4,
        title: '编译验证 + 语义自检',
        titleEn: 'Build-verify + semantic self-check',
        instruction:
          '编译通过只是底线。语义自检清单：① 补丁里每个被调用的函数在 v6.12 中签名一致吗（主线可能已改参数）？② 补丁依赖的字段/宏在 v6.12 的头文件里存在吗？③ 如果原修复配了测试场景（commit message 通常写触发条件），在你的环境里按场景验证。差异适配处在 commit message 的 --- 下方逐条注明——这是 stable backport 的标准礼仪。',
        instructionEn:
          'Compiling is only the floor. Semantic checklist: (1) does every function the patch calls have the same signature in v6.12 (mainline may have changed parameters)? (2) do the fields/macros the patch relies on exist in v6.12 headers? (3) if the original fix documents a trigger scenario in its message, verify it in your environment. Note every adaptation below the --- line in your commit message — standard stable-backport etiquette.',
        command: 'make -j$(nproc) M=drivers/gpu/drm/amd modules\n# 或全量: make -j$(nproc)\nscripts/checkpatch.pl --git HEAD -q',
        checkpoint: '模块编译零警告；语义清单三项逐一打勾；适配说明已写进 message。',
        checkpointEn: 'Module builds with zero warnings; all three semantic checks ticked; adaptation notes written into the message.',
      },
      {
        order: 5,
        title: '归档：backport 报告',
        titleEn: 'Archive: the backport report',
        instruction:
          '写 analysis/backport-<hash短版>.md（模板在 portfolio-template/）：原提交链接与摘要、为什么 v6.12 受影响（Fixes 链推理）、冲突清单与每处的漂移考古结论、适配差异、验证方式。这份文档直接对应 AMD JD 里的 "backporting" 关键词——面试被问到时，你有真实案例可讲。进阶（可选）：真实的 stable 提交流程是给 stable@vger.kernel.org 发请求，读一遍 Documentation/process/stable-kernel-rules.rst 了解正规入口。',
        instructionEn:
          'Write analysis/backport-<shorthash>.md (template in portfolio-template/): original commit link and summary, why v6.12 is affected (the Fixes-chain reasoning), the conflict inventory with the drift archaeology for each, adaptation diffs, and how you verified. This document maps directly onto the "backporting" keyword in AMD JDs — when asked in an interview, you have a real case to walk through. Advanced (optional): the real stable submission path goes through stable@vger.kernel.org — read Documentation/process/stable-kernel-rules.rst for the official entrance.',
        checkpoint: 'portfolio 仓库存在完整的 backport 报告，含依赖链与冲突考古记录。',
        checkpointEn: 'Your portfolio repo contains the full backport report with dependency chain and conflict archaeology.',
      },
    ],
    expectedOutput: '一个在 v6.12 上编译通过、语义验证过的真实 backport 提交（带 -x 溯源与适配说明），以及讲得出每处冲突来龙去脉的分析报告——JD 高频词 "backporting" 的实证材料。',
    expectedOutputEn: 'A real backport commit that builds and semantically verifies on v6.12 (with -x provenance and adaptation notes), plus an analysis report that can explain the story of every conflict — hard evidence for the high-frequency JD keyword "backporting".',
    tips: [
      '选题决定成败：第一次做选 <50 行、带 Fixes: 标签、不碰 dc/ 的提交',
      '每一处冲突都要能回答"是哪个提交造成的漂移"——答不上来就还没解完',
      '依赖链超过 2 个前置提交时果断换候选：backport 雪球是真实工作里放弃的正当理由',
      'cherry-pick -x 与 --- 下的适配说明是 stable 礼仪，写进肌肉记忆',
      '这个练习可以反复做——每月挑一个新修复，就是持续的 changelog 阅读训练',
    ],
    tipsEn: [
      'Candidate choice decides the outcome: first time, pick <50 lines, with a Fixes: tag, not touching dc/',
      'For every conflict you must be able to answer "which commit caused this drift" — if you cannot, you are not done resolving it',
      'If the dependency chain exceeds ~2 prerequisite commits, switch candidates: the backport snowball is a legitimate reason to stop in real work too',
      'cherry-pick -x and adaptation notes below the --- line are stable etiquette — make them muscle memory',
      'This exercise repeats well — one new fix per month doubles as ongoing changelog-reading training',
    ],
    tags: ['backport', 'cherry-pick', 'stable', 'conflict-resolution', 'portfolio', 'LTS'],
  },
];

export function getLabs(locale: Locale) {
  return labs.map((l) => ({
    ...l,
    title: locale === 'en' ? l.titleEn : l.title,
    description: locale === 'en' ? l.descriptionEn : l.description,
    prerequisites: locale === 'en' ? l.prerequisitesEn : l.prerequisites,
    expectedOutput: locale === 'en' ? l.expectedOutputEn : l.expectedOutput,
    tips: locale === 'en' ? l.tipsEn : l.tips,
    steps: l.steps.map((s) => ({
      ...s,
      title: locale === 'en' ? s.titleEn : s.title,
      instruction: locale === 'en' ? s.instructionEn : s.instruction,
      hint: locale === 'en' ? s.hintEn ?? s.hint : s.hint,
      checkpoint: locale === 'en' ? s.checkpointEn ?? s.checkpoint : s.checkpoint,
    })),
  }));
}

export function getLabById(id: string, locale: Locale) {
  return getLabs(locale).find((l) => l.id === id);
}

export function getLabsByPhase(phaseId: string, locale: Locale) {
  return getLabs(locale).filter((l) => l.phaseId === phaseId);
}
