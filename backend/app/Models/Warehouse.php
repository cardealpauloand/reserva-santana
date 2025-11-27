<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warehouse extends Model
{
    use HasFactory;

    
    protected $fillable = [
        'name',
        'code',
        'address_id',
    ];

    
    public function productStock(): HasMany
    {
        return $this->hasMany(ProductStock::class);
    }

    
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
