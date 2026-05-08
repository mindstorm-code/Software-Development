-- ============================================================
-- 005 — Open Bounties
-- If a chore isn't done by end of day, it can be released as an
-- "open bounty" that any kid in the family can claim. Original
-- assignee loses out; whoever claims it earns the points.
-- Opt-in per chore template.
-- ============================================================

-- Per-chore toggle on the template.
ALTER TABLE chores
  ADD COLUMN IF NOT EXISTS release_unclaimed BOOLEAN DEFAULT FALSE;

-- When the daily release ran (NULL = still owned by original assignee).
ALTER TABLE chore_instances
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

-- Track who originally owned the chore before it was released, so
-- we can show "Sibling missed it!" framing on the child UI.
ALTER TABLE chore_instances
  ADD COLUMN IF NOT EXISTS original_assignee UUID REFERENCES users(id) ON DELETE SET NULL;

-- Fast lookup of open bounties per family.
CREATE INDEX IF NOT EXISTS idx_instances_open_bounties
  ON chore_instances(family_id)
  WHERE released_at IS NOT NULL AND assigned_to IS NULL AND status = 'pending';
