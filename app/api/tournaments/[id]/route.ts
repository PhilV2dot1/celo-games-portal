/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'edge';

/**
 * GET /api/tournaments/[id]
 * Get tournament details with participants and matches
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get tournament
    const { data: tournament, error: tError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (tError || !tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Get participants with user info
    const { data: participants } = await supabase
      .from('tournament_participants')
      .select(`
        *,
        users (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('tournament_id', id)
      .order('seed', { ascending: true });

    // Get matches with user info
    const { data: matches } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', id)
      .order('round', { ascending: true })
      .order('match_number', { ascending: true });

    // Enrich matches with usernames
    const participantMap: Record<string, any> = {};
    for (const p of (participants || [])) {
      participantMap[p.user_id] = p.users || {};
    }

    const enrichedMatches = (matches || []).map((m: any) => ({
      ...m,
      player1_username: m.player1_id ? (participantMap[m.player1_id]?.username || participantMap[m.player1_id]?.display_name) : null,
      player2_username: m.player2_id ? (participantMap[m.player2_id]?.username || participantMap[m.player2_id]?.display_name) : null,
      winner_username: m.winner_id ? (participantMap[m.winner_id]?.username || participantMap[m.winner_id]?.display_name) : null,
    }));

    // Flatten participant data
    const flatParticipants = (participants || []).map((p: any) => ({
      tournament_id: p.tournament_id,
      user_id: p.user_id,
      seed: p.seed,
      eliminated: p.eliminated,
      final_position: p.final_position,
      joined_at: p.joined_at,
      username: p.users?.username,
      display_name: p.users?.display_name,
      avatar_url: p.users?.avatar_url,
    }));

    return NextResponse.json({
      success: true,
      tournament,
      participants: flatParticipants,
      matches: enrichedMatches,
    });
  } catch (error) {
    console.error('[Tournaments API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
