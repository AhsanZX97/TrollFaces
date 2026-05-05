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

const log = (...args: unknown[]) => console.log('[auth]', ...args);
const warn = (...args: unknown[]) => console.warn('[auth]', ...args);
const error = (...args: unknown[]) => console.error('[auth]', ...args);

let didLogBoot = false;

/** Strip the auth callback fragment/query so it doesn't leak into routing. */
function logAndClearUrlError() {
  if (typeof window === 'undefined') return;
  const { search, hash } = window.location;
  const params = new URLSearchParams(search);
  const hashParams = new URLSearchParams(
    hash.startsWith('#') ? hash.slice(1) : hash,
  );
  const err =
    params.get('error') ??
    params.get('error_code') ??
    hashParams.get('error') ??
    hashParams.get('error_code');
  const desc =
    params.get('error_description') ?? hashParams.get('error_description');
  if (err || desc) {
    error('OAuth callback returned an error:', { error: err, description: desc });
    error(
      'Most likely cause: redirect URI / client secret mismatch in Google ' +
        'Cloud or the URL is missing from Supabase → Auth → URL Configuration → Redirect URLs.',
    );
  }
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
    if (!didLogBoot) {
      didLogBoot = true;
      const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
      const host = url ? new URL(url).host : '(none)';
      log('boot', {
        remoteEnabled,
        supabaseHost: host,
        origin: window.location.origin,
        href: window.location.href,
      });
      logAndClearUrlError();
    }

    if (!remoteEnabled) {
      setStatus('disabled');
      log('disabled — VITE_SUPABASE_URL/ANON_KEY not set');
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setStatus('disabled');
      warn('disabled — supabase client failed to init');
      return;
    }

    let cancelled = false;

    sb.auth
      .getSession()
      .then(({ data, error: sessionErr }) => {
        if (cancelled) return;
        if (sessionErr) {
          error('getSession() failed', sessionErr);
        }
        log(
          'getSession resolved',
          data.session
            ? { user: data.session.user.email, expiresAt: data.session.expires_at }
            : 'no session',
        );
        applySession(data.session ?? null);
      })
      .catch((e) => {
        if (cancelled) return;
        error('getSession threw', e);
      });

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      log('onAuthStateChange', event, session?.user?.email ?? '(no user)');
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
    if (!sb) {
      error('signInWithGoogle called but Supabase is not configured');
      throw new Error('Supabase is not configured');
    }
    const redirectTo = `${window.location.origin}/`;
    log('signInWithGoogle starting', { redirectTo });
    const { data, error: oauthErr } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (oauthErr) {
      error('signInWithOAuth error (synchronous)', oauthErr);
      throw new Error(oauthErr.message);
    }
    log('signInWithOAuth requested redirect', data?.url ?? '(no url)');
  };

  const signOut = async () => {
    const sb = getSupabase();
    if (!sb) return;
    log('signOut starting');
    const { error: signOutErr } = await sb.auth.signOut();
    if (signOutErr) {
      error('signOut error', signOutErr);
      return;
    }
    log('signOut complete');
  };

  return { status, user, signInWithGoogle, signOut };
}
