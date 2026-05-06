-- ============================================================
-- Clean profiles RLS policies and create working ones
-- Uses a SECURITY DEFINER helper to avoid infinite recursion
-- ============================================================

-- 1. Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies on profiles
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END;
$$;

-- 3. Helper function: returns the role of the currently authenticated user
--    SECURITY DEFINER + search_path bypass RLS so no recursion
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- 4. SELECT policies
-- ============================================================

-- Every authenticated user can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins and pastors can read every profile
CREATE POLICY "profiles_select_admin"
  ON public.profiles
  FOR SELECT
  USING (public.my_role() IN ('admin', 'pastor'));

-- ============================================================
-- 5. INSERT policy
-- ============================================================

-- Users can only create their own profile row
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 6. UPDATE policies
-- ============================================================

-- Users can update their own profile (name, phone, avatar, etc.)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (role changes, approval, etc.)
CREATE POLICY "profiles_update_admin"
  ON public.profiles
  FOR UPDATE
  USING (public.my_role() = 'admin');

-- ============================================================
-- 7. DELETE policy
-- ============================================================

-- Only admins can delete profiles
CREATE POLICY "profiles_delete_admin"
  ON public.profiles
  FOR DELETE
  USING (public.my_role() = 'admin');
