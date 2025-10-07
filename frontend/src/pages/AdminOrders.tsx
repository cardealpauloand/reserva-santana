import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ADMIN_ORDER_STATUS_META,
  ADMIN_ORDER_STATUS_OPTIONS,
  type AdminOrder,
  updateAdminOrderStatus,
  listAdminOrders,
} from "@/services/admin/orders";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ClipboardList,
  Loader2,
  Package,
  RefreshCw,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const formatOrderDate = (isoDate: string) =>
  format(new Date(isoDate), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  });

const AdminOrders = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const ensureStatusOptions = useCallback((status: string) => {
    if (ADMIN_ORDER_STATUS_OPTIONS.some((option) => option.value === status)) {
      return ADMIN_ORDER_STATUS_OPTIONS;
    }

    const meta = ADMIN_ORDER_STATUS_META[status];
    return [
      ...ADMIN_ORDER_STATUS_OPTIONS,
      {
        value: status,
        label: meta?.label ?? status,
      },
    ];
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdminOrders();
      setOrders(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os pedidos.";
      toast({
        title: "Erro ao carregar pedidos",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleStatusChange = useCallback(
    async (orderId: string, status: string) => {
      setUpdatingOrderId(orderId);
      try {
        const updatedOrder = await updateAdminOrderStatus(orderId, status);
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? updatedOrder : order))
        );
        toast({
          title: "Status atualizado",
          description: `Pedido atualizado para ${
            ADMIN_ORDER_STATUS_META[status]?.label ?? status
          }`,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o status do pedido.";
        toast({
          title: "Erro ao atualizar status",
          description: message,
          variant: "destructive",
        });
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate("/");
        return;
      }

      void loadOrders();
    }
  }, [authLoading, isAdmin, loadOrders, navigate, user]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + (order.total ?? 0), 0),
    [orders]
  );

  const renderLoading = () => (
    <div className="py-24 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Pedidos</h1>
            <p className="text-muted-foreground">
              Acompanhe e atualize o progresso dos pedidos realizados na loja.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => void loadOrders()}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar lista
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos ativos
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total de pedidos visíveis no painel
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita bruta
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencyFormatter.format(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Soma do valor dos pedidos listados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin atual</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {user?.email ?? "Usuário"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Permissões administrativas ativas
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          renderLoading()
        ) : orders.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5" />
                Nenhum pedido encontrado
              </CardTitle>
              <CardDescription>
                Assim que novos pedidos forem realizados, eles aparecerão aqui.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const meta = ADMIN_ORDER_STATUS_META[order.status] ?? {
                label: order.status,
                badgeVariant: "secondary" as const,
              };

              const statusOptions = ensureStatusOptions(order.status);

              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <ClipboardList className="h-5 w-5" />
                          Pedido #{order.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Criado em {formatOrderDate(order.createdAt)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <UserIcon className="h-4 w-4" />
                          {order.userId}
                        </p>
                      </div>
                      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                        <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            void handleStatusChange(order.id, value)
                          }
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Selecionar status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-semibold mb-3 text-foreground">
                          Itens do pedido
                        </h3>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead className="text-right">
                                  Qtd.
                                </TableHead>
                                <TableHead className="text-right">
                                  Valor unitário
                                </TableHead>
                                <TableHead className="text-right">
                                  Subtotal
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {order.items.map((item) => {
                                const subtotal =
                                  (item.price_at_purchase ?? 0) *
                                  (item.quantity ?? 0);
                                return (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                      {item.product_name}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {item.quantity}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {currencyFormatter.format(
                                        item.price_at_purchase ?? 0
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {currencyFormatter.format(subtotal)}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-foreground">
                            Valor total
                          </h3>
                          <p className="text-2xl font-bold text-foreground">
                            {currencyFormatter.format(order.total ?? 0)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            Endereço de entrega
                          </h3>
                          {order.shippingAddress ? (
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p className="font-medium text-foreground">
                                {order.shippingAddress.name}
                              </p>
                              <p>
                                {order.shippingAddress.street},{" "}
                                {order.shippingAddress.number}
                                {order.shippingAddress.complement
                                  ? ` - ${order.shippingAddress.complement}`
                                  : ""}
                              </p>
                              <p>
                                {order.shippingAddress.neighborhood},{" "}
                                {order.shippingAddress.city} -{" "}
                                {order.shippingAddress.state}
                              </p>
                              <p>CEP: {order.shippingAddress.zip_code}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Endereço não informado.
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            Atualizado em
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatOrderDate(order.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminOrders;
