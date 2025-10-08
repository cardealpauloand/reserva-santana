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

    /**
     * Alias accessor to keep backward compatibility with legacy unit_price field.
     */
    public function getUnitPriceAttribute(): ?string
    {
        return $this->attributes['price_at_purchase'] ?? null;
    }

    /**
     * Alias mutator converting unit_price assignments into price_at_purchase.
     */
    public function setUnitPriceAttribute($value): void
    {
        $this->attributes['price_at_purchase'] = $value;
    }

    /**
     * Get the order that owns the order item.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product for the order item.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
