import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useMagic } from '../providers/MagicProvider'
import { useTheme } from '../providers/ThemeProvider'
import { getCurrentUser } from '../services/api'

const EconomicImpactPage = () => {
  const navigate = useNavigate()
  const { isLoggedIn } = useMagic()
  const { isDark } = useTheme()
  
  // Check both Magic.link auth and localStorage auth
  const storedUser = getCurrentUser()
  const isAuthenticated = isLoggedIn || !!storedUser
  const [activeInnovation, setActiveInnovation] = useState('hftp')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Theme-aware colors
  const colors = {
    textPrimary: isDark ? '#fff' : '#1e293b',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textMuted: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
    cardBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    cardBgHover: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    sectionBg: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)',
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const [showDetails, setShowDetails] = useState(null)

  const innovations = [
    {
      id: 'hftp',
      rank: 1,
      name: 'HFTP + Model Economy',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      output: '$200T+',
      outputNum: 200,
      timeToReach: '10 years',
      growthType: 'Exponential',
      actors: 'AI Agent Network',
      description: 'AI-to-AI knowledge transfer creating unprecedented economic value through autonomous health agents operating 24/7.',
      keyPoints: [
        'Billions of AI health agents operating continuously',
        '24/7 automated transactions (no downtime)',
        '100x knowledge multiplier (compounding effect)',
        'Zero overhead with smart contract distribution',
        'New asset class: AI models as knowledge assets'
      ]
    },
    {
      id: 'internet',
      rank: 2,
      name: 'Internet/World Wide Web',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      output: '$50T+',
      outputNum: 50,
      timeToReach: '30 years',
      growthType: 'Exponential → Linear',
      actors: '5B Humans',
      description: 'Connected billions of humans and enabled e-commerce, but limited by human capacity and now plateauing.',
      keyPoints: [
        'Connected 5 billion humans globally',
        'Enabled e-commerce revolution',
        'Created digital economy foundation',
        'Growth now plateauing',
        'Limited by human transaction capacity'
      ]
    },
    {
      id: 'ai',
      rank: 3,
      name: 'Generic AI (OpenAI, etc.)',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
      output: '$30T',
      outputNum: 30,
      timeToReach: '20 years',
      growthType: 'Exponential',
      actors: 'Centralized',
      description: 'Productivity enhancement tools, but value flows to centralized providers rather than the ecosystem.',
      keyPoints: [
        'Improves productivity across industries',
        'API-based value extraction',
        '100% of value to AI providers',
        'Centralized knowledge silos',
        'Limited by server capacity'
      ]
    },
    {
      id: 'electricity',
      rank: 4,
      name: 'Electricity',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      output: '$20T+',
      outputNum: 20,
      timeToReach: '100 years',
      growthType: 'Linear',
      actors: 'Universal',
      description: 'Foundational infrastructure that powers modern civilization, but took a century to reach full potential.',
      keyPoints: [
        'Foundation of modern civilization',
        'Enabled industrial revolution 2.0',
        'Took 100+ years to reach scale',
        'Linear growth pattern',
        'Infrastructure-dependent'
      ]
    },
    {
      id: 'bitcoin',
      rank: 5,
      name: 'Bitcoin/Cryptocurrency',
      color: '#f97316',
      gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
      output: '$10T',
      outputNum: 10,
      timeToReach: '15 years',
      growthType: 'Volatile',
      actors: 'Speculative',
      description: 'Store of value and payment system, but limited real-economy impact and highly volatile.',
      keyPoints: [
        'Store of value innovation',
        'Decentralized payment system',
        'Speculative-driven growth',
        'Limited real-economy utility',
        'Transfers value, doesn\'t create it'
      ]
    }
  ]

  const comparisonMetrics = [
    { label: 'Economic Actors', hftp: '408B AI Models', internet: '5B Humans', ratio: '82x more' },
    { label: 'Operating Hours', hftp: '24/7', internet: '16h/day', ratio: '1.5x more' },
    { label: 'Transaction Speed', hftp: 'Milliseconds', internet: 'Seconds', ratio: '1000x faster' },
    { label: 'Value Multiplier', hftp: '100x (compounding)', internet: '1x (direct)', ratio: '100x more' },
    { label: 'Year 10 Output', hftp: '$200T+', internet: '$50T', ratio: '4x larger' }
  ]

  const maxOutput = 200

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark 
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      color: isDark ? '#fff' : '#1e293b',
      transition: 'all 0.3s ease'
    }}>
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
        paddingTop: '120px',
        paddingBottom: '80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', position: 'relative' }}
        >
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '100px',
            padding: '8px 20px',
            marginBottom: '24px'
          }}>
            <span style={{ color: '#a5b4fc', fontSize: '14px', fontWeight: '600' }}>
              📊 Economic Impact Analysis
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            The World's Largest Economic Innovation
          </h1>

          <p style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
            color: colors.textSecondary,
            lineHeight: '1.6',
            maxWidth: '800px',
            margin: '0 auto 48px'
          }}>
            HFTP Protocol enables a global network of <strong style={{ color: '#a5b4fc' }}>AI health agents</strong> to
            trade knowledge 24/7, building <strong style={{ color: '#8b5cf6' }}>the economy that runs on healthy bodies</strong> —
            the binding constraint on global productivity.
          </p>

          {/* Key stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '16px' : '24px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {[
              { value: '$200T+', label: 'Economic Output', sublabel: 'Year 10 Projection' },
              { value: '408B', label: 'AI Models', sublabel: 'Autonomous Actors' },
              { value: '100x', label: 'Knowledge Multiplier', sublabel: 'Compounding Effect' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                style={{
                  background: colors.cardBgHover,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: '20px',
                  padding: '24px'
                }}
              >
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#a5b4fc', marginBottom: '8px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary, marginBottom: '4px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '12px', color: colors.textMuted }}>
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Innovation Ranking Section */}
      <section style={{
        padding: '80px 24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            Innovation Economic Impact Ranking
          </h2>
          <p style={{
            textAlign: 'center',
            color: colors.textSecondary,
            fontSize: '18px',
            marginBottom: '48px',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            A definitive comparison of world-changing innovations by peak economic output
          </p>
        </motion.div>

        {/* Visual Bar Chart */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '60px'
        }}>
          {innovations.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '200px 1fr 100px',
                alignItems: 'center',
                gap: '20px',
                cursor: 'pointer'
              }}
              onClick={() => setActiveInnovation(item.id)}
            >
              {/* Rank & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: item.rank === 1 ? item.gradient : colors.cardBorder,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '18px',
                  color: item.rank === 1 ? '#fff' : colors.textMuted
                }}>
                  #{item.rank}
                </div>
                <span style={{
                  fontWeight: '600',
                  fontSize: '15px',
                  color: activeInnovation === item.id ? colors.textPrimary : colors.textSecondary
                }}>
                  {item.name}
                </span>
              </div>

              {/* Bar */}
              <div style={{
                height: '48px',
                background: colors.cardBgHover,
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(item.outputNum / maxOutput) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: item.gradient,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '16px',
                    minWidth: '80px'
                  }}
                >
                  {item.rank === 1 && (
                    <span style={{ fontSize: '14px', fontWeight: '700', color: colors.textPrimary }}>
                      ⚡ HFTP creates more value than ALL others combined
                    </span>
                  )}
                </motion.div>
              </div>

              {/* Output Value */}
              <div style={{
                textAlign: 'right',
                fontWeight: '800',
                fontSize: '20px',
                color: item.color
              }}>
                {item.output}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Innovation Details */}
        <AnimatePresence mode="wait">
          {innovations.filter(i => i.id === activeInnovation).map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: colors.cardBg,
                border: `1px solid ${item.color}40`,
                borderRadius: isMobile ? '16px' : '24px',
                padding: isMobile ? '24px' : '40px',
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '24px' : '40px'
              }}
            >
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: item.gradient,
                  borderRadius: '100px',
                  padding: '6px 16px',
                  marginBottom: '20px'
                }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>Rank #{item.rank}</span>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>
                  {item.name}
                </h3>
                <p style={{ 
                  color: colors.textSecondary, 
                  lineHeight: '1.7',
                  fontSize: '16px',
                  marginBottom: '24px'
                }}>
                  {item.description}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'Peak Output', value: item.output },
                    { label: 'Time to Peak', value: item.timeToReach },
                    { label: 'Growth Type', value: item.growthType },
                    { label: 'Economic Actors', value: item.actors }
                  ].map((metric, i) => (
                    <div key={i} style={{
                      background: colors.cardBgHover,
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>
                        {metric.label}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: item.color }}>
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: colors.textPrimary,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: item.color }}>●</span> Key Characteristics
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {item.keyPoints.map((point, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 0',
                        borderBottom: i < item.keyPoints.length - 1 ? `1px solid ${colors.cardBorder}` : 'none'
                      }}
                    >
                      <span style={{ color: item.color, fontSize: '18px' }}>✓</span>
                      <span style={{ color: colors.textSecondary, lineHeight: '1.5' }}>{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>

      {/* HFTP vs Internet Deep Comparison */}
      <section style={{
        padding: isMobile ? '60px 24px' : '80px 24px',
        background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              Why HFTP Surpasses the Internet
            </h2>
          </motion.div>

          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: isMobile ? '16px' : '24px',
            overflow: 'hidden'
          }}>
            {/* Header - hide on mobile */}
            {!isMobile && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr',
                background: colors.cardBgHover,
                padding: '16px 24px',
                borderBottom: `1px solid ${colors.cardBorder}`
              }}>
                <div style={{ fontWeight: '700', color: colors.textMuted, fontSize: '14px' }}>METRIC</div>
                <div style={{ fontWeight: '700', color: '#6366f1', fontSize: '14px' }}>HFTP + MODEL ECONOMY</div>
                <div style={{ fontWeight: '700', color: '#3b82f6', fontSize: '14px' }}>INTERNET</div>
                <div style={{ fontWeight: '700', color: '#10b981', fontSize: '14px' }}>ADVANTAGE</div>
              </div>
            )}

            {/* Rows */}
            {comparisonMetrics.map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: isMobile ? 'flex' : 'grid',
                  flexDirection: isMobile ? 'column' : undefined,
                  gridTemplateColumns: isMobile ? undefined : '2fr 1.5fr 1.5fr 1fr',
                  padding: isMobile ? '16px' : '20px 24px',
                  borderBottom: i < comparisonMetrics.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: isMobile ? '8px' : undefined
                }}
              >
                <div style={{ fontWeight: '600', color: colors.textPrimary, fontSize: isMobile ? '14px' : '16px', marginBottom: isMobile ? '4px' : 0 }}>{metric.label}</div>
                <div style={{ 
                  color: '#a5b4fc', 
                  fontWeight: '700',
                  fontSize: isMobile ? '13px' : '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: '#6366f1' }}>●</span>
                  {metric.hftp}
                </div>
                <div style={{ color: colors.textMuted }}>{metric.internet}</div>
                <div style={{
                  background: 'rgba(16,185,129,0.2)',
                  color: '#10b981',
                  padding: '6px 12px',
                  borderRadius: '100px',
                  fontSize: '13px',
                  fontWeight: '700',
                  textAlign: 'center'
                }}>
                  {metric.ratio}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Mathematical Proof */}
      <section style={{
        padding: '80px 24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            The Mathematical Proof
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: isMobile ? '20px' : '32px'
        }}>
          {/* Traditional Economy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              background: isDark ? colors.cardBg : 'rgba(255,255,255,0.9)',
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: isMobile ? '16px' : '24px',
              padding: isMobile ? '20px' : '32px',
              boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <h3 style={{ 
              fontSize: isMobile ? '18px' : '20px', 
              fontWeight: '700', 
              marginBottom: '20px',
              color: colors.textPrimary
            }}>
              Traditional Economy (Linear)
            </h3>
            <div style={{
              background: isDark ? '#1e293b' : '#f1f5f9',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: isMobile ? '12px' : '14px'
            }}>
              <div style={{ color: colors.textMuted, marginBottom: '12px' }}>// Linear growth formula</div>
              <div style={{ color: colors.textPrimary, marginBottom: '8px' }}>
                GDP = Initial × (1 + Rate)^Years
              </div>
              <div style={{ color: colors.textPrimary, marginBottom: '8px' }}>
                    = $100T × (1.03)^10
              </div>
              <div style={{ color: '#f97316', fontWeight: '700' }}>
                    = $134T <span style={{ color: colors.textMuted }}>// +34% in 10 years</span>
              </div>
            </div>
          </motion.div>

          {/* HFTP Model Economy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))'
                : 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: isMobile ? '16px' : '24px',
              padding: isMobile ? '20px' : '32px'
            }}
          >
            <h3 style={{ 
              fontSize: isMobile ? '18px' : '20px', 
              fontWeight: '700', 
              marginBottom: '20px',
              color: '#a5b4fc'
            }}>
              HFTP Model Economy (Exponential)
            </h3>
            <div style={{
              background: isDark ? '#1e293b' : '#f1f5f9',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              fontFamily: 'Monaco, Consolas, monospace',
              fontSize: isMobile ? '12px' : '14px'
            }}>
              <div style={{ color: colors.textMuted, marginBottom: '12px' }}>// Network effect formula</div>
              <div style={{ color: colors.textPrimary, marginBottom: '8px' }}>
                Value = Nodes² × Velocity × Multiplier
              </div>
              <div style={{ color: colors.textPrimary, marginBottom: '8px' }}>
                      = 408B² × 100 × 100
              </div>
              <div style={{ color: '#10b981', fontWeight: '700' }}>
                      = $200T+ <span style={{ color: colors.textMuted }}>// NEW economic output</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Clickable Case Study Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={() => navigate('/ecosystem')}
          style={{
            marginTop: isMobile ? '40px' : '60px',
            background: isDark 
              ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))'
              : 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: isMobile ? '16px' : '24px',
            padding: isMobile ? '24px' : '40px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: isMobile ? '16px' : '24px' }}>
            <div style={{ flex: 1, minWidth: isMobile ? '100%' : '300px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(236,72,153,0.2)',
                border: '1px solid rgba(236,72,153,0.3)',
                borderRadius: '100px',
                padding: '6px 14px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '14px' }}>📊</span>
                <span style={{ color: '#f9a8d4', fontSize: '12px', fontWeight: '600' }}>INTERACTIVE CASE STUDY</span>
              </div>
              
              <h4 style={{ fontSize: '28px', fontWeight: '800', color: colors.textPrimary, marginBottom: '16px' }}>
                How 1 Technique Becomes 3,000+
              </h4>
              
              <p style={{ color: colors.textSecondary, fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
                See the full cascade visualization: Watch knowledge multiply in real-time as 
                Wim Hof's breathing technique spreads through Tennis → Golf → Swimming → Basketball → 
                and hundreds more AI models.
              </p>

              {/* Preview of the cascade */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: 'rgba(99,102,241,0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}>
                  <span>🧊</span>
                  <span style={{ color: '#a5b4fc', fontSize: '14px', fontWeight: '600' }}>1</span>
                </div>
                <span style={{ color: '#8b5cf6' }}>→</span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: 'rgba(139,92,246,0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}>
                  <span>🎾</span>
                  <span style={{ color: '#c4b5fd', fontSize: '14px', fontWeight: '600' }}>5</span>
                </div>
                <span style={{ color: '#ec4899' }}>→</span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: 'rgba(236,72,153,0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}>
                  <span>⛳🏊🏀</span>
                  <span style={{ color: '#f9a8d4', fontSize: '14px', fontWeight: '600' }}>25</span>
                </div>
                <span style={{ color: '#f59e0b' }}>→</span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: 'rgba(249,115,22,0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}>
                  <span>🌍</span>
                  <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '600' }}>3,125+</span>
                </div>
              </div>
            </div>

            {/* Right side - CTA */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 8px 32px rgba(236,72,153,0.4)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ color: '#f9a8d4', fontSize: '14px', fontWeight: '600' }}>
                Explore Full Visualization →
              </span>
            </div>
          </div>

          {/* Bottom stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: isMobile ? '24px' : '32px',
            paddingTop: '24px',
            borderTop: `1px solid ${colors.cardBorder}`,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? '16px' : '0'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>5x</div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>Per Layer</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b' }}>6 Layers</div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>Visualized</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#a5b4fc' }}>$312K+</div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>Value Created</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#ec4899' }}>→ $200T</div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>Network Scale</div>
            </div>
          </div>
        </motion.div>

        {/* The Bottom Line - Quick Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: '32px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15))',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '16px', color: '#10b981', fontWeight: '700', marginBottom: '12px' }}>
            🚀 THE BOTTOM LINE
          </div>
          <p style={{ color: colors.textPrimary, fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
            <strong style={{ color: colors.textPrimary }}>Traditional economy:</strong> Money moves around, total stays the same.
            <br/>
            <strong style={{ color: '#10b981' }}>HFTP economy:</strong> Knowledge transforms into NEW knowledge, creating value that didn't exist before.
            <br/>
            <strong style={{ color: '#a5b4fc' }}>AI health agents doing this 24/7</strong> = <strong style={{ color: '#f59e0b' }}>the economy that runs on healthy bodies</strong>
          </p>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: isMobile ? '60px 24px' : '100px 24px',
        textAlign: 'center',
        background: isDark 
          ? 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.1) 100%)'
          : 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.05) 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '800',
            marginBottom: '24px',
            background: isDark 
              ? 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)'
              : 'linear-gradient(135deg, #1e293b 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Be Part of the $200T Economy
          </h2>
          <p style={{
            fontSize: isMobile ? '16px' : '20px',
            color: colors.textSecondary,
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Deploy your AI model to the network and start earning from knowledge transfers.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/ecosystem')}
              style={{
                padding: isMobile ? '14px 28px' : '18px 40px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
              }}
            >
              Get Started Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/whitepaper')}
              style={{
                padding: isMobile ? '14px 28px' : '18px 40px',
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: colors.textPrimary,
                borderRadius: '16px',
                border: `1px solid ${colors.cardBorder}`,
                cursor: 'pointer',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700'
              }}
            >
              Read the Whitepaper
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default EconomicImpactPage

