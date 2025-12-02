import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listReports } from '../api'

export default function Home() {
  const nav = useNavigate()
  const [latest, setLatest] = useState(null)

  useEffect(() => {
    let mounted = true
    listReports().then(d => { if (mounted && d.length) setLatest(d[0]) }).catch(()=>{})
    return () => { mounted = false }
  }, [])

  return (
    <div className="page home">
      <main>
        <div className="greeting">
          <h2>Good Afternoon, Welcome</h2>
          <p>Cleanify Citizen</p>
        </div>

        {latest ? (
          <div className="status-card">
            <div className="status-title">Overflow of Sewerage or Storm Water reported</div>
            <div className="status-info">
              <span>ID: {latest._id.slice(0, 8)}</span>
              <button className="view-btn" onClick={() => nav(`/reports/${latest._id}`)}>View Status</button>
            </div>
          </div>
        ) : null}

        <div className="tiles">
          <button className="tile tile-1" onClick={() => nav('/post')}>
            📋<br/>Post A Complaint
          </button>
          <button className="tile tile-2" onClick={() => alert('Coming soon')}>
            💧<br/>Drinking Water
          </button>
          <button className="tile tile-3" onClick={() => nav('/toilets')}>
            📍<br/>Toilet Locator
          </button>
          <button className="tile tile-4" onClick={() => nav('/feedback')}>
            💬<br/>Provide Feedback
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
