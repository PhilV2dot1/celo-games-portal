/**
 * Multiplayer Utilities
 * Helper functions for multiplayer operations
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase/client';

/**
 * Get or create a user in the users table from their Supabase Auth ID
 * This ensures users exist even if the auto-create trigger didn't fire
 */
export async function getOrCreateUserFromAuthId(authUserId: string): Promise<{ id: string; auth_user_id: string } | null> {
  // First, try to find existing user
  const { data: existingUser } = await (supabase
    .from('users') as any)
    .select('id, auth_user_id')
    .eq('auth_user_id', authUserId)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // User doesn't exist, try to get auth user info and create profile
  const { data: authData } = await supabase.auth.admin.getUserById(authUserId).catch(() => ({ data: null }));

  // If we can't get auth data, try to create with minimal info
  const email = authData?.user?.email || null;
  const username = email
    ? email.split('@')[0]
    : `Player_${authUserId.substring(0, 8)}`;

  // Insert new user
  const { data: newUser, error } = await (supabase
    .from('users') as any)
    .insert({
      auth_user_id: authUserId,
      email: email,
      username: username,
      auth_provider: 'oauth',
      is_anonymous: false,
      claimed_at: new Date().toISOString(),
      total_points: 0,
      avatar_type: 'default',
    })
    .select('id, auth_user_id')
    .single();

  if (error) {
    console.error('[Multiplayer Utils] Error creating user:', error);

    // Maybe user was created by another request, try to fetch again
    const { data: retryUser } = await (supabase
      .from('users') as any)
      .select('id, auth_user_id')
      .eq('auth_user_id', authUserId)
      .single();

    return retryUser || null;
  }

  console.log('[Multiplayer Utils] Created new user profile:', newUser);
  return newUser;
}
