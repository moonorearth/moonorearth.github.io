import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getAllCategories } from '../services/categories';

export function useNavbar(activeTab) {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [categories, setCategories] = useState([]);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);

  // Fetch Categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const catData = await getAllCategories();
        setCategories(catData || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Realtime Presence Tracker
  useEffect(() => {
    const channel = supabase.channel('global-presence', {
      config: { presence: { key: Math.random().toString(36).substring(2, 9) } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count > 0 ? count : 1);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Unread Realtime Listener for Chat Tab
  useEffect(() => {
    const channel = supabase
      .channel('chat-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat' },
        () => {
          if (activeTab !== 'requests') {
            setHasUnreadChat(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  // Reset navbar visibility and unread indicator when switching tabs
  useEffect(() => {
    setShowNavbar(true);
    setLastScrollY(0);
    if (activeTab === 'requests') {
      setHasUnreadChat(false);
    }
  }, [activeTab]);

  // Scroll listener to hide/show navbar
  useEffect(() => {
    const handleScroll = (e) => {
      let currentScrollY = 0;
      if (e.target && e.target !== document && e.target !== window) {
        currentScrollY = e.target.scrollTop;
      } else {
        currentScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      }

      const diff = currentScrollY - lastScrollY;
      if (Math.abs(diff) < 5) return;

      if (currentScrollY < 20) {
        setShowNavbar(true);
      } else if (diff > 0) {
        setShowNavbar(false);
      } else if (diff < 0) {
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [lastScrollY]);

  return {
    showNavbar,
    categories,
    hasUnreadChat,
    setHasUnreadChat,
    onlineCount,
  };
}
