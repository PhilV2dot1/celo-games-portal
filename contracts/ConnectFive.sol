// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ConnectFive
 * @dev Connect Four game implementation on Celo blockchain
 * Players compete to connect 4 pieces in a row (horizontally, vertically, or diagonally)
 * Supports optional betting mechanism
 */
contract ConnectFive {
    // ========================================
    // CONSTANTS
    // ========================================

    uint8 public constant ROWS = 6;
    uint8 public constant COLS = 7;
    uint8 public constant WIN_LENGTH = 4;
    uint256 public constant TIMEOUT_DURATION = 10 minutes;

    // ========================================
    // ENUMS & STRUCTS
    // ========================================

    enum GameStatus {
        Waiting,    // Waiting for second player
        Playing,    // Game in progress
        Won,        // Game won by a player
        Draw,       // Game ended in draw
        Cancelled   // Game cancelled (timeout or forfeit)
    }

    enum Cell {
        Empty,
        Player1,
        Player2
    }

    struct Game {
        address player1;
        address player2;
        uint256 betAmount;
        Cell[COLS][ROWS] board; // [column][row]
        uint8 currentPlayer; // 1 or 2
        GameStatus status;
        address winner;
        uint8 moveCount;
        uint256 lastMoveTime;
        uint256 createdAt;
    }

    // ========================================
    // STATE VARIABLES
    // ========================================

    mapping(uint256 => Game) public games;
    uint256 public gameCounter;

    mapping(address => uint256[]) public playerGames;
    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public playerLosses;

    // ========================================
    // EVENTS
    // ========================================

    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 betAmount);
    event PlayerJoined(uint256 indexed gameId, address indexed player2);
    event MoveMade(uint256 indexed gameId, address indexed player, uint8 column, uint8 row);
    event GameWon(uint256 indexed gameId, address indexed winner, uint256 payout);
    event GameDraw(uint256 indexed gameId);
    event GameCancelled(uint256 indexed gameId, address indexed canceller, uint256 refund);

    // ========================================
    // MODIFIERS
    // ========================================

    modifier gameExists(uint256 gameId) {
        require(gameId < gameCounter, "Game does not exist");
        _;
    }

    modifier isPlayer(uint256 gameId) {
        Game storage game = games[gameId];
        require(
            msg.sender == game.player1 || msg.sender == game.player2,
            "Not a player in this game"
        );
        _;
    }

    modifier isCurrentPlayer(uint256 gameId) {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Playing, "Game is not in progress");

        if (game.currentPlayer == 1) {
            require(msg.sender == game.player1, "Not your turn");
        } else {
            require(msg.sender == game.player2, "Not your turn");
        }
        _;
    }

    // ========================================
    // EXTERNAL FUNCTIONS
    // ========================================

    /**
     * @dev Create a new game with optional bet amount
     * @return gameId The ID of the created game
     */
    function createGame() external payable returns (uint256) {
        uint256 gameId = gameCounter++;
        Game storage game = games[gameId];

        game.player1 = msg.sender;
        game.betAmount = msg.value;
        game.currentPlayer = 1;
        game.status = GameStatus.Waiting;
        game.createdAt = block.timestamp;

        playerGames[msg.sender].push(gameId);

        emit GameCreated(gameId, msg.sender, msg.value);
        return gameId;
    }

    /**
     * @dev Join an existing game
     * @param gameId The ID of the game to join
     */
    function joinGame(uint256 gameId) external payable gameExists(gameId) {
        Game storage game = games[gameId];

        require(game.status == GameStatus.Waiting, "Game is not waiting for players");
        require(msg.sender != game.player1, "Cannot play against yourself");
        require(msg.value == game.betAmount, "Incorrect bet amount");

        game.player2 = msg.sender;
        game.status = GameStatus.Playing;
        game.lastMoveTime = block.timestamp;

        playerGames[msg.sender].push(gameId);

        emit PlayerJoined(gameId, msg.sender);
    }

    /**
     * @dev Make a move by dropping a piece in a column
     * @param gameId The ID of the game
     * @param column The column to drop the piece (0-6)
     */
    function makeMove(uint256 gameId, uint8 column)
        external
        gameExists(gameId)
        isCurrentPlayer(gameId)
    {
        Game storage game = games[gameId];

        require(column < COLS, "Invalid column");
        require(_isColumnPlayable(game, column), "Column is full");

        // Find the row where the piece will land
        uint8 row = _getDropRow(game, column);

        // Place the piece
        Cell piece = game.currentPlayer == 1 ? Cell.Player1 : Cell.Player2;
        game.board[column][row] = piece;
        game.moveCount++;
        game.lastMoveTime = block.timestamp;

        emit MoveMade(gameId, msg.sender, column, row);

        // Check for win
        if (_checkWin(game, row, column)) {
            game.status = GameStatus.Won;
            game.winner = msg.sender;

            // Calculate payout (both bets go to winner)
            uint256 payout = game.betAmount * 2;

            // Update stats
            playerWins[msg.sender]++;
            address loser = msg.sender == game.player1 ? game.player2 : game.player1;
            playerLosses[loser]++;

            // Transfer payout
            if (payout > 0) {
                payable(msg.sender).transfer(payout);
            }

            emit GameWon(gameId, msg.sender, payout);
        }
        // Check for draw
        else if (game.moveCount >= ROWS * COLS) {
            game.status = GameStatus.Draw;

            // Refund both players
            if (game.betAmount > 0) {
                payable(game.player1).transfer(game.betAmount);
                payable(game.player2).transfer(game.betAmount);
            }

            emit GameDraw(gameId);
        }
        // Continue game
        else {
            game.currentPlayer = game.currentPlayer == 1 ? 2 : 1;
        }
    }

    /**
     * @dev Cancel a game (only if waiting or opponent timed out)
     * @param gameId The ID of the game to cancel
     */
    function cancelGame(uint256 gameId) external gameExists(gameId) isPlayer(gameId) {
        Game storage game = games[gameId];

        require(
            game.status == GameStatus.Waiting ||
            (game.status == GameStatus.Playing && block.timestamp > game.lastMoveTime + TIMEOUT_DURATION),
            "Cannot cancel game"
        );

        game.status = GameStatus.Cancelled;

        // Refund logic
        uint256 refund = 0;
        if (game.status == GameStatus.Waiting && msg.sender == game.player1) {
            // Waiting game - refund creator
            refund = game.betAmount;
            if (refund > 0) {
                payable(game.player1).transfer(refund);
            }
        } else if (game.status == GameStatus.Playing) {
            // Playing game with timeout - refund active player
            address activePlayer = game.currentPlayer == 1 ? game.player1 : game.player2;
            if (msg.sender == activePlayer) {
                refund = game.betAmount * 2;
                if (refund > 0) {
                    payable(activePlayer).transfer(refund);
                }
                playerWins[activePlayer]++;
                address opponent = activePlayer == game.player1 ? game.player2 : game.player1;
                playerLosses[opponent]++;
            }
        }

        emit GameCancelled(gameId, msg.sender, refund);
    }

    // ========================================
    // VIEW FUNCTIONS
    // ========================================

    /**
     * @dev Get the current board state
     * @param gameId The ID of the game
     * @return board The board state as a 2D array
     */
    function getBoard(uint256 gameId) external view gameExists(gameId) returns (Cell[COLS][ROWS] memory) {
        return games[gameId].board;
    }

    /**
     * @dev Get game details
     * @param gameId The ID of the game
     */
    function getGame(uint256 gameId) external view gameExists(gameId) returns (
        address player1,
        address player2,
        uint256 betAmount,
        uint8 currentPlayer,
        GameStatus status,
        address winner,
        uint8 moveCount
    ) {
        Game storage game = games[gameId];
        return (
            game.player1,
            game.player2,
            game.betAmount,
            game.currentPlayer,
            game.status,
            game.winner,
            game.moveCount
        );
    }

    /**
     * @dev Get all games for a player
     * @param player The player address
     * @return Array of game IDs
     */
    function getPlayerGames(address player) external view returns (uint256[] memory) {
        return playerGames[player];
    }

    /**
     * @dev Get player statistics
     * @param player The player address
     */
    function getPlayerStats(address player) external view returns (uint256 wins, uint256 losses) {
        return (playerWins[player], playerLosses[player]);
    }

    /**
     * @dev Check if a column is playable
     * @param gameId The ID of the game
     * @param column The column to check
     */
    function isColumnPlayable(uint256 gameId, uint8 column) external view gameExists(gameId) returns (bool) {
        require(column < COLS, "Invalid column");
        return _isColumnPlayable(games[gameId], column);
    }

    // ========================================
    // INTERNAL FUNCTIONS
    // ========================================

    /**
     * @dev Check if a column is playable (not full)
     */
    function _isColumnPlayable(Game storage game, uint8 column) internal view returns (bool) {
        return game.board[column][0] == Cell.Empty;
    }

    /**
     * @dev Get the row where a piece would land in a column
     */
    function _getDropRow(Game storage game, uint8 column) internal view returns (uint8) {
        for (uint8 row = ROWS - 1; row >= 0; row--) {
            if (game.board[column][row] == Cell.Empty) {
                return row;
            }
            if (row == 0) break; // Prevent underflow
        }
        revert("Column is full");
    }

    /**
     * @dev Check if the current move results in a win
     */
    function _checkWin(Game storage game, uint8 row, uint8 col) internal view returns (bool) {
        Cell player = game.board[col][row];

        // Check horizontal
        if (_checkDirection(game, row, col, 0, 1, player)) return true;

        // Check vertical
        if (_checkDirection(game, row, col, 1, 0, player)) return true;

        // Check diagonal (/)
        if (_checkDirection(game, row, col, 1, 1, player)) return true;

        // Check diagonal (\)
        if (_checkDirection(game, row, col, 1, -1, player)) return true;

        return false;
    }

    /**
     * @dev Check for win in a specific direction
     */
    function _checkDirection(
        Game storage game,
        uint8 row,
        uint8 col,
        int8 dRow,
        int8 dCol,
        Cell player
    ) internal view returns (bool) {
        uint8 count = 1;

        // Check positive direction
        count += _countDirection(game, row, col, dRow, dCol, player);

        // Check negative direction
        count += _countDirection(game, row, col, -dRow, -dCol, player);

        return count >= WIN_LENGTH;
    }

    /**
     * @dev Count consecutive pieces in a direction
     */
    function _countDirection(
        Game storage game,
        uint8 row,
        uint8 col,
        int8 dRow,
        int8 dCol,
        Cell player
    ) internal view returns (uint8) {
        uint8 count = 0;

        for (uint8 i = 1; i < WIN_LENGTH; i++) {
            int16 newRow = int16(int8(row)) + (int16(dRow) * int16(i));
            int16 newCol = int16(int8(col)) + (int16(dCol) * int16(i));

            if (newRow < 0 || newRow >= int16(int8(ROWS)) ||
                newCol < 0 || newCol >= int16(int8(COLS))) {
                break;
            }

            if (game.board[uint8(uint16(newCol))][uint8(uint16(newRow))] != player) {
                break;
            }

            count++;
        }

        return count;
    }
}
