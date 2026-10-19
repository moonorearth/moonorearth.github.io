export default function BrandLogo({ onlineCount }) {
  const formatOnlineCount = (count) => {
    if (count >= 1000) return '1k+';
    return count;
  };

  return (
    <div style={styles.logoGroup}>
      <span style={styles.logoText}>🎬 Vault</span>
      <div style={styles.onlineBadge} title={`${onlineCount} active online`}>
        <span style={styles.greenDot} />
        <span>{formatOnlineCount(onlineCount)}</span>
      </div>
    </div>
  );
}

const styles = {
  logoGroup: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  logoText: { color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' },
  onlineBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#bbb',
    background: 'transparent',
    border: 'none',
    padding: 0,
  },
  greenDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#00e676',
    display: 'inline-block',
    animation: 'softPulse 2s infinite',
  },
};
