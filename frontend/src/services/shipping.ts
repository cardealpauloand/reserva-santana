import { apiFetch } from "@/lib/api";

export type ShippingItem = {
  quantity: number;
  weight_kg?: number;
  dimensions_cm?: { length: number; width: number; height: number; diameter?: number };
};

export type ShippingQuote = {
  service_code: string;
  service_name: string;
  price: number;
  deadline_days: number;
};

type ApiListResponse<T> = { data: T[] };

export async function getShippingQuotes(params: {
  destination_zip: string;
  items: ShippingItem[];
}): Promise<ShippingQuote[]> {
  const response = await apiFetch<ApiListResponse<ShippingQuote>>("shipping/quote", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return Array.isArray(response.data) ? response.data : [];
}
