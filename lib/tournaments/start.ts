/**
 * Tournament Start Logic
 * Handles starting a tournament: generates bracket, creates matches, updates status
 */

import { supabase } from '@/lib/supabase/client';
import { generateBracket, propagateByes, getRoundCount } from './bracket';
import type { TournamentParticipant } from './types';

/**
 * Start a tournament - generates bracket and inserts all matches
 * Called when tournament reaches max_players or starts_at time
 */
export async function startTournament(tournamentId: string): Promise<boolean> {
  try {
    // Get tournament details
    const { data: tournament, error: tError } = await (supabase
      .from('tournaments') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tError || !tournament) {
      console.error('[Tournament Start] Tournament not found:', tError);
      return false;
    }

    if (tournament.status !== 'registration') {
      console.error('[Tournament Start] Tournament is not in registration:', tournament.status);
      return false;
    }

    // Get participants
    const { data: participants, error: pError } = await (supabase
      .from('tournament_participants') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('seed', { ascending: true });

    if (pError || !participants || participants.length < 2) {
      console.error('[Tournament Start] Not enough participants:', pError);
      return false;
    }

    // Generate bracket
    const matches = generateBracket(
      participants as TournamentParticipant[],
      tournament.max_players,
      tournamentId,
    );

    // Propagate byes
    const totalRounds = getRoundCount(tournament.max_players);
    const propagatedMatches = propagateByes(matches, totalRounds);

    // Insert matches
    // Remove optional fields that are undefined for database insert
    const matchesForInsert = propagatedMatches.map(m => ({
      tournament_id: m.tournament_id,
      round: m.round,
      match_number: m.match_number,
      player1_id: m.player1_id,
      player2_id: m.player2_id,
      winner_id: m.winner_id,
      room_id: m.room_id,
      status: m.status,
      scheduled_at: m.scheduled_at,
    }));

    const { error: mError } = await (supabase
      .from('tournament_matches') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .insert(matchesForInsert);

    if (mError) {
      console.error('[Tournament Start] Failed to insert matches:', mError);
      return false;
    }

    // Update tournament status
    const { error: uError } = await (supabase
      .from('tournaments') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', tournamentId);

    if (uError) {
      console.error('[Tournament Start] Failed to update tournament status:', uError);
      return false;
    }

    console.log(`[Tournament Start] Tournament ${tournamentId} started with ${participants.length} players, ${matchesForInsert.length} matches`);
    return true;
  } catch (error) {
    console.error('[Tournament Start] Error:', error);
    return false;
  }
}
