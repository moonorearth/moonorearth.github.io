import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function LoginView({ onClose, onLoginSuccess, onLogoutSuccess }) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message || 'Login failed');
      return;
    }

    const isAdmin = data?.user?.email === 'admin@test.com';
    onLoginSuccess?.({ isAdmin, user: data?.user });
    onClose();
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    setError('');

    const { error: signOutError } = await supabase.auth.signOut();

    setLogoutLoading(false);

    if (signOutError) {
      setError(signOutError.message || 'Failed to sign out');
      return;
    }

    onLogoutSuccess?.();
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>{`
        .account-btn-anim {
          transition: transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
        }
        .account-btn-anim:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02) !important;
        }
        .account-btn-anim:active:not(:disabled) {
          transform: translateY(1px) scale(0.97) !important;
        }
        .close-btn-anim {
          transition: transform 0.15s ease, color 0.15s ease, background-color 0.15s ease !important;
        }
        .close-btn-anim:hover {
          transform: scale(1.1) !important;
          color: #fff !important;
          background-color: rgba(255, 255, 255, 0.15) !important;
        }
        .close-btn-anim:active {
          transform: scale(0.9) !important;
        }
      `}</style>

      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button cleanly positioned in top right spacing */}
        <button
          className="close-btn-anim"
          style={styles.closeBtn}
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <div style={styles.actionContainer}>
          {/* Login As Button / Form Toggle */}
          {!showLoginForm ? (
            <button
              type="button"
              className="account-btn-anim"
              onClick={() => setShowLoginForm(true)}
              style={styles.loginAsBtn}
            >
              <span>Login As</span>
              <span style={styles.chevron}>→</span>
            </button>
          ) : (
            <div style={styles.formWrapper}>
              <div style={styles.formHeader}>
                <span style={styles.formTitle}>Sign In Credentials</span>
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  style={styles.backBtn}
                >
                  Back
                </button>
              </div>

              <form onSubmit={handleLogin} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    autoFocus
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  className="account-btn-anim"
                  disabled={loading || logoutLoading}
                  style={styles.submitBtn}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* Log Out Button */}
          <button
            type="button"
            className="account-btn-anim"
            onClick={handleLogout}
            disabled={loading || logoutLoading}
            style={styles.logoutBtn}
          >
            {logoutLoading ? 'Signing out...' : 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  modal: {
    position: 'relative',
    backgroundColor: 'rgba(20, 20, 24, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '48px 20px 20px 20px', // Top padding ensures close button has clear spacing
    width: '100%',
    maxWidth: '320px',
    boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
  },
  closeBtn: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    color: '#888',
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  errorAlert: {
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
    border: '1px solid rgba(255, 77, 77, 0.25)',
    color: '#ff6b6b',
    padding: '10px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    marginBottom: '16px',
    textAlign: 'center',
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  loginAsBtn: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #0070f3 0%, #0051a8 100%)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '14px',
    padding: '14px 18px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 8px 20px -4px rgba(0, 112, 243, 0.4)',
  },
  chevron: {
    fontSize: '1rem',
    opacity: 0.85,
  },
  formWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formHeader: {
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: '2px',
  },
  formTitle: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#0070f3',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '2px 6px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '0.78rem',
    color: '#888',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#fff',
    fontSize: '0.88rem',
    outline: 'none',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #0070f3 0%, #0051a8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
    marginTop: '4px',
  },
  logoutBtn: {
    width: '100%',
    backgroundColor: 'rgba(255, 77, 77, 0.08)',
    color: '#ff6b6b',
    border: '1px solid rgba(255, 77, 77, 0.2)',
    borderRadius: '14px',
    padding: '12px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
};