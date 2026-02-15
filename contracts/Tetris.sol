// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Tetris
 * @dev Game session tracking for Tetris on Celo, Base & MegaETH
 * @notice Tracks game sessions, player scores, lines cleared, and levels reached
 */
contract Tetris {
    // ========================================
    // STRUCTS
    // ========================================

    struct PlayerStats {
        uint256 gamesPlayed;
        uint256 wins;
        uint256 highScore;
        uint256 totalScore;
        uint256 totalLines;
        uint256 highestLevel;
    }

    // ========================================
    // STATE VARIABLES
    // ========================================

    mapping(address => PlayerStats) public playerStats;
    mapping(address => bool) public hasActiveGame;

    uint256 public totalGames;
    uint256 public globalHighScore;
    address public globalHighScoreHolder;

    // ========================================
    // EVENTS
    // ========================================

    event GameStarted(address indexed player, uint256 timestamp);

    event GameEnded(
        address indexed player,
        uint256 score,
        uint256 lines,
        uint256 level,
        bool newHighScore,
        uint256 timestamp
    );

    event GameAbandoned(address indexed player, uint256 timestamp);

    event NewGlobalHighScore(
        address indexed player,
        uint256 score,
        uint256 timestamp
    );

    // ========================================
    // EXTERNAL FUNCTIONS
    // ========================================

    /**
     * @dev Start a new game session
     * @notice Player must not have an active game
     */
    function startGame() external {
        require(!hasActiveGame[msg.sender], "Game already in progress");

        hasActiveGame[msg.sender] = true;

        emit GameStarted(msg.sender, block.timestamp);
    }

    /**
     * @dev End the current game and record score
     * @param score The final score achieved
     * @param lines Total lines cleared
     * @param level The highest level reached
     * @notice Player must have an active game
     */
    function endGame(uint256 score, uint256 lines, uint256 level) external {
        require(hasActiveGame[msg.sender], "No active game");

        PlayerStats storage stats = playerStats[msg.sender];

        stats.gamesPlayed++;
        stats.totalScore += score;
        stats.totalLines += lines;

        bool newHighScore = false;

        // Update personal high score
        if (score > stats.highScore) {
            stats.highScore = score;
            newHighScore = true;
        }

        // Track wins (score >= 10000)
        if (score >= 10000) {
            stats.wins++;
        }

        // Update highest level
        if (level > stats.highestLevel) {
            stats.highestLevel = level;
        }

        // Update global high score
        if (score > globalHighScore) {
            globalHighScore = score;
            globalHighScoreHolder = msg.sender;
            emit NewGlobalHighScore(msg.sender, score, block.timestamp);
        }

        hasActiveGame[msg.sender] = false;
        totalGames++;

        emit GameEnded(
            msg.sender,
            score,
            lines,
            level,
            newHighScore,
            block.timestamp
        );
    }

    /**
     * @dev Abandon the current active game (not recorded as win)
     */
    function abandonGame() external {
        require(hasActiveGame[msg.sender], "No active game");

        hasActiveGame[msg.sender] = false;

        emit GameAbandoned(msg.sender, block.timestamp);
    }

    /**
     * @dev Get player statistics
     * @param player The player address
     * @return gamesPlayed Total games played
     * @return wins Number of games with score >= 10000
     * @return highScore Personal highest score
     * @return totalScore Total cumulative score
     * @return totalLines Total lines cleared across all games
     * @return highestLevel Highest level reached
     */
    function getPlayerStats(address player)
        external
        view
        returns (
            uint256 gamesPlayed,
            uint256 wins,
            uint256 highScore,
            uint256 totalScore,
            uint256 totalLines,
            uint256 highestLevel
        )
    {
        PlayerStats memory stats = playerStats[player];
        return (
            stats.gamesPlayed,
            stats.wins,
            stats.highScore,
            stats.totalScore,
            stats.totalLines,
            stats.highestLevel
        );
    }

    /**
     * @dev Check if player has an active game
     * @param player The player address
     * @return True if player has an active game
     */
    function isGameActive(address player) external view returns (bool) {
        return hasActiveGame[player];
    }

    /**
     * @dev Get global high score information
     * @return score The global high score
     * @return holder The address of the high score holder
     */
    function getGlobalHighScore()
        external
        view
        returns (uint256 score, address holder)
    {
        return (globalHighScore, globalHighScoreHolder);
    }
}
