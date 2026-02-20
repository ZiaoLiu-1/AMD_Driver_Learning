/* ============================================================
   AMD Linux Driver Learning Platform - Environment Setup Guide
   A practical, copy-paste guide to get from zero to a working
   amdgpu kernel dev environment in ~30 minutes.
   ============================================================ */

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useSearchHighlight } from "@/lib/highlight";
import { useLocale } from "@/contexts/LocaleContext";
import {
  ArrowLeft, Copy, Check, ChevronRight, Sun, Moon,
  Terminal, Monitor, HardDrive, Cpu, Download, Settings, Languages
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
  const { locale, setLocale } = useLocale();
  const contentRef = useRef<HTMLDivElement>(null);
  useSearchHighlight(contentRef);
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  const switchLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    setLocale(newLocale);
    const path = window.location.pathname;
    const newPath = path.replace(/^\/(zh|en)/, `/${newLocale}`) || `/${newLocale}`;
    navigate(newPath);
  };

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

        </div>
      </div>
    </div>
  );
}
