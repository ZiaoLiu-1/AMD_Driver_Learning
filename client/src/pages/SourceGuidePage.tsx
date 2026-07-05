import { Link } from 'wouter';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from 'react-i18next';
import { getSourceStages, KERNEL_TAG } from '@/data/source_roadmap';
import { ArrowLeft, FileCode, ExternalLink, CheckCircle2, Circle, GitBranch } from 'lucide-react';
import { useSourceProgress } from '@/hooks/useSourceProgress';
import type { Locale } from '@/data/curriculum_index';
import { motion } from 'framer-motion';

export default function SourceGuidePage() {
  const { locale } = useLocale();
  const { t } = useTranslation();
  const stages = getSourceStages(locale as Locale);
  const { toggleFile, isFileCompleted, getStageProgress } = useSourceProgress();

  const totalFiles = stages.reduce((acc, stage) => acc + stage.files.length, 0);
  const totalCompleted = stages.reduce((acc, stage) => acc + getStageProgress(stage.files).completed, 0);
  const overallProgress = totalFiles > 0 ? Math.round((totalCompleted / totalFiles) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <span className="min-h-[44px] flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              {t('nav.home') || 'Home'}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {t('sourceGuide.filesProgress', { completed: totalCompleted, total: totalFiles }) || `${totalCompleted} of ${totalFiles} files read`}
            </span>
            <div className="w-20 sm:w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-[width] duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="text-xs font-mono font-medium text-primary w-8">{overallProgress}%</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20">
              <FileCode className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{t('sourceGuide.pageTitle') || 'Source Code Navigator'}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('sourceGuide.pageSubtitle') || 'A guided tour through the central components of the AMD Linux driver stack.'}
          </p>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/50">
              <GitBranch className="w-3 h-3" />
              {locale === 'zh'
                ? `源码链接基于 Linux ${KERNEL_TAG} LTS（2026-07 校对）`
                : `Source links pinned to Linux ${KERNEL_TAG} LTS (audited 2026-07)`}
            </span>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground/70 max-w-2xl mx-auto">
            {locale === 'zh'
              ? `锚定 LTS 保证 file:line 稳定可复现，但主线在继续演进——例如 amdgpu 用户态队列（userq）在 Linux 6.16 才合入、${KERNEL_TAG} 中不存在。面试引用源码时报出版本号，是加分而不是减分。`
              : `Pinning to an LTS keeps file:line references stable and reproducible, but mainline keeps moving — e.g. amdgpu user-mode queues (userq) only landed in Linux 6.16 and do not exist in ${KERNEL_TAG}. Quoting the kernel version when citing source in an interview is a plus, not a weakness.`}
          </p>
        </div>

        <div className="relative">
          {stages.map((stage, sIdx) => {
            const stageProgress = getStageProgress(stage.files);
            const isStageComplete = stageProgress.percentage === 100;

            return (
              <div key={stage.id} className="relative mb-8 md:mb-12">
                {/* Desktop Side Hierarchy Line */}
                <div className="hidden md:block absolute top-0 bottom-0 left-[60px] w-px bg-border/50" />

                <div className="flex flex-col md:flex-row gap-6 md:gap-12 relative z-10">
                  {/* Stage Number & hierarchy node */}
                  <div className="md:w-32 shrink-0 flex md:flex-col items-center gap-4 md:gap-2 pt-2 md:pl-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 text-base font-bold bg-background transition-colors shadow-sm ${isStageComplete ? 'border-success text-success bg-success/5' : 'border-primary text-primary'
                      }`}>
                      {stage.number}
                    </div>
                    <div className="text-sm font-semibold text-foreground md:text-center flex-1">
                      {stage.title}
                    </div>
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 md:p-8 border-b border-border/50 bg-muted/10">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-muted-foreground leading-relaxed flex-1">
                          {stage.description}
                        </p>
                        <div className="shrink-0 text-xs font-mono font-medium px-3 py-1 rounded bg-muted/60 text-muted-foreground">
                          {stageProgress.completed}/{stageProgress.total} {t('sourceGuide.filesLabel') || 'Files'}
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-border/50">
                      {stage.files.map((file, fIdx) => {
                        const isDone = isFileCompleted(file.path);

                        return (
                          <div key={file.path} className={`p-6 md:p-8 transition-colors ${isDone ? 'bg-muted/10' : 'hover:bg-muted/30'}`}>
                            {/* Hierarchy nested branch for desktop inside card */}
                            <div className="flex gap-4">
                              <div className="mt-1">
                                <button
                                  role="checkbox"
                                  aria-checked={isDone}
                                  aria-label={`${isDone ? 'Mark as unread' : 'Mark as read'}: ${file.path}`}
                                  onClick={() => toggleFile(file.path)}
                                  className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${isDone ? 'bg-success text-white border-success' : 'bg-background border-border hover:border-primary text-muted-foreground'
                                    }`}
                                >
                                  {isDone && <CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
                                </button>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <GitBranch className="w-4 h-4 text-primary shrink-0 hidden sm:block" />
                                      <code className="text-sm md:text-base font-mono font-semibold text-foreground/90 truncate break-all">
                                        {file.path}
                                      </code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{file.description}</p>
                                  </div>
                                  <a
                                    href={file.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors shrink-0"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    {file.externalUrl.includes('bootlin') ? t('sourceGuide.viewOnBootlin') || 'Bootlin Elixir' : t('sourceGuide.viewOnGitHub') || 'GitHub'}
                                  </a>
                                </div>

                                <div className="space-y-4 pt-2">
                                  <div className="bg-background border border-border/50 rounded-xl p-4">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                      {t('sourceGuide.keyFunctions') || 'Key Functions'}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {file.keyFunctions.map((fn) => (
                                        <code key={fn} className="text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary font-mono border border-primary/10">
                                          {fn}()
                                        </code>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="bg-background border border-border/50 rounded-xl p-4">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                      {t('sourceGuide.readingNotes') || 'Reading Notes'}
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
                                      {file.readingNotes}
                                    </p>
                                  </div>

                                  {file.relatedConcepts.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs text-muted-foreground font-medium mr-1">{t('sourceGuide.relatedConcepts') || 'Concepts'}:</span>
                                      {file.relatedConcepts.map((c) => (
                                        <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground/80 font-medium">
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
