<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
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

        $products = $query->latest()->paginate(10)->withQueryString();

        $categories = Category::orderBy('name')->get(['id', 'name']);

        $summary = [
            'total_products' => Product::count(),
            'total_value' => Product::selectRaw('COALESCE(SUM(stock * price), 0) as value')->value('value'),
        ];

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'summary' => $summary,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Products/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['slug'] = Str::slug($data['name']);
        $data['sku'] = $data['sku'] ?? strtoupper(Str::random(8));

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        Product::create($data);

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product): Response
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        $data['slug'] = Str::slug($data['name']);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        // Delete product image
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }

    /**
     * Search products for autocomplete (JSON endpoint).
     * Returns max 20 results matching name or SKU.
     */
    public function search(Request $request): JsonResponse
    {
        $query = Product::active();

        if ($request->boolean('in_stock')) {
            $query->inStock();
        }

        if ($request->filled('q')) {
            $query->search($request->input('q'));
        }

        $products = $query
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'name', 'sku', 'price', 'stock', 'unit']);

        return response()->json($products);
    }
}
