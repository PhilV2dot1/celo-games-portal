// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Snake
 * @dev Simple game session tracking for Snake on Celo
 * @notice This contract tracks game sessions and player high scores
 */
contract Snake {
    // ========================================
    // STRUCTS
    // ========================================

    struct PlayerStats {
        uint256 gamesPlayed;
        uint256 highScore;
        uint256 totalScore;
        uint256 totalFoodEaten;
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
        uint256 foodEaten,
        bool newHighScore,
        uint256 timestamp
    );
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
     * @param foodEaten The number of food items eaten
     * @notice Player must have an active game
     */
    function endGame(uint256 score, uint256 foodEaten) external {
        require(hasActiveGame[msg.sender], "No active game");

        PlayerStats storage stats = playerStats[msg.sender];

        stats.gamesPlayed++;
        stats.totalScore += score;
        stats.totalFoodEaten += foodEaten;

        bool newHighScore = false;

        // Update personal high score
        if (score > stats.highScore) {
            stats.highScore = score;
            newHighScore = true;
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
            foodEaten,
            newHighScore,
            block.timestamp
        );
    }

    /**
     * @dev Get player statistics
     * @param player The player address
     * @return gamesPlayed Total games played
     * @return highScore Personal high score
     * @return totalScore Total cumulative score
     * @return totalFoodEaten Total food eaten across all games
     */
    function getPlayerStats(address player)
        external
        view
        returns (
            uint256 gamesPlayed,
            uint256 highScore,
            uint256 totalScore,
            uint256 totalFoodEaten
        )
    {
        PlayerStats memory stats = playerStats[player];
        return (
            stats.gamesPlayed,
            stats.highScore,
            stats.totalScore,
            stats.totalFoodEaten
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
