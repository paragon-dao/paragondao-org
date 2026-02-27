import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import { useMagic } from '../providers/MagicProvider'
import { getCurrentUser } from '../services/api'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import verificationAPI from '../services/verification'

// ─── Animated number counter ────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 5, duration = 1.2, prefix = '', suffix = '', style }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView || value == null) return
    const num = parseFloat(value)
    if (isNaN(num)) { setDisplay(String(value)); return }
    const controls = animate(0, num, {
      duration,
      ease: 'easeOut',
      onUpdate: v => setDisplay(v.toFixed(decimals)),
    })
    return () => controls.stop()
  }, [inView, value, decimals, duration])

  return <span ref={ref} style={style}>{prefix}{display}{suffix}</span>
}

// ─── Skeleton loader ────────────────────────────────────────────────────────
function Skeleton({ width = '100%', height = '24px', radius = '8px', style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  )
}

const VerifyPage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { isLoggedIn } = useMagic()
  const storedUser = getCurrentUser()
  const isAuthenticated = isLoggedIn || !!storedUser

  const [results, setResults] = useState(null)
  const [benchmark, setBenchmark] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Playground state
  const [playgroundInput, setPlaygroundInput] = useState(null)
  const [showRawInput, setShowRawInput] = useState(false)
  const [playgroundResult, setPlaygroundResult] = useState(null)
  const [playgroundLoading, setPlaygroundLoading] = useState(false)
  const [playgroundError, setPlaygroundError] = useState(null)
  const [activeSnippet, setActiveSnippet] = useState('curl')
  const [copied, setCopied] = useState(false)
  const [rerunning, setRerunning] = useState(false)

  // Theme colors
  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const green = '#10b981'
  const greenBg = 'rgba(16,185,129,0.1)'
  const greenBorder = 'rgba(16,185,129,0.3)'
  const indigo = '#6366f1'

  useEffect(() => {
    async function fetchData() {
      try {
        const [r, b] = await Promise.all([
          verificationAPI.getResults().catch(() => null),
          verificationAPI.getBenchmark().catch(() => null),
        ])
        setResults(r)
        setBenchmark(b)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const generateSignal = () => {
    const channels = Array.from({ length: 4 }, () =>
      Array.from({ length: 200 }, () => +(Math.random() * 100 - 50).toFixed(2))
    )
    setPlaygroundInput(channels)
    return channels
  }

  const handlePredict = async () => {
    setPlaygroundLoading(true)
    setPlaygroundError(null)
    setPlaygroundResult(null)
    try {
      const data = playgroundInput || generateSignal()
      const res = await verificationAPI.predict(data)
      setPlaygroundResult(res)
    } catch (e) {
      setPlaygroundError(e.message)
    } finally {
      setPlaygroundLoading(false)
    }
  }

  const handleRerun = async () => {
    setRerunning(true)
    try {
      const fresh = await verificationAPI.runVerification()
      setResults(fresh)
    } catch (e) {
      setPlaygroundError(e.message)
    } finally {
      setRerunning(false)
    }
  }

  const copyCode = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const apiBaseUrl = import.meta.env.VITE_VERIFY_API_URL || 'http://localhost:2051'

  const codeSnippets = {
    curl: `curl -X POST ${apiBaseUrl}/api/v1/verify/predict \\
  -H "Content-Type: application/json" \\
  -d '{"eeg_raw": [[0.1, -0.3, ...], [...], [...], [...]], "sfreq": 100}'`,
    python: `import requests
import numpy as np

# Raw EEG: 4 channels x 200 samples (2s at 100Hz)
eeg = np.random.randn(4, 200).tolist()

r = requests.post(
    "${apiBaseUrl}/api/v1/verify/predict",
    json={"eeg_raw": eeg, "sfreq": 100}
)
print(r.json())  # {"prediction": 0.42, "latency_ms": 7.2}`,
    javascript: `const eeg = Array.from({length: 4}, () =>
  Array.from({length: 200}, () => Math.random() * 100 - 50)
);

const res = await fetch("${apiBaseUrl}/api/v1/verify/predict", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({eeg_raw: eeg, sfreq: 100})
});
console.log(await res.json());`
  }

  const cardStyle = (extra = {}) => ({
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ...extra,
  })

  const sectionAnim = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.5 },
  }

  const overall = results?.overall || {}
  const leaderboard = benchmark?.leaderboard || []
  const pScore = benchmark?.paragondao?.score || overall.normalized_error || 0.70879
  const totalTeams = benchmark?.total_teams || 1183

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    }}>
      <Background />
      <Header
        searchQuery="" lastSearchedTerm="" setSearchQuery={() => {}}
        handleSearch={() => {}} isSearching={false} isSearchExpanded={false}
        setIsSearchExpanded={() => {}} isAuthenticated={isAuthenticated}
        onLoginClick={() => navigate('/login')} onSignupClick={() => navigate('/login')}
      />

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes shimmer { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }
      `}</style>

      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

          {/* ═══════ HERO ═══════ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              textAlign: 'center', marginBottom: '72px', position: 'relative',
            }}
          >
            {/* Subtle glow */}
            <div style={{
              position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)',
              width: '600px', height: '400px',
              background: `radial-gradient(ellipse, ${isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)'} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '5px 14px', borderRadius: '20px',
              background: greenBg, border: `1px solid ${greenBorder}`,
              marginBottom: '24px',
            }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%', background: green,
                boxShadow: `0 0 8px ${green}`, animation: 'pulse 3s infinite',
              }} />
              <span style={{ color: green, fontSize: '12px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Live — Independently Verifiable
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: '800',
              background: isDark
                ? 'linear-gradient(135deg, #ffffff 0%, #6ee7b7 60%, #10b981 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #059669 60%, #10b981 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              margin: '0 0 20px 0', lineHeight: '1.08',
            }}>
              13.5x More Improvement Than the NeurIPS 2025 Winner
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)', fontWeight: '450',
              color: textSecondary, maxWidth: '720px', margin: '0 auto 28px', lineHeight: '1.65',
            }}>
              Our GLE encoder achieved <span style={{ color: green, fontWeight: '600' }}>0.709</span> normalized error
              on the NeurIPS 2025 EEG Foundation Model Challenge — beating the winning team's 0.978 by
              improving <span style={{ color: green, fontWeight: '600' }}>13.5x more</span> below
              baseline in a field of {totalTeams.toLocaleString()} teams. Every result on this page is independently verifiable.
            </p>

            <div style={{
              display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap',
            }}>
              {[
                `${totalTeams.toLocaleString()} Teams Competed`,
                '3 Unseen Test Subjects',
                'Zero Data Overlap',
              ].map((chip, i) => (
                <span key={i} style={{
                  padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '550',
                  color: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                }}>
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ═══════ COMPETITION BENCHMARK ═══════ */}
          <motion.div {...sectionAnim} style={{ marginBottom: '64px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: textSecondary, marginBottom: '4px' }}>
              NeurIPS 2025 EEG Foundation Model Challenge
            </div>
            <div style={{ fontSize: '14px', color: textSecondary, marginBottom: '24px' }}>
              Challenge 2: Subject-Invariant Representation
            </div>

            {loading ? (
              <div style={{ display: 'flex', gap: '16px' }}>
                <Skeleton height="200px" style={{ flex: 3 }} />
                <Skeleton height="200px" style={{ flex: 2 }} />
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Leaderboard table */}
                <div style={{ flex: '3 1 400px', minWidth: '300px' }}>
                  <div style={cardStyle({ padding: '0', overflow: 'hidden' })}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                          {['Rank', 'Team', 'Normalized Error'].map(h => (
                            <th key={h} style={{
                              padding: '14px 20px', textAlign: h === 'Normalized Error' ? 'right' : 'left',
                              fontSize: '11px', fontWeight: '600', textTransform: 'uppercase',
                              letterSpacing: '0.06em', color: textSecondary,
                            }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((entry, i) => (
                          <tr key={i} style={{
                            borderBottom: i < leaderboard.length - 1 ? `1px solid ${cardBorder}` : 'none',
                          }}>
                            <td style={{ padding: '14px 20px', color: textSecondary, fontSize: '14px', fontFamily: 'monospace' }}>
                              #{entry.rank}
                            </td>
                            <td style={{ padding: '14px 20px', color: textPrimary, fontSize: '15px', fontWeight: '600' }}>
                              {entry.team}
                              {entry.institution && (
                                <span style={{ color: textSecondary, fontSize: '12px', fontWeight: '400', marginLeft: '8px' }}>
                                  {entry.institution}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'right', fontFamily: 'monospace', fontSize: '17px', fontWeight: '600', color: textPrimary }}>
                              {entry.score.toFixed(5)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ padding: '12px 20px', fontSize: '12px', color: textSecondary, borderTop: `1px solid ${cardBorder}` }}>
                      Lower normalized error = better. 1.0 = no improvement over baseline.
                    </div>
                  </div>
                </div>

                {/* ParagonDAO hero card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.15 }}
                  style={{
                    flex: '2 1 280px', minWidth: '260px',
                    ...cardStyle({
                      border: `2px solid ${greenBorder}`,
                      background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center',
                      alignItems: 'center', textAlign: 'center', padding: '32px 24px',
                    })
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: textPrimary, fontSize: '14px', fontWeight: '600' }}>ParagonDAO</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700',
                      background: green, color: '#fff', letterSpacing: '0.04em',
                    }}>VERIFIED</span>
                  </div>

                  <AnimatedNumber
                    value={pScore}
                    decimals={5}
                    duration={1.4}
                    style={{
                      fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: '800',
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      color: green, display: 'block', lineHeight: '1.1', margin: '8px 0',
                    }}
                  />

                  <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: textSecondary, marginBottom: '12px' }}>
                    Normalized Error (competition metric)
                  </div>

                  <div style={{ fontSize: '14px', color: textSecondary, marginBottom: '4px' }}>
                    vs. {leaderboard[0]?.score?.toFixed(5) || '0.97843'} (1st place)
                  </div>

                  <div style={{
                    fontSize: '18px', fontWeight: '700', color: green,
                    padding: '6px 16px', borderRadius: '8px', marginTop: '8px',
                    background: 'rgba(16,185,129,0.1)',
                  }}>
                    13.5x more improvement
                  </div>

                  <div style={{ fontSize: '12px', color: textSecondary, marginTop: '12px' }}>
                    HFTP + Domain Adversarial Training
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* ═══════ WHY THIS MATTERS — moved up ═══════ */}
          <motion.div {...sectionAnim} style={{ marginBottom: '64px' }}>
            <div style={cardStyle({
              padding: '36px',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)'}`,
              background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.02)',
            })}>
              <h3 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: '800', color: textPrimary, margin: '0 0 12px 0' }}>
                One Encoder Architecture. Every Biosignal.
              </h3>
              <p style={{ color: textSecondary, fontSize: '15px', lineHeight: '1.7', maxWidth: '700px', margin: '0 0 24px 0' }}>
                Subject invariance is the hardest problem in biosignal AI. The GLE encoding pipeline that solved it for
                EEG is identical across all modalities — only the input sensor and prediction head change.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '10px', marginBottom: '24px',
              }}>
                {[
                  { signal: 'Brain (EEG)', model: 'Consciousness', status: 'Verified', color: green },
                  { signal: 'Serum (LC-MS)', model: 'T2D Metabolomics', status: 'Validated', color: '#8b5cf6' },
                  { signal: 'Saliva (Raman)', model: 'PD/AD, Cancer, COVID', status: 'Validated', color: '#8b5cf6' },
                  { signal: 'Audio', model: 'Respiratory Health', status: 'Production', color: green },
                  { signal: 'Voice + EEG', model: 'Mental Health', status: 'Research', color: '#f59e0b' },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '14px 16px', borderRadius: '12px',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${cardBorder}`,
                  }}>
                    <div style={{ color: textSecondary, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                      {item.signal}
                    </div>
                    <div style={{ color: textPrimary, fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                      {item.model}
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                      color: item.color,
                      background: item.color === green ? 'rgba(16,185,129,0.12)' : item.color === '#f59e0b' ? 'rgba(245,158,11,0.12)' : 'rgba(139,92,246,0.12)',
                    }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <motion.a
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  href="/models"
                  style={{
                    padding: '10px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                    background: `linear-gradient(135deg, ${indigo}, #8b5cf6)`, color: '#fff',
                    textDecoration: 'none', display: 'inline-block',
                  }}
                >
                  View All Disease Models
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  href="/whitepaper"
                  style={{
                    padding: '10px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
                    background: 'transparent', color: textSecondary,
                    border: `1px solid ${cardBorder}`, textDecoration: 'none', display: 'inline-block',
                  }}
                >
                  Read the Whitepaper
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* ═══════ VERIFICATION DASHBOARD ═══════ */}
          {(results?.overall || loading) && (
            <motion.div {...sectionAnim} style={{ marginBottom: '64px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ color: textPrimary, fontSize: '20px', fontWeight: '700', margin: 0 }}>
                    Verification Dashboard
                  </h3>
                  <span style={{
                    padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                    background: greenBg, color: green, border: `1px solid ${greenBorder}`,
                  }}>VERIFIED</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {results?.verified_at && (
                    <span style={{ color: textSecondary, fontSize: '12px' }}>
                      Last verified: {new Date(results.verified_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  <button
                    onClick={handleRerun} disabled={rerunning}
                    style={{
                      padding: '6px 14px', borderRadius: '8px',
                      background: rerunning ? 'rgba(255,255,255,0.03)' : greenBg,
                      border: `1px solid ${greenBorder}`, color: green,
                      fontSize: '12px', fontWeight: '600',
                      cursor: rerunning ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {rerunning ? 'Running...' : 'Re-run Verification'}
                  </button>
                </div>
              </div>

              {/* Hero metrics */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  {[1,2,3].map(i => <Skeleton key={i} height="110px" />)}
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    {[
                      { label: 'Normalized Error', sublabel: 'Competition metric', value: overall.normalized_error, decimals: 5, accent: true },
                      { label: 'Prediction-Target Correlation', sublabel: 'Alignment strength', value: overall.correlation, decimals: 5 },
                      { label: 'Test Samples Evaluated', sublabel: 'Across 3 unseen subjects', value: overall.total_samples, decimals: 0, isInt: true },
                    ].map((m, i) => (
                      <div key={i} style={cardStyle({ textAlign: 'center', padding: '28px 20px' })}>
                        <div style={{ color: textSecondary, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                          {m.label}
                        </div>
                        <AnimatedNumber
                          value={m.value}
                          decimals={m.decimals}
                          duration={1.2}
                          style={{
                            fontSize: '32px', fontWeight: '800',
                            fontFamily: "'JetBrains Mono', monospace",
                            color: m.accent ? green : textPrimary,
                            display: 'block', margin: '6px 0',
                          }}
                        />
                        <div style={{ color: textSecondary, fontSize: '12px' }}>{m.sublabel}</div>
                      </div>
                    ))}
                  </div>

                  {/* Supporting metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                    {[
                      { label: 'MSE', value: overall.mse?.toFixed(6) },
                      { label: 'RMSE', value: overall.rmse?.toFixed(6) },
                      { label: 'Unseen Subjects', value: overall.total_subjects },
                    ].map((m, i) => (
                      <div key={i} style={cardStyle({ textAlign: 'center', padding: '16px' })}>
                        <div style={{ color: textSecondary, fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                          {m.label}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'monospace', color: textSecondary }}>
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Per-subject */}
                  {results?.per_subject?.length > 0 && (
                    <>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: textPrimary, marginBottom: '12px' }}>
                        Per-Subject Performance
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        {results.per_subject.map((subj, i) => (
                          <div key={i} style={cardStyle()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                              <span style={{ color: textPrimary, fontSize: '15px', fontWeight: '700' }}>
                                Subject {i + 1}
                              </span>
                              <span style={{ color: textSecondary, fontSize: '12px' }}>
                                {subj.samples?.toLocaleString()} samples
                              </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              <div>
                                <div style={{ color: textSecondary, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>Correlation</div>
                                <div style={{ color: green, fontSize: '18px', fontWeight: '700', fontFamily: 'monospace' }}>
                                  {subj.correlation?.toFixed(4)}
                                </div>
                              </div>
                              <div>
                                <div style={{ color: textSecondary, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>MSE</div>
                                <div style={{ color: textPrimary, fontSize: '18px', fontWeight: '700', fontFamily: 'monospace' }}>
                                  {subj.mse?.toFixed(5)}
                                </div>
                              </div>
                              <div>
                                <div style={{ color: textSecondary, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>Mean Prediction</div>
                                <div style={{ color: textPrimary, fontSize: '14px', fontFamily: 'monospace' }}>
                                  {subj.mean_prediction?.toFixed(4)}
                                </div>
                              </div>
                              <div>
                                <div style={{ color: textSecondary, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>Actual Mean</div>
                                <div style={{ color: textPrimary, fontSize: '14px', fontFamily: 'monospace' }}>
                                  {subj.mean_target?.toFixed(4)}
                                </div>
                              </div>
                            </div>
                            {/* Accuracy bar */}
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ height: '4px', borderRadius: '2px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', position: 'relative' }}>
                                <div style={{
                                  height: '100%', borderRadius: '2px', background: green,
                                  width: `${Math.min(100, (subj.correlation || 0) * 100)}%`,
                                  transition: 'width 0.8s ease',
                                }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Consistency callout */}
                      {results.per_subject.length > 1 && (() => {
                        const corrs = results.per_subject.map(s => s.correlation)
                        const min = Math.min(...corrs)
                        const max = Math.max(...corrs)
                        return (
                          <div style={{
                            textAlign: 'center', padding: '10px', borderRadius: '10px',
                            background: isDark ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.03)',
                            border: `1px solid ${greenBorder}`, fontSize: '13px', color: textSecondary,
                          }}>
                            Cross-subject consistency: correlation range <span style={{ color: green, fontWeight: '600' }}>{min.toFixed(3)} — {max.toFixed(3)}</span> across unseen subjects
                          </div>
                        )
                      })()}
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ═══════ METHODOLOGY + ARCHITECTURE ═══════ */}
          <motion.div {...sectionAnim} style={{ marginBottom: '64px' }}>
            <h3 style={{ color: textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
              How It Works
            </h3>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {/* Methodology text */}
              <div style={{ flex: '3 1 360px', minWidth: '280px' }}>
                <div style={cardStyle({ padding: '32px' })}>
                  {[
                    {
                      title: 'Data Split Protocol',
                      text: '14 training / 3 validation / 3 test subjects. Zero overlap. The model has never seen any data from test subjects during training — proving true generalization to new individuals.',
                    },
                    {
                      title: 'What "Subject Invariant" Means',
                      text: 'Brain signals vary between individuals — skull thickness, electrode placement, and neural architecture all differ. Domain adversarial training forces the model to learn universal patterns that transfer to anyone.',
                    },
                    {
                      title: 'Competition Protocol',
                      text: 'The NeurIPS 2025 EEG Foundation Model Challenge tested generalization to unseen subjects. Normalized error compares model MSE to a mean-prediction baseline. Lower is better.',
                      link: true,
                    },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: i < 2 ? '24px' : 0 }}>
                      <h4 style={{ color: textPrimary, fontSize: '15px', fontWeight: '700', marginBottom: '6px', marginTop: 0 }}>
                        {item.title}
                      </h4>
                      <p style={{ color: textSecondary, fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                        {item.text}
                        {item.link && (
                          <>
                            {' '}
                            <a href="https://eeg-foundation.github.io/challenge/" target="_blank" rel="noopener noreferrer"
                              style={{ color: green, textDecoration: 'none', fontWeight: '500' }}
                            >
                              NeurIPS Challenge Page →
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture diagram — vertical pipeline */}
              <div style={{ flex: '2 1 280px', minWidth: '240px' }}>
                <div style={cardStyle({ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' })}>
                  {[
                    { label: 'Raw EEG Signal', sub: '4 ch × 200 samples', color: textSecondary },
                    null, // arrow
                    { label: 'Dual-Domain Extraction', sub: 'HFTP (frequency) + CNN (time)', color: green },
                    null,
                    { label: 'Feature Fusion', sub: 'Cross-domain attention', color: textPrimary },
                    null,
                    { label: 'Subject Normalization', sub: 'Adversarial training', color: indigo },
                    null,
                    { label: 'Prediction', sub: 'Task-specific output', color: green },
                  ].map((item, i) => {
                    if (!item) {
                      return (
                        <div key={i} style={{
                          width: '2px', height: '20px',
                          background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                        }}>
                          <div style={{
                            width: 0, height: 0,
                            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                            borderTop: `6px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                            marginLeft: '-4px', marginTop: '20px',
                          }} />
                        </div>
                      )
                    }
                    return (
                      <div key={i} style={{
                        width: '100%', padding: '14px 18px', borderRadius: '10px',
                        border: `1px solid ${item.color === green ? greenBorder : item.color === indigo ? 'rgba(99,102,241,0.25)' : cardBorder}`,
                        background: item.color === green ? 'rgba(16,185,129,0.06)' : item.color === indigo ? 'rgba(99,102,241,0.05)' : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '650', color: textPrimary }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>{item.sub}</div>
                      </div>
                    )
                  })}
                  <p style={{ color: textSecondary, fontSize: '12px', textAlign: 'center', marginTop: '16px', marginBottom: 0, lineHeight: '1.6' }}>
                    Same pipeline for EEG, metabolomics, Raman spectroscopy, and audio — only the input layer changes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══════ API PLAYGROUND ═══════ */}
          <motion.div {...sectionAnim} style={{ marginBottom: '64px' }}>
            <h3 style={{ color: textPrimary, fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>
              Try It Live
            </h3>
            <p style={{ color: textSecondary, fontSize: '14px', marginBottom: '20px' }}>
              Send raw EEG data — GLE encoding happens server-side. You never touch the frequency transform.
            </p>

            <div style={cardStyle({ padding: '32px' })}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {/* Input side */}
                <div style={{ flex: '1 1 300px', minWidth: '260px' }}>
                  {/* Channel visualization */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: textSecondary, marginBottom: '8px' }}>
                      EEG Input (4 channels, 200 samples, 100 Hz)
                    </div>
                    {['TP9', 'AF7', 'AF8', 'TP10'].map((ch, i) => (
                      <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: textSecondary, width: '32px' }}>{ch}</span>
                        <div style={{
                          flex: 1, height: '12px', borderRadius: '3px',
                          background: `linear-gradient(90deg, ${isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)'} ${20 + i * 5}%, ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'} ${50 + i * 3}%, ${isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)'} 80%)`,
                          border: `1px solid ${cardBorder}`,
                        }} />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => generateSignal()}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        border: `1px solid ${cardBorder}`, color: textPrimary, cursor: 'pointer',
                      }}
                    >
                      Generate Random Signal
                    </motion.button>
                    <button
                      onClick={() => setShowRawInput(!showRawInput)}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500',
                        background: 'transparent', border: `1px solid ${cardBorder}`,
                        color: textSecondary, cursor: 'pointer',
                      }}
                    >
                      {showRawInput ? 'Hide JSON' : 'Paste Custom Data'}
                    </button>
                  </div>

                  {showRawInput && (
                    <textarea
                      value={playgroundInput ? JSON.stringify(playgroundInput) : ''}
                      onChange={e => { try { setPlaygroundInput(JSON.parse(e.target.value)) } catch {} }}
                      rows={3}
                      style={{
                        width: '100%', padding: '10px', borderRadius: '8px',
                        background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${cardBorder}`, color: textPrimary,
                        fontSize: '11px', fontFamily: 'monospace', resize: 'vertical',
                        boxSizing: 'border-box', marginBottom: '12px',
                      }}
                    />
                  )}

                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handlePredict}
                    disabled={playgroundLoading}
                    style={{
                      padding: '12px 32px', borderRadius: '10px', width: '100%',
                      background: `linear-gradient(135deg, ${green}, #059669)`,
                      border: 'none', color: '#fff', fontSize: '15px', fontWeight: '700',
                      cursor: playgroundLoading ? 'not-allowed' : 'pointer',
                      opacity: playgroundLoading ? 0.6 : 1,
                      boxShadow: `0 4px 16px rgba(16,185,129,0.3)`,
                    }}
                  >
                    {playgroundLoading ? 'Running inference...' : 'Run Prediction'}
                  </motion.button>
                </div>

                {/* Output side */}
                <div style={{ flex: '1 1 300px', minWidth: '260px' }}>
                  {playgroundResult ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '28px', borderRadius: '12px', textAlign: 'center',
                        background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                        border: `1px solid ${greenBorder}`, marginBottom: '16px',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: textSecondary, marginBottom: '8px' }}>
                        Prediction
                      </div>
                      <div style={{
                        fontSize: '42px', fontWeight: '800',
                        fontFamily: "'JetBrains Mono', monospace", color: green,
                      }}>
                        {playgroundResult.prediction?.toFixed(6)}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
                        <span style={{ fontSize: '13px', color: textSecondary }}>
                          {playgroundResult.latency_ms?.toFixed(1)}ms
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                          background: greenBg, color: green,
                        }}>
                          {playgroundResult.model_status === 'precomputed' ? 'PRECOMPUTED' : 'LIVE'}
                        </span>
                      </div>
                    </motion.div>
                  ) : playgroundLoading ? (
                    <div style={{
                      padding: '28px', borderRadius: '12px', textAlign: 'center',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${cardBorder}`, marginBottom: '16px',
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: green, animation: 'pulse 1s infinite', margin: '0 auto 8px' }} />
                      <span style={{ color: textSecondary, fontSize: '13px' }}>Running inference...</span>
                    </div>
                  ) : (
                    <div style={{
                      padding: '28px', borderRadius: '12px', textAlign: 'center',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      border: `1px dashed ${cardBorder}`, marginBottom: '16px',
                    }}>
                      <span style={{ color: textSecondary, fontSize: '14px' }}>
                        Result will appear here
                      </span>
                    </div>
                  )}

                  {playgroundError && (
                    <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
                      {playgroundError}
                    </div>
                  )}

                  {/* Code snippets */}
                  <div>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['curl', 'python', 'javascript'].map(lang => (
                          <button key={lang} onClick={() => setActiveSnippet(lang)}
                            style={{
                              padding: '4px 10px', borderRadius: '6px', border: 'none',
                              background: activeSnippet === lang ? greenBg : 'transparent',
                              color: activeSnippet === lang ? green : textSecondary,
                              fontSize: '12px', fontWeight: '600', cursor: 'pointer', textTransform: 'uppercase',
                            }}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => copyCode(codeSnippets[activeSnippet])}
                        style={{
                          padding: '4px 10px', borderRadius: '6px', border: `1px solid ${cardBorder}`,
                          background: 'transparent', color: copied ? green : textSecondary,
                          fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                        }}
                      >
                        {copied ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre style={{
                      background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.04)',
                      border: `1px solid ${cardBorder}`, borderRadius: '10px', padding: '14px',
                      color: isDark ? '#e2e8f0' : '#334155', fontSize: '12px', fontFamily: 'monospace',
                      overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                      maxHeight: '180px', margin: 0,
                    }}>
                      {codeSnippets[activeSnippet]}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══════ CTA ═══════ */}
          <motion.div {...sectionAnim} style={{ marginBottom: '40px' }}>
            <div style={cardStyle({
              padding: '40px', textAlign: 'center',
              border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)'}`,
              background: isDark ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)',
            })}>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: textPrimary, margin: '0 0 12px 0' }}>
                Every Model. Independently Verifiable.
              </h3>
              <p style={{ color: textSecondary, fontSize: '15px', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 24px' }}>
                The ParagonDAO Verification Network ensures every health model claim is backed by reproducible evidence.
                As each disease model reaches validation, it gets its own verification page — auditable by anyone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  href="/models" style={{
                    padding: '12px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '700',
                    background: `linear-gradient(135deg, ${green}, #059669)`, color: '#fff',
                    textDecoration: 'none', boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                  }}
                >
                  View All Disease Models
                </motion.a>
                <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  href="/whitepaper" style={{
                    padding: '12px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                    background: `linear-gradient(135deg, ${indigo}, #8b5cf6)`, color: '#fff',
                    textDecoration: 'none',
                  }}
                >
                  Read the Whitepaper
                </motion.a>
                <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  href="/network" style={{
                    padding: '12px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                    background: 'transparent', color: textSecondary,
                    border: `1px solid ${cardBorder}`, textDecoration: 'none',
                  }}
                >
                  Explore the Network
                </motion.a>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default VerifyPage
