<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    
    private array $categories = [
        'premium-reserva' => [
            'name' => 'Vinhos Reserva Premium',
            'type' => 'Premium',
        ],
        'premium-raros' => [
            'name' => 'Vinhos Raros',
            'type' => 'Premium',
        ],
        'premium-gran-reserva' => [
            'name' => 'Gran Reserva',
            'type' => 'Premium',
        ],
        'premium-importados' => [
            'name' => 'Importados Premium',
            'type' => 'Premium',
        ],
        'kit-barolo' => [
            'name' => 'Kit Barolo',
            'type' => 'Kit',
        ],
        'kit-best-sellers' => [
            'name' => 'Kit Best Sellers',
            'type' => 'Kit',
        ],
        'kit-harmonizacao' => [
            'name' => 'Kit Harmonização',
            'type' => 'Kit',
        ],
        'kit-uvas-iconicas' => [
            'name' => 'Kit Uvas Icônicas',
            'type' => 'Kit',
        ],
    ];

    
    public function up(): void
    {
        if (App::runningUnitTests()) {
            return;
        }

        $now = Carbon::now();

        $groupId = DB::table('groups')
            ->where('name', 'Coleção Reserva Santana')
            ->value('id');

        if (!$groupId) {
            $groupId = DB::table('groups')->insertGetId([
                'name' => 'Coleção Reserva Santana',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        foreach ($this->categories as $slug => $definition) {
            $existing = DB::table('categories')->where('slug', $slug)->first();

            if ($existing) {
                DB::table('categories')
                    ->where('id', $existing->id)
                    ->update([
                            'name' => $definition['name'],
                            'type' => $definition['type'] ?? null,
                            'group_id' => $definition['group_id'] ?? $groupId,
                            'updated_at' => $now,
                        ]);

                continue;
            }

            DB::table('categories')->insert([
                'name' => $definition['name'],
                'slug' => $slug,
                'type' => $definition['type'] ?? null,
                'group_id' => $definition['group_id'] ?? $groupId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    
    public function down(): void
    {
        DB::table('categories')
            ->whereIn('slug', array_keys($this->categories))
            ->delete();
    }
};
