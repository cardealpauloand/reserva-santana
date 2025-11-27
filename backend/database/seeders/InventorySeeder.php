<?php

namespace Database\Seeders;

use App\Models\TypeMovement;

use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    
    public function run(): void
    {
        foreach ([
            TypeMovement::ENTRADA,
            TypeMovement::SAIDA,
            TypeMovement::AJUSTE,
        ] as $movementName) {
            TypeMovement::query()->firstOrCreate(['name' => $movementName]);
        }

        
        
        
        
        
        
    }
}
