import { useCallback, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Bar,
  type TooltipProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RevenueTrend } from "@/services/admin/dashboard";
import { MAX_AGGREGATED_REVENUE_BARS } from "../constants";
import {
  buildRangeLabel,
  compactCurrencyFormatter,
  currencyFormatter,
  formatIsoDateToBr,
  formatIsoDateToBrShort,
  formatIsoMonthYearShort,
  groupingDescriptions,
} from "../utils";

interface RevenueTrendCardProps {
  trend: RevenueTrend;
  comparisonTrend: RevenueTrend;
  isComparisonView: boolean;
  hasComparisonRange: boolean;
}

type RevenueChartPoint = {
  label: string;
  start: string;
  end: string;
  total: number;
};

const formatPointLabel = (point: RevenueChartPoint, grouping: string) => {
  if (grouping === "day") {
    return formatIsoDateToBrShort(point.start);
  }

  if (grouping === "week") {
    const startShort = formatIsoDateToBrShort(point.start);
    const endShort = formatIsoDateToBrShort(point.end);
    return startShort === endShort ? startShort : `${startShort} - ${endShort}`;
  }

  if (grouping === "month") {
    return formatIsoMonthYearShort(point.start);
  }

  return point.label;
};

const buildChartData = (trend: RevenueTrend): RevenueChartPoint[] => {
  const formattedPoints = trend.points.map((point) => ({
    label: point.label,
    start: point.start,
    end: point.end,
    total: point.total,
  }));

  const labeledPoints = formattedPoints.map((point) => ({
    ...point,
    label: formatPointLabel(point, trend.grouping),
  }));

  if (trend.grouping === "day" || labeledPoints.length <= MAX_AGGREGATED_REVENUE_BARS) {
    return labeledPoints;
  }

  const chunkSize = Math.ceil(labeledPoints.length / MAX_AGGREGATED_REVENUE_BARS);
  const aggregated: RevenueChartPoint[] = [];

  for (let index = 0; index < labeledPoints.length; index += chunkSize) {
    const chunk = labeledPoints.slice(index, index + chunkSize);
    const chunkStart = chunk[0];
    const chunkEnd = chunk[chunk.length - 1];

    aggregated.push({
      label: buildRangeLabel(trend.grouping, chunkStart.start, chunkEnd.end),
      start: chunkStart.start,
      end: chunkEnd.end,
      total: chunk.reduce((sum, item) => sum + item.total, 0),
    });
  }

  return aggregated;
};

export const RevenueTrendCard = ({
  trend,
  comparisonTrend,
  isComparisonView,
  hasComparisonRange,
}: RevenueTrendCardProps) => {
  const activeTrend = isComparisonView ? comparisonTrend : trend;
  const chartData = useMemo(() => buildChartData(activeTrend), [activeTrend]);
  const totalRevenueForChart = useMemo(
    () => chartData.reduce((acc, item) => acc + item.total, 0),
    [chartData]
  );

  const revenueEmptyMessage = isComparisonView
    ? hasComparisonRange
      ? "Nenhum dado de receita no período comparativo."
      : "Selecione um período comparativo para visualizar a receita."
    : "Não há dados de receita para o período selecionado.";

  const revenueGroupingLabel = groupingDescriptions[activeTrend.grouping] ?? "período";

  const renderRevenueTooltip = useCallback(
    ({ active, payload, label }: TooltipProps<number, string>) => {
      if (!active || !payload || payload.length === 0) {
        return null;
      }

      const entry = payload[0];
      const value = Number(entry?.value ?? 0);
      const point = entry?.payload as { start?: string; end?: string } | undefined;

      let rangeLabel: string | null = null;
      if (point?.start && point?.end && point.start !== point.end) {
        rangeLabel = `${formatIsoDateToBr(point.start)} - ${formatIsoDateToBr(point.end)}`;
      } else if (point?.start) {
        rangeLabel = formatIsoDateToBr(point.start);
      }

      return (
        <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
          <p className="text-sm font-semibold text-foreground">{rangeLabel ?? label}</p>
          <p className="text-sm font-medium text-primary">{currencyFormatter.format(value)}</p>
        </div>
      );
    },
    []
  );

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Receita por período</CardTitle>
        <CardDescription>Evolução da receita total no intervalo selecionado</CardDescription>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Agrupado por {revenueGroupingLabel}.</span>
          {chartData.length > 0 && <span>Total exibido: {currencyFormatter.format(totalRevenueForChart)}</span>}
          {isComparisonView && <span>Visualizando período comparativo.</span>}
        </div>
      </CardHeader>
      <CardContent className="h-[360px]">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
            {revenueEmptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: 12, bottom: 8 }}>
              <CartesianGrid stroke="hsl(var(--border) / 0.5)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                height={42}
                interval={0}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={92}
                tickFormatter={(value: number) => compactCurrencyFormatter.format(value)}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <RechartsTooltip cursor={{ fill: "hsl(var(--muted) / 0.35)" }} content={renderRevenueTooltip} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[12, 12, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
