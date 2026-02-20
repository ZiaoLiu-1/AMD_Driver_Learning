import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { LocaleProvider } from "./contexts/LocaleContext";
import Home from "./pages/Home";
import ModulePage from "./pages/ModulePage";
import MicroLessonPage from "./pages/MicroLessonPage";
import SetupGuide from "./pages/SetupGuide";
import GlossaryPage from "./pages/GlossaryPage";
import PracticePage from "./pages/PracticePage";
import { SearchModal, useSearchShortcut } from "./components/SearchModal";
import LocaleRedirect from "./components/LocaleRedirect";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "./lib/i18n";

function InnerRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/setup" component={SetupGuide} />
      <Route path="/glossary" component={GlossaryPage} />
      <Route path="/practice" component={PracticePage} />
      <Route path="/module/:moduleId" component={ModulePage} />
      <Route path="/module/:moduleId/lesson/:lessonId" component={MicroLessonPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function SearchButton() {
  const [searchOpen, setSearchOpen] = useState(false);
  useSearchShortcut(setSearchOpen);
  const { t } = useTranslation();

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <button
        onClick={() => setSearchOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-full border border-border/60 bg-background shadow-lg text-xs text-muted-foreground/60 hover:text-foreground hover:border-border transition-all sm:hidden">
        🔍 {t("search.button")}
      </button>
    </>
  );
}

function LocaleRouter({ locale }: { locale: "zh" | "en" }) {
  useEffect(() => {
    changeLanguage(locale);
  }, [locale]);
  return (
    <Router base={`/${locale}`}>
      <LocaleProvider locale={locale} onLocaleChange={(l) => changeLanguage(l)}>
        <InnerRoutes />
        <SearchButton />
      </LocaleProvider>
    </Router>
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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <ProgressProvider>
          <TooltipProvider>
            <Toaster />
            <MainRouter />
          </TooltipProvider>
        </ProgressProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
