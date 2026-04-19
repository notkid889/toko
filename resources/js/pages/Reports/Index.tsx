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
import {
    ReportSummary,
    SalesTrendItem,
    TopProduct,
    RecentTransaction,
} from '@/types';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    BarChart3,
    Calendar,
    DollarSign,
    Package,
    Receipt,
    ShoppingCart,
    TrendingUp,
    Truck,
} from 'lucide-react';
import { useState, useMemo } from 'react';

type Props = {
    summary: ReportSummary;
    salesTrend: SalesTrendItem[];
    topProducts: TopProduct[];
    recentTransactions: RecentTransaction[];
    filters: {
        period: string;
        start_date: string;
        end_date: string;
    };
};

const PERIOD_OPTIONS = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'year', label: 'Tahun Ini' },
    { value: 'custom', label: 'Kustom' },
];

export default function ReportsIndex({ summary, salesTrend, topProducts, recentTransactions, filters }: Props) {
    return (
        <AppLayout>
            <Head title="Laporan" />
            <ReportsContent
                summary={summary}
                salesTrend={salesTrend}
                topProducts={topProducts}
                recentTransactions={recentTransactions}
                filters={filters}
            />
        </AppLayout>
    );
}

function ReportsContent({ summary, salesTrend, topProducts, recentTransactions, filters }: Props) {
    const [period, setPeriod] = useState(filters.period);
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    function applyFilter(newPeriod: string) {
        setPeriod(newPeriod);
        const query: Record<string, string> = { period: newPeriod };
        if (newPeriod === 'custom') {
            query.start_date = startDate;
            query.end_date = endDate;
        }
        router.get('/reports', query, { preserveState: true, preserveScroll: true });
    }

    function applyCustom() {
        router.get('/reports', { period: 'custom', start_date: startDate, end_date: endDate }, { preserveState: true, preserveScroll: true });
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const formatNumber = (num: number) =>
        new Intl.NumberFormat('id-ID').format(num);

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
                    <p className="text-muted-foreground text-sm">
                        Ringkasan penjualan, pembelian, dan performa produk.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.visit('/finance')}>
                        <DollarSign className="mr-1 size-4" />
                        Keuangan
                    </Button>
                </div>
            </div>

            {/* Period Filter */}
            <div className="flex flex-wrap items-center gap-2">
                {PERIOD_OPTIONS.map((opt) => (
                    <Button
                        key={opt.value}
                        variant={period === opt.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyFilter(opt.value)}
                    >
                        {opt.label}
                    </Button>
                ))}
                {period === 'custom' && (
                    <div className="flex items-center gap-2 ml-2">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-36 h-8 text-sm"
                            id="report-start-date"
                        />
                        <span className="text-sm text-muted-foreground">—</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-36 h-8 text-sm"
                            id="report-end-date"
                        />
                        <Button size="sm" onClick={applyCustom}>
                            Terapkan
                        </Button>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border bg-sidebar p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <ShoppingCart className="size-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total Penjualan</p>
                            <p className="text-sm md:text-lg font-bold tabular-nums">{formatPrice(summary.total_sales)}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-sidebar p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                            <Truck className="size-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total Pembelian</p>
                            <p className="text-sm md:text-lg font-bold tabular-nums">{formatPrice(summary.total_purchases)}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-sidebar p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <Receipt className="size-5 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Transaksi Jual</p>
                            <p className="text-xl font-bold tabular-nums">{formatNumber(summary.sales_count)}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-sidebar p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <Package className="size-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Transaksi Beli</p>
                            <p className="text-xl font-bold tabular-nums">{formatNumber(summary.purchases_count)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Trend Chart */}
            <div className="rounded-xl border border-sidebar-border/70 bg-sidebar p-4 dark:border-sidebar-border">
                <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="size-5 text-emerald-500" />
                    <h2 className="font-semibold">Tren Penjualan</h2>
                    <span className="text-xs text-muted-foreground ml-auto">
                        {filters.start_date} — {filters.end_date}
                    </span>
                </div>
                <SalesTrendChart data={salesTrend} />
            </div>

            {/* Bottom Grid: Top Products + Recent Transactions */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Top Products */}
                <div className="rounded-xl border border-sidebar-border/70 bg-sidebar dark:border-sidebar-border">
                    <div className="flex items-center gap-2 p-4 pb-2">
                        <BarChart3 className="size-5 text-violet-500" />
                        <h2 className="font-semibold">Produk Terlaris</h2>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead>Produk</TableHead>
                                <TableHead className="text-center">Jml</TableHead>
                                <TableHead className="text-right">Pendapatan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topProducts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                                        Belum ada data penjualan.
                                    </TableCell>
                                </TableRow>
                            )}
                            {topProducts.map((product, index) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <span className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                                            index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                                            index === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' :
                                            index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' :
                                            'bg-muted text-muted-foreground'
                                        }`}>
                                            {index + 1}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <span className="block text-sm font-medium">{product.name}</span>
                                            <code className="text-xs text-muted-foreground">{product.sku}</code>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center tabular-nums font-medium">
                                        {formatNumber(product.quantity_sold)}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums font-medium text-sm">
                                        {formatPrice(product.revenue)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Recent Transactions */}
                <div className="rounded-xl border border-sidebar-border/70 bg-sidebar dark:border-sidebar-border">
                    <div className="flex items-center gap-2 p-4 pb-2">
                        <Calendar className="size-5 text-blue-500" />
                        <h2 className="font-semibold">Transaksi Terbaru</h2>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Pihak</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                                        Belum ada transaksi.
                                    </TableCell>
                                </TableRow>
                            )}
                            {recentTransactions.map((tx) => (
                                <TableRow
                                    key={`${tx.type}-${tx.id}`}
                                    className="cursor-pointer hover:bg-accent/50"
                                    onClick={() => router.visit(`/${tx.type === 'sale' ? 'sales' : 'purchases'}/${tx.id}`)}
                                >
                                    <TableCell>
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                                            {tx.invoice_number}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        {tx.type === 'sale' ? (
                                            <Badge variant="outline" className="gap-1 border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
                                                <ArrowUpFromLine className="size-3" />
                                                Jual
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="gap-1 border-blue-500/50 text-blue-600 dark:text-blue-400">
                                                <ArrowDownToLine className="size-3" />
                                                Beli
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {tx.party || <span className="text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums font-medium text-sm">
                                        {formatPrice(tx.total)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

/* ==================== Sales Trend SVG Chart ==================== */

function SalesTrendChart({ data }: { data: SalesTrendItem[] }) {
    const chartHeight = 200;
    const chartPadding = { top: 20, right: 10, bottom: 40, left: 10 };

    const { bars, maxVal, yLabels } = useMemo(() => {
        if (data.length === 0) return { bars: [], maxVal: 0, yLabels: [] };

        const maxVal = Math.max(...data.map((d) => d.total), 1);
        const barWidth = Math.max(4, Math.min(40, (800 - chartPadding.left - chartPadding.right) / data.length - 2));
        const totalWidth = data.length * (barWidth + 2);

        const bars = data.map((d, i) => {
            const h = (d.total / maxVal) * (chartHeight - chartPadding.top - chartPadding.bottom);
            return {
                x: chartPadding.left + i * (barWidth + 2),
                y: chartHeight - chartPadding.bottom - h,
                width: barWidth,
                height: Math.max(h, 0),
                value: d.total,
                label: d.label,
            };
        });

        // Generate y-axis labels
        const steps = 4;
        const yLabels = Array.from({ length: steps + 1 }, (_, i) => {
            const val = (maxVal / steps) * i;
            return {
                value: val,
                y: chartHeight - chartPadding.bottom - (i / steps) * (chartHeight - chartPadding.top - chartPadding.bottom),
            };
        });

        return { bars, maxVal, yLabels };
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                Tidak ada data penjualan untuk periode ini.
            </div>
        );
    }

    const formatCompact = (val: number) => {
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
        return String(Math.round(val));
    };

    const svgWidth = Math.max(bars.length * (bars[0]?.width + 2 || 10) + chartPadding.left + chartPadding.right, 300);

    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${svgWidth} ${chartHeight}`}
                className="w-full min-w-[300px]"
                style={{ maxHeight: `${chartHeight}px` }}
            >
                {/* Grid lines */}
                {yLabels.map((yl, i) => (
                    <g key={i}>
                        <line
                            x1={chartPadding.left}
                            x2={svgWidth - chartPadding.right}
                            y1={yl.y}
                            y2={yl.y}
                            className="stroke-border"
                            strokeWidth={0.5}
                            strokeDasharray={i === 0 ? 'none' : '4 2'}
                        />
                        <text
                            x={chartPadding.left}
                            y={yl.y - 4}
                            className="fill-muted-foreground"
                            fontSize={8}
                        >
                            {formatCompact(yl.value)}
                        </text>
                    </g>
                ))}

                {/* Gradient */}
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.4} />
                    </linearGradient>
                </defs>

                {/* Bars */}
                {bars.map((bar, i) => (
                    <g key={i}>
                        <rect
                            x={bar.x}
                            y={bar.y}
                            width={bar.width}
                            height={bar.height}
                            fill="url(#barGradient)"
                            rx={2}
                            className="transition-all duration-200 hover:opacity-80"
                        >
                            <title>{`${bar.label}: ${new Intl.NumberFormat('id-ID').format(bar.value)}`}</title>
                        </rect>
                        {/* Labels — show every Nth label to avoid overlap */}
                        {(data.length <= 15 || i % Math.ceil(data.length / 15) === 0) && (
                            <text
                                x={bar.x + bar.width / 2}
                                y={chartHeight - chartPadding.bottom + 14}
                                textAnchor="middle"
                                className="fill-muted-foreground"
                                fontSize={7}
                                transform={data.length > 10 ? `rotate(-45, ${bar.x + bar.width / 2}, ${chartHeight - chartPadding.bottom + 14})` : ''}
                            >
                                {bar.label}
                            </text>
                        )}
                    </g>
                ))}
            </svg>
        </div>
    );
}
