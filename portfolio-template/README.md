# GPU Driver Learning Portfolio

Hands-on artifacts from my AMD Linux GPU driver study — every document below is
tied to something I actually built, traced, triaged, backported, or submitted.

> Template from [AMD_Driver_Learning](https://github.com/ZiaoLiu-1/AMD_Driver_Learning)'s
> `portfolio-template/`. Fork/copy, then replace stubs as you complete each lab.

## Contents

| Artifact | What it proves | Source lab |
|---|---|---|
| [notes/lab1-kernel-build.md](notes/lab1-kernel-build.md) | Can build/boot custom kernels | Lab 1 |
| [analysis/gpu-hang-report.md](analysis/gpu-hang-report.md) | Can read a GPU hang from dmesg/devcoredump | Lab 2 |
| [analysis/fence-trace.md](analysis/fence-trace.md) | Can trace fences/command submission with ftrace | Lab 3 |
| [notes/lab4-module-params.md](notes/lab4-module-params.md) | Understands amdgpu module parameters | Lab 4 |
| [analysis/ip-block-init-order.md](analysis/ip-block-init-order.md) | Understands IP-block init flow | Lab 5 |
| [tests/kunit-drm-buddy-report.md](tests/kunit-drm-buddy-report.md) | Can run/extend KUnit DRM tests | Lab 6 |
| [notes/lab7-patch-journey.md](notes/lab7-patch-journey.md) | Full upstream patch loop (v1→review→v2→outcome) | Lab 7 |
| [analysis/issue-NNNN-triage.md](analysis/issue-NNNN-triage.md) | Upstream-standard issue triage on real hardware | Lab 8 |
| [analysis/backport-HASH.md](analysis/backport-HASH.md) | Mainline→LTS backport with conflict archaeology | Lab 9 |
| [patches/](patches/) | format-patch output for everything above | Labs 5/7/9 |

## Verification pointers

- Upstream mail: https://lore.kernel.org/amd-gfx/?q=f:YOUR_EMAIL
- Issue activity: link individual comment permalinks in each analysis doc
- Hardware: AMD Radeon RX 7600 XT (Navi33 / gfx1102), kernel vX.Y, Mesa X.Y
