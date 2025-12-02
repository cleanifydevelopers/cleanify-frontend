import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const nav = useNavigate()
  const [name, setName] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('userName')
    if (saved) setName(saved)
  }, [])

  const handleContinue = () => {
    if (!name.trim()) {
      alert('Please enter your name')
      return
    }
    localStorage.setItem('userName', name)
    nav('/home')
  }

  return (
    <div className="page landing">
      <div className="logo">🌿 Cleanify</div>
      <h1>Keep our city clean</h1>
      <p className="muted">Report issues quickly and easily</p>
      
      <div style={{width: '100%', maxWidth: '300px', margin: '30px auto 20px'}}>
        <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#111'}}>
          What's your name?
        </label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
          style={{
            width: '100%', 
            padding: '12px', 
            border: '2px solid #1e9b8a',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center'
          }}
        />
      </div>

      <button 
        className="primary" 
        onClick={handleContinue} 
        style={{padding: '14px 32px', fontSize: '16px', fontWeight: '600'}}
      >
        Continue
      </button>

      <div style={{margin: '20px 0', fontSize: '12px', color: '#999'}}>or</div>

      <button 
        className="primary" 
        onClick={() => nav('/municipal')} 
        style={{padding: '14px 32px', fontSize: '16px', fontWeight: '600', background: '#26a69a'}}
      >
        👷 Continue as Municipal Worker
      </button>
    </div>
  )
}
