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

type ApiRecentOrder = {
  id: number;
  order_number: string;
  status: string;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  created_at: string;
};

type ApiTopProduct = {
  product_id: number;
  name: string;
  quantity_sold: number;
  revenue: number;
};

type ApiInventorySummary = {
  category_count: number;
  low_stock_count: number;
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
  recent_orders: ApiRecentOrder[];
  top_products: ApiTopProduct[];
  top_products_comparison?: ApiTopProduct[];
  inventory: ApiInventorySummary;
  selected_range?: ApiSelectedRange | null;
  comparison_range?: ApiComparisonRange | null;
  comparison_note?: string | null;
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

export type DashboardRecentOrder = {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  customerName: string | null;
  customerEmail: string | null;
  createdAt: string;
};

export type DashboardTopProduct = {
  productId: number;
  name: string;
  quantitySold: number;
  revenue: number;
};

export type InventorySummary = {
  categoryCount: number;
  lowStockCount: number;
};

export type DashboardSummary = {
  stats: DashboardStat[];
  recentOrders: DashboardRecentOrder[];
  topProducts: DashboardTopProduct[];
  topProductsComparison: DashboardTopProduct[];
  inventory: InventorySummary;
  selectedRange: SelectedRange;
  comparisonRange: ComparisonRange;
  comparisonNote: string;
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

function mapRecentOrder(order: ApiRecentOrder): DashboardRecentOrder {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    total: order.total,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    createdAt: order.created_at,
  } satisfies DashboardRecentOrder;
}

function mapTopProduct(product: ApiTopProduct): DashboardTopProduct {
  return {
    productId: product.product_id,
    name: product.name,
    quantitySold: product.quantity_sold,
    revenue: product.revenue,
  } satisfies DashboardTopProduct;
}

function mapInventorySummary(inventory: ApiInventorySummary): InventorySummary {
  return {
    categoryCount: inventory.category_count,
    lowStockCount: inventory.low_stock_count,
  } satisfies InventorySummary;
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
    recentOrders: response.data.recent_orders.map(mapRecentOrder),
    topProducts: response.data.top_products.map(mapTopProduct),
    topProductsComparison: (response.data.top_products_comparison ?? []).map(mapTopProduct),
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
  } satisfies DashboardSummary;
}
