import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Plus } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface SavedAddress {
  id: string;
  name: string;
  zip_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para finalizar a compra",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    loadSavedAddresses();
  }, [user, navigate, toast]);

  const loadSavedAddresses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading addresses:", error);
      return;
    }

    if (data && data.length > 0) {
      setSavedAddresses(data);
      const defaultAddress = data.find((addr) => addr.is_default) || data[0];
      setSelectedAddressId(defaultAddress.id);
      fillFormWithAddress(defaultAddress);
    }
  };

  const fillFormWithAddress = (address: SavedAddress) => {
    setFormData({
      name: address.name,
      email: user?.email || "",
      phone: "",
      zipCode: address.zip_code,
      street: address.street,
      number: address.number,
      complement: address.complement || "",
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
    });
  };

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === "new") {
      setFormData({
        name: "",
        email: user?.email || "",
        phone: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      });
    } else {
      const address = savedAddresses.find((addr) => addr.id === addressId);
      if (address) {
        fillFormWithAddress(address);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para finalizar a compra",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Save new address if checkbox is checked and using new address
      if (saveNewAddress && selectedAddressId === "new" && user) {
        const { error: addressError } = await supabase
          .from("addresses")
          .insert({
            user_id: user.id,
            name: formData.name,
            zip_code: formData.zipCode,
            street: formData.street,
            number: formData.number,
            complement: formData.complement || null,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
          });

        if (addressError) {
          console.error("Error saving address:", addressError);
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders" as any)
        .insert({
          user_id: user.id,
          total: cartTotal,
          status: "pending",
          shipping_address: formData,
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error("Failed to create order");

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: (order as any).id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price_at_purchase: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items" as any)
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      
      toast({
        title: "Pedido realizado!",
        description: "Seu pedido foi confirmado com sucesso",
      });

      navigate("/");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao finalizar o pedido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/carrinho");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
          Finalizar Compra
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dados de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {savedAddresses.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Escolha o endereço</Label>
                      <RadioGroup value={selectedAddressId} onValueChange={handleAddressSelection}>
                        {savedAddresses.map((address) => (
                          <div key={address.id} className="flex items-start space-x-3 space-y-0">
                            <RadioGroupItem value={address.id} id={address.id} />
                            <Label
                              htmlFor={address.id}
                              className="flex-1 cursor-pointer space-y-1 font-normal"
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{address.name}</span>
                                {address.is_default && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    Padrão
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {address.street}, {address.number}
                                {address.complement && ` - ${address.complement}`}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {address.neighborhood}, {address.city} - {address.state}
                              </div>
                              <div className="text-sm text-muted-foreground">CEP: {address.zip_code}</div>
                            </Label>
                          </div>
                        ))}
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="new" id="new" />
                          <Label htmlFor="new" className="flex items-center gap-2 cursor-pointer font-normal">
                            <Plus className="h-4 w-4" />
                            Usar novo endereço
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {selectedAddressId === "new" && (
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Checkbox
                        id="save-address"
                        checked={saveNewAddress}
                        onCheckedChange={(checked) => setSaveNewAddress(checked as boolean)}
                      />
                      <Label
                        htmlFor="save-address"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Salvar este endereço para futuras compras
                      </Label>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        name="complement"
                        value={formData.complement}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    variant="hero"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Confirmar Pedido"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-foreground">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-green-600 font-medium">Grátis</span>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
