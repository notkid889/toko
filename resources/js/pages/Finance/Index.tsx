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
    FinanceSummary,
    MonthlyComparison,
    ProductProfit,
    CashFlowItem,
} from '@/types';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    BarChart3,
    CircleDollarSign,
    DollarSign,
    Percent,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useState, useMemo } from 'react';

type Props = {
    summary: FinanceSummary;
    monthlyComparison: MonthlyComparison[];
    productProfits: ProductProfit[];
    cashFlow: CashFlowItem[];
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

export default function FinanceIndex({ summary, monthlyComparison, productProfits, cashFlow, filters }: Props) {
    return (
        <AppLayout>
            <Head title="Keuangan" />
            <FinanceContent
                summary={summary}
                monthlyComparison={monthlyComparison}
                productProfits={productProfits}
                cashFlow={cashFlow}
                filters={filters}
            />
        </AppLayout>
    );
}

function FinanceContent({ summary, monthlyComparison, productProfits, cashFlow, filters }: Props) {
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
        router.get('/finance', query, { preserveState: true, preserveScroll: true });
    }

    function applyCustom() {
        router.get('/finance', { period: 'custom', start_date: startDate, end_date: endDate }, { preserveState: true, preserveScroll: true });
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
                    <h1 className="text-2xl font-bold tracking-tight">Keuangan</h1>
                    <p className="text-muted-foreground text-sm">
                        Analisis laba rugi, arus kas, dan profitabilitas produk.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.visit('/reports')}>
                        <BarChart3 className="mr-1 size-4" />
                        Laporan
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
                            id="finance-start-date"
                        />
                        <span className="text-sm text-muted-foreground">—</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-36 h-8 text-sm"
                            id="finance-end-date"
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
                            <ArrowDownToLine className="size-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Pemasukan</p>
                            <p className="text-sm md:text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                {formatPrice(summary.total_income)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-sidebar p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
                            <ArrowUpFromLine className="size-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Pengeluaran</p>
                            <p className="text-sm md:text-lg font-bold tabular-nums text-red-600 dark:text-red-400">
                                {formatPrice(summary.total_expense)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-sidebar p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                            <Wallet className="size-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Laba Kotor</p>
                            <p className={`text-sm md:text-lg font-bold tabular-nums ${summary.gross_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formatPrice(summary.gross_profit)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-sidebar p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <Percent className="size-5 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Margin</p>
                            <p className={`text-xl font-bold tabular-nums ${summary.margin_percentage >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {summary.margin_percentage}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Comparison Chart */}
            <div className="rounded-xl border border-sidebar-border/70 bg-sidebar p-4 dark:border-sidebar-border">
                <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="size-5 text-blue-500" />
                    <h2 className="font-semibold">Pemasukan vs Pengeluaran (12 Bulan)</h2>
                    <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <span className="size-2.5 rounded-sm bg-emerald-500 inline-block" />
                            Pemasukan
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="size-2.5 rounded-sm bg-red-400 inline-block" />
                            Pengeluaran
                        </span>
                    </div>
                </div>
                <MonthlyChart data={monthlyComparison} />
            </div>

            {/* Bottom Grid: Product Profits + Cash Flow */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Profit by Product */}
                <div className="rounded-xl border border-sidebar-border/70 bg-sidebar dark:border-sidebar-border">
                    <div className="flex items-center gap-2 p-4 pb-2">
                        <CircleDollarSign className="size-5 text-emerald-500" />
                        <h2 className="font-semibold">Profit per Produk</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead className="text-right">Pendapatan</TableHead>
                                    <TableHead className="text-right">Biaya</TableHead>
                                    <TableHead className="text-right">Laba</TableHead>
                                    <TableHead className="text-center">Margin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productProfits.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                                            Belum ada data transaksi.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {productProfits.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div>
                                                <span className="block text-sm font-medium">{product.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {product.quantity_sold} unit terjual
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-sm">
                                            {formatPrice(product.revenue)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                                            {formatPrice(product.cost)}
                                        </TableCell>
                                        <TableCell className={`text-right tabular-nums text-sm font-medium ${product.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {formatPrice(product.profit)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant="outline"
                                                className={`tabular-nums ${
                                                    product.margin >= 30
                                                        ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                                                        : product.margin >= 10
                                                        ? 'border-amber-500/50 text-amber-600 dark:text-amber-400'
                                                        : 'border-red-500/50 text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                {product.margin}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Cash Flow */}
                <div className="rounded-xl border border-sidebar-border/70 bg-sidebar dark:border-sidebar-border">
                    <div className="flex items-center gap-2 p-4 pb-2">
                        <DollarSign className="size-5 text-blue-500" />
                        <h2 className="font-semibold">Arus Kas</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-right">Masuk</TableHead>
                                    <TableHead className="text-right">Keluar</TableHead>
                                    <TableHead className="text-right">Neto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cashFlow.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                                            Tidak ada arus kas untuk periode ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {cashFlow.map((item) => (
                                    <TableRow key={item.date}>
                                        <TableCell className="text-sm font-medium">
                                            {item.label}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-sm text-emerald-600 dark:text-emerald-400">
                                            {item.income > 0 ? `+${formatPrice(item.income)}` : '—'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-sm text-red-600 dark:text-red-400">
                                            {item.expense > 0 ? `-${formatPrice(item.expense)}` : '—'}
                                        </TableCell>
                                        <TableCell className={`text-right tabular-nums text-sm font-semibold ${item.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                            <span className="inline-flex items-center gap-1">
                                                {item.net > 0 ? <TrendingUp className="size-3" /> : item.net < 0 ? <TrendingDown className="size-3" /> : null}
                                                {formatPrice(item.net)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {/* Total Row */}
                                {cashFlow.length > 0 && (
                                    <TableRow className="bg-muted/30 font-semibold">
                                        <TableCell className="text-sm">Total</TableCell>
                                        <TableCell className="text-right tabular-nums text-sm text-emerald-600 dark:text-emerald-400">
                                            {formatPrice(cashFlow.reduce((s, i) => s + i.income, 0))}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-sm text-red-600 dark:text-red-400">
                                            {formatPrice(cashFlow.reduce((s, i) => s + i.expense, 0))}
                                        </TableCell>
                                        <TableCell className={`text-right tabular-nums text-sm ${cashFlow.reduce((s, i) => s + i.net, 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {formatPrice(cashFlow.reduce((s, i) => s + i.net, 0))}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ==================== Monthly Comparison SVG Chart ==================== */

function MonthlyChart({ data }: { data: MonthlyComparison[] }) {
    const chartHeight = 220;
    const chartPadding = { top: 20, right: 10, bottom: 50, left: 10 };

    const { groups, maxVal } = useMemo(() => {
        if (data.length === 0) return { groups: [], maxVal: 0 };

        const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
        const groupWidth = Math.max(30, (800 - chartPadding.left - chartPadding.right) / data.length);
        const barWidth = (groupWidth - 8) / 2; // 2 bars per group with gap

        const groups = data.map((d, i) => {
            const x = chartPadding.left + i * groupWidth;
            const incomeH = (d.income / maxVal) * (chartHeight - chartPadding.top - chartPadding.bottom);
            const expenseH = (d.expense / maxVal) * (chartHeight - chartPadding.top - chartPadding.bottom);

            return {
                label: d.label,
                income: {
                    x: x + 2,
                    y: chartHeight - chartPadding.bottom - incomeH,
                    width: barWidth,
                    height: Math.max(incomeH, 0),
                    value: d.income,
                },
                expense: {
                    x: x + barWidth + 4,
                    y: chartHeight - chartPadding.bottom - expenseH,
                    width: barWidth,
                    height: Math.max(expenseH, 0),
                    value: d.expense,
                },
                profit: d.profit,
                centerX: x + groupWidth / 2,
            };
        });

        return { groups, maxVal };
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                Tidak ada data untuk ditampilkan.
            </div>
        );
    }

    const formatCompact = (val: number) => {
        if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
        return String(Math.round(val));
    };

    const svgWidth = Math.max(groups.length * 66 + chartPadding.left + chartPadding.right, 400);

    // Y-axis labels
    const ySteps = 4;
    const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
        const val = (maxVal / ySteps) * i;
        return {
            value: val,
            y: chartHeight - chartPadding.bottom - (i / ySteps) * (chartHeight - chartPadding.top - chartPadding.bottom),
        };
    });

    return (
        <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${svgWidth} ${chartHeight}`}
                className="w-full min-w-[400px]"
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

                {/* Gradients */}
                <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.5} />
                    </linearGradient>
                </defs>

                {/* Grouped bars */}
                {groups.map((group, i) => (
                    <g key={i}>
                        {/* Income bar */}
                        <rect
                            x={group.income.x}
                            y={group.income.y}
                            width={group.income.width}
                            height={group.income.height}
                            fill="url(#incomeGradient)"
                            rx={2}
                        >
                            <title>Pemasukan: {new Intl.NumberFormat('id-ID').format(group.income.value)}</title>
                        </rect>

                        {/* Expense bar */}
                        <rect
                            x={group.expense.x}
                            y={group.expense.y}
                            width={group.expense.width}
                            height={group.expense.height}
                            fill="url(#expenseGradient)"
                            rx={2}
                        >
                            <title>Pengeluaran: {new Intl.NumberFormat('id-ID').format(group.expense.value)}</title>
                        </rect>

                        {/* Month label */}
                        <text
                            x={group.centerX}
                            y={chartHeight - chartPadding.bottom + 16}
                            textAnchor="middle"
                            className="fill-muted-foreground"
                            fontSize={7}
                            transform={`rotate(-45, ${group.centerX}, ${chartHeight - chartPadding.bottom + 16})`}
                        >
                            {group.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}
