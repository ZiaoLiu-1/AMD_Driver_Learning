/* ============================================================
   AMD Linux Driver Learning Platform - Environment Setup Guide
   A practical, copy-paste guide to get from zero to a working
   amdgpu kernel dev environment in ~30 minutes.
   ============================================================ */

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useSearchHighlight } from "@/lib/highlight";
import { useLocale } from "@/contexts/LocaleContext";
import { PageShell } from "@/components/layout/PageShell";
import { CopyCodeBlock } from "@/components/shared/CopyCodeBlock";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Check,
  Terminal, Monitor, HardDrive, Cpu, Download, Settings,
  Laptop, Layers, Wrench, Mail, BookOpen, AlertTriangle, XCircle, CheckCircle2, Lightbulb
} from "lucide-react";

function CopyBlock({ code, title, lang = "bash" }: { code: string; title?: string; lang?: string }) {
  const { t } = useTranslation();

  return (
    <CopyCodeBlock
      code={code}
      title={title}
      language={lang}
      copyLabel={t("setup.copy")}
      copiedLabel={t("setup.copied")}
      className="my-4"
    />
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
  const { locale } = useLocale();
  const contentRef = useRef<HTMLElement>(null);
  useSearchHighlight(contentRef);
  const { t } = useTranslation();

  return (
    <PageShell
      backHref="/"
      backLabel={t("setup.home")}
      currentLabel={t("setup.title")}
      contentRef={contentRef}
      containerWidthClassName="max-w-4xl"
      mainClassName="py-8 sm:py-10"
    >
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{t("setup.pageTitle")}</h1>
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
          <a href="#prereqs" className="group rounded-xl border border-border/50 p-4 sm:p-5 bg-card/50 hover:bg-muted/50 transition-colors block">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                  <Laptop className="w-4 h-4 text-info" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-info transition-colors text-sm sm:text-base pt-1">
                  {locale === 'zh' ? '单机开发环境 (基础)' : 'Single-Machine Setup (Basic)'}
                </h3>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0 mt-2 text-muted-foreground group-hover:text-info group-hover:-rotate-45 transition-[color,transform]" />
            </div>
            <p className="text-xs text-muted-foreground/85 leading-relaxed">
              {locale === 'zh'
                ? '在同一台电脑上编写代码、编译内核并使用 virtme-ng 测试。适合初学者或仅进行非显示层修改时使用。'
                : 'Write code, build the kernel, and test with virtme-ng on the same PC. Good for beginners or non-display changes.'}
            </p>
          </a>

          <a href="#dual-machine" className="group rounded-xl border border-border/50 p-4 sm:p-5 bg-card/50 hover:bg-muted/50 hover:border-primary/50 transition-colors block relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-bl-lg">
              {locale === 'zh' ? '推荐' : 'Recommended'}
            </div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base pt-1">
                  {locale === 'zh' ? '双机开发流程 (进阶)' : 'Dual-Machine Setup (Advanced)'}
                </h3>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0 mt-2 text-muted-foreground group-hover:text-primary group-hover:-rotate-45 transition-[color,transform]" />
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
              { id: "field-notes", labelKey: "setup.fieldNotes" },
            ].map(item => (
              <a key={item.id} href={`#${item.id}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-2.5 min-h-[44px] flex items-center rounded hover:bg-muted/50">
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
sudo apt install -y \\
    libdrm-dev libkmod-dev \\
    libudev-dev libcairo2-dev libpixman-1-dev \\
    libjson-c-dev meson ninja-build cmake

# procps dev headers — the package name differs by Ubuntu release:
#   Ubuntu 22.04 (jammy):   libprocps-dev
#   Ubuntu 24.04 (noble)+:  libproc2-dev   (procps was renamed to libproc2)
# Install whichever your release ships (the first that resolves wins):
sudo apt install -y libproc2-dev || sudo apt install -y libprocps-dev

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

            <div className="rounded-xl p-4 border border-warning/30 bg-warning/5">
              <p className="text-xs font-semibold text-warning mb-1">Important: GPU firmware</p>
              <p className="text-xs text-muted-foreground/80">
                Prefer your distro's <code className="text-primary">linux-firmware</code> package first
                (<code>sudo apt install linux-firmware</code> / <code>dnf</code> / <code>pacman</code>) — it places blobs
                correctly and regenerates the initramfs for you. Only if you're running a very new GPU
                (e.g. RDNA4 / gfx12) and your distro's package is too old, pull the upstream tree.
                First find the exact blob the kernel is asking for:
              </p>
              <CopyBlock code={`# 1. Find the exact missing firmware file the kernel requested
dmesg | grep -i firmware        # e.g. "amdgpu/gc_11_0_0_rlc.bin failed to load"

# 2. Only if the distro package is too old: install from the upstream tree
git clone --depth=1 https://gitlab.com/kernel-firmware/linux-firmware.git
cd linux-firmware
sudo make install               # copies blobs into /lib/firmware/amdgpu/

# 3. Manual install does NOT rebuild the initramfs — do it yourself so the
#    blob is present at early boot:
sudo update-initramfs -u        # Debian/Ubuntu
# sudo dracut -f                 # Fedora/RHEL`} />
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

# Enable amdgpu as a MODULE (=m), NOT built-in (=y)
# This is critical for development: with =m you can rmmod/insmod your
# modified driver without rebooting. With =y (Ubuntu's default when
# copying /boot/config) every code change requires a full reboot.
scripts/config --module CONFIG_DRM_AMDGPU
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

            <div className="rounded-xl p-4 border border-orange-500/40 bg-orange-500/5 my-4">
              <p className="text-xs font-semibold text-orange-500 dark:text-orange-400 mb-2">
                ⚠️ Pitfall 3 — amdgpu built-in (=y) vs module (=m)
              </p>
              <p className="text-xs text-muted-foreground/80 mb-2">
                When you copy Ubuntu's <code>/boot/config</code>, <code>CONFIG_DRM_AMDGPU</code> is often
                set to <code>=y</code> (built into vmlinux). This means:
              </p>
              <ul className="text-xs text-muted-foreground/80 list-disc list-inside space-y-1 mb-2">
                <li>No <code>amdgpu.ko</code> file is generated — <code>find . -name amdgpu.ko</code> returns nothing</li>
                <li>Every code change requires a full reboot to take effect</li>
                <li>You cannot use <code>rmmod amdgpu && insmod amdgpu.ko</code> for fast iteration</li>
              </ul>
              <p className="text-xs text-muted-foreground/80">
                The config block above uses <code>scripts/config --module</code> to force <code>=m</code>.
                If you already built with <code>=y</code>, re-run the config step and rebuild:
              </p>
              <CopyBlock code={`# Check current value
grep CONFIG_DRM_AMDGPU= .config
# If it shows =y, fix it:
scripts/config --module CONFIG_DRM_AMDGPU
make olddefconfig
make -j$(nproc)
# Now amdgpu.ko will appear at drivers/gpu/drm/amd/amdgpu/amdgpu.ko`} />
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

# Build the kernel in the current tree, then boot it in a VM (no GPU passthrough)
# Good for: module loading tests, printk verification, KUnit tests
vng --build      # compile the kernel from the current source tree
vng              # boot the kernel you just built (run from the kernel tree)

# Inside the VM:
#   modprobe amdgpu         # test module loading
#   dmesg | grep amdgpu     # check init messages
#   exit                    # shut down VM

# Boot with a specific kernel command line
vng -- "drm.debug=0x1f amdgpu.dpm=0"`} />

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

            <div className="rounded-xl p-4 border border-destructive/30 bg-destructive/5">
              <p className="text-xs font-semibold text-destructive mb-1">DANGER: MMIO writes</p>
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

# Discover the real subtest names first — IGT subtest names change upstream
./build/tests/amdgpu/amd_basic --list-subtests
# Then run a quick amdgpu sanity test (needs root + real GPU).
# Current command-submission subtest is "cs-gfx-with-IP-GFX" (with a dynamic
# "@cs-gfx" sub-id); older guides used a plain "cs-gfx" name that no longer exists:
sudo ./build/tests/amdgpu/amd_basic --run-subtest cs-gfx-with-IP-GFX`} />

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

# Debug (requires debugfs mounted; the exact card index and available files
# depend on your kernel version/config — discover them first)
ls /sys/kernel/debug/dri/*/                      # list what your kernel exposes
sudo cat /sys/kernel/debug/dri/0/amdgpu_fence_info
sudo cat /sys/kernel/debug/dri/0/amdgpu_sa_info
# Reading amdgpu_gpu_recover triggers a full GPU reset (loses in-flight work).
# The file is present only when amdgpu was built with debugfs reset support:
sudo cat /sys/kernel/debug/dri/0/amdgpu_gpu_recover  # if present: manual GPU reset`} />
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
vng --build && vng

# 5. Test on real hardware (display changes or full validation)
sudo rmmod amdgpu && sudo insmod drivers/gpu/drm/amd/amdgpu/amdgpu.ko
dmesg | tail -20

# 6. Run relevant IGT tests
sudo ./igt-gpu-tools/build/tests/amdgpu/amd_basic

# 7. Check code style
scripts/checkpatch.pl --strict -g HEAD

# 8. Commit with proper message format
git commit -s  # -s adds Signed-off-by

# 9. Submit. Two paths:
# (a) b4: prepare a tracked series on a branch, then send it (b4 operates on the
#     prepared branch, NOT on loose .patch files):
#       b4 prep -n fix/my-description
#       b4 prep --check && b4 send -o /tmp/presend   # preview
#       b4 send
# (b) git send-email for loose patch files from git format-patch:
#       git format-patch HEAD~1 -o /tmp/patches/
#       git send-email --to=amd-gfx@lists.freedesktop.org /tmp/patches/0001-*.patch`} />

            <div className="rounded-xl p-5 border border-border/50 bg-card/50">
              <p className="text-sm font-semibold text-foreground mb-2">What's next?</p>
              <p className="text-xs text-muted-foreground/80 mb-3">
                Your environment is ready. Start with Module 0's deep dive lessons to understand the GPU driver
                landscape, then follow the learning path. Each module has hands-on labs that use the environment
                you just set up.
              </p>
              <Button asChild variant="brand" className="inline-flex rounded-lg px-4 py-2 text-sm font-medium">
                <Link href="/module/intro">Start Module 0: Introduction →</Link>
              </Button>
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
                    <span className="w-6 h-6 rounded-md bg-destructive/15 flex items-center justify-center text-destructive font-bold text-[10px]">B</span>
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

            <div className="rounded-xl p-4 border border-success/30 bg-success/5 my-6">
              <p className="text-xs font-semibold text-success mb-1">{locale === 'zh' ? '✅ Windows 系统完全安全' : '✅ Windows is safe'}</p>
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
make M=drivers/gpu/drm/amd -j$(nproc) && vng --build && vng

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

# Trigger a manual GPU reset (useful for testing recovery paths).
# Present only if amdgpu was built with debugfs reset support — check first:
ls /sys/kernel/debug/dri/0/ | grep amdgpu_gpu_recover && \\
  sudo cat /sys/kernel/debug/dri/0/amdgpu_gpu_recover`} />

          </Section>

          {/* 10. ROCm / HIP Toolchain */}
          <Section icon={Layers} title={t("setup.rocmHip")} id="rocm-hip">
            <p>
              {locale === 'zh'
                ? <>ROCm 是 AMD 官方的 GPU 计算平台，包含 HIP 编译器、运行时和性能分析工具。<strong>Module 7（ROCm 内核接口）和 Module 8（ROCm 计算）</strong>需要此环境。以下步骤摘自 <a href="https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/quick-start.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ROCm 官方 Quick Start Guide</a>。</>
                : <>ROCm is AMD's official GPU compute platform, including the HIP compiler, runtime, and profiling tools. Required for <strong>Module 7 (ROCm Kernel Interface) and Module 8 (ROCm Compute)</strong>. Steps below are from the <a href="https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/quick-start.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">official ROCm Quick Start Guide</a>.</>}
            </p>

            <div className="rounded-xl p-4 border border-warning/30 bg-warning/5 my-4">
              <p className="text-xs font-semibold text-warning mb-1">
                {locale === 'zh' ? '前置条件' : 'Prerequisites'}
              </p>
              <p className="text-xs text-muted-foreground/80">
                {locale === 'zh'
                  ? <>安装前请<strong>务必先核对官方兼容性矩阵</strong>——ROCm 并非"任何 AMD 显卡都支持"。消费级 Radeon 的支持范围有限，且按型号/ROCm 版本/操作系统逐一列出，详见 <a href="https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/compatibility/compatibility.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ROCm on Radeon 兼容性矩阵</a> 与 <a href="https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">系统要求</a>。<strong>注意：RX 7600 XT（Navi33 / gfx1102）目前不在官方 ROCm 支持列表中</strong>（截至 2026-07，ROCm 7.2.4 支持的消费级显卡为 RX 9070/9060 系列与 RX 7900/7800/7700 系列）。未列出的显卡有两条非官方路径：<a href="https://github.com/ROCm/TheRock" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TheRock 社区 nightly 构建</a>（官方文档明确指引的社区通道，ROCm 7.13 preview 已列入 RX 7600），或 <code>HSA_OVERRIDE_GFX_VERSION</code>——两者均不受官方支持、不保证可用。ROCm 不支持集成显卡——如有 AMD APU，请在 BIOS 中禁用 IGP。</>
                  : <>Before installing, <strong>always check the official compatibility matrix first</strong> — ROCm is not "any AMD GPU works". Consumer Radeon support is limited and listed per model / ROCm release / OS. See the <a href="https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/compatibility/compatibility.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ROCm on Radeon compatibility matrix</a> and <a href="https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">System Requirements</a>. <strong>Note: the RX 7600 XT (Navi33 / gfx1102) is NOT on the official ROCm supported-GPU list</strong> (as of 2026-07, ROCm 7.2.4 supports the RX 9070/9060 and RX 7900/7800/7700 consumer series). Unlisted cards have two unofficial paths: <a href="https://github.com/ROCm/TheRock" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TheRock community nightly builds</a> (the community channel the official docs point to; the ROCm 7.13 preview lists the RX 7600), or <code>HSA_OVERRIDE_GFX_VERSION</code> — neither is officially supported or guaranteed. ROCm does not support integrated graphics — disable AMD IGP in BIOS if present.</>}
              </p>
            </div>

            <CopyBlock title="Ubuntu 24.04" code={`# Official ROCm Quick Start (https://rocm.docs.amd.com)
wget https://repo.radeon.com/amdgpu-install/7.2.4/ubuntu/noble/amdgpu-install_7.2.4.70204-1_all.deb
sudo apt install ./amdgpu-install_7.2.4.70204-1_all.deb
sudo apt update
sudo apt install python3-setuptools python3-wheel
sudo usermod -a -G render,video $LOGNAME
sudo apt install rocm`} />

            <CopyBlock title="Ubuntu 22.04" code={`wget https://repo.radeon.com/amdgpu-install/7.2.4/ubuntu/jammy/amdgpu-install_7.2.4.70204-1_all.deb
sudo apt install ./amdgpu-install_7.2.4.70204-1_all.deb
sudo apt update
sudo apt install python3-setuptools python3-wheel
sudo usermod -a -G render,video $LOGNAME
sudo apt install rocm`} />

            <CopyBlock title="RHEL 9.x / Rocky Linux" code={`# Replace 9.6 with your RHEL version (9.4, 9.6, 9.7, etc.)
sudo dnf install \\
    https://repo.radeon.com/amdgpu-install/7.2.4/rhel/9.6/amdgpu-install-7.2.4.70204-1.el9.noarch.rpm
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
# Lists your AMD GPU as an HSA agent ONLY if the card is on the ROCm
# compatibility matrix. Unsupported cards (e.g. RX 7600 XT / gfx1102) may not
# appear, or may require HSA_OVERRIDE_GFX_VERSION (unofficial, unsupported).

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
        // gcnArchName is the current string field (e.g. "gfx1100");
        // the old integer props.gcnArch was deprecated/removed in recent ROCm.
        printf("  [%d] %s (%s)\\n", i, props.name, props.gcnArchName);
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

          {/* 13. Field Notes */}
          <Section icon={BookOpen} title={t("setup.fieldNotes")} id="field-notes">

            {/* Personal intro */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5 mb-6">
              <p className="text-sm text-foreground/85 leading-relaxed mb-3">
                {locale === 'zh'
                  ? '下面是我亲手跑这套流程时踩的所有坑——按遇到的先后顺序记录。每个问题都附上了原始的"坏"代码、报错信息、修复方法，以及为什么会这样。如果你是第一次从头配 AMD 驱动开发环境，建议先快速过一遍这个章节，可以少走很多弯路。'
                  : "Below is a first-person account of every issue I hit while going through this setup end-to-end — in the exact order they showed up. Each one has the original broken code, the error it produced, the fix, and a quick explanation of why it happens. If you're doing this for the first time, skim through this section first. It'll save you a solid couple of hours."}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 font-medium border border-red-500/20">
                  {locale === 'zh' ? '3 个坑' : '3 pitfalls'}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-medium border border-amber-500/20">
                  {locale === 'zh' ? '1 个隐患' : '1 hidden trap'}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 font-medium border border-green-500/20">
                  {locale === 'zh' ? '全部已修复并更新到文档' : 'All fixed & reflected in the guide above'}
                </span>
              </div>
            </div>

            {/* TL;DR / Background summary */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  {locale === 'zh' ? '先了解背景：我们在做什么' : 'Background: What We\'re Actually Doing Here'}
                </h3>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm text-foreground/80 leading-relaxed space-y-3">
                <p>
                  {locale === 'zh'
                    ? '整个流程的目标是：在 Ubuntu 上把 Linux 内核的 amdgpu 显卡驱动模块编译出来，然后能快速加载/卸载它，而不需要每次重启机器。听起来简单，但有几个非常容易绊倒人的细节。'
                    : "The goal of this whole setup is: build the amdgpu GPU driver as a loadable kernel module on Ubuntu, so you can load/unload it without rebooting every time you make a change. Sounds simple — but there are a few details that will trip you up if you don't know about them."}
                </p>
                <ul className="space-y-2 pl-4">
                  {[
                    locale === 'zh'
                      ? ['内核配置从哪来：', '我们用 cp /boot/config-$(uname -r) .config 复制当前系统的配置，再用 make olddefconfig 补全新选项。这比从零配快很多，但 Ubuntu 的 .config 里藏了几个"定时炸弹"。']
                      : ['Where the kernel config comes from:', 'We copy the currently running system\'s config with cp /boot/config-$(uname -r) .config, then fill in new options with make olddefconfig. Way faster than starting from scratch — but Ubuntu\'s .config has a few landmines buried in it.'],
                    locale === 'zh'
                      ? ['为什么用 =m 而不是 =y：', '把 amdgpu 编译为模块（=m）意味着会生成 amdgpu.ko 文件。修改代码后，你只需要 rmmod amdgpu && insmod amdgpu.ko，而不用重启系统。内置（=y）则没有这个文件，每次改代码都要重启。']
                      : ['Why =m and not =y:', 'Building amdgpu as a module (=m) means a file amdgpu.ko gets produced. After a code change you just rmmod amdgpu && insmod amdgpu.ko — no reboot. Built-in (=y) produces no .ko, so every change requires a full reboot.'],
                    locale === 'zh'
                      ? ['并行编译的问题：', 'make -j$(nproc) 会同时跑很多编译任务，输出混在一起。真正的报错信息可能淹没在大量 CC 和 LD 行里。出错时改用 LC_ALL=C make -j1 看干净的串行输出。']
                      : ['The parallel build problem:', 'make -j$(nproc) fires off many compile jobs at once and their output gets interleaved. The real error message can get buried under hundreds of CC and LD lines. When things break, switch to LC_ALL=C make -j1 to get clean sequential output.'],
                  ].map(([label, text], i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <span><strong className="text-foreground/90">{label}</strong> {text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pitfall 1 */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center mt-0.5">
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {locale === 'zh' ? '坑 1：找不到 Canonical 签名证书' : 'Pitfall 1: Missing Canonical Signing Certificates'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {locale === 'zh' ? '直接触发编译失败，无法绕过' : 'Hard build failure, no workaround'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pl-10">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {locale === 'zh' ? '遇到了什么' : 'What happened'}
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {locale === 'zh'
                      ? '我照着指南复制了 /boot/config 然后跑 make，过了几分钟冒出这个错误，编译直接停掉了。乍一看完全摸不着头脑，.config 里也没有 debian/ 这个目录。'
                      : "I copied /boot/config as instructed and ran make. A few minutes in, the build stopped dead with this error. Took me a second to even understand what it was looking for — there's no debian/ directory in the kernel tree."}
                  </p>
                  <CopyBlock lang="text" code={`make[2]: *** No rule to make target 'debian/canonical-certs.pem',
         needed by 'certs/x509_certificate_list'.  Stop.
make[1]: *** [Makefile:248] error 2
make: *** [Makefile:2010] error 2`} title={locale === 'zh' ? '报错信息' : 'Error output'} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {locale === 'zh' ? '原始（有问题的）配置' : 'Original broken config'}
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                    {locale === 'zh'
                      ? 'Ubuntu 的 .config 里有这三行，指向 Canonical 内部私有的证书文件。这些文件在 Ubuntu 官方构建服务器上存在，但在你自己的机器上根本没有。'
                      : "Ubuntu's .config had these three lines pointing to Canonical's internal signing certificates. These files exist on their build servers — not on your dev machine."}
                  </p>
                  <CopyBlock lang="bash" code={`# These three lines are the problem — in your .config after copying from /boot:
CONFIG_SYSTEM_TRUSTED_KEYS="debian/canonical-certs.pem"
CONFIG_SYSTEM_REVOCATION_KEYS="debian/canonical-revoked-certs.pem"
CONFIG_MODULE_SIG_KEY="certs/signing_key.pem"`} title={locale === 'zh' ? '问题根源（.config 里的内容）' : 'Root cause (inside your .config)'} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {locale === 'zh' ? '修复方法' : 'The fix'}
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-2">
                    {locale === 'zh'
                      ? '在 make olddefconfig 之后，运行这三条命令清空证书路径。空字符串告诉构建系统"不需要外部证书"。'
                      : "After make olddefconfig, run these three commands to clear the certificate paths. An empty string tells the build system \"no external certs needed\"."}
                  </p>
                  <CopyBlock lang="bash" code={`scripts/config --set-str SYSTEM_TRUSTED_KEYS ""
scripts/config --set-str SYSTEM_REVOCATION_KEYS ""
scripts/config --set-str MODULE_SIG_KEY ""`} title={locale === 'zh' ? '修复（跑完 olddefconfig 之后）' : 'Fix (run after make olddefconfig)'} />
                </div>

                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/75 leading-relaxed">
                    {locale === 'zh'
                      ? '这个修复现在已经加到上方"Build the Kernel"小节的配置步骤里了，不会再漏掉了。'
                      : 'This fix is now baked into the "Build the Kernel" section above — the config commands include it by default so you won\'t miss it.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pitfall 2 */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center mt-0.5">
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {locale === 'zh' ? '坑 2：gawk 没装' : 'Pitfall 2: gawk Not Installed'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {locale === 'zh' ? '修了坑 1 之后紧接着踩的，直接再次失败' : 'Hit this immediately after fixing Pitfall 1'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pl-10">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {locale === 'zh' ? '遇到了什么' : 'What happened'}
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {locale === 'zh'
                      ? '修完证书问题重新跑 make，过了一段时间编译又停了。这次是 gawk 找不到。问题出在 Ubuntu 默认开启了 CONFIG_BUILTIN_MODULE_RANGES，这个选项在生成内核映射时需要用 gawk 处理数据——而 Ubuntu Desktop 默认不装 gawk。'
                      : "Fixed the cert issue, restarted make. A while later, dead again. This time gawk was missing. Ubuntu's default config enables CONFIG_BUILTIN_MODULE_RANGES, which needs gawk to generate kernel module address range data — and Ubuntu Desktop doesn't ship gawk by default."}
                  </p>
                  <CopyBlock lang="text" code={`/bin/sh: 1: gawk: not found
make[2]: *** [Makefile:1234] error 127`} title={locale === 'zh' ? '报错信息' : 'Error output'} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {locale === 'zh' ? '原始（不完整的）依赖安装命令' : 'Original (incomplete) dependency install'}
                  </p>
                  <CopyBlock lang="bash" code={`# What the original guide said — missing gawk:
sudo apt install -y build-essential libncurses-dev bison flex libssl-dev \\
  libelf-dev bc dwarves zstd pahole`} title={locale === 'zh' ? '原始命令（缺少 gawk）' : 'Original command (missing gawk)'} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {locale === 'zh' ? '修复方法' : 'The fix'}
                  </p>
                  <CopyBlock lang="bash" code={`# Just add gawk — one package, fixes the issue entirely:
sudo apt install -y build-essential libncurses-dev bison flex libssl-dev \\
  libelf-dev bc dwarves zstd pahole gawk`} title={locale === 'zh' ? '修复后的命令' : 'Fixed command'} />
                </div>

                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/75 leading-relaxed">
                    {locale === 'zh'
                      ? 'gawk 现在已加到上方"Prerequisites"章节的 apt install 命令里了。'
                      : 'gawk is now included in the apt install command in the Prerequisites section above.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pitfall 3 */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {locale === 'zh' ? '坑 3：amdgpu 被编译进内核（=y）而不是模块（=m）' : 'Pitfall 3: amdgpu Built Into the Kernel (=y) Instead of a Module (=m)'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {locale === 'zh' ? '编译成功，但开发效率被完全拖垮' : 'Build succeeds, but your dev workflow is basically broken'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pl-10">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {locale === 'zh' ? '遇到了什么' : 'What happened'}
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {locale === 'zh'
                      ? '编译终于成功了，但发现 drivers/gpu/drm/amd/amdgpu/ 目录下没有 amdgpu.ko 这个文件。搜了一下才意识到：Ubuntu 的默认配置把 CONFIG_DRM_AMDGPU 设成了 =y（直接内置进 vmlinuz），而不是 =m（生成独立的 .ko 模块文件）。这意味着每次改一行代码都要完整重编译内核并重启机器——对于驱动开发来说完全不可接受。'
                      : "Build finally succeeded, but there was no amdgpu.ko file anywhere under drivers/gpu/drm/amd/amdgpu/. After some digging I realized: Ubuntu's default config sets CONFIG_DRM_AMDGPU=y (baked into vmlinuz as built-in) rather than =m (produces a standalone amdgpu.ko). This means every single code change requires a full kernel recompile and reboot — completely unworkable for driver development."}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {locale === 'zh' ? '原始（有问题的）配置命令' : 'Original broken config command'}
                  </p>
                  <CopyBlock lang="bash" code={`# Original — this enables amdgpu but leaves it as built-in (=y):
scripts/config --enable CONFIG_DRM_AMDGPU

# After make olddefconfig, .config contains:
# CONFIG_DRM_AMDGPU=y  ← NO .ko file will be generated`} title={locale === 'zh' ? '原始命令（结果是 =y）' : 'Original command (results in =y)'} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {locale === 'zh' ? '修复方法' : 'The fix'}
                  </p>
                  <CopyBlock lang="bash" code={`# Fixed — use --module instead of --enable:
scripts/config --module CONFIG_DRM_AMDGPU

# After make olddefconfig, .config contains:
# CONFIG_DRM_AMDGPU=m  ← amdgpu.ko gets generated

# Verify after build:
find . -name "amdgpu.ko"
# Should print: ./drivers/gpu/drm/amd/amdgpu/amdgpu.ko`} title={locale === 'zh' ? '修复后的命令' : 'Fixed command'} />
                </div>

                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-foreground/80 leading-relaxed">
                  <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
                    {locale === 'zh' ? '为什么 =m 对驱动开发这么重要？' : 'Why does =m matter so much for driver development?'}
                  </p>
                  <p>
                    {locale === 'zh'
                      ? '用 =m 的工作流是：改代码 → make -C /lib/modules/$(uname -r)/build M=$(pwd)/drivers/gpu/drm/amd/amdgpu → sudo rmmod amdgpu → sudo insmod amdgpu.ko。整个循环可能只要几分钟。用 =y 的话每次都要重编整个内核（20-40 分钟）再重启系统，开发效率直接崩掉。'
                      : "With =m, the iteration loop is: change code → rebuild just the module → rmmod amdgpu → insmod amdgpu.ko. Total cycle time: a few minutes. With =y, every change means a full kernel rebuild (20-40 min) plus a reboot. That's the difference between a workable dev workflow and a completely broken one."}
                  </p>
                </div>

                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/75 leading-relaxed">
                    {locale === 'zh'
                      ? '上方 Build 章节里的配置步骤已改为用 --module 而不是 --enable。'
                      : 'The config commands in the Build section above now use --module instead of --enable.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Hidden Trap: Parallel builds masking errors */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {locale === 'zh' ? '隐患：并行编译会把真正的报错淹没掉' : 'Hidden Trap: Parallel Builds Hide the Real Error'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {locale === 'zh' ? '这不是一个能被修好的"坑"，但每次出错都要注意' : 'Not a fixable bug, but something you\'ll hit every time a build breaks'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pl-10">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {locale === 'zh'
                    ? '标准的 make -j$(nproc) 同时开几十个编译进程，它们的 stdout/stderr 输出全部混在一起。当某个文件编译失败时，真正的报错信息可能出现在屏幕中间某一行，随后被大量其他编译任务的输出覆盖。最终你只会看到 "make: *** [Makefile:2010] 错误 2"，根本不知道是什么文件出了什么问题。'
                    : "Standard make -j$(nproc) fires off dozens of concurrent compile jobs. Their stdout/stderr all get interleaved. When one file fails, the actual error message appears somewhere in the middle of the output, then gets immediately buried under output from all the other jobs still running. You end up with just \"make: *** Error 2\" at the bottom — no idea what failed or why."}
                </p>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {locale === 'zh' ? '出错后的调试命令' : 'Debug command when build fails'}
                  </p>
                  <CopyBlock lang="bash" code={`# When make -j$(nproc) fails with a mysterious "Error 2":
LC_ALL=C make -j1 2>&1 | tee /tmp/build.log

# LC_ALL=C  → forces English output (no garbled Chinese locale errors)
# -j1       → serial build, errors appear in-order and are easy to find
# tee       → saves full output to a file you can grep through`} title={locale === 'zh' ? '串行调试构建' : 'Serial debug build'} />
                </div>
              </div>
            </div>

            {/* Final summary: current state */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  {locale === 'zh' ? '现在的状态：这些都修好了' : 'Current State: All of This Is Fixed'}
                </h3>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                {locale === 'zh'
                  ? '以上所有问题都已经反映到这份文档里了。如果你按照上面章节一步步来，这些坑都会自动绕开。下面是一个快速对照表，总结了"原来怎么样 → 现在怎么样"。'
                  : "All of the above is now reflected in the guide. If you follow the sections above step by step, you'll sidestep all of these automatically. Here's a quick before/after summary table."}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 pr-4 font-semibold text-foreground/70 w-1/3">
                        {locale === 'zh' ? '问题' : 'Issue'}
                      </th>
                      <th className="text-left py-2 pr-4 font-semibold text-red-500/70 w-1/3">
                        {locale === 'zh' ? '原来（有问题）' : 'Before (broken)'}
                      </th>
                      <th className="text-left py-2 font-semibold text-green-500/70 w-1/3">
                        {locale === 'zh' ? '现在（已修复）' : 'After (fixed)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {[
                      {
                        issue: locale === 'zh' ? 'Canonical 证书' : 'Canonical certs',
                        before: locale === 'zh' ? '直接用 .config，含 debian/canonical-certs.pem 路径' : 'Raw .config with debian/canonical-certs.pem path',
                        after: locale === 'zh' ? '3 条 scripts/config --set-str 清空路径' : '3× scripts/config --set-str clears the paths',
                      },
                      {
                        issue: locale === 'zh' ? '缺少 gawk' : 'Missing gawk',
                        before: locale === 'zh' ? 'apt install 命令里没有 gawk' : 'apt install without gawk',
                        after: locale === 'zh' ? 'gawk 已加入依赖安装命令' : 'gawk added to install command',
                      },
                      {
                        issue: locale === 'zh' ? 'amdgpu =y vs =m' : 'amdgpu =y vs =m',
                        before: locale === 'zh' ? 'scripts/config --enable → 内置，无 .ko 文件' : 'scripts/config --enable → built-in, no .ko',
                        after: locale === 'zh' ? 'scripts/config --module → 生成 amdgpu.ko' : 'scripts/config --module → amdgpu.ko produced',
                      },
                      {
                        issue: locale === 'zh' ? '并行输出掩盖报错' : 'Parallel output masks errors',
                        before: locale === 'zh' ? 'make -j$(nproc) 失败时只看到 Error 2' : 'make -j$(nproc) failure shows only Error 2',
                        after: locale === 'zh' ? 'LC_ALL=C make -j1 给出干净的串行输出' : 'LC_ALL=C make -j1 gives clean serial output',
                      },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="py-2.5 pr-4 font-medium text-foreground/80">{row.issue}</td>
                        <td className="py-2.5 pr-4 text-red-500/75 font-mono">{row.before}</td>
                        <td className="py-2.5 text-green-500/80 font-mono">{row.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </Section>

        </div>
    </PageShell>
  );
}
