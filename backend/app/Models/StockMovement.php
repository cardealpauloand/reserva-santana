<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    
    protected $table = 'stock_movement';

    
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

    
    protected $casts = [
        'quantity' => 'integer',
        'current_quantity' => 'integer',
        'price' => 'decimal:2',
    ];

    
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    
    public function typeMovement(): BelongsTo
    {
        return $this->belongsTo(TypeMovement::class, 'type_movement_id');
    }

    
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }
}
