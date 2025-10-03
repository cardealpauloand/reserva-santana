-- Create price audit table to track price changes
CREATE TABLE public.price_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  old_price NUMERIC NOT NULL,
  new_price NUMERIC NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT
);

-- Enable RLS
ALTER TABLE public.price_audit ENABLE ROW LEVEL SECURITY;

-- Create policies for price_audit
CREATE POLICY "Only admins can view price audit"
ON public.price_audit
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert price audit"
ON public.price_audit
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to automatically log price changes
CREATE OR REPLACE FUNCTION public.log_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.price IS DISTINCT FROM NEW.price) THEN
    INSERT INTO public.price_audit (product_id, old_price, new_price, changed_by, reason)
    VALUES (NEW.id, OLD.price, NEW.price, auth.uid(), 'Price updated via admin panel');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER price_change_audit
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.log_price_change();