import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import LocaleRedirect from "./components/LocaleRedirect";
import { changeLanguage } from "./lib/i18n";
import { Loader2 } from "lucide-react";

// Route-level code splitting: each page (and the content data it
// dynamically imports) loads on demand instead of in the entry chunk.
const NotFound = lazy(() => import("@/pages/NotFound"));
const Home = lazy(() => import("./pages/Home"));
const ModulePage = lazy(() => import("./pages/ModulePage"));
const MicroLessonPage = lazy(() => import("./pages/MicroLessonPage"));
const SetupGuide = lazy(() => import("./pages/SetupGuide"));
const GlossaryPage = lazy(() => import("./pages/GlossaryPage"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
const LabsListPage = lazy(() => import("./pages/LabsListPage"));
const LabDetailPage = lazy(() => import("./pages/LabDetailPage"));
const AssessmentPage = lazy(() => import("./pages/AssessmentPage"));
const SourceGuidePage = lazy(() => import("./pages/SourceGuidePage"));
const RadarPage = lazy(() => import("./pages/RadarPage"));
// Lazy so the search dialog (and framer-motion) stays out of the entry chunk
const GlobalSearch = lazy(() => import("./components/GlobalSearch"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/60" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function InnerRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/setup" component={SetupGuide} />
        <Route path="/glossary" component={GlossaryPage} />
        <Route path="/practice" component={PracticePage} />
        <Route path="/labs" component={LabsListPage} />
        <Route path="/labs/:labId" component={LabDetailPage} />
        <Route path="/assessment" component={AssessmentPage} />
        <Route path="/source-guide" component={SourceGuidePage} />
        <Route path="/radar" component={RadarPage} />
        <Route path="/module/:moduleId" component={ModulePage} />
        <Route path="/module/:moduleId/lesson/:lessonId" component={MicroLessonPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function LocaleRouter({ locale }: { locale: "zh" | "en" }) {
  // The first paint is already localized: lib/i18n.ts resolves the initial
  // language from the URL before React mounts. Calling changeLanguage during
  // render would setState useTranslation subscribers mid-render, so any
  // later cross-locale transition syncs in an effect instead.
  useEffect(() => {
    changeLanguage(locale);
  }, [locale]);
  return (
    <LocaleProvider locale={locale} onLocaleChange={(l) => changeLanguage(l)}>
      <InnerRoutes />
      <Suspense fallback={null}>
        <GlobalSearch />
      </Suspense>
    </LocaleProvider>
  );
}

function MainRouter() {
  return (
    <Switch>
      <Route path="/" component={LocaleRedirect} />
      <Route path="/zh" nest>
        <LocaleRouter locale="zh" />
      </Route>
      <Route path="/en" nest>
        <LocaleRouter locale="en" />
      </Route>
      <Route component={LocaleRedirect} />
    </Switch>
  );
}

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");

function App() {
  return (
    <ErrorBoundary>
      <Router base={routerBase}>
        <ThemeProvider defaultTheme="light" switchable={true}>
          <ProgressProvider>
            <TooltipProvider>
              <Toaster />
              <MainRouter />
            </TooltipProvider>
          </ProgressProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
