<?php

namespace App\Http\Resources;

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
            'image' => $this->primaryImage?->url,
            'primary_image' => $this->when($this->primaryImage, [
                'id' => $this->primaryImage?->id,
                'url' => $this->primaryImage?->url,
                'alt' => $this->primaryImage?->alt,
                'position' => $this->primaryImage?->position,
            ]),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => $image->url,
                'alt' => $image->alt,
                'is_primary' => (bool) $image->is_primary,
                'position' => $image->position,
            ])),
            'categories' => CategorySummaryResource::collection($this->whenLoaded('categories')),
        ];
    }
}
