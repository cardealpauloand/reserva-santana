import { CreditCard, DollarSign, Package, Users, type LucideIcon } from "lucide-react";

export const DASHBOARD_ICON_MAP: Record<string, LucideIcon> = {
  orders: CreditCard,
  products: Package,
  users: Users,
  revenue: DollarSign,
};

export const TOP_BREAKDOWN_COLORS = [
  "hsl(var(--wine-burgundy))",
  "hsl(var(--wine-gold))",
  "#A74C63",
  "#C88416",
  "#6F4E37",
  "#4A2F2F",
];

export const MAX_AGGREGATED_REVENUE_BARS = 16;
