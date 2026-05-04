import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isRemoteLeaderboardEnabled } from '@/lib/env';
import { getSupabase } from '@/lib/supabase';

export type AuthStatus = 'disabled' | 'loading' | 'signed-out' | 'signed-in';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function displayNameForUser(user: User | null): string {
  if (!user) return '';
  const meta = user.user_metadata ?? {};
  const name =
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    (meta.preferred_username as string | undefined) ??
    user.email?.split('@')[0] ??
    'Player';
  return name.trim().slice(0, 60);
}

export function useAuth(): AuthState {
  const remoteEnabled = isRemoteLeaderboardEnabled();
  const [status, setStatus] = useState<AuthStatus>(
    remoteEnabled ? 'loading' : 'disabled',
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!remoteEnabled) {
      setStatus('disabled');
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setStatus('disabled');
      return;
    }

    let cancelled = false;

    sb.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      applySession(data.session ?? null);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      applySession(session ?? null);
    });

    function applySession(session: Session | null) {
      if (cancelled) return;
      if (session?.user) {
        setUser(session.user);
        setStatus('signed-in');
      } else {
        setUser(null);
        setStatus('signed-out');
      }
    }

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [remoteEnabled]);

  const signInWithGoogle = async () => {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured');
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
  };

  return { status, user, signInWithGoogle, signOut };
}
