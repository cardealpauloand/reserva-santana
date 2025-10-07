<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\StockController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('catalog')->group(function (): void {
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product}', [ProductController::class, 'show'])->whereNumber('product');

    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category:slug}', [CategoryController::class, 'show']);
});

Route::prefix('admin')->group(function (): void {
    Route::get('dashboard', DashboardController::class);
    Route::apiResource('products', AdminProductController::class)->except(['create', 'edit']);

    Route::prefix('stock')->group(function (): void {
        Route::get('products', [StockController::class, 'products']);
        Route::get('movements', [StockController::class, 'movements']);
        Route::post('movements', [StockController::class, 'storeMovement']);
    });
});
