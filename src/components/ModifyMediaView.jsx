import React, { useState, useEffect } from 'react';
import { updateMedia, deleteMedia, getCategories } from '../services/media';

export default function ModifyMediaView({ item, onClose, onSuccess }) {
  const [title, setTitle] = useState(item?.title || '');
  const [mediaType, setMediaType] = useState(item?.media_type || 'video');
  const [embedUrl, setEmbedUrl] = useState(item?.embed_url || '');
  const [imageUrl, setImageUrl] = useState(item?.image_url || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(item?.thumbnail_url || '');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    item?.categories?.map((c) => c.id) || []
  );
  const [categories, setCategories] = useState([]);
  const [createdAt, setCreatedAt] = useState(
    item?.created_at ? new Date(item.created_at).toISOString().slice(0, 16) : ''
  );
  const [viewsCount, setViewsCount] = useState(item?.views_count || 0);
  const [likesCount, setLikesCount] = useState(item?.likes_count || 0);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleCategoryToggle = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updates = {
        title,
        media_type: mediaType,
        embed_url: mediaType === 'video' ? embedUrl : null,
        image_url: mediaType === 'image' ? imageUrl : null,
        thumbnail_url: thumbnailUrl.trim() || null,
        created_at: createdAt ? new Date(createdAt).toISOString() : item?.created_at,
        views_count: parseInt(viewsCount, 10) || 0,
        likes_count: parseInt(likesCount, 10) || 0,
      };

      await updateMedia(item.id, updates, selectedCategoryIds);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update media');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this media item?')) return;
    setDeleting(true);
    setError(null);

    try {
      await deleteMedia(item.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete media');
      setDeleting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>Modify Media</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleUpdate} style={styles.form}>
          <label style={styles.label}>
            Media Type:
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              style={styles.input}
            >
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
          </label>

          <label style={styles.label}>
            Title:
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
          </label>

          {mediaType === 'video' ? (
            <label style={styles.label}>
              Embed URL:
              <input
                type="url"
                required
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                style={styles.input}
              />
            </label>
          ) : (
            <label style={styles.label}>
              Image URL:
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={styles.input}
              />
            </label>
          )}

          <label style={styles.label}>
            Thumbnail URL:
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
              style={styles.input}
            />
          </label>

          <div style={styles.label}>
            Categories (Select Multiple):
            <div style={styles.checkboxContainer}>
              {categories.map((cat) => (
                <label key={cat.id} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>

          <label style={styles.label}>
            Publish Timestamp:
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              style={styles.input}
            />
          </label>

          <div style={styles.gridRow}>
            <label style={styles.label}>
              Views Count:
              <input
                type="number"
                min="0"
                value={viewsCount}
                onChange={(e) => setViewsCount(e.target.value)}
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Likes Count:
              <input
                type="number"
                min="0"
                value={likesCount}
                onChange={(e) => setLikesCount(e.target.value)}
                style={styles.input}
              />
            </label>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={styles.deleteBtn}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} style={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 3000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px',
    border: '1px solid #333',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  gridRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#ccc' },
  input: {
    backgroundColor: '#0d0d0d',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '10px 12px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  checkboxContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    backgroundColor: '#0d0d0d',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #333',
    maxHeight: '120px',
    overflowY: 'auto',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    color: '#eee',
    cursor: 'pointer',
  },
  actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' },
  deleteBtn: {
    backgroundColor: '#ff3b30',
    border: 'none',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #444',
    color: '#ccc',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#0070f3',
    border: 'none',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: { color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '12px' },
};