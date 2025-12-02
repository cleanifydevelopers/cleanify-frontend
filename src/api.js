const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export async function uploadPhotos(files) {
  const fd = new FormData();
  for (const f of files) fd.append('photos', f);
  const res = await fetch(`${API_BASE}/api/uploads`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function createReport(payload) {
  const res = await fetch(`${API_BASE}/api/reports`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Create failed');
  return res.json();
}

export async function listReports(query = '') {
  const timestamp = Date.now()
  const separator = query.includes('?') ? '&' : '?'
  const url = `${API_BASE}/api/reports${query}${separator}t=${timestamp}`
  const res = await fetch(url);
  if (!res.ok) throw new Error('List failed');
  return res.json();
}

export async function getReport(id) {
  const res = await fetch(`${API_BASE}/api/reports/${id}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export async function voteReport(id) {
  const res = await fetch(`${API_BASE}/api/reports/${id}/vote`, { method: 'POST' });
  if (!res.ok) throw new Error('Vote failed');
  return res.json();
}

export async function getUserBadge(name) {
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to get user badge');
  return res.json();
}

export async function incrementUserReports(name) {
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(name)}/report-submitted`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to increment reports');
  return res.json();
}

export async function getChatMessages() {
  const res = await fetch(`${API_BASE}/api/chat`);
  if (!res.ok) throw new Error('Failed to get messages');
  return res.json();
}

export async function sendChatMessage(payload) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function getToilets(nearby) {
  const q = nearby ? `?nearby=${nearby.lat},${nearby.lng}` : '';
  const res = await fetch(`${API_BASE}/api/toilets${q}`);
  return res.json();
}

export async function addToilet(payload) {
  const res = await fetch(`${API_BASE}/api/toilets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to add toilet');
  return res.json();
}

export async function updateToiletStatus(id, status) {
  const res = await fetch(`${API_BASE}/api/toilets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update toilet');
  return res.json();
}

export async function deleteToilet(id) {
  const res = await fetch(`${API_BASE}/api/toilets/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete toilet');
  return res.json();
}
