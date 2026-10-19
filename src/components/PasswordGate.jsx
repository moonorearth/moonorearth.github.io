import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emptyMsgVisible, setEmptyMsgVisible] = useState(false);

  // Typewriter effect state
  const fullText = "Type password to unlock the site...";
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 70);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Trigger fade message if submitted while empty
    if (!password.trim()) {
      setEmptyMsgVisible(true);
      setTimeout(() => {
        setEmptyMsgVisible(false);
      }, 2000);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: 'regularUser@test.com',
      password: password,
    });

    if (authError) {
      setError('Incorrect password');
      setLoading(false);
      return;
    }

    // Record login timestamp for 24-hour expiration calculation
    localStorage.setItem('login_timestamp', Date.now().toString());

    const isAdmin = data?.user?.email === 'admin@test.com';
    setLoading(false);
    onUnlock({ isAdmin });
  };

  return (
    <div style={styles.container}>
      {/* CSS Keyframe Animations Injection */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .enter-btn:hover {
          background-color: #dddddd !important;
          transform: translateY(-1px);
        }
        .enter-btn:active {
          background-color: #cccccc !important;
          transform: translateY(1px);
        }
        .input-field:focus {
          border-bottom-color: #eeeeee !important;
        }
        .eye-btn {
          transition: opacity 0.2s ease, transform 0.15s ease;
        }
        .eye-btn:hover {
          opacity: 1 !important;
          transform: scale(1.1);
        }
      `}</style>

      {/* Background Animated Typewriter Text */}
      <div style={styles.backgroundTypewriter}>
        <span>{typedText}</span>
        <span style={styles.cursor}>|</span>
      </div>

      {/* Main Unlock Form */}
      <form onSubmit={handleLogin} style={styles.formContainer}>
        <div style={styles.inputWrapper}>
          <div style={styles.passwordInputContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password ..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              className="input-field"
              autoFocus
            />

            {/* Toggle Eye Button */}
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                /* Eye Off Icon */
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                /* Eye Icon */
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            style={styles.enterButton}
            className="enter-btn"
            disabled={loading}
            aria-label="Submit password"
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 10 4 15 9 20" />
                <path d="M20 4v7a4 4 0 0 1-4 4H4" />
              </svg>
            )}
          </button>
        </div>

        {/* Empty Submission Fade Message */}
        <p
          style={{
            ...styles.emptyWarning,
            opacity: emptyMsgVisible ? 1 : 0,
          }}
        >
          Please enter a password to unlock
        </p>

        {/* Auth Error Message */}
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0d0d0d',
    backgroundImage:
      'radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.03) 0%, transparent 60%)',
    color: '#eeeeee',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  backgroundTypewriter: {
    position: 'absolute',
    top: '38%',
    fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)',
    fontWeight: '300',
    color: '#2a2a2a',
    letterSpacing: '1px',
    userSelect: 'none',
    pointerEvents: 'none',
    textAlign: 'center',
    padding: '0 20px',
  },
  cursor: {
    animation: 'blink 1s infinite',
    color: '#444444',
    marginLeft: '2px',
  },
  formContainer: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '360px',
    padding: '0 20px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: '12px',
  },
  passwordInputContainer: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1.5px solid #333333',
    padding: '12px 32px 12px 4px', // Right padding keeps text clear of the eye icon
    color: '#eeeeee',
    fontSize: '1.05rem',
    outline: 'none',
    borderRadius: 0,
    transition: 'border-color 0.2s ease',
  },
  eyeBtn: {
    position: 'absolute',
    right: '4px',
    background: 'none',
    border: 'none',
    color: '#888888',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  enterButton: {
    width: '52px',
    height: '48px',
    borderRadius: '16px',
    border: '1px solid #444444',
    backgroundColor: '#eeeeee',
    color: '#0d0d0d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  },
  emptyWarning: {
    color: '#666666',
    fontSize: '0.85rem',
    marginTop: '16px',
    textAlign: 'center',
    transition: 'opacity 0.4s ease',
  },
  error: {
    color: '#888888',
    fontSize: '0.85rem',
    marginTop: '12px',
    textAlign: 'center',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #0d0d0d',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
