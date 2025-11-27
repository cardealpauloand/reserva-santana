<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    
    public function show(Request $request): CartResource
    {
        $cart = $this->resolveUserCart($request);

        $cart->load([
            'items.product.primaryImage',
            'items.product.images',
            'items.product.categories',
        ]);

        return new CartResource($cart);
    }

    
    public function sync(Request $request): CartResource|JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'items' => 'array',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }

        $items = collect($request->input('items', []));
        $cart = $this->resolveUserCart($request);

        DB::transaction(function () use ($cart, $items): void {
            $cart->items()->delete();

            if ($items->isEmpty()) {
                $cart->touch();
                return;
            }

            $this->upsertItems($cart, $items);
        });

        $cart->load([
            'items.product.primaryImage',
            'items.product.images',
            'items.product.categories',
        ]);

        return new CartResource($cart);
    }

    
    public function clear(Request $request): CartResource
    {
        $cart = $this->resolveUserCart($request);

        $cart->items()->delete();
        $cart->touch();

        $cart->load([
            'items.product.primaryImage',
            'items.product.images',
            'items.product.categories',
        ]);

        return new CartResource($cart);
    }

    
    protected function resolveUserCart(Request $request): Cart
    {
        $user = $request->user();

        return $user->cart()->firstOrCreate([], [
            'currency' => 'BRL',
        ]);
    }

    
    protected function upsertItems(Cart $cart, Collection $items): void
    {
        $grouped = $items
            ->groupBy('product_id')
            ->map(fn(Collection $group) => $group->sum(fn($item) => (int) $item['quantity']))
            ->filter(fn(int $quantity) => $quantity > 0);

        if ($grouped->isEmpty()) {
            $cart->touch();
            return;
        }

        $products = Product::with([
            'primaryImage',
            'images',
            'categories',
        ])->whereIn('id', $grouped->keys())->get()->keyBy('id');

        $payload = [];

        foreach ($grouped as $productId => $quantity) {
            $product = $products->get($productId);

            if (!$product) {
                continue;
            }

            $quantity = (int) $quantity;

            if ($product->stock_quantity !== null) {
                $quantity = min($quantity, max(0, (int) $product->stock_quantity));
            }

            if ($quantity <= 0) {
                continue;
            }

            $payload[] = [
                'product_id' => $product->id,
                'variant_id' => null,
                'quantity' => $quantity,
                'unit_price_snapshot' => $product->price ?? 0,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (empty($payload)) {
            $cart->touch();
            return;
        }

        $cart->items()->createMany($payload);
    }
}
