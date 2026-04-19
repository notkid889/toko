import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import InputError from '@/components/ui/input-errors';
import { ProductOption } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import { ProductCombobox } from '@/components/ui/product-combobox';
import { formatPrice } from '@/lib/formatters';

type ItemRow = {
    product_id: string;
    quantity: string;
    price: string;
};

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<{
        customer: string;
        notes: string;
        date: string;
        items: ItemRow[];
    }>({
        customer: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        items: [{ product_id: '', quantity: '1', price: '' }],
    });

    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    // Store product data (stock, price) by product_id for display
    const productDataRef = useRef<Map<string, ProductOption>>(new Map());

    function addItem() {
        setData('items', [...data.items, { product_id: '', quantity: '1', price: '' }]);
    }

    function removeItem(index: number) {
        const removed = data.items[index];
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems.length > 0 ? newItems : [{ product_id: '', quantity: '1', price: '' }]);

        if (removed.product_id) {
            const newSet = new Set(selectedProducts);
            newSet.delete(removed.product_id);
            setSelectedProducts(newSet);
        }
    }

    function updateItem(index: number, field: keyof ItemRow, value: string) {
        const newItems = [...data.items];
        const oldProductId = newItems[index].product_id;
        newItems[index] = { ...newItems[index], [field]: value };

        setData('items', newItems);

        if (field === 'product_id') {
            const newSet = new Set(selectedProducts);
            if (oldProductId) newSet.delete(oldProductId);
            if (value) newSet.add(value);
            setSelectedProducts(newSet);
        }
    }

    function handleProductSelect(index: number, product: ProductOption) {
        productDataRef.current.set(String(product.id), product);

        // Auto-fill price from product's sell price
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            product_id: String(product.id),
            price: newItems[index].price || String(product.price),
        };

        const newSet = new Set(selectedProducts);
        const oldProductId = data.items[index].product_id;
        if (oldProductId) newSet.delete(oldProductId);
        newSet.add(String(product.id));
        setSelectedProducts(newSet);

        setData('items', newItems);
    }

    function getProductStock(productId: string): number {
        return productDataRef.current.get(productId)?.stock ?? 0;
    }

    function getTotal() {
        return data.items.reduce((sum, item) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            return sum + qty * price;
        }, 0);
    }



    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/sales');
    }

    return (
        <AppLayout>
            <Head title="Penjualan Baru" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Penjualan Baru</h1>
                    <p className="text-muted-foreground text-sm">
                        Catat penjualan produk baru ke pelanggan.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Penjualan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer">Pelanggan</Label>
                                    <Input
                                        id="customer"
                                        value={data.customer}
                                        onChange={(e) => setData('customer', e.target.value)}
                                        placeholder="Nama pelanggan (opsional)"
                                    />
                                    <InputError message={errors.customer} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Tanggal</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                    />
                                    <InputError message={errors.date} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Catatan</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Catatan opsional..."
                                    rows={2}
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Item</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="mr-1 size-4" />
                                Tambah Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <InputError message={errors.items} className="mb-3" />
                            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[35%]">Produk</TableHead>
                                            <TableHead className="w-[10%] text-center">Stok</TableHead>
                                            <TableHead className="w-[13%]">Jml</TableHead>
                                            <TableHead className="w-[18%]">Harga/Unit</TableHead>
                                            <TableHead className="w-[18%] text-right">Subtotal</TableHead>
                                            <TableHead className="w-[6%]" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.items.map((item, index) => {
                                            const subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
                                            const stock = getProductStock(item.product_id);
                                            const isOverStock = item.product_id && Number(item.quantity) > stock;
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <ProductCombobox
                                                            value={item.product_id}
                                                            onChange={(v) => updateItem(index, 'product_id', v)}
                                                            onProductSelect={(p) => handleProductSelect(index, p)}
                                                            excludeIds={selectedProducts}
                                                            showStock
                                                            inStockOnly
                                                        />
                                                        <InputError message={(errors as any)[`items.${index}.product_id`]} />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.product_id ? (
                                                            <span className={`text-sm font-medium ${stock <= 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                                {stock}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max={stock || undefined}
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                            className={isOverStock ? 'border-destructive' : ''}
                                                        />
                                                        {isOverStock && (
                                                            <p className="text-xs text-destructive mt-0.5">Melebihi stok</p>
                                                        )}
                                                        <InputError message={(errors as any)[`items.${index}.quantity`]} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.price}
                                                            onChange={(e) => updateItem(index, 'price', e.target.value)}
                                                            placeholder="0"
                                                        />
                                                        <InputError message={(errors as any)[`items.${index}.price`]} />
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium tabular-nums">
                                                        {formatPrice(subtotal)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            className="text-destructive"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total Keseluruhan</p>
                                    <p className="text-2xl font-bold tabular-nums">{formatPrice(getTotal())}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Penjualan'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.visit('/sales')}>
                            Batal
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
