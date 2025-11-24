import { format, startOfMonth, startOfYear, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";

export const numberFormatter = new Intl.NumberFormat("pt-BR");
export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});
export const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

export const formatIsoDateToBr = (value: string) => {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${day}/${month}/${year}`;
};

export const formatIsoDateToBrShort = (value: string) => {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${day}/${month}`;
};

export const formatIsoMonthYearShort = (value: string) => {
  const [year, month] = value.split("-");
  if (!year || !month) {
    return value;
  }
  return `${month}`;
};

export const formatUnits = (value: number) => {
  const formatted = numberFormatter.format(value);
  return `${formatted} unidade${value === 1 ? "" : "s"}`;
};

export const formatByType = (value: number, type: "number" | "currency") =>
  type === "currency"
    ? currencyFormatter.format(value)
    : numberFormatter.format(value);

export const buildCurrentMonthRange = (): DateRange => {
  const today = new Date();
  return {
    from: startOfMonth(today),
    to: today,
  };
};

export const buildCurrentYearRange = (): DateRange => {
  const today = new Date();
  return {
    from: startOfYear(today),
    to: today,
  };
};

export const buildPresetRange = (
  preset: "last7" | "year",
  target: "primary" | "comparison",
  primarySetter: (range: DateRange | undefined) => void,
  comparisonSetter: (range: DateRange | undefined) => void
) => {
  if (preset === "last7") {
    const to = new Date();
    const from = subDays(to, 6);
    const range: DateRange = { from, to };
    (target === "primary" ? primarySetter : comparisonSetter)(range);
    return;
  }

  const currentYearRange = buildCurrentYearRange();
  (target === "primary" ? primarySetter : comparisonSetter)(currentYearRange);
};

export const resetToCurrentMonth = (
  target: "primary" | "comparison",
  primarySetter: (range: DateRange | undefined) => void,
  comparisonSetter: (range: DateRange | undefined) => void
) => {
  const monthRange = buildCurrentMonthRange();
  (target === "primary" ? primarySetter : comparisonSetter)(monthRange);
};

export const formatRangeSelectionLabel = (range?: DateRange) => {
  if (!range?.from || !range?.to) {
    return "Selecione um período";
  }

  return `${format(range.from, "dd/MM/yyyy")} - ${format(range.to, "dd/MM/yyyy")}`;
};

export const formatComparisonSelectionLabel = (range?: DateRange) => {
  if (!range?.from || !range?.to) {
    return "Automático";
  }

  return `${format(range.from, "dd/MM/yyyy")} - ${format(range.to, "dd/MM/yyyy")}`;
};

export const buildRangeLabel = (
  grouping: "day" | "week" | "month" | string,
  startIso: string,
  endIso: string
) => {
  if (grouping === "month") {
    const startLabel = formatIsoMonthYearShort(startIso);
    const endLabel = formatIsoMonthYearShort(endIso);
    return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
  }

  const startShort = formatIsoDateToBrShort(startIso);
  const endShort = formatIsoDateToBrShort(endIso);
  return startShort === endShort ? startShort : `${startShort} - ${endShort}`;
};

export const groupingDescriptions: Record<string, string> = {
  day: "dia",
  week: "semana",
  month: "mês",
};
