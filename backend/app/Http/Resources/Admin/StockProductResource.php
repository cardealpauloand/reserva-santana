<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currentStock = $this->resource->getAttribute('current_stock');

        if ($currentStock === null) {
            $currentStock = $this->stock_quantity;
        }
        $normalizedStock = $currentStock !== null ? (int) $currentStock : 0;

        return [
            'id' => (int) $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'price' => $this->price !== null ? (float) $this->price : null,
            'stock_quantity' => $normalizedStock,
            'current_stock' => $normalizedStock,
        ];
    }
}
