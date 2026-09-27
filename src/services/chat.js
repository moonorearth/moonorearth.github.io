import { supabase } from '../lib/supabaseClient';

const PAGE_SIZE = 15;

/**
 * Fetch client IP address to use as hash/identifier
 */
export async function getClientIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data?.ip || 'anonymous_client';
  } catch (err) {
    console.error('Failed to get IP address:', err);
    return 'anonymous_client';
  }
}

/**
 * Fetch Paginated Chat Messages
 */
export async function getChatMessages(page = 0) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('chat')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching chat messages:', error);
    return { chatMessages: [], hasMore: false };
  }

  const items = data || [];
  return {
    chatMessages: items,
    hasMore: count ? to + 1 < count : false,
  };
}

/**
 * Check if the user is on 1-hour cooldown from the database
 */
export async function checkCooldown(ipHash) {
  if (!ipHash || ipHash === 'anonymous_client') {
    return { onCooldown: false, remainingSeconds: 0 };
  }

  const { data, error } = await supabase
    .from('chat')
    .select('created_at')
    .eq('ip_hash', ipHash)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return { onCooldown: false, remainingSeconds: 0 };
  }

  const lastPostTime = new Date(data[0].created_at).getTime();
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - lastPostTime) / 1000);
  const COOLDOWN_DURATION = 3600; // 1 hour in seconds

  if (elapsedSeconds < COOLDOWN_DURATION) {
    return {
      onCooldown: true,
      remainingSeconds: COOLDOWN_DURATION - elapsedSeconds,
    };
  }

  return { onCooldown: false, remainingSeconds: 0 };
}

/**
 * Submit a new chat message
 */
export async function createChatMessage({ name, content, ipHash }) {
  const { data, error } = await supabase
    .from('chat')
    .insert([
      {
        name: name.trim(),
        content: content.trim(),
        ip_hash: ipHash,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Delete a chat message by ID (Admin only)
 */
export async function deleteChatMessage(id) {
  const { error } = await supabase
    .from('chat')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
}