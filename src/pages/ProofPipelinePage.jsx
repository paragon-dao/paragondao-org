import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import CertificationBadge from '../components/CertificationBadge'
import { CERTIFICATION_TIERS } from '../data/mockBuilderData'

const sectionAnim = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

const PIPELINE_STEPS = [
  {
    num: 1,
    title: 'Register Your Model',
    desc: 'Define your model metadata — modality, disease target, architecture, claimed performance. This creates your permanent builder identity on the network.',
    icon: '📋',
    color: '#6366f1',
  },
  {
    num: 2,
    title: 'Upload Model Artifact',
    desc: 'Upload your model weights securely. A cryptographic hash is computed and stored — your model can never be altered after submission.',
    icon: '📤',
    color: '#8b5cf6',
  },
  {
    num: 3,
    title: 'Select Benchmarks',
    desc: 'Choose which verification benchmarks to run: NeurIPS EEG, MESA Sleep Staging, Subject Invariance Stress Test. More benchmarks = higher potential certification.',
    icon: '🎯',
    color: '#a78bfa',
  },
  {
    num: 4,
    title: 'Independent Verification',
    desc: '5 validators independently run your model against standardized datasets. No builder code executes — only the model artifact is evaluated in isolated environments.',
    icon: '🔍',
    color: '#6366f1',
  },
  {
    num: 5,
    title: 'Results & Certification',
    desc: 'Validators reach consensus on your performance metrics. Your model receives a certification tier: Bronze, Silver, Gold, or Platinum based on accuracy and generalization.',
    icon: '📊',
    color: '#10b981',
  },
  {
    num: 6,
    title: 'On-Chain Publication',
    desc: 'Results, validator signatures, and your model hash are permanently recorded on Ethereum. Your certification is tamper-proof and publicly verifiable forever.',
    icon: '⛓️',
    color: '#f59e0b',
  },
  {
    num: 7,
    title: 'List on The Exchange',
    desc: 'Your verified model appears on The Proof Exchange — discoverable by researchers, clinicians, and builders worldwide. Downloads, citations, and reputation grow.',
    icon: '🚀',
    color: '#ec4899',
  },
]

const ProofPipelinePage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
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

  const cardStyle = (extra = {}) => ({
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
    ...extra,
  })

  return (
    <>
      <Background />
      <Header />
      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>

          {/* Hero */}
          <motion.div {...sectionAnim} style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h1 style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: '800',
              margin: '0 0 16px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Your Model. Independently Verified.
              <br />Forever on Chain.
            </h1>
            <p style={{
              fontSize: '18px',
              color: textSecondary,
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}>
              The Proof Pipeline takes your health AI model from submission to independently
              verified, permanently certified, and publicly discoverable — in minutes.
            </p>
          </motion.div>

          {/* 7-step pipeline */}
          <motion.div {...sectionAnim} style={{ marginBottom: '80px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.num}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    style={{
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Step number + connector */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: `${step.color}20`,
                        border: `2px solid ${step.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                      }}>
                        {step.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, paddingBottom: '24px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: step.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '4px',
                      }}>
                        Step {step.num}
                      </div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 8px',
                      }}>
                        {step.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: textSecondary,
                        lineHeight: '1.6',
                        margin: 0,
                      }}>
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>

                  {/* Connector line */}
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div style={{
                      marginLeft: '23px',
                      width: '2px',
                      height: '16px',
                      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Certification tiers */}
          <motion.div {...sectionAnim} style={{ marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: textPrimary,
              margin: '0 0 12px',
              textAlign: 'center',
            }}>
              Four Certification Tiers
            </h2>
            <p style={{
              fontSize: '15px',
              color: textSecondary,
              textAlign: 'center',
              maxWidth: '560px',
              margin: '0 auto 32px',
              lineHeight: '1.6',
            }}>
              Certification level depends on how well your model generalizes
              across subjects and datasets — not just its top-line accuracy.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '16px',
            }}>
              {Object.entries(CERTIFICATION_TIERS).map(([key, tier]) => (
                <motion.div
                  key={key}
                  whileHover={{ y: -2 }}
                  style={cardStyle({
                    borderLeft: `4px solid ${tier.gradient ? '#6366f1' : tier.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  })}
                >
                  <CertificationBadge tier={key} size="md" showLabel={false} />
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: textPrimary }}>
                      {tier.label}
                    </div>
                    <div style={{ fontSize: '13px', color: textSecondary, marginTop: '2px' }}>
                      {tier.requirement}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust architecture */}
          <motion.div {...sectionAnim} style={{ marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: textPrimary,
              margin: '0 0 32px',
              textAlign: 'center',
            }}>
              Trust Architecture
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '20px',
            }}>
              {/* What stays private */}
              <div style={cardStyle({ borderTop: '3px solid #10b981' })}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', margin: '0 0 16px' }}>
                  What Stays Private
                </h3>
                <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Your model training data',
                    'Your model architecture details',
                    'Your training methodology',
                    'Pre-publication benchmark scores',
                    'Builder identity (until you choose to publish)',
                  ].map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: textSecondary, lineHeight: '1.5' }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* What's on-chain */}
              <div style={cardStyle({ borderTop: '3px solid #6366f1' })}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#6366f1', margin: '0 0 16px' }}>
                  What's On-Chain Forever
                </h3>
                <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Model artifact hash (tamper detection)',
                    'Benchmark results & certification tier',
                    'Validator signatures & consensus proof',
                    'Timestamp of verification',
                    'IPFS link to full verification report',
                  ].map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: textSecondary, lineHeight: '1.5' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div {...sectionAnim} style={{
            textAlign: 'center',
            padding: '60px 40px',
            marginBottom: '80px',
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
          }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: textPrimary, margin: '0 0 12px' }}>
              Ready to verify your model?
            </h2>
            <p style={{ fontSize: '15px', color: textSecondary, maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
              Try the full pipeline in simulation mode — no account required.
              See exactly how your model would be verified, certified, and published.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/forge/submit?mode=simulation')}
                style={{
                  padding: '14px 32px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                }}
              >
                Try Simulation
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/exchange')}
                style={{
                  padding: '14px 32px',
                  borderRadius: '14px',
                  border: `1px solid ${cardBorder}`,
                  background: cardBg,
                  color: textPrimary,
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(12px)',
                }}
              >
                Browse The Exchange
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default ProofPipelinePage
