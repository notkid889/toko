<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\SaleItem;
use App\Models\StockAdjustment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }

        // Stock status filter
        if ($request->filled('status')) {
            switch ($request->input('status')) {
                case 'out':
                    $query->where('stock', '<=', 0);
                    break;
                case 'low':
                    $query->where('stock', '>', 0)->where('stock', '<=', 10);
                    break;
                case 'healthy':
                    $query->where('stock', '>', 10);
                    break;
            }
        }

        $products = $query->orderBy('stock', 'asc')->paginate(15)->withQueryString();

        // Add stock movement data to each product
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

        // Summary stats
        $summary = [
            'total_products' => Product::count(),
            'total_stock' => Product::sum('stock'),
            'total_value' => Product::selectRaw('SUM(stock * price) as value')->value('value') ?? 0,
            'low_stock' => Product::where('stock', '>', 0)->where('stock', '<=', 10)->count(),
            'out_of_stock' => Product::where('stock', '<=', 0)->count(),
        ];

        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Stock/Index', [
            'products' => $products,
            'summary' => $summary,
            'categories' => $categories,
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
    public function adjust(Request $request): \Illuminate\Http\RedirectResponse
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

        Product::recalculateStock($data['product_id']);

        return redirect()->back()
            ->with('success', 'Stock adjustment recorded successfully.');
    }

    /**
     * Get adjustment history for a specific product (JSON).
     */
    public function history(Product $product): \Illuminate\Http\JsonResponse
    {
        $adjustments = StockAdjustment::where('product_id', $product->id)
            ->latest()
            ->limit(50)
            ->get(['id', 'quantity', 'type', 'notes', 'date', 'created_at']);

        return response()->json($adjustments);
    }
}
