export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="🔍 Search titles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.input}
      />
      {searchQuery && (
        <button style={styles.clearBtn} onClick={() => setSearchQuery('')}>
          ✕
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '320px',
  },
  input: {
    width: '100%',
    padding: '8px 32px 8px 14px',
    borderRadius: '20px',
    border: '1px solid #333',
    backgroundColor: '#0d0d0d',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  clearBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
};