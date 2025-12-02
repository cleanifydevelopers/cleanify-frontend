import React, { useState } from 'react'
import { uploadPhotos, createReport, incrementUserReports } from '../api'
import { useNavigate } from 'react-router-dom'

const categories = ['Garbage', 'Overflowing Dustbin', 'Open Drain', 'Sanitation Issue', 'Other']

export default function PostComplaint(){
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState(categories[0])
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)

  React.useEffect(() => {
    if (lat || lng) {
      console.log('📋 FORM STATE CHANGED:', { lat, lng })
    }
  }, [lat, lng])

  const startGeo = ()=>{
    if(!navigator.geolocation) {
      alert('Geolocation not available on this device')
      return
    }
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords
      console.log('🌍 GEOLOCATION RAW:', { latitude, longitude })
      console.log('🌍 Setting state - setLat:', latitude, 'setLng:', longitude)
      setLat(latitude)
      setLng(longitude)
      setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
      alert(`Location captured:\nLat: ${latitude.toFixed(5)}\nLng: ${longitude.toFixed(5)}\n\nClick "Verify on Google Maps" link to confirm!`)
    }, (err)=>{
      console.error('🌍 GEOLOCATION ERROR:', err)
      alert('Geolocation failed. Please enter coordinates manually in the address field (format: lat,lng)')
    })
  }

  const parseAddressCoords = (text) => {
    // Try to parse "lat,lng" format from address field
    const parts = text.split(',')
    if (parts.length === 2) {
      const parsedLat = parseFloat(parts[0].trim())
      const parsedLng = parseFloat(parts[1].trim())
      if (!isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180) {
        setLat(parsedLat)
        setLng(parsedLng)
        return true
      }
    }
    return false
  }

  const onSubmit = async () => {
    try{
      // Validate that coordinates are set
      if (!lat || !lng) {
        alert('Please set location by either:\n1. Clicking "Auto Geolocation"\n2. Entering lat,lng manually in address field')
        return
      }

      setLoading(true)
      let photoUrls = []
      if (files.length) {
        const up = await uploadPhotos(files)
        photoUrls = up.urls || []
      }
      // Ensure lat and lng are numbers
      const finalLat = parseFloat(lat)
      const finalLng = parseFloat(lng)
      
      if (isNaN(finalLat) || isNaN(finalLng)) {
        setLoading(false)
        alert('Invalid coordinates. Please check Lat/Lng values.')
        return
      }

      console.log('📤 SUBMIT - Raw form values:', { lat, lng, address })
      console.log('📤 SUBMIT - Parsed values:', { finalLat, finalLng })
      console.log('📤 SUBMIT - Payload to backend:', { category, description, address, lat: finalLat, lng: finalLng, photoCount: photoUrls.length })
      const payload = { category, description, address, lat: finalLat, lng: finalLng, photos: photoUrls }
      const res = await createReport(payload)
      
      // Increment user reports and update badge
      const userName = localStorage.getItem('userName') || 'Anonymous'
      const userBadge = await incrementUserReports(userName)
      
      // Store badge in localStorage for display in chat
      localStorage.setItem('userBadge', JSON.stringify(userBadge))
      console.log(`🏆 Badge updated - ${userBadge.badge} (${userBadge.reportsSubmitted} reports)`)
      
      setLoading(false)
      nav(`/submitted/${res.id}`)
    }catch(err){
      setLoading(false)
      console.error(err)
      alert('Submit failed: ' + err.message)
    }
  }

  return (
    <div className="page post">
      <header><h3>Post a Complaint</h3></header>
      <main style={{flex: 1, paddingTop: 0}}>
        {step===0 && (
          <div className="categories">
            <p style={{marginBottom: '16px', fontWeight: '600'}}>Select a Category</p>
            {categories.map(c => (
              <button key={c} onClick={() => { setCategory(c); setStep(1) }}>{c}</button>
            ))}
          </div>
        )}

        {step===1 && (
          <div className="form">
            <div style={{marginBottom: '16px'}}>
              <strong>Category:</strong> {category}
            </div>
            <label>
              Description
              <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the issue..." />
            </label>
            <label>
              Location (enter address or lat,lng)
              <input 
                value={address} 
                onChange={e=>{
                  setAddress(e.target.value)
                  parseAddressCoords(e.target.value)
                }} 
                placeholder="e.g., 28.7041,77.1025 or Main Street, City"
              />
            </label>
            <button onClick={startGeo} style={{width: '100%', marginBottom: '16px', background: '#26a69a'}}>📍 Auto Geolocation</button>
            
            <div style={{marginBottom: '16px', padding: '12px', background: lat && lng ? '#e0f5e9' : '#fff3e0', borderRadius: '8px', fontSize: '12px', border: lat && lng ? '2px solid #26a69a' : '2px solid #ff9800'}}>
              <strong style={{color: lat && lng ? '#26a69a' : '#ff9800'}}>
                {lat && lng ? '✓ Coordinates Set' : '⚠ Coordinates Not Set'}
              </strong><br/>
              <span style={{fontSize: '11px', opacity: 0.8}}>Format: lat,lng (e.g., 18.5204,73.8567 for Pune)</span><br/>
              Lat: {lat ? lat.toFixed(5) : 'Not set'}<br/>
              Lng: {lng ? lng.toFixed(5) : 'Not set'}<br/>
              {lat && lng && (
                <a href={`https://www.google.com/maps/search/${lat},${lng}`} target="_blank" rel="noopener noreferrer" style={{color: '#26a69a', textDecoration: 'none', marginTop: '4px', display: 'inline-block', fontWeight: '600'}}>
                  🔗 Verify on Google Maps
                </a>
              )}
            </div>

            <label>
              Photos
              <input type="file" multiple accept="image/*" onChange={e=> setFiles(Array.from(e.target.files || []))} />
            </label>

            <div className="actions">
              <button onClick={()=>setStep(0)} style={{background: '#999'}}>Back</button>
              <button onClick={onSubmit} disabled={loading || !lat || !lng} style={{background: !lat || !lng ? '#ccc' : '#1e9b8a'}}>
                {loading? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}
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
