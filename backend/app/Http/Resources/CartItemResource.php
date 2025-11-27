<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'quantity' => (int) $this->quantity,
            'unit_price' => $this->unit_price_snapshot !== null
                ? (float) $this->unit_price_snapshot
                : null,
            'product' => $this->whenLoaded('product', fn() => ProductResource::make($this->product)),
        ];
    }
}
