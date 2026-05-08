-- ============================================================
-- FAMILY OS — SUPABASE POSTGRESQL SCHEMA
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- FAMILIES
-- ============================================================
CREATE TABLE families (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  weekly_budget NUMERIC(10,2) DEFAULT 50.00,
  point_rate    NUMERIC(10,4) DEFAULT 0.01,  -- USD per point
  house_score   INTEGER DEFAULT 100,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS (parents + children)
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id     UUID REFERENCES families(id) ON DELETE CASCADE,
  auth_id       UUID UNIQUE,                  -- Supabase auth.users.id (null for children)
  role          TEXT NOT NULL CHECK (role IN ('parent', 'child')),
  display_name  TEXT NOT NULL,
  email         TEXT,
  pin_hash      TEXT,                          -- bcrypt hash of 4-digit PIN (children)
  avatar_url    TEXT,
  level         INTEGER DEFAULT 1,
  streak        INTEGER DEFAULT 0,
  last_active   DATE,
  rating        NUMERIC(3,1) DEFAULT 5.0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHORE TEMPLATES
-- ============================================================
CREATE TABLE chores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id       UUID REFERENCES families(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT DEFAULT 'general',     -- cleaning, cooking, yard, laundry, etc.
  difficulty      TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points          INTEGER NOT NULL DEFAULT 10,
  proof_type      TEXT DEFAULT 'photo' CHECK (proof_type IN ('none', 'checklist', 'photo', 'photo_checklist')),
  assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,  -- null = any child
  recurrence      TEXT DEFAULT 'daily' CHECK (recurrence IN ('daily', 'weekly', 'monthly', 'yearly', 'once')),
  recurrence_days INTEGER[],                  -- day_of_week for weekly (0=Sun..6=Sat)
  recurrence_date INTEGER,                    -- day of month for monthly
  recurrence_month INTEGER,                   -- month for yearly
  checklist       JSONB DEFAULT '[]',          -- [{id, text, required}]
  game_plan       JSONB DEFAULT '[]',          -- [{step, title, description, image_url}]
  before_photo_url TEXT,
  after_photo_url  TEXT,
  video_url        TEXT,
  ai_verify       BOOLEAN DEFAULT FALSE,
  org_type        TEXT,                        -- color, size, category, safety (for visual aids)
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHORE INSTANCES (daily generated from templates)
-- ============================================================
CREATE TABLE chore_instances (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chore_id    UUID REFERENCES chores(id) ON DELETE CASCADE,
  family_id   UUID REFERENCES families(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE CASCADE,
  due_date    DATE NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'skipped')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chore_id, assigned_to, due_date)
);

-- ============================================================
-- SUBMISSIONS (chore completion evidence)
-- ============================================================
CREATE TABLE submissions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id      UUID REFERENCES chore_instances(id) ON DELETE CASCADE,
  chore_id         UUID REFERENCES chores(id) ON DELETE CASCADE,
  child_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  photo_urls       TEXT[] DEFAULT '{}',
  checklist_done   JSONB DEFAULT '[]',         -- [{id, checked}]
  duration_seconds INTEGER,
  notes            TEXT,
  ai_result        JSONB,                      -- {status, confidence, reasoning}
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  points_awarded   INTEGER,
  reviewed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ,
  submitted_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- POINTS LEDGER (immutable audit trail)
-- ============================================================
CREATE TABLE points_ledger (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id   UUID REFERENCES families(id) ON DELETE CASCADE,
  child_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  delta       INTEGER NOT NULL,               -- positive = earned, negative = spent
  reason      TEXT NOT NULL,                  -- 'chore_approved', 'reward_redeemed', etc.
  ref_id      UUID,                           -- submission_id or redemption_id
  ref_type    TEXT,                           -- 'submission', 'reward_redemption', 'coupon_redemption', 'manual'
  note        TEXT,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REWARDS
-- ============================================================
CREATE TABLE rewards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id   UUID REFERENCES families(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT DEFAULT 'experience',       -- experience, item, screen_time, outing, cash
  points_cost INTEGER NOT NULL,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REWARD REDEMPTIONS
-- ============================================================
CREATE TABLE reward_redemptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reward_id   UUID REFERENCES rewards(id) ON DELETE CASCADE,
  child_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id   UUID REFERENCES families(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE coupons (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id        UUID REFERENCES families(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  usd_value        NUMERIC(10,2) NOT NULL,
  points_cost      INTEGER NOT NULL,
  image_url        TEXT,
  assigned_to      UUID REFERENCES users(id) ON DELETE SET NULL,  -- null = all children
  is_repeatable    BOOLEAN DEFAULT FALSE,
  daily_limit      INTEGER DEFAULT 1,
  requires_approval BOOLEAN DEFAULT TRUE,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPON REDEMPTIONS
-- ============================================================
CREATE TABLE coupon_redemptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id   UUID REFERENCES coupons(id) ON DELETE CASCADE,
  child_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id   UUID REFERENCES families(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  usd_value   NUMERIC(10,2) NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACHIEVEMENTS / BADGES
-- ============================================================
CREATE TABLE achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,            -- 'first_chore', 'streak_7', 'level_5', etc.
  title       TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  criteria    JSONB                            -- {type, threshold}
);

CREATE TABLE user_achievements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================
-- CHORE TEMPLATES LIBRARY (built-in templates)
-- ============================================================
CREATE TABLE chore_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  difficulty  TEXT DEFAULT 'medium',
  points      INTEGER DEFAULT 10,
  proof_type  TEXT DEFAULT 'photo',
  checklist   JSONB DEFAULT '[]',
  game_plan   JSONB DEFAULT '[]',
  org_type    TEXT,
  video_url   TEXT,
  is_global   BOOLEAN DEFAULT TRUE             -- system-wide vs family-specific
);

-- ============================================================
-- FAMILY SETTINGS
-- ============================================================
CREATE TABLE family_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id   UUID UNIQUE REFERENCES families(id) ON DELETE CASCADE,
  ai_enabled  BOOLEAN DEFAULT TRUE,
  demo_mode   BOOLEAN DEFAULT FALSE,
  timezone    TEXT DEFAULT 'America/Denver',
  settings    JSONB DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_users_family        ON users(family_id);
CREATE INDEX idx_users_auth          ON users(auth_id);
CREATE INDEX idx_chores_family       ON chores(family_id);
CREATE INDEX idx_instances_family    ON chore_instances(family_id);
CREATE INDEX idx_instances_due       ON chore_instances(due_date);
CREATE INDEX idx_instances_child     ON chore_instances(assigned_to);
CREATE INDEX idx_submissions_child   ON submissions(child_id);
CREATE INDEX idx_submissions_family  ON submissions(family_id);
CREATE INDEX idx_submissions_status  ON submissions(status);
CREATE INDEX idx_ledger_child        ON points_ledger(child_id);
CREATE INDEX idx_ledger_family       ON points_ledger(family_id);
CREATE INDEX idx_redemptions_child   ON reward_redemptions(child_id);
CREATE INDEX idx_coupon_red_child    ON coupon_redemptions(child_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE families          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_instances   ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger     ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_settings   ENABLE ROW LEVEL SECURITY;

-- PHP backend uses service_role key (bypasses RLS) — policies here are
-- for direct client access safety if ever needed.

-- ============================================================
-- SEED: ACHIEVEMENT DEFINITIONS
-- ============================================================
INSERT INTO achievements (key, title, description, icon, criteria) VALUES
  ('first_chore',   'First Mission',      'Complete your first chore',               '🎯', '{"type":"chores_completed","threshold":1}'),
  ('streak_3',      '3-Day Streak',       'Complete chores 3 days in a row',         '🔥', '{"type":"streak","threshold":3}'),
  ('streak_7',      'Week Warrior',       'Complete chores 7 days in a row',         '⚡', '{"type":"streak","threshold":7}'),
  ('streak_30',     'Month Champion',     'Complete chores 30 days in a row',        '🏆', '{"type":"streak","threshold":30}'),
  ('level_2',       'Level 2',            'Reach level 2',                           '⭐', '{"type":"level","threshold":2}'),
  ('level_5',       'Level 5 Pro',        'Reach level 5',                           '💫', '{"type":"level","threshold":5}'),
  ('points_100',    'Century Club',       'Earn 100 total points',                   '💯', '{"type":"total_points","threshold":100}'),
  ('points_500',    'Point Master',       'Earn 500 total points',                   '💎', '{"type":"total_points","threshold":500}'),
  ('chores_10',     'Chore Champion',     'Complete 10 chores total',                '🌟', '{"type":"chores_completed","threshold":10}'),
  ('chores_50',     'Superstar',          'Complete 50 chores total',                '🚀', '{"type":"chores_completed","threshold":50}'),
  ('first_reward',  'First Reward',       'Redeem your first reward',                '🎁', '{"type":"rewards_redeemed","threshold":1}'),
  ('perfect_week',  'Perfect Week',       'Complete all assigned chores in a week',  '✨', '{"type":"perfect_week","threshold":1}');

-- ============================================================
-- SEED: CHORE TEMPLATE LIBRARY
-- ============================================================
INSERT INTO chore_templates (title, description, category, difficulty, points, proof_type, checklist, game_plan, org_type) VALUES
  ('Make Your Bed', 'Make your bed neatly each morning', 'bedroom', 'easy', 5, 'photo',
   '[{"id":"1","text":"Straighten sheets","required":true},{"id":"2","text":"Fluff pillows","required":true},{"id":"3","text":"Smooth out comforter","required":true}]',
   '[{"step":1,"title":"Clear the bed","description":"Remove any toys or items on the bed"},{"step":2,"title":"Straighten the sheets","description":"Pull the bottom sheet tight and tuck in the sides"},{"step":3,"title":"Lay the comforter","description":"Spread the comforter evenly, no wrinkles"},{"step":4,"title":"Place pillows","description":"Fluff and place pillows neatly at the headboard"}]',
   null),
  ('Vacuum Living Room', 'Vacuum the entire living room floor', 'cleaning', 'medium', 15, 'photo_checklist',
   '[{"id":"1","text":"Move small furniture/items off floor","required":true},{"id":"2","text":"Vacuum all carpet areas","required":true},{"id":"3","text":"Get corners and edges","required":true},{"id":"4","text":"Return furniture to place","required":false}]',
   '[{"step":1,"title":"Clear the floor","description":"Move shoes, toys, and small items off the floor"},{"step":2,"title":"Start at the far end","description":"Begin vacuuming at the wall farthest from the door"},{"step":3,"title":"Work in rows","description":"Vacuum in straight overlapping rows toward the exit"},{"step":4,"title":"Do the edges","description":"Use the crevice tool along baseboards and corners"},{"step":5,"title":"Check your work","description":"Look for any missed spots before putting vacuum away"}]',
   null),
  ('Wash the Dishes', 'Wash, rinse, and dry all dishes in the sink', 'kitchen', 'medium', 15, 'photo',
   '[{"id":"1","text":"Rinse all dishes first","required":true},{"id":"2","text":"Wash with soap","required":true},{"id":"3","text":"Rinse soap off","required":true},{"id":"4","text":"Dry and put away","required":true}]',
   '[{"step":1,"title":"Fill the sink","description":"Fill with hot soapy water"},{"step":2,"title":"Rinse dishes","description":"Rinse off large food particles first"},{"step":3,"title":"Wash in order","description":"Glasses first, then plates, then pots and pans"},{"step":4,"title":"Rinse thoroughly","description":"Make sure all soap is removed"},{"step":5,"title":"Dry and put away","description":"Dry with a clean towel and return to correct place"}]',
   null),
  ('Take Out Trash', 'Replace trash bags in kitchen and bathrooms', 'cleaning', 'easy', 8, 'checklist',
   '[{"id":"1","text":"Kitchen trash emptied","required":true},{"id":"2","text":"Bathroom trash emptied","required":true},{"id":"3","text":"New bags inserted","required":true},{"id":"4","text":"Trash taken to bin outside","required":true}]',
   '[{"step":1,"title":"Get new bags ready","description":"Grab replacement bags before you start"},{"step":2,"title":"Kitchen first","description":"Tie the bag and pull it out"},{"step":3,"title":"Check bathrooms","description":"Empty each bathroom trash can"},{"step":4,"title":"Take to bin","description":"Carry all bags to the outdoor trash bin"},{"step":5,"title":"New bags in","description":"Insert fresh bags in every can"}]',
   null),
  ('Clean Your Room', 'Full bedroom tidy — floor cleared, surfaces dusted, organized', 'bedroom', 'hard', 25, 'photo_checklist',
   '[{"id":"1","text":"Floor completely clear","required":true},{"id":"2","text":"Clothes put away or in hamper","required":true},{"id":"3","text":"Desk/surfaces cleared","required":true},{"id":"4","text":"Bed made","required":true},{"id":"5","text":"Trash emptied","required":false}]',
   '[{"step":1,"title":"Start with the floor","description":"Pick up everything off the floor — clothes, toys, trash"},{"step":2,"title":"Sort items","description":"Put clothes in hamper, toys in bins, trash in can"},{"step":3,"title":"Make the bed","description":"Straighten sheets, comforter, and pillows"},{"step":4,"title":"Clear surfaces","description":"Wipe down desk and dresser — put items away"},{"step":5,"title":"Final check","description":"Walk the perimeter of the room and check corners"}]',
   'size'),
  ('Mow the Lawn', 'Mow the front and back yard', 'yard', 'hard', 40, 'photo',
   '[{"id":"1","text":"Check for obstacles before starting","required":true},{"id":"2","text":"Front yard mowed","required":true},{"id":"3","text":"Back yard mowed","required":true},{"id":"4","text":"Mower put away","required":true}]',
   '[{"step":1,"title":"Safety check","description":"Walk the yard and remove rocks, toys, and debris"},{"step":2,"title":"Check fuel","description":"Make sure the mower has enough fuel or is charged"},{"step":3,"title":"Set the height","description":"Set mower height to 3 inches for healthy grass"},{"step":4,"title":"Mow in rows","description":"Mow in straight overlapping rows for even coverage"},{"step":5,"title":"Edge if needed","description":"Use edger along sidewalks and driveway"},{"step":6,"title":"Clean up","description":"Put mower away and clear clippings from sidewalk"}]',
   'safety'),
  ('Fold Laundry', 'Fold a load of clean laundry and put it away', 'laundry', 'medium', 12, 'photo',
   '[{"id":"1","text":"All items folded neatly","required":true},{"id":"2","text":"Put away in correct drawers","required":true},{"id":"3","text":"Hangers used for hang items","required":false}]',
   '[{"step":1,"title":"Spread out the load","description":"Dump laundry on the bed to sort"},{"step":2,"title":"Sort by person or type","description":"Group shirts, pants, socks, underwear"},{"step":3,"title":"Fold neatly","description":"Fold shirts in thirds, pants in half"},{"step":4,"title":"Match socks","description":"Pair and roll socks together"},{"step":5,"title":"Put away","description":"Place each person''s items in their correct drawers"}]',
   'category'),
  ('Feed the Pets', 'Feed and water all family pets', 'pets', 'easy', 8, 'checklist',
   '[{"id":"1","text":"Food bowls filled","required":true},{"id":"2","text":"Water bowls refreshed","required":true},{"id":"3","text":"Area cleaned up","required":false}]',
   '[{"step":1,"title":"Check food level","description":"Look at each pet''s bowl to see how much is needed"},{"step":2,"title":"Fill food bowls","description":"Use the correct amount per pet''s feeding guide"},{"step":3,"title":"Fresh water","description":"Dump old water, rinse bowl, refill with fresh water"},{"step":4,"title":"Clean up","description":"Wipe up any spills around the feeding area"}]',
   null),
  ('Sweep Kitchen', 'Sweep the kitchen floor clean', 'kitchen', 'easy', 8, 'photo',
   '[{"id":"1","text":"Under table swept","required":true},{"id":"2","text":"Around appliances swept","required":true},{"id":"3","text":"Dustpan used and emptied","required":true}]',
   '[{"step":1,"title":"Clear the floor","description":"Move chairs out and pick up anything on the floor"},{"step":2,"title":"Start at edges","description":"Sweep along baseboards and under appliances first"},{"step":3,"title":"Sweep to center","description":"Work dirt toward the center of the room"},{"step":4,"title":"Use dustpan","description":"Sweep into dustpan and empty into trash"},{"step":5,"title":"Replace chairs","description":"Put chairs back neatly"}]',
   null),
  ('Unload Dishwasher', 'Unload all clean dishes and put them away correctly', 'kitchen', 'easy', 8, 'checklist',
   '[{"id":"1","text":"All dishes put away","required":true},{"id":"2","text":"Silverware sorted","required":true},{"id":"3","text":"Dishwasher left open to air dry","required":false}]',
   '[{"step":1,"title":"Start with the bottom rack","description":"Remove plates, bowls, and pots first so drips don''t fall on them"},{"step":2,"title":"Top rack next","description":"Glasses, cups, and small items"},{"step":3,"title":"Silverware last","description":"Sort into correct dividers in the drawer"},{"step":4,"title":"Put away correctly","description":"Each item goes in its designated spot — not just anywhere"}]',
   null);
