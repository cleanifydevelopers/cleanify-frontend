import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import PostComplaint from './pages/PostComplaint'
import ReportSubmitted from './pages/ReportSubmitted'
import ReportsList from './pages/ReportsList'
import ReportDetail from './pages/ReportDetail'
import Profile from './pages/Profile'
import CommunityChat from './pages/CommunityChat'
import MunicipalDashboard from './pages/MunicipalDashboard'
import ToiletLocator from './pages/ToiletLocator'
import Feedback from './pages/Feedback'

export default function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/post" element={<PostComplaint />} />
        <Route path="/submitted/:id" element={<ReportSubmitted />} />
        <Route path="/reports" element={<ReportsList />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
        <Route path="/toilets" element={<ToiletLocator />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<CommunityChat />} />
        <Route path="/municipal" element={<MunicipalDashboard />} />
      </Routes>
    </div>
  )
}
