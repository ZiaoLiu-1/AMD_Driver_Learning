/* ============================================================
   AMD Linux Driver Learning Platform - Home Page
   Design: Deep Space Tech Aesthetic
   - Hero section with AMD GPU background image
   - Progress overview bar
   - Course overview grid with 12 module cards
   - Staged learning path timeline
   ============================================================ */

import { Link } from "wouter";
import { curriculum, totalHours, difficultyColors, difficultyLabels } from "@/data/curriculum";
import { useProgress } from "@/contexts/ProgressContext";
import { ArrowRight, Clock, BookOpen, Code2, Target, ChevronRight, Cpu, Zap, CheckCircle2, Circle, Loader2, BarChart3 } from "lucide-react";

const HERO_BG_GRADIENT = "radial-gradient(ellipse at 30% 20%, oklch(0.22 0.06 260) 0%, oklch(0.08 0.02 250) 50%, oklch(0.04 0.01 240) 100%)";

// Learning path stages grouping
const STAGES = [
  {
    label: '阶段一：基础准备',
    color: 'oklch(0.70 0.18 145)',
    bg: 'oklch(0.55 0.18 145 / 0.1)',
    border: 'oklch(0.55 0.18 145 / 0.3)',
    modules: ['intro', 'ecosystem', 'prerequisites'],
  },
  {
    label: '阶段二：硬件与内核',
    color: 'oklch(0.70 0.18 200)',
    bg: 'oklch(0.55 0.18 200 / 0.1)',
    border: 'oklch(0.55 0.18 200 / 0.3)',
    modules: ['hardware', 'kernel'],
  },
  {
    label: '阶段三：图形驱动核心',
    color: 'oklch(0.75 0.18 35)',
    bg: 'oklch(0.62 0.22 35 / 0.1)',
    border: 'oklch(0.62 0.22 35 / 0.3)',
    modules: ['drm', 'amdgpu'],
  },
  {
    label: '阶段四：调试与计算',
    color: 'oklch(0.70 0.18 280)',
    bg: 'oklch(0.55 0.18 280 / 0.1)',
    border: 'oklch(0.55 0.18 280 / 0.3)',
    modules: ['debugging', 'rocm-kernel', 'rocm-compute'],
  },
  {
    label: '阶段五：工具链与工程',
    color: 'oklch(0.70 0.20 50)',
    bg: 'oklch(0.55 0.20 50 / 0.1)',
    border: 'oklch(0.55 0.20 50 / 0.3)',
    modules: ['llvm', 'testing', 'career'],
  },
];

export default function Home() {
  const { getModuleStatus, getTotalCompleted } = useProgress();
  const totalCompleted = getTotalCompleted();
  const progressPct = Math.round((totalCompleted / curriculum.length) * 100);

  // Find the first in-progress or not-started module
  const continueModule = curriculum.find(m => getModuleStatus(m.id) !== 'completed') ?? curriculum[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8441A, #FF6B35)' }}>
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-wide text-foreground/90">AMD Driver Learning Platform</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="https://docs.kernel.org/gpu/amdgpu/index.html" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden md:block">内核文档</a>
            <a href="https://github.com/torvalds/linux/tree/master/drivers/gpu/drm/amd" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden md:block">源码</a>
            <a href="https://lists.freedesktop.org/mailman/listinfo/amd-gfx" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden md:block">邮件列表</a>
            {totalCompleted > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #E8441A, #FF6B35)' }} />
                </div>
                <span style={{ color: 'oklch(0.75 0.18 35)' }}>{progressPct}%</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden pt-14">
        <div className="absolute inset-0" style={{ background: HERO_BG_GRADIENT }} />
        <div className="hero-overlay absolute inset-0" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(oklch(0.92 0.008 240) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.008 240) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 border"
              style={{ background: 'oklch(0.62 0.22 35 / 0.15)', borderColor: 'oklch(0.62 0.22 35 / 0.4)', color: 'oklch(0.85 0.15 35)' }}>
              <Zap className="w-3 h-3" />
              AMD Markham Engineer Track · RX 7600 XT (Navi33 / gfx1102)
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
              <span className="text-foreground">Linux GPU</span>
              <br />
              <span className="amd-gradient-text">驱动工程师</span>
              <br />
              <span className="text-foreground">训练路径</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-4 leading-relaxed max-w-2xl">
              从零开始，系统掌握 AMD GPU 驱动开发的完整知识体系。覆盖 Linux 内核、DRM 子系统、
              AMDGPU 驱动架构、ROCm 计算框架、LLVM 工具链，直至向上游提交内核补丁。
            </p>
            <p className="text-sm text-muted-foreground/70 mb-10 font-mono">
              # 目标：成为能向 amd-gfx 邮件列表提交 patch 的 AMD 工程师
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href={`/module/${continueModule.id}`}>
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #E8441A, #FF6B35)' }}>
                  {totalCompleted > 0 ? '继续学习' : '开始学习'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <a href="https://github.com/torvalds/linux/tree/master/drivers/gpu/drm/amd" target="_blank" rel="noopener noreferrer">
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-border/60 text-foreground/80 hover:border-border hover:text-foreground transition-all"
                  style={{ background: 'var(--card)' }}>
                  <Code2 className="w-4 h-4" />
                  查看 AMDGPU 源码
                </button>
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--background))' }} />
      </section>

      {/* Progress Overview (shown when user has started) */}
      {totalCompleted > 0 && (
        <section className="border-y border-border/50 py-6" style={{ background: 'var(--sidebar)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: 'oklch(0.75 0.18 35)' }} />
              <h3 className="text-sm font-semibold text-foreground">你的学习进度</h3>
              <span className="text-xs text-muted-foreground/60 ml-auto">
                已完成 {totalCompleted} / {curriculum.length} 个模块
              </span>
            </div>
            <div className="flex gap-1.5">
              {curriculum.map((module) => {
                const status = getModuleStatus(module.id);
                return (
                  <Link key={module.id} href={`/module/${module.id}`}>
                    <div
                      title={`${module.title} - ${status === 'completed' ? '已完成' : status === 'in-progress' ? '进行中' : '未开始'}`}
                      className="h-2 rounded-full flex-1 cursor-pointer transition-all hover:opacity-80"
                      style={{
                        minWidth: '20px',
                        background: status === 'completed'
                          ? 'oklch(0.65 0.18 145)'
                          : status === 'in-progress'
                            ? 'oklch(0.75 0.18 35)'
                            : 'oklch(0.18 0.015 255)',
                      }}
                    />
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/50">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.65 0.18 145)' }} />
                已完成
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.75 0.18 35)' }} />
                进行中
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.18 0.015 255)' }} />
                未开始
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Bar */}
      <section className="border-y border-border/50" style={{ background: 'var(--sidebar)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, label: '学习模块', value: `${curriculum.length} 个` },
              { icon: Clock, label: '预计总时长', value: `${totalHours}+ 小时` },
              { icon: Code2, label: '代码示例', value: '50+ 个' },
              { icon: Target, label: '面试题库', value: '40+ 题' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'oklch(0.62 0.22 35 / 0.12)', border: '1px solid oklch(0.62 0.22 35 / 0.25)' }}>
                  <stat.icon className="w-5 h-5" style={{ color: 'oklch(0.75 0.18 35)' }} />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staged Learning Path */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-2">五阶段学习路径</h2>
          <p className="text-muted-foreground text-sm">从基础到专家，循序渐进——每个阶段都建立在前一阶段的基础上</p>
        </div>

        <div className="space-y-6">
          {STAGES.map((stage, stageIdx) => {
            const stageModules = stage.modules.map(id => curriculum.find(m => m.id === id)).filter(Boolean) as typeof curriculum;
            const stageCompleted = stageModules.filter(m => getModuleStatus(m.id) === 'completed').length;
            const stageTotal = stageModules.length;

            return (
              <div key={stageIdx} className="rounded-xl border overflow-hidden"
                style={{ background: stage.bg, borderColor: stage.border }}>
                {/* Stage Header */}
                <div className="px-5 py-3 flex items-center justify-between border-b"
                  style={{ borderColor: stage.border, background: 'var(--muted)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{ background: `${stage.color.replace('oklch', 'oklch').replace(')', ' / 0.15)')}`, color: stage.color }}>
                      Stage {stageIdx + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: stage.color }}>
                    {stageCompleted === stageTotal && stageTotal > 0 ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : stageCompleted > 0 ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4 opacity-40" />
                    )}
                    <span>{stageCompleted}/{stageTotal}</span>
                  </div>
                </div>

                {/* Stage Modules */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stageModules.map((module, modIdx) => {
                    const status = getModuleStatus(module.id);
                    return (
                      <Link key={module.id} href={`/module/${module.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-opacity-70 group"
                          style={{
                            background: 'var(--card)',
                            borderColor: status === 'completed' ? 'oklch(0.55 0.18 145 / 0.4)' : 'oklch(0.20 0.015 255)',
                          }}>
                          {/* Status Icon */}
                          <div className="flex-shrink-0">
                            {status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5" style={{ color: 'oklch(0.65 0.18 145)' }} />
                            ) : status === 'in-progress' ? (
                              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                style={{ borderColor: 'oklch(0.75 0.18 35)' }}>
                                <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.75 0.18 35)' }} />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-border/40" />
                            )}
                          </div>

                          {/* Module Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-sm">{module.icon}</span>
                              <span className="text-xs font-medium text-foreground/85 truncate group-hover:text-foreground transition-colors">
                                {module.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
                              <span className={difficultyColors[module.difficulty]}>{difficultyLabels[module.difficulty]}</span>
                              <span>·</span>
                              <span>{module.estimatedHours}h</span>
                            </div>
                          </div>

                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bootcamp Format Explanation */}
      <section className="border-t border-border/50 py-16" style={{ background: 'var(--sidebar)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Bootcamp 学习格式</h2>
          <p className="text-muted-foreground text-sm mb-10">每个模块都遵循相同的四段式结构，确保理论与实践的深度结合</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: BookOpen,
                label: '理论讲解',
                desc: '精炼的概念解释 + ASCII 架构图解 + 精选官方参考链接。95% 的问题不需要翻官方文档。',
                color: 'oklch(0.70 0.18 200)',
              },
              {
                icon: Code2,
                label: '代码阅读',
                desc: '真实内核代码片段 + 逐行注释 + 函数调用链分析。直接阅读 amdgpu 驱动源码。',
                color: 'oklch(0.75 0.18 35)',
              },
              {
                icon: Target,
                label: '实战项目',
                desc: '可执行的 Mini Project，从编写内核模块到分析 GPU Hang，每章都有具体的动手任务。',
                color: 'oklch(0.70 0.18 280)',
              },
              {
                icon: Zap,
                label: '面试题库',
                desc: 'AMD 工程师面试真题，包含可折叠的提示和参考答案。直接对标 AMD Markham 岗位要求。',
                color: 'oklch(0.70 0.20 50)',
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-5 border border-border/40"
                style={{ background: 'var(--card)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${item.color.replace(')', ' / 0.12)')}`, border: `1px solid ${item.color.replace(')', ' / 0.3)')}` }}>
                  <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{item.label}</h3>
                <p className="text-xs text-muted-foreground/75 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8441A, #FF6B35)' }}>
              <Cpu className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm text-muted-foreground">AMD Driver Learning Platform</span>
          </div>
          <div className="text-xs text-muted-foreground/50 text-center">
            Built for AMD Markham Engineer Track · RX 7600 XT (Navi33) · Linux AMDGPU Driver
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <a href="https://docs.kernel.org/gpu/amdgpu/index.html" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors">AMDGPU Docs</a>
            <a href="https://rocm.docs.amd.com" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors">ROCm Docs</a>
            <a href="https://llvm.org/docs/" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground transition-colors">LLVM Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
