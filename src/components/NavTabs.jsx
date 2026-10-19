export default function NavTabs({
  tabs,
  activeTab,
  onTabClick,
  onFeedDoubleClick,
  isMobile = false,
}) {
  return (
    <div style={isMobile ? styles.mobileTabList : styles.tabGroup}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const buttonStyle = isMobile
          ? (isActive ? styles.activeMobileTab : styles.mobileTab)
          : (isActive ? styles.activeTab : styles.tab);

        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            onDoubleClick={tab.id === 'feed' ? onFeedDoubleClick : undefined}
            title={tab.id === 'feed' ? 'Double-click to shuffle feed' : undefined}
            style={buttonStyle}
          >
            <span>{tab.label}</span>
            {tab.hasNotification && <span className="unread-indicator" title="New unread messages" />}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  tabGroup: { display: 'flex', gap: '8px', alignItems: 'center' },
  tab: { background: 'none', border: 'none', color: '#888', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' },
  activeTab: { background: '#222', border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' },
  mobileTabList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  mobileTab: { background: 'none', border: 'none', color: '#888', padding: '10px 12px', fontSize: '0.95rem', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  activeMobileTab: { background: '#222', border: 'none', color: '#fff', padding: '10px 12px', fontSize: '0.95rem', textAlign: 'left', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
};
