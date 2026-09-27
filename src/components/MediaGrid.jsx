import React from 'react';
import VideoCard from './MediaCard';

export default function VideoGrid({
  videos,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  onSelectVideo,
  isAdmin,       // <-- Added prop
  onModify,      // <-- Added prop
  emptyMessage = 'No videos found.',
}) {
  if (loading) {
    return (
      <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>
        Loading videos...
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
      <div style={styles.grid}>
        {videos.map((video, index) => (
          <VideoCard
            key={`${video.id}-${index}`}
            video={video}
            onSelect={onSelectVideo}
            isAdmin={isAdmin}   // <-- Pass down to VideoCard
            onModify={onModify} // <-- Pass down to VideoCard
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
            {loadingMore ? 'Loading...' : 'Load More Videos'}
          </button>
        </div>
      )}
    </>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
    marginTop: '0px',
  },
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