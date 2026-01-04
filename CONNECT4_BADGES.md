# Connect 4 (Puissance 4) - Badges Proposal

## Badge System Based on Difficulty Levels

### 🎯 Progression Badges

#### First Win Badges (by difficulty)
1. **Beginner's Victory** 😊
   - ID: `connect4_first_win_easy`
   - Description EN: "Win your first Connect 4 game on Easy difficulty"
   - Description FR: "Gagnez votre première partie de Puissance 4 en difficulté Facile"
   - Category: `progression`
   - Requirement: 1 win on Easy difficulty
   - Points: 10

2. **Tactical Victory** 🤔
   - ID: `connect4_first_win_medium`
   - Description EN: "Win your first Connect 4 game on Medium difficulty"
   - Description FR: "Gagnez votre première partie de Puissance 4 en difficulté Moyenne"
   - Category: `progression`
   - Requirement: 1 win on Medium difficulty
   - Points: 25

3. **Master's Victory** 😤
   - ID: `connect4_first_win_hard`
   - Description EN: "Win your first Connect 4 game on Hard difficulty"
   - Description FR: "Gagnez votre première partie de Puissance 4 en difficulté Difficile"
   - Category: `progression`
   - Requirement: 1 win on Hard difficulty
   - Points: 50

### 🏆 Performance Badges

#### Win Streaks (by difficulty)
4. **Consistent Player**
   - ID: `connect4_streak_5_easy`
   - Description EN: "Win 5 consecutive games on Easy difficulty"
   - Description FR: "Gagnez 5 parties consécutives en difficulté Facile"
   - Category: `performance`
   - Requirement: 5-game win streak on Easy
   - Points: 25

5. **Dominator**
   - ID: `connect4_streak_5_medium`
   - Description EN: "Win 5 consecutive games on Medium difficulty"
   - Description FR: "Gagnez 5 parties consécutives en difficulté Moyenne"
   - Category: `performance`
   - Requirement: 5-game win streak on Medium
   - Points: 75

6. **AI Slayer** 💪
   - ID: `connect4_streak_5_hard`
   - Description EN: "Win 5 consecutive games on Hard difficulty"
   - Description FR: "Gagnez 5 parties consécutives en difficulté Difficile"
   - Category: `performance`
   - Requirement: 5-game win streak on Hard
   - Points: 150

### 🌟 Elite Badges

#### Total Wins (by difficulty)
7. **Easy Conqueror**
   - ID: `connect4_wins_50_easy`
   - Description EN: "Win 50 games on Easy difficulty"
   - Description FR: "Gagnez 50 parties en difficulté Facile"
   - Category: `elite`
   - Requirement: 50 wins on Easy
   - Points: 50

8. **Strategic Mind**
   - ID: `connect4_wins_50_medium`
   - Description EN: "Win 50 games on Medium difficulty"
   - Description FR: "Gagnez 50 parties en difficulté Moyenne"
   - Category: `elite`
   - Requirement: 50 wins on Medium
   - Points: 150

9. **Grandmaster** 👑
   - ID: `connect4_wins_50_hard`
   - Description EN: "Win 50 games on Hard difficulty"
   - Description FR: "Gagnez 50 parties en difficulté Difficile"
   - Category: `elite`
   - Requirement: 50 wins on Hard
   - Points: 300

### 🎮 Engagement Badges

10. **Connect 4 Enthusiast**
    - ID: `connect4_games_100`
    - Description EN: "Play 100 Connect 4 games (any difficulty)"
    - Description FR: "Jouez 100 parties de Puissance 4 (toute difficulté)"
    - Category: `engagement`
    - Requirement: 100 games played
    - Points: 50

11. **Connect 4 Veteran**
    - ID: `connect4_games_500`
    - Description EN: "Play 500 Connect 4 games (any difficulty)"
    - Description FR: "Jouez 500 parties de Puissance 4 (toute difficulté)"
    - Category: `engagement`
    - Requirement: 500 games played
    - Points: 150

### 🔗 Collection Badges

12. **Triple Threat** 🎯
    - ID: `connect4_all_difficulties`
    - Description EN: "Win at least one game on each difficulty level"
    - Description FR: "Gagnez au moins une partie à chaque niveau de difficulté"
    - Category: `collection`
    - Requirement: At least 1 win on Easy, Medium, and Hard
    - Points: 100

13. **Perfect Champion**
    - ID: `connect4_all_difficulties_streak`
    - Description EN: "Achieve a 5-game win streak on all difficulty levels"
    - Description FR: "Réalisez une série de 5 victoires à tous les niveaux de difficulté"
    - Category: `collection`
    - Requirement: 5-game win streak on Easy, Medium, and Hard
    - Points: 250

## Database Schema Addition

To implement these badges, add them to the `badges` table in Supabase:

```sql
-- Insert Connect 4 badges
INSERT INTO badges (id, name, description, icon, category, requirement, points) VALUES
('connect4_first_win_easy', 'Beginner''s Victory', 'Win your first Connect 4 game on Easy difficulty', '😊', 'progression', '{"game": "connectfive", "difficulty": "easy", "wins": 1}', 10),
('connect4_first_win_medium', 'Tactical Victory', 'Win your first Connect 4 game on Medium difficulty', '🤔', 'progression', '{"game": "connectfive", "difficulty": "medium", "wins": 1}', 25),
('connect4_first_win_hard', 'Master''s Victory', 'Win your first Connect 4 game on Hard difficulty', '😤', 'progression', '{"game": "connectfive", "difficulty": "hard", "wins": 1}', 50),
('connect4_streak_5_easy', 'Consistent Player', 'Win 5 consecutive games on Easy difficulty', '🎯', 'performance', '{"game": "connectfive", "difficulty": "easy", "win_streak": 5}', 25),
('connect4_streak_5_medium', 'Dominator', 'Win 5 consecutive games on Medium difficulty', '💪', 'performance', '{"game": "connectfive", "difficulty": "medium", "win_streak": 5}', 75),
('connect4_streak_5_hard', 'AI Slayer', 'Win 5 consecutive games on Hard difficulty', '👊', 'performance', '{"game": "connectfive", "difficulty": "hard", "win_streak": 5}', 150),
('connect4_wins_50_easy', 'Easy Conqueror', 'Win 50 games on Easy difficulty', '🏅', 'elite', '{"game": "connectfive", "difficulty": "easy", "wins": 50}', 50),
('connect4_wins_50_medium', 'Strategic Mind', 'Win 50 games on Medium difficulty', '🧠', 'elite', '{"game": "connectfive", "difficulty": "medium", "wins": 50}', 150),
('connect4_wins_50_hard', 'Grandmaster', 'Win 50 games on Hard difficulty', '👑', 'elite', '{"game": "connectfive", "difficulty": "hard", "wins": 50}', 300),
('connect4_games_100', 'Connect 4 Enthusiast', 'Play 100 Connect 4 games', '🎮', 'engagement', '{"game": "connectfive", "games_played": 100}', 50),
('connect4_games_500', 'Connect 4 Veteran', 'Play 500 Connect 4 games', '🏆', 'engagement', '{"game": "connectfive", "games_played": 500}', 150),
('connect4_all_difficulties', 'Triple Threat', 'Win at least one game on each difficulty level', '🎯', 'collection', '{"game": "connectfive", "all_difficulties": true}', 100),
('connect4_all_difficulties_streak', 'Perfect Champion', 'Achieve a 5-game win streak on all difficulty levels', '⭐', 'collection', '{"game": "connectfive", "all_difficulties_streak": true}', 250);
```

## Implementation Notes

### Tracking Difficulty in Game Sessions

The `game_sessions` table needs to be updated to track difficulty:

```sql
ALTER TABLE game_sessions
ADD COLUMN difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard'));
```

### Badge Check Logic

Update `app/api/badges/check/route.ts` to include difficulty-based badge checking:

```typescript
// Get Connect 4 sessions by difficulty
const connect4Sessions = sessions.filter(s => s.game_id === 'connectfive');
const easyWins = connect4Sessions.filter(s => s.difficulty === 'easy' && s.result === 'win').length;
const mediumWins = connect4Sessions.filter(s => s.difficulty === 'medium' && s.result === 'win').length;
const hardWins = connect4Sessions.filter(s => s.difficulty === 'hard' && s.result === 'win').length;

// Check win streaks by difficulty
function checkWinStreak(sessions: any[], difficulty: string, targetStreak: number): boolean {
  let currentStreak = 0;
  let maxStreak = 0;

  for (const session of sessions) {
    if (session.difficulty === difficulty && session.result === 'win') {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (session.difficulty === difficulty) {
      currentStreak = 0;
    }
  }

  return maxStreak >= targetStreak;
}
```

## Total Points Available

- **Progression**: 85 points (3 badges)
- **Performance**: 250 points (3 badges)
- **Elite**: 500 points (3 badges)
- **Engagement**: 200 points (2 badges)
- **Collection**: 350 points (2 badges)

**Total**: 1,385 points across 13 badges
