import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, History, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Product {
  id: string;
  name: string;
  type: string;
  stock_quantity: number;
  price: number;
}

interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  movement_type: string;
  reason: string | null;
  created_at: string;
  products: {
    name: string;
  };
}

const StockManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [movementType, setMovementType] = useState("entrada");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (productsError) throw productsError;

      const { data: movementsData, error: movementsError } = await supabase
        .from("stock_movements")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (movementsError) throw movementsError;

      setProducts(productsData || []);
      setMovements(movementsData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity || !user) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from("stock_movements")
        .insert({
          product_id: selectedProduct,
          quantity: parseInt(quantity),
          movement_type: movementType,
          reason: reason || null,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Movimentação registrada",
        description: "O estoque foi atualizado com sucesso.",
      });

      setDialogOpen(false);
      setSelectedProduct("");
      setQuantity("");
      setReason("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao registrar movimentação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gerenciamento de Estoque
          </h1>
          <p className="text-muted-foreground">
            Gerencie o estoque dos produtos da loja
          </p>
        </div>

        <div className="grid gap-6">
          {/* Current Stock */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Estoque Atual
                </CardTitle>
                <CardDescription>
                  Visualize a quantidade disponível de cada produto
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Movimentação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Movimentação</DialogTitle>
                    <DialogDescription>
                      Adicione entrada, saída ou ajuste de estoque
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitMovement} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">Produto</Label>
                      <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
                        <SelectTrigger id="product">
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (Estoque: {product.stock_quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="movement-type">Tipo de Movimentação</Label>
                      <Select value={movementType} onValueChange={setMovementType}>
                        <SelectTrigger id="movement-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">Entrada</SelectItem>
                          <SelectItem value="saida">Saída</SelectItem>
                          <SelectItem value="ajuste">Ajuste</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Motivo (opcional)</Label>
                      <Input
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Reposição de estoque, venda, ajuste de inventário"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Registrando...
                        </>
                      ) : (
                        "Registrar Movimentação"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.type}</TableCell>
                      <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            product.stock_quantity < 10
                              ? "text-destructive font-semibold"
                              : product.stock_quantity < 50
                              ? "text-warning font-semibold"
                              : "text-success"
                          }
                        >
                          {product.stock_quantity}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Movements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Movimentações
              </CardTitle>
              <CardDescription>
                Últimas 20 movimentações registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {format(new Date(movement.created_at), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {movement.products.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            movement.movement_type === "entrada"
                              ? "text-success"
                              : movement.movement_type === "saida"
                              ? "text-destructive"
                              : "text-warning"
                          }
                        >
                          {movement.movement_type.charAt(0).toUpperCase() +
                            movement.movement_type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {movement.movement_type === "entrada" || movement.movement_type === "ajuste"
                          ? "+"
                          : "-"}
                        {movement.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {movement.reason || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StockManagement;
