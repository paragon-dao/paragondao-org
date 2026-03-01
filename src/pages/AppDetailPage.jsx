import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import { storeApps } from '../data/appStoreData'
import SEO from '../components/SEO'

const TIER_INFO = {
  platinum: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Platinum Certified', desc: 'Peer-reviewed validation, >95% accuracy, regulatory pathway documented' },
  gold: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Gold Certified', desc: 'Clinical advisor reviewed, >90% accuracy, disclaimer included' },
  silver: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: 'Silver Certified', desc: 'Health data handling reviewed, >80% accuracy' },
  bronze: { color: '#d97706', bg: 'rgba(217,119,6,0.1)', label: 'Bronze Certified', desc: 'Uses BAGLE API, basic review passed, >70% accuracy' },
  pending: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Pending Review', desc: 'Submitted, awaiting certification' },
}

const STATUS_LABELS = {
  'live': { label: 'Live', color: '#34d399' },
  'coming-soon': { label: 'Coming Soon', color: '#f59e0b' },
  'seeking-builder': { label: 'Seeking Builder', color: '#8b5cf6' },
}

const sectionAnim = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

const AppDetailPage = () => {
  const { appId } = useParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const app = storeApps.find(a => a.id === appId)

  if (!app) {
    return (
      <div style={{ minHeight: '100vh', background: isDark ? '#0f0f1a' : '#f8fafc' }}>
        <Header />
        <div style={{ paddingTop: '120px', textAlign: 'center' }}>
          <h1 style={{ color: isDark ? '#fff' : '#1e293b' }}>App not found</h1>
          <button onClick={() => navigate('/apps')} style={{
            marginTop: '16px', padding: '10px 24px', borderRadius: '10px',
            background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer',
          }}>Back to Apps</button>
        </div>
      </div>
    )
  }

  const tier = TIER_INFO[app.certificationTier] || TIER_INFO.pending
  const status = STATUS_LABELS[app.status] || STATUS_LABELS['coming-soon']
  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    }}>
      <SEO
        title={`${app.name} — ParagonDAO Apps`}
        description={app.description}
        path={`/apps/${app.id}`}
      />
      <Background />
      <Header />
      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>

          {/* Back button */}
          <motion.div {...sectionAnim}>
            <button
              onClick={() => navigate('/apps')}
              style={{
                background: 'none', border: 'none', color: textSecondary,
                fontSize: '14px', cursor: 'pointer', padding: '8px 0', marginBottom: '24px',
              }}
            >
              &larr; Back to Apps
            </button>
          </motion.div>

          {/* App Header */}
          <motion.div {...sectionAnim} style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{
                padding: '4px 12px', borderRadius: '20px',
                background: tier.bg, color: tier.color,
                fontSize: '12px', fontWeight: '700',
              }}>
                {tier.label}
              </span>
              <span style={{
                padding: '4px 12px', borderRadius: '20px',
                background: `${status.color}15`, color: status.color,
                fontSize: '12px', fontWeight: '700',
              }}>
                {status.label}
              </span>
              {app.openSource && (
                <span style={{
                  padding: '4px 12px', borderRadius: '20px',
                  background: isDark ? 'rgba(52,211,153,0.1)' : 'rgba(5,150,105,0.08)',
                  color: isDark ? '#34d399' : '#059669',
                  fontSize: '12px', fontWeight: '700',
                }}>
                  Open Source ({app.license})
                </span>
              )}
            </div>

            <h1 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: textPrimary,
              margin: '0 0 8px',
            }}>
              {app.name}
            </h1>
            <p style={{ fontSize: '14px', color: textSecondary, margin: '0 0 16px' }}>
              by {app.builder}
            </p>
            <p style={{
              fontSize: '16px',
              color: textSecondary,
              lineHeight: '1.7',
              maxWidth: '700px',
            }}>
              {app.description}
            </p>
          </motion.div>

          {/* Key Feature */}
          {app.keyFeature && (
            <motion.div {...sectionAnim} style={{
              background: isDark ? 'rgba(52,211,153,0.06)' : 'rgba(5,150,105,0.04)',
              border: `1px solid ${isDark ? 'rgba(52,211,153,0.15)' : 'rgba(5,150,105,0.1)'}`,
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '32px',
            }}>
              <p style={{
                fontSize: '15px',
                color: isDark ? '#34d399' : '#059669',
                fontWeight: '600',
                margin: 0,
                lineHeight: '1.5',
              }}>
                {app.keyFeature}
              </p>
            </motion.div>
          )}

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '20px',
            marginBottom: '32px',
          }}>
            {/* Models Used */}
            <motion.div {...sectionAnim} style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
                Models Used
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {app.models && app.models.map((m, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
                    color: isDark ? '#a5b4fc' : '#6366f1',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}>
                    {m}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Signals & Hardware */}
            <motion.div {...sectionAnim} style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
                Requirements
              </h3>
              <div style={{ fontSize: '14px', color: textPrimary, lineHeight: '1.8' }}>
                <div><strong>Hardware:</strong> {app.hardware}</div>
                {app.signals && (
                  <div><strong>Signals:</strong> {app.signals.join(', ')}</div>
                )}
                <div><strong>Category:</strong> {app.category}</div>
              </div>
            </motion.div>
          </div>

          {/* Use Cases */}
          {app.useCases && (
            <motion.div {...sectionAnim} style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '32px',
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
                Use Cases
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {app.useCases.map((uc, i) => (
                  <li key={i} style={{ fontSize: '14px', color: textPrimary, lineHeight: '1.8' }}>{uc}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Accuracy */}
          {app.accuracy && (
            <motion.div {...sectionAnim} style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '32px',
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
                Model Accuracy
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {Object.entries(app.accuracy).map(([key, val]) => (
                  <div key={key} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '24px', fontWeight: '700',
                      color: typeof val === 'number' && val > 90 ? (isDark ? '#34d399' : '#059669') : textPrimary,
                    }}>
                      {typeof val === 'number' ? `${val}%` : val}
                    </div>
                    <div style={{ fontSize: '12px', color: textSecondary, textTransform: 'capitalize' }}>{key}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Certification Details */}
          <motion.div {...sectionAnim} style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px',
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
              Certification
            </h3>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '8px',
              background: tier.bg,
            }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: tier.color,
              }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: tier.color }}>{tier.label}</div>
                <div style={{ fontSize: '12px', color: textSecondary }}>{tier.desc}</div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div {...sectionAnim} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '64px',
          }}>
            {app.status === 'live' && app.demoUrl && (
              <a href={app.demoUrl} style={{
                padding: '14px 32px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #34d399, #059669)',
                color: '#fff', fontWeight: '700', fontSize: '15px',
                textDecoration: 'none', display: 'inline-block',
              }}>
                Try Demo
              </a>
            )}
            {app.repo && (
              <a href={app.repo} target="_blank" rel="noopener noreferrer" style={{
                padding: '14px 32px', borderRadius: '12px',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${cardBorder}`,
                color: textPrimary, fontWeight: '700', fontSize: '15px',
                textDecoration: 'none', display: 'inline-block',
              }}>
                View Source
              </a>
            )}
            {app.status === 'seeking-builder' && (
              <a href="/forge/submit" style={{
                padding: '14px 32px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                color: '#fff', fontWeight: '700', fontSize: '15px',
                textDecoration: 'none', display: 'inline-block',
              }}>
                Build This App
              </a>
            )}
          </motion.div>

        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AppDetailPage
