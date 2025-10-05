<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class ProductController extends Controller
{
    /**
     * List products for administration.
     */
    public function index(Request $request)
    {
        $currentStockSubquery = StockMovement::query()
            ->select('current_quantity')
            ->whereColumn('stock_movement.product_id', 'products.id')
            ->orderByDesc('created_at')
            ->limit(1);

        $products = Product::query()
            ->select(['products.*'])
            ->selectSub($currentStockSubquery, 'current_stock')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = Str::lower($request->string('search')->trim());

                if ($search->isNotEmpty()) {
                    $like = '%' . $search->value() . '%';

                    $query->where(function ($productQuery) use ($like) {
                        $productQuery
                            ->whereRaw('LOWER(name) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(origin) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(type) LIKE ?', [$like]);
                    });
                }
            })
            ->when($request->has('active'), function ($query) use ($request) {
                $active = filter_var($request->input('active'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

                if ($active !== null) {
                    $query->where('active', $active);
                }
            })
            ->with(['categories', 'primaryImage'])
            ->orderBy('name')
            ->get();

        return ProductResource::collection($products);
    }

    /**
     * Create a new product.
     */
    public function store(Request $request)
    {
        $validated = $this->validateProduct($request);

        $product = Product::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? $this->generateSlug($validated['name']),
            'origin' => $validated['origin'] ?? null,
            'type' => $validated['type'] ?? null,
            'price' => $validated['price'],
            'original_price' => $validated['original_price'] ?? null,
            'rating' => $validated['rating'] ?? null,
            'volume' => $validated['volume'] ?? null,
            'alcohol' => $validated['alcohol'] ?? null,
            'temperature' => $validated['temperature'] ?? null,
            'description' => $validated['description'] ?? null,
            'stock_quantity' => 0,
            'active' => $validated['active'] ?? true,
        ]);

        $this->syncCategories($product, $validated['category_ids'] ?? []);
        $this->syncPrimaryImage($product, $validated['image_url'] ?? null);

        return ProductResource::make($product->fresh(['categories', 'primaryImage']))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Display a single product.
     */
    public function show(Product $product)
    {
        return ProductResource::make($product->loadMissing(['categories', 'primaryImage']));
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $this->validateProduct($request, $product);

        $product->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? $this->generateSlug($validated['name'], $product->id),
            'origin' => $validated['origin'] ?? null,
            'type' => $validated['type'] ?? null,
            'price' => $validated['price'],
            'original_price' => $validated['original_price'] ?? null,
            'rating' => $validated['rating'] ?? null,
            'volume' => $validated['volume'] ?? null,
            'alcohol' => $validated['alcohol'] ?? null,
            'temperature' => $validated['temperature'] ?? null,
            'description' => $validated['description'] ?? null,
            'active' => $validated['active'] ?? $product->active,
        ]);

        if (array_key_exists('category_ids', $validated)) {
            $this->syncCategories($product, $validated['category_ids']);
        }

        if (array_key_exists('image_url', $validated)) {
            $this->syncPrimaryImage($product, $validated['image_url']);
        }

        return ProductResource::make($product->fresh(['categories', 'primaryImage']));
    }

    /**
     * Soft delete a product.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Validate incoming product data.
     *
     * @return array<string, mixed>
     */
    private function validateProduct(Request $request, ?Product $product = null): array
    {
        $productId = $product?->id;

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productId)],
            'origin' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0'],
            'rating' => ['nullable', 'integer', 'min:0', 'max:5'],
            'volume' => ['nullable', 'string', 'max:50'],
            'alcohol' => ['nullable', 'string', 'max:50'],
            'temperature' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'active' => ['sometimes', 'boolean'],
            'category_ids' => ['sometimes', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],
            'image_url' => ['nullable', 'string', 'url', 'max:500'],
        ]);
    }

    /**
     * Synchronize category relationships.
     *
     * @param  array<int, int>  $categoryIds
     */
    private function syncCategories(Product $product, array $categoryIds): void
    {
        $product->categories()->sync($categoryIds);
    }

    /**
     * Ensure the product has an up-to-date primary image.
     */
    private function syncPrimaryImage(Product $product, ?string $imageUrl): void
    {
        if (! $imageUrl) {
            return;
        }

        ProductImage::query()->updateOrCreate(
            ['product_id' => $product->id, 'is_primary' => true],
            [
                'url' => $imageUrl,
                'alt' => $product->name . ' - imagem principal',
                'position' => 1,
                'is_primary' => true,
            ],
        );
    }

    /**
     * Generate a unique slug for the product.
     */
    private function generateSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);

        if ($baseSlug === '') {
            return (string) Str::uuid();
        }

        $slug = $baseSlug;
        $suffix = 1;

        while (Product::where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $baseSlug . '-' . $suffix;
            $suffix++;
        }

        return $slug;
    }
}
