import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import HealthPage from './pages/HealthPage'
import ModelsPage from './pages/ModelsPage'
import NetworkPage from './pages/NetworkPage'
import WhitepaperPage from './pages/WhitepaperPage'
import AboutPage from './pages/AboutPage'
import EcosystemPage from './pages/EcosystemPage'
import GovernancePage from './pages/GovernancePage'
import EconomicImpactPage from './pages/EconomicImpactPage'
import CommunityPage from './pages/CommunityPage'
import EssaysPage from './pages/EssaysPage'
import EssayDetailPage from './pages/EssayDetailPage'
import VerifyHubPage from './pages/VerifyHubPage'
import VerifyModelPage from './pages/VerifyModelPage'
import VerifyMethodologyPage from './pages/VerifyMethodologyPage'
import ExchangePage from './pages/ExchangePage'
import ExchangeModelPage from './pages/ExchangeModelPage'
import ProofPipelinePage from './pages/ProofPipelinePage'
import ForgePage from './pages/ForgePage'
import ForgeSubmitPage from './pages/ForgeSubmitPage'
import ForgeModelDetailPage from './pages/ForgeModelDetailPage'
import AppsPage from './pages/AppsPage'
import AppDetailPage from './pages/AppDetailPage'
import AdminPage from './pages/AdminPage'
import InviteGate from './components/InviteGate'
import { MagicProvider, useMagic } from './providers/MagicProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { getAuthToken, getCurrentUser } from './services/api'
import tracking from './services/tracking'

/**
 * Route Tracker Component
 * Tracks page views on route changes
 */
function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    // Track pageview on route change
    tracking.trackPageview(location.pathname)
  }, [location.pathname])

  return null
}

/**
 * Protected Route Component
 * Redirects to invite gate if not authenticated
 */
function ProtectedRoute({ children }) {
  const token = getAuthToken()
  const user = getCurrentUser()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * Auth Route Component
 * Redirects to home if already authenticated
 */
function AuthRoute({ children }) {
  const token = getAuthToken()
  const user = getCurrentUser()

  if (token && user) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  const { isLoading } = useMagic()

  // Show loading while Magic is initializing
  if (isLoading) {
    return (
      <div className="app" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)'
      }}>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(0, 212, 255, 0.2)',
            borderTop: '3px solid #00d4ff',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#9ca3af' }}>Loading ParagonDAO...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <RouteTracker />
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={
          <AuthRoute>
            <InviteGate />
          </AuthRoute>
        } />
        {/* Legacy /invite route — redirect to /login */}
        <Route path="/invite" element={<Navigate to="/login" replace />} />

        {/* Admin Route (protected) */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Public Routes — no login required */}
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/whitepaper" element={<WhitepaperPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/ecosystem" element={<EcosystemPage />} />
        <Route path="/economic-impact" element={<EconomicImpactPage />} />
        <Route path="/governance" element={<GovernancePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/essays" element={<EssaysPage />} />
        <Route path="/essays/:slug" element={<EssayDetailPage />} />
        <Route path="/verify" element={<VerifyHubPage />} />
        <Route path="/verify/methodology" element={<VerifyMethodologyPage />} />
        <Route path="/verify/:modelId" element={<VerifyModelPage />} />
        <Route path="/proof-pipeline" element={<ProofPipelinePage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/apps/:appId" element={<AppDetailPage />} />
        <Route path="/exchange" element={<ExchangePage />} />
        <Route path="/exchange/:modelId" element={<ExchangeModelPage />} />

        {/* Forge — protected, but simulation mode works without auth */}
        <Route path="/forge" element={
          <ProtectedRoute>
            <ForgePage />
          </ProtectedRoute>
        } />
        <Route path="/forge/submit" element={<ForgeSubmitPage />} />
        <Route path="/forge/model/:modelId" element={
          <ProtectedRoute>
            <ForgeModelDetailPage />
          </ProtectedRoute>
        } />

        {/* Protected Routes — require auth */}
        <Route path="/health" element={
          <ProtectedRoute>
            <HealthPage />
          </ProtectedRoute>
        } />
        {/* Legacy/dev routes — redirect to home */}
        <Route path="/auth" element={<Navigate to="/health" replace />} />
        <Route path="/play" element={<Navigate to="/" replace />} />
        <Route path="/explorer" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/health" replace />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <MagicProvider>
        <Router>
          <AppRoutes />
        </Router>
      </MagicProvider>
    </ThemeProvider>
  )
}

export default App
