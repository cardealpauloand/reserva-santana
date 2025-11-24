import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Settings, ShoppingCart, Warehouse } from "lucide-react";

interface DashboardQuickLinksProps {
  onNavigate: (path: string) => void;
}

const links = [
  {
    title: "Produtos",
    description: "Criar, editar e gerenciar produtos",
    icon: Package,
    path: "/produtos",
    buttonLabel: "Gerenciar Produtos",
  },
  {
    title: "Estoque",
    description: "Controlar entradas e saídas",
    icon: Warehouse,
    path: "/estoque",
    buttonLabel: "Gerenciar Estoque",
  },
  {
    title: "Pedidos",
    description: "Acompanhar pedidos dos clientes",
    icon: ShoppingCart,
    path: "/admin/pedidos",
    buttonLabel: "Ver Pedidos",
  },
] as const;

export const DashboardQuickLinks = ({ onNavigate }: DashboardQuickLinksProps) => (
  <div className="grid gap-4 md:grid-cols-3">
    {links.map(({ title, description, icon: Icon, path, buttonLabel }) => (
      <Card
        key={title}
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => onNavigate(path)}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            {buttonLabel}
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
);
