import { useEffect } from 'react';
import { displayNameForUser, useAuth } from '@/features/auth/use-auth';
import { useLeaderboardStore } from '@/features/leaderboard/use-leaderboard-store';

/**
 * Bridges Supabase auth state into the leaderboard store so the rest
 * of the app can stay decoupled from auth specifics.
 *
 * - Signed in   → store.player = { id: auth.uid(), displayName: google name }
 * - Signed out  → store.player cleared (only when remote auth is enabled)
 * - Disabled    → no-op (local-only mode keeps manual displayName flow)
 */
export function AuthSync() {
  const { status, user } = useAuth();
  const setPlayerFromAuth = useLeaderboardStore((s) => s.setPlayerFromAuth);
  const clearPlayer = useLeaderboardStore((s) => s.clearPlayer);

  useEffect(() => {
    if (status === 'signed-in' && user) {
      const displayName = displayNameForUser(user);
      console.log('[auth] sync → player', { id: user.id, displayName });
      setPlayerFromAuth({ id: user.id, displayName });
    } else if (status === 'signed-out') {
      console.log('[auth] sync → clearing player (signed out)');
      clearPlayer();
    }
  }, [status, user, setPlayerFromAuth, clearPlayer]);

  return null;
}
