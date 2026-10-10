import React from 'react';
import VideoCard from './MediaCard';

export default function VideoGrid({
  videos,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  onSelectVideo,
  isAdmin,
  onModify,
  emptyMessage = 'No media found.',
}) {
  if (loading) {
    return (
      <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
        Loading media...
      </p>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div style={styles.gridContainer}>
      <style>{`
        .pinterest-masonry-grid {
          column-count: 5;
          column-gap: 16px;
          width: 100%;
        }
        @media (max-width: 1400px) {
          .pinterest-masonry-grid { column-count: 4; }
        }
        @media (max-width: 1024px) {
          .pinterest-masonry-grid { column-count: 3; }
        }
        @media (max-width: 768px) {
          .pinterest-masonry-grid { column-count: 2; column-gap: 12px; }
        }
        @media (max-width: 480px) {
          .pinterest-masonry-grid { column-count: 1; }
        }
      `}</style>

      {/* Masonry Container */}
      <div className="pinterest-masonry-grid">
        {videos.map((video, index) => (
          <VideoCard
            key={`${video.id}-${index}`}
            video={video}
            onSelect={onSelectVideo}
            isAdmin={isAdmin}
            onModify={onModify}
          />
        ))}
      </div>

      {/* Spanned Full-Width Load More Container at Bottom */}
      {hasMore && (
        <div style={styles.loadMoreContainer}>
          <button
            style={styles.loadMoreBtn}
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading More...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  gridContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loadMoreContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '40px',
    paddingBottom: '40px',
    clear: 'both',
  },
  loadMoreBtn: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    border: '1px solid #333',
    padding: '14px 40px',
    borderRadius: '28px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
};
