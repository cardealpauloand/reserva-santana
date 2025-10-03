import {
  ShoppingCart,
  Search,
  Wine,
  User,
  LogOut,
  ChevronDown,
  Crown,
  Gift,
  LayoutDashboard,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";

const menuCategories = {
  vinhos: {
    name: "Vinhos",
    icon: Wine,
    items: [
      {
        name: "Tintos",
        href: "/categoria/tintos",
        description: "Explore nossa seleção de vinhos tintos",
      },
      {
        name: "Brancos",
        href: "/categoria/brancos",
        description: "Descubra vinhos brancos refrescantes",
      },
      {
        name: "Rosés",
        href: "/categoria/roses",
        description: "Vinhos rosés delicados e aromáticos",
      },
      {
        name: "Espumantes",
        href: "/categoria/espumantes",
        description: "Celebre com nossos espumantes",
      },
    ],
  },
  premium: {
    name: "Premium",
    icon: Crown,
    items: [
      {
        name: "Vinhos Reserva",
        href: "/categoria/premium-reserva",
        description: "Seleção exclusiva de reservas",
      },
      {
        name: "Vinhos Raros",
        href: "/categoria/premium-raros",
        description: "Edições limitadas e raras",
      },
      {
        name: "Gran Reserva",
        href: "/categoria/premium-gran-reserva",
        description: "O melhor da nossa coleção",
      },
      {
        name: "Importados Premium",
        href: "/categoria/premium-importados",
        description: "Vinhos importados selecionados",
      },
    ],
  },
  kits: {
    name: "Kits",
    icon: Gift,
    items: [
      {
        name: "Kit Degustação",
        href: "/categoria/kit-degustacao",
        description: "Experimente nossa seleção",
      },
      {
        name: "Kit Presente",
        href: "/categoria/kit-presente",
        description: "Presentes especiais para amantes de vinho",
      },
      {
        name: "Kit Harmonização",
        href: "/categoria/kit-harmonizacao",
        description: "Vinhos para harmonizar",
      },
      {
        name: "Kit Iniciante",
        href: "/categoria/kit-iniciante",
        description: "Comece sua jornada no mundo dos vinhos",
      },
    ],
  },
};

export const Header = () => {
  const { cartCount } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<
    keyof typeof menuCategories | null
  >(null);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta.",
    });
    navigate("/");
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 group/header">
      <div className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} width={64} height={64} alt="WineStore" />
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {Object.entries(menuCategories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <button
                  key={key}
                  onMouseEnter={() =>
                    setActiveMenu(key as keyof typeof menuCategories)
                  }
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      activeMenu === key ? "rotate-180" : ""
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex items-center gap-2 relative"
            >
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar vinhos..."
                className="pl-9 w-[200px] xl:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {isAdmin && (
              <Button variant="ghost" size="icon" asChild title="Dashboard">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {user ? (
              <>
                <Button variant="ghost" size="icon" asChild title="Meu Perfil">
                  <Link to="/perfil">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="icon" asChild title="Entrar">
                <Link to="/auth">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/carrinho">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-xs font-bold flex items-center justify-center text-secondary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mega Menu - Posicionado fixo abaixo do navbar */}
      <div
        className={`fixed left-0 right-0 top-16 transition-all duration-200 z-40 ${
          activeMenu ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="bg-popover border-b border-border shadow-lg">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 p-8 grid-cols-2 lg:grid-cols-4">
              {activeMenu &&
                menuCategories[activeMenu].items.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block select-none space-y-2 rounded-md p-4 leading-none no-underline outline-none transition-colors hover:bg-accent group"
                  >
                    <div className="text-base font-semibold leading-none group-hover:text-primary transition-colors">
                      {item.name}
                    </div>
                    <p className="text-sm leading-snug text-muted-foreground">
                      {item.description}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
