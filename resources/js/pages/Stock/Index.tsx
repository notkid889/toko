import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import InputError from '@/components/ui/input-errors';
import { PaginationNav } from '@/components/ui/pagination-nav';
import { PaginatedData, ProductModel } from '@/types';
import {
    AlertTriangle,
    ArrowDownToLine,
    ArrowUpFromLine,
    Box,
    History,
    Loader2,
    Minus,
    Package,
    PackageX,
    Plus,
    Search,
    ShoppingCart,
    SlidersHorizontal,
    Truck,
    Warehouse,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { useFlash } from '@/hooks/use-flash';
import { formatPrice, formatNumber } from '@/lib/formatters';
import axios from 'axios';

interface StockProduct extends ProductModel {
    total_in: number;
    total_out: number;
    total_adj: number;
}

interface AdjustmentRecord {
    id: number;
    quantity: number;
    type: string;
    notes: string | null;
    date: string;
    created_at: string;
}

type Props = {
    products: PaginatedData<StockProduct>;
    summary: {
        total_products: number;
        total_stock: number;
        total_value: number;
        low_stock: number;
        out_of_stock: number;
    };
    categories: { id: number; name: string }[];
    filters: {
        search: string;
        category: string;
        status: string;
    };
};

export default function StockIndex({ products, summary, categories, filters }: Props) {
    return (
        <AppLayout>
            <Head title="Manajemen Stok" />
            <StockContent products={products} summary={summary} categories={categories} filters={filters} />
        </AppLayout>
    );
}

function StockContent({ products, summary, categories, filters }: Props) {
    useFlash();
    const [search, setSearch] = useState(filters.search || '');
    const [adjustProduct, setAdjustProduct] = useState<StockProduct | null>(null);
    const [historyProduct, setHistoryProduct] = useState<StockProduct | null>(null);

    const applyFilters = useCallback(
        (params: Record<string, string>) => {
            const query: Record<string, string> = {
                search: params.search ?? search,
                category: params.category ?? filters.category,
                status: params.status ?? filters.status,
            };

            Object.keys(query).forEach((key) => {
                if (!query[key]) delete query[key];
            });

            router.get('/stock', query, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [search, filters.category, filters.status],
    );

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilters({ search });
    }



    function getStockBadge(stock: number) {
        if (stock <= 0)
            return (
                <Badge variant="destructive" className="gap-1">
                    <PackageX className="size-3" />
                    Stok Habis
                </Badge>
            );
        if (stock <= 10)
            return (
                <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="size-3" />
                    Stok Rendah
                </Badge>
            );
        return (
            <Badge variant="outline" className="gap-1 border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
                <Package className="size-3" />
                Sehat
            </Badge>
        );
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manajemen Stok</h1>
                    <p className="text-muted-foreground text-sm">
                        Pantau level inventori dan pergerakan stok.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.visit('/purchases/create')}>
                        <Truck className="mr-1 size-4" />
                        Pembelian Baru
                    </Button>
                    <Button onClick={() => router.visit('/sales/create')}>
                        <ShoppingCart className="mr-1 size-4" />
                        Penjualan Baru
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border bg-sidebar p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                            <Box className="size-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total Produk</p>
                            <p className="text-xl font-bold tabular-nums">{formatNumber(summary.total_products)}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-sidebar p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <Warehouse className="size-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Nilai Stok</p>
                            <p className="text-sm md:text-lg font-bold tabular-nums">{formatPrice(summary.total_value)}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => applyFilters({ status: filters.status === 'low' ? '' : 'low' })}
                    className="rounded-xl border bg-sidebar p-4 text-left transition-colors hover:bg-accent/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <AlertTriangle className="size-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Stok Rendah</p>
                            <p className="text-xl font-bold tabular-nums">{formatNumber(summary.low_stock)}</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => applyFilters({ status: filters.status === 'out' ? '' : 'out' })}
                    className="rounded-xl border bg-sidebar p-4 text-left transition-colors hover:bg-accent/50"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
                            <PackageX className="size-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Stok Habis</p>
                            <p className="text-xl font-bold tabular-nums">{formatNumber(summary.out_of_stock)}</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <form onSubmit={handleSearch} className="relative max-w-sm flex-1">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="search-stock"
                        placeholder="Cari nama atau SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </form>

                <Select
                    value={filters.category || 'all'}
                    onValueChange={(v) => applyFilters({ category: v === 'all' ? '' : v })}
                >
                    <SelectTrigger className="w-44" id="filter-stock-category">
                        <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.status || 'all'}
                    onValueChange={(v) => applyFilters({ status: v === 'all' ? '' : v })}
                >
                    <SelectTrigger className="w-40" id="filter-stock-status">
                        <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="out">Stok Habis</SelectItem>
                        <SelectItem value="low">Stok Rendah</SelectItem>
                        <SelectItem value="healthy">Sehat</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-sidebar-border/70 bg-sidebar dark:border-sidebar-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produk</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead className="text-right">Harga Beli</TableHead>
                            <TableHead className="text-center">
                                <span className="inline-flex items-center gap-1">
                                    <ArrowDownToLine className="size-3 text-emerald-500" />
                                    Masuk
                                </span>
                            </TableHead>
                            <TableHead className="text-center">
                                <span className="inline-flex items-center gap-1">
                                    <ArrowUpFromLine className="size-3 text-red-500" />
                                    Keluar
                                </span>
                            </TableHead>
                            <TableHead className="text-center">
                                <span className="inline-flex items-center gap-1">
                                    <SlidersHorizontal className="size-3 text-violet-500" />
                                    Adj
                                </span>
                            </TableHead>
                            <TableHead className="text-center">Stok</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                                    Produk tidak ditemukan sesuai filter.
                                </TableCell>
                            </TableRow>
                        )}
                        {products.data.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="h-9 w-9 rounded-lg object-cover border"
                                        />
                                        <div>
                                            <span className="block font-medium text-sm">{product.name}</span>
                                            <span className="text-xs text-muted-foreground">{product.unit}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                        {product.sku}
                                    </code>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {product.category?.name || '—'}
                                </TableCell>
                                <TableCell className="text-right font-medium tabular-nums text-sm">
                                    {formatPrice(product.price)}
                                </TableCell>
                                <TableCell className="text-center tabular-nums">
                                    <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                                        {product.total_in > 0 ? `+${product.total_in}` : '0'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center tabular-nums">
                                    <span className="text-red-600 dark:text-red-400 text-sm">
                                        {product.total_out > 0 ? `-${product.total_out}` : '0'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center tabular-nums">
                                    <span className={`text-sm ${product.total_adj > 0 ? 'text-violet-600 dark:text-violet-400' : product.total_adj < 0 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                                        {product.total_adj > 0 ? `+${product.total_adj}` : product.total_adj < 0 ? String(product.total_adj) : '0'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={`font-bold tabular-nums text-sm ${product.stock <= 0 ? 'text-destructive' : product.stock <= 10 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                                        {product.stock}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    {getStockBadge(product.stock)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            title="Riwayat Penyesuaian"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setHistoryProduct(product);
                                            }}
                                        >
                                            <History className="size-3.5" />
                                            Riwayat
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            title="Penyesuaian"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAdjustProduct(product);
                                            }}
                                        >
                                            <SlidersHorizontal className="size-3.5" />
                                            Sesuaikan
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <PaginationNav
                from={products.from}
                to={products.to}
                total={products.total}
                lastPage={products.last_page}
                links={products.links}
                itemLabel="produk"
            />

            {/* Adjustment Dialog */}
            <AdjustmentDialog
                product={adjustProduct}
                onClose={() => setAdjustProduct(null)}
            />

            {/* History Dialog */}
            <HistoryDialog
                product={historyProduct}
                onClose={() => setHistoryProduct(null)}
            />
        </div>
    );
}

function AdjustmentDialog({
    product,
    onClose,
}: {
    product: StockProduct | null;
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: '',
        quantity: '',
        type: 'correction',
        notes: '',
    });

    const [direction, setDirection] = useState<'add' | 'subtract'>('add');

    // Reset form when product changes
    const prevProductId = useState<number | null>(null);
    if (product && product.id !== prevProductId[0]) {
        prevProductId[1](product.id);
        data.product_id = String(product.id);
        data.quantity = '';
        data.type = 'correction';
        data.notes = '';
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const qty = parseInt(data.quantity);
        if (isNaN(qty) || qty <= 0 || !product) return;

        const actualQty = direction === 'subtract' ? -qty : qty;

        // Use router.post directly since useForm data shape differs from what we need to send
        router.post('/stock/adjust', {
            product_id: product.id,
            quantity: actualQty,
            type: data.type,
            notes: data.notes,
        }, {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveScroll: true,
        });
    }

    return (
        <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Penyesuaian Stok</DialogTitle>
                    <DialogDescription>
                        {product && (
                            <>
                                Sesuaikan stok untuk <strong>{product.name}</strong>.
                                Stok saat ini: <strong>{product.stock} {product.unit}</strong>
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Direction Toggle */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setDirection('add')}
                            className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${direction === 'add'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : 'border-border hover:bg-accent'
                                }`}
                        >
                            <Plus className="size-4" />
                            Tambah Stok
                        </button>
                        <button
                            type="button"
                            onClick={() => setDirection('subtract')}
                            className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${direction === 'subtract'
                                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                : 'border-border hover:bg-accent'
                                }`}
                        >
                            <Minus className="size-4" />
                            Kurangi Stok
                        </button>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="adj-quantity">Jumlah</Label>
                        <Input
                            id="adj-quantity"
                            type="number"
                            min="1"
                            value={data.quantity}
                            onChange={(e) => setData('quantity', e.target.value)}
                            placeholder="Masukkan jumlah"
                            autoFocus
                        />
                        <InputError message={errors.quantity} />
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <Label htmlFor="adj-type">Alasan</Label>
                        <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                            <SelectTrigger id="adj-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="correction">Koreksi Inventori</SelectItem>
                                <SelectItem value="damage">Barang Rusak</SelectItem>
                                <SelectItem value="return">Retur Pelanggan</SelectItem>
                                <SelectItem value="initial">Stok Awal</SelectItem>
                                <SelectItem value="other">Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type} />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="adj-notes">Catatan <span className="text-muted-foreground">(opsional)</span></Label>
                        <Textarea
                            id="adj-notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Alasan penyesuaian..."
                            rows={2}
                        />
                        <InputError message={errors.notes} />
                    </div>

                    {/* Preview */}
                    {data.quantity && parseInt(data.quantity) > 0 && product && (
                        <div className="rounded-lg border bg-muted/30 p-3">
                            <p className="text-sm text-muted-foreground">
                                Stok akan berubah dari{' '}
                                <strong className="text-foreground">{product.stock}</strong>
                                {' → '}
                                <strong className={direction === 'add' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                                    {direction === 'add'
                                        ? product.stock + parseInt(data.quantity)
                                        : product.stock - parseInt(data.quantity)}
                                </strong>
                                {' '}{product.unit}
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.quantity || parseInt(data.quantity) <= 0}
                            className={direction === 'subtract' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            {processing ? 'Menyimpan...' : direction === 'add' ? 'Tambah Stok' : 'Kurangi Stok'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function HistoryDialog({
    product,
    onClose,
}: {
    product: StockProduct | null;
    onClose: () => void;
}) {
    const [records, setRecords] = useState<AdjustmentRecord[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch history when product changes
    const [fetchedId, setFetchedId] = useState<number | null>(null);
    if (product && product.id !== fetchedId) {
        setFetchedId(product.id);
        setLoading(true);
        setRecords([]);
        axios
            .get(`/stock/${product.id}/history`, { withCredentials: true, withXSRFToken: true })
            .then((res) => setRecords(res.data))
            .finally(() => setLoading(false));
    }

    return (
        <Dialog open={!!product} onOpenChange={(open) => { if (!open) { onClose(); setFetchedId(null); } }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Riwayat Penyesuaian</DialogTitle>
                    <DialogDescription>
                        {product && (
                            <>
                                Riwayat untuk <strong>{product.name}</strong> ({product.sku})
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    </div>
                ) : records.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        Belum ada penyesuaian tercatat.
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto -mx-4 px-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead className="text-center">Jml</TableHead>
                                    <TableHead>Catatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((adj) => (
                                    <TableRow key={adj.id}>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {new Date(adj.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                            <span className="ml-1 text-xs opacity-60">
                                                {new Date(adj.created_at).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <AdjustmentTypeBadge type={adj.type} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span
                                                className={`inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums ${adj.quantity > 0
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                                    }`}
                                            >
                                                {adj.quantity > 0 ? '+' : ''}{adj.quantity}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                            {adj.notes || '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AdjustmentTypeBadge({ type }: { type: string }) {
    const config: Record<string, { label: string; className: string }> = {
        correction: {
            label: 'Koreksi',
            className: 'border-blue-500/50 text-blue-600 dark:text-blue-400',
        },
        damage: {
            label: 'Rusak',
            className: 'border-red-500/50 text-red-600 dark:text-red-400',
        },
        return: {
            label: 'Retur',
            className: 'border-amber-500/50 text-amber-600 dark:text-amber-400',
        },
        initial: {
            label: 'Stok Awal',
            className: 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400',
        },
        other: {
            label: 'Lainnya',
            className: 'border-gray-500/50 text-gray-600 dark:text-gray-400',
        },
    };

    const { label, className } = config[type] ?? config.other;

    return (
        <Badge variant="outline" className={className}>
            {label}
        </Badge>
    );
}
