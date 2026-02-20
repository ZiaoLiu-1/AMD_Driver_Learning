/* ============================================================
   AMD Linux Driver Learning Platform - Home Page
   Design: Deep Space Tech Aesthetic
   - Hero section with AMD GPU background image
   - Progress overview bar
   - Course overview grid with 12 module cards
   - Staged learning path timeline
   ============================================================ */

import { Link, useLocation } from "wouter";
import { difficultyColors } from "@/data/curriculum";
import { getCurriculum, getTotalHours, getDifficultyLabels } from "@/data/curriculum_index";
import { getMicroLessonsByModule } from "@/data/micro_lessons_index";
import { useProgress } from "@/contexts/ProgressContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, BookOpen, Code2, Target, ChevronRight, Cpu, Zap, CheckCircle2, Circle, Loader2, BarChart3, Terminal, Sun, Moon, GraduationCap, BookMarked, Languages } from "lucide-react";

const HERO_BG_GRADIENT = "radial-gradient(ellipse at 30% 20%, oklch(0.22 0.06 260) 0%, oklch(0.08 0.02 250) 50%, oklch(0.04 0.01 240) 100%)";

const STAGE_KEYS = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5'] as const;
const STAGE_MODULES = [
  ['intro', 'ecosystem', 'prerequisites'],
  ['hardware', 'kernel'],
  ['drm', 'amdgpu'],
  ['debugging', 'rocm-kernel', 'rocm-compute'],
  ['llvm', 'testing', 'career'],
];

export default function Home() {
  const { locale, setLocale, basePath } = useLocale();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const { getModuleStatus, getTotalCompleted } = useProgress();
  const { theme, toggleTheme } = useTheme();

  const curriculum = getCurriculum(locale);
  const totalHours = getTotalHours(locale);
  const difficultyLabels = getDifficultyLabels(locale);
  const microLessonsByModule = getMicroLessonsByModule(locale);

  const totalCompleted = getTotalCompleted();
  const progressPct = Math.round((totalCompleted / curriculum.length) * 100);

  const continueModule = curriculum.find(m => getModuleStatus(m.id) !== 'completed') ?? curriculum[0];

  const switchLocale = () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh';
    setLocale(newLocale);
    const path = window.location.pathname;
    const newPath = path.replace(/^\/(zh|en)/, `/${newLocale}`) || `/${newLocale}`;
    navigate(newPath);
  };

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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/practice"><span className="hover:text-foreground transition-colors cursor-pointer hidden md:flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" />{t("nav.practice")}</span></Link>
            <Link href="/glossary"><span className="hover:text-foreground transition-colors cursor-pointer hidden md:flex items-center gap-1.5"><BookMarked className="w-3.5 h-3.5" />{t("nav.glossary")}</span></Link>
            <Link href="/setup"><span className="hover:text-foreground transition-colors cursor-pointer hidden md:flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" />{t("nav.setup")}</span></Link>
            <a href="https://docs.kernel.org/gpu/amdgpu/index.html" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors hidden lg:block">{t("nav.kernelDocs")}</a>
            <button onClick={switchLocale} className="flex items-center gap-1 px-2 py-1 rounded text-xs border border-border/50 hover:border-border transition-colors" title={locale === "zh" ? "Switch to English" : "切换到中文"}>
              <Languages className="w-3.5 h-3.5" />
              {locale === "zh" ? "En" : "中"}
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

            <div className="flex flex-wrap gap-4">
              <Link href={`/module/${continueModule.id}`}>
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #E8441A, #FF6B35)' }}>
                  {totalCompleted > 0 ? t("home.continueLearning") : t("home.startLearning")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/setup">
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-primary/40 text-primary hover:border-primary/70 hover:bg-primary/5 transition-all">
                  <Terminal className="w-4 h-4" />
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
        <section className="border-y border-border/50 py-6" style={{ background: 'var(--sidebar)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: 'oklch(0.75 0.18 35)' }} />
              <h3 className="text-sm font-semibold text-foreground">{t("home.yourProgress")}</h3>
              <span className="text-xs text-muted-foreground/60 ml-auto">
                {t("home.completedModules", { count: totalCompleted, total: curriculum.length })}
              </span>
            </div>
            <div className="flex gap-1.5">
              {curriculum.map((module) => {
                const status = getModuleStatus(module.id);
                return (
                  <Link key={module.id} href={`/module/${module.id}`}>
                    <div
                      title={`${module.title} - ${status === 'completed' ? t("home.completed") : status === 'in-progress' ? t("home.inProgress") : t("home.notStarted")}`}
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
                {t("home.completed")}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.75 0.18 35)' }} />
                {t("home.inProgress")}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.18 0.015 255)' }} />
                {t("home.notStarted")}
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

      {/* Staged Learning Path */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("home.pathTitle")}</h2>
          <p className="text-muted-foreground text-sm">{t("home.pathSubtitle")}</p>
        </div>

        <div className="space-y-6">
          {STAGE_MODULES.map((mods, stageIdx) => {
            const stageModules = mods.map(id => curriculum.find(m => m.id === id)).filter(Boolean) as typeof curriculum;
            const stageLabel = t(`home.${STAGE_KEYS[stageIdx]}`);
            const stageStyle = [
              { color: 'oklch(0.70 0.18 145)', bg: 'oklch(0.55 0.18 145 / 0.1)', border: 'oklch(0.55 0.18 145 / 0.3)' },
              { color: 'oklch(0.70 0.18 200)', bg: 'oklch(0.55 0.18 200 / 0.1)', border: 'oklch(0.55 0.18 200 / 0.3)' },
              { color: 'oklch(0.75 0.18 35)', bg: 'oklch(0.62 0.22 35 / 0.1)', border: 'oklch(0.62 0.22 35 / 0.3)' },
              { color: 'oklch(0.70 0.18 280)', bg: 'oklch(0.55 0.18 280 / 0.1)', border: 'oklch(0.55 0.18 280 / 0.3)' },
              { color: 'oklch(0.70 0.20 50)', bg: 'oklch(0.55 0.20 50 / 0.1)', border: 'oklch(0.55 0.20 50 / 0.3)' },
            ][stageIdx];
            const stageCompleted = stageModules.filter(m => getModuleStatus(m.id) === 'completed').length;
            const stageTotal = stageModules.length;

            return (
              <div key={stageIdx} className="rounded-xl border overflow-hidden"
                style={{ background: stageStyle.bg, borderColor: stageStyle.border }}>
                {/* Stage Header */}
                <div className="px-5 py-3 flex items-center justify-between border-b"
                  style={{ borderColor: stageStyle.border, background: 'var(--muted)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{ background: `${stageStyle.color.replace(')', ' / 0.15)')}`, color: stageStyle.color }}>
                      Stage {stageIdx + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{stageLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: stageStyle.color }}>
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
                              {microLessonsByModule[module.id] && (
                                <>
                                  <span>·</span>
                                  <span className="text-primary/60">
                                    {microLessonsByModule[module.id].groups?.reduce((s, g) => s + g.lessons.length, 0) ?? 0} {t("home.lessons")}
                                  </span>
                                </>
                              )}
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
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("home.bootcampTitle")}</h2>
          <p className="text-muted-foreground text-sm mb-10">{t("home.bootcampSubtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: t("home.theoryLabel"), desc: t("home.theoryDesc"), color: 'oklch(0.70 0.18 200)' },
              { icon: Code2, label: t("home.codeLabel"), desc: t("home.codeDesc"), color: 'oklch(0.75 0.18 35)' },
              { icon: Target, label: t("home.projectLabel"), desc: t("home.projectDesc"), color: 'oklch(0.70 0.18 280)' },
              { icon: Zap, label: t("home.interviewLabel"), desc: t("home.interviewDesc"), color: 'oklch(0.70 0.20 50)' },
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
