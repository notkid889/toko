<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'price',
        'stock',
        'unit',
        'image',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Appended attributes.
     */
    protected $appends = ['image_url'];

    /**
     * Get the full URL for the product image, or a placeholder if null.
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::get(function () {
            if ($this->image) {
                /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
                $disk = Storage::disk('public');
                return $disk->url($this->image);
            }

            return 'https://placehold.co/200x200/e2e8f0/94a3b8?text=No+Image';
        });
    }

    // ── Relationships ──────────────────────────────────────────────────

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function stockAdjustments(): HasMany
    {
        return $this->hasMany(StockAdjustment::class);
    }

    // ── Query Scopes ───────────────────────────────────────────────────

    /**
     * Scope: only active products.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: only products with stock > 0.
     */
    public function scopeInStock(Builder $query): Builder
    {
        return $query->where('stock', '>', 0);
    }

    /**
     * Scope: products with stock between 1 and the given threshold (default 10).
     */
    public function scopeLowStock(Builder $query, int $threshold = 10): Builder
    {
        return $query->where('stock', '>', 0)->where('stock', '<=', $threshold);
    }

    /**
     * Scope: search by name or SKU.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (!$term) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('sku', 'like', "%{$term}%");
        });
    }

    // ── Business Logic ─────────────────────────────────────────────────

    /**
     * Recalculate the stock for this product based on purchases, sales, and adjustments.
     * stock = SUM(purchase_items.quantity) - SUM(sale_items.quantity) + SUM(stock_adjustments.quantity)
     */
    public function recalculateStock(): void
    {
        $totalPurchased = $this->purchaseItems()->sum('quantity');
        $totalSold = $this->saleItems()->sum('quantity');
        $totalAdjustment = $this->stockAdjustments()->sum('quantity');

        $this->update(['stock' => $totalPurchased - $totalSold + $totalAdjustment]);
    }

    /**
     * Update the buy price from the latest purchase cost for the product.
     * Uses the most recent purchase (by date desc, then id desc).
     */
    public function updateBuyPrice(): void
    {
        $latestItem = $this->purchaseItems()
            ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
            ->orderByDesc('purchases.date')
            ->orderByDesc('purchases.id')
            ->select('purchase_items.cost')
            ->first();

        $this->update(['price' => $latestItem ? $latestItem->cost : 0]);
    }

    /**
     * Static convenience: recalculate stock for a given product ID.
     */
    public static function recalculateStockFor(int $productId): void
    {
        static::findOrFail($productId)->recalculateStock();
    }

    /**
     * Static convenience: update buy price for a given product ID.
     */
    public static function updateBuyPriceFor(int $productId): void
    {
        static::findOrFail($productId)->updateBuyPrice();
    }
}
