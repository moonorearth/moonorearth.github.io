import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('');
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
      setError('Incorrect key');
      setLoading(false);
      return;
    }

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
      `}</style>

      {/* Background Animated Typewriter Text */}
      <div style={styles.backgroundTypewriter}>
        <span>{typedText}</span>
        <span style={styles.cursor}>|</span>
      </div>

      {/* Main Unlock Form */}
      <form onSubmit={handleLogin} style={styles.formContainer}>
        <div style={styles.inputWrapper}>
          <input
            type="password"
            placeholder="Enter key ..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            className="input-field"
            autoFocus
          />

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
          Please enter a key to unlock
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
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1.5px solid #333333',
    padding: '12px 4px',
    color: '#eeeeee',
    fontSize: '1.05rem',
    outline: 'none',
    borderRadius: 0,
    transition: 'border-color 0.2s ease',
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