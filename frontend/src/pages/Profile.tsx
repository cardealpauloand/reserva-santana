import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, MapPin, Package } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

interface Profile {
  full_name: string;
  phone: string;
}

interface Address {
  id: string;
  name: string;
  zip_code: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    phone: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  
  const [newAddress, setNewAddress] = useState({
    name: "",
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    is_default: false,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadProfile();
    loadAddresses();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({
          full_name: (data as any).full_name || "",
          phone: (data as any).phone || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadAddresses = async () => {
    if (!user) return;

    setLoadingAddresses(true);
    try {
      const { data, error } = await supabase
        .from("addresses" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (error) throw error;

      setAddresses((data as any) || []);
    } catch (error) {
      console.error("Error loading addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles" as any)
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("addresses" as any)
        .insert({
          ...newAddress,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Endereço adicionado!",
        description: "Seu endereço foi salvo com sucesso",
      });

      setNewAddress({
        name: "",
        zip_code: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        is_default: false,
      });
      setShowAddressForm(false);
      loadAddresses();
    } catch (error) {
      console.error("Error adding address:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o endereço",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Deseja realmente excluir este endereço?")) return;

    try {
      const { error } = await supabase
        .from("addresses" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Endereço removido",
        description: "O endereço foi excluído com sucesso",
      });

      loadAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o endereço",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Meu Perfil
          </h1>
          <Link to="/pedidos">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Meus Pedidos
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Informações"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Meus Endereços</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="space-y-3 p-4 border rounded-lg bg-muted/50">
                  <div>
                    <Label htmlFor="addr_name">Nome do Endereço</Label>
                    <Input
                      id="addr_name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      placeholder="Ex: Casa, Trabalho"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="zip_code">CEP</Label>
                      <Input
                        id="zip_code"
                        value={newAddress.zip_code}
                        onChange={(e) => setNewAddress({ ...newAddress, zip_code: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={newAddress.number}
                        onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={newAddress.complement}
                      onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={newAddress.neighborhood}
                      onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}

              {loadingAddresses ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum endereço cadastrado</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 border rounded-lg space-y-2 relative"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{address.name}</h3>
                        {address.is_default && (
                          <span className="text-xs text-primary">Endereço Padrão</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {address.street}, {address.number}
                      {address.complement && ` - ${address.complement}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.neighborhood}, {address.city} - {address.state}
                    </p>
                    <p className="text-sm text-muted-foreground">CEP: {address.zip_code}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
