<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\StockMovementResource;
use App\Http\Resources\Admin\StockProductResource;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\StockMovement;
use App\Models\TypeMovement;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class StockController extends Controller
{
    /**
     * List products with their current stock levels.
     */
    public function products(): AnonymousResourceCollection
    {
        $products = Product::query()
            ->select(['id', 'name', 'type', 'price', 'stock_quantity'])
            ->orderBy('name')
            ->get();

        return StockProductResource::collection($products);
    }

    /**
     * List recent stock movements.
     */
    public function movements(Request $request): AnonymousResourceCollection
    {
        $limit = (int) $request->integer('limit', 20);
        $limit = $limit > 0 ? min($limit, 100) : 20;

        $movements = StockMovement::query()
            ->with(['product:id,name', 'typeMovement:id,name'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return StockMovementResource::collection($movements);
    }

    /**
     * Register a new stock movement and update inventory counts.
     */
    public function storeMovement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'movement_type' => ['required', 'string', Rule::in([
                TypeMovement::ENTRADA,
                TypeMovement::SAIDA,
                TypeMovement::AJUSTE,
            ])],
            'reason' => ['nullable', 'string', 'max:255'],
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
        ]);

        $movement = DB::transaction(function () use ($validated) {
            $product = Product::query()->lockForUpdate()->findOrFail($validated['product_id']);
            $warehouse = $this->resolveWarehouse($validated['warehouse_id'] ?? null);
            $typeMovement = $this->resolveMovementType($validated['movement_type']);

            $quantity = (int) $validated['quantity'];
            $direction = $typeMovement->name === TypeMovement::SAIDA ? -1 : 1;

            $productStock = ProductStock::query()
                ->where('product_id', $product->id)
                ->where('warehouse_id', $warehouse->id)
                ->lockForUpdate()
                ->first();

            if (! $productStock) {
                $productStock = new ProductStock();
                $productStock->product_id = $product->id;
                $productStock->warehouse_id = $warehouse->id;
                $productStock->quantity_on_hand = 0;
                $productStock->quantity_reserved = 0;
                $productStock->min_level = 0;
            }

            if ($direction < 0) {
                if ($productStock->quantity_on_hand < $quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => 'Quantidade indisponível em estoque para o armazém selecionado.',
                    ]);
                }

                if ($product->stock_quantity < $quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => 'Quantidade indisponível em estoque.',
                    ]);
                }
            }

            $productStock->quantity_on_hand += $direction * $quantity;

            if ($productStock->quantity_on_hand < 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'O movimento deixaria a quantidade em estoque negativa.',
                ]);
            }

            $productStock->updated_at = now();
            $productStock->save();

            $product->stock_quantity += $direction * $quantity;

            if ($product->stock_quantity < 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'O movimento deixaria a quantidade total em estoque negativa.',
                ]);
            }

            $product->save();

            $movement = StockMovement::create([
                'product_id' => $product->id,
                'warehouse_id' => $warehouse->id,
                'type_movement_id' => $typeMovement->id,
                'quantity' => $quantity,
                'reason' => $validated['reason'] ?? null,
                'current_quantity' => $product->stock_quantity,
            ]);

            return $movement->load(['product:id,name', 'typeMovement:id,name']);
        });

        return StockMovementResource::make($movement)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Resolve the movement type from the provided identifier.
     */
    private function resolveMovementType(string $movementType): TypeMovement
    {
        return TypeMovement::query()->firstOrCreate(['name' => $movementType]);
    }

    /**
     * Resolve the warehouse or fallback to the default one.
     */
    private function resolveWarehouse(?int $warehouseId): Warehouse
    {
        if ($warehouseId) {
            return Warehouse::query()->findOrFail($warehouseId);
        }

        return Warehouse::query()->firstOrCreate(
            ['code' => 'LOJA-PRINCIPAL'],
            ['name' => 'Loja Principal']
        );
    }
}
