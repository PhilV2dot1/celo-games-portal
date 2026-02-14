-- Migration: Memory Game and Badges
-- Purpose: Add Memory game to games table and insert all Memory badges
-- Date: 2026-02-14

-- ========================================
-- STEP 1: Add Memory to games table
-- ========================================

INSERT INTO games (id, name, description, contract_address, icon) VALUES
('memory', 'Memory', 'Match pairs of cards - test your memory!', '0xf387107bb43591c49dca7f46cd3cffc705f0cb0c', '/icons/memory.png')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- STEP 2: Insert Memory Badges
-- ========================================

-- Progression Badges (First Wins) - 3 badges, 85 points total
INSERT INTO badges (id, name, description, icon, category, requirement, points) VALUES
('memory_first_win_easy', 'Sharp Eye', 'Win your first Memory game on Easy difficulty', '😊', 'progression', '{"game": "memory", "difficulty": "easy", "wins": 1}', 10),
('memory_first_win_medium', 'Quick Recall', 'Win your first Memory game on Medium difficulty', '🤔', 'progression', '{"game": "memory", "difficulty": "medium", "wins": 1}', 25),
('memory_first_win_hard', 'Photographic Memory', 'Win your first Memory game on Hard difficulty', '🔥', 'progression', '{"game": "memory", "difficulty": "hard", "wins": 1}', 50)
ON CONFLICT (id) DO NOTHING;

-- Performance Badges (Speed) - 3 badges, 250 points total
INSERT INTO badges (id, name, description, icon, category, requirement, points) VALUES
('memory_speed_easy_30s', 'Fast Matcher', 'Win Easy difficulty in under 30 seconds', '⚡', 'performance', '{"game": "memory", "difficulty": "easy", "time_under": 30}', 25),
('memory_speed_medium_60s', 'Speed Recall', 'Win Medium difficulty in under 1 minute', '🏃', 'performance', '{"game": "memory", "difficulty": "medium", "time_under": 60}', 75),
('memory_speed_hard_120s', 'Lightning Memory', 'Win Hard difficulty in under 2 minutes', '🚀', 'performance', '{"game": "memory", "difficulty": "hard", "time_under": 120}', 150)
ON CONFLICT (id) DO NOTHING;

-- Mastery Badges (Total Wins) - 3 badges, 400 points total
INSERT INTO badges (id, name, description, icon, category, requirement, points) VALUES
('memory_wins_25_easy', 'Easy Recall', 'Win 25 games on Easy difficulty', '🏅', 'performance', '{"game": "memory", "difficulty": "easy", "wins": 25}', 50),
('memory_wins_25_medium', 'Memory Master', 'Win 25 games on Medium difficulty', '🧠', 'performance', '{"game": "memory", "difficulty": "medium", "wins": 25}', 100),
('memory_wins_25_hard', 'Mind Palace', 'Win 25 games on Hard difficulty', '👑', 'performance', '{"game": "memory", "difficulty": "hard", "wins": 25}', 250)
ON CONFLICT (id) DO NOTHING;

-- Performance Badges (Efficiency) - 2 badges, 175 points total
INSERT INTO badges (id, name, description, icon, category, requirement, points) VALUES
('memory_min_moves_easy', 'Perfect Pairs', 'Win Easy with minimum possible moves (no mistakes)', '🎯', 'performance', '{"game": "memory", "difficulty": "easy", "perfect_game": true}', 50),
('memory_win_streak_10', 'Unforgettable', 'Win 10 games in a row (any difficulty)', '🔥', 'performance', '{"game": "memory", "win_streak": 10}', 125)
ON CONFLICT (id) DO NOTHING;

-- Exploration Badges - 2 badges, 275 points total
INSERT INTO badges (id, name, description, icon, category, requirement, points) VALUES
('memory_all_difficulties', 'Total Recall', 'Win at least one game on each difficulty', '🎖️', 'exploration', '{"game": "memory", "all_difficulties": true}', 75),
('memory_speed_champion', 'Memory Sprint', 'Unlock all 3 speed badges', '💨', 'exploration', '{"game": "memory", "speed_champion": true}', 200)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- VERIFICATION
-- ========================================

DO $$
DECLARE
    badge_count INTEGER;
    total_points INTEGER;
BEGIN
    SELECT COUNT(*), SUM(points) INTO badge_count, total_points
    FROM badges
    WHERE id LIKE 'memory_%';

    RAISE NOTICE 'Total Memory badges: %', badge_count;
    RAISE NOTICE 'Total points available: %', total_points;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM games
        WHERE id = 'memory'
    ) THEN
        RAISE NOTICE 'Memory game successfully added to games table';
    END IF;
END $$;
