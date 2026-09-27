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
    if (onModify) {
      onModify(video);
    }
  };

  return (
    <div
      className="animated-card"
      style={styles.card}
      onClick={() => onSelect(video)}
    >
      <div style={styles.thumbnailContainer}>
        <img
          src={thumbnailUrl}
          alt={video?.title || 'Media item'}
          style={styles.thumbnail}
          onError={(e) => {
            e.target.src = '/placeholder.jpg';
          }}
        />
        <div style={styles.playOverlay}>{isImage ? '📷' : '▶'}</div>

        {isAdmin && (
          <button
            className="action-btn"
            style={styles.editIconBtn}
            title="Edit Media"
            onClick={handleEditClick}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>

      <div style={styles.details}>
        {/* Title */}
        <h3 style={styles.title}>{video?.title || 'Untitled'}</h3>

        {/* Categories (Middle Line) */}
        {categories.length > 0 && (
          <div style={styles.categoriesRow}>
            {categories.map((cat) => (
              <span key={cat.id || cat.name} style={styles.categoryTag}>
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Metadata: Views & Likes */}
        <div style={styles.metaRow}>
          <div style={styles.meta}>
            <span>👁️ {video?.views_count || 0} views</span>
            <span>•</span>
            <span>
              {video?.created_at
                ? new Date(video.created_at).toLocaleDateString()
                : ''}
            </span>
          </div>

          <button style={styles.likeBtn} onClick={handleLike}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={liked ? '#ff3b30' : 'none'}
              stroke={liked ? '#ff3b30' : '#888888'}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style={{ color: liked ? '#ff3b30' : '#888888', fontSize: '0.8rem' }}>
              {likeCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid #2a2a2a',
    transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.25s ease, border-color 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  thumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    pointerEvents: 'none',
  },
  editIconBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 200,
    padding: 0,
  },
  details: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  title: {
    color: '#fff',
    fontSize: '0.95rem',
    margin: '0 0 6px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  categoriesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '10px',
  },
  categoryTag: {
    backgroundColor: '#18181826',
    border: '1px solid #6e6e6f66',
    color: '#e6e6e6',
    padding: '2px 8px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '500',
    lineHeight: '1.2',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto', // Pushes metadata to bottom of card
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#aaa',
    fontSize: '0.8rem',
  },
  likeBtn: {
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    padding: '2px 6px',
  },
};