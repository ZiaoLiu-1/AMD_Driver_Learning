import type { LucideIcon, LucideProps } from "lucide-react";
import {
    BookOpen,
    Braces,
    Brain,
    Bug,
    Building,
    Calculator,
    CheckCircle2,
    Compass,
    Cpu,
    Database,
    Flame,
    FlaskConical,
    GitBranch,
    Globe,
    HardDrive,
    HelpCircle,
    Layers,
    Link,
    Mail,
    Map,
    Microscope,
    Monitor,
    Plug,
    Puzzle,
    Radio,
    RefreshCw,
    Rocket,
    Search,
    Target,
    Terminal,
    Wrench,
    Zap,
} from "lucide-react";

export interface DynamicIconProps extends LucideProps {
    name: string;
}

// Explicit map of every icon name referenced by content data (module.icon /
// group.icon strings). A namespace import of lucide-react would defeat
// tree-shaking and ship the full ~750 kB icon set; when content adds a new
// icon name, register it here.
const iconMap: Record<string, LucideIcon> = {
    BookOpen,
    Braces,
    Brain,
    Bug,
    Building,
    Calculator,
    CheckCircle2,
    Compass,
    Cpu,
    Database,
    Flame,
    FlaskConical,
    GitBranch,
    Globe,
    HardDrive,
    HelpCircle,
    Layers,
    Link,
    Mail,
    Map,
    Microscope,
    Monitor,
    Plug,
    Puzzle,
    Radio,
    RefreshCw,
    Rocket,
    Search,
    Target,
    Terminal,
    Wrench,
    Zap,
};

// Convert kabab-case or snake_case to PascalCase (if needed)
const toPascalCase = (str: string) =>
    str
        .split(/[-_]+/)
        .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");

// Exact PascalCase names first: toPascalCase lowercases interior capitals
// ("FlaskConical" → "Flaskconical"), so it only helps kebab/snake input.
export function resolveIcon(name: string): LucideIcon | undefined {
    return iconMap[name] || iconMap[toPascalCase(name)];
}

/**
 * Dynamically renders a Lucide icon based on its string name.
 * Automatically falls back to 'HelpCircle' if the icon is not found.
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
    const IconComponent = resolveIcon(name) || HelpCircle;

    return <IconComponent {...props} />;
}
