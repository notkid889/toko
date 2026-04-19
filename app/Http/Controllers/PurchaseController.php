<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseRequest;
use App\Models\Product;
use App\Models\Purchase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Purchase::withCount('items');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('supplier', 'like', "%{$search}%");
            });
        }

        $purchases = $query->latest('date')->latest('id')->paginate(10)->withQueryString();

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Purchases/Create');
    }

    public function store(StorePurchaseRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            // Generate invoice number with lock to prevent duplicates
            $today = date('Ymd');
            $count = Purchase::whereDate('date', $data['date'])->lockForUpdate()->count() + 1;
            $invoiceNumber = 'PUR-' . $today . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $total = 0;
            $items = [];

            foreach ($data['items'] as $item) {
                $subtotal = $item['quantity'] * $item['cost'];
                $total += $subtotal;
                $items[] = [
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'cost' => $item['cost'],
                    'subtotal' => $subtotal,
                ];
            }

            $purchase = Purchase::create([
                'invoice_number' => $invoiceNumber,
                'supplier' => $data['supplier'] ?? null,
                'notes' => $data['notes'] ?? null,
                'date' => $data['date'],
                'total' => $total,
            ]);

            $purchase->items()->createMany($items);

            // Recalculate stock and buy price for all affected products
            $affectedProductIds = array_unique(array_column($data['items'], 'product_id'));
            foreach ($affectedProductIds as $productId) {
                $product = Product::find($productId);
                $product?->recalculateStock();
                $product?->updateBuyPrice();
            }
        });

        return redirect()->route('purchases.index')
            ->with('success', 'Pembelian berhasil dicatat.');
    }

    public function show(Purchase $purchase): Response
    {
        $purchase->load('items.product');

        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase,
        ]);
    }

    public function destroy(Purchase $purchase): RedirectResponse
    {
        DB::transaction(function () use ($purchase) {
            $affectedProductIds = $purchase->items->pluck('product_id')->unique()->toArray();

            $purchase->delete();

            // Recalculate stock and buy price for all affected products
            foreach ($affectedProductIds as $productId) {
                $product = Product::find($productId);
                $product?->recalculateStock();
                $product?->updateBuyPrice();
            }
        });

        return redirect()->route('purchases.index')
            ->with('success', 'Pembelian dihapus dan stok dikembalikan.');
    }
}
