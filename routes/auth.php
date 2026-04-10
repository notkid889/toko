<?php

use App\Http\Controllers\Auth\AuthSessionController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthSessionController::class, 'index'])
        ->name('login');
    Route::post('login', [AuthSessionController::class, 'store'])->name('loginStore');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthSessionController::class, 'destroy'])
        ->name('logout');
});
