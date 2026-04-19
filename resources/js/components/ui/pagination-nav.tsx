import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationNavProps {
    from: number | null;
    to: number | null;
    total: number;
    lastPage: number;
    links: PaginationLink[];
    /** Label for items, e.g. "produk", "data" */
    itemLabel?: string;
}

/**
 * Reusable pagination component for paginated list pages.
 * Only renders if there are multiple pages.
 */
export function PaginationNav({
    from,
    to,
    total,
    lastPage,
    links,
    itemLabel = 'data',
}: PaginationNavProps) {
    if (lastPage <= 1) return null;

    return (
        <div className="flex items-center justify-between px-2">
            <p className="text-sm text-muted-foreground">
                Menampilkan {from} sampai {to} dari {total} {itemLabel}
            </p>
            <div className="flex items-center gap-1">
                {links.map((link, index) => (
                    <Button
                        key={index}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={!link.url}
                        onClick={() => {
                            if (link.url) {
                                router.get(
                                    link.url,
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }
                        }}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className="min-w-[36px]"
                    />
                ))}
            </div>
        </div>
    );
}
