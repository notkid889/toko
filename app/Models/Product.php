<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
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

    /**
     * Recalculate the stock for a product based on purchases, sales, and adjustments.
     * stock = SUM(purchase_items.quantity) - SUM(sale_items.quantity) + SUM(stock_adjustments.quantity)
     */
    public static function recalculateStock(int $productId): void
    {
        $product = static::findOrFail($productId);

        $totalPurchased = $product->purchaseItems()->sum('quantity');
        $totalSold = $product->saleItems()->sum('quantity');
        $totalAdjustment = $product->stockAdjustments()->sum('quantity');

        $product->update(['stock' => $totalPurchased - $totalSold + $totalAdjustment]);
    }

    /**
     * Update the buy price from the latest purchase cost for the product.
     * Uses the most recent purchase (by date desc, then id desc).
     */
    public static function updateBuyPrice(int $productId): void
    {
        $product = static::findOrFail($productId);

        $latestItem = $product->purchaseItems()
            ->join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
            ->orderByDesc('purchases.date')
            ->orderByDesc('purchases.id')
            ->select('purchase_items.cost')
            ->first();

        $product->update(['price' => $latestItem ? $latestItem->cost : 0]);
    }
}
