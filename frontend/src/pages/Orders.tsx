import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderItem {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_address: {
    name: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  order_items?: OrderItem[];
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  processing: { label: "Em Processamento", variant: "default" },
  shipped: { label: "Enviado", variant: "outline" },
  delivered: { label: "Entregue", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      if (ordersData) {
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            const { data: items, error: itemsError } = await supabase
              .from("order_items")
              .select("*")
              .eq("order_id", order.id);

            if (itemsError) throw itemsError;

            return {
              ...order,
              order_items: items || [],
            };
          })
        );

        setOrders(ordersWithItems as any);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Meus Pedidos
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o status dos seus pedidos
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                Você ainda não fez nenhum pedido. Comece a explorar nossos produtos!
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Ver Produtos
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Pedido #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusLabels[order.status]?.variant || "default"}>
                        {statusLabels[order.status]?.label || order.status}
                      </Badge>
                      <span className="text-lg font-semibold text-foreground">
                        R$ {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-3">Itens do Pedido</h4>
                    <div className="space-y-2">
                      {order.order_items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-md"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantidade: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground">
                            R$ {(item.price_at_purchase * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-sm text-foreground mb-2">Endereço de Entrega</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">{order.shipping_address.name}</p>
                      <p>
                        {order.shipping_address.street}, {order.shipping_address.number}
                        {order.shipping_address.complement && ` - ${order.shipping_address.complement}`}
                      </p>
                      <p>
                        {order.shipping_address.neighborhood}, {order.shipping_address.city} - {order.shipping_address.state}
                      </p>
                      <p>CEP: {order.shipping_address.zip_code}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
