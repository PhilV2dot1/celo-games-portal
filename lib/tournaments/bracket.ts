/**
 * Tournament Bracket Logic
 * Generates single elimination brackets and manages match advancement
 */

import type { BracketMatch, TournamentMatch, TournamentParticipant } from './types';

/**
 * Calculate the number of rounds needed for a tournament
 */
export function getRoundCount(maxPlayers: number): number {
  return Math.ceil(Math.log2(maxPlayers));
}

/**
 * Get the label for a round number
 * Round 1 = first round (most matches), highest round = finals
 */
export function getRoundLabel(round: number, totalRounds: number): string {
  const reverseRound = totalRounds - round + 1;
  if (reverseRound === 1) return 'Finals';
  if (reverseRound === 2) return 'Semi-Finals';
  if (reverseRound === 3) return 'Quarter-Finals';
  return `Round ${round}`;
}

/**
 * Generate seed-based matchups for first round
 * Standard bracket seeding: 1v8, 2v7, 3v6, 4v5 (for 8 players)
 */
function generateFirstRoundMatchups(playerCount: number, maxPlayers: number): BracketMatch[] {
  const matches: BracketMatch[] = [];
  const matchCount = maxPlayers / 2;

  for (let i = 0; i < matchCount; i++) {
    const seed1 = i + 1;
    const seed2 = maxPlayers - i;

    matches.push({
      round: 1,
      matchNumber: i + 1,
      player1Seed: seed1 <= playerCount ? seed1 : null,
      player2Seed: seed2 <= playerCount ? seed2 : null,
    });
  }

  return matches;
}

/**
 * Generate all matches for a single elimination bracket
 */
export function generateBracket(
  participants: TournamentParticipant[],
  maxPlayers: number,
  tournamentId: string,
): Omit<TournamentMatch, 'id'>[] {
  const totalRounds = getRoundCount(maxPlayers);
  const matches: Omit<TournamentMatch, 'id'>[] = [];

  // Map seeds to player IDs
  const seedToPlayer: Record<number, string> = {};
  for (const p of participants) {
    seedToPlayer[p.seed] = p.user_id;
  }

  // Generate first round matchups
  const firstRound = generateFirstRoundMatchups(participants.length, maxPlayers);

  for (const matchup of firstRound) {
    const player1Id = matchup.player1Seed ? seedToPlayer[matchup.player1Seed] || null : null;
    const player2Id = matchup.player2Seed ? seedToPlayer[matchup.player2Seed] || null : null;

    // Determine if this is a BYE (one player is null)
    const isBye = (player1Id && !player2Id) || (!player1Id && player2Id);

    matches.push({
      tournament_id: tournamentId,
      round: 1,
      match_number: matchup.matchNumber,
      player1_id: player1Id,
      player2_id: player2Id,
      winner_id: isBye ? (player1Id || player2Id) : null,
      room_id: null,
      status: isBye ? 'bye' : 'pending',
      scheduled_at: null,
      player1_username: undefined,
      player2_username: undefined,
      winner_username: undefined,
    });
  }

  // Generate subsequent rounds (empty matches to be filled)
  for (let round = 2; round <= totalRounds; round++) {
    const matchCount = maxPlayers / Math.pow(2, round);
    for (let i = 0; i < matchCount; i++) {
      matches.push({
        tournament_id: tournamentId,
        round,
        match_number: i + 1,
        player1_id: null,
        player2_id: null,
        winner_id: null,
        room_id: null,
        status: 'pending',
        scheduled_at: null,
        player1_username: undefined,
        player2_username: undefined,
        winner_username: undefined,
      });
    }
  }

  return matches;
}

/**
 * Get the match index that a winner should advance to
 * Returns { round, matchNumber, position: 'player1' | 'player2' }
 */
export function getNextMatchSlot(
  currentRound: number,
  currentMatchNumber: number,
): { round: number; matchNumber: number; position: 'player1' | 'player2' } {
  const nextRound = currentRound + 1;
  const nextMatchNumber = Math.ceil(currentMatchNumber / 2);
  const position = currentMatchNumber % 2 === 1 ? 'player1' : 'player2';

  return { round: nextRound, matchNumber: nextMatchNumber, position };
}

/**
 * Advance bye winners to the next round
 * Should be called after bracket generation to propagate byes
 */
export function propagateByes(
  matches: (Omit<TournamentMatch, 'id'> & { id?: string })[],
  totalRounds: number,
): (Omit<TournamentMatch, 'id'> & { id?: string })[] {
  const updated = [...matches];

  // Process each round starting from round 1
  for (let round = 1; round < totalRounds; round++) {
    const roundMatches = updated.filter(m => m.round === round);

    for (const match of roundMatches) {
      if (match.status === 'bye' && match.winner_id) {
        const slot = getNextMatchSlot(match.round, match.match_number);
        const nextMatch = updated.find(
          m => m.round === slot.round && m.match_number === slot.matchNumber
        );

        if (nextMatch) {
          if (slot.position === 'player1') {
            nextMatch.player1_id = match.winner_id;
          } else {
            nextMatch.player2_id = match.winner_id;
          }

          // If both players of next match come from byes, it's also a bye for higher seed
          if (nextMatch.player1_id && nextMatch.player2_id) {
            // Both slots filled from byes, game should be played normally
          } else if (nextMatch.player1_id && !nextMatch.player2_id) {
            // Check if the opposing match in this round is also complete
            const opposingMatchNum = slot.position === 'player1'
              ? slot.matchNumber * 2
              : slot.matchNumber * 2 - 1;
            const opposingMatch = updated.find(
              m => m.round === round && m.match_number === opposingMatchNum
            );
            // Only mark as bye if the opposing first-round match doesn't exist or is also a bye
            if (!opposingMatch || opposingMatch.status === 'bye') {
              if (opposingMatch?.winner_id) {
                // Other player is also available, this match should be pending
              }
            }
          }
        }
      }
    }
  }

  return updated;
}
