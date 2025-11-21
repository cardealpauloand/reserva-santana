import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Settings,
  Loader2,
  Calendar as CalendarIcon,
  DollarSign,
  CreditCard,
  ArrowUp,
  ArrowDown,
  Minus,
  type LucideIcon,
} from "lucide-react";
import { format, startOfMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  type DashboardSummary,
  type DashboardStat,
  fetchDashboardSummary,
} from "@/services/admin/dashboard";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { type DateRange } from "react-day-picker";

const iconMap: Record<string, LucideIcon> = {
  orders: CreditCard,
  products: Package,
  users: Users,
  revenue: DollarSign,
};

const TOP_PRODUCTS_COLORS = [
  "hsl(var(--wine-burgundy))",
  "hsl(var(--wine-gold))",
  "hsl(var(--wine-burgundy) / 0.7)",
  "hsl(var(--wine-gold) / 0.7)",
  "hsl(var(--wine-cream))",
];

const statusLabels: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Rascunho", variant: "secondary" },
  pending_payment: { label: "Pagamento pendente", variant: "secondary" },
  paid: { label: "Pago", variant: "default" },
  picking: { label: "Separando", variant: "outline" },
  shipped: { label: "Enviado", variant: "outline" },
  delivered: { label: "Entregue", variant: "default" },
  canceled: { label: "Cancelado", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "secondary" },
};

const numberFormatter = new Intl.NumberFormat("pt-BR");
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const buildCurrentMonthRange = (): DateRange => {
  const today = new Date();
  return {
    from: startOfMonth(today),
    to: today,
  };
};

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
  const [topProductsView, setTopProductsView] = useState<"primary" | "comparison">(
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

  const summaryData = useMemo(() => {
    return (
      summary ?? {
        stats: [],
        recentOrders: [],
        topProducts: [],
        topProductsComparison: [],
        inventory: { categoryCount: 0, lowStockCount: 0 },
        selectedRange: { start: "", end: "", label: "", days: 0 },
        comparisonRange: {
          start: "",
          end: "",
          label: "",
          source: "",
          days: 0,
        },
        comparisonNote: "",
      }
    );
  }, [summary]);

  const hasComparisonTopProducts = summaryData.topProductsComparison.length > 0;

  const topProductsPrimaryData = useMemo(() => {
    if (!summaryData.topProducts?.length) {
      return [];
    }

    return summaryData.topProducts.map((product, index) => ({
      id: product.productId ?? index,
      value: product.quantitySold,
      label: product.name,
      revenue: product.revenue,
      color: TOP_PRODUCTS_COLORS[index % TOP_PRODUCTS_COLORS.length],
    }));
  }, [summaryData.topProducts]);

  const topProductsComparisonData = useMemo(() => {
    if (!summaryData.topProductsComparison?.length) {
      return [];
    }

    return summaryData.topProductsComparison.map((product, index) => ({
      id: product.productId ?? index,
      value: product.quantitySold,
      label: product.name,
      revenue: product.revenue,
      color: TOP_PRODUCTS_COLORS[index % TOP_PRODUCTS_COLORS.length],
    }));
  }, [summaryData.topProductsComparison]);

  const activeTopProductsData =
    topProductsView === "comparison" ? topProductsComparisonData : topProductsPrimaryData;

  const topProductsViewLabel =
    topProductsView === "comparison"
      ? summaryData.comparisonRange.label || "Período comparativo"
      : summaryData.selectedRange.label || "Período principal";

  const topProductsEmptyMessage =
    topProductsView === "comparison"
      ? "Nenhum produto com vendas no período comparativo."
      : "Nenhuma venda registrada até o momento.";

  useEffect(() => {
    if (topProductsView === "comparison" && !hasComparisonTopProducts) {
      setTopProductsView("primary");
    }
  }, [topProductsView, hasComparisonTopProducts]);

  useEffect(() => {
    setTopProductsView("primary");
  }, [summaryData.selectedRange.start, summaryData.selectedRange.end]);

  const handleTopProductsViewChange = (value: string) => {
    if (value === "primary" || (value === "comparison" && hasComparisonTopProducts)) {
      setTopProductsView(value as "primary" | "comparison");
    }
  };

  const calendarSelectedRange =
    activeRange === "primary" ? primaryRange : comparisonRange;

  const calendarModifiers = useMemo(() => {
    const modifiers: Record<string, DateRange> = {};

    if (
      activeRange === "comparison" &&
      primaryRange?.from &&
      primaryRange?.to
    ) {
      modifiers.primaryPreview = {
        from: primaryRange.from,
        to: primaryRange.to,
      };
    }

    if (
      activeRange === "primary" &&
      comparisonRange?.from &&
      comparisonRange?.to
    ) {
      modifiers.comparisonPreview = {
        from: comparisonRange.from,
        to: comparisonRange.to,
      };
    }

    return modifiers;
  }, [activeRange, primaryRange, comparisonRange]);

  const calendarClassNames = undefined;

  const modifiersClassNames = useMemo(
    () => ({
      primaryPreview: "bg-primary/15 text-primary font-semibold",
    }),
    []
  );

  const formatChangeDescription = (stat: DashboardStat) => {
    if (stat.changePercentage === null) {
      return "Sem dados comparativos";
    }

    const comparisonLabel = stat.comparisonLabel || summaryData.comparisonRange.label || "período anterior";
    const sign = stat.changePercentage > 0 ? "+" : "";
    return `${sign}${stat.changePercentage.toFixed(1)}% vs ${comparisonLabel}`;
  };

  const formatByType = (value: number, type: "number" | "currency") =>
    type === "currency"
      ? currencyFormatter.format(value)
      : numberFormatter.format(value);

  const formatUnits = (value: number) =>
    `${numberFormatter.format(value)} unidade${value === 1 ? "" : "s"}`;

  const selectedRangeLabel =
    primaryRange?.from && primaryRange?.to
      ? `${format(primaryRange.from, "dd/MM/yyyy")} - ${format(
          primaryRange.to,
          "dd/MM/yyyy"
        )}`
      : "Selecione um período";

  const comparisonSelectionLabel = comparisonRange?.from && comparisonRange?.to
    ? `${format(comparisonRange.from, "dd/MM/yyyy")} - ${format(
        comparisonRange.to,
        "dd/MM/yyyy"
      )}`
    : "Automático";

  const buildSecondaryDescription = (
    statKey: string,
    statFormat: "number" | "currency",
    periodLabel: string,
    currentValue: number,
    extra: Record<string, number>
  ) => {
    if (statKey === "orders") {
      const awaiting = extra.awaiting_fulfillment ?? 0;
      return `${periodLabel}: ${formatByType(
        currentValue,
        "number"
      )} • Em andamento: ${numberFormatter.format(awaiting)}`;
    }

    if (statKey === "products") {
      const categories = numberFormatter.format(
        summaryData.inventory.categoryCount
      );
      const lowStock = numberFormatter.format(extra.low_stock_count ?? 0);
      return `Categorias ativas: ${categories} • Baixo estoque: ${lowStock}`;
    }

    if (statKey === "users") {
      return `${periodLabel}: ${numberFormatter.format(currentValue)}`;
    }

    if (statKey === "revenue") {
      const ticket = currencyFormatter.format(extra.average_order_value ?? 0);
      return `${periodLabel}: ${currencyFormatter.format(
        currentValue
      )} • Ticket médio: ${ticket}`;
    }

    return `${periodLabel}: ${formatByType(currentValue, statFormat)}`;
  };

  const handlePresetRange = (
    days: number,
    target: "primary" | "comparison" = "primary"
  ) => {
    const to = new Date();
    const from = subDays(to, days - 1);
    if (target === "primary") {
      setPrimaryRange({ from, to });
      return;
    }
    setComparisonRange({ from, to });
  };

  const resetToCurrentMonth = () => {
    setPrimaryRange(buildCurrentMonthRange());
  };

  const clearComparisonRange = () => {
    setComparisonRange(undefined);
    setActiveRange("primary");
  };

  const renderLoadingState = () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
      <Footer />
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  return (
    <div className="dashboard-theme min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="space-y-8">
          <div className="rounded-2xl border bg-muted/30 p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Dashboard Administrativo
                </h1>
                <p className="text-muted-foreground mt-2">
                  Bem-vindo, {user?.email}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 justify-end">
                {refreshing && (
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Atualizando
                  </span>
                )}
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
                        onClick={() => setActiveRange("primary")}
                      >
                        Período principal
                      </Button>
                      <Button
                        size="sm"
                        variant={activeRange === "comparison" ? "default" : "outline"}
                        onClick={() => setActiveRange("comparison")}
                      >
                        Período comparativo
                      </Button>
                      {activeRange === "comparison" && (
                        <Button size="sm" variant="ghost" onClick={clearComparisonRange}>
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
                      defaultMonth={
                        calendarSelectedRange?.from ?? primaryRange?.from
                      }
                      onSelect={(range) =>
                        activeRange === "primary"
                          ? setPrimaryRange(range ?? undefined)
                          : setComparisonRange(range ?? undefined)
                      }
                      modifiers={calendarModifiers}
                      modifiersClassNames={modifiersClassNames}
                      classNames={calendarClassNames}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handlePresetRange(7, activeRange)}
                      >
                        Últimos 7 dias
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handlePresetRange(30, activeRange)}
                      >
                        Últimos 30 dias
                      </Button>
                      <Button size="sm" variant="secondary" onClick={resetToCurrentMonth}>
                        Mês atual
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          activeRange === "primary"
                            ? setPrimaryRange(undefined)
                            : clearComparisonRange()
                        }
                      >
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
                {summaryData.selectedRange.label
                  ? `Aplicado: ${summaryData.selectedRange.label}`
                  : "Escolha um intervalo de datas para atualizar as métricas abaixo."}
              </p>
              {summaryData.comparisonRange.label && (
                <p>Comparando com: {summaryData.comparisonRange.label}</p>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>
                Não foi possível carregar todas as métricas
              </AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/produtos")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos
                </CardTitle>
                <CardDescription>
                  Criar, editar e gerenciar produtos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Gerenciar Produtos
                </Button>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/estoque")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5" />
                  Estoque
                </CardTitle>
                <CardDescription>Controlar entradas e saídas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Gerenciar Estoque
                </Button>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate("/admin/pedidos")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Pedidos
                </CardTitle>
                <CardDescription>
                  Acompanhar pedidos dos clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Ver Pedidos
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {summaryData.stats.map((stat) => {
              const Icon = iconMap[stat.key] ?? BarChart3;
              // const changeDescription = formatChangeDescription(stat); // Removed old description
              
              const changePercentage = stat.changePercentage;
              const hasChange = changePercentage !== null;
              const isPositive = hasChange && changePercentage > 0;
              const isNegative = hasChange && changePercentage < 0;
              
              const changeColorClass = !hasChange
                  ? "text-muted-foreground"
                  : isPositive
                    ? "text-emerald-600"
                    : isNegative
                      ? "text-red-600"
                      : "text-muted-foreground";

              const secondaryDescription = buildSecondaryDescription(
                stat.key,
                stat.format,
                stat.periodLabel,
                stat.currentPeriodTotal,
                stat.extra
              );

              return (
                <Card key={stat.key}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatByType(stat.value, stat.format)}
                    </div>
                    
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
                            {Math.abs(changePercentage).toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem dados comparativos</span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {secondaryDescription}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Recentes</CardTitle>
                <CardDescription>
                  Últimos pedidos realizados na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summaryData.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum pedido registrado ainda.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {summaryData.recentOrders.map((order) => {
                      const statusMeta = statusLabels[order.status] ?? {
                        label: order.status,
                        variant: "secondary" as const,
                      };

                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between gap-4"
                        >
                          <div>
                            <p className="font-semibold text-sm text-foreground">
                              Pedido #{order.orderNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(order.createdAt),
                                "dd/MM/yyyy HH:mm",
                                { locale: ptBR }
                              )}
                            </p>
                            {order.customerName && (
                              <p className="text-xs text-muted-foreground">
                                {order.customerName}
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            <Badge variant={statusMeta.variant}>
                              {statusMeta.label}
                            </Badge>
                            <p className="text-sm font-semibold text-foreground">
                              {currencyFormatter.format(order.total)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-4">
                <div className="space-y-1.5">
                  <CardTitle>Produtos mais Vendidos</CardTitle>
                  <CardDescription>
                    Top 5 produtos com maior volume de vendas
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ToggleGroup
                    type="single"
                    value={topProductsView}
                    onValueChange={handleTopProductsViewChange}
                    size="sm"
                    variant="outline"
                    className="rounded-full border bg-background/60 p-0.5 shadow-sm"
                    aria-label="Alternar período dos produtos"
                  >
                    <ToggleGroupItem
                      value="primary"
                      className="rounded-full data-[state=on]:bg-[hsl(var(--wine-burgundy))] data-[state=on]:text-white data-[state=on]:shadow-sm"
                    >
                      Período principal
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="comparison"
                      disabled={!hasComparisonTopProducts}
                      className="rounded-full data-[state=on]:bg-[hsl(var(--wine-burgundy))] data-[state=on]:text-white data-[state=on]:shadow-sm"
                    >
                      Período comparativo
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <span className="text-xs text-muted-foreground">
                    {topProductsViewLabel || (topProductsView === "comparison" ? "Período comparativo" : "Período principal")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {activeTopProductsData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {topProductsEmptyMessage}
                  </p>
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
                            data: activeTopProductsData,
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
                        slotProps={{
                          legend: { hidden: true },
                        }}
                      />
                    </div>
                    <ul className="flex w-full max-w-sm flex-col gap-2 self-stretch">
                      {activeTopProductsData.map((item) => (
                        <li key={item.id} className="flex items-start gap-3">
                          <div className="flex items-start gap-2.5">
                            <span
                              className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full"
                              style={{ backgroundColor: item.color }}
                              aria-hidden="true"
                            />
                            <div className="space-y-1">
                              <p className="text-sm font-semibold leading-none text-foreground">
                                {item.label}
                              </p>
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
