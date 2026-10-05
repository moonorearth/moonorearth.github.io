import React, { useState } from 'react';
import { getMediaThumbnail } from '../utils/mediaHelpers';
import { incrementLikes, decrementLikes } from '../services/media';

export default function MediaCard({ video, onSelect, isAdmin, onModify }) {
  const thumbnailUrl = getMediaThumbnail(video);
  const isImage = video?.media_type === 'image';
  const categories = video?.categories || [];

  const [liked, setLiked] = useState(() => {
    const savedLikes = JSON.parse(localStorage.getItem('user_liked_videos') || '[]');
    return savedLikes.includes(video?.id);
  });

  const [likeCount, setLikeCount] = useState(video?.likes_count || 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    const savedLikes = JSON.parse(localStorage.getItem('user_liked_videos') || '[]');

    if (liked) {
      setLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
      const updatedLikes = savedLikes.filter((id) => id !== video?.id);
      localStorage.setItem('user_liked_videos', JSON.stringify(updatedLikes));
      await decrementLikes(video?.id);
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
      savedLikes.push(video?.id);
      localStorage.setItem('user_liked_videos', JSON.stringify(savedLikes));
      await incrementLikes(video?.id);
    }
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onModify) onModify(video);
  };

  return (
    <div
      className="pin-card"
      style={styles.card}
      onClick={() => onSelect(video)}
    >
      <style>{`
        .pin-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          break-inside: avoid;
          margin-bottom: 20px;
          background-color: #1a1a1a;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .pin-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6);
        }
        .pin-card .hover-overlay {
          opacity: 0;
          transition: opacity 0.25s ease-in-out;
        }
        .pin-card:hover .hover-overlay {
          opacity: 1;
        }
        .pin-card .play-overlay {
          transition: opacity 0.25s ease;
        }
        .pin-card:hover .play-overlay {
          opacity: 0.2;
        }
        .like-trigger {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          will-change: transform;
        }
        .like-trigger:hover {
          transform: scale(1.12) translateZ(0);
        }
        .like-trigger:active {
          transform: scale(0.92) translateZ(0);
        }
      `}</style>

      {/* Natural Aspect Ratio Wrapper */}
      <div style={styles.mediaContainer}>
        <img
          src={thumbnailUrl}
          alt={video?.title || 'Media item'}
          style={styles.thumbnail}
          onError={(e) => {
            if (e.target.src !== video?.image_url && video?.image_url) {
              e.target.src = video.image_url;
            } else {
              e.target.src = '/placeholder.jpg';
            }
          }}
        />

        {/* Top-Left Media Badge */}
        <div className="play-overlay" style={styles.playOverlay}>
          {isImage ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </div>

        {/* Admin Edit Button */}
        {isAdmin && (
          <button
            style={styles.editIconBtn}
            title="Edit Media"
            onClick={handleEditClick}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}

        {/* Hover Gradient Overlay */}
        <div className="hover-overlay" style={styles.hoverOverlay}>
          {/* Title at top */}
          <div style={styles.topInfo}>
            <h3 style={styles.title}>{video?.title || 'Untitled'}</h3>
          </div>

          {/* Bottom Metadata Bar */}
          <div style={styles.bottomBar}>
            <div style={styles.metaContainer}>
              {categories.length > 0 && (
                <div style={styles.categoriesRow}>
                  {categories.map((cat) => (
                    <span key={cat.id || cat.name} style={styles.categoryTag}>
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              <div style={styles.meta}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {video?.views_count || 0}
                </span>
                <span>•</span>
                <span>
                  {video?.created_at
                    ? new Date(video.created_at).toLocaleDateString()
                    : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Like Control (Clean, perfectly symmetrical SVG heart) */}
        <div className="like-trigger" style={styles.likeWrapper} onClick={handleLike} title="Like">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={liked ? '#ff3b30' : '#ffffff'}
            style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.85))' }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span style={styles.likeCountText}>
            {likeCount}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: 'relative',
    width: '100%',
    display: 'block',
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#101010',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'cover',
  },
  playOverlay: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    backdropFilter: 'blur(6px)',
    borderRadius: '50%',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    pointerEvents: 'none',
    zIndex: 2,
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  editIconBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    padding: 0,
  },
  hoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '14px',
    pointerEvents: 'none',
    zIndex: 3,
  },
  topInfo: {
    width: '100%',
  },
  title: {
    color: '#ffffff',
    fontSize: '0.80rem',
    fontWeight: '600',
    margin: 0,
    lineHeight: '1.3',
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.9)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  bottomBar: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingRight: '50px',
  },
  metaContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  categoriesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
    color: '#ffffff',
    padding: '2px 7px',
    borderRadius: '10px',
    fontSize: '0.68rem',
    fontWeight: '600',
    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#e0e0e0',
    fontSize: '0.78rem',
    fontWeight: '500',
    textShadow: '0 1px 3px rgba(0,0,0,0.9)',
  },
  likeWrapper: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    cursor: 'pointer',
    zIndex: 5,
    padding: 0,
    userSelect: 'none',
  },
  likeCountText: {
    color: '#ffffff',
    fontSize: '0.78rem',
    fontWeight: '600',
    lineHeight: '1',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)',
  },
};
