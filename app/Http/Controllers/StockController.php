<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\SaleItem;
use App\Models\StockAdjustment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category');

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }

        if ($request->filled('status')) {
            match ($request->input('status')) {
                'out'     => $query->where('stock', '<=', 0),
                'low'     => $query->lowStock(),
                'healthy' => $query->where('stock', '>', 10),
                default   => null,
            };
        }

        $products = $query->orderBy('stock', 'asc')->paginate(15)->withQueryString();

        // Attach stock movement data via batch queries
        $this->attachStockMovements($products);

        return Inertia::render('Stock/Index', [
            'products' => $products,
            'summary' => $this->getSummary(),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', ''),
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    /**
     * Store a stock adjustment.
     */
    public function adjust(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'not_in:0'],
            'type' => ['required', 'in:damage,correction,return,initial,other'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        StockAdjustment::create([
            'product_id' => $data['product_id'],
            'quantity' => $data['quantity'],
            'type' => $data['type'],
            'notes' => $data['notes'] ?? null,
            'date' => now()->toDateString(),
        ]);

        Product::find($data['product_id'])?->recalculateStock();

        return redirect()->back()
            ->with('success', 'Penyesuaian stok berhasil dicatat.');
    }

    /**
     * Get adjustment history for a specific product (JSON).
     */
    public function history(Product $product): JsonResponse
    {
        $adjustments = StockAdjustment::where('product_id', $product->id)
            ->latest()
            ->limit(50)
            ->get(['id', 'quantity', 'type', 'notes', 'date', 'created_at']);

        return response()->json($adjustments);
    }

    // ── Private Helpers ────────────────────────────────────────────────

    /**
     * Get stock summary statistics.
     */
    private function getSummary(): array
    {
        return [
            'total_products' => Product::count(),
            'total_stock' => Product::sum('stock'),
            'total_value' => Product::selectRaw('COALESCE(SUM(stock * price), 0) as value')->value('value'),
            'low_stock' => Product::lowStock()->count(),
            'out_of_stock' => Product::where('stock', '<=', 0)->count(),
        ];
    }

    /**
     * Attach stock movement totals (in/out/adj) to each product in the collection.
     */
    private function attachStockMovements($products): void
    {
        $productIds = $products->pluck('id');

        $totalPurchased = PurchaseItem::whereIn('product_id', $productIds)
            ->select('product_id', DB::raw('SUM(quantity) as total_in'))
            ->groupBy('product_id')
            ->pluck('total_in', 'product_id');

        $totalSold = SaleItem::whereIn('product_id', $productIds)
            ->select('product_id', DB::raw('SUM(quantity) as total_out'))
            ->groupBy('product_id')
            ->pluck('total_out', 'product_id');

        $totalAdjusted = StockAdjustment::whereIn('product_id', $productIds)
            ->select('product_id', DB::raw('SUM(quantity) as total_adj'))
            ->groupBy('product_id')
            ->pluck('total_adj', 'product_id');

        $products->getCollection()->transform(function ($product) use ($totalPurchased, $totalSold, $totalAdjusted) {
            $product->total_in = (int) ($totalPurchased[$product->id] ?? 0);
            $product->total_out = (int) ($totalSold[$product->id] ?? 0);
            $product->total_adj = (int) ($totalAdjusted[$product->id] ?? 0);
            return $product;
        });
    }
}
