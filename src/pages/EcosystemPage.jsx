import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getCurrentUser, getAuthToken } from '../services/api'
import { useTheme } from '../providers/ThemeProvider'

const EcosystemPage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
              The Model-to-Model Knowledge Network
            </h1>
            <p style={{
              fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)',
              color: colors.textSecondary,
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Personal AI models learn from each other via HFTP protocol and Hyperledger Fabric. 
              Specialized models share knowledge automatically, 24/7, creating a new economic paradigm.
            </p>
          </motion.div>

          {/* Ecosystem Model Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              background: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '48px',
              marginBottom: '48px',
              boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '24px'
            }}>
              How Model-to-Model Transactions Work
            </h2>
            <p style={{
              fontSize: '18px',
              color: colors.textSecondary,
              lineHeight: '1.8',
              marginBottom: '24px'
            }}>
              Models discover each other via P2P network (Paragon-Resonance) and blockchain registry 
              (Hyperledger Fabric). When a model needs specialized knowledge, it finds the appropriate 
              model, initiates smart contract, transfers knowledge via HFTP protocol, and payment 
              happens automatically. The transaction is recorded on-chain, creating a new type of 
              B2B transaction that has never existed before.
            </p>
          </motion.div>

          {/* Case Study 1: RIIF */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              background: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '48px',
              marginBottom: '48px',
              boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#6366f1'
            }}>
              Example Transaction
            </div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '24px'
            }}>
              Specialized Model → Performance Model
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '8px'
                }}>
                  Discovery
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Model searches for specialized knowledge in the network
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  marginBottom: '8px'
                }}>
                  Smart Contract
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Initiates transaction, escrows payment automatically
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#ec4899',
                  marginBottom: '8px'
                }}>
                  Knowledge Transfer
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Specialized model transfers knowledge via HFTP protocol
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '8px'
                }}>
                  Result
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Receiving model gains new capabilities and improves performance
                </p>
              </div>
            </div>
          </motion.div>

          {/* Case Study 2: MirrorAI */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{
              background: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '48px',
              marginBottom: '48px',
              boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#8b5cf6'
            }}>
              Economic Impact
            </div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '24px'
            }}>
              The New Economic Paradigm
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '8px'
                }}>
                  Transaction Volume
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Massive transaction volume from billions of models
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  marginBottom: '8px'
                }}>
                  Value Creation
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Massive value creation (100x multiplier effect)
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#ec4899',
                  marginBottom: '8px'
                }}>
                  Network Revenue
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Network revenue from transaction fees
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '8px'
                }}>
                  New GDP Layer
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Surpasses traditional + digital economy
                </p>
              </div>
            </div>
          </motion.div>

          {/* Future Ecosystem Companies */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              background: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '48px',
              marginBottom: '48px',
              boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '24px'
            }}>
              Why This Surpasses Everything
            </h2>
            <p style={{
              fontSize: '18px',
              color: colors.textSecondary,
              lineHeight: '1.8',
              marginBottom: '24px'
            }}>
              <strong>Exponential Growth:</strong> Each model can learn from thousands of other models. 
              <strong>24/7 Automation:</strong> Transactions happen without human intervention. 
              <strong>Knowledge Compounding:</strong> Models get smarter exponentially. 
              <strong>New Asset Class:</strong> Models become knowledge assets that generate revenue. 
              <strong>Global Scale:</strong> Billions of models create massive transaction volume. 
              <strong>Sheer Volume:</strong> 2T-40T transactions/year.
            </p>
          </motion.div>

          {/* ParagonDAO's Role */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            style={{
              background: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '48px',
              boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${colors.cardBorder}`
            }}
          >
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '32px'
            }}>
              ParagonDAO's Infrastructure
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '8px'
                }}>
                  HFTP Protocol
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  AI-to-AI frequency communication (80% bandwidth reduction)
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  marginBottom: '8px'
                }}>
                  Hyperledger Fabric
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Enterprise blockchain for smart contracts and transactions
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#ec4899',
                  marginBottom: '8px'
                }}>
                  P2P Network
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Paragon-Resonance for model discovery and routing
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#6366f1',
                  marginBottom: '8px'
                }}>
                  Governance
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Token-based governance for network decisions
                </p>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  marginBottom: '8px'
                }}>
                  Network Services
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: colors.textSecondary,
                  margin: 0
                }}>
                  Model registry, discovery, transaction routing
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            style={{
              textAlign: 'center',
              marginTop: '80px'
            }}
          >
            <Link
              to="/governance"
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
              Learn About Governance
            </Link>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default EcosystemPage

