import * as LucideIcons from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Dynamically resolve a Lucide icon by name.
 * No need to manually register each icon — just use the exact Lucide component name.
 *
 * Example: getIcon("Package") → <Package />
 */
export default function getIcon(iconName?: string): ReactNode {
    if (!iconName) return null;

    const Icon = (LucideIcons as Record<string, any>)[iconName];

    if (!Icon) {
        // Fallback for unknown icons
        return (
            <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                />
            </svg>
        );
    }

    return <Icon />;
}
