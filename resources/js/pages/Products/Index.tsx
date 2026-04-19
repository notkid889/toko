import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { PaginationNav } from '@/components/ui/pagination-nav';
import { CategoryModel, PaginatedData, ProductModel } from '@/types';
import { Box, Edit, Package, Plus, Search, Trash2, Warehouse } from 'lucide-react';
import { useConfirm } from '@/components/confirm-provider';
import { useFlash } from '@/hooks/use-flash';
import { formatPrice, formatNumber } from '@/lib/formatters';
import { useState, useCallback } from 'react';

type Props = {
    products: PaginatedData<ProductModel>;
    categories: { id: number; name: string }[];
    summary: { total_products: number; total_value: number };
    filters: {
        search: string;
        category: string;
    };
};

export default function Index({ products, categories, filters, summary }: Props) {
    return (
        <AppLayout>
            <Head title="Produk" />
            <ProductContent products={products} categories={categories} filters={filters} summary={summary} />
        </AppLayout>
    );
}

function ProductContent({ products, categories, filters, summary }: Props) {
    const { confirm } = useConfirm();
    useFlash();

    const [search, setSearch] = useState(filters.search || '');

    const applyFilters = useCallback(
        (params: Record<string, string>) => {
            const query: Record<string, string> = {
                search: params.search ?? search,
                category: params.category ?? filters.category,
            };

            // Remove empty params
            Object.keys(query).forEach((key) => {
                if (!query[key]) delete query[key];
            });

            router.get('/products', query, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [search, filters.category],
    );

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilters({ search });
    }

    function handleCategoryFilter(value: string) {
        applyFilters({ category: value === 'all' ? '' : value });
    }

    async function handleDelete(product: ProductModel) {
        const isConfirmed = await confirm({
            title: 'Hapus Produk?',
            description: `Produk "${product.name}" akan dihapus secara permanen dari inventori Anda.`,
            confirmText: 'Hapus',
            cancelText: 'Batal',
        });
        if (!isConfirmed) return;
        router.delete(`/products/${product.id}`, { preserveScroll: true });
    }



    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Produk</h1>
                    <p className="text-muted-foreground text-sm">
                        Kelola inventori toko Anda. Total {products.total} produk.
                    </p>
                </div>
                <Button size="sm" onClick={() => router.visit('/products/create')}>
                    <Plus className="mr-1 size-4" />
                    Tambah Produk
                </Button>
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
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="search-products"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </form>

                <Select
                    value={filters.category || 'all'}
                    onValueChange={handleCategoryFilter}
                >
                    <SelectTrigger className="w-48" id="filter-category">
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
            </div>

            {/* Table */}
            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-sidebar">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produk</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead className="text-right">Harga Beli</TableHead>
                            <TableHead className="text-center">Stok</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                    Produk tidak ditemukan.
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
                                            className="h-10 w-10 rounded-lg object-cover border"
                                        />
                                        <div>
                                            <span className="font-medium block">{product.name}</span>
                                            <span className="text-xs text-muted-foreground">{product.unit}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="text-xs rounded bg-muted px-1.5 py-0.5">
                                        {product.sku}
                                    </code>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {product.category?.name || '—'}
                                </TableCell>
                                <TableCell className="text-right font-medium tabular-nums">
                                    {formatPrice(product.price)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={product.stock <= 10 ? 'text-destructive font-medium' : ''}>
                                        {product.stock}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                        {product.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => router.visit(`/products/${product.id}/edit`)}
                                        >
                                            <Edit className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            className="text-destructive"
                                            onClick={() => handleDelete(product)}
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
                from={products.from}
                to={products.to}
                total={products.total}
                lastPage={products.last_page}
                links={products.links}
                itemLabel="produk"
            />
        </div>
    );
}
