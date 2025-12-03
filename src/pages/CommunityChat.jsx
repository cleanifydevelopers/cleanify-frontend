import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChatMessages, sendChatMessage } from '../api'

export default function CommunityChat(){
  const nav = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const userName = localStorage.getItem('userName') || 'Anonymous'
  const userBadge = JSON.parse(localStorage.getItem('userBadge') || '{}')

  useEffect(() => {
    loadMessages()
    // Refresh chat every 3 seconds to get new messages
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadMessages = async () => {
    try {
      const data = await getChatMessages()
      setMessages(data)
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    
    try {
      setLoading(true)
      await sendChatMessage({
        userName,
        text: input.trim(),
        badge: userBadge.badge || 'Novice',
        badgeLevel: userBadge.badgeLevel || 1
      })
      setInput('')
      // Reload messages after sending
      await loadMessages()
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page community-chat">
      <header><h3>💬 Community Chat</h3></header>
      <main style={{display: 'flex', flexDirection: 'column', paddingTop: 0, height: '100%', overflow: 'hidden'}}>
        <div style={{flex: 1, overflowY: 'auto', padding: '12px'}}>
          {messages.length === 0 ? (
            <div style={{textAlign: 'center', color: '#999', marginTop: '20px'}}>
              <p>No messages yet. Be the first to chat!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const badgeEmoji = msg.badgeLevel === 4 ? '👑' : msg.badgeLevel === 3 ? '🏆' : msg.badgeLevel === 2 ? '⭐' : '🌱'
              return (
                <div key={idx} style={{
                  marginBottom: '12px',
                  padding: '10px',
                  background: msg.userName === userName ? '#e0f2f1' : '#f5f5f5',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${msg.userName === userName ? '#1e9b8a' : '#999'}`
                }}>
                  <div style={{fontWeight: '600', fontSize: '12px', color: '#666', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <span>{msg.userName}</span>
                    <span style={{fontSize: '14px'}}>{badgeEmoji}</span>
                    <span style={{badge: msg.badge, fontSize: '10px', background: '#fff9c4', padding: '2px 6px', borderRadius: '3px'}}>{msg.badge}</span>
                  </div>
                  <div style={{fontSize: '14px'}}>{msg.text}</div>
                </div>
              )
            })
          )}
        </div>

        <div style={{
          borderTop: '1px solid #eee',
          padding: '12px',
          display: 'flex',
          gap: '8px',
          background: 'white',
          flexShrink: 0
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
            placeholder="Type a message..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              opacity: loading ? 0.6 : 1
            }}
          />
          <button onClick={sendMessage} disabled={loading} style={{padding: '10px 16px', background: loading ? '#999' : '#1e9b8a', minWidth: '50px', cursor: loading ? 'not-allowed' : 'pointer'}}>
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </main>

      <nav className="bottom-nav">
        <button onClick={()=>nav('/home')}>🏠 Home</button>
        <button onClick={()=>nav('/chat')}>💬 Chat</button>
        <button className="big" onClick={()=>nav('/post')}>➕</button>
        <button onClick={()=>nav('/reports')}>📋 Reports</button>
        <button onClick={()=>nav('/profile')}>👤 Profile</button>
      </nav>
    </div>
  )
}
