import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import CertificationBadge from '../components/CertificationBadge'
import OnChainRecord from '../components/OnChainRecord'
import ExchangeCard from '../components/ExchangeCard'
import { exchangeModels, CERTIFICATION_TIERS, BENCHMARKS } from '../data/mockBuilderData'

const sectionAnim = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

const TABS = ['Performance', 'Methodology', 'Usage & Access', 'Verification Proof']

const ExchangeModelPage = () => {
  const { modelId } = useParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('Performance')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const model = exchangeModels.find(m => m.id === modelId)

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const green = '#10b981'
  const indigo = '#6366f1'

  const cardStyle = (extra = {}) => ({
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
    ...extra,
  })

  if (!model) {
    return (
      <>
        <Background />
        <Header />
        <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', color: textPrimary }}>Model not found</h1>
            <p style={{ color: textSecondary, marginTop: '12px' }}>This model may not exist or has been removed.</p>
            <button
              onClick={() => navigate('/exchange')}
              style={{
                marginTop: '24px',
                padding: '12px 28px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Back to Exchange
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const tierInfo = CERTIFICATION_TIERS[model.certificationTier]

  const relatedModels = exchangeModels
    .filter(m => m.id !== model.id)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3)

  const tabStyle = (tab) => ({
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: activeTab === tab ? '700' : '500',
    background: activeTab === tab
      ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)')
      : 'transparent',
    color: activeTab === tab ? indigo : textSecondary,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  })

  const StatBox = ({ label, value, color = textPrimary }) => (
    <div style={cardStyle({ textAlign: 'center', flex: '1 1 120px' })}>
      <div style={{ fontSize: '11px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: '800', color }}>
        {value}
      </div>
    </div>
  )

  return (
    <>
      <Background />
      <Header />
      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>

          {/* Breadcrumb */}
          <div style={{ marginBottom: '24px', fontSize: '13px', color: textSecondary }}>
            <span style={{ cursor: 'pointer', color: indigo }} onClick={() => navigate('/exchange')}>
              Exchange
            </span>
            {' / '}
            <span>{model.name}</span>
          </div>

          {/* Model Hero */}
          <motion.div {...sectionAnim} style={cardStyle({ marginBottom: '32px', position: 'relative', overflow: 'hidden' })}>
            {/* Tier color strip */}
            {tierInfo && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: tierInfo.gradient || tierInfo.color,
              }} />
            )}

            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: '20px',
              paddingTop: '8px',
            }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: textPrimary, margin: '0 0 8px' }}>
                  {model.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', color: textSecondary }}>{model.builder}</span>
                  {model.builderVerified && (
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'rgba(99,102,241,0.12)',
                      color: indigo,
                      fontWeight: '600',
                    }}>
                      Verified Builder
                    </span>
                  )}
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(99,102,241,0.08)',
                    color: textSecondary,
                  }}>
                    {model.modality}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(16,185,129,0.08)',
                    color: textSecondary,
                  }}>
                    {model.disease}
                  </span>
                </div>
              </div>
              <CertificationBadge tier={model.certificationTier} size="lg" />
            </div>

            {model.listing?.description && (
              <p style={{ margin: '16px 0 0', fontSize: '15px', color: textSecondary, lineHeight: '1.6' }}>
                {model.listing.description}
              </p>
            )}
          </motion.div>

          {/* Stats row */}
          <motion.div {...sectionAnim} style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}>
            <StatBox label="Accuracy" value={`${(model.accuracy * 100).toFixed(1)}%`} color={green} />
            <StatBox label="Subject Invariance" value={`${(model.subjectInvariance * 100).toFixed(1)}%`} color={indigo} />
            <StatBox label="Downloads" value={model.listing?.downloads?.toLocaleString() || '—'} />
            <StatBox label="Citations" value={model.listing?.citations || '—'} />
          </motion.div>

          {/* On-chain verification widget */}
          <motion.div {...sectionAnim} style={{ marginBottom: '32px' }}>
            <OnChainRecord record={model.onChain} />
          </motion.div>

          {/* Tabs */}
          <motion.div {...sectionAnim}>
            <div style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '24px',
              overflowX: 'auto',
              padding: '4px',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              borderRadius: '12px',
            }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(tab)}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={cardStyle({ marginBottom: '48px', minHeight: '300px' })}>
              {activeTab === 'Performance' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
                    Benchmark Performance
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                      gap: '12px',
                    }}>
                      <MetricCard label="Overall Accuracy" value={`${(model.accuracy * 100).toFixed(1)}%`} color={green} isDark={isDark} />
                      <MetricCard label="Subject Invariance" value={`${(model.subjectInvariance * 100).toFixed(1)}%`} color={indigo} isDark={isDark} />
                      <MetricCard label="Architecture" value={model.architecture} color={textPrimary} isDark={isDark} />
                      <MetricCard label="Certification" value={tierInfo?.label || '—'} color={tierInfo?.color || textSecondary} isDark={isDark} />
                    </div>
                    <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Benchmarks Passed
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {BENCHMARKS.map(b => (
                          <span key={b.id} style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: 'rgba(16,185,129,0.1)',
                            color: green,
                            border: '1px solid rgba(16,185,129,0.2)',
                          }}>
                            {b.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Methodology' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
                    Verification Methodology
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { title: 'Independent Replication', desc: 'Model weights are loaded in an isolated environment. No builder code runs during verification — only the model artifact is evaluated.' },
                      { title: 'Multi-Validator Consensus', desc: '5 independent validators run the same benchmark suite. Results must converge within 0.1% to pass. Any validator can flag anomalies.' },
                      { title: 'Subject-Invariant Testing', desc: 'Leave-one-subject-out cross-validation ensures the model generalizes across individuals, not just memorizes training data.' },
                      { title: 'On-Chain Attestation', desc: 'Results, validator signatures, and the model hash are permanently recorded on Ethereum. Tamper-proof, publicly auditable.' },
                    ].map((item, i) => (
                      <div key={i} style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        borderLeft: `3px solid ${indigo}`,
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, marginBottom: '4px' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '13px', color: textSecondary, lineHeight: '1.6' }}>
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Usage & Access' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
                    Usage & Access
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                      gap: '12px',
                    }}>
                      <MetricCard label="License" value={model.listing?.license || '—'} color={textPrimary} isDark={isDark} />
                      <MetricCard label="Published" value={model.publishedAt.toLocaleDateString()} color={textPrimary} isDark={isDark} />
                    </div>
                    {model.listing?.tags && (
                      <div>
                        <div style={{ fontSize: '12px', color: textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Tags
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {model.listing.tags.map(tag => (
                            <span key={tag} style={{
                              padding: '4px 12px',
                              borderRadius: '999px',
                              fontSize: '12px',
                              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                              color: textSecondary,
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: 'rgba(99,102,241,0.06)',
                      border: '1px solid rgba(99,102,241,0.15)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: textPrimary, marginBottom: '4px' }}>
                        API Access Coming Soon
                      </div>
                      <div style={{ fontSize: '13px', color: textSecondary }}>
                        Models will be accessible via the BAGLE API once the network launches.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Verification Proof' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
                    Verification Proof
                  </h3>
                  <OnChainRecord record={model.onChain} />
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '10px',
                        border: `1px solid ${cardBorder}`,
                        background: cardBg,
                        color: textPrimary,
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Download Certificate (PDF)
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Related models */}
          <motion.div {...sectionAnim} style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
              Related Models
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '16px',
            }}>
              {relatedModels.map((m, i) => (
                <ExchangeCard key={m.id} model={m} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function MetricCard({ label, value, color, isDark }) {
  return (
    <div style={{
      padding: '16px',
      borderRadius: '12px',
      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
    }}>
      <div style={{
        fontSize: '11px',
        color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '4px',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '18px', fontWeight: '700', color }}>
        {value}
      </div>
    </div>
  )
}

export default ExchangeModelPage
