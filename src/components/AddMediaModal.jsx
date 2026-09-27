import React, { useState, useEffect } from 'react';
import { addMedia, getCategories } from '../services/media';

export default function AddMediaModal({ onClose, onSuccess }) {
  const [mediaType, setMediaType] = useState('video');
  const [title, setTitle] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [createdAt, setCreatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleCategoryToggle = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title,
        media_type: mediaType,
        embed_url: mediaType === 'video' ? embedUrl : null,
        image_url: mediaType === 'image' ? imageUrl : null,
        thumbnail_url: thumbnailUrl.trim() || null,
        ...(createdAt ? { created_at: new Date(createdAt).toISOString() } : {}),
      };

      await addMedia(payload, selectedCategoryIds);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>Add New Media</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
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
              placeholder="Enter title..."
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
                placeholder="https://..."
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
                placeholder="https://..."
                style={styles.input}
              />
            </label>
          )}

          <label style={styles.label}>
            Thumbnail URL (Optional):
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
              {categories.length === 0 ? (
                <span style={{ color: '#666', fontSize: '0.8rem' }}>No categories found</span>
              ) : (
                categories.map((cat) => (
                  <label key={cat.id} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(cat.id)}
                      onChange={() => handleCategoryToggle(cat.id)}
                    />
                    {cat.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <label style={styles.label}>
            Publish Timestamp (Optional):
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              style={styles.input}
            />
          </label>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Adding...' : 'Add Media'}
            </button>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
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
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
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