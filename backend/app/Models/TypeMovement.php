<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeMovement extends Model
{
    use HasFactory;

    public const ENTRADA = 'entrada';
    public const SAIDA = 'saida';
    public const AJUSTE = 'ajuste';

    
    public $timestamps = false;

    
    protected $table = 'type_movement';

    
    protected $fillable = ['name'];

    
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'type_movement_id');
    }
}
