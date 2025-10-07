import { useState } from "react";
import { Filter, Loader2 } from "lucide-react";

import {
  ProductFilters,
  type ProductFiltersProps,
} from "@/components/ProductFilters";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ProductFiltersLauncherProps = Omit<
  ProductFiltersProps,
  "className" | "showResetButton"
> & {
  activeFiltersCount: number;
  areFiltersDefault: boolean;
  triggerLabel?: string;
  title?: string;
  description?: string;
  filtersClassName?: string;
  className?: string;
};

export const ProductFiltersLauncher = ({
  activeFiltersCount,
  areFiltersDefault,
  triggerLabel = "Filtros",
  title = "Filtrar produtos",
  description,
  filtersClassName,
  className,
  isResetDisabled = false,
  disabled = false,
  onReset,
  ...filtersProps
}: ProductFiltersLauncherProps) => {
  const [open, setOpen] = useState(false);
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className={cn("flex items-center", className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2 rounded-full px-4 py-2"
            aria-expanded={open}
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            <span className="font-medium">{triggerLabel}</span>
            {disabled ? (
              <Loader2
                className="h-4 w-4 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            ) : hasActiveFilters ? (
              <span className="inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-primary-foreground/90 px-2 text-xs font-semibold text-primary">
                {activeFiltersCount}
              </span>
            ) : null}
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="space-y-1">
            <SheetTitle>{title}</SheetTitle>
            {description ? (
              <SheetDescription>{description}</SheetDescription>
            ) : null}
          </SheetHeader>

          <Separator className="my-4" />

          <ProductFilters
            {...filtersProps}
            onReset={onReset}
            isResetDisabled={isResetDisabled}
            disabled={disabled}
            showResetButton={false}
            className={cn(
              "border-none bg-transparent p-0 shadow-none",
              filtersClassName
            )}
          />

          <SheetFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              disabled={disabled || isResetDisabled || areFiltersDefault}
              className="w-full sm:w-auto"
            >
              Limpar filtros
            </Button>
            <SheetClose asChild>
              <Button type="button" className="w-full sm:w-auto">
                Ver produtos
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
