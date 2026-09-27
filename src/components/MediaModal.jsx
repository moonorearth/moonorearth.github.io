import React, { useState, useEffect, useRef } from 'react';
import { getMediaThumbnail } from '../utils/mediaHelpers';
import { incrementVideoViews } from '../services/media';

export default function MediaModal({ item, onClose }) {
  const modalRef = useRef(null);
  const mediaContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState(null);

  useEffect(() => {
    if (item?.id) incrementVideoViews(item.id);
  }, [item?.id]);

  // Lock background page scroll completely while popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Handle native non-passive wheel event to stop page scroll & only zoom image
  useEffect(() => {
    const container = mediaContainerRef.current;
    if (!container) return;

    const handleNativeWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (item?.media_type === 'image') {
        const delta = e.deltaY < 0 ? 0.3 : -0.3;
        setZoom((prev) => Math.min(Math.max(prev + delta, 1), 4));
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, [item?.media_type]);

  // Track browser native fullscreen state changes
  useEffect(() => {
    const handleFSChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active) resetZoom();
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  if (!item) return null;

  const isImage = item.media_type === 'image';
  const displayImageUrl = item.image_url || getMediaThumbnail(item);

  const toggleFullScreen = () => {
    if (!modalRef.current) return;
    if (!document.fullscreenElement) {
      modalRef.current.requestFullscreen?.() || modalRef.current.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }
  };

  const updateZoom = (delta) => setZoom((prev) => Math.min(Math.max(prev + delta, 1), 4));
  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => isDragging && setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });

  // Mobile Touch Handlers
  const getDistance = (touches) => {
    const [t1, t2] = touches;
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const handleTouchStart = (e) => {
    if (!isImage) return;

    if (e.touches.length === 2) {
      setTouchDistance(getDistance(e.touches));
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isImage) return;

    if (e.touches.length === 2 && touchDistance) {
      const newDistance = getDistance(e.touches);
      const factor = newDistance / touchDistance;
      setZoom((prev) => Math.min(Math.max(prev * (factor > 1 ? 1.05 : 0.95), 1), 4));
      setTouchDistance(newDistance);
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDistance(null);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        ref={modalRef}
        style={{ ...styles.content, ...(isFullscreen && styles.fullscreenContent) }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Controls */}
        <div style={styles.topRightControls}>
          <button style={styles.glassBtn} onClick={toggleFullScreen} title="Toggle Fullscreen">
            {isFullscreen ? '❐' : '⛶'}
          </button>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Bottom-Right Zoom Stack Controls */}
        {isImage && (
          <div style={styles.zoomStack}>
            {zoom > 1 && (
              <button style={styles.glassBtn} onClick={resetZoom} title={`Reset Zoom (${Math.round(zoom * 100)}%)`}>=</button>
            )}
            <button style={styles.glassBtn} onClick={() => updateZoom(0.3)} title="Zoom In">+</button>
            <button style={styles.glassBtn} onClick={() => updateZoom(-0.3)} title="Zoom Out">-</button>
          </div>
        )}

        {/* Media Canvas */}
        <div
          ref={mediaContainerRef}
          style={{ ...styles.mediaContainer, ...(isFullscreen && styles.fullscreenMediaContainer) }}
        >
          {isImage ? (
            <div
              style={{ ...styles.imageWrapper, cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={displayImageUrl}
                alt={item.title || 'Media'}
                draggable={false}
                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                style={{
                  ...styles.fullImage,
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transition: isDragging || touchDistance ? 'none' : 'transform 0.15s ease-out',
                  maxHeight: isFullscreen ? '100vh' : '75vh',
                  touchAction: 'none',
                }}
              />
            </div>
          ) : (
            <iframe
              src={item.embed_url}
              title={item.title}
              style={{ ...styles.iframe, height: isFullscreen ? '100vh' : '500px' }}
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          )}
        </div>

        {/* Footer Info (Hidden when in Fullscreen mode) */}
        {!isFullscreen && (
          <div style={styles.metaInfo}>
            <div style={styles.titleRow}>
              <span style={isImage ? styles.imageBadge : styles.videoBadge}>
                {isImage ? 'IMAGE' : 'VIDEO'}
              </span>
              <h3 style={styles.title}>{item.title}</h3>
            </div>
            {item.views_count !== undefined && <span style={styles.views}>{item.views_count} views</span>}
          </div>
        )}
      </div>
    </div>
  );
}

const glassBase = {
  backgroundColor: 'rgba(20, 20, 20, 0.55)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#fff',
  fontSize: '0.9rem',
  fontWeight: '600',
  borderRadius: '50%',
  width: '36px',
  height: '36px',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  content: {
    position: 'relative',
    width: '100%',
    maxWidth: '900px',
    backgroundColor: '#141414',
    borderRadius: '12px',
    border: '1px solid #282828',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
    display: 'flex',
    flexDirection: 'column',
  },
  fullscreenContent: {
    maxWidth: '100vw', width: '100vw', height: '100vh', maxHeight: '100vh',
    borderRadius: 0, border: 'none', backgroundColor: '#000',
  },
  topRightControls: {
    position: 'absolute',
    top: '12px', right: '12px',
    zIndex: 30,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  zoomStack: {
    position: 'absolute',
    bottom: '70px', right: '16px',
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-end',
  },
  glassBtn: glassBase,
  closeBtn: glassBase,
  mediaContainer: {
    width: '100%',
    maxHeight: '75vh',
    backgroundColor: '#0d0d0d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullscreenMediaContainer: {
    width: '100vw', height: '100vh', maxHeight: '100vh', backgroundColor: '#000',
  },
  imageWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    userSelect: 'none',
  },
  fullImage: { maxWidth: '100%', objectFit: 'contain', display: 'block' },
  iframe: { width: '100%', border: 'none' },
  metaInfo: {
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141414',
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  title: { color: '#eee', fontSize: '1.1rem', margin: 0, fontWeight: '600' },
  videoBadge: { background: '#222', color: '#eee', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
  imageBadge: { background: '#0070f3', color: '#fff', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' },
  views: { color: '#888', fontSize: '0.85rem' },
};