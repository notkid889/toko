<?php

use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () { return Inertia::render('Dashboard'); })->name('dashboard');

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