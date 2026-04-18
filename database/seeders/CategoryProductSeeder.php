<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategoryProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Beverages',
                'description' => 'Drinks including water, juice, tea, coffee, and soft drinks.',
            ],
            [
                'name' => 'Snacks',
                'description' => 'Light food items like chips, crackers, and nuts.',
            ],
            [
                'name' => 'Dairy Products',
                'description' => 'Milk, cheese, yogurt, and related items.',
            ],
            [
                'name' => 'Household',
                'description' => 'Cleaning supplies, toiletries, and home essentials.',
            ],
            [
                'name' => 'Frozen Food',
                'description' => 'Frozen meals, ice cream, and frozen vegetables.',
            ],
        ];

        foreach ($categories as $cat) {
            Category::create([
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']),
                'description' => $cat['description'],
            ]);
        }

        $products = [
            // Beverages
            ['category' => 'Beverages', 'name' => 'Mineral Water 600ml', 'sku' => 'BEV-001', 'price' => 3500, 'stock' => 200, 'unit' => 'pcs'],
            ['category' => 'Beverages', 'name' => 'Orange Juice 1L', 'sku' => 'BEV-002', 'price' => 18500, 'stock' => 50, 'unit' => 'pcs'],
            ['category' => 'Beverages', 'name' => 'Instant Coffee 10s', 'sku' => 'BEV-003', 'price' => 25000, 'stock' => 80, 'unit' => 'box'],

            // Snacks
            ['category' => 'Snacks', 'name' => 'Potato Chips 100g', 'sku' => 'SNK-001', 'price' => 12000, 'stock' => 120, 'unit' => 'pcs'],
            ['category' => 'Snacks', 'name' => 'Chocolate Bar', 'sku' => 'SNK-002', 'price' => 8500, 'stock' => 90, 'unit' => 'pcs'],
            ['category' => 'Snacks', 'name' => 'Mixed Nuts 250g', 'sku' => 'SNK-003', 'price' => 35000, 'stock' => 40, 'unit' => 'pcs'],

            // Dairy Products
            ['category' => 'Dairy Products', 'name' => 'Fresh Milk 1L', 'sku' => 'DRY-001', 'price' => 16000, 'stock' => 60, 'unit' => 'pcs'],
            ['category' => 'Dairy Products', 'name' => 'Cheddar Cheese 200g', 'sku' => 'DRY-002', 'price' => 28000, 'stock' => 30, 'unit' => 'pcs'],

            // Household
            ['category' => 'Household', 'name' => 'Dish Soap 500ml', 'sku' => 'HSH-001', 'price' => 14000, 'stock' => 75, 'unit' => 'pcs'],
            ['category' => 'Household', 'name' => 'Laundry Detergent 1kg', 'sku' => 'HSH-002', 'price' => 32000, 'stock' => 55, 'unit' => 'pcs'],

            // Frozen Food
            ['category' => 'Frozen Food', 'name' => 'Frozen Nuggets 500g', 'sku' => 'FRZ-001', 'price' => 42000, 'stock' => 35, 'unit' => 'pcs'],
            ['category' => 'Frozen Food', 'name' => 'Ice Cream Vanilla 1L', 'sku' => 'FRZ-002', 'price' => 55000, 'stock' => 25, 'unit' => 'pcs'],
        ];

        foreach ($products as $prod) {
            $category = Category::where('name', $prod['category'])->first();

            Product::create([
                'category_id' => $category->id,
                'name' => $prod['name'],
                'slug' => Str::slug($prod['name']),
                'sku' => $prod['sku'],
                'price' => $prod['price'],
                'stock' => $prod['stock'],
                'unit' => $prod['unit'],
                'is_active' => true,
            ]);
        }
    }
}
