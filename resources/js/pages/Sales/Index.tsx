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
import { PaginationNav } from '@/components/ui/pagination-nav';
import { PaginatedData, SaleModel } from '@/types';
import { Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useConfirm } from '@/components/confirm-provider';
import { useFlash } from '@/hooks/use-flash';
import { formatPrice, formatDate } from '@/lib/formatters';
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
            <Head title="Penjualan" />
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
            title: 'Hapus Penjualan?',
            description: `Invoice "${sale.invoice_number}" akan dihapus dan stok akan dikembalikan.`,
            confirmText: 'Hapus',
            cancelText: 'Batal',
        });
        if (!isConfirmed) return;
        router.delete(`/sales/${sale.id}`, { preserveScroll: true });
    }



    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Penjualan</h1>
                    <p className="text-muted-foreground text-sm">
                        Catat penjualan produk ke pelanggan. Total {sales.total} data.
                    </p>
                </div>
                <Button size="sm" onClick={() => router.visit('/sales/create')}>
                    <Plus className="mr-1 size-4" />
                    Penjualan Baru
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="search-sales"
                        placeholder="Cari invoice atau pelanggan..."
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
                            <TableHead>Pelanggan</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead className="text-center">Item</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                    Data penjualan tidak ditemukan.
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
                                    {formatDate(sale.date)}
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

            <PaginationNav
                from={sales.from}
                to={sales.to}
                total={sales.total}
                lastPage={sales.last_page}
                links={sales.links}
            />
        </div>
    );
}
