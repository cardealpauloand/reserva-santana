import { apiFetch } from "@/lib/api";

type ApiResponse<T> = {
  data: T;
};

type ApiDashboardStat = {
  key: "orders" | "products" | "users" | "revenue" | string;
  title: string;
  value: number;
  format: "number" | "currency";
  change_percentage: number | null;
  current_period_total: number;
  previous_period_total: number;
  period_label: string;
  comparison_label: string;
  extra?: Record<string, number> | null;
};

type ApiTopProduct = {
  product_id: number;
  name: string;
  quantity_sold: number;
  revenue: number;
};

type ApiTopType = {
  type: string;
  quantity_sold: number;
  revenue: number;
};

type ApiTopCustomer = {
  user_id: number | null;
  name: string | null;
  email: string | null;
  order_count: number;
  total_spent: number;
};

type ApiInventorySummary = {
  category_count: number;
  low_stock_count: number;
};

type ApiTrendPoint = {
  label: string;
  start: string;
  end: string;
  total: number;
};

type ApiTrend = {
  grouping: "day" | "week" | "month" | string;
  points: ApiTrendPoint[];
};

type ApiSelectedRange = {
  start: string;
  end: string;
  label: string;
  days: number;
};

type ApiComparisonRange = {
  start: string;
  end: string;
  label: string;
  source: string;
  days: number;
};

type ApiDashboardSummary = {
  stats: ApiDashboardStat[];
  top_products: ApiTopProduct[];
  top_products_comparison?: ApiTopProduct[];
  top_types?: ApiTopType[];
  top_types_comparison?: ApiTopType[];
  top_customers?: ApiTopCustomer[];
  top_customers_comparison?: ApiTopCustomer[];
  inventory: ApiInventorySummary;
  selected_range?: ApiSelectedRange | null;
  comparison_range?: ApiComparisonRange | null;
  comparison_note?: string | null;
  revenue_trend?: ApiTrend | null;
  revenue_trend_comparison?: ApiTrend | null;
};

export type DashboardStat = {
  key: "orders" | "products" | "users" | "revenue" | string;
  title: string;
  value: number;
  format: "number" | "currency";
  changePercentage: number | null;
  currentPeriodTotal: number;
  previousPeriodTotal: number;
  periodLabel: string;
  comparisonLabel: string;
  extra: Record<string, number>;
};

export type DashboardTopProduct = {
  productId: number;
  name: string;
  quantitySold: number;
  revenue: number;
};

export type DashboardTopType = {
  type: string;
  quantitySold: number;
  revenue: number;
};

export type DashboardTopCustomer = {
  userId: number | null;
  name: string;
  email: string | null;
  orderCount: number;
  totalSpent: number;
};

export type InventorySummary = {
  categoryCount: number;
  lowStockCount: number;
};

export type RevenueTrendPoint = {
  label: string;
  start: string;
  end: string;
  total: number;
};

export type RevenueTrend = {
  grouping: "day" | "week" | "month" | string;
  points: RevenueTrendPoint[];
};

export type DashboardSummary = {
  stats: DashboardStat[];
  topProducts: DashboardTopProduct[];
  topProductsComparison: DashboardTopProduct[];
  topTypes: DashboardTopType[];
  topTypesComparison: DashboardTopType[];
  topCustomers: DashboardTopCustomer[];
  topCustomersComparison: DashboardTopCustomer[];
  inventory: InventorySummary;
  selectedRange: SelectedRange;
  comparisonRange: ComparisonRange;
  comparisonNote: string;
  revenueTrend: RevenueTrend;
  revenueTrendComparison: RevenueTrend;
};

export type SelectedRange = {
  start: string;
  end: string;
  label: string;
  days: number;
};

export type ComparisonRange = {
  start: string;
  end: string;
  label: string;
  source: string;
  days: number;
};

export type DashboardFilters = {
  startDate?: string;
  endDate?: string;
  comparisonStartDate?: string;
  comparisonEndDate?: string;
};

function mapStat(stat: ApiDashboardStat): DashboardStat {
  return {
    key: stat.key,
    title: stat.title,
    value: stat.value,
    format: stat.format,
    changePercentage: stat.change_percentage,
    currentPeriodTotal: stat.current_period_total,
    previousPeriodTotal: stat.previous_period_total,
    periodLabel: stat.period_label,
    comparisonLabel: stat.comparison_label,
    extra: stat.extra ?? {},
  } satisfies DashboardStat;
}

function mapTopProduct(product: ApiTopProduct): DashboardTopProduct {
  return {
    productId: product.product_id,
    name: product.name,
    quantitySold: product.quantity_sold,
    revenue: product.revenue,
  } satisfies DashboardTopProduct;
}

function mapTopType(type: ApiTopType): DashboardTopType {
  return {
    type: type.type,
    quantitySold: type.quantity_sold,
    revenue: type.revenue,
  } satisfies DashboardTopType;
}

function mapTopCustomer(customer: ApiTopCustomer): DashboardTopCustomer {
  return {
    userId: customer.user_id,
    name: customer.name ?? "Cliente",
    email: customer.email,
    orderCount: customer.order_count,
    totalSpent: customer.total_spent,
  } satisfies DashboardTopCustomer;
}

function mapInventorySummary(inventory: ApiInventorySummary): InventorySummary {
  return {
    categoryCount: inventory.category_count,
    lowStockCount: inventory.low_stock_count,
  } satisfies InventorySummary;
}

function mapTrend(trend?: ApiTrend | null): RevenueTrend {
  return {
    grouping: trend?.grouping ?? "day",
    points: (trend?.points ?? []).map((point) => ({
      label: point.label,
      start: point.start,
      end: point.end,
      total: point.total,
    } satisfies RevenueTrendPoint)),
  } satisfies RevenueTrend;
}

export async function fetchDashboardSummary(filters?: DashboardFilters): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (filters?.startDate) {
    params.set("start_date", filters.startDate);
  }
  if (filters?.endDate) {
    params.set("end_date", filters.endDate);
  }
  if (filters?.comparisonStartDate) {
    params.set("comparison_start_date", filters.comparisonStartDate);
  }
  if (filters?.comparisonEndDate) {
    params.set("comparison_end_date", filters.comparisonEndDate);
  }

  const path = params.toString()
    ? `admin/dashboard?${params.toString()}`
    : "admin/dashboard";

  const response = await apiFetch<ApiResponse<ApiDashboardSummary>>(path);

  return {
    stats: response.data.stats.map(mapStat),
    topProducts: response.data.top_products.map(mapTopProduct),
    topProductsComparison: (response.data.top_products_comparison ?? []).map(mapTopProduct),
    topTypes: (response.data.top_types ?? []).map(mapTopType),
    topTypesComparison: (response.data.top_types_comparison ?? []).map(mapTopType),
    topCustomers: (response.data.top_customers ?? []).map(mapTopCustomer),
    topCustomersComparison: (response.data.top_customers_comparison ?? []).map(mapTopCustomer),
    inventory: mapInventorySummary(response.data.inventory),
    selectedRange: {
      start: response.data.selected_range?.start ?? "",
      end: response.data.selected_range?.end ?? "",
      label: response.data.selected_range?.label ?? "",
      days: response.data.selected_range?.days ?? 0,
    },
    comparisonRange: {
      start: response.data.comparison_range?.start ?? "",
      end: response.data.comparison_range?.end ?? "",
      label: response.data.comparison_range?.label ?? "",
      source: response.data.comparison_range?.source ?? "",
      days: response.data.comparison_range?.days ?? 0,
    },
    comparisonNote: response.data.comparison_note ?? "",
    revenueTrend: mapTrend(response.data.revenue_trend),
    revenueTrendComparison: mapTrend(response.data.revenue_trend_comparison),
  } satisfies DashboardSummary;
}
