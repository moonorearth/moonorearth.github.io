import { useState, useEffect } from 'react';

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
import DonateView from './components/DonateView';
import ActionDock from './components/ActionDock';

import { useDebounce } from './hooks/useDebounce';
import { useMedia } from './hooks/useMedia';
import { useAuthSession } from './hooks/useAuthSession';

export default function App() {
  const {
    isUnlocked,
    isAdmin,
    setIsAdmin,
    checkingAuth,
    handleUnlock,
    handleLogout,
  } = useAuthSession();

  // Modals & Navigation States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modifyingItem, setModifyingItem] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showGoTop, setShowGoTop] = useState(false);

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem('activeTab') || 'feed'
  );

  const [recentCategories, setRecentCategories] = useState([]);
  const [mostViewedCategories, setMostViewedCategories] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [recentAsc, setRecentAsc] = useState(false);
  const [viewsAsc, setViewsAsc] = useState(false);

  // Handle window scroll position for ActionDock
  useEffect(() => {
    const handleScroll = () => {
      setShowGoTop(window.scrollY > 300);
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
        onReshuffle={() => setShuffleTrigger((prev) => prev + 1)}
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
            onReshuffle={() => setShuffleTrigger((prev) => prev + 1)}
            isAdmin={isAdmin}
            onModify={setModifyingItem}
          />
        </div>

        <div style={{ display: activeTab === 'requests' ? 'block' : 'none' }}>
          <ChatView isUnlocked={isUnlocked} isAdmin={isAdmin} />
        </div>

        <div style={{ display: activeTab === 'donate' ? 'block' : 'none' }}>
          <DonateView />
        </div>

        {activeTab !== 'feed' && activeTab !== 'random' && activeTab !== 'requests' && activeTab !== 'donate' && (
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
      <ActionDock
        showGoTop={showGoTop}
        isAdmin={isAdmin}
        onScrollToTop={scrollToTop}
        onOpenAddModal={() => setShowAddModal(true)}
      />

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
          onLogoutSuccess={handleLogout}
        />
      )}
    </div>
  );
}
