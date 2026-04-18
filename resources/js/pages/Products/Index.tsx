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
import { CategoryModel, PaginatedData, ProductModel } from '@/types';
import { Box, Edit, Package, Plus, Search, Trash2, Warehouse } from 'lucide-react';
import { useConfirm } from '@/components/confirm-provider';
import { useFlash } from '@/hooks/use-flash';
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
            <Head title="Products" />
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
            title: 'Delete Product?',
            description: `This will permanently remove "${product.name}" from your inventory.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });
        if (!isConfirmed) return;
        router.delete(`/products/${product.id}`, { preserveScroll: true });
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatNumber = (num: number) =>
        new Intl.NumberFormat('id-ID').format(num);

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage your store inventory. {products.total} product{products.total !== 1 ? 's' : ''} total.
                    </p>
                </div>
                <Button size="sm" onClick={() => router.visit('/products/create')}>
                    <Plus className="mr-1 size-4" />
                    Add Product
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
                            <p className="text-xs text-muted-foreground">Total Products</p>
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
                            <p className="text-xs text-muted-foreground">Stock Value</p>
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
                        placeholder="Search products..."
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
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
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
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Buy Price</TableHead>
                            <TableHead className="text-center">Stock</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                    No products found.
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
                                        {product.is_active ? 'Active' : 'Inactive'}
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

            {/* Pagination */}
            {products.last_page > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-sm text-muted-foreground">
                        Showing {products.from} to {products.to} of {products.total} results
                    </p>
                    <div className="flex items-center gap-1">
                        {products.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => {
                                    if (link.url) {
                                        router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                    }
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
