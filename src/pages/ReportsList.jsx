import React, { useEffect, useState } from 'react'
import { listReports } from '../api'
import { Link, useNavigate } from 'react-router-dom'

export default function ReportsList(){
  const nav = useNavigate()
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('city')

  const load = React.useCallback(() => {
    if (filter==='nearby' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords
        listReports(`?filter=nearby&lat=${latitude}&lng=${longitude}&radius=500`).then(data => {
          console.log('📍 Loaded nearby reports:', data.length)
          setReports(data)
        }).catch(err => console.error('Error loading nearby:', err))
      }, ()=> listReports().then(data => {
        console.log('📋 Loaded reports (fallback):', data.length)
        setReports(data)
      }).catch(err => console.error('Error loading reports:', err)))
    } else {
      listReports().then(data => {
        console.log('📋 Loaded reports:', data.length)
        setReports(data)
      }).catch(err => console.error('Error loading reports:', err))
    }
  }, [filter])

  useEffect(()=>{
    load()
  }, [filter, load])

  useEffect(()=>{
    // Auto-refresh every 2 seconds to catch deleted reports
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing reports list...')
      load()
    }, 2000)
    return () => clearInterval(interval)
  }, [load])

  return (
    <div className="page reports">
      <header><h3>Reports</h3></header>
      <main style={{paddingTop: 0}}>
        <div className="filters">
          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="city">City</option>
            <option value="nearby">Nearby</option>
            <option value="posted">Posted</option>
          </select>
          <button onClick={load}>🔄</button>
        </div>

        <div className="list">
          {reports.length ? reports.map(r => (
            <div key={r._id} className="item" onClick={() => nav(`/reports/${r._id}`)}>
              <div className="row">
                <strong>{r.category}</strong>
                <span>⭐ {r.votes}</span>
              </div>
              <div>{r.description?.slice(0, 50)}...</div>
              <div style={{marginTop: '6px'}}>ID: <Link to={`/reports/${r._id}`}>{r._id.slice(0, 12)}...</Link></div>
            </div>
          )) : <div className="muted" style={{padding: '16px', textAlign: 'center'}}>No reports</div>}
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
