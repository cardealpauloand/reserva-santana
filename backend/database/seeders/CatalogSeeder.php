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
                

                'kit-barolo' => ['name' => 'Kit Barolo', 'type' => 'Kit'],
                'kit-best-sellers' => ['name' => 'Kit Best Sellers', 'type' => 'Kit'],
                'kit-refrescante' => ['name' => 'Kit Refrescante', 'type' => 'Kit'],
                'kit-harmonizacao' => ['name' => 'Kit Harmonização', 'type' => 'Kit'],
                'kit-primitivo' => ['name'=>'Kit Primitivo', 'type'=>'Kit'],
                'kit-uvas-iconicas' => ['name' => 'Kit Uvas Icônicas', 'type' => 'Kit'],
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
                    'name' => 'Kit 10 Vinhos por R$27,90 cada garrafa',
                    'slug' => 'kit-10-vinhos-por-27-90-cada-garrafa',
                    'origin' => 'Vários Países',
                    'type' => 'Kit',
                    'price' => '279',
                    'original_price' => '639',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '6-10°C',
                    'description' => 'Selecionamos o kit ideal para você renovar a adega e brindar no dia a dia.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0281471-standing-front.png',
                    'categories' => ['tintos','brancos'],
                ],
                [
                    'name' => 'Kit 9 Espumantes por R$32,90 cada garrafa',
                    'slug' => 'kit-9-espumantes',
                    'origin' => 'Madrid, Espanha',
                    'type' => 'Kit',
                    'price' => '296.10',
                    'original_price' => '629.70',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '6-10°C',
                    'description' => 'Celebre momentos especiais com espumantes que conquistaram a preferência dos nossos clientes.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0278451-standing-front.png',
                    'categories' => ['kit-best-sellers','espumantes'],
                ],

                [
                    'name' => 'Don Simon Seleccion Tempranillo',
                    'slug' => 'chateau-margaux-2015',
                    'origin' => 'Bordeaux, França',
                    'type' => 'Tinto',
                    'price' => '69.90',
                    'original_price' => '69.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '13.5%',
                    'temperature' => '16-18°C',
                    'description' => 'Safra premiada com notas complexas de frutas vermelhas maduras, taninos sedosos e final prolongado.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1646870-standing-front.png',
                    'categories' => ['tintos', 'premium-reserva', 'premium-raros'],
                ],
                [
                    'name' => 'Isla Seca Winemaker Selection Chardonnay Central Valley D.O.',
                    'slug' => 'chardonnay-reserve-2020',
                    'origin' => 'Mendoza, Argentina',
                    'type' => 'Branco',
                    'price' => '94.90',
                    'original_price' => '74.90',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '13%',
                    'temperature' => '10-12°C',
                    'description' => 'Pinot Grigio fresco com notas de maçã verde e cítricos.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000024770-standing-front.png',
                    'categories' => ['brancos', 'premium-reserva', 'premium-importados'],
                ],
                [
                    'name' => 'Alicia en el Pais de Las Uvas Bobal Rosado Pálido',
                    'slug' => 'provence-rose-premium',
                    'origin' => 'Provence, França',
                    'type' => 'Rosé',
                    'price' => '89.90',
                    'original_price' => '89.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12.5%',
                    'temperature' => '8-10°C',
                    'description' => 'Rosé delicado, aromas florais e frutas vermelhas frescas com equilíbrio perfeito.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000023503-standing-front.png',
                    'categories' => ['roses', 'premium-reserva', 'premium-raros'],
                ],
                [
                    'name' => 'Tanggier Brut',
                    'slug' => 'champagne-veuve-clicquot',
                    'origin' => 'Champagne, França',
                    'type' => 'Espumante',
                    'price' => '89.90',
                    'original_price' => '89.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '6-8°C',
                    'description' => 'Clássico champanhe com bolhas finas, notas de brioche e fruta madura.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1643700-standing-front.png',
                    'categories' => ['espumantes', 'premium-importados', 'premium-raros'],
                ],

                [
                    'name' => 'Gran Maestro Bianco Appassimento Puglia IGT 2024',
                    'slug' => 'gran-maestro-bianco-appassimento-puglia-igt-2024',
                    'origin' => 'Puglia, Itália',
                    'type' => 'Tinto',
                    'price' => '129.90',
                    'original_price' => '169.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '14%',
                    'temperature' => '16-18°C',
                    'description' => 'Primitivo encorpado com notas de frutas maduras e especiarias.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000025690-standing-front.png',
                    'categories' => ['tintos', 'premium-reserva', 'premium-importados','brancos'],
                ],

                [
                    'name' => 'Gran Maestro Primitivo di Manduria DOC 2022',
                    'slug' => 'malbec-gran-reserva',
                    'origin' => 'Mendoza, Argentina',
                    'type' => 'Tinto',
                    'price' => '209.90',
                    'original_price' => '229.90',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '14%',
                    'temperature' => '16-18°C',
                    'description' => 'Malbec encorpado com taninos macios, notas de ameixa e chocolate.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000024770-standing-front.png',
                    'categories' => ['tintos', 'premium-reserva', 'premium-gran-reserva'],
                ],
                [
                    'name' => 'Lupo Meraviglia Uno di Uno Vermentino Puglia IGT 2024',
                    'slug' => 'sauvignon-blanc-estate',
                    'origin' => 'Marlborough, Nova Zelândia',
                    'type' => 'Branco',
                    'price' => '179.78',
                    'original_price' => '199.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12.5%',
                    'temperature' => '8-10°C',
                    'description' => 'Notas cítricas e herbáceas intensas com final mineral refrescante.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000024770-standing-front.png', 
                    'categories' => ['brancos', 'premium-importados'],
                ],
                [
                    'name' => "Biscardo Rosapasso Originale Pinot Nero Veneto IGT 2024",
                    'slug' => 'rose-danjou',
                    'origin' => 'Loire, França',
                    'type' => 'Rosé',
                    'price' => '179.90',
                    'original_price' => '179.90',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-10°C',
                    'description' => 'Rosé leve e frutado com notas de morango e framboesa.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000025589-standing-front.png',
                    'categories' => ['roses', 'premium-importados'],
                ],
                [
                    'name' => 'Chandon Riche Demi-Sec 750mL',
                    'slug' => 'prosecco-doc-brut',
                    'origin' => 'Veneto, Itália',
                    'type' => 'Espumante',
                    'price' => '119.90',
                    'original_price' => '159.90',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '11.5%',
                    'temperature' => '6-8°C',
                    'description' => 'Espumante refrescante com notas de pera e flores brancas.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000019810-standing-front.png',
                    'categories' => ['espumantes', 'premium-importados'],
                ],
                [
                    'name' => 'Infinitum Sangiovese Rubicone IGT',
                    'slug' => 'cabernet-sauvignon-reserve',
                    'origin' => 'Napa Valley, EUA',
                    'type' => 'Tinto',
                    'price' => '219.90',
                    'original_price' => '309.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '14.5%',
                    'temperature' => '16-18°C',
                    'description' => 'Estrutura firme com notas de cassis, cedro e um leve toque de baunilha.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000025503-standing-front.png',
                    'categories' => ['tintos', 'premium-reserva', 'premium-importados'],
                ],
                [
                    'name' => 'Portada Sweet White Vinho Regional Lisboa',
                    'slug' => 'portada-sweet-white',
                    'origin' => 'Lisboa, Portugal',
                    'type' => 'Branco',
                    'price' => '109.90',
                    'original_price' => '169.90',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-10°C',
                    'description' => 'Pinot Grigio fresco com notas de maçã verde e cítricos.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000025650-standing-front.png',
                    'categories' => ['brancos', 'premium-importados'],
                ],

                [
                    'name' => 'Kit 6 Espumantes para Celebrar',
                    'slug' => 'kit-6-espumantes-para-celebrar',
                    'origin' => 'Vários Países',
                    'type' => 'Espumante',
                    'price' => '299.90',
                    'original_price' => '589.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '14%',
                    'temperature' => '16-18°C',
                    'description' => 'Primitivo encorpado com notas de frutas maduras e especiarias.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0281411-standing-front.png',
                    'categories' => ['espumantes', 'premium-reserva', 'premium-importados','brancos'],
                ],

                [
                    'name' => 'Alísios Brut',
                    'slug' => 'Alísios-brut',
                    'origin' => 'Vale do São Francisco, Brasil',
                    'type' => 'Espumante',
                    'price' => '88.90',
                    'original_price' => '99.80',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '14%',
                    'temperature' => '16-18°C',
                    'description' => 'Espumante brasileiro com notas de frutas brancas e toques florais.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1693610-standing-front.png',
                    'categories' => ['espumantes'],
                ],

                [
                    'name' => 'Lupo Meraviglia Tre di Tre Rosso di Puglia IGT 2023',
                    'slug' => 'lupo-meraviglia-tre-di-tre-rosso-di-puglia-igt-2023',
                    'origin' => 'Puglia, Itália',
                    'type' => 'Tinto',
                    'price' => '149.9',
                    'original_price' => '169.9',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Celebre momentos especiais com rótulos que revelam a elegância e a tradição dos terroirs italianos.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000025688-standing-front.png',
                    'categories' => ['tintos', 'premium-reserva', 'premium-raros'],
                ],

                [
                    'name' => 'Casale Brondello Primitivo di Manduria DOC 2022',
                    'slug' => 'casale-brondello-primitivo-di-manduria-doc-2022',
                    'origin' => 'Puglia, Itália',
                    'type' => 'Tinto',
                    'price' => '129.9',
                    'original_price' => '169.9',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '14%',
                    'temperature' => '16-18°C',
                    'description' => 'Primitivo encorpado com notas de frutas negras maduras, especiarias e um toque de baunilha.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000024229-standing-front.png',
                    'categories' => ['tintos', 'premium-reserva', 'premium-raros'],
                ],

                [
                    'name' => 'Aimone Vino Rosso d’Italia',
                    'slug' => 'aimone-vino-rosso-d’italia',
                    'origin' => 'Multiregional, Italia',
                    'type' => 'Tinto',
                    'price' => '129.90',
                    'original_price' => '169.90',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '14%',
                    'temperature' => '16-18°C',
                    'description' => 'Vinho tinto italiano com notas intensas de frutas vermelhas maduras, especiarias e um toque de carvalho.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1697400-standing-front.png',
                    'categories' => ['tintos', 'premium-reserva', 'premium-gran-reserva','premium-raros'],
                ],


                [
                    'name' => 'Grand Arte Alicante Bouschet Vinho Regional Lisboa 2022',
                    'slug' => 'grand-arte-alicante-bouschet-vinho-regional-lisboa-2022',
                    'origin' => 'Lisboa, Portugal',
                    'type' => 'tinto',
                    'price' => '109.7',
                    'original_price' => '139.7',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-10°C',
                    'description' => 'Desfrute de uma seleção especial de tintos que conquistaram prêmios internacionais e elogios da crítica especializada.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/1000024409-standing-front.png',
                    'categories' => ['premium-reserva','tintos', 'premium-importados','premium-raros'],
                ],

                /* kits harmonização */
                [
                    'name' => 'kit Harmonizado Vinho Tinto + Massa e Molho Pesto',
                    'slug' => 'kit-harmonizado-vinho-tinto-massa-molho-pesto',
                    'origin' => 'Vêneto, Itália',
                    'type' => 'Kit',
                    'price' => '179.6',
                    'original_price' => '219.6',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-10°C',
                    'description' => 'Harmonize seus pratos de massa com este kit especial.',
                    'image_url' => 'https://divvino.vtexassets.com/arquivos/ids/160720-1200-auto?v=638695343576000000&width=1200&height=auto&aspect=true',
                    'categories' => ['kit-harmonizacao','tintos'],
                ],
                [
                    'name' => 'Kit 4 Tintos para Harmonizar com Massas',
                    'slug' => 'kit-4-tintos-para-harmonizar-com-massas',
                    'origin' => 'Vêneto, Itália',
                    'type' => 'Kit',
                    'price' => '179.6',
                    'original_price' => '279.6',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-10°C',
                    'description' => 'Harmonize seus pratos de massa com este kit especial.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0238501-standing-front.png',
                    'categories' => ['kit-harmonizacao','tintos'],
                ],
                [
                    'name' => 'Kit 3 Lupo Meraviglia Tre di Tre Rosso di Puglia IGT',
                    'slug' => 'kit-3-lupo-meraviglia-tre-di-tre-rosso-di-puglia-igt',
                    'origin' => 'Puglia, Itália',
                    'type' => 'Kit',
                    'price' => '399.7',
                    'original_price' => '509.7',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-10°C',
                    'description' => 'Deguste em seus jantares um best seller produzido a partir das castas Negroamaro, Aglianico e Primitivo.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0275651-standing-front.png',
                    'categories' => ['kit-harmonizacao','kit-best-sellers','tintos'],
                ],
                [
                    'name' => 'Kit Harmonização Vinho & Prosciutto',
                    'slug' => 'kit-harmonizacao-vinho-prosciutto',
                    'origin' => 'Udinese, Itália',
                    'type' => 'Kit',
                    'price' => '359.7',
                    'original_price' => '399.7',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '16-18°C',
                    'description' => 'Comemore datas especiais em grande estilo, no conforto de sua casa, Selecionamos produtos artesanais pra você curtir seus momentos especiais.',
                    'image_url' => 'https://files.catbox.moe/qp43nf.jpg',
                    'categories' => ['kit-harmonizacao','brancos'],
                ],



                /*kit best sellers*/
                [
                    'name' => 'Kit 4 Best Sellers',
                    'slug' => 'kit-4-best-sellers',
                    'origin' => 'Vários países',
                    'type' => 'Kit',
                    'price' => '199.9',
                    'original_price' => '329.7',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '6-10°C',
                    'description' => 'Celebre momentos especiais com espumantes que conquistaram a preferência dos nossos clientes.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0281921-standing-front.png',
                    'categories' => ['kit-best-sellers','brancos','roses','tintos'],
                ],
                [
                    'name' => 'Kit 5 tintos Best Sellers',
                    'slug' => 'kit-5-tintos-best-sellers',
                    'origin' => 'Vários países',
                    'type' => 'Kit',
                    'price' => '389.5',
                    'original_price' => '739.5',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-10°C',
                    'description' => 'Aprecie rótulos que conquistaram a crítica especializada e as adegas dos nossos clientes.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0280941-standing-front.png',
                    'categories' => ['kit-best-sellers','tintos'],
                ],
                
                [
                    'name' => 'Kit 6 tintos Best Sellers',
                    'slug' => 'kit-6-tintos-best-sellers',
                    'origin' => 'Vários países',
                    'type' => 'Kit',
                    'price' => '429.4',
                    'original_price' => '819.4',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-10°C',
                    'description' => 'Reunimos neste kit uma seleção de best sellers do nosso catálogo por um preço especial.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_215/v1/products/0279491-standing-front.png',
                    'categories' => ['kit-best-sellers','tintos'],
                ],
                /*kit refrescantes*/
                [
                    'name' => 'Kit 10 Vinhos Refrescantes por R$25,90 cada garrafa',
                    'slug' => 'kit-10-vinhos-refrescantes-por-r-25-90-cada-garrafa',
                    'origin' => 'Barcelona, Espanha',
                    'type' => 'Kit',
                    'price' => '599.6',
                    'original_price' => '729.6',
                    'rating' => 3,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Perfeito para dias quentes, este kit traz vinhos leves e frescos para todas as ocasiões.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0233701-standing-front.png',
                    'categories' => ['kit-refrescante','brancos','roses'],
                ],
                [
                    'name' => 'Kit 6 vinhos refrescantes',
                    'slug' => 'kit-6-vinhos-refrescantes',
                    'origin' => 'Vários países',
                    'type' => 'Kit',
                    'price' => '289',
                    'original_price' => '494.4',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Perfeito para dias quentes, este kit traz vinhos leves e frescos para todas as ocasiões.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0280561-standing-front.png',
                    'categories' => ['kit-refrescante','brancos','roses'],
                ],
                [
                    'name' => 'Kit 8 vinhos refrescantes do Velho Mundo',
                    'slug' => 'kit-8-vinhos-refrescantes-velho-mundo',
                    'origin' => 'Vários países',
                    'type' => 'Kit',
                    'price' => '309.6',
                    'original_price' => '494.2',
                    'rating' => 3,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Selecionamos brancos e rosés frutados e versáteis que são perfeitos para acompanhar saladas e aperitivos. Confira regiões atendidas pela política de frete grátis',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0281851-standing-front.png',
                    'categories' => ['kit-refrescante','brancos','roses'],
                ],
                [
                    'name' => 'Kit 3 Vinhos Refrescantes + Bolsa Exclusiva',
                    'slug' => 'kit-3-refrescantes-bolsa-exclusiva-por-159-90',
                    'origin' => 'Vários países',
                    'type' => 'Kit',
                    'price' => '189.9',
                    'original_price' => '379.6',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Selecionamos neste kit Gustav, Tanggier e Epic Wines, ideais para harmonizar com pratos leves, e uma bolsa para suas garrafas.',
                    'image_url' => 'https://files.catbox.moe/9diws7.jpeg',
                    'categories' => ['kit-refrescante','brancos','roses'],
                ],



                /*kits primitivos*/
                [
                    'name' => 'Kit 5 Casale Brondello Primitivo di Manduria DOC por R$99,90 cada garrafa + Bolsa Exclusiva',
                    'slug' => 'kit-5-casale-brondello-primitivo-di-manduria-doc-por-99-90-cada-garrafa-bolsa-exclusiva',
                    'origin' => 'Veneto, Itália',
                    'type' => 'Kit',
                    'price' => '499.5',
                    'original_price' => '999.4',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Celebre com o Casale Brondello, um clássico que revela a tradição e maestria de uma vinícola centenária.',
                    'image_url' => 'https://files.catbox.moe/zbtt0l.jpg',
                    'categories' => ['kit-primitivo','tintos'],
                ],
                [
                    'name' => 'Kit 3 Primitivos di Manduria por R$119,90 cada garrafa + Bolsa Exclusiva Grátis',
                    'slug' => 'kit-3-primitivos-di-manduria-por-119-90-cada-garrafa-bolsa-exclusiva-gratis',
                    'origin' => 'Veneto, Itália',
                    'type' => 'Kit',
                    'price' => '359.7',
                    'original_price' => '669.6',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Desfrute este Primitivo amadurecido em carvalho e cultivado nos icônicos solos de Manduria.',
                    'image_url' => 'https://files.catbox.moe/hds4w8.png',
                    'categories' => ['kit-primitivo','tintos'],
                ],
                [
                    'name' => 'Kit Primitivos di Manduria | 1 Casale Brondello + 1 Gran Maestro + 1 Nero Reale',
                    'slug' => 'kit-3-primitivos-di-manduria',
                    'origin' => 'Veneto, Itália',
                    'type' => 'Kit',
                    'price' => '399.7',
                    'original_price' => '639.7',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Reunimos três Primitivos di Manduria para você aproveitar diferentes expressões deste clássico italiano.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0282431-standing-front.png',
                    'categories' => ['kit-primitivo','tintos'],
                ],

                [
                    'name' => 'Kit 6 Primitivos por R$82,00 cada garrafa',
                    'slug' => 'kit-6-primitivos-por-82-00-cada',
                    'origin' => 'Veneto, Itália',
                    'type' => 'Kit',
                    'price' => '429.2',
                    'original_price' => '829.4',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Celebre momentos especiais com rótulos que revelam a elegância e a tradição dos terroirs italianos. *Oferta não cumulativa com uso de cupom.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0281881-standing-front.png',
                    'categories' => ['kit-primitivo','tintos'],
                ],



                /*kits tintos*/

                

                /*kits barolo*/

                [
                     'name' => 'Kit Leve 4 Pague 2 Terre da Vino Barolo',
                      'slug' => 'kit-leve-4-pague-2-terre-da-vino-barolo',
                      'origin' => 'Veneto, Itália',
                      'type' => 'Kit',
                      'price' => '959.7',
                      'original_price' => '1819.6',
                      'rating' => 5,
                      'volume' => '750ml',
                      'alcohol' => '11%',
                      'temperature' => '6-10°C',
                      'description' => 'Aproveite esta oferta especial e leve para casa quatro garrafas do renomado Barolo Terre da Vino, pagando apenas por duas.',
                      'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0280811-standing-front.png',
                      'categories' => ['kit-barolo','tintos','premium-raros'],
                ],

                [
                    'name' => 'Kit 2 San Carlo Dezzani Barolo',
                    'slug' => 'kit-2-san-carlo-dezzani-barolo',
                    'origin' => 'Veneto, Itália',
                    'type' => 'Kit',
                    'price' => '629.8',
                    'original_price' => '1199.8',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Aproveite esta seleção especial de Barolos, perfeitos para ocasiões memoráveis.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0280291-standing-front.png',
                    'categories' => ['kit-barolo','tintos','premium-raros'],
                ],

                [
                    'name' => 'Kit 3 Ícones da Itália',
                    'slug' => 'kit-3-icones-da-italia',
                    'origin' => 'Veneto, Itália',
                    'type' => 'Kit',
                    'price' => '839.8',
                    'original_price' => '1929.7',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Explore a riqueza dos vinhos italianos com este kit.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0280761-standing-front.png',
                    'categories' => ['kit-barolo','tintos','premium-raros'],
                ],

                [
                   'name' => 'Kit Barolo | 3 garrafas por R$279,90 cada + Bolsa Exclusiva Grátis',
                    'slug' => 'kit-3-barolos-por-279-90-cada-bolsa-gratis',
                    'origin' => 'Veneto, Itália',
                    'type' => 'Kit',
                    'price' => '869.7',
                    'original_price' => '1819.6',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '11%',
                    'temperature' => '6-10°C',
                    'description' => 'Deguste diferentes versões de um dos vinhos mais famosos da Itália: o Barolo.',
                    'image_url' => 'https://files.catbox.moe/qbthg2.webp',
                    'categories' => ['kit-barolo','tintos'], 
                ],
                
                /*kits uvas iconicas*/
                [
                    'name' => 'Kit Uvas Icônicas | 10 garrafas por R$28,90 cada',
                    'slug' => 'kit-10-uvas-iconicas-por-28-90-cada',
                    'origin' => 'Colchagua Valley, Chile',
                    'type' => 'Kit',
                    'price' => '289',
                    'original_price' => '684',
                    'rating' => 5,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-18°C',
                    'description' => 'Com este kit, você garante expressões de Pinot Noir, Malbec, Tempranillo, Cabernet Sauvignon, Merlot, Syrah, Torrontés, Sauvignon Blanc e Chardonnay.',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0281521-standing-front.png',
                    'categories' => ['kit-uvas-iconicas','tintos','brancos'],
                ],
                [
                    'name' => 'Kit Uvas Icônicas | 10 garrafas por R$31,90 cada',
                    'slug' => 'kit-10-uvas-iconicas-por-31-90-cada',
                    'origin' => 'Vários países',
                    'type' => 'Kit',
                    'price' => '319',
                    'original_price' => '694',
                    'rating' => 4,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-18°C',
                    'description' => 'Abasteça a sua adega com vinhos produzidos a partir das uvas Malbec, Cabernet Sauvignon, Syrah, Pinot Noir e Tempranillo. *Confira regiões atendidas pela política de frete grátis',
                    'image_url' => 'https://res.cloudinary.com/evino/image/upload/q_auto:good,fl_progressive:steep,f_auto,dpr_2.0,h_434/v1/products/0282141-standing-front.png',
                    'categories' => ['kit-uvas-iconicas','tintos'],
                ],
                [
                    'name' => 'Kit Uvas Ícones | 10 garrafas por R$37,90 cada + Bolsa Exclusiva Grátis',
                    'slug' => 'kit-10-uvas-icones-bolsa-exclusiva-gratis',
                    'origin' => 'Santa Rita, Chile',
                    'type' => 'Kit',
                    'price' => '379',
                    'original_price' => '753.3',
                    'rating' => 3,
                    'volume' => '750ml',
                    'alcohol' => '12%',
                    'temperature' => '8-18°C',
                    'description' => 'Abasteça sua adega com expressões de Malbec, Cabernet Sauvignon, Tempranillo, Carménère, Merlot, Syrah, Torrontés, Sauvignon Blanc e Chardonnay.',
                    'image_url' => 'https://files.catbox.moe/ty0qil.webp',
                    'categories' => ['kit-uvas-iconicas','tintos','brancos', 'roses'],
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
