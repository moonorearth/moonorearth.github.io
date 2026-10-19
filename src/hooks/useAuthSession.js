import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function useAuthSession() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session && !error) {
        const userIsAdmin = session.user?.app_metadata?.role === 'admin';
        const loginTimestamp = localStorage.getItem('login_timestamp');
        const now = Date.now();

        // 24-hour expiry check for NON-ADMIN users
        if (!userIsAdmin && loginTimestamp && (now - parseInt(loginTimestamp, 10)) > TWENTY_FOUR_HOURS_MS) {
          await supabase.auth.signOut();
          localStorage.removeItem('login_timestamp');
          setIsUnlocked(false);
          setIsAdmin(false);
        } else {
          setIsUnlocked(true);
          setIsAdmin(userIsAdmin);
        }
      } else {
        setIsUnlocked(false);
        setIsAdmin(false);
      }
      setCheckingAuth(false);
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session) || !session) {
        setIsUnlocked(false);
        setIsAdmin(false);
        localStorage.removeItem('login_timestamp');
      } else if (session) {
        const userIsAdmin = session.user?.app_metadata?.role === 'admin';
        setIsUnlocked(true);
        setIsAdmin(userIsAdmin);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUnlock = ({ isAdmin }) => {
    localStorage.setItem('login_timestamp', Date.now().toString());
    setIsAdmin(isAdmin);
    setIsUnlocked(true);
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    setIsAdmin(false);
    localStorage.removeItem('login_timestamp');
  };

  return {
    isUnlocked,
    isAdmin,
    setIsAdmin,
    setIsUnlocked,
    checkingAuth,
    handleUnlock,
    handleLogout,
  };
}
