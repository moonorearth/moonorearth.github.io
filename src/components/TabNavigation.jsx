import { useState, useEffect } from 'react';
import { getAllCategories } from '../services/categories';

export default function TabNavigation({ selectedCategories, setSelectedCategories }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getAllCategories().then(setCategories);
  }, []);

  const handleCategoryToggle = (cat) => {
    setSelectedCategories((prev = []) => {
      const exists = prev.some((c) => c.id === cat.id);
      if (exists) {
        return prev.filter((c) => c.id !== cat.id);
      } else {
        return [...prev, cat];
      }
    });
  };

  return (
    <div style={styles.container}>
      {categories.map((cat) => {
        const isSelected = selectedCategories.some((c) => c.id === cat.id);
        return (
          <button
            key={cat.id}
            style={isSelected ? styles.activePill : styles.pill}
            onClick={() => handleCategoryToggle(cat)}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  },
  pill: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #333',
    color: '#aaa',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activePill: {
    backgroundColor: '#0070f3',
    border: '1px solid #0070f3',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};