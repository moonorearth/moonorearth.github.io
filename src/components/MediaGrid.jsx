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
  emptyMessage = 'No videos found.',
}) {
  if (loading) {
    return (
      <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
        Loading media...
      </p>
    );
  }

  if (videos.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
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

      {hasMore && (
        <div style={styles.loadMoreContainer}>
          <button
            style={styles.loadMoreBtn}
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </>
  );
}

const styles = {
  loadMoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '36px',
    marginBottom: '20px',
  },
  loadMoreBtn: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    border: '1px solid #333',
    padding: '12px 28px',
    borderRadius: '24px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};
