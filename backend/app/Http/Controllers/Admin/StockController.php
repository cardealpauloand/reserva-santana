<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\StockMovementResource;
use App\Http\Resources\Admin\StockProductResource;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\TypeMovement;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class StockController extends Controller
{
    public function __construct(private readonly InventoryService $inventoryService)
    {
    }

    /**
     * List products with their current stock levels.
     */
    public function products(): AnonymousResourceCollection
    {
        $currentStockSubquery = StockMovement::query()
            ->select('current_quantity')
            ->whereColumn('stock_movement.product_id', 'products.id')
            ->orderByDesc('created_at')
            ->limit(1);

        $products = Product::query()
            ->select([
                'products.id',
                'products.name',
                'products.type',
                'products.price',
                'products.stock_quantity',
            ])
            ->selectSub($currentStockSubquery, 'current_stock')
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

        $movement = $this->inventoryService->registerProductMovement(
            $validated['product_id'],
            (int) $validated['quantity'],
            $validated['movement_type'],
            $validated['reason'] ?? null,
            $validated['warehouse_id'] ?? null,
        );

        return StockMovementResource::make($movement)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
