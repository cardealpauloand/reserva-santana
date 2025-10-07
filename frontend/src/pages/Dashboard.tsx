import { useEffect, useMemo, useState } from "react";
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
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Settings,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  type DashboardSummary,
  fetchDashboardSummary,
} from "@/services/admin/dashboard";

const iconMap: Record<string, LucideIcon> = {
  orders: ShoppingCart,
  products: Package,
  users: Users,
  revenue: BarChart3,
};

const statusLabels: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardSummary();
        setSummary(data);
        setError(null);
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
      }
    };

    void load();
  }, [toast]);

  const summaryData = useMemo(() => {
    return (
      summary ?? {
        stats: [],
        recentOrders: [],
        topProducts: [],
        inventory: { categoryCount: 0, lowStockCount: 0 },
      }
    );
  }, [summary]);

  const formatChangeDescription = (change: number | null) => {
    if (change === null) {
      return "Sem dados comparativos";
    }

    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}% vs período anterior`;
  };

  const formatByType = (value: number, type: "number" | "currency") =>
    type === "currency"
      ? currencyFormatter.format(value)
      : numberFormatter.format(value);

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Dashboard Administrativo
              </h1>
              <p className="text-muted-foreground mt-2">
                Bem-vindo, {user?.email}
              </p>
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
              onClick={() => navigate("/pedidos")}
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
              const changeDescription = formatChangeDescription(
                stat.changePercentage
              );
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {changeDescription}
                    </p>
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
              <CardHeader>
                <CardTitle>Produtos mais Vendidos</CardTitle>
                <CardDescription>
                  Top 5 produtos com maior volume de vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summaryData.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma venda registrada até o momento.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {summaryData.topProducts.map((product) => (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {numberFormatter.format(product.quantitySold)}{" "}
                            unidade(s)
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {currencyFormatter.format(product.revenue)}
                        </p>
                      </div>
                    ))}
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
