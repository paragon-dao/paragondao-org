import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useMagic } from '../providers/MagicProvider'
import { useTheme } from '../providers/ThemeProvider'
import { getCurrentUser } from '../services/api'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import EnvironmentCard from '../components/EnvironmentCard'

const HomePage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, user: magicUser } = useMagic()
  const { theme, isDark } = useTheme()
  const storedUser = getCurrentUser()

  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBg: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.6)',
    cardBorder: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(255, 255, 255, 0.3)',
  }
  const isAuthenticated = isLoggedIn || !!storedUser
  const [searchQuery, setSearchQuery] = useState('')
  const [lastSearchedTerm, setLastSearchedTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const handleLoginClick = () => navigate('/login')
  const handleSignupClick = () => navigate('/login')

  const diseaseModels = [
    { name: 'Breathing Health', accuracy: 'Validated', status: 'available', desc: 'Audio-based breathing analysis' },
    { name: 'Mental Health', accuracy: 'Research', status: 'research', desc: 'Voice + breathing + EEG fusion' },
    { name: 'Type 2 Diabetes', accuracy: 'Validated', status: 'available', desc: 'Metabolomics screening' },
    { name: "Parkinson's & Alzheimer's", accuracy: 'Validated', status: 'available', desc: 'Saliva-based detection' },
    { name: 'EEG Consciousness', accuracy: 'Validated', status: 'available', desc: 'Consumer EEG hardware' },
    { name: 'Cancer & Epilepsy', accuracy: 'TBD', status: 'coming_soon', desc: 'In development' }
  ]

  const statusColors = {
    available: '#10b981',
    research: '#6366f1',
    coming_soon: '#9ca3af'
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
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />

      <main style={{ position: 'relative', zIndex: 5, paddingTop: '120px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

          {/* ===== SECTION 1: Environment Dashboard ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ maxWidth: '700px', margin: '0 auto 48px' }}
          >
            <EnvironmentCard />

            {/* CTA below environment card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ textAlign: 'center', marginTop: '24px' }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/health')}
                style={{
                  padding: '16px 36px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '700',
                  boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Connect Your Health
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* ===== SECTION 2: Your Personal AI ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ marginBottom: '80px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p style={{
                fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
                color: colors.textSecondary,
                lineHeight: '1.6',
                maxWidth: '700px',
                margin: '0 auto',
                fontStyle: 'italic'
              }}>
                "Your breathing is a frequency. Your environment is a frequency. One encoder reads both."
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {[
                {
                  icon: '🌍',
                  title: 'See Your Environment',
                  desc: 'Real-time weather, air quality, UV index, and PM2.5 — what you\'re breathing right now.',
                  gradient: 'linear-gradient(135deg, #10b981, #059669)'
                },
                {
                  icon: '🫁',
                  title: 'See Your Body',
                  desc: 'Your physiology encoded as compact frequency coefficients. Breathing depth, stress, health classification.',
                  gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                },
                {
                  icon: '🌐',
                  title: 'Join the Network',
                  desc: 'Your agent trades anonymized health knowledge with other agents via HFTP. Your first asset in the AI economy.',
                  gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                }
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.15 }}
                  style={{
                    background: colors.cardBg,
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '32px',
                    border: `1px solid ${colors.cardBorder}`,
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px',
                    background: card.gradient,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    fontSize: '24px'
                  }}>
                    {card.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.textPrimary, margin: '0 0 12px 0' }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '16px', color: colors.textSecondary, margin: 0, lineHeight: '1.6' }}>
                    {card.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ===== SECTION 3: What GLE Can Screen ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ marginBottom: '80px' }}
          >
            <h2 style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: '800',
              textAlign: 'center',
              margin: '0 0 12px 0',
              background: isDark
                ? 'linear-gradient(135deg, #fff, #a5b4fc)'
                : 'linear-gradient(135deg, #1e293b, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              What GLE Can Screen
            </h2>
            <p style={{ textAlign: 'center', color: colors.textSecondary, margin: '0 0 32px 0', fontSize: '16px' }}>
              One encoder architecture — from breathing audio to brain waves to saliva metabolomics
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {diseaseModels.map((model, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  onClick={() => navigate('/models')}
                  style={{
                    background: colors.cardBg,
                    backdropFilter: 'blur(20px)',
                    borderRadius: '14px',
                    padding: '20px',
                    border: `1px solid ${colors.cardBorder}`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: colors.textPrimary }}>{model.name}</div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>{model.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: statusColors[model.status] }}>
                      {model.accuracy}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: statusColors[model.status],
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {model.status.replace('_', ' ')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/models')}
                style={{
                  padding: '12px 28px',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                  color: colors.textPrimary,
                  border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                See All Models
              </motion.button>
            </div>
          </motion.div>

          {/* ===== SECTION 4: From Health to $200T Economy ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            style={{
              background: isDark ? 'rgba(30,30,50,0.9)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '48px',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.15)'}`,
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)',
              marginBottom: '80px'
            }}
          >
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '800',
              color: colors.textPrimary,
              textAlign: 'center',
              margin: '0 0 32px 0'
            }}>
              From Health to the $200T Economy
            </h2>

            <div style={{
              maxWidth: '650px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {[
                'Every time your agent analyzes your breathing, that\'s a model transaction.',
                'Every time it shares frequency coefficients with the network, that\'s knowledge trading.',
                'Scale this across health, agriculture, environment — that\'s the economy that runs on healthy bodies.',
                'It starts with your next breath.'
              ].map((text, i) => (
                <p key={i} style={{
                  fontSize: i === 3 ? '20px' : '16px',
                  fontWeight: i === 3 ? '700' : '500',
                  color: i === 3 ? '#6366f1' : colors.textSecondary,
                  lineHeight: '1.7',
                  margin: 0,
                  textAlign: 'center'
                }}>
                  {text}
                </p>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '32px'
            }}>
              <a
                href="/docs/THE_HEALTH_ECONOMY.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.3)'
                }}
              >
                Read the Whitepaper
              </a>
              {[
                { label: 'Economic Impact', path: '/economic-impact' },
                { label: 'All Whitepapers', path: '/whitepaper' },
                { label: 'Ecosystem', path: '/ecosystem' }
              ].map((link, i) => (
                <Link
                  key={i}
                  to={link.path}
                  style={{
                    padding: '10px 20px',
                    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '10px',
                    color: '#6366f1',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ===== SECTION 5: Governance ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '800',
              color: colors.textPrimary,
              margin: '0 0 12px 0'
            }}>
              One Person, One Vote
            </h2>
            <p style={{
              fontSize: '16px',
              color: colors.textSecondary,
              margin: '0 0 32px 0',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Health is a right. Governance ensures no entity controls your health data.
              Every breathing-enrolled person gets equal voting power.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/network')}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '700',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
              }}
            >
              View the Network
            </motion.button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
