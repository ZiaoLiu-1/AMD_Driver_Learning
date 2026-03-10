import { useTranslation } from "react-i18next";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <main className="w-full max-w-lg mx-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20">
            <AlertCircle className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-foreground mb-2 font-mono">404</h1>

        <h2 className="text-xl font-semibold text-foreground/80 mb-4">
          {t("notFound.title")}
        </h2>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          {t("notFound.description")}
        </p>

        <Button
          onClick={handleGoHome}
          variant="brand"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          {t("notFound.back")}
        </Button>
      </main>
    </div>
  );
}
