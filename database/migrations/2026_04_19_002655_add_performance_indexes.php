<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add performance indexes for frequently-queried columns.
     */
    public function up(): void
    {
        // Product search/filter indexes
        Schema::table('products', function (Blueprint $table) {
            $table->index('name', 'idx_products_name');
            $table->index('is_active', 'idx_products_is_active');
            $table->softDeletes();
        });

        // Transaction date indexes for report date-range queries
        Schema::table('purchases', function (Blueprint $table) {
            $table->index('date', 'idx_purchases_date');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->index('date', 'idx_sales_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_name');
            $table->dropIndex('idx_products_is_active');
            $table->dropSoftDeletes();
        });

        Schema::table('purchases', function (Blueprint $table) {
            $table->dropIndex('idx_purchases_date');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex('idx_sales_date');
        });
    }
};
