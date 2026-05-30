-- =============================================================
-- Logistics & Purchases module
-- =============================================================

SET search_path = public;

-- -----------------------------------------------------------
-- 1. logistics_items  (church equipment inventory)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.logistics_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  category    text        NOT NULL DEFAULT 'Autre',
  quantity    integer     NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  condition   text        NOT NULL DEFAULT 'bon'
                          CHECK (condition IN ('bon', 'moyen', 'mauvais')),
  location    text,
  notes       text,
  created_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.logistics_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logistics_items_select"
  ON public.logistics_items FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "logistics_items_insert"
  ON public.logistics_items FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
  );

CREATE POLICY "logistics_items_update"
  ON public.logistics_items FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
  );

CREATE POLICY "logistics_items_delete"
  ON public.logistics_items FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
  );

-- auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_logistics_items_updated_at
  BEFORE UPDATE ON public.logistics_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------
-- 2. purchases  (what was bought, by whom, receipt photo)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchases (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name     text          NOT NULL,
  amount        numeric(10,2),
  currency      text          NOT NULL DEFAULT 'MAD',
  bought_by     text          NOT NULL,
  purchase_date date          NOT NULL,
  category      text          NOT NULL DEFAULT 'Autre',
  receipt_url   text,                      -- path in storage bucket "receipts"
  notes         text,
  created_by    uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases_select"
  ON public.purchases FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "purchases_insert"
  ON public.purchases FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid())
    IN ('admin', 'pastor', 'treasurer')
  );

CREATE POLICY "purchases_update"
  ON public.purchases FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid())
    IN ('admin', 'pastor', 'treasurer')
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid())
    IN ('admin', 'pastor', 'treasurer')
  );

CREATE POLICY "purchases_delete"
  ON public.purchases FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid())
    IN ('admin', 'pastor', 'treasurer')
  );

-- -----------------------------------------------------------
-- 3. Storage bucket for receipt photos
-- -----------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "receipts_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "receipts_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts');

CREATE POLICY "receipts_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'receipts');
