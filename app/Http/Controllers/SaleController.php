<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Sale::withCount('items');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer', 'like', "%{$search}%");
            });
        }

        $sales = $query->latest('date')->latest('id')->paginate(10)->withQueryString();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Sales/Create');
    }

    public function store(StoreSaleRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Validate stock availability
        foreach ($data['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            if ($product->stock < $item['quantity']) {
                return redirect()->back()
                    ->withErrors(['items' => "Insufficient stock for {$product->name}. Available: {$product->stock}"])
                    ->withInput();
            }
        }

        DB::transaction(function () use ($data) {
            // Generate invoice number: SAL-YYYYMMDD-XXXX
            $today = date('Ymd');
            $count = Sale::whereDate('date', $data['date'])->count() + 1;
            $invoiceNumber = 'SAL-' . $today . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $sale = Sale::create([
                'invoice_number' => $invoiceNumber,
                'customer' => $data['customer'] ?? null,
                'notes' => $data['notes'] ?? null,
                'date' => $data['date'],
                'total' => 0,
            ]);

            $total = 0;
            $affectedProductIds = [];

            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['price'];
                $total += $subtotal;

                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $subtotal,
                ]);

                $affectedProductIds[] = $item['product_id'];
            }

            $sale->update(['total' => $total]);

            // Recalculate stock for all affected products
            foreach (array_unique($affectedProductIds) as $productId) {
                Product::recalculateStock($productId);
            }
        });

        return redirect()->route('sales.index')
            ->with('success', 'Sale recorded successfully.');
    }

    public function show(Sale $sale): Response
    {
        $sale->load('items.product');

        return Inertia::render('Sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function destroy(Sale $sale): RedirectResponse
    {
        DB::transaction(function () use ($sale) {
            // Collect affected product IDs before deleting
            $affectedProductIds = $sale->items->pluck('product_id')->unique()->toArray();

            $sale->delete();

            // Recalculate stock for all affected products
            foreach ($affectedProductIds as $productId) {
                Product::recalculateStock($productId);
            }
        });

        return redirect()->route('sales.index')
            ->with('success', 'Sale deleted and stock restored.');
    }
}
