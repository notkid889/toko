<?php

use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StockController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () { return Inertia::render('Dashboard'); })->name('dashboard');

    // Category & Product resource routes
    Route::resource('categories', CategoryController::class)->except(['show']);
    Route::post('categories/inline', [CategoryController::class, 'storeInline'])->name('categories.store-inline');
    Route::resource('products', ProductController::class)->except(['show']);

    // Stock management
    Route::get('stock', [StockController::class, 'index'])->name('stock.index');
    Route::post('stock/adjust', [StockController::class, 'adjust'])->name('stock.adjust');
    Route::get('stock/{product}/history', [StockController::class, 'history'])->name('stock.history');

    // Purchase & Sale routes (no edit — transactions are immutable records)
    Route::resource('purchases', PurchaseController::class)->except(['edit', 'update']);
    Route::resource('sales', SaleController::class)->except(['edit', 'update']);

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::middleware('permission:menus.view')->group(function () {
            Route::resource('menus', MenuController::class)->except(['show', 'create']);
        });

        Route::middleware('permission:roles.view')->group(function () {
            Route::resource('roles', RoleController::class)->except(['show', 'create']);
        });

        Route::middleware('permission:users.view')->group(function () {
            Route::resource('users', UserController::class)->except(['show', 'create']);
        });

        Route::middleware('permission:permissions.view')->group(function () {
            Route::resource('permissions', PermissionController::class)->except(['show', 'create']);
        });
    });
});

require __DIR__.'/auth.php';