import React, { useEffect, useState } from 'react'
import { getReport, voteReport } from '../api'
import { useParams, useNavigate } from 'react-router-dom'

export default function ReportDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const [report, setReport] = useState(null)
  const [voted, setVoted] = useState(false)

  useEffect(()=>{ 
    getReport(id).then(setReport).catch(err => {
      console.error(err)
      alert('Failed to load report')
    })
    const votedIds = JSON.parse(localStorage.getItem('voted')||'[]')
    setVoted(votedIds.includes(id))
  }, [id])

  useEffect(() => {
    if (report && report.location && report.location.coordinates) {
      const [lng, lat] = report.location.coordinates
      console.log('📍 RAW from DB:', report.location.coordinates)
      console.log('📍 After destructure:', { lng: lng, lat: lat })
      // Verify coordinates are valid
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        console.log('📍 VALID - Passing to initMap:', { lat, lng })
        initMap(lat, lng)
      } else {
        console.error('📍 INVALID coordinates:', { lat, lng, isNaN_lat: isNaN(lat), isNaN_lng: isNaN(lng) })
      }
    }
  }, [report])

  const initMap = (lat, lng) => {
    console.log('🗺️ initMap called with:', { lat, lng })
    const mapElement = document.getElementById('map')
    if (!mapElement || !window.L) {
      console.error('🗺️ Map element or Leaflet not found')
      return
    }

    // Clear existing map if it exists
    if (mapElement._leafletMap) {
      mapElement._leafletMap.remove()
    }

    console.log('🗺️ Creating map with center:', [lat, lng])
    // Create Leaflet map
    const map = window.L.map('map').setView([lat, lng], 15)
    mapElement._leafletMap = map

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Add marker at the location
    window.L.marker([lat, lng])
      .bindPopup(`<strong>Report Location</strong><br/>Lat: ${lat.toFixed(5)}<br/>Lng: ${lng.toFixed(5)}`)
      .addTo(map)
      .openPopup()
  }

  async function onVote(){
    if(voted) return alert('Already voted in this session')
    try{
      const res = await voteReport(id)
      setReport(r => ({ ...r, votes: res.votes }))
      const votedIds = JSON.parse(localStorage.getItem('voted')||'[]')
      localStorage.setItem('voted', JSON.stringify([...votedIds, id]))
      setVoted(true)
    }catch(err){ 
      console.error(err)
      alert('Vote failed') 
    }
  }

  if (!report) return <div className="page"><main>Loading...</main></div>

  return (
    <div className="page report-detail">
      <header><h3>Report Details</h3></header>
      <main>
        <div className="card">
          <div className="card-head">{report.category}</div>
          <div>Description: {report.description}</div>
          <div>Location: {report.address}</div>
          <div>Status: {report.status}</div>
        </div>

        <div className="card">
          <div className="card-head">📍 Location Map</div>
          <div id="map" style={{width: '100%', height: '300px', borderRadius: '8px', marginTop: '8px'}}>
            Loading map...
          </div>
          <a href={`https://www.google.com/maps/search/${report.location?.coordinates?.[1]},${report.location?.coordinates?.[0]}`} target="_blank" rel="noopener noreferrer" style={{
            display: 'block',
            marginTop: '8px',
            textAlign: 'center',
            color: '#1e9b8a',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            📍 Open in Google Maps
          </a>
        </div>

        <div className="card">
          <div className="card-head">📸 Photos</div>
          <div style={{marginTop: '8px'}}>
            {report.photos && report.photos.length ? (
              report.photos.map((p,i)=> (
                <img key={i} src={p} alt="photo" style={{maxWidth:'100%', display:'block', margin:'8px 0', borderRadius: '8px'}} />
              ))
            ) : (
              <p className="muted">No photos</p>
            )}
          </div>
        </div>

        <div className="actions" style={{margin: '16px'}}>
          <button onClick={onVote} disabled={voted} style={{background: voted ? '#ccc' : '#26a69a'}}>
            👍 {voted ? 'Already Voted' : 'Upvote'} ({report.votes})
          </button>
          <button onClick={() => nav('/reports')} style={{background: '#999'}}>Back</button>
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
