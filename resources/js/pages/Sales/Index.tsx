import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PaginatedData, SaleModel } from '@/types';
import { Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useConfirm } from '@/components/confirm-provider';
import { useFlash } from '@/hooks/use-flash';
import { useState } from 'react';

type Props = {
    sales: PaginatedData<SaleModel>;
    filters: {
        search: string;
    };
};

export default function Index({ sales, filters }: Props) {
    return (
        <AppLayout>
            <Head title="Sales" />
            <SaleContent sales={sales} filters={filters} />
        </AppLayout>
    );
}

function SaleContent({ sales, filters }: Props) {
    const { confirm } = useConfirm();
    useFlash();
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const query: Record<string, string> = {};
        if (search) query.search = search;
        router.get('/sales', query, { preserveState: true, preserveScroll: true });
    }

    async function handleDelete(sale: SaleModel) {
        const isConfirmed = await confirm({
            title: 'Delete Sale?',
            description: `This will delete invoice "${sale.invoice_number}" and restore the stock.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });
        if (!isConfirmed) return;
        router.delete(`/sales/${sale.id}`, { preserveScroll: true });
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
                    <p className="text-muted-foreground text-sm">
                        Record product sales to customers. {sales.total} record{sales.total !== 1 ? 's' : ''} total.
                    </p>
                </div>
                <Button size="sm" onClick={() => router.visit('/sales/create')}>
                    <Plus className="mr-1 size-4" />
                    New Sale
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="search-sales"
                        placeholder="Search by invoice or customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </form>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-sidebar">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-center">Items</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                    No sale records found.
                                </TableCell>
                            </TableRow>
                        )}
                        {sales.data.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell>
                                    <code className="text-xs rounded bg-muted px-1.5 py-0.5 font-medium">
                                        {sale.invoice_number}
                                    </code>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {sale.customer || <span className="text-muted-foreground">—</span>}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary">{sale.items_count ?? 0}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium tabular-nums">
                                    {formatPrice(sale.total)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => router.visit(`/sales/${sale.id}`)}
                                        >
                                            <Eye className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            className="text-destructive"
                                            onClick={() => handleDelete(sale)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {sales.last_page > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-muted-foreground">
                        Showing {sales.from} to {sales.to} of {sales.total} results
                    </p>
                    <div className="flex items-center gap-1">
                        {sales.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => {
                                    if (link.url) router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className="min-w-[36px]"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
