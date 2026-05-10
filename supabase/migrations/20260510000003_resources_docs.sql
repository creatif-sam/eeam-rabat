-- ================================================================
-- Migration: Resources & Documents Feature
-- Date: 2026-05-10
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
-- 3. updated_at triggers
-- ----------------------------------------------------------------

-- Reuse the function if it already exists, otherwise create it
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
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
-- 5. Helper: read the current user's role from profiles
--    (safe to call in RLS policies; marked STABLE so Postgres can
--     inline it without a full function call per row)
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
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

-- Only admin / pastor can update document records
--  (e.g., increment download_count is done client-side and
--   still requires the user to pass this policy)
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
-- 8. Storage bucket "documents"
-- ----------------------------------------------------------------

INSERT INTO storage.buckets (
  id,
  name,
  public,             -- URLs are public (no signed-URL needed for download)
  file_size_limit,    -- 50 MB per file
  allowed_mime_types
)
VALUES (
  'documents',
  'documents',
  true,
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
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------
-- 9. Storage policies — bucket "documents"
-- ----------------------------------------------------------------

-- SELECT (read / download): all authenticated users
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
CREATE POLICY "documents_storage_update"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
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
