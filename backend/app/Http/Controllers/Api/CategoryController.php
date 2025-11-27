<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\CategorySummaryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    
    public function index()
    {
        $categories = Category::query()
            ->withCount(['products as products_count' => fn ($query) => $query->active()])
            ->orderBy('name')
            ->get();

        return CategorySummaryResource::collection($categories);
    }

    
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
