/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getNextMatchSlot, getRoundCount } from '@/lib/tournaments/bracket';

export const runtime = 'edge';

/**
 * POST /api/tournaments/[id]/advance
 * Advance a match winner to the next round
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: tournamentId } = params;
    const body = await request.json();
    const { matchId, winnerId } = body;

    if (!matchId || !winnerId) {
      return NextResponse.json(
        { error: 'Missing required fields: matchId, winnerId' },
        { status: 400 }
      );
    }

    // Get tournament
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Get match
    const { data: match } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('id', matchId)
      .eq('tournament_id', tournamentId)
      .single();

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Validate winner is one of the players
    if (winnerId !== match.player1_id && winnerId !== match.player2_id) {
      return NextResponse.json(
        { error: 'Winner must be one of the match players' },
        { status: 400 }
      );
    }

    // Update match with winner
    await supabase
      .from('tournament_matches')
      .update({
        winner_id: winnerId,
        status: 'completed',
      })
      .eq('id', matchId);

    // Mark loser as eliminated
    const loserId = winnerId === match.player1_id ? match.player2_id : match.player1_id;
    if (loserId) {
      await supabase
        .from('tournament_participants')
        .update({ eliminated: true })
        .eq('tournament_id', tournamentId)
        .eq('user_id', loserId);
    }

    // Check if this is the final match
    const totalRounds = getRoundCount(tournament.max_players);

    if (match.round === totalRounds) {
      // This was the finals - tournament is complete
      await supabase
        .from('tournaments')
        .update({
          status: 'completed',
          winner_id: winnerId,
          finished_at: new Date().toISOString(),
        })
        .eq('id', tournamentId);

      // Award prize points
      if (tournament.prize_points > 0) {
        const { data: winner } = await supabase
          .from('users')
          .select('id, total_points')
          .eq('id', winnerId)
          .single();

        if (winner) {
          await supabase
            .from('users')
            .update({ total_points: (winner.total_points || 0) + tournament.prize_points })
            .eq('id', winnerId);
        }
      }

      // Set final positions
      await supabase
        .from('tournament_participants')
        .update({ final_position: 1 })
        .eq('tournament_id', tournamentId)
        .eq('user_id', winnerId);

      if (loserId) {
        await supabase
          .from('tournament_participants')
          .update({ final_position: 2 })
          .eq('tournament_id', tournamentId)
          .eq('user_id', loserId);
      }

      return NextResponse.json({
        success: true,
        tournamentComplete: true,
        winnerId,
      });
    }

    // Advance winner to next match
    const slot = getNextMatchSlot(match.round, match.match_number);

    const { data: nextMatch } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round', slot.round)
      .eq('match_number', slot.matchNumber)
      .single();

    if (nextMatch) {
      const updateField = slot.position === 'player1' ? 'player1_id' : 'player2_id';
      await supabase
        .from('tournament_matches')
        .update({ [updateField]: winnerId })
        .eq('id', nextMatch.id);
    }

    return NextResponse.json({
      success: true,
      tournamentComplete: false,
      nextRound: slot.round,
      nextMatch: slot.matchNumber,
    });
  } catch (error) {
    console.error('[Tournaments API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
