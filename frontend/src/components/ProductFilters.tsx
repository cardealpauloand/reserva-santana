import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  PriceBounds,
  ProductFiltersState,
} from "@/hooks/useProductFilters";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

export interface ProductFiltersProps {
  filters: ProductFiltersState;
  bounds: PriceBounds;
  onFiltersChange: (changes: Partial<ProductFiltersState>) => void;
  onReset: () => void;
  isResetDisabled?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ProductFilters = ({
  filters,
  bounds,
  onFiltersChange,
  onReset,
  isResetDisabled = false,
  disabled = false,
  className,
}: ProductFiltersProps) => {
  const isSliderDisabled = bounds.max <= bounds.min;
  const sliderMax = useMemo(() => {
    if (bounds.max > bounds.min) {
      return bounds.max;
    }
    return bounds.min + 1;
  }, [bounds.max, bounds.min]);

  const formatCurrency = (value: number) =>
    currencyFormatter.format(Number.isFinite(value) ? value : 0);

  const handlePriceChange = (value: number[]) => {
    if (disabled || isSliderDisabled) {
      return;
    }
    const [min, max] = value;
    onFiltersChange({ priceRange: [min, max] as ProductFiltersState["priceRange"] });
  };

  return (
    <Card
      className={cn(
        "border border-border/40 bg-card/60 shadow-none backdrop-blur-sm",
        disabled && "opacity-60",
        className
      )}
    >
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6">
        <div className="flex flex-1 flex-wrap gap-4">
          <div className="min-w-[160px] space-y-1">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              Ordenar por
            </span>
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                onFiltersChange({ sortBy: value as ProductFiltersState["sortBy"] })
              }
              disabled={disabled}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevância</SelectItem>
                <SelectItem value="priceAsc">Menor preço</SelectItem>
                <SelectItem value="priceDesc">Maior preço</SelectItem>
                <SelectItem value="nameAsc">Nome A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="hidden h-auto self-stretch md:block" />

          <div className="flex min-w-[200px] flex-1 flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-medium uppercase text-muted-foreground">
              <span>Faixa de preço</span>
              <span>
                {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
              </span>
            </div>
            <Slider
              min={bounds.min}
              max={sliderMax}
              value={filters.priceRange}
              step={1}
              onValueChange={handlePriceChange}
              disabled={disabled || isSliderDisabled}
            />
          </div>

          <Separator orientation="vertical" className="hidden h-auto self-stretch md:block" />

          <div className="flex min-w-[180px] items-center justify-between rounded-md border border-border/50 px-3 py-2">
            <div>
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Disponibilidade
              </span>
              <p className="text-sm font-medium">
                {filters.availability === "inStock"
                  ? "Somente disponíveis"
                  : "Todos os produtos"}
              </p>
            </div>
            <Switch
              checked={filters.availability === "inStock"}
              onCheckedChange={(checked) =>
                onFiltersChange({ availability: checked ? "inStock" : "all" })
              }
              disabled={disabled}
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={disabled || isResetDisabled}
        >
          Limpar filtros
        </Button>
      </CardContent>
    </Card>
  );
};
