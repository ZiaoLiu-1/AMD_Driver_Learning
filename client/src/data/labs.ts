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
        instruction: '安装内核编译所需的工具链和库。',
        instructionEn: 'Install the toolchain and libraries needed for kernel compilation.',
        command:
          '# Ubuntu/Debian\nsudo apt install build-essential libncurses-dev bison flex libssl-dev libelf-dev\n\n# Fedora\nsudo dnf install gcc make ncurses-devel bison flex elfutils-libelf-devel openssl-devel',
        checkpoint: '运行 gcc --version 确认 GCC 可用。',
        checkpointEn: 'Run gcc --version to confirm GCC is available.',
      },
      {
        order: 3,
        title: '配置内核',
        titleEn: 'Configure the kernel',
        instruction:
          '使用当前运行内核的配置作为基础，然后确保 amdgpu 模块被启用。这避免了从零配置的复杂性。',
        instructionEn:
          'Use the running kernel config as a base, then ensure the amdgpu module is enabled. This avoids the complexity of configuring from scratch.',
        command:
          'cp /boot/config-$(uname -r) .config\nmake olddefconfig\n\n# 确认 amdgpu 已启用\ngrep CONFIG_DRM_AMDGPU .config\n# 应该看到 CONFIG_DRM_AMDGPU=m',
        checkpoint: 'grep 输出显示 CONFIG_DRM_AMDGPU=m（作为模块编译）。',
        checkpointEn: 'grep output shows CONFIG_DRM_AMDGPU=m (compiled as module).',
      },
      {
        order: 4,
        title: '编译内核',
        titleEn: 'Build the kernel',
        instruction:
          '使用 -j 参数并行编译加速。$(nproc) 自动获取 CPU 核心数。首次编译可能需要 30-60 分钟。',
        instructionEn:
          'Use -j flag for parallel compilation. $(nproc) auto-detects CPU cores. First build may take 30-60 minutes.',
        command: 'make -j$(nproc) 2>&1 | tail -5',
        hint: '如果编译报错，通常是缺少依赖包。仔细阅读错误信息中提到的头文件名称。',
        hintEn: 'If compilation fails, it is usually a missing dependency. Read the error message for the missing header name.',
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
        command: 'pip install virtme-ng\nvng --build\n# 或者手动指定内核\nvng -k arch/x86/boot/bzImage',
        checkpoint: '虚拟机成功启动，运行 uname -r 显示你编译的内核版本。',
        checkpointEn: 'VM boots successfully, uname -r shows your compiled kernel version.',
      },
    ],
    expectedOutput: '能在 virtme-ng 虚拟机中启动自定义编译的内核，并确认 amdgpu 模块可用。',
    expectedOutputEn: 'Boot a custom-compiled kernel in virtme-ng VM with amdgpu module available.',
    tips: [
      '使用 ccache 可以显著加速重复编译',
      '只修改 amdgpu 模块时，可以只编译模块：make M=drivers/gpu/drm/amd/',
      '保存 .config 文件以便后续复用',
    ],
    tipsEn: [
      'Use ccache to significantly speed up repeated compilations',
      'When only modifying amdgpu, build just the module: make M=drivers/gpu/drm/amd/',
      'Save the .config file for reuse',
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
        instruction: '启用 amdgpu 调试日志和 devcoredump 功能。',
        instructionEn: 'Enable amdgpu debug logging and devcoredump.',
        command:
          'echo 0xf > /sys/module/amdgpu/parameters/debug_mask\necho 1 > /sys/module/drm/parameters/debug',
        checkpoint: 'dmesg | grep amdgpu 开始显示详细的调试信息。',
        checkpointEn: 'dmesg | grep amdgpu starts showing detailed debug info.',
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
          '# 安装 IGT\ngit clone https://gitlab.freedesktop.org/drm/igt-gpu-tools.git\ncd igt-gpu-tools && meson build && ninja -C build\n\n# 触发 hang\nsudo ./build/tests/amdgpu/amd_deadlock --run-subtest hang-ring-gfx',
        hint: '如果没有 IGT，可以使用 amdgpu_test 或写一个无限循环的 compute shader。',
        hintEn: 'If IGT is not available, use amdgpu_test or write an infinite loop compute shader.',
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
          '通过 debug_mask 参数开启特定子系统的调试日志。不同的 bit 控制不同 IP Block 的日志输出。',
        instructionEn:
          'Enable debug logging for specific subsystems via debug_mask. Different bits control logging for different IP Blocks.',
        command:
          '# 启用所有调试日志（谨慎：日志量非常大）\necho 0xffffffff | sudo tee /sys/module/amdgpu/parameters/debug_mask\n\n# 只启用 VM（虚拟内存）调试日志\necho 0x4 | sudo tee /sys/module/amdgpu/parameters/debug_mask\n\n# 观察日志\nsudo dmesg -w | grep amdgpu',
        hint: 'debug_mask 各 bit 的含义可在 amdgpu.h 中的 AMDGPU_DEBUG_* 宏查到。',
        hintEn: 'Bit meanings of debug_mask are in AMDGPU_DEBUG_* macros in amdgpu.h.',
        checkpoint: 'dmesg 中开始出现对应子系统的详细调试信息。',
        checkpointEn: 'dmesg shows detailed debug info from the corresponding subsystem.',
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
