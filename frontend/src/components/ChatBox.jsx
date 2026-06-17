import React, { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

const ChatBox = ({ pesananId }) => {
  const { user, socket } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch Chat History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosInstance.get(`/chat/${pesananId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [pesananId]);

  // 2. Join Socket Room and Listen for Messages
  useEffect(() => {
    if (socket) {
      socket.emit('join_room', pesananId);

      const handleIncomingMessage = (message) => {
        // Only append if it belongs to this order
        if (Number(message.pesanan_id) === Number(pesananId)) {
          setMessages((prev) => [...prev, message]);
        }
      };

      socket.on('receive_message', handleIncomingMessage);

      return () => {
        socket.off('receive_message', handleIncomingMessage);
      };
    }
  }, [socket, pesananId]);

  // 3. Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // 4. Send Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (socket) {
      socket.emit('send_message', {
        pesananId: pesananId,
        isi: inputText
      });
      setInputText('');
    } else {
      alert('Koneksi chat terputus. Silakan muat ulang halaman.');
    }
  };

  const formatChatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Memuat riwayat chat...</span>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '450px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-glass)',
        background: 'rgba(28, 21, 67, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: socket ? 'var(--accent-teal)' : 'var(--accent-red)',
          boxShadow: socket ? 'var(--shadow-neon-teal)' : 'none'
        }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ruang Diskusi Pesanan #{pesananId}</span>
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            Mulai percakapan untuk membahas detail pesanan ini.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div 
                key={msg.id} 
                style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: '75%',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}>
                  {/* Sender Name & Role */}
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    marginBottom: '2px',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center'
                  }}>
                    {isMe ? 'Anda' : msg.sender_nama}
                    <span style={{
                      fontSize: '0.6rem',
                      textTransform: 'uppercase',
                      color: msg.sender_role === 'freelancer' ? 'var(--accent-teal)' : 'var(--accent-purple)',
                      fontWeight: 'bold'
                    }}>
                      ({msg.sender_role})
                    </span>
                  </span>

                  {/* Message Bubble */}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    borderTopRightRadius: isMe ? '2px' : '12px',
                    borderTopLeftRadius: isMe ? '12px' : '2px',
                    backgroundColor: isMe ? 'var(--accent-purple)' : 'var(--bg-tertiary)',
                    border: '1px solid',
                    borderColor: isMe ? 'rgba(255,255,255,0.1)' : 'var(--border-glass)',
                    color: 'var(--text-primary)',
                    boxShadow: isMe ? '0 2px 10px rgba(139, 92, 246, 0.2)' : 'none',
                    wordBreak: 'break-word',
                    fontSize: '0.85rem'
                  }}>
                    <p style={{ margin: 0 }}>{msg.isi}</p>
                  </div>

                  {/* Timestamp */}
                  <span style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    marginTop: '2px'
                  }}>
                    {formatChatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={handleSendMessage}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-glass)',
          background: 'rgba(10, 7, 27, 0.6)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          placeholder="Tulis pesan..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            backgroundColor: 'rgba(10, 7, 27, 0.8)',
            border: '1px solid var(--border-glass)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            outline: 'none',
            fontSize: '0.85rem'
          }}
        />
        <button 
          type="submit"
          className="btn btn-teal"
          style={{
            padding: '10px',
            borderRadius: '8px',
            flexShrink: 0
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
