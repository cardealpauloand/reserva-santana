import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, History, Package } from "lucide-react";
import { Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  origin: string;
  type: string;
  price: number;
  stock_quantity: number;
  image: string;
  rating: number;
}

interface PriceAudit {
  id: string;
  product_id: string;
  old_price: number;
  new_price: number;
  changed_at: string;
  reason: string | null;
  products: { name: string };
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [priceAudits, setPriceAudits] = useState<PriceAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    type: "Tinto",
    price: "",
    stock_quantity: "",
    image: "",
    rating: "5",
  });

  useEffect(() => {
    fetchProducts();
    fetchPriceAudits();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceAudits = async () => {
    try {
      const { data, error } = await supabase
        .from("price_audit")
        .select("*, products(name)")
        .order("changed_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setPriceAudits(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar auditoria:", error);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        origin: product.origin,
        type: product.type,
        price: product.price.toString(),
        stock_quantity: product.stock_quantity.toString(),
        image: product.image,
        rating: product.rating.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        origin: "",
        type: "Tinto",
        price: "",
        stock_quantity: "",
        image: "",
        rating: "5",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.origin || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        origin: formData.origin,
        type: formData.type,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        image: formData.image || "/placeholder.svg",
        rating: parseFloat(formData.rating),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso",
        });
      } else {
        const { error } = await supabase.from("products").insert([productData]);

        if (error) throw error;
        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso",
        });
      }

      setDialogOpen(false);
      fetchProducts();
      fetchPriceAudits();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar produto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso",
      });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Gerenciamento de Produtos
              </h1>
              <p className="text-muted-foreground mt-2">
                Crie, edite e gerencie os produtos da loja
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>

          <Tabs defaultValue="products" className="space-y-4">
            <TabsList>
              <TabsTrigger value="products">
                <Package className="h-4 w-4 mr-2" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="audit">
                <History className="h-4 w-4 mr-2" />
                Auditoria de Preços
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Produtos</CardTitle>
                  <CardDescription>
                    Gerencie todos os produtos cadastrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Avaliação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{product.origin}</TableCell>
                          <TableCell>{product.type}</TableCell>
                          <TableCell>
                            R$ {product.price.toFixed(2)}
                          </TableCell>
                          <TableCell>{product.stock_quantity}</TableCell>
                          <TableCell>{product.rating.toFixed(1)} ⭐</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Alterações de Preço</CardTitle>
                  <CardDescription>
                    Acompanhe todas as mudanças de preço realizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Preço Anterior</TableHead>
                        <TableHead>Preço Novo</TableHead>
                        <TableHead>Diferença</TableHead>
                        <TableHead>Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {priceAudits.map((audit) => {
                        const diff = audit.new_price - audit.old_price;
                        const diffPercent = (
                          (diff / audit.old_price) *
                          100
                        ).toFixed(1);
                        return (
                          <TableRow key={audit.id}>
                            <TableCell>
                              {new Date(audit.changed_at).toLocaleString(
                                "pt-BR"
                              )}
                            </TableCell>
                            <TableCell>{audit.products.name}</TableCell>
                            <TableCell>
                              R$ {audit.old_price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              R$ {audit.new_price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  diff > 0 ? "text-green-600" : "text-red-600"
                                }
                              >
                                {diff > 0 ? "+" : ""}R$ {diff.toFixed(2)} (
                                {diffPercent}%)
                              </span>
                            </TableCell>
                            <TableCell>
                              {audit.reason || "Sem motivo especificado"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do produto abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="origin">Origem *</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tinto">Tinto</SelectItem>
                  <SelectItem value="Branco">Branco</SelectItem>
                  <SelectItem value="Rosé">Rosé</SelectItem>
                  <SelectItem value="Espumante">Espumante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rating">Avaliação (1-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingProduct ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ProductManagement;
