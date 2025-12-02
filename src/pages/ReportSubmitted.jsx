import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function ReportSubmitted(){
  const { id } = useParams()
  const nav = useNavigate()
  return (
    <div className="page submitted">
      <header><h3>Report Submitted ✓</h3></header>
      <main>
        <div className="card" style={{textAlign: 'center', marginTop: '40px'}}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>✅</div>
          <p style={{fontSize: '16px', marginBottom: '12px'}}>Your report has been submitted successfully!</p>
          <p className="muted">Report ID:</p>
          <p style={{fontFamily: 'monospace', fontWeight: '600', fontSize: '12px', wordBreak: 'break-all', marginBottom: '24px'}}>{id}</p>
          <div className="actions">
            <button onClick={()=>nav('/reports')}>View My Reports</button>
            <button onClick={()=>nav('/home')} style={{background: '#999'}}>Go to Home</button>
          </div>
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
