<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'currency' => $this->currency,
            'items' => CartItemResource::collection(
                $this->whenLoaded('items', $this->items, [])
            ),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
