<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $table = 'order_items';

    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'variant_id',
        'quantity',
        'price_at_purchase',
        'discount',
        'total_price',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price_at_purchase' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_price' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    protected $appends = [
        'unit_price',
    ];

    
    public function getUnitPriceAttribute(): ?string
    {
        return $this->attributes['price_at_purchase'] ?? null;
    }

    
    public function setUnitPriceAttribute($value): void
    {
        $this->attributes['price_at_purchase'] = $value;
    }

    
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
