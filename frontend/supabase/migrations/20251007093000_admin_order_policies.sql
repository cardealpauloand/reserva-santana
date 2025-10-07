-- Allow administrators to manage customer orders
CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any order"
  ON public.orders
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all order items"
  ON public.order_items
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
