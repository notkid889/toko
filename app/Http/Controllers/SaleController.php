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

        // All logic inside transaction for ACID consistency
        DB::transaction(function () use ($data) {
            // Validate stock availability inside transaction (prevents race conditions)
            foreach ($data['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                if ($product->stock < $item['quantity']) {
                    throw new \RuntimeException(
                        "Stok tidak cukup untuk {$product->name}. Tersedia: {$product->stock}"
                    );
                }
            }

            // Generate invoice number with lock to prevent duplicates
            $today = date('Ymd');
            $count = Sale::whereDate('date', $data['date'])->lockForUpdate()->count() + 1;
            $invoiceNumber = 'SAL-' . $today . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $total = 0;
            $items = [];

            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['price'];
                $total += $subtotal;
                $items[] = [
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $subtotal,
                ];
            }

            $sale = Sale::create([
                'invoice_number' => $invoiceNumber,
                'customer' => $data['customer'] ?? null,
                'notes' => $data['notes'] ?? null,
                'date' => $data['date'],
                'total' => $total,
            ]);

            $sale->items()->createMany($items);

            // Recalculate stock for all affected products
            $affectedProductIds = array_unique(array_column($data['items'], 'product_id'));
            foreach ($affectedProductIds as $productId) {
                Product::find($productId)?->recalculateStock();
            }
        });

        return redirect()->route('sales.index')
            ->with('success', 'Penjualan berhasil dicatat.');
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
            $affectedProductIds = $sale->items->pluck('product_id')->unique()->toArray();

            $sale->delete();

            // Recalculate stock for all affected products
            foreach ($affectedProductIds as $productId) {
                Product::find($productId)?->recalculateStock();
            }
        });

        return redirect()->route('sales.index')
            ->with('success', 'Penjualan dihapus dan stok dikembalikan.');
    }
}
