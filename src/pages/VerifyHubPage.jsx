import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../providers/ThemeProvider'
import { useMagic } from '../providers/MagicProvider'
import { getCurrentUser } from '../services/api'
import Header from '../components/Header'
import Background from '../components/Background'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import VerifyModelCard from '../components/VerifyModelCard'
import { VERIFY_MODELS, MODALITY_TAGS } from '../data/verifyModels'

export default function VerifyHubPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { isLoggedIn } = useMagic()
  const storedUser = getCurrentUser()
  const isAuthenticated = isLoggedIn || !!storedUser

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const textPrimary = isDark ? '#fff' : '#1e293b'
  const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const green = '#10b981'
  const greenBg = 'rgba(16,185,129,0.1)'
  const greenBorder = 'rgba(16,185,129,0.3)'

  // Filter models
  const filtered = VERIFY_MODELS.filter(m => {
    const q = search.toLowerCase()
    const matchesSearch = !q || m.name.toLowerCase().includes(q) || m.disease.toLowerCase().includes(q) || m.modality.toLowerCase().includes(q)
    const matchesFilter = activeFilter === 'All' || m.modalityTag === activeFilter
    return matchesSearch && matchesFilter
  })

  const filterTags = ['All', ...MODALITY_TAGS]

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      background: isDark
        ? 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    }}>
      <SEO
        title="Verify — Model Verification Hub"
        description="Verify any health model on the ParagonDAO network. Accuracy benchmarks, privacy audits, and on-chain certification — all independently verifiable."
        path="/verify"
      />
      <Background />
      <Header
        searchQuery="" lastSearchedTerm="" setSearchQuery={() => {}}
        handleSearch={() => {}} isSearching={false} isSearchExpanded={false}
        setIsSearchExpanded={() => {}} isAuthenticated={isAuthenticated}
        onLoginClick={() => navigate('/login')} onSignupClick={() => navigate('/login')}
      />

      <main style={{ position: 'relative', zIndex: 5, paddingTop: '100px', paddingBottom: '40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

          {/* ═══ Hero ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '5px 14px', borderRadius: '20px',
              background: greenBg, border: `1px solid ${greenBorder}`,
              marginBottom: '24px',
            }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%', background: green,
                boxShadow: `0 0 8px ${green}`,
              }} />
              <span style={{ color: green, fontSize: '12px', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Verification Network
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: '800',
              background: isDark
                ? 'linear-gradient(135deg, #ffffff 0%, #6ee7b7 60%, #10b981 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #059669 60%, #10b981 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              margin: '0 0 16px 0', lineHeight: '1.1',
            }}>
              Verify Any Health Model
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: textSecondary,
              maxWidth: '680px', margin: '0 auto 32px', lineHeight: '1.65',
            }}>
              Every model on the ParagonDAO network is accuracy-benchmarked, privacy-audited, and on-chain certified.
              Select a model to inspect its verification data — or submit your own.
            </p>
          </motion.div>

          {/* ═══ Search + Filters ═══ */}
          <div style={{ marginBottom: '32px' }}>
            <input
              type="text"
              placeholder="Search models by name, disease, or modality..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '12px 18px', borderRadius: '12px',
                background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                border: `1px solid ${cardBorder}`, color: textPrimary,
                fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                marginBottom: '12px',
              }}
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {filterTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', border: 'none',
                    background: activeFilter === tag ? greenBg : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                    color: activeFilter === tag ? green : textSecondary,
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ═══ Model Grid ═══ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '48px',
          }}>
            {filtered.map((model, i) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <VerifyModelCard model={model} />
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div style={{
                gridColumn: '1 / -1', textAlign: 'center', padding: '48px',
                color: textSecondary, fontSize: '15px',
              }}>
                No models match "{search}". Try a different search term.
              </div>
            )}
          </div>

          {/* ═══ Bottom CTAs ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            {/* Submit Your Model */}
            <div
              onClick={() => navigate('/forge/submit?source=verify')}
              style={{
                background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '16px', padding: '28px', cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>+</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, margin: '0 0 6px 0' }}>
                Submit Your Model
              </h3>
              <p style={{ fontSize: '13px', color: textSecondary, margin: 0, lineHeight: '1.5' }}>
                Upload your health model for independent accuracy and privacy verification on the ParagonDAO network.
              </p>
            </div>

            {/* How Verification Works */}
            <div
              onClick={() => navigate('/verify/methodology')}
              style={{
                background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '16px', padding: '28px', cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>?</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, margin: '0 0 6px 0' }}>
                How Verification Works
              </h3>
              <p style={{ fontSize: '13px', color: textSecondary, margin: 0, lineHeight: '1.5' }}>
                NeurIPS-grade methodology, subject-level splits, privacy attacks, and on-chain certification.
              </p>
            </div>

            {/* Proof Pipeline */}
            <div
              onClick={() => navigate('/proof-pipeline')}
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '16px', padding: '28px', cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>7</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, margin: '0 0 6px 0' }}>
                Proof Pipeline
              </h3>
              <p style={{ fontSize: '13px', color: textSecondary, margin: 0, lineHeight: '1.5' }}>
                The 7-step verification pipeline from model submission to on-chain publication.
              </p>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
