import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../providers/ThemeProvider'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import ModeToggle from '../components/ModeToggle'
import ExchangeCard from '../components/ExchangeCard'
import { exchangeModels, CERTIFICATION_TIERS } from '../data/mockBuilderData'

const sectionAnim = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

const MODALITIES = ['All', 'EEG', 'Audio', 'ECG', 'IMU + EMG', 'PPG + Accel', 'HRV + EDA', 'EEG + Audio']
const DISEASES = ['All', 'Sleep Disorders', 'Epilepsy', 'Depression', 'Cardiac', 'Respiratory', "Parkinson's", 'Diabetes', 'Stress/Mental Health']
const TIERS = ['All', 'platinum', 'gold', 'silver', 'bronze']
const SORTS = [
  { value: 'accuracy-desc', label: 'Highest Accuracy' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'downloads', label: 'Most Downloads' },
]

const ExchangePage = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [mode, setMode] = useState('simulation')
  const [search, setSearch] = useState('')
  const [modality, setModality] = useState('All')
  const [disease, setDisease] = useState('All')
  const [tier, setTier] = useState('All')
  const [sort, setSort] = useState('accuracy-desc')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  const selectStyle = {
    background: inputBg,
    border: `1px solid ${inputBorder}`,
    borderRadius: '10px',
    padding: '10px 14px',
    color: textPrimary,
    fontSize: '13px',
    outline: 'none',
    minWidth: '140px',
    cursor: 'pointer',
    WebkitAppearance: 'none',
  }

  const filteredModels = useMemo(() => {
    if (mode === 'production') return []
    let models = [...exchangeModels]

    if (search) {
      const q = search.toLowerCase()
      models = models.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.builder.toLowerCase().includes(q) ||
        m.disease.toLowerCase().includes(q) ||
        m.modality.toLowerCase().includes(q)
      )
    }
    if (modality !== 'All') models = models.filter(m => m.modality === modality)
    if (disease !== 'All') models = models.filter(m => m.disease === disease)
    if (tier !== 'All') models = models.filter(m => m.certificationTier === tier)

    if (sort === 'accuracy-desc') models.sort((a, b) => b.accuracy - a.accuracy)
    else if (sort === 'recent') models.sort((a, b) => b.publishedAt - a.publishedAt)
    else if (sort === 'downloads') models.sort((a, b) => (b.listing?.downloads || 0) - (a.listing?.downloads || 0))

    return models
  }, [mode, search, modality, disease, tier, sort])

  return (
    <>
      <Background />
      <Header />
      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

          {/* Hero */}
          <motion.div {...sectionAnim} style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: '800',
              margin: '0 0 16px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              The Proof Exchange
            </h1>
            <p style={{
              fontSize: '18px',
              color: textSecondary,
              maxWidth: '640px',
              margin: '0 auto 24px',
              lineHeight: '1.6',
            }}>
              Browse independently verified health AI models. Every model's accuracy is tested,
              certified, and permanently recorded on-chain.
            </p>
            <ModeToggle mode={mode} onToggle={setMode} />
          </motion.div>

          {mode === 'production' ? (
            /* Production early access state */
            <motion.div {...sectionAnim} style={{
              textAlign: 'center',
              padding: '80px 40px',
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: textPrimary, margin: '0 0 12px' }}>
                Early Access
              </h2>
              <p style={{ fontSize: '15px', color: textSecondary, maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                The Proof Exchange launches with the BAGLE API. Switch to Simulation mode to
                explore the full marketplace experience with sample data.
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
              {/* Filter row */}
              <motion.div {...sectionAnim} style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '32px',
                alignItems: 'center',
              }}>
                <input
                  type="text"
                  placeholder="Search models, builders, diseases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    ...selectStyle,
                    flex: isMobile ? '1 1 100%' : '1 1 240px',
                    minWidth: isMobile ? '100%' : '240px',
                  }}
                />
                <select value={modality} onChange={(e) => setModality(e.target.value)} style={selectStyle}>
                  {MODALITIES.map(m => <option key={m} value={m}>{m === 'All' ? 'All Modalities' : m}</option>)}
                </select>
                <select value={disease} onChange={(e) => setDisease(e.target.value)} style={selectStyle}>
                  {DISEASES.map(d => <option key={d} value={d}>{d === 'All' ? 'All Diseases' : d}</option>)}
                </select>
                <select value={tier} onChange={(e) => setTier(e.target.value)} style={selectStyle}>
                  {TIERS.map(t => (
                    <option key={t} value={t}>
                      {t === 'All' ? 'All Tiers' : CERTIFICATION_TIERS[t]?.label}
                    </option>
                  ))}
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </motion.div>

              {/* Results count */}
              <div style={{ marginBottom: '16px', fontSize: '13px', color: textSecondary }}>
                {filteredModels.length} verified model{filteredModels.length !== 1 ? 's' : ''}
              </div>

              {/* Model grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '20px',
                marginBottom: '64px',
              }}>
                {filteredModels.map((model, i) => (
                  <ExchangeCard key={model.id} model={model} index={i} />
                ))}
              </div>

              {filteredModels.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: textSecondary }}>
                  No models match your filters. Try broadening your search.
                </div>
              )}
            </>
          )}

          {/* Bottom CTA */}
          <motion.div {...sectionAnim} style={{
            textAlign: 'center',
            padding: '60px 40px',
            marginBottom: '80px',
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: textPrimary,
              margin: '0 0 12px',
            }}>
              Built a health AI model?
            </h2>
            <p style={{
              fontSize: '15px',
              color: textSecondary,
              maxWidth: '480px',
              margin: '0 auto 24px',
              lineHeight: '1.6',
            }}>
              Submit it to The Forge for independent verification. Get certified,
              published, and discoverable by the research community.
            </p>
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
              Submit Your Model
            </motion.button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default ExchangePage
