import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getCurrentUser, getAuthToken } from '../services/api'
import { useTheme } from '../providers/ThemeProvider'
import essays from '../data/essays'

const EssayDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const currentUser = getCurrentUser()
  const isAuthenticated = !!getAuthToken() && !!currentUser

  const essay = essays.find(e => e.slug === slug)

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

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!essay) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        color: isDark ? '#fff' : '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <h1 style={{ fontSize: '24px' }}>Essay not found</h1>
        <Link to="/essays" style={{
          color: isDark ? '#f0bb33' : '#b8860b',
          fontSize: '16px'
        }}>
          Back to Essays
        </Link>
      </div>
    )
  }

  const renderContent = (block, index) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index} style={{
            fontSize: isMobile ? '17px' : '19px',
            lineHeight: '1.75',
            color: colors.textSecondary,
            marginBottom: '24px',
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}>
            {block.text}
          </p>
        )

      case 'heading':
        return (
          <h2 key={index} style={{
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: '700',
            color: colors.textPrimary,
            marginTop: '16px',
            marginBottom: '24px',
            lineHeight: '1.3',
            letterSpacing: '-0.01em'
          }}>
            {block.text}
          </h2>
        )

      case 'divider':
        return (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '48px 0',
            gap: '16px'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isDark ? 'rgba(212,160,23,0.4)' : 'rgba(184,134,11,0.3)'
            }} />
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isDark ? 'rgba(212,160,23,0.6)' : 'rgba(184,134,11,0.5)'
            }} />
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isDark ? 'rgba(212,160,23,0.4)' : 'rgba(184,134,11,0.3)'
            }} />
          </div>
        )

      default:
        return null
    }
  }

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
        paddingTop: '100px',
        paddingBottom: '80px'
      }}>
        {/* Back link */}
        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 24px',
          marginBottom: '40px'
        }}>
          <Link
            to="/essays"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: colors.textMuted,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = isDark ? '#f0bb33' : '#b8860b'}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            All Essays
          </Link>
        </div>

        {/* Article */}
        <article style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Meta */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontSize: '14px',
                color: isDark ? '#f0bb33' : '#b8860b',
                fontWeight: '600'
              }}>
                {essay.author}
              </span>
              <span style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: colors.textMuted,
                display: 'inline-block'
              }} />
              <span style={{
                fontSize: '14px',
                color: colors.textMuted,
                fontWeight: '500'
              }}>
                {essay.date}
              </span>
              <span style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: colors.textMuted,
                display: 'inline-block'
              }} />
              <span style={{
                fontSize: '14px',
                color: colors.textMuted,
                fontWeight: '500'
              }}>
                {essay.readingTime}
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: isMobile ? '32px' : '44px',
              fontWeight: '800',
              color: colors.textPrimary,
              marginBottom: '16px',
              lineHeight: '1.15',
              letterSpacing: '-0.03em'
            }}>
              {essay.title}
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: isMobile ? '18px' : '22px',
              color: isDark ? 'rgba(240,187,51,0.8)' : '#b8860b',
              fontStyle: 'italic',
              lineHeight: '1.5',
              marginBottom: '20px',
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}>
              {essay.subtitle}
            </p>

            {/* Tags */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '48px'
            }}>
              {essay.tags.map(tag => (
                <span key={tag} style={{
                  padding: '4px 12px',
                  background: isDark ? 'rgba(212,160,23,0.12)' : 'rgba(212,160,23,0.08)',
                  border: `1px solid ${isDark ? 'rgba(212,160,23,0.25)' : 'rgba(212,160,23,0.2)'}`,
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDark ? '#f0bb33' : '#b8860b'
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Decorative line */}
            <div style={{
              height: '2px',
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(212,160,23,0.4), rgba(212,160,23,0.6), rgba(212,160,23,0.4), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(184,134,11,0.3), rgba(184,134,11,0.5), rgba(184,134,11,0.3), transparent)',
              marginBottom: '48px'
            }} />
          </motion.div>

          {/* Body */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {essay.content.map((block, index) => renderContent(block, index))}
          </motion.div>

          {/* End decoration */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '64px 0 48px',
            gap: '16px'
          }}>
            <div style={{
              height: '1px',
              flex: 1,
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(212,160,23,0.3))'
                : 'linear-gradient(90deg, transparent, rgba(184,134,11,0.2))'
            }} />
            <img
              src="/favicon.svg"
              alt="ParagonDAO"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                opacity: 0.6
              }}
            />
            <div style={{
              height: '1px',
              flex: 1,
              background: isDark
                ? 'linear-gradient(90deg, rgba(212,160,23,0.3), transparent)'
                : 'linear-gradient(90deg, rgba(184,134,11,0.2), transparent)'
            }} />
          </div>

          {/* Footer CTAs */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Link
              to="/whitepaper"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: isDark
                  ? 'linear-gradient(135deg, #d4a017, #b8860b)'
                  : 'linear-gradient(135deg, #b8860b, #996515)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '700',
                boxShadow: '0 4px 16px rgba(212, 160, 23, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(212, 160, 23, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(212, 160, 23, 0.3)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" />
                <path d="M14 2V8H20" />
              </svg>
              Read the Whitepaper
            </Link>
            <Link
              to="/health"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '700',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)'
              }}
            >
              Connect Your Health
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}

export default EssayDetailPage
