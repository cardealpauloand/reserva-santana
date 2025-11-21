<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    /**
     * Return an overview of admin dashboard metrics.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $ranges = $this->resolveDateRanges($request);
        $currentRange = $ranges['current'];
        $previousRange = $ranges['previous'];
        $periodLabel = $ranges['label'];
        $comparisonLabel = $ranges['comparison_label'];

        $ordersData = $this->resolveOrderMetrics(
            $currentRange['start'],
            $currentRange['end'],
            $previousRange['start'],
            $previousRange['end']
        );
        $productsData = $this->resolveProductMetrics(
            $currentRange['start'],
            $currentRange['end'],
            $previousRange['start'],
            $previousRange['end']
        );
        $usersData = $this->resolveUserMetrics(
            $currentRange['start'],
            $currentRange['end'],
            $previousRange['start'],
            $previousRange['end']
        );

        $stats = [
            $this->buildStat(
                key: 'orders',
                title: 'Total de Pedidos',
                total: $ordersData['current_orders'],
                currentPeriodTotal: $ordersData['current_orders'],
                previousPeriodTotal: $ordersData['previous_orders'],
                periodLabel: $periodLabel,
                comparisonLabel: $comparisonLabel,
                format: 'number',
                extra: [
                    'awaiting_fulfillment' => $ordersData['awaiting_fulfillment'],
                ],
            ),
            $this->buildStat(
                key: 'products',
                title: 'Produtos',
                total: $productsData['current_products'],
                currentPeriodTotal: $productsData['current_products'],
                previousPeriodTotal: $productsData['previous_products'],
                periodLabel: $periodLabel,
                comparisonLabel: $comparisonLabel,
                format: 'number',
                extra: [
                    'category_count' => $productsData['category_count'],
                    'low_stock_count' => $productsData['low_stock_count'],
                ],
            ),
            $this->buildStat(
                key: 'users',
                title: 'Usuários Novos',
                total: $usersData['current_users'],
                currentPeriodTotal: $usersData['current_users'],
                previousPeriodTotal: $usersData['previous_users'],
                periodLabel: $periodLabel,
                comparisonLabel: $comparisonLabel,
                format: 'number',
            ),
            $this->buildStat(
                key: 'revenue',
                title: 'Receita',
                total: $ordersData['current_revenue'],
                currentPeriodTotal: $ordersData['current_revenue'],
                previousPeriodTotal: $ordersData['previous_revenue'],
                periodLabel: $periodLabel,
                comparisonLabel: $comparisonLabel,
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
                'top_products_comparison' => $ordersData['top_products_comparison'],
                'inventory' => [
                    'category_count' => $productsData['category_count'],
                    'low_stock_count' => $productsData['low_stock_count'],
                ],
                'selected_range' => [
                    'start' => $currentRange['start']->toDateString(),
                    'end' => $currentRange['end']->toDateString(),
                    'label' => $periodLabel,
                    'days' => $ranges['current_days'],
                ],
                'comparison_range' => [
                    'start' => $previousRange['start']->toDateString(),
                    'end' => $previousRange['end']->toDateString(),
                    'label' => $comparisonLabel,
                    'source' => $ranges['comparison_source'],
                    'days' => $ranges['comparison_days'],
                ],
                'comparison_note' => $ranges['comparison_note'],
            ],
        ]);
    }

    /**
     * Resolve the current and previous date ranges based on request filters.
     *
     * @return array{
     *     current: array{start: Carbon, end: Carbon},
     *     previous: array{start: Carbon, end: Carbon},
     *     label: string,
     *     comparison_label: string,
     *     comparison_note: string,
     *     comparison_source: string,
     *     current_days: int,
     *     comparison_days: int
     * }
     */
    private function resolveDateRanges(Request $request): array
    {
        $now = Carbon::now()->endOfDay();
        $defaultStart = $now->copy()->startOfMonth();

        try {
            $startDate = $request->query('start_date');
            $currentStart = $startDate !== null
                ? Carbon::parse($startDate)->startOfDay()
                : $defaultStart;
        } catch (\Throwable $exception) {
            $currentStart = $defaultStart;
        }

        try {
            $endDate = $request->query('end_date');
            $currentEnd = $endDate !== null
                ? Carbon::parse($endDate)->endOfDay()
                : $now;
        } catch (\Throwable $exception) {
            $currentEnd = $now;
        }

        if ($currentStart->greaterThan($currentEnd)) {
            [$currentStart, $currentEnd] = [$currentEnd->copy()->startOfDay(), $currentStart->copy()->endOfDay()];
        }

        $currentDays = max(1, $currentStart->diffInDays($currentEnd) + 1);

        $comparisonSource = 'recent_days';
        $comparisonStart = null;
        $comparisonEnd = null;
        $comparisonDays = $currentDays;

        $manualComparison = $this->resolveManualComparisonRange($request);

        if ($manualComparison !== null) {
            $comparisonSource = 'manual';
            $comparisonStart = $manualComparison['start'];
            $comparisonEnd = $manualComparison['end'];
            $comparisonDays = $manualComparison['days'];
        }

        if ($comparisonStart === null || $comparisonEnd === null) {
            $recentComparisonEnd = $now->copy();
            $recentComparisonStart = $recentComparisonEnd->copy()->subDays($currentDays - 1)->startOfDay();

            $comparisonStart = $recentComparisonStart;
            $comparisonEnd = $recentComparisonEnd;

            $currentMatchesRecentWindow = $currentStart->equalTo($recentComparisonStart)
                && $currentEnd->equalTo($recentComparisonEnd);
            $currentExtendsBeyondRecentWindow = $currentEnd->greaterThan($recentComparisonEnd);

            if ($currentMatchesRecentWindow || $currentExtendsBeyondRecentWindow) {
                $comparisonSource = 'prior_block';
                $comparisonEnd = $currentStart->copy()->subSecond();
                $comparisonStart = $comparisonEnd->copy()->subDays($currentDays - 1)->startOfDay();
            }
        }

        $label = sprintf(
            '%s - %s',
            $currentStart->copy()->format('d/m/Y'),
            $currentEnd->copy()->format('d/m/Y')
        );

        if ($comparisonSource === 'manual') {
            $comparisonLabel = sprintf(
                'Período comparativo (%s - %s)',
                $comparisonStart->copy()->format('d/m/Y'),
                $comparisonEnd->copy()->format('d/m/Y')
            );
            $comparisonNote = sprintf(
                'Comparando com o período selecionado manualmente (%s - %s).',
                $comparisonStart->copy()->format('d/m/Y'),
                $comparisonEnd->copy()->format('d/m/Y')
            );
        } elseif ($comparisonSource === 'recent_days') {
            $comparisonLabel = sprintf(
                'Últimos %d dias (%s - %s)',
                $currentDays,
                $comparisonStart->copy()->format('d/m/Y'),
                $comparisonEnd->copy()->format('d/m/Y')
            );
            $comparisonNote = sprintf(
                'Comparando com os últimos %d dias (%s - %s).',
                $currentDays,
                $comparisonStart->copy()->format('d/m/Y'),
                $comparisonEnd->copy()->format('d/m/Y')
            );
        } else {
            $comparisonLabel = sprintf(
                '%d dias anteriores (%s - %s)',
                $currentDays,
                $comparisonStart->copy()->format('d/m/Y'),
                $comparisonEnd->copy()->format('d/m/Y')
            );
            $comparisonNote = sprintf(
                'Comparando com os %d dias anteriores ao período selecionado (%s - %s, sem contar os dias atuais).',
                $currentDays,
                $comparisonStart->copy()->format('d/m/Y'),
                $comparisonEnd->copy()->format('d/m/Y')
            );
        }

        return [
            'current' => ['start' => $currentStart, 'end' => $currentEnd],
            'previous' => ['start' => $comparisonStart, 'end' => $comparisonEnd],
            'label' => $label,
            'comparison_label' => $comparisonLabel,
            'comparison_note' => $comparisonNote,
            'comparison_source' => $comparisonSource,
            'current_days' => $currentDays,
            'comparison_days' => $comparisonDays,
        ];
    }

    /**
     * Resolve manual comparison range if all parameters are valid.
     *
     * @return array{start: Carbon, end: Carbon, days: int}|null
     */
    private function resolveManualComparisonRange(Request $request): ?array
    {
        $startInput = $request->query('comparison_start_date');
        $endInput = $request->query('comparison_end_date');

        if ($startInput === null || $endInput === null) {
            return null;
        }

        try {
            $start = Carbon::parse($startInput)->startOfDay();
            $end = Carbon::parse($endInput)->endOfDay();
        } catch (\Throwable $exception) {
            return null;
        }

        if ($start->greaterThan($end)) {
            [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
        }

        $days = max(1, $start->diffInDays($end) + 1);

        return [
            'start' => $start,
            'end' => $end,
            'days' => $days,
        ];
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
        string $comparisonLabel,
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
            'comparison_label' => $comparisonLabel,
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
    private function resolveOrderMetrics(Carbon $currentStart, Carbon $currentEnd, Carbon $previousStart, Carbon $previousEnd): array
    {
        if (!Schema::hasTable('orders')) {
            return [
                'current_orders' => 0,
                'previous_orders' => 0,
                'awaiting_fulfillment' => 0,
                'current_revenue' => 0.0,
                'previous_revenue' => 0.0,
                'average_order_value' => 0.0,
                'recent_orders' => [],
                'top_products' => [],
                'top_products_comparison' => [],
            ];
        }

        $amountColumn = $this->resolveOrderAmountColumn();
        $completedStatuses = ['paid', 'picking', 'shipped', 'delivered'];
        $countableStatuses = array_merge(['pending_payment'], $completedStatuses);

        $ordersQuery = DB::table('orders')->where('status', '!=', 'draft');

        $currentRangeOrders = (int) (clone $ordersQuery)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();
        $previousRangeOrders = (int) (clone $ordersQuery)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        $awaitingFulfillment = (int) DB::table('orders')
            ->whereIn('status', $countableStatuses)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

        $currentRevenue = 0.0;
        $previousRevenue = 0.0;
        $averageOrderValue = 0.0;

        if ($amountColumn !== null) {
            $revenueQuery = DB::table('orders')->whereIn('status', $completedStatuses);

            $currentRevenue = (float) (clone $revenueQuery)
                ->whereBetween('created_at', [$currentStart, $currentEnd])
                ->sum($amountColumn);
            $previousRevenue = (float) (clone $revenueQuery)
                ->whereBetween('created_at', [$previousStart, $previousEnd])
                ->sum($amountColumn);

            $completedOrdersCount = (int) (clone $revenueQuery)
                ->whereBetween('created_at', [$currentStart, $currentEnd])
                ->count();
            if ($completedOrdersCount > 0) {
                $averageOrderValue = $currentRevenue / $completedOrdersCount;
            }
        }

        $topProductsCurrent = $this->resolveTopProducts($completedStatuses, $currentStart, $currentEnd);
        $topProductsComparison = $this->resolveTopProducts($completedStatuses, $previousStart, $previousEnd);

        return [
            'current_orders' => $currentRangeOrders,
            'previous_orders' => $previousRangeOrders,
            'awaiting_fulfillment' => $awaitingFulfillment,
            'current_revenue' => $currentRevenue,
            'previous_revenue' => $previousRevenue,
            'average_order_value' => $this->formatCurrency($averageOrderValue),
            'recent_orders' => $this->resolveRecentOrders($amountColumn, $currentStart, $currentEnd),
            'top_products' => $topProductsCurrent,
            'top_products_comparison' => $topProductsComparison,
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
    private function resolveRecentOrders(?string $amountColumn, Carbon $rangeStart, Carbon $rangeEnd): array
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
            ->whereBetween('orders.created_at', [$rangeStart, $rangeEnd])
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
    private function resolveTopProducts(array $completedStatuses, Carbon $rangeStart, Carbon $rangeEnd): array
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
            ->whereBetween('orders.created_at', [$rangeStart, $rangeEnd])
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
    private function resolveProductMetrics(Carbon $currentStart, Carbon $currentEnd, Carbon $previousStart, Carbon $previousEnd): array
    {
        $productQuery = Product::query();

        $currentRangeCreated = (int) (clone $productQuery)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();
        $previousRangeCreated = (int) (clone $productQuery)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        $categoryCount = (int) Category::query()->count();

        $lowStockCount = Schema::hasColumn('products', 'stock_quantity')
            ? (int) Product::query()->where('stock_quantity', '<', 10)->count()
            : 0;

        return [
            'current_products' => $currentRangeCreated,
            'previous_products' => $previousRangeCreated,
            'category_count' => $categoryCount,
            'low_stock_count' => $lowStockCount,
        ];
    }

    /**
     * Gather metrics for registered users.
     *
     * @return array<string, float|int>
     */
    private function resolveUserMetrics(Carbon $currentStart, Carbon $currentEnd, Carbon $previousStart, Carbon $previousEnd): array
    {
        $userQuery = DB::table('users')->whereNull('deleted_at');

        $currentUsers = (int) (clone $userQuery)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();
        $previousUsers = (int) (clone $userQuery)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        return [
            'current_users' => $currentUsers,
            'previous_users' => $previousUsers,
        ];
    }
}
