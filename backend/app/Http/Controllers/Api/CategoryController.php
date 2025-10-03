<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\CategorySummaryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * List catalog categories with product counts.
     */
    public function index()
    {
        $categories = Category::query()
            ->withCount(['products as products_count' => fn ($query) => $query->active()])
            ->orderBy('name')
            ->get();

        return CategorySummaryResource::collection($categories);
    }

    /**
     * Show category details and associated products.
     */
    public function show(Category $category)
    {
        $category->load([
            'products' => fn ($query) => $query
                ->active()
                ->with(['categories', 'primaryImage'])
                ->orderBy('name'),
        ])->loadCount(['products as products_count' => fn ($query) => $query->active()]);

        return CategoryResource::make($category);
    }
}
