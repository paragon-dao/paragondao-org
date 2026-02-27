import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import ModeToggle from '../components/ModeToggle'
import CertificationBadge from '../components/CertificationBadge'
import { forgeModels, MODEL_STATUSES } from '../data/mockBuilderData'

const sectionAnim = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

const ForgePage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [mode, setMode] = useState('simulation')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const indigo = '#6366f1'
  const green = '#10b981'

  const cardStyle = (extra = {}) => ({
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
    ...extra,
  })

  const models = mode === 'simulation' ? forgeModels : []

  const stats = {
    submitted: models.length,
    verified: models.filter(m => ['verified', 'certification_awarded', 'published'].includes(m.status)).length,
    pending: models.filter(m => ['registered', 'uploading', 'uploaded', 'benchmark_queued', 'verification_in_progress'].includes(m.status)).length,
    highestTier: models.reduce((best, m) => {
      const tierOrder = { platinum: 4, gold: 3, silver: 2, bronze: 1 }
      const current = tierOrder[m.certificationTier] || 0
      const bestVal = tierOrder[best] || 0
      return current > bestVal ? m.certificationTier : best
    }, null),
    peopleReached: models.reduce((sum, m) => sum + (m.impact?.peopleReached?.thisMonth || 0), 0),
  }

  return (
    <>
      <Background />
      <Header />
      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>

          {/* Header */}
          <motion.div {...sectionAnim} style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              margin: '0 0 12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              The Forge
            </h1>
            <p style={{ fontSize: '15px', color: textSecondary, maxWidth: '520px', margin: '0 auto 20px' }}>
              Where health AI models prove they work. Submit yours for independent verification.
            </p>
            <ModeToggle mode={mode} onToggle={setMode} />
          </motion.div>

          {mode === 'production' ? (
            <motion.div {...sectionAnim} style={{
              textAlign: 'center',
              padding: '80px 40px',
              ...cardStyle(),
              marginBottom: '80px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: textPrimary, margin: '0 0 12px' }}>
                Early Access
              </h2>
              <p style={{ fontSize: '15px', color: textSecondary, maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                The Forge opens with the BAGLE API. Switch to Simulation mode to see
                how your builder dashboard will work with sample models.
              </p>
              <button
                onClick={() => setMode('simulation')}
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Try Simulation Mode
              </button>
            </motion.div>
          ) : (
            <>
              {/* Stats row */}
              <motion.div {...sectionAnim} style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '32px',
              }}>
                <StatCard label="Models Submitted" value={stats.submitted} color={textPrimary} isDark={isDark} />
                <StatCard label="Verified" value={stats.verified} color={green} isDark={isDark} />
                <StatCard label="Pending" value={stats.pending} color="#f59e0b" isDark={isDark} />
                <StatCard label="People Reached / mo" value={stats.peopleReached > 0 ? (stats.peopleReached >= 1000 ? (stats.peopleReached / 1000).toFixed(1) + 'K' : stats.peopleReached) : '—'} color="#f59e0b" isDark={isDark} />
              </motion.div>

              {/* Submit button */}
              <motion.div {...sectionAnim} style={{ marginBottom: '24px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/forge/submit?mode=simulation')}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '14px',
                    border: `2px dashed ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`,
                    background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
                    color: indigo,
                    fontWeight: '700',
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  + Submit a Model for Verification
                </motion.button>
              </motion.div>

              {/* Model list */}
              <motion.div {...sectionAnim} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '80px' }}>
                {models.map((model, i) => (
                  <ModelRow
                    key={model.id}
                    model={model}
                    index={i}
                    isDark={isDark}
                    textPrimary={textPrimary}
                    textSecondary={textSecondary}
                    cardStyle={cardStyle}
                    navigate={navigate}
                    isMobile={isMobile}
                  />
                ))}
              </motion.div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function StatCard({ label, value, color, isDark }) {
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'

  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${cardBorder}`,
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        fontSize: '11px',
        color: textSecondary,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '4px',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '28px', fontWeight: '800', color }}>
        {value}
      </div>
    </div>
  )
}

function ModelRow({ model, index, isDark, textPrimary, textSecondary, cardStyle, navigate, isMobile }) {
  const statusInfo = MODEL_STATUSES[model.status] || MODEL_STATUSES.registered
  const isInProgress = model.status === 'verification_in_progress'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      onClick={() => navigate(`/forge/model/${model.id}`)}
      style={{
        ...cardStyle({ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }),
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {/* Status dot */}
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: statusInfo.color,
        flexShrink: 0,
        ...(isInProgress && {
          boxShadow: `0 0 8px ${statusInfo.color}`,
          animation: 'pulse 2s infinite',
        }),
      }} />

      {/* Model info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: textPrimary }}>
          {model.name}
        </div>
        <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>
          {model.modality} · {model.disease} · Submitted {model.submittedAt.toLocaleDateString()}
        </div>
      </div>

      {/* Progress bar for in-progress models */}
      {isInProgress && (
        <div style={{ width: isMobile ? '100%' : '120px', flexShrink: 0 }}>
          <div style={{
            height: '6px',
            borderRadius: '3px',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${(model.verificationProgress || 0) * 100}%` }}
              style={{
                height: '100%',
                borderRadius: '3px',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              }}
            />
          </div>
          <div style={{ fontSize: '11px', color: textSecondary, marginTop: '4px', textAlign: 'right' }}>
            {Math.round((model.verificationProgress || 0) * 100)}%
          </div>
        </div>
      )}

      {/* Certification badge */}
      {model.certificationTier && (
        <CertificationBadge tier={model.certificationTier} size="sm" />
      )}

      {/* Status label */}
      <span style={{
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: '600',
        background: `${statusInfo.color}18`,
        color: statusInfo.color,
        whiteSpace: 'nowrap',
      }}>
        {statusInfo.label}
      </span>
    </motion.div>
  )
}

export default ForgePage
