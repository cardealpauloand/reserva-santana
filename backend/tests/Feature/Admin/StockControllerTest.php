<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Services\InventoryService;
use Database\Seeders\InventorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(InventorySeeder::class);
    }

    public function test_it_lists_products(): void
    {
        $product = Product::create([
            'name' => 'Vinho Reserva',
            'slug' => 'vinho-reserva-' . uniqid(),
            'price' => 99.90,
        ]);

        app(InventoryService::class)->registerProductMovement(
            $product->id,
            10,
            'entrada',
        );

        $response = $this->getJson('/api/admin/stock/products');

        $response->assertOk()
            ->assertJsonFragment([
                'id' => $product->id,
                'name' => 'Vinho Reserva',
                'stock_quantity' => 10,
                'current_stock' => 10,
            ]);
    }

    public function test_it_creates_stock_movement_and_updates_stock(): void
    {
        $product = Product::create([
            'name' => 'Vinho Entrada',
            'slug' => 'vinho-entrada-' . uniqid(),
            'price' => 79.90,
        ]);

        app(InventoryService::class)->registerProductMovement(
            $product->id,
            5,
            'entrada',
        );

        $response = $this->postJson('/api/admin/stock/movements', [
            'product_id' => $product->id,
            'quantity' => 3,
            'movement_type' => 'entrada',
            'reason' => 'Reposição automática',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.current_quantity', 8)
            ->assertJsonPath('data.movement_type', 'entrada');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock_quantity' => 8,
        ]);

        $this->assertDatabaseHas('stock_movement', [
            'product_id' => $product->id,
            'quantity' => 3,
            'reason' => 'Reposição automática',
        ]);
    }

    public function test_it_prevents_negative_stock_on_saida(): void
    {
        $product = Product::create([
            'name' => 'Vinho Saída',
            'slug' => 'vinho-saida-' . uniqid(),
            'price' => 59.90,
        ]);

        app(InventoryService::class)->registerProductMovement(
            $product->id,
            2,
            'entrada',
        );

        $response = $this->postJson('/api/admin/stock/movements', [
            'product_id' => $product->id,
            'quantity' => 5,
            'movement_type' => 'saida',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['quantity']);

        $this->assertDatabaseMissing('stock_movement', [
            'product_id' => $product->id,
            'quantity' => 5,
        ]);
    }
}
