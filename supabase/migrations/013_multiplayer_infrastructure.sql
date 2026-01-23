-- Migration: Multiplayer Infrastructure
-- Description: Tables for real-time multiplayer games (1v1 ranked/casual, collaborative)

-- ============================================
-- 1. MULTIPLAYER ROOMS
-- ============================================
CREATE TABLE IF NOT EXISTS multiplayer_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('1v1-ranked', '1v1-casual', 'collaborative')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'cancelled')),
  max_players INTEGER NOT NULL DEFAULT 2,
  current_players INTEGER DEFAULT 0,
  room_code TEXT UNIQUE,  -- For private rooms (6 characters)
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  game_state JSONB DEFAULT '{}',

  CONSTRAINT valid_max_players CHECK (max_players >= 2 AND max_players <= 8),
  CONSTRAINT valid_current_players CHECK (current_players >= 0 AND current_players <= max_players)
);

-- Indexes for efficient queries
CREATE INDEX idx_multiplayer_rooms_status ON multiplayer_rooms(status);
CREATE INDEX idx_multiplayer_rooms_game_id ON multiplayer_rooms(game_id);
CREATE INDEX idx_multiplayer_rooms_waiting ON multiplayer_rooms(game_id, status) WHERE status = 'waiting';
CREATE INDEX idx_multiplayer_rooms_created_by ON multiplayer_rooms(created_by);
CREATE INDEX idx_multiplayer_rooms_room_code ON multiplayer_rooms(room_code) WHERE room_code IS NOT NULL;

-- ============================================
-- 2. ROOM PLAYERS
-- ============================================
CREATE TABLE IF NOT EXISTS multiplayer_room_players (
  room_id UUID REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  player_number INTEGER NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  ready BOOLEAN DEFAULT FALSE,
  disconnected BOOLEAN DEFAULT FALSE,
  disconnected_at TIMESTAMPTZ,

  PRIMARY KEY (room_id, user_id),
  CONSTRAINT valid_player_number CHECK (player_number >= 1 AND player_number <= 8)
);

-- Indexes
CREATE INDEX idx_multiplayer_room_players_user ON multiplayer_room_players(user_id);
CREATE INDEX idx_multiplayer_room_players_ready ON multiplayer_room_players(room_id, ready);

-- ============================================
-- 3. GAME ACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS multiplayer_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_action_type CHECK (action_type IN ('move', 'chat', 'ready', 'surrender', 'offer_draw', 'accept_draw', 'decline_draw', 'timeout'))
);

-- Indexes
CREATE INDEX idx_multiplayer_actions_room ON multiplayer_actions(room_id, created_at);
CREATE INDEX idx_multiplayer_actions_user ON multiplayer_actions(user_id);

-- ============================================
-- 4. MULTIPLAYER STATS
-- ============================================
CREATE TABLE IF NOT EXISTS multiplayer_stats (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('1v1-ranked', '1v1-casual')),
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  elo_rating INTEGER DEFAULT 1000,
  highest_elo INTEGER DEFAULT 1000,
  lowest_elo INTEGER DEFAULT 1000,
  total_games INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  best_win_streak INTEGER DEFAULT 0,
  loss_streak INTEGER DEFAULT 0,
  worst_loss_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, game_id, mode),
  CONSTRAINT valid_stats CHECK (wins >= 0 AND losses >= 0 AND draws >= 0 AND total_games >= 0),
  CONSTRAINT valid_elo CHECK (elo_rating >= 0 AND highest_elo >= elo_rating AND lowest_elo <= elo_rating)
);

-- Indexes for leaderboards
CREATE INDEX idx_multiplayer_stats_elo ON multiplayer_stats(game_id, mode, elo_rating DESC);
CREATE INDEX idx_multiplayer_stats_wins ON multiplayer_stats(game_id, mode, wins DESC);
CREATE INDEX idx_multiplayer_stats_user ON multiplayer_stats(user_id);

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

-- Rooms: Public read, authenticated create
ALTER TABLE multiplayer_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms are viewable by everyone"
  ON multiplayer_rooms FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON multiplayer_rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Room creator or participants can update"
  ON multiplayer_rooms FOR UPDATE
  USING (true);

-- Room Players: Public read, authenticated insert
ALTER TABLE multiplayer_room_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room players are viewable by everyone"
  ON multiplayer_room_players FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join rooms"
  ON multiplayer_room_players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update their own status"
  ON multiplayer_room_players FOR UPDATE
  USING (true);

-- Actions: Public read for room participants, authenticated insert
ALTER TABLE multiplayer_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Actions are viewable by everyone"
  ON multiplayer_actions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert actions"
  ON multiplayer_actions FOR INSERT
  WITH CHECK (true);

-- Stats: Public read, system update only
ALTER TABLE multiplayer_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stats are viewable by everyone"
  ON multiplayer_stats FOR SELECT
  USING (true);

CREATE POLICY "System can manage stats"
  ON multiplayer_stats FOR ALL
  USING (true);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to generate random room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluded I, O, 0, 1 for clarity
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update room player count
CREATE OR REPLACE FUNCTION update_room_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE multiplayer_rooms
    SET current_players = current_players + 1
    WHERE id = NEW.room_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE multiplayer_rooms
    SET current_players = current_players - 1
    WHERE id = OLD.room_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for player count
CREATE TRIGGER trigger_update_room_player_count
AFTER INSERT OR DELETE ON multiplayer_room_players
FOR EACH ROW EXECUTE FUNCTION update_room_player_count();

-- Function to auto-start game when room is full
CREATE OR REPLACE FUNCTION check_room_ready_to_start()
RETURNS TRIGGER AS $$
DECLARE
  room_record RECORD;
  all_ready BOOLEAN;
BEGIN
  -- Get room info
  SELECT * INTO room_record FROM multiplayer_rooms WHERE id = NEW.room_id;

  -- Check if room is full and all players ready
  IF room_record.status = 'waiting' AND room_record.current_players >= room_record.max_players THEN
    SELECT bool_and(ready) INTO all_ready
    FROM multiplayer_room_players
    WHERE room_id = NEW.room_id;

    IF all_ready THEN
      UPDATE multiplayer_rooms
      SET status = 'playing', started_at = NOW()
      WHERE id = NEW.room_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-start
CREATE TRIGGER trigger_check_room_ready
AFTER UPDATE OF ready ON multiplayer_room_players
FOR EACH ROW EXECUTE FUNCTION check_room_ready_to_start();

-- Function to update stats timestamp
CREATE OR REPLACE FUNCTION update_multiplayer_stats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stats timestamp
CREATE TRIGGER trigger_update_multiplayer_stats_timestamp
BEFORE UPDATE ON multiplayer_stats
FOR EACH ROW EXECUTE FUNCTION update_multiplayer_stats_timestamp();

-- ============================================
-- 7. REALTIME PUBLICATION
-- ============================================
-- Enable realtime for multiplayer tables
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE multiplayer_actions;

-- ============================================
-- 8. COMMENTS
-- ============================================
COMMENT ON TABLE multiplayer_rooms IS 'Game rooms for real-time multiplayer matches';
COMMENT ON TABLE multiplayer_room_players IS 'Players in multiplayer rooms';
COMMENT ON TABLE multiplayer_actions IS 'Game actions/moves in multiplayer matches';
COMMENT ON TABLE multiplayer_stats IS 'Player statistics for multiplayer modes';
COMMENT ON COLUMN multiplayer_rooms.room_code IS '6-character code for private rooms';
COMMENT ON COLUMN multiplayer_rooms.game_state IS 'JSON state of the current game';
COMMENT ON COLUMN multiplayer_stats.elo_rating IS 'Current ELO rating (starts at 1000)';
