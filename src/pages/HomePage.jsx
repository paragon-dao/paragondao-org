import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useMagic } from '../providers/MagicProvider'
import { useTheme } from '../providers/ThemeProvider'
import { getCurrentUser } from '../services/api'
import { getLocation } from '../services/environment'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import EnvironmentCard from '../components/EnvironmentCard'
import FiredrillSequence from '../components/firedrill/FiredrillSequence'
import ProofNarrative from '../components/firedrill/ProofNarrative'
import GSLSentinelCard from '../components/sentinel/GSLSentinelCard'
import SuggestedSentinels from '../components/sentinel/SuggestedSentinels'
import SEO from '../components/SEO'
import { useNetworkScan } from '../hooks/useNetworkScan'

const HomePage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, user: magicUser } = useMagic()
  const { isDark } = useTheme()
  const storedUser = getCurrentUser()

  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBg: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.6)',
    cardBorder: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(0, 0, 0, 0.08)',
  }
  const isAuthenticated = isLoggedIn || !!storedUser
  const [searchQuery, setSearchQuery] = useState('')
  const [lastSearchedTerm, setLastSearchedTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const scan = useNetworkScan()
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    getLocation().then(loc => setUserLocation(loc)).catch(() => {})
  }, [])

  const handleLoginClick = () => navigate('/login')
  const handleSignupClick = () => navigate('/login')

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      transition: 'background 0.3s ease'
    }}>
      <SEO
        title="The Health Economy"
        description="Every body is a frequency — yours, the lake's, the planet's. One network protects them all. Three nodes predicted toxic dust events 4-7 days early with 91% accuracy."
        path="/"
      />
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
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>

          {/* ===== HERO ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <p style={{
              fontSize: '14px', color: colors.textMuted, fontStyle: 'italic',
              margin: '0 auto 24px', maxWidth: '480px', lineHeight: '1.6',
            }}>
              "If you want to find the secrets of the universe, think in terms of energy, frequency and vibration."
              <span style={{
                display: 'block', marginTop: '4px',
                fontStyle: 'normal', fontWeight: '600',
                fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8',
              }}>
                — Nikola Tesla
              </span>
            </p>

            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: '800',
              margin: '0 0 12px 0',
              background: isDark
                ? 'linear-gradient(135deg, #fff, #a5b4fc)'
                : 'linear-gradient(135deg, #1e293b, #4f46e5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '1.2',
            }} key={isDark ? 'hd' : 'hl'}>
              Every body is a frequency
            </h1>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
              color: colors.textSecondary, lineHeight: '1.6',
              maxWidth: '600px', margin: '0 auto 6px', fontWeight: '500',
            }}>
              — yours, the lake's, the planet's.
            </p>
            <p style={{
              fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
              color: '#6366f1', lineHeight: '1.6',
              maxWidth: '600px', margin: '0 auto 16px', fontWeight: '700',
            }}>
              One network protects them all.
            </p>
            <p style={{
              fontSize: '15px', color: colors.textSecondary, lineHeight: '1.7',
              maxWidth: '500px', margin: '0 auto',
            }}>
              We predicted toxic dust events 4-7 days early with 91% accuracy.
              The same math now reads your breathing, your brain waves, your voice.
            </p>
          </motion.div>

          {/* ===== SECTION 1: The Proof — What We Built ===== */}
          <div style={{ marginBottom: '48px' }}>
            <ProofNarrative />
          </div>

          {/* ===== SECTION 2: Live Sentinel + Suggested Sentinels ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '48px' }}
          >
            <div style={{
              fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
              color: '#10b981', textTransform: 'uppercase', textAlign: 'center',
              marginBottom: '6px',
            }}>
              LIVE ON THE NETWORK
            </div>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '800', textAlign: 'center', margin: '0 0 8px 0',
              background: isDark
                ? 'linear-gradient(135deg, #fff, #a5b4fc)'
                : 'linear-gradient(135deg, #1e293b, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }} key={isDark ? 'sd' : 'sl'}>
              Sentinel Nodes
            </h2>
            <p style={{
              textAlign: 'center', color: colors.textSecondary,
              margin: '0 auto 24px', fontSize: '14px', maxWidth: '500px', lineHeight: '1.6',
            }}>
              Independent nodes watching environmental bodies. Together, they catch what no single model can see.
            </p>

            <div style={{ marginBottom: '28px' }}>
              <GSLSentinelCard
                userLat={userLocation?.latitude}
                userLon={userLocation?.longitude}
              />
            </div>

            <SuggestedSentinels
              userLat={userLocation?.latitude}
              userLon={userLocation?.longitude}
              userCity={userLocation?.city}
              userRegion={userLocation?.region}
            />
          </motion.div>

          {/* ===== SECTION 3: Try It Yourself — Environment + Scan ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '64px' }}
          >
            <div style={{
              fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
              color: '#6366f1', textTransform: 'uppercase', textAlign: 'center',
              marginBottom: '6px',
            }}>
              TRY IT YOURSELF
            </div>
            <h2 style={{
              fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)',
              fontWeight: '800', textAlign: 'center', margin: '0 0 8px 0',
              color: colors.textPrimary,
            }}>
              Your Environment, On the Network
            </h2>
            <p style={{
              textAlign: 'center', color: colors.textSecondary,
              margin: '0 auto 20px', fontSize: '14px', maxWidth: '480px', lineHeight: '1.6',
            }}>
              Your local air quality, weather, and pollutants — encoded into a 128-number fingerprint
              and checked against the sentinel network in real time.
            </p>

            <div style={{
              marginBottom: '20px',
              opacity: scan.isScanning ? 0.6 : 1,
              transform: scan.isScanning ? 'scale(0.98)' : 'scale(1)',
              transition: 'opacity 0.4s, transform 0.4s',
            }}>
              <EnvironmentCard />
            </div>

            {scan.phase === 'idle' ? (
              <div style={{ textAlign: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={scan.startScan}
                  style={{
                    padding: '16px 40px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white', borderRadius: '14px', border: 'none',
                    cursor: 'pointer', fontSize: '16px', fontWeight: '700',
                    boxShadow: '0 6px 24px rgba(99, 102, 241, 0.35)',
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Run Network Scan
                </motion.button>
                <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '10px' }}>
                  Encodes your environment + checks 3 sentinel nodes
                </p>
              </div>
            ) : (
              <FiredrillSequence
                phase={scan.phase}
                subPhase={scan.subPhase}
                envData={scan.envData}
                encoding={scan.encoding}
                encodingLatency={scan.encodingLatency}
                dustResult={scan.dustResult}
                consensusResult={scan.consensusResult}
                onReset={scan.resetScan}
              />
            )}
          </motion.div>

          {/* ===== SECTION 4: Apps Built on the Network ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '64px' }}
          >
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '800', textAlign: 'center', margin: '0 0 8px 0',
              background: isDark
                ? 'linear-gradient(135deg, #34d399, #10b981)'
                : 'linear-gradient(135deg, #059669, #047857)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }} key={isDark ? 'ad' : 'al'}>
              Apps Built on the Network
            </h2>
            <p style={{
              textAlign: 'center', color: colors.textSecondary,
              margin: '0 auto 24px', fontSize: '14px', maxWidth: '520px', lineHeight: '1.6',
            }}>
              Each app reads a different body — same encoder, same protocol, same network.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '14px', marginBottom: '20px',
            }}>
              {[
                {
                  name: 'Haven Phone', status: 'Building', statusColor: '#f59e0b',
                  desc: 'AI crisis intervention phone. Breathing analysis + EEG classification + AI counselor.',
                  signals: 'Voice, breathing, EEG', flagship: true,
                },
                {
                  name: 'GSL Dust Predictor', status: 'Live', statusColor: '#10b981',
                  desc: '91% recall, 3-node ensemble. Predicts dust events 4-7 days ahead.',
                  signals: 'Lake level, atmosphere, wind', flagship: true,
                },
                {
                  name: '988 Crisis Screening', status: 'Live', statusColor: '#10b981',
                  desc: 'Breathing + EEG fusion for crisis call centers. Works with voice alone.',
                  signals: 'Breathing, EEG',
                },
                {
                  name: 'BreatheScreen CHW', status: 'Coming Soon', statusColor: '#6366f1',
                  desc: 'Respiratory screening for community health workers. Phone-only, offline.',
                  signals: 'Breathing audio',
                },
                {
                  name: 'EEG Consciousness Monitor', status: 'Coming Soon', statusColor: '#6366f1',
                  desc: 'Real-time EEG classification. 97.65% accuracy. NeurIPS 2025 validated.',
                  signals: 'EEG',
                },
                {
                  name: "Parkinson's Voice Monitor", status: 'Seeking Builder', statusColor: '#8b5cf6',
                  desc: 'Voice-based PD screening. Phone-only, no special hardware.',
                  signals: 'Voice',
                },
              ].map((app, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/apps')}
                  style={{
                    background: colors.cardBg,
                    borderRadius: '14px', padding: '18px',
                    border: `1px solid ${app.flagship
                      ? (isDark ? 'rgba(52,211,153,0.25)' : 'rgba(5,150,105,0.15)')
                      : colors.cardBorder}`,
                    cursor: 'pointer', transition: 'transform 0.2s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {app.flagship && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                      borderRadius: '14px 14px 0 0',
                      background: 'linear-gradient(90deg, #34d399, #059669)',
                    }} />
                  )}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    marginBottom: '6px',
                  }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: colors.textPrimary }}>
                      {app.name}
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: '100px', fontSize: '10px',
                      fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
                      color: app.statusColor,
                      background: `${app.statusColor}15`,
                      border: `1px solid ${app.statusColor}30`,
                      flexShrink: 0, marginLeft: '8px',
                    }}>
                      {app.status}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '13px', color: colors.textSecondary, margin: '0 0 6px 0', lineHeight: '1.5',
                  }}>
                    {app.desc}
                  </p>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>
                    Signals: {app.signals}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
            }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/apps')}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', borderRadius: '10px', border: 'none',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '700',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                }}
              >
                Browse All Apps
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/forge/submit')}
                style={{
                  padding: '12px 24px',
                  background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
                  color: '#6366f1', borderRadius: '10px',
                  border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)'}`,
                  cursor: 'pointer', fontSize: '14px', fontWeight: '700',
                }}
              >
                Build on the Protocol
              </motion.button>
            </div>
          </motion.div>

          {/* ===== SECTION 5: The Same Math + Models (compact) ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: '64px' }}
          >
            <h2 style={{
              fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)',
              fontWeight: '800', textAlign: 'center', margin: '0 0 8px 0',
              color: colors.textPrimary,
            }}>
              One Encoder, Every Signal
            </h2>
            <p style={{
              textAlign: 'center', color: colors.textSecondary,
              margin: '0 auto 24px', fontSize: '14px', maxWidth: '480px', lineHeight: '1.6',
            }}>
              From atmospheric dust to breathing audio to brain waves — the same encoder
              finds the structure. Same 128-number fingerprint, every time.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '10px',
            }}>
              {[
                { name: 'Breathing Health', accuracy: '88.97%', status: 'live', desc: 'Audio-based, out-of-sample subjects' },
                { name: 'EEG Classification', accuracy: 'NeurIPS 2025', status: 'live', desc: '13.5x improvement, 1,183 competitors' },
                { name: 'Mental Health', accuracy: 'Research', status: 'research', desc: 'Voice + breathing + EEG fusion' },
                { name: 'Type 2 Diabetes', accuracy: 'Research', status: 'research', desc: 'Metabolomics screening' },
                { name: "Parkinson's Detection", accuracy: 'Research', status: 'research', desc: 'Saliva-based detection' },
                { name: 'Cancer & Epilepsy', accuracy: 'TBD', status: 'planned', desc: 'In development' },
              ].map((model, i) => {
                const sc = model.status === 'live' ? '#10b981' : model.status === 'research' ? '#6366f1' : '#9ca3af'
                return (
                  <div
                    key={i}
                    onClick={() => navigate('/models')}
                    style={{
                      background: colors.cardBg, borderRadius: '12px',
                      padding: '14px 16px', cursor: 'pointer',
                      border: `1px solid ${colors.cardBorder}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: colors.textPrimary }}>{model.name}</div>
                      <div style={{ fontSize: '11px', color: colors.textSecondary, marginTop: '2px' }}>{model.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '10px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: sc }}>{model.accuracy}</div>
                      <div style={{ fontSize: '9px', color: sc, fontWeight: '600', textTransform: 'uppercase' }}>
                        {model.status}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/models" style={{
                fontSize: '14px', color: '#6366f1', fontWeight: '600', textDecoration: 'none',
              }}>
                See all models →
              </Link>
            </div>
          </motion.div>

          {/* ===== SECTION 6: Footer CTA ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            style={{
              background: isDark ? 'rgba(30,30,50,0.9)' : 'rgba(255,255,255,0.85)',
              borderRadius: '20px',
              padding: 'clamp(24px, 5vw, 40px)',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)'}`,
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.06)',
              marginBottom: '60px',
              textAlign: 'center',
            }}
          >
            <h2 style={{
              fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)',
              fontWeight: '800', color: colors.textPrimary,
              margin: '0 0 8px 0', lineHeight: '1.3',
            }}>
              Every body speaks in frequency.
              <br />
              We built the network that listens.
            </h2>
            <p style={{
              fontSize: '14px', color: colors.textSecondary, lineHeight: '1.6',
              maxWidth: '440px', margin: '0 auto 20px',
            }}>
              Read how frequency-based health models connect your body to a $200 trillion economy.
            </p>

            <div style={{
              display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap',
            }}>
              <a
                href="/docs/THE_HEALTH_ECONOMY.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', borderRadius: '10px',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(16,185,129,0.3)'
                }}
              >
                Read the Whitepaper
              </a>
              {[
                { label: 'Essays', path: '/essays' },
                { label: 'Network', path: '/network' },
                { label: 'Ecosystem', path: '/ecosystem' },
              ].map((link, i) => (
                <Link
                  key={i}
                  to={link.path}
                  style={{
                    padding: '10px 18px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '8px', color: '#6366f1',
                    fontSize: '13px', fontWeight: '600', textDecoration: 'none'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
