<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'stock_movement';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'product_id',
        'variant_id',
        'warehouse_id',
        'type_movement_id',
        'quantity',
        'reason',
        'current_quantity',
        'price',
        'user_id',
        'created_by',
        'updated_by',
    ];

    /**
     * Attribute casting.
     */
    protected $casts = [
        'quantity' => 'integer',
        'current_quantity' => 'integer',
        'price' => 'decimal:2',
    ];

    /**
     * Product associated with the movement.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    /**
     * Movement type relation.
     */
    public function typeMovement(): BelongsTo
    {
        return $this->belongsTo(TypeMovement::class, 'type_movement_id');
    }

    /**
     * Warehouse where the movement occurred.
     */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }
}
