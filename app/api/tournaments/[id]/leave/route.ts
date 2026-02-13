/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'edge';

/**
 * POST /api/tournaments/[id]/leave
 * Leave a tournament (only during registration)
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
        { error: 'Cannot leave a tournament that has already started' },
        { status: 400 }
      );
    }

    // Remove participant
    const { error: deleteError } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[Tournaments API] Error leaving:', deleteError);
      return NextResponse.json(
        { error: 'Failed to leave tournament' },
        { status: 500 }
      );
    }

    // Update player count
    const newCount = Math.max(0, tournament.current_players - 1);
    await supabase
      .from('tournaments')
      .update({ current_players: newCount })
      .eq('id', tournamentId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('[Tournaments API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
