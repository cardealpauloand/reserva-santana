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

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The table associated with the model.
     */
    protected $table = 'type_movement';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = ['name'];

    /**
     * Stock movements associated with the type.
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'type_movement_id');
    }
}
