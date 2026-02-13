/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { startTournament } from '@/lib/tournaments/start';

export const runtime = 'edge';

/**
 * POST /api/tournaments/[id]/join
 * Join a tournament
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: tournamentId } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get internal user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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

    if (tournament.status !== 'registration') {
      return NextResponse.json(
        { error: 'Tournament is not open for registration' },
        { status: 400 }
      );
    }

    if (tournament.current_players >= tournament.max_players) {
      return NextResponse.json(
        { error: 'Tournament is full' },
        { status: 400 }
      );
    }

    // Check if already joined
    const { data: existing } = await supabase
      .from('tournament_participants')
      .select('user_id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Already joined this tournament' },
        { status: 409 }
      );
    }

    // Join tournament
    const newSeed = tournament.current_players + 1;

    const { error: joinError } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: tournamentId,
        user_id: user.id,
        seed: newSeed,
      });

    if (joinError) {
      console.error('[Tournaments API] Error joining:', joinError);
      return NextResponse.json(
        { error: 'Failed to join tournament' },
        { status: 500 }
      );
    }

    // Update player count
    const newCount = tournament.current_players + 1;
    await supabase
      .from('tournaments')
      .update({ current_players: newCount })
      .eq('id', tournamentId);

    // If tournament is now full, start it
    let started = false;
    if (newCount >= tournament.max_players) {
      started = await startTournament(tournamentId);
    }

    return NextResponse.json({
      success: true,
      seed: newSeed,
      started,
    });
  } catch (error) {
    console.error('[Tournaments API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
