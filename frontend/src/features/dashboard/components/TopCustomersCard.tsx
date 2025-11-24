import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardTopCustomer } from "@/services/admin/dashboard";
import { currencyFormatter } from "../utils";

interface TopCustomersCardProps {
  customers: DashboardTopCustomer[];
  isComparisonView: boolean;
}

export const TopCustomersCard = ({ customers, isComparisonView }: TopCustomersCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Clientes em Destaque</CardTitle>
      <CardDescription>Clientes que mais geraram receita no período selecionado</CardDescription>
    </CardHeader>
    <CardContent>
      {isComparisonView ? (
        <p className="text-sm text-muted-foreground">Os destaques são exibidos apenas para o período principal.</p>
      ) : customers.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum cliente realizou compras no período selecionado.</p>
      ) : (
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <div key={customer.userId ?? index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{customer.name}</p>
                  {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-semibold text-foreground">{currencyFormatter.format(customer.totalSpent)}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.orderCount} {customer.orderCount === 1 ? "pedido" : "pedidos"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
