import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { incrementVideoViews } from '../services/media';
import { getMediaThumbnail } from '../utils/mediaHelpers';

export default function ShortsFeed({ items = [], onLoadMore, hasMore, onSelectCategory }) {
  const feedRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Save scroll position on scroll
  const handleScroll = () => {
    if (feedRef.current) {
      scrollPositionRef.current = feedRef.current.scrollTop;
    }
  };

  // Restore scroll position whenever feed is visible
  useLayoutEffect(() => {
    if (feedRef.current && scrollPositionRef.current > 0) {
      feedRef.current.scrollTop = scrollPositionRef.current;
    }
  });

  const toggleFullscreen = (e) => {
    e?.stopPropagation();
    if (!feedRef.current) return;
    if (!document.fullscreenElement) {
      feedRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={feedRef} 
      onScroll={handleScroll} 
      style={styles.feedContainer}
    >
      <style>{`
        .shorts-top-fullscreen { top: 16px; }
        .shorts-right-stack { bottom: 36px; }
        @media (max-width: 768px) {
          .shorts-top-fullscreen { top: 64px; }
          .shorts-right-stack { bottom: 24px; }
        }
      `}</style>
      {items.map((item, index) => (
        <ShortsCard
          key={`${item.id}-${index}`}
          item={item}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onSelectCategory={onSelectCategory}
        />
      ))}
      {hasMore && (
        <div style={styles.loadMoreTrigger} onClick={onLoadMore}>
          <button style={styles.loadMoreBtn}>Load More</button>
        </div>
      )}
    </div>
  );
}

function ShortsCard({ item, isFullscreen, onToggleFullscreen, onSelectCategory }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [liked, setLiked] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('user_liked_videos') || '[]');
    return saved.includes(item.id);
  });
  const [likeCount, setLikeCount] = useState(item.likes_count || 0);
  const [progress, setProgress] = useState(0);

  const isImage = item.media_type === 'image';
  const displayImageUrl = item.image_url || getMediaThumbnail(item);

  useEffect(() => {
    if (item?.id) incrementVideoViews(item.id);
  }, [item?.id]);

  const togglePlayPause = () => {
    if (isImage || !videoRef.current) return;
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
    else { videoRef.current.play(); setIsPlaying(true); }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current?.duration > 0) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('user_liked_videos') || '[]');
    if (liked) {
      setLiked(false);
      setLikeCount((p) => Math.max(0, p - 1));
      localStorage.setItem('user_liked_videos', JSON.stringify(saved.filter((id) => id !== item.id)));
    } else {
      setLiked(true);
      setLikeCount((p) => p + 1);
      saved.push(item.id);
      localStorage.setItem('user_liked_videos', JSON.stringify(saved));
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = item.video_url || displayImageUrl || item.embed_url || window.location.href;
    if (navigator.share) try { await navigator.share({ title: item.title, url: shareUrl }); } catch { }
    else { navigator.clipboard.writeText(shareUrl); alert('Link copied to clipboard!'); }
  };

  // Categories list fallback
  const categoriesList = item.categories || (item.category ? [item.category] : []);

  return (
    <div style={styles.cardContainer}>
      <button className="shorts-top-fullscreen" style={styles.topRightFullscreenBtn} onClick={onToggleFullscreen}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          {isFullscreen ? (
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          ) : (
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          )}
        </svg>
      </button>

      <div style={styles.mediaWrapper} onClick={togglePlayPause}>
        {isImage ? (
          <img src={displayImageUrl} alt={item.title || 'Media'} style={styles.media} />
        ) : item.video_url ? (
          <video ref={videoRef} src={item.video_url} style={styles.media} autoPlay loop playsInline onTimeUpdate={handleTimeUpdate} />
        ) : (
          <iframe src={`${item.embed_url}?autoplay=1`} title={item.title} style={styles.media} allow="autoplay; encrypted-media" />
        )}
        {!isImage && !isPlaying && (
          <div style={styles.pausedOverlay}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff"><path d="M8 5v14l11-7z" /></svg>
          </div>
        )}
      </div>

      {/* Bottom Left: Title + Category Tags Above */}
      <div style={styles.bottomLeftInfo}>
        {categoriesList.length > 0 && (
          <div style={styles.tagRow}>
            {categoriesList.map((cat, idx) => (
              <span
                key={cat.id || idx}
                style={styles.categoryBadge}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory?.(cat);
                }}
              >
                #{typeof cat === 'string' ? cat : cat.name}
              </span>
            ))}
          </div>
        )}
        <h3 style={styles.title}>{item.title || 'Untitled'}</h3>
      </div>

      {/* Right Action Stack: Likes, Views, Share */}
      <div className="shorts-right-stack" style={styles.rightActionStack}>
        <div style={styles.actionItem}>
          <button style={styles.circleBtn} onClick={handleLike}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? '#ff3b30' : 'none'} stroke={liked ? '#ff3b30' : '#ffffff'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <span style={styles.badgeText}>{likeCount}</span>
        </div>

        <div style={styles.actionItem}>
          <div style={{ ...styles.circleBtn, pointerEvents: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span style={styles.badgeText}>{item.views_count || 0}</span>
        </div>

        <div style={styles.actionItem}>
          <button style={styles.circleBtn} onClick={handleShare}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </div>

      {!isImage && (
        <div style={styles.seekBarTrack}>
          <div style={{ ...styles.seekBarFill, width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

const styles = {
  feedContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: '440px',
    height: '100vh',
    margin: '0 auto',
    overflowY: 'scroll',
    scrollSnapType: 'y mandatory',
    overscrollBehaviorY: 'contain',
    scrollbarWidth: 'none',
    backgroundColor: '#000',
    zIndex: 1,
  },
  cardContainer: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    scrollSnapAlign: 'start',
    scrollSnapStop: 'always',
    backgroundColor: '#000',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaWrapper: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  media: { width: '100%', height: '100%', objectFit: 'cover', border: 'none' },
  pausedOverlay: { position: 'absolute', pointerEvents: 'none', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '50%', padding: '12px' },
  topRightFullscreenBtn: {
    position: 'absolute', right: '16px', zIndex: 20, width: '40px', height: '40px',
    borderRadius: '50%', backgroundColor: 'rgba(20, 20, 20, 0.6)', border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  bottomLeftInfo: { position: 'absolute', bottom: '24px', left: '16px', right: '80px', zIndex: 10, pointerEvents: 'none' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', pointerEvents: 'auto' },
  categoryBadge: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.9rem',
    fontStyle: 'italic',
    fontWeight: '500',
    cursor: 'pointer',
    background: 'none',
    padding: 0,
    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
  },
  title: { color: '#fff', fontSize: '0.9rem', margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.8)' },
  rightActionStack: {
    position: 'absolute', right: '12px', display: 'flex', flexDirection: 'column',
    gap: '14px', alignItems: 'center', zIndex: 10,
  },
  actionItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  circleBtn: {
    width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(20, 20, 20, 0.6)',
    backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
  },  
  badgeText: { color: '#fff', fontSize: '0.7rem', fontWeight: '600' },
  seekBarTrack: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.2)', pointerEvents: 'none', zIndex: 15 },
  seekBarFill: { height: '100%', backgroundColor: '#fff' },
  loadMoreTrigger: { height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'start' },
  loadMoreBtn: { backgroundColor: '#1f1f1f', color: '#fff', border: '1px solid #333', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' },
};