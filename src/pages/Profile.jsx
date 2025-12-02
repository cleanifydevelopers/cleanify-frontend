import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserBadge } from '../api'

export default function Profile(){
  const nav = useNavigate()
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', address: '' })
  const [badge, setBadge] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const p = JSON.parse(localStorage.getItem('profile')||'{}')
    setProfile({ name: p.name||'', phone: p.phone||'', email: p.email||'', address: p.address||'' })
    
    // Fetch user badge from server
    const userName = localStorage.getItem('userName') || 'Anonymous'
    loadUserBadge(userName)
  }, [])

  const loadUserBadge = async (userName) => {
    try {
      const data = await getUserBadge(userName)
      setBadge(data)
      localStorage.setItem('userBadge', JSON.stringify(data))
    } catch (err) {
      console.error('Failed to load user badge:', err)
      // Fallback to localStorage
      const cached = localStorage.getItem('userBadge')
      if (cached) setBadge(JSON.parse(cached))
    } finally {
      setLoading(false)
    }
  }

  function save(){
    localStorage.setItem('profile', JSON.stringify(profile))
    localStorage.setItem('userEmail', profile.email)
    
    // Save email to database
    const userName = localStorage.getItem('userName') || 'Anonymous'
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
    fetch(`${API_BASE}/api/users/${userName}/update-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: profile.email })
    })
      .then(res => res.json())
      .then(data => {
        console.log('✅ Email saved to database:', data)
        alert('✅ Profile saved! Your email has been updated.')
      })
      .catch(err => {
        console.error('Email save error:', err)
        alert('⚠️ Profile saved locally, but database update failed. Try again later.')
      })
  }

  return (
    <div className="page profile">
      <header><h3>Profile</h3></header>
      <main style={{paddingTop: 0}}>
        {/* BADGE CARD */}
        <div className="card" style={{margin: '16px', background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: '#fff', textAlign: 'center'}}>
          <div style={{fontSize: '60px', marginBottom: '12px'}}>
            {badge?.badgeLevel === 4 ? '👑' : badge?.badgeLevel === 3 ? '🏆' : badge?.badgeLevel === 2 ? '⭐' : '🌱'}
          </div>
          <div style={{fontSize: '24px', fontWeight: '700', marginBottom: '4px'}}>
            {badge?.badge || 'Novice'}
          </div>
          <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '12px'}}>Badge Status</div>
          
          <div style={{background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px', marginTop: '12px'}}>
            <div style={{fontSize: '13px', marginBottom: '4px'}}>
              Reports Submitted: <strong>{badge?.reportsSubmitted || 0}</strong>
            </div>
            <div style={{fontSize: '11px', opacity: 0.9}}>
              {badge?.badgeLevel === 4 && '👑 Hero - 25+ reports'}
              {badge?.badgeLevel === 3 && '🏆 Champion - 10-24 reports'}
              {badge?.badgeLevel === 2 && '⭐ Helper - 5-9 reports'}
              {badge?.badgeLevel === 1 && '🌱 Novice - 1-4 reports'}
            </div>
          </div>
        </div>

        {/* CITIZEN BADGE */}
        <div className="card" style={{margin: '16px', textAlign: 'center'}}>
          <div style={{fontSize: '48px', marginBottom: '12px'}}>👤</div>
          <div className="card-head">Cleanify Citizen</div>
          <p className="muted">Keep posting reports to level up your badge!</p>
        </div>

        <div className="form">
          <label>
            Name
            <input value={profile.name} onChange={e=>setProfile({...profile, name: e.target.value})} placeholder="Your name" />
          </label>
          <label>
            Email
            <input value={profile.email} onChange={e=>setProfile({...profile, email: e.target.value})} placeholder="your@email.com" />
          </label>
          <label>
            Phone
            <input value={profile.phone} onChange={e=>setProfile({...profile, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
          </label>
          <label>
            Address
            <input value={profile.address} onChange={e=>setProfile({...profile, address: e.target.value})} placeholder="Your address" />
          </label>
          <div className="actions">
            <button onClick={save}>💾 Save</button>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <div style={{padding: '16px', marginBottom: '80px'}}>
          <button 
            onClick={() => {
              localStorage.clear()
              nav('/')
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#cc0000'}
            onMouseLeave={(e) => e.target.style.background = '#ff4444'}
          >
            🚪 Logout
          </button>
        </div>
      </main>

      <nav className="bottom-nav">
        <button onClick={()=>nav('/home')}>🏠 Home</button>
        <button onClick={()=>nav('/chat')}>� Chat</button>
        <button className="big" onClick={()=>nav('/post')}>➕</button>
        <button onClick={()=>nav('/reports')}>📋 Reports</button>
        <button onClick={()=>nav('/profile')}>👤 Profile</button>
      </nav>
    </div>
  )
}
