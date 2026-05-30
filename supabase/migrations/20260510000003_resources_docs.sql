-- ================================================================
-- Migration: Resources & Documents Feature
-- Date: 2026-05-10
-- Improvements applied 2026-05-30:
--   - Hardened search_path on SECURITY DEFINER functions (OWASP)
--   - Storage bucket set to public=false (auth required for downloads)
--   - ON CONFLICT DO UPDATE for bucket settings
--   - Storage UPDATE policy gains WITH CHECK
--   - increment_download_count RPC so members can track downloads
--     without needing UPDATE permission on the resources table
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Tables
-- ----------------------------------------------------------------

CREATE TABLE public.resource_categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  description text,
  color       text        NOT NULL DEFAULT 'blue',
  created_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.resources (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    uuid        REFERENCES public.resource_categories(id) ON DELETE SET NULL,
  title          text        NOT NULL,
  description    text,
  file_path      text        NOT NULL,   -- path inside the "documents" storage bucket
  file_name      text        NOT NULL,   -- original filename shown to users
  file_size      bigint,                 -- bytes
  file_type      text,                   -- MIME type
  download_count integer     NOT NULL DEFAULT 0,
  created_by     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2. Indexes
-- ----------------------------------------------------------------

CREATE INDEX idx_resources_category_id ON public.resources(category_id);
CREATE INDEX idx_resources_created_at  ON public.resources(created_at DESC);

-- ----------------------------------------------------------------
-- 3. updated_at trigger
-- FIX: added SET search_path to prevent search-path injection on
--      this SECURITY-sensitive trigger function.
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_resource_categories_updated_at
  BEFORE UPDATE ON public.resource_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------
-- 4. Enable Row Level Security
-- ----------------------------------------------------------------

ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources            ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- 5. Role helper
-- FIX: added SET search_path = public to the SECURITY DEFINER
--      function to prevent search-path injection attacks.
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ----------------------------------------------------------------
-- 6. RLS Policies — resource_categories
-- ----------------------------------------------------------------

-- All authenticated members can see categories
CREATE POLICY "resource_categories_select"
  ON public.resource_categories
  FOR SELECT TO authenticated
  USING (true);

-- Only admin / pastor can create categories
CREATE POLICY "resource_categories_insert"
  ON public.resource_categories
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'pastor'));

-- Only admin / pastor can update categories
CREATE POLICY "resource_categories_update"
  ON public.resource_categories
  FOR UPDATE TO authenticated
  USING     (public.get_my_role() IN ('admin', 'pastor'))
  WITH CHECK (public.get_my_role() IN ('admin', 'pastor'));

-- Only admin / pastor can delete categories
CREATE POLICY "resource_categories_delete"
  ON public.resource_categories
  FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'pastor'));

-- ----------------------------------------------------------------
-- 7. RLS Policies — resources
-- ----------------------------------------------------------------

-- All authenticated members can view and download documents
CREATE POLICY "resources_select"
  ON public.resources
  FOR SELECT TO authenticated
  USING (true);

-- Only admin / pastor can upload / create document records
CREATE POLICY "resources_insert"
  ON public.resources
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'pastor'));

-- Only admin / pastor can update document metadata.
-- NOTE: download_count increments are handled by the
--       increment_download_count() RPC below (SECURITY DEFINER),
--       so regular members never need UPDATE on this table.
CREATE POLICY "resources_update"
  ON public.resources
  FOR UPDATE TO authenticated
  USING     (public.get_my_role() IN ('admin', 'pastor'))
  WITH CHECK (public.get_my_role() IN ('admin', 'pastor'));

-- Only admin / pastor can delete document records
CREATE POLICY "resources_delete"
  ON public.resources
  FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('admin', 'pastor'));

-- ----------------------------------------------------------------
-- 8. RPC: increment_download_count
-- Any authenticated member can call this to bump the counter
-- without needing UPDATE permission on the resources table.
-- SECURITY DEFINER + fixed search_path keep this safe.
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.increment_download_count(resource_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
  UPDATE public.resources
  SET download_count = download_count + 1
  WHERE id = resource_id;
$$;

-- Grant execute to all authenticated users
GRANT EXECUTE ON FUNCTION public.increment_download_count(uuid) TO authenticated;

-- ----------------------------------------------------------------
-- 9. Storage bucket "documents"
-- FIX 1: public = false  — files require a valid auth session;
--         the old public=true contradicted the authenticated-only
--         SELECT storage policy (public buckets bypass RLS).
-- FIX 2: ON CONFLICT DO UPDATE — re-running the migration will
--         keep file_size_limit and allowed_mime_types in sync
--         instead of silently ignoring them.
-- ----------------------------------------------------------------

INSERT INTO storage.buckets (
  id,
  name,
  public,             -- false: Supabase enforces RLS on every request
  file_size_limit,    -- 50 MB per file
  allowed_mime_types
)
VALUES (
  'documents',
  'documents',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------
-- 10. Storage policies — bucket "documents"
-- ----------------------------------------------------------------

-- SELECT (read / download): all authenticated users
-- Now meaningful because the bucket is NOT public.
CREATE POLICY "documents_storage_select"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

-- INSERT (upload): admin and pastor only
CREATE POLICY "documents_storage_insert"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND public.get_my_role() IN ('admin', 'pastor')
  );

-- UPDATE: admin and pastor only
-- FIX: added WITH CHECK so the new-row state is also validated,
--      preventing an object from being moved to a different bucket.
CREATE POLICY "documents_storage_update"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.get_my_role() IN ('admin', 'pastor')
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND public.get_my_role() IN ('admin', 'pastor')
  );

-- DELETE: admin and pastor only
CREATE POLICY "documents_storage_delete"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.get_my_role() IN ('admin', 'pastor')
  );
