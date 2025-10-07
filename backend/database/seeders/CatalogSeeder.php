<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Group;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\TypeMovement;
use App\Services\InventoryService;
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
        $inventoryService = app(InventoryService::class);

        DB::transaction(function () use ($inventoryService): void {
            $this->resetTables();

            $group = Group::create([
                'name' => 'Coleção Reserva Santana',
            ]);

            $categoryDefinitions = [
                'tintos' => ['name' => 'Vinhos Tintos', 'type' => 'Tinto'],
                'brancos' => ['name' => 'Vinhos Brancos', 'type' => 'Branco'],
                'roses' => ['name' => 'Vinhos Rosés', 'type' => 'Rosé'],
                'espumantes' => ['name' => 'Vinhos Espumantes', 'type' => 'Espumante'],
                'premium-reserva' => ['name' => 'Vinhos Reserva Premium', 'type' => 'Premium'],
                'premium-raros' => ['name' => 'Vinhos Raros', 'type' => 'Premium'],
                'premium-gran-reserva' => ['name' => 'Gran Reserva', 'type' => 'Premium'],
                'premium-importados' => ['name' => 'Importados Premium', 'type' => 'Premium'],
                'kit-degustacao' => ['name' => 'Kit Degustação', 'type' => 'Kit'],
                'kit-presente' => ['name' => 'Kit Presente', 'type' => 'Kit'],
                'kit-harmonizacao' => ['name' => 'Kit Harmonização', 'type' => 'Kit'],
                'kit-iniciante' => ['name' => 'Kit Iniciante', 'type' => 'Kit'],
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
                    'image_url' => 'https://cdn.awsli.com.br/600x1000/2574/2574994/produto/2113151299951fc4074.jpg',
                    'categories' => ['tintos', 'premium-reserva', 'premium-raros'],
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
                    'image_url' => 'https://cdn.awsli.com.br/600x1000/2574/2574994/produto/2113151299951fc4074.jpg',
                    'categories' => ['brancos', 'premium-reserva', 'premium-importados'],
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
                    'image_url' => 'https://cdn.awsli.com.br/600x1000/2574/2574994/produto/2113151299951fc4074.jpg',
                    'categories' => ['roses', 'premium-reserva', 'premium-raros'],
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
                    'image_url' => 'https://cdn.awsli.com.br/600x1000/2574/2574994/produto/2113151299951fc4074.jpg',
                    'categories' => ['espumantes', 'premium-importados', 'premium-raros'],
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
                    'image_url' => 'https://cdn.awsli.com.br/600x1000/2574/2574994/produto/2113151299951fc4074.jpg',
                    'categories' => ['tintos', 'premium-reserva', 'premium-gran-reserva'],
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
                    'image_url' => 'https://cdn.awsli.com.br/600x1000/2574/2574994/produto/2113151299951fc4074.jpg',
                    'categories' => ['brancos', 'premium-importados'],
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
                    'image_url' => 'https://cdn.awsli.com.br/600x1000/2574/2574994/produto/2113151299951fc4074.jpg',
                    'categories' => ['roses', 'premium-importados'],
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
                    'image_url' => 'https://cdn.awsli.com.br/600x1000/2574/2574994/produto/2113151299951fc4074.jpg',
                    'categories' => ['espumantes', 'premium-importados'],
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
                    'image_url' => 'https://cdn.awsli.com.br/600x1000/2574/2574994/produto/2113151299951fc4074.jpg',
                    'categories' => ['tintos', 'premium-reserva', 'premium-importados'],
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
                    'image_url' => 'https://cdn.awsli.com.br/600x1000/2574/2574994/produto/2113151299951fc4074.jpg',
                    'categories' => ['brancos', 'premium-importados'],
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
                    ->map(fn(string $slug): ?int => $categories[$slug]->id ?? null)
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

                $initialStock = $productData['stock_quantity'] ?? $productData['initial_stock'] ?? random_int(25, 150);

                if ($initialStock > 0) {
                    $inventoryService->registerProductMovement(
                        $product->id,
                        (int) $initialStock,
                        TypeMovement::ENTRADA,
                        'Estoque inicial automático',
                    );
                }
            }
        });
    }

    /**
     * Reset catalog related tables for a clean seed.
     */
    private function resetTables(): void
    {
        $tables = [
            'stock_movement',
            'product_stock',
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
