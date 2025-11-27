<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\StockController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ShippingController;
use Illuminate\Support\Facades\Route;


Route::prefix('catalog')->group(function (): void {
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product}', [ProductController::class, 'show'])->whereNumber('product');

    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category:slug}', [CategoryController::class, 'show']);
});


Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
    });
});

Route::prefix('shipping')->group(function (): void {
    Route::post('quote', [ShippingController::class, 'quote']);
});


Route::middleware('auth:sanctum')->group(function (): void {
    
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);

    
    Route::get('addresses', [AddressController::class, 'index']);
    Route::post('addresses', [AddressController::class, 'store']);
    Route::delete('addresses/{id}', [AddressController::class, 'destroy']);

    
    Route::get('orders', [OrderController::class, 'index']);
    Route::post('orders', [OrderController::class, 'store']);

    
    Route::get('cart', [CartController::class, 'show']);
    Route::put('cart', [CartController::class, 'sync']);
    Route::delete('cart', [CartController::class, 'clear']);
});


Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function (): void {
    Route::get('dashboard', DashboardController::class);
    Route::apiResource('products', AdminProductController::class)->except(['create', 'edit']);

    Route::prefix('stock')->group(function (): void {
        Route::get('products', [StockController::class, 'products']);
        Route::get('movements', [StockController::class, 'movements']);
        Route::post('movements', [StockController::class, 'storeMovement']);
    });

    
    Route::get('orders', [OrderController::class, 'adminIndex']);
    Route::patch('orders/{id}', [OrderController::class, 'adminUpdate']);
});
