<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed default application users.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@reservasantana.com'],
            [
                'name' => 'Administrador Reserva Santana',
                'password' => Hash::make('password'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'cliente@reservasantana.com'],
            [
                'name' => 'Cliente Reserva Santana',
                'password' => Hash::make('password'),
            ]
        );
    }
}
