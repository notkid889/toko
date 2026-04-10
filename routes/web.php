<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () { return Inertia::render('Dashboard'); })->name('dashboard');

});

require __DIR__.'/auth.php';