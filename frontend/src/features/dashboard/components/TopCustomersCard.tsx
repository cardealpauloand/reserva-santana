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
  comparisonCustomers: DashboardTopCustomer[];
  isComparisonView: boolean;
  hasComparisonRange: boolean;
  primaryLabel: string;
  comparisonLabel: string;
  showActiveLabel?: boolean;
}

export const TopCustomersCard = ({
  customers,
  comparisonCustomers,
  isComparisonView,
  hasComparisonRange,
  primaryLabel,
  comparisonLabel,
  showActiveLabel = true,
}: TopCustomersCardProps) => {
  const activeCustomers = isComparisonView ? comparisonCustomers : customers;
  const activeLabel = isComparisonView
    ? comparisonLabel || "Período comparativo"
    : primaryLabel || "Período principal";
  const emptyMessage = isComparisonView
    ? hasComparisonRange
      ? "Nenhum cliente realizou compras no período comparativo."
      : "Selecione um período comparativo para visualizar os clientes."
    : "Nenhum cliente realizou compras no período selecionado.";

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="space-y-1.5">
          <CardTitle>Clientes em Destaque</CardTitle>
          <CardDescription>Clientes que mais geraram receita no período selecionado</CardDescription>
        </div>
        {showActiveLabel && (
          <span className="inline-flex items-center rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            {activeLabel}
          </span>
        )}
      </CardHeader>
      <CardContent>
        {activeCustomers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="space-y-4">
            {activeCustomers.map((customer, index) => (
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
};
