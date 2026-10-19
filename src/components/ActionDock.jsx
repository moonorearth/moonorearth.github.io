export default function ActionDock({ showGoTop, isAdmin, onScrollToTop, onOpenAddModal }) {
  if (!showGoTop && !isAdmin) return null;

  return (
    <div style={styles.fabContainer}>
      {/* Go To Top Button */}
      {showGoTop && (
        <button
          className="action-btn"
          style={styles.goTopBtn}
          onClick={onScrollToTop}
          title="Go to Top"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      {/* Add Media Button (Admin Only) */}
      {isAdmin && (
        <button
          className="action-btn"
          style={styles.addBtn}
          onClick={onOpenAddModal}
          title="Add Media"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}

const styles = {
  fabContainer: {
    position: 'fixed',
    bottom: '48px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 1000,
  },
  addBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    color: '#0d0d0d',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    cursor: 'pointer',
    padding: 0,
  },
  goTopBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#0070f3',
    color: '#ffffff',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 112, 243, 0.4)',
    cursor: 'pointer',
    padding: 0,
  },
};
