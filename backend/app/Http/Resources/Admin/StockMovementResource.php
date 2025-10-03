<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'product_id' => $this->product_id !== null ? (int) $this->product_id : null,
            'quantity' => $this->quantity !== null ? (int) $this->quantity : 0,
            'movement_type' => $this->typeMovement?->name,
            'reason' => $this->reason,
            'current_quantity' => $this->current_quantity !== null ? (int) $this->current_quantity : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'product' => $this->whenLoaded('product', function () {
                return [
                    'id' => $this->product?->id,
                    'name' => $this->product?->name,
                ];
            }),
        ];
    }
}
