// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Poker
 * @dev Texas Hold'em solo game (player vs dealer AI) on-chain.
 * @notice The contract generates a shuffled deck using block-based randomness,
 *         deals hole cards and community cards, evaluates both hands server-side,
 *         and returns the outcome. A small fee is collected per hand.
 *
 * IMPORTANT: block-based randomness (blockhash + timestamp) is not cryptographically
 * secure against miner manipulation. For a production deployment, use Chainlink VRF.
 */
contract Poker {

    // ========================================
    // CONSTANTS
    // ========================================

    uint256 public constant HAND_FEE = 0.001 ether;   // Fee per hand (adjustable)

    // Hand ranks (0 = high card ... 9 = royal flush)
    uint8 constant HIGH_CARD       = 0;
    uint8 constant ONE_PAIR        = 1;
    uint8 constant TWO_PAIR        = 2;
    uint8 constant THREE_OF_A_KIND = 3;
    uint8 constant STRAIGHT        = 4;
    uint8 constant FLUSH           = 5;
    uint8 constant FULL_HOUSE      = 6;
    uint8 constant FOUR_OF_A_KIND  = 7;
    uint8 constant STRAIGHT_FLUSH  = 8;
    uint8 constant ROYAL_FLUSH     = 9;

    // ========================================
    // STRUCTS & STATE
    // ========================================

    struct PlayerStats {
        uint256 handsPlayed;
        uint256 handsWon;
        uint256 biggestPot;
    }

    mapping(address => PlayerStats) public playerStats;
    uint256 public totalHandsPlayed;
    address public owner;

    // ========================================
    // EVENTS
    // ========================================

    event HandPlayed(
        address indexed player,
        uint8[] holeCards,
        uint8[] communityCards,
        uint8 handRank,
        string outcome
    );

    event FeeWithdrawn(address indexed to, uint256 amount);

    // ========================================
    // CONSTRUCTOR
    // ========================================

    constructor() {
        owner = msg.sender;
    }

    // ========================================
    // MODIFIERS
    // ========================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ========================================
    // MAIN GAME FUNCTION
    // ========================================

    /**
     * @dev Play a hand of Texas Hold'em against the dealer.
     * @notice Requires payment of HAND_FEE. Returns the dealt cards and outcome.
     * @return holeCards     Player's 2 hole cards (uint8 encoded: 1–52)
     * @return communityCards 5 community cards
     * @return handRank      Best hand rank achieved by the player (0–9)
     * @return outcome       "win", "lose", or "split"
     */
    function playHand()
        external
        payable
        returns (
            uint8[] memory holeCards,
            uint8[] memory communityCards,
            uint8 handRank,
            string memory outcome
        )
    {
        require(msg.value >= HAND_FEE, "Insufficient fee");

        // ── Generate pseudo-random deck ────────────────────────────────────────
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    msg.sender,
                    playerStats[msg.sender].handsPlayed
                )
            )
        );

        uint8[52] memory deck = _shuffleDeck(seed);

        // ── Deal cards ────────────────────────────────────────────────────────
        // Player: deck[0], deck[1]
        // Dealer: deck[2], deck[3]
        // Community: deck[4]–deck[8]
        holeCards = new uint8[](2);
        holeCards[0] = deck[0];
        holeCards[1] = deck[1];

        uint8[2] memory dealerHole;
        dealerHole[0] = deck[2];
        dealerHole[1] = deck[3];

        communityCards = new uint8[](5);
        for (uint8 i = 0; i < 5; i++) {
            communityCards[i] = deck[4 + i];
        }

        // ── Evaluate hands ────────────────────────────────────────────────────
        uint8[7] memory playerSeven;
        playerSeven[0] = holeCards[0];
        playerSeven[1] = holeCards[1];
        for (uint8 i = 0; i < 5; i++) playerSeven[2 + i] = communityCards[i];

        uint8[7] memory dealerSeven;
        dealerSeven[0] = dealerHole[0];
        dealerSeven[1] = dealerHole[1];
        for (uint8 i = 0; i < 5; i++) dealerSeven[2 + i] = communityCards[i];

        (uint8 playerRank, uint256 playerScore) = _bestHand(playerSeven);
        (, uint256 dealerScore) = _bestHand(dealerSeven);

        handRank = playerRank;

        // ── Determine outcome ─────────────────────────────────────────────────
        if (playerScore > dealerScore) {
            outcome = "win";
        } else if (dealerScore > playerScore) {
            outcome = "lose";
        } else {
            outcome = "split";
        }

        // ── Update stats ──────────────────────────────────────────────────────
        PlayerStats storage stats = playerStats[msg.sender];
        stats.handsPlayed++;
        if (keccak256(bytes(outcome)) == keccak256(bytes("win"))) {
            stats.handsWon++;
        }
        if (msg.value > stats.biggestPot) {
            stats.biggestPot = msg.value;
        }
        totalHandsPlayed++;

        emit HandPlayed(msg.sender, holeCards, communityCards, handRank, outcome);
    }

    // ========================================
    // VIEW FUNCTIONS
    // ========================================

    /**
     * @dev Get statistics for the calling player.
     * @return handsPlayed  Total hands played
     * @return handsWon     Total hands won
     * @return biggestPot   Biggest bet placed
     * @return winRate      Win rate in basis points (0–10000, divide by 100 for %)
     */
    function getStats()
        external
        view
        returns (
            uint256 handsPlayed,
            uint256 handsWon,
            uint256 biggestPot,
            uint256 winRate
        )
    {
        PlayerStats memory s = playerStats[msg.sender];
        handsPlayed = s.handsPlayed;
        handsWon = s.handsWon;
        biggestPot = s.biggestPot;
        winRate = s.handsPlayed > 0 ? (s.handsWon * 10000) / s.handsPlayed : 0;
    }

    // ========================================
    // OWNER FUNCTIONS
    // ========================================

    /**
     * @dev Withdraw accumulated fees to owner.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        (bool ok, ) = owner.call{value: balance}("");
        require(ok, "Transfer failed");
        emit FeeWithdrawn(owner, balance);
    }

    /**
     * @dev Transfer ownership.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }

    // ========================================
    // INTERNAL: DECK SHUFFLE (Fisher-Yates)
    // ========================================

    function _shuffleDeck(uint256 seed) internal pure returns (uint8[52] memory deck) {
        // Initialize deck: cards 1–52
        for (uint8 i = 0; i < 52; i++) {
            deck[i] = i + 1;
        }
        // Fisher-Yates shuffle
        for (uint8 i = 51; i > 0; i--) {
            uint8 j = uint8(uint256(keccak256(abi.encodePacked(seed, i))) % (i + 1));
            (deck[i], deck[j]) = (deck[j], deck[i]);
        }
    }

    // ========================================
    // INTERNAL: HAND EVALUATION
    // ========================================

    /**
     * @dev Evaluate the best 5-card hand from 7 cards.
     * @return rank  Hand rank (0 = high card, 9 = royal flush)
     * @return score Numeric score for comparison (higher = better hand)
     */
    function _bestHand(uint8[7] memory cards)
        internal
        pure
        returns (uint8 rank, uint256 score)
    {
        // Generate all C(7,5) = 21 combinations and find the best
        uint8[5][21] memory combos = _getCombinations(cards);

        rank = 0;
        score = 0;

        for (uint8 c = 0; c < 21; c++) {
            (uint8 r, uint256 s) = _scoreHand(combos[c]);
            if (s > score) {
                score = s;
                rank = r;
            }
        }
    }

    /**
     * @dev Score a 5-card hand.
     * @return rank  0–9 hand rank
     * @return score Rank base + tiebreaker (base-15 positional encoding)
     */
    function _scoreHand(uint8[5] memory cards)
        internal
        pure
        returns (uint8 rank, uint256 score)
    {
        // Decode card values (1–13) and suits (0–3)
        uint8[5] memory vals;
        uint8[5] memory suits;
        for (uint8 i = 0; i < 5; i++) {
            vals[i] = ((cards[i] - 1) % 13) + 1;   // 1–13 (Ace=1)
            suits[i] = (cards[i] - 1) / 13;          // 0–3
        }

        // Ace-high: treat Ace as 14 for sorting
        uint8[5] memory ranks;
        for (uint8 i = 0; i < 5; i++) {
            ranks[i] = vals[i] == 1 ? 14 : vals[i];
        }
        ranks = _sortDesc(ranks);

        bool flush = _isFlush(suits);
        bool straight = _isStraight(ranks);
        uint8 straightHigh = _straightHigh(ranks);

        // Group by rank
        uint8[15] memory counts; // counts[rank] = number of cards with that rank
        for (uint8 i = 0; i < 5; i++) {
            counts[ranks[i]]++;
        }

        // Find groups sorted by count desc then rank desc
        uint8[5] memory groupRanks;  // rank of each group
        uint8[5] memory groupCounts; // count of each group
        uint8 numGroups = 0;
        // Sort: find all groups, insertion sort by (count desc, rank desc)
        for (uint8 r = 14; r >= 2; r--) {
            if (counts[r] > 0) {
                uint8 pos = numGroups;
                while (pos > 0 && (groupCounts[pos-1] < counts[r] || (groupCounts[pos-1] == counts[r] && groupRanks[pos-1] < r))) {
                    groupCounts[pos] = groupCounts[pos-1];
                    groupRanks[pos] = groupRanks[pos-1];
                    pos--;
                }
                groupCounts[pos] = counts[r];
                groupRanks[pos] = r;
                numGroups++;
            }
        }

        // Base scores per rank (1M gap between each)
        uint256[10] memory BASE = [
            uint256(0),          // HIGH_CARD
            1_000_000,           // ONE_PAIR
            2_000_000,           // TWO_PAIR
            3_000_000,           // THREE_OF_A_KIND
            4_000_000,           // STRAIGHT
            5_000_000,           // FLUSH
            6_000_000,           // FULL_HOUSE
            7_000_000,           // FOUR_OF_A_KIND
            8_000_000,           // STRAIGHT_FLUSH
            9_000_000            // ROYAL_FLUSH
        ];

        // tb(r0, r1, r2, r3, r4) base-15 positional tiebreaker (max ~759k < 1M)
        // Royal Flush
        if (flush && straight && straightHigh == 14) {
            return (ROYAL_FLUSH, BASE[9] + straightHigh);
        }
        // Straight Flush
        if (flush && straight) {
            return (STRAIGHT_FLUSH, BASE[8] + straightHigh);
        }
        // Four of a Kind
        if (groupCounts[0] == 4) {
            uint256 tb = uint256(groupRanks[0]) * 15 + (numGroups > 1 ? groupRanks[1] : 0);
            return (FOUR_OF_A_KIND, BASE[7] + tb);
        }
        // Full House
        if (groupCounts[0] == 3 && numGroups > 1 && groupCounts[1] == 2) {
            uint256 tb = uint256(groupRanks[0]) * 15 + groupRanks[1];
            return (FULL_HOUSE, BASE[6] + tb);
        }
        // Flush
        if (flush) {
            uint256 tb = _tb5(ranks);
            return (FLUSH, BASE[5] + tb);
        }
        // Straight
        if (straight) {
            return (STRAIGHT, BASE[4] + straightHigh);
        }
        // Three of a Kind
        if (groupCounts[0] == 3) {
            uint256 tb = uint256(groupRanks[0]) * 225
                + (numGroups > 1 ? uint256(groupRanks[1]) : 0) * 15
                + (numGroups > 2 ? uint256(groupRanks[2]) : 0);
            return (THREE_OF_A_KIND, BASE[3] + tb);
        }
        // Two Pair
        if (groupCounts[0] == 2 && numGroups > 1 && groupCounts[1] == 2) {
            uint256 tb = uint256(groupRanks[0]) * 225
                + uint256(groupRanks[1]) * 15
                + (numGroups > 2 ? uint256(groupRanks[2]) : 0);
            return (TWO_PAIR, BASE[2] + tb);
        }
        // One Pair
        if (groupCounts[0] == 2) {
            uint256 tb = uint256(groupRanks[0]) * 3375
                + (numGroups > 1 ? uint256(groupRanks[1]) : 0) * 225
                + (numGroups > 2 ? uint256(groupRanks[2]) : 0) * 15
                + (numGroups > 3 ? uint256(groupRanks[3]) : 0);
            return (ONE_PAIR, BASE[1] + tb);
        }
        // High Card
        return (HIGH_CARD, _tb5(ranks));
    }

    // ========================================
    // INTERNAL: HELPERS
    // ========================================

    function _isFlush(uint8[5] memory suits) internal pure returns (bool) {
        for (uint8 i = 1; i < 5; i++) {
            if (suits[i] != suits[0]) return false;
        }
        return true;
    }

    function _isStraight(uint8[5] memory ranks) internal pure returns (bool) {
        // Wheel: A-2-3-4-5 (ranks sorted desc: 14,5,4,3,2)
        if (ranks[0] == 14 && ranks[1] == 5 && ranks[2] == 4 && ranks[3] == 3 && ranks[4] == 2) {
            return true;
        }
        for (uint8 i = 0; i < 4; i++) {
            if (ranks[i] - ranks[i + 1] != 1) return false;
        }
        return true;
    }

    function _straightHigh(uint8[5] memory ranks) internal pure returns (uint8) {
        // Wheel high card is 5
        if (ranks[0] == 14 && ranks[1] == 5) return 5;
        return ranks[0];
    }

    function _sortDesc(uint8[5] memory arr) internal pure returns (uint8[5] memory) {
        for (uint8 i = 0; i < 4; i++) {
            for (uint8 j = i + 1; j < 5; j++) {
                if (arr[j] > arr[i]) {
                    (arr[i], arr[j]) = (arr[j], arr[i]);
                }
            }
        }
        return arr;
    }

    /// @dev base-15 tiebreaker for 5 values (max ≈ 759k < 1M gap between ranks)
    function _tb5(uint8[5] memory r) internal pure returns (uint256) {
        return uint256(r[0]) * 50625
             + uint256(r[1]) * 3375
             + uint256(r[2]) * 225
             + uint256(r[3]) * 15
             + uint256(r[4]);
    }

    /**
     * @dev Generate all C(7,5) = 21 combinations from 7 cards.
     */
    function _getCombinations(uint8[7] memory cards)
        internal
        pure
        returns (uint8[5][21] memory combos)
    {
        uint8 idx = 0;
        for (uint8 a = 0; a < 3; a++) {
            for (uint8 b = a + 1; b < 4; b++) {
                for (uint8 c = b + 1; c < 5; c++) {
                    for (uint8 d = c + 1; d < 6; d++) {
                        for (uint8 e = d + 1; e < 7; e++) {
                            combos[idx][0] = cards[a];
                            combos[idx][1] = cards[b];
                            combos[idx][2] = cards[c];
                            combos[idx][3] = cards[d];
                            combos[idx][4] = cards[e];
                            idx++;
                        }
                    }
                }
            }
        }
    }

    // ========================================
    // FALLBACK
    // ========================================

    receive() external payable {}
}
