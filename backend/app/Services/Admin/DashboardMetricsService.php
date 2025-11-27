<?php

namespace App\Services\Admin;

use App\Models\Category;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class DashboardMetricsService
{
    private const COMPLETED_STATUSES = ['paid', 'picking', 'shipped', 'delivered'];
    private const COUNTABLE_STATUSES = ['pending_payment', 'paid', 'picking', 'shipped', 'delivered'];

    public function buildSummary(Request $request): array
    {
        $ranges = $this->resolveDateRanges($request);
        $currentRange = $ranges['current'];
        $previousRange = $ranges['previous'];

        $orders = $this->resolveOrderMetrics(
            $currentRange['start'],
            $currentRange['end'],
            $previousRange['start'],
            $previousRange['end']
        );

        $products = $this->resolveProductMetrics(
            $currentRange['start'],
            $currentRange['end'],
            $previousRange['start'],
            $previousRange['end']
        );

        $users = $this->resolveUserMetrics(
            $currentRange['start'],
            $currentRange['end'],
            $previousRange['start'],
            $previousRange['end']
        );

        return [
            'stats' => $this->buildStats($orders, $products, $users, $ranges),
            'top_products' => $orders['top_products'],
            'top_products_comparison' => $orders['top_products_comparison'],
            'top_types' => $orders['top_types'],
            'top_types_comparison' => $orders['top_types_comparison'],
            'top_customers' => $orders['top_customers'],
            'top_customers_comparison' => $orders['top_customers_comparison'],
            'revenue_trend' => $orders['revenue_trend'],
            'revenue_trend_comparison' => $orders['revenue_trend_comparison'],
            'inventory' => [
                'category_count' => $products['category_count'],
                'low_stock_count' => $products['low_stock_count'],
            ],
            'selected_range' => [
                'start' => $currentRange['start']->toDateString(),
                'end' => $currentRange['end']->toDateString(),
                'label' => $ranges['label'],
                'days' => $ranges['current_days'],
            ],
            'comparison_range' => [
                'start' => $previousRange['start']->toDateString(),
                'end' => $previousRange['end']->toDateString(),
                'label' => $ranges['comparison_label'],
                'source' => $ranges['comparison_source'],
                'days' => $ranges['comparison_days'],
            ],
            'comparison_note' => $ranges['comparison_note'],
        ];
    }

    private function buildStats(array $orders, array $products, array $users, array $ranges): array
    {
        return [
            $this->buildStat(
                key: 'orders',
                title: 'Total de Pedidos',
                total: $orders['current_orders'],
                currentPeriodTotal: $orders['current_orders'],
                previousPeriodTotal: $orders['previous_orders'],
                periodLabel: $ranges['label'],
                comparisonLabel: $ranges['comparison_label'],
                format: 'number',
                extra: [
                    'awaiting_fulfillment' => $orders['awaiting_fulfillment'],
                ],
            ),
            $this->buildStat(
                key: 'products',
                title: 'Produtos',
                total: $products['current_products'],
                currentPeriodTotal: $products['current_products'],
                previousPeriodTotal: $products['previous_products'],
                periodLabel: $ranges['label'],
                comparisonLabel: $ranges['comparison_label'],
                format: 'number',
                extra: [
                    'category_count' => $products['category_count'],
                    'low_stock_count' => $products['low_stock_count'],
                ],
            ),
            $this->buildStat(
                key: 'users',
                title: 'Usuários Novos',
                total: $users['current_users'],
                currentPeriodTotal: $users['current_users'],
                previousPeriodTotal: $users['previous_users'],
                periodLabel: $ranges['label'],
                comparisonLabel: $ranges['comparison_label'],
                format: 'number',
            ),
            $this->buildStat(
                key: 'revenue',
                title: 'Receita',
                total: $orders['current_revenue'],
                currentPeriodTotal: $orders['current_revenue'],
                previousPeriodTotal: $orders['previous_revenue'],
                periodLabel: $ranges['label'],
                comparisonLabel: $ranges['comparison_label'],
                format: 'currency',
            ),
        ];
    }

    private function resolveDateRanges(Request $request): array
    {
        $now = Carbon::now()->endOfDay();
        $defaultStart = $now->copy()->startOfMonth();

        $currentStart = $this->parseDate($request->query('start_date'), $defaultStart, true);
        $currentEnd = $this->parseDate($request->query('end_date'), $now, false);

        if ($currentStart->greaterThan($currentEnd)) {
            [$currentStart, $currentEnd] = [
                $currentEnd->copy()->startOfDay(),
                $currentStart->copy()->endOfDay(),
            ];
        }

        $currentDays = max(1, $currentStart->diffInDays($currentEnd) + 1);

        $manualComparison = $this->resolveManualComparisonRange($request);
        $comparison = $this->resolveComparisonWindow(
            $manualComparison,
            $now,
            $currentStart,
            $currentEnd,
            $currentDays
        );

        $comparisonLabel = $this->buildComparisonLabel(
            $comparison['start'],
            $comparison['end'],
            $currentDays,
            $comparison['source']
        );

        return [
            'current' => ['start' => $currentStart, 'end' => $currentEnd],
            'previous' => ['start' => $comparison['start'], 'end' => $comparison['end']],
            'label' => sprintf('%s - %s', $currentStart->format('d/m/Y'), $currentEnd->format('d/m/Y')),
            'comparison_label' => $comparisonLabel['label'],
            'comparison_note' => $comparisonLabel['note'],
            'comparison_source' => $comparison['source'],
            'current_days' => $currentDays,
            'comparison_days' => $comparison['days'],
        ];
    }

    private function parseDate(?string $input, Carbon $fallback, bool $isStart): Carbon
    {
        try {
            if ($input !== null) {
                $parsed = Carbon::parse($input);
                return $isStart ? $parsed->startOfDay() : $parsed->endOfDay();
            }
        } catch (\Throwable $exception) {
            
        }

        return $isStart ? $fallback->copy()->startOfDay() : $fallback->copy()->endOfDay();
    }

    private function resolveComparisonWindow(?array $manual, Carbon $now, Carbon $currentStart, Carbon $currentEnd, int $currentDays): array
    {
        if ($manual !== null) {
            return [
                'start' => $manual['start'],
                'end' => $manual['end'],
                'days' => $manual['days'],
                'source' => 'manual',
            ];
        }

        $recentEnd = $now->copy();
        $recentStart = $recentEnd->copy()->subDays($currentDays - 1)->startOfDay();

        $currentMatchesRecent = $currentStart->equalTo($recentStart)
            && $currentEnd->equalTo($recentEnd);
        $currentExtendsRecent = $currentEnd->greaterThan($recentEnd);

        if ($currentMatchesRecent || $currentExtendsRecent) {
            $comparisonEnd = $currentStart->copy()->subSecond();
            $comparisonStart = $comparisonEnd->copy()->subDays($currentDays - 1)->startOfDay();

            return [
                'start' => $comparisonStart,
                'end' => $comparisonEnd,
                'days' => $currentDays,
                'source' => 'prior_block',
            ];
        }

        return [
            'start' => $recentStart,
            'end' => $recentEnd,
            'days' => $currentDays,
            'source' => 'recent_days',
        ];
    }

    private function buildComparisonLabel(Carbon $start, Carbon $end, int $days, string $source): array
    {
        $range = sprintf('%s - %s', $start->format('d/m/Y'), $end->format('d/m/Y'));

        return match ($source) {
            'manual' => [
                'label' => sprintf('Período comparativo (%s)', $range),
                'note' => sprintf('Comparando com o período selecionado manualmente (%s).', $range),
            ],
            'recent_days' => [
                'label' => sprintf('Últimos %d dias (%s)', $days, $range),
                'note' => sprintf('Comparando com os últimos %d dias (%s).', $days, $range),
            ],
            default => [
                'label' => sprintf('%d dias anteriores (%s)', $days, $range),
                'note' => sprintf('Comparando com os %d dias anteriores ao período selecionado (%s, sem contar os dias atuais).', $days, $range),
            ],
        };
    }

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
            [$start, $end] = [
                $end->copy()->startOfDay(),
                $start->copy()->endOfDay(),
            ];
        }

        return [
            'start' => $start,
            'end' => $end,
            'days' => max(1, $start->diffInDays($end) + 1),
        ];
    }

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

    private function calculatePercentageChange(float $current, float $previous): ?float
    {
        if (abs($previous) < 0.00001) {
            return null;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function formatCurrency(float|int $value): float
    {
        return round((float) $value, 2);
    }

    private function resolveOrderMetrics(Carbon $currentStart, Carbon $currentEnd, Carbon $previousStart, Carbon $previousEnd): array
    {
        if (!Schema::hasTable('orders')) {
            return $this->emptyOrderMetrics();
        }

        $amountColumn = $this->resolveOrderAmountColumn();

        $ordersQuery = DB::table('orders')->where('status', '!=', 'draft');

        $currentRangeOrders = (int) (clone $ordersQuery)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();
        $previousRangeOrders = (int) (clone $ordersQuery)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        $awaitingFulfillment = (int) DB::table('orders')
            ->whereIn('status', self::COUNTABLE_STATUSES)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

        $currentRevenue = 0.0;
        $previousRevenue = 0.0;

        if ($amountColumn !== null) {
            $revenueQuery = DB::table('orders')->whereIn('status', self::COMPLETED_STATUSES);

            $currentRevenue = (float) (clone $revenueQuery)
                ->whereBetween('created_at', [$currentStart, $currentEnd])
                ->sum($amountColumn);
            $previousRevenue = (float) (clone $revenueQuery)
                ->whereBetween('created_at', [$previousStart, $previousEnd])
                ->sum($amountColumn);
        }

        $topProductsCurrent = $this->resolveTopProducts(self::COMPLETED_STATUSES, $currentStart, $currentEnd);
        $topProductsComparison = $this->resolveTopProducts(self::COMPLETED_STATUSES, $previousStart, $previousEnd);
        $topTypesCurrent = $this->resolveTopProductTypes(self::COMPLETED_STATUSES, $currentStart, $currentEnd);
        $topTypesComparison = $this->resolveTopProductTypes(self::COMPLETED_STATUSES, $previousStart, $previousEnd);
        $topCustomers = $this->resolveTopCustomers(self::COMPLETED_STATUSES, $amountColumn, $currentStart, $currentEnd);
        $topCustomersComparison = $this->resolveTopCustomers(self::COMPLETED_STATUSES, $amountColumn, $previousStart, $previousEnd);

        return [
            'current_orders' => $currentRangeOrders,
            'previous_orders' => $previousRangeOrders,
            'awaiting_fulfillment' => $awaitingFulfillment,
            'current_revenue' => $currentRevenue,
            'previous_revenue' => $previousRevenue,
            'top_products' => $topProductsCurrent,
            'top_products_comparison' => $topProductsComparison,
            'top_types' => $topTypesCurrent,
            'top_types_comparison' => $topTypesComparison,
            'top_customers' => $topCustomers,
            'top_customers_comparison' => $topCustomersComparison,
            'revenue_trend' => $this->buildRevenueTrend(
                self::COMPLETED_STATUSES,
                $currentStart,
                $currentEnd,
                $amountColumn
            ),
            'revenue_trend_comparison' => $this->buildRevenueTrend(
                self::COMPLETED_STATUSES,
                $previousStart,
                $previousEnd,
                $amountColumn
            ),
        ];
    }

    private function emptyOrderMetrics(): array
    {
        return [
            'current_orders' => 0,
            'previous_orders' => 0,
            'awaiting_fulfillment' => 0,
            'current_revenue' => 0.0,
            'previous_revenue' => 0.0,
            'top_products' => [],
            'top_products_comparison' => [],
            'top_types' => [],
            'top_types_comparison' => [],
            'top_customers' => [],
            'top_customers_comparison' => [],
            'revenue_trend' => [
                'grouping' => 'day',
                'points' => [],
            ],
            'revenue_trend_comparison' => [
                'grouping' => 'day',
                'points' => [],
            ],
        ];
    }

    private function resolveTopProductTypes(array $completedStatuses, Carbon $rangeStart, Carbon $rangeEnd): array
    {
        if (!Schema::hasTable('order_items') || !Schema::hasColumn('products', 'type')) {
            return [];
        }

        $quantityExpression = DB::raw('SUM(order_items.quantity) as total_quantity');

        $revenueExpression = match (true) {
            Schema::hasColumn('order_items', 'total_price') => DB::raw('SUM(order_items.total_price) as total_revenue'),
            Schema::hasColumn('order_items', 'unit_price') => DB::raw('SUM(order_items.unit_price * order_items.quantity) as total_revenue'),
            default => DB::raw('0 as total_revenue'),
        };

        $query = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->leftJoin('products', 'products.id', '=', 'order_items.product_id')
            ->select([
                DB::raw("COALESCE(NULLIF(TRIM(products.type), ''), 'Sem tipo') as type_name"),
                $quantityExpression,
                $revenueExpression,
            ])
            ->whereIn('orders.status', $completedStatuses)
            ->whereBetween('orders.created_at', [$rangeStart, $rangeEnd])
            ->groupBy('type_name')
            ->orderByDesc('total_quantity')
            ->get();

        return $query
            ->groupBy(fn ($row) => mb_strtolower($row->type_name ?? ''))
            ->map(function ($rows) {
                $representative = $rows->first();
                $typeLabel = $this->normalizeTypeLabel($representative->type_name ?? '');
                $totalQuantity = $rows->sum(fn ($row) => (int) $row->total_quantity);
                $totalRevenue = $rows->sum(fn ($row) => (float) $row->total_revenue);

                return [
                    'type' => $typeLabel,
                    'quantity_sold' => $totalQuantity,
                    'revenue' => $this->formatCurrency($totalRevenue),
                ];
            })
            ->sortByDesc('quantity_sold')
            ->values()
            ->all();
    }

    private function normalizeTypeLabel(?string $type): string
    {
        $cleanType = trim((string) $type);

        if ($cleanType === '') {
            return 'Sem tipo';
        }

        $normalized = mb_strtolower($cleanType);

        if ($normalized === 'sem tipo') {
            return 'Sem tipo';
        }

        return Str::title($normalized);
    }

    private function resolveOrderAmountColumn(): ?string
    {
        return Schema::hasColumn('orders', 'grand_total')
            ? 'grand_total'
            : (Schema::hasColumn('orders', 'total') ? 'total' : null);
    }

    private function resolveTopCustomers(array $completedStatuses, ?string $amountColumn, Carbon $rangeStart, Carbon $rangeEnd): array
    {
        if ($amountColumn === null || !Schema::hasTable('orders') || !Schema::hasTable('users')) {
            return [];
        }

        $grammar = DB::connection()->getQueryGrammar();
        $amountExpression = $grammar->wrap("orders.{$amountColumn}");

        $rows = DB::table('orders')
            ->leftJoin('users', 'users.id', '=', 'orders.user_id')
            ->select([
                'users.id as user_id',
                'users.name as customer_name',
                'users.email as customer_email',
                DB::raw('COUNT(orders.id) as total_orders'),
                DB::raw("SUM({$amountExpression}) as total_spent"),
            ])
            ->whereIn('orders.status', $completedStatuses)
            ->whereNotNull('orders.user_id')
            ->whereBetween('orders.created_at', [$rangeStart, $rangeEnd])
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('total_spent')
            ->limit(5)
            ->get();

        return $rows->map(function ($row) {
            return [
                'user_id' => (int) $row->user_id,
                'name' => $row->customer_name ?? 'Cliente sem nome',
                'email' => $row->customer_email,
                'order_count' => (int) $row->total_orders,
                'total_spent' => $this->formatCurrency((float) $row->total_spent),
            ];
        })->all();
    }

    private function resolveTopProducts(array $completedStatuses, Carbon $rangeStart, Carbon $rangeEnd): array
    {
        if (!Schema::hasTable('order_items')) {
            return [];
        }

        $quantityExpression = DB::raw('SUM(order_items.quantity) as total_quantity');

        $revenueExpression = match (true) {
            Schema::hasColumn('order_items', 'total_price') => DB::raw('SUM(order_items.total_price) as total_revenue'),
            Schema::hasColumn('order_items', 'price_at_purchase') => DB::raw('SUM(order_items.price_at_purchase * order_items.quantity) as total_revenue'),
            default => DB::raw('0 as total_revenue'),
        };

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
            return [
                'product_id' => (int) $row->product_id,
                'name' => $row->name ?? 'Produto removido',
                'quantity_sold' => (int) $row->total_quantity,
                'revenue' => $this->formatCurrency((float) $row->total_revenue),
            ];
        })->all();
    }

    private function buildRevenueTrend(array $completedStatuses, Carbon $rangeStart, Carbon $rangeEnd, ?string $amountColumn): array
    {
        if ($amountColumn === null) {
            return [
                'grouping' => $this->determineTrendGrouping(max(1, $rangeStart->diffInDays($rangeEnd) + 1)),
                'points' => [],
            ];
        }

        $days = max(1, $rangeStart->diffInDays($rangeEnd) + 1);
        $grouping = $this->determineTrendGrouping($days);

        $grammar = DB::connection()->getQueryGrammar();
        $amountWrapped = $grammar->wrap($amountColumn);

        $dailyRows = DB::table('orders')
            ->selectRaw("DATE(created_at) as bucket_day, SUM({$amountWrapped}) as total_amount")
            ->whereIn('status', $completedStatuses)
            ->whereBetween('created_at', [$rangeStart, $rangeEnd])
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('bucket_day')
            ->get();

        $dailyTotals = [];
        foreach ($dailyRows as $row) {
            $date = Carbon::parse($row->bucket_day)->toDateString();
            $dailyTotals[$date] = (float) $row->total_amount;
        }

        $buckets = [];
        $cursor = $rangeStart->copy();

        while ($cursor->lte($rangeEnd)) {
            [$bucketStart, $bucketEnd] = $this->resolveBucketBounds($cursor, $rangeStart, $rangeEnd, $grouping);
            $key = $bucketStart->toDateString() . '|' . $bucketEnd->toDateString();

            $buckets[$key] = $buckets[$key] ?? [
                'start' => $bucketStart->copy(),
                'end' => $bucketEnd->copy(),
                'total' => 0.0,
            ];

            $dateKey = $cursor->toDateString();
            $buckets[$key]['total'] += $dailyTotals[$dateKey] ?? 0.0;

            $cursor->addDay();
        }

        $points = [];
        foreach ($buckets as $bucket) {
            $points[] = [
                'start' => $bucket['start']->toDateString(),
                'end' => $bucket['end']->toDateString(),
                'label' => $this->formatTrendLabel($grouping, $bucket['start'], $bucket['end']),
                'total' => $this->formatCurrency($bucket['total']),
            ];
        }

        return [
            'grouping' => $grouping,
            'points' => $points,
        ];
    }

    private function resolveBucketBounds(Carbon $cursor, Carbon $rangeStart, Carbon $rangeEnd, string $grouping): array
    {
        if ($grouping === 'day') {
            $bucketStart = $cursor->copy();
            $bucketEnd = $cursor->copy();
        } elseif ($grouping === 'week') {
            $bucketStart = $cursor->copy()->startOfWeek(Carbon::MONDAY);
            $bucketEnd = $cursor->copy()->endOfWeek(Carbon::SUNDAY);
        } else {
            $bucketStart = $cursor->copy()->startOfMonth();
            $bucketEnd = $cursor->copy()->endOfMonth();
        }

        if ($bucketStart->lt($rangeStart)) {
            $bucketStart = $rangeStart->copy();
        }

        if ($bucketEnd->gt($rangeEnd)) {
            $bucketEnd = $rangeEnd->copy();
        }

        return [$bucketStart, $bucketEnd];
    }

    private function determineTrendGrouping(int $days): string
    {
        if ($days <= 31) {
            return 'day';
        }

        if ($days <= 365) {
            return 'week';
        }

        return 'month';
    }

    private function formatTrendLabel(string $grouping, Carbon $start, Carbon $end): string
    {
        $startLocalized = $start->copy()->locale('pt_BR');
        $endLocalized = $end->copy()->locale('pt_BR');

        if ($grouping === 'day') {
            return $this->titleCase($startLocalized->translatedFormat('d/MM'));
        }

        if ($grouping === 'week') {
            $startLabel = $this->titleCase($startLocalized->translatedFormat('d MMM'));
            $endLabel = $this->titleCase($endLocalized->translatedFormat('d MMM'));

            return $startLabel === $endLabel
                ? $startLabel
                : sprintf('%s - %s', $startLabel, $endLabel);
        }

        return $this->titleCase($startLocalized->translatedFormat('MMM yyyy'));
    }

    private function titleCase(string $value): string
    {
        return mb_convert_case($value, MB_CASE_TITLE, 'UTF-8');
    }

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
