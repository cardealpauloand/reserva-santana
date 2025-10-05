export interface ProductCategory {
  id: number;
  slug: string;
  name: string;
  type?: string | null;
}

export interface ProductImage {
  id: number;
  url: string;
  alt?: string | null;
  isPrimary?: boolean;
  position?: number | null;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  origin?: string | null;
  type?: string | null;
  price: number;
  originalPrice?: number | null;
  rating?: number | null;
  volume?: string | null;
  alcohol?: string | null;
  temperature?: string | null;
  description?: string | null;
  stockQuantity: number;
  image?: string | null;
  primaryImage?: ProductImage | null;
  images?: ProductImage[];
  categories?: ProductCategory[];
}

export interface CategorySummary {
  id: number;
  slug: string;
  name: string;
  type?: string | null;
  productCount?: number | null;
}

export interface CategoryDetails extends CategorySummary {
  products: Product[];
}
