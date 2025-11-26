import { useCallback, useEffect, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import {
  listAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  type AdminProduct,
  type AdminProductPayload,
} from "@/services/admin/products";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Loader2 } from "lucide-react";

interface FormState {
  name: string;
  origin: string;
  type: string;
  price: string;
  rating: string;
  imageUrl: string;
  description: string;
}

const BASE_TYPE_OPTIONS = ["Tinto", "Branco", "Rosé", "Espumante"];
const DEFAULT_PRODUCT_TYPE = BASE_TYPE_OPTIONS[0];

const normalizeType = (value: string | null | undefined): string => {
  return value?.trim() || DEFAULT_PRODUCT_TYPE;
};

const buildTypeOptions = (items: AdminProduct[]): string[] => {
  const options = new Set(BASE_TYPE_OPTIONS);

  for (const product of items) {
    if (product.type) {
      options.add(product.type);
    }
  }

  return Array.from(options);
};

const createInitialFormState = (): FormState => ({
  name: "",
  origin: "",
  type: DEFAULT_PRODUCT_TYPE,
  price: "",
  rating: "",
  imageUrl: "",
  description: "",
});

const fillFormFromProduct = (product: AdminProduct): FormState => ({
  name: product.name,
  origin: product.origin ?? "",
  type: normalizeType(product.type),
  price: product.price.toString(),
  rating: product.rating !== null ? product.rating.toString() : "",
  imageUrl: product.imageUrl ?? "",
  description: product.description ?? "",
});

const ProductManagement = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [typeOptions, setTypeOptions] = useState<string[]>(BASE_TYPE_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormState>(() => createInitialFormState());
  const { toast } = useToast();

  const resetForm = () => setFormData(createInitialFormState());

  const fetchProducts = useCallback(
    async (showSpinner = false) => {
      try {
        if (showSpinner) {
          setLoading(true);
        }

        const data = await listAdminProducts();
        setProducts(data);
        setTypeOptions(buildTypeOptions(data));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os produtos";

        toast({
          title: "Erro ao carregar produtos",
          description: message,
          variant: "destructive",
        });
      } finally {
        if (showSpinner) {
          setLoading(false);
        }
      }
    },
    [toast]
  );

  useEffect(() => {
    void fetchProducts(true);
  }, [fetchProducts]);

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }

    if (editingProduct) {
      setFormData(fillFormFromProduct(editingProduct));
    } else {
      resetForm();
    }
  }, [dialogOpen, editingProduct]);

  const handleOpenDialog = (product?: AdminProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData(fillFormFromProduct(product));
    } else {
      setEditingProduct(null);
      resetForm();
    }

    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);

    if (!open) {
      setEditingProduct(null);
      resetForm();
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.price.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e preço do produto",
        variant: "destructive",
      });
      return;
    }

    const priceValue = Number(formData.price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      toast({
        title: "Preço inválido",
        description: "Informe um preço válido",
        variant: "destructive",
      });
      return;
    }

    const ratingValue = formData.rating.trim()
      ? Number(formData.rating)
      : null;

    if (ratingValue !== null && (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5)) {
      toast({
        title: "Avaliação inválida",
        description: "A avaliação deve estar entre 0 e 5",
        variant: "destructive",
      });
      return;
    }

    const payload: AdminProductPayload = {
      name: formData.name.trim(),
      origin: formData.origin.trim() || null,
      type: formData.type || null,
      price: priceValue,
      rating: ratingValue,
      description: formData.description.trim() || null,
      image_url: formData.imageUrl.trim() || null,
      active: editingProduct?.active ?? true,
    };

    setSubmitting(true);

    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        toast({
          title: "Produto atualizado",
          description: "As informações do produto foram salvas",
        });
      } else {
        await createAdminProduct(payload);
        toast({
          title: "Produto criado",
          description: "O produto foi cadastrado com sucesso",
        });
      }

      handleDialogOpenChange(false);
      await fetchProducts();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível salvar o produto";

      toast({
        title: "Erro ao salvar produto",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    try {
      await deleteAdminProduct(id);
      toast({
        title: "Produto excluído",
        description: "O produto foi removido com sucesso",
      });
      await fetchProducts();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível excluir o produto";

      toast({
        title: "Erro ao excluir produto",
        description: message,
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Lista de Produtos
              </CardTitle>
              <CardDescription>
                Visualize e atualize as informações dos produtos cadastrados
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
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Nenhum produto cadastrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.origin ?? "—"}</TableCell>
                        <TableCell>{product.type ?? "—"}</TableCell>
                        <TableCell>
                          {product.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell>{product.stockQuantity}</TableCell>
                        <TableCell>
                          {product.rating !== null
                            ? `${Number(product.rating).toFixed(1)} ⭐`
                            : "—"}
                        </TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto overscroll-contain">
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
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="origin">Origem</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(event) =>
                  setFormData({ ...formData, origin: event.target.value })
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
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  validate="number"
                  value={formData.price}
                  onChange={(event) =>
                    setFormData({ ...formData, price: event.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stock">Estoque atual</Label>
                <Input
                  id="stock"
                  value={(editingProduct?.stockQuantity ?? 0).toString()}
                  readOnly
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Atualize o estoque pela tela de movimentações.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rating">Avaliação (0-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                validate="number"
                value={formData.rating}
                onChange={(event) =>
                  setFormData({ ...formData, rating: event.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input
                id="image"
                value={formData.imageUrl}
                onChange={(event) =>
                  setFormData({ ...formData, imageUrl: event.target.value })
                }
                placeholder="https://exemplo.com/imagem.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Pré-visualização (contain, fundo branco)</p>
                  <div className="bg-white rounded-md overflow-hidden flex items-center justify-center min-w-[12rem] md:min-w-[13rem] lg:min-w-[14rem] h-40 md:h-48 lg:h-56">
                    <img
                      src={formData.imageUrl}
                      alt="Pré-visualização da imagem do produto"
                      className="w-full h-full object-contain"
                      style={{ objectPosition: "32% 50%" }}
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(event) =>
                  setFormData({ ...formData, description: event.target.value })
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
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
