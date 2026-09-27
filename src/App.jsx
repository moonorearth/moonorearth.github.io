import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

import PasswordGate from './components/PasswordGate';
import Navbar from './components/Navbar';
import VideoGrid from './components/MediaGrid';
import VideoPlayerModal from './components/MediaModal';
import ShortsFeed from './components/ShortsFeed';
import ChatView from './components/ChatView';
import RandomView from './components/RandomView';
import LoginView from './components/LoginView';
import AddMediaModal from './components/AddMediaModal';
import ModifyMediaView from './components/ModifyMediaView';

import { useDebounce } from './hooks/useDebounce';
import { useMedia } from './hooks/useMedia';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Admin Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [modifyingItem, setModifyingItem] = useState(null);

  // Scroll visibility for Go-Top button
  const [showGoTop, setShowGoTop] = useState(false);

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem('activeTab') || 'feed'
  );

  const [recentCategories, setRecentCategories] = useState([]);
  const [mostViewedCategories, setMostViewedCategories] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);

  const [recentAsc, setRecentAsc] = useState(false);
  const [viewsAsc, setViewsAsc] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsUnlocked(true);
        setIsAdmin(session.user?.app_metadata?.role === 'admin');
      } else {
        setIsUnlocked(false);
        setIsAdmin(false);
      }
      setCheckingAuth(false);
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsUnlocked(false);
        setIsAdmin(false);
      } else if (session) {
        setIsUnlocked(true);
        setIsAdmin(session.user?.app_metadata?.role === 'admin');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show/Hide Go-Top Button based on window scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowGoTop(true);
      } else {
        setShowGoTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const videoData = useMedia({
    isUnlocked,
    activeTab,
    recentCategories,
    mostViewedCategories,
    debouncedSearchQuery,
    recentAsc,
    viewsAsc,
    shuffleTrigger,
  });

  const handleUnlock = ({ isAdmin }) => {
    setIsAdmin(isAdmin);
    setIsUnlocked(true);
  };

  const handleReshuffle = () => {
    setShuffleTrigger((prev) => prev + 1);
  };

  const handleTabChange = (tab) => {
    localStorage.setItem('activeTab', tab);
    setActiveTab(tab);
  };

  const handleRefreshMedia = () => {
    videoData.resetVideos();
    setShuffleTrigger((prev) => prev + 1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (checkingAuth) {
    return <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh' }} />;
  }

  if (!isUnlocked) {
    return <PasswordGate onUnlock={handleUnlock} />;
  }

  const getPaddingTop = () => {
    if (activeTab === 'feed') return '0';
    if (activeTab === 'recent' || activeTab === 'most_viewed') return '130px';
    return '80px';
  };

  return (
    <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh', color: '#fff' }}>
      <Navbar
        isAdmin={isAdmin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        recentCategories={recentCategories}
        setRecentCategories={setRecentCategories}
        mostViewedCategories={mostViewedCategories}
        setMostViewedCategories={setMostViewedCategories}
        onReshuffle={handleReshuffle}
        recentAsc={recentAsc}
        setRecentAsc={setRecentAsc}
        viewsAsc={viewsAsc}
        setViewsAsc={setViewsAsc}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      <main
        style={{
          paddingTop: getPaddingTop(),
          paddingLeft: activeTab === 'feed' ? '0' : '24px',
          paddingRight: activeTab === 'feed' ? '0' : '24px',
          paddingBottom: activeTab === 'feed' ? '0' : '40px',
        }}
      >
        <div style={{ display: activeTab === 'feed' ? 'block' : 'none' }}>
          <ShortsFeed
            items={videoData.videos}
            onLoadMore={videoData.loadMore}
            hasMore={videoData.hasMore}
            onSelectCategory={(category) => {
              const catObject = typeof category === 'string' ? { name: category } : category;
              setRecentCategories([catObject]);
              handleTabChange('recent');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          />
        </div>

        <div style={{ display: activeTab === 'random' ? 'block' : 'none' }}>
          <RandomView
            videos={videoData.videos}
            loading={videoData.loading}
            hasMore={videoData.hasMore}
            loadingMore={videoData.loadingMore}
            onLoadMore={videoData.loadMore}
            onSelectVideo={setSelectedVideo}
            onReshuffle={handleReshuffle}
            isAdmin={isAdmin}
            onModify={setModifyingItem}
          />
        </div>

        <div style={{ display: activeTab === 'requests' ? 'block' : 'none' }}>
          <ChatView isUnlocked={isUnlocked} isAdmin={isAdmin} />
        </div>

        {activeTab !== 'feed' && activeTab !== 'random' && activeTab !== 'requests' && (
          <VideoGrid
            videos={videoData.videos}
            loading={videoData.loading}
            hasMore={videoData.hasMore}
            loadingMore={videoData.loadingMore}
            onLoadMore={videoData.loadMore}
            onSelectVideo={setSelectedVideo}
            isAdmin={isAdmin}
            onModify={setModifyingItem}
          />
        )}
      </main>

      {/* Floating Action Button Dock */}
      <div style={styles.fabContainer}>
        {/* Go To Top Button (Visible for ALL users) */}
        {showGoTop && (
          <button
            className="action-btn"
            style={styles.goTopBtn}
            onClick={scrollToTop}
            title="Go to Top"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        )}

        {/* Add Media Button (Admin Only, White) */}
        {isAdmin && (
          <button
            className="action-btn"
            style={styles.addBtn}
            onClick={() => setShowAddModal(true)}
            title="Add Media"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}
      </div>

      {/* Modals */}
      {selectedVideo && (
        <VideoPlayerModal
          item={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {showAddModal && (
        <AddMediaModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleRefreshMedia}
        />
      )}

      {modifyingItem && (
        <ModifyMediaView
          item={modifyingItem}
          onClose={() => setModifyingItem(null)}
          onSuccess={handleRefreshMedia}
        />
      )}

      {showLoginModal && (
        <LoginView
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={({ isAdmin }) => setIsAdmin(isAdmin)}
          onLogoutSuccess={() => {
            setIsUnlocked(false);
            setIsAdmin(false);
          }}
        />
      )}
    </div>
  );
}

const styles = {
  fabContainer: {
    position: 'fixed',
    bottom: '48px', // Positioned higher up from bottom
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