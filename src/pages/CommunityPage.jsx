import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useMagic } from '../providers/MagicProvider'
import { useTheme } from '../providers/ThemeProvider'
import { getCurrentUser } from '../services/api'
import SEO from '../components/SEO'

// Designed Logo Components (using actual images)
const FrogLogo = ({ isHovered = false, isMobile = false }) => (
  <motion.div
    animate={{ 
      scale: isHovered ? 1.05 : 1,
      y: isHovered ? -8 : 0
    }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    style={{
      position: 'relative',
      width: isMobile ? '180px' : '280px',
      height: isMobile ? '180px' : '280px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto'
    }}
  >
    {/* Glow effect */}
    <div style={{
      position: 'absolute',
      inset: '-20px',
      background: isHovered 
        ? 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
      borderRadius: '50%',
      transition: 'all 0.4s ease',
      filter: 'blur(10px)'
    }} />
    <img 
      src="/img/key-guardian.png" 
      alt="The Frog - Key Guardian"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        position: 'relative',
        zIndex: 1,
        filter: isHovered ? 'drop-shadow(0 0 30px rgba(16,185,129,0.5))' : 'drop-shadow(0 0 15px rgba(16,185,129,0.3))',
        transition: 'filter 0.4s ease'
      }}
    />
  </motion.div>
)

const DragonflyLogo = ({ isHovered = false, isMobile = false }) => (
  <motion.div
    animate={{ 
      scale: isHovered ? 1.05 : 1,
      y: isHovered ? -8 : 0
    }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    style={{
      position: 'relative',
      width: isMobile ? '180px' : '280px',
      height: isMobile ? '180px' : '280px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto'
    }}
  >
    {/* Glow effect */}
    <div style={{
      position: 'absolute',
      inset: '-20px',
      background: isHovered 
        ? 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
      borderRadius: '50%',
      transition: 'all 0.4s ease',
      filter: 'blur(10px)'
    }} />
    <img 
      src="/img/transformation-blueprint.png" 
      alt="The Dragonfly - Transformation Blueprint"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        position: 'relative',
        zIndex: 1,
        filter: isHovered ? 'drop-shadow(0 0 30px rgba(99,102,241,0.5))' : 'drop-shadow(0 0 15px rgba(99,102,241,0.3))',
        transition: 'filter 0.4s ease'
      }}
    />
  </motion.div>
)

// SVG Mascot Components (kept as backup/alternative)
const FrogMascot = ({ size = 200, isHovered = false }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: isHovered ? 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.6))' : 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.3))' }}
  >
    {/* Background circle - water/earth transition */}
    <defs>
      <linearGradient id="frogBg" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#064e3b" />
        <stop offset="50%" stopColor="#065f46" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="frogBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="frogEye" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="100%" stopColor="#fcd34d" />
      </linearGradient>
      <radialGradient id="frogGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Outer glow */}
    <circle cx="100" cy="100" r="95" fill="url(#frogGlow)" />
    
    {/* Background circle */}
    <circle cx="100" cy="100" r="90" fill="url(#frogBg)" stroke="#10b981" strokeWidth="2" />
    
    {/* Water ripples at bottom */}
    <ellipse cx="100" cy="165" rx="60" ry="8" fill="#065f46" opacity="0.5" />
    <ellipse cx="100" cy="160" rx="50" ry="6" fill="#047857" opacity="0.4" />
    <ellipse cx="100" cy="155" rx="40" ry="4" fill="#059669" opacity="0.3" />
    
    {/* Frog body - sitting pose */}
    <ellipse cx="100" cy="130" rx="45" ry="35" fill="url(#frogBody)" />
    
    {/* Back legs (visible parts) */}
    <ellipse cx="60" cy="145" rx="18" ry="12" fill="#059669" />
    <ellipse cx="140" cy="145" rx="18" ry="12" fill="#059669" />
    
    {/* Feet */}
    <ellipse cx="50" cy="152" rx="12" ry="6" fill="#047857" />
    <ellipse cx="150" cy="152" rx="12" ry="6" fill="#047857" />
    
    {/* Head */}
    <ellipse cx="100" cy="85" rx="40" ry="35" fill="url(#frogBody)" />
    
    {/* Eye bumps */}
    <circle cx="75" cy="65" r="18" fill="url(#frogBody)" />
    <circle cx="125" cy="65" r="18" fill="url(#frogBody)" />
    
    {/* Eyes - large and wise */}
    <circle cx="75" cy="62" r="14" fill="url(#frogEye)" />
    <circle cx="125" cy="62" r="14" fill="url(#frogEye)" />
    
    {/* Pupils - vertical slits for wisdom */}
    <ellipse cx="75" cy="62" rx="4" ry="10" fill="#1e3a2f" />
    <ellipse cx="125" cy="62" rx="4" ry="10" fill="#1e3a2f" />
    
    {/* Eye shine */}
    <circle cx="72" cy="58" r="3" fill="white" opacity="0.8" />
    <circle cx="122" cy="58" r="3" fill="white" opacity="0.8" />
    
    {/* Nostrils */}
    <circle cx="90" cy="85" r="2" fill="#047857" />
    <circle cx="110" cy="85" r="2" fill="#047857" />
    
    {/* Mouth - subtle smile */}
    <path d="M75 98 Q100 108 125 98" stroke="#047857" strokeWidth="2" fill="none" strokeLinecap="round" />
    
    {/* Front legs - hands together in respect */}
    <ellipse cx="85" cy="120" rx="10" ry="15" fill="#059669" />
    <ellipse cx="115" cy="120" rx="10" ry="15" fill="#059669" />
    
    {/* Hands together - prayer/respect pose */}
    <path d="M92 115 L100 108 L108 115" fill="#34d399" />
    <ellipse cx="100" cy="118" rx="12" ry="8" fill="#34d399" />
    
    {/* Fingers detail */}
    <circle cx="95" cy="124" r="3" fill="#10b981" />
    <circle cx="100" cy="122" r="3" fill="#10b981" />
    <circle cx="105" cy="124" r="3" fill="#10b981" />
    
    {/* Subtle spots pattern */}
    <circle cx="70" cy="95" r="4" fill="#059669" opacity="0.5" />
    <circle cx="130" cy="95" r="4" fill="#059669" opacity="0.5" />
    <circle cx="85" cy="140" r="5" fill="#059669" opacity="0.4" />
    <circle cx="115" cy="140" r="5" fill="#059669" opacity="0.4" />
    
    {/* Crown of wisdom - subtle */}
    <path d="M80 48 L85 42 L90 48 M95 45 L100 38 L105 45 M110 48 L115 42 L120 48" 
          stroke="#fcd34d" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />
  </svg>
)

const DragonflyMascot = ({ size = 200, isHovered = false }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: isHovered ? 'drop-shadow(0 0 30px rgba(99, 102, 241, 0.6))' : 'drop-shadow(0 0 15px rgba(99, 102, 241, 0.3))' }}
  >
    <defs>
      <linearGradient id="dragonflyBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="50%" stopColor="#312e81" />
        <stop offset="100%" stopColor="#3730a3" />
      </linearGradient>
      <linearGradient id="dragonflyBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a5b4fc" />
        <stop offset="50%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
      <linearGradient id="dragonflyWing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id="dragonflyEye" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="50%" stopColor="#fcd34d" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <radialGradient id="dragonflyGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
      </radialGradient>
      {/* Wing pattern */}
      <pattern id="wingPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M0 4 L4 0 L8 4 L4 8 Z" fill="none" stroke="#c7d2fe" strokeWidth="0.5" opacity="0.5" />
      </pattern>
    </defs>
    
    {/* Outer glow */}
    <circle cx="100" cy="100" r="95" fill="url(#dragonflyGlow)" />
    
    {/* Background circle */}
    <circle cx="100" cy="100" r="90" fill="url(#dragonflyBg)" stroke="#6366f1" strokeWidth="2" />
    
    {/* Infinity symbol / figure-8 flight path */}
    <path d="M40 100 C40 70 70 70 100 100 C130 130 160 130 160 100 C160 70 130 70 100 100 C70 130 40 130 40 100" 
          stroke="#4f46e5" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="4 4" />
    
    {/* Upper left wing */}
    <ellipse cx="60" cy="70" rx="35" ry="18" fill="url(#dragonflyWing)" 
             transform="rotate(-30 60 70)" stroke="#a5b4fc" strokeWidth="1" />
    <ellipse cx="60" cy="70" rx="35" ry="18" fill="url(#wingPattern)" 
             transform="rotate(-30 60 70)" />
    {/* Wing veins */}
    <path d="M40 60 L75 75 M45 55 L70 70 M50 78 L75 78" stroke="#c7d2fe" strokeWidth="0.5" opacity="0.6" />
    
    {/* Upper right wing */}
    <ellipse cx="140" cy="70" rx="35" ry="18" fill="url(#dragonflyWing)" 
             transform="rotate(30 140 70)" stroke="#a5b4fc" strokeWidth="1" />
    <ellipse cx="140" cy="70" rx="35" ry="18" fill="url(#wingPattern)" 
             transform="rotate(30 140 70)" />
    <path d="M160 60 L125 75 M155 55 L130 70 M150 78 L125 78" stroke="#c7d2fe" strokeWidth="0.5" opacity="0.6" />
    
    {/* Lower left wing */}
    <ellipse cx="55" cy="95" rx="32" ry="15" fill="url(#dragonflyWing)" 
             transform="rotate(-15 55 95)" stroke="#a5b4fc" strokeWidth="1" />
    <ellipse cx="55" cy="95" rx="32" ry="15" fill="url(#wingPattern)" 
             transform="rotate(-15 55 95)" />
    
    {/* Lower right wing */}
    <ellipse cx="145" cy="95" rx="32" ry="15" fill="url(#dragonflyWing)" 
             transform="rotate(15 145 95)" stroke="#a5b4fc" strokeWidth="1" />
    <ellipse cx="145" cy="95" rx="32" ry="15" fill="url(#wingPattern)" 
             transform="rotate(15 145 95)" />
    
    {/* Head */}
    <circle cx="100" cy="55" r="18" fill="url(#dragonflyBody)" />
    
    {/* Compound eyes - large, multifaceted */}
    <ellipse cx="88" cy="52" rx="12" ry="14" fill="url(#dragonflyEye)" />
    <ellipse cx="112" cy="52" rx="12" ry="14" fill="url(#dragonflyEye)" />
    
    {/* Eye facets pattern */}
    <circle cx="85" cy="48" r="2" fill="#fef3c7" opacity="0.8" />
    <circle cx="90" cy="52" r="2" fill="#fef3c7" opacity="0.6" />
    <circle cx="86" cy="56" r="2" fill="#fef3c7" opacity="0.5" />
    <circle cx="115" cy="48" r="2" fill="#fef3c7" opacity="0.8" />
    <circle cx="110" cy="52" r="2" fill="#fef3c7" opacity="0.6" />
    <circle cx="114" cy="56" r="2" fill="#fef3c7" opacity="0.5" />
    
    {/* Thorax */}
    <ellipse cx="100" cy="78" rx="12" ry="15" fill="url(#dragonflyBody)" />
    
    {/* Abdomen segments */}
    <ellipse cx="100" cy="100" rx="8" ry="10" fill="url(#dragonflyBody)" />
    <ellipse cx="100" cy="115" rx="7" ry="8" fill="#818cf8" />
    <ellipse cx="100" cy="128" rx="6" ry="7" fill="#6366f1" />
    <ellipse cx="100" cy="140" rx="5" ry="6" fill="#4f46e5" />
    <ellipse cx="100" cy="150" rx="4" ry="5" fill="#4338ca" />
    <ellipse cx="100" cy="158" rx="3" ry="4" fill="#3730a3" />
    
    {/* Tail end */}
    <ellipse cx="100" cy="164" rx="2" ry="3" fill="#312e81" />
    
    {/* Segment lines */}
    <path d="M93 108 L107 108 M94 120 L106 120 M95 132 L105 132 M96 143 L104 143" 
          stroke="#4f46e5" strokeWidth="1" opacity="0.5" />
    
    {/* Legs */}
    <path d="M92 80 L75 90 L70 100" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M108 80 L125 90 L130 100" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M90 85 L72 95 L65 108" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M110 85 L128 95 L135 108" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
    
    {/* Antennae */}
    <path d="M92 42 L85 32" stroke="#a5b4fc" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M108 42 L115 32" stroke="#a5b4fc" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <circle cx="85" cy="30" r="2" fill="#c7d2fe" />
    <circle cx="115" cy="30" r="2" fill="#c7d2fe" />
    
    {/* Geometric accent - phi spiral hint */}
    <path d="M165 165 Q170 155 165 145 Q155 140 145 145" 
          stroke="#818cf8" strokeWidth="1" fill="none" opacity="0.4" />
    
    {/* Stars/precision points */}
    <circle cx="35" cy="45" r="1.5" fill="#c7d2fe" opacity="0.8" />
    <circle cx="165" cy="45" r="1.5" fill="#c7d2fe" opacity="0.8" />
    <circle cx="30" cy="155" r="1" fill="#a5b4fc" opacity="0.6" />
    <circle cx="170" cy="155" r="1" fill="#a5b4fc" opacity="0.6" />
  </svg>
)

const CommunityPage = () => {
  const navigate = useNavigate()
  const { isLoggedIn } = useMagic()
  const { isDark } = useTheme()
  
  // Check both Magic.link auth and localStorage auth
  const storedUser = getCurrentUser()
  const isAuthenticated = isLoggedIn || !!storedUser
  
  // Theme-aware colors
  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  }
  
  // Voting state (would connect to backend/blockchain in production)
  const [votes, setVotes] = useState({ frog: 127, dragonfly: 89 })
  const [userVote, setUserVote] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [hoveredOption, setHoveredOption] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  // Check screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load vote from localStorage
  useEffect(() => {
    const savedVote = localStorage.getItem('paragondao_mascot_vote')
    if (savedVote) {
      setUserVote(savedVote)
      setHasVoted(true)
    }
  }, [])

  const handleVote = (choice) => {
    if (hasVoted) return
    
    setUserVote(choice)
    setHasVoted(true)
    setVotes(prev => ({
      ...prev,
      [choice]: prev[choice] + 1
    }))
    localStorage.setItem('paragondao_mascot_vote', choice)
    setShowConfirmation(true)
    setTimeout(() => setShowConfirmation(false), 3000)
  }

  const totalVotes = votes.frog + votes.dragonfly
  const frogPercent = Math.round((votes.frog / totalVotes) * 100)
  const dragonflyPercent = Math.round((votes.dragonfly / totalVotes) * 100)

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark 
        ? 'linear-gradient(180deg, #0a0a12 0%, #1a1a2e 50%, #0f1729 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      color: isDark ? '#fff' : '#1e293b',
      transition: 'all 0.3s ease'
    }}>
      <SEO
        title="Community"
        description="Join the ParagonDAO community. Builders, researchers, healthcare professionals, and mission partners working together on the health economy."
        path="/community"
      />
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={() => {}}
        isSearching={false}
        isSearchExpanded={isSearchExpanded}
        setIsSearchExpanded={setIsSearchExpanded}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => navigate('/login')}
        onSignupClick={() => navigate('/login')}
      />

      {/* Hero Section */}
      <section style={{
        paddingTop: isMobile ? '100px' : '120px',
        paddingBottom: isMobile ? '40px' : '60px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(236,72,153,0.2))',
            border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: '100px',
            padding: '8px 20px',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '16px' }}>🗳️</span>
            <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '600' }}>
              COMMUNITY GOVERNANCE • FIRST VOTE
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Choose the ParagonDAO Mascot
          </h1>

          <p style={{
            fontSize: '20px',
            color: colors.textSecondary,
            lineHeight: '1.6',
            maxWidth: '700px',
            margin: '0 auto 32px'
          }}>
            This is the first community decision for ParagonDAO. Your vote shapes the identity 
            of the ecosystem. Choose wisely—this mascot will represent the values of 
            <strong style={{ color: '#10b981' }}> origins</strong>, 
            <strong style={{ color: '#6366f1' }}> intelligence</strong>, and 
            <strong style={{ color: '#f59e0b' }}> transformation</strong>.
          </p>

          {/* Important Note about voting process */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(236,72,153,0.15))',
              border: '1px solid rgba(249,115,22,0.4)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '20px 28px',
              maxWidth: '800px',
              margin: isMobile ? '0 auto 24px' : '0 auto 40px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: isMobile ? '12px' : '16px'
            }}
          >
            <div style={{ fontSize: isMobile ? '22px' : '28px', marginTop: '2px', flexShrink: 0 }}>💡</div>
            <div>
              <h4 style={{ 
                color: '#fbbf24', 
                fontSize: '16px', 
                fontWeight: '700', 
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                Important: This Vote is About Meaning, Not Design
              </h4>
              <p style={{ 
                color: colors.textSecondary, 
                fontSize: '15px', 
                lineHeight: '1.6',
                margin: 0
              }}>
                We're choosing between <strong style={{ color: '#10b981' }}>The Frog</strong> (Guardian of Origins) 
                or <strong style={{ color: '#a5b4fc' }}>The Dragonfly</strong> (Blueprint of Transformation) 
                based on their <strong>symbolism and meaning</strong> for ParagonDAO. 
                Once the community selects a mascot, a <strong style={{ color: '#f9a8d4' }}>separate design vote</strong> will 
                be conducted to choose the official visual design for that mascot.
              </p>
            </div>
          </motion.div>

          {/* Voting Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#10b981' }}>{totalVotes}</div>
              <div style={{ fontSize: '14px', color: colors.textMuted }}>Total Votes</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#6366f1' }}>7</div>
              <div style={{ fontSize: '14px', color: colors.textMuted }}>Days Left</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Vote Confirmation Toast */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              padding: '16px 32px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span style={{ fontSize: '24px' }}>✓</span>
            <span style={{ fontWeight: '700' }}>Vote recorded! Thank you for participating.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voting Cards */}
      <section style={{
        padding: isMobile ? '0 16px 60px' : '0 24px 80px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: isMobile ? '24px' : '40px'
        }}>
          {/* Frog Option */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            onMouseEnter={() => !isMobile && setHoveredOption('frog')}
            onMouseLeave={() => !isMobile && setHoveredOption(null)}
            style={{
              background: userVote === 'frog' 
                ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))'
                : 'rgba(255,255,255,0.03)',
              border: userVote === 'frog' 
                ? '2px solid #10b981'
                : '1px solid rgba(16,185,129,0.3)',
              borderRadius: isMobile ? '20px' : '32px',
              padding: isMobile ? '24px 20px' : '48px 40px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Vote indicator */}
            {userVote === 'frog' && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#10b981',
                borderRadius: '100px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✓ Your Vote
              </div>
            )}

            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16,185,129,0.2)',
              border: '1px solid rgba(16,185,129,0.4)',
              borderRadius: '100px',
              padding: '6px 16px',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '20px' }}>🐸</span>
              <span style={{ color: '#10b981', fontSize: '14px', fontWeight: '700' }}>OPTION 1</span>
            </div>

            {/* Designed Logo */}
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '16px' : '24px' }}>
              <FrogLogo isHovered={hoveredOption === 'frog'} isMobile={isMobile} />
              {/* Design note */}
              <div style={{
                marginTop: '12px',
                padding: '8px 16px',
                background: 'rgba(16,185,129,0.1)',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                  ✨ Concept Art • Final design voted separately
                </span>
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #34d399, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              The Frog
            </h2>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#6ee7b7',
              marginBottom: '24px'
            }}>
              The Key Guardian
            </h3>

            {/* Quote */}
            <div style={{
              background: 'rgba(16,185,129,0.1)',
              borderLeft: '3px solid #10b981',
              padding: '16px 20px',
              marginBottom: '24px',
              borderRadius: '0 8px 8px 0'
            }}>
              <p style={{
                fontSize: '16px',
                fontStyle: 'italic',
                color: colors.textPrimary,
                margin: 0,
                lineHeight: '1.6'
              }}>
                "I am the bridge between worlds—the ancient witness who carried life from water onto land."
              </p>
            </div>

            {/* Description */}
            <div style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.8', marginBottom: '24px' }}>
              <p>
                The frog is one of Earth's oldest storytellers. For more than <strong style={{ color: '#10b981' }}>200 million years</strong>, 
                frogs have survived shifting climates, collapsing ecosystems, and the rise and fall of entire species.
              </p>
              <p>
                They embody the first great transition in the evolution of intelligence: from water—fluid, subconscious, 
                primordial—into land, where cognition, memory, and complexity began to bloom.
              </p>
              <p>
                The ParagonDAO frog brings its hands together not in fear, but in <strong style={{ color: '#6ee7b7' }}>respect</strong>: 
                for nature, for intelligence, for the ecosystems that allow life—biological and digital—to flourish.
              </p>
            </div>

            {/* Symbolizes */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px', fontWeight: '600' }}>
                SYMBOLIZES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Origins', 'Continuity', 'Humility', 'Balance', 'Transformation'].map((trait, i) => (
                  <span key={i} style={{
                    padding: '6px 14px',
                    background: 'rgba(16,185,129,0.15)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '100px',
                    fontSize: '13px',
                    color: '#6ee7b7'
                  }}>
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Vote Button */}
            <motion.button
              whileHover={{ scale: hasVoted ? 1 : 1.02 }}
              whileTap={{ scale: hasVoted ? 1 : 0.98 }}
              onClick={() => handleVote('frog')}
              disabled={hasVoted}
              style={{
                width: '100%',
                padding: '18px',
                background: hasVoted 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'linear-gradient(135deg, #10b981, #059669)',
                color: hasVoted ? 'rgba(255,255,255,0.5)' : '#fff',
                borderRadius: '16px',
                border: 'none',
                cursor: hasVoted ? 'default' : 'pointer',
                fontSize: '18px',
                fontWeight: '700',
                boxShadow: hasVoted ? 'none' : '0 8px 32px rgba(16,185,129,0.4)',
                marginBottom: '16px'
              }}
            >
              {userVote === 'frog' ? '✓ Voted for Frog' : hasVoted ? 'Vote Submitted' : 'Vote for The Frog'}
            </motion.button>

            {/* Vote Count */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '800', 
                color: '#10b981',
                marginBottom: '4px'
              }}>
                {votes.frog} votes ({frogPercent}%)
              </div>
              <div style={{
                height: '8px',
                background: colors.cardBorder,
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${frogPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Dragonfly Option */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            onMouseEnter={() => !isMobile && setHoveredOption('dragonfly')}
            onMouseLeave={() => !isMobile && setHoveredOption(null)}
            style={{
              background: userVote === 'dragonfly' 
                ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.1))'
                : 'rgba(255,255,255,0.03)',
              border: userVote === 'dragonfly' 
                ? '2px solid #6366f1'
                : '1px solid rgba(99,102,241,0.3)',
              borderRadius: isMobile ? '20px' : '32px',
              padding: isMobile ? '24px 20px' : '48px 40px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Vote indicator */}
            {userVote === 'dragonfly' && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#6366f1',
                borderRadius: '100px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✓ Your Vote
              </div>
            )}

            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid rgba(99,102,241,0.4)',
              borderRadius: '100px',
              padding: '6px 16px',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '20px' }}>🧚‍♂️</span>
              <span style={{ color: '#a5b4fc', fontSize: '14px', fontWeight: '700' }}>OPTION 2</span>
            </div>

            {/* Designed Logo */}
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '16px' : '24px' }}>
              <DragonflyLogo isHovered={hoveredOption === 'dragonfly'} isMobile={isMobile} />
              {/* Design note */}
              <div style={{
                marginTop: '12px',
                padding: '8px 16px',
                background: 'rgba(99,102,241,0.1)',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                  ✨ Concept Art • Final design voted separately
                </span>
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              marginBottom: '8px',
              background: 'linear-gradient(135deg, #a5b4fc, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              The Dragonfly
            </h2>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#a5b4fc',
              marginBottom: '24px'
            }}>
              The Transformation Blueprint
            </h3>

            {/* Quote */}
            <div style={{
              background: 'rgba(99,102,241,0.1)',
              borderLeft: '3px solid #6366f1',
              padding: '16px 20px',
              marginBottom: '24px',
              borderRadius: '0 8px 8px 0'
            }}>
              <p style={{
                fontSize: '16px',
                fontStyle: 'italic',
                color: colors.textPrimary,
                margin: 0,
                lineHeight: '1.6'
              }}>
                "I am the one who sees the world from every angle—fast, adaptive, precise, shaped by the mathematics of evolution."
              </p>
            </div>

            {/* Description */}
            <div style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: '1.8', marginBottom: '24px' }}>
              <p>
                Dragonflies are among Earth's oldest aerial navigators, predating dinosaurs and surviving more than 
                <strong style={{ color: '#a5b4fc' }}> 300 million years</strong>. With wings crafted by nature's geometry, 
                their flight is an equation of agility and elegance.
              </p>
              <p>
                To watch a dragonfly turn is to watch <strong style={{ color: '#c4b5fd' }}>information become movement</strong>. 
                To watch its wings is to see the curves of infinity—symbolizing the endless loop between 
                perception and action, input and intelligence.
              </p>
              <p>
                A dragonfly lives in two worlds as well: born underwater, reborn in air—an evolutionary blueprint 
                for <strong style={{ color: '#818cf8' }}>transformation</strong>.
              </p>
            </div>

            {/* Symbolizes */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px', fontWeight: '600' }}>
                SYMBOLIZES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Perception', 'Precision', 'Elegance', 'Adaptability', 'Mathematical Harmony'].map((trait, i) => (
                  <span key={i} style={{
                    padding: '6px 14px',
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '100px',
                    fontSize: '13px',
                    color: '#a5b4fc'
                  }}>
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Vote Button */}
            <motion.button
              whileHover={{ scale: hasVoted ? 1 : 1.02 }}
              whileTap={{ scale: hasVoted ? 1 : 0.98 }}
              onClick={() => handleVote('dragonfly')}
              disabled={hasVoted}
              style={{
                width: '100%',
                padding: '18px',
                background: hasVoted 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: hasVoted ? 'rgba(255,255,255,0.5)' : '#fff',
                borderRadius: '16px',
                border: 'none',
                cursor: hasVoted ? 'default' : 'pointer',
                fontSize: '18px',
                fontWeight: '700',
                boxShadow: hasVoted ? 'none' : '0 8px 32px rgba(99,102,241,0.4)',
                marginBottom: '16px'
              }}
            >
              {userVote === 'dragonfly' ? '✓ Voted for Dragonfly' : hasVoted ? 'Vote Submitted' : 'Vote for The Dragonfly'}
            </motion.button>

            {/* Vote Count */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '800', 
                color: '#6366f1',
                marginBottom: '4px'
              }}>
                {votes.dragonfly} votes ({dragonflyPercent}%)
              </div>
              <div style={{
                height: '8px',
                background: colors.cardBorder,
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dragonflyPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #a5b4fc)',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How Governance Works */}
      <section style={{
        padding: isMobile ? '48px 16px' : '80px 24px',
        background: colors.cardBg,
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              How ParagonDAO Governance Works
            </h2>
            <p style={{
              textAlign: 'center',
              color: colors.textSecondary,
              fontSize: '18px',
              marginBottom: '48px',
              maxWidth: '700px',
              margin: '0 auto 48px'
            }}>
              This mascot vote demonstrates our governance framework. Here's how decisions are made in the ParagonDAO ecosystem.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '16px' : '24px'
          }}>
            {[
              { 
                step: '1', 
                title: 'Proposal', 
                desc: 'Community members or team submit proposals for ecosystem decisions',
                icon: '📝',
                color: '#f59e0b'
              },
              { 
                step: '2', 
                title: 'Discussion', 
                desc: 'Open discussion period where community provides feedback and refinements',
                icon: '💬',
                color: '#ec4899'
              },
              { 
                step: '3', 
                title: 'Voting', 
                desc: 'Token holders vote during the designated voting period (typically 7 days)',
                icon: '🗳️',
                color: '#6366f1'
              },
              { 
                step: '4', 
                title: 'Execution', 
                desc: 'Winning proposal is implemented transparently on-chain',
                icon: '⚡',
                color: '#10b981'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: colors.cardBg,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: isMobile ? '14px' : '20px',
                  padding: isMobile ? '16px 12px' : '28px 24px',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${item.color}20`,
                  border: `1px solid ${item.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: item.color,
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  STEP {item.step}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '8px'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Transparency Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              marginTop: isMobile ? '32px' : '48px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '16px',
              padding: isMobile ? '20px' : '24px 32px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? '12px' : '20px'
            }}
          >
            <div style={{ fontSize: isMobile ? '32px' : '40px' }}>🔗</div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#a5b4fc' }}>
                100% Transparent & On-Chain
              </h4>
              <p style={{ color: colors.textSecondary, margin: 0, lineHeight: '1.6' }}>
                All governance decisions, votes, and outcomes are recorded on the blockchain. 
                This ensures complete transparency and accountability—a fundamental requirement for 
                the Personal AI ecosystem that ParagonDAO supports.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default CommunityPage

