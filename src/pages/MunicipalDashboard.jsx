import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listReports, addToilet, getToilets, updateToiletStatus, deleteToilet } from '../api'

export default function MunicipalDashboard() {
  const nav = useNavigate()
  const [activeTab, setActiveTab] = useState('reports') // 'reports' or 'toilets'
  const [reports, setReports] = useState([])
  const [toilets, setToilets] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedToilet, setSelectedToilet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapKey, setMapKey] = useState(0)
  const [showAddToilet, setShowAddToilet] = useState(false)
  const [newToilet, setNewToilet] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    status: 'Operational'
  })

  useEffect(() => {
    fetchReports()
    fetchToilets()
  }, [])

  useEffect(() => {
    if (reports.length > 0 && !selectedReport) {
      setSelectedReport(reports[0])
    }
  }, [reports])

  useEffect(() => {
    if (toilets.length > 0 && !selectedToilet && activeTab === 'toilets') {
      setSelectedToilet(toilets[0])
    }
  }, [toilets, activeTab])

  useEffect(() => {
    if (activeTab === 'reports' && selectedReport) {
      setMapKey(prev => prev + 1)
      setTimeout(() => renderMap('report'), 100)
    } else if (activeTab === 'toilets' && selectedToilet) {
      setMapKey(prev => prev + 1)
      setTimeout(() => renderMap('toilet'), 100)
    }
  }, [selectedReport, selectedToilet, activeTab])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await listReports('?filter=city')
      setReports(data)
    } catch (err) {
      console.error(err)
      alert('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const fetchToilets = async () => {
    try {
      const data = await getToilets()
      setToilets(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSolved = async (reportId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
      const res = await fetch(`${API_BASE}/api/reports/${reportId}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Solved' })
      })
      if (!res.ok) throw new Error('Failed to delete report')
      
      alert('✅ Report solved and removed!')
      // Remove from list
      setReports(reports.filter(r => r._id !== reportId))
      setSelectedReport(null)
    } catch (err) {
      console.error(err)
      alert('Failed to solve report: ' + err.message)
    }
  }

  const handleAddToilet = async () => {
    try {
      if (!newToilet.name || !newToilet.address || !newToilet.lat || !newToilet.lng) {
        alert('Please fill all fields');
        return;
      }
      
      const lat = parseFloat(newToilet.lat);
      const lng = parseFloat(newToilet.lng);
      
      // Validate coordinates
      if (isNaN(lat) || isNaN(lng)) {
        alert('Latitude and Longitude must be valid numbers');
        return;
      }
      
      if (lat < -90 || lat > 90) {
        alert('Latitude must be between -90 and 90');
        return;
      }
      
      if (lng < -180 || lng > 180) {
        alert('Longitude must be between -180 and 180');
        return;
      }
      
      const toilet = await addToilet({
        name: newToilet.name,
        address: newToilet.address,
        lat: lat,
        lng: lng,
        status: newToilet.status
      });
      
      alert('✅ Toilet added successfully!');
      setToilets([...toilets, toilet]);
      setShowAddToilet(false);
      setNewToilet({ name: '', address: '', lat: '', lng: '', status: 'Operational' });
    } catch (err) {
      console.error(err);
      alert('Failed to add toilet: ' + err.message);
    }
  }

  const handleDeleteToilet = async (toiletId) => {
    if (!confirm('Are you sure you want to delete this toilet?')) return;
    
    try {
      await deleteToilet(toiletId);
      setToilets(toilets.filter(t => t._id !== toiletId));
      setSelectedToilet(null);
      alert('✅ Toilet deleted!');
    } catch (err) {
      console.error(err);
      alert('Failed to delete toilet: ' + err.message);
    }
  }

  const handleUpdateToiletStatus = async (toiletId, status) => {
    try {
      const updated = await updateToiletStatus(toiletId, status);
      setToilets(toilets.map(t => t._id === toiletId ? updated : t));
      setSelectedToilet(updated);
      alert('✅ Toilet status updated!');
    } catch (err) {
      console.error(err);
      alert('Failed to update toilet: ' + err.message);
    }
  }

  const renderMap = (type) => {
    const mapContainer = document.getElementById('map-container')
    if (!mapContainer || !window.L) return
    
    let lat, lng, title, desc;
    
    if (type === 'report' && selectedReport) {
      if (!selectedReport.location || !selectedReport.location.coordinates) return
      const [lng_, lat_] = selectedReport.location.coordinates
      lng = lng_
      lat = lat_
      title = selectedReport.category
      desc = selectedReport.description.substring(0, 50)
    } else if (type === 'toilet' && selectedToilet) {
      const [lng_, lat_] = selectedToilet.location.coordinates
      lng = lng_
      lat = lat_
      title = selectedToilet.name
      desc = selectedToilet.address
    } else {
      return
    }
    
    if (mapContainer._leafletMap) {
      mapContainer._leafletMap.remove()
      mapContainer.innerHTML = ''
    }
    
    const map = window.L.map('map-container').setView([lat, lng], 15)
    mapContainer._leafletMap = map
    
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(map)
    
    const icon = type === 'report' ? '📋' : '🚽'
    window.L.marker([lat, lng])
      .bindPopup(`<strong>${title}</strong><br/>${desc}`)
      .addTo(map)
      .openPopup()
  }

  if (loading) {
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: '#fff'}}>
        <div style={{fontSize: '18px', color: '#666'}}>Loading reports...</div>
      </div>
    )
  }

  return (
    <div style={{display: 'flex', height: '100vh', width: '100vw', background: '#fff', overflow: 'hidden'}}>
      {/* LEFT PANEL - 550px FIXED */}
      <div style={{
        width: '550px',
        flexShrink: 0,
        borderRight: '2px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff'
      }}>
        {/* HEADER WITH TABS */}
        <div style={{
          padding: '16px',
          background: '#1e9b8a',
          color: '#fff',
          borderBottom: '1px solid #ddd',
          flexShrink: 0
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
            <h2 style={{margin: 0, fontSize: '18px', fontWeight: '600'}}>
              {activeTab === 'reports' ? '📋 Reports (' + reports.length + ')' : '🚽 Toilets (' + toilets.length + ')'}
            </h2>
            <button 
              onClick={() => nav('/')} 
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              Logout
            </button>
          </div>
          
          {/* TABS */}
          <div style={{display: 'flex', gap: '8px'}}>
            <button 
              onClick={() => setActiveTab('reports')}
              style={{
                flex: 1,
                padding: '8px',
                background: activeTab === 'reports' ? '#fff' : 'rgba(255,255,255,0.3)',
                color: activeTab === 'reports' ? '#1e9b8a' : '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              📋 Reports
            </button>
            <button 
              onClick={() => setActiveTab('toilets')}
              style={{
                flex: 1,
                padding: '8px',
                background: activeTab === 'toilets' ? '#fff' : 'rgba(255,255,255,0.3)',
                color: activeTab === 'toilets' ? '#1e9b8a' : '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              🚽 Toilets
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{padding: '12px', borderBottom: '1px solid #eee', flexShrink: 0, display: 'flex', gap: '8px'}}>
          <button 
            onClick={() => activeTab === 'reports' ? fetchReports() : fetchToilets()}
            style={{
              flex: 1,
              padding: '8px',
              background: '#26a69a',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            🔄 Refresh
          </button>
          {activeTab === 'toilets' && (
            <button 
              onClick={() => setShowAddToilet(!showAddToilet)}
              style={{
                flex: 1,
                padding: '8px',
                background: '#ff9800',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              ➕ Add Toilet
            </button>
          )}
        </div>

        {/* ADD TOILET FORM - CONDITIONAL */}
        {showAddToilet && activeTab === 'toilets' && (
          <div style={{
            padding: '12px',
            borderBottom: '1px solid #ddd',
            background: '#f0f7f6',
            flexShrink: 0
          }}>
            <div style={{fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#333'}}>
              ➕ Add New Toilet
            </div>
            <input 
              type="text"
              placeholder="Toilet Name"
              value={newToilet.name}
              onChange={(e) => setNewToilet({...newToilet, name: e.target.value})}
              style={{
                width: '100%',
                padding: '6px',
                marginBottom: '6px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
            <input 
              type="text"
              placeholder="Address"
              value={newToilet.address}
              onChange={(e) => setNewToilet({...newToilet, address: e.target.value})}
              style={{
                width: '100%',
                padding: '6px',
                marginBottom: '6px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
            <input 
              type="number"
              placeholder="Latitude"
              step="0.0001"
              value={newToilet.lat}
              onChange={(e) => setNewToilet({...newToilet, lat: e.target.value})}
              style={{
                width: '48%',
                padding: '6px',
                marginBottom: '6px',
                marginRight: '4%',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
            <input 
              type="number"
              placeholder="Longitude"
              step="0.0001"
              value={newToilet.lng}
              onChange={(e) => setNewToilet({...newToilet, lng: e.target.value})}
              style={{
                width: '48%',
                padding: '6px',
                marginBottom: '6px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
            <select 
              value={newToilet.status}
              onChange={(e) => setNewToilet({...newToilet, status: e.target.value})}
              style={{
                width: '100%',
                padding: '6px',
                marginBottom: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            >
              <option value="Operational">Operational</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Closed">Closed</option>
            </select>
            <div style={{display: 'flex', gap: '6px'}}>
              <button 
                onClick={handleAddToilet}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Add
              </button>
              <button 
                onClick={() => setShowAddToilet(false)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#999',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* REPORTS/TOILETS LIST - SCROLLABLE */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {activeTab === 'reports' ? (
            // REPORTS LIST
            reports.length === 0 ? (
              <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>
                No reports to display
              </div>
            ) : (
              reports.map(report => (
                <div 
                  key={report._id}
                  onClick={() => setSelectedReport(report)}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    background: selectedReport?._id === report._id ? '#e8f5f3' : '#fff',
                    borderLeft: selectedReport?._id === report._id ? '4px solid #1e9b8a' : '4px solid transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{fontWeight: '600', color: '#333', marginBottom: '4px', fontSize: '14px'}}>
                    {report.category}
                  </div>
                  <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>
                    📍 {report.address || 'Location not specified'}
                  </div>
                  <div style={{fontSize: '12px', color: '#999', marginBottom: '8px', lineHeight: '1.3'}}>
                    {report.description.substring(0, 60)}...
                  </div>
                  <div style={{fontSize: '11px', color: report.status === 'Solved' ? '#4CAF50' : '#FF9800', marginBottom: '8px', fontWeight: '600'}}>
                    Status: {report.status || 'Open'}
                  </div>
                  <div style={{display: 'flex', gap: '6px'}}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedReport(report) }}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '11px',
                        background: '#1e9b8a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      🗺️ Show
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSolved(report._id) }}
                      disabled={report.status === 'Solved'}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '11px',
                        background: report.status === 'Solved' ? '#ccc' : '#4CAF50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: report.status === 'Solved' ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      ✓ Done
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            // TOILETS LIST
            toilets.length === 0 ? (
              <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>
                No toilets to display
              </div>
            ) : (
              toilets.map(toilet => (
                <div 
                  key={toilet._id}
                  onClick={() => setSelectedToilet(toilet)}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    background: selectedToilet?._id === toilet._id ? '#e8f9f7' : '#fff',
                    borderLeft: selectedToilet?._id === toilet._id ? '4px solid #1e9b8a' : '4px solid transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{fontWeight: '600', color: '#333', marginBottom: '4px', fontSize: '14px'}}>
                    🚽 {toilet.name}
                  </div>
                  <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>
                    📍 {toilet.address || 'Location not specified'}
                  </div>
                  <div style={{fontSize: '11px', color: '#999', marginBottom: '8px'}}>
                    📌 {toilet.location.coordinates[1].toFixed(4)}, {toilet.location.coordinates[0].toFixed(4)}
                  </div>
                  <div style={{fontSize: '11px', color: toilet.status === 'Operational' ? '#4CAF50' : toilet.status === 'Maintenance' ? '#FF9800' : '#f44336', marginBottom: '8px', fontWeight: '600'}}>
                    {toilet.status === 'Operational' ? '✓' : toilet.status === 'Maintenance' ? '⚙️' : '✗'} {toilet.status}
                  </div>
                  <div style={{display: 'flex', gap: '6px'}}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedToilet(toilet) }}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '11px',
                        background: '#1e9b8a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      🗺️ Show
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteToilet(toilet._id) }}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '11px',
                        background: '#f44336',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* RIGHT PANEL - FLEX FILL */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        overflow: 'hidden'
      }}>
        {/* DETAILS HEADER */}
        <div style={{
          padding: '12px',
          background: '#f9f9f9',
          borderBottom: '1px solid #ddd',
          flexShrink: 0
        }}>
          {activeTab === 'reports' ? (
            // REPORT DETAILS
            selectedReport ? (
              <>
                <div style={{fontWeight: '700', fontSize: '16px', color: '#333', marginBottom: '4px'}}>
                  {selectedReport.category}
                </div>
                <div style={{fontSize: '12px', color: '#666', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  📍 {selectedReport.address || 'Not specified'}
                </div>
                <div style={{fontSize: '11px', color: '#999', marginBottom: '4px'}}>
                  ⏰ {new Date(selectedReport.createdAt).toLocaleString()}
                </div>
                <div style={{fontSize: '12px', color: '#333', marginBottom: '4px', lineHeight: '1.3'}}>
                  <strong>Description:</strong> {selectedReport.description.substring(0, 80)}
                </div>
                <div style={{fontSize: '11px', fontWeight: '600', color: selectedReport.status === 'Solved' ? '#4CAF50' : '#FF9800'}}>
                  Status: {selectedReport.status || 'Open'}
                </div>
              </>
            ) : (
              <div style={{color: '#999', textAlign: 'center', fontSize: '13px'}}>
                Select a report to view details
              </div>
            )
          ) : (
            // TOILET DETAILS
            selectedToilet ? (
              <>
                <div style={{fontWeight: '700', fontSize: '16px', color: '#333', marginBottom: '4px'}}>
                  🚽 {selectedToilet.name}
                </div>
                <div style={{fontSize: '12px', color: '#666', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  📍 {selectedToilet.address || 'Not specified'}
                </div>
                <div style={{fontSize: '11px', color: '#999', marginBottom: '4px'}}>
                  📌 Lat: {selectedToilet.location.coordinates[1].toFixed(6)}, Lng: {selectedToilet.location.coordinates[0].toFixed(6)}
                </div>
                <div style={{fontSize: '11px', color: '#999', marginBottom: '4px'}}>
                  ⏰ Added on {new Date(selectedToilet.createdAt).toLocaleString()}
                </div>
                <div style={{fontSize: '11px', fontWeight: '600', color: selectedToilet.status === 'Operational' ? '#4CAF50' : selectedToilet.status === 'Maintenance' ? '#FF9800' : '#f44336'}}>
                  {selectedToilet.status === 'Operational' ? '✓' : selectedToilet.status === 'Maintenance' ? '⚙️' : '✗'} {selectedToilet.status}
                </div>
              </>
            ) : (
              <div style={{color: '#999', textAlign: 'center', fontSize: '13px'}}>
                Select a toilet to view details
              </div>
            )
          )}
        </div>

        {/* MAP CONTAINER */}
        <div 
          key={mapKey}
          id="map-container" 
          style={{
            flex: 1,
            background: '#f0f0f0',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {activeTab === 'reports' && selectedReport && selectedReport.location && selectedReport.location.coordinates ? (
            <div style={{width: '100%', height: '100%', background: '#e0e0e0'}} />
          ) : activeTab === 'toilets' && selectedToilet && selectedToilet.location && selectedToilet.location.coordinates ? (
            <div style={{width: '100%', height: '100%', background: '#e0e0e0'}} />
          ) : (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '16px'}}>
              📍 Select a {activeTab === 'reports' ? 'report' : 'toilet'} to view on map
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div style={{
          padding: '16px',
          background: '#f9f9f9',
          borderTop: '1px solid #ddd',
          display: 'flex',
          gap: '12px',
          flexShrink: 0
        }}>
          {activeTab === 'reports' ? (
            // REPORT ACTIONS
            selectedReport ? (
              <>
                <button 
                  onClick={() => handleSolved(selectedReport._id)}
                  disabled={selectedReport.status === 'Solved'}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: selectedReport.status === 'Solved' ? '#ccc' : '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: selectedReport.status === 'Solved' ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  ✓ Mark Problem as Solved
                </button>
                <button 
                  onClick={() => setSelectedReport(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
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
              </>
            ) : (
              <div style={{width: '100%', textAlign: 'center', color: '#999', padding: '12px'}}>
                Select a report to perform actions
              </div>
            )
          ) : (
            // TOILET ACTIONS
            selectedToilet ? (
              <>
                <button 
                  onClick={() => handleUpdateToiletStatus(selectedToilet._id, selectedToilet.status === 'Operational' ? 'Maintenance' : 'Operational')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#FF9800',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {selectedToilet.status === 'Operational' ? '⚙️ Mark Maintenance' : '✓ Mark Operational'}
                </button>
                <button 
                  onClick={() => handleDeleteToilet(selectedToilet._id)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  🗑️ Delete Toilet
                </button>
                <button 
                  onClick={() => setSelectedToilet(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
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
              </>
            ) : (
              <div style={{width: '100%', textAlign: 'center', color: '#999', padding: '12px'}}>
                Select a toilet to perform actions
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
} 
