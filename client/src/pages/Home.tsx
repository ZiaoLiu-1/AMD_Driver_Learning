/* ============================================================
   AMD Linux Driver Learning Platform - Home Page
   Design: Deep Space Tech Aesthetic
   - Hero section with AMD GPU background image
   - Progress overview bar
   - Course overview grid with 12 module cards
   - Staged learning path timeline
   ============================================================ */

import { Link } from "wouter";
import { difficultyColors } from "@/data/curriculum";
import { getCurriculum, getTotalHours, getDifficultyLabels } from "@/data/curriculum_index";
import { getMicroLessonsByModule } from "@/data/micro_lessons_index";
import { useProgress } from "@/contexts/ProgressContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useSwitchLocale } from "@/lib/useSwitchLocale";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, BookOpen, Code2, Target, ChevronRight, Cpu, Zap, CheckCircle2, Circle, Loader2, BarChart3, Terminal, Sun, Moon, GraduationCap, BookMarked, Languages, ClipboardCheck, FlaskConical, FileCode } from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";
import { getPhases } from "@/data/engineering_phases";
import { PhaseRoadmap } from "@/components/home/PhaseRoadmap";
import { PhaseCardGrid } from "@/components/home/PhaseCardGrid";
import { PhaseProgressOverview } from "@/components/home/PhaseProgressOverview";

export default function Home() {
  const { locale, basePath } = useLocale();
  const { switchLocale } = useSwitchLocale();
  const { t } = useTranslation();
  const { getModuleStatus, getTotalCompleted, getPhaseProgress, getOverallPhaseProgress } = useProgress();
  const { theme, toggleTheme } = useTheme();

  const curriculum = getCurriculum(locale);
  const phases = getPhases(locale as any);
  const totalHours = getTotalHours(locale);
  const difficultyLabels = getDifficultyLabels(locale);
  const microLessonsByModule = getMicroLessonsByModule(locale);

  const totalCompleted = getTotalCompleted();
  const progressPct = Math.round((totalCompleted / curriculum.length) * 100);

  const continueModule = curriculum.find(m => getModuleStatus(m.id) !== 'completed') ?? curriculum[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8441A, #FF6B35)' }}>
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-wide text-foreground/90">AMD Driver Learning Platform</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/labs"><span className="hover:text-foreground transition-colors cursor-pointer hidden md:flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5" />{t("nav.labs") || 'Labs'}</span></Link>
            <Link href="/assessment"><span className="hover:text-foreground transition-colors cursor-pointer hidden md:flex items-center gap-1.5"><ClipboardCheck className="w-3.5 h-3.5" />{t("nav.assessment") || 'Assessment'}</span></Link>
            <Link href="/source-guide"><span className="hover:text-foreground transition-colors cursor-pointer hidden md:flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5" />{t("nav.sourceGuide") || 'Source Code'}</span></Link>
            <Link href="/practice"><span className="hover:text-foreground transition-colors cursor-pointer hidden md:flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" />{t("nav.practice")}</span></Link>
            <Link href="/glossary"><span className="hover:text-foreground transition-colors cursor-pointer hidden md:flex items-center gap-1.5"><BookMarked className="w-3.5 h-3.5" />{t("nav.glossary")}</span></Link>
            <Link href="/setup"><span className="hover:text-foreground transition-colors cursor-pointer hidden md:flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" />{t("nav.setup")}</span></Link>
            <a href="https://docs.kernel.org/gpu/amdgpu/index.html" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden lg:block">{t("nav.kernelDocs")}</a>
            <button onClick={switchLocale} className="flex items-center justify-center gap-1 w-14 py-1 rounded text-xs border border-border/50 hover:border-border transition-colors" title={locale === "zh" ? "Switch to English" : "切换到中文"}>
              <Languages className="w-3.5 h-3.5" />
              <span>{locale === "zh" ? "En" : "中"}</span>
            </button>
            <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:text-foreground hover:bg-muted/50 transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a href="https://github.com/torvalds/linux/tree/master/drivers/gpu/drm/amd" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden md:block">{t("nav.sourceCode")}</a>
            <a href="https://lists.freedesktop.org/mailman/listinfo/amd-gfx" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden md:block">{t("nav.mailingList")}</a>
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
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden bg-background">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-30 mix-blend-screen bg-primary/40 blur-[120px] animate-blob"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full opacity-20 mix-blend-screen bg-blue-500/30 blur-[120px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full opacity-20 mix-blend-screen bg-orange-500/30 blur-[120px] animate-blob animation-delay-4000"></div>
          {/* Decorative Large Text Background to fill empty space */}
          <div className="absolute right-[-2%] top-[15%] opacity-5 pointer-events-none select-none hidden lg:block" style={{ transform: 'rotate(-5deg)' }}>
            <div className="text-[220px] font-black leading-[0.85] tracking-tighter" style={{ background: 'linear-gradient(to bottom right, var(--foreground), transparent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              RDNA3<br />NAVI33
            </div>
          </div>
          <div className="hero-bg-layer absolute inset-0 mix-blend-overlay opacity-50 dark:opacity-60"></div>
        </div>

        <div className="absolute inset-0 hero-overlay backdrop-blur-[2px]" />
        <div className="absolute inset-0 opacity-10 dark:opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 border"
              style={{ background: 'rgba(232, 68, 26, 0.15)', borderColor: 'rgba(232, 68, 26, 0.4)', color: '#FFB347' }}>
              <Zap className="w-3 h-3" />
              AMD Markham Engineer Track · RX 7600 XT (Navi33 / gfx1102)
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
              <span className="text-foreground">{t("home.heroTitle1")}</span>
              <br />
              <span className="amd-gradient-text">{t("home.heroTitle2")}</span>
              <br />
              <span className="text-foreground">{t("home.heroTitle3")}</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-4 leading-relaxed max-w-2xl">
              {t("home.heroDesc")}
            </p>
            <p className="text-sm text-muted-foreground/70 mb-10 font-mono">
              {t("home.heroGoal")}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link href={`/module/${continueModule.id}`}>
                <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all amd-glow hover-lift"
                  style={{ background: 'linear-gradient(135deg, #E8441A, #FF6B35)' }}>
                  {totalCompleted > 0 ? t("home.continueLearning") : t("home.startLearning")}
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>
              </Link>
              <Link href="/setup">
                <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold glass-panel text-foreground hover:bg-muted/50 hover-lift transition-all">
                  <Terminal className="w-5 h-5" />
                  {t("home.setupEnv")}
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--background))' }} />
      </section>

      {/* Progress Overview (shown when user has started) */}
      {totalCompleted > 0 && (
        <section className="border-y border-border/50 py-2 sm:py-3" style={{ background: 'var(--sidebar)' }}>
          <PhaseProgressOverview
            phases={phases}
            getPhaseProgress={getPhaseProgress}
            overall={getOverallPhaseProgress()}
          />
        </section>
      )}

      {/* Stats Bar */}
      <section className="border-y border-border/50" style={{ background: 'var(--sidebar)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, label: t("home.statsLabelModules"), value: t("home.statsModules", { count: curriculum.length }) },
              { icon: Clock, label: t("home.statsLabelHours"), value: t("home.statsHours", { count: totalHours }) },
              { icon: Code2, label: t("home.statsLabelCode"), value: t("home.statsCode") },
              { icon: Target, label: t("home.statsLabelQuestions"), value: t("home.statsQuestions") },
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

      {/* Phase Roadmap and Modules Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-6 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold text-foreground mb-3">{t("home.pathTitle")}</h2>
          <p className="text-muted-foreground text-sm max-w-2xl">{t("home.pathSubtitle")}</p>
        </div>

        {/* 1. Phase Roadmap Visualization */}
        <PhaseRoadmap
          phases={phases}
          getPhaseProgress={getPhaseProgress}
          getModuleStatus={getModuleStatus}
          locale={locale}
        />

        {/* 2. Phase Card Grid */}
        <PhaseCardGrid
          phases={phases}
          getPhaseProgress={getPhaseProgress}
          getModuleStatus={getModuleStatus}
          locale={locale}
        />
      </section>

      {/* Bootcamp Format Explanation */}
      <section className="border-t border-border/50 py-16" style={{ background: 'var(--sidebar)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("home.bootcampTitle")}</h2>
          <p className="text-muted-foreground text-sm mb-10">{t("home.bootcampSubtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: t("home.theoryLabel"), desc: t("home.theoryDesc"), color: 'oklch(0.70 0.18 200)' },
              { icon: Code2, label: t("home.codeLabel"), desc: t("home.codeDesc"), color: 'oklch(0.75 0.18 35)' },
              { icon: Target, label: t("home.projectLabel"), desc: t("home.projectDesc"), color: 'oklch(0.70 0.18 280)' },
              { icon: Zap, label: t("home.interviewLabel"), desc: t("home.interviewDesc"), color: 'oklch(0.70 0.20 50)' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-6 border border-border/40 glass-panel hover-lift transition-all"
                style={{ background: 'var(--card)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 amd-glow"
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
