<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that aren't mass assignable.
     */
    protected $guarded = [];

    /**
     * Default eager loads.
     */
    protected $with = ['group'];

    /**
     * Scope to only include categories with active (non-deleted) products.
     */
    public function scopeWithActiveProducts(Builder $query): Builder
    {
        return $query->whereHas('products', fn (Builder $productQuery) => $productQuery->active());
    }

    /**
     * Group the category belongs to.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * Parent category.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Child categories.
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * Products associated with the category.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_category')
            ->withTimestamps();
    }
}
