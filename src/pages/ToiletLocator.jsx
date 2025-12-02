import React, { useEffect, useState, useRef } from 'react'
import { getToilets } from '../api'
import { useNavigate } from 'react-router-dom'

export default function ToiletLocator(){
  const nav = useNavigate()
  const [toilets, setToilets] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedToilet, setSelectedToilet] = useState(null)
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef({})

  // Get user location and load nearby toilets
  const loadNearbyToilets = React.useCallback(() => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords
          setUserLocation({ lat: latitude, lng: longitude })
          
          // Fetch nearby toilets from API
          getToilets({ lat: latitude, lng: longitude }).then(data => {
            console.log('🚽 Loaded nearby toilets:', data.length)
            // Sort by distance if available
            const sorted = data.sort((a, b) => {
              const distA = a.distance || 0
              const distB = b.distance || 0
              return distA - distB
            })
            setToilets(sorted)
            setLoading(false)
          }).catch(err => {
            console.error('Error loading toilets:', err)
            setLoading(false)
          })
        },
        () => {
          // Fallback: load all toilets without location
          console.warn('⚠️ Geolocation permission denied, loading all toilets')
          getToilets().then(data => {
            console.log('🚽 Loaded all toilets:', data.length)
            setToilets(data)
            setLoading(false)
          }).catch(err => {
            console.error('Error loading toilets:', err)
            setLoading(false)
          })
        }
      )
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    if (map.current) return // Map already initialized

    map.current = window.L.map(mapContainer.current).setView([20, 78], 5) // Center on India

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current)

    return () => {
      // Cleanup map on unmount
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update map with markers
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // Add user location marker
    if (userLocation) {
      const userMarker = window.L.circleMarker(
        [userLocation.lat, userLocation.lng],
        {
          radius: 8,
          fillColor: '#4CAF50',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }
      )
        .bindPopup('📍 Your Location')
        .addTo(map.current)
      markersRef.current['user'] = userMarker
    }

    // Add toilet markers
    toilets.forEach((toilet, idx) => {
      const [lng, lat] = toilet.location.coordinates
      const marker = window.L.marker([lat, lng], {
        icon: window.L.icon({
          iconUrl: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="24" font-size="24" text-anchor="middle">🚽</text></svg>',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      })
        .bindPopup(`<b>${toilet.name}</b><br/>${toilet.address}<br/>Status: ${toilet.status}${toilet.distance ? `<br/>Distance: ${(toilet.distance / 1000).toFixed(1)} km` : ''}`)
        .on('click', () => setSelectedToilet(toilet))
        .addTo(map.current)
      
      markersRef.current[toilet._id] = marker
    })

    // Fit bounds if we have location and toilets
    if (userLocation && toilets.length > 0) {
      const bounds = window.L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        ...toilets.map(t => [t.location.coordinates[1], t.location.coordinates[0]])
      ])
      map.current.fitBounds(bounds, { padding: [50, 50] })
    } else if (userLocation) {
      map.current.setView([userLocation.lat, userLocation.lng], 13)
    }
  }, [toilets, userLocation])

  useEffect(() => {
    loadNearbyToilets()
  }, [loadNearbyToilets])

  return (
    <div className="page toilet-locator">
      <header><h3>🚽 Toilet Locator</h3></header>
      <main style={{paddingTop: 0, display: 'flex', flexDirection: 'row', overflow: 'hidden'}}>
        
        {/* LEFT PANEL - LIST */}
        <div style={{
          width: '40%',
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          borderRight: '1px solid #ddd',
          overflow: 'hidden'
        }}>
          <div style={{padding: '12px', borderBottom: '1px solid #eee', flexShrink: 0}}>
            <button 
              onClick={loadNearbyToilets}
              style={{
                width: '100%',
                padding: '10px',
                background: '#26a69a',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              🔄 Refresh Nearby
            </button>
            <div style={{marginTop: '8px', fontSize: '12px', color: '#666', textAlign: 'center'}}>
              {loading ? '⏳ Loading...' : `Found ${toilets.length} toilet${toilets.length !== 1 ? 's' : ''}`}
            </div>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {toilets.length === 0 ? (
              <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>
                {loading ? '⏳ Loading toilets...' : '❌ No toilets found nearby'}
              </div>
            ) : (
              toilets.map((toilet, idx) => (
                <div
                  key={toilet._id}
                  onClick={() => setSelectedToilet(toilet)}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    background: selectedToilet?._id === toilet._id ? '#e8f5f3' : '#fff',
                    borderLeft: selectedToilet?._id === toilet._id ? '4px solid #26a69a' : '4px solid transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px'}}>
                    <div style={{fontWeight: '600', color: '#333', fontSize: '14px'}}>
                      #{idx + 1} - 🚽 {toilet.name}
                    </div>
                    {toilet.distance && (
                      <span style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {(toilet.distance / 1000).toFixed(1)} km
                      </span>
                    )}
                  </div>
                  <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>
                    📍 {toilet.address || 'Location not specified'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: toilet.status === 'Operational' ? '#4CAF50' : toilet.status === 'Maintenance' ? '#FF9800' : '#f44336'
                  }}>
                    {toilet.status === 'Operational' ? '✓' : toilet.status === 'Maintenance' ? '⚙️' : '✗'} {toilet.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL - MAP */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#f0f0f0',
          overflow: 'hidden'
        }}>
          {selectedToilet && (
            <div style={{
              padding: '12px',
              background: '#f9f9f9',
              borderBottom: '1px solid #ddd',
              flexShrink: 0
            }}>
              <div style={{fontWeight: '700', fontSize: '16px', color: '#333', marginBottom: '4px'}}>
                🚽 {selectedToilet.name}
              </div>
              <div style={{fontSize: '12px', color: '#666', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                📍 {selectedToilet.address || 'Not specified'}
              </div>
              <div style={{fontSize: '11px', color: '#999', marginBottom: '4px'}}>
                📌 Lat: {selectedToilet.location.coordinates[1].toFixed(6)}, Lng: {selectedToilet.location.coordinates[0].toFixed(6)}
              </div>
              {selectedToilet.distance && (
                <div style={{fontSize: '11px', color: '#999', marginBottom: '4px'}}>
                  🎯 Distance: {(selectedToilet.distance / 1000).toFixed(1)} km
                </div>
              )}
              <div style={{fontSize: '11px', fontWeight: '600', color: selectedToilet.status === 'Operational' ? '#4CAF50' : selectedToilet.status === 'Maintenance' ? '#FF9800' : '#f44336'}}>
                {selectedToilet.status === 'Operational' ? '✓' : selectedToilet.status === 'Maintenance' ? '⚙️' : '✗'} {selectedToilet.status}
              </div>
            </div>
          )}
          
          <div 
            ref={mapContainer}
            style={{
              flex: 1,
              background: '#e0e0e0',
              position: 'relative',
              overflow: 'hidden'
            }}
          />

          {selectedToilet && (
            <div style={{
              padding: '12px',
              background: '#f9f9f9',
              borderTop: '1px solid #ddd',
              display: 'flex',
              gap: '8px',
              flexShrink: 0
            }}>
              <button 
                onClick={() => setSelectedToilet(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#999',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Clear
              </button>
              {selectedToilet.distance && (
                <button 
                  onClick={() => {
                    // Copy coordinates or navigate
                    const text = `${selectedToilet.location.coordinates[1]}, ${selectedToilet.location.coordinates[0]}`
                    navigator.clipboard.writeText(text)
                    alert('📋 Coordinates copied to clipboard!\n' + text)
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#2196F3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  📋 Copy Coords
                </button>
              )}
            </div>
          )}
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
