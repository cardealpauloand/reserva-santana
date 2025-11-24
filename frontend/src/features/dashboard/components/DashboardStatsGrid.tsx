import { ArrowDown, ArrowUp, BarChart3, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardStat, InventorySummary } from "@/services/admin/dashboard";
import { DASHBOARD_ICON_MAP } from "../constants";
import { currencyFormatter, formatByType, numberFormatter } from "../utils";

interface DashboardStatsGridProps {
  stats: DashboardStat[];
  inventory: InventorySummary;
  isComparisonView: boolean;
}

const buildSecondaryDescription = (
  stat: DashboardStat,
  inventory: InventorySummary,
  periodLabel: string,
  displayValue: number,
  isComparisonView: boolean
) => {
  if (isComparisonView) {
    const label = periodLabel || "Período comparativo";
    return `${label}: ${formatByType(displayValue, stat.format)}`;
  }

  if (stat.key === "orders") {
    const awaiting = stat.extra?.awaiting_fulfillment ?? 0;
    return `${periodLabel}: ${numberFormatter.format(displayValue)} • Em andamento: ${numberFormatter.format(awaiting)}`;
  }

  if (stat.key === "products") {
    const categories = numberFormatter.format(inventory.categoryCount);
    const lowStock = numberFormatter.format(stat.extra?.low_stock_count ?? 0);
    return `Categorias ativas: ${categories} • Baixo estoque: ${lowStock}`;
  }

  if (stat.key === "users") {
    return `${periodLabel}: ${numberFormatter.format(displayValue)}`;
  }

  if (stat.key === "revenue") {
    return `${periodLabel}: ${currencyFormatter.format(displayValue)}`;
  }

  return `${periodLabel}: ${formatByType(displayValue, stat.format)}`;
};

export const DashboardStatsGrid = ({ stats, inventory, isComparisonView }: DashboardStatsGridProps) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    {stats.map((stat) => {
      const Icon = DASHBOARD_ICON_MAP[stat.key] ?? BarChart3;
      const baseChange = stat.changePercentage;
      const adjustedChange =
        baseChange === null ? null : isComparisonView ? -baseChange : baseChange;
      const hasChange = adjustedChange !== null;
      const isPositive = hasChange && (adjustedChange as number) > 0;
      const isNegative = hasChange && (adjustedChange as number) < 0;

      const changeColorClass = !hasChange
        ? "text-muted-foreground"
        : isPositive
          ? "text-emerald-600"
          : isNegative
            ? "text-red-600"
            : "text-muted-foreground";

      const displayValue = (isComparisonView ? stat.previousPeriodTotal : stat.currentPeriodTotal) ?? 0;
      const periodLabel = isComparisonView ? stat.comparisonLabel : stat.periodLabel;
      const secondaryDescription = buildSecondaryDescription(
        stat,
        inventory,
        periodLabel,
        displayValue,
        isComparisonView
      );

      return (
        <Card key={stat.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatByType(displayValue, stat.format)}</div>
            <div className="flex items-center mt-1">
              {hasChange ? (
                <>
                  {isPositive ? (
                    <ArrowUp className={cn("h-4 w-4 mr-1", changeColorClass)} />
                  ) : isNegative ? (
                    <ArrowDown className={cn("h-4 w-4 mr-1", changeColorClass)} />
                  ) : (
                    <Minus className={cn("h-4 w-4 mr-1", changeColorClass)} />
                  )}
                  <span className={cn("text-xs font-medium", changeColorClass)}>
                    {Math.abs(adjustedChange as number).toFixed(1)}%
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Sem dados comparativos</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{secondaryDescription}</p>
          </CardContent>
        </Card>
      );
    })}
  </div>
);
