<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    use HasFactory;
    use SoftDeletes;

    
    protected $guarded = [];

    
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }
}
