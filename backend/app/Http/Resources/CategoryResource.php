<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
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
            'slug' => $this->slug,
            'name' => $this->name,
            'type' => $this->type,
            'product_count' => isset($this->products_count)
                ? (int) $this->products_count
                : ($this->products?->count() ?? 0),
            'group' => $this->when($this->group, [
                'id' => $this->group?->id,
                'name' => $this->group?->name,
            ]),
            'products' => $this->when(
                $this->resource->relationLoaded('products'),
                fn() => ProductResource::collection($this->products),
                []
            ),
        ];
    }
}
