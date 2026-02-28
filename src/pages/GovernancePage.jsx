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

const GovernancePage = () => {
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
        title="Governance"
        description="ParagonDAO governance: one person, one vote. Protocol standards, model certification, mission fund allocation, and network registry. Health is a right, not a product."
        path="/governance"
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
              Network Governance
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.375rem)',
              color: colors.textSecondary,
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Token-based governance for the AI model knowledge sharing network. Wyoming DAO LLC 
              structure ensures transparency, alignment, and long-term sustainability for personal 
              AI models across the network.
            </p>
          </motion.div>

          {/* Token Structure */}
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
              Token Structure
            </h2>
            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              color: colors.textSecondary,
              lineHeight: '1.8',
              marginBottom: '32px'
            }}>
              ParagonDAO uses token-based governance where token holders vote on network proposals, 
              protocol upgrades, model sharing policies, and infrastructure decisions. With $20.4T/year 
              in transactions, network tokens have unprecedented value potential.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: isMobile ? '16px' : '24px'
            }}>
              <div style={{
                padding: isMobile ? '20px' : '24px',
                background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '12px'
                }}>
                  Founder Tokens
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  20% of network tokens to founder
                </p>
              </div>
              <div style={{
                padding: isMobile ? '20px' : '24px',
                background: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  marginBottom: '12px'
                }}>
                  Network Tokens
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  20% allocated to network infrastructure and governance
                </p>
              </div>
              <div style={{
                padding: isMobile ? '20px' : '24px',
                background: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(236, 72, 153, 0.2)'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '700',
                  color: '#ec4899',
                  marginBottom: '12px'
                }}>
                  Community & Ecosystem
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  60% to community, ecosystem, and model owners
                </p>
              </div>
            </div>
          </motion.div>

          {/* Voting Mechanisms */}
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
              Voting Mechanisms
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: isMobile ? '20px' : '24px'
            }}>
              <div>
                <h3 style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '12px'
                }}>
                  Proposal Process
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textSecondary,
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Token holders can submit proposals for protocol upgrades, model sharing policies, 
                  network infrastructure, and governance changes.
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  marginBottom: '12px'
                }}>
                  Voting Thresholds
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textSecondary,
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Proposals require majority token holder approval. Critical protocol changes 
                  require supermajority. Network infrastructure decisions affect all models in the network.
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '700',
                  color: '#ec4899',
                  marginBottom: '12px'
                }}>
                  IP Licensing Approval
                </h3>
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: colors.textSecondary,
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Token holders vote on model sharing policies, transaction fees, network 
                  upgrades, and infrastructure investments that enable model-to-model transactions.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Treasury Management */}
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
              Treasury Management
            </h2>
            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              color: colors.textSecondary,
              lineHeight: '1.8',
              marginBottom: '24px'
            }}>
              ParagonDAO manages treasury through token-based governance. Revenue from network 
              transactions, model sharing fees, and infrastructure services funds R&D, network 
              growth, and protocol development. As the network scales, network tokens have 
              significant value potential.
            </p>
          </motion.div>

          {/* Legal Structure */}
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
              marginBottom: '24px'
            }}>
              Legal Structure
            </h2>
            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              color: colors.textSecondary,
              lineHeight: '1.8',
              marginBottom: '24px'
            }}>
              ParagonDAO is a Wyoming DAO LLC, providing legal recognition and limited liability 
              while enabling token-based governance. This structure ensures transparency, 
              accountability, and long-term alignment with ecosystem goals.
            </p>
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

export default GovernancePage
