<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MassProductSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure categories exist
        $categoryIds = Category::pluck('id', 'name')->toArray();

        if (empty($categoryIds)) {
            $this->command->error('No categories found. Run CategoryProductSeeder first.');
            return;
        }

        $catIds = array_values($categoryIds);
        $now = now();

        // Product name parts for realistic generation
        $prefixes = [
            'Premium', 'Super', 'Royal', 'Fresh', 'Natural', 'Organic', 'Classic',
            'Golden', 'Silver', 'Diamond', 'Crystal', 'Pure', 'Ultra', 'Mega',
            'Mini', 'Jumbo', 'Family', 'Economy', 'Deluxe', 'Special',
            'Original', 'Extra', 'Double', 'Triple', 'Crispy', 'Creamy',
            'Spicy', 'Sweet', 'Savory', 'Mild', 'Strong', 'Light', 'Rich',
        ];

        $items = [
            'BEV' => [
                'Water', 'Juice', 'Tea', 'Coffee', 'Soda', 'Milk Tea', 'Smoothie',
                'Energy Drink', 'Sparkling Water', 'Lemonade', 'Iced Tea', 'Cocoa',
                'Matcha Latte', 'Cappuccino', 'Espresso', 'Mocha', 'Americano',
                'Fruit Punch', 'Coconut Water', 'Tonic Water', 'Ginger Ale',
                'Green Tea', 'Black Tea', 'Herbal Tea', 'Chai', 'Kombucha',
            ],
            'SNK' => [
                'Chips', 'Crackers', 'Cookies', 'Biscuit', 'Wafer', 'Popcorn',
                'Pretzel', 'Granola Bar', 'Dried Fruit', 'Trail Mix', 'Peanuts',
                'Cashew', 'Almond', 'Chocolate', 'Candy', 'Gummy', 'Marshmallow',
                'Brownie', 'Muffin', 'Cake Bite', 'Corn Snack', 'Rice Cracker',
                'Seaweed Snack', 'Banana Chips', 'Protein Bar',
            ],
            'DRY' => [
                'Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream', 'Ice Cream',
                'Whipped Cream', 'Sour Cream', 'Condensed Milk', 'Cottage Cheese',
                'Mozzarella', 'Parmesan', 'Cream Cheese', 'Cheddar Block',
                'Milk Powder', 'Evaporated Milk', 'Ghee', 'Margarine',
                'Kefir', 'Buttermilk', 'Custard', 'Pudding Mix',
            ],
            'HSH' => [
                'Soap', 'Detergent', 'Shampoo', 'Toothpaste', 'Dish Cleaner',
                'Floor Cleaner', 'Glass Cleaner', 'Bleach', 'Softener',
                'Air Freshener', 'Sponge', 'Brush', 'Tissue', 'Paper Towel',
                'Trash Bag', 'Laundry Pod', 'Hand Sanitizer', 'Disinfectant',
                'Toilet Cleaner', 'Stain Remover', 'Mop Refill',
            ],
            'FRZ' => [
                'Nuggets', 'Fish Fillet', 'Sausage', 'Dumpling', 'Spring Roll',
                'Pizza', 'French Fries', 'Chicken Wing', 'Meatball', 'Tempura',
                'Frozen Vegetable', 'Ice Cream Tub', 'Frozen Fruit', 'Corn Dog',
                'Burger Patty', 'Frozen Rice', 'Frozen Noodle', 'Gyoza',
                'Dim Sum', 'Frozen Soup', 'Frozen Broth', 'Frozen Pie',
            ],
        ];

        $sizes = [
            '50g', '100g', '150g', '200g', '250g', '300g', '350g', '400g', '500g',
            '750g', '1kg', '1.5kg', '2kg', '100ml', '200ml', '250ml', '300ml',
            '350ml', '500ml', '600ml', '750ml', '1L', '1.5L', '2L',
            '5pcs', '6pcs', '8pcs', '10pcs', '12pcs', '20pcs', '24pcs', '50pcs',
        ];

        $units = ['pcs', 'box', 'pack', 'btl', 'bag', 'can', 'jar', 'sachet'];

        // Map categories to SKU prefixes
        $catNameToPrefix = [
            'Beverages' => 'BEV',
            'Snacks' => 'SNK',
            'Dairy Products' => 'DRY',
            'Household' => 'HSH',
            'Frozen Food' => 'FRZ',
        ];

        // Build category mapping: [category_id => prefix]
        $catIdToPrefix = [];
        $catIdToName = [];
        foreach ($categoryIds as $name => $id) {
            $prefix = $catNameToPrefix[$name] ?? 'GEN';
            $catIdToPrefix[$id] = $prefix;
            $catIdToName[$id] = $name;
        }

        $totalToGenerate = 10000;
        $chunkSize = 500;
        $generated = 0;
        $usedSku = [];
        $usedSlug = [];

        // Pre-fetch existing SKUs
        $existingSku = DB::table('products')->pluck('sku')->toArray();
        $usedSku = array_flip($existingSku);

        $this->command->info("Generating {$totalToGenerate} products in chunks of {$chunkSize}...");

        $progressBar = $this->command->getOutput()->createProgressBar($totalToGenerate);
        $progressBar->start();

        while ($generated < $totalToGenerate) {
            $batch = [];
            $batchTarget = min($chunkSize, $totalToGenerate - $generated);

            for ($i = 0; $i < $batchTarget; $i++) {
                // Pick random category
                $catId = $catIds[array_rand($catIds)];
                $prefix = $catIdToPrefix[$catId] ?? 'GEN';

                // Pick item name parts
                $itemList = $items[$prefix] ?? $items['SNK'];
                $itemName = $prefixes[array_rand($prefixes)] . ' ' . $itemList[array_rand($itemList)];
                $size = $sizes[array_rand($sizes)];
                $fullName = $itemName . ' ' . $size;

                // Generate unique SKU
                $skuNum = $generated + $i + 13; // offset past existing 12
                $sku = $prefix . '-' . str_pad($skuNum, 5, '0', STR_PAD_LEFT);

                // Ensure uniqueness
                while (isset($usedSku[$sku])) {
                    $skuNum++;
                    $sku = $prefix . '-' . str_pad($skuNum, 5, '0', STR_PAD_LEFT);
                }
                $usedSku[$sku] = true;

                // Generate unique slug
                $slug = Str::slug($fullName);
                $originalSlug = $slug;
                $slugCounter = 1;
                while (isset($usedSlug[$slug])) {
                    $slug = $originalSlug . '-' . $slugCounter;
                    $slugCounter++;
                }
                $usedSlug[$slug] = true;

                // Random price (1,000 - 500,000)
                $price = rand(1, 500) * 1000;

                // Random stock (0 - 500)
                $stock = rand(0, 500);

                $unit = $units[array_rand($units)];

                $batch[] = [
                    'category_id' => $catId,
                    'name' => $fullName,
                    'slug' => $slug,
                    'sku' => $sku,
                    'description' => null,
                    'price' => $price,
                    'stock' => $stock,
                    'unit' => $unit,
                    'image' => null,
                    'is_active' => rand(1, 100) <= 95, // 95% active
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            DB::table('products')->insert($batch);
            $generated += count($batch);
            $progressBar->advance(count($batch));
        }

        $progressBar->finish();
        $this->command->newLine();
        $this->command->info("✅ {$generated} products seeded successfully!");
    }
}
