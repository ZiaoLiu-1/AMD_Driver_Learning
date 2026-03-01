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
  Laptop, Layers, Wrench, Mail
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
          <div className="flex items-center gap-2">
            <button onClick={switchLocale} className="flex items-center justify-center gap-1 w-14 py-1.5 rounded text-xs border border-border/50 hover:border-border transition-colors" title={locale === "zh" ? "Switch to English" : "切换到中文"}>
              <Languages className="w-3.5 h-3.5" />
              {locale === "zh" ? "En" : "中"}
            </button>
            <button onClick={toggleTheme} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Toggle theme">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
              { id: "rocm-hip", labelKey: "setup.rocmHip" },
              { id: "llvm-amdgpu", labelKey: "setup.llvmAmdgpu" },
              { id: "patch-tools", labelKey: "setup.patchTools" },
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
    libdw-dev \\
    git cscope universal-ctags \\
    python3 python3-pip pipx \\
    dwarves zstd \\
    sparse coccinelle \\
    gawk  # required for CONFIG_BUILTIN_MODULE_RANGES (enabled in Ubuntu's config)

# amdgpu-specific development deps
# Note: libprocps-dev was renamed to libproc2-dev in Ubuntu 24.04
sudo apt install -y \\
    libdrm-dev libkmod-dev libproc2-dev \\
    libudev-dev libcairo2-dev libpixman-1-dev \\
    libjson-c-dev meson ninja-build cmake

# GPU monitoring & debug tools
sudo apt install -y \\
    mesa-utils vulkan-tools trace-cmd \\
    linux-tools-common linux-tools-$(uname -r)

# virtme-ng for fast kernel testing (no reboot needed)
# pipx is required on Ubuntu 22.04+ (PEP 668 blocks pip3 --user)
pipx install virtme-ng
pipx ensurepath  # adds ~/.local/bin to PATH; open a new shell after this`} />

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

            <div className="rounded-xl p-4 border border-orange-500/40 bg-orange-500/5 my-4">
              <p className="text-xs font-semibold text-orange-500 dark:text-orange-400 mb-2">
                ⚠️ Ubuntu/Debian 用户必读：两个常见坑 (Two Common Pitfalls)
              </p>
              <p className="text-xs text-muted-foreground/80 mb-3">
                When you copy <code>/boot/config-$(uname -r)</code> on Ubuntu/Debian, you inherit two issues
                from Canonical's build environment that will cause hard failures:
              </p>
              <p className="text-xs font-semibold text-foreground/70 mb-1">Pitfall 1 — Missing Canonical signing certificates</p>
              <p className="text-xs text-muted-foreground/80 mb-2">
                Ubuntu's config sets <code>CONFIG_SYSTEM_TRUSTED_KEYS="debian/canonical-certs.pem"</code>,
                a file that only exists inside Canonical's private build infra. You'll see:<br />
                <code className="text-red-400 text-[11px]">No rule to make target 'debian/canonical-certs.pem'</code>
              </p>
              <p className="text-xs font-semibold text-foreground/70 mb-1">Pitfall 2 — Missing <code>gawk</code></p>
              <p className="text-xs text-muted-foreground/80 mb-3">
                Ubuntu's config enables <code>CONFIG_BUILTIN_MODULE_RANGES</code>, which requires GNU AWK
                (gawk). It is listed as optional in the kernel docs but becomes mandatory with Ubuntu's config.
                You'll see: <code className="text-red-400 text-[11px]">gawk: not found</code>
              </p>
              <p className="text-xs font-semibold text-foreground/70 mb-1">Fix both issues after copying the config:</p>
              <CopyBlock code={`# Fix Pitfall 1: clear Canonical's private cert paths
scripts/config --set-str SYSTEM_TRUSTED_KEYS ""
scripts/config --set-str SYSTEM_REVOCATION_KEYS ""
scripts/config --set-str MODULE_SIG_KEY ""

# Fix Pitfall 2: install gawk if not already done
sudo apt install -y gawk

# Then regenerate the final config
make olddefconfig`} />
              <p className="text-xs text-muted-foreground/60 mt-2">
                <strong>Alternative (cleanest approach):</strong> use <code>make localmodconfig</code> instead of copying
                the distro config. It generates a minimal config from currently-loaded modules with no distro-specific
                paths — no cert issues, faster builds, but you must load all needed modules first.
                See comparison below.
              </p>
            </div>

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

            {/* Approach comparison */}
            <div className="rounded-xl border border-border/50 overflow-hidden mt-6">
              <div className="px-4 py-2 bg-muted/50 border-b border-border/50">
                <p className="text-xs font-semibold text-foreground/80">
                  Config strategy comparison — our approach vs. official kernel.org recommendation
                </p>
              </div>
              <div className="divide-y divide-border/30">
                <div className="grid grid-cols-3 gap-0 text-xs">
                  <div className="px-4 py-2 font-semibold text-muted-foreground/60 bg-muted/20">Strategy</div>
                  <div className="px-4 py-2 font-semibold text-green-600 dark:text-green-400 bg-muted/20">Pros</div>
                  <div className="px-4 py-2 font-semibold text-red-500 bg-muted/20">Cons</div>
                </div>
                <div className="grid grid-cols-3 gap-0 text-xs">
                  <div className="px-4 py-3 text-foreground/80 font-medium">
                    <code>cp /boot/config-$(uname -r)</code><br />
                    <span className="text-muted-foreground/50 font-normal">(our guide's approach)</span>
                  </div>
                  <div className="px-4 py-3 text-muted-foreground/80">
                    Guaranteed hardware compatibility; all your hardware works out of the box
                  </div>
                  <div className="px-4 py-3 text-muted-foreground/80">
                    Inherits distro-specific cert paths (Pitfall 1) and optional tools like gawk (Pitfall 2).
                    Long compile times. Requires manual cert fixes.
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-0 text-xs">
                  <div className="px-4 py-3 text-foreground/80 font-medium">
                    <code>make localmodconfig</code><br />
                    <span className="text-muted-foreground/50 font-normal">(official recommendation)</span>
                  </div>
                  <div className="px-4 py-3 text-muted-foreground/80">
                    Clean config, no cert issues, minimal modules = much faster builds (~5–10 min vs 30 min)
                  </div>
                  <div className="px-4 py-3 text-muted-foreground/80">
                    Only includes currently-loaded modules. You must <code>modprobe</code> everything you need
                    before running, or you'll miss modules.
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-0 text-xs">
                  <div className="px-4 py-3 text-foreground/80 font-medium">
                    <code>make defconfig</code><br />
                    <span className="text-muted-foreground/50 font-normal">(generic defaults)</span>
                  </div>
                  <div className="px-4 py-3 text-muted-foreground/80">
                    Clean, portable, no cert issues. Good for CI or cross-compiling.
                  </div>
                  <div className="px-4 py-3 text-muted-foreground/80">
                    May miss hardware-specific drivers. amdgpu may not be enabled by default.
                    Requires manual <code>scripts/config --enable</code> calls.
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-muted/20 border-t border-border/30">
                <p className="text-xs text-muted-foreground/60">
                  <strong>Verdict:</strong> For AMD driver development, our guide's approach (copy distro config + fix certs)
                  gives best hardware coverage. For faster iteration, switch to <code>make localmodconfig</code>
                  once you have a working baseline.
                </p>
              </div>
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
command -v vng &>/dev/null && echo "OK" || echo "MISSING (pipx install virtme-ng)"

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
            <p className="text-sm text-muted-foreground/90 leading-relaxed mb-6">
              {locale === 'zh'
                ? <>在主力机上进行内核开发风险极高——错误的 MMIO 写入或崩溃的显示驱动会直接导致系统死机。最安全、最高效的工作流是使用<strong>双机环境</strong>：一台专用的<strong>测试机</strong>（带 AMD GPU 的 Ubuntu 桌面）用于运行内核，以及一台独立的<strong>开发机</strong>（笔记本 / MacBook）用于编写代码。</>
                : <>Kernel development on the same machine you rely on daily is risky — a bad MMIO write or a broken display driver can hard-lock the system. The safest, most productive workflow uses <strong>two machines</strong>: a dedicated <strong>test machine</strong> (Ubuntu desktop with your AMD GPU) and a separate <strong>dev machine</strong> (laptop / MacBook) for writing code.</>}
            </p>

            <div className="rounded-xl p-5 border border-border/50 bg-card/50 my-6">
              <p className="text-sm font-bold text-foreground mb-3">{locale === 'zh' ? '架构总览' : 'Architecture Overview'}</p>
              <div className="grid sm:grid-cols-2 gap-4 text-xs text-muted-foreground/85">
                <div className="rounded-lg border border-border/50 p-4 bg-background/50">
                  <p className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center text-primary font-bold text-[10px]">A</span>
                    {locale === 'zh' ? '开发机 (MacBook / 笔记本)' : 'Dev Machine (MacBook / Laptop)'}
                  </p>
                  <ul className="space-y-1 list-disc pl-4">
                    {locale === 'zh' ? (
                      <>
                        <li>编写代码 (VS Code + clangd)</li>
                        <li>Git 操作与补丁生成</li>
                        <li>阅读文档与查阅资料</li>
                        <li>通过 SSH 连接测试机</li>
                      </>
                    ) : (
                      <>
                        <li>Code editing (VS Code + clangd)</li>
                        <li>Git operations & patch generation</li>
                        <li>Documentation & research</li>
                        <li>SSH into the test machine</li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="rounded-lg border border-border/50 p-4 bg-background/50">
                  <p className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-red-500/15 flex items-center justify-center text-red-500 font-bold text-[10px]">B</span>
                    {locale === 'zh' ? '测试机 (Ubuntu + AMD GPU)' : 'Test Machine (Ubuntu + AMD GPU)'}
                  </p>
                  <ul className="space-y-1 list-disc pl-4">
                    {locale === 'zh' ? (
                      <>
                        <li>编译内核 (利用多核优势)</li>
                        <li>加载模块与测试 GPU</li>
                        <li>使用 virtme-ng 进行安全自测</li>
                        <li>双系统/双内核：稳定版内核 + 开发版内核</li>
                      </>
                    ) : (
                      <>
                        <li>Kernel compilation (uses all cores)</li>
                        <li>Module loading & GPU testing</li>
                        <li>virtme-ng for safe quick tests</li>
                        <li>Dual-boot: stable kernel + dev kernel</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <p className="font-semibold text-foreground mt-8">{locale === 'zh' ? '第 1 步：网络配置 — SSH 访问' : 'Step 1: Network setup — SSH access'}</p>
            <p className="mb-4">
              {locale === 'zh'
                ? '你需要确保从开发机能稳定地通过 SSH 访问测试机。这是你的救命稻草——即使 GPU 驱动让显示器黑屏，SSH 通常依然存活。'
                : 'You need reliable SSH access from your dev machine to the test machine. This is your lifeline — even if the GPU driver crashes the display, SSH stays alive.'}
            </p>

            <CopyBlock title={locale === 'zh' ? '测试机：启用 SSH' : 'Test machine: enable SSH'} code={`# Install and start SSH server
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

            <CopyBlock title={locale === 'zh' ? '开发机 (MacBook)：配置 SSH 密钥登录' : 'Dev machine (MacBook): set up SSH key login'} code={`# Generate SSH key (if you don't have one)
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

            <p className="font-semibold text-foreground mt-8">{locale === 'zh' ? '第 2 步：在两台机器间同步代码' : 'Step 2: Sync code between machines'}</p>
            <p className="mb-4">
              {locale === 'zh' ? '两种方案——根据你的网络情况选择一种：' : 'Two approaches — pick one depending on your network:'}
            </p>

            <CopyBlock title={locale === 'zh' ? '选项 A：VS Code Remote SSH (推荐——无缝编辑)' : 'Option A: VS Code Remote SSH (recommended — seamless editing)'} code={`# On your MacBook, install VS Code "Remote - SSH" extension
# Then: Cmd+Shift+P → "Remote-SSH: Connect to Host" → gpu-dev
#
# This opens VS Code as if you were sitting at the test machine:
# - clangd autocomplete works on the kernel source
# - Terminal runs on the test machine
# - File edits happen on the test machine directly
# - No sync needed — you edit the actual files`} />

            <CopyBlock title={locale === 'zh' ? '选项 B：基于 Git 的同步 (适合弱网环境)' : 'Option B: Git-based sync (works over slow connections)'} code={`# On test machine: set up a bare repo for pushing
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

            <p className="font-semibold text-foreground mt-8">{locale === 'zh' ? '第 3 步：双内核启动以应对崩溃恢复' : 'Step 3: Dual-kernel boot for crash recovery'}</p>
            <p className="mb-4">
              {locale === 'zh'
                ? <>在测试机上准备两个内核——一个<strong>稳定版内核</strong>（系统自带）和一个<strong>开发版内核</strong>（你编译的）。如果开发版内核崩溃了，只需重启并在 GRUB 中选择稳定版即可恢复控制。</>
                : <>Install two kernels on the test machine — a <strong>stable kernel</strong> (your distro's default) and a <strong>dev kernel</strong> (your custom build). If the dev kernel crashes, just reboot and pick the stable one from GRUB.</>}
            </p>

            <CopyBlock title={locale === 'zh' ? '将你编译的自定义内核与稳定版内核一并安装' : 'Install your custom kernel alongside the stable one'} code={`cd ~/kernel-dev

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

            <CopyBlock title={locale === 'zh' ? '设置 GRUB 显示菜单（以便选择启动的内核）' : 'Set GRUB to show menu (so you can pick which kernel to boot)'} code={`# Edit GRUB config to always show menu
sudo sed -i 's/GRUB_TIMEOUT_STYLE=hidden/GRUB_TIMEOUT_STYLE=menu/' /etc/default/grub
sudo sed -i 's/GRUB_TIMEOUT=0/GRUB_TIMEOUT=5/' /etc/default/grub
sudo update-grub

# Now on reboot:
#   - Select your stable kernel if dev kernel is broken
#   - Select -amdgpu-dev kernel for testing
#   - You can also select kernel via SSH before reboot:
sudo grub-reboot "Advanced options for Ubuntu>Ubuntu, with Linux x.y.z-amdgpu-dev"`} />

            <div className="rounded-xl p-4 border border-green-500/30 bg-green-500/5 my-6">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">{locale === 'zh' ? '✅ Windows 系统完全安全' : '✅ Windows is safe'}</p>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                {locale === 'zh'
                  ? <>如果你的测试机是双系统，Linux 侧的内核开发<strong>完全不会影响 Windows</strong>。Windows 的分区和引导程序不会被触碰。即使 Linux 开发版内核彻底挂掉，你依然能直接重启进入 Windows，或通过 GRUB 启动稳定版 Linux 内核。</>
                  : <>If your test machine dual-boots Windows, kernel development on the Linux side does <strong>not affect Windows at all</strong>. The Windows partition and bootloader are untouched. Even if you completely break the Linux dev kernel, you can still boot into Windows normally, or boot the stable Linux kernel from GRUB.</>}
              </p>
            </div>

            <p className="font-semibold text-foreground mt-8">{locale === 'zh' ? '第 4 步：日常开发工作流' : 'Step 4: The daily workflow'}</p>

            <CopyBlock title={locale === 'zh' ? '完整的双机开发循环' : 'Complete dual-machine development cycle'} code={`# === On Dev Machine (MacBook) ===

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

            <div className="rounded-xl p-4 border border-primary/30 bg-primary/5 my-6">
              <p className="text-xs font-semibold text-primary mb-1">{locale === 'zh' ? '💡 进阶技巧：使用 tmux 保持后台运行' : 'Pro tip: tmux for persistence'}</p>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                {locale === 'zh'
                  ? <>在测试机上运行 <code>tmux</code>，可以让你的终端会话在 SSH 断开后依然存活。如果网络断开（比如在漫长的编译过程中），只需重连并输入 <code>tmux attach</code> ——你的编译任务仍在后台稳稳运行。</>
                  : <>Run <code>tmux</code> on the test machine so your terminal sessions survive SSH disconnects. If the SSH connection drops (e.g. during a long build), just reconnect and <code>tmux attach</code> — your build is still running.</>}
              </p>
            </div>

            <p className="font-semibold text-foreground mt-8">{locale === 'zh' ? '第 5 步：通过 SSH 进行远程 GPU 调试' : 'Step 5: Remote GPU debugging over SSH'}</p>

            <CopyBlock title={locale === 'zh' ? '实时监控与远程调试 GPU' : 'Monitor and debug GPU remotely'} code={`# Watch GPU status in real-time
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

          {/* 10. ROCm / HIP Toolchain */}
          <Section icon={Layers} title={t("setup.rocmHip")} id="rocm-hip">
            <p>
              {locale === 'zh'
                ? <>ROCm 是 AMD 官方的 GPU 计算平台，包含 HIP 编译器、运行时和性能分析工具。<strong>Module 7（ROCm 内核接口）和 Module 8（ROCm 计算）</strong>需要此环境。以下步骤摘自 <a href="https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/quick-start.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ROCm 官方 Quick Start Guide</a>。</>
                : <>ROCm is AMD's official GPU compute platform, including the HIP compiler, runtime, and profiling tools. Required for <strong>Module 7 (ROCm Kernel Interface) and Module 8 (ROCm Compute)</strong>. Steps below are from the <a href="https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/quick-start.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">official ROCm Quick Start Guide</a>.</>}
            </p>

            <div className="rounded-xl p-4 border border-yellow-500/30 bg-yellow-500/5 my-4">
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
                {locale === 'zh' ? '前置条件' : 'Prerequisites'}
              </p>
              <p className="text-xs text-muted-foreground/80">
                {locale === 'zh'
                  ? <>安装前请确认：(1) 你的 AMD GPU 在 ROCm 支持列表中（RDNA / CDNA 系列）；(2) 内核版本符合要求。详见 <a href="https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ROCm 系统要求</a>。ROCm 不支持集成显卡——如有 AMD APU，请在 BIOS 中禁用 IGP。</>
                  : <>Before installing, verify: (1) your AMD GPU is on the ROCm support list (RDNA / CDNA families); (2) your kernel version is compatible. See <a href="https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ROCm System Requirements</a>. ROCm does not support integrated graphics — disable AMD IGP in BIOS if present.</>}
              </p>
            </div>

            <CopyBlock title="Ubuntu 24.04" code={`# Official ROCm Quick Start (https://rocm.docs.amd.com)
wget https://repo.radeon.com/amdgpu-install/7.2/ubuntu/noble/amdgpu-install_7.2.70200-1_all.deb
sudo apt install ./amdgpu-install_7.2.70200-1_all.deb
sudo apt update
sudo apt install python3-setuptools python3-wheel
sudo usermod -a -G render,video $LOGNAME
sudo apt install rocm`} />

            <CopyBlock title="Ubuntu 22.04" code={`wget https://repo.radeon.com/amdgpu-install/7.2/ubuntu/jammy/amdgpu-install_7.2.70200-1_all.deb
sudo apt install ./amdgpu-install_7.2.70200-1_all.deb
sudo apt update
sudo apt install python3-setuptools python3-wheel
sudo usermod -a -G render,video $LOGNAME
sudo apt install rocm`} />

            <CopyBlock title="RHEL 9.x / Rocky Linux" code={`# Replace 9.6 with your RHEL version (9.4, 9.6, 9.7, etc.)
sudo dnf install \\
    https://repo.radeon.com/amdgpu-install/7.2/rhel/9.6/amdgpu-install-7.2.70200-1.el9.noarch.rpm
sudo dnf clean all
wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm
sudo rpm -ivh epel-release-latest-9.noarch.rpm
sudo dnf config-manager --enable codeready-builder-for-rhel-9-x86_64-rpms
sudo dnf install python3-setuptools python3-wheel
sudo usermod -a -G render,video $LOGNAME
sudo dnf install rocm`} />

            <CopyBlock title={locale === 'zh' ? 'Arch Linux（社区维护）' : 'Arch Linux (community-maintained)'} code={`# Arch ROCm packages are community-maintained, not official AMD releases
# https://wiki.archlinux.org/title/GPGPU#ROCm
sudo pacman -S rocm-hip-sdk rocm-opencl-sdk rocm-smi-lib`} />

            <p className="font-semibold text-foreground mt-6">
              {locale === 'zh' ? '安装后验证' : 'Post-installation verification'}
            </p>

            <CopyBlock title={locale === 'zh' ? '验证 ROCm 安装' : 'Verify ROCm installation'} code={`# Reboot first (required after kernel driver installation)
sudo reboot

# After reboot — verify GPU is detected
rocminfo | head -30
# Should list your AMD GPU agent(s)

# Check GPU status
rocm-smi
# Should display GPU temperature, utilization, VRAM usage

# Verify HIP compiler
hipcc --version
# Should show HIP version and clang compiler info

# Run a quick HIP test
cat > /tmp/hip_test.cpp << 'HIPEOF'
#include <hip/hip_runtime.h>
#include <stdio.h>
int main() {
    int count = 0;
    hipGetDeviceCount(&count);
    printf("HIP devices found: %d\\n", count);
    for (int i = 0; i < count; i++) {
        hipDeviceProp_t props;
        hipGetDeviceProperties(&props, i);
        printf("  [%d] %s (gfx%d)\\n", i, props.name, props.gcnArch);
    }
    return 0;
}
HIPEOF
hipcc /tmp/hip_test.cpp -o /tmp/hip_test && /tmp/hip_test`} />

            <div className="rounded-xl p-4 border border-primary/30 bg-primary/5">
              <p className="text-xs font-semibold text-primary mb-1">
                {locale === 'zh' ? 'ROCm 开发相关工具' : 'ROCm developer tools'}
              </p>
              <p className="text-xs text-muted-foreground/80">
                {locale === 'zh'
                  ? <>安装 ROCm 后你还可以使用：<code>rocprof</code>（GPU 性能分析）、<code>roctracer</code>（API 追踪）、<code>amdgpu_top</code>（实时 GPU 监控，需额外安装：<code>cargo install amdgpu_top</code>）。版本号会随 ROCm 更新变化，请以 <a href="https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/quick-start.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">官方文档</a> 为准。</>
                  : <>After ROCm is installed, you also get: <code>rocprof</code> (GPU profiling), <code>roctracer</code> (API tracing), <code>amdgpu_top</code> (real-time GPU monitor, install separately: <code>cargo install amdgpu_top</code>). Version numbers change with each ROCm release — always check the <a href="https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/quick-start.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">official docs</a> for the latest.</>}
              </p>
            </div>
          </Section>

          {/* 11. LLVM AMDGPU Backend (Build from Source) */}
          <Section icon={Wrench} title={t("setup.llvmAmdgpu")} id="llvm-amdgpu">
            <p>
              {locale === 'zh'
                ? <><strong>Module 9（LLVM 工具链）</strong>需要从源码编译 LLVM 并启用 AMDGPU 后端，以便使用 <code>llc</code>、<code>llvm-mc</code>、<code>llvm-objdump</code> 等工具分析 AMDGPU ISA。以下步骤摘自 <a href="https://llvm.org/docs/CMake.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LLVM 官方 CMake 文档</a> 和 <a href="https://llvm.org/docs/GettingStarted.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Getting Started</a> 指南。</>
                : <>Required for <strong>Module 9 (LLVM Toolchain)</strong> — build LLVM with the AMDGPU backend to use <code>llc</code>, <code>llvm-mc</code>, <code>llvm-objdump</code> and other tools for AMDGPU ISA analysis. Steps below are from the <a href="https://llvm.org/docs/CMake.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">official LLVM CMake documentation</a> and the <a href="https://llvm.org/docs/GettingStarted.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Getting Started</a> guide.</>}
            </p>

            <CopyBlock title={locale === 'zh' ? '安装编译依赖' : 'Install build dependencies'} code={`# Ubuntu / Debian
sudo apt install -y cmake ninja-build python3 python3-pip \\
    gcc g++ zlib1g-dev libncurses-dev

# Fedora
sudo dnf install -y cmake ninja-build python3 gcc g++ \\
    zlib-devel ncurses-devel

# Arch
sudo pacman -S --needed cmake ninja python gcc zlib ncurses`} />

            <CopyBlock title={locale === 'zh' ? '获取 LLVM 源码' : 'Get LLVM source'} code={`# Clone the monorepo (official method since LLVM 15+)
# https://llvm.org/docs/GettingStarted.html#getting-the-source-code-and-building-llvm
git clone --depth=1 https://github.com/llvm/llvm-project.git ~/llvm-project
cd ~/llvm-project`} />

            <CopyBlock title={locale === 'zh' ? '配置与编译（含 AMDGPU 后端）' : 'Configure & build (with AMDGPU backend)'} code={`cd ~/llvm-project
mkdir build && cd build

# CMake configuration — AMDGPU + X86 targets, with clang and lld
# https://llvm.org/docs/CMake.html#quick-start
cmake -G Ninja ../llvm \\
    -DCMAKE_BUILD_TYPE=Release \\
    -DLLVM_ENABLE_PROJECTS="clang;lld" \\
    -DLLVM_TARGETS_TO_BUILD="AMDGPU;X86" \\
    -DCMAKE_INSTALL_PREFIX=$HOME/llvm-amdgpu \\
    -DLLVM_PARALLEL_LINK_JOBS=2

# Build (takes 15-40 min depending on CPU cores)
ninja

# Install to ~/llvm-amdgpu
ninja install`} />

            <CopyBlock title={locale === 'zh' ? '添加到 PATH 并验证' : 'Add to PATH and verify'} code={`# Add to your shell RC file (~/.bashrc or ~/.zshrc)
echo 'export PATH="$HOME/llvm-amdgpu/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify AMDGPU backend is enabled
llc --version | grep AMDGPU
# Should output: AMDGPU  - AMD GCN GPUs

# List all supported AMDGPU processors
llc -march=amdgcn -mcpu=help 2>&1 | head -20
# Should list gfx900, gfx1010, gfx1100, etc.

# Test: compile a simple IR to AMDGPU assembly
echo 'define amdgpu_kernel void @hello() { ret void }' > /tmp/test.ll
llc -march=amdgcn -mcpu=gfx1100 /tmp/test.ll -o -
# Should output GFX11 assembly instructions`} />

            <div className="rounded-xl p-4 border border-primary/30 bg-primary/5">
              <p className="text-xs font-semibold text-primary mb-1">
                {locale === 'zh' ? '关于 LLVM_TARGETS_TO_BUILD' : 'About LLVM_TARGETS_TO_BUILD'}
              </p>
              <p className="text-xs text-muted-foreground/80">
                {locale === 'zh'
                  ? <>只编译 <code>AMDGPU;X86</code> 两个 target 可以大幅缩短编译时间和减小二进制体积。如果你需要所有 target，可改为 <code>-DLLVM_TARGETS_TO_BUILD=all</code>（但编译会慢很多）。<code>LLVM_PARALLEL_LINK_JOBS=2</code> 限制并行链接数，防止内存不足——每个链接器进程可能消耗 10GB+ RAM。</>
                  : <>Building only <code>AMDGPU;X86</code> targets significantly reduces build time and binary size. Use <code>-DLLVM_TARGETS_TO_BUILD=all</code> if you need every target (much slower). <code>LLVM_PARALLEL_LINK_JOBS=2</code> limits parallel link jobs to prevent OOM — each linker process can use 10GB+ RAM.</>}
              </p>
            </div>
          </Section>

          {/* 12. Patch Submission Tools (b4 & git send-email) */}
          <Section icon={Mail} title={t("setup.patchTools")} id="patch-tools">
            <p>
              {locale === 'zh'
                ? <>Linux 内核开发使用邮件列表提交补丁，而非 GitHub Pull Request。<strong>Module 11（Career Path）</strong>和日常工作流都需要 <code>b4</code> 和 <code>git send-email</code>。</>
                : <>Linux kernel development uses mailing lists for patch submission, not GitHub Pull Requests. Required for <strong>Module 11 (Career Path)</strong> and the daily kernel development workflow.</>}
            </p>

            <p className="font-semibold text-foreground mt-6">
              {locale === 'zh' ? '安装 b4' : 'Install b4'}
            </p>
            <p>
              {locale === 'zh'
                ? <><code>b4</code> 是内核社区官方推荐的补丁管理工具，用于准备、跟踪和发送补丁系列。以下步骤摘自 <a href="https://b4.docs.kernel.org/en/latest/installing.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">b4 官方安装文档</a>。</>
                : <><code>b4</code> is the official kernel community tool for preparing, tracking, and sending patch series. Steps below are from the <a href="https://b4.docs.kernel.org/en/latest/installing.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">official b4 installation docs</a>.</>}
            </p>

            <CopyBlock title={locale === 'zh' ? 'b4 — 通过包管理器安装' : 'b4 — Install via package manager'} code={`# Ubuntu / Debian
sudo apt install b4

# Fedora
sudo dnf install b4

# Arch
sudo pacman -S b4`} />

            <CopyBlock title={locale === 'zh' ? 'b4 — 通过 pipx 安装（获取最新版本）' : 'b4 — Install via pipx (latest version)'} code={`# Recommended if your distro's b4 package is outdated
# https://b4.docs.kernel.org/en/latest/installing.html
# Note: pip3 --user is blocked on Ubuntu 22.04+ (PEP 668); use pipx instead
pipx install b4

# Verify
b4 --version

# Upgrade later with:
pipx upgrade b4`} />

            <p className="font-semibold text-foreground mt-6">
              {locale === 'zh' ? '安装 git send-email' : 'Install git send-email'}
            </p>
            <p>
              {locale === 'zh'
                ? <><code>git send-email</code> 是 Git 官方子命令，用于通过 SMTP 发送补丁邮件。大多数发行版需要单独安装。参考 <a href="https://git-scm.com/docs/git-send-email" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">git-send-email 官方文档</a>。</>
                : <><code>git send-email</code> is an official Git subcommand for sending patches via SMTP. Most distros require a separate package. See <a href="https://git-scm.com/docs/git-send-email" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">official git-send-email docs</a>.</>}
            </p>

            <CopyBlock title={locale === 'zh' ? '安装 git-email 包' : 'Install git-email package'} code={`# Ubuntu / Debian
sudo apt install git-email

# Fedora
sudo dnf install git-email

# Arch (included in the git package)
# Already available if git is installed`} />

            <CopyBlock title={locale === 'zh' ? '配置 SMTP（以 Gmail 为例）' : 'Configure SMTP (Gmail example)'} code={`# Configure git send-email SMTP settings
# https://git-scm.com/docs/git-send-email#_use_gmail_as_the_smtp_server
git config --global sendemail.smtpserver smtp.gmail.com
git config --global sendemail.smtpserverport 587
git config --global sendemail.smtpencryption tls
git config --global sendemail.smtpuser your-email@gmail.com
git config --global sendemail.from "Your Name <your-email@gmail.com>"

# For Gmail: generate an App Password
# 1. Go to https://myaccount.google.com/security
# 2. Enable 2-Step Verification (if not already)
# 3. Go to App passwords → select "Mail" → Generate
# 4. Use the 16-character password when git send-email prompts

# For other providers, adjust smtpserver / port / encryption accordingly`} />

            <p className="font-semibold text-foreground mt-6">
              {locale === 'zh' ? '典型的补丁提交流程' : 'Typical patch submission workflow'}
            </p>

            <CopyBlock title={locale === 'zh' ? '使用 b4 准备和发送补丁' : 'Prepare and send patches with b4'} code={`cd ~/kernel-dev

# 1. Start a new patch series
# https://b4.docs.kernel.org/en/latest/contributor/send.html
b4 prep -n fix/amdgpu-my-description -f v6.x

# 2. Edit the cover letter
b4 prep --edit-cover

# 3. Make your changes and commit (with Signed-off-by)
git commit -s

# 4. Check code style before sending
scripts/checkpatch.pl --strict -g HEAD

# 5. Send to the mailing list
b4 send
# b4 will use git send-email under the hood

# Alternative: use git send-email directly
git format-patch HEAD~1 -o /tmp/patches/
git send-email \\
    --to=amd-gfx@lists.freedesktop.org \\
    --cc=linux-kernel@vger.kernel.org \\
    /tmp/patches/0001-*.patch`} />

            <CopyBlock title={locale === 'zh' ? '验证工具安装' : 'Verify tool installation'} code={`echo "=== Patch Submission Tools ==="

echo -n "b4: "
command -v b4 &>/dev/null && echo "OK ($(b4 --version 2>&1 | head -1))" || echo "MISSING"

echo -n "git send-email: "
git send-email --help &>/dev/null && echo "OK" || echo "MISSING (install git-email)"

echo -n "checkpatch.pl: "
test -f ~/kernel-dev/scripts/checkpatch.pl && echo "OK" || echo "MISSING (need kernel source)"

echo -n "perl (for checkpatch): "
command -v perl &>/dev/null && echo "OK ($(perl -v | grep version | head -1))" || echo "MISSING"`} />

            <div className="rounded-xl p-4 border border-primary/30 bg-primary/5">
              <p className="text-xs font-semibold text-primary mb-1">
                {locale === 'zh' ? '发送前的最佳实践' : 'Best practices before sending'}
              </p>
              <p className="text-xs text-muted-foreground/80">
                {locale === 'zh'
                  ? <>(1) 始终运行 <code>scripts/checkpatch.pl</code> 检查代码风格；(2) 提交信息必须包含 <code>Signed-off-by</code>（使用 <code>git commit -s</code>）；(3) 先发送到自己的邮箱做测试：<code>git send-email --to=yourself@example.com</code>；(4) 对于 amdgpu 补丁，抄送 <code>amd-gfx@lists.freedesktop.org</code> 和 <code>scripts/get_maintainer.pl</code> 输出的维护者。</>
                  : <>(1) Always run <code>scripts/checkpatch.pl</code> to check code style; (2) Commits must include <code>Signed-off-by</code> (use <code>git commit -s</code>); (3) Test by sending to yourself first: <code>git send-email --to=yourself@example.com</code>; (4) For amdgpu patches, CC <code>amd-gfx@lists.freedesktop.org</code> and the maintainers listed by <code>scripts/get_maintainer.pl</code>.</>}
              </p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
