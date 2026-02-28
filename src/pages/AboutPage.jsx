import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Background from '../components/Background'
import { getCurrentUser, getAuthToken } from '../services/api'
import { useTheme } from '../providers/ThemeProvider'
import { useMagic } from '../providers/MagicProvider'
import SEO from '../components/SEO'

const AboutPage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { isLoggedIn } = useMagic()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const currentUser = getCurrentUser()
  const isAuthenticated = isLoggedIn || (!!getAuthToken() && !!currentUser)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Theme-aware colors
  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBg: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    background: isDark 
      ? 'linear-gradient(135deg, #0a0a12 0%, #1a1a2e 50%, #16213e 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      position: 'relative',
      background: colors.background
    }}>
      <SEO
        title="About ParagonDAO"
        description="ParagonDAO is the governance network for AI model knowledge sharing. We enable personal AI models to learn from each other via HFTP protocol, creating a new economic paradigm."
        path="/about"
      />
      <Background />
      
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
        paddingTop: isMobile ? '100px' : '120px',
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
            style={{ textAlign: 'center', marginBottom: isMobile ? '48px' : '80px' }}
          >
            <h1 key={isDark ? 'hd' : 'hl'} style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '800',
              background: isDark
                ? 'linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #8b5cf6 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #6366f1 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '24px'
            }}>
              About ParagonDAO
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.375rem)',
              color: colors.textSecondary,
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              ParagonDAO is a governance network for AI model knowledge sharing. We enable 
              personal AI models to learn from each other via HFTP protocol and Hyperledger 
              Fabric, creating a new economic paradigm.
            </p>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
              borderRadius: isMobile ? '16px' : '24px',
              padding: isMobile ? '24px' : '48px',
              marginBottom: isMobile ? '24px' : '48px',
              boxShadow: isDark ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <h2 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '24px'
            }}>
              Our Mission
            </h2>
            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              color: colors.textSecondary,
              lineHeight: '1.8',
              marginBottom: '24px'
            }}>
              To enable AI models to learn from each other, creating a new type of B2B transaction 
              that has never existed before. We provide governance, infrastructure (HFTP protocol, 
              Hyperledger Fabric), and network services for personal AI models to share knowledge 
              and create unprecedented economic value.
            </p>
          </motion.div>

          {/* Model Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
              borderRadius: isMobile ? '16px' : '24px',
              padding: isMobile ? '24px' : '48px',
              marginBottom: isMobile ? '24px' : '48px',
              boxShadow: isDark ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <h2 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '24px'
            }}>
              The Network Model
            </h2>
            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              color: colors.textSecondary,
              lineHeight: '1.8',
              marginBottom: '32px'
            }}>
              ParagonDAO provides governance and infrastructure for AI model knowledge sharing. 
              Models communicate via HFTP protocol (80% bandwidth reduction), transactions are 
              secured via Hyperledger Fabric smart contracts, and knowledge transfers happen 
              automatically 24/7. Each transaction creates value that compounds exponentially.
            </p>
          </motion.div>

          {/* HF Auth Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
              borderRadius: isMobile ? '16px' : '24px',
              padding: isMobile ? '24px' : '48px',
              marginBottom: isMobile ? '24px' : '48px',
              boxShadow: isDark ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <h2 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '24px'
            }}>
              The Vision: Personal AI Models
            </h2>
            <ul style={{
              fontSize: isMobile ? '15px' : '18px',
              color: colors.textSecondary,
              lineHeight: '2',
              paddingLeft: '24px',
              margin: 0
            }}>
              <li>Each person can have multiple AI models: 1 Manager AI model + HF specialist models</li>
              <li>Manager AI: Coordinates specialists and communicates with humans via GPT/Hermes adapter</li>
              <li>HF Specialists: Domain-specific models (Music, Sport, Nutrition, Anti-Aging, Entertainment, Mental Health)</li>
              <li>Enterprise models: Organizations can train and monetize specialized models</li>
              <li>All models communicate via HFTP protocol, maintained in the network</li>
            </ul>
          </motion.div>

          {/* Structure Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              background: colors.cardBg,
              backdropFilter: 'blur(20px)',
              borderRadius: isMobile ? '16px' : '24px',
              padding: isMobile ? '24px' : '48px',
              boxShadow: isDark ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <h2 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '32px'
            }}>
              Our Structure
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: isMobile ? '20px' : '24px'
            }}>
              <div>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '8px'
                }}>
                  Legal Entity
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Wyoming DAO LLC
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  marginBottom: '8px'
                }}>
                  Governance
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Token-based voting
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '700',
                  color: '#ec4899',
                  marginBottom: '8px'
                }}>
                  IP Ownership
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  All core Personal AI technology
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '8px'
                }}>
                  Network Role
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Governance, HFTP protocol, Hyperledger Fabric infrastructure
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  marginBottom: '8px'
                }}>
                  Economic Impact
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Model-to-model transactions create unprecedented value, new GDP layer
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            style={{
              textAlign: 'center',
              marginTop: isMobile ? '48px' : '80px'
            }}
          >
            <Link
              to="/ecosystem"
              style={{
                display: 'inline-block',
                padding: isMobile ? '14px 28px' : '18px 36px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                borderRadius: '16px',
                textDecoration: 'none',
                fontSize: isMobile ? '16px' : '18px',
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
              Explore Ecosystem
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AboutPage
