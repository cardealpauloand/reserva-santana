<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    /**
     * Return an overview of admin dashboard metrics.
     */
    public function __invoke(): JsonResponse
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfPreviousMonth = $startOfMonth->copy()->subMonth();
        $endOfPreviousMonth = $startOfMonth->copy()->subSecond();

        $ordersData = $this->resolveOrderMetrics($startOfMonth, $now, $startOfPreviousMonth, $endOfPreviousMonth);
        $productsData = $this->resolveProductMetrics($startOfMonth, $now, $startOfPreviousMonth, $endOfPreviousMonth);
        $usersData = $this->resolveUserMetrics($startOfMonth, $now, $startOfPreviousMonth, $endOfPreviousMonth);

        $stats = [
            $this->buildStat(
                key: 'orders',
                title: 'Total de Pedidos',
                total: $ordersData['total_orders'],
                currentPeriodTotal: $ordersData['current_month_orders'],
                previousPeriodTotal: $ordersData['previous_month_orders'],
                periodLabel: 'Mês atual',
                format: 'number',
                extra: [
                    'awaiting_fulfillment' => $ordersData['awaiting_fulfillment'],
                ],
            ),
            $this->buildStat(
                key: 'products',
                title: 'Produtos',
                total: $productsData['total_products'],
                currentPeriodTotal: $productsData['current_month_created'],
                previousPeriodTotal: $productsData['previous_month_created'],
                periodLabel: 'Novos produtos no mês',
                format: 'number',
                extra: [
                    'category_count' => $productsData['category_count'],
                    'low_stock_count' => $productsData['low_stock_count'],
                ],
            ),
            $this->buildStat(
                key: 'users',
                title: 'Usuários',
                total: $usersData['total_users'],
                currentPeriodTotal: $usersData['current_month_users'],
                previousPeriodTotal: $usersData['previous_month_users'],
                periodLabel: 'Novos usuários no mês',
                format: 'number',
            ),
            $this->buildStat(
                key: 'revenue',
                title: 'Receita',
                total: $ordersData['total_revenue'],
                currentPeriodTotal: $ordersData['current_month_revenue'],
                previousPeriodTotal: $ordersData['previous_month_revenue'],
                periodLabel: 'Receita do mês',
                format: 'currency',
                extra: [
                    'average_order_value' => $ordersData['average_order_value'],
                ],
            ),
        ];

        return response()->json([
            'data' => [
                'stats' => $stats,
                'recent_orders' => $ordersData['recent_orders'],
                'top_products' => $ordersData['top_products'],
                'inventory' => [
                    'category_count' => $productsData['category_count'],
                    'low_stock_count' => $productsData['low_stock_count'],
                ],
            ],
        ]);
    }

    /**
     * Build a standard stat payload.
     *
     * @param  array<string, float|int>  $extra
     * @return array<string, mixed>
     */
    private function buildStat(
        string $key,
        string $title,
        float|int $total,
        float|int $currentPeriodTotal,
        float|int $previousPeriodTotal,
        string $periodLabel,
        string $format = 'number',
        array $extra = []
    ): array {
        $change = $this->calculatePercentageChange((float) $currentPeriodTotal, (float) $previousPeriodTotal);

        return [
            'key' => $key,
            'title' => $title,
            'value' => $format === 'currency'
                ? $this->formatCurrency($total)
                : (int) round($total),
            'format' => $format,
            'change_percentage' => $change,
            'current_period_total' => $format === 'currency'
                ? $this->formatCurrency($currentPeriodTotal)
                : (int) round($currentPeriodTotal),
            'previous_period_total' => $format === 'currency'
                ? $this->formatCurrency($previousPeriodTotal)
                : (int) round($previousPeriodTotal),
            'period_label' => $periodLabel,
            'extra' => $extra,
        ];
    }

    /**
     * Calculate percentage change between periods.
     */
    private function calculatePercentageChange(float $current, float $previous): ?float
    {
        if (abs($previous) < 0.00001) {
            return null;
        }

        $change = (($current - $previous) / $previous) * 100;

        return round($change, 1);
    }

    /**
     * Ensure currency values have two decimal places.
     */
    private function formatCurrency(float|int $value): float
    {
        return round((float) $value, 2);
    }

    /**
     * Gather metrics related to orders and revenue.
     *
     * @return array<string, mixed>
     */
    private function resolveOrderMetrics(Carbon $startOfMonth, Carbon $now, Carbon $startOfPreviousMonth, Carbon $endOfPreviousMonth): array
    {
        if (!Schema::hasTable('orders')) {
            return [
                'total_orders' => 0,
                'current_month_orders' => 0,
                'previous_month_orders' => 0,
                'awaiting_fulfillment' => 0,
                'total_revenue' => 0.0,
                'current_month_revenue' => 0.0,
                'previous_month_revenue' => 0.0,
                'average_order_value' => 0.0,
                'recent_orders' => [],
                'top_products' => [],
            ];
        }

        $amountColumn = $this->resolveOrderAmountColumn();
        $completedStatuses = ['paid', 'picking', 'shipped', 'delivered'];
        $countableStatuses = array_merge(['pending_payment'], $completedStatuses);

        $ordersQuery = DB::table('orders')->where('status', '!=', 'draft');

        $totalOrders = (int) (clone $ordersQuery)->count();
        $currentMonthOrders = (int) (clone $ordersQuery)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->count();
        $previousMonthOrders = (int) (clone $ordersQuery)
            ->whereBetween('created_at', [$startOfPreviousMonth, $endOfPreviousMonth])
            ->count();

        $awaitingFulfillment = (int) DB::table('orders')
            ->whereIn('status', $countableStatuses)
            ->count();

        $totalRevenue = 0.0;
        $currentMonthRevenue = 0.0;
        $previousMonthRevenue = 0.0;
        $averageOrderValue = 0.0;

        if ($amountColumn !== null) {
            $revenueQuery = DB::table('orders')->whereIn('status', $completedStatuses);

            $totalRevenue = (float) (clone $revenueQuery)->sum($amountColumn);
            $currentMonthRevenue = (float) (clone $revenueQuery)
                ->whereBetween('created_at', [$startOfMonth, $now])
                ->sum($amountColumn);
            $previousMonthRevenue = (float) (clone $revenueQuery)
                ->whereBetween('created_at', [$startOfPreviousMonth, $endOfPreviousMonth])
                ->sum($amountColumn);

            $completedOrdersCount = (int) (clone $revenueQuery)->count();
            if ($completedOrdersCount > 0) {
                $averageOrderValue = $totalRevenue / $completedOrdersCount;
            }
        }

        return [
            'total_orders' => $totalOrders,
            'current_month_orders' => $currentMonthOrders,
            'previous_month_orders' => $previousMonthOrders,
            'awaiting_fulfillment' => $awaitingFulfillment,
            'total_revenue' => $totalRevenue,
            'current_month_revenue' => $currentMonthRevenue,
            'previous_month_revenue' => $previousMonthRevenue,
            'average_order_value' => $this->formatCurrency($averageOrderValue),
            'recent_orders' => $this->resolveRecentOrders($amountColumn),
            'top_products' => $this->resolveTopProducts($completedStatuses),
        ];
    }

    /**
     * Determine the best column to use for order monetary amounts.
     */
    private function resolveOrderAmountColumn(): ?string
    {
        if (Schema::hasColumn('orders', 'grand_total')) {
            return 'grand_total';
        }

        if (Schema::hasColumn('orders', 'total')) {
            return 'total';
        }

        return null;
    }

    /**
     * Fetch the most recent orders for dashboard display.
     *
     * @return array<int, array<string, mixed>>
     */
    private function resolveRecentOrders(?string $amountColumn): array
    {
        if (!Schema::hasColumn('orders', 'created_at')) {
            return [];
        }

        $recentOrdersQuery = DB::table('orders')
            ->leftJoin('users', 'users.id', '=', 'orders.user_id')
            ->select([
                'orders.id',
                'orders.status',
                'orders.created_at',
                'users.name as customer_name',
                'users.email as customer_email',
            ])
            ->where('orders.status', '!=', 'draft')
            ->orderByDesc('orders.created_at')
            ->limit(5);

        if ($amountColumn !== null) {
            $recentOrdersQuery->addSelect("orders.{$amountColumn} as amount");
        }

        return $recentOrdersQuery->get()->map(function ($order) use ($amountColumn) {
            $amount = $amountColumn !== null && property_exists($order, 'amount')
                ? $this->formatCurrency((float) $order->amount)
                : 0.0;

            $createdAt = $order->created_at ? Carbon::parse($order->created_at) : Carbon::now();

            return [
                'id' => (int) $order->id,
                'order_number' => str_pad((string) $order->id, 6, '0', STR_PAD_LEFT),
                'status' => (string) $order->status,
                'total' => $amount,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'created_at' => $createdAt->toIso8601String(),
            ];
        })->all();
    }

    /**
     * Fetch top selling products.
     *
     * @return array<int, array<string, mixed>>
     */
    private function resolveTopProducts(array $completedStatuses): array
    {
        if (!Schema::hasTable('order_items')) {
            return [];
        }

        $quantityExpression = DB::raw('SUM(order_items.quantity) as total_quantity');

        if (Schema::hasColumn('order_items', 'total_price')) {
            $revenueExpression = DB::raw('SUM(order_items.total_price) as total_revenue');
        } elseif (Schema::hasColumn('order_items', 'price_at_purchase')) {
            $revenueExpression = DB::raw('SUM(order_items.price_at_purchase * order_items.quantity) as total_revenue');
        } else {
            $revenueExpression = DB::raw('0 as total_revenue');
        }

        $query = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->leftJoin('products', 'products.id', '=', 'order_items.product_id')
            ->select([
                'order_items.product_id',
                'products.name',
                $quantityExpression,
                $revenueExpression,
            ])
            ->whereIn('orders.status', $completedStatuses)
            ->groupBy('order_items.product_id', 'products.name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        return $query->map(function ($row) {
            $name = $row->name ?? 'Produto removido';

            return [
                'product_id' => (int) $row->product_id,
                'name' => $name,
                'quantity_sold' => (int) $row->total_quantity,
                'revenue' => $this->formatCurrency((float) $row->total_revenue),
            ];
        })->all();
    }

    /**
     * Gather metrics about catalog and stock.
     *
     * @return array<string, float|int>
     */
    private function resolveProductMetrics(Carbon $startOfMonth, Carbon $now, Carbon $startOfPreviousMonth, Carbon $endOfPreviousMonth): array
    {
        $productQuery = Product::query();
        $totalProducts = (int) (clone $productQuery)->count();

        $currentMonthCreated = (int) (clone $productQuery)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->count();
        $previousMonthCreated = (int) (clone $productQuery)
            ->whereBetween('created_at', [$startOfPreviousMonth, $endOfPreviousMonth])
            ->count();

        $categoryCount = (int) Category::query()->count();

        $lowStockCount = Schema::hasColumn('products', 'stock_quantity')
            ? (int) Product::query()->where('stock_quantity', '<', 10)->count()
            : 0;

        return [
            'total_products' => $totalProducts,
            'current_month_created' => $currentMonthCreated,
            'previous_month_created' => $previousMonthCreated,
            'category_count' => $categoryCount,
            'low_stock_count' => $lowStockCount,
        ];
    }

    /**
     * Gather metrics for registered users.
     *
     * @return array<string, float|int>
     */
    private function resolveUserMetrics(Carbon $startOfMonth, Carbon $now, Carbon $startOfPreviousMonth, Carbon $endOfPreviousMonth): array
    {
        $userQuery = DB::table('users')->whereNull('deleted_at');

        $totalUsers = (int) (clone $userQuery)->count();
        $currentMonthUsers = (int) (clone $userQuery)
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->count();
        $previousMonthUsers = (int) (clone $userQuery)
            ->whereBetween('created_at', [$startOfPreviousMonth, $endOfPreviousMonth])
            ->count();

        return [
            'total_users' => $totalUsers,
            'current_month_users' => $currentMonthUsers,
            'previous_month_users' => $previousMonthUsers,
        ];
    }
}
