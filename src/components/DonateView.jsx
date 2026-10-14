import React, { useState } from 'react';

export default function DonateView() {
  const [copiedToken, setCopiedToken] = useState('');
  const [activeQr, setActiveQr] = useState(null);
  const [revealedAddresses, setRevealedAddresses] = useState({});

  const cryptoWallets = [
    { name: 'BTC (Bitcoin)', network: 'BTC Network', 
      address: 'bc1qy6lnq0cyejwteegyg3fhprvwh7f2lse7udst6t',
       icon: '₿', color: '#f7931a' },
    { name: 'ETH (Ethereum)', network: 'ETH Network (ERC20)', 
      address: '0x058bdf2Fc649FCA30eEDECc0b2a249ABbDb07e48',
       icon: 'Ξ', color: '#627eea' },
    { name: 'USDT (Tether USD)', network: 'TRON Network (TRC20)', 
      address: 'TRduLo7d1SezWvYogJh9nekiii5N7dKZ1n',
       icon: '₮', color: '#26a17b' },
    { name: 'DOGE (Dogecoin)', network: 'DOGE Network', 
      address: 'DSaZh1ttBz9z63MwXS8jXdqFYGZ4DndLDx',
       icon: 'Ð', color: '#c2a633' },
    { name: 'LTC (Litecoin)', network: 'LTC Network', 
      address: 'LanXGSzZosgNPuhstQFopiJwD9ux41xWJJ',
       icon: 'Ł', color: '#345d9d' },
  ];
  const handleCopy = (address, name) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(address).then(() => {
        triggerCopySuccess(name);
      }).catch(() => {
        fallbackCopyText(address, name);
      });
    } else {
      fallbackCopyText(address, name);
    }
  };

  const fallbackCopyText = (text, name) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      triggerCopySuccess(name);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const triggerCopySuccess = (name) => {
    setCopiedToken(name);
    setTimeout(() => setCopiedToken(''), 2500);
  };

  const toggleQr = (name) => {
    setActiveQr((prev) => (prev === name ? null : name));
  };

  const toggleReveal = (name) => {
    setRevealedAddresses((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div style={styles.container}>
      <style>{`
        .donate-icon-btn { transition: transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s ease !important; }
        .donate-icon-btn:hover { transform: scale(1.12) !important; background-color: #333 !important; }
        .donate-icon-btn:active { transform: scale(0.92) !important; }
        @keyframes toastSlide { 0% { opacity: 0; transform: translateY(10px); } 15% { opacity: 1; transform: translateY(0); } 85% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(10px); } }
        .global-toast { animation: toastSlide 2.5s ease forwards; }
        
        /* Keep outer card rounded with a clean small margin on mobile */
        @media (max-width: 768px) {
          .donate-outer-wrapper {
            width: 100vw !important;
            margin-left: -24px !important;
            margin-right: -24px !important;
            padding: 0 10px 40px 10px !important;
          }
          .donate-main-card {
            max-width: 100% !important;
            width: 100% !important;
            border-radius: 16px !important;
            padding: 20px 14px !important;
          }
        }
      `}</style>

      <div className="donate-outer-wrapper" style={styles.container}>
        <div className="donate-main-card" style={styles.card}>
          <h2 style={styles.title}>Support the Platform</h2>
          <p style={styles.description}>If you enjoy using this site and want to keep servers running and help add new features, consider dropping a donation. Every contribution helps!</p>

          <div style={styles.walletList}>
            {cryptoWallets.map((wallet) => {
              const isQrOpen = activeQr === wallet.name;
              const isCopied = copiedToken === wallet.name;
              const isRevealed = revealedAddresses[wallet.name];
              const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(wallet.address)}`;

              return (
                <div key={wallet.name} style={styles.walletCard}>
                  <div style={styles.walletHeader}>
                    <div style={styles.walletTitleGroup}>
                      <span style={{ ...styles.iconBadge, backgroundColor: wallet.color }}>{wallet.icon}</span>
                      <div style={styles.walletTextGroup}>
                        <span style={styles.walletName}>{wallet.name}</span>
                        <span style={styles.networkBadge}>{wallet.network}</span>
                      </div>
                    </div>

                    <div style={styles.actionButtons}>
                      {/* Eye toggle button */}
                      <button className="donate-icon-btn" onClick={() => toggleReveal(wallet.name)} style={isRevealed ? styles.iconBtnActive : styles.iconBtn} title={isRevealed ? 'Hide Address' : 'Show Address'}>
                        {isRevealed ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>

                      {/* QR Code button */}
                      <button className="donate-icon-btn" onClick={() => toggleQr(wallet.name)} style={isQrOpen ? styles.iconBtnActive : styles.iconBtn} title="Toggle QR Code">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                      </button>

                      {/* Copy button */}
                      <button className="donate-icon-btn" onClick={() => handleCopy(wallet.address, wallet.name)} style={isCopied ? styles.iconBtnCopied : styles.iconBtn} title="Copy Address">
                        {isCopied ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div style={styles.addressBox}>
                    <code style={{ whiteSpace: 'nowrap', overflowX: 'auto', display: 'block' }}>
                      {isRevealed ? wallet.address : '••••••••••••••••••••••••••••••••'}
                    </code>
                  </div>

                  {isQrOpen && (
                    <div style={styles.qrContainer}>
                      <div style={styles.qrFrame}>
                        <img src={qrApiUrl} alt={`${wallet.name} QR Code`} style={styles.qrImage} />
                        <span style={styles.qrHint}>Scan with wallet app</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {copiedToken && (
        <div className="global-toast" style={styles.globalToast}>
          ✓ {copiedToken} address copied to clipboard!
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0 60px 0', minHeight: '70vh', width: '100%', boxSizing: 'border-box' },
  card: { backgroundColor: '#161616', border: '1px solid #282828', borderRadius: '16px', padding: '24px 20px', maxWidth: '520px', width: '100%', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)', boxSizing: 'border-box' },
  title: { fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#fff', textAlign: 'center' },
  description: { fontSize: '14px', color: '#aaa', lineHeight: '1.5', marginBottom: '20px', textAlign: 'center' },
  walletList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  walletCard: { backgroundColor: '#0d0d0d', border: '1px solid #222', borderRadius: '12px', padding: '12px 14px' },
  walletHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  walletTitleGroup: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 },
  iconBadge: { width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 },
  walletTextGroup: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 },
  walletName: { color: '#fff', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  networkBadge: { color: '#777', fontSize: '11px', whiteSpace: 'nowrap' },
  actionButtons: { display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 },
  iconBtn: { backgroundColor: '#1c1c1c', color: '#ffffff', border: '1px solid #333', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  iconBtnActive: { backgroundColor: '#0070f3', color: '#ffffff', border: '1px solid #0070f3', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  iconBtnCopied: { backgroundColor: '#10b981', color: '#ffffff', border: '1px solid #10b981', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' },
  addressBox: { backgroundColor: '#141414', border: '1px solid #222', borderRadius: '6px', padding: '6px 10px', color: '#888', fontSize: '12px', fontFamily: 'monospace', marginTop: '8px', overflowX: 'auto', scrollbarWidth: 'none' },
  qrContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #222' },
  qrFrame: { backgroundColor: '#ffffff', padding: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' },
  qrImage: { width: '140px', height: '140px', display: 'block' },
  qrHint: { color: '#000', fontSize: '10px', fontWeight: '600' },
  globalToast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#10b981', color: '#fff', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', zIndex: 9999, boxShadow: '0 6px 20px rgba(0,0,0,0.5)', pointerEvents: 'none' },
};
