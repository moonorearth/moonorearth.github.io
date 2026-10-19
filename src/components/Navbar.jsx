import { useState } from 'react';
import { useNavbar } from '../hooks/useNavbar';
import SearchBar from './SearchBar';
import BrandLogo from './BrandLogo';
import CategoryPills from './CategoryPills';
import NavTabs from './NavTabs';

const FEED_EMOJIS = ['🌏', '🌎', '🌍'];

export default function Navbar({
  searchQuery, setSearchQuery, activeTab, setActiveTab,
  recentCategories = [], setRecentCategories,
  mostViewedCategories = [], setMostViewedCategories,
  onReshuffle, recentAsc, setRecentAsc, viewsAsc, setViewsAsc, onOpenLogin,
}) {
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { showNavbar, categories, hasUnreadChat, onlineCount } = useNavbar(activeTab);

  const currentCategories = activeTab === 'most_viewed' ? mostViewedCategories : recentCategories;
  const setCurrentCategories = activeTab === 'most_viewed' ? setMostViewedCategories : setRecentCategories;

  const handleTabClick = (tabId) => {
    setMobileMenuOpen(false);
    setActiveTab(tabId);
  };

  const handleCategorySelect = (cat) => {
    if (!cat || cat.id === 'all') return setCurrentCategories([]);
    const exists = currentCategories.some((c) => c.id === cat.id);
    setCurrentCategories(exists ? currentCategories.filter((c) => c.id !== cat.id) : [...currentCategories, cat]);
  };

  const navTabs = [
    { id: 'feed', label: `${FEED_EMOJIS[emojiIndex]} Feed` },
    { id: 'random', label: '🎲 Random' },
    { id: 'recent', label: '✨ Recent' },
    { id: 'most_viewed', label: '🔥 Most Viewed' },
    { id: 'requests', label: '🗫 Chat', hasNotification: hasUnreadChat },
    { id: 'donate', label: '☕ Donate' },
  ];

  return (
    <nav className={`app-navbar ${showNavbar ? 'nav-visible' : 'nav-hidden'}`} style={styles.navbar}>
      <style>{`
        @media (max-width: 768px) { .desktop-only { display: none !important; } .mobile-toggle { display: flex !important; } .app-navbar { width: 90% !important; left: 5% !important; right: 5% !important; top: 8px !important; border-radius: 20px !important; padding: 8px 14px !important; } }
        @media (min-width: 769px) { .desktop-only { display: flex !important; } .mobile-toggle { display: none !important; } .mobile-drawer { display: none !important; } }
        @keyframes softPulse { 0% { box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.7); } 70% { box-shadow: 0 0 0 5px rgba(0, 230, 118, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 230, 118, 0); } }
        @keyframes softGlow { 0% { box-shadow: 0 0 2px #ff4d4d, 0 0 6px #ff4d4d; transform: scale(0.95); } 50% { box-shadow: 0 0 6px #ff4d4d, 0 0 12px #ff4d4d; transform: scale(1.15); } 100% { box-shadow: 0 0 2px #ff4d4d, 0 0 6px #ff4d4d; transform: scale(0.95); } }
        .unread-indicator { width: 7px; height: 7px; background-color: #ff3b30; border-radius: 50%; display: inline-block; margin-left: 6px; animation: softGlow 2s infinite ease-in-out; }
      `}</style>

      <div style={styles.topRow}>
        <BrandLogo onlineCount={onlineCount} />

        <div className="desktop-only">
          <NavTabs
            tabs={navTabs}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            onFeedDoubleClick={() => { setEmojiIndex((prev) => (prev + 1) % FEED_EMOJIS.length); onReshuffle?.(); }}
          />
        </div>

        <div className="desktop-only" style={{ flex: '0 1 240px' }}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        <div style={styles.rightActions}>
          <button onClick={onOpenLogin} style={styles.loginIconButton} title="Account / Login">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </button>
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={styles.hamburgerBtn}>{mobileMenuOpen ? '✕' : '☰'}</button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-drawer" style={styles.mobileDrawer}>
          <div style={{ marginBottom: '12px' }}><SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} /></div>
          <NavTabs tabs={navTabs} activeTab={activeTab} onTabClick={handleTabClick} isMobile />
        </div>
      )}

      {(activeTab === 'recent' || activeTab === 'most_viewed') && (
        <CategoryPills
          activeTab={activeTab}
          categories={categories}
          currentCategories={currentCategories}
          onCategorySelect={handleCategorySelect}
          isAscending={activeTab === 'recent' ? recentAsc : viewsAsc}
          onToggleSort={() => activeTab === 'recent' ? setRecentAsc(!recentAsc) : setViewsAsc(!viewsAsc)}
        />
      )}
    </nav>
  );
}

const styles = {
  navbar: { position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: 'rgba(20, 20, 20, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 1000, transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out', padding: '10px 20px', boxSizing: 'border-box' },
  topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
  rightActions: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 },
  loginIconButton: { background: '#1f1f1f', border: '1px solid #333', color: '#eee', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  hamburgerBtn: { background: 'none', border: 'none', color: '#eee', fontSize: '1.3rem', cursor: 'pointer', padding: '2px 6px' },
  mobileDrawer: { marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '8px' },
};
