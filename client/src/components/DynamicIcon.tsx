import React from "react";
import * as LucideIcons from "lucide-react";

export interface DynamicIconProps extends LucideIcons.LucideProps {
    name: string;
}

/**
 * Dynamically renders a Lucide icon based on its string name.
 * Automatically falls back to 'HelpCircle' if the icon is not found.
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
    // Convert kabab-case or snake_case to PascalCase (if needed)
    const toPascalCase = (str: string) =>
        str
            .split(/[-_]+/)
            .map(
                (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join("");

    const iconName = toPascalCase(name);
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;

    return <IconComponent {...props} />;
}
