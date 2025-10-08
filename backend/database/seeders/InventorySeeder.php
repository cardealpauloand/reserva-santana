<?php

namespace Database\Seeders;

use App\Models\TypeMovement;
// use App\Models\Warehouse; // Removed during Supabase migration
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    /**
     * Seed inventory helper tables.
     */
    public function run(): void
    {
        foreach ([
            TypeMovement::ENTRADA,
            TypeMovement::SAIDA,
            TypeMovement::AJUSTE,
        ] as $movementName) {
            TypeMovement::query()->firstOrCreate(['name' => $movementName]);
        }

        // Warehouse seeding removed - table was dropped during Supabase migration
        // If you need warehouses, recreate the table first
        // Warehouse::query()->firstOrCreate(
        //     ['code' => 'LOJA-PRINCIPAL'],
        //     ['name' => 'Loja Principal']
        // );
    }
}
