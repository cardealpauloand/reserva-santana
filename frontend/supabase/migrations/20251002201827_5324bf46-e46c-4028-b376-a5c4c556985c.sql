-- Create products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  origin text NOT NULL,
  type text NOT NULL,
  price numeric NOT NULL,
  rating numeric NOT NULL DEFAULT 0,
  image text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create stock movements table for tracking inventory changes
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL,
  movement_type text NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'ajuste')),
  reason text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS policies for products
CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update products"
ON public.products
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete products"
ON public.products
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for stock movements
CREATE POLICY "Only admins can view stock movements"
ON public.stock_movements
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert stock movements"
ON public.stock_movements
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to update products updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Function to update product stock automatically
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type = 'entrada' OR NEW.movement_type = 'ajuste' THEN
    UPDATE public.products
    SET stock_quantity = stock_quantity + NEW.quantity
    WHERE id = NEW.product_id;
  ELSIF NEW.movement_type = 'saida' THEN
    UPDATE public.products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update stock when movement is inserted
CREATE TRIGGER trigger_update_product_stock
AFTER INSERT ON public.stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();