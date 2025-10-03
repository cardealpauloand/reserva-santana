import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, History, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  StockProduct,
  StockMovement,
  listStockProducts,
  listStockMovements,
  createStockMovement,
} from "@/services/admin/stock";

const StockManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [movementType, setMovementType] = useState<StockMovement["movementType"]>("entrada");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [productsData, movementsData] = await Promise.all([
        listStockProducts(),
        listStockMovements(20),
      ]);

      setProducts(productsData);
      setMovements(movementsData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message ?? "Não foi possível carregar as informações de estoque.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMovement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProductId || !quantity) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        productId: Number(selectedProductId),
        quantity: Number(quantity),
        movementType,
        reason: reason.trim() ? reason.trim() : null,
      } as const;

      const movement = await createStockMovement(payload);

      toast({
        title: "Movimentação registrada",
        description: "O estoque foi atualizado com sucesso.",
      });

      setDialogOpen(false);
      setSelectedProductId("");
      setQuantity("");
      setReason("");

      setMovements((current) => [movement, ...current].slice(0, 20));
      setProducts((current) =>
        current.map((product) =>
          product.id === movement.productId && movement.currentQuantity !== null
            ? { ...product, stockQuantity: movement.currentQuantity }
            : product
        )
      );
    } catch (error: any) {
      toast({
        title: "Erro ao registrar movimentação",
        description: error.message ?? "Não foi possível registrar a movimentação de estoque.",
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciamento de Estoque</h1>
          <p className="text-muted-foreground">Gerencie o estoque dos produtos da loja</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Estoque Atual
                </CardTitle>
                <CardDescription>Visualize a quantidade disponível de cada produto</CardDescription>
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
                    <DialogDescription>Adicione entrada, saída ou ajuste de estoque</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitMovement} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">Produto</Label>
                      <Select value={selectedProductId} onValueChange={setSelectedProductId} required>
                        <SelectTrigger id="product">
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={String(product.id)}>
                              {product.name} (Estoque: {product.stockQuantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="movement-type">Tipo de Movimentação</Label>
                      <Select value={movementType} onValueChange={(value) => setMovementType(value as StockMovement["movementType"])}>
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
                        onChange={(event) => setQuantity(event.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Motivo (opcional)</Label>
                      <Input
                        id="reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
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
                      <TableCell>{product.type ?? "-"}</TableCell>
                      <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            product.stockQuantity < 10
                              ? "text-destructive font-semibold"
                              : product.stockQuantity < 50
                              ? "text-warning font-semibold"
                              : "text-success"
                          }
                        >
                          {product.stockQuantity}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Movimentações
              </CardTitle>
              <CardDescription>Últimas 20 movimentações registradas</CardDescription>
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
                        {format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{movement.productName}</TableCell>
                      <TableCell>
                        <span
                          className={
                            movement.movementType === "entrada"
                              ? "text-success"
                              : movement.movementType === "saida"
                              ? "text-destructive"
                              : "text-warning"
                          }
                        >
                          {movement.movementType.charAt(0).toUpperCase() + movement.movementType.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {movement.movementType === "entrada" || movement.movementType === "ajuste" ? "+" : "-"}
                        {movement.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{movement.reason ?? "-"}</TableCell>
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
