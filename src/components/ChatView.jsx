import { useState, useRef } from 'react';
import { useChat } from '../hooks/useChat';

const PILL_COLORS = [
  { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' },
  { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
  { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
  { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' },
  { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
  { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' },
  { bg: 'rgba(20, 184, 166, 0.15)', text: '#2dd4bf', border: 'rgba(20, 184, 166, 0.3)' },
];

const getPillStyle = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = PILL_COLORS[Math.abs(hash) % PILL_COLORS.length];
  return {
    backgroundColor: color.bg,
    color: color.text,
    border: `1px solid ${color.border}`,
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '0.78rem',
    fontWeight: '600',
    display: 'inline-block',
  };
};

export default function ChatView({ isUnlocked, isAdmin }) {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const textareaRef = useRef(null);
  const {
    chatMessages, loading, loadingMore, hasMore, loadMore,
    name, setName, content, setContent, formError, formSuccess,
    cooldownSeconds, submitting, submitMessage, deleteMessage,
  } = useChat(isUnlocked);

  const formatCooldown = (s) => `${Math.floor(s / 60)}m ${s % 60 < 10 ? '0' : ''}${s % 60}s`;

  const handleTextareaChange = (e) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 70)}px`;
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^[a-zA-Z]+$/.test(val)) setName(val);
  };

  return (
    <div style={s.container}>
      <style>{`
        .delete-btn-hover {
          transition: transform 0.15s ease, opacity 0.15s ease !important;
        }
        .delete-btn-hover:hover {
          transform: scale(1.15) !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Top Bar with Guidelines Button */}
      <div style={s.topBar}>
        <span style={s.chatHeaderTitle}>💬 Chat</span>
        <button style={s.noteBtn} onClick={() => setShowGuidelines(!showGuidelines)}>
          📌 Note {showGuidelines ? '✕' : ''}
        </button>
      </div>

      {/* Guidelines Box */}
      {showGuidelines && (
        <div style={s.guidelinesBox}>
          <h4 style={s.guidelinesHeading}>📌 Chat Guidelines:</h4>
          <div style={s.guidelinesWarning}>You can't delete, edit your messages and you can send one message per hour.</div>
          <br />
          <h4 style={s.guidelinesHeading}>📌 New Person Request Guidelines:</h4>
          <ul style={s.guidelinesList}>
            <li><strong>A real photo of the person</strong> - their face must be clearly visible and not covered by accessories, hair, or other objects.</li>
            <li><strong>At least one social media link</strong> to the person’s official or public profile.</li>
            <li><strong>Their popular social name or nickname</strong> - the name they are commonly known by online.</li>
          </ul>
          <div style={s.guidelinesWarning}>Requests missing any of the above information may not be approved.</div>
        </div>
      )}

      {/* Status Alerts */}
      {cooldownSeconds > 0 && <div style={s.cooldownAlert}>⏳ Cooldown active: <strong>{formatCooldown(cooldownSeconds)}</strong> remaining</div>}
      {formError && <div style={s.errorAlert}>{formError}</div>}
      {formSuccess && <div style={s.successAlert}>{formSuccess}</div>}

      {/* Chat Stream Feed */}
      <div style={s.chatFeed}>
        {loading ? (
          <div style={s.statusMsg}>Loading messages...</div>
        ) : chatMessages.length === 0 ? (
          <div style={s.statusMsg}>No messages yet. Send the first message!</div>
        ) : (
          chatMessages.map((item) => (
            <div key={item.id} style={s.chatBubble}>
              <div style={s.msgBody}>
                <div style={s.msgHeader}>
                  <span style={getPillStyle(item.name)}>{item.name}</span>
                  <span style={s.postId}>#{item.id}</span>

                  {/* Header Right Group: Delete icon (if Admin) + Time */}
                  <div style={s.headerRight}>
                    {isAdmin && (
                      <button
                        type="button"
                        className="delete-btn-hover"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this message?')) {
                            deleteMessage(item.id);
                          }
                        }}
                        title="Delete Message"
                        style={s.deleteBtn}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                    <span style={s.time}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div style={s.msgText}>{item.content}</div>
              </div>
            </div>
          ))
        )}
        {hasMore && (
          <button onClick={loadMore} disabled={loadingMore} style={s.loadBtn}>
            {loadingMore ? 'Loading...' : 'Load older messages'}
          </button>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={submitMessage} style={s.inputBar}>
        <div style={s.inputTopRow}>
          <input
            type="text"
            placeholder="Name (Max 10 letters)"
            maxLength={10}
            value={name}
            onChange={handleNameChange}
            disabled={cooldownSeconds > 0 || submitting}
            style={s.nameInput}
          />
          <span style={s.charCount}>{content.length}/2000</span>
        </div>
        <div style={s.inputBottomRow}>
          <textarea
            ref={textareaRef}
            placeholder="Type your message here..."
            maxLength={2000}
            rows={3}
            value={content}
            onChange={handleTextareaChange}
            disabled={cooldownSeconds > 0 || submitting}
            style={s.textarea}
          />
          <button
            type="submit"
            disabled={cooldownSeconds > 0 || submitting || !name.trim() || !content.trim()}
            style={cooldownSeconds > 0 || submitting || !name.trim() || !content.trim() ? s.sendBtnDisabled : s.sendBtn}
          >
            {submitting ? '...' : 'Send 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
}

const s = {
  container: { width: '100%', maxWidth: '100%', margin: '0 auto', padding: '0 4px', display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#161616', borderRadius: '10px', border: '1px solid #282828' },
  chatHeaderTitle: { fontSize: '0.92rem', fontWeight: 'bold', color: '#eee' },
  noteBtn: { backgroundColor: '#252525', color: '#ffc107', border: '1px solid #3d3d3d', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' },
  guidelinesBox: { backgroundColor: '#1a1810', border: '1px solid #d4a373', borderRadius: '10px', padding: '12px 16px' },
  guidelinesHeading: { margin: '0 0 6px 0', color: '#ffb703', fontSize: '0.85rem' },
  guidelinesList: { margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#ddd', lineHeight: '1.4' },
  guidelinesWarning: { marginTop: '8px', fontSize: '0.75rem', color: '#ff6b6b', fontWeight: 'bold' },
  cooldownAlert: { backgroundColor: 'rgba(255, 171, 0, 0.12)', border: '1px solid #ffab00', color: '#ffc107', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center' },
  errorAlert: { backgroundColor: 'rgba(255, 77, 77, 0.12)', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center' },
  successAlert: { backgroundColor: 'rgba(0, 230, 118, 0.12)', border: '1px solid #00e676', color: '#00e676', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center' },
  chatFeed: { display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '300px', padding: '0px', backgroundColor: '#111', border: 'none' },
  chatBubble: { backgroundColor: '#1a1a1a', padding: '10px 14px', borderRadius: '12px', border: '1px solid #262626' },
  msgBody: { width: '100%' },
  msgHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  headerRight: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' },
  deleteBtn: { background: 'none', border: 'none', padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.75 },
  postId: { fontSize: '0.7rem', color: '#0070f3', backgroundColor: '#222', padding: '1px 5px', borderRadius: '4px' },
  time: { fontSize: '0.7rem', color: '#666' },
  msgText: { fontSize: '0.88rem', color: '#ccc', lineHeight: '1.45', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  statusMsg: { textAlign: 'center', color: '#666', fontSize: '0.85rem', padding: '30px 0' },
  loadBtn: { alignSelf: 'center', backgroundColor: '#222', border: '1px solid #333', color: '#aaa', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' },
  inputBar: { display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#161616', padding: '12px', borderRadius: '12px', border: '1px solid #282828' },
  inputTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  nameInput: { backgroundColor: '#0d0d0d', border: '1px solid #333', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '0.8rem', width: '160px', outline: 'none' },
  charCount: { fontSize: '0.72rem', color: '#666' },
  inputBottomRow: { display: 'flex', gap: '8px', alignItems: 'flex-end' },
  textarea: { flex: 1, backgroundColor: '#0d0d0d', border: '1px solid #333', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none', resize: 'vertical', minHeight: '70px', maxHeight: '300px', overflowY: 'auto' },
  sendBtn: { backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 16px', height: '38px', fontWeight: 'bold', fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' },
  sendBtnDisabled: { backgroundColor: '#2a2a2a', color: '#555', border: 'none', borderRadius: '8px', padding: '0 16px', height: '38px', fontWeight: 'bold', fontSize: '0.82rem', cursor: 'not-allowed', whiteSpace: 'nowrap' }
};