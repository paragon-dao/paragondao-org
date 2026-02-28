import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'
import { useMagic } from '../providers/MagicProvider'
import { getCurrentUser } from '../services/api'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import BreathingEnrollment from '../components/BreathingEnrollment'
import HealthDashboard from '../components/HealthDashboard'
import { BreathingAuth } from '../agent/breathing-auth'

const HealthPage = () => {
  const { isDark } = useTheme()
  const { isLoggedIn, user: magicUser } = useMagic()
  const storedUser = getCurrentUser()
  const isAuthenticated = isLoggedIn || !!storedUser
  const [isEnrolled, setIsEnrolled] = useState(null) // null = checking
  const [searchQuery, setSearchQuery] = useState('')
  const [lastSearchedTerm, setLastSearchedTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#64748b'

  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const auth = new BreathingAuth()
        const enrolled = await auth.isEnrolled()
        setIsEnrolled(enrolled)
      } catch {
        setIsEnrolled(false)
      }
    }
    checkEnrollment()
  }, [])

  const handleEnrollComplete = () => {
    setIsEnrolled(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      transition: 'background 0.3s ease'
    }}>
      <Background />

      <Header
        searchQuery={searchQuery}
        lastSearchedTerm={lastSearchedTerm}
        setSearchQuery={setSearchQuery}
        handleSearch={() => {}}
        isSearching={isSearching}
        isSearchExpanded={isSearchExpanded}
        setIsSearchExpanded={setIsSearchExpanded}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => {}}
        onSignupClick={() => {}}
      />

      <main style={{
        position: 'relative',
        zIndex: 5,
        paddingTop: '100px',
        paddingBottom: '40px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: '40px' }}
          >
            <h1 key={isDark ? 'hd' : 'hl'} style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '800',
              background: isDark
                ? 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #8b5cf6 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #6366f1 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 12px 0'
            }}>
              Your MirrorAI Health Agent
            </h1>
            <p style={{ fontSize: '16px', color: textSecondary, margin: 0, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              Your breathing is your identity. Your environment is your context.
              One encoder reads both. Zero additional friction.
            </p>
          </motion.div>

          {/* Loading state */}
          {isEnrolled === null && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ color: textSecondary }}>Checking enrollment status...</p>
            </div>
          )}

          {/* Not enrolled — show enrollment */}
          {isEnrolled === false && (
            <BreathingEnrollment onComplete={handleEnrollComplete} />
          )}

          {/* Enrolled — show dashboard */}
          {isEnrolled === true && (
            <HealthDashboard />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HealthPage
