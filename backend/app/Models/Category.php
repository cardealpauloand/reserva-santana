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

    
    protected $guarded = [];

    
    protected $with = ['group'];

    
    public function scopeWithActiveProducts(Builder $query): Builder
    {
        return $query->whereHas('products', fn (Builder $productQuery) => $productQuery->active());
    }

    
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_category')
            ->withTimestamps();
    }
}
