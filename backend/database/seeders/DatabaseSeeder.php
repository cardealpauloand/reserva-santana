<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    
    public function run(): void
    {
        $this->call([
            InventorySeeder::class,
            CatalogSeeder::class,
            UserSeeder::class,
            SalesSeeder::class,
        ]);
    }
}
