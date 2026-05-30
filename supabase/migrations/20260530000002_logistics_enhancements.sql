-- =============================================================
-- Logistics & Purchases — schema enhancements
-- =============================================================

SET search_path = public;

-- -----------------------------------------------------------
-- 1. logistics_items: low-stock threshold + soft delete
-- -----------------------------------------------------------
ALTER TABLE public.logistics_items
  ADD COLUMN IF NOT EXISTS min_quantity INTEGER NOT NULL DEFAULT 0
    CHECK (min_quantity >= 0),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Replace SELECT policy to hide soft-deleted rows
DROP POLICY IF EXISTS "logistics_items_select" ON public.logistics_items;
CREATE POLICY "logistics_items_select"
  ON public.logistics_items FOR SELECT
  TO authenticated USING (deleted_at IS NULL);

-- -----------------------------------------------------------
-- 2. purchases: approval workflow + inventory link + soft delete
-- -----------------------------------------------------------
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS item_id UUID
    REFERENCES public.logistics_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Positive-amount constraint (nulls allowed = amount not recorded)
ALTER TABLE public.purchases
  ADD CONSTRAINT IF NOT EXISTS purchases_amount_positive
    CHECK (amount IS NULL OR amount > 0);

-- Replace SELECT policy to hide soft-deleted rows
DROP POLICY IF EXISTS "purchases_select" ON public.purchases;
CREATE POLICY "purchases_select"
  ON public.purchases FOR SELECT
  TO authenticated USING (deleted_at IS NULL);

-- -----------------------------------------------------------
-- 3. stock_movements  (audit trail for quantity changes)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID          NOT NULL
                            REFERENCES public.logistics_items(id) ON DELETE CASCADE,
  delta       INTEGER       NOT NULL,      -- positive = stock in, negative = stock out
  reason      TEXT,
  changed_by  UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_movements_select"
  ON public.stock_movements FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "stock_movements_insert"
  ON public.stock_movements FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
  );

-- -----------------------------------------------------------
-- 4. loans  (equipment lending tracker)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.loans (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID          NOT NULL
                                REFERENCES public.logistics_items(id) ON DELETE CASCADE,
  lent_to         TEXT          NOT NULL,
  quantity_lent   INTEGER       NOT NULL DEFAULT 1 CHECK (quantity_lent > 0),
  lent_at         DATE          NOT NULL,
  expected_return DATE,
  returned_at     DATE,
  notes           TEXT,
  created_by      UUID          REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loans_select"
  ON public.loans FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "loans_insert"
  ON public.loans FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
  );

CREATE POLICY "loans_update"
  ON public.loans FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
  );

CREATE POLICY "loans_delete"
  ON public.loans FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
  );
