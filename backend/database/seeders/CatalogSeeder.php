<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Group;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $this->resetTables();

            $group = Group::create([
                'name' => 'Coleção Reserva Santana',
            ]);

            $categoryDefinitions = [
                'tintos' => ['name' => 'Vinhos Tintos', 'type' => 'Tinto'],
                'brancos' => ['name' => 'Vinhos Brancos', 'type' => 'Branco'],
                'roses' => ['name' => 'Vinhos Rosés', 'type' => 'Rosé'],
                'espumantes' => ['name' => 'Vinhos Espumantes', 'type' => 'Espumante'],
            ];

            $categories = collect($categoryDefinitions)->map(function (array $definition, string $slug) use ($group): Category {
                return Category::create([
                    'group_id' => $group->id,
                    'name' => $definition['name'],
                    'slug' => $slug,
                    'type' => $definition['type'],
                ]);
            });

            $products = [
                [
                    'name' => 'Château Margaux 2015',
                    'slug' => 'chateau-margaux-2015',
                    'origin' => 'Bordeaux, França',
                    'type' => 'Tinto',
                    'price' => '189.90',
                    'original_price' => '349.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '13.5%',
                    'temperature' => '16-18°C',
                    'description' => 'Safra premiada com notas complexas de frutas vermelhas maduras, taninos sedosos e final prolongado.',
                    'image_url' => 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80',
                    'categories' => ['tintos'],
                ],
                [
                    'name' => 'Chardonnay Reserve 2020',
                    'slug' => 'chardonnay-reserve-2020',
                    'origin' => 'Mendoza, Argentina',
                    'type' => 'Branco',
                    'price' => '89.90',
                    'original_price' => '159.90',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '13%',
                    'temperature' => '10-12°C',
                    'description' => 'Vinho branco elegante com notas de frutas tropicais, boa acidez e final cremoso.',
                    'image_url' => 'https://images.unsplash.com/photo-1506853981987-9b7e88e498c1?auto=format&fit=crop&w=900&q=80',
                    'categories' => ['brancos'],
                ],
                [
                    'name' => 'Provence Rosé Premium',
                    'slug' => 'provence-rose-premium',
                    'origin' => 'Provence, França',
                    'type' => 'Rosé',
                    'price' => '129.90',
                    'original_price' => '219.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12.5%',
                    'temperature' => '8-10°C',
                    'description' => 'Rosé delicado, aromas florais e frutas vermelhas frescas com equilíbrio perfeito.',
                    'image_url' => 'https://images.unsplash.com/photo-1625602150038-94ccf8d46805?auto=format&fit=crop&w=900&q=80',
                    'categories' => ['roses'],
                ],
                [
                    'name' => 'Champagne Veuve Clicquot',
                    'slug' => 'champagne-veuve-clicquot',
                    'origin' => 'Champagne, França',
                    'type' => 'Espumante',
                    'price' => '299.90',
                    'original_price' => '499.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '6-8°C',
                    'description' => 'Clássico champanhe com bolhas finas, notas de brioche e fruta madura.',
                    'image_url' => 'https://images.unsplash.com/photo-1580915411954-282cb1cfd6b0?auto=format&fit=crop&w=900&q=80',
                    'categories' => ['espumantes'],
                ],
                [
                    'name' => 'Malbec Gran Reserva',
                    'slug' => 'malbec-gran-reserva',
                    'origin' => 'Mendoza, Argentina',
                    'type' => 'Tinto',
                    'price' => '119.90',
                    'original_price' => '199.90',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '14%',
                    'temperature' => '16-18°C',
                    'description' => 'Malbec encorpado com taninos macios, notas de ameixa e chocolate.',
                    'image_url' => 'https://images.unsplash.com/photo-1609536906620-6e96d5076b31?auto=format&fit=crop&w=900&q=80',
                    'categories' => ['tintos'],
                ],
                [
                    'name' => 'Sauvignon Blanc Estate',
                    'slug' => 'sauvignon-blanc-estate',
                    'origin' => 'Marlborough, Nova Zelândia',
                    'type' => 'Branco',
                    'price' => '99.90',
                    'original_price' => '169.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12.5%',
                    'temperature' => '8-10°C',
                    'description' => 'Notas cítricas e herbáceas intensas com final mineral refrescante.',
                    'image_url' => 'https://images.unsplash.com/photo-1553856622-d1b352e9c38d?auto=format&fit=crop&w=900&q=80',
                    'categories' => ['brancos'],
                ],
                [
                    'name' => "Rosé d'Anjou",
                    'slug' => 'rose-danjou',
                    'origin' => 'Loire, França',
                    'type' => 'Rosé',
                    'price' => '79.90',
                    'original_price' => '139.90',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-10°C',
                    'description' => 'Rosé leve e frutado com notas de morango e framboesa.',
                    'image_url' => 'https://images.unsplash.com/photo-1622461142777-885ad2a27b7c?auto=format&fit=crop&w=900&q=80',
                    'categories' => ['roses'],
                ],
                [
                    'name' => 'Prosecco DOC Brut',
                    'slug' => 'prosecco-doc-brut',
                    'origin' => 'Veneto, Itália',
                    'type' => 'Espumante',
                    'price' => '69.90',
                    'original_price' => '119.90',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '11.5%',
                    'temperature' => '6-8°C',
                    'description' => 'Espumante refrescante com notas de pera e flores brancas.',
                    'image_url' => 'https://images.unsplash.com/photo-1514361892635-6e122620e235?auto=format&fit=crop&w=900&q=80',
                    'categories' => ['espumantes'],
                ],
                [
                    'name' => 'Cabernet Sauvignon Reserve',
                    'slug' => 'cabernet-sauvignon-reserve',
                    'origin' => 'Napa Valley, EUA',
                    'type' => 'Tinto',
                    'price' => '159.90',
                    'original_price' => '279.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '14.5%',
                    'temperature' => '16-18°C',
                    'description' => 'Estrutura firme com notas de cassis, cedro e um leve toque de baunilha.',
                    'image_url' => 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=900&q=80',
                    'categories' => ['tintos'],
                ],
                [
                    'name' => 'Pinot Grigio DOC',
                    'slug' => 'pinot-grigio-doc',
                    'origin' => 'Veneto, Itália',
                    'type' => 'Branco',
                    'price' => '79.90',
                    'original_price' => '139.90',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-10°C',
                    'description' => 'Pinot Grigio fresco com notas de maçã verde e cítricos.',
                    'image_url' => 'https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&w=900&q=80',
                    'categories' => ['brancos'],
                ],
            ];

            foreach ($products as $productData) {
                $product = Product::create([
                    'name' => $productData['name'],
                    'slug' => $productData['slug'] ?? Str::slug($productData['name']),
                    'origin' => $productData['origin'] ?? null,
                    'type' => $productData['type'] ?? null,
                    'price' => $productData['price'],
                    'original_price' => $productData['original_price'] ?? null,
                    'rating' => $productData['rating'] ?? null,
                    'volume' => $productData['volume'] ?? null,
                    'alcohol' => $productData['alcohol'] ?? null,
                    'temperature' => $productData['temperature'] ?? null,
                    'description' => $productData['description'] ?? null,
                    'active' => true,
                ]);

                $categoryIds = collect($productData['categories'] ?? [])
                    ->map(fn (string $slug): ?int => $categories[$slug]->id ?? null)
                    ->filter()
                    ->all();

                $product->categories()->sync($categoryIds);

                ProductImage::create([
                    'product_id' => $product->id,
                    'url' => $productData['image_url'],
                    'alt' => $productData['name'] . ' - imagem principal',
                    'position' => 1,
                    'is_primary' => true,
                ]);
            }
        });
    }

    /**
     * Reset catalog related tables for a clean seed.
     */
    private function resetTables(): void
    {
        $tables = [
            'product_images',
            'product_category',
            'product_variants',
            'product_price_history',
            'products',
            'categories',
            'groups',
        ];

        foreach ($tables as $table) {
            try {
                DB::statement("TRUNCATE TABLE {$table} RESTART IDENTITY CASCADE");
            } catch (\Throwable $exception) {
                DB::table($table)->delete();
            }
        }
    }
}
