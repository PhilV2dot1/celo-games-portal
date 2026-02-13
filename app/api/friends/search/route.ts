/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'edge';

/**
 * GET /api/friends/search?q=username&userId=X
 * Search users by username (for adding friends)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Get internal user ID
    const { data: currentUser } = await (supabase
      .from('users') as any)
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    const excludeId = currentUser?.id;

    // Search users by username (case-insensitive partial match)
    let searchQuery = (supabase
      .from('users') as any)
      .select('id, username, display_name, avatar_url, total_points')
      .ilike('username', `%${query}%`)
      .limit(10);

    if (excludeId) {
      searchQuery = searchQuery.neq('id', excludeId);
    }

    const { data: users, error } = await searchQuery;

    if (error) {
      console.error('[Friends Search API] Error:', error);
      return NextResponse.json(
        { error: 'Failed to search users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: users || [],
    });
  } catch (error) {
    console.error('[Friends Search API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
