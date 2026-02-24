/* ============================================================
   AMD Linux Driver Learning Platform - Environment Setup Guide
   A practical, copy-paste guide to get from zero to a working
   amdgpu kernel dev environment in ~30 minutes.
   ============================================================ */

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useSearchHighlight } from "@/lib/highlight";
import { useLocale } from "@/contexts/LocaleContext";
import { useSwitchLocale } from "@/lib/useSwitchLocale";
import {
  ArrowLeft, ArrowRight, Copy, Check, ChevronRight, Sun, Moon,
  Terminal, Monitor, HardDrive, Cpu, Download, Settings, Languages,
  Laptop
} from "lucide-react";

function CopyBlock({ code, title, lang = "bash" }: { code: string; title?: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  return (
    <div className="rounded-xl overflow-hidden border border-border/50 my-4">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/50">
          <span className="text-xs font-semibold text-foreground/70">{title}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground/50">{lang}</span>
            <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-foreground transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t("setup.copied") : t("setup.copy")}
            </button>
          </div>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed bg-card">
        <code className="text-foreground/85 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function Section({ icon: Icon, title, children, id }: { icon: typeof Terminal; title: string; children: React.ReactNode; id: string }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="space-y-4 text-sm text-muted-foreground/85 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function SetupGuide() {
  const { theme, toggleTheme } = useTheme();
  const { locale } = useLocale();
  const { switchLocale } = useSwitchLocale();
  const contentRef = useRef<HTMLDivElement>(null);
  useSearchHighlight(contentRef);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 border-b border-border/50 backdrop-blur-md bg-background/95">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <Link href="/"><span className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> {t("setup.home")}</span></Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80 font-medium">{t("setup.title")}</span>
          </div>
          <button onClick={switchLocale} className="flex items-center gap-1 px-2 py-1 rounded text-xs border border-border/50 hover:border-border transition-colors" title={locale === "zh" ? "Switch to English" : "切换到中文"}>
            <Languages className="w-3.5 h-3.5" />
            {locale === "zh" ? "En" : "中"}
          </button>
          <button onClick={toggleTheme} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Toggle theme">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div ref={contentRef} className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3">{t("setup.pageTitle")}</h1>
          <p className="text-muted-foreground/80 max-w-2xl leading-relaxed">
            {t("setup.pageSubtitle")}
          </p>
          <div className="flex flex-wrap gap-2 mt-4 text-xs">
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">~30 min</span>
            <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Ubuntu 22.04+</span>
            <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Fedora 39+</span>
            <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">Arch Linux</span>
          </div>
        </div>

        {/* Workflow Choice */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <a href="#prereqs" className="group rounded-xl border border-border/50 p-5 bg-card/50 hover:bg-muted/50 transition-colors block">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Laptop className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                  {locale === 'zh' ? '单机开发环境 (基础)' : 'Single-Machine Setup (Basic)'}
                </h3>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 group-hover:-rotate-45 transition-all" />
            </div>
            <p className="text-xs text-muted-foreground/85 leading-relaxed">
              {locale === 'zh'
                ? '在同一台电脑上编写代码、编译内核并使用 virtme-ng 测试。适合初学者或仅进行非显示层修改时使用。'
                : 'Write code, build the kernel, and test with virtme-ng on the same PC. Good for beginners or non-display changes.'}
            </p>
          </a>

          <a href="#dual-machine" className="group rounded-xl border border-border/50 p-5 bg-card/50 hover:bg-muted/50 hover:border-primary/50 transition-colors block relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-bl-lg">
              {locale === 'zh' ? '推荐' : 'Recommended'}
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {locale === 'zh' ? '双机开发流程 (进阶)' : 'Dual-Machine Setup (Advanced)'}
                </h3>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-rotate-45 transition-all" />
            </div>
            <p className="text-xs text-muted-foreground/85 leading-relaxed">
              {locale === 'zh'
                ? '使用一台机器（如 MacBook）编写代码，通过 SSH 远端连接到带 AMD GPU 的测试机进行编译和真实硬件测试。安全且高效。'
                : 'Write code on a laptop (e.g. MacBook), SSH into a dedicated AMD GPU test machine to build and test. Safe and highly productive.'}
            </p>
          </a>
        </div>

        {/* Table of Contents */}
        <nav className="rounded-xl border border-border/50 p-5 mb-12 bg-card/50">
          <h3 className="text-sm font-bold text-foreground mb-3">{t("setup.quickNav")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: "prereqs", labelKey: "setup.prereqs" },
              { id: "kernel-src", labelKey: "setup.kernelSrc" },
              { id: "build", labelKey: "setup.build" },
              { id: "navigation", labelKey: "setup.navigation" },
              { id: "test-env", labelKey: "setup.testEnv" },
              { id: "gpu-tools", labelKey: "setup.gpuTools" },
              { id: "verify", labelKey: "setup.verify" },
              { id: "workflow", labelKey: "setup.workflow" },
              { id: "dual-machine", labelKey: "setup.dualMachine" },
            ].map(item => (
              <a key={item.id} href={`#${item.id}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded hover:bg-muted/50">
                {t(item.labelKey)}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-16">

          {/* 1. Prerequisites */}
          <Section icon={Download} title={t("setup.prereqs")} id="prereqs">
            <p>Install the kernel build toolchain. Pick your distro:</p>

            <CopyBlock title="Ubuntu / Debian" code={`# Kernel build essentials
sudo apt update && sudo apt install -y \\
    build-essential gcc clang llvm lld \\
    flex bison bc libelf-dev libssl-dev libncurses-dev \\
    git cscope universal-ctags \\
    python3 python3-pip \\
    dwarves zstd \\
    sparse coccinelle

# amdgpu-specific development deps
sudo apt install -y \\
    libdrm-dev libkmod-dev libprocps-dev \\
    libudev-dev libcairo2-dev libpixman-1-dev \\
    libjson-c-dev meson ninja-build cmake

# GPU monitoring & debug tools
sudo apt install -y \\
    mesa-utils vulkan-tools trace-cmd \\
    linux-tools-common linux-tools-$(uname -r)

# virtme-ng for fast kernel testing (no reboot needed)
pip3 install --user virtme-ng`} />

            <CopyBlock title="Fedora" code={`sudo dnf groupinstall -y "Development Tools" "C Development Tools and Libraries"
sudo dnf install -y \\
    gcc clang llvm lld flex bison bc elfutils-libelf-devel \\
    openssl-devel ncurses-devel git cscope ctags \\
    dwarves zstd sparse python3-pip \\
    libdrm-devel meson ninja-build cmake \\
    mesa-demos vulkan-tools trace-cmd perf

pip3 install --user virtme-ng`} />

            <CopyBlock title="Arch Linux" code={`sudo pacman -S --needed \\
    base-devel gcc clang llvm lld flex bison bc libelf \\
    openssl ncurses git cscope ctags \\
    python python-pip sparse coccinelle \\
    libdrm meson ninja cmake \\
    mesa-utils vulkan-tools trace-cmd perf

pip install --user virtme-ng`} />

            <div className="rounded-xl p-4 border border-yellow-500/30 bg-yellow-500/5">
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">Important: GPU firmware</p>
              <p className="text-xs text-muted-foreground/80">
                If you're running a very new GPU (RDNA4 / gfx12), you may need the latest firmware.
                Install <code className="text-primary">linux-firmware</code> from git if your distro's package is old:
              </p>
              <CopyBlock code={`# Only if your GPU firmware is missing
git clone --depth=1 https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git
cd linux-firmware && sudo make install`} />
            </div>
          </Section>

          {/* 2. Kernel Source */}
          <Section icon={HardDrive} title={t("setup.kernelSrc")} id="kernel-src">
            <p>Two options depending on your goal:</p>

            <CopyBlock title="Option A: AMD's drm-next branch (recommended for amdgpu work)" code={`# Contains patches not yet in Linus' tree — closest to AMD's current development
git clone \\
    https://gitlab.freedesktop.org/agd5f/linux.git \\
    --branch amd-staging-drm-next \\
    --depth 100 \\
    ~/kernel-dev

cd ~/kernel-dev
echo "Repo size: $(du -sh .git | cut -f1)"
# Should be ~500MB with depth=100`} />

            <CopyBlock title="Option B: Linus' mainline (for upstream patch submission)" code={`git clone \\
    https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git \\
    --depth 100 \\
    ~/kernel-dev

cd ~/kernel-dev`} />

            <p>
              <strong>Which to choose?</strong> Use Option A for learning and amdgpu development.
              Use Option B when you're ready to submit patches upstream. You can add both as remotes:
            </p>
            <CopyBlock code={`cd ~/kernel-dev
git remote add linus https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git
git remote add amd https://gitlab.freedesktop.org/agd5f/linux.git
git fetch amd amd-staging-drm-next`} />
          </Section>

          {/* 3. Configure & Build */}
          <Section icon={Settings} title={t("setup.build")} id="build">
            <p>
              The first build takes 10-30 minutes. After that, incremental builds of just the amdgpu
              module take &lt;60 seconds.
            </p>

            <CopyBlock title="Initial kernel configuration" code={`cd ~/kernel-dev

# Start from your running kernel's config (knows your hardware)
cp /boot/config-$(uname -r) .config 2>/dev/null || make defconfig

# Enable amdgpu with all features
scripts/config --enable CONFIG_DRM_AMDGPU
scripts/config --enable CONFIG_DRM_AMDGPU_SI      # GCN 1.0 support
scripts/config --enable CONFIG_DRM_AMDGPU_CIK     # GCN 2.0 support
scripts/config --enable CONFIG_HSA_AMD             # KFD / ROCm support
scripts/config --enable CONFIG_DRM_AMDGPU_USERPTR  # userptr BO support

# Enable debug features (critical for development)
scripts/config --enable CONFIG_DRM_AMDGPU_GART_DEBUGFS
scripts/config --enable CONFIG_DEBUG_FS
scripts/config --enable CONFIG_FTRACE
scripts/config --enable CONFIG_FUNCTION_TRACER
scripts/config --enable CONFIG_DEBUG_INFO_DWARF5
scripts/config --enable CONFIG_GDB_SCRIPTS
scripts/config --enable CONFIG_KASAN               # memory error detector
scripts/config --enable CONFIG_DEBUG_KMEMLEAK       # memory leak detector

# Accept all defaults for new options
make olddefconfig`} />

            <CopyBlock title="Build (first time: full kernel)" code={`# Full build — uses all CPU cores
make -j$(nproc)

# This takes 10-30 min depending on your CPU
# Output: vmlinux, arch/x86/boot/bzImage, and all .ko modules`} />

            <CopyBlock title="Build (daily: just amdgpu module)" code={`# After modifying amdgpu code, rebuild only the module — ~30-60 seconds
make M=drivers/gpu/drm/amd -j$(nproc)

# Verify the module was built
ls -lh drivers/gpu/drm/amd/amdgpu/amdgpu.ko
# Should show ~40-80MB .ko file`} />

            <div className="rounded-xl p-4 border border-primary/30 bg-primary/5">
              <p className="text-xs font-semibold text-primary mb-1">Pro tip: ccache</p>
              <p className="text-xs text-muted-foreground/80">
                Install <code>ccache</code> to cache compilation results. Rebuilds after <code>git pull</code> drop
                from 10 min to ~2 min: <code>sudo apt install ccache && export CC="ccache gcc"</code>
              </p>
            </div>
          </Section>

          {/* 4. Code Navigation */}
          <Section icon={Monitor} title={t("setup.navigation")} id="navigation">
            <p>You <em>will</em> get lost in 4M+ lines of code without proper navigation. Set up at least one:</p>

            <CopyBlock title="Option A: cscope + ctags (Vim/Emacs — fast, lightweight)" code={`cd ~/kernel-dev

# Generate databases (takes ~2 min)
make cscope tags

# Vim usage:
#   :cs find g amdgpu_device_init   → jump to definition
#   :cs find c amdgpu_bo_create     → find all callers
#   :cs find s CHIP_NAVI33          → find all references
#   Ctrl+] on a symbol              → jump to definition (ctags)
#   Ctrl+t                          → jump back`} />

            <CopyBlock title="Option B: clangd + VS Code (modern IDE, best autocomplete)" code={`cd ~/kernel-dev

# Generate compile_commands.json for clangd
python3 scripts/clang-tools/gen_compile_commands.py

# In VS Code: install "clangd" extension (NOT the default C/C++ extension)
# Open ~/kernel-dev as workspace
# clangd will index the project — takes ~5 min first time
# After that: F12 = go to definition, Shift+F12 = find references`} />

            <CopyBlock title="Option C: Elixir cross-reference (no setup, browser-based)" code={`# For quick lookups without local setup:
# https://elixir.bootlin.com/linux/latest/source/drivers/gpu/drm/amd/
#
# Supports: symbol search, file browsing, git blame
# Limitation: always shows mainline HEAD, not AMD's drm-next`} />
          </Section>

          {/* 5. Safe Testing */}
          <Section icon={Cpu} title={t("setup.testEnv")} id="test-env">
            <p>
              <strong>Never test kernel changes by rebooting your main machine.</strong> A bug in amdgpu can
              hard-lock your system. Use <code>virtme-ng</code> to boot your modified kernel in a lightweight VM
              that shares your host filesystem — no disk images needed, boots in seconds.
            </p>

            <CopyBlock title="Quick test: boot your kernel in a VM" code={`cd ~/kernel-dev

# Boot current kernel tree in a VM (no GPU passthrough)
# Good for: module loading tests, printk verification, KUnit tests
vng --build --run

# Inside the VM:
#   modprobe amdgpu         # test module loading
#   dmesg | grep amdgpu     # check init messages
#   exit                    # shut down VM

# Boot with specific kernel command line
vng --build --run -- "drm.debug=0x1f amdgpu.dpm=0"`} />

            <CopyBlock title="For display/GPU testing: use a real spare machine or GPU passthrough" code={`# virtme-ng can't test display output or real GPU interaction.
# For that you need one of:
#
# 1. A spare test machine with AMD GPU (best option)
#    - Install your kernel: sudo make modules_install && sudo make install
#    - Reboot into new kernel from GRUB
#
# 2. GPU passthrough with QEMU/KVM (advanced)
#    - Requires IOMMU support (AMD-Vi / Intel VT-d)
#    - Pass your GPU to a VM with vfio-pci
#    - See: https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF
#
# 3. For amdgpu module-only changes (no display):
#    sudo rmmod amdgpu && sudo insmod ./drivers/gpu/drm/amd/amdgpu/amdgpu.ko
#    # WARNING: this will kill your display momentarily`} />

            <div className="rounded-xl p-4 border border-red-500/30 bg-red-500/5">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">DANGER: MMIO writes</p>
              <p className="text-xs text-muted-foreground/80">
                Writing to the wrong GPU register via WREG32/RREG32 can <strong>instantly hard-lock your entire system</strong> —
                no Ctrl+C, no SSH, only a power cycle recovers. This is not a compiler error or a kernel oops — it's
                a hardware-level hang. <strong>Never write to MMIO registers without consulting the hardware spec</strong> (which
                AMD provides under NDA to employees, and partially via GPUOpen documentation for ISA).
                Always test MMIO changes in a VM or spare machine first.
              </p>
            </div>
          </Section>

          {/* 6. GPU Tools */}
          <Section icon={Terminal} title={t("setup.gpuTools")} id="gpu-tools">
            <CopyBlock title="Install umr (AMD GPU register debugger)" code={`# umr reads GPU registers, decodes ring buffers, dumps wave state
git clone https://gitlab.freedesktop.org/tomstdenis/umr.git
cd umr
mkdir build && cd build
cmake .. && make -j$(nproc)
sudo make install

# Test it:
sudo umr -O bits,named -r *.gfx1*.GRBM_STATUS
# Shows the current state of GFX engine with named bit fields`} />

            <CopyBlock title="Install IGT GPU test suite" code={`git clone https://gitlab.freedesktop.org/drm/igt-gpu-tools.git
cd igt-gpu-tools
meson setup build
ninja -C build

# Run a quick amdgpu sanity test (needs root + real GPU)
sudo ./build/tests/amdgpu/amd_basic --run-subtest cs-gfx`} />

            <CopyBlock title="Essential sysfs / debugfs paths for AMD GPUs" code={`# GPU identity
cat /sys/class/drm/card*/device/vendor          # 0x1002 = AMD
cat /sys/class/drm/card*/device/device          # Device ID (e.g. 0x7480)

# GPU status & monitoring
cat /sys/class/drm/card*/device/pp_dpm_sclk     # Core clock levels (* = current)
cat /sys/class/drm/card*/device/pp_dpm_mclk     # Memory clock levels
cat /sys/class/drm/card*/device/mem_info_vram_used  # VRAM usage in bytes
cat /sys/class/drm/card*/device/gpu_busy_percent    # GPU utilization %

# Temperature & power (hwmon path varies)
cat /sys/class/drm/card*/device/hwmon/hwmon*/temp1_input  # milli-degrees C
cat /sys/class/drm/card*/device/hwmon/hwmon*/power1_average  # micro-watts

# Debug (requires debugfs mounted)
sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info
sudo cat /sys/kernel/debug/dri/0/amdgpu_gpu_recover  # trigger manual GPU reset
sudo cat /sys/kernel/debug/dri/0/amdgpu_sa_info`} />
          </Section>

          {/* 7. Verify */}
          <Section icon={Check} title={t("setup.verify")} id="verify">
            <CopyBlock title="Run this checklist" code={`echo "=== Verification Checklist ==="

echo -n "1. Kernel source: "
test -f ~/kernel-dev/Makefile && echo "OK" || echo "MISSING"

echo -n "2. amdgpu module builds: "
test -f ~/kernel-dev/drivers/gpu/drm/amd/amdgpu/amdgpu.ko && echo "OK" || echo "NOT BUILT (run make M=drivers/gpu/drm/amd)"

echo -n "3. cscope database: "
test -f ~/kernel-dev/cscope.out && echo "OK" || echo "MISSING (run make cscope)"

echo -n "4. GPU detected: "
lspci | grep -qi "AMD.*VGA\|AMD.*Display\|AMD.*3D" && echo "OK" || echo "NO AMD GPU FOUND"

echo -n "5. amdgpu driver loaded: "
lsmod | grep -q amdgpu && echo "OK" || echo "NOT LOADED"

echo -n "6. virtme-ng installed: "
command -v vng &>/dev/null && echo "OK" || echo "MISSING (pip3 install virtme-ng)"

echo -n "7. umr installed: "
command -v umr &>/dev/null && echo "OK" || echo "MISSING (build from source)"

echo ""
echo "=== Your GPU ==="
lspci -nn | grep -i "VGA\|3D\|Display"
echo ""
echo "=== Driver Info ==="
modinfo amdgpu 2>/dev/null | head -5`} />
          </Section>

          {/* 8. Daily Workflow */}
          <Section icon={Settings} title={t("setup.workflow")} id="workflow">
            <CopyBlock title="The loop you'll use every day" code={`cd ~/kernel-dev

# 1. Create a branch for your change
git checkout -b fix/my-description

# 2. Edit code
vim drivers/gpu/drm/amd/amdgpu/amdgpu_device.c  # or use VS Code

# 3. Build just the module (30-60 seconds)
make M=drivers/gpu/drm/amd -j$(nproc)

# 4. Quick test in virtme-ng (non-display changes)
vng --build --run

# 5. Test on real hardware (display changes or full validation)
sudo rmmod amdgpu && sudo insmod drivers/gpu/drm/amd/amdgpu/amdgpu.ko
dmesg | tail -20

# 6. Run relevant IGT tests
sudo ./igt-gpu-tools/build/tests/amdgpu/amd_basic

# 7. Check code style
scripts/checkpatch.pl --strict -g HEAD

# 8. Commit with proper message format
git commit -s  # -s adds Signed-off-by

# 9. Generate patch for submission
git format-patch HEAD~1 -o /tmp/patches/

# 10. Send via b4 (modern) or git send-email (classic)
# b4 send /tmp/patches/0001-*.patch           # modern way
# git send-email --to=amd-gfx@lists.freedesktop.org /tmp/patches/0001-*.patch`} />

            <div className="rounded-xl p-5 border border-border/50 bg-card/50">
              <p className="text-sm font-semibold text-foreground mb-2">What's next?</p>
              <p className="text-xs text-muted-foreground/80 mb-3">
                Your environment is ready. Start with Module 0's deep dive lessons to understand the GPU driver
                landscape, then follow the learning path. Each module has hands-on labs that use the environment
                you just set up.
              </p>
              <Link href="/module/intro">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #E8441A, #FF6B35)' }}>
                  Start Module 0: Introduction →
                </button>
              </Link>
            </div>
          </Section>

          {/* 9. Dual-Machine Setup */}
          <Section icon={Laptop} title={t("setup.dualMachine")} id="dual-machine">
            <p>
              Kernel development on the same machine you rely on daily is risky — a bad MMIO write or a broken
              display driver can hard-lock the system. The safest, most productive workflow uses <strong>two
                machines</strong>: a dedicated <strong>test machine</strong> (Ubuntu desktop with your AMD GPU) and
              a separate <strong>dev machine</strong> (laptop / MacBook) for writing code.
            </p>

            <div className="rounded-xl p-5 border border-border/50 bg-card/50 my-6">
              <p className="text-sm font-bold text-foreground mb-3">Architecture Overview</p>
              <div className="grid sm:grid-cols-2 gap-4 text-xs text-muted-foreground/85">
                <div className="rounded-lg border border-border/50 p-4 bg-background/50">
                  <p className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center text-primary font-bold text-[10px]">A</span>
                    Dev Machine (MacBook / Laptop)
                  </p>
                  <ul className="space-y-1 list-disc pl-4">
                    <li>Code editing (VS Code + clangd)</li>
                    <li>Git operations & patch generation</li>
                    <li>Documentation & research</li>
                    <li>SSH into the test machine</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-border/50 p-4 bg-background/50">
                  <p className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-red-500/15 flex items-center justify-center text-red-500 font-bold text-[10px]">B</span>
                    Test Machine (Ubuntu + AMD GPU)
                  </p>
                  <ul className="space-y-1 list-disc pl-4">
                    <li>Kernel compilation (uses all cores)</li>
                    <li>Module loading & GPU testing</li>
                    <li>virtme-ng for safe quick tests</li>
                    <li>Dual-boot: stable kernel + dev kernel</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="font-semibold text-foreground">Step 1: Network setup — SSH access</p>
            <p>
              You need reliable SSH access from your dev machine to the test machine.
              This is your lifeline — even if the GPU driver crashes the display, SSH stays alive.
            </p>

            <CopyBlock title="Test machine: enable SSH" code={`# Install and start SSH server
sudo apt install -y openssh-server
sudo systemctl enable --now ssh

# Find the test machine's IP address
ip addr show | grep "inet " | grep -v 127.0.0.1
# Example output: inet 192.168.1.100/24 ...

# Optional: set a static IP so it never changes
# Edit /etc/netplan/01-network.yaml or use nmcli
sudo nmcli connection modify "Wired connection 1" \\
    ipv4.method manual \\
    ipv4.addresses 192.168.1.100/24 \\
    ipv4.gateway 192.168.1.1 \\
    ipv4.dns "8.8.8.8,1.1.1.1"
sudo nmcli connection up "Wired connection 1"`} />

            <CopyBlock title="Dev machine (MacBook): set up SSH key login" code={`# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "dev-machine"

# Copy key to the test machine (replace IP)
ssh-copy-id user@192.168.1.100

# Add to ~/.ssh/config for convenience
cat >> ~/.ssh/config << 'EOF'
Host gpu-dev
    HostName 192.168.1.100
    User your-username
    ForwardAgent yes
    ServerAliveInterval 30
    ServerAliveCountMax 5
EOF

# Now you can just type:
ssh gpu-dev`} />

            <p className="font-semibold text-foreground">Step 2: Sync code between machines</p>
            <p>
              Two approaches — pick one depending on your network:
            </p>

            <CopyBlock title="Option A: VS Code Remote SSH (recommended — seamless editing)" code={`# On your MacBook, install VS Code "Remote - SSH" extension
# Then: Cmd+Shift+P → "Remote-SSH: Connect to Host" → gpu-dev
#
# This opens VS Code as if you were sitting at the test machine:
# - clangd autocomplete works on the kernel source
# - Terminal runs on the test machine
# - File edits happen on the test machine directly
# - No sync needed — you edit the actual files`} />

            <CopyBlock title="Option B: Git-based sync (works over slow connections)" code={`# On test machine: set up a bare repo for pushing
git init --bare ~/kernel-dev.git

# On dev machine: add test machine as a remote
cd ~/kernel-dev
git remote add test gpu-dev:kernel-dev.git

# Workflow:
# 1. Edit & commit on dev machine
# 2. Push to test machine
git push test HEAD:dev-branch

# 3. On test machine: checkout and build
cd ~/kernel-dev && git fetch origin && git checkout dev-branch
make M=drivers/gpu/drm/amd -j\$(nproc)`} />

            <p className="font-semibold text-foreground">Step 3: Dual-kernel boot for crash recovery</p>
            <p>
              Install two kernels on the test machine — a <strong>stable kernel</strong> (your distro's default)
              and a <strong>dev kernel</strong> (your custom build). If the dev kernel crashes, just reboot and
              pick the stable one from GRUB.
            </p>

            <CopyBlock title="Install your custom kernel alongside the stable one" code={`cd ~/kernel-dev

# Tag your dev kernel so it's easy to identify in GRUB
scripts/config --set-str CONFIG_LOCALVERSION "-amdgpu-dev"

# Build & install
make -j$(nproc)
sudo make modules_install
sudo make install

# Update GRUB to show both kernels at boot
sudo update-grub

# Verify both kernels are listed
grep menuentry /boot/grub/grub.cfg | head -10
# You should see your distro kernel AND the -amdgpu-dev kernel`} />

            <CopyBlock title="Set GRUB to show menu (so you can pick which kernel to boot)" code={`# Edit GRUB config to always show menu
sudo sed -i 's/GRUB_TIMEOUT_STYLE=hidden/GRUB_TIMEOUT_STYLE=menu/' /etc/default/grub
sudo sed -i 's/GRUB_TIMEOUT=0/GRUB_TIMEOUT=5/' /etc/default/grub
sudo update-grub

# Now on reboot:
#   - Select your stable kernel if dev kernel is broken
#   - Select -amdgpu-dev kernel for testing
#   - You can also select kernel via SSH before reboot:
sudo grub-reboot "Advanced options for Ubuntu>Ubuntu, with Linux x.y.z-amdgpu-dev"`} />

            <div className="rounded-xl p-4 border border-green-500/30 bg-green-500/5">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Windows is safe</p>
              <p className="text-xs text-muted-foreground/80">
                If your test machine dual-boots Windows, kernel development on the Linux side does <strong>not
                  affect Windows at all</strong>. The Windows partition and bootloader are untouched. Even if you
                completely break the Linux dev kernel, you can still boot into Windows normally, or boot the stable
                Linux kernel from GRUB.
              </p>
            </div>

            <p className="font-semibold text-foreground mt-6">Step 4: The daily workflow</p>

            <CopyBlock title="Complete dual-machine development cycle" code={`# === On Dev Machine (MacBook) ===

# Connect to test machine
ssh gpu-dev
# or: open VS Code Remote SSH → gpu-dev

# === On Test Machine (via SSH) ===

# 1. Edit code (if using VS Code Remote, just edit in the IDE)
cd ~/kernel-dev
vim drivers/gpu/drm/amd/amdgpu/amdgpu_device.c

# 2. Quick test with virtme-ng (safe, no reboot)
make M=drivers/gpu/drm/amd -j$(nproc) && vng --build --run

# 3. For GPU/display testing (requires reboot into dev kernel)
make -j$(nproc) && sudo make modules_install && sudo make install
sudo reboot  # select -amdgpu-dev from GRUB

# 4. After reboot, reconnect from MacBook
ssh gpu-dev
dmesg | grep amdgpu    # check driver loaded correctly
sudo umr -O bits -r *.gfx1*.GRBM_STATUS  # verify GPU state

# 5. If the dev kernel crashes / hangs:
#    → Power cycle the test machine
#    → Select STABLE kernel from GRUB
#    → SSH in again and fix the code
#    → Rebuild and try again`} />

            <div className="rounded-xl p-4 border border-primary/30 bg-primary/5">
              <p className="text-xs font-semibold text-primary mb-1">Pro tip: tmux for persistence</p>
              <p className="text-xs text-muted-foreground/80">
                Run <code>tmux</code> on the test machine so your terminal sessions survive SSH
                disconnects. If the SSH connection drops (e.g. during a long build), just reconnect
                and <code>tmux attach</code> — your build is still running.
              </p>
            </div>

            <p className="font-semibold text-foreground mt-6">Step 5: Remote GPU debugging over SSH</p>

            <CopyBlock title="Monitor and debug GPU remotely" code={`# Watch GPU status in real-time
watch -n1 "cat /sys/class/drm/card*/device/gpu_busy_percent && \\
           cat /sys/class/drm/card*/device/mem_info_vram_used && \\
           cat /sys/class/drm/card*/device/hwmon/hwmon*/temp1_input"

# Tail kernel messages for amdgpu
sudo dmesg -wH | grep --line-buffered amdgpu

# Read debug registers remotely
sudo umr -O bits,named -r *.gfx1*.GRBM_STATUS

# Run IGT tests
sudo ./igt-gpu-tools/build/tests/amdgpu/amd_basic

# Trace GPU activity with ftrace
sudo trace-cmd record -e amdgpu -e drm
sudo trace-cmd report | head -50

# Trigger a manual GPU reset (useful for testing recovery paths)
sudo cat /sys/kernel/debug/dri/0/amdgpu_gpu_recover`} />

          </Section>

        </div>
      </div>
    </div>
  );
}
