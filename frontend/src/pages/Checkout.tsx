import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { addressesService } from "@/services/addresses";
import { ordersService } from "@/services/orders";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  MapPin,
  Plus,
  Check,
  CreditCard,
  Truck,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Address } from "@/types/address";
import { getShippingQuotes, type ShippingQuote } from "@/services/shipping";

type SavedAddress = Address;

interface PaymentData {
  installments: string;
  cardName: string;
  cardNumber: string;
  cardExpiration: string;
  cardCvv: string;
}

const checkoutSteps = [
  {
    title: "Entrega",
    description: "Informe endereço e dados de contato",
  },
  {
    title: "Pagamento",
    description: "Defina a forma de pagamento",
  },
  {
    title: "Confirmação",
    description: "Revise e confirme o pedido",
  },
];

const CARD_PAYMENT_LABEL = "Cartão de Crédito";
const CARD_PAYMENT_DESCRIPTION = "Parcele em até 12x sem juros";

const formatCardNumber = (value: string) =>
  value
    .replace(/[^0-9]/g, "")
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

const formatExpirationDate = (value: string) => {
  const digitsOnly = value.replace(/[^0-9]/g, "");
  if (digitsOnly.length === 0) return "";
  if (digitsOnly.length <= 2) return digitsOnly;
  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}`;
};

const getCardLastDigits = (cardNumber: string) => {
  const digitsOnly = cardNumber.replace(/[^0-9]/g, "");
  if (digitsOnly.length < 4) return digitsOnly;
  return digitsOnly.slice(-4);
};

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
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[] | null>(
    null
  );
  const [shippingLoading, setShippingLoading] = useState(false);
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingQuote | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    installments: "1",
    cardName: "",
    cardNumber: "",
    cardExpiration: "",
    cardCvv: "",
  });

  const fillFormWithAddress = useCallback(
    (address: SavedAddress) => {
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
    },
    [user?.email]
  );

  const loadSavedAddresses = useCallback(async () => {
    if (!user) return;

    try {
      const data = await addressesService.getAddresses();

      if (data && data.length > 0) {
        setSavedAddresses(data);
        const defaultAddress = data.find((addr) => addr.is_default) || data[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          fillFormWithAddress(defaultAddress);
        } else {
          setSelectedAddressId("new");
        }
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  }, [fillFormWithAddress, user]);

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
  }, [user, navigate, toast, loadSavedAddresses]);

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

  const normalizedCep = (cep: string) => cep.replace(/\D/g, "");

  const fetchQuotes = useCallback(
    async (zip?: string) => {
      const cep = normalizedCep(zip ?? formData.zipCode);
      if (cep.length !== 8 || items.length === 0) return;

      setShippingLoading(true);
      setSelectedShipping(null);
      try {
        const quotes = await getShippingQuotes({
          destination_zip: cep,
          items: items.map((i) => ({ quantity: i.quantity })),
        });
        setShippingQuotes(quotes);
        setSelectedShipping(quotes[0] ?? null);
      } catch (err) {
        console.error("Failed to fetch shipping quotes", err);
        setShippingQuotes(null);
        setSelectedShipping(null);
        toast({
          title: "Erro ao calcular frete",
          description: "Verifique o CEP e tente novamente.",
          variant: "destructive",
        });
      } finally {
        setShippingLoading(false);
      }
    },
    [formData.zipCode, items, toast]
  );

  useEffect(() => {
    const cep = normalizedCep(formData.zipCode);
    if (cep.length === 8 && items.length > 0) {
      fetchQuotes(formData.zipCode);
    }
  }, [formData.zipCode, fetchQuotes, items.length]);

  const handlePaymentFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]:
        name === "cardNumber"
          ? formatCardNumber(value)
          : name === "cardExpiration"
          ? formatExpirationDate(value)
          : value,
    }));
  };

  const handleInstallmentsChange = (value: string) => {
    setPaymentData((prev) => ({ ...prev, installments: value }));
  };

  const validateShippingStep = () => {
    const requiredFields: Array<{ key: keyof typeof formData; label: string }> =
      [
        { key: "name", label: "o nome completo" },
        { key: "email", label: "o email" },
        { key: "phone", label: "o telefone" },
        { key: "zipCode", label: "o CEP" },
        { key: "street", label: "a rua" },
        { key: "number", label: "o número" },
        { key: "neighborhood", label: "o bairro" },
        { key: "city", label: "a cidade" },
        { key: "state", label: "o estado" },
      ];

    const missingField = requiredFields.find(
      (field) => !formData[field.key].trim()
    );

    if (missingField) {
      toast({
        title: "Dados incompletos",
        description: `Preencha ${missingField.label} para prosseguir`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validatePaymentStep = () => {
    const requiredFields: Array<{ key: keyof PaymentData; label: string }> = [
      { key: "cardName", label: "o nome impresso no cartão" },
      { key: "cardNumber", label: "o número do cartão" },
      { key: "cardExpiration", label: "a validade do cartão" },
      { key: "cardCvv", label: "o código de segurança" },
    ];

    const missingField = requiredFields.find(
      (field) => !paymentData[field.key].trim()
    );

    if (missingField) {
      toast({
        title: "Dados de pagamento incompletos",
        description: `Preencha ${missingField.label} para prosseguir`,
        variant: "destructive",
      });
      return false;
    }

    if (paymentData.cardNumber.replace(/[^0-9]/g, "").length < 13) {
      toast({
        title: "Número do cartão inválido",
        description: "Verifique os dígitos informados",
        variant: "destructive",
      });
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(paymentData.cardExpiration)) {
      toast({
        title: "Validade inválida",
        description: "Informe no formato MM/AA",
        variant: "destructive",
      });
      return false;
    }

    if (!/^\d{3,4}$/.test(paymentData.cardCvv)) {
      toast({
        title: "CVV inválido",
        description: "Informe 3 ou 4 dígitos",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 0 && !validateShippingStep()) {
      return;
    }

    if (currentStep === 0 && !selectedShipping) {
      toast({
        title: "Selecione o frete",
        description: "Informe o CEP e escolha uma opção de entrega.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 1 && !validatePaymentStep()) {
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, checkoutSteps.length - 1));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep !== checkoutSteps.length - 1) {
      handleNextStep();
      return;
    }

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
      if (saveNewAddress && selectedAddressId === "new" && user) {
        try {
          await addressesService.createAddress({
            name: formData.name,
            zip_code: formData.zipCode,
            street: formData.street,
            number: formData.number,
            complement: formData.complement || "",
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
          });
        } catch (addressError) {
          console.error("Error saving address:", addressError);
        }
      }

      const createdOrder = await ordersService.createOrder({
        shipping_address: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          zip_code: formData.zipCode,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
        },
        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price_at_purchase: item.price,
        })),
      });

      clearCart();

      const paymentSummary = `${CARD_PAYMENT_LABEL} final ${getCardLastDigits(
        paymentData.cardNumber
      )}`;

      toast({
        title: "Pedido realizado!",
        description: `Seu pedido foi confirmado com sucesso. Número do pedido: ${
          createdOrder?.id ?? "—"
        }. Forma de pagamento: ${paymentSummary}`,
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

  const shippingValue = selectedShipping?.price ?? 0;
  const orderTotal = cartTotal + shippingValue;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
          Finalizar Compra
        </h1>

        <ol className="mb-8 grid gap-4 md:grid-cols-3">
          {checkoutSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <li key={step.title}>
                <div
                  className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : isCompleted
                      ? "border-green-500/40 bg-green-50 dark:bg-green-500/10"
                      : "border-border"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{checkoutSteps[currentStep].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      {savedAddresses.length > 0 && (
                        <div className="space-y-4">
                          <Label className="text-base font-semibold">
                            Escolha o endereço
                          </Label>
                          <RadioGroup
                            value={selectedAddressId}
                            onValueChange={handleAddressSelection}
                          >
                            {savedAddresses.map((address) => (
                              <div
                                key={address.id}
                                className="flex items-start space-x-3 space-y-0"
                              >
                                <RadioGroupItem
                                  value={address.id}
                                  id={address.id}
                                />
                                <Label
                                  htmlFor={String(address.id)}
                                  className="flex-1 cursor-pointer space-y-1 font-normal"
                                >
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {address.name}
                                    </span>
                                    {address.is_default && (
                                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                        Padrão
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {address.street}, {address.number}
                                    {address.complement &&
                                      ` - ${address.complement}`}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {address.neighborhood}, {address.city} -{" "}
                                    {address.state}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    CEP: {address.zip_code}
                                  </div>
                                </Label>
                              </div>
                            ))}
                            <div className="flex items-center space-x-3 space-y-0">
                              <RadioGroupItem value="new" id="new" />
                              <Label
                                htmlFor="new"
                                className="flex items-center gap-2 cursor-pointer font-normal"
                              >
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
                            onCheckedChange={(checked) =>
                              setSaveNewAddress(checked as boolean)
                            }
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
                            validate="letters"
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            validate="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            validate="phone"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">CEP</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            validate="cep"
                            value={formData.zipCode}
                            onChange={(e) => {
                              handleChange(e);
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length !== 8) {
                                setShippingQuotes(null);
                                setSelectedShipping(null);
                              }
                            }}
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
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="number">Número</Label>
                          <Input
                            id="number"
                            name="number"
                            validate="integer"
                            value={formData.number}
                            onChange={handleChange}
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
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="state">Estado</Label>
                          <Input
                          id="state"
                          name="state"
                            validate="state"
                          value={formData.state}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">
                            Opções de frete
                          </span>
                        </div>
                        <div className="rounded-lg border border-border/80 p-3">
                          {shippingLoading && (
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />{" "}
                              Calculando frete...
                            </div>
                          )}
                          {!shippingLoading && !shippingQuotes && (
                            <div className="text-sm text-muted-foreground">
                              Informe o CEP para calcular o frete.
                            </div>
                          )}
                          {!shippingLoading &&
                            (shippingQuotes?.length ?? 0) === 0 && (
                              <div className="text-sm text-muted-foreground">
                                Nenhuma opção disponível para o CEP informado.
                              </div>
                            )}
                          {!shippingLoading &&
                            (shippingQuotes?.length ?? 0) > 0 && (
                              <div className="space-y-2">
                                {shippingQuotes!.map((q) => (
                                  <label
                                    key={q.service_code}
                                    className="flex items-center justify-between gap-3 rounded-md border p-3 cursor-pointer hover:border-primary/60"
                                  >
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="radio"
                                        name="shipping"
                                        className="h-4 w-4"
                                        checked={
                                          selectedShipping?.service_code ===
                                          q.service_code
                                        }
                                        onChange={() => setSelectedShipping(q)}
                                      />
                                      <div>
                                        <div className="text-sm font-medium text-foreground">
                                          {q.service_name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Prazo: {q.deadline_days} dia(s)
                                          útil(eis)
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-sm font-semibold text-foreground">
                                      R$ {q.price.toFixed(2)}
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          type="button"
                          variant="hero"
                          size="lg"
                          onClick={handleNextStep}
                        >
                          Continuar para pagamento
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="rounded-lg border border-border/80 p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {CARD_PAYMENT_LABEL}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {CARD_PAYMENT_DESCRIPTION}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          O pagamento é autorizado automaticamente após confirmar o
                          pedido.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cardName">Nome impresso no cartão</Label>
                          <Input
                            id="cardName"
                            name="cardName"
                            value={paymentData.cardName}
                            onChange={handlePaymentFieldChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardNumber">Número do cartão</Label>
                          <Input
                            id="cardNumber"
                            name="cardNumber"
                            inputMode="numeric"
                            value={paymentData.cardNumber}
                            onChange={handlePaymentFieldChange}
                            placeholder="0000 0000 0000 0000"
                          />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="cardExpiration">Validade</Label>
                            <Input
                              id="cardExpiration"
                              name="cardExpiration"
                              inputMode="numeric"
                              value={paymentData.cardExpiration}
                              onChange={handlePaymentFieldChange}
                              placeholder="MM/AA"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardCvv">CVV</Label>
                            <Input
                              id="cardCvv"
                              name="cardCvv"
                              inputMode="numeric"
                              value={paymentData.cardCvv}
                              onChange={handlePaymentFieldChange}
                              placeholder="000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="installments">Parcelas</Label>
                            <Select
                              value={paymentData.installments}
                              onValueChange={handleInstallmentsChange}
                            >
                              <SelectTrigger id="installments">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">À vista</SelectItem>
                                <SelectItem value="2">2x sem juros</SelectItem>
                                <SelectItem value="3">3x sem juros</SelectItem>
                                <SelectItem value="6">6x sem juros</SelectItem>
                                <SelectItem value="12">12x sem juros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePreviousStep}
                        >
                          Voltar
                        </Button>
                        <Button
                          type="button"
                          variant="hero"
                          size="lg"
                          onClick={handleNextStep}
                        >
                          Revisar pedido
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-3 rounded-lg border border-border/80 p-4">
                        <p className="text-sm font-semibold text-foreground">
                          Endereço de entrega
                        </p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{formData.name}</p>
                          <p>
                            {formData.street}, {formData.number}
                            {formData.complement && ` - ${formData.complement}`}
                          </p>
                          <p>
                            {formData.neighborhood}, {formData.city} -{" "}
                            {formData.state}
                          </p>
                          <p>CEP: {formData.zipCode}</p>
                          <p>Contato: {formData.phone}</p>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-lg border border-border/80 p-4">
                        <p className="text-sm font-semibold text-foreground">
                          Pagamento
                        </p>
                        <div className="space-y-3 rounded-lg border border-border/80 p-4">
                          <p className="text-sm font-semibold text-foreground">
                            Frete
                          </p>
                          {selectedShipping ? (
                            <div className="text-sm text-muted-foreground flex items-center justify-between">
                              <span>
                                {selectedShipping.service_name} ·{" "}
                                {selectedShipping.deadline_days} dia(s)
                                útil(eis)
                              </span>
                              <span className="text-foreground font-medium">
                                R$ {selectedShipping.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Nenhuma opção selecionada
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{CARD_PAYMENT_LABEL}</p>
                          <p>
                            Cartão final {getCardLastDigits(paymentData.cardNumber)} ·{" "}
                            {paymentData.installments === "1"
                              ? "À vista"
                              : `${paymentData.installments}x sem juros`}
                          </p>
                          <p>
                            A autorização acontece automaticamente e o pedido já
                            entra como confirmado.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
                        Revise as informações antes de confirmar. Você receberá
                        um email com todos os detalhes do pedido.
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePreviousStep}
                          disabled={loading}
                        >
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          className="min-w-[200px]"
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
                            "Confirmar pedido"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
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
                    <span className="text-foreground">
                      R$ {cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    {selectedShipping ? (
                      <span className="text-foreground">
                        R$ {shippingValue.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-foreground">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-5 text-sm">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Pagamento
                    </p>
                    <p className="font-medium text-foreground mt-1">
                      {CARD_PAYMENT_LABEL}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Cartão final {getCardLastDigits(paymentData.cardNumber)} ·{" "}
                      {paymentData.installments === "1"
                        ? "À vista"
                        : `${paymentData.installments}x sem juros`}
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-border pt-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Entrega
                    </p>
                    <p className="font-medium text-foreground mt-1">
                      {formData.city
                        ? `${formData.city} - ${formData.state}`
                        : "Informe o endereço"}
                    </p>
                    {formData.zipCode && (
                      <p className="text-muted-foreground mt-1">
                        CEP: {formData.zipCode}
                      </p>
                    )}
                    {selectedShipping && (
                      <p className="text-muted-foreground mt-1">
                        {selectedShipping.service_name} · R${" "}
                        {selectedShipping.price.toFixed(2)}
                      </p>
                    )}
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
