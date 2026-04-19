<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Resolve the date range from the request period filter.
     */
    private function resolveDateRange(Request $request): array
    {
        $period = $request->input('period', 'month');

        return match ($period) {
            'today' => [Carbon::today(), Carbon::today()],
            'week'  => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'year'  => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()],
            'custom' => [
                Carbon::parse($request->input('start_date', Carbon::now()->startOfMonth())),
                Carbon::parse($request->input('end_date', Carbon::now()->endOfMonth())),
            ],
            default => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()], // month
        };
    }

    /**
     * Reports page — sales & purchase overview, trends, top products, recent transactions.
     */
    public function index(Request $request): Response
    {
        [$startDate, $endDate] = $this->resolveDateRange($request);

        // Summary
        $totalSales = Sale::whereBetween('date', [$startDate, $endDate])->sum('total');
        $totalPurchases = Purchase::whereBetween('date', [$startDate, $endDate])->sum('total');
        $salesCount = Sale::whereBetween('date', [$startDate, $endDate])->count();
        $purchasesCount = Purchase::whereBetween('date', [$startDate, $endDate])->count();

        // Sales Trend — daily aggregation within the period
        $salesTrend = Sale::whereBetween('date', [$startDate, $endDate])
            ->select(DB::raw('DATE(date) as date'), DB::raw('SUM(total) as total'))
            ->groupBy(DB::raw('DATE(date)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Fill in missing dates with 0
        $trendData = [];
        $dateRange = CarbonPeriod::create($startDate, $endDate);
        foreach ($dateRange as $date) {
            $key = $date->format('Y-m-d');
            $trendData[] = [
                'date'  => $key,
                'label' => $date->format('d M'),
                'total' => (float) ($salesTrend[$key]->total ?? 0),
            ];
        }

        // Top 10 products by quantity sold in this period
        $topProducts = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->whereBetween('sales.date', [$startDate, $endDate])
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                DB::raw('SUM(sale_items.quantity) as quantity_sold'),
                DB::raw('SUM(sale_items.subtotal) as revenue'),
            )
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderByDesc('quantity_sold')
            ->limit(10)
            ->get();

        // Recent transactions — latest 10 combined sales + purchases
        $recentSales = Sale::whereBetween('date', [$startDate, $endDate])
            ->latest('date')->latest('id')
            ->limit(10)
            ->get()
            ->map(fn ($s) => [
                'id'             => $s->id,
                'type'           => 'sale',
                'invoice_number' => $s->invoice_number,
                'party'          => $s->customer,
                'total'          => (float) $s->total,
                'date'           => $s->date->format('Y-m-d'),
                'created_at'     => $s->created_at->toISOString(),
            ]);

        $recentPurchases = Purchase::whereBetween('date', [$startDate, $endDate])
            ->latest('date')->latest('id')
            ->limit(10)
            ->get()
            ->map(fn ($p) => [
                'id'             => $p->id,
                'type'           => 'purchase',
                'invoice_number' => $p->invoice_number,
                'party'          => $p->supplier,
                'total'          => (float) $p->total,
                'date'           => $p->date->format('Y-m-d'),
                'created_at'     => $p->created_at->toISOString(),
            ]);

        $recentTransactions = $recentSales->merge($recentPurchases)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return Inertia::render('Reports/Index', [
            'summary' => [
                'total_sales'     => (float) $totalSales,
                'total_purchases' => (float) $totalPurchases,
                'sales_count'     => $salesCount,
                'purchases_count' => $purchasesCount,
            ],
            'salesTrend'          => $trendData,
            'topProducts'         => $topProducts,
            'recentTransactions'  => $recentTransactions,
            'filters' => [
                'period'     => $request->input('period', 'month'),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Finance page — income vs expense, profit analysis, cash flow.
     */
    public function finance(Request $request): Response
    {
        [$startDate, $endDate] = $this->resolveDateRange($request);

        // Summary for selected period
        $totalIncome = (float) Sale::whereBetween('date', [$startDate, $endDate])->sum('total');
        $totalExpense = (float) Purchase::whereBetween('date', [$startDate, $endDate])->sum('total');
        $grossProfit = $totalIncome - $totalExpense;
        $marginPercentage = $totalIncome > 0 ? round(($grossProfit / $totalIncome) * 100, 1) : 0;

        // Monthly comparison — last 12 months
        $monthlyData = [];
        for ($i = 11; $i >= 0; $i--) {
            $monthStart = Carbon::now()->subMonths($i)->startOfMonth();
            $monthEnd   = Carbon::now()->subMonths($i)->endOfMonth();

            $income  = (float) Sale::whereBetween('date', [$monthStart, $monthEnd])->sum('total');
            $expense = (float) Purchase::whereBetween('date', [$monthStart, $monthEnd])->sum('total');

            $monthlyData[] = [
                'month'   => $monthStart->format('Y-m'),
                'label'   => $monthStart->format('M Y'),
                'income'  => $income,
                'expense' => $expense,
                'profit'  => $income - $expense,
            ];
        }

        // Profit per product — use subqueries to avoid cartesian product from multiple JOINs
        $revenueSubquery = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->whereBetween('sales.date', [$startDate, $endDate])
            ->select(
                'sale_items.product_id',
                DB::raw('SUM(sale_items.subtotal) as revenue'),
                DB::raw('SUM(sale_items.quantity) as quantity_sold'),
            )
            ->groupBy('sale_items.product_id');

        $costSubquery = DB::table('purchase_items')
            ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
            ->whereBetween('purchases.date', [$startDate, $endDate])
            ->select(
                'purchase_items.product_id',
                DB::raw('SUM(purchase_items.subtotal) as cost'),
            )
            ->groupBy('purchase_items.product_id');

        $productProfits = DB::table('products')
            ->leftJoinSub($revenueSubquery, 'rev', 'products.id', '=', 'rev.product_id')
            ->leftJoinSub($costSubquery, 'cst', 'products.id', '=', 'cst.product_id')
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                DB::raw('COALESCE(rev.revenue, 0) as revenue'),
                DB::raw('COALESCE(cst.cost, 0) as cost'),
                DB::raw('COALESCE(rev.quantity_sold, 0) as quantity_sold'),
            )
            ->where(function ($q) {
                $q->whereNotNull('rev.revenue')->orWhereNotNull('cst.cost');
            })
            ->orderByDesc('revenue')
            ->get()
            ->map(function ($p) {
                $revenue = (float) $p->revenue;
                $cost    = (float) $p->cost;
                $profit  = $revenue - $cost;
                $margin  = $revenue > 0 ? round(($profit / $revenue) * 100, 1) : 0;

                return [
                    'id'            => $p->id,
                    'name'          => $p->name,
                    'sku'           => $p->sku,
                    'revenue'       => $revenue,
                    'cost'          => $cost,
                    'profit'        => $profit,
                    'margin'        => $margin,
                    'quantity_sold' => (int) $p->quantity_sold,
                ];
            });

        // Cash flow — daily income & expense in the period
        $dailyIncome = Sale::whereBetween('date', [$startDate, $endDate])
            ->select(DB::raw('DATE(date) as date'), DB::raw('SUM(total) as total'))
            ->groupBy(DB::raw('DATE(date)'))
            ->get()
            ->keyBy('date');

        $dailyExpense = Purchase::whereBetween('date', [$startDate, $endDate])
            ->select(DB::raw('DATE(date) as date'), DB::raw('SUM(total) as total'))
            ->groupBy(DB::raw('DATE(date)'))
            ->get()
            ->keyBy('date');

        $cashFlow = [];
        $dateRange = CarbonPeriod::create($startDate, $endDate);
        foreach ($dateRange as $date) {
            $key = $date->format('Y-m-d');
            $income  = (float) ($dailyIncome[$key]->total ?? 0);
            $expense = (float) ($dailyExpense[$key]->total ?? 0);

            // Only include dates that have transactions
            if ($income > 0 || $expense > 0) {
                $cashFlow[] = [
                    'date'    => $key,
                    'label'   => $date->format('d M Y'),
                    'income'  => $income,
                    'expense' => $expense,
                    'net'     => $income - $expense,
                ];
            }
        }

        return Inertia::render('Finance/Index', [
            'summary' => [
                'total_income'      => $totalIncome,
                'total_expense'     => $totalExpense,
                'gross_profit'      => $grossProfit,
                'margin_percentage' => $marginPercentage,
            ],
            'monthlyComparison' => $monthlyData,
            'productProfits'    => $productProfits,
            'cashFlow'          => $cashFlow,
            'filters' => [
                'period'     => $request->input('period', 'month'),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}
