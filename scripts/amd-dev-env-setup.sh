#!/usr/bin/env bash
# ============================================================
# AMD GPU Kernel Driver Development Environment Setup
# Tested against: Ubuntu 22.04 / 24.04
#
# Usage:
#   chmod +x scripts/amd-dev-env-setup.sh
#   bash scripts/amd-dev-env-setup.sh
#   bash scripts/amd-dev-env-setup.sh --verify-only
# ============================================================
set -euo pipefail

VERIFY_ONLY=false
[[ "${1:-}" == "--verify-only" ]] && VERIFY_ONLY=true

# ── Colors ───────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'

pass()  { echo -e "  ${GREEN}✓${RESET}  $*"; }
fail()  { echo -e "  ${RED}✗${RESET}  $*"; FAILURES=$((FAILURES + 1)); }
warn()  { echo -e "  ${YELLOW}!${RESET}  $*"; }
info()  { echo -e "  ${BLUE}→${RESET}  $*"; }
header(){ echo -e "\n${BOLD}$*${RESET}"; echo "$(printf '─%.0s' {1..55})"; }

FAILURES=0

# ── INSTALL PHASE ─────────────────────────────────────────────
if [[ "$VERIFY_ONLY" == false ]]; then

  header "1/5  Kernel build essentials"
  sudo apt update -qq
  sudo apt install -y \
    build-essential git bc bison flex \
    dwarves \
    libelf-dev libssl-dev libncurses-dev \
    clang llvm lld \
    sparse coccinelle \
    cscope universal-ctags \
    python3 python3-pip zstd

  # NOTE: pahole ships inside the 'dwarves' package on Ubuntu.
  # Listing it separately is harmless but redundant — apt resolves it.

  header "2/5  AMD GPU / DRM userspace libs"
  sudo apt install -y \
    libdrm-dev libdrm-tests \
    libkmod-dev libudev-dev \
    libprocps-dev libjson-c-dev \
    libcairo2-dev libpixman-1-dev \
    meson ninja-build cmake \
    mesa-utils vulkan-tools radeontop \
    linux-firmware

  # libcairo2-dev + libpixman-1-dev are needed to build IGT GPU Tools (intel-gpu-tools)
  # and some drm test harnesses — GPT's trimmed list drops these incorrectly.
  # meson/ninja/cmake are required to build libdrm or Mesa from source.

  header "3/5  Kernel debug & tracing tools"
  sudo apt install -y \
    trace-cmd \
    linux-tools-common \
    linux-tools-generic \
    bpftrace \
    crash \
    kmod

  # IMPORTANT: 'perf' is NOT a standalone apt package on Ubuntu.
  # GPT listed 'perf' as a package — that will fail with apt.
  # The correct package is linux-tools-$(uname -r) OR linux-tools-generic.
  # We install linux-tools-generic here as a safe default.
  # If you need the exact kernel-matched perf:
  #   sudo apt install linux-tools-$(uname -r)

  # 'crash' = post-mortem kernel crash dump analyzer (vmcore + System.map).
  # Essential when amdgpu panics your test machine.

  header "4/5  virtme-ng (test kernel without reboot)"
  pip3 install --user --quiet virtme-ng

  # NOTE: virtme-ng >= 1.0 ships as the 'vng' command, NOT 'virtme-run'.
  # GPT's example used 'virtme-run' — that is the OLD virtme syntax.
  # Correct usage after this install:
  #   vng --run --kdir /path/to/linux/source
  # NOT: virtme-run --kdir ...

  header "5/5  drm-tip kernel source (AMD's active dev branch)"
  if [[ ! -d "$HOME/src/drm-tip/.git" ]]; then
    info "Cloning drm-tip (AMD's active development branch) — this takes a while..."
    mkdir -p "$HOME/src"
    git clone --depth=1 https://gitlab.freedesktop.org/drm/drm-tip.git "$HOME/src/drm-tip"
    info "Applying minimal AMD debug config..."
    cd "$HOME/src/drm-tip"
    make defconfig
    # Enable essential AMD debug options without a full menuconfig
    scripts/config --enable CONFIG_DRM_AMDGPU
    scripts/config --enable CONFIG_DRM_AMDGPU_USERPTR
    scripts/config --enable CONFIG_DEBUG_INFO
    scripts/config --enable CONFIG_DEBUG_INFO_BTF
    scripts/config --enable CONFIG_FRAME_POINTER
    cd - >/dev/null
    pass "drm-tip cloned → $HOME/src/drm-tip"
  else
    pass "drm-tip already present at $HOME/src/drm-tip"
  fi

fi  # end install phase

# ── VERIFICATION PHASE ────────────────────────────────────────

header "Verification — AMD Driver Dev Environment"

# Helper: check a binary exists
chk_cmd() {
  local cmd="$1"; local label="${2:-$1}"
  if command -v "$cmd" &>/dev/null; then
    pass "$label  ($(command -v "$cmd"))"
  else
    fail "$label not found — check install step"
  fi
}

# Helper: check an apt package is installed
chk_pkg() {
  local pkg="$1"
  if dpkg -s "$pkg" &>/dev/null 2>&1; then
    local ver
    ver=$(dpkg -s "$pkg" 2>/dev/null | awk '/^Version:/{print $2}')
    pass "pkg: $pkg  ($ver)"
  else
    fail "pkg: $pkg  — NOT installed"
  fi
}

echo ""
echo -e "${BOLD}[A] Core build tools${RESET}"
chk_cmd gcc        "gcc"
chk_cmd clang      "clang"
chk_cmd llvm-as    "llvm"
chk_cmd lld        "lld"
chk_cmd make       "make"
chk_cmd flex       "flex"
chk_cmd bison      "bison"
chk_cmd bc         "bc"
chk_cmd pahole     "pahole (BTF/dwarves)"
chk_cmd ctags      "universal-ctags"
chk_cmd cscope     "cscope"
chk_cmd sparse     "sparse (static analysis)"

echo ""
echo -e "${BOLD}[B] Python + virtme-ng${RESET}"
chk_cmd python3    "python3"
if command -v vng &>/dev/null; then
  pass "virtme-ng (vng)  — $(vng --version 2>/dev/null | head -1 || echo 'installed')"
else
  fail "virtme-ng (vng) not in PATH — try: export PATH=\$HOME/.local/bin:\$PATH"
  warn "Then re-run with --verify-only to confirm"
fi

echo ""
echo -e "${BOLD}[C] GPU / DRM userspace libraries${RESET}"
chk_pkg libdrm-dev
chk_pkg libdrm-tests
chk_pkg libkmod-dev
chk_pkg libudev-dev
chk_pkg libcairo2-dev
chk_pkg meson
chk_cmd ninja "ninja-build"
chk_cmd radeontop "radeontop"
chk_cmd glxinfo   "mesa-utils (glxinfo)"

echo ""
echo -e "${BOLD}[D] Kernel debug & tracing tools${RESET}"
chk_cmd trace-cmd  "trace-cmd"
chk_cmd bpftrace   "bpftrace"
chk_cmd crash      "crash (kernel dump analyzer)"
# perf lives inside linux-tools-$(uname -r) or linux-tools-generic
if command -v perf &>/dev/null; then
  pass "perf  ($(perf --version 2>/dev/null))"
else
  fail "perf not found — install: sudo apt install linux-tools-\$(uname -r)"
fi

echo ""
echo -e "${BOLD}[E] Kernel source${RESET}"
if [[ -d "$HOME/src/drm-tip/.git" ]]; then
  pass "drm-tip present at $HOME/src/drm-tip"
  KVER=$(git -C "$HOME/src/drm-tip" log -1 --format="%h %s" 2>/dev/null || echo "unknown")
  info "HEAD: $KVER"
elif [[ -d "$HOME/src/linux/.git" ]]; then
  warn "mainline linux found at $HOME/src/linux (drm-tip preferred for amdgpu dev)"
  pass "kernel source: $HOME/src/linux"
else
  fail "No kernel source found — expected $HOME/src/drm-tip"
  warn "Run without --verify-only to clone it"
fi

echo ""
echo -e "${BOLD}[F] Firmware${RESET}"
if dpkg -s linux-firmware &>/dev/null 2>&1; then
  AMD_FW_COUNT=$(find /lib/firmware/amdgpu -name "*.bin" 2>/dev/null | wc -l)
  if [[ "$AMD_FW_COUNT" -gt 0 ]]; then
    pass "linux-firmware installed  ($AMD_FW_COUNT AMD GPU firmware blobs in /lib/firmware/amdgpu)"
  else
    warn "linux-firmware installed but no /lib/firmware/amdgpu blobs found — check the package"
  fi
else
  fail "linux-firmware NOT installed — amdgpu module will refuse to load without it"
fi

echo ""
echo -e "${BOLD}[G] GPU hardware detection${RESET}"
if command -v lspci &>/dev/null; then
  AMD_GPUS=$(lspci | grep -i "vga\|display\|3d" | grep -i "amd\|radeon\|ati" || true)
  if [[ -n "$AMD_GPUS" ]]; then
    pass "AMD GPU detected:"
    echo "$AMD_GPUS" | while read -r line; do info "$line"; done
    # Check if amdgpu kernel module is loaded
    if lsmod | grep -q "^amdgpu"; then
      pass "amdgpu kernel module is loaded"
    else
      warn "amdgpu module not currently loaded (normal if running in a VM/container)"
    fi
    # Check DRM sysfs
    if ls /sys/class/drm/card*/device/vendor 2>/dev/null | xargs grep -l "0x1002" &>/dev/null; then
      pass "AMD GPU visible in DRM sysfs"
    fi
  else
    warn "No AMD GPU detected via lspci — expected if this is a build/dev VM without GPU passthrough"
  fi
else
  warn "lspci not available — skipping GPU detection"
fi

echo ""
echo -e "${BOLD}[H] Quick virtme-ng smoke test${RESET}"
if command -v vng &>/dev/null && [[ -f "$HOME/src/drm-tip/vmlinux" || -f "$HOME/src/drm-tip/arch/x86/boot/bzImage" ]]; then
  pass "virtme-ng + compiled kernel image found — ready to test with: vng --run --kdir \$HOME/src/drm-tip"
elif command -v vng &>/dev/null; then
  warn "virtme-ng installed but kernel not yet compiled"
  info "Compile first:  cd \$HOME/src/drm-tip && make -j\$(nproc)"
  info "Then test:      vng --run --kdir \$HOME/src/drm-tip"
else
  fail "virtme-ng not usable — see item [B] above"
fi

# ── SUMMARY ───────────────────────────────────────────────────
echo ""
echo "$(printf '═%.0s' {1..55})"
if [[ "$FAILURES" -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}  ALL CHECKS PASSED — AMD dev environment is ready${RESET}"
else
  echo -e "${RED}${BOLD}  $FAILURES CHECK(S) FAILED — see items marked ✗ above${RESET}"
  echo ""
  echo -e "  Common fixes:"
  echo -e "  • Add ~/.local/bin to PATH for virtme-ng:"
  echo -e "    ${YELLOW}echo 'export PATH=\$HOME/.local/bin:\$PATH' >> ~/.bashrc && source ~/.bashrc${RESET}"
  echo -e "  • For perf on exact kernel:"
  echo -e "    ${YELLOW}sudo apt install linux-tools-\$(uname -r)${RESET}"
  echo -e "  • Re-run verify: ${YELLOW}bash scripts/amd-dev-env-setup.sh --verify-only${RESET}"
fi
echo "$(printf '═%.0s' {1..55})"
echo ""

# Return non-zero exit code if any checks failed (useful for CI)
exit "$FAILURES"
