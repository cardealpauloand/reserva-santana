<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ProductController extends Controller
{
    /**
     * List catalog products with optional filters.
     */
    public function index(Request $request)
    {
        $products = Product::query()
            ->active()
            ->with(['categories', 'primaryImage'])
            ->when($request->filled('category'), function ($query) use ($request) {
                $slug = $request->string('category')->trim();
                if ($slug->isNotEmpty()) {
                    $query->whereHas('categories', fn ($categoryQuery) => $categoryQuery->where('slug', $slug->value()));
                }
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->trim()->lower();

                if ($search->isNotEmpty()) {
                    $like = '%' . $search->value() . '%';

                    $query->where(function ($productQuery) use ($like) {
                        $productQuery
                            ->whereRaw('LOWER(name) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(origin) LIKE ?', [$like])
                            ->orWhereRaw('LOWER(type) LIKE ?', [$like])
                            ->orWhereHas('categories', fn ($categoryQuery) => $categoryQuery
                                ->whereRaw('LOWER(name) LIKE ?', [$like])
                                ->orWhereRaw('LOWER(slug) LIKE ?', [$like])
                            );
                    });
                }
            })
            ->orderBy('name')
            ->get();

        return ProductResource::collection($products);
    }

    /**
     * Show a single product.
     */
    public function show(Product $product)
    {
        if (! $product->active) {
            abort(Response::HTTP_NOT_FOUND);
        }

        $product->loadMissing(['categories', 'images', 'primaryImage']);

        return ProductResource::make($product);
    }
}
