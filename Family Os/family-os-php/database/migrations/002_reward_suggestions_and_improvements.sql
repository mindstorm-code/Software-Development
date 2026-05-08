-- ============================================================
-- 002 — Reward Suggestions + 1-Minute Improvements
-- Adds two parent-review queues:
--   * reward_suggestions  — kids propose rewards for the family list
--   * improvements        — daily photo + description; parent awards points
--                           and optionally converts into a recurring chore
-- ============================================================

-- ============================================================
-- REWARD SUGGESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reward_suggestions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id    UUID REFERENCES families(id) ON DELETE CASCADE,
  child_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  points_cost  INTEGER,
  status       TEXT DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  reward_id    UUID REFERENCES rewards(id) ON DELETE SET NULL,
  reviewed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_suggestions_family
  ON reward_suggestions(family_id);
CREATE INDEX IF NOT EXISTS idx_reward_suggestions_status
  ON reward_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_reward_suggestions_child
  ON reward_suggestions(child_id);

ALTER TABLE reward_suggestions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- IMPROVEMENTS (1-Minute Improvement)
-- ============================================================
CREATE TABLE IF NOT EXISTS improvements (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id          UUID REFERENCES families(id) ON DELETE CASCADE,
  child_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  photo_url          TEXT NOT NULL,
  description        TEXT NOT NULL,
  status             TEXT DEFAULT 'pending'
                       CHECK (status IN ('pending', 'approved', 'rejected')),
  points_awarded     INTEGER,
  converted_chore_id UUID REFERENCES chores(id) ON DELETE SET NULL,
  reviewed_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at        TIMESTAMPTZ,
  submitted_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_improvements_family
  ON improvements(family_id);
CREATE INDEX IF NOT EXISTS idx_improvements_child
  ON improvements(child_id);
CREATE INDEX IF NOT EXISTS idx_improvements_status
  ON improvements(status);

-- One submission per kid per calendar day
CREATE UNIQUE INDEX IF NOT EXISTS idx_improvements_one_per_day
  ON improvements (child_id, ((submitted_at AT TIME ZONE 'UTC')::date));

ALTER TABLE improvements ENABLE ROW LEVEL SECURITY;
