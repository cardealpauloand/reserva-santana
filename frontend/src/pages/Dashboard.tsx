import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { type DateRange } from "react-day-picker";
import { type DashboardSummary, fetchDashboardSummary } from "@/services/admin/dashboard";
import { DashboardHeaderSection } from "@/features/dashboard/components/DashboardHeaderSection";
import { DashboardQuickLinks } from "@/features/dashboard/components/DashboardQuickLinks";
import { DashboardStatsGrid } from "@/features/dashboard/components/DashboardStatsGrid";
import { TopBreakdownCard, type BreakdownItem } from "@/features/dashboard/components/TopBreakdownCard";
import { RevenueTrendCard } from "@/features/dashboard/components/RevenueTrendCard";
import { TopCustomersCard } from "@/features/dashboard/components/TopCustomersCard";
import { DashboardLoadingState } from "@/features/dashboard/components/DashboardLoadingState";
import { TOP_BREAKDOWN_COLORS } from "@/features/dashboard/constants";
import { buildCurrentMonthRange } from "@/features/dashboard/utils";

const createEmptySummary = (): DashboardSummary => ({
  stats: [],
  topProducts: [],
  topProductsComparison: [],
  topTypes: [],
  topTypesComparison: [],
  topCustomers: [],
  topCustomersComparison: [],
  inventory: { categoryCount: 0, lowStockCount: 0 },
  selectedRange: { start: "", end: "", label: "", days: 0 },
  comparisonRange: { start: "", end: "", label: "", source: "", days: 0 },
  comparisonNote: "",
  revenueTrend: { grouping: "day", points: [] },
  revenueTrendComparison: { grouping: "day", points: [] },
});

const buildProductBreakdown = (items: DashboardSummary["topProducts"]): BreakdownItem[] =>
  items.map((product, index) => ({
    id: product.productId ?? index,
    value: product.quantitySold,
    label: product.name,
    revenue: product.revenue,
    color: TOP_BREAKDOWN_COLORS[index % TOP_BREAKDOWN_COLORS.length],
  }));

const buildTypeBreakdown = (items: DashboardSummary["topTypes"]): BreakdownItem[] =>
  items.map((typeItem, index) => ({
    id: typeItem.type ?? index,
    value: typeItem.quantitySold,
    label: typeItem.type || "Sem tipo",
    revenue: typeItem.revenue,
    color: TOP_BREAKDOWN_COLORS[index % TOP_BREAKDOWN_COLORS.length],
  }));

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryRange, setPrimaryRange] = useState<DateRange | undefined>(() =>
    buildCurrentMonthRange()
  );
  const [comparisonRange, setComparisonRange] = useState<DateRange | undefined>(
    undefined
  );
  const [activeRange, setActiveRange] = useState<"primary" | "comparison">(
    "primary"
  );
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardView, setDashboardView] = useState<"primary" | "comparison">(
    "primary"
  );
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!primaryRange?.from || !primaryRange?.to) {
      return;
    }

    const load = async () => {
      try {
        if (hasLoadedRef.current) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const filters = {
          startDate: format(primaryRange.from, "yyyy-MM-dd"),
          endDate: format(primaryRange.to, "yyyy-MM-dd"),
          comparisonStartDate:
            comparisonRange?.from && comparisonRange?.to
              ? format(comparisonRange.from, "yyyy-MM-dd")
              : undefined,
          comparisonEndDate:
            comparisonRange?.from && comparisonRange?.to
              ? format(comparisonRange.to, "yyyy-MM-dd")
              : undefined,
        } as const;

        const data = await fetchDashboardSummary(filters);
        setSummary(data);
        setError(null);
        hasLoadedRef.current = true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o dashboard.";
        setError(message);
        toast({
          title: "Erro ao carregar dashboard",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    void load();
  }, [primaryRange?.from, primaryRange?.to, comparisonRange?.from, comparisonRange?.to, toast]);

  const summaryData = useMemo(() => summary ?? createEmptySummary(), [summary]);

  const hasComparisonRange = Boolean(
    summaryData.comparisonRange.start && summaryData.comparisonRange.end
  );
  const isComparisonView = dashboardView === "comparison";

  const topProductsPrimaryData = useMemo(() => buildProductBreakdown(summaryData.topProducts), [summaryData.topProducts]);
  const topProductsComparisonData = useMemo(
    () => buildProductBreakdown(summaryData.topProductsComparison),
    [summaryData.topProductsComparison]
  );

  const topTypesPrimaryData = useMemo(() => buildTypeBreakdown(summaryData.topTypes), [summaryData.topTypes]);
  const topTypesComparisonData = useMemo(
    () => buildTypeBreakdown(summaryData.topTypesComparison),
    [summaryData.topTypesComparison]
  );

  useEffect(() => {
    if (!hasComparisonRange && isComparisonView) {
      setDashboardView("primary");
    }
  }, [hasComparisonRange, isComparisonView]);

  const handleDashboardViewChange = (value: string) => {
    if (value === "primary" || (value === "comparison" && hasComparisonRange)) {
      setDashboardView(value as "primary" | "comparison");
    }
  };

  const clearComparisonRange = () => {
    setComparisonRange(undefined);
    setActiveRange("primary");
  };

  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="dashboard-theme min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="space-y-8">
          <DashboardHeaderSection
            userEmail={user?.email}
            refreshing={refreshing}
            dashboardView={dashboardView}
            hasComparisonRange={hasComparisonRange}
            onDashboardViewChange={handleDashboardViewChange}
            primaryRange={primaryRange}
            comparisonRange={comparisonRange}
            activeRange={activeRange}
            onActiveRangeChange={setActiveRange}
            onPrimaryRangeChange={setPrimaryRange}
            onComparisonRangeChange={setComparisonRange}
            onClearComparisonRange={clearComparisonRange}
            summarySelectedLabel={summaryData.selectedRange.label}
            summaryComparisonLabel={summaryData.comparisonRange.label}
          />

          {error && (
            <Alert variant="destructive">
              <AlertTitle>
                Não foi possível carregar todas as métricas
              </AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DashboardQuickLinks onNavigate={navigate} />

          <DashboardStatsGrid
            stats={summaryData.stats}
            inventory={summaryData.inventory}
            isComparisonView={isComparisonView}
          />

          <RevenueTrendCard
            trend={summaryData.revenueTrend}
            comparisonTrend={summaryData.revenueTrendComparison}
            isComparisonView={isComparisonView}
            hasComparisonRange={hasComparisonRange}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <TopBreakdownCard
              title="Produtos mais Vendidos"
              description="Top 5 produtos com maior volume de vendas"
              primaryLabel={summaryData.selectedRange.label}
              comparisonLabel={summaryData.comparisonRange.label}
              primaryData={topProductsPrimaryData}
              comparisonData={topProductsComparisonData}
              isComparisonView={isComparisonView}
              hasComparisonRange={hasComparisonRange}
              emptyPrimaryMessage="Nenhuma venda registrada até o momento."
              emptyComparisonMessage="Nenhum produto com vendas no período comparativo."
              showActiveLabel={false}
            />
            <TopBreakdownCard
              title="Tipos mais Vendidos"
              description="Categorias gerais com maior volume no período"
              primaryLabel={summaryData.selectedRange.label}
              comparisonLabel={summaryData.comparisonRange.label}
              primaryData={topTypesPrimaryData}
              comparisonData={topTypesComparisonData}
              isComparisonView={isComparisonView}
              hasComparisonRange={hasComparisonRange}
              emptyPrimaryMessage="Nenhuma venda registrada para tipos ainda."
              emptyComparisonMessage="Nenhum tipo com vendas no período comparativo."
              showActiveLabel={false}
            />
          </div>

          <TopCustomersCard
            customers={summaryData.topCustomers}
            comparisonCustomers={summaryData.topCustomersComparison}
            isComparisonView={isComparisonView}
            hasComparisonRange={hasComparisonRange}
            primaryLabel={summaryData.selectedRange.label}
            comparisonLabel={summaryData.comparisonRange.label}
            showActiveLabel={false}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
