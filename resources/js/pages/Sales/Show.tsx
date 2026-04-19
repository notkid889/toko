import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { SaleModel } from '@/types';
import { ArrowLeft } from 'lucide-react';

type Props = {
    sale: SaleModel;
};

export default function Show({ sale }: Props) {
    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    return (
        <AppLayout>
            <Head title={`Penjualan ${sale.invoice_number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Detail Penjualan</h1>
                        <p className="text-muted-foreground text-sm">
                            Invoice: {sale.invoice_number}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.visit('/sales')}>
                        <ArrowLeft className="mr-1 size-4" />
                        Kembali
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pelanggan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold">{sale.customer || '—'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tanggal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold">
                                {new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold tabular-nums">{formatPrice(sale.total)}</p>
                        </CardContent>
                    </Card>
                </div>

                {sale.notes && (
                    <Card className="max-w-4xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Catatan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{sale.notes}</p>
                        </CardContent>
                    </Card>
                )}

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produk</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead className="text-center">Jml</TableHead>
                                        <TableHead className="text-right">Harga/Unit</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sale.items?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.product?.name || 'Produk Dihapus'}
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs rounded bg-muted px-1.5 py-0.5">
                                                    {item.product?.sku || '—'}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right tabular-nums">{formatPrice(item.price)}</TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">{formatPrice(item.subtotal)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-right font-bold">
                                            Total Keseluruhan
                                        </TableCell>
                                        <TableCell className="text-right font-bold tabular-nums text-lg">
                                            {formatPrice(sale.total)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
