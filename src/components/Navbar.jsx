import { useState, useEffect } from 'react';
import { getAllCategories } from '../services/categories';
import SearchBar from './SearchBar';

const FEED_EMOJIS = ['🌏', '🌎', '🌍'];

export default function Navbar({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  recentCategories = [],
  setRecentCategories,
  mostViewedCategories = [],
  setMostViewedCategories,
  onReshuffle,
  recentAsc,
  setRecentAsc,
  viewsAsc,
  setViewsAsc,
  onOpenLogin,
}) {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const catData = await getAllCategories();
        setCategories(catData || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    setShowNavbar(true);
    setLastScrollY(0);
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = (e) => {
      let currentScrollY = 0;
      if (e.target && e.target !== document && e.target !== window) {
        currentScrollY = e.target.scrollTop;
      } else {
        currentScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      }

      const diff = currentScrollY - lastScrollY;
      if (Math.abs(diff) < 5) return;

      if (currentScrollY < 20) {
        setShowNavbar(true);
      } else if (diff > 0) {
        setShowNavbar(false);
      } else if (diff < 0) {
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [lastScrollY]);

  const handleTabClick = (tabId) => {
    setMobileMenuOpen(false);
    setActiveTab(tabId);
  };

  const handleFeedDoubleClick = () => {
    setEmojiIndex((prev) => (prev + 1) % FEED_EMOJIS.length);
    onReshuffle?.();
  };

  const currentCategories = activeTab === 'most_viewed' ? mostViewedCategories : recentCategories;
  const setCurrentCategories = activeTab === 'most_viewed' ? setMostViewedCategories : setRecentCategories;
  const selectedCategoryIds = currentCategories.map((c) => c.id);

  const handleCategorySelect = (cat) => {
    if (!cat || cat.id === 'all') {
      setCurrentCategories([]);
      return;
    }

    const exists = currentCategories.some((c) => c.id === cat.id);
    if (exists) {
      setCurrentCategories(currentCategories.filter((c) => c.id !== cat.id));
    } else {
      setCurrentCategories([...currentCategories, cat]);
    }
  };

  // Fixed static labels to eliminate bar wobbling & desync
  const navTabs = [
    { id: 'feed', label: `${FEED_EMOJIS[emojiIndex]} Feed` },
    { id: 'random', label: '🎲 Random' },
    { id: 'recent', label: '✨ Recent' },
    { id: 'most_viewed', label: '🔥 Most Viewed' },
    { id: 'requests', label: '🗫 Chat' },
  ];

  const showCategoryPills = activeTab === 'recent' || activeTab === 'most_viewed';

  // Current active sort state
  const isAscending = activeTab === 'recent' ? recentAsc : viewsAsc;
  const toggleSort = () => {
    if (activeTab === 'recent') setRecentAsc((prev) => !prev);
    if (activeTab === 'most_viewed') setViewsAsc((prev) => !prev);
  };

  return (
    <nav className={`app-navbar ${showNavbar ? 'nav-visible' : 'nav-hidden'}`} style={styles.navbar}>
      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-toggle { display: flex !important; }
          .app-navbar {
            width: 90% !important;
            left: 5% !important;
            right: 5% !important;
            top: 8px !important;
            border-radius: 20px !important;
            padding: 8px 14px !important;
          }
        }
        @media (min-width: 769px) {
          .desktop-only { display: flex !important; }
          .mobile-toggle { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
      `}</style>

      <div style={styles.topRow}>
        <div style={styles.logo}>
          <span>🎬 MediaVault</span>
        </div>

        <div className="desktop-only" style={styles.tabGroup}>
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onDoubleClick={tab.id === 'feed' ? handleFeedDoubleClick : undefined}
              title={tab.id === 'feed' ? 'Double-click to shuffle feed' : undefined}
              style={activeTab === tab.id ? styles.activeTab : styles.tab}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="desktop-only" style={styles.searchContainer}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        <div style={styles.rightActions}>
          <button
            onClick={onOpenLogin}
            style={styles.loginIconButton}
            title="Account / Login"
            aria-label="Login"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={styles.hamburgerBtn}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-drawer" style={styles.mobileDrawer}>
          <div style={{ marginBottom: '12px' }}>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>

          <div style={styles.mobileTabList}>
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                onDoubleClick={tab.id === 'feed' ? handleFeedDoubleClick : undefined}
                title={tab.id === 'feed' ? 'Double-click to shuffle feed' : undefined}
                style={activeTab === tab.id ? styles.activeMobileTab : styles.mobileTab}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCategoryPills && (
        <div style={styles.categoryPillsBar}>
          {/* Dedicated Sort Direction Toggle Button */}
          <button style={styles.sortToggleBtn} onClick={toggleSort} title="Toggle Sort Order">
            {activeTab === 'recent'
              ? isAscending ? '⌛ Oldest First' : '✨ Newest First'
              : isAscending ? '📉 Least Viewed' : '🔥 Most Viewed'}
          </button>

          <div style={styles.divider} />

          <button
            style={currentCategories.length === 0 ? styles.activePill : styles.pill}
            onClick={() => handleCategorySelect({ id: 'all', name: 'All' })}
          >
            All
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                style={isSelected ? styles.activePill : styles.pill}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    position: 'fixed', top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(20, 20, 20, 0.9)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 1000,
    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
    padding: '10px 20px', boxSizing: 'border-box',
  },
  topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
  logo: { color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', flexShrink: 0 },
  tabGroup: { display: 'flex', gap: '8px', alignItems: 'center' },
  tab: { background: 'none', border: 'none', color: '#888', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', whiteSpace: 'nowrap' },
  activeTab: { background: '#222', border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', whiteSpace: 'nowrap' },
  searchContainer: { flex: '0 1 240px' },
  rightActions: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 },
  loginIconButton: {
    background: '#1f1f1f',
    border: '1px solid #333',
    color: '#eee',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  hamburgerBtn: { background: 'none', border: 'none', color: '#eee', fontSize: '1.3rem', cursor: 'pointer', padding: '2px 6px' },
  mobileDrawer: { marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '8px' },
  mobileTabList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  mobileTab: { background: 'none', border: 'none', color: '#888', padding: '10px 12px', fontSize: '0.95rem', textAlign: 'left', borderRadius: '6px', cursor: 'pointer' },
  activeMobileTab: { background: '#222', border: 'none', color: '#fff', padding: '10px 12px', fontSize: '0.95rem', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  categoryPillsBar: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', overflowX: 'auto', scrollbarWidth: 'none' },
  sortToggleBtn: { backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff', padding: '5px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  divider: { width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '0 4px', flexShrink: 0 },
  pill: { backgroundColor: '#0d0d0d', border: '1px solid #333', color: '#aaa', padding: '5px 14px', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease' },
  activePill: { backgroundColor: '#0070f3', border: '1px solid #0070f3', color: '#fff', padding: '5px 14px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease' },
};
