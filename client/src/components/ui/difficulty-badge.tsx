import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DifficultyTone =
  | "success"
  | "info"
  | "warning"
  | "destructive"
  | "accent";

const difficultyToneClasses: Record<DifficultyTone, string> = {
  success: "border-success/20 bg-success/10 text-success",
  info: "border-info/20 bg-info/10 text-info",
  warning: "border-warning/20 bg-warning/10 text-warning",
  destructive: "border-destructive/20 bg-destructive/10 text-destructive",
  accent: "border-chart-4/20 bg-chart-4/10 text-chart-4",
};

export const moduleDifficultyTones = {
  beginner: "success",
  intermediate: "info",
  advanced: "destructive",
  expert: "accent",
} as const satisfies Record<string, DifficultyTone>;

export const lessonDifficultyTones = {
  beginner: "success",
  intermediate: "info",
  advanced: "destructive",
  expert: "accent",
} as const satisfies Record<string, DifficultyTone>;

export const interviewDifficultyTones = {
  easy: "success",
  medium: "warning",
  hard: "destructive",
} as const satisfies Record<string, DifficultyTone>;

export const assessmentDifficultyTones = {
  core: "success",
  advanced: "warning",
  expert: "destructive",
} as const satisfies Record<string, DifficultyTone>;

interface DifficultyBadgeProps extends React.ComponentProps<typeof Badge> {
  tone: DifficultyTone;
  mono?: boolean;
  uppercase?: boolean;
}

export function DifficultyBadge({
  className,
  tone,
  mono = true,
  uppercase = false,
  children,
  ...props
}: DifficultyBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider",
        difficultyToneClasses[tone],
        mono && "font-mono",
        uppercase && "uppercase",
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  );
}
