import React from 'react';
import MediaGrid from './MediaGrid';

export default function RandomView({
  videos,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  onSelectVideo,
  onReshuffle,
}) {
  return (
    <div style={styles.container}>
      <style>{`
        .shuffle-bottom-btn {
          background-color: #ffffff !important;
          color: #000000 !important;
          border: 1px solid rgba(255, 255, 255, 0.8) !important;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.25), 0 2px 8px rgba(0, 0, 0, 0.4) !important;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s ease, box-shadow 0.2s ease !important;
        }
        .shuffle-bottom-btn:hover:not(:disabled) {
          transform: scale(1.05) !important;
          background-color: #f0f0f0 !important;
          box-shadow: 0 6px 24px rgba(255, 255, 255, 0.35), 0 4px 12px rgba(0, 0, 0, 0.5) !important;
        }
        .shuffle-bottom-btn:active:not(:disabled) {
          transform: scale(0.95) !important;
        }
      `}</style>

      {/* Grid Layout */}
      <MediaGrid
        videos={videos}
        loading={loading}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={onLoadMore}
        onSelectVideo={onSelectVideo}
        emptyMessage="No random media found."
      />

      {/* Bottom Reshuffle Section */}
      {!loading && (
        <div style={styles.bottomWrapper}>
          <button
            className="shuffle-bottom-btn"
            onClick={() => {
              onReshuffle();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={loading || loadingMore}
            style={styles.shuffleBtn}
          >
            {loadingMore ? '🔄 Loading...' : '🔀 Reshuffle Videos'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    paddingBottom: '40px',
  },
  bottomWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '36px',
    marginBottom: '20px',
  },
  shuffleBtn: {
    padding: '10px 24px',
    borderRadius: '24px',
    fontSize: '0.88rem',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
  },
};