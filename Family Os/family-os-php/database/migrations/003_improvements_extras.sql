-- ============================================================
-- 003 — Improvements: 3/day cap, parent category, kid claim flow
-- ============================================================

-- Drop the strict 1-per-day unique index (replaced by app-level 3/day cap)
DROP INDEX IF EXISTS idx_improvements_one_per_day;

-- Parent picks a category at review time. Drives default points + whether
-- a chore template is created.
ALTER TABLE improvements
  ADD COLUMN IF NOT EXISTS category TEXT
  CHECK (category IN ('chore_improvement', 'space_improvement', 'nice_thing'));

-- Tracks when the kid tapped "Claim XP" (the celebration moment).
-- Points hit the ledger on parent approval; this flag just controls
-- whether we still show the Claim XP card on the dashboard.
ALTER TABLE improvements
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_improvements_unclaimed
  ON improvements(child_id, status)
  WHERE status = 'approved' AND claimed_at IS NULL;
