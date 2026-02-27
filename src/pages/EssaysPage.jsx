import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getCurrentUser, getAuthToken } from '../services/api'
import { useTheme } from '../providers/ThemeProvider'
import essays from '../data/essays'

const EssaysPage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const currentUser = getCurrentUser()
  const isAuthenticated = !!getAuthToken() && !!currentUser

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
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '80px' }}
          >
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '800',
              background: isDark
                ? 'linear-gradient(135deg, #fff 0%, #f0bb33 50%, #d4a017 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #b8860b 50%, #d4a017 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '24px'
            }}>
              Essays
            </h1>
            <p style={{
              fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)',
              color: colors.textSecondary,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Long-form thinking on health economics, planetary infrastructure, and why the next great economy starts with your body.
            </p>
          </motion.div>

          {/* Essay Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '32px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {essays.map((essay, index) => (
              <motion.div
                key={essay.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
              >
                {/* Featured badge */}
                {essay.featured && (
                  <div style={{
                    textAlign: 'center',
                    padding: '8px 16px',
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(184,134,11,0.15))'
                      : 'linear-gradient(135deg, rgba(212,160,23,0.1), rgba(184,134,11,0.1))',
                    borderRadius: '10px 10px 0 0',
                    border: `1px solid ${isDark ? 'rgba(212,160,23,0.3)' : 'rgba(212,160,23,0.25)'}`,
                    borderBottom: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: isDark ? '#f0bb33' : '#b8860b'
                  }}>
                    Seminal Essay — The foundation for our economic thesis
                  </div>
                )}

                <Link
                  to={`/essays/${essay.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <motion.div
                    style={{
                      background: isDark ? 'rgba(30, 30, 50, 0.9)' : 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: essay.featured ? '0 0 20px 20px' : '20px',
                      padding: isMobile ? '28px 24px' : '40px',
                      boxShadow: essay.featured
                        ? `0 8px 32px ${isDark ? 'rgba(212,160,23,0.15)' : 'rgba(212,160,23,0.1)'}`
                        : isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
                      border: essay.featured
                        ? `2px solid ${isDark ? 'rgba(212,160,23,0.3)' : 'rgba(212,160,23,0.2)'}`
                        : `1px solid ${colors.cardBorder}`,
                      borderTop: essay.featured ? 'none' : undefined,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    whileHover={{
                      scale: 1.01,
                      boxShadow: `0 12px 48px ${isDark ? 'rgba(212,160,23,0.2)' : 'rgba(212,160,23,0.15)'}`
                    }}
                  >
                    {/* Meta row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        fontSize: '13px',
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
                        fontSize: '13px',
                        color: colors.textMuted,
                        fontWeight: '500'
                      }}>
                        {essay.readingTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 style={{
                      fontSize: isMobile ? '24px' : '32px',
                      fontWeight: '800',
                      color: colors.textPrimary,
                      marginBottom: '12px',
                      lineHeight: '1.2',
                      letterSpacing: '-0.02em'
                    }}>
                      {essay.title}
                    </h2>

                    {/* Subtitle */}
                    <p style={{
                      fontSize: isMobile ? '16px' : '18px',
                      color: isDark ? '#f0bb33' : '#b8860b',
                      fontWeight: '500',
                      marginBottom: '20px',
                      lineHeight: '1.5',
                      fontStyle: 'italic'
                    }}>
                      {essay.subtitle}
                    </p>

                    {/* Excerpt */}
                    <p style={{
                      fontSize: '15px',
                      color: colors.textSecondary,
                      lineHeight: '1.7',
                      marginBottom: '24px'
                    }}>
                      {essay.excerpt}
                    </p>

                    {/* Tags */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginBottom: '24px'
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

                    {/* Read link */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: isDark ? '#f0bb33' : '#b8860b'
                    }}>
                      Read essay
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{
              textAlign: 'center',
              marginTop: '80px'
            }}
          >
            <p style={{
              fontSize: '15px',
              color: colors.textMuted,
              marginBottom: '24px'
            }}>
              Read the technical foundations in our whitepapers
            </p>
            <Link
              to="/whitepaper"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: isDark
                  ? 'linear-gradient(135deg, #d4a017, #b8860b)'
                  : 'linear-gradient(135deg, #b8860b, #996515)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '700',
                boxShadow: '0 4px 16px rgba(212, 160, 23, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.boxShadow = '0 8px 32px rgba(212, 160, 23, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = '0 4px 16px rgba(212, 160, 23, 0.3)'
              }}
            >
              View Whitepapers
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default EssaysPage
