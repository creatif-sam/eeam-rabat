-- ── Unique constraint for presence upsert (onConflict) ───────────────────────
ALTER TABLE baptism_presence_records
  DROP CONSTRAINT IF EXISTS baptism_presence_records_unique_composite;
ALTER TABLE baptism_presence_records
  ADD CONSTRAINT baptism_presence_records_unique_composite
  UNIQUE (baptism_id, attendee_id, session_date);

-- ── Semantic columns on baptisms ──────────────────────────────────────────────
-- full_name is currently used as session title
ALTER TABLE baptisms ADD COLUMN IF NOT EXISTS title text;
UPDATE baptisms SET title = full_name WHERE title IS NULL;

-- temoignage is currently used as session description
ALTER TABLE baptisms ADD COLUMN IF NOT EXISTS description text;
UPDATE baptisms SET description = temoignage WHERE description IS NULL;

-- ── Performance indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_baptisms_parcours_type
  ON baptisms(parcours_type);

CREATE INDEX IF NOT EXISTS idx_baptisms_archived_at
  ON baptisms(archived_at);

CREATE INDEX IF NOT EXISTS idx_baptisms_date_demande
  ON baptisms(date_demande DESC);

CREATE INDEX IF NOT EXISTS idx_baptism_attendees_baptism_id
  ON baptism_attendees(baptism_id);

CREATE INDEX IF NOT EXISTS idx_baptism_presence_records_baptism_id
  ON baptism_presence_records(baptism_id);

CREATE INDEX IF NOT EXISTS idx_baptism_presence_records_composite
  ON baptism_presence_records(baptism_id, attendee_id, session_date);
