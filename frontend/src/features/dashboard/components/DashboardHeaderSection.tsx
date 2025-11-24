import { memo, useMemo } from "react";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import {
  buildPresetRange,
  formatComparisonSelectionLabel,
  formatRangeSelectionLabel,
  resetToCurrentMonth,
} from "../utils";

interface DashboardHeaderSectionProps {
  userEmail?: string | null;
  refreshing: boolean;
  dashboardView: "primary" | "comparison";
  hasComparisonRange: boolean;
  onDashboardViewChange: (value: "primary" | "comparison") => void;
  primaryRange?: DateRange;
  comparisonRange?: DateRange;
  activeRange: "primary" | "comparison";
  onActiveRangeChange: (value: "primary" | "comparison") => void;
  onPrimaryRangeChange: (range: DateRange | undefined) => void;
  onComparisonRangeChange: (range: DateRange | undefined) => void;
  onClearComparisonRange: () => void;
  summarySelectedLabel: string;
  summaryComparisonLabel: string;
}

export const DashboardHeaderSection = memo(
  ({
    userEmail,
    refreshing,
    dashboardView,
    hasComparisonRange,
    onDashboardViewChange,
    primaryRange,
    comparisonRange,
    activeRange,
    onActiveRangeChange,
    onPrimaryRangeChange,
    onComparisonRangeChange,
    onClearComparisonRange,
    summarySelectedLabel,
    summaryComparisonLabel,
  }: DashboardHeaderSectionProps) => {
    const selectedRangeLabel = formatRangeSelectionLabel(primaryRange);
    const comparisonSelectionLabel = formatComparisonSelectionLabel(comparisonRange);

    const calendarSelectedRange =
      activeRange === "primary" ? primaryRange : comparisonRange;

    const calendarModifiers = useMemo(() => {
      const modifiers: Record<string, DateRange> = {};

      if (activeRange === "comparison" && primaryRange?.from && primaryRange?.to) {
        modifiers.primaryPreview = { from: primaryRange.from, to: primaryRange.to };
      }

      if (activeRange === "primary" && comparisonRange?.from && comparisonRange?.to) {
        modifiers.comparisonPreview = {
          from: comparisonRange.from,
          to: comparisonRange.to,
        };
      }

      return modifiers;
    }, [activeRange, primaryRange, comparisonRange]);

    const modifiersClassNames = useMemo(
      () => ({
        primaryPreview: "bg-primary/15 text-primary font-semibold",
        comparisonPreview: "bg-secondary/20 text-secondary-foreground",
      }),
      []
    );

    const handlePresetRange = (preset: "last7" | "year") => {
      buildPresetRange(preset, activeRange, onPrimaryRangeChange, onComparisonRangeChange);
    };

    const handleResetMonth = () => {
      resetToCurrentMonth(activeRange, onPrimaryRangeChange, onComparisonRangeChange);
    };

    const handleClearSelection = () => {
      if (activeRange === "primary") {
        onPrimaryRangeChange(undefined);
        return;
      }

      onClearComparisonRange();
    };

    const handleCalendarSelect = (range?: DateRange) => {
      if (activeRange === "primary") {
        onPrimaryRangeChange(range ?? undefined);
        return;
      }

      onComparisonRangeChange(range ?? undefined);
    };

    return (
      <div className="rounded-2xl border bg-muted/30 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
            <p className="text-muted-foreground mt-2">Bem-vindo, {userEmail ?? ""}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-end">
            {refreshing && (
              <span className="flex items-center text-xs text-muted-foreground">
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Atualizando
              </span>
            )}
            <ToggleGroup
              type="single"
              value={dashboardView}
              onValueChange={(value) => {
                if (value === "primary") {
                  onDashboardViewChange("primary");
                }
                if (value === "comparison" && hasComparisonRange) {
                  onDashboardViewChange("comparison");
                }
              }}
              size="sm"
              variant="outline"
              className="rounded-full border bg-background/60 p-0.5 shadow-sm"
              aria-label="Alternar visualização do dashboard"
            >
              <ToggleGroupItem
                value="primary"
                className="rounded-full data-[state=on]:bg-[hsl(var(--wine-burgundy))] data-[state=on]:text-white data-[state=on]:shadow-sm"
              >
                Período principal
              </ToggleGroupItem>
              <ToggleGroupItem
                value="comparison"
                disabled={!hasComparisonRange}
                className="rounded-full data-[state=on]:bg-[hsl(var(--wine-burgundy))] data-[state=on]:text-white data-[state=on]:shadow-sm"
              >
                Período comparativo
              </ToggleGroupItem>
            </ToggleGroup>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal min-w-[230px]",
                    !primaryRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedRangeLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 space-y-4" align="end">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={activeRange === "primary" ? "default" : "outline"}
                    onClick={() => onActiveRangeChange("primary")}
                  >
                    Período principal
                  </Button>
                  <Button
                    size="sm"
                    variant={activeRange === "comparison" ? "default" : "outline"}
                    onClick={() => onActiveRangeChange("comparison")}
                  >
                    Período comparativo
                  </Button>
                  {activeRange === "comparison" && (
                    <Button size="sm" variant="ghost" onClick={onClearComparisonRange}>
                      Limpar comparativo
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Comparando com: {comparisonSelectionLabel}
                  </span>
                </div>
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={calendarSelectedRange}
                  defaultMonth={calendarSelectedRange?.from ?? primaryRange?.from}
                  onSelect={handleCalendarSelect}
                  modifiers={calendarModifiers}
                  modifiersClassNames={modifiersClassNames}
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handlePresetRange("last7")}>
                    Últimos 7 dias
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleResetMonth}>
                    Mês atual
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handlePresetRange("year")}>
                    Ano atual
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleClearSelection}>
                    Limpar seleção
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <p className="text-sm font-medium text-foreground">Período selecionado</p>
          <p>
            {summarySelectedLabel
              ? `Aplicado: ${summarySelectedLabel}`
              : "Escolha um intervalo de datas para atualizar as métricas abaixo."}
          </p>
          {summaryComparisonLabel && <p>Comparando com: {summaryComparisonLabel}</p>}
        </div>
      </div>
    );
  }
);

DashboardHeaderSection.displayName = "DashboardHeaderSection";
