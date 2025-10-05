<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $primaryImage = $this->primaryImage;
        $currentStock = $this->resource->getAttribute('current_stock');

        if ($currentStock === null) {
            $currentStock = $this->stock_quantity;
        }
        $normalizedStock = $currentStock !== null ? (int) $currentStock : 0;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'origin' => $this->origin,
            'type' => $this->type,
            'price' => $this->price !== null ? (float) $this->price : null,
            'original_price' => $this->original_price !== null ? (float) $this->original_price : null,
            'rating' => $this->rating !== null ? (int) $this->rating : null,
            'volume' => $this->volume,
            'alcohol' => $this->alcohol,
            'temperature' => $this->temperature,
            'description' => $this->description,
            'stock_quantity' => $normalizedStock,
            'current_stock' => $normalizedStock,
            'active' => (bool) $this->active,
            'image' => $primaryImage?->url,
            'primary_image' => $primaryImage ? [
                'id' => $primaryImage->id,
                'url' => $primaryImage->url,
                'alt' => $primaryImage->alt,
                'position' => $primaryImage->position,
                'is_primary' => (bool) $primaryImage->is_primary,
            ] : null,
            'categories' => $this->whenLoaded('categories', fn () => $this->categories->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'type' => $category->type,
            ])),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
