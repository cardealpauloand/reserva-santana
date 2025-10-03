import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartItem } from "@/components/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const Cart = () => {
  const { items, cartTotal, clearCart } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
          Meu Carrinho
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/50" />
            <h2 className="text-2xl font-semibold text-foreground">
              Seu carrinho está vazio
            </h2>
            <p className="text-muted-foreground mb-4">
              Adicione produtos incríveis ao seu carrinho
            </p>
            <Button asChild variant="hero" size="lg">
              <Link to="/">Continuar Comprando</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos ({items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
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
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frete</span>
                      <span className="text-green-600 font-medium">Grátis</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="text-lg font-semibold text-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        R$ {cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" variant="hero" asChild>
                    <Link to="/checkout">Finalizar Compra</Link>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link to="/">Continuar Comprando</Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={clearCart}
                  >
                    Limpar Carrinho
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
