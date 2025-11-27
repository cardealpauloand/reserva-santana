<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    
    use HasApiTokens, HasFactory, Notifiable;

    
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    
    protected $hidden = [
        'password',
        'remember_token',
    ];

    
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    
    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    
    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    
    public function userRoles()
    {
        return $this->hasMany(UserRole::class);
    }

    
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    
    public function hasRole(string $role): bool
    {
        return $this->userRoles()->where('role', $role)->exists();
    }

    
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }
}
