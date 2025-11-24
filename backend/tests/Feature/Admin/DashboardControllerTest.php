<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Group;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');

        Schema::create('orders', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->nullable();
            $table->string('status');
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->timestampTz('created_at')->nullable();
            $table->timestampTz('updated_at')->nullable();
        });

        Schema::create('order_items', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->foreignId('order_id');
            $table->foreignId('product_id');
            $table->integer('quantity');
            $table->decimal('total_price', 12, 2)->default(0);
            $table->timestampTz('created_at')->nullable();
        });
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_it_returns_dashboard_summary_with_data(): void
    {
        $this->freezeNow();
        $fixtures = $this->seedDashboardData();

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertOk();

        $response->assertJsonPath('data.stats.0.key', 'orders');
        $response->assertJsonPath('data.stats.0.value', 2);
        $response->assertJsonPath('data.stats.0.extra.awaiting_fulfillment', 2);

        $response->assertJsonPath('data.stats.3.key', 'revenue');
        $response->assertJsonPath('data.stats.3.value', 250.5);
        $response->assertJsonPath('data.stats.3.extra.average_order_value', 250.5);

        $response->assertJsonPath('data.inventory.category_count', 1);
        $response->assertJsonPath('data.inventory.low_stock_count', 1);

        $response->assertJsonCount(2, 'data.recent_orders');
        $response->assertJsonPath('data.recent_orders.0.id', $fixtures['pendingOrderId']);

        $response->assertJsonPath('data.top_products.0.product_id', $fixtures['recentProductId']);
        $response->assertJsonPath('data.top_products.0.quantity_sold', 2);

        $currentStart = Carbon::now()->copy()->startOfMonth();
        $currentEnd = Carbon::now()->copy()->endOfDay();
        $days = $currentStart->diffInDays($currentEnd) + 1;
        $comparisonEnd = $currentStart->copy()->subSecond();
        $comparisonStart = $comparisonEnd->copy()->subDays($days - 1)->startOfDay();

        $response->assertJsonPath('data.comparison_range.source', 'prior_block');
        $response->assertJsonPath('data.comparison_range.days', $days);
        $response->assertJsonPath('data.comparison_range.start', $comparisonStart->toDateString());
        $response->assertJsonPath('data.comparison_range.end', $comparisonEnd->toDateString());
        $response->assertJsonPath('data.stats.0.comparison_label', $response->json('data.comparison_range.label'));
        $this->assertStringContainsString(
            $comparisonStart->format('d/m/Y'),
            (string) $response->json('data.comparison_note')
        );
    }

    public function test_it_respects_custom_date_filters(): void
    {
        $this->freezeNow();
        $fixtures = $this->seedDashboardData();

        $start = Carbon::now()->copy()->subMonth()->startOfMonth()->format('Y-m-d');
        $end = Carbon::now()->copy()->subMonth()->endOfMonth()->format('Y-m-d');

        $response = $this->getJson("/api/admin/dashboard?start_date={$start}&end_date={$end}");

        $response->assertOk()
            ->assertJsonPath('data.stats.0.value', 1)
            ->assertJsonPath('data.stats.3.value', 180.0)
            ->assertJsonCount(1, 'data.recent_orders')
            ->assertJsonPath('data.recent_orders.0.id', $fixtures['previousOrderId'])
            ->assertJsonPath('data.top_products.0.quantity_sold', 1);
    }

    public function test_it_handles_missing_order_tables(): void
    {
        $this->freezeNow();
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');

        $response = $this->getJson('/api/admin/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.stats.0.value', 0)
            ->assertJsonPath('data.recent_orders', [])
            ->assertJsonPath('data.top_products', []);
    }

    public function test_it_uses_recent_days_comparison_for_past_ranges(): void
    {
        $this->freezeNow();
        $this->seedDashboardData();

        $start = Carbon::create(2025, 4, 15)->format('Y-m-d');
        $end = Carbon::create(2025, 5, 15)->format('Y-m-d');

        $response = $this->getJson("/api/admin/dashboard?start_date={$start}&end_date={$end}");

        $days = Carbon::parse($start)->diffInDays(Carbon::parse($end)) + 1;
        $comparisonEnd = Carbon::now()->copy()->endOfDay();
        $comparisonStart = $comparisonEnd->copy()->subDays($days - 1)->startOfDay();

        $response->assertOk()
            ->assertJsonPath('data.comparison_range.source', 'recent_days')
            ->assertJsonPath('data.comparison_range.start', $comparisonStart->toDateString())
            ->assertJsonPath('data.comparison_range.end', $comparisonEnd->toDateString())
            ->assertJsonPath('data.comparison_range.days', $days);

        $this->assertStringContainsString((string) $days, (string) $response->json('data.comparison_note'));
    }

    public function test_it_honors_manual_comparison_range(): void
    {
        $this->freezeNow();
        $this->seedDashboardData();

        $currentStart = Carbon::create(2025, 10, 16)->format('Y-m-d');
        $currentEnd = Carbon::create(2025, 11, 16)->format('Y-m-d');
        $comparisonStart = Carbon::create(2025, 9, 1)->format('Y-m-d');
        $comparisonEnd = Carbon::create(2025, 9, 15)->format('Y-m-d');

        $url = sprintf(
            '/api/admin/dashboard?start_date=%s&end_date=%s&comparison_start_date=%s&comparison_end_date=%s',
            $currentStart,
            $currentEnd,
            $comparisonStart,
            $comparisonEnd
        );

        $response = $this->getJson($url);

        $this->assertEquals('manual', $response->json('data.comparison_range.source'));
        $this->assertEquals($comparisonStart, $response->json('data.comparison_range.start'));
        $this->assertEquals($comparisonEnd, $response->json('data.comparison_range.end'));
        $this->assertEquals(15, $response->json('data.comparison_range.days'));
        $this->assertStringContainsString('manualmente', (string) $response->json('data.comparison_note'));
    }

    private function freezeNow(): Carbon
    {
        $now = Carbon::create(2025, 11, 16, 12);
        Carbon::setTestNow($now);

        return $now;
    }

    /**
     * Seed a default dataset that mixes current and previous period data.
     *
     * @return array<string, int>
     */
    private function seedDashboardData(): array
    {
        $now = Carbon::now();

        $recentUserId = DB::table('users')->insertGetId([
            'email' => 'recent@example.com',
            'password' => 'secret',
            'name' => 'Usuário Recente',
            'created_at' => $now->copy()->subDays(5),
            'updated_at' => $now->copy()->subDays(5),
        ]);

        DB::table('users')->insert([
            'email' => 'old@example.com',
            'password' => 'secret',
            'name' => 'Usuário Antigo',
            'created_at' => $now->copy()->subMonths(1)->addDays(3),
            'updated_at' => $now->copy()->subMonths(1)->addDays(3),
        ]);

        $group = Group::create([
            'name' => 'Linha Teste',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        Category::create([
            'group_id' => $group->id,
            'name' => 'Categoria Teste',
            'slug' => 'categoria-teste',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $recentProduct = Product::create([
            'name' => 'Vinho Atual',
            'slug' => 'vinho-atual',
            'price' => 120.00,
            'stock_quantity' => 5,
            'active' => true,
            'created_at' => $now->copy()->subDays(2),
            'updated_at' => $now->copy()->subDays(2),
        ]);

        $oldProduct = Product::create([
            'name' => 'Vinho Clássico',
            'slug' => 'vinho-classico',
            'price' => 90.00,
            'stock_quantity' => 50,
            'active' => true,
            'created_at' => $now->copy()->subMonths(1)->addDays(4),
            'updated_at' => $now->copy()->subMonths(1)->addDays(4),
        ]);

        $paidOrderId = DB::table('orders')->insertGetId([
            'user_id' => $recentUserId,
            'status' => 'paid',
            'grand_total' => 250.50,
            'created_at' => $now->copy()->subDays(3),
            'updated_at' => $now->copy()->subDays(3),
        ]);

        $pendingOrderId = DB::table('orders')->insertGetId([
            'user_id' => $recentUserId,
            'status' => 'pending_payment',
            'grand_total' => 99.90,
            'created_at' => $now->copy()->subDay(),
            'updated_at' => $now->copy()->subDay(),
        ]);

        $previousOrderId = DB::table('orders')->insertGetId([
            'user_id' => $recentUserId,
            'status' => 'shipped',
            'grand_total' => 180.00,
            'created_at' => $now->copy()->subMonths(1)->addDays(5),
            'updated_at' => $now->copy()->subMonths(1)->addDays(5),
        ]);

        DB::table('orders')->insert([
            'user_id' => $recentUserId,
            'status' => 'draft',
            'grand_total' => 500.00,
            'created_at' => $now->copy()->subDays(6),
            'updated_at' => $now->copy()->subDays(6),
        ]);

        DB::table('order_items')->insert([
            'order_id' => $paidOrderId,
            'product_id' => $recentProduct->id,
            'quantity' => 2,
            'total_price' => 200.00,
            'created_at' => $now->copy()->subDays(3),
        ]);

        DB::table('order_items')->insert([
            'order_id' => $paidOrderId,
            'product_id' => $oldProduct->id,
            'quantity' => 1,
            'total_price' => 50.50,
            'created_at' => $now->copy()->subDays(3),
        ]);

        DB::table('order_items')->insert([
            'order_id' => $previousOrderId,
            'product_id' => $recentProduct->id,
            'quantity' => 1,
            'total_price' => 120.00,
            'created_at' => $now->copy()->subMonths(1)->addDays(5),
        ]);

        return [
            'pendingOrderId' => $pendingOrderId,
            'previousOrderId' => $previousOrderId,
            'recentProductId' => $recentProduct->id,
        ];
    }
}
