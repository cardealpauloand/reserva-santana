<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductStock;
use App\Models\StockMovement;
use App\Models\TypeMovement;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    /**
     * Register a stock movement for a product and keep aggregates in sync.
     */
    public function registerProductMovement(
        int $productId,
        int $quantity,
        string $movementType,
        ?string $reason = null,
        ?int $warehouseId = null
    ): StockMovement {
        $normalizedMovement = Str::lower($movementType);

        return DB::transaction(function () use ($productId, $quantity, $normalizedMovement, $reason, $warehouseId) {
            $product = Product::query()
                ->lockForUpdate()
                ->findOrFail($productId);

            $warehouse = $this->resolveWarehouse($warehouseId);
            $typeMovement = $this->resolveMovementType($normalizedMovement);

            $quantity = abs($quantity);
            $direction = $typeMovement->name === TypeMovement::SAIDA ? -1 : 1;

            $productStock = ProductStock::query()
                ->where('product_id', $product->id)
                ->where('warehouse_id', $warehouse->id)
                ->lockForUpdate()
                ->first();

            if (! $productStock) {
                $productStock = new ProductStock([
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                    'quantity_on_hand' => 0,
                    'quantity_reserved' => 0,
                    'min_level' => 0,
                ]);
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
                'reason' => $reason,
                'current_quantity' => $product->stock_quantity,
            ]);

            return $movement->load(['product:id,name', 'typeMovement:id,name']);
        });
    }

    /**
     * Resolve or create the requested movement type.
     */
    private function resolveMovementType(string $movementType): TypeMovement
    {
        return TypeMovement::query()->firstOrCreate(['name' => $movementType]);
    }

    /**
     * Resolve the target warehouse, defaulting to the main store.
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
