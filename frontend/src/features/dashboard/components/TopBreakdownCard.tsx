import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { numberFormatter, currencyFormatter, formatUnits } from "../utils";

export type BreakdownItem = {
  id: string | number;
  label: string;
  value: number;
  revenue: number;
  color: string;
};

interface TopBreakdownCardProps {
  title: string;
  description: string;
  primaryLabel: string;
  comparisonLabel: string;
  primaryData: BreakdownItem[];
  comparisonData: BreakdownItem[];
  isComparisonView: boolean;
  hasComparisonRange: boolean;
  emptyPrimaryMessage: string;
  emptyComparisonMessage: string;
}

export const TopBreakdownCard = ({
  title,
  description,
  primaryLabel,
  comparisonLabel,
  primaryData,
  comparisonData,
  isComparisonView,
  hasComparisonRange,
  emptyPrimaryMessage,
  emptyComparisonMessage,
}: TopBreakdownCardProps) => {
  const activeData = isComparisonView ? comparisonData : primaryData;
  const activeLabel = isComparisonView ? comparisonLabel || "Período comparativo" : primaryLabel || "Período principal";
  const emptyMessage = isComparisonView
    ? hasComparisonRange
      ? emptyComparisonMessage
      : "Selecione um período comparativo para visualizar os dados."
    : emptyPrimaryMessage;

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="space-y-1.5">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <span className="inline-flex items-center rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          {activeLabel}
        </span>
      </CardHeader>
      <CardContent>
        {activeData.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full justify-center lg:w-auto">
              <PieChart
                width={400}
                height={320}
                sx={{
                  [`& .${pieArcLabelClasses.root}`]: {
                    fill: "hsl(var(--card))",
                    fontSize: 16,
                    fontWeight: 600,
                  },
                }}
                series={[
                  {
                    data: activeData,
                    innerRadius: 35,
                    outerRadius: 150,
                    paddingAngle: 0.6,
                    cornerRadius: 2,
                    startAngle: -90,
                    endAngle: 270,
                    arcLabel: (item) => numberFormatter.format(item.value),
                    arcLabelMinAngle: 12,
                    valueFormatter: ({ value }) => formatUnits(value),
                  },
                ]}
                slotProps={{ legend: { hidden: true } }}
              />
            </div>
            <ul className="flex w-full max-w-sm flex-col gap-2 self-stretch">
              {activeData.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatUnits(item.value)} • {currencyFormatter.format(item.revenue)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
