-- ============================================================
-- Allow the public (anonymous + authenticated) to read events
-- so the homepage calendar and events section work without login.
-- ============================================================

-- Enable RLS on events if it isn't already (safe to run multiple times)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop the policy first in case it exists, then recreate it
DROP POLICY IF EXISTS "Public can view events" ON public.events;

CREATE POLICY "Public can view events"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================
-- If your "programmes" are stored as formations, enable those too
-- ============================================================
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view formations" ON public.formations;

CREATE POLICY "Public can view formations"
  ON public.formations
  FOR SELECT
  TO anon, authenticated
  USING (true);
