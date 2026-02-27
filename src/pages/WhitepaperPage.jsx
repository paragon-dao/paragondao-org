import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getCurrentUser, getAuthToken } from '../services/api'
import { useTheme } from '../providers/ThemeProvider'

const WhitepaperPage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const currentUser = getCurrentUser()
  const isAuthenticated = !!getAuthToken() && !!currentUser
  
  // Theme-aware colors
  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  }
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const whitepapers = [
    {
      id: 'health-economy',
      title: 'The Health Economy',
      subtitle: 'The Definitive Whitepaper',
      description: 'Autonomous AI Models as the Foundation of Planetary Healthcare and the Next Global Economy',
      version: 'Version 1.0 - February 2026',
      abstract: 'We present the Health Economy: an architecture in which every person on Earth owns a personal AI model trained on their own biosignals, and these models autonomously trade health knowledge with one another to produce a new class of economic output. The system rests on three pillars: the General Learning Encoder (GLE), the Harmonic Frequency Transfer Protocol (HFTP), and ParagonDAO governance. As human-robot integration matures and biological health becomes the binding constraint on global productivity, the economy that runs on healthy bodies is projected to exceed $200 trillion annually. Unlike previous economic revolutions, this one begins not with capital or industry but with the most fundamental human signal: a breath.',
      link: '/docs/THE_HEALTH_ECONOMY.html',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      featured: true,
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
        </svg>
      )
    },
    {
      id: 'hftp',
      title: 'HFTP Protocol',
      subtitle: 'Harmonic Frequency Transfer Protocol',
      description: 'AI-Native Communication Architecture for Personal AI Systems',
      version: 'Version 1.0.0 - December 2024',
      abstract: 'The Harmonic Frequency Transfer Protocol (HFTP) represents a revolutionary departure from traditional text-based communication protocols, introducing an AI-native architecture that transfers data through harmonic frequencies. Building upon proprietary frequency-domain encoding techniques, HFTP enables massive bandwidth efficiency, parallel frequency processing, and embedded user identity verification.',
      link: '/docs/HFTP_PROTOCOL_WHITEPAPER.html',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="white"/>
          <path d="M19 15L19.5 17.5L22 18L19.5 18.5L19 21L18.5 18.5L16 18L18.5 17.5L19 15Z" fill="white"/>
          <path d="M5 15L5.5 17.5L8 18L5.5 18.5L5 21L4.5 18.5L2 18L4.5 17.5L5 15Z" fill="white"/>
        </svg>
      )
    },
    {
      id: 'hf-auth',
      title: 'HF Auth',
      subtitle: 'Harmonic Frequency Authentication',
      description: 'Attested Local Authorization for Personal AI with Confidential Compute',
      version: 'Whitepaper v1.3',
      abstract: 'Auth-HF fuses frequency-native identity (HF presence, liveness, owner binding) with remote attestation-gated key release in confidential compute (TDX/SEV-SNP/SGX) and per-operation capabilities enforced at filesystem/kernel boundaries, resisting even rogue rooted administrators.',
      link: '/docs/AUTH_HF_HIGH_SECURITY_WHITEPAPER.html',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ]

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark 
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      color: isDark ? '#fff' : '#1e293b',
      transition: 'all 0.3s ease'
    }}>
      
      <Header 
        searchQuery={searchQuery}
        lastSearchedTerm=""
        setSearchQuery={setSearchQuery}
        handleSearch={() => {}}
        isSearching={false}
        isSearchExpanded={isSearchExpanded}
        setIsSearchExpanded={setIsSearchExpanded}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => navigate('/login')}
        onSignupClick={() => navigate('/login')}
      />

      <main style={{
        position: 'relative',
        zIndex: 5,
        paddingTop: '120px',
        paddingBottom: '80px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '80px' }}
          >
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '24px'
            }}>
              Whitepapers
            </h1>
            <p style={{
              fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)',
              color: colors.textSecondary,
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              The definitive papers on autonomous health models, the HFTP protocol, and the architecture of the next global economy.
            </p>
          </motion.div>

          {/* Whitepaper Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            gap: '24px',
            marginBottom: '48px'
          }}>
            {whitepapers.map((paper, index) => (
              paper.featured && (
                <motion.div
                  key={`${paper.id}-badge`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15))',
                    borderRadius: '10px',
                    border: '1px solid rgba(16,185,129,0.3)',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#10b981'
                  }}
                >
                  Start here — The Health Economy is the definitive document for understanding our mission and vision
                </motion.div>
              )))}
            {whitepapers.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                style={{
                  gridColumn: paper.featured ? '1 / -1' : undefined,
                  background: isDark ? 'rgba(30, 30, 50, 0.9)' : 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: isMobile ? '24px' : '32px',
                  boxShadow: paper.featured
                    ? '0 8px 32px rgba(16,185,129,0.2)'
                    : isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  border: paper.featured
                    ? '2px solid rgba(16,185,129,0.4)'
                    : `1px solid ${colors.cardBorder}`,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 12px 48px rgba(99,102,241,0.2)'
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: paper.gradient,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
                }}>
                  {paper.icon}
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: colors.textPrimary,
                  marginBottom: '8px'
                }}>
                  {paper.title}
                </h2>

                {/* Subtitle */}
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#a5b4fc',
                  marginBottom: '8px'
                }}>
                  {paper.subtitle}
                </p>

                {/* Description */}
                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  {paper.description}
                </p>

                {/* Version */}
                <div style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#a5b4fc'
                }}>
                  {paper.version}
                </div>

                {/* Abstract */}
                <div style={{
                  marginBottom: '24px',
                  padding: '16px',
                  background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
                  borderRadius: '12px',
                  border: `1px solid ${colors.cardBorder}`
                }}>
                  <h3 style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: colors.textMuted,
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    Abstract
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    lineHeight: '1.7',
                    margin: 0
                  }}>
                    {paper.abstract}
                  </p>
                </div>

                {/* CTA Button */}
                <motion.a
                  href={paper.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '16px 32px',
                    background: paper.gradient,
                    color: 'white',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '700',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: 'auto'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Read Whitepaper
                </motion.a>
              </motion.div>
            ))}
          </div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{
              textAlign: 'center',
              marginTop: '80px'
            }}
          >
            <Link
              to="/"
              style={{
                display: 'inline-block',
                padding: '18px 36px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                borderRadius: '16px',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: '700',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.3)'
              }}
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default WhitepaperPage
