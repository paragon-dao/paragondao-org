import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import CertificationBadge from '../components/CertificationBadge'
import OnChainRecord from '../components/OnChainRecord'
import ImpactDashboard from '../components/ImpactDashboard'
import { forgeModels, MODEL_STATUSES, BENCHMARKS, CERTIFICATION_TIERS } from '../data/mockBuilderData'

const sectionAnim = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

const TABS = ['Overview', 'Impact', 'Benchmark Details', 'On-Chain Record', 'Version History']

const ForgeModelDetailPage = () => {
  const { modelId } = useParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('Overview')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const model = forgeModels.find(m => m.id === modelId)

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

  const bgStyle = {
    minHeight: '100vh',
    position: 'relative',
    background: isDark
      ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    transition: 'background 0.3s ease',
  }

  if (!model) {
    return (
      <div style={bgStyle}>
        <Background />
        <Header />
        <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', minHeight: '100vh' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', color: textPrimary }}>Model not found</h1>
            <button
              onClick={() => navigate('/forge')}
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
              Back to Forge
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const statusInfo = MODEL_STATUSES[model.status] || MODEL_STATUSES.registered
  const tierInfo = model.certificationTier ? CERTIFICATION_TIERS[model.certificationTier] : null

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

  return (
    <div style={bgStyle}>
      <Background />
      <Header />
      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>

          {/* Breadcrumb */}
          <div style={{ marginBottom: '24px', fontSize: '13px', color: textSecondary }}>
            <span style={{ cursor: 'pointer', color: indigo }} onClick={() => navigate('/forge')}>
              Forge
            </span>
            {' / '}
            <span>{model.name}</span>
          </div>

          {/* Model header */}
          <motion.div {...sectionAnim} style={cardStyle({ marginBottom: '24px' })}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '16px',
            }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: textPrimary, margin: '0 0 8px' }}>
                  {model.name}
                </h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: `${statusInfo.color}18`,
                    color: statusInfo.color,
                  }}>
                    {statusInfo.label}
                  </span>
                  <span style={{ fontSize: '12px', color: textSecondary }}>
                    {model.modality} · {model.disease}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {model.certificationTier && <CertificationBadge tier={model.certificationTier} size="md" />}
              </div>
            </div>
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

            <div style={cardStyle({ marginBottom: '80px', minHeight: '300px' })}>
              {activeTab === 'Overview' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
                    Model Overview
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: '12px',
                  }}>
                    {[
                      { label: 'Architecture', value: model.architecture },
                      { label: 'Training Dataset', value: model.dataset },
                      { label: 'Claimed Accuracy', value: model.claimedAccuracy ? `${(model.claimedAccuracy * 100).toFixed(1)}%` : '—' },
                      { label: 'Submitted', value: model.submittedAt.toLocaleDateString() },
                      { label: 'Verified', value: model.verifiedAt ? model.verifiedAt.toLocaleDateString() : 'Pending' },
                      { label: 'Published', value: model.publishedAt ? model.publishedAt.toLocaleDateString() : '—' },
                    ].map((item, i) => (
                      <div key={i} style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      }}>
                        <div style={{ fontSize: '11px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: textPrimary, marginTop: '2px' }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {model.listing && (
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ fontSize: '12px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        Exchange Listing
                      </div>
                      <p style={{ fontSize: '14px', color: textSecondary, lineHeight: '1.6', margin: 0 }}>
                        {model.listing.description}
                      </p>
                      {model.listing.tags && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                          {model.listing.tags.map(tag => (
                            <span key={tag} style={{
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                              color: textSecondary,
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Impact' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
                    Your Model's Impact
                  </h3>
                  <ImpactDashboard impact={model.impact} showRevenue isMobile={isMobile} />
                </div>
              )}

              {activeTab === 'Benchmark Details' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
                    Benchmark Results
                  </h3>
                  {model.benchmarkResults ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {Object.entries(model.benchmarkResults).map(([benchId, metrics]) => {
                        const bench = BENCHMARKS.find(b => b.id === benchId)
                        return (
                          <div key={benchId} style={{
                            padding: '16px',
                            borderRadius: '12px',
                            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                          }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, marginBottom: '12px' }}>
                              {bench?.name || benchId}
                            </div>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(120px, 1fr))',
                              gap: '8px',
                            }}>
                              {Object.entries(metrics)
                                .filter(([, v]) => typeof v === 'number')
                                .map(([key, val]) => (
                                  <div key={key} style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                  }}>
                                    <div style={{ fontSize: '10px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      {key.replace(/_/g, ' ')}
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: val >= 0.9 ? green : indigo }}>
                                      {val < 1 ? (val * 100).toFixed(1) + '%' : val.toFixed(4)}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: textSecondary }}>
                      Verification in progress — results will appear here when complete.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'On-Chain Record' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
                    On-Chain Verification Record
                  </h3>
                  {model.onChain ? (
                    <OnChainRecord record={model.onChain} />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: textSecondary }}>
                      On-chain record will be created after verification completes.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Version History' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, margin: '0 0 20px' }}>
                    Version History
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      borderLeft: `3px solid ${green}`,
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: textPrimary }}>
                        v1.0 — Current
                      </div>
                      <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>
                        Submitted {model.submittedAt.toLocaleDateString()} · {statusInfo.label}
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      padding: '20px',
                      fontSize: '13px',
                      color: textSecondary,
                    }}>
                      When you retrain your model and achieve better scores, submit a new version here. Each version is independently verified and recorded on-chain. Your certification tier can upgrade as your model improves.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ForgeModelDetailPage
