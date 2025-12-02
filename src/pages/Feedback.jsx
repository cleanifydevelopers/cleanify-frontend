import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendFeedback } from '../api'

export default function Feedback() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Load name and email from profile/localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem('userName') || 'User'
    const savedEmail = localStorage.getItem('userEmail') || ''
    setName(savedName)
    setEmail(savedEmail)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      name,
      email,
      category: `Rating: ${rating} Star${rating !== 1 ? 's' : ''}`,
      feedback: feedback || `${rating} star rating`,
      timestamp: new Date().toISOString()
    };

    sendFeedback(payload)
      .then(res => {
        setMessage('✅ Thank you! Your feedback has been submitted.');
        setLoading(false);
        setTimeout(() => {
          nav('/home');
        }, 2000);
      })
      .catch(err => {
        console.error('Feedback error:', err);
        setMessage('❌ Error sending feedback. Please try again.');
        setLoading(false);
      });
  };

  return (
    <div className="page feedback">
      <header><h3>💬 Provide Feedback</h3></header>
      <main>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          
          {/* User Info Display */}
          <div style={{
            padding: '12px',
            background: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#555'
          }}>
            <strong>From:</strong> {name}<br/>
            <strong>Email:</strong> {email}
          </div>

          {/* Star Rating */}
          <div>
            <label style={{display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '16px'}}>
              Rate Your Experience ⭐
            </label>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px',
              background: '#fff9e6',
              borderRadius: '8px',
              border: '2px solid #ffc107'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '32px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: star <= rating ? 1 : 0.3,
                    transition: 'opacity 0.2s, transform 0.2s',
                    transform: star <= rating ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.15)'}
                  onMouseLeave={(e) => e.target.style.transform = star <= rating ? 'scale(1.1)' : 'scale(1)'}
                >
                  ⭐
                </button>
              ))}
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333'
            }}>
              {rating} Star{rating !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Optional Text Feedback */}
          <div>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px'}}>
              Additional Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share any additional thoughts, suggestions, or concerns..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{fontSize: '12px', color: '#999', marginTop: '4px'}}>
              {feedback.length} characters
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div style={{
              padding: '12px',
              borderRadius: '4px',
              background: message.includes('✅') ? '#d4edda' : '#f8d7da',
              color: message.includes('✅') ? '#155724' : '#721c24',
              border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {message}
            </div>
          )}

          {/* Buttons */}
          <div style={{display: 'flex', gap: '12px'}}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: loading ? '#ccc' : '#ffc107',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Sending...' : '📧 Send Feedback'}
            </button>
            <button
              type="button"
              onClick={() => nav('/home')}
              style={{
                flex: 1,
                padding: '14px',
                background: '#999',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>

          {/* Info Box */}
          <div style={{
            padding: '12px',
            background: '#f0f7f6',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#26a69a',
            textAlign: 'center',
            lineHeight: '1.6'
          }}>
            ℹ️ Your feedback helps us improve. Thank you for caring about Cleanify! 🌍
          </div>

        </form>
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
