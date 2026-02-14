-- Migration: Maze Game and Badges
-- Purpose: Add Maze game to games table and insert all Maze badges
-- Date: 2026-02-14

-- ========================================
-- STEP 1: Add Maze to games table
-- ========================================

INSERT INTO games (id, name, description, contract_address, icon) VALUES
('maze', 'Maze', 'Navigate through randomly generated labyrinths!', '0x15110ed1bff11b2522234a44665bc689c500a285', '/icons/maze.png')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- STEP 2: Insert Maze Badges
-- ========================================

-- Progression Badges (First Wins) - 3 badges, 85 points total
INSERT INTO badges (id, name, description, icon, category, requirement, points) VALUES
('maze_first_win_easy', 'Path Finder', 'Win your first Maze game on Easy difficulty', '😊', 'progression', '{"game": "maze", "difficulty": "easy", "wins": 1}', 10),
('maze_first_win_medium', 'Maze Runner', 'Win your first Maze game on Medium difficulty', '🤔', 'progression', '{"game": "maze", "difficulty": "medium", "wins": 1}', 25),
('maze_first_win_hard', 'Labyrinth Master', 'Win your first Maze game on Hard difficulty', '🔥', 'progression', '{"game": "maze", "difficulty": "hard", "wins": 1}', 50)
ON CONFLICT (id) DO NOTHING;

-- Performance Badges (Speed) - 3 badges, 250 points total
INSERT INTO badges (id, name, description, icon, category, requirement, points) VALUES
('maze_speed_easy_20s', 'Quick Escape', 'Win Easy difficulty in under 20 seconds', '⚡', 'performance', '{"game": "maze", "difficulty": "easy", "time_under": 20}', 25),
('maze_speed_medium_60s', 'Swift Navigator', 'Win Medium difficulty in under 1 minute', '🏃', 'performance', '{"game": "maze", "difficulty": "medium", "time_under": 60}', 75),
('maze_speed_hard_180s', 'Speed Runner', 'Win Hard difficulty in under 3 minutes', '🚀', 'performance', '{"game": "maze", "difficulty": "hard", "time_under": 180}', 150)
ON CONFLICT (id) DO NOTHING;

-- Mastery Badges (Total Wins) - 3 badges, 400 points total
INSERT INTO badges (id, name, description, icon, category, requirement, points) VALUES
('maze_wins_25_easy', 'Easy Explorer', 'Win 25 games on Easy difficulty', '🏅', 'performance', '{"game": "maze", "difficulty": "easy", "wins": 25}', 50),
('maze_wins_25_medium', 'Trail Blazer', 'Win 25 games on Medium difficulty', '🧠', 'performance', '{"game": "maze", "difficulty": "medium", "wins": 25}', 100),
('maze_wins_25_hard', 'Maze Legend', 'Win 25 games on Hard difficulty', '👑', 'performance', '{"game": "maze", "difficulty": "hard", "wins": 25}', 250)
ON CONFLICT (id) DO NOTHING;

-- Performance Badges (Efficiency) - 2 badges, 175 points total
INSERT INTO badges (id, name, description, icon, category, requirement, points) VALUES
('maze_efficient_easy', 'Shortest Path', 'Win Easy with minimal moves (perfect navigation)', '🎯', 'performance', '{"game": "maze", "difficulty": "easy", "perfect_game": true}', 50),
('maze_win_streak_10', 'Unstoppable Explorer', 'Win 10 games in a row (any difficulty)', '🔥', 'performance', '{"game": "maze", "win_streak": 10}', 125)
ON CONFLICT (id) DO NOTHING;

-- Exploration Badges - 2 badges, 275 points total
INSERT INTO badges (id, name, description, icon, category, requirement, points) VALUES
('maze_all_difficulties', 'Maze Conqueror', 'Win at least one game on each difficulty', '🎖️', 'exploration', '{"game": "maze", "all_difficulties": true}', 75),
('maze_speed_champion', 'Speed Legend', 'Unlock all 3 speed badges', '💨', 'exploration', '{"game": "maze", "speed_champion": true}', 200)
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
    WHERE id LIKE 'maze_%';

    RAISE NOTICE 'Total Maze badges: %', badge_count;
    RAISE NOTICE 'Total points available: %', total_points;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM games
        WHERE id = 'maze'
    ) THEN
        RAISE NOTICE 'Maze game successfully added to games table';
    END IF;
END $$;
