/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const runtime = 'edge';

/**
 * PATCH /api/friends/[friendshipId]
 * Accept or block a friend request
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { friendshipId: string } }
) {
  try {
    const { friendshipId } = params;
    const body = await request.json();
    const { action, userId } = body;

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, userId' },
        { status: 400 }
      );
    }

    if (!['accept', 'block'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: accept or block' },
        { status: 400 }
      );
    }

    // Get internal user ID
    const { data: user } = await (supabase
      .from('users') as any)
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get friendship
    const { data: friendship } = await (supabase
      .from('friendships') as any)
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      );
    }

    // Only the addressee can accept/block
    if (friendship.addressee_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the recipient can accept or block a friend request' },
        { status: 403 }
      );
    }

    if (friendship.status !== 'pending') {
      return NextResponse.json(
        { error: 'Friendship is not pending' },
        { status: 400 }
      );
    }

    const newStatus = action === 'accept' ? 'accepted' : 'blocked';

    const { error } = await (supabase
      .from('friendships') as any)
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', friendshipId);

    if (error) {
      console.error('[Friends API] Error updating friendship:', error);
      return NextResponse.json(
        { error: 'Failed to update friendship' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
    });
  } catch (error) {
    console.error('[Friends API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/friends/[friendshipId]
 * Remove a friend or cancel a pending request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { friendshipId: string } }
) {
  try {
    const { friendshipId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Get internal user ID
    const { data: user } = await (supabase
      .from('users') as any)
      .select('id')
      .eq('auth_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get friendship and verify user is part of it
    const { data: friendship } = await (supabase
      .from('friendships') as any)
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      );
    }

    if (friendship.requester_id !== user.id && friendship.addressee_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to modify this friendship' },
        { status: 403 }
      );
    }

    const { error } = await (supabase
      .from('friendships') as any)
      .delete()
      .eq('id', friendshipId);

    if (error) {
      console.error('[Friends API] Error deleting friendship:', error);
      return NextResponse.json(
        { error: 'Failed to remove friendship' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('[Friends API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
