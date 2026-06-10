/* ============================================================
   AMD Linux Driver Learning Platform - Home Page
   Design: Deep Space Tech Aesthetic
   - Hero section with AMD GPU background image
   - Progress overview bar
   - Course overview grid with 12 module cards
   - Staged learning path timeline
   ============================================================ */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { getTotalHours, getDifficultyLabels } from "@/data/curriculum_index";
import { useCurriculum, useAllMicroLessonsDeferred } from "@/lib/useContent";
import { useProgress } from "@/contexts/ProgressContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useSwitchLocale } from "@/lib/useSwitchLocale";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, BookOpen, Code2, Target, ChevronRight, Cpu, Zap, CheckCircle2, Circle, Loader2, BarChart3, Terminal, Sun, Moon, GraduationCap, BookMarked, Languages, ClipboardCheck, FlaskConical, FileCode, Menu, X, Play, RotateCcw, Radar } from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";
import { getPhases } from "@/data/engineering_phases";
import { PhaseRoadmap } from "@/components/home/PhaseRoadmap";
import { PhaseCardGrid } from "@/components/home/PhaseCardGrid";
import { PhaseProgressOverview } from "@/components/home/PhaseProgressOverview";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HOME_ONBOARDING_DISMISSED_KEY = "home-onboarding-dismissed";

export default function Home() {
  const { locale, basePath } = useLocale();
  const { switchLocale } = useSwitchLocale();
  const { t } = useTranslation();
  const { getModuleStatus, getTotalCompleted, getPhaseProgress, getOverallPhaseProgress, resetProgress } = useProgress();
  const { theme, toggleTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const curriculum = useCurriculum(locale);
  const phases = getPhases(locale as any);
  const totalHours = getTotalHours(curriculum);
  const difficultyLabels = getDifficultyLabels(locale);
  const microLessonsByModule = useAllMicroLessonsDeferred(locale);

  const totalCompleted = getTotalCompleted();
  const progressPct = Math.round((totalCompleted / curriculum.length) * 100);

  const continueModule = curriculum.find(m => getModuleStatus(m.id) !== 'completed') ?? curriculum[0];

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (totalCompleted > 0) {
      setShowQuickStart(false);
      return;
    }

    setShowQuickStart(localStorage.getItem(HOME_ONBOARDING_DISMISSED_KEY) !== "true");
  }, [totalCompleted]);

  const dismissQuickStart = () => {
    setShowQuickStart(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(HOME_ONBOARDING_DISMISSED_KEY, "true");
    }
  };

  const handleResetProgress = () => {
    resetProgress();
    localStorage.removeItem("amd-driver-platform-lab-progress");
    localStorage.removeItem("amd-driver-platform-source-progress");
    localStorage.removeItem(HOME_ONBOARDING_DISMISSED_KEY);
    setConfirmReset(false);
    setShowQuickStart(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 mr-2 sm:mr-4">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="xl:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded hover:bg-muted/50 transition-colors"
                aria-label={t("nav.openMenu") || "Open navigation menu"}
              >
                <Menu className="w-5 h-5 text-foreground/80" />
              </button>
              <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--brand-end))' }}>
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm tracking-wide text-foreground/90 hidden sm:block">AMD Driver Learning</span>
            </div>

            <nav className="hidden xl:flex items-center gap-4 text-sm text-muted-foreground" aria-label="Main navigation">
              <Link href="/labs" className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />{t("nav.labs") || 'Labs'}</Link>
              <Link href="/radar" className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"><Radar className="w-3.5 h-3.5" aria-hidden="true" />{t("nav.radar") || 'Radar'}</Link>
              <Link href="/assessment" className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"><ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />{t("nav.assessment") || 'Assessment'}</Link>
              <Link href="/source-guide" className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5" aria-hidden="true" />{t("nav.sourceGuide") || 'Source Code'}</Link>
              <Link href="/practice" className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />{t("nav.practice")}</Link>
              <Link href="/glossary" className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"><BookMarked className="w-3.5 h-3.5" aria-hidden="true" />{t("nav.glossary")}</Link>
              <Link href="/setup" className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" aria-hidden="true" />{t("nav.setup")}</Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-sm text-muted-foreground shrink-0">
            <div className="hidden lg:flex items-center gap-4 mr-2">
              <a href="https://docs.kernel.org/gpu/amdgpu/index.html" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">{t("nav.kernelDocs")}</a>
              <a href="https://github.com/torvalds/linux/tree/master/drivers/gpu/drm/amd" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">{t("nav.sourceCode")}</a>
              <a href="https://lists.freedesktop.org/mailman/listinfo/amd-gfx" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">{t("nav.mailingList")}</a>
            </div>

            <div className="w-px h-4 bg-border/50 hidden lg:block" />

            {totalCompleted > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-xs mr-2">
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                  <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, var(--primary), var(--brand-end))' }} />
                </div>
                <span className="font-mono text-[10px]" style={{ color: 'var(--foreground)' }}>{progressPct}%</span>

                {confirmReset ? (
                  <span className="flex items-center gap-1 ml-1">
                    <button
                      onClick={handleResetProgress}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                    >
                      {locale === "zh" ? "确认" : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {locale === "zh" ? "取消" : "Cancel"}
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="ml-1 p-1 rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title={locale === "zh" ? "重置学习进度" : "Reset progress"}
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            <button onClick={switchLocale} className="flex w-[52px] items-center justify-center gap-1 min-h-[44px] rounded border border-border/50 hover:bg-muted/50 transition-colors" title={locale === "zh" ? "Switch to English" : "切换到中文"}>
              <Languages className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs font-medium">{locale === "zh" ? "En" : "中"}</span>
            </button>
            <button onClick={toggleTheme} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded border border-border/50 hover:bg-muted/50 transition-colors" aria-label={theme === 'dark' ? (t("nav.switchToLight") || "Switch to light theme") : (t("nav.switchToDark") || "Switch to dark theme")}>
              {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetTitle className="sr-only">{t("nav.mobileNav") || "Navigation"}</SheetTitle>
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border/50">
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--brand-end))' }}>
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm text-foreground/90">AMD Driver Learning</span>
          </div>
          <nav className="flex flex-col py-3" aria-label="Mobile navigation">
            {[
              { href: "/labs", icon: FlaskConical, label: t("nav.labs") || "Labs" },
              { href: "/radar", icon: Radar, label: t("nav.radar") || "Upstream Radar" },
              { href: "/assessment", icon: ClipboardCheck, label: t("nav.assessment") || "Assessment" },
              { href: "/source-guide", icon: FileCode, label: t("nav.sourceGuide") || "Source Code" },
              { href: "/practice", icon: GraduationCap, label: t("nav.practice") },
              { href: "/glossary", icon: BookMarked, label: t("nav.glossary") },
              { href: "/setup", icon: Terminal, label: t("nav.setup") },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-5 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setMobileNavOpen(false)}
              >
                <item.icon className="w-4 h-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border/50 px-5 py-3 space-y-1">
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2">{t("nav.externalDocs") || "External Docs"}</p>
            <a href="https://docs.kernel.org/gpu/amdgpu/index.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 text-xs text-muted-foreground/70 hover:text-foreground transition-colors">{t("nav.kernelDocs")}</a>
            <a href="https://github.com/torvalds/linux/tree/master/drivers/gpu/drm/amd" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 text-xs text-muted-foreground/70 hover:text-foreground transition-colors">{t("nav.sourceCode")}</a>
            <a href="https://lists.freedesktop.org/mailman/listinfo/amd-gfx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 text-xs text-muted-foreground/70 hover:text-foreground transition-colors">{t("nav.mailingList")}</a>
          </div>
          {totalCompleted > 0 && (
            <div className="border-t border-border/50 px-5 py-3">
              {confirmReset ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-destructive font-medium">
                    {locale === "zh" ? "确认重置全部进度？" : "Reset all progress?"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={handleResetProgress} className="px-3 py-1.5 rounded text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
                      {locale === "zh" ? "确认" : "Yes"}
                    </button>
                    <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 rounded text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                      {locale === "zh" ? "取消" : "No"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-2 w-full py-2 text-xs text-muted-foreground/70 hover:text-destructive transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  {locale === "zh" ? "重置学习进度" : "Reset learning progress"}
                </button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden bg-background">
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full opacity-10 mix-blend-screen bg-info/20 blur-[120px]"></div>
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full opacity-10 mix-blend-screen bg-primary/20 blur-[120px]"></div>
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-primary/15 border-primary/40 text-brand-highlight w-fit">
                <Zap className="w-3 h-3" />
                <span className="hidden sm:inline">AMD Markham Engineer Track · RX 7600 XT (Navi33 / gfx1102)</span>
                <span className="sm:hidden">AMD Engineer Track · Navi33</span>
              </div>
              {totalCompleted > 0 && continueModule && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="w-fit"
                >
                  <Link href={`/module/${continueModule.id}`}>
                    <div className="group flex items-center gap-2.5 pr-4 pl-2 py-1.5 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer w-full sm:w-auto shadow-[0_0_15px_rgba(232,68,26,0.15)]">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Play className="w-2.5 h-2.5 text-primary ml-0.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-bold text-primary uppercase tracking-wider leading-none mb-0.5">{t("home.resumeLearning") || "Resume Learning"}</span>
                        <span className="text-xs font-semibold text-foreground truncate leading-none">{continueModule.title}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary transition-colors ml-1 flex-shrink-0 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 tracking-tight">
              <span className="text-foreground">{t("home.heroTitle1")}</span>
              <br />
              <span className="amd-gradient-text">{t("home.heroTitle2")}</span>
              <br />
              <span className="text-foreground">{t("home.heroTitle3")}</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4 leading-relaxed max-w-2xl">
              {t("home.heroDesc")}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/70 mb-6 sm:mb-10 font-mono">
              {t("home.heroGoal")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button asChild variant="brand" className="h-auto rounded-xl px-6 py-3.5 text-base font-semibold sm:px-8 sm:py-4">
                <Link href={`/module/${continueModule.id}`}>
                  {totalCompleted > 0 ? t("home.continueLearning") : t("home.startLearning")}
                  <ArrowRight className="w-5 h-5 ml-1" aria-hidden="true" />
                </Link>
              </Button>
              <Link href="/setup"
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold border border-border/50 text-foreground hover:bg-muted/50 transition-colors">
                <Terminal className="w-5 h-5" aria-hidden="true" />
                {t("home.setupEnv")}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--background))' }} />
      </section>

      <main>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: BookOpen, label: t("home.statsLabelModules"), value: t("home.statsModules", { count: curriculum.length }) },
                { icon: Clock, label: t("home.statsLabelHours"), value: t("home.statsHours", { count: totalHours }) },
                { icon: Code2, label: t("home.statsLabelCode"), value: t("home.statsCode") },
                { icon: Target, label: t("home.statsLabelQuestions"), value: t("home.statsQuestions") },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 py-2 border-b sm:border-b-0 border-border/40 last:border-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {totalCompleted === 0 && showQuickStart && (
          <section className="border-b border-border/50" style={{ background: 'var(--sidebar)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("home.quickStartEyebrow")}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-2xl space-y-2">
                      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                        {t("home.quickStartTitle")}
                      </h2>
                      <p className="text-sm leading-relaxed text-muted-foreground/80 sm:text-[15px]">
                        {t("home.quickStartDesc")}
                      </p>
                      <p className="text-xs text-muted-foreground/60 sm:text-sm">
                        {t("home.quickStartHint")}
                      </p>
                    </div>

                    <button
                      onClick={dismissQuickStart}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-muted/50 hover:text-foreground"
                      aria-label={t("home.quickStartDismiss")}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="brand" className="h-auto rounded-xl px-5 py-3 text-sm font-semibold">
                      <Link href="/setup" onClick={dismissQuickStart}>
                        <Terminal className="h-4 w-4" aria-hidden="true" />
                        {t("home.quickStartPrimary")}
                      </Link>
                    </Button>
                    <Link
                      href="/module/intro"
                      onClick={dismissQuickStart}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border/50 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
                    >
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      {t("home.quickStartSecondary")}
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {[
                    {
                      icon: Terminal,
                      title: t("home.quickStartSetupTitle"),
                      desc: t("home.quickStartSetupDesc"),
                      meta: t("home.quickStartSetupMeta"),
                    },
                    {
                      icon: BookOpen,
                      title: t("home.quickStartModuleTitle"),
                      desc: t("home.quickStartModuleDesc"),
                      meta: t("home.quickStartModuleMeta"),
                    },
                    {
                      icon: BookMarked,
                      title: t("home.quickStartReferenceTitle"),
                      desc: t("home.quickStartReferenceDesc"),
                      meta: t("home.quickStartReferenceMeta"),
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-border/50 bg-background/50 p-4"
                    >
                      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <h3 className="mb-1 text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="mb-3 text-xs leading-relaxed text-muted-foreground/75">{item.desc}</p>
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/45">
                        {item.meta}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Phase Roadmap and Modules Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
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
            microLessonsByModule={microLessonsByModule ?? {}}
          />
        </section>

        {/* Bootcamp Format Explanation */}
        <section className="border-t border-border/50 py-10 sm:py-16" style={{ background: 'var(--sidebar)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t("home.bootcampTitle")}</h2>
            <p className="text-muted-foreground text-sm mb-6 sm:mb-10">{t("home.bootcampSubtitle")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, label: t("home.theoryLabel"), desc: t("home.theoryDesc"), color: 'oklch(0.70 0.18 200)' },
                { icon: Code2, label: t("home.codeLabel"), desc: t("home.codeDesc"), color: 'oklch(0.75 0.18 35)' },
                { icon: Target, label: t("home.projectLabel"), desc: t("home.projectDesc"), color: 'oklch(0.70 0.18 280)' },
                { icon: Zap, label: t("home.interviewLabel"), desc: t("home.interviewDesc"), color: 'oklch(0.70 0.20 50)' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 py-4"
                  style={{ background: 'transparent' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ background: `${item.color.replace(')', ' / 0.08)')}`, color: item.color }}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{item.label}</h3>
                    <p className="text-xs text-muted-foreground/80 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--brand-end))' }}>
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
