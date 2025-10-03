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
        return [
            'id' => (int) $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'price' => $this->price !== null ? (float) $this->price : null,
            'stock_quantity' => $this->stock_quantity !== null ? (int) $this->stock_quantity : 0,
        ];
    }
}
