-- 1. Create CONFIG Table (Key-Value configuration for Secrets like OpenRouter API Key)
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for config table
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- We can bypass RLS on config by using the service_role (supabaseAdmin client)
-- on the server, which is secure and standard.


-- 2. Create STATS Table (For counts like Total Visitors and Total CVs Roasted)
CREATE TABLE IF NOT EXISTS stats (
  key TEXT PRIMARY KEY,
  value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for stats table
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read stats (landing page displays total roasted/visitors)
CREATE POLICY "Allow public read stats" ON stats
  FOR SELECT USING (true);

-- Allow updates & inserts (public can increment stats counters)
CREATE POLICY "Allow public update stats" ON stats
  FOR UPDATE USING (true);

CREATE POLICY "Allow public insert stats" ON stats
  FOR INSERT WITH CHECK (true);


-- 3. Pre-populate statistics values
INSERT INTO stats (key, value) 
VALUES ('total_visitors', 0), ('total_cvs_roasted', 0)
ON CONFLICT (key) DO NOTHING;
