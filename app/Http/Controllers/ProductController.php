<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

// NOTE: Run `php artisan storage:link` to create the public storage symlink

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::with('category');

        // Category filter
        if ($request->filled('category')) {
            $query->where('category_id', $request->input('category'));
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $products = $query->latest()->paginate(10)->withQueryString();

        $categories = Category::orderBy('name')->get(['id', 'name']);
        $summary = [
            'total_products' => Product::count(),
            'total_value' => Product::selectRaw('SUM(stock * price) as value')->value('value') ?? 0,
        ];
        return Inertia::render('Products/Index', [
            'products' => $products,
            'summary' => $summary,
            'categories' => $categories,
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

        // Handle image upload
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        // Ensure is_active is set
        $data['is_active'] = $request->boolean('is_active', true);

        // Stock and price are derived from purchases/sales
        $data['stock'] = 0;
        $data['price'] = 0;

        Product::create($data);

        return redirect()->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product): Response
    {
        $product->load('category');
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

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        // Ensure is_active is set
        $data['is_active'] = $request->boolean('is_active', true);

        // Don't overwrite stock/price — they are derived from purchases/sales
        unset($data['stock'], $data['price']);

        $product->update($data);

        return redirect()->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        // Delete product image
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Search products for autocomplete (JSON endpoint).
     * Returns max 20 results matching name or SKU.
     */
    public function search(Request $request)
    {
        $query = Product::where('is_active', true);

        // Optional: only products with stock (for sales)
        if ($request->boolean('in_stock')) {
            $query->where('stock', '>', 0);
        }

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($qb) use ($q) {
                $qb->where('name', 'like', "%{$q}%")
                   ->orWhere('sku', 'like', "%{$q}%");
            });
        }

        $products = $query
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'name', 'sku', 'price', 'stock', 'unit']);

        return response()->json($products);
    }
}
