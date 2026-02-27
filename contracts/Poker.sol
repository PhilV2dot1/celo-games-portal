// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Poker
 * @dev Game session tracking for Texas Hold'em (solo vs dealer) on Celo.
 * @notice The game logic runs client-side. This contract validates participation,
 *         records the final outcome reported by the player, and tracks statistics.
 *         Free to play — no fee required.
 */
contract Poker {

    // ========================================
    // ENUMS & STRUCTS
    // ========================================

    enum GameOutcome {
        WIN,
        LOSE,
        SPLIT
    }

    struct GameSession {
        uint256 startTime;
        bool isActive;
    }

    struct PlayerStats {
        uint256 handsPlayed;
        uint256 handsWon;
        uint256 handsSplit;
        uint256 bestHandRank; // 0 = high card ... 9 = royal flush
    }

    // ========================================
    // STATE VARIABLES
    // ========================================

    mapping(address => PlayerStats) public playerStats;
    mapping(address => GameSession) public activeSessions;

    uint256 public totalHandsPlayed;

    // ========================================
    // EVENTS
    // ========================================

    event GameStarted(
        address indexed player,
        uint256 timestamp
    );

    event GameEnded(
        address indexed player,
        GameOutcome outcome,
        uint8 handRank,
        uint256 timestamp
    );

    event GameAbandoned(
        address indexed player,
        uint256 timestamp
    );

    // ========================================
    // EXTERNAL FUNCTIONS
    // ========================================

    /**
     * @dev Start a new hand session.
     * @notice Player must not have an active session.
     */
    function startGame() external {
        require(!activeSessions[msg.sender].isActive, "Hand already in progress");

        activeSessions[msg.sender] = GameSession({
            startTime: block.timestamp,
            isActive: true
        });

        emit GameStarted(msg.sender, block.timestamp);
    }

    /**
     * @dev End the current hand and record the result.
     * @param outcome The outcome of the hand (WIN, LOSE, or SPLIT)
     * @param handRank The best hand rank achieved by the player (0–9)
     * @notice Player must have an active session.
     */
    function endGame(GameOutcome outcome, uint8 handRank) external {
        require(activeSessions[msg.sender].isActive, "No active hand");
        require(handRank <= 9, "Invalid hand rank");

        PlayerStats storage stats = playerStats[msg.sender];

        stats.handsPlayed++;

        if (outcome == GameOutcome.WIN) {
            stats.handsWon++;
        } else if (outcome == GameOutcome.SPLIT) {
            stats.handsSplit++;
        }

        if (handRank > stats.bestHandRank) {
            stats.bestHandRank = handRank;
        }

        activeSessions[msg.sender].isActive = false;
        totalHandsPlayed++;

        emit GameEnded(msg.sender, outcome, handRank, block.timestamp);
    }

    /**
     * @dev Abandon the current active hand.
     * @notice Not recorded in stats.
     */
    function abandonGame() external {
        require(activeSessions[msg.sender].isActive, "No active hand");

        activeSessions[msg.sender].isActive = false;

        emit GameAbandoned(msg.sender, block.timestamp);
    }

    // ========================================
    // VIEW FUNCTIONS
    // ========================================

    /**
     * @dev Get statistics for a player.
     * @param player The player address
     * @return handsPlayed  Total hands played
     * @return handsWon     Total hands won
     * @return handsSplit   Total hands split
     * @return bestHandRank Best hand rank ever achieved (0–9)
     * @return winRate      Win rate in basis points (0–10000, divide by 100 for %)
     */
    function getPlayerStats(address player)
        external
        view
        returns (
            uint256 handsPlayed,
            uint256 handsWon,
            uint256 handsSplit,
            uint256 bestHandRank,
            uint256 winRate
        )
    {
        PlayerStats memory s = playerStats[player];
        handsPlayed  = s.handsPlayed;
        handsWon     = s.handsWon;
        handsSplit   = s.handsSplit;
        bestHandRank = s.bestHandRank;
        winRate      = s.handsPlayed > 0 ? (s.handsWon * 10000) / s.handsPlayed : 0;
    }

    /**
     * @dev Check if a player has an active hand session.
     * @param player The player address
     * @return True if player has an active session
     */
    function isGameActive(address player) external view returns (bool) {
        return activeSessions[player].isActive;
    }
}
