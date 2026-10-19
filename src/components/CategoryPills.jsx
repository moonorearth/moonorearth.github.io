export default function CategoryPills({
  activeTab,
  categories,
  currentCategories,
  onCategorySelect,
  isAscending,
  onToggleSort,
}) {
  const selectedCategoryIds = currentCategories.map((c) => c.id);

  return (
    <div style={styles.categoryPillsBar}>
      <button style={styles.sortToggleBtn} onClick={onToggleSort} title="Toggle Sort Order">
        {activeTab === 'recent'
          ? isAscending ? '⌛ Oldest First' : '✨ Newest First'
          : isAscending ? '📉 Least Viewed' : '🔥 Most Viewed'}
      </button>

      <div style={styles.divider} />

      <button
        style={currentCategories.length === 0 ? styles.activePill : styles.pill}
        onClick={() => onCategorySelect({ id: 'all', name: 'All' })}
      >
        All
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategoryIds.includes(cat.id);
        return (
          <button
            key={cat.id}
            style={isSelected ? styles.activePill : styles.pill}
            onClick={() => onCategorySelect(cat)}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  categoryPillsBar: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginTop: '10px', 
    paddingTop: '10px', 
    borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
    overflowX: 'auto', 
    scrollbarWidth: 'none' 
  },
  sortToggleBtn: { backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', padding: '5px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  divider: { width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '0 4px', flexShrink: 0 },
  pill: { backgroundColor: '#0d0d0d', border: '1px solid #333', color: '#aaa', padding: '5px 14px', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease' },
  activePill: { backgroundColor: '#0070f3', border: '1px solid #0070f3', color: '#fff', padding: '5px 14px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease' },
};
