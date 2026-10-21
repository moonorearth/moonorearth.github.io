import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getAllCategories } from '../services/categories';

export function useNavbar(activeTab) {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categories, setCategories] = useState([]);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);

  // Load Categories on mount
  useEffect(() => {
    getAllCategories()
      .then((catData) => setCategories(catData || []))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Realtime Channel for Chat Notifications (Presence Disabled to reduce log volume)
  useEffect(() => {
    const channel = supabase.channel('navbar-global-channel');

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat' }, () => {
        if (activeTab !== 'requests') setHasUnreadChat(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  // Tab Switch Handling
  useEffect(() => {
    setShowNavbar(true);
    setLastScrollY(0);
    if (activeTab === 'requests') setHasUnreadChat(false);
  }, [activeTab]);

  // Scroll Position Listener
  useEffect(() => {
    const handleScroll = (e) => {
      const scrollY = e.target && e.target !== document && e.target !== window 
        ? e.target.scrollTop 
        : window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

      const diff = scrollY - lastScrollY;
      if (Math.abs(diff) < 5) return;

      setShowNavbar(scrollY < 20 || diff < 0);
      setLastScrollY(scrollY);
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [lastScrollY]);

  return { showNavbar, categories, hasUnreadChat, setHasUnreadChat, onlineCount };
}
