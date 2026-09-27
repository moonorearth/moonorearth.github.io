import { useState, useEffect, useCallback } from 'react';
import {
  getChatMessages,
  createChatMessage,
  deleteChatMessage,
  checkCooldown,
  getClientIp,
} from '../services/chat';

export function useChat(isUnlocked) {
  const [chatMessages, setChatMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('Anonymous');
  const [content, setContent] = useState('');
  const [ipHash, setIpHash] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch client IP on mount
  useEffect(() => {
    async function initIp() {
      const ip = await getClientIp();
      setIpHash(ip);
    }
    initIp();
  }, []);

  // Check 1-hour cooldown
  useEffect(() => {
    if (!ipHash) return;

    async function verifyCooldown() {
      const res = await checkCooldown(ipHash);
      if (res.onCooldown) {
        setCooldownSeconds(res.remainingSeconds);
      }
    }
    verifyCooldown();
  }, [ipHash]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Fetch paginated messages
  const loadChatList = useCallback(async (pageNum = 0) => {
    if (!isUnlocked) return;

    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    const result = await getChatMessages(pageNum);

    setChatMessages((prev) => (pageNum === 0 ? result.chatMessages : [...prev, ...result.chatMessages]));
    setHasMore(result.hasMore);
    setLoading(false);
    setLoadingMore(false);
  }, [isUnlocked]);

  useEffect(() => {
    loadChatList(0);
  }, [loadChatList]);

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadChatList(nextPage);
  };

  // Delete message handler
  const deleteMessage = async (id) => {
    try {
      await deleteChatMessage(id);
      setChatMessages((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message.');
    }
  };

  // Submit message
  const submitMessage = async (e) => {
    e?.preventDefault();
    setFormError('');
    setFormSuccess('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Name is required.');
      return;
    }
    if (trimmedName.length > 10) {
      setFormError('Name must be 10 characters or less.');
      return;
    }
    if (!/^[a-zA-Z]+$/.test(trimmedName)) {
      setFormError('Name must contain letters only (A-Z, a-z).');
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setFormError('Content is required.');
      return;
    }
    if (trimmedContent.length > 2000) {
      setFormError('Content must be 2,000 characters or less.');
      return;
    }

    if (cooldownSeconds > 0) {
      setFormError('You are currently on a 1-hour posting cooldown.');
      return;
    }

    setSubmitting(true);

    try {
      const newPost = await createChatMessage({
        name: trimmedName,
        content: trimmedContent,
        ipHash,
      });

      setChatMessages((prev) => [newPost, ...prev]);
      setName('Anonymous');
      setContent('');
      setFormSuccess('Message posted successfully!');
      setCooldownSeconds(3600);
    } catch (err) {
      console.error('Error submitting message:', err);
      setFormError('Failed to post message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    chatMessages,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    name,
    setName,
    content,
    setContent,
    formError,
    formSuccess,
    cooldownSeconds,
    submitting,
    submitMessage,
    deleteMessage,
  };
}